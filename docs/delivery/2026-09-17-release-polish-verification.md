# Verification — FEAT-007 v0.1.1 release polish

**Date:** 2026-09-17
**Source:** Implementation commit `4ff22205c66f5f58070a1557d514137040a53c36`; device acceptance covered the content-identical application tree before that commit was created.
**Environment:** macOS/Darwin arm64; Node 24.20.0; npm 11.19.0; Playwright 1.63.0 managed Chromium, Firefox and WebKit.
**Specification:** [0005 — v0.1.1 release polish](../product/specifications/0005-release-polish.md), P-01–P-11.
**Delivery tracking:** [Specification index and delivery ledger](../product/specifications/README.md). Corrective v0.1.2 release preparation is authorized; publication remains Pending.

| Check / acceptance criterion                      | Command or procedure                                                        | Result                             | Evidence                                                                                                     |
| ------------------------------------------------- | --------------------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Source, docs, types, unit/integration and build   | `BASE_PATH=/egg-cooker/ npm run verify:all`                                 | Passed                             | Formatting, lint, Svelte/TypeScript, local links and production build passed; 96 Vitest + 1 script test.     |
| Cross-browser regression and 0005 journeys        | Same completion gate                                                        | Passed                             | 150 Playwright checks across Chromium, Firefox and WebKit.                                                   |
| P-01 matching Location data surface               | Computed-style equality assertion + 390 × 740 render inspection             | Passed                             | Background, 1 px border and 16 px radius match `.preset-rail`; accepted spacing/content remain.              |
| P-02/P-03 language selection and complete catalog | Typed catalog test; locale/storage/static-startup/browser journeys          | Passed                             | German browser, unsupported-locale fallback, explicit persistence, denied storage and both startup messages. |
| P-04 presentation-only language changes           | Virtual-clock Configure/Cook/Ready/recovery journeys                        | Passed                             | Inputs, exact session record, time, sound state and recovery modal remain unchanged.                         |
| P-05 German responsive/accessibility behavior     | 320 px, 390 × 740, 200% text, axe and keyboard/browser checks               | Automated pass; iPhone visual pass | No horizontal overflow or axe violations; phone controls remained reachable; VoiceOver remains untested.     |
| P-06 icon and metadata                            | Manifest/link/base-path fetch checks; 32/180/192/512 exports; visual review | Passed                             | Bold egg accepted after a slight downward adjustment in a newly added iPhone Home Screen item.               |
| P-07/P-08 Ready recording and fallback            | Audio-adapter tests + mocked decoded-asset Playwright timing                | Passed                             | Automated behavior passed; activation and Ready call worked on the iPhone speaker without reported issues.   |
| P-09 bundled asset provenance/offline boundary    | Source/license review, SHA-256, built-request and network-loss checks       | Passed                             | Public-domain source/edits are in `SOUND_CREDITS.md`; sound/icon fetches are same-origin and bundled.        |
| P-10 foreground Safari/Home Screen acceptance     | Actual named iPhone/iOS build                                               | Passed                             | iPhone 16 Pro, iOS 26.6.2; Safari and newly added Home Screen item; foreground behavior only.                |
| P-11 existing behavior                            | `BASE_PATH=/egg-cooker/ npm run verify:all`                                 | Passed                             | Location, recovery, demo, timing, accessibility and production-subpath checks remain green.                  |

## Artifact and acceptance

The device-tested local production build identified package version `0.1.0` and base commit `c43da36` because the accepted application changes were still in the working tree. Commit `4ff2220` freezes that exact application code and asset content. Subsequent release-preparation changes are limited to version and documentation metadata. Vite emitted the bundled 41.73 kB `rooster-ready-warm` MP3 and the complete public icon/manifest set. The shipped MP3 SHA-256 is `1db417d0bced989e534683dcba90708f5ec5d037ae9caf95ae1ea7b8642d3a90`.

The final Bold egg was moved slightly downward after the first iOS preview, rebuilt with a versioned Apple-touch-icon URL to avoid stale preview caching, and accepted in Safari plus a newly added Home Screen item on an iPhone 16 Pro with iOS 26.6.2. Activation and Ready playback worked on the physical speaker. This does not establish VoiceOver behavior or background, locked-device, silent-mode or Focus reliability.

## Release-candidate correction

Shared tag `v0.1.1` identifies release-preparation commit `b9b822333e4b08eea7782660eb63a23923fe5c7e`. Its [Linux release-candidate run 35256601291](https://github.com/chrwittm/egg-cooker/actions/runs/35256601291) failed before publication, and a rerun reproduced both failures: Linux WebKit exceeded the viewport at 320 px with 200% text, while Firefox's language-state test inherited unavailable headless audio and legitimately muted the application. The first was a portability defect; the second was a nondeterministic test fixture rather than a product-language defect.

Commit `9a4d7d3` constrains intrinsic widths without hiding content and supplies deterministic available audio to the presentation-only language journey. The focused two-test matrix passed in all three browsers, followed by the complete macOS gate with 96 Vitest tests, 1 release-script test and 150 Playwright checks. Because the shared tag is immutable, `v0.1.1` remains an unpublished rejected candidate and v0.1.2 is the corrective release target.

## Limits and follow-up

- Preserve the exact implementation and release commit identities plus candidate checksum in the publication evidence.
- Do not test or claim reliable background, locked-device, silent-mode or Focus behavior as part of this slice.
- Complete the separate v0.1.2 candidate/version/tag/release flow. Never move `v0.1.0` or the shared rejected `v0.1.1` tag.
