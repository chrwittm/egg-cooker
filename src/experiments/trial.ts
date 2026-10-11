// Diagnostics are observations of browser events, never proof of audibility.
export const LAB_KEY = 'egg-cooker.media-lab.v1';
export const variants = ['immediate', 'quiet', 'ticks'] as const;
export type Variant = (typeof variants)[number];
export const scenarios = [
  'visible',
  'locked',
  'other-app',
  'reopen-lock',
  'interruption',
  'offline',
  'closed',
] as const;
export type Scenario = (typeof scenarios)[number];
export type Observation = 'unrecorded' | 'yes' | 'no';
export interface TrialSettings {
  variant: Variant;
  seconds: 0 | 60 | 300;
  scenario: Scenario;
  route: 'speaker' | 'headphones' | 'bluetooth';
  silent: boolean;
  focus: boolean;
  lowPower: boolean;
}
export interface TrialEvent {
  name: string;
  atMs: number;
  mediaSeconds: number;
  paused: boolean;
  hidden: boolean;
}
export interface Trial {
  id: string;
  build: string;
  settings: TrialSettings;
  startedAtMs: number;
  targetAtMs: number;
  finishedAtMs: number | null;
  status: 'playing' | 'paused' | 'stopped' | 'ended' | 'failed' | 'interrupted';
  standalone: boolean;
  mediaSession: boolean;
  audioSession: boolean;
  heard: Observation;
  artwork: Observation;
  progress: Observation;
  returned: Observation;
  offsetSeconds: number | null;
  events: TrialEvent[];
}
export interface LabLog {
  version: 1;
  device: string;
  runs: Trial[];
}
export const emptyLog = (): LabLog => ({ version: 1, device: '', runs: [] });
export function beginTrial(
  settings: TrialSettings,
  now: number,
  id: string,
  build: string,
  capabilities: Pick<Trial, 'standalone' | 'mediaSession' | 'audioSession'>,
): Trial {
  if (
    !Number.isSafeInteger(now) ||
    now <= 0 ||
    !variants.includes(settings.variant) ||
    ![0, 60, 300].includes(settings.seconds) ||
    (settings.variant === 'immediate') !== (settings.seconds === 0)
  )
    throw new Error('Invalid trial');
  return {
    id,
    build,
    settings: { ...settings },
    startedAtMs: now,
    targetAtMs: now + settings.seconds * 1000,
    finishedAtMs: null,
    status: 'playing',
    ...capabilities,
    heard: 'unrecorded',
    artwork: 'unrecorded',
    progress: 'unrecorded',
    returned: 'unrecorded',
    offsetSeconds: null,
    events: [],
  };
}
export function appendEvent(trial: Trial, event: TrialEvent): Trial {
  return { ...trial, events: [...trial.events.slice(-249), event] };
}
export function trialTiming(trial: Trial, now: number, mediaSeconds: number) {
  const remainingSeconds = Math.ceil(
    Math.max(0, trial.targetAtMs - now) / 1000,
  );
  return {
    remainingSeconds,
    overdueSeconds: Math.floor(Math.max(0, now - trial.targetAtMs) / 1000),
    driftSeconds: (now - trial.startedAtMs) / 1000 - mediaSeconds,
    uncertain: !Number.isSafeInteger(now) || now < trial.startedAtMs,
  };
}
const object = (v: unknown): v is Record<string, unknown> =>
  Boolean(v) && typeof v === 'object' && !Array.isArray(v);
const time = (v: unknown): v is number =>
  typeof v === 'number' && Number.isSafeInteger(v) && v > 0;
const finite = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v);
const observation = (v: unknown): v is Observation =>
  ['unrecorded', 'yes', 'no'].includes(v as string);
export function recoverLog(raw: string | null): LabLog | null {
  if (raw === null) return emptyLog();
  try {
    if (raw.length > 1_000_000) return null;
    const value: unknown = JSON.parse(raw);
    if (
      !object(value) ||
      value.version !== 1 ||
      typeof value.device !== 'string' ||
      value.device.length > 100 ||
      !Array.isArray(value.runs) ||
      value.runs.length > 20
    )
      return null;
    const runs: Trial[] = [];
    for (const r of value.runs) {
      if (
        !object(r) ||
        typeof r.id !== 'string' ||
        !/^[a-f0-9-]{36}$/i.test(r.id) ||
        typeof r.build !== 'string' ||
        !/^[a-z0-9.-]{1,100}$/i.test(r.build) ||
        !time(r.startedAtMs) ||
        !time(r.targetAtMs) ||
        !(r.finishedAtMs === null || time(r.finishedAtMs)) ||
        ![
          'playing',
          'paused',
          'stopped',
          'ended',
          'failed',
          'interrupted',
        ].includes(r.status as string) ||
        !object(r.settings)
      )
        return null;
      const s = r.settings;
      if (
        !variants.includes(s.variant as Variant) ||
        ![0, 60, 300].includes(s.seconds as number) ||
        (s.variant === 'immediate') !== (s.seconds === 0) ||
        !scenarios.includes(s.scenario as Scenario) ||
        !['speaker', 'headphones', 'bluetooth'].includes(s.route as string) ||
        ![
          s.silent,
          s.focus,
          s.lowPower,
          r.standalone,
          r.mediaSession,
          r.audioSession,
        ].every((v) => typeof v === 'boolean') ||
        ![r.heard, r.artwork, r.progress, r.returned].every(observation) ||
        !(
          r.offsetSeconds === null ||
          (finite(r.offsetSeconds) && Math.abs(r.offsetSeconds) <= 3600)
        ) ||
        r.targetAtMs !== r.startedAtMs + (s.seconds as number) * 1000 ||
        !Array.isArray(r.events) ||
        r.events.length > 250
      )
        return null;
      const events: TrialEvent[] = [];
      for (const e of r.events) {
        if (
          !object(e) ||
          typeof e.name !== 'string' ||
          !/^[a-z0-9:-]{1,80}$/.test(e.name) ||
          !time(e.atMs) ||
          !finite(e.mediaSeconds) ||
          e.mediaSeconds < 0 ||
          e.mediaSeconds > 86400 ||
          typeof e.paused !== 'boolean' ||
          typeof e.hidden !== 'boolean'
        )
          return null;
        events.push({
          name: e.name,
          atMs: e.atMs,
          mediaSeconds: e.mediaSeconds,
          paused: e.paused,
          hidden: e.hidden,
        });
      }
      // Explicitly reconstruct the bounded diagnostic schema; unknown imported
      // fields never survive into the page or exported results.
      runs.push({
        id: r.id,
        build: r.build,
        settings: {
          variant: s.variant as Variant,
          seconds: s.seconds as TrialSettings['seconds'],
          scenario: s.scenario as Scenario,
          route: s.route as TrialSettings['route'],
          silent: s.silent as boolean,
          focus: s.focus as boolean,
          lowPower: s.lowPower as boolean,
        },
        startedAtMs: r.startedAtMs,
        targetAtMs: r.targetAtMs,
        finishedAtMs: r.finishedAtMs as number | null,
        status: r.status as Trial['status'],
        standalone: r.standalone as boolean,
        mediaSession: r.mediaSession as boolean,
        audioSession: r.audioSession as boolean,
        heard: r.heard as Observation,
        artwork: r.artwork as Observation,
        progress: r.progress as Observation,
        returned: r.returned as Observation,
        offsetSeconds: r.offsetSeconds as number | null,
        events,
      });
    }
    return { version: 1, device: value.device, runs };
  } catch {
    return null;
  }
}
