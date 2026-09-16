# 03 — UX and Interaction Design

## Purpose

The defining UX idea is that the application should **change shape as the cooking process changes**.

Most simple egg timers behave like static forms:

```text
[settings]
[settings]
[settings]

05:42
```

The reference application should not.

Once the egg is physically in the pot, changing the original configuration is usually irrelevant and may even be confusing. The interface should therefore transition from **configuration** into **instrument mode**.

---

## 1. Mobile-First Assumption

The primary experience is a phone beside the stove.

Implications:

- portrait-first;
- thumb-friendly controls;
- very large active timer;
- minimal tiny text during cooking;
- readable from a short distance;
- no hover-dependent interactions;
- safe touch targets;
- motion should communicate state, not decorate every action.

Desktop/Mac behavior can expand layout but should not redefine the interaction model.

---

## 2. Overall State Model

Conceptual product states:

```text
Idle / Configure
      ↓
Preparation
      ↓
Ready to Insert
      ↓
Cooking
      ↓
Near Completion
      ↓
Completed / Remove
      ↓
Cooling
      ↓
Evaluation
      ↓
Idle / Calibrated
```

Additional technical states may exist:

```text
Restoring persisted cook
Offline
Permission request
Permission denied
Error / degraded mode
```

Developer-only states should be accessible through a hidden or explicit debug panel.

---

## 3. Configuration Screen

### Intent

Make configuration tactile and immediately understandable.

Do not expose the full domain model.

### Central egg identity

Could visually show:

```text
🥚
63 g
L
```

with an egg illustration that subtly changes scale.

### Weight control

Preferred:

- slider;
- grams as primary value;
- S/M/L/XL as contextual label.

Example:

```text
          63 g
S ─── M ──●─ L ─── XL
```

As user moves the slider, label transitions at size boundaries.

Possible haptic tick when crossing a category boundary.

### Starting temperature

Simple segmented choice:

```text
❄️ Fridge     🌡 Room
8°C           20°C
```

Egg Lab can expose custom numeric temperature.

### Doneness

Prefer a visual continuum rather than plain labels.

Example:

```text
runny → soft → jammy → medium → firm
```

Could show yolk illustrations.

### Method

If both methods ship:

```text
♨️ Steam
💧 Immersed
```

Do not make users repeatedly choose a method if preference can be remembered.

### Number of eggs

Simple stepper or visual count.

Multi-person scheduling is a separate advanced flow rather than forcing complex per-egg configuration into normal mode.

---

## 4. The Start / Commit Transition

This should be one of the signature UX moments.

Before start:

```text
[configuration content]

             [ COOK ]
```

When user confirms egg placement:

1. Start is pressed.
2. Target cook is committed.
3. Configuration panel moves upward.
4. The former bottom action visually travels toward the top.
5. It transforms into a small Stop/Cancel action.
6. Large active timer and digital egg take over.

Spatial metaphor:

> We have moved from planning into execution.

The user should feel that the egg is now **in process**.

---

## 5. Cooking Screen

### Primary goal

At a glance, answer:

1. How long remains?
2. Is the timer still running?
3. Is anything required from me now?

Everything else is secondary.

### Proposed composition

```text
[ Stop / Cancel ]                     [sound]



                     5:42



                  (digital egg)



             Cooking — no action yet
```

Optional small context:

```text
63 g · jammy · steam
```

Full configuration controls do not remain visible.

---

## 6. Digital Egg as Progress Indicator

### Why not a generic ring?

A ring communicates abstract percentage.

A digital egg can communicate:

- progress;
- physical interpretation;
- product identity;
- scientific model;
- delight.

### Visual concept

At start:

- white visually raw/translucent;
- yolk liquid;
- temperature effect concentrated outside.

As cooking progresses:

- heat moves inward;
- albumen becomes opaque;
- yolk changes consistency/color;
- final desired state becomes visually obvious.

### Levels of sophistication

#### Level 1 — Decorative interpolation

Map normalized progress to visual states.

#### Level 2 — Domain-informed interpolation

Use model-estimated layer temperatures.

#### Level 3 — Digital twin

Approximate radial heat flow and meaningful internal values.

Do not jump to Level 3 before Level 1 proves the UX.

---

## 7. Near-Completion State

The last 30–60 seconds can become subtly more urgent.

Possible changes:

- egg visually close to target;
- countdown gains emphasis;
- optional short haptic;
- bird makes a subtle cue depending on sound mode.

Avoid anxiety-inducing behavior.

---

## 8. Completion

Completion must feel qualitatively different from progress.

Possible sequence:

1. final bird call;
2. haptic;
3. visual screen transformation;
4. huge instruction.

Example:

```text
🐓

EGG OUT.
NOW.

[ Removed ]
```

If removal delay is configured, the alert happens early enough that actual cooking ends near the modeled target.

---

## 9. Cooling Step

After removal:

```text
Cool briefly under cold water.

[ Done ]
```

Do not insist on an ice bath as the only valid method.

Final wording should later reflect validated guidance.

---

## 10. Evaluation and Calibration

