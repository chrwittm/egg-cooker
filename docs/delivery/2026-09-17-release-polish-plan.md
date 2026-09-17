# Plan — v0.1.1 language, identity and alarm polish

**State:** Complete
**Date:** 2026-09-17
**Accepted specification:** [0005 — v0.1.1 release polish](../product/specifications/0005-release-polish.md), P-01–P-11.
**Delivery tracking:** [Specification index and delivery ledger](../product/specifications/README.md).

## Outcome and constraints

Deliver the accepted bilingual interface, matching Location data surface, Bold egg icon set and bundled warm rooster Ready call while preserving the two-screen cook journey, session schema, location consent, calculation and foreground-only alarm boundary. Keep the application a static GitHub Pages site with no runtime asset hosts, new permissions or offline/PWA promise.

## Steps

1. Add a complete typed English/German catalog, validated explicit language preference and locale-aware presentation/lookup behavior; verify language changes leave cook and recovery state untouched.
2. Align the Location data surface and add the base-path-safe manifest, favicon and Bold egg icon exports.
3. Promote the accepted warm rooster derivative into the browser-audio adapter with non-overlap, stop and synthesized-fallback behavior.
4. Extend focused adapter and browser coverage, then reconcile the living product/user/privacy/licensing/release records.

## Verification and review

Run focused Vitest and Playwright checks during implementation, then `BASE_PATH=/egg-cooker/ npm run verify:all`. Inspect built metadata/assets and German layouts at 320 px, 390 × 740 and 200% text zoom. Automated evidence cannot establish actual iPhone speaker quality, Safari/Home Screen playback or OS icon-cache refresh; record those as manual acceptance pending.

## Documentation and rollback

Update the living MVP/context, user guide, privacy and asset credits, changelog, backlog/status, specification ledger and dated verification evidence. The language preference is removable site data and does not migrate active cooks. Reverting the feature code/assets restores the prior English/generated-tone presentation without changing the versioned cook schema; an old Home Screen installation may retain a cached icon until removed and re-added.

## Handoff

The canonical current step and continuation remain in [status](../planning/status.md).
