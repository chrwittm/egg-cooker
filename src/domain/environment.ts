import { altitudeConditions, bounded, freshWeather } from './egg';
import type { Conditions } from './egg';
export function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Invalid response');
  return value as Record<string, unknown>;
}
export function coordinates(
  latitude: unknown,
  longitude: unknown,
  accuracy: unknown,
) {
  if (
    !bounded(latitude, -90, 90) ||
    !bounded(longitude, -180, 180) ||
    !bounded(accuracy, 0, Number.MAX_VALUE)
  )
    throw new Error('Location unavailable');
  if (accuracy > 1000) throw new Error('Location imprecise');
  return {
    latitude: Number(latitude.toFixed(3)),
    longitude: Number(longitude.toFixed(3)),
  };
}
export function parseElevation(value: unknown): Conditions {
  const data = object(value);
  if (
    data.error ||
    !Array.isArray(data.elevation) ||
    data.elevation.length !== 1 ||
    !bounded(data.elevation[0], -500, 8850)
  )
    throw new Error('Elevation unavailable');
  return altitudeConditions(data.elevation[0]);
}
export function parseWeather(
  value: unknown,
  height: number,
  now: number,
): Conditions {
  const data = object(value);
  const current = object(data.current);
  const units = object(data.current_units);
  if (
    data.error ||
    data.utc_offset_seconds !== 0 ||
    !bounded(data.elevation, height - 1, height + 1) ||
    units.surface_pressure !== 'hPa' ||
    units.time !== 'unixtime' ||
    !bounded(current.surface_pressure, 300, 1100) ||
    !freshWeather(current.time, now)
  )
    throw new Error('Weather unavailable');
  return {
    source: 'weather',
    pressureHpa: current.surface_pressure,
    altitudeM: height,
    weatherTimeSeconds: current.time,
  };
}

export function parsePlace(
  value: unknown,
  latitude: number,
  longitude: number,
): string {
  const data = object(value);
  if (
    data.lookupSource !== 'coordinates' ||
    !bounded(data.latitude, latitude - 0.001, latitude + 0.001) ||
    !bounded(data.longitude, longitude - 0.001, longitude + 0.001)
  )
    throw new Error('Place unavailable');
  for (const name of [data.city, data.locality]) {
    if (
      typeof name === 'string' &&
      name.trim().length > 0 &&
      name.length <= 120 &&
      ![...name].some(
        (character) =>
          character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127,
      )
    )
      return name.trim();
  }
  throw new Error('Place unavailable');
}
