# Mobile interaction verification — 2026-09-15

Scope: [accepted 0003](../product/specifications/0003-mobile-interaction.md), [plan](2026-09-15-mobile-interaction-plan.md). This is later evidence than the [original MVP record](2026-09-15-mvp-verification.md); prior test results are historical.

## Implementation

- One column capped at 440 px, no hero/slogans/checkmarks, unified selection/hover/focus, SVG utility icons, estimated duration in the centered Start action.
- Inclusive temperature ranges, plain doneness radios, one mass-scaled egg below configuration with measured position/size animation into Cook and back. Reduced motion disables movement.
- Manual elevation/pressure with explicit source and strict recovery validation; expanded exploratory model bounds; location fills both, manual edits abort late work.
- Demo defaults on at 1×, 10×/20×/50× and To end on Cook, exact target slowdown and reacceleration. Real recovery remains real. Ready action below egg, direct Back, explicit cancel wording.
- No new dependencies/assets/services, no coordinates persisted, no publication or commit. Existing uncommitted documentation preserved.

## Evidence

Focused Chromium run: 26 of 27 scenarios passed initially; remaining failure was a newly written assertion expecting fractional slider text despite native step=1. Corrected it to assert the displayed integer, while domain/snapshot tests retain full pressure precision. Existing tests were updated only where 0003 deliberately replaces prior behavior; recovery, failure, focus, offline and API boundary assertions remain.

Final completed checks:

| Check                                       | Result                                                                                                                                                                                                     |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run verify:all`                        | Passed: format, lint, Svelte/TypeScript (0 warnings), docs, 82 domain/adapter tests, 3 script tests, build, 81 browser checks (27 scenarios × 3 engines)                                                   |
| `BASE_PATH=/egg-cooker/ npm run verify:all` | Passed with the same full counts; 0 skipped/retried tests                                                                                                                                                  |
| `node scripts/smoke-environment.mjs`        | Passed 2026-09-15T15:58:32.419Z on localhost `/egg-cooker/`, synthetic public Berlin coordinates, actual elevation/weather APIs; Local 1011 hPa, estimate 7:20, weather snapshot, no coordinates persisted |
| Rendered review                             | Inspected 390 × 844 Configure/Cook/Ready/return and 1440 × 1000 desktop capture; default Start fits the tested phone height; all controls remain one column                                                |
| Motion                                      | Browser checks verify the same egg node and decreasing vertical positions through the actual animation; recorded a real Start → 50× cooking → Ready → return journey                                       |
| Existing user preview                       | Reloaded the existing in-app tab; verified new default-demo configuration, elevation/pressure and Start/time action                                                                                        |

Runtime: Node 24.20.0 / npm 11.19.0, Darwin arm64. Browsers: Chromium 153.0.8010.12, Firefox 155.0, WebKit 26.6. This historical run used working-tree changes on a private pre-publication base; its build-info alone does not identify those changes.

Final `/egg-cooker/` artifact manifest SHA-256: `9ee26c3bb39f217d4845dae5930c2a3583820b2de945a2ca6ddac35023a6038e` (sorted `sha256  relative-path\n` lines). Manifest and rendered artifacts are in ignored `.local/mobile-review/`: `configure.png`, `cooking.png`, `ready.png`, `returned.png`, `desktop.png`, `page@d6aca7f43922839a66c5c08b3496d8ac.webm`, `build-manifest.txt`. Screens/recording are from the identical source default-path build; final subpath bytes were covered by the full browser suite and API smoke. Logs: `/tmp/egg-mobile-verify.log`, `/tmp/egg-mobile-subpath.log`, `/tmp/egg-mobile-live.json`.

The preview remains at `http://127.0.0.1:4174/egg-cooker/` while its local process runs. No deployment occurred.

## Pending acceptance

Maintainer visual/joy/continuous-motion review, actual-phone VoiceOver/audio/permission/background behavior, deployed-origin API smoke and kitchen trials remain Pending. Extreme-altitude exploration is mathematically checked, not kitchen validated. Demo defaults on specifically for testing; that remains a release consideration. No device, cooking-accuracy or suspended-alarm certification is inferred from automated checks.
