<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import { formatTime } from '../domain/egg';
  import { TrialPlayer } from './player';
  import { emptyLog, scenarios, trialTiming } from './trial';
  import type {
    LabLog,
    Observation,
    Scenario,
    TrialSettings,
    Variant,
  } from './trial';
  import tracks from './assets/tracks.json';
  import rooster from '../assets/rooster-ready-warm.mp3?url';
  import quiet60 from './assets/rooster-60-quiet.mp3?url';
  import ticks60 from './assets/rooster-60-ticks.mp3?url';
  import quiet300 from './assets/rooster-300-quiet.mp3?url';
  import ticks300 from './assets/rooster-300-ticks.mp3?url';
  import artwork from '../../public/icons/app-icon-512.png?url';

  let variant = $state<Variant>('quiet');
  let seconds = $state<60 | 300>(60);
  let scenario = $state<Scenario>('locked');
  let route = $state<TrialSettings['route']>('speaker');
  let silent = $state(false);
  let focus = $state(false);
  let lowPower = $state(false);
  let ready = $state(false);
  let preparing = $state(false);
  let message = $state('');
  let warning = $state('');
  let log = $state<LabLog>(emptyLog());
  let runID = $state<string | null>(null);
  let recoveredID = $state<string | null>(null);
  let now = $state(Date.now());
  let mediaSeconds = $state(0);
  let revision = $state(0);
  let audio: HTMLAudioElement;
  let player: TrialPlayer | null = null;
  let controller: AbortController | null = null;
  let objectURL: string | null = null;
  let prepGeneration = 0;
  let mounted = $state(false);
  const build = `${__MEDIA_LAB_BUILD__.experiment}.${__MEDIA_LAB_BUILD__.sourceCommit}`;
  const latest = $derived(log.runs.at(-1) ?? null);
  const active = $derived(log.runs.find((r) => r.id === runID) ?? null);
  const busy = $derived(
    active !== null && ['playing', 'paused'].includes(active.status),
  );
  const timing = $derived(
    active ? trialTiming(active, now, mediaSeconds) : null,
  );
  const selectedURL = $derived(
    variant === 'immediate'
      ? rooster
      : seconds === 60
        ? variant === 'quiet'
          ? quiet60
          : ticks60
        : variant === 'quiet'
          ? quiet300
          : ticks300,
  );
  const selectedLabel = $derived(
    variant === 'immediate'
      ? 'Immediate rooster'
      : `${variant === 'quiet' ? 'Quiet' : 'Soft ticks'} · ${seconds === 60 ? '1 minute' : '5 minutes'}`,
  );
  const clockTime = (time: number) =>
    new Date(time).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  const publish = () => {
    log = structuredClone(player?.log ?? emptyLog());
    runID = player?.active?.id ?? null;
    warning = player?.warning ?? '';
    revision++;
  };
  function persist() {
    if (!player) return;
    const activeID = player.active?.id;
    player.log = structuredClone($state.snapshot(log));
    player.active = player.log.runs.find((run) => run.id === activeID) ?? null;
    player.persist();
    warning = player.warning;
  }
  async function prepare(url: string) {
    if (!player || busy) return;
    const generation = ++prepGeneration;
    controller?.abort();
    controller = new AbortController();
    const currentController = controller;
    player.settle();
    ready = false;
    preparing = true;
    message = '';
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
    if (objectURL) URL.revokeObjectURL(objectURL);
    objectURL = null;
    const timeout = setTimeout(() => currentController.abort(), 20000);
    try {
      const response = await fetch(url, {
        signal: currentController.signal,
        credentials: 'same-origin',
        referrerPolicy: 'no-referrer',
      });
      if (!response.ok) throw new Error('Unavailable');
      const blob = await response.blob();
      if (blob.size === 0 || blob.size > 4_000_000)
        throw new Error('Invalid track');
      if (generation !== prepGeneration) return;
      objectURL = URL.createObjectURL(blob);
      audio.src = objectURL;
      audio.load();
      // Fetch completes before Start; metadata errors remain visible. Some iOS
      // versions defer decoding until a gesture, so readiness means bytes loaded.
      ready = true;
      message = 'Track downloaded. Ready to start.';
    } catch {
      if (generation === prepGeneration)
        message = 'Track could not load. Check the connection and retry.';
    } finally {
      clearTimeout(timeout);
      if (generation === prepGeneration) preparing = false;
    }
  }
  function metadata() {
    if (!('mediaSession' in navigator) || typeof MediaMetadata === 'undefined')
      return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: 'Your egg is cooking',
        artist: 'Egg Cooker · Media Lab',
        album: selectedLabel,
        artwork: [
          {
            src: new URL(artwork, location.href).href,
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        player?.observe('system-pause');
        audio.pause();
      });
      navigator.mediaSession.setActionHandler('play', () => {
        player?.observe('system-play');
        if (
          !player?.active ||
          !['playing', 'paused'].includes(player.active.status)
        )
          return;
        void audio.play().catch(() => player?.observe('resume-rejected'));
      });
      navigator.mediaSession.setActionHandler('stop', stop);
      for (const action of [
        'seekto',
        'seekbackward',
        'seekforward',
        'nexttrack',
        'previoustrack',
      ] as const) {
        // Disable transport shortcuts; if iOS still permits a seek, the media
        // event trace and wall-clock drift expose it rather than changing target.
        try {
          navigator.mediaSession.setActionHandler(action, null);
        } catch {
          /* Optional action. */
        }
      }
    } catch {
      message =
        'Media controls could not be configured. Sound testing can continue.';
    }
  }
  function start() {
    if (!player || !ready || preparing || busy) return;
    player.settle();
    metadata();
    const settings: TrialSettings = {
      variant,
      seconds: variant === 'immediate' ? 0 : seconds,
      scenario,
      route,
      silent,
      focus,
      lowPower,
    };
    void player.start(settings, build, crypto.randomUUID(), {
      standalone:
        matchMedia('(display-mode: standalone)').matches ||
        Boolean((navigator as Navigator & { standalone?: boolean }).standalone),
      mediaSession: 'mediaSession' in navigator,
      audioSession: 'audioSession' in navigator,
    });
    now = Date.now();
    mediaSeconds = 0;
    message =
      variant === 'immediate'
        ? 'Listen for the rooster.'
        : 'Lock the phone now. Listen without reopening until the target passes.';
    render();
  }
  function stop() {
    player?.stop();
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'none';
      navigator.mediaSession.metadata = null;
    }
    message = 'Playback stopped. Record what you observed below.';
  }
  let animation = 0;
  function render() {
    cancelAnimationFrame(animation);
    now = Date.now();
    mediaSeconds = audio.currentTime;
    player?.sample();
    if (player?.active && !document.hidden)
      animation = requestAnimationFrame(render);
  }
  function result(
    field: 'heard' | 'artwork' | 'progress' | 'returned',
    value: string,
  ) {
    if (!latest || !['unrecorded', 'yes', 'no'].includes(value)) return;
    latest[field] = value as Observation;
    persist();
  }
  function exportLog() {
    const blob = new Blob([JSON.stringify($state.snapshot(log), null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `egg-media-lab-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
  onMount(() => {
    const fallback = {
      getItem: () => null,
      setItem: () => {
        throw new Error('Storage unavailable');
      },
      removeItem: () => {
        throw new Error('Storage unavailable');
      },
    };
    let storage: typeof fallback | Storage = fallback;
    try {
      storage = localStorage;
    } catch {
      /* Export remains available. */
    }
    player = new TrialPlayer(
      audio,
      storage,
      Date.now,
      () => document.hidden,
      publish,
    );
    publish();
    recoveredID = log.runs.at(-1)?.id ?? null;
    mounted = true;
    const lifecycle = () => {
      player?.observe(document.hidden ? 'hidden' : 'visible');
      if (document.hidden) cancelAnimationFrame(animation);
      else render();
    };
    const leaving = () => player?.leaving();
    const hide = () => {
      player?.leaving();
      player?.observe('pagehide');
    };
    const show = () => {
      player?.returned();
      render();
    };
    const positions = () => {
      if (!('mediaSession' in navigator)) return;
      try {
        navigator.mediaSession.playbackState = audio.paused
          ? 'paused'
          : 'playing';
        if (Number.isFinite(audio.duration) && audio.duration > 0)
          navigator.mediaSession.setPositionState({
            duration: audio.duration,
            position: Math.min(audio.currentTime, audio.duration),
            playbackRate: audio.playbackRate,
          });
      } catch {
        /* System presentation remains an observation, not a promise. */
      }
    };
    document.addEventListener('visibilitychange', lifecycle);
    window.addEventListener('pagehide', hide);
    window.addEventListener('beforeunload', leaving);
    window.addEventListener('pageshow', show);
    audio.addEventListener('playing', positions);
    audio.addEventListener('pause', positions);
    audio.addEventListener('loadedmetadata', positions);
    return () => {
      ++prepGeneration;
      controller?.abort();
      cancelAnimationFrame(animation);
      player?.dispose();
      if (objectURL) URL.revokeObjectURL(objectURL);
      document.removeEventListener('visibilitychange', lifecycle);
      window.removeEventListener('pagehide', hide);
      window.removeEventListener('beforeunload', leaving);
      window.removeEventListener('pageshow', show);
      audio.removeEventListener('playing', positions);
      audio.removeEventListener('pause', positions);
      audio.removeEventListener('loadedmetadata', positions);
    };
  });
  $effect(() => {
    const url = selectedURL;
    if (mounted)
      untrack(() => {
        void prepare(url);
      });
  });
</script>

<svelte:head><title>Egg Cooker · Media Lab</title></svelte:head>
<main>
  <header>
    <span class="brand">egg cooker<span>.</span></span><span class="badge"
      >Media Lab · 1</span
    >
  </header>
  <h1>Can the rooster wake a locked phone?</h1>
  <p class="intro">
    A playback experiment. Test sound, egg artwork and progress on your iPhone.
  </p>
  <audio bind:this={audio} preload="auto"></audio>
  <section class="trial-card" aria-labelledby="trial-heading">
    <img
      class="egg"
      src={artwork}
      alt="Illustrative egg artwork"
      width="88"
      height="88"
    />
    <h2 id="trial-heading">{active ? 'Test running' : 'Choose a test'}</h2>
    <fieldset disabled={busy || preparing}>
      <label for="variant">Sound</label>
      <select id="variant" bind:value={variant}
        ><option value="immediate">Immediate rooster · sound check</option
        ><option value="quiet">Silence, then rooster</option><option
          value="ticks">Soft ticks, then rooster</option
        ></select
      >
      {#if variant !== 'immediate'}<label for="duration">Rooster after</label
        ><select id="duration" bind:value={seconds}
          ><option value={60}>1 minute</option><option value={300}
            >5 minutes</option
          ></select
        >{/if}
      <details>
        <summary>Test conditions</summary>
        <label for="scenario">Scenario</label><select
          id="scenario"
          bind:value={scenario}
          >{#each scenarios as item (item)}<option value={item}
              >{{
                visible: 'Page visible',
                locked: 'Phone locked',
                'other-app': 'Another app open',
                'reopen-lock': 'Lock → reopen → lock',
                interruption: 'Call or competing audio',
                offline: 'Disconnect after loading',
                closed: 'Close and reopen',
              }[item]}</option
            >{/each}</select
        >
        <label for="route">Sound output</label><select
          id="route"
          bind:value={route}
          ><option value="speaker">Phone speaker</option><option
            value="headphones">Headphones</option
          ><option value="bluetooth">Bluetooth</option></select
        >
        <div class="checks">
          <label
            ><input type="checkbox" bind:checked={silent} /> Silent Mode</label
          ><label><input type="checkbox" bind:checked={focus} /> Focus</label
          ><label
            ><input type="checkbox" bind:checked={lowPower} /> Low Power Mode</label
          >
        </div>
      </details>
    </fieldset>
    {#if active && timing}
      <div class="countdown" aria-live="off">
        {timing.uncertain
          ? 'Time uncertain'
          : timing.remainingSeconds > 0
            ? formatTime(timing.remainingSeconds)
            : `+${formatTime(timing.overdueSeconds)}`}
      </div>
      <p class="target">Target: {clockTime(active.targetAtMs)}</p>
      <p class="status" role="status">
        {active.status === 'paused'
          ? 'Playback paused. The original deadline keeps running.'
          : active.status === 'failed'
            ? 'Playback failed. No completion sound is confirmed.'
            : active.status === 'ended'
              ? 'Playback ended. Record whether you heard the rooster.'
              : 'The countdown follows real time.'}
      </p>
      <p class="metrics">
        Audio: {mediaSeconds.toFixed(1)} s · Behind clock: {timing.driftSeconds.toFixed(
          1,
        )} s
      </p>
    {/if}
    <div class="actions">
      <button
        class="primary"
        disabled={!ready || preparing || busy}
        onclick={start}
        >{preparing
          ? 'Downloading track…'
          : busy
            ? 'Test running'
            : 'Start test'}</button
      ><button disabled={!active} onclick={stop}>Stop</button>
    </div>
    <p class="status" role="status">{message}</p>
    {#if !ready && !preparing}<button onclick={() => prepare(selectedURL)}
        >Retry download</button
      >{/if}
  </section>
  <section class="instructions" aria-labelledby="steps-heading">
    <h2 id="steps-heading">First test</h2>
    <ol>
      <li>Run “Immediate rooster” to check the phone’s media volume.</li>
      <li>
        Choose “Silence, then rooster” and 1 minute. Tap Start, then lock the
        phone.
      </li>
      <li>
        Listen until the target has passed, then reopen this page and record the
        result.
      </li>
      <li>
        Repeat with “Soft ticks, then rooster.” Try each successful locked test
        three times.
      </li>
    </ol>
    <p>
      Use a second device to time Start → rooster. Screenshots can document the
      Lock Screen artwork and progress.
    </p>
    <p class="limit">
      An event log cannot prove audibility. Calls, other audio and closing the
      app may interrupt playback. A quiet track has no audible confirmation
      before the rooster.
    </p>
  </section>
  <section aria-labelledby="results-heading">
    <h2 id="results-heading">Your observations</h2>
    <label for="device">Phone model and iOS version</label><input
      id="device"
      maxlength="100"
      placeholder="For example: iPhone 16 · iOS 26.x"
      bind:value={log.device}
      onchange={persist}
    />
    {#if latest}
      <p class="muted">
        Latest: {latest.settings.variant} · {latest.settings.seconds} s · {clockTime(
          latest.startedAtMs,
        )} · {latest.status}
      </p>
      <p class="muted">Committed target: {clockTime(latest.targetAtMs)}</p>
      {#if latest.id === recoveredID}
        <p class="status" role="status">
          Previous test recovered. Playback has not been restarted.
        </p>
      {/if}
      {#each [['heard', 'Heard the rooster?'], ['artwork', 'Egg artwork on Lock Screen?'], ['progress', 'Progress on Lock Screen?'], ['returned', 'Reopened the same test?']] as [field, label] (field)}
        <label for={`result-${field}`}>{label}</label><select
          id={`result-${field}`}
          value={latest[field as 'heard' | 'artwork' | 'progress' | 'returned']}
          onchange={(e) =>
            result(
              field as 'heard' | 'artwork' | 'progress' | 'returned',
              e.currentTarget.value,
            )}
          ><option value="unrecorded">Not recorded</option><option value="yes"
            >Yes</option
          ><option value="no">No</option></select
        >
      {/each}
      <label for="offset"
        >Seconds early (−) or late (+), if independently measured</label
      ><input
        id="offset"
        type="number"
        min="-3600"
        max="3600"
        step="0.1"
        value={latest.offsetSeconds ?? ''}
        onchange={(e) => {
          if (!latest) return;
          const value = e.currentTarget.valueAsNumber;
          latest.offsetSeconds =
            Number.isFinite(value) && Math.abs(value) <= 3600 ? value : null;
          persist();
        }}
      />
    {/if}
    <div class="actions">
      <button disabled={log.runs.length === 0} onclick={exportLog}
        >Export results</button
      ><button
        disabled={busy}
        onclick={() => {
          stop();
          player?.clear();
        }}>Clear results</button
      >
    </div>
    <p class="muted">
      Up to 20 runs stay on this browser. Export downloads a JSON file for you
      to share. Nothing is uploaded. No location or microphone access.
    </p>
    {#if warning}<p class="warning" role="status">{warning}</p>{/if}
    {#if latest}<details>
        <summary>Latest event log ({latest.events.length})</summary>
        <p class="muted">
          Events may arrive late after suspension. “Reached target” means an
          observed media position, not heard sound.
        </p>
        <ol class="event-log">
          {#each latest.events as event, index (`${index}-${revision}`)}<li>
              {clockTime(event.atMs)} · {event.name} · audio {event.mediaSeconds.toFixed(
                2,
              )} s{event.hidden ? ' · hidden' : ''}
            </li>{/each}
        </ol>
      </details>{/if}
  </section>
  <footer>
    <p>
      Experiment {__MEDIA_LAB_BUILD__.experiment} · source {__MEDIA_LAB_BUILD__.sourceCommit.slice(
        0,
        8,
      )}
    </p>
    <details>
      <summary>Audio provenance</summary>
      <p>
        The rooster is the accepted public-domain Benchill recording derivative.
        Ticks are original synthesized sounds. Each timed file contains the
        entire wait and rooster.
      </p>
      <p>Source SHA-256: <code>{tracks.sourceSha256}</code></p>
    </details>
  </footer>
</main>
