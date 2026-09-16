# 04 — Egg Science and Domain Model

## Purpose

This document separates domain reasoning from UI implementation.

The reference app should be explainable. It does not need an academically perfect thermal simulator on day one, but it should avoid unexplained magic timing values.

Preferred progression:

```text
simple explicit model
→ validate against real cooks
→ calibrate
→ improve only where evidence justifies complexity
```

---

## 1. Core Domain Inputs

Conceptually:

```text
egg
+ initial condition
+ target condition
+ cooking environment
+ process correction
```

Illustrative data shape:

```ts
CookingRequest {
  species
  massGrams
  initialTemperatureC
  targetDoneness
  method
  pressureOrBoilingPoint
  quantity
  removalDelaySeconds
  calibrationProfile
}
```

This is not a final type definition.

---

## 2. Egg Mass

Mass is preferable to relying only on S/M/L/XL.

Reasons:

- thermal behavior relates to physical size/mass;
- categories are regional conventions;
- grams enable reproducible tests.

Normal UI can still show familiar size labels.

Before implementation, confirm official/current size boundaries and decide how international variants are represented.

---

## 3. Starting Temperature

Starting temperature materially affects heating time.

Normal presets:

- refrigerator;
- room temperature.

The user should not be forced to measure the egg.

Egg Lab can support exact values.

---

## 4. Desired Doneness

Humans think in:

- runny;
- soft;
- jammy;
- firm.

A thermal model thinks in internal temperature/time.

Future domain work should map user-facing doneness states to model targets.

Important:

> "Perfect jammy" is subjective.

Calibration should correct both model error and user preference.

---

## 5. Basic Cooking Model

A known class of models approximates the egg as a homogeneous object and relates heating time to:

- mass/geometry;
- initial temperature;
- surrounding temperature;
- desired center temperature.

Future implementation should document:

- selected equation;
- coefficients;
- assumptions;
- units;
- source;
- validation tests.

Do not bury the formula in UI code.

Recommended home:

```text
src/lib/domain/cooking/
```

---

## 6. Steam vs Immersion

### Working hypothesis

Steam in a covered pot and immersion are similar enough to share the same conceptual model, but effective heat-transfer conditions are not necessarily identical.

Potential differences:

- steam circulation;
- condensation;
- lid behavior;
- pot geometry;
- water amount;
- recovery after cold eggs are inserted.

Prefer:

```text
base model
+ method-specific correction
+ personal calibration
```

### Validation experiment

Use:

- same egg batch;
- similar mass;
- same starting temperature;
- same target;
- repeated steam and immersion cooks;
- record outcome.

This is a good future behind-the-scenes experiment.

---

## 7. Atmospheric Pressure and Boiling Point

Altitude is an indirect input.

Conceptually:

```text
pressure
→ boiling point
→ effective surface temperature
→ cooking time
```

Possible levels:

### Level 1

Standard environment.

### Level 2

Altitude-derived estimate.

### Level 3

Current local pressure from weather data.

The product must not require Level 3 to function.

---

## 8. Location

Location is only useful as an input to environment estimation.

Architectural rule:

> Do not make raw location part of the domain model if the domain only needs pressure/boiling point.

Example:

```text
GeolocationAdapter
→ WeatherAdapter
→ CookingEnvironment
```

---

## 9. Number of Eggs

Quantity may alter the environment because multiple cold eggs affect thermal recovery.

Magnitude depends on:

- water quantity;
- vessel thermal mass;
- heat source;
- steam vs immersion;
- recovery time.

This is a research item.

First approach may accept quantity for guidance without applying an unsupported correction.

---

## 10. Removal Delay

Theoretical completion and physical end of cooking are not identical.

If user needs `d` seconds to stop cooking:

```text
alertTime = targetThermalTime - removalDelay
```

This is process compensation, not a different physical target.

---

## 11. Carryover Cooking and Cooling

After removal, internal heat redistributes.

Cooling under cold running water can make results more reproducible.

Likely initial approach:

- define a standard removal/cooling procedure;
- use empirical calibration;
- avoid full post-removal thermal simulation.

---

## 12. Personal Calibration

Calibration bridges theory and real kitchens.

Potential sources of offset:

