import type { Doneness, Illustration } from './domain/egg';

export const LANGUAGE_KEY = 'egg-cooker.language.v1';
export const locales = ['en', 'de'] as const;
export type Locale = (typeof locales)[number];

const en = {
  documentTitle: 'Egg Cooker',
  documentDescription:
    'Set your egg. Watch it cook. A simple, science-informed egg timer.',
  back: 'Back',
  muteSound: 'Mute sound',
  enableSound: 'Enable and test sound',
  about: 'About this timer',
  options: 'Options',
  demo: 'Demo',
  testingMode: 'Testing mode',
  language: 'Language / Sprache',
  english: 'English',
  german: 'Deutsch',
  soundHelp:
    'Keep this page visible and your device awake for the best chance of hearing the alarm. Suspended alarms are not guaranteed.',
  soundUnavailable: 'Sound unavailable',
  recoveryUnavailable: 'Recovery unavailable',
  recoveryUnavailableOld:
    'Recovery unavailable. An older timer may reappear after reload.',
  recoveryHelp:
    'Same-tab recovery is unavailable. Keep this page open; reloading may lose this timer.',
  oldTimer: 'Old timer',
  cannotRecover: 'Cannot recover timer',
  discard: 'Discard',
  configureHeading: 'Configure your egg',
  eggSize: 'Egg size',
  sizePreset: '{name} · {grams} grams',
  sizeValue: '{name}, {grams} grams',
  startingTemperature: 'Starting temperature',
  fridge: 'Fridge',
  room: 'Room',
  temperatureValue: '{temperature} degrees Celsius',
  textureQuestion: 'How would you like your egg?',
  soft: 'Soft',
  jammy: 'Jammy',
  firm: 'Firm',
  locationHelp:
    'Uses Open-Meteo and BigDataCloud; remembers automatic refresh. Details in About this timer.',
  locationData: 'Location data',
  localPressure: 'Local · {pressure} hPa',
  altitudeEstimate: 'Altitude estimate',
  adjustedPressure: 'Adjusted pressure',
  standardPressure: 'Standard · 1013 hPa',
  refreshLocation: 'Refresh location',
  useLocation: 'Use location',
  locating: 'Locating…',
  refresh: 'Refresh',
  elevation: 'Elevation',
  airPressure: 'Air pressure',
  findingConditions: 'Finding local conditions…',
  cancelLookup: 'Cancel lookup',
  retry: 'Retry',
  weatherExpired: 'Weather expired',
  weatherUnavailable: 'Weather unavailable',
  elevationUnavailable: 'Elevation unavailable',
  locationImprecise: 'Location imprecise',
  locationUnavailable: 'Location unavailable',
  conditionsUpdated: 'Conditions updated',
  timeUncertain: 'Time uncertain',
  estimateUnavailable: 'Estimate unavailable',
  demoStarted: 'Demo started',
  cookingStarted: 'Cooking started',
  cookingTimeReached: 'Cooking time reached. Take the egg out.',
  timerEnded: 'Cooking timer ended. Remove the egg from the heat.',
  timerStopped: 'Timer stopped. Egg taken out.',
  timerRecovered: 'Timer recovered',
  timerDiscarded: 'Timer discarded',
  eggTakenOut: 'Egg taken out',
  ready: 'Ready',
  cooking: 'Cooking',
  timePastTarget: 'Time past target',
  timeRemaining: 'Time remaining',
  uncertainHelp:
    'The device clock moved backwards or became invalid. Check the egg and cancel this timer.',
  demoSpeed: 'Demo speed',
  demoControls: 'Demo controls',
  toEnd: 'To end',
  cancelCooking: 'Cancel cooking',
  stopTimer: 'Stop timer',
  cookAnother: 'Cook another egg',
  startDemo: 'Start demo',
  start: 'Start',
  estimatedTime: 'Estimated cooking time {time}',
  estimatedTimeShort: '≈ {time}',
  boilingTemperature: 'Water boiling temperature',
  boilingAt: 'at {temperature} °C',
  lowBoil: 'Low boiling temperature · texture estimate is exploratory.',
  startHelp:
    'Start when the egg is already in boiling water or saturated steam.',
  recoveredTitle: 'Recovered · Still cooking?',
  recoveredHelp: 'Your timer continues. Sound is off until you enable it.',
  yes: 'Yes',
  done: 'Done',
  oldTimerHelp: 'This timer is at least 24 hours old.',
  corruptTimerHelp: 'The saved timer is invalid or uses an unknown model.',
  aboutTitle: 'A little science.',
  aboutUse:
    'Start with the egg already in boiling water or saturated steam in an ordinary covered, unpressurized pot. Keep the heat steady; remove the egg at Ready.',
  aboutModel:
    'Times are estimates from the Williams heating model, adjusted for pressure. Texture is a continuous, provisional mapping: Soft 1×, Jammy 1.5× and Firm 2× the Soft heating time. The range starts at 0.75× and extends to 2.25× without claiming a firmer texture. Steam and immersion share an approximation awaiting kitchen validation.',
  aboutScience:
    'Illustrated progress, not a measurement inside the egg. Elevation estimates local air pressure; changing air pressure fine-tunes that value directly. Location fills elevation and weather pressure together. Elevation changes reset pressure to the standard-atmosphere estimate. The temperature on Start is the water’s boiling temperature, not the egg’s internal temperature. Near Everest it is about 70 °C. Eggs can still cook, but ordinary firm whites and yolks are not assured. Different proteins set at different temperatures and rates; there is no single reliable altitude cutoff for each texture. Below 85 °C we flag the estimate as exploratory, not impossible.',
  eggResearch: 'Egg heating research',
  aboutSafety:
    'Soft and Jammy are not fully cooked. Firm is no pasteurization guarantee. Doneness is not food-safety assurance.',
  aboutPlatform:
    'Keep the page visible and the device awake to hear the alarm. Browser suspension can prevent sound. Reload recovery is best-effort in this tab; offline reopening is not guaranteed. A Home Screen icon does not make this an always-running native timer.',
  conditionsPressure: '{source}',
  conditionsAltitude: '{source} · {altitude} m',
  conditionsWeather: '{source} · {altitude} m · {date}',
  conditionsWeatherNoAltitude: '{source} · {date}',
  aboutPrivacy:
    'Location is optional. Use location immediately requests access. Coordinates rounded to three decimals are sent to Open-Meteo for conditions and BigDataCloud for a city/locality label, along with your IP address. Open-Meteo may retain request logs for up to 90 days. BigDataCloud uses anonymous coordinate/IP pairings to improve its location service. Coordinates are never saved by this app. Only the active real timer is stored in this tab; stopping, finishing and going back delete it. A separate automatic-location preference is saved on this browser. Repeat visits refresh only when the browser already grants location permission. Safari controls how long its permission lasts. The city is approximate, optional and never saved; a missing name does not affect the timer. An explicit language choice is also saved locally and contains no personal data.',
  weatherElevation: 'Weather and elevation:',
  pressureConverted:
    'Pressure is converted locally into boiling temperature and cooking time.',
  providerTerms: 'Provider terms & privacy',
  personalUse: 'Personal, non-commercial use. City/locality:',
  privacy: 'privacy',
  refreshAutomatically: 'Refresh location automatically on visits',
  close: 'Close',
  eggIllustration:
    'Illustrated progress, not a measurement inside the egg. {stage}',
  stageGlossy: 'Glossy yolk, translucent-looking white',
  stageOpaqueBeginning: 'Opaque white beginning at the shell',
  stageAdvancing: 'White advancing inward, thin matte yolk edge',
  stageSoft: 'Soft illustration: tender-looking white, glossy yolk',
  stageJammy: 'Jammy illustration: opaque white, creamy-looking yolk',
  stageFirm: 'Firm illustration: opaque white, matte yolk',
} as const;

