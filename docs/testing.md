# Testing and verification

Tests are feedback about product contracts. More tests do not automatically mean more confidence; cover the paths whose failure would affect the user and the boundaries most likely to regress.

| Command                 | What it establishes                                                             |
| ----------------------- | ------------------------------------------------------------------------------- |
| `npm run check`         | Svelte/TypeScript consistency and a domain check without DOM/Node ambient types |
| `npm run lint`          | Code and selected architecture conventions                                      |
| `npm run format:check`  | Consistent source/document formatting                                           |
| `npm run check:docs`    | Local Markdown file targets exist; not anchor or external-URL validity          |
| `npm test`              | Pure rule tests and script regression tests                                     |
| `npm run test:coverage` | Diagnostic domain coverage report; no arbitrary global percentage gate          |
| `npm run verify`        | All source/document checks, tests, and production build                         |
| `npm run test:e2e`      | Browser tests against an already built `dist/`                                  |
| `npm run verify:all`    | Full normal completion/CI gate, including production-browser tests              |
| `npm run audit:all`     | Current npm advisory lookup for the complete dependency tree; needs network     |

## Baseline evidence

The [accepted MVP matrix](product/specifications/0001-mvp.md) assigns domain, integration, Playwright, artifact and human evidence. The [delivery record](delivery/2026-09-15-mvp-verification.md) records actual automated results and pending human checks. Its [science record](product/specifications/0001-mvp-science.md) separates verified reference calculations from kitchen validation.

The old checklist tests were replaced by the MVP domain, adapter and cooking-journey suites described below. Browser tests run Chromium, Firefox, and mobile-viewport WebKit. A real browser tests integration; the framework-independent rules do not need jsdom. Add component tests if they offer clearer/faster coverage for a complex component, rather than installing every testing layer at initialization.

Browser tests use roles and labels, no fixed sleeps, and no retry allowance to hide flakiness. The preview server uses a strict port and will not silently reuse another running app. HTML reports, traces, and failure screenshots are ignored locally and uploaded on CI failure with short retention. Use synthetic data; traces may contain page content.

For subpath verification (such as Pages), build and test with the same path:

```sh
BASE_PATH=/example/ npm run verify:all
```

`test:e2e` alone does not rebuild; after code or config changes use `verify:all`. This intentional separation allows browser tests to exercise exactly the artifact that will be packaged, without a hidden rebuild. The release workflow runs it immediately after the build.

## Growth rules

- Keep calculations and state transitions deterministic. Inject clocks, random sources, and external systems when their behavior matters. Never wait through a real multi-minute operation in automated tests.
- Add integration tests for storage, files, API boundaries, migrations, and resource cleanup when introduced. Mock an external dependency to exercise failures; also exercise the real integration before claiming it works.
- Use small, versioned synthetic or provenance-cleared fixtures. Test malformed inputs and independent failure isolation.
- Prefer assertions on outcomes over component internals or giant snapshots. New critical flow → browser test; new data contract → compatibility/migration tests; new package/platform → actual artifact smoke test.
- Measure performance on representative data/hardware before setting a budget. Record both metric and environment.

## What automation does not establish

Playwright WebKit is not proof of every iPhone/Safari behavior. axe is not a complete accessibility audit. Before a tester/public release, perform a keyboard-only pass, visible-focus check, zoom/reflow on a narrow viewport, readable errors, and a screen-reader sanity check on the actual supported device. For device permissions, media, offline/PWA, backgrounding, and packaging, perform the relevant real-device checks and record version/artifact identity.

Record a failed or unavailable check honestly. An environment skip is not a pass. The release record must distinguish source verification, artifact verification, human acceptance, and deployment smoke results.

## Quick-cook MVP verification

Domain tests check the science fixtures, numerical convergence, monotonicity, category/input boundaries, all illustration anchors, exact timer boundaries, virtual-clock changes and strict recovery records. Browser-adapter tests exercise consented pipeline sequencing, cancellation/late callbacks, API errors and byte/deadline limits, storage failures and real-time reminder policy. Browser tests use controlled Date samples (no real-minute cooking waits) and synthetic coordinates/responses, with actual sessionStorage for recovery.

Run the required subpath gate explicitly:

```sh
BASE_PATH=/egg-cooker/ npm run verify:all
```

The optional live endpoint smoke uses the actual production app with synthetic public Berlin coordinates, never the maintainer's location. In one terminal serve the already built subpath artifact, then run the smoke in another:

```sh
BASE_PATH=/egg-cooker/ npm run preview -- --port 4174
node scripts/smoke-environment.mjs http://127.0.0.1:4174/egg-cooker/
```

This checks live endpoint access from a local browser origin. Deployed Pages origin, actual-device permissions/audio/background behavior, human visual/VoiceOver and kitchen acceptance remain separate. Do not make the deterministic completion gate depend on third-party uptime. See [MVP evidence](delivery/2026-09-15-mvp-verification.md).
