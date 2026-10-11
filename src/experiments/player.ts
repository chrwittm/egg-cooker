import { appendEvent, beginTrial, LAB_KEY, recoverLog } from './trial';
import type { LabLog, Trial, TrialSettings } from './trial';

export type MediaAudio = Pick<
  HTMLAudioElement,
  | 'currentTime'
  | 'duration'
  | 'paused'
  | 'ended'
  | 'play'
  | 'pause'
  | 'addEventListener'
  | 'removeEventListener'
  | 'error'
>;
export class TrialPlayer {
  log: LabLog;
  active: Trial | null = null;
  warning = '';
  private generation = 0;
  private handlers = new Map<string, EventListener>();
  private crossed = false;
  private navigating = false;
  constructor(
    private audio: MediaAudio,
    private storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>,
    private now: () => number,
    private hidden: () => boolean,
    private publish: () => void,
  ) {
    try {
      const restored = recoverLog(storage.getItem(LAB_KEY));
      this.log = restored ?? { version: 1, device: '', runs: [] };
      if (!restored)
        this.warning =
          'Saved diagnostics were invalid and could not be restored.';
      for (const run of this.log.runs) {
        if (run.status === 'playing' || run.status === 'paused') {
          run.status = 'interrupted';
          run.events = appendEvent(run, {
            name: 'reopened-without-playback',
            atMs: now(),
            mediaSeconds: 0,
            paused: true,
            hidden: hidden(),
          }).events;
        }
      }
      this.persist();
    } catch {
      this.log = { version: 1, device: '', runs: [] };
      this.warning =
        'Local diagnostics unavailable. Export results before closing.';
    }
    for (const name of [
      'playing',
      'pause',
      'waiting',
      'stalled',
      'suspend',
      'seeking',
      'seeked',
      'ratechange',
      'ended',
      'error',
    ]) {
      const listener = () => {
        if (!this.active) return;
        if (this.navigating) {
          this.observe(
            name === 'error'
              ? `navigation-media-error:${audio.error?.code ?? 0}`
              : `navigation-${name}`,
          );
          return;
        }
        if (name === 'pause' && !audio.ended) this.active.status = 'paused';
        if (name === 'playing') this.active.status = 'playing';
        if (name === 'ended' || name === 'error') {
          this.active.status = name === 'ended' ? 'ended' : 'failed';
          this.active.finishedAtMs = now();
        }
        this.observe(
          name === 'error' ? `media-error:${audio.error?.code ?? 0}` : name,
        );
      };
      this.handlers.set(name, listener);
      audio.addEventListener(name, listener);
    }
  }
  async start(
    settings: TrialSettings,
    build: string,
    id: string,
    capabilities: Pick<Trial, 'standalone' | 'mediaSession' | 'audioSession'>,
  ) {
    if (this.active) return;
    const generation = ++this.generation;
    this.audio.currentTime = 0;
    const run = beginTrial(settings, this.now(), id, build, capabilities);
    this.active = run;
    this.log.runs = [...this.log.runs.slice(-19), run];
    this.crossed = false;
    this.navigating = false;
    this.observe('start-requested');
    try {
      // Called synchronously from the Start gesture; nothing asynchronous occurs
      // between capture of the deadline and asking the media element to play.
      await this.audio.play();
      if (generation === this.generation && this.active)
        this.observe('play-resolved');
    } catch {
      if (generation !== this.generation || !this.active) return;
      if (this.navigating) {
        this.observe('navigation-play-rejected');
        return;
      }
      this.active.status = 'failed';
      this.active.finishedAtMs = this.now();
      this.observe('play-rejected');
    }
  }
  observe(name: string) {
    if (!this.active) return;
    const next = appendEvent(this.active, {
      name,
      atMs: this.now(),
      mediaSeconds: Number.isFinite(this.audio.currentTime)
        ? Math.round(this.audio.currentTime * 1000) / 1000
        : 0,
      paused: this.audio.paused,
      hidden: this.hidden(),
    });
    Object.assign(this.active, next);
    this.persist();
    this.publish();
  }
  sample() {
    if (
      this.active &&
      !this.crossed &&
      this.audio.currentTime >= this.active.settings.seconds
    ) {
      this.crossed = true;
      this.observe('media-position-reached-target');
    }
  }
  leaving() {
    // Navigating can terminate a decoder before pagehide (Firefox/Linux).
    // Record its errors, but keep the recoverable interrupted trial distinct
    // from a decoder failure observed while the page is still in use.
    this.observe('navigation-started');
    this.navigating = true;
  }
  returned() {
    this.navigating = false;
    if (this.active && ['playing', 'paused'].includes(this.active.status)) {
      this.active.status = this.audio.ended
        ? 'ended'
        : this.audio.paused
          ? 'paused'
          : 'playing';
    }
    this.observe('pageshow');
  }
  stop() {
    if (!this.active) return;
    ++this.generation;
    this.audio.pause();
    this.active.status = 'stopped';
    this.active.finishedAtMs = this.now();
    this.observe('stop-requested');
    this.active = null;
    this.publish();
  }
  settle() {
    if (!this.active || !['ended', 'failed'].includes(this.active.status))
      return;
    ++this.generation;
    this.active = null;
    this.publish();
  }
  persist() {
    try {
      this.storage.setItem(LAB_KEY, JSON.stringify(this.log));
    } catch {
      this.warning =
        'Local diagnostics unavailable. Export results before closing.';
    }
  }
  clear() {
    this.stop();
    this.log = { version: 1, device: '', runs: [] };
    try {
      this.storage.removeItem(LAB_KEY);
      this.warning = '';
    } catch {
      this.warning = 'Saved diagnostics could not be deleted.';
    }
    this.publish();
  }
  dispose() {
    this.stop();
    for (const [name, handler] of this.handlers)
      this.audio.removeEventListener(name, handler);
  }
}
