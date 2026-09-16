# ADR 0001 — Browser-first Svelte foundation

**Status:** Accepted for Egg Cooker 0.1.0.
**Date:** 2026-09-12

## Context

The portfolio shares Svelte, TypeScript, Vite, npm, and Vitest, but has different deployment needs. Memory Atlas uses a browser-native core in Electron. Resurface's newer foundation uses SvelteKit, a server, authentication, SQLite, and a desktop shell. The egg-cooker discovery calls for a mobile/browser application and later PWA capabilities. A universal copy of either complete app would import unnecessary responsibilities.

## Decision

Use Svelte 5 with runes, strict TypeScript, Vite, plain CSS, Vitest, Playwright, lint/format checks, and GitHub Actions. Keep the domain independent of the UI and external APIs. Start with a static application and one useful example. Treat PWA, Electron, SvelteKit/server, storage, internationalization libraries, and state-machine libraries as extensions earned by requirements.

Adopt the documentation lifecycle of context → accepted spec → optional plan → verification, with one small status pointer for multi-session work. Use Apache-2.0 as the reusable source-license default, reviewed at initialization. Use one application package/version and a committed npm lockfile.

## Alternatives and consequences

React remains a viable alternative when a product needs a React-only integration or a team requirement changes. Here the existing Svelte knowledge and fit are a sufficient reason to avoid reopening the framework comparison. SvelteKit is appropriate for requirements that need its routing/server capabilities; adopting it here would increase the application's scope without serving the accepted requirements.

Copied conventions mean dependency updates must be ported deliberately. A shared package or monorepo could centralize them but couples release cadences and creates another maintained product. Prefer independent repositories until repeated use shows which interfaces are stable.

## Revisit triggers

New server-rendered routes, accounts/shared data, required native capabilities, a library incompatibility or concrete pain maintaining repeated conventions. Record a focused successor ADR instead of rewriting this history or forcing unrelated projects into one architecture.
