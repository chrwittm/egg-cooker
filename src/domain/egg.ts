// Equations, units and provenance: docs/product/specifications/0001-mvp-science.md.
export type Doneness = 'soft' | 'jammy' | 'firm';
export interface Inputs {
  massG: number;
  initialTemperatureC: number;
  doneness: Doneness | number;
}
export interface Conditions {
  pressureHpa: number;
  source: 'standard' | 'altitude' | 'weather' | 'manual';
  altitudeM: number | null;
  weatherTimeSeconds: number | null;
}
export const STANDARD: Conditions = {
  pressureHpa: 1013.25,
  source: 'standard',
  altitudeM: null,
  weatherTimeSeconds: null,
};
export const DEFAULTS: Inputs = {
  massG: 60,
  initialTemperatureC: 8,
  doneness: 'soft',
};
// Continuous texture uses the same provisional Soft/Jammy/Firm multipliers.
export function textureValue(value: Doneness | number): number {
  return typeof value === 'number'
    ? value
    : { soft: 1, jammy: 1.5, firm: 2 }[value];
}
export function textureCategory(value: Doneness | number): Doneness {
  const n = textureValue(value);
  return n < 1.25 ? 'soft' : n < 1.75 ? 'jammy' : 'firm';
}
export function textureName(value: Doneness | number): string {
  return { soft: 'Soft', jammy: 'Jammy', firm: 'Firm' }[textureCategory(value)];
}
export function bounded(
  value: unknown,
  min: number,
  max: number,
): value is number {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= min &&
    value <= max
  );
}
export function category(massG: number) {
  return massG < 53 ? 'S' : massG < 63 ? 'M' : massG < 73 ? 'L' : 'XL';
}
export function validateInputs(input: Inputs) {
  if (
    !bounded(input.massG, 40, 90) ||
    !Number.isInteger(input.massG) ||
    !bounded(input.initialTemperatureC, 2, 30) ||
    !Number.isInteger(input.initialTemperatureC) ||
    !(typeof input.doneness === 'number'
      ? bounded(input.doneness, 0.75, 2.25) &&
        Math.abs(input.doneness * 100 - Math.round(input.doneness * 100)) < 1e-8
      : ['soft', 'jammy', 'firm'].includes(input.doneness))
  )
    throw new Error('Invalid egg inputs');
}
export function altitudePressure(height: number) {
  if (!bounded(height, -500, 8850)) throw new Error('Invalid altitude');
  return 1013.25 * (1 - (0.0065 * height) / 288.15) ** 5.25588;
}
export function altitudeConditions(height: number): Conditions {
  return {
    pressureHpa: altitudePressure(height),
    source: 'altitude',
    altitudeM: height,
    weatherTimeSeconds: null,
  };
}
export function freshWeather(
  seconds: unknown,
  nowMs: number,
): seconds is number {
  return (
    typeof seconds === 'number' &&
    Number.isInteger(seconds) &&
    Number.isFinite(nowMs) &&
    seconds >= nowMs / 1000 - 7200 &&
    seconds <= nowMs / 1000 + 900
  );
}
export function validateConditions(c: Conditions, nowMs: number) {
  if (!bounded(c.pressureHpa, 300, 1100)) throw new Error('Invalid pressure');
  if (
    c.source === 'standard' &&
    c.pressureHpa === 1013.25 &&
    c.altitudeM === null &&
    c.weatherTimeSeconds === null
  )
    return;
  if (bounded(c.altitudeM, -500, 8850)) {
    if (c.source === 'manual' && c.weatherTimeSeconds === null) return;
    if (
      c.source === 'altitude' &&
      c.pressureHpa === altitudePressure(c.altitudeM) &&
      c.weatherTimeSeconds === null
    )
      return;
    if (c.source === 'weather' && freshWeather(c.weatherTimeSeconds, nowMs))
      return;
  }
  throw new Error('Invalid conditions');
}
export function saturationPressure(temperatureK: number) {
  const u = 1 - temperatureK / 647.096;
  const sum =
    -7.85951783 * u +
    1.84408259 * u ** 1.5 -
    11.7866497 * u ** 3 +
    22.6807411 * u ** 3.5 -
    15.9618719 * u ** 4 +
    1.80122502 * u ** 7.5;
  return 22.064 * Math.exp((647.096 / temperatureK) * sum);
}
function bisect(
  fn: (x: number) => number,
  target: number,
  lo: number,
  hi: number,
  iterations: number,
  increasing: boolean,
) {
  if (!Number.isFinite(target) || (fn(lo) - target) * (fn(hi) - target) >= 0)
    throw new Error('Solver bracket unavailable');
  for (let i = 0; i < iterations; i++) {
    const mid = (lo + hi) / 2;
    if (fn(mid) < target === increasing) lo = mid;
    else hi = mid;
  }
  const result = (lo + hi) / 2;
  if (!Number.isFinite(result)) throw new Error('Solver failed');
  return result;
}
export function boilingTemperature(pressureHpa: number) {
  if (!bounded(pressureHpa, 300, 1100)) throw new Error('Invalid pressure');
  return (
    bisect(saturationPressure, pressureHpa * 0.0001, 330, 380, 48, true) -
    273.15
  );
}
export function heatSeries(q: number, terms = 32) {
  let sum = 0;
  for (let n = 1; n <= terms; n++)
    sum +=
      (((-1) ** (n - 1) * Math.sin(n * Math.PI * 0.69)) / n) *
      Math.exp(-n * n * Math.PI * Math.PI * q);
  return (2 / (Math.PI * 0.69)) * sum;
}
export function calculate(input: Inputs, pressureHpa: number) {
  validateInputs(input);
  const boilingC = boilingTemperature(pressureHpa);
  const ratio = (boilingC - 63) / (boilingC - input.initialTemperatureC);
  const q = bisect(heatSeries, ratio, 0.01, 1, 40, false);
  const radius = ((3 * input.massG) / (4 * Math.PI * 1.038)) ** (1 / 3);
  const softSeconds = ((3.7 * 1.038 * radius * radius) / 0.0054) * q;
  const times = {
    soft: Math.floor(softSeconds + 0.5),
    jammy: Math.floor(1.5 * softSeconds + 0.5),
    firm: Math.floor(2 * softSeconds + 0.5),
  };
  return {
    boilingC,
    softSeconds,
    times,
    durationSeconds: Math.floor(
      softSeconds * textureValue(input.doneness) + 0.5,
    ),
  };
}
export interface Illustration {
  white: number;
  yolk: number;
  stage: string;
}
export function illustration(
  elapsedSeconds: number,
  times: Record<Doneness, number>,
  reducedMotion = false,
): Illustration {
  const anchors = [
    {
      at: 0,
      white: 0,
      yolk: 0,
      stage: 'Glossy yolk, translucent-looking white',
    },
    {
      at: times.soft * 0.25,
      white: 0.25,
      yolk: 0,
      stage: 'Opaque white beginning at the shell',
    },
    {
      at: times.soft * 0.65,
      white: 0.65,
      yolk: 0.05,
      stage: 'White advancing inward, thin matte yolk edge',
    },
    {
      at: times.soft,
      white: 0.9,
      yolk: 0.15,
      stage: 'Soft illustration: tender-looking white, glossy yolk',
    },
    {
      at: times.jammy,
      white: 1,
      yolk: 0.65,
      stage: 'Jammy illustration: opaque white, creamy-looking yolk',
    },
    {
      at: times.firm,
      white: 1,
      yolk: 1,
      stage: 'Firm illustration: opaque white, matte yolk',
    },
  ];
  for (let i = 1; i < anchors.length; i++) {
    const before = anchors[i - 1]!;
    const after = anchors[i]!;
    if (elapsedSeconds < after.at) {
      const fraction = reducedMotion
        ? 0
        : Math.max(0, (elapsedSeconds - before.at) / (after.at - before.at));
      return {
        white: before.white + fraction * (after.white - before.white),
        yolk: before.yolk + fraction * (after.yolk - before.yolk),
        stage: before.stage,
      };
    }
  }
  return anchors[5]!;
}
export function formatTime(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  return s >= 3600
    ? `${Math.floor(s / 3600)}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
    : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
