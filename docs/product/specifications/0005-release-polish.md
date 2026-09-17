# FEAT-007 — v0.1.1 language, identity and alarm polish

**Status:** Released in experimental v0.1.2 — automated, Linux candidate and actual-iPhone acceptance passed
**Sequence:** 0005; proposed next release slice after the published 0.1.0 experiment.
**Updated:** 2026-09-17
**Acceptance decision:** On 2026-09-17 the maintainer accepted the bounded scope below, icon option 2 (Bold egg) and short-rooster candidate B, the warmer public-domain recording by Benchill.
**Backlog:** [FEAT-007](../../planning/backlog.md) — Ready

## User outcome and motivation

A person opening Egg Cooker on an iPhone or in a browser gets a more coherent and recognizable small application: the configuration surfaces look related, the complete interface is available in English and German, the Home Screen uses an egg rather than a generated letter, and Ready has a memorable chicken-themed sound.

This is a professional-polish release, not a platform expansion. Preserve the quick two-screen journey, calculation, location behavior, animation, recovery and foreground-only audio boundary from the accepted MVP.

## Scope and non-goals

In scope:

- make the Location data container use the same light surface, border and corner treatment as the three configuration rails;
- localize the complete application interface in English and German;
- add a recognizable egg application icon derived from the existing animated egg's visual language;
- replace the synthesized Ready melody with a selected short chicken/rooster asset, retaining a synthesized fallback;
- verify the changed sound in foreground Safari and Home Screen mode on an actual iPhone;
- update affected user, privacy, asset-credit and release documentation.

Not in scope:

- a confirmed fix for the previously reported silent-iPhone observation: foreground retesting succeeded, so no defect is currently established;
- background or locked-device alarm guarantees, Web Push, service workers, offline reopening or wake lock;
- Lock Screen widgets, Live Activities, native iOS packaging or App Store distribution;
- Siri, Shortcuts or App Intents integration;
- additional languages, translated repository documentation, unit systems or regional egg-size models;
- selectable sound personalities, volume controls, progress-call patterns or other species.

The postponed platform ideas remain candidates for later specifications. This release must not imply that adding a Home Screen icon turns the static site into an always-running native timer.

## Behavior and interaction

### Consistent configuration surfaces

Location data remains a separate group with its compact heading, source/city-and-pressure summary, Refresh action, elevation slider and pressure slider. Its outer container uses the same surface treatment as `.preset-rail`: background `#f1ecdf`, `1px solid #c9bea9` border and 16 px corner radius. Preserve its current spacing and the accepted distinction created by the heading and 16 px separation from Texture.

This is a presentation change only. Do not change source provenance, lookup, manual adjustment, privacy, fallback, range, timing or calculation behavior.

### English and German

English and German cover every user-facing application message, including:

- headings, labels, buttons, option names and units;
- accessible names, value text, announcements and hidden help;
- lookup, sound, storage, recovery and validation feedback;
- confirmation/recovery dialogs and About content;
- document title, metadata and the static startup failure message;
- dynamic location-source labels and dates.

On the first visit, use the first supported language in the browser's requested language list; fall back to English. Provide an explicit **Language / Sprache** choice under Options so a person can select English or Deutsch without changing the device language. Store only the explicit choice locally. If preference storage is unavailable, the selection works for the current page and a future visit uses browser preference again.

Apply the active language to the document's `lang` value. Use explicit message entries rather than concatenating translated sentence fragments. Use `Intl` with the active locale for dynamic dates and other locale-sensitive formatting. Request the optional BigDataCloud locality label in the active language; changing language may refresh presentation strings but must not silently request coordinates or other network data. A future user-initiated or already-authorized automatic location lookup uses the then-active locality language.

Changing language during an active timer changes presentation only. It must not restart, replace, accelerate or persist a new cook, alter its committed environmental snapshot, re-enable sound, or dismiss a recovery state. Existing cooking-session schemas remain unchanged.

