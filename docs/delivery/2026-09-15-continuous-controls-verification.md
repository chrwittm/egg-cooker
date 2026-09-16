# Continuous controls verification

**Date:** 2026-09-15. **Scope:** [0004 / FEAT-006](../product/specifications/0004-continuous-controls.md).

The previous complete UI was preserved in a private local checkpoint. This dated record predates the sanitized public baseline; no dependency/version change or release occurred in this slice.

## Automated evidence

- Default production path: `npm run verify:all` passed — 89 domain/adapter tests, 3 repository script tests, 111 browser checks (37 scenarios × Chromium/Firefox/WebKit). Format, lint, Svelte/TypeScript, docs and production build passed. No test skips or retries; Svelte reported zero errors/warnings. Browser runners emitted the existing NO_COLOR/FORCE_COLOR environment warning.
- `/egg-cooker/` production path: `BASE_PATH=/egg-cooker/ npm run verify:all` passed with the same counts. Final preview serves this production build at `http://127.0.0.1:4174/egg-cooker/`.
- Focused first run exposed expectations for the removed cancel dialog, relocated attribution and old fresh default, plus a 14 px Start-button overflow at 390 × 844. Updated changed-contract assertions, preserved explicit Jammy timing regression scenarios, added separate favorite-default checks and tightened layout. Subsequent focused Chromium run passed 35 scenarios. Two additional failure-path scenarios then passed in both full gates.
- Numeric texture: all 126 steps are monotonic and match the explicit multiplier; original named anchors retain their durations. Invalid/overprecise texture and mismatched schema/model types are rejected. Named v1 and numeric v2 snapshots recover with strict recalculation.
- Browser behavior: native rail clicks, actual pointer dragging, Home/End/arrows, in-between yolk/time, exact numeric recovery, direct Back cleanup/focus, Stop timer freezing time/frame/audio and removing recovery, retained demo result, current defaults, opt-out and optional-storage failure.
- Location: no first-visit request without activation, single-tap sharing, one repeat request sequence with granted permission, prompt/denied/unsupported query fallback, manual input winning a late permission check, in-flight API cancellation and immutable active snapshots. Providers credited in About. Permission fixtures isolate branching behavior; the live check below exercises real browser permission and APIs.
- Layout/accessibility: single column at desktop width; Start visible at 390 × 844 and 390 × 740 (including 90 g); cube-root mass scaling; 320 px reflow, 200% text, axe on configuration/cooking/Ready/About, native keyboard behavior and reduced motion. Measured shared-egg positions across the actual 1000 ms animation and reverse journey.

## Live and visual checks

The synthetic public Berlin fixture (52.52, 13.41) used actual Open-Meteo elevation/weather requests against the subpath preview. At **2026-09-15T17:52:42.734Z**, Chromium 153.0.8010.12 returned Local 1010 hPa, estimated Soft time ≈ 4:53, weather provenance and no stored coordinates. Reload automatically refreshed using real granted browser permission before starting a real saved cook. Direct Back returned successfully. This is local-origin evidence, not a deployed-origin test; no user coordinates were used.

Rendered default configuration, intermediate texture, cooking, Ready/Stop and stopped result were inspected. Ignored `.local/continuous-review/` contains screenshots and a video of actual Start/To end/Stop/return actions. The short-phone capture shows maximum 90 g in 390 × 740 with main content about 739 px high. The preview shrinks on shorter viewports; the default tall-phone egg is larger than the previous UI. Shorter screens, browser chrome, enlarged text and error disclosures can still require scrolling; no clipping or universal phone-fit claim.

The existing in-app tab was refreshed and verified at M/60 g, Fridge/8 °C, Soft, Demo 1×, Start ≈ 4:53, new texture rail and direct Use location. Final screenshots and `journey.webm` were recaptured against the final subpath artifact; both base paths were independently tested. Its sorted SHA-256 file-manifest digest is `f09dfa854a03826de771b46ba0ce5619f3231f7ef439ed3e632794ed8c763f0d` (manifest retained under `.local/continuous-review/build-manifest.txt`). This working-tree artifact predates the sanitized public baseline.

Logs: `/tmp/egg-continuous-final.log`, `/tmp/egg-continuous-subpath-final.log`, `/tmp/egg-continuous-live.json`. Logs and `.local/` artifacts are local review aids and are not committed.

## Remaining acceptance

Maintainer visual/continuous-animation and touch review; actual-device Safari permission retention, VoiceOver/audio/background; deployed-origin APIs; original kitchen trials and exploratory continuous texture/altitude validation. Mathematical interpolation is not kitchen calibration. Default Demo remains explicitly for testing. No release or platform certification is claimed.

## Refresh flicker follow-up — 2026-09-15

The maintainer requested keeping the current values during API refresh. The UI now commits conditions only when the complete lookup settles; it delays progress by 800 ms, blocks repeat activation without dimming the action, and preserves values on cancellation. Completed failures/timeouts retain the existing contextual standard/altitude fallback. Start and manual edits still cancel late results.

Focused Chromium checks passed (4 scenarios). `BASE_PATH=/egg-cooker/ npm run verify:all` passed: 89 domain/adapter tests, 3 repository script tests and 117 browser checks (39 scenarios across Chromium, Firefox and WebKit), plus formatting, lint, Svelte/TypeScript, docs and production build. New checks hold API responses to verify stable values/estimate through intermediate elevation, delayed progress, final weather replacement, cancellation, and an actual adapter timeout driven by the browser clock. Existing late-response scenarios now explicitly set the accepted elevation before refresh. No skips/retries. Log: `/tmp/egg-refresh-verify.log`.

The preview serves this newer subpath build (HTTP 200). Earlier screenshots, artifact digest and live-provider evidence above describe the pre-follow-up build; APIs and calculation formulas did not change. This follow-up has no new live-provider or actual-device acceptance claim. Changes remain uncommitted.
