# Egg Cooker Reference App — Brainstorming Package

> **Current navigation, 2026-09-15:** The foundation already exists. Review [0001 — Quick-cook MVP](../product/specifications/0001-mvp.md) and its changes-from-discovery section. Maintainer review selected two screens, mandatory animation, elevation/weather-pressure inputs and fast-forward within static GitHub Pages; [0002 — Guided cooking](../product/specifications/0002-guided-cooking.md) is deferred in the real backlog. Historical recommendations below for project comparisons, scaffolding, later animation or application backends do not authorize current work. The two direct public environmental APIs are specifically included; no backend/proxy or alternate hosting follows. Discovery is historical rationale, not accepted scope; use the [numbered index](../product/specifications/README.md) for progression.

## Purpose

This folder preserves the discovery and brainstorming work for a deliberately over-engineered egg cooker application.

The project started from a small vibe-coded exercise: select egg size, starting temperature and desired doneness, calculate a cooking time, optionally account for local altitude, and run a countdown. The reference implementation asks what happens when that simple prototype is treated as real software rather than a throwaway demo.

The resulting product should remain extremely simple for the user while becoming increasingly rigorous underneath: better domain modeling, explicit application states, calibration, animation, accessibility, localization, testability, offline/PWA behavior, production hardening, deployment, and eventually optional backend capabilities.

This folder is **discovery material**, not a frozen specification. It deliberately contains:

- confirmed decisions;
- strong preferences;
- speculative ideas;
- rejected alternatives;
- design rationale;
- engineering lessons;
- unresolved questions;
- deliberately excessive feature ideas.

A later project phase should distill this material into formal product, architecture, backlog, testing and operational documentation.

## Guiding Principle

> **Complexity underneath, simplicity on top.**

The user should be able to cook an egg with almost no cognitive load.

The implementation may contain physics models, virtual clocks, state machines, calibration logic, persistence, accessibility handling, localization, offline behavior, computer vision, testing infrastructure and perhaps backend services. None of that should make the normal breakfast experience feel complicated.

## Core Product Thesis

> **Tell me what egg you have and how you like it; the app takes care of everything else.**

The application should support a very fast default flow while allowing deeper scientific and experimental exploration in an optional **Egg Lab**.

## Core Journey

```text
Configure
   ↓
Prepare
   ↓
Commit / Start
   ↓
Cook
   ↓
Alert
   ↓
Remove / Cool
   ↓
Evaluate
   ↓
Calibrate
```

The UI should visibly transform between these states instead of behaving like a static form with a countdown added underneath.

## Status Vocabulary

Interpret ideas using this mental model:

- **Decision** — currently selected direction.
- **Strong candidate** — likely to become part of the reference application.
- **Experiment** — worth prototyping, but not yet justified as a product requirement.
- **Delight** — primarily exists because it makes the product memorable or fun.
- **Research** — domain or technical question that still requires validation.
- **Rejected / constrained** — explicitly not part of the normal product path unless assumptions change.

## Current Major Decisions

### Technology

Current preferred stack:

- **Svelte 5**
- **TypeScript**
- **Vite**
- **Vitest**
- **Playwright**
- PWA capabilities
- browser-first architecture
- static deployment first
- backend only when a requirement genuinely needs one

Svelte was not chosen because it is claimed to be universally superior. It combines:

1. strong fit for a highly interactive, animation-heavy, client-first application;
2. a clean reactive UI model;
3. suitability for mobile-first and desktop/browser experiences;
4. a desire to standardize across three projects currently being developed with Codex;
5. the opportunity to derive a reusable project methodology and repository structure across those projects.

### Architecture

The most important architectural constraint is:

> **Core product logic must not depend on Svelte.**

Physics, cooking-time calculation, calibration, state transitions, virtual clock behavior, multi-egg scheduling, units and persistence contracts should be ordinary TypeScript modules.

Svelte should own the experience, not the domain model.

### Deployment

Preferred progression:

1. entirely client-side application;
2. static hosting, likely GitHub Pages initially;
3. optional backend only for features that genuinely require trusted server-side code, secrets, accounts, cloud synchronization, server-triggered push or similar needs.

This intentionally avoids creating a distributed system merely to boil an egg.

## Folder Contents

- `01-product-vision.md` — product idea, principles, modes, intended scope.
- `02-feature-backlog.md` — broad feature landscape and idea inventory.
- `03-ux-interaction-design.md` — dynamic mobile-first experience and state transitions.
- `04-egg-science-domain-model.md` — physics, assumptions, calibration and research.
- `05-architecture-tech-stack.md` — technology decision and architectural direction.
- `06-production-engineering.md` — what the prototype must gain to become dependable software.
- `07-behind-the-scenes-evolution.md` — private learning narrative and future blog-post source.
- `08-cross-project-methodology.md` — reusable methodology across the three Svelte/Codex projects.
- `09-open-questions-and-research.md` — unresolved questions and research backlog.
- `10-codex-handoff.md` — instructions for turning this discovery package into the real repo.

## What This Folder Is Not

It is not:

- a complete PRD;
- a final backlog;
- an implementation plan;
- a formal architecture specification;
- a promise to implement every feature;
- a mandate to build a backend;
- a claim that every scientific assumption is already validated.

## Recommended Next Step

The first Codex task should be to:

1. read all files in this folder;
2. inspect the other two current Svelte/Codex projects for patterns and lessons;
3. identify common architecture and repo conventions worth standardizing;
4. propose an initial repository structure;
5. distill a formal product scope and phased backlog;
6. propose ADRs for major decisions;
7. propose testing and quality gates;
8. create or propose a project-level `AGENTS.md`;
9. identify contradictions and unresolved decisions;
10. avoid substantial product implementation until that structure has been reviewed.

The goal is to move from rich brainstorming to deliberate engineering without losing the reasoning that produced the decisions.