German text may wrap naturally at narrow widths and 200% zoom. All content and actions remain reachable; do not abbreviate essential error, privacy or accessibility information merely to preserve the English line count.

### Application icon

The selected design is derived from the original egg shell/yolk geometry and existing warm off-white, dark brown and amber palette. It contains no letter, word, photograph, remote asset, transparency-dependent edge or pre-rounded outer corners. The artwork remains recognizable at small icon sizes and survives iOS masking.

Provide at least:

- an Apple touch icon suitable for current iPhone Home Screen use;
- manifest icon sizes sufficient for supported browsers, including a maskable-safe variant where appropriate;
- ordinary browser favicon metadata;
- an application name and theme/background colors consistent with the existing page.

Manifest and icon metadata do not introduce an offline/PWA promise. All paths must work at the configured GitHub Pages base path. An installation made before the release may retain a cached/generated icon until the person removes and adds it again; document that acceptance caveat rather than claiming the operating system refreshes it immediately.

The accepted design is **option 2 — Bold egg** in [the icon option study](../../assets/0005-app-icon-options.svg): a larger but fully contained cross-section with comfortable mask-safe margins and a prominent yolk. It provides the strongest small-size recognition while retaining the app's signature artwork.

The rejected review alternatives remain documented for decision traceability:

1. **Whole egg:** the complete upright cross-section; most faithful to the animation, but smallest at Home Screen scale.
2. **Cooking egg:** the full egg plus restrained amber heat marks; communicates cooking most directly, but introduces a symbol not present in the current animation.

### Completion sound

Preserve the quiet synthesized activation cue and final-ten-second ticks. At Ready, play the selected bundled completion asset only while the document is visible and sound is enabled. Never overlap calls or replay missed calls after suspension. Repeat from the end of the previous call with enough quiet spacing to remain intelligible, until Stop timer, Back, Cook another egg or mute. Re-enabling sound while Ready plays one immediate preview and then resumes the repeat policy.

If the asset cannot be fetched, decoded or played after successful sound activation, fall back to the existing three-tone Ready alarm and show no blocking error. If all audio is unavailable, retain the existing visible **Sound unavailable** feedback and visual Ready state. Starting and timing never wait for an audio asset.

Use an original, CC0 or public-domain recording, bundled with the application. Record the source, author when applicable, original URL, license and any edits in `SOUND_CREDITS.md`; do not use a non-commercial or attribution-unclear asset.

The **short rooster sting** direction and **candidate B — Warm** are accepted. It is a normalized derivative of the public-domain recording by Benchill. Candidate A and the earlier sound directions are rejected for this slice. Preserve the accepted candidate as the source when preparing the final shipped asset; do not substitute another crow merely because it has a similar description.

