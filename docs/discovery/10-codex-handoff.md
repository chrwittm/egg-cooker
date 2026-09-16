# 10 — Codex Handoff

## Context

This `docs/discovery/` folder is the result of an extended product and engineering discussion.

It intentionally contains more ideas than should be implemented.

Your next job is **not** to code the entire backlog.

Your job is to convert rich discovery material into a deliberate project foundation.

---

## 1. How to Interpret These Files

Treat them as:

- discovery;
- rationale;
- candidate requirements;
- architectural hypotheses;
- research questions.

Do **not** treat every idea as:

- mandatory V1 scope;
- confirmed science;
- accepted architecture.

Where files distinguish:

- Decision;
- Strong candidate;
- Experiment;
- Research;
- Rejected;

preserve those distinctions.

If you find contradictions, surface them.

Do not silently resolve consequential ambiguity.

---

## 2. Current Technology Direction

Unless cross-project analysis reveals a strong reason otherwise:

```text
Svelte 5
TypeScript
Vite
Vitest
Playwright
```

Use modern Svelte 5 patterns.

Prefer runes.

Avoid legacy Svelte syntax unless explicitly justified.

---

## 3. Most Important Architecture Rule

> **Domain logic must remain independent of Svelte.**

Plain TypeScript should contain:

- cooking model;
- units;
- calibration;
- multi-egg scheduling;
- core state transitions where practical;
- timing calculations;
- persistence schemas/contracts.

Svelte is the UI/presentation layer.

---

## 4. Static First

Do not introduce backend in initial skeleton unless a requirement already proves it necessary.

Target initial shape:

- static app;
- PWA-capable;
- GitHub Pages-friendly.

Create clean seams for future backend services rather than implementing them prematurely.

---

## 5. Compare the Other Two Projects

Before finalizing egg-cooker repository structure, inspect the user's two other active Svelte/Codex projects.

Produce an analysis covering:

1. Svelte versions and idioms;
2. folder structures;
3. shared dependencies;
4. package scripts;
5. Vitest usage;
6. Playwright usage;
7. lint/format setup;
8. CI;
9. docs;
10. `AGENTS.md`;
11. environment strategy;
12. recurring patterns;
13. recurring mistakes;
14. best ideas to standardize;
15. conventions that should remain project-specific.

Do not assume the oldest project is the best template.

The goal is a **portfolio-level golden path**.

---

## 6. Proposed First Deliverables

Before substantial product code, propose/create:

```text
README.md
AGENTS.md

docs/
  product/
  architecture/
  adr/
  testing/
  operations/
  science/
  journal/   (optional)
```

Suggested initial docs:

```text
docs/product/product-spec.md
docs/product/phased-backlog.md

docs/architecture/overview.md
docs/architecture/state-model.md

docs/adr/ADR-001-svelte-stack.md
docs/adr/ADR-002-framework-independent-domain.md
docs/adr/ADR-003-static-first.md
docs/adr/ADR-004-virtual-clock.md

docs/testing/strategy.md

docs/science/cooking-model.md
docs/science/research-log.md
```

Adjust after cross-project analysis.

---

## 7. Proposed First Engineering Task

After structure is agreed, build a **walking skeleton**.

Smallest vertical slice:

1. configure chicken egg mass;
2. choose starting temperature;
3. choose doneness;
4. calculate duration through domain module;
5. press Start;
6. transition to cooking state;
7. use absolute target time;
8. virtual clock can fast-forward;
9. completion state appears;
10. one Playwright test covers the flow.

No digital twin, camera, backend or multi-species yet.

The purpose is to validate:

- domain boundary;
- UI structure;
- clock;
- test strategy;
- scripts;
- CI.

---

## 8. Architecture Questions to Answer Early

Explicitly answer:

1. SvelteKit or plain Svelte/Vite for routing/PWA/project needs?
2. What exact structure best harmonizes with the other two projects?
3. How is application state represented?
4. How does clock abstraction work?
5. How is persistence versioned?
6. How are browser/external APIs wrapped?
7. Which PWA tooling?
8. How is i18n structured?
9. How is developer-only functionality hidden/excluded in production?
10. How do GitHub Pages base paths/custom domains affect routing/service workers?

Do not add libraries until answers justify them.

---

## 9. Agent Working Rules

For nontrivial changes:

1. read relevant docs;
2. inspect existing patterns;
3. state intended change;
4. implement smallest coherent slice;
5. add/update tests;
6. run quality commands;
7. summarize:
   - behavior;
   - tests;
   - architecture impact;
   - unresolved questions.

---

## 10. Dependency Rules

Before adding a runtime dependency:

- explain required capability;
- check browser/Svelte support;
- check maintenance;
- check license;
- verify Svelte 5 compatibility;
- avoid overlapping libraries.

---

## 11. Science Rules

Never invent cooking constants just to make UI work.

For scientific parameters:

- identify source;
- mark confidence;
- isolate in domain/config data;
- add tests;
- document assumptions.

If evidence is missing, create a research item.

---

## 12. Safety Rules

Do not implement intact-shell microwave instructions.

If microwave mode exists, treat it as:

- warning;
- education;
- potentially separate safe cracked-egg recipes later.

Food-safety claims need source validation.

---

## 13. Asset Rules

For bundled sounds:

Preferred:

```text
CC0 / public domain
```

Second choice:

```text
CC BY with attribution
```

Avoid:

```text
non-commercial licenses
```

Track every asset in a credits/provenance file.

---

## 14. UX Rule

The active cook must not look like a static settings form with a timer added.

Signature transition:

```text
configuration
→ commit
→ configuration recedes
→ cooking instrument takes over
```

This should shape component/state architecture.

---

## 15. Testability Rule

The developer must never wait five or six real minutes to test completion.

Clock supports deterministic acceleration/jumps.

Developer Time Machine and automated tests should ideally share the same abstraction.

---

## 16. Do Not Prematurely Implement

Do not start with:

- backend;
- cloud database;
- auth;
- LLM integration;
- OpenCV dependency;
- WebGL;
- complex state library;
- huge design system;
- shared package across all three projects.

Earn each through requirements.

---

## 17. Cross-project methodology output

Capture reusable engineering lessons, but keep them as findings rather than claiming a finished reusable project foundation. Any later extraction is a separate initiative after repeated patterns have proved stable across projects.

---

## 18. Desired Mindset

The objective is not:

> generate a lot of code.

The objective is:

> turn a small idea into software whose structure makes future changes safer and easier.

Optimize for:

1. clarity;
2. testability;
3. maintainability;
4. explicit assumptions;
5. low operational complexity;
6. delightful user experience.

---

## 19. First Codex Output Requested

Before implementation, produce a proposal with:

### A. Repository comparison

Findings from the other two Svelte projects.

### B. Proposed golden-path conventions

What should become standard across projects.

### C. Egg Cooker repo structure

Concrete directories/files.

### D. Initial formal docs

What to distill from `docs/discovery/`.

### E. ADR list

Which decisions need ADRs now.

### F. Walking skeleton plan

Smallest end-to-end implementation.

### G. Open questions

Only questions that materially block the first engineering phase.

Avoid asking for clarification where a safe, reversible default can be chosen and documented.
