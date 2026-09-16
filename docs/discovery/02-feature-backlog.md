# 02 — Feature Backlog

## Purpose

This file captures the broad idea space discussed so far. It is intentionally larger than a realistic first release.

Use these classifications:

- **Core**
- **Strong candidate**
- **Advanced**
- **Experiment**
- **Delight**
- **Research**
- **Rejected / constrained**

## A. Core Cooking Inputs

### Egg weight — Core

Internally use grams.

UI can show familiar size labels as context:

```text
61 g — M
63 g — L
```

A slider should visually cross S/M/L/XL boundaries while keeping grams primary.

### Starting temperature — Core

Normal presets:

- fridge, approximately 8°C in the current household context;
- room, approximately 20°C.

Egg Lab may allow exact temperature.

### Desired doneness — Core

Prefer a visual continuum:

```text
runny → soft → jammy → medium → firm
```

Later map user-facing states to model target temperatures.

### Number of eggs — Core/Research

Support quantity as user context. Whether quantity needs a timing correction requires evidence.

## B. Cooking Method

### Immersion — Core

Egg submerged in boiling/near-boiling water.

### Steam/minimal-water mode — Core or Strong candidate

A small water layer under a lid; the egg cooks in steam.

Working hypothesis:

```text
base model
+ method correction
+ personal calibration
```

rather than unrelated timing systems.

### Method profiles — Advanced

Potentially store:

- steam/small pot;
- immersion/medium pot;
- calibration offset;
- removal delay.

Do not expose by default.

## C. Location, Altitude and Pressure

### Location-based altitude — Strong candidate

Optional automatic lookup, with manual fallback.

### Atmospheric pressure — Advanced/Research

Potential flow:

```text
location
→ current surface pressure
→ boiling point
→ cooking correction
```

Core cooking must still work if this network enhancement fails.

### Visible correction — Delight

Optional readout:

```text
Local boiling point ~98.x°C
Environmental correction +12 sec
```

## D. Guided Cooking

### Preparation guidance — Strong candidate

Potential flow:

1. add small amount of water;
2. put lid on;
3. bring to boil;
4. insert egg;
5. confirm "Eggs are in";
6. start timer.

Kettle-first process may be explored, but energy claims need evidence.

### Commit moment — Core UX

"Eggs are in" should create the absolute target timestamp and transition the UI into cooking mode.

### Removal guidance — Strong candidate

Completion should be unmistakable:

```text
EGG OUT.
NOW.
```

### Removal-time compensation — Advanced/Strong candidate

If the user needs 10 seconds to physically stop the cooking process, alarm can be scheduled 10 seconds before theoretical endpoint.

## E. Timer Experience

### Absolute target timestamp — Core engineering

Use:

```text
targetEndTime = startTime + duration
remaining = targetEndTime - now
```

Do not trust uninterrupted JavaScript intervals as the source of truth.

### Large active display — Core

During cooking, configuration controls disappear/collapse.

### Pause — Decision needed

A physical egg cannot pause. Default likely **Stop/Cancel**, not Pause.

### Timer recovery — Core production

Persist enough to reconstruct an active cook after reload/reopen.

## F. Digital Egg / Thermal Visualization

### Animated cross-section — Strong candidate / signature

Show heat moving inward, white becoming opaque and yolk changing consistency.

### Visualization modes — Advanced

Possible:

- visual doneness;
- temperature;
- experimental "protein state".

### Time scrubbing — Experiment

In Egg Lab, allow inspecting predicted state at different times.

## G. Calibration

### Post-cook evaluation — Strong candidate

```text
Much too soft
Slightly too soft
Perfect
Slightly too firm
Much too firm
```

### Personal correction — Strong candidate

Start with a simple correction term rather than overfitting per pot/method/doneness too early.

### Calibration confidence — Advanced

Possible:

```text
Standard model   6:12
Your correction +0:21
Recommended      6:33
Based on 12 cooks
```

### Reset — Required if calibration ships

User can inspect/reset stored calibration.

## H. Multi-Egg Breakfast Scheduler

### Multiple preferences — Strong candidate / differentiator

Example:

```text
Person A — L — jammy
Person B — L — soft
Guest    — M — firm
```

### Scheduling strategies — Advanced

- different start times;
- different removal times;
- hybrid/minimum-actions.

### Timeline UI — Delight

```text
Hard egg    ━━━━━━━━━━━━━━━━🔔
Jammy egg      ━━━━━━━━━━━━━🔔
Soft egg          ━━━━━━━━━━🔔
```

## I. Sound System

### Species identity — Strong candidate / Delight

| Species | Progress           | Completion          |
| ------- | ------------------ | ------------------- |
| Chicken | cluck/chirp        | rooster crow        |
| Duck    | quiet quack        | larger quack        |
| Goose   | soft honk          | emphatic honk       |
| Quail   | short call         | longer call         |
| Ostrich | low/boom-like call | dramatic final call |

### Asset policy — Production

Prefer:

1. CC0/public domain;
2. CC BY only if worthwhile;
3. avoid non-commercial licenses for bundled production assets.

Candidate sources discussed:

- Freesound;
- Wikimedia Commons.

Keep `SOUND_CREDITS.md` regardless.

### Sound personalities — Delight

