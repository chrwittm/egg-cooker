# 06 — Production Engineering

## Purpose

A vibe-coded prototype tends to optimize for visible success.

Production engineering is mostly the work required to make that visible success dependable.

Central observation:

> **Vibe coding disproportionately optimizes for the happy path.**

The prototype works when:

- permissions succeed;
- APIs respond;
- users enter sensible values;
- the browser stays open;
- timers fire as expected;
- storage contains valid data;
- the network works;
- users follow the intended sequence.

Engineering begins with everything after the word **when**.

---

## 1. Maturity Model

### Prototype

Question:

> Can it work?

Typical characteristics:

- happy path;
- direct UI logic;
- hard-coded assumptions;
- little/no testing;
- manual deployment.

### Engineered Application

Question:

> Is it correct?

Adds:

- domain separation;
- explicit state;
- deterministic logic;
- unit tests;
- validation;
- type safety.

### Production Application

Question:

> Is it reliable?

Adds:

- recovery;
- failure handling;
- offline behavior;
- accessibility;
- CI/CD;
- migration;
- observability;
- security;
- performance.

### Product

Question:

> Is it useful, understandable, maintainable and pleasant over time?

Adds:

- thoughtful UX;
- calibration;
- supportability;
- documentation;
- product decisions;
- operational ownership.

---

## 2. Requirements Hardening

Prototype concepts are often vague:

- soft;
- large egg;
- use altitude;
- play a sound.

Production needs definitions:

- what gram ranges map to labels?
- what exactly is "jammy"?
- what happens if pressure lookup fails?
- does timer survive reload?
- is Pause physically meaningful?
- which browsers/platforms are supported?

Requirements hardening does not mean a giant upfront specification. It means eliminating ambiguity where correctness depends on it.

---

## 3. Domain Separation

Cooking-time logic should not live in Svelte components.

Same for:

- calibration;
- multi-egg scheduling;
- units;
- core state transitions.

Benefits:

- testability;
- reuse;
- transparency;
- easier framework migration;
- fewer hidden UI assumptions.

---

## 4. Explicit State Model

Prototype risk:

```text
isCooking = true
isDone = true
isPaused = true
```

Impossible combinations emerge.

Production direction:

- explicit states;
- valid transitions;
- side effects triggered deliberately.

---

## 5. Input Validation

Examples:

- implausible weight;
- negative temperature;
- unsupported species;
- malformed persisted data;
- unavailable location;
- nonsense pressure response;
- Start pressed twice;
- system clock changed drastically.

Validate at boundaries.

---

## 6. Deterministic Time

Production rule:

> The source of truth is an absolute start/end time, not an interval callback count.

Need to handle:

- browser throttling;
- backgrounding;
- sleep;
- reload;
- expired cook on resume;
- system clock anomalies where relevant.

---

## 7. Virtual Clock

First-class engineering capability.

Used by:

- unit tests;
- Playwright;
- developer Time Machine;
- demos.

If a six-minute cook requires a six-minute test, the architecture is wrong.

---

## 8. Error Handling

Every external capability can fail.

### Geolocation

Fallback to manual/default environment.

### Weather/pressure

Fallback to altitude estimate or standard pressure.

### Audio

Fallback to visual/haptic.

### Storage

Fallback safely; warn only if user impact matters.

### Service worker

Do not let update mechanics break an active cook.

---

## 9. Recovery

Answer explicitly:

- reload while cooking;
- browser killed/reopened;
- device wakes after target;
- stale active cook from yesterday;
- storage migration failure;
- timezone change;
- system clock change.

Not every platform can guarantee an alarm after full suspension. Product claims must match platform reality.

---

## 10. Offline Behavior

Core requirement:

> No network should be required to finish an already-started cook.

Offline should support:

- local calculation;
- timer;
- bundled sound;
- digital egg;
- preferences/history.

Network enhancements degrade gracefully.

---

## 11. Testing Pyramid

### Unit

Highest concentration:

- formula;
- calibration;
- state machine;
- scheduler;
- units;
- persistence migration;
- environmental correction.

### Integration

- storage adapters;
- API adapters;
- sound scheduling;
- PWA logic where practical.

### End-to-end

Critical paths:

- configure → start → finish;
- fast-forward completion;
- background/resume;
- offline;
- permission denied;
- restore active cook;
- multi-egg next action;
- calibration.

---

## 12. Regression Fixtures

Once real cooking experiments exist, preserve scenarios such as:

```text
Chicken
63 g
8°C
steam
jammy
environment X
expected recommendation Y ± tolerance
```

This protects the model from accidental changes.

---

## 13. Developer Tools as Infrastructure

Debug/admin UI should be first-class.

Capabilities:

- virtual clock;
- state jump;
- fake environment;
- sound preview;
- forced permission states;
- offline simulation;
- storage inspection/reset.

These are especially valuable in agentic development because Codex can exercise states directly.

---

## 14. Observability

Keep proportionate.

### Local diagnostics

Developer screen may show:

- app version;
- inputs;
- model output;
- active state;
- persisted record.

### Remote error reporting

Optional later.

### Analytics

