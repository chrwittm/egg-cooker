const READY_REPEAT_MS = 5000;
const readySoundUrl = new URL(
  '../assets/rooster-ready-warm.mp3',
  import.meta.url,
).href;

// Real-time reminder policy, deliberately independent of the cooking/demo clock.
export class ReminderWindow {
  private lastCue: number | null = null;
  constructor(private suppressed = false) {}
  due(now: number, visible: boolean, alert: boolean, enabled: boolean) {
    if (!visible || !alert || this.suppressed) return false;
    if (
      !enabled ||
      (this.lastCue !== null && now - this.lastCue < READY_REPEAT_MS)
    )
      return false;
    this.lastCue = now;
    return true;
  }
}

// Do not replay skipped seconds or compress ticks into a burst in demo mode.
export class CountdownTicks {
  private lastSecond: number | null = null;
  private lastCue = -Infinity;
  due(seconds: number, now: number, visible: boolean, enabled: boolean) {
    if (
      !visible ||
      !enabled ||
      seconds < 1 ||
      seconds > 10 ||
      seconds === this.lastSecond
    )
      return false;
    this.lastSecond = seconds;
    if (now - this.lastCue < 900) return false;
    this.lastCue = now;
    return true;
  }
}

type AlarmLoader = (context: AudioContext) => Promise<AudioBuffer>;

async function loadReadySound(context: AudioContext): Promise<AudioBuffer> {
  const response = await fetch(readySoundUrl, {
    credentials: 'same-origin',
    referrerPolicy: 'no-referrer',
  });
  if (!response.ok) throw new Error('Ready sound unavailable');
  return context.decodeAudioData(await response.arrayBuffer());
}

export class CookSound {
  private context: AudioContext | null = null;
  private nodes = new Set<OscillatorNode>();
  private source: AudioBufferSourceNode | null = null;
  private alarm: Promise<AudioBuffer | null> | null = null;
  private generation = 0;

  constructor(
    private unavailable: () => void,
    private create: () => AudioContext = () => new AudioContext(),
    private loadAlarm: AlarmLoader = loadReadySound,
  ) {}

  async enable(alert = false) {
    const generation = ++this.generation;
    try {
      this.context ??= this.create();
      await this.context.resume();
      if (generation !== this.generation) return;
      if (this.context.state !== 'running') throw new Error();
      this.prepareAlarm(this.context);
      if (alert) await this.playRecordedAlert(generation);
      else this.playTone(false, false);
    } catch {
      if (generation === this.generation) this.unavailable();
    }
  }

  tick() {
    this.playTone(false, true);
  }

  play() {
    void this.playRecordedAlert(this.generation);
  }

  private prepareAlarm(context: AudioContext) {
    this.alarm ??= this.loadAlarm(context).catch(() => null);
    return this.alarm;
  }

  private async playRecordedAlert(generation: number) {
    if (this.source || this.nodes.size) return;
    let failedSource: AudioBufferSourceNode | null = null;
    try {
      const context = this.context;
      if (!context || context.state !== 'running') throw new Error();
      const buffer = await this.prepareAlarm(context);
      if (generation !== this.generation || this.source || this.nodes.size)
        return;
      if (!buffer) throw new Error();
      const source = context.createBufferSource();
      failedSource = source;
      source.buffer = buffer;
      source.connect(context.destination);
      this.source = source;
      source.onended = () => {
        if (this.source === source) this.source = null;
        source.disconnect();
      };
      source.start();
    } catch {
      if (failedSource) {
        if (this.source === failedSource) this.source = null;
        try {
          failedSource.disconnect();
        } catch {
          /* A source that never connected needs no cleanup. */
        }
      }
      if (generation === this.generation) this.playTone(true, false);
    }
  }

  private playTone(alert: boolean, tick: boolean) {
    try {
      const context = this.context;
      if (!context || context.state !== 'running') throw new Error();
      if (this.source || this.nodes.size) return;
      (alert ? [880, 1100, 880] : [tick ? 1000 : 659.25]).forEach(
        (frequency, index) => {
          const oscillator = context.createOscillator();
          const gain = context.createGain();
          const start = context.currentTime + index * 0.22;
          oscillator.type = 'sine';
          oscillator.frequency.value = frequency;
          gain.gain.setValueAtTime(0, start);
          gain.gain.linearRampToValueAtTime(0.07, start + 0.02);
          gain.gain.exponentialRampToValueAtTime(
            0.001,
            start + (tick ? 0.05 : 0.18),
          );
          oscillator.connect(gain);
          gain.connect(context.destination);
          this.nodes.add(oscillator);
          oscillator.onended = () => {
            this.nodes.delete(oscillator);
            oscillator.disconnect();
            gain.disconnect();
          };
          oscillator.start(start);
          oscillator.stop(start + (tick ? 0.07 : 0.2));
        },
      );
    } catch {
      this.unavailable();
    }
  }

  stop() {
    this.generation++;
    if (this.source) {
      const source = this.source;
      this.source = null;
      try {
        source.stop();
      } catch {
        /* Already ended. */
      }
    }
    for (const node of this.nodes) {
      try {
        node.stop();
      } catch {
        /* Already ended. */
      }
    }
    this.nodes.clear();
  }

  close() {
    this.stop();
    void this.context?.close();
  }
}
