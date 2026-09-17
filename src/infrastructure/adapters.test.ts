import { afterEach, describe, expect, it, vi } from 'vitest';
import { CookStorage } from './storage';
import { createCook, STORAGE_KEY } from '../domain/cook';
import { DEFAULTS, STANDARD } from '../domain/egg';
import { EnvironmentLookup, fetchJson } from './environment';
import type { LookupUpdate } from './environment';
import { CookSound, ReminderWindow, CountdownTicks } from './sound';
const now = 1_800_000_000_000;
afterEach(() => vi.useRealTimers());
const position = {
  coords: { latitude: 52.52045, longitude: 13.41049, accuracy: 10 },
} as GeolocationPosition;
const geo = {
  getCurrentPosition: (success: PositionCallback) => success(position),
} as Geolocation;
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status });
describe('environment pipeline', () => {
  it('publishes altitude before weather and uses rounded coordinates, explicit elevation and no credentials', async () => {
    const updates: LookupUpdate[] = [];
    const request = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(json({ elevation: [1000] }))
      .mockResolvedValueOnce(
        json({
          elevation: 1000,
          utc_offset_seconds: 0,
          current_units: { time: 'unixtime', surface_pressure: 'hPa' },
          current: { time: now / 1000, surface_pressure: 900 },
        }),
      );
    const lookup = new EnvironmentLookup(
      (u) => updates.push(u),
      () => now,
      geo,
      request,
    );
    await lookup.start();
    expect(updates.map((u) => [u.conditions.source, u.pending])).toEqual([
      ['standard', true],
      ['altitude', true],
      ['weather', false],
    ]);
    expect(request.mock.calls[0]![0]).toBe(
      'https://api.open-meteo.com/v1/elevation?latitude=52.52&longitude=13.41',
    );
    expect(request.mock.calls[1]![0]).toContain(
      'elevation=1000&current=surface_pressure&timeformat=unixtime&timezone=GMT',
    );
    expect(request.mock.calls[0]![1]).toMatchObject({
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
    });
  });
  it.each([429, 500])('keeps altitude on weather HTTP %s', async (status) => {
    const updates: LookupUpdate[] = [];
    const request = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(json({ elevation: [1000] }))
      .mockResolvedValueOnce(json({}, status));
    await new EnvironmentLookup(
      (u) => updates.push(u),
      () => now,
      geo,
      request,
    ).start();
    expect(updates.at(-1)).toMatchObject({
      conditions: { source: 'altitude' },
      pending: false,
      error: 'Weather unavailable',
    });
  });
  it('falls back to standard when elevation or location fails', async () => {
    for (const geolocation of [
      geo,
      {
        getCurrentPosition: (
          _success: PositionCallback,
          failure: PositionErrorCallback,
        ) => failure({} as GeolocationPositionError),
      } as Geolocation,
      {
        getCurrentPosition: (success: PositionCallback) =>
          success({
            ...position,
            coords: { ...position.coords, accuracy: 1001 },
          }),
      } as Geolocation,
    ]) {
      const updates: LookupUpdate[] = [];
      await new EnvironmentLookup(
        (u) => updates.push(u),
        () => now,
        geolocation,
        vi.fn<typeof fetch>().mockRejectedValue(new Error('offline')),
      ).start();
      expect(updates.at(-1)).toMatchObject({
        conditions: STANDARD,
        pending: false,
      });
      expect(updates.at(-1)!.error).not.toBe('');
    }
  });
  it('ignores geolocation callbacks after cancellation and after a replacement request', async () => {
    const callbacks: PositionCallback[] = [];
    const updates: LookupUpdate[] = [];
    const request = vi
      .fn<typeof fetch>()
      .mockResolvedValue(json({ elevation: [0] }));
    const lookup = new EnvironmentLookup(
      (u) => updates.push(u),
      () => now,
      {
        getCurrentPosition: (success: PositionCallback) => {
          callbacks.push(success);
        },
      } as Geolocation,
      request,
    );
    const first = lookup.start();
    lookup.cancel();
    callbacks[0]!(position);
    await first;
    expect(request).not.toHaveBeenCalled();
    const second = lookup.start();
    const third = lookup.start();
    callbacks[1]!(position);
    await second;
    expect(request).not.toHaveBeenCalled();
    lookup.cancel();
    callbacks[2]!(position);
    await third;
    expect(updates).toHaveLength(3);
  });
  it('ignores an in-flight fetch that resolves after commit/cancel', async () => {
    const updates: LookupUpdate[] = [];
    let resolve!: (r: Response) => void;
    const request = vi.fn<typeof fetch>(
      () => new Promise((r) => (resolve = r)),
    );
    const lookup = new EnvironmentLookup(
      (u) => updates.push(u),
      () => now,
      geo,
      request,
    );
    const pending = lookup.start();
    await vi.waitFor(() => expect(request).toHaveBeenCalledOnce());
    lookup.cancel();
    resolve(json({ elevation: [1000] }));
    await pending;
    expect(updates).toHaveLength(1);
    expect(request).toHaveBeenCalledOnce();
  });
  it('aborts the fetch deadline and enforces the streamed byte cap', async () => {
    vi.useFakeTimers();
    const signal = new AbortController().signal;
    const request = vi.fn<typeof fetch>(
      (_url, init) =>
        new Promise((_resolve, reject) =>
          init?.signal?.addEventListener('abort', () =>
            reject(new Error('aborted')),
          ),
        ),
    );
    const promise = expect(
      fetchJson('https://example.test', signal, request),
    ).rejects.toThrow('aborted');
    await vi.advanceTimersByTimeAsync(8000);
    await promise;
    await expect(
      fetchJson(
        'https://example.test',
        signal,
        vi
          .fn<typeof fetch>()
          .mockResolvedValue(new Response(' '.repeat(65537))),
      ),
    ).rejects.toThrow('too large');
    await expect(
      fetchJson(
        'https://example.test',
        signal,
        vi
          .fn<typeof fetch>()
          .mockResolvedValue(
            new Response('{}', { headers: { 'content-length': '65537' } }),
          ),
      ),
    ).rejects.toThrow();
  });
});
describe('storage failure isolation', () => {
  it('writes only the active key and does not resurrect a timer after failed deletion', () => {
    const cook = createCook(DEFAULTS, STANDARD, now);
    const data = new Map<string, string>();
    const fake = {
      getItem: (k: string) => data.get(k) ?? null,
      setItem: (k: string, v: string) => data.set(k, v),
      removeItem: (k: string) => data.delete(k),
    } as unknown as Storage;
    data.set('other', 'keep');
    const storage = new CookStorage(() => fake);
    expect(storage.save(cook)).toBe('');
    expect(data.size).toBe(2);
    expect(storage.read(now).recovery.kind).toBe('valid');
    fake.removeItem = () => {
      throw new Error();
    };
    expect(storage.remove()).toContain('older timer');
    expect(storage.read(now).recovery.kind).toBe('missing');
    expect(data.get('other')).toBe('keep');
    expect(data.has(STORAGE_KEY)).toBe(true);
  });
  it('attempts stale-data removal after a failed write and handles denied access', () => {
    const remove = vi.fn();
    const storage = new CookStorage(
      () =>
        ({
          setItem: () => {
            throw new Error();
          },
          removeItem: remove,
        }) as unknown as Storage,
    );
    expect(storage.save(createCook(DEFAULTS, STANDARD, now))).toBe(
      'Recovery unavailable',
    );
    expect(remove).toHaveBeenCalledWith(STORAGE_KEY);
    const denied = new CookStorage(() => {
      throw new Error();
    });
    expect(denied.read(now).warning).toBe('Recovery unavailable');
    expect(denied.save(createCook(DEFAULTS, STANDARD, now))).toContain(
      'older timer',
    );
  });
});
describe('audio reminder policy', () => {
  it('leaves quiet spacing after each recorded call while visible until acknowledged', () => {
    const window = new ReminderWindow();
    expect(window.due(now, false, true, true)).toBe(false);
    expect(window.due(now, true, false, true)).toBe(false);
    expect(window.due(now + 100000, true, true, true)).toBe(true);
    expect(window.due(now + 100001, true, true, true)).toBe(false);
    expect(window.due(now + 110000, false, true, true)).toBe(false);
    expect(window.due(now + 125000, true, true, true)).toBe(true);
    expect(window.due(now + 126000, true, true, true)).toBe(false);
    expect(window.due(now + 160000, true, true, true)).toBe(true);
    expect(window.due(now + 200000, true, true, true)).toBe(true);
  });
  it('mute suppresses cues and recovered overdue sessions only preview', () => {
    const window = new ReminderWindow();
    expect(window.due(now, true, true, false)).toBe(false);
    expect(window.due(now + 60000, true, true, true)).toBe(true);
    expect(new ReminderWindow(true).due(now, true, true, true)).toBe(false);
  });
  it('isolates denied Web Audio and cancels activation that resolves after mute', async () => {
    const failure = vi.fn();
    await new CookSound(failure, () => {
      throw new Error();
    }).enable();
    expect(failure).toHaveBeenCalledOnce();
    let resume!: () => void;
    const createOscillator = vi.fn();
    const context = {
      resume: () => new Promise<void>((r) => (resume = r)),
      state: 'running',
      createOscillator,
    } as unknown as AudioContext;
    const sound = new CookSound(failure, () => context);
    const pending = sound.enable();
    sound.stop();
    resume();
    await pending;
    expect(createOscillator).not.toHaveBeenCalled();
  });
});

