# 08 — Cross-Project Engineering Methodology

## Purpose

There are now three active projects being built with Codex.

Two already use Svelte, and the egg cooker is expected to use Svelte as well.

This creates an opportunity bigger than framework reuse:

> **derive a reusable methodology for agentically developed applications.**

The goal is not to force unrelated products into identical architecture.

The goal is to identify decisions that should become a default **golden path**, so every new project does not rediscover:

- folder structure;
- testing;
- formatting;
- agent instructions;
- architecture docs;
- CI;
- release process;
- dependency policy.

---

## 1. Why Standardize

With human teams, standardization reduces onboarding and context switching.

With coding agents, it also reduces prompting and reliability cost.

If every repo uses:

- same Svelte generation;
- similar folders;
- same test runners;
- same docs layout;
- same `AGENTS.md` expectations;

Codex sees familiar patterns repeatedly.

Benefits:

- fewer architecture debates;
- transferable fixes;
- easier review;
- more reliable automation;
- reusable patterns;
- potential template repository.

---

## 2. Standardization Principle

> **Default strongly, deviate deliberately.**

Not:

> Every project must be identical.

Instead:

> New projects start from a known baseline. Deviations need a reason.

---

## 3. Candidate Default Stack

Current likely baseline:

```text
Svelte 5
TypeScript
Vite
Vitest
Playwright
ESLint
Prettier
GitHub Actions
```

PWA is optional.

Backend is not assumed.

---

## 4. Svelte Guardrails

Because Svelte 5 coexists with legacy examples:

```text
Use Svelte 5
Use TypeScript
Use runes
Do not introduce legacy reactive syntax
Prefer current official APIs
```

These should appear in relevant `AGENTS.md` files.

---

## 5. Candidate Repository Skeleton

Validate against existing two repos before adoption.

```text
/
├── AGENTS.md
├── README.md
├── package.json
├── vite.config.*
├── svelte.config.*
├── tsconfig.json
│
├── docs/
│   ├── product/
│   ├── architecture/
│   ├── adr/
│   ├── testing/
│   ├── operations/
│   └── journal/
│
├── src/
│   ├── lib/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   ├── ui/
│   │   └── shared/
│   └── ...
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
└── .github/
    └── workflows/
```

Do not create empty directories merely for architecture theater.

---

## 6. Dependency Direction

Candidate reusable rule:

```text
UI
↓
Application
↓
Domain

Infrastructure implements external interfaces.
```

Domain should not import:

- Svelte;
- browser APIs;
- storage libraries;
- network clients.

This is easy for agents to understand and test.

---

## 7. Documentation Hierarchy

### `README.md`

Operational entry point:

- what;
- install;
- run;
- test;
- build.

### `docs/product/`

- problem;
- scope;
- user flows;
- backlog.

### `docs/architecture/`

- structure;
- data flow;
- state;
- boundaries.

### `docs/adr/`

One file per meaningful decision.

### `docs/testing/`

- strategy;
- fixtures;
- commands;
- philosophy.

### `docs/operations/`

- deployment;
- config;
- rollback;
- production behavior.

### `docs/journal/`

Optional learning notes.

---

## 8. ADR Standard

Lightweight template:

```md
# ADR-XXX — Title

## Status

Accepted / Superseded / Proposed

## Context

## Decision

## Alternatives Considered

## Consequences

## Follow-up
```

Use only for consequential decisions.

---

## 9. `AGENTS.md` as Operating Contract

Potential sections:

### Project purpose

What problem is solved.

### Technology constraints

```text
Svelte 5
TypeScript
runes
```

### Architecture rules

- domain independent from Svelte;
- no direct browser storage from UI;
- external services behind adapters.

### Testing rules

- update tests with behavior;
- virtual clock when time matters;
- never weaken assertions merely to make tests pass.

### Dependency rules

- prefer native APIs;
- explain runtime dependencies.

### Documentation rules

- ADR for major architecture changes;
- docs updated with behavior/architecture changes.

### Agent workflow

Before coding:

1. read relevant docs;
2. inspect patterns;
3. plan nontrivial change;
4. implement smallest coherent slice;
5. run quality gates;
6. summarize decisions.

---

## 10. Definition of Done

Potential baseline:

```text
[ ] behavior implemented
[ ] TypeScript clean
[ ] lint clean
[ ] relevant unit tests
[ ] E2E updated where flow changed
[ ] docs updated if needed
[ ] no unexplained dependency
[ ] accessibility considered
[ ] error states considered
[ ] no secrets committed
```

---

## 11. Quality Commands

Ideally harmonize:

```text
npm run dev
npm run build
npm run check
npm run lint
npm run test
npm run test:e2e
npm run format
```

This consistency is very useful for Codex.

---

## 12. CI Standard

Shared baseline:

```text
install
check/typecheck
lint
unit tests
build
E2E smoke
```

Optional:

- accessibility;
- bundle size;
- dependency audit.

Potential future reusable GitHub workflow.

---

## 13. Environment Configuration

Standardize:

- `.env.example`;
- naming;
- public vs secret variables;
- runtime validation.

Client rule:

> Never put secrets into browser-visible configuration.

---

## 14. Logging / Diagnostics

Common strategy:

- domain errors typed;
- user copy separate from diagnostics;
- production logging intentional;
- debug UI can expose safe state.

---

## 15. Error Model

Potential categories:

```text
Expected domain outcome
Expected recoverable external failure
Unexpected programming error
```

Avoid turning everything into a generic toast.

---

## 16. Testing Conventions

Decide consistently whether unit tests are co-located or centralized.

