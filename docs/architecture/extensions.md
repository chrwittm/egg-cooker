# Add capabilities when the product needs them

These are implementation recipes, not preinstalled modules or claims that the application supports them. Recheck current primary documentation and dependencies when activating a recipe.

## PWA / offline

**Trigger:** installation and offline use are accepted product behavior. Evaluate maintained Vite PWA tooling, define manifest identity/icons and scope/base path, and version the cache strategy. Specify first visit offline, previously installed offline, storage clearing, stale assets, and update recovery. Do not let a service-worker update interrupt an active user operation.

Add tests for install/offline after first load, restart, updates between two actual builds, and network fallback. Test real iOS/Safari and Android behavior before promising background alarms or installation details. Service workers do not make a browser an always-running alarm service. For a timer, use an absolute deadline plus an injected clock; specify resume/clock-change behavior and visual fallback. A previous app bundle may need compatibility with a newer persisted schema, so rollback includes cache/data considerations.

## Desktop with Electron

**Trigger:** filesystem/native integration or self-contained desktop distribution justifies a shell. Keep native privileges in the main process and a small typed preload/API surface where needed; keep renderer Node access disabled, context isolation and sandboxing enabled, validate IPC, navigation, external links, and permission requests. Bundle required workers/assets locally.

Add package/make scripts and tests that exercise the actual installed artifact, restart behavior, filesystem boundaries, cleanup, and identity/version. Decide supported OS/architecture, signing/notarization and update policy. A Chromium or renderer test does not verify native packaging. Audit the whole build tree: Electron can be declared a dev dependency while supplying the shipped runtime. Resurface's local-server shell is a different design from a renderer + IPC shell; choose deliberately.

## Backend / SvelteKit

**Trigger:** accepted needs for shared data, accounts, server routes, or server-rendering. Record the trust boundary and deployment model first. Evaluate SvelteKit and adapters for that target. Authentication alone is insufficient: enforce ownership/authorization on every relevant operation and test with two users.

Add environment validation, secret handling, database/schema migrations, bounded input handling, timeouts, logs with redaction, health checks, backup/restore drills, and a rollback/forward-recovery plan. Test the hosted artifact with persistent volumes and restart behavior. A server, database, authentication library, and Docker image are not part of the static baseline.

## Local persistence

**Trigger:** users expect data to survive reload. Choose localStorage only for small simple records; consider IndexedDB for larger/structured data. Define schema version, validation, migration, export/delete, quota behavior, corruption recovery, and multi-tab behavior. Keep source data read-only when that is a product promise. Test migration from real older fixtures, interrupted writes where applicable, and a successful recovery; never use private user files as disposable test data.

## Localization and performance

**Trigger:** more than one locale is in scope. Before broad UI growth, centralize product messages, use `Intl` for number/date formatting, and select message/plural/fallback handling. Avoid concatenating translated sentence fragments; test longer text and language persistence when implemented. The one-language demo does not install an i18n framework.

**Trigger:** measured delay or memory pressure affects the user. Record a representative fixture, device, metric, and budget, then optimize the specific path. Workers, lazy modules, virtualization, and caching each add lifecycle responsibilities. Test failure and cleanup alongside speed; do not add them only because a different project used them.
