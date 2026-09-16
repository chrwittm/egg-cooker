<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { fly } from 'svelte/transition';
  import Egg from './ui/Egg.svelte';
  import {
    DEFAULTS,
    STANDARD,
    altitudeConditions,
    calculate,
    category,
    textureValue,
    textureName,
    textureCategory,
    formatTime,
    freshWeather,
    illustration,
  } from './domain/egg';
  import type { Conditions, Doneness, Illustration } from './domain/egg';
  import {
    CookingClock,
    createCook,
    sampleCook,
    validTime,
  } from './domain/cook';
  import type { Cook } from './domain/cook';
  import { EnvironmentLookup } from './infrastructure/environment';
  import { CookStorage } from './infrastructure/storage';
  import {
    CookSound,
    ReminderWindow,
    CountdownTicks,
  } from './infrastructure/sound';

  let massG = $state(60);
  let initialTemperatureC = $state(8);
  let doneness = $state<Doneness | number>('soft');
  let stopped = $state(false);
  let autoLocation = $state(false);
  let locationRevision = 0;
  let conditions = $state<Conditions>({ ...STANDARD });
  let cook = $state<Cook | null>(null);
  let current = $state<NonNullable<ReturnType<typeof sampleCook>> | null>(null);
  let activeFrame = $state<Illustration>(
    illustration(0, calculate(DEFAULTS, 1013.25).times),
  );
  let demo = $state(true);
  let rate = $state<1 | 10 | 20 | 50>(1);
  let loaded = $state(false);
  let uncertain = $state(false);
  let reducedMotion = $state(false);
  let lookupPending = $state(false);
  let lookupProgress = $state(false);
  let lookupProgressTimer: ReturnType<typeof setTimeout> | undefined;
  let conditionsError = $state('');
  let place = $state('');
  let overflow = $state(false);
  let soundOn = $state(true);
  let soundError = $state('');
  let storageWarning = $state('');
  let notice = $state('');
  let completion = $state('');
  let recoveryIssue = $state<'corrupt' | 'old' | null>(null);
  let modal = $state<'recovery' | 'corrupt' | 'old' | 'info' | null>(null);
  let dialog: HTMLDialogElement;
  let returnFocus: HTMLElement | null = null;
  let heading = $state<HTMLHeadingElement>();
  let clock: CookingClock | null = null;
  let lastNow = 0;
  let lastReal = 0;
  let sound: CookSound;
  let lookup: EnvironmentLookup;
  const storage = new CookStorage();
  let reminder = new ReminderWindow();
  let countdownTicks = new CountdownTicks();
  let animationId = 0;
  let runTimes = calculate(DEFAULTS, 1013.25).times;
  const plan = $derived.by(() => {
    try {
      return calculate(
        { massG, initialTemperatureC, doneness },
        conditions.pressureHpa,
      );
    } catch {
      return null;
    }
  });
  const preview = $derived(
    plan
      ? illustration(plan.durationSeconds, plan.times)
      : illustration(0, runTimes),
  );
  const shownConditions = $derived(cook ?? conditions);
  const conditionsLabel = $derived(
    shownConditions.source === 'weather'
      ? `Local · ${Math.round(shownConditions.pressureHpa)} hPa`
      : shownConditions.source === 'altitude'
        ? 'Altitude estimate'
        : shownConditions.source === 'manual'
          ? 'Adjusted pressure'
          : 'Standard · 1013 hPa',
  );

  let eggElement: HTMLDivElement;
  let eggAnimation: Animation | undefined;
  const eggWidth = $derived(
    `calc(${cook ? '238px' : 'var(--preview-size)'} * ${Math.cbrt((cook?.massG ?? massG) / 60)})`,
  );
  async function moveEgg(from: DOMRect) {
    await tick();
    window.scrollTo(0, 0);
    if (reducedMotion || !eggElement) return;
    eggAnimation?.cancel();
    const to = eggElement.getBoundingClientRect();
    eggAnimation = eggElement.animate(
      [
        {
          transform: `translate(${from.x - to.x}px, ${from.y - to.y}px) scale(${from.width / to.width})`,
        },
        { transform: 'translate(0, 0) scale(1)' },
      ],
      { duration: 1000, easing: 'cubic-bezier(.45,0,.2,1)' },
    );
  }
  function setElevation(value: number) {
    stopLookup();
    conditions = altitudeConditions(value);
    place = '';
    conditionsError = '';
  }
  function setPressure(value: number) {
    stopLookup();
    place = '';
    conditions = {
      source: 'manual',
      altitudeM: conditions.altitudeM ?? 0,
      pressureHpa: value,
      weatherTimeSeconds: null,
    };
    conditionsError = '';
  }
  async function focusHeading() {
    await tick();
    heading?.focus({ preventScroll: true });
  }
  async function openModal(value: typeof modal, trigger?: HTMLElement) {
    returnFocus =
      trigger ??
      (document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null);
    modal = value;
    await tick();
    if (modal === value && !dialog.open) {
      dialog.showModal();
      dialog.querySelector('button')?.focus();
    }
  }
  function closeModal() {
    dialog?.close();
    modal = null;
    returnFocus?.focus({ preventScroll: true });
    returnFocus = null;
  }
  function expireConditions(now: number) {
    if (
      !cook &&
      conditions.source === 'weather' &&
      !freshWeather(conditions.weatherTimeSeconds, now)
    ) {
      conditions = altitudeConditions(conditions.altitudeM!);
      conditionsError = 'Weather expired';
      notice = 'Conditions updated';
      return true;
    }
    return false;
  }
  function stopLookup() {
    lookup?.cancel();
    lookupPending = false;
    clearTimeout(lookupProgressTimer);
    lookupProgress = false;
    locationRevision++;
  }
  function rememberLocation(value: boolean) {
    autoLocation = value;
    try {
      if (value) localStorage.setItem('egg-cooker.auto-location.v1', 'true');
      else localStorage.removeItem('egg-cooker.auto-location.v1');
    } catch {
      /* Optional preference; manual lookup still works. */
    }
    if (!value) stopLookup();
  }
  function locate() {
    if (lookupPending) return;
    locationRevision++;
    rememberLocation(true);
    void lookup.start();
  }
  async function refreshPermittedLocation() {
    const revision = locationRevision;
    if (!autoLocation || cook || document.hidden) return;
    try {
      const permission = await navigator.permissions.query({
        name: 'geolocation',
      });
      if (
        permission.state === 'granted' &&
        revision === locationRevision &&
        !cook &&
        !document.hidden &&
        autoLocation
      )
        void lookup.start();
    } catch {
      /* Unsupported permission query: keep the one-tap action. */
    }
  }
  function timeUncertain() {
    uncertain = true;
    current = null;
    sound.stop();
    storageWarning = storage.remove();
    closeModal();
    notice = 'Time uncertain';
    void focusHeading();
  }
  function update(realNow: number) {
    if (!cook || uncertain || stopped || !clock) return;
    if (!validTime(realNow) || realNow < lastReal) {
      timeUncertain();
      return;
    }
    let now = clock.now(realNow);
    if (demo && !current?.alert && now >= cook.targetAtMs) {
      now = clock.reachTarget(cook.targetAtMs, realNow);
      rate = 1;
    }
    const next = sampleCook(cook, now, lastNow);
    if (!next) {
      timeUncertain();
      return;
    }
    lastNow = now;
    lastReal = realNow;
    const reached = next.alert && !current?.alert;
    current = next;
    activeFrame = illustration(next.elapsedMs / 1000, runTimes, reducedMotion);
    if (reached) {
      if (modal) closeModal();
      completion = 'Cooking time reached. Take the egg out.';
      if (!modal) void focusHeading();
    }
    if (
      countdownTicks.due(
        Math.ceil((cook.targetAtMs - now) / 1000),
        realNow,
        !document.hidden,
        soundOn,
      )
    )
      sound.tick();
    if (reminder.due(realNow, !document.hidden, next.alert, soundOn)) {
      sound.stop();
      sound.play();
    }
  }
  function render() {
    update(Date.now());
    if (cook && !uncertain && !stopped && !document.hidden)
      animationId = requestAnimationFrame(render);
  }
  function resumeRendering() {
    cancelAnimationFrame(animationId);
    update(Date.now());
    if (cook && !uncertain && !stopped && !document.hidden)
      animationId = requestAnimationFrame(render);
  }
  function start(event: MouseEvent) {
    if (!loaded || cook || !plan || modal || recoveryIssue || event.detail > 1)
      return;
    const now = Date.now();
    if (expireConditions(now)) return;
    let committed: Cook;
    try {
      committed = createCook(
        { massG, initialTemperatureC, doneness },
        conditions,
        now,
      );
    } catch {
      notice = validTime(now) ? 'Estimate unavailable' : 'Time uncertain';
      return;
    }
    // Commit before storage, sound, cancellation or visual effects.
    const previousEgg = eggElement.getBoundingClientRect();
    cook = committed;
    stopped = false;
    clock = new CookingClock(now, demo);
    rate = clock.rate;
    lastNow = now;
    lastReal = now;
    current = null;
    uncertain = false;
    runTimes = calculate(cook, cook.pressureHpa).times;
    reminder = new ReminderWindow();
    countdownTicks = new CountdownTicks();
    completion = '';
    notice = demo ? 'Demo started' : 'Cooking started';
    stopLookup();
    overflow = false;
    if (!demo) storageWarning = storage.save(cook);
    if (soundOn) void sound.enable();
    resumeRendering();
    void moveEgg(previousEgg);
    void focusHeading();
  }
  function finish() {
    const wasEarly = cook && !current?.alert && !stopped;
    const previousEgg = eggElement.getBoundingClientRect();
    sound.stop();
    cancelAnimationFrame(animationId);
    stopLookup();
    if (!demo) storageWarning = storage.remove();
    closeModal();
    cook = null;
    stopped = false;
    current = null;
    clock = null;
    uncertain = false;
    rate = 1;
    completion = '';
    notice = wasEarly
      ? 'Cooking timer ended. Remove the egg from the heat.'
      : '';
    void moveEgg(previousEgg);
    expireConditions(Date.now());
    void focusHeading();
  }
  function stopTimer() {
    update(Date.now());
    if (!cook || !current?.alert || stopped) return;
    stopped = true;
    sound.stop();
    cancelAnimationFrame(animationId);
    reminder = new ReminderWindow(true);
    if (!demo) storageWarning = storage.remove();
    completion = 'Timer stopped. Egg taken out.';
    void focusHeading();
  }
  function changeRate(value: 1 | 10 | 20 | 50) {
    const now = Date.now();
    update(now);
    if (!uncertain && !stopped && demo) {
      clock?.setRate(value, now);
      rate = value;
      update(now);
    }
  }
  function toEnd() {
    const now = Date.now();
    update(now);
    if (!uncertain && !stopped && cook && demo) {
      clock?.toEnd(cook.targetAtMs, now);
      update(now);
    }
  }
  function toggleSound() {
    if (soundOn) {
      soundOn = false;
      sound.stop();
    } else {
      soundOn = true;
      soundError = '';
      void sound.enable();
    }
  }
  function save() {
    if (cook && !demo && !uncertain && !stopped) {
      update(Date.now());
      if (!uncertain && cook) {
        cook = { ...cook, savedAtMs: lastNow };
        storageWarning = storage.save(cook);
      }
    }
  }
  function restore() {
    cancelAnimationFrame(animationId);
    stopLookup();
    sound.stop();
    closeModal();
    const now = Date.now();
    const { recovery, warning } = storage.read(now);
    storageWarning = warning;
    cook = null;
    stopped = false;
    current = null;
    uncertain = false;
    recoveryIssue = null;
    clock = null;
    demo = true;
    rate = 1;
    overflow = false;
    conditionsError = '';
    notice = '';
    completion = '';
    if (recovery.kind === 'valid' || recovery.kind === 'uncertain') {
      demo = false;
      cook = recovery.cook;
      massG = cook.massG;
      initialTemperatureC = cook.initialTemperatureC;
      doneness = cook.doneness;
      conditions = {
        pressureHpa: cook.pressureHpa,
        source: cook.source,
        altitudeM: cook.altitudeM,
        weatherTimeSeconds: cook.weatherTimeSeconds,
      };
      soundOn = false;
      reminder = new ReminderWindow(now >= cook.targetAtMs);
      clock = new CookingClock(cook.startAtMs, false);
      lastNow = cook.savedAtMs;
      lastReal = cook.savedAtMs;
      runTimes = calculate(cook, cook.pressureHpa).times;
      activeFrame = illustration(
        Math.max(0, cook.savedAtMs - cook.startAtMs) / 1000,
        runTimes,
        reducedMotion,
      );
      if (recovery.kind === 'uncertain') timeUncertain();
      else {
        resumeRendering();
        notice = 'Timer recovered';
        void openModal('recovery');
      }
    } else {
      massG = DEFAULTS.massG;
      initialTemperatureC = DEFAULTS.initialTemperatureC;
      doneness = DEFAULTS.doneness;
      conditions = { ...STANDARD };
      if (recovery.kind !== 'missing') {
        recoveryIssue = recovery.kind;
        soundOn = false;
        void openModal(recovery.kind);
      }
    }
    loaded = true;
  }
  function discard() {
    recoveryIssue = null;
    storageWarning = storage.remove();
    closeModal();
    notice = 'Timer discarded';
    void focusHeading();
  }
  onMount(() => {
    sound = new CookSound(() => {
      soundOn = false;
      soundError = 'Sound unavailable';
    });
    lookup = new EnvironmentLookup(
      (update) => {
        if (!cook) {
          if (update.placeOnly) {
            // Naming must not restore weather that expired after the lookup.
            if (
              conditions.source === 'weather' ||
              conditions.source === 'altitude'
            )
              place = update.place ?? '';
            return;
          }
          if (update.pending && !lookupPending) {
            lookupProgressTimer = setTimeout(() => {
              lookupProgress = true;
            }, 800);
          }
          lookupPending = update.pending;
          if (!update.pending) {
            clearTimeout(lookupProgressTimer);
            lookupProgress = false;
            conditions = update.conditions;
            conditionsError = update.error;
            place = update.place ?? '';
          }
        }
      },
      Date.now,
      navigator.geolocation,
      fetch,
      true,
    );
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotion = media.matches;
    const motion = () => {
      reducedMotion = media.matches;
      update(Date.now());
    };
    media.addEventListener('change', motion);
    restore();
    try {
      autoLocation =
        localStorage.getItem('egg-cooker.auto-location.v1') === 'true';
    } catch {
      /* Optional preference. */
    }
    void refreshPermittedLocation();
    const visibility = () => {
      if (document.hidden) {
        save();
        cancelAnimationFrame(animationId);
        sound.stop();
      } else {
        expireConditions(Date.now());
        resumeRendering();
      }
    };
    const hide = () => {
      save();
      cancelAnimationFrame(animationId);
      sound.stop();
      stopLookup();
    };
    const show = (event: PageTransitionEvent) => {
      if (event.persisted) {
        restore();
        void refreshPermittedLocation();
      }
    };
    const focus = () => {
      expireConditions(Date.now());
      resumeRendering();
    };
    const keys = (event: KeyboardEvent) => {
      if (event.repeat && ['Enter', ' '].includes(event.key))
        event.preventDefault();
    };
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('pagehide', hide);
    window.addEventListener('pageshow', show);
    window.addEventListener('focus', focus);
    window.addEventListener('keydown', keys);
    const freshness = setInterval(() => expireConditions(Date.now()), 60000);
    return () => {
      cancelAnimationFrame(animationId);
      clearInterval(freshness);
      stopLookup();
      sound.close();
      media.removeEventListener('change', motion);
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('pagehide', hide);
      window.removeEventListener('pageshow', show);
      window.removeEventListener('focus', focus);
      window.removeEventListener('keydown', keys);
    };
  });
