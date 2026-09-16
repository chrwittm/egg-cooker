import { calculate, validateConditions, validateInputs } from './egg';
import type { Conditions, Inputs } from './egg';
export const STORAGE_KEY = 'egg-cooker.active-cook.v1';
export interface Cook extends Inputs, Conditions {
  schemaVersion: 1 | 2;
  modelVersion: 'williams-pressure-v1' | 'williams-pressure-v2';
  startAtMs: number;
  targetAtMs: number;
  durationSeconds: number;
  savedAtMs: number;
}
export const validTime = (n: unknown): n is number =>
  typeof n === 'number' && Number.isSafeInteger(n) && n > 0;
export function createCook(
  inputs: Inputs,
  conditions: Conditions,
  now: number,
): Cook {
  validateInputs(inputs);
  validateConditions(conditions, now);
  const durationSeconds = calculate(
    inputs,
    conditions.pressureHpa,
  ).durationSeconds;
  const targetAtMs = now + durationSeconds * 1000;
  if (!validTime(now) || !validTime(targetAtMs))
    throw new Error('Time uncertain');
  return {
    ...inputs,
    ...conditions,
    schemaVersion: typeof inputs.doneness === 'number' ? 2 : 1,
    modelVersion:
      typeof inputs.doneness === 'number'
        ? 'williams-pressure-v2'
        : 'williams-pressure-v1',
    startAtMs: now,
    targetAtMs,
    durationSeconds,
    savedAtMs: now,
  };
}
export function sampleCook(cook: Cook, now: number, lastNow: number) {
  if (!validTime(now) || now < lastNow) return null;
  return {
    elapsedMs: Math.max(0, now - cook.startAtMs),
    remainingSeconds: Math.ceil(Math.max(0, cook.targetAtMs - now) / 1000),
    alert: now >= cook.targetAtMs,
    overdueSeconds: Math.floor(Math.max(0, now - cook.targetAtMs) / 1000),
  };
}
const fields = [
  'schemaVersion',
  'modelVersion',
  'massG',
  'initialTemperatureC',
  'doneness',
  'pressureHpa',
  'source',
  'altitudeM',
  'weatherTimeSeconds',
  'startAtMs',
  'targetAtMs',
  'durationSeconds',
  'savedAtMs',
].sort();
export type Recovery =
  | { kind: 'missing' | 'corrupt' | 'old' }
  | { kind: 'valid' | 'uncertain'; cook: Cook };
export function recoverCook(raw: string | null, now: number): Recovery {
  if (raw === null) return { kind: 'missing' };
  try {
    if (raw.length > 4096) throw new Error();
    const value: unknown = JSON.parse(raw);
    if (
      !value ||
      typeof value !== 'object' ||
      Array.isArray(value) ||
      Object.getPrototypeOf(value) !== Object.prototype ||
      Object.keys(value).sort().join() !== fields.join()
    )
      throw new Error();
    const c = value as Cook;
    if (
      !(
        (c.schemaVersion === 1 &&
          c.modelVersion === 'williams-pressure-v1' &&
          typeof c.doneness === 'string') ||
        (c.schemaVersion === 2 &&
          c.modelVersion === 'williams-pressure-v2' &&
          typeof c.doneness === 'number')
      ) ||
      !validTime(c.startAtMs) ||
      !validTime(c.savedAtMs) ||
      !validTime(c.targetAtMs) ||
      c.startAtMs > c.savedAtMs ||
      !Number.isInteger(c.durationSeconds)
    )
      throw new Error();
    const expected = createCook(
      {
        massG: c.massG,
        initialTemperatureC: c.initialTemperatureC,
        doneness: c.doneness,
      },
      {
        pressureHpa: c.pressureHpa,
        source: c.source,
        altitudeM: c.altitudeM,
        weatherTimeSeconds: c.weatherTimeSeconds,
      },
      c.startAtMs,
    );
    if (
      c.durationSeconds !== expected.durationSeconds ||
      c.targetAtMs !== expected.targetAtMs
    )
      throw new Error();
    if (!validTime(now) || now < c.savedAtMs)
      return { kind: 'uncertain', cook: c };
    if (now - c.startAtMs >= 86400000) return { kind: 'old' };
    return { kind: 'valid', cook: c };
  } catch {
    return { kind: 'corrupt' };
  }
}
// A virtual clock changes rate without changing elapsed simulated time.
export class CookingClock {
  private realAnchor: number;
  private virtualAnchor: number;
  rate: 1 | 10 | 20 | 50;
  constructor(
    now: number,
    public readonly demo: boolean,
  ) {
    this.realAnchor = now;
    this.virtualAnchor = now;
    this.rate = 1;
  }
  now(realNow: number) {
    return Math.floor(
      this.virtualAnchor + (realNow - this.realAnchor) * this.rate,
    );
  }
  // Split an accelerated interval at the target, even after a suspended frame.
  reachTarget(target: number, realNow: number) {
    const reachedAt =
      this.realAnchor + (target - this.virtualAnchor) / this.rate;
    this.virtualAnchor = target;
    this.realAnchor = reachedAt;
    this.rate = 1;
    return this.now(realNow);
  }
  setRate(rate: 1 | 10 | 20 | 50, realNow: number) {
    if (!this.demo) return;
    this.virtualAnchor = this.now(realNow);
    this.realAnchor = realNow;
    this.rate = rate;
  }
  toEnd(target: number, realNow: number) {
    if (!this.demo) return;
    this.virtualAnchor = Math.max(this.now(realNow), target);
    this.realAnchor = realNow;
  }
}
