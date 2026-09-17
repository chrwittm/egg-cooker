# Verification — FEAT-007 v0.1.1 release polish

**Date:** 2026-09-17
**Source:** Implementation commit `4ff22205c66f5f58070a1557d514137040a53c36`; device acceptance covered the content-identical application tree before that commit was created.
**Environment:** macOS/Darwin arm64; Node 24.20.0; npm 11.19.0; Playwright 1.63.0 managed Chromium, Firefox and WebKit.
**Specification:** [0005 — v0.1.1 release polish](../product/specifications/0005-release-polish.md), P-01–P-11.
**Delivery tracking:** [Specification index and delivery ledger](../product/specifications/README.md). Corrective v0.1.2 is published and deployed.

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

Commit `9a4d7d3` constrains intrinsic widths without hiding content and supplies deterministic available audio to the presentation-only language journey. The focused two-test matrix passed in all three browsers, followed by the complete macOS gate with 96 Vitest tests, 1 release-script test and 150 Playwright checks. Because the shared tag is immutable, `v0.1.1` remains an unpublished rejected candidate and v0.1.2 became the corrective release.

## Publication evidence

Annotated tag `v0.1.2` identifies release commit `6fb8d2fdac2be7639b5b56abe6fa1cc21646ea4f`. A fresh macOS checkout passed the release identity check, complete gate and fresh audit before packaging and an extracted-archive Configure → Cooking → Ready → reload smoke. [Linux release-candidate run 35258321970](https://github.com/chrwittm/egg-cooker/actions/runs/35258321970) then passed in 3m08s, including the complete 96 Vitest + 1 script + 150 Playwright matrix, audit, packaging and artifact upload.

The authoritative runner archive `app-0.1.2.tar.gz` has SHA-256 `06931a42343d96c4ed6c3c73d8a006a3d266403c2429a5382607dfabc0b55a7c`. Its internal checksum passed, its evidence identifies v0.1.2 at `6fb8d2f`, and its extracted journey plus bundled rooster request passed. The downloaded [published experimental prerelease](https://github.com/chrwittm/egg-cooker/releases/tag/v0.1.2) is byte-for-byte identical to that candidate.

[Deploy Pages run 35258894746](https://github.com/chrwittm/egg-cooker/actions/runs/35258894746) passed the base-path build, complete browser gate and audit, then deployed successfully. At the [live app](https://chrwittm.github.io/egg-cooker/), the page, JavaScript, CSS, 41.73 kB rooster MP3, Apple touch icon, manifest and `build-info.json` returned HTTP 200. The hosted build reported version `0.1.2` and commit `6fb8d2fdac2be7639b5b56abe6fa1cc21646ea4f`; Configure → Cooking → Ready → Cook another egg and reload passed at 390 × 740 with no failed requests. The smoke did not request location, so deployed provider acceptance remains outstanding rather than passed.

## Limits and follow-up

- Do not test or claim reliable background, locked-device, silent-mode or Focus behavior as part of this slice.
- Preserve the v0.1.2 artifact and evidence beyond the 30-day Actions retention if long-term local retention is required. Never move `v0.1.0`, the shared rejected `v0.1.1` tag or published `v0.1.2`.