it('plays the recorded Ready call without overlap and disconnects stopped audio nodes', async () => {
  const nodes: {
    start: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
    onended: (() => void) | null;
    frequency: { value: number };
    connect: ReturnType<typeof vi.fn>;
    type: string;
  }[] = [];
  const gains: { disconnect: ReturnType<typeof vi.fn> }[] = [];
  const sources: {
    start: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
    connect: ReturnType<typeof vi.fn>;
    onended: (() => void) | null;
    buffer: AudioBuffer | null;
  }[] = [];
  const buffer = {} as AudioBuffer;
  const context = {
    state: 'running',
    currentTime: 10,
    destination: {},
    resume: async () => {},
    close: vi.fn(async () => {}),
    createOscillator: () => {
      const node = {
        start: vi.fn(),
        stop: vi.fn(),
        disconnect: vi.fn(),
        onended: null as (() => void) | null,
        frequency: { value: 0 },
        connect: vi.fn(),
        type: '',
      };
      nodes.push(node);
      return node;
    },
    createGain: () => {
      const gain = {
        gain: {
          setValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
        connect: vi.fn(),
        disconnect: vi.fn(),
      };
      gains.push(gain);
      return gain;
    },
    createBufferSource: () => {
      const source = {
        start: vi.fn(),
        stop: vi.fn(),
        disconnect: vi.fn(),
        connect: vi.fn(),
        onended: null as (() => void) | null,
        buffer: null as AudioBuffer | null,
      };
      sources.push(source);
      return source;
    },
  };
  const unavailable = vi.fn();
  const loadAlarm = vi.fn(async () => buffer);
  const sound = new CookSound(
    unavailable,
    () => context as unknown as AudioContext,
    loadAlarm,
  );
  await sound.enable();
  expect(loadAlarm).toHaveBeenCalledOnce();
  expect(nodes).toHaveLength(1);
  expect(nodes[0]!.start).toHaveBeenCalledWith(10);
  nodes[0]!.onended!();
  expect(gains[0]!.disconnect).toHaveBeenCalledOnce();
  sound.play();
  await vi.waitFor(() => expect(sources).toHaveLength(1));
  expect(sources[0]!.buffer).toBe(buffer);
  expect(sources[0]!.start).toHaveBeenCalledOnce();
  sound.play();
  await Promise.resolve();
  expect(sources).toHaveLength(1);
  sources[0]!.onended!();
  expect(sources[0]!.disconnect).toHaveBeenCalledOnce();
  sound.play();
  await vi.waitFor(() => expect(sources).toHaveLength(2));
  sound.stop();
  expect(sources[1]!.stop).toHaveBeenCalledOnce();
  sound.close();
  expect(context.close).toHaveBeenCalledOnce();
  expect(unavailable).not.toHaveBeenCalled();
});

it('falls back to the synthesized Ready melody when the recording fails', async () => {
  const nodes: {
    frequency: { value: number };
    onended: (() => void) | null;
  }[] = [];
  const context = {
    state: 'running',
    currentTime: 10,
    destination: {},
    resume: async () => {},
    createOscillator: () => {
      const node = {
        start: vi.fn(),
        stop: vi.fn(),
        disconnect: vi.fn(),
        onended: null as (() => void) | null,
        frequency: { value: 0 },
        connect: vi.fn(),
        type: '',
      };
      nodes.push(node);
      return node;
    },
    createGain: () => ({
      gain: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      disconnect: vi.fn(),
    }),
  };
  const unavailable = vi.fn();
  const sound = new CookSound(
    unavailable,
    () => context as unknown as AudioContext,
    async () => {
      throw new Error('missing');
    },
  );
  await sound.enable();
  nodes[0]!.onended!();
  sound.play();
  await vi.waitFor(() => expect(nodes).toHaveLength(4));
  expect(nodes.slice(1).map((node) => node.frequency.value)).toEqual([
    880, 1100, 880,
  ]);
  expect(unavailable).not.toHaveBeenCalled();
});

it('ticks once for each final second, never catches up or bursts in demo mode', () => {
  const ticks = new CountdownTicks();
  expect(ticks.due(11, now, true, true)).toBe(false);
  for (let second = 10; second >= 1; second--) {
    const time = now + (10 - second) * 1000;
    expect(ticks.due(second, time, true, true)).toBe(true);
    expect(ticks.due(second, time + 20, true, true)).toBe(false);
  }
  expect(ticks.due(0, now + 10000, true, true)).toBe(false);
  expect(new CountdownTicks().due(5, now, false, true)).toBe(false);
  expect(new CountdownTicks().due(5, now, true, false)).toBe(false);
  const fast = new CountdownTicks();
  expect(fast.due(10, now, true, true)).toBe(true);
  expect(fast.due(1, now + 180, true, true)).toBe(false);
  const alarm = new ReminderWindow();
  expect(alarm.due(now, true, true, true)).toBe(true);
  expect(alarm.due(now + 4999, true, true, true)).toBe(false);
  expect(alarm.due(now + 5000, true, true, true)).toBe(true);
});

it('optional place lookup does not delay weather and cannot publish after cancellation', async () => {
  const updates: LookupUpdate[] = [];
  let resolvePlace!: (r: Response) => void;
  const request = vi.fn<typeof fetch>((url) => {
    if (String(url).includes('bigdatacloud'))
      return new Promise((resolve) => {
        resolvePlace = resolve;
      });
    if (String(url).includes('/elevation?'))
      return Promise.resolve(json({ elevation: [1000] }));
    return Promise.resolve(
      json({
        elevation: 1000,
        utc_offset_seconds: 0,
        current_units: { time: 'unixtime', surface_pressure: 'hPa' },
        current: { time: now / 1000, surface_pressure: 900 },
      }),
    );
  });
  const lookup = new EnvironmentLookup(
    (u) => updates.push(u),
    () => now,
    geo,
    request,
    true,
  );
  await lookup.start('de');
  expect(
    request.mock.calls.some(([url]) =>
      String(url).includes('localityLanguage=de'),
    ),
  ).toBe(true);
  expect(updates.at(-1)).toMatchObject({
    pending: false,
    conditions: { source: 'weather' },
    place: '',
  });
  lookup.cancel();
  const count = updates.length;
  resolvePlace(
    json({
      lookupSource: 'coordinates',
      latitude: 52.52,
      longitude: 13.41,
      city: 'Berlin',
    }),
  );
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(updates).toHaveLength(count);
});
