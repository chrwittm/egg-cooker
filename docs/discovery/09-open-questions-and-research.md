# 09 — Open Questions and Research Backlog

## Purpose

This file prevents future agents from silently converting uncertainty into implementation assumptions.

Each item should eventually become one of:

- answered;
- tested;
- accepted assumption;
- deferred;
- rejected.

---

## A. Product Scope

### A1. What is V1?

Likely candidates:

- chicken eggs;
- grams + familiar size label;
- fridge/room temperature;
- doneness;
- steam/immersion;
- timer;
- dynamic cooking UI;
- sound alarm;
- local preferences;
- PWA;
- tests.

Not frozen yet.

### A2. What defines the "reference" milestone?

Possible signature features:

- calibration;
- digital egg;
- multi-egg scheduler;
- developer Time Machine.

Do not require every brainstormed experiment before calling the app useful.

---

## B. Cooking Science

### B1. Which theoretical formula?

Research and document:

- equation;
- source;
- assumptions;
- implementation;
- benchmark tests.

### B2. Doneness target mapping

What target states/temperatures correspond to:

- runny;
- soft;
- jammy;
- medium;
- firm?

Needs evidence and empirical validation.

### B3. Steam vs immersion correction

Does steam need a measurable method-specific offset?

Action:

- research;
- controlled home experiment.

### B4. Egg quantity

How strongly does quantity affect result under typical conditions?

### B5. Pressure versus altitude

Is live pressure worth the API complexity?

Quantify likely timing difference.

### B6. Carryover after removal

Should model explicitly account for post-removal heat redistribution?

### B7. Removal delay

Clarify semantics between:

- alarm time;
- physical removal;
- cooling;
- thermal target.

---

## C. Calibration

### C1. Feedback scale

Five categories?

Continuous slider?

Visual yolk selector?

### C2. Learning algorithm

How should "slightly too soft" change recommendation?

Candidates:

- fixed offset;
- weighted correction;
- running mean;
- more formal confidence model.

Do not overengineer without data.

### C3. Calibration dimensions

Global?

Per method?

Per doneness?

Per equipment?

Start simple.

### C4. Confidence

Define what "high confidence" actually means before displaying it.

---

## D. Digital Egg

### D1. Decorative or scientific first?

Strong current recommendation:

> prove the UX with simpler visualization before building serious simulation.

### D2. Rendering technology

Options:

- SVG;
- CSS;
- Canvas;
- WebGL.

Start with simplest viable.

### D3. Performance

Test on older/mobile devices.

---

## E. Sound

### E1. Final asset set

Curate:

- chicken cluck;
- rooster;
- duck;
- goose;
- quail;
- ostrich if possible.

### E2. License

Prefer:

- CC0/public domain.

Create `SOUND_CREDITS.md`.

### E3. Ostrich

Likely hardest free/open recording to source cleanly.

Research separately.

### E4. Progress cadence

Which sound mode remains charming instead of becoming annoying?

Needs actual use testing.

---

## F. PWA / Platform

### F1. Minimum browser/platform versions

Decide supported matrix.

### F2. Background alarm limitations

Research exact behavior on:

- iOS PWA;
- Android/Chromium PWA;
- desktop browsers;
- suspended/background tabs.

Do not promise reliability the platform cannot deliver.

### F3. Wake lock

Support matrix and graceful fallback.

### F4. Service-worker update during active cook

Define safe behavior.

---

## G. Camera / Egg Vision

### G1. Broad-end detection

Prototype classical computer vision.

Success criterion:

> robust enough under realistic kitchen lighting/backgrounds?

### G2. Scale reference

Can useful geometry be inferred without a known scale?

### G3. Candling

Can a phone camera/backlight reliably identify the air cell?

### G4. Privacy

Preferred:

> local processing.

Only consider cloud upload if local approaches clearly fail.

---

## H. Piercing

### H1. Default guidance

Need authoritative evidence on:

- cracking reduction;
- hygiene;
- contemporary recommendations.

Do not finalize product wording until sourced.

---

## I. Microwave

### I1. Safety content

Verify exact authoritative guidance and wording.

### I2. Safe microwave preparations

Decide whether these belong in the same product or a later recipe section.

---

## J. Other Species

### Duck

Find reliable science/timing data.

### Quail

Find reliable science/timing data.

### Goose

Evaluate data availability.

### Ostrich

Likely experimental only.

---

## K. Energy

### K1. Minimum steam water

Can it be modeled without risking dry-boiling?

Important before making prescriptive recommendations.

### K2. Kettle efficiency

Do not assume kettle always wins across all stove technologies.

Need nuanced wording.

---

## L. Localization

### L1. Initial languages

Possible:

- English;
- German;
- French.

Not decided.

### L2. Egg-size conventions

Need regional mapping strategy.

---

## M. Persistence

### M1. localStorage vs IndexedDB

Choose based on actual data scope.

### M2. Export

Would history/calibration export be useful?

Later decision.

---

## N. Backend Trigger

Define the first accepted requirement that actually justifies backend.

Candidates:

- reliable server-triggered push;
- cross-device sync;
- accounts;
- telemetry;
- secret-bearing external API.

Do not add backend before one of these is accepted.

---

## O. Hosting

### O1. GitHub Pages

Confirm:

- base-path handling;
- PWA service-worker scope;
- routing;
- custom domain behavior.

### O2. Future backend platform

Cloudflare Workers remains a candidate, not a decision.

---

## P. Cross-Project Standardization

### P1. Inspect the other two repos

Codex needs access to both.

### P2. Determine common conventions

Need evidence before creating a template.

### P3. Identify anti-patterns

Especially:

> What did Codex repeat from Project 1 in Project 2, and was that actually a good pattern?

### P4. Template repository

Create only after stable repeated patterns emerge.

---

## Q. Branding

"Egg Cooker" is functional.

Brand/name can wait.

Do not block engineering on naming.

---

## R. Source and Research Management

Potential standard:

```md
## Claim

...

## Source

...

## Confidence

High / Medium / Experimental

## Product implication

...
```

This could become `docs/science/`.

---

## S. Decision Priority

### Resolve before coding skeleton

- repo methodology;
- Svelte 5 conventions;
- domain boundary;
- initial scope;
- test/clock strategy.

### Resolve during first vertical slice

- timer state model;
- persistence minimum;
- basic formula.

### Resolve before public production

- platform support;
- accessibility;
- asset licenses;
- safety copy;
- PWA update behavior.

### Can wait

- candling;
- ostrich;
- Home Assistant;
- energy dashboard;
- advanced statistics.