The egg may need to be opened before judgment.

Possible flow:

- ask after user confirms "opened";
- allow later rating from history;
- allow immediate quick rating.

UI:

```text
How was it?

Too soft   Soft   Perfect   Firm   Too firm
```

Prefer a visual response over a hidden numeric correction.

After rating:

```text
Got it.
Next time: +15 sec
```

Avoid false statistical precision too early.

---

## 11. Quick Cook

Once habits are established, configuration can become dramatically shorter.

Example:

```text
Good morning.

Your usual:
63 g · fridge · jammy · steam

6:24

[ COOK ]

Change…
```

This should be an optimization after good persistence/defaults exist.

---

## 12. Guided Cook

Possible flow:

### Step 1

```text
Add about 1 cm of water to the pot.
Put on the lid.

[ Continue ]
```

### Step 2

```text
Bring water to a boil.

[ Water is boiling ]
```

### Step 3

```text
Carefully place the eggs in the pot.

[ Eggs are in — START ]
```

### Step 4

Cooking UI.

### Step 5

Completion/removal/cooling.

Kettle guidance may be added if energy/process claims are properly qualified.

---

## 13. Multi-Egg UX

Avoid a spreadsheet-like setup.

Instead:

```text
Who are we cooking for?

+ Add egg
```

Cards:

```text
Person A
L · jammy

Person B
L · soft

Guest
M · firm
```

Then:

```text
Your plan

00:00  Add Guest
02:05  Add Person A
03:00  Add Person B
08:10  Remove all
```

During cooking, focus on the **next action**, not merely three independent timers.

---

## 14. Sound Design

Sound is part of the product identity.

### Hierarchy

#### Background/progress

Short, subtle, optional.

#### Minute cue

Possible counting behavior:

- minute 1 → one quack;
- minute 2 → two;
- minute 3 → three.

After a few minutes, avoid literal unbounded repetition.

#### Completion

Distinctive full call.

Chicken example:

- progress = cluck;
- completion = rooster crow.

### Settings

```text
Sound Personality

○ Quiet
○ Gentle
● Counting Bird
○ Chaos
```

Additional:

- volume;
- species preview;
- haptics on/off.

---

## 15. Developer/Admin Time Machine

This is both a convenience and a testability requirement.

Possible panel:

```text
Developer Time Machine

Clock:
[1×] [10×] [60×] [600×]

Jump:
[Configure]
[Cooking]
[30 sec left]
[Done]

Environment:
[Offline]
[Location denied]
[Audio blocked]
[High altitude]

Species:
[Chicken]
[Duck]
[Goose]
[Quail]

[Trigger completion]
```

The developer UI should ideally use the same underlying clock/state abstractions as automated tests.

---

## 16. Permission UX

### Location

Do not request immediately on load.

Explain benefit:

```text
Use your location to adjust for local boiling conditions?

[ Use location ]
[ Enter manually ]
[ Not now ]
```

### Camera

Request only when user explicitly enters Egg Vision/Candling.

### Notifications

Request only when a real feature benefits.

---

## 17. Offline UX

When offline:

```text
Offline
Using saved/default boiling conditions.
Timer and core calculations still work.
```

Do not present missing network as a major failure if only a small enhancement is unavailable.

---

## 18. Error UX

### Pressure API fails

Fallback to a reasonable model.

### Audio cannot autoplay

Offer:

```text
Tap to enable alarm sound.
```

### Corrupt persisted state

Recover safely and log diagnostics.

### Timer expired while app was closed

Show:

```text
This cook should have finished 2:14 ago.
```

Do not pretend the timer is still valid.

---

## 19. Accessibility

### Visual

- strong contrast;
- large timer;
- do not rely on color alone;
- support text scaling.

### Motion

Respect `prefers-reduced-motion`.

Alternative to complex motion:

- crossfade;
- static progress stages.

### Audio

Never rely only on sound.

### Screen reader

Announce:

- cooking started;
- meaningful transitions;
- completion;
- required next action.

Do not announce every second.

### Touch

Large targets suitable for wet kitchen fingers.

---

## 20. Desktop / Mac Layout

Desktop should not merely stretch the phone UI.

Possible configuration layout:

```text
[configuration]   [live egg preview]
```

During cooking:

```text
[large digital egg]   [countdown + details]
```

The state model remains the same.

---

## 21. Dark Mode

A dark cooking UI may be pleasant at night.

Ensure the egg visualization remains legible.

---

## 22. Microcopy Style

Preferred:

- short;
- calm;
- mildly playful;
- specific.

Good:

```text
Egg out. Now.
```

Avoid over-celebratory copy.

---

## 23. UX Questions to Validate

1. Does configuration-to-cooking transition feel natural?
2. Is the animated egg informative or distracting?
3. How much context should remain during cooking?
4. Can settings be changed after start?
5. Is Stop enough or do we need Cancel Cook?
6. When should calibration be requested?
7. Do repeated bird sounds become annoying?
8. Is timer understandable without sound?
9. Can digital egg communicate state without false precision?
10. Is multi-egg scheduling easiest as "next action"?