type Messages = { [Key in keyof typeof en]: string };

const de: Messages = {
  documentTitle: 'Egg Cooker',
  documentDescription:
    'Ei einstellen, beim Garen zusehen: ein einfacher, wissenschaftlich fundierter Eier-Timer.',
  back: 'Zurück',
  muteSound: 'Ton ausschalten',
  enableSound: 'Ton einschalten und testen',
  about: 'Über diesen Timer',
  options: 'Optionen',
  demo: 'Demo',
  testingMode: 'Testmodus',
  language: 'Language / Sprache',
  english: 'English',
  german: 'Deutsch',
  soundHelp:
    'Lass diese Seite sichtbar und Dein Gerät aktiv, damit Du den Alarm möglichst sicher hörst. Bei angehaltener Browser-Ausführung ist der Alarm nicht garantiert.',
  soundUnavailable: 'Ton nicht verfügbar',
  recoveryUnavailable: 'Wiederherstellung nicht verfügbar',
  recoveryUnavailableOld:
    'Wiederherstellung nicht verfügbar. Nach dem Neuladen kann ein älterer Timer wieder erscheinen.',
  recoveryHelp:
    'Die Wiederherstellung in diesem Tab ist nicht verfügbar. Lass diese Seite geöffnet; beim Neuladen kann der Timer verloren gehen.',
  oldTimer: 'Alter Timer',
  cannotRecover: 'Timer kann nicht wiederhergestellt werden',
  discard: 'Verwerfen',
  configureHeading: 'Ei einstellen',
  eggSize: 'Größe',
  sizePreset: '{name} · {grams} Gramm',
  sizeValue: '{name}, {grams} Gramm',
  startingTemperature: 'Ausgangstemperatur',
  fridge: 'Kühlschrank',
  room: 'Raumtemperatur',
  temperatureValue: '{temperature} Grad Celsius',
  textureQuestion: 'Wie möchtest Du Dein Ei?',
  soft: 'Weich',
  jammy: 'Wachsweich',
  firm: 'Fest',
  locationHelp:
    'Nutzt Open-Meteo und BigDataCloud und merkt sich die automatische Aktualisierung. Einzelheiten unter „Über diesen Timer“.',
  locationData: 'Standortdaten',
  localPressure: 'Lokal · {pressure} hPa',
  altitudeEstimate: 'Schätzung aus Höhenlage',
  adjustedPressure: 'Angepasster Luftdruck',
  standardPressure: 'Standard · 1013 hPa',
  refreshLocation: 'Standort aktualisieren',
  useLocation: 'Standort verwenden',
  locating: 'Standort wird bestimmt…',
  refresh: 'Aktualisieren',
  elevation: 'Höhe',
  airPressure: 'Luftdruck',
  findingConditions: 'Lokale Bedingungen werden ermittelt…',
  cancelLookup: 'Suche abbrechen',
  retry: 'Erneut versuchen',
  weatherExpired: 'Wetterdaten abgelaufen',
  weatherUnavailable: 'Wetterdaten nicht verfügbar',
  elevationUnavailable: 'Höhenlage nicht verfügbar',
  locationImprecise: 'Standort zu ungenau',
  locationUnavailable: 'Standort nicht verfügbar',
  conditionsUpdated: 'Bedingungen aktualisiert',
  timeUncertain: 'Zeitangabe unsicher',
  estimateUnavailable: 'Schätzung nicht verfügbar',
  demoStarted: 'Demo gestartet',
  cookingStarted: 'Garvorgang gestartet',
  cookingTimeReached: 'Garzeit erreicht. Nimm das Ei heraus.',
  timerEnded: 'Gar-Timer beendet. Nimm das Ei von der Hitze.',
  timerStopped: 'Timer gestoppt. Ei herausgenommen.',
  timerRecovered: 'Timer wiederhergestellt',
  timerDiscarded: 'Timer verworfen',
  eggTakenOut: 'Ei herausgenommen',
  ready: 'Fertig',
  cooking: 'Kochen',
  timePastTarget: 'Zeit seit Erreichen der Garzeit',
  timeRemaining: 'Verbleibende Zeit',
  uncertainHelp:
    'Die Geräteuhr wurde zurückgestellt oder ist ungültig. Prüfe das Ei und brich diesen Timer ab.',
  demoSpeed: 'Demo-Geschwindigkeit',
  demoControls: 'Demo-Steuerung',
  toEnd: 'Zum Ende',
  cancelCooking: 'Garvorgang abbrechen',
  stopTimer: 'Timer stoppen',
  cookAnother: 'Noch ein Ei garen',
  startDemo: 'Demo starten',
  start: 'Starten',
  estimatedTime: 'Geschätzte Garzeit {time}',
  estimatedTimeShort: '≈ {time}',
  boilingTemperature: 'Siedetemperatur des Wassers',
  boilingAt: 'bei {temperature} °C',
  lowBoil: 'Niedrige Siedetemperatur · die Textur-Schätzung ist experimentell.',
  startHelp:
    'Starte, wenn das Ei bereits in kochendem Wasser oder gesättigtem Dampf liegt.',
  recoveredTitle: 'Wiederhergestellt · Gart das Ei noch?',
  recoveredHelp:
    'Dein Timer läuft weiter. Der Ton bleibt aus, bis Du ihn einschaltest.',
  yes: 'Ja',
  done: 'Fertig',
  oldTimerHelp: 'Dieser Timer ist mindestens 24 Stunden alt.',
  corruptTimerHelp:
    'Der gespeicherte Timer ist ungültig oder verwendet ein unbekanntes Modell.',
  aboutTitle: 'Ein wenig Wissenschaft.',
  aboutUse:
    'Lege das Ei bereits vor dem Start in kochendes Wasser oder gesättigten Dampf in einem normalen abgedeckten Topf ohne Druck. Halte die Hitze konstant und nimm das Ei bei „Fertig“ heraus.',
  aboutModel:
    'Die Zeiten sind Schätzungen nach dem Williams-Erwärmungsmodell und werden an den Luftdruck angepasst. Die Textur ist eine kontinuierliche, vorläufige Zuordnung: Weich 1×, Wachsweich 1,5× und Fest 2× der weichen Garzeit. Der Bereich beginnt bei 0,75× und reicht bis 2,25×, ohne eine festere Textur zu versprechen. Dampf und Eintauchen verwenden dieselbe Näherung, die noch in der Küche geprüft werden muss.',
  aboutScience:
    'Der dargestellte Fortschritt ist keine Messung im Ei. Die Höhenlage schätzt den lokalen Luftdruck; eine Änderung des Luftdrucks justiert diesen Wert direkt. Der Standort liefert Höhenlage und Wetter-Luftdruck gemeinsam. Eine geänderte Höhenlage setzt den Luftdruck auf die Schätzung der Standardatmosphäre zurück. Die Temperatur beim Start ist die Siedetemperatur des Wassers, nicht die Innentemperatur des Eis. In der Nähe des Mount Everest liegt sie bei etwa 70 °C. Eier können dort weiterhin garen, aber gewöhnlich feste Eiweiße und Eigelbe sind nicht sicher erreichbar. Verschiedene Proteine stocken bei unterschiedlichen Temperaturen und Geschwindigkeiten; es gibt keine einzelne verlässliche Höhengrenze je Textur. Unter 85 °C kennzeichnen wir die Schätzung als experimentell, nicht als unmöglich.',
  eggResearch: 'Forschung zur Erwärmung von Eiern',
  aboutSafety:
    'Weich und Wachsweich sind nicht vollständig durchgegart. Fest garantiert keine Pasteurisierung. Die Garstufe ist keine Garantie für Lebensmittelsicherheit.',
  aboutPlatform:
    'Lass die Seite sichtbar und das Gerät aktiv, damit Du den Alarm hörst. Eine angehaltene Browser-Ausführung kann Ton verhindern. Die Wiederherstellung nach dem Neuladen funktioniert in diesem Tab nur nach bestem Bemühen; erneutes Offline-Öffnen ist nicht garantiert. Ein Symbol auf dem Home-Bildschirm macht daraus keinen dauerhaft laufenden nativen Timer.',
  conditionsPressure: '{source}',
  conditionsAltitude: '{source} · {altitude} m',
  conditionsWeather: '{source} · {altitude} m · {date}',
  conditionsWeatherNoAltitude: '{source} · {date}',
  aboutPrivacy:
    'Der Standort ist optional. „Standort verwenden“ fordert sofort Zugriff an. Auf drei Dezimalstellen gerundete Koordinaten werden zusammen mit Deiner IP-Adresse für Bedingungen an Open-Meteo und für eine Stadt-/Ortsangabe an BigDataCloud gesendet. Open-Meteo kann Anfrageprotokolle bis zu 90 Tage speichern. BigDataCloud verwendet anonyme Koordinaten-/IP-Paare, um seinen Standortdienst zu verbessern. Diese App speichert Koordinaten nie. Nur der aktive echte Timer wird in diesem Tab gespeichert; Stoppen, Beenden und Zurückgehen löschen ihn. Eine separate Einstellung für die automatische Standortaktualisierung wird in diesem Browser gespeichert. Bei späteren Besuchen wird nur aktualisiert, wenn der Browser die Standortberechtigung bereits erteilt hat. Safari bestimmt, wie lange seine Berechtigung gilt. Die Ortsangabe ist ungefähr, optional und wird nie gespeichert; ein fehlender Name beeinflusst den Timer nicht. Eine ausdrückliche Sprachwahl wird ebenfalls lokal gespeichert und enthält keine personenbezogenen Daten.',
  weatherElevation: 'Wetter und Höhenlage:',
  pressureConverted:
    'Der Luftdruck wird lokal in Siedetemperatur und Garzeit umgerechnet.',
  providerTerms: 'Bedingungen und Datenschutz des Anbieters',
  personalUse: 'Private, nicht kommerzielle Nutzung. Stadt/Ort:',
  privacy: 'Datenschutz',
  refreshAutomatically: 'Standort bei Besuchen automatisch aktualisieren',
  close: 'Schließen',
  eggIllustration: 'Dargestellter Fortschritt, keine Messung im Ei. {stage}',
  stageGlossy: 'Glänzendes Eigelb, durchscheinend wirkendes Eiweiß',
  stageOpaqueBeginning: 'Das Eiweiß wird von der Schale aus undurchsichtig',
  stageAdvancing: 'Das Eiweiß wird nach innen fest, der Eigelbrand leicht matt',
  stageSoft: 'Weiche Darstellung: zartes Eiweiß, glänzendes Eigelb',
  stageJammy:
    'Wachsweiche Darstellung: undurchsichtiges Eiweiß, cremig wirkendes Eigelb',
  stageFirm: 'Feste Darstellung: undurchsichtiges Eiweiß, mattes Eigelb',
};