</script>

<svelte:head
  ><title>Egg Cooker</title><meta
    name="description"
    content="Set your egg. Watch it cook. A simple, science-informed egg timer."
  /></svelte:head
>

<main class:active={cook !== null}>
  <header>
    {#if cook}<button
        class="icon back"
        aria-label="Back"
        onclick={() => finish()}
        ><svg viewBox="0 0 24 24" aria-hidden="true"
          ><path d="m14 6-6 6 6 6" /></svg
        ></button
      >{:else}<span class="wordmark"
        >egg cooker<span class="brand-dot">.</span></span
      >{/if}
    <div class="utilities">
      {#if demo}<span class="demo-badge">DEMO · {rate}×</span>{/if}
      <button
        class="icon"
        aria-label={soundOn ? 'Mute sound' : 'Enable and test sound'}
        aria-pressed={soundOn}
        aria-describedby="sound-help"
        onclick={toggleSound}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"
          ><path
            d="M6 9a6 6 0 0 1 12 0c0 7 3 7 3 8H3c0-1 3-1 3-8Zm4 11h4"
          />{#if !soundOn}<path d="m3 3 18 18" />{/if}</svg
        >
      </button>
      <button
        class="icon info"
        aria-label="About this timer"
        onclick={(event) => openModal('info', event.currentTarget)}
        ><svg viewBox="0 0 24 24" aria-hidden="true"
          ><circle cx="12" cy="12" r="9" /><path d="M12 11v6m0-10v.5" /></svg
        ></button
      >
      {#if !cook}<button
          class="icon"
          aria-label="Options"
          aria-expanded={overflow}
          onclick={() => (overflow = !overflow)}
          ><svg viewBox="0 0 24 24" aria-hidden="true"
            ><circle cx="5" cy="12" r="1" /><circle
              cx="12"
              cy="12"
              r="1"
            /><circle cx="19" cy="12" r="1" /></svg
          ></button
        >{/if}
    </div>
  </header>
  {#if overflow && !cook}<div class="overflow">
      <label
        ><input type="checkbox" bind:checked={demo} /> Demo
        <span class="muted">Testing mode</span></label
      >
    </div>{/if}
  <p id="sound-help" class="sr-only">
    Keep this page visible and your device awake for the best chance of hearing
    the alarm. Suspended alarms are not guaranteed.
  </p>
  {#if soundError}<p class="feedback" role="status">{soundError}</p>{/if}
  {#if storageWarning}<details class="feedback">
      <summary>{storageWarning}</summary>Same-tab recovery is unavailable. Keep
      this page open; reloading may lose this timer.
    </details>{/if}

  {#if recoveryIssue && !modal}
    <div class="feedback">
      <p>{recoveryIssue === 'old' ? 'Old timer' : 'Cannot recover timer'}</p>
      <button onclick={discard}>Discard</button>
    </div>
  {/if}
  <div class="journey">
    {#if !cook}
      <section
        class="configure"
        in:fly={{
          y: reducedMotion ? 0 : -320,
          duration: reducedMotion ? 0 : 1000,
        }}
        out:fly={{
          y: reducedMotion ? 0 : -600,
          duration: reducedMotion ? 0 : 900,
        }}
      >
        <h1 class="sr-only" bind:this={heading} tabindex="-1">
          Configure your egg
        </h1>
        <div class="control-block">
          <div class="control-title">
            <label for="mass">Egg size</label><output for="mass"
              >{massG} <small>g</small></output
            >
          </div>
          <div class="preset-rail">
            <div class="presets sizes">
              {#each [['S', 50], ['M', 60], ['L', 70], ['XL', 80]] as [name, grams] (name)}
                <button
                  aria-label={`${name} · ${grams} grams`}
                  aria-pressed={category(massG) === name}
                  onclick={() => (massG = Number(grams))}>{name}</button
                >
              {/each}
            </div>
            <input
              id="mass"
              type="range"
              min="40"
              max="90"
              step="1"
              bind:value={massG}
              aria-valuetext={`${category(massG)}, ${massG} grams`}
            />
          </div>
        </div>
        <div class="control-block">
          <div class="control-title">
            <label for="temperature">Starting temperature</label><output
              for="temperature">{initialTemperatureC}<small> °C</small></output
            >
          </div>
          <div class="preset-rail">
            <div class="presets temperature">
              <button
                aria-pressed={initialTemperatureC >= 4 &&
                  initialTemperatureC <= 8}
                onclick={() => (initialTemperatureC = 8)}>Fridge</button
              >
              <button
                aria-pressed={initialTemperatureC >= 20 &&
                  initialTemperatureC <= 24}
                onclick={() => (initialTemperatureC = 20)}>Room</button
              >
            </div>
            <input
              id="temperature"
              type="range"
              min="2"
              max="30"
              step="1"
              bind:value={initialTemperatureC}
              aria-valuetext={`${initialTemperatureC} degrees Celsius`}
            />
          </div>
        </div>
        <div class="control-block doneness">
          <div class="control-title">
            <label for="texture">How would you like your egg?</label>
          </div>
          <div class="preset-rail">
            <div class="presets yolk-options">
              {#each ['soft', 'jammy', 'firm'] as choice (choice)}
                <button
                  aria-pressed={textureCategory(doneness) === choice}
                  onclick={() => (doneness = choice as Doneness)}
                  >{textureName(choice as Doneness)}</button
                >
              {/each}
            </div>
            <input
              id="texture"
              type="range"
              min="0.75"
              max="2.25"
              step="0.01"
              value={textureValue(doneness)}
              aria-valuetext={textureName(doneness)}
              oninput={(event) =>
                (doneness = Number(event.currentTarget.value))}
            />
          </div>
        </div>
        <div class="environment">
          <span id="location-summary" class="sr-only"
            >Uses Open-Meteo and BigDataCloud; remembers automatic refresh.
            Details in About this timer.</span
          >
          <div class="environment-heading">
            <div class="location-summary">
              <h2 class="location-title">Location data</h2>
              <span class="conditions-label"
                >{#if place}<span class="place" title={place}>{place}</span>
                  <span class="place-pressure"
                    >· {Math.round(conditions.pressureHpa)} hPa</span
                  >
                {:else}{conditionsLabel}{/if}</span
              >
            </div>
            <button
              class="location-button"
              aria-label={autoLocation ? 'Refresh location' : 'Use location'}
              aria-describedby="location-summary"
              aria-disabled={lookupPending}
              onclick={locate}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true"
                ><path
                  d="M20 7v5h-5M4 17v-5h5M6.1 7a7 7 0 0 1 11.6-1L20 9M4 15l2.3 3A7 7 0 0 0 18 17"
                /></svg
              >
              {lookupProgress
                ? 'Locating…'
                : autoLocation
                  ? 'Refresh'
                  : 'Use location'}
            </button>
          </div>
          <div class="control-title">
            <label for="elevation">Elevation</label><output for="elevation"
              >{Math.round(conditions.altitudeM ?? 0)} <small>m</small></output
            >
          </div>
          <input
            id="elevation"
            type="range"
            min="-500"
            max="8850"
            step="1"
            value={conditions.altitudeM ?? 0}
            oninput={(event) => setElevation(Number(event.currentTarget.value))}
          />

          <div class="control-title pressure-title">
            <label for="pressure">Air pressure</label><output for="pressure"
              >{Math.round(conditions.pressureHpa)} <small>hPa</small></output
            >
          </div>
          <input
            id="pressure"
            type="range"
            min="300"
            max="1100"
            step="1"
            value={conditions.pressureHpa}
            oninput={(event) => setPressure(Number(event.currentTarget.value))}
          />
          {#if lookupProgress}<div class="location-row">
              <p class="muted" role="status">Finding local conditions…</p>
              <button class="text-button" onclick={stopLookup}
                >Cancel lookup</button
              >
            </div>{/if}
          {#if conditionsError}<div class="condition-error" role="status">
              <span>{conditionsError}</span><button
                class="text-button"
                disabled={lookupPending}
                onclick={locate}>Retry</button
              >
            </div>{/if}
        </div>
      </section>
    {:else}
      <section
        class="timer-panel"
        in:fly={{
          y: reducedMotion ? 0 : 100,
          duration: reducedMotion ? 0 : 1000,
        }}
        out:fly={{
          y: reducedMotion ? 0 : -160,
          duration: reducedMotion ? 0 : 900,
        }}
      >
        <h1
          bind:this={heading}
          tabindex="-1"
          class:ready={current?.alert}
          class="cook-heading"
        >
          {uncertain
            ? 'Time uncertain'
            : stopped
              ? 'Egg taken out'
              : current?.alert
                ? 'Ready'
                : 'Cooking'}
        </h1>
        {#if !uncertain && current}<div
            class:overdue={current.alert}
            class="countdown"
            aria-live="off"
            aria-label={current.alert ? 'Time past target' : 'Time remaining'}
          >
            {current.alert ? '+' : ''}{formatTime(
              current.alert ? current.overdueSeconds : current.remainingSeconds,
            )}
          </div>{/if}
        <p class="cook-summary">
          {cook.massG} g <span>·</span>
          {cook.initialTemperatureC} °C <span>·</span>
          {textureName(cook.doneness)}
        </p>
        {#if uncertain}<p>
            The device clock moved backwards or became invalid. Check the egg
            and cancel this timer.
          </p>{/if}
      </section>
    {/if}
    <div
      class="egg-stage"
      class:active-egg={cook !== null}
      class:preview-egg={!cook}
      bind:this={eggElement}
      style:width={eggWidth}
    >
      <Egg frame={cook ? activeFrame : preview} />
    </div>
    {#if cook}
      {#if demo && !uncertain && !stopped}<div class="demo-section">
          <span class="muted">Demo speed</span>
          <div class="presets demo-controls" aria-label="Demo controls">
            {#each [1, 10, 20, 50] as speed (speed)}<button
                aria-pressed={rate === speed}
                onclick={() => changeRate(speed as 1 | 10 | 20 | 50)}
                >{speed}×</button
              >{/each}
            <button onclick={toEnd}>To end</button>
          </div>
        </div>{/if}
      {#if uncertain}<button class="primary" onclick={() => finish()}
          >Cancel cooking</button
        >
      {:else if current?.alert}
        {#if !stopped}<button class="stop-timer" onclick={stopTimer}
            >Stop timer</button
          >{/if}
        <button
          class="primary done"
          onclick={(event) => {
            if (event.detail <= 1) finish();
          }}>Cook another egg</button
        >{/if}
    {:else}
      <button
        class="primary start"
        disabled={!loaded || !plan || modal !== null || recoveryIssue !== null}
        onclick={start}
        aria-describedby="start-help"
      >
        <span>{demo ? 'Start demo' : 'Start'}</span>
        <span class="start-details"
          ><span
            class="estimate"
            aria-label={plan
              ? `Estimated cooking time ${formatTime(plan.durationSeconds)}`
              : 'Estimate unavailable'}
            >{plan
              ? `≈ ${formatTime(plan.durationSeconds)}`
              : 'Estimate unavailable'}</span
          >&nbsp;{#if plan}<span aria-label="Water boiling temperature">
              at {plan.boilingC.toFixed(1)} °C</span
            >{/if}</span
        >
      </button>
      {#if plan && plan.boilingC < 85}<p class="low-boil">
          Low boiling temperature · texture estimate is exploratory.
        </p>{/if}
      <span id="start-help" class="sr-only"
        >Start when the egg is already in boiling water or saturated steam.</span
      >
    {/if}
  </div>
  <p
    class:sr-only={notice !== 'Conditions updated' &&
      notice !== 'Estimate unavailable' &&
      notice !== 'Time uncertain'}
    class="notice"
    role="status"
  >
    {notice}
  </p>
  <p class="sr-only" role="alert">{completion}</p>
</main>

<dialog
  bind:this={dialog}
  oncancel={(event) => {
    event.preventDefault();
    closeModal();
  }}
  onkeydown={(event) => {
    if (event.key !== 'Tab') return;
    const controls = Array.from(
      dialog.querySelectorAll<HTMLElement>(
        "button:not(:disabled), a[href], input, [tabindex='0']",
      ),
    );
    const first = controls[0];
    const last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }}
  aria-labelledby="dialog-title"
>
  {#if modal === 'recovery'}<h2 id="dialog-title">
      Recovered · Still cooking?
    </h2>
    <p>Your timer continues. Sound is off until you enable it.</p>
    <div class="dialog-actions">
      <button
        onclick={() => {
          closeModal();
          void focusHeading();
        }}>Yes</button
      ><button onclick={() => finish()}>Done</button>
    </div>
  {:else if modal === 'corrupt' || modal === 'old'}<h2 id="dialog-title">
      {modal === 'old' ? 'Old timer' : 'Cannot recover timer'}
    </h2>
    <p>
      {modal === 'old'
        ? 'This timer is at least 24 hours old.'
        : 'The saved timer is invalid or uses an unknown model.'}
    </p>
    <button onclick={discard}>Discard</button>
  {:else if modal === 'info'}<h2 id="dialog-title">A little science.</h2>
    <p>
      Start with the egg already in boiling water or saturated steam in an
      ordinary covered, unpressurized pot. Keep the heat steady; remove the egg
      at Ready.
    </p>
    <p>
      Times are estimates from the Williams heating model, adjusted for
      pressure. Texture is a continuous, provisional mapping: Soft 1×, Jammy
      1.5× and Firm 2× the Soft heating time. The range starts at 0.75× and
      extends to 2.25× without claiming a firmer texture. Steam and immersion
      share an approximation awaiting kitchen validation.
    </p>
    <p>
      Illustrated progress, not a measurement inside the egg. Elevation
      estimates local air pressure; changing air pressure fine-tunes that value
      directly. Location fills elevation and weather pressure together.
      Elevation changes reset pressure to the standard-atmosphere estimate. The
      temperature on Start is the water’s boiling temperature, not the egg’s
      internal temperature. Near Everest it is about 70 °C. Eggs can still cook,
      but ordinary firm whites and yolks are not assured. Different proteins set
      at different temperatures and rates; there is no single reliable altitude
      cutoff for each texture. Below 85 °C we flag the estimate as exploratory,
      not impossible.
      <a href="https://doi.org/10.1038/s44172-024-00334-w"
        >Egg heating research</a
      >.
    </p>
    <p>
      Soft and Jammy are not fully cooked. Firm is no pasteurization guarantee.
      Doneness is not food-safety assurance.
    </p>
    <p>
      Keep the page visible and the device awake to hear the alarm. Browser
      suspension can prevent sound. Reload recovery is best-effort in this tab;
      offline reopening is not guaranteed.
    </p>
    <p>
      {conditionsLabel}{shownConditions.altitudeM !== null
        ? ` · ${Math.round(shownConditions.altitudeM)} m`
        : ''}{shownConditions.weatherTimeSeconds
        ? ` · ${new Date(shownConditions.weatherTimeSeconds * 1000).toLocaleString()}`
        : ''}
    </p>
    <p id="location-help">
      Location is optional. Use location immediately requests access.
      Coordinates rounded to three decimals are sent to Open-Meteo for
      conditions and BigDataCloud for a city/locality label, along with your IP
      address. Open-Meteo may retain request logs for up to 90 days.
      BigDataCloud uses anonymous coordinate/IP pairings to improve its location
      service. Coordinates are never saved by this app. Only the active real
      timer is stored in this tab; stopping, finishing and going back delete it.
      A separate automatic-location preference is saved on this browser. Repeat
      visits refresh only when the browser already grants location permission.
      Safari controls how long its permission lasts. The city is approximate,
      optional and never saved; a missing name does not affect the timer.
    </p>
    <p>
      Weather and elevation: <a href="https://open-meteo.com/">Open-Meteo</a>,
      <a href="https://doi.org/10.5270/ESA-c5d3d65">Copernicus DEM</a>,
      <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>.
      Pressure is converted locally into boiling temperature and cooking time.
      <a href="https://open-meteo.com/en/terms">Provider terms & privacy</a>.
      Personal, non-commercial use. City/locality:
      <a
        href="https://www.bigdatacloud.com/free-api/free-reverse-geocode-to-city-api"
        >BigDataCloud</a
      >
      (<a href="https://www.bigdatacloud.com/privacy-and-cookie-policy"
        >privacy</a
      >).
    </p>
    <label class="location-preference"
      ><input
        type="checkbox"
        checked={autoLocation}
        onchange={(event) => rememberLocation(event.currentTarget.checked)}
      /> Refresh location automatically on visits</label
    >
    <button onclick={closeModal}>Close</button>{/if}
</dialog>
