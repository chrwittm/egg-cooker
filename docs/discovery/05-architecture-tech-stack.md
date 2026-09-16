# 05 — Architecture and Technology Stack

## Purpose

This document captures the current technology direction and the reasoning behind it.

The project deliberately evaluated alternatives before selecting a framework.

The goal is not to prove one framework universally best. The goal is a low-regret decision fitting:

- this application;
- AI-assisted development with Codex;
- the user's two other current projects;
- future maintainability;
- deployment simplicity.

---

## 1. Application Characteristics

The app is primarily:

- client-side;
- highly interactive;
- animation-heavy;
- mobile-first;
- stateful;
- PWA-oriented;
- offline-capable;
- device-API-aware;
- not content/SEO-first;
- not backend-first;
- not server-rendering dependent.

Likely browser capabilities:

- audio;
- geolocation;
- camera;
- local persistence;
- service worker;
- wake lock where available;
- haptics/notifications where supported.

This is fundamentally an application UI, not a marketing site.

---

## 2. Framework Candidates Considered

Broad set:

- React;
- Vue;
- Svelte;
- Preact;
- Solid;
- Angular;
- Vanilla TypeScript.

Serious final shortlist:

- React;
- Vue;
- Svelte.

---

## 3. React

### Strengths

- largest ecosystem;
- enormous body of examples;
- excellent AI coding precedent;
- broad library compatibility;
- mature testing;
- recognizable reference stack;
- many edge-case solutions.

### Risks/costs

- huge amount of outdated material;
- historical patterns can leak into agent code;
- easy to accumulate unnecessary libraries;
- more ceremony than Svelte for some highly reactive/animated UI.

If selected, guardrails would be:

```text
React + TypeScript + Vite
functional components
modern APIs
no Create React App
no Redux unless justified
```

---

## 4. Vue

### Strengths

- readable single-file components;
- clean Composition API;
- strong reactivity;
- good transitions/animation;
- mature ecosystem;
- strong TypeScript;
- excellent middle ground.

### Risks/costs

- Options API and Composition API coexist;
- agent instructions must choose one;
- smaller corpus than React, though still large.

If selected:

```text
Vue 3
TypeScript
Composition API
<script setup>
Vite
```

---

## 5. Svelte

### Strengths

- excellent fit for reactive, animation-heavy UI;
- concise components;
- strong transitions/animation;
- very good for client-side apps;
- clean state → visual output model;
- low framework ceremony;
- suitable for mobile-first PWA;
- can later be wrapped for desktop if needed.

### Risks/costs

- ecosystem smaller than React;
- Svelte 5 modern runes coexist with legacy examples;
- agents can mix generations without constraints.

Required guardrail:

```text
Svelte 5
TypeScript
runes
Vite
no legacy reactive syntax
```

---

## 6. Why Svelte Is the Current Choice

The decisive new criterion is portfolio-level standardization.

Two other active projects built with Codex already use Svelte.

The decision is therefore:

> **Svelte is a very good fit for this app and creates useful standardization across three active Codex projects.**

Benefits:

- shared mental model;
- common `AGENTS.md` conventions;
- common test stack;
- common repo structure;
- transferable debugging knowledge;
- reusable patterns;
- lower context switching;
- potential reusable tooling;
- opportunity to identify a repeatable path for agentic app development.

This portfolio effect outweighs React's incremental ecosystem advantage here.

---

## 7. Preferred Stack

```text
Svelte 5
TypeScript
Vite
Vitest
Playwright
PWA tooling
ESLint
Prettier
```

Add dependencies only when requirements earn them.

---

## 8. Framework-Independent Domain

Most important architecture rule:

> **Core product logic must not depend on Svelte.**

Conceptually:

```text
Svelte UI
   │
   ├── application/orchestration
   │
   └── domain
        ├── cooking model
        ├── calibration
        ├── scheduling
        ├── virtual clock contracts
        ├── state transitions
        └── units
```

This limits lock-in and greatly improves testing.

---

## 9. Candidate Layering

A possible structure:

```text
src/
  lib/
    domain/
      cooking/
      calibration/
      scheduling/
      units/
      species/

    application/
      cook-session/
      state-machine/
      commands/
      use-cases/

    infrastructure/
      storage/
      geolocation/
      weather/
      audio/
      camera/
      notifications/
      clock/

    ui/
      components/
      animations/
      views/
      themes/

    devtools/
      virtual-clock/
      environment-simulation/
```

Exact structure should be harmonized with the two existing Svelte repositories before adoption.

---

## 10. State Machine

Avoid unrelated booleans:

```ts
isCooking;
isDone;
isPaused;
showFeedback;
isPreparing;
```

Prefer explicit states:

```text
Configuring
Preparing
ReadyToInsert
Cooking
Completed
Cooling
AwaitingFeedback
```

Whether to use a discriminated union, reducer or state-machine library should depend on actual complexity.

Do not install XState automatically.

---

## 11. Clock Abstraction

Time is a core dependency.

Avoid scattered `Date.now()` and `setTimeout()` calls.

Conceptual interface:

```ts
interface Clock {
  now(): number;
}
```

Implementations:

```text
SystemClock
VirtualClock
```

Benefits:

- deterministic tests;
- developer fast-forward;
- state reconstruction;
- no six-minute test runs.

