import { describe, expect, it } from 'vitest';
import {
  DEFAULTS,
  STANDARD,
  altitudePressure,
  boilingTemperature,
  calculate,
  category,
  formatTime,
  heatSeries,
  illustration,
  saturationPressure,
  validateInputs,
} from './egg';
import type { Inputs } from './egg';
import { CookingClock, createCook, recoverCook, sampleCook } from './cook';
import { coordinates, parseElevation, parseWeather } from './environment';

const now = 1_800_000_000_000;
const fixtures = [
  [60, 8, 1013.25, 99.974296, 292.912422, 293, 439, 586],
  [60, 20, 1013.25, 99.974296, 245.6636, 246, 368, 491],
  [60, 8, 900, 96.687039, 312.851779, 313, 469, 626],
  [60, 8, 700, 89.931389, 365.437922, 365, 548, 731],
  [40, 30, 1100, 102.292241, 148.599305, 149, 223, 297],
  [90, 2, 600, 85.925513, 570.997941, 571, 856, 1142],
];
describe('traceable physics', () => {
  it.each(fixtures)(
    'matches reference mass=%s temperature=%s pressure=%s',
    (massG, initialTemperatureC, pressure, boiling, soft, s, j, f) => {
      const result = calculate(
        { massG, initialTemperatureC, doneness: 'jammy' },
        pressure,
      );
      expect(result.boilingC).toBeCloseTo(boiling, 5);
      expect(result.softSeconds).toBeCloseTo(soft, 3);
      expect(result.times).toEqual({ soft: s, jammy: j, firm: f });
      expect(result.durationSeconds).toBe(j);
    },
  );
  it.each([
    [-500, 1074.775114],
    [0, 1013.25],
    [1000, 898.745625],
    [4000, 616.402126],
  ])('converts altitude %s', (height, pressure) =>
    expect(altitudePressure(height)).toBeCloseTo(pressure, 3),
  );
  it('converges against longer series and tighter independent solves across supported bounds', () => {
    for (const pressure of [300, 314.3, 600, 616.4, 700, 900, 1013.25, 1100]) {
      let low = 330;
      let high = 380;
      for (let n = 0; n < 55; n++) {
        const mid = (low + high) / 2;
        if (saturationPressure(mid) < pressure * 0.0001) low = mid;
        else high = mid;
      }
      expect(
        Math.abs(boilingTemperature(pressure) - ((low + high) / 2 - 273.15)),
      ).toBeLessThan(0.00001);
      for (const massG of [40, 60, 90])
        for (const initialTemperatureC of [2, 8, 20, 30]) {
          const result = calculate(
            { massG, initialTemperatureC, doneness: 'soft' },
            pressure,
          );
          const ratio =
            (result.boilingC - 63) / (result.boilingC - initialTemperatureC);
          expect(heatSeries(0.01, 64)).toBeGreaterThan(ratio);
          expect(heatSeries(1, 64)).toBeLessThan(ratio);
          let lo = 0.01;
          let hi = 1;
          for (let n = 0; n < 52; n++) {
            const mid = (lo + hi) / 2;
            if (heatSeries(mid, 64) > ratio) lo = mid;
            else hi = mid;
          }
          const tau =
            (3.7 * 1.038 * ((3 * massG) / (4 * Math.PI * 1.038)) ** (2 / 3)) /
            0.0054;
          expect(
            Math.abs(result.softSeconds - (tau * (lo + hi)) / 2),
          ).toBeLessThan(0.001);
        }
    }
  });
  it('maintains physical monotonicity and mass scaling throughout integer inputs', () => {
    for (let massG = 40; massG <= 90; massG++)
      for (
        let initialTemperatureC = 2;
        initialTemperatureC <= 30;
        initialTemperatureC++
      ) {
        const input = {
          massG,
          initialTemperatureC,
          doneness: 'jammy' as const,
        };
        const value = calculate(input, 1013.25);
        expect(value.times.soft).toBeLessThan(value.times.jammy);
        expect(value.times.jammy).toBeLessThan(value.times.firm);
        expect(calculate(input, 600).durationSeconds).toBeGreaterThan(
          value.durationSeconds,
        );
        if (massG < 90)
          expect(
            calculate({ ...input, massG: massG + 1 }, 1013.25).softSeconds /
              value.softSeconds,
          ).toBeCloseTo(((massG + 1) / massG) ** (2 / 3), 9);
        if (initialTemperatureC < 30)
          expect(
            calculate(
              { ...input, initialTemperatureC: initialTemperatureC + 1 },
              1013.25,
            ).softSeconds,
          ).toBeLessThan(value.softSeconds);
      }
  });
  it.each([NaN, Infinity, -1, 39, 91, 60.1, '60', null, undefined])(
    'rejects invalid mass %s',
    (value) =>
      expect(() =>
        validateInputs({ ...DEFAULTS, massG: value } as Inputs),
      ).toThrow(),
  );
  it.each([NaN, Infinity, 1, 31, 8.1, '8', null])(
    'rejects invalid temperature %s',
    (value) =>
      expect(() =>
        validateInputs({ ...DEFAULTS, initialTemperatureC: value } as Inputs),
      ).toThrow(),
  );
  it('rejects pressure and doneness errors without arbitrary fallback', () => {
    for (const value of [NaN, Infinity, 299, 1101, '900', null])
      expect(() => boilingTemperature(value as number)).toThrow();
    expect(() =>
      calculate(
        { ...DEFAULTS, doneness: 'medium' } as unknown as Inputs,
        1013.25,
      ),
    ).toThrow();
    expect(() => altitudePressure(8851)).toThrow();
  });
  it.each([
    [40, 'S'],
    [52, 'S'],
    [53, 'M'],
    [62, 'M'],
    [63, 'L'],
    [72, 'L'],
    [73, 'XL'],
    [90, 'XL'],
  ])('classifies %s as %s', (mass, result) =>
    expect(category(Number(mass))).toBe(result),
  );
});
describe('one physical illustration timeline', () => {
  const times = calculate(DEFAULTS, 1013.25).times;
  it.each([
    [0, 0, 0],
    [0.25 * times.soft, 0.25, 0],
    [0.65 * times.soft, 0.65, 0.05],
    [times.soft, 0.9, 0.15],
    [times.jammy, 1, 0.65],
    [times.firm, 1, 1],
    [times.firm + 600, 1, 1],
  ])('hits anchor %s', (at, white, yolk) => {
    expect(illustration(at, times)).toMatchObject({ white, yolk });
    expect(illustration(at, times, true)).toMatchObject({ white, yolk });
  });
  it('interpolates geometry but reduced motion keeps the last reached anchor', () => {
    const at = (times.soft + times.jammy) / 2;
    expect(illustration(at, times).white).toBeCloseTo(0.95);
    expect(illustration(at, times).yolk).toBeCloseTo(0.4);
    expect(illustration(at, times, true)).toMatchObject({
      white: 0.9,
      yolk: 0.15,
    });
    for (const doneness of ['soft', 'jammy', 'firm'] as const)
      expect(
        illustration(at, calculate({ ...DEFAULTS, doneness }, 1013.25).times),
      ).toEqual(illustration(at, times));
    expect(illustration(at, calculate(DEFAULTS, 700).times).yolk).toBeLessThan(
      illustration(at, times).yolk,
    );
  });
});
describe('absolute clock and recovery', () => {
  const cook = createCook(DEFAULTS, STANDARD, now);
  it('samples exact target boundaries and detects invalid/backwards time', () => {
    expect(sampleCook(cook, cook.targetAtMs - 1, now)).toMatchObject({
      remainingSeconds: 1,
      alert: false,
    });
    expect(sampleCook(cook, cook.targetAtMs, now)).toMatchObject({
      remainingSeconds: 0,
      alert: true,
      overdueSeconds: 0,
    });
    expect(sampleCook(cook, cook.targetAtMs + 1000, now)).toMatchObject({
      alert: true,
      overdueSeconds: 1,
    });
    expect(sampleCook(cook, now - 1, now)).toBeNull();
    expect(sampleCook(cook, NaN, now)).toBeNull();
    expect(() => createCook(DEFAULTS, STANDARD, 0)).toThrow();
    expect(() =>
      createCook(DEFAULTS, STANDARD, Number.MAX_SAFE_INTEGER),
    ).toThrow();
    expect(formatTime(3661)).toBe('1:01:01');
  });
  it('preserves elapsed time when changing demo rate and never accelerates real cooking', () => {
    const demo = new CookingClock(now, true);
    expect(demo.now(now + 1000)).toBe(now + 1000);
    demo.setRate(50, now);
    expect(demo.now(now + 1000)).toBe(now + 50000);
    demo.setRate(1, now + 1000);
    expect(demo.now(now + 2000)).toBe(now + 51000);
    demo.toEnd(cook.targetAtMs, now + 2000);
    expect(demo.now(now + 2000)).toBe(cook.targetAtMs);
    demo.toEnd(cook.targetAtMs, now + 3000);
    expect(demo.now(now + 3000)).toBe(cook.targetAtMs + 1000);
    const real = new CookingClock(now, false);
    real.setRate(50, now);
    real.toEnd(cook.targetAtMs, now);
    expect(real.now(now + 1000)).toBe(now + 1000);
  });
  it('recovers the original snapshot, overdue, missing, old and backward samples', () => {
    expect(recoverCook(JSON.stringify(cook), now)).toEqual({
      kind: 'valid',
      cook,
    });
    expect(recoverCook(JSON.stringify(cook), cook.targetAtMs + 1000).kind).toBe(
      'valid',
    );
    expect(recoverCook(null, now).kind).toBe('missing');
    expect(recoverCook(JSON.stringify(cook), now + 86400000).kind).toBe('old');
    expect(recoverCook(JSON.stringify(cook), now - 1).kind).toBe('uncertain');
  });
  it.each([
    { schemaVersion: 2 },
    { modelVersion: 'new' },
    { massG: '60' },
    { massG: 61 },
    { durationSeconds: 440 },
    { targetAtMs: now + 1 },
    { savedAtMs: now - 1 },
    { altitudeM: 0 },
    { weatherTimeSeconds: 1 },
    { extra: true },
    { source: 'x' },
    { pressureHpa: 900 },
  ])('rejects incompatible records %j', (change) =>
    expect(recoverCook(JSON.stringify({ ...cook, ...change }), now).kind).toBe(
      'corrupt',
    ),
  );
  it('requires exact fields and caps input before parsing', () => {
    const partial: Record<string, unknown> = { ...cook };
    delete partial.altitudeM;
    for (const raw of [
      JSON.stringify(partial),
      '[]',
      'null',
      '{',
      ' '.repeat(4097),
    ])
      expect(recoverCook(raw, now).kind).toBe('corrupt');
  });
  it('retains weather valid at commit even when it is stale on recovery', () => {
    const weather = createCook(
      DEFAULTS,
      {
        source: 'weather',
        pressureHpa: 900,
        altitudeM: 1000,
        weatherTimeSeconds: now / 1000,
      },
      now,
    );
    expect(recoverCook(JSON.stringify(weather), now + 10800000).kind).toBe(
      'valid',
    );
    expect(
      recoverCook(
        JSON.stringify({ ...weather, weatherTimeSeconds: now / 1000 - 7201 }),
        now,
      ).kind,
    ).toBe('corrupt');
  });
});
describe('external data boundaries', () => {
  const weather = {
    elevation: 1000,
    utc_offset_seconds: 0,
    current_units: { surface_pressure: 'hPa', time: 'unixtime' },
    current: { surface_pressure: 900, time: now / 1000 },
  };
  it('rounds coordinates, validates accuracy and does not accept GPS altitude as elevation', () => {
    expect(coordinates(52.52045, 13.41049, 10)).toEqual({
      latitude: 52.52,
      longitude: 13.41,
    });
    expect(() => coordinates(1, 2, 1001)).toThrow('Location imprecise');
    expect(() => coordinates('1', 2, 1)).toThrow();
    expect(() => coordinates(91, 2, 1)).toThrow();
    expect(parseElevation({ elevation: [1000], extra: 1 })).toMatchObject({
      source: 'altitude',
      pressureHpa: altitudePressure(1000),
    });
    for (const value of [
      { elevation: 1000 },
      { elevation: [] },
      { elevation: [0, 1] },
      { elevation: ['0'] },
      { elevation: [8851] },
      [],
      { error: true, elevation: [0] },
    ])
      expect(() => parseElevation(value)).toThrow();
  });
  it('uses surface pressure directly with exact units and freshness', () => {
    expect(
      parseWeather({ ...weather, pressure_msl: 1013.25 }, 1000, now),
    ).toMatchObject({ pressureHpa: 900, source: 'weather' });
    for (const change of [
      { elevation: 1002 },
      { utc_offset_seconds: 3600 },
      { current_units: { surface_pressure: 'Pa', time: 'unixtime' } },
      { current_units: { surface_pressure: 'hPa', time: 'iso8601' } },
      { current: { pressure_msl: 1013, time: now / 1000 } },
      { current: { surface_pressure: 900, time: now / 1000 - 7201 } },
      { current: { surface_pressure: 900, time: now / 1000 + 901 } },
      { current: { surface_pressure: '900', time: now / 1000 } },
      { error: true },
    ])
      expect(() =>
        parseWeather({ ...weather, ...change }, 1000, now),
      ).toThrow();
    for (const time of [now / 1000 - 7200, now / 1000 + 900])
      expect(
        parseWeather(
          { ...weather, current: { surface_pressure: 900, time } },
          1000,
          now,
        ).weatherTimeSeconds,
      ).toBe(time);
  });
});