- Quiet — final alarm only.
- Gentle — subtle interval cues.
- Counting Bird — minute 1 one call, minute 2 two calls, etc.
- Chaos — intentionally silly and opt-in.

Do not literally play eight quacks at minute eight; cap or encode after a few minutes.

### Progress cues — Experiment

Alternative to every minute:

- 25%;
- 50%;
- 75%;
- completion.

### Audio preview — Developer feature

Preview species/progress/final sounds instantly.

## J. Haptics and Visual Alerts

- haptic start/completion where supported;
- completion must also be visual;
- sound is never the sole signal.

## K. Other Species

- Chicken — primary/validated target.
- Duck — strong future candidate after validation.
- Quail — strong future candidate after validation.
- Goose — experimental.
- Ostrich — deliberately extreme / Egg Lab.

UI should label model confidence:

```text
Validated
Beta
Experimental
```

## L. Egg Vision / Camera

### Broad-end detection — Experiment

Classical computer vision may be sufficient:

1. segment silhouette;
2. find major axis;
3. compare curvature;
4. identify blunt end;
5. return confidence.

No LLM is inherently needed.

### Low-confidence flow

```text
I'm not sure.
Try Candling Mode.
```

### Candling — Experiment

Try to detect air cell with strong backlight.

Do not overstate freshness inference.

### Dimension estimation — Experiment

Potential mass estimate if a scale reference is present.

### Carton scanner — Advanced/Experiment

OCR:

- size;
- best-before;
- packaging metadata.

## M. Egg Piercing / Eierpikser

Treat as Egg Lab/science topic, not mandatory default behavior.

Potential camera assistance can show where to pierce if user intentionally chooses it.

Need authoritative research before final product guidance.

## N. Microwave Mode

### Intact shell — Rejected / safety education

Do not provide shell-egg microwave instructions.

Potential playful educational screen:

```text
🥚💥

Not like that.
```

### Safe microwave preparations — Future research

Cracked/poached/scrambled modes could be separate recipes later.

## O. PWA / Offline

### Installable PWA — Strong candidate

- Home Screen install where supported;
- offline app shell;
- fast startup.

### Offline core — Production

Without network:

- calculation;
- timer;
- bundled sounds;
- history/calibration;
- local defaults.

### Update behavior — Production

Service-worker update must not break an active cook.

## P. Persistence

### Preferences — Core

Possible:

- default weight;
- temperature;
- doneness;
- method;
- sound personality;
- volume;
- removal delay;
- language;
- theme.

### Active cook — Core

Persist enough to restore.

### History — Advanced

Record parameters, recommendation, outcome.

### Schema versioning — Production

Persist explicit schemas, not arbitrary component state.

## Q. History and Statistics — Advanced/Delight

Possible:

```text
Eggs cooked: 83
Favorite: jammy
Average correction: +19 sec
```

## R. Egg Around the World — Content

Potential future content:

- German Frühstücksei;
- œuf à la coque;
- onsen tamago;
- ramen eggs;
- tea eggs.

Different preparations may require separate models.

### Karambolage links — Delight/Content

Link relevant videos rather than re-hosting copyrighted material.

## S. Scientific References

Egg Lab should eventually explain:

- model;
- assumptions;
- research references;
- validated versus experimental behavior.

## T. Energy / Sustainability

### Water optimizer — Research

Estimate sensible minimal water for steam mode.

Do not create dry-boiling risk.

### Energy comparison — Experiment

Compare water quantities or processes under explicit assumptions.

## U. Smart Home / External Integrations — Future

Potential Home Assistant:

- kitchen lights;
- speaker announcement;
- dashboard timer.

Optional only.

Watch/companion alerts can be explored without forcing a native app.

## V. Localization — Production

Design i18n early.

Beyond text:

- units;
- decimal formatting;
- egg-size conventions;
- pluralization;
- date/time;
- future RTL possibility.

## W. Accessibility — Production

- sound alternatives;
- reduced motion;
- screen-reader semantics;
- large text;
- large touch targets;
- no color-only meaning.

## X. Developer / Admin / Testing Mode

### Virtual clock — Core engineering

```text
1×
10×
60×
600×
```

Same abstraction should power tests.

### Jump to state

- Configure;
- Heating;
- Cooking;
- 30 seconds remaining;
- Done;
- Feedback.

### Environment simulation

- sea level;
- high altitude;
- pressure variants;
- location denied;
- audio blocked;
- offline;
- corrupted/stale storage.

### Completion preview

Never wait six minutes to test an alarm.

### Background/resume simulation

Test "app suspended for four minutes".

## Y. Product Content

Basic cooking guide.

Potential explainers:

- why cool;
- why/why not pierce;
- why altitude matters;
- why microwave shell eggs are rejected.

## Z. Feature Triage Questions

Before implementing an idea:

1. Does it improve reliability?
2. Does it reduce user effort?
3. Does it add significant delight?
4. Does it teach something valuable?
5. Can it live in Egg Lab instead of cluttering normal use?
6. Does it introduce a backend/permission that is actually justified?
7. Is the scientific claim strong enough?
8. Can it be tested deterministically?
9. Does it create ongoing operational cost?
10. Would we still want it if it were not fun to implement?
