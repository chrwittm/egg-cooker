# Experimental 0.1.0 publication readiness

**Status:** Public source published and initial CI verified; tag, release workflows and deployment not performed.
**Scope:** First public source publication and GitHub Pages preparation for the accepted quick-cook MVP.

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
- GitHub Pages uses GitHub Actions as its source. No workflow was dispatched and no site was deployed during this checkpoint.

## Verification

Run on macOS/Darwin arm64 with Node 24.20.0 and npm 11.19.0:

```sh
BASE_PATH=/egg-cooker/ npm run verify:all
npm run audit:all
```

Result on 2026-09-16: formatting, lint, Svelte/TypeScript checks, local documentation links and production build passed; 92 domain/adapter tests, 1 release-script test and 132 Playwright checks across Chromium, Firefox and WebKit passed. The complete dependency audit reported zero vulnerabilities.

## First source publication

- Local `main` through `b97d7a8` (`Record GitHub publication settings`) was pushed to `origin/main` on 2026-09-16.
- GitHub Actions [Verify run 35105737402](https://github.com/chrwittm/egg-cooker/actions/runs/35105737402) completed successfully in 2m16s. Its published Vitest summary reported 2 passing test files and 92 passing tests.
- No release tag was created, no release workflow was dispatched and no Pages deployment was performed.

## External steps after the checkpoint

1. Create annotated `v0.1.0`, run `npm run release:check -- v0.1.0`, push the tag and run **Release candidate**.
2. Inspect the candidate artifact/checksum, mark the GitHub release as a prerelease, then dispatch **Deploy Pages** for `v0.1.0`.
3. Smoke-test the live URL, asset/reload behavior, `/egg-cooker/build-info.json`, consented location and denied/offline fallbacks. Record the tag, commit, workflow runs and hosted URL without overstating kitchen or device evidence.
