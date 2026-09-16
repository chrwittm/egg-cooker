# Quick-cook MVP implementation evidence — 2026-09-15

**Scope:** [Accepted 0001 / FEAT-001](../product/specifications/0001-mvp.md). The maintainer's build request accepted the specification and authorized local implementation. No commit, public release or deployment was part of this historical verification slice. Pre-existing documentation edits were preserved.

**State:** Implemented; both final automated gates passed. Human/device/kitchen acceptance Pending. This record reports the working-tree implementation, not a committed or released artifact. Development version remains 0.1.0.

## Implementation

- Full IAPWS pressure inversion and Williams series with the specified constants, bounds, doneness multipliers and single rounding. Native mass/temperature sliders, EU categories, target previews and invalid-input handling.
- Configure → Cook → Ready/Done, original animated inline SVG, shared absolute-time illustration anchors, cancellation race handling, no pause or extra cooking screens.
- Consented browser geolocation → elevation → surface pressure. Explicit terrain downscaling, strict fields/units/freshness, bounded streamed JSON, timeouts, aborts/request generations, standard/altitude fallback and frozen committed conditions.
- The same domain timeline supports a clearly labeled 60×/1×/To end demo. Real cooks cannot accelerate; demo records are never saved.
- Strict versioned tab-session recovery, missing/corrupt/old records, backward-clock freeze, storage-failure isolation and navigation restoration. Generated audio with bounded real-time reminder policy and immediate stop/mute.
- Keyboard controls, explicit modal focus wrap/restore, single completion announcement, reduced-motion stages, responsive reflow and contextual source/privacy/model disclosures.
- No new package or runtime asset dependency. Original SVG/CSS and synthesized tones; no remote images/fonts/scripts. The checklist implementation and its tests were removed; historical example documentation remains labeled as such.

## Automated evidence

Tests use fixed/injected clocks and public synthetic coordinates. No real-minute cooking waits and no real user location.

| Layer                 | Evidence / result                                                                                                                                                                                                                                                                                                                                          |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Numerical/domain      | All six science fixtures match, including 60 g / 8 °C / Jammy / 1013.25 hPa = 439 s. Independent tighter inversions and 64-term comparisons pass on input-boundary/pressure samples. Integer mass/temperature sweep establishes monotonicity and mass scaling.                                                                                             |
| Rules and failures    | Input/category bounds, illustration anchors/interpolation/reduced motion, timer boundaries and demo rates; exact schema/model and environmental provenance validation; API sequencing, late callback/cancel, HTTP/offline/deadline/size failures; storage and audio policy tests.                                                                          |
| Production browsers   | Final run: 66/66 passed per build across Chromium, Firefox and WebKit, including offline loaded journey, actual sessionStorage, reload/back/forward/restoration, target race, weather expiry at Start, coordinate privacy, axe on four surfaces, 320 px and 200% text/landscape reflow. Includes hidden-page resume without replaying illustration frames. |
| Final completion gate | `npm run verify:all` and `BASE_PATH=/egg-cooker/ npm run verify:all`: both passed. Each ran 77 domain/adapter tests, 3 script tests and 66 browser checks. No skips or retries.                                                                                                                                                                            |
| Source hygiene        | No runtime dependency added. Type/domain and lint checks passed during implementation. Final format/docs/diff checks passed.                                                                                                                                                                                                                               |

An initial browser run exposed missing explicit dialog focus wrapping and text-query boundaries; fixes retained the assertions. Visual inspection also caught the outgoing configuration temporarily pushing the Cook screen down: outgoing content now overlays its previous position during the bounded fade/movement. Native dialog Escape leaves an explicit Discard action when the underlying stored record is unusable.

## Live API and visual evidence

`node scripts/smoke-environment.mjs http://127.0.0.1:4174/egg-cooker/` passed at **2026-09-15T13:15:52Z**, Chromium **153.0.8010.12**. It ran the production app with public synthetic Berlin coordinates via browser geolocation emulation, then called both actual remote APIs without response mocks. The UI accepted **Local · 1013 hPa**, estimated **7:19**, committed `source: weather`, and stored no coordinates. This establishes live browser-origin access from the local subpath preview; it does **not** establish the deployed GitHub Pages origin or physical-device permission behavior.

Open-Meteo elevation/forecast documentation and terms were rechecked on 2026-09-15. Personal non-commercial free-service use and source attribution remain the intended scope; recheck at release. Credits are available for weather and altitude results and in About. No provider or user coordinates are logged by application code. Source links/provenance remain in the [science record](../product/specifications/0001-mvp-science.md).

Agent inspection of desktop and mobile screenshots confirms distinct target previews, legible egg/countdown and warm off-white/amber presentation. Automated normal-motion frame checks establish intermediate geometry changes and correct reduced-motion anchoring. Screenshots are ignored test artifacts, not human visual acceptance or proof of an engaging continuous animation on an actual phone.

## Criteria and remaining acceptance

- AC-01–04, AC-06–13 and AC-18: automated evidence in domain/adapters/production browser tests. No scientific outcome claim follows from the numerical assertions.
- AC-05: local production-browser live API smoke passed; deployed Pages origin and human/device API smoke Pending.
- AC-14–16: automated sound policy, browser activation/failure, keyboard/focus, axe and layout coverage; human audibility, VoiceOver and actual-device visual/accessibility acceptance Pending.
- AC-17: agent screenshot/frame inspection only; maintainer normal-time animation and arm's-length visual acceptance Pending.
- AC-19: source/asset/privacy review and current provider check completed locally. Publication-specific terms/notices, hosted artifact and source identity review Pending.
- AC-20: actual phone/desktop tab switch, lock/sleep/discard and foreground audibility with OS/browser/build identities Pending. WebKit automation does not certify an iPhone.
- AC-21: the full science record's kitchen trial plan is Pending, including both cooking methods, temperature/doneness combinations, repeated central scenarios and expanded-input boundaries.

FEAT-001 stays **Active (implemented; awaiting acceptance)**. No release is prepared or authorized here. Remaining acceptance requires actual human/device/kitchen observations; do not mark these passed from source tests. Rollback of local changes remains ordinary source review; saved records are model/version checked and never silently migrated.

## Final source and artifact identity

- Environment: macOS Darwin 25.6.0 arm64; Node 24.20.0, npm 11.19.0. Browser binaries: Chromium 153.0.8010.12, Firefox 155.0, WebKit 26.6. These are automated test binaries, not physical-device certification.
- Source: working-tree changes on a private pre-publication Git base. No implementation commit existed yet. `build-info.json` reported that base commit and development version; it did not identify the uncommitted source by itself.
- Final artifact: production `dist/` built with `/egg-cooker/`. SHA-256 of the sorted `sha256  relative-path` manifest (UTF-8, one LF-terminated line per file): `a2599a8fda87e9ef3692ebc18a70cef88b0d0cc948538427db0eacf23c00b707`. The local manifest is retained in `.local/mvp-review/build-manifest.txt`. This fingerprints the checked local artifact without claiming a release.
- Final live smoke against this artifact: passed at `2026-09-15T13:24:19.228Z`; Local · 1013 hPa ⌄; committed weather source, no coordinates persisted.
- Review artifacts: ignored `.local/mvp-review/desktop.png`, `mobile.png`, `cooking.png`, `ready.png`, and a real-running `demo.webm`. The recording uses the actual 60× virtual clock, not manually replaced animation frames. Agent-inspected stills are not maintainer human visual acceptance.
- Final documentation-only evidence update: format, local link and diff-whitespace checks passed. No public publication, physical-device or kitchen acceptance result is inferred.
