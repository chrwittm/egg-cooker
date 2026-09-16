import {
  coordinates,
  parseElevation,
  parseWeather,
  parsePlace,
} from '../domain/environment';
import { STANDARD } from '../domain/egg';
import type { Conditions } from '../domain/egg';

export async function fetchJson(
  url: string,
  signal: AbortSignal,
  request: typeof fetch = fetch,
): Promise<unknown> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal.addEventListener('abort', abort, { once: true });
  if (signal.aborted) controller.abort();
  const deadline = setTimeout(abort, 8000);
  try {
    const response = await request(url, {
      signal: controller.signal,
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
    });
    if (
      !response.ok ||
      Number(response.headers.get('content-length')) > 65536 ||
      !response.body
    )
      throw new Error('Response unavailable');
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let bytes = 0;
    let text = '';
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        if (bytes > 65536) {
          await reader.cancel();
          throw new Error('Response too large');
        }
        text += decoder.decode(value, { stream: true });
      }
    } finally {
      reader.releaseLock();
    }
    if (controller.signal.aborted) throw new Error('Request stopped');
    return JSON.parse(text + decoder.decode()) as unknown;
  } finally {
    clearTimeout(deadline);
    signal.removeEventListener('abort', abort);
  }
}
export interface LookupUpdate {
  conditions: Conditions;
  pending: boolean;
  error: string;
  place?: string;
  placeOnly?: boolean;
}
export class EnvironmentLookup {
  private generation = 0;
  private controller: AbortController | null = null;
  constructor(
    private publish: (update: LookupUpdate) => void,
    private now: () => number = Date.now,
    private geolocation: Geolocation | undefined = navigator.geolocation,
    private request: typeof fetch = fetch,
    private lookupPlace = false,
  ) {}
  cancel() {
    this.generation++;
    this.controller?.abort();
    this.controller = null;
  }
  async start() {
    this.cancel();
    const generation = this.generation;
    const controller = new AbortController();
    this.controller = controller;
    let conditions = { ...STANDARD };
    let place = '';
    let settled = false;
    let finalError = '';
    const publish = (pending: boolean, error = '') => {
      if (!pending) {
        settled = true;
        finalError = error;
      }
      if (generation === this.generation)
        this.publish({
          conditions,
          pending,
          error,
          place: conditions.source === 'standard' ? '' : place,
        });
    };
    publish(true);
    let phase: 'location' | 'elevation' | 'weather' = 'location';
    try {
      if (!this.geolocation) throw new Error('Location unavailable');
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          const abort = () => reject(new Error('Lookup cancelled'));
          controller.signal.addEventListener('abort', abort, { once: true });
          this.geolocation!.getCurrentPosition(
            (value) => {
              controller.signal.removeEventListener('abort', abort);
              resolve(value);
            },
            () => {
              controller.signal.removeEventListener('abort', abort);
              reject(new Error('Location unavailable'));
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 },
          );
        },
      );
      if (generation !== this.generation) return;
      const c = coordinates(
        position.coords.latitude,
        position.coords.longitude,
        position.coords.accuracy,
      );
      const query = `latitude=${c.latitude}&longitude=${c.longitude}`;
      if (this.lookupPlace) {
        // Optional label never blocks weather or changes its fallback.
        void fetchJson(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?${query}&localityLanguage=en`,
          controller.signal,
          this.request,
        )
          .then((value) => {
            place = parsePlace(value, c.latitude, c.longitude);
            if (
              settled &&
              generation === this.generation &&
              conditions.source !== 'standard'
            )
              this.publish({
                conditions,
                pending: false,
                error: finalError,
                place,
                placeOnly: true,
              });
          })
          .catch(() => {
            /* Conditions still work without a place name. */
          });
      }
      phase = 'elevation';
      conditions = parseElevation(
        await fetchJson(
          `https://api.open-meteo.com/v1/elevation?${query}`,
          controller.signal,
          this.request,
        ),
      );
      if (generation !== this.generation) return;
      publish(true);
      phase = 'weather';
      const height = conditions.altitudeM!;
      const weather = await fetchJson(
        `https://api.open-meteo.com/v1/forecast?${query}&elevation=${height}&current=surface_pressure&timeformat=unixtime&timezone=GMT`,
        controller.signal,
        this.request,
      );
      if (generation !== this.generation) return;
      conditions = parseWeather(weather, height, this.now());
      publish(false);
    } catch (error) {
      publish(
        false,
        phase === 'weather'
          ? 'Weather unavailable'
          : phase === 'elevation'
            ? 'Elevation unavailable'
            : error instanceof Error && error.message === 'Location imprecise'
              ? error.message
              : 'Location unavailable',
      );
    }
    // Retain cancellation for a place request still in flight after weather.
  }
}