For Playwright standardize:

- test-ID policy;
- page-object policy;
- fake/virtual time;
- screenshots;
- failure artifacts.

---

## 17. Time and Randomness

Cross-project rule:

> Time and randomness should be injectable when they affect business logic.

This dramatically improves testability.

---

## 18. Persistence Contracts

Cross-project rule:

> Persist explicit schemas, not arbitrary component state.

Version data and test migrations.

---

## 19. API Adapters

Cross-project rule:

> External systems are replaceable adapters.

Avoid scattered `fetch()` in UI.

Use:

```text
ServiceInterface
RealService
FakeService
```

where useful.

---

## 20. Feature Flags / Experiments

For active experiments:

- typed feature flags;
- developer-only panel;
- unfinished features do not leak into normal flow.

---

## 21. Reuse vs Shared Library

Do not immediately create a shared package.

Progression:

```text
copy pattern
→ repeat
→ observe stability
→ extract
```

Possible shared candidates later:

- lint config;
- TS config;
- CI;
- test helpers;
- PWA setup;
- agent template.

Avoid premature monorepo complexity.

---

## 22. Reusable tooling — future consideration

When conventions stabilize across projects, evaluate reusable tooling as a separate, deliberately maintained initiative.

Possible content if this becomes a separate initiative:

```text
Svelte 5 + TS
Vitest
Playwright
ESLint/Prettier
AGENTS.md
ADR template
GitHub Actions
docs skeleton
example layer boundary
```

Keep any extracted resource small and independently maintained.

---

## 23. Project Initialization Methodology

### Phase 1 — Discovery

- brainstorm;
- capture problem;
- collect ideas;
- avoid premature implementation constraints.

### Phase 2 — Distillation

- vision;
- core/non-core;
- journeys;
- open questions.

### Phase 3 — Architecture

- default stack unless requirement says otherwise;
- domain boundaries;
- local/backend;
- ADRs.

### Phase 4 — Skeleton

- scaffold;
- quality commands;
- CI;
- tests;
- `AGENTS.md`.

### Phase 5 — Walking Skeleton

Implement the thinnest end-to-end slice.

Egg example:

```text
configure
→ calculate
→ start
→ virtual timer
→ finish
```

### Phase 6 — Harden

- errors;
- recovery;
- accessibility;
- persistence;
- tests.

### Phase 7 — Expand

Add backlog incrementally.

### Phase 8 — Operate

- release;
- observe;
- update;
- document lessons.

---

## 24. Walking Skeleton as Default Agentic Strategy

Instead of:

> Build the whole architecture.

Ask for the smallest complete vertical slice that exercises:

- domain;
- UI;
- persistence;
- test;
- CI.

Then expand.

This reduces architecture built on assumptions.

---

## 25. Cross-Project Review

Before finalizing egg-cooker structure, Codex should inspect the two existing repos and report:

### Common patterns

- folders;
- scripts;
- dependencies;
- test strategies;
- Svelte idioms.

### Inconsistencies

- naming;
- lint;
- test placement;
- old Svelte patterns;
- missing docs.

### Best patterns

Do not assume Project 1 is automatically the gold standard.

---

## 26. Back-Propagation of Lessons

Not only:

> use Project 1/2 lessons in Egg Cooker.

Also:

> use Egg Cooker learnings to improve Project 1/2.

Possible outcomes:

- normalized `AGENTS.md`;
- CI;
- scripts;
- docs;
- structure.

The three projects become a learning system.

---

## 27. Human Review Points

Agent should stop for deliberate review before:

- framework deviation;
- new backend;
- database;
- auth;
- paid service;
- large dependency;
- major domain-model change;
- destructive data migration.

Human retains architectural ownership.

---

## 28. Task Format

Useful Codex task:

```text
Goal
Context
Constraints
Acceptance criteria
Relevant docs
Commands to run
What not to change
```

More reliable than:

> Improve this.

---

## 29. Agent Feedback Loop

After substantial task, capture:

- what changed;
- tests run;
- unresolved issues;
- architecture impact;
- docs changed.

Could be standardized in PR/final summaries.

---

## 30. Candidate Personal Engineering Principles

1. Default to Svelte 5 + TypeScript for small/medium interactive apps.
2. Keep domain logic framework-independent.
3. Start static/local; backend only when earned.
4. Time and external services are injectable.
5. Tests control time.
6. Prefer native browser APIs before dependencies.
7. ADRs for consequential decisions.
8. Thin vertical slice before broad build-out.
9. Agents operate inside explicit architecture rules.
10. Standardize scripts and quality gates.
11. Persist schemas, not component state.
12. Accessibility/error paths are product behavior.
13. Document why, not just what.
14. Reuse only after repetition.
15. Let later projects improve earlier ones.

Treat these as hypotheses until validated across the three repos.

---

## 31. Questions for Cross-Project Analysis

Ask Codex:

1. What architecture patterns repeat?
2. Which repo has the cleanest layout?
3. Which conventions conflict?
4. Which dependencies are shared?
5. Are all using Svelte 5 idiomatically?
6. Which has strongest test setup?
7. What should default scripts be?
8. What belongs in a template?
9. What remains project-specific?
10. What patterns benefit agents most?
11. Which existing choices should be changed?
12. Can CI be shared?
13. Can `AGENTS.md` be partly standardized?
14. Are there common anti-patterns Codex itself introduced?
15. What should the golden path be for Project 4?

---

## 32. Methodology North Star

The goal is not bureaucracy.

> **Make the next project easier to start correctly than incorrectly.**

If methodology adds more friction than it removes, simplify it.