---

## 12. Persistence

Potential split:

### localStorage

Small preferences:

- theme;
- language;
- last settings;
- developer flag.

### IndexedDB

Larger structured data:

- history;
- calibration records.

Do not choose IndexedDB merely because it is available.

Use storage abstractions rather than direct component access.

---

## 13. PWA

Goals:

- installability;
- offline shell;
- bundled sounds;
- core logic offline;
- active cook recovery.

Need deliberate service-worker update policy, especially during active cooking.

---

## 14. Static-First Architecture

The first production version should require no backend.

Browser can handle:

- cooking model;
- timer;
- animation;
- localization;
- audio;
- history;
- calibration;
- camera processing;
- multi-egg schedule;
- developer tools;
- PWA.

This keeps deployment simple.

---

## 15. GitHub Pages as Initial Hosting

Strong fit for a static PWA reference implementation.

Benefits:

- low cost;
- transparent deployment;
- repo + hosting close;
- GitHub Actions;
- easy sharing;
- custom domain possibility.

Hard boundary: no trusted application-server behavior.

A backend becomes necessary for needs like:

- secrets;
- server API proxy;
- accounts;
- cloud sync;
- server-triggered push;
- server-side processing.

---

## 16. Future Backend Boundary

Do not let possible future needs contaminate V1.

Conceptually:

```text
App
 ├── local domain logic
 └── service adapters
       ├── no-backend implementation
       └── future cloud implementation
```

Potential future backend responsibilities:

- push;
- secret-bearing APIs;
- sync;
- accounts;
- telemetry;
- server-side image analysis.

---

## 17. Potential Backend Platform

A lightweight platform such as Cloudflare Workers is a candidate because it can keep operational burden low.

This is not yet a decision.

Choose a backend only after a requirement actually exists.

---

## 18. ChatGPT Sites

Useful as:

- rapid implementation benchmark;
- low-friction prototype;
- alternate implementation experiment.

Less attractive as canonical engineering reference because this project wants explicit control over:

- repo structure;
- testing;
- service worker;
- dependencies;
- CI/CD;
- long-term patterns.

---

## 19. Why Not Next.js by Default

No obvious need for:

- server rendering;
- server components;
- SEO-heavy architecture;
- full-stack framework.

Production engineering does not imply selecting a bigger framework.

---

## 20. Animation Strategy

Start simple:

- SVG;
- CSS;
- Svelte transitions.

Move to:

- Canvas;
- WebGL;

only if requirements/performance justify them.

---

## 21. Camera / Computer Vision

Prefer local browser processing for simple egg geometry.

Potential progression:

- Canvas pixel analysis;
- lightweight custom geometry;
- OpenCV.js only if justified;
- remote/LLM vision only if local approaches fail or broader behavior is needed.

This supports privacy/offline goals.

---

## 22. External API Adapters

Wrap browser/network capabilities:

```text
GeolocationProvider
PressureProvider
SoundAssetProvider
NotificationProvider
```

UI and domain should not know specific endpoints.

---

## 23. Internationalization

Select i18n structure before strings proliferate.

Evaluate library based on:

- pluralization;
- language switching;
- formatting;
- bundle size;
- maintenance.

Do not hand-roll if a mature Svelte-compatible library is clearly better.

---

## 24. Testing Stack

### Vitest

For:

- domain;
- calibration;
- state transitions;
- scheduling;
- persistence;
- UI logic where appropriate.

### Playwright

For:

- full cook flow;
- permission fallbacks;
- offline behavior;
- restore;
- responsive UX;
- key accessibility behavior.

Virtual clock is essential.

---

## 25. CI/CD

Eventual pipeline:

```text
install
typecheck
lint
unit tests
build
E2E tests
deploy
```

Split validation/deploy if useful.

---

## 26. Versioning

Expose version/build ID for diagnostics:

```text
Egg Cooker 0.3.1
commit abc1234
```

---

## 27. Dependency Policy

Every dependency should answer:

1. What problem does it solve?
2. Why are browser/Svelte capabilities insufficient?
3. Is it maintained?
4. What is its license?
5. Is it Svelte 5 compatible?
6. Does it create migration burden?

---

## 28. Cross-Project Standardization

Compare all three projects for:

- Svelte version;
- TypeScript config;
- linting;
- formatting;
- tests;
- folder naming;
- ADRs;
- `AGENTS.md`;
- CI;
- env conventions;
- logging;
- dependency updates;
- release/version patterns.

Details in `08-cross-project-methodology.md`.

---

## 29. Candidate ADRs

```text
ADR-001 Use Svelte 5 + TypeScript + Vite
ADR-002 Keep domain logic framework-independent
ADR-003 Static-first architecture
ADR-004 GitHub Pages for initial hosting
ADR-005 Absolute-time timer model
ADR-006 Virtual clock for tests and dev tools
ADR-007 Local-first persistence
ADR-008 Backend only when a requirement demands it
ADR-009 Sound asset licensing policy
ADR-010 PWA/offline strategy
```

---

## 30. Architectural North Star

Ask:

> **Does this requirement actually force us to introduce this architectural component?**

No backend because "production apps have backends".

No global state library because "large apps use one".

No native app because "this is mobile".

No LLM because "camera sounds like AI".

Architecture should be requirement-driven.