- pot;
- stove;
- lid;
- water quantity;
- actual egg geometry;
- fridge temperature;
- user preference;
- removal behavior.

Initial model:

```text
recommendedTime =
  theoreticalTime
  + calibrationOffset
  - removalDelay
```

Later, correction may be specific by method/doneness/equipment, but avoid early overfitting.

---

## 13. Calibration Feedback Mapping

Illustrative only:

```text
much too soft      → +30 sec
slightly too soft  → +15 sec
perfect            → 0
slightly too firm  → -15 sec
much too firm      → -30 sec
```

A better model may:

- use smaller updates;
- weight recent observations;
- track confidence;
- detect contradictory feedback.

Do not implement arbitrary numbers without design/research.

---

## 14. Species

Do not assume all bird eggs are scaled chicken eggs.

Potential differences:

- geometry;
- shell thickness;
- white/yolk ratio;
- composition;
- thermal properties.

A mass-based model may estimate, but UI must distinguish validation from extrapolation.

Suggested metadata:

```text
validated
beta
experimental
```

---

## 15. Egg Orientation and Air Cell

The broader/blunter end normally corresponds to the air-cell side.

A camera feature can potentially:

- segment silhouette;
- find major axis;
- compare curvature;
- identify broad end.

This does not inherently require an LLM.

Low confidence can trigger candling mode.

---

## 16. Egg Piercing

Treat as both cultural practice and science question.

Do not silently encode:

> piercing is required.

Possible treatment:

- default works without piercing;
- Egg Lab explains practice;
- camera helps if user chooses it;
- research references and hygiene caveats.

Need authoritative current validation before definitive guidance.

---

## 17. Candling

Experimental uses:

- locate air cell;
- help identify broad end;
- perhaps estimate relative air-cell size.

Do not market this as reliable freshness measurement without evidence.

---

## 18. Microwave

### Intact shell

Explicitly reject as normal cooking mode because of pressure/explosion risk.

### Cracked preparations

Could become separate future recipes.

Do not reuse the shell-egg timing model.

---

## 19. Energy Model

Potential future estimate:

```text
energy to heat water
≈ mass × specific heat × temperature change
```

But total household energy depends on:

- appliance efficiency;
- pot losses;
- evaporation;
- lid;
- heating element.

Any "energy saved" output must be clearly labeled estimated.

---

## 20. Digital Twin

Potential model hierarchy:

### A — Visual interpolation

No strong scientific claim.

### B — Radial heat approximation

Approximate layers from shell to center.

### C — Empirically tuned simulation

Use model plus calibration.

Rule:

> Do not make an animation look scientifically precise if it is only decorative.

---

## 21. Candidate Domain Types

Illustrative:

```ts
type Species = 'chicken' | 'duck' | 'quail' | 'goose' | 'ostrich';

type CookingMethod = 'steam' | 'immersion';

type Doneness = 'runny' | 'soft' | 'jammy' | 'medium' | 'firm';

type ModelConfidence = 'validated' | 'beta' | 'experimental';
```

---

## 22. Determinism

Given identical:

- request;
- environmental values;
- calibration data;
- clock-independent parameters;

the recommendation should be identical.

No UI state or API calls belong inside the calculation.

---

## 23. Domain Tests

Examples:

- larger egg should not cook faster than smaller under equal conditions;
- colder egg should not cook faster than warmer;
- lower boiling temperature should not shorten recommendation;
- calibration applies predictably;
- removal delay changes alert time, not target thermal time;
- unit conversions round-trip;
- reference scenarios remain stable.

Once real experiments exist, store benchmark scenarios as regression fixtures.

---

## 24. Research Log

Every scientific/domain assumption should eventually have:

```text
Claim
Evidence/source
Confidence
Implementation implication
Date last reviewed
```

This prevents future agents from turning speculative brainstorming into "fact".

---

## 25. Open Science Questions

1. Which exact formula becomes V1?
2. What target temperatures map to doneness labels?
3. How large is real steam/immersion difference?
4. Does quantity need explicit correction?
5. Does live pressure materially improve results over altitude?
6. How should calibration adapt over repeated cooks?
7. How should post-removal carryover be handled?
8. Can digital egg use the same physics model?
9. Which species have enough evidence?
10. What piercing guidance is scientifically and hygienically responsible?