export const messages: Record<Locale, Messages> = { en, de };
export type MessageKey = keyof Messages;

export function detectLocale(requested: readonly string[]): Locale {
  for (const value of requested) {
    const language = value.toLowerCase().split('-')[0];
    if (language === 'en' || language === 'de') return language;
  }
  return 'en';
}

export function readLocale(
  storage: Pick<Storage, 'getItem'> | undefined,
  requested: readonly string[],
): Locale {
  try {
    const saved = storage?.getItem(LANGUAGE_KEY);
    if (saved === 'en' || saved === 'de') return saved;
  } catch {
    /* The browser language remains the safe fallback. */
  }
  return detectLocale(requested);
}

export function writeLocale(
  storage: Pick<Storage, 'setItem'> | undefined,
  locale: Locale,
): void {
  try {
    storage?.setItem(LANGUAGE_KEY, locale);
  } catch {
    /* The current page still uses the explicit selection. */
  }
}

export function translate(
  locale: Locale,
  key: MessageKey,
  values: Record<string, string | number> = {},
): string {
  return messages[locale][key].replace(/\{(\w+)\}/g, (match, name) =>
    Object.hasOwn(values, name) ? String(values[name]) : match,
  );
}

export function textureLabel(locale: Locale, value: Doneness): string {
  return translate(locale, value);
}

const stageKeys: Record<string, MessageKey> = {
  'Glossy yolk, translucent-looking white': 'stageGlossy',
  'Opaque white beginning at the shell': 'stageOpaqueBeginning',
  'White advancing inward, thin matte yolk edge': 'stageAdvancing',
  'Soft illustration: tender-looking white, glossy yolk': 'stageSoft',
  'Jammy illustration: opaque white, creamy-looking yolk': 'stageJammy',
  'Firm illustration: opaque white, matte yolk': 'stageFirm',
};

export function illustrationLabel(locale: Locale, frame: Illustration): string {
  return translate(locale, 'eggIllustration', {
    stage: translate(locale, stageKeys[frame.stage] ?? 'stageGlossy'),
  });
}