- **Accepted candidate B — Warm:** a rounder, steadier crow derived from [Rooster crowing small.ogv](https://commons.wikimedia.org/wiki/File:Rooster_crowing_small.ogv), recorded by Benchill and dedicated to the public domain. The review derivative is approximately 3.4 seconds.

Final loudness must be judged on the actual iPhone speaker without clipping or becoming harsh. The sound is an alert, not a claim of background reliability.

## Acceptance and evidence

| ID   | Observable outcome                                                                                                                                              | Verification method / test                                         | Result/evidence                                                                 |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| P-01 | Location data uses the same surface color, border and radius as the three configuration rails without changing its accepted content or spacing                  | CSS assertion + Playwright screenshots + human visual review       | Passed — [evidence](../../delivery/2026-09-17-release-polish-verification.md)   |
| P-02 | A fresh supported German browser opens in German, another locale falls back to English, and an explicit choice persists when storage is available               | Browser tests with locale/storage fixtures                         | Passed — [evidence](../../delivery/2026-09-17-release-polish-verification.md)   |
| P-03 | Every visible, accessible, error, recovery, About and static-startup string is available in coherent English and German                                         | Message-catalog completeness check + Playwright journeys + review  | Passed — [evidence](../../delivery/2026-09-17-release-polish-verification.md)   |
| P-04 | Changing language in Configure, Cook, Ready and recovery changes presentation only and never changes the committed timer, inputs, conditions or sound state     | Domain/integration assertions + Playwright with virtual clock      | Passed — [evidence](../../delivery/2026-09-17-release-polish-verification.md)   |
| P-05 | German remains usable at 320 px width, 390 × 740, 200% text zoom, keyboard navigation and with automated accessibility checks                                   | Chromium/Firefox/WebKit automation + human phone/assistive review  | Automated/accessibility pass; iPhone visual interaction pass; VoiceOver pending |
| P-06 | The selected egg icon appears in browser metadata and a newly added iPhone Home Screen item, remains recognizable at small size and uses valid base paths       | Manifest/icon checks + production build + actual-iPhone acceptance | Passed — metadata/build checks and newly added iPhone Home Screen item          |
| P-07 | Start/ticks remain unchanged; Ready plays the selected non-overlapping call in the foreground until acknowledgement or mute                                     | Adapter tests + Playwright timing test + human listening review    | Passed — automated timing/fallback and iPhone speaker acceptance                |
| P-08 | Missing/failed sound asset uses the synthesized Ready fallback without delaying or breaking the timer                                                           | Adapter/integration test                                           | Passed — [evidence](../../delivery/2026-09-17-release-polish-verification.md)   |
| P-09 | The bundled sound has a compatible license and complete durable credit, and no icon or sound requires runtime network access                                    | Source/package/license review + offline-after-load artifact check  | Passed — [evidence](../../delivery/2026-09-17-release-polish-verification.md)   |
| P-10 | Foreground sound preview and Ready alarm work in Safari and newly added Home Screen mode on the named iPhone/iOS build; locked/background behavior is unclaimed | Actual-device acceptance with device/OS/build recorded             | Passed — iPhone 16 Pro, iOS 26.6.2, local candidate; foreground only            |
| P-11 | Existing quick-cook, location, recovery, demo, accessibility and production-path checks remain green                                                            | `npm run verify:all`                                               | Passed — 96 unit/integration + 1 script + 150 browser checks                    |

## Data, privacy, security, compatibility

The explicit language choice adds one small validated local preference with only `en` or `de` accepted. It contains no personal data and has no effect on the active-cook schema. Removing site data removes the preference. Invalid or unavailable storage falls back safely to browser language and then English.

Localization does not broaden location consent. The optional provider receives the requested presentation language only during an otherwise authorized locality lookup; no new request occurs merely because the language changes.

Icon and sound assets are bundled, reviewed as source inputs and included in release/package checks. They introduce no runtime host, tracking or permission. Preserve the existing static GitHub Pages deployment and current supported-browser claims. Foreground iPhone acceptance does not establish background, locked-device, silent-mode or Focus behavior.

## Dependencies and decisions

This specification extends [0001 — Quick-cook MVP](0001-mvp.md) and [0004 — Continuous controls](0004-continuous-controls.md) without changing their domain model. It promotes localization, application identity and chicken-themed sound concepts from discovery into the canonical product queue.

Prefer an explicit project-local message catalog over a localization dependency for two languages unless implementation demonstrates missing plural, fallback or tooling needs that justify a maintained dependency. Reuse the original SVG egg geometry for icon source artwork. Keep sound loading behind the existing browser-audio adapter so UI and domain rules do not own decoding or fallback behavior.

Implementation must reconcile the accepted final choices with the living MVP, product context, user guide, privacy/asset documentation, changelog and release records. A published release requires its own verified source identity; never move an existing shared tag. The v0.1.1 candidate failed its Linux gate and remained unpublished; this accepted scope shipped in corrective v0.1.2.

## Open questions

None. Routine visual export, translation and audio-integration details remain implementation decisions within the accepted behavior above.
