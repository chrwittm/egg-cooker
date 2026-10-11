import { describe, it, expect } from 'vitest';
import { TrialPlayer } from './player';
import type { MediaAudio } from './player';
import type { TrialSettings } from './trial';
import { LAB_KEY } from './trial';
const settings: TrialSettings = {
  variant: 'quiet',
  seconds: 60,
  scenario: 'locked',
  route: 'speaker',
  silent: false,
  focus: false,
  lowPower: false,
};
const capabilities = {
  standalone: false,
  mediaSession: true,
  audioSession: false,
};
const id = '00000000-0000-4000-8000-000000000001';
function fixture() {
  const events = new EventTarget();
  const audio: { -readonly [Key in keyof MediaAudio]: MediaAudio[Key] } = {
    currentTime: 0,
    duration: 63.4,
    paused: true,
    ended: false,
    error: null,
    load: () => {
      audio.currentTime = 0;
      audio.paused = true;
    },
    play: async () => {
      audio.paused = false;
      events.dispatchEvent(new Event('playing'));
    },
    pause: () => {
      audio.paused = true;
      events.dispatchEvent(new Event('pause'));
    },
    addEventListener: events.addEventListener.bind(events),
    removeEventListener: events.removeEventListener.bind(events),
  };
  const data = new Map<string, string>();
  const storage = {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, v: string) => {
      data.set(key, v);
    },
    removeItem: (key: string) => {
      data.delete(key);
    },
  };
  let time = 1_800_000_000_000;
  const player = new TrialPlayer(
    audio,
    storage,
    () => time,
    () => false,
    () => {},
  );
  return {
    player,
    audio,
    storage,
    data,
    advance: (ms: number) => {
      time += ms;
    },
    events,
  };
}
describe('media trial lifecycle', () => {
  it('serializes repeated starts and commits one deadline before playback', async () => {
    const f = fixture();
    await Promise.all([
      f.player.start(settings, 'media-lab-1.abcdef', id, capabilities),
      f.player.start(settings, 'media-lab-1.abcdef', id, capabilities),
    ]);
    expect(f.player.log.runs).toHaveLength(1);
    expect(f.player.active?.targetAtMs).toBe(1_800_000_060_000);
    expect(f.player.active?.events[0]?.name).toBe('start-requested');
    expect(f.player.active?.heard).toBe('unrecorded');
  });
  it('records a rejected play without claiming sound or protection', async () => {
    const f = fixture();
    f.audio.play = async () => {
      throw new Error('Denied');
    };
    await f.player.start(settings, 'media-lab-1.abcdef', id, capabilities);
    expect(f.player.active?.status).toBe('failed');
    expect(f.player.active?.events.at(-1)?.name).toBe('play-rejected');
    expect(f.player.active?.heard).toBe('unrecorded');
  });
  it('stops a pending play and ignores its late rejection', async () => {
    const f = fixture();
    let reject!: (error: Error) => void;
    f.audio.play = () =>
      new Promise((_, fail) => {
        reject = fail;
      });
    const pending = f.player.start(
      settings,
      'media-lab-1.abcdef',
      id,
      capabilities,
    );
    f.player.stop();
    reject(new Error('Aborted'));
    await pending;
    expect(f.player.active).toBeNull();
    expect(f.player.log.runs[0]?.status).toBe('stopped');
    expect(f.player.log.runs[0]?.events.at(-1)?.name).toBe('stop-requested');
  });
  it('never resumes playback after a cold reopen and retains the original target', async () => {
    const f = fixture();
    await f.player.start(settings, 'media-lab-1.abcdef', id, capabilities);
    f.advance(70000);
    const reopened = new TrialPlayer(
      f.audio,
      f.storage,
      () => 1_800_000_070_000,
      () => false,
      () => {},
    );
    expect(reopened.active).toBeNull();
    expect(reopened.log.runs[0]?.status).toBe('interrupted');
    expect(reopened.log.runs[0]?.targetAtMs).toBe(1_800_000_060_000);
    expect(reopened.log.runs[0]?.heard).toBe('unrecorded');
  });
  it('keeps in-memory results on storage failure and bounds run count', async () => {
    const f = fixture();
    f.storage.setItem = () => {
      throw new Error('Full');
    };
    for (let n = 0; n < 25; n++) {
      await f.player.start(settings, 'media-lab-1.abcdef', id, capabilities);
      f.player.stop();
    }
    expect(f.player.log.runs).toHaveLength(20);
    expect(f.player.warning).toContain('Export');
    f.player.clear();
    expect(f.player.log.runs).toHaveLength(0);
    expect(f.data.has(LAB_KEY)).toBe(false);
  });
});

it('preserves interruption across navigation decoder errors while real errors still fail', async () => {
  const f = fixture();
  await f.player.start(settings, 'media-lab-1.abcdef', id, capabilities);
  f.player.leaving();
  f.events.dispatchEvent(new Event('error'));
  expect(f.player.active?.status).toBe('playing');
  expect(f.player.active?.events.at(-1)?.name).toBe('navigation-media-error:0');
  const reopened = new TrialPlayer(
    f.audio,
    f.storage,
    () => 1_800_000_000_100,
    () => false,
    () => {},
  );
  expect(reopened.log.runs[0]?.status).toBe('interrupted');
  f.player.returned();
  f.events.dispatchEvent(new Event('error'));
  expect(f.player.active?.status).toBe('failed');
  expect(f.player.active?.heard).toBe('unrecorded');
});

it('restores a genuine failed playback with the same identity/deadline and no replay', async () => {
  const f = fixture();
  await f.player.start(settings, 'media-lab-1.abcdef', id, capabilities);
  f.events.dispatchEvent(new Event('error'));
  const target = f.player.active?.targetAtMs;
  const reopened = new TrialPlayer(
    f.audio,
    f.storage,
    () => 1_800_000_000_100,
    () => false,
    () => {},
  );
  expect(reopened.active).toBeNull();
  expect(reopened.log.runs[0]?.id).toBe(id);
  expect(reopened.log.runs[0]?.targetAtMs).toBe(target);
  expect(reopened.log.runs[0]?.status).toBe('failed');
  expect(reopened.log.runs[0]?.heard).toBe('unrecorded');
});
