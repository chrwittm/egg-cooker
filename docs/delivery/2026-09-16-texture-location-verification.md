# Texture and location fine-tuning — 2026-09-16

**Scope:** The maintainer's follow-up to [0004](../product/specifications/0004-continuous-controls.md) and the [living MVP](../product/specifications/0001-mvp.md). Implemented locally; human acceptance was pending at this historical checkpoint.

## Behavior and choices

- Soft/Jammy/Firm highlights cover every supported slider value. Boundaries are the anchor midpoints, 1.25 and 1.75; ties select the higher category. Continuous time and preset positions remain unchanged.
- Removed the separate Longer output and use the same three category names in accessible/cooking summaries. The upper range still extends time with the image clamped at Firm.
- Added a separated Location data group heading. Heading and single-line city/pressure summary share a compact header beside Refresh. A city replaces Local; absent names retain existing source feedback and Standard · 1013 hPa. About retains full source information. Lazy lookup behavior is preserved.
- Reconciled the MVP, refinement specification, science presentation note, user guide, product context and changelog.

## Verification

- Final root `npm run verify:all`: passed 92 domain/adapter tests, 3 script tests, and 132 browser checks (44 scenarios across Chromium, Firefox and WebKit; browser phase 34.4 seconds).
- Final `BASE_PATH=/egg-cooker/ npm run verify:all`: same counts passed; browser phase 1.1 minutes. Both gates include formatting, lint, Svelte/TypeScript, documentation checks and production build. No skipped checks or retries.
- Added observable coverage of category boundaries and exactly one selected button throughout the spectrum, removal of Longer, heading separation and short-phone fit. City coverage verifies a single line containing city and pressure. Existing timing, recovery, APIs, audio, accessibility and motion checks remain.
- Inspected final Chromium 153.0.8010.12 renders at 390 × 844 and 390 × 740: default Standard summary, synthetic Ehingen summary, and 90 g egg. The largest egg's Start bottom is 733.22 px on the 740 px viewport. No clipping or horizontal overflow in these views. Rendering uses mocked provider responses; no real coordinates were obtained or sent.
- Ignored local artifacts: `.local/fine-tune/` screenshots, render script, layout metrics and sorted SHA-256 build manifest. Manifest SHA-256: `2e717a964e97bc2d02a7f80838915ac1f73c752fa69cbd73c74d7954a05594b5`. Preview: `http://127.0.0.1:4174/egg-cooker/`.

## Iterations and limits

The initial documentation formatting check failed and was corrected. The first standalone heading caused six short-phone fit failures; moving the heading/summary into the card header reduced this to three largest-egg fit failures. Sharing the heading/summary column beside Refresh resolved those failures without shrinking touch targets or weakening assertions. Both final complete gates passed.

Maintainer touch/appearance acceptance remained pending at this checkpoint. Existing actual-device audio, live permitted locality, deployed-origin API and kitchen acceptance gaps were unchanged; this presentation-only follow-up did not repeat live provider calls or claim new science validation. Historical evidence remains in its dated records.
