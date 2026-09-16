# 01 — Product Vision

## Working Concept

The product is a mobile-first egg cooker application that begins as an intentionally simple timer and evolves into a polished reference implementation of real product engineering.

At its simplest:

1. select what egg you have;
2. select its starting temperature;
3. select desired doneness;
4. optionally account for local boiling conditions;
5. start cooking;
6. receive a clear completion signal.

At its most ambitious, the same application becomes a small scientific cooking instrument:

- personalized calibration;
- animated thermal model;
- guided cooking workflow;
- multi-egg breakfast scheduling;
- species-specific sound identities;
- computer-vision experiments;
- offline PWA;
- history and feedback loops;
- transparent scientific assumptions;
- robust engineering and testability.

The product should never feel like a control panel merely because the implementation underneath becomes sophisticated.

## Product Thesis

> **Tell me what egg you have and how you like it; the app takes care of everything else.**

The product should optimize for confidence and delight rather than expose every variable by default.

A user who cooks the same breakfast every morning should eventually need almost no interaction.

## Why This Product Exists

### 1. It should be genuinely useful

The finished application should be good enough that its author would actually use it for breakfast.

That implies:

- reliable timing;
- remembered preferences;
- graceful recovery after interruption;
- clear alarms;
- good defaults;
- low interaction cost;
- fast startup;
- offline-capable core behavior.

### 2. It should be unusually delightful

Examples:

- a digital egg visibly cooks as the timer progresses;
- a duck egg quacks;
- a goose egg honks;
- a chicken may use clucks during progress and a rooster at completion;
- the UI transforms when cooking begins;
- optional silly modes can exist without harming the serious flow.

### 3. It should be scientifically explainable

The app should not merely contain unexplained hard-coded timing tables.

Where possible, timing should be based on an explicit model with documented assumptions:

- egg weight;
- initial temperature;
- desired final state;
- boiling temperature;
- altitude or pressure;
- cooking method;
- calibration correction.

When empirical corrections are needed, they should be modeled as such rather than disguised as universal physics.

### 4. It should demonstrate the difference between prototype and product

The project began from a typical vibe-coding exercise where visible functionality is easy.

The reference implementation explores everything that becomes relevant afterward:

- architecture;
- state;
- errors;
- testability;
- accessibility;
- localization;
- persistence;
- background behavior;
- offline behavior;
- licensing;
- deployment;
- maintenance.

This learning dimension is captured separately in `07-behind-the-scenes-evolution.md`.

## Design Principles

### Complexity underneath, simplicity on top

The interface should not reveal a complicated model unless the user asks for it.

### Make state visible

The interface should feel different when the user is configuring, preparing, cooking, removing and evaluating.

### The timer is a cooking instrument, not a generic stopwatch

It should know what is being cooked, what state the egg is theoretically in, and what the user must do next.

### Defaults improve over time

Calibration and persistence should reduce friction.

### Playfulness is optional

Bird sounds, animations and experimental features should delight rather than annoy.

### Scientific uncertainty is explicit

Where the model is approximate, say so rather than create false precision.

### Core behavior survives without network

Cooking an egg should not fail because a weather API is unavailable.

### Safety can override novelty

A reference product gains credibility by occasionally saying **no**, for example to intact-shell microwave cooking.

## Primary Usage Modes

### Quick Cook

Purpose: fastest possible daily use.

```text
🥚 63 g / L
❄️ 8°C
🟠 Jammy
♨️ Steam

6:23

[ COOK ]
```

Most values should remember the previous/default choice.

### Guided Cook

Purpose: lead the user through the complete process.

Possible sequence:

1. prepare water;
2. heat water;
3. confirm boiling;
4. place egg(s);
5. start;
6. monitor;
7. alert;
8. remove;
9. cool;
10. rate outcome.

### Egg Lab

Purpose: expose the nerdy layer.

Possible controls:

- exact weight;
- exact starting temperature;
- target temperature;
- altitude or pressure;
- boiling-point calculation;
- calibration data;
- steam/immersion comparison;
- thermal visualization;
- other species;
- egg orientation;
- candling;
- energy comparison;
- scientific references.

## Product Differentiators

### Personalized calibration

Close the loop after cooking.

```text
How was it?

Much too soft
Slightly too soft
Perfect
Slightly too firm
Much too firm
```

Eventually:

```text
Base model            6:12
Your kitchen offset  +0:18
Removal compensation -0:10
Recommended           6:20
```

Calibration is likely one of the strongest differentiators because it adapts theory to real equipment and personal taste.

### Multi-egg scheduling

Support different eggs/preferences in one breakfast.

Possible strategies:

- different insertion times and common removal;
- common insertion and different removal;
- hybrid schedule optimized for understandable kitchen actions.

### Digital egg

Show a visual approximation of the changing internal state instead of a generic progress circle.

### Sound identity by bird

Chicken, duck, goose, quail and possibly ostrich receive distinct sound personalities.

### Transparent science

Make the timing model, assumptions and uncertainty explorable.

## Non-Goals for the First Production Iteration

Do not make these mandatory just because they were brainstormed:

- user accounts;
- social network;
- cloud history;
- machine-learning backend;
- LLM integration;
- native mobile app;
- exact computational fluid dynamics;
- every bird species;
- smart-home integration.

The architecture should remain local and browser-first until a concrete requirement earns additional complexity.

## Desired Product Personality

The app should feel:

- precise;
- friendly;
- slightly nerdy;
- visually calm while cooking;
- playful at completion;
- trustworthy;
- not overloaded.

## Success Criteria

### Usability

- repeat cook can start in seconds;
- countdown readable at arm's length;
- user always knows what to do next;
- accidental navigation does not silently destroy the timer.

### Reliability

- timer recovers after backgrounding/reload where technically possible;
- time is based on absolute target timestamps;
- offline core cooking continues;
- API failure cannot prevent core operation.

### Engineering

- cooking logic independently testable;
- clock virtualizable;
- end-to-end tests do not wait real cooking durations;
- major state transitions explicit;
- persistence has a versioning strategy.

### Product quality

- installable PWA where supported;
- accessibility alternatives for sound/motion;
- localization architecture before text proliferates;
- sound/external asset licenses documented.

## Product North Star

> **Does this make cooking the desired egg easier and more reliable, or is it merely technically impressive?**

If a feature is technically impressive but harms the basic flow, it belongs in Egg Lab, developer mode, or nowhere.