Only if product learning justifies privacy cost.

Do not add analytics merely because "production apps have analytics".

---

## 15. Privacy

Potentially sensitive inputs:

- location;
- camera images;
- history.

Principles:

- permissions at point of use;
- process locally where possible;
- avoid image uploads if local CV works;
- explain local storage;
- allow reset/delete.

---

## 16. Security

Even static apps need discipline:

- never embed secrets;
- validate external JSON;
- sanitize remote content;
- HTTPS;
- audit dependencies;
- security headers where possible;
- avoid unsafe HTML injection.

Future backend adds:

- auth;
- authorization;
- rate limiting;
- secret management;
- server input validation.

---

## 17. Dependency Hygiene

Prototype failure mode:

> install packages until the error disappears.

Production:

- justify each package;
- lock versions;
- check license;
- monitor maintenance;
- remove unused packages;
- understand transitive risk.

---

## 18. TypeScript Strictness

Use strict typing early.

Benefits for agentic development:

- fast feedback;
- clearer contracts;
- fewer runtime assumptions;
- easier Codex reasoning.

Avoid `any` as default escape hatch.

---

## 19. Persistence and Migration

The first stored value creates future migration work.

Recommended:

- version schemas;
- centralize serialization;
- migration tests;
- never persist arbitrary component state as a long-term format.

---

## 20. Localization

Design structurally early.

Need:

- message IDs;
- pluralization;
- formatting;
- language persistence;
- fallback language.

Do not plan to "translate later" after strings are scattered everywhere.

---

## 21. Accessibility

Production requirement, not polish.

Need:

- screen reader state;
- keyboard support for desktop;
- contrast;
- scalable text;
- reduced motion;
- sound alternatives;
- non-color cues.

Automate what can be automated, manually test what cannot.

---

## 22. Performance

Potential hotspots:

- animated egg;
- camera processing;
- sound assets;
- service-worker cache;
- history growth.

Optimize from measurements, not fear.

Do not jump prematurely to WebGL/workers.

---

## 23. Responsive Design

Test explicitly at:

- small phone;
- large phone;
- tablet;
- desktop.

Mobile-first should not mean broken on Mac.

---

## 24. PWA Hardening

Test:

- install;
- offline after install;
- update;
- active cook during update;
- cached sounds;
- restart;
- stale assets.

---

## 25. CI

Every pull request should eventually prove:

```text
typecheck
lint
unit tests
build
E2E smoke
```

Potential additions:

- accessibility;
- dependency audit;
- bundle threshold.

---

## 26. CD

Deployment must be repeatable.

Avoid:

- manual upload;
- undocumented local build;
- branch mysteries.

GitHub Pages deployment should be automated.

---

## 27. Release Management

Even small apps benefit from:

- version;
- release notes;
- rollback;
- build identifier.

If a deployment breaks timer behavior, restoring a known build should be simple.

---

## 28. Documentation

Minimum useful documentation:

### README

- what;
- run;
- test;
- build;
- deploy.

### Architecture

- layers;
- dependency direction;
- state.

### ADRs

- why major choices were made.

### Science

- formula;
- assumptions;
- evidence.

### Assets

- licensing/provenance.

### Operations

- deploy;
- rollback;
- update.

---

## 29. Licensing

Track:

- source-code license;
- sound assets;
- icons;
- illustrations;
- external content;
- third-party dependencies.

Preferred sound policy:

- CC0/public domain;
- CC BY when worth it;
- avoid NC for bundled production assets.

---

## 30. Food Safety and Claims

Distinguish:

- cooking preference;
- food-safety guidance;
- experimental modes.

Do not imply that runny eggs are risk-free for everyone.

Safety claims require source documentation.

---

## 31. Browser / Platform Matrix

Decide:

- minimum iOS/Safari;
- Chromium;
- Firefox;
- desktop Safari;
- PWA differences.

Prefer feature detection over fragile user-agent logic.

---

## 32. Product Decisions Matter

Production quality includes saying no.

Examples:

- reject intact-shell microwave timer;
- no backend before needed;
- no full scientific cockpit in normal mode;
- no camera permission on launch;
- no native app merely because mobile is primary.

---

## 33. Operational Ownership

Once public, someone owns:

- dependency updates;
- broken APIs;
- model corrections;
- bugs;
- browser regressions;
- asset licensing.

A project can be small and still need ownership.

---

## 34. Suggested Production Readiness Gate

### Functional

- primary cook flow;
- supported inputs;
- timer recovery.

### Correctness

- domain tests;
- benchmarks;
- explicit assumptions.

### Reliability

- offline;
- background/resume;
- failure fallback.

### UX

- mobile;
- desktop;
- accessibility;
- reduced motion;
- sound alternatives.

### Engineering

- CI;
- versioning;
- deterministic clock;
- dependency policy.

### Operations

- deployment documented;
- rollback documented;
- asset/license record.

---

## 35. Meta-Lesson

> **Visible functionality is the beginning of engineering, not the end.**

The point is not to make egg boiling absurdly complicated.

The point is to show where legitimate complexity appears once software is expected to survive real users and real environments.
