# Experimental 0.1.0 publication readiness

**Status:** Experimental 0.1.0 prerelease and GitHub Pages deployment published and smoke-tested.
**Scope:** First public source publication, release and GitHub Pages deployment for the accepted quick-cook MVP.

## Source and history

- The public branch is based on GitHub's existing license commit and adds sanitized source baseline `a5235f4` (`Publish experimental Egg Cooker MVP`).
- The baseline uses the repository-scoped GitHub noreply identity. The former private development lineage and complete pre-publication working state are retained only in ignored `.local/pre-public-history-2026-09-16.bundle`.
- Current files and the proposed public branch were scanned for real household names, personal email addresses, private paths, secret-like values and tracked local/build artifacts. No such publishable data was found. Public methodology now requires role labels or clearly synthetic examples and full-history review before publication.
- The repository-specific project generator, template provenance and related tests were removed. Reusable-tooling extraction remains a separate future initiative, not an Egg Cooker product capability.

## Public presentation and release posture

- README, package/project metadata, privacy, security, licensing, changelog, product context, status and specification ledger now describe the actual repository and expected Pages URL.
- The current interaction and presentation are accepted as the MVP. Version 0.1.0 is explicitly experimental: cooking estimates are not kitchen-calibrated and broader actual-device evidence is not claimed.
- Kitchen calibration is [TECH-001](../planning/backlog.md); broader device/audio/accessibility/background evidence is [TECH-002](../planning/backlog.md). New behavior belongs in additional feature work.
- A synthetic standard-conditions screenshot is committed and its provenance recorded. No personal place or location result appears in it.
- Open-Meteo non-commercial/educational terms and BigDataCloud client-side fair-use requirements were rechecked on 2026-09-16; the current consented browser-only integrations remain within the documented intended use.

## Automation update

The Pages workflow still pins actions by immutable commit SHA. `actions/upload-pages-artifact` was updated from generation 3 to the exact generation-4 commit documented for custom Pages workflows: `7b1f4a764d45c48632c6b24a0339c27f5614fb0b`. This preserves supply-chain pinning while moving to the supported action interface; it is not a floating `@v4` reference.

## GitHub repository settings

Verified on 2026-09-16 before the first source push:

- The repository description, expected Pages URL and the topics `svelte`, `typescript`, `vite`, `playwright`, `github-pages`, `agentic-engineering`, `vibe-coding` and `educational` are published.
- Private vulnerability reporting, the dependency graph, Dependabot alerts and Dependabot security updates are enabled. Existing secret protection and push protection remain enabled.
- GitHub Pages uses GitHub Actions as its source.

## Verification

Run on macOS/Darwin arm64 with Node 24.20.0 and npm 11.19.0:

```sh
BASE_PATH=/egg-cooker/ npm run verify:all
npm run audit:all
```

Result on 2026-09-16: formatting, lint, Svelte/TypeScript checks, local documentation links and production build passed; 92 domain/adapter tests, 1 release-script test and 132 Playwright checks across Chromium, Firefox and WebKit passed. The complete dependency audit reported zero vulnerabilities.

## Publication results

- Local `main` through release-evidence commit `703faa0` (`Record initial publication verification`) was pushed to `origin/main` on 2026-09-16.
- GitHub Actions [Verify run 35105737402](https://github.com/chrwittm/egg-cooker/actions/runs/35105737402) completed successfully in 2m16s. Its published Vitest summary reported 2 passing test files and 92 passing tests.
- Final pre-tag [Verify run 35106135159](https://github.com/chrwittm/egg-cooker/actions/runs/35106135159) also completed successfully for `703faa0`.
- Annotated tag `v0.1.0` identifies commit `703faa0fdcca3df926b151496bd366d517c05251`. Local `npm run release:check -- v0.1.0` passed before the tag was pushed.
- [Release candidate run 35107353296](https://github.com/chrwittm/egg-cooker/actions/runs/35107353296) passed in 3m06s. The downloaded artifact's outer GitHub digest was `70eb98e8d52017fd49502230e3af2c0fc1c5c34b77e44c62770c779f92dded4`; the packaged `app-0.1.0.tar.gz` checksum was `b068318a509e01c61ab6b086838cfcb505369df485f9b4b1b39767606ef1aa49`.
- The archive, checksum and evidence were inspected, extracted and served locally. Build identity matched version `0.1.0`, commit `703faa0`; assets loaded and the primary demo entered Cooking.
- The [Egg Cooker 0.1.0 GitHub release](https://github.com/chrwittm/egg-cooker/releases/tag/v0.1.0) was published as a prerelease with the approved archive, `SHA256SUMS` and `evidence.json`. A fresh download of the public archive matched the approved SHA-256 checksum.

## GitHub Pages deployment

- [Deploy Pages run 35117563126](https://github.com/chrwittm/egg-cooker/actions/runs/35117563126) built and tested the exact tag commit, then deployed successfully in 3m04s. Its build summary reported 2 passing test files and 92 passing tests.
- The live app is [https://chrwittm.github.io/egg-cooker/](https://chrwittm.github.io/egg-cooker/). The root page, hashed JavaScript and CSS assets and `/egg-cooker/build-info.json` returned HTTP 200. Build information reported `{"version":"0.1.0","commit":"703faa0fdcca3df926b151496bd366d517c05251"}`.
- Browser smoke testing verified the configure screen, transition into Cooking, transition to Ready and a usable base-path reload. No console-visible startup failure occurred.
- The live check did not grant the hosted page access to real coordinates and did not transmit them to the external providers. Automated coverage for consent, denial, stale and offline behavior passed, but deployed-origin provider acceptance remains untested and is not claimed here.
- GitHub emitted Node 20 deprecation warnings for pinned `actions/configure-pages`, `actions/upload-artifact` and `actions/deploy-pages` revisions while successfully forcing them onto Node 24. This is future workflow maintenance, not a release failure; supported replacements must be reviewed and pinned by immutable SHA in a later change.