describe('mobile exploration conditions and demo target', () => {
  it('accepts manual surface pressure exactly once and recovers its provenance', () => {
    const manual = {
      source: 'manual' as const,
      altitudeM: 8850,
      pressureHpa: 320,
      weatherTimeSeconds: null,
    };
    const cook = createCook(DEFAULTS, manual, now);
    expect(cook.durationSeconds).toBe(calculate(DEFAULTS, 320).durationSeconds);
    expect(recoverCook(JSON.stringify(cook), now)).toEqual({
      kind: 'valid',
      cook,
    });
    for (const change of [
      { pressureHpa: 299 },
      { altitudeM: 8851 },
      { weatherTimeSeconds: now / 1000 },
      { altitudeM: null },
    ]) {
      expect(() =>
        createCook(DEFAULTS, { ...manual, ...change }, now),
      ).toThrow();
    }
  });
  it('supports the full elevation range with longer estimates at the top', () => {
    expect(altitudePressure(8850)).toBeCloseTo(314.3, 0);
    for (const massG of [40, 90])
      for (const initialTemperatureC of [2, 30]) {
        const input = { massG, initialTemperatureC, doneness: 'firm' as const };
        const high = calculate(input, altitudePressure(8850));
        const low = calculate(input, altitudePressure(-500));
        expect(high.durationSeconds).toBeGreaterThan(low.durationSeconds);
        expect(high.boilingC).toBeGreaterThan(63);
        expect(high.times.soft).toBeLessThan(high.times.jammy);
        expect(high.times.jammy).toBeLessThan(high.times.firm);
      }
  });
  it.each([10, 20, 50] as const)(
    'splits a delayed %s× interval exactly at Ready then permits reacceleration',
    (rate) => {
      const clock = new CookingClock(now, true);
      clock.setRate(rate, now);
      const target = now + 400000;
      const reachedAt = now + 400000 / rate;
      expect(clock.reachTarget(target, reachedAt + 7000)).toBe(target + 7000);
      expect(clock.rate).toBe(1);
      clock.setRate(rate, reachedAt + 7000);
      expect(clock.now(reachedAt + 8000)).toBe(target + 7000 + rate * 1000);
    },
  );
});

