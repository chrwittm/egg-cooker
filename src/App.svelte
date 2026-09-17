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
  import {
    illustrationLabel,
    readLocale,
    textureLabel,
    translate,
    writeLocale,
  } from './i18n';
  import type { Locale, MessageKey } from './i18n';

  function initialLocale(): Locale {
    let preference: Storage | undefined;
    try {
      preference = localStorage;
    } catch {
      /* The requested browser languages remain available. */
    }
    return readLocale(preference, navigator.languages);
  }

  let locale = $state<Locale>(initialLocale());
  const t = (key: MessageKey, values: Record<string, string | number> = {}) =>
    translate(locale, key, values);

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
  let soundError = $state(false);
  let storageWarning = $state('');
  let notice = $state<MessageKey | ''>('');
  let completion = $state<MessageKey | ''>('');
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
      ? t('localPressure', {
          pressure: Math.round(shownConditions.pressureHpa),
        })
      : shownConditions.source === 'altitude'
        ? t('altitudeEstimate')
        : shownConditions.source === 'manual'
          ? t('adjustedPressure')
          : t('standardPressure'),
  );
  const conditionErrorKey = $derived.by<MessageKey | null>(() => {
    const keys: Record<string, MessageKey> = {
      'Weather unavailable': 'weatherUnavailable',
      'Elevation unavailable': 'elevationUnavailable',
      'Location imprecise': 'locationImprecise',
      'Location unavailable': 'locationUnavailable',
      'Weather expired': 'weatherExpired',
    };
    return keys[conditionsError] ?? null;
  });
  const storageWarningKey = $derived.by<MessageKey | null>(() => {
    if (storageWarning.includes('older timer')) return 'recoveryUnavailableOld';
    if (storageWarning) return 'recoveryUnavailable';
    return null;
  });
  const localizedTexture = (value: Doneness | number) =>
    textureLabel(locale, textureCategory(value));
  const formatDecimal = (value: number) =>
    new Intl.NumberFormat(locale, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value);
  const conditionDetails = $derived.by(() => {
    const values = {
      source: conditionsLabel,
      altitude: Math.round(shownConditions.altitudeM ?? 0),
      date: shownConditions.weatherTimeSeconds
        ? new Intl.DateTimeFormat(locale, {
            dateStyle: 'medium',
            timeStyle: 'short',
          }).format(new Date(shownConditions.weatherTimeSeconds * 1000))
        : '',
    };
    if (shownConditions.weatherTimeSeconds)
      return t(
        shownConditions.altitudeM === null
          ? 'conditionsWeatherNoAltitude'
          : 'conditionsWeather',
        values,
      );
    if (shownConditions.altitudeM !== null)
      return t('conditionsAltitude', values);
    return t('conditionsPressure', values);
  });

  function chooseLocale(value: Locale) {
    locale = value;
    try {
      writeLocale(localStorage, value);
    } catch {
      /* The current page still uses the selection. */
    }
  }

  $effect(() => {
    document.documentElement.lang = locale;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', t('documentDescription'));
  });

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
      notice = 'conditionsUpdated';
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
    void lookup.start(locale);
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
        void lookup.start(locale);
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
    notice = 'timeUncertain';
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
      completion = 'cookingTimeReached';
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
      notice = validTime(now) ? 'estimateUnavailable' : 'timeUncertain';
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
    notice = demo ? 'demoStarted' : 'cookingStarted';
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
    notice = wasEarly ? 'timerEnded' : '';
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
    completion = 'timerStopped';
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
      soundError = false;
      reminder = new ReminderWindow();
      void sound.enable(Boolean(current?.alert));
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
        notice = 'timerRecovered';
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
    notice = 'timerDiscarded';
    void focusHeading();
  }
  onMount(() => {
    sound = new CookSound(() => {
      soundOn = false;
      soundError = true;
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

<svelte:head><title>{t('documentTitle')}</title></svelte:head>

<main class:active={cook !== null}>
  <header>
    {#if cook}<button
        class="icon back"
        aria-label={t('back')}
        onclick={() => finish()}
        ><svg viewBox="0 0 24 24" aria-hidden="true"
          ><path d="m14 6-6 6 6 6" /></svg
        ></button
      >{:else}<span class="wordmark"
        >egg cooker<span class="brand-dot">.</span></span
      >{/if}
    <div class="utilities">
      {#if demo}<span class="demo-badge"
          >{t('demo').toLocaleUpperCase(locale)} · {rate}×</span
        >{/if}
      <button
        class="icon"
        aria-label={soundOn ? t('muteSound') : t('enableSound')}
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
        aria-label={t('about')}
        onclick={(event) => openModal('info', event.currentTarget)}
        ><svg viewBox="0 0 24 24" aria-hidden="true"
          ><circle cx="12" cy="12" r="9" /><path d="M12 11v6m0-10v.5" /></svg
        ></button
      >
      <button
        class="icon"
        aria-label={t('options')}
        aria-expanded={overflow}
        onclick={() => (overflow = !overflow)}
        ><svg viewBox="0 0 24 24" aria-hidden="true"
          ><circle cx="5" cy="12" r="1" /><circle
            cx="12"
            cy="12"
            r="1"
          /><circle cx="19" cy="12" r="1" /></svg
        ></button
      >
    </div>
  </header>
  {#if overflow}<div class="overflow">
      {#if !cook}<label
          ><input type="checkbox" bind:checked={demo} />
          {t('demo')}
          <span class="muted">{t('testingMode')}</span></label
        >{/if}
      <label class="language-choice">
        <span>{t('language')}</span>
        <select
          value={locale}
          onchange={(event) =>
            chooseLocale(event.currentTarget.value as Locale)}
        >
          <option value="en">{t('english')}</option>
          <option value="de">{t('german')}</option>
        </select>
      </label>
    </div>{/if}
  <p id="sound-help" class="sr-only">
    {t('soundHelp')}
  </p>
  {#if soundError}<p class="feedback" role="status">
      {t('soundUnavailable')}
    </p>{/if}
  {#if storageWarning}<details class="feedback">
      <summary>{storageWarningKey ? t(storageWarningKey) : ''}</summary>{t(
        'recoveryHelp',
      )}
    </details>{/if}

  {#if recoveryIssue && !modal}
    <div class="feedback">
      <p>{recoveryIssue === 'old' ? t('oldTimer') : t('cannotRecover')}</p>
      <button onclick={discard}>{t('discard')}</button>
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
          {t('configureHeading')}
        </h1>
        <div class="control-block">
          <div class="control-title">
            <label for="mass">{t('eggSize')}</label><output for="mass"
              >{massG} <small>g</small></output
            >
          </div>
          <div class="preset-rail">
            <div class="presets sizes">
              {#each [['S', 50], ['M', 60], ['L', 70], ['XL', 80]] as [name, grams] (name)}
                <button
                  aria-label={t('sizePreset', {
                    name: String(name),
                    grams: Number(grams),
                  })}
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
              aria-valuetext={t('sizeValue', {
                name: category(massG),
                grams: massG,
              })}
            />
          </div>
        </div>
        <div class="control-block">
          <div class="control-title">
            <label for="temperature">{t('startingTemperature')}</label><output
              for="temperature">{initialTemperatureC}<small> °C</small></output
            >
          </div>
          <div class="preset-rail">
            <div class="presets temperature">
              <button
                aria-pressed={initialTemperatureC >= 4 &&
                  initialTemperatureC <= 8}
                onclick={() => (initialTemperatureC = 8)}>{t('fridge')}</button
              >
              <button
                aria-pressed={initialTemperatureC >= 20 &&
                  initialTemperatureC <= 24}
                onclick={() => (initialTemperatureC = 20)}>{t('room')}</button
              >
            </div>
            <input
              id="temperature"
              type="range"
              min="2"
              max="30"
              step="1"
              bind:value={initialTemperatureC}
              aria-valuetext={t('temperatureValue', {
                temperature: initialTemperatureC,
              })}
            />
          </div>
        </div>
        <div class="control-block doneness">
          <div class="control-title">
            <label for="texture">{t('textureQuestion')}</label>
          </div>
          <div class="preset-rail">
            <div class="presets yolk-options">
              {#each ['soft', 'jammy', 'firm'] as choice (choice)}
                <button
                  aria-pressed={textureCategory(doneness) === choice}
                  onclick={() => (doneness = choice as Doneness)}
                  >{localizedTexture(choice as Doneness)}</button
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
              aria-valuetext={localizedTexture(doneness)}
              oninput={(event) =>
                (doneness = Number(event.currentTarget.value))}
            />
          </div>
        </div>
        <div class="environment">
          <span id="location-summary" class="sr-only">{t('locationHelp')}</span>
          <div class="environment-heading">
            <div class="location-summary">
              <h2 class="location-title">{t('locationData')}</h2>
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
              aria-label={autoLocation
                ? t('refreshLocation')
                : t('useLocation')}
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
                ? t('locating')
                : autoLocation
                  ? t('refresh')
                  : t('useLocation')}
            </button>
          </div>
          <div class="control-title">
            <label for="elevation">{t('elevation')}</label><output
              for="elevation"
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
            <label for="pressure">{t('airPressure')}</label><output
              for="pressure"
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
              <p class="muted" role="status">{t('findingConditions')}</p>
              <button class="text-button" onclick={stopLookup}
                >{t('cancelLookup')}</button
              >
            </div>{/if}
          {#if conditionsError}<div class="condition-error" role="status">
              <span>{conditionErrorKey ? t(conditionErrorKey) : ''}</span
              ><button
                class="text-button"
                disabled={lookupPending}
                onclick={locate}>{t('retry')}</button
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
            ? t('timeUncertain')
            : stopped
              ? t('eggTakenOut')
              : current?.alert
                ? t('ready')
                : t('cooking')}
        </h1>
        {#if !uncertain && current}<div
            class:overdue={current.alert}
            class="countdown"
            aria-live="off"
            aria-label={current.alert
              ? t('timePastTarget')
              : t('timeRemaining')}
          >
            {current.alert ? '+' : ''}{formatTime(
              current.alert ? current.overdueSeconds : current.remainingSeconds,
            )}
          </div>{/if}
        <p class="cook-summary">
          {cook.massG} g <span>·</span>
          {cook.initialTemperatureC} °C <span>·</span>
          {localizedTexture(cook.doneness)}
        </p>
        {#if uncertain}<p>
            {t('uncertainHelp')}
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
      <Egg
        frame={cook ? activeFrame : preview}
        label={illustrationLabel(locale, cook ? activeFrame : preview)}
      />
    </div>
    {#if cook}
      {#if demo && !uncertain && !stopped}<div class="demo-section">
          <span class="muted">{t('demoSpeed')}</span>
          <div class="presets demo-controls" aria-label={t('demoControls')}>
            {#each [1, 10, 20, 50] as speed (speed)}<button
                aria-pressed={rate === speed}
                onclick={() => changeRate(speed as 1 | 10 | 20 | 50)}
                >{speed}×</button
              >{/each}
            <button onclick={toEnd}>{t('toEnd')}</button>
          </div>
        </div>{/if}
      {#if uncertain}<button class="primary" onclick={() => finish()}
          >{t('cancelCooking')}</button
        >
      {:else if current?.alert}
        {#if !stopped}<button class="stop-timer" onclick={stopTimer}
            >{t('stopTimer')}</button
          >{/if}
        <button
          class="primary done"
          onclick={(event) => {
            if (event.detail <= 1) finish();
          }}>{t('cookAnother')}</button
        >{/if}
    {:else}
      <button
        class="primary start"
        disabled={!loaded || !plan || modal !== null || recoveryIssue !== null}
        onclick={start}
        aria-describedby="start-help"
      >
        <span>{demo ? t('startDemo') : t('start')}</span>
        <span class="start-details"
          ><span
            class="estimate"
            aria-label={plan
              ? t('estimatedTime', { time: formatTime(plan.durationSeconds) })
              : t('estimateUnavailable')}
            >{plan
              ? t('estimatedTimeShort', {
                  time: formatTime(plan.durationSeconds),
                })
              : t('estimateUnavailable')}</span
          >&nbsp;{#if plan}<span aria-label={t('boilingTemperature')}>
              {t('boilingAt', {
                temperature: formatDecimal(plan.boilingC),
              })}</span
            >{/if}</span
        >
      </button>
      {#if plan && plan.boilingC < 85}<p class="low-boil">
          {t('lowBoil')}
        </p>{/if}
      <span id="start-help" class="sr-only">{t('startHelp')}</span>
    {/if}
  </div>
  <p
    class:sr-only={notice !== 'conditionsUpdated' &&
      notice !== 'estimateUnavailable' &&
      notice !== 'timeUncertain'}
    class="notice"
    role="status"
  >
    {notice ? t(notice) : ''}
  </p>
  <p class="sr-only" role="alert">{completion ? t(completion) : ''}</p>
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
        "button:not(:disabled), a[href], input, select, [tabindex='0']",
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
      {t('recoveredTitle')}
    </h2>
    <p>{t('recoveredHelp')}</p>
    <div class="dialog-actions">
      <button
        onclick={() => {
          closeModal();
          void focusHeading();
        }}>{t('yes')}</button
      ><button onclick={() => finish()}>{t('done')}</button>
    </div>
  {:else if modal === 'corrupt' || modal === 'old'}<h2 id="dialog-title">
      {modal === 'old' ? t('oldTimer') : t('cannotRecover')}
    </h2>
    <p>
      {modal === 'old' ? t('oldTimerHelp') : t('corruptTimerHelp')}
    </p>
    <button onclick={discard}>{t('discard')}</button>
  {:else if modal === 'info'}<h2 id="dialog-title">{t('aboutTitle')}</h2>
    <p>
      {t('aboutUse')}
    </p>
    <p>
      {t('aboutModel')}
    </p>
    <p>
      {t('aboutScience')}
      <a href="https://doi.org/10.1038/s44172-024-00334-w">{t('eggResearch')}</a
      >.
    </p>
    <p>
      {t('aboutSafety')}
    </p>
    <p>
      {t('aboutPlatform')}
    </p>
    <p>{conditionDetails}</p>
    <p id="location-help">
      {t('aboutPrivacy')}
    </p>
    <p>
      {t('weatherElevation')}
      <a href="https://open-meteo.com/">Open-Meteo</a>,
      <a href="https://doi.org/10.5270/ESA-c5d3d65">Copernicus DEM</a>,
      <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>.
      {t('pressureConverted')}
      <a href="https://open-meteo.com/en/terms">{t('providerTerms')}</a>.
      {t('personalUse')}
      <a
        href="https://www.bigdatacloud.com/free-api/free-reverse-geocode-to-city-api"
        >BigDataCloud</a
      >
      (<a href="https://www.bigdatacloud.com/privacy-and-cookie-policy"
        >{t('privacy')}</a
      >).
    </p>
    <label class="location-preference"
      ><input
        type="checkbox"
        checked={autoLocation}
        onchange={(event) => rememberLocation(event.currentTarget.checked)}
      />
      {t('refreshAutomatically')}</label
    >
    <button onclick={closeModal}>{t('close')}</button>{/if}
  {#if modal}<label class="dialog-language language-choice">
      <span>{t('language')}</span>
      <select
        value={locale}
        onchange={(event) => chooseLocale(event.currentTarget.value as Locale)}
      >
        <option value="en">{t('english')}</option>
        <option value="de">{t('german')}</option>
      </select>
    </label>{/if}
</dialog>
