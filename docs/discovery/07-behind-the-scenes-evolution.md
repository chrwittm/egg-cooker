# 07 — Behind-the-Scenes Evolution and Learning Narrative

## Purpose

This project is primarily a private product and engineering exploration.

Some lessons may later influence professional teaching material, but the project itself should not be structured as a workshop artifact.

The better framing is:

> **A behind-the-scenes record of how a trivial vibe-coded idea evolves into deliberately engineered software.**

This file preserves that narrative so it can later become:

- a blog post;
- a series of notes;
- a case study;
- personal learning material;
- selected professional insights.

---

## 1. Origin Story

The starting point is intentionally mundane:

> Build an egg cooker.

The first version is something an AI coding system can create quickly:

- egg size;
- starting temperature;
- doneness;
- timer;
- perhaps altitude.

It works.

That is the first important moment:

> **Visible functionality arrives almost immediately.**

The interesting question is what happens next.

---

## 2. Central Narrative

Possible future blog title:

> **I vibe-coded an egg timer in 20 minutes. Then I spent a day turning it into software.**

Alternative framings:

- From Vibe Coding to Agentic Engineering: The Egg Cooker
- How Much Engineering Can Hide Behind a Six-Minute Egg?
- Building the Most Over-Engineered Egg Timer I Actually Want to Use
- The Difference Between "It Works" and "I Would Ship It"

The exact title is not important now.

---

## 3. Evolution Stages

### Stage 0 — Idea

> How long should I cook this egg?

### Stage 1 — Vibe-Coded Prototype

- static UI;
- simple inputs;
- countdown;
- basic calculation.

Learning:

> LLMs are extraordinarily fast at generating visible functionality.

### Stage 2 — Better Product UX

Questions:

- Why are controls still visible while cooking?
- Why a generic progress ring rather than an egg?
- What should start/finish feel like?
- Can app remember me?

Learning:

> Product quality is not merely adding features. It is designing states and transitions.

### Stage 3 — Domain Rigor

Questions:

- mass or size?
- starting temperature?
- boiling point?
- steam or immersion?
- kitchen offset?

Learning:

> An apparently trivial app has a real domain model.

### Stage 4 — Personalization

Calibration appears:

```text
theoretical model
+ kitchen/equipment correction
+ personal preference
```

Learning:

> The product can become better than a static reference table by closing the loop.

### Stage 5 — Reliability

Questions:

- browser background;
- timer throttling;
- reload;
- network failure;
- denied permissions;
- device sleep.

Learning:

> The happy path is only one execution path.

### Stage 6 — Testability

The developer does not want to wait six minutes.

Virtual clock appears.

Then it becomes useful for:

- developer UI;
- tests;
- demos;
- state reconstruction.

Learning:

> Testability features often improve architecture.

### Stage 7 — Production Engineering

Now:

- TypeScript;
- tests;
- explicit state;
- persistence;
- migration;
- accessibility;
- i18n;
- CI/CD;
- licensing;
- offline strategy.

Learning:

> "Production" is not a hosting target. It is a quality property.

### Stage 8 — Architectural Discipline

Framework selection becomes explicit.

Alternatives considered:

- React;
- Vue;
- Svelte;
- others.

Decision shifts toward Svelte because:

- strong app fit;
- two other Codex projects already use it;
- standardization has portfolio value.

Learning:

> Technology choices improve when considered across projects rather than in isolation.

### Stage 9 — Portfolio Methodology

Question expands:

> What can be standardized across all three projects?

Potential output:

- common repo layout;
- `AGENTS.md`;
- quality gates;
- test stack;
- ADR format;
- CI;
- docs structure.

Learning:

> Repeated agentic projects can produce a personal engineering platform.

---

## 4. Turning Points Worth Preserving

### "The UI should move when the egg goes into the pot."

Shift from static form to stateful experience.

### "The progress bar should be the egg itself."

Domain becomes interface.

### "Tell me afterward whether it was perfect."

Feedback loop and personalization.

### "I need fast-forward because I am not waiting six minutes."

Virtual clock and testability.

### "What happens if the browser goes to sleep?"

Platform reality enters the design.

### "Maybe the round end can be detected with the camera."

Local computer vision.

### "Microwave mode."

Followed by:

> Don't do that with an intact egg.

Safety becomes a product decision.

### "Different eggs should make different bird sounds."

Delight creates real asset/licensing work.

### "Maybe Svelte because my other projects already use it."

Framework choice becomes portfolio strategy.

---

## 5. Learning Questions

Recurring reflection prompts:

1. What did vibe coding solve almost for free?
2. What became difficult only after dependability mattered?
3. Which problems were product rather than coding problems?
4. Which architecture choices improved agent performance?
5. Where did testability force better design?
6. Which features did we reject even though an agent could build them?
7. When did a backend become genuinely justified?
8. What patterns repeated across other projects?
9. Which agent-generated patterns required human correction?
10. Which decisions deserve to become methodology?

---

## 6. Suggested Project Diary

Possible structure:

```text
docs/journal/
  2026-09-12-framework-decision.md
  ...
```

Template:

```md
# Decision / Experiment

## What changed

## Why

## What Codex proposed

## What was accepted/rejected

## What we learned

## Follow-up
```

Capture meaningful turning points, not every commit.

---

## 7. Preserve Failed Ideas

Do not only document success.

Worth preserving:

- initial React default;
- reconsideration toward Svelte;
- backend temptation;
- incorrect physics assumptions;
- static UI versions;
- removed dependencies;
- browser capability failures.

Failure is often the most interesting engineering material.

---

## 8. Milestones for Storytelling

Possible tags:

```text
v0.1-prototype
v0.2-engineered-core
v0.3-pwa
v0.4-calibration
v0.5-digital-egg
v0.6-multi-egg
v1.0-reference
```

Could also use snapshot tags rather than formal releases.

---

## 9. Visual History

Capture meaningful stages:

- configuration screen;
- cooking screen;
- final alarm;
- developer Time Machine;
- digital egg;
- mobile/desktop.

A future article becomes stronger when it can visually compare the 20-minute version with the engineered result.

---

## 10. Keep the Narrative Honest

The conclusion should not be:

> vibe coding is bad.

More interesting:

> vibe coding dramatically lowers the cost of getting to a working idea, but does not remove the need for product judgment and engineering discipline.

Similarly:

> agentic engineering is not "write a bigger prompt."

It is closer to:

- define problem;
- constrain architecture;
- give agents testable environments;
- review decisions;
- build feedback loops;
- iterate with evidence.

---

## 11. Possible Future Blog Structure

1. 20 Minutes
2. The First Awkward Question
3. The Domain Is Real
4. The App Learns
5. Six Minutes Is Too Long
6. The Browser Is Not a Stopwatch
7. Product Quality
8. Architecture
9. Standardizing Agentic Projects
10. What "Production Ready" Actually Meant

This is future content material, not current scope.

---

## 12. Relationship to Professional Work

Some principles may later be useful professionally:

- prototype vs production;
- agent guardrails;
- testability;
- repo templates;
- framework standardization;
- requirements hardening.

But the private project should remain free to explore playful/excessive ideas that would not belong in professional training.

Professional reuse is downstream, not the design goal.

---

## 13. Narrative North Star

The interesting story is not:

> Look how many features an egg timer can have.

It is:

> **Look how many different forms of engineering become visible once a trivial prototype is treated as software someone should actually depend on.**
