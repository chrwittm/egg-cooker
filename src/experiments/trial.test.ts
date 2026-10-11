import { describe, it, expect } from 'vitest';
import {
  appendEvent,
  beginTrial,
  emptyLog,
  recoverLog,
  trialTiming,
} from './trial';
import type { TrialSettings } from './trial';
const settings: TrialSettings = {
  variant: 'quiet',
  seconds: 60,
  scenario: 'locked',
  route: 'speaker',
  silent: false,
  focus: false,
  lowPower: false,
};
const run = () =>
  beginTrial(
    settings,
    1_800_000_000_000,
    '00000000-0000-4000-8000-000000000001',
    'media-lab-1.abcdef',
    { standalone: false, mediaSession: true, audioSession: false },
  );
describe('media trial diagnostics', () => {
  it('keeps the original target while playback pauses or drifts', () => {
    const trial = run();
    const timing = trialTiming(trial, trial.startedAtMs + 65000, 30);
    expect(timing).toEqual({
      remainingSeconds: 0,
      overdueSeconds: 5,
      driftSeconds: 35,
      uncertain: false,
    });
    expect(trialTiming(trial, trial.startedAtMs - 1, 0).uncertain).toBe(true);
  });
  it('rejects impossible variants rather than presenting an invented target', () => {
    expect(() =>
      beginTrial({ ...settings, variant: 'immediate' }, 10, 'id', 'build', {
        standalone: false,
        mediaSession: false,
        audioSession: false,
      }),
    ).toThrow();
  });
  it('bounds observations and validates exports without preserving extra data', () => {
    let trial = run();
    for (let n = 0; n < 300; n++)
      trial = appendEvent(trial, {
        name: 'playing',
        atMs: trial.startedAtMs + n,
        mediaSeconds: n / 10,
        paused: false,
        hidden: false,
      });
    expect(trial.events).toHaveLength(250);
    const log = {
      ...emptyLog(),
      runs: [{ ...trial, coordinates: 'private input' }],
    };
    const restored = recoverLog(JSON.stringify(log));
    expect(restored?.runs).toHaveLength(1);
    expect(restored?.runs[0]).not.toHaveProperty('coordinates');
    expect(recoverLog(JSON.stringify({ ...log, version: 2 }))).toBeNull();
    expect(
      recoverLog(
        JSON.stringify({
          ...log,
          runs: [{ ...trial, targetAtMs: trial.targetAtMs + 1 }],
        }),
      ),
    ).toBeNull();
    expect(
      recoverLog(
        JSON.stringify({
          ...log,
          runs: [{ ...trial, offsetSeconds: Infinity }],
        }),
      )?.runs[0]?.offsetSeconds,
    ).toBeNull();
    expect(recoverLog('{')).toBeNull();
    expect(recoverLog(null)).toEqual(emptyLog());
  });
});