describe('continuous texture and snapshot compatibility', () => {
  it('interpolates every texture step monotonically with exact original anchors', () => {
    const base = calculate({ ...DEFAULTS, doneness: 'soft' }, 1013.25);
    let previous = 0;
    for (let step = 75; step <= 200; step++) {
      const value = calculate({ ...DEFAULTS, doneness: step / 100 }, 1013.25);
      expect(value.durationSeconds).toBe(
        Math.round((base.softSeconds * step) / 100),
      );
      expect(value.durationSeconds).toBeGreaterThan(previous);
      previous = value.durationSeconds;
    }
    for (const [name, multiplier] of [
      ['soft', 1],
      ['jammy', 1.5],
      ['firm', 2],
    ] as const)
      expect(
        calculate({ ...DEFAULTS, doneness: multiplier }, 1013.25)
          .durationSeconds,
      ).toBe(base.times[name]);
  });
  it('recovers numeric v2 and named v1 snapshots without rounding texture away', () => {
    for (const doneness of [
      0.75,
      1.23,
      1.78,
      2.25,
      2,
      'soft',
      'jammy',
      'firm',
    ] as const) {
      const cook = createCook({ ...DEFAULTS, doneness }, STANDARD, now);
      expect(cook.schemaVersion).toBe(typeof doneness === 'number' ? 2 : 1);
      expect(recoverCook(JSON.stringify(cook), now + 1000)).toEqual({
        kind: 'valid',
        cook,
      });
      const mismatched = {
        ...cook,
        schemaVersion: cook.schemaVersion === 1 ? 2 : 1,
      };
      expect(recoverCook(JSON.stringify(mismatched), now).kind).toBe('corrupt');
    }
  });
  it.each([0.74, 2.26, 1.234, NaN, Infinity])(
    'rejects invalid texture %s',
    (doneness) => {
      expect(() => calculate({ ...DEFAULTS, doneness }, 1013.25)).toThrow();
    },
  );
});

it('validates optional locality labels without accepting IP-derived or mismatched places', async () => {
  const { parsePlace } = await import('./environment');
  const data = {
    latitude: 52.52,
    longitude: 13.41,
    lookupSource: 'coordinates',
    city: 'Berlin',
  };
  expect(parsePlace(data, 52.52, 13.41)).toBe('Berlin');
  expect(
    parsePlace({ ...data, city: '', locality: 'Mitte' }, 52.52, 13.41),
  ).toBe('Mitte');
  for (const change of [
    { lookupSource: 'ip' },
    { latitude: 0 },
    { city: 42 },
    { city: 'x'.repeat(121) },
    { city: '\u0000' },
  ]) {
    expect(() => parsePlace({ ...data, ...change }, 52.52, 13.41)).toThrow();
  }
});
