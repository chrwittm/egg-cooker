# Current work

**State:** Experimental 0.1.0 prerelease and GitHub Pages deployment published and smoke-tested.
**Active item:** Observe the accepted [living MVP](../product/specifications/0001-mvp.md) in personal use; treat further behavior as additional feature work.
**Next action:** Record kitchen observations under [TECH-001](backlog.md) without treating anecdotal results as completed calibration; triage the automated dependency-update pull requests separately.

## Handoff

- Product decision: the current MVP interaction and presentation are accepted for an experimental 0.1.0 release; later behavior is additional feature work.
- Choice: category transitions occur halfway between anchors (1.25 and 1.75), with the higher category selected at the boundary. Exact continuous timing, preset centers and temperature behavior are preserved.
- Layout: Location data heading and its single-line city/pressure summary share a compact header with Refresh. Standard/source feedback remains when no name exists; source details remain in About.
- Documentation: reconciled the living MVP, continuous-controls specification, science presentation note, context, user guide and changelog.
- Publication boundary: sanitized source, annotated tag `v0.1.0`, the public experimental prerelease and the GitHub Pages deployment are published. The tag identifies reviewed source commit `703faa0`; later commits may record evidence or future work without moving the tag.
- Repository settings: professional description, Pages URL and teaching/technology topics are public; private vulnerability reporting, dependency graph, Dependabot alerts/security updates and the GitHub Actions Pages source are enabled.
- Hosted evidence: [final source Verify run 35106135159](https://github.com/chrwittm/egg-cooker/actions/runs/35106135159), [Release candidate run 35107353296](https://github.com/chrwittm/egg-cooker/actions/runs/35107353296) and [Deploy Pages run 35117563126](https://github.com/chrwittm/egg-cooker/actions/runs/35117563126) passed. The deployment build reported 92 passing Vitest tests and deployed in 3m04s.
- Published outputs: [experimental 0.1.0 prerelease](https://github.com/chrwittm/egg-cooker/releases/tag/v0.1.0) and [live Egg Cooker](https://chrwittm.github.io/egg-cooker/). The tested archive SHA-256 is `b068318a509e01c61ab6b086838cfcb505369df485f9b4b1b39767606ef1aa49`.
- Hosted smoke test: the page, hashed JavaScript/CSS assets and `build-info.json` returned HTTP 200; build identity was version `0.1.0` at `703faa0fdcca3df926b151496bd366d517c05251`; the configure, Cooking and Ready states loaded and the base-path reload returned to a usable configuration. Real-location transmission was not authorized for this check, so deployed provider acceptance remains outstanding rather than being reported as passed.
- Current evidence: [texture/location follow-up](../delivery/2026-09-16-texture-location-verification.md). The final publication gate passed: 92 domain/adapter tests, 1 release-script test and 132 browser checks across Chromium, Firefox and WebKit. Final phone renders were inspected, including largest-egg fit at 390 × 740.
- Prior evidence: [interaction/science/locality/sound polish](../delivery/2026-09-16-interaction-polish-verification.md), [continuous controls and lazy refresh](../delivery/2026-09-15-continuous-controls-verification.md). These are historical results, not proof of this follow-up.
- Workflow maintenance: GitHub successfully forced the pinned Pages and artifact actions from their deprecated Node 20 runtime onto Node 24, but the warnings should be removed in a future maintenance change by reviewing and pinning supported action revisions. Do not move the published tag.
- Backlog validation: kitchen calibration ([TECH-001](backlog.md)) and broader actual-device evidence ([TECH-002](backlog.md)); limitations remain disclosed in the app and public docs.
- Deferred features: Guided (0002), calibration/feedback behavior, history, broader preferences, PWA and other non-goals.
