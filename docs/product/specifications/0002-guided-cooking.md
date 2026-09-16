# FEAT-002 — Guided cooking mode

**Status:** Draft
**Sequence:** 0002; later candidate, not implemented order.
**Updated:** 2026-09-15
**Acceptance decision:** The maintainer deferred this feature from the MVP into the real backlog. This preserves proposed behavior for later refinement; it is not acceptance or implementation authorization.
**Backlog:** [FEAT-002](../../planning/backlog.md) — Deferred

## User outcome and motivation

A user who wants preparation and removal guidance can choose Guided cooking rather than the [quick-cook MVP](0001-mvp.md). Preserve the earlier Draft's complete process without burdening the quick-cook interface:

**Configure → prepare → confirm insertion → cook → alert → remove/cool → finish.**

## Scope and non-goals

Propose an explicit mode choice before cooking, with Quick cook remaining the default. Add no method picker, calibration, history or multi-egg scheduling through this feature. Share the accepted inputs, science, environment snapshot, timer and animated egg; never maintain a second timing formula. Any conditions or warnings are relevant to the chosen process, not permanent instructions on the quick-cook screen.

## Behavior and interaction

### Preserved process proposal

| State     | Composition and primary action                                                                 | Transition                                                                       |
| --------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Configure | Existing quick configuration and target preview                                                | **Prepare to cook** → Prepare; no timer                                          |
| Prepare   | “Get the water ready”; short preparation instructions; compact settings summary                | **Water is boiling** → Insert; **Change settings** returns without losing inputs |
| Insert    | “Lower the egg gently into the water. Tap as soon as it is in.”                                | **Egg is in — start** is the only commit event                                   |
| Cook      | Large animated egg/countdown; inputs recede                                                    | Last 30 seconds: “Get your spoon ready”; no new deadline                         |
| Alert     | “Take the egg out”; elapsed overdue time; illustration keeps progressing while assumed in heat | **Egg is out — cool it** captures confirmation time and freezes illustration     |
| Cooling   | “Cool in cold water”; frozen illustration; “About a minute, then open and serve.”              | **Finish** is user-paced; no cooling timer or thermal simulation                 |
| Finished  | “Enjoy your egg”; small frozen illustration                                                    | **Cook another egg** returns to configuration                                    |

The previous draft suggested an immersion preparation of one egg, at least 1 L of water and 2 cm coverage, maintained at a gentle boil, plus a spoon and a cold-water bowl. This is **preserved as an unvalidated process candidate**, not a current quick-cook requirement or proof that immersion and steam are interchangeable. More than 30 seconds without boiling after insertion was the proposed protocol limit. Review this recipe alongside the steam/immersion comparison before selecting guided instructions.

```text
PREPARE                 INSERT                 COOL / FINISH
┌────────────────────┐  ┌────────────────────┐ ┌────────────────────┐
│ ‹ Change settings  │  │ ‹ Back             │ │ Cool in cold water │
│ Get the water ready│  │ Lower the egg      │ │     (frozen egg)   │
│ Water / spoon /    │  │ gently into water  │ │ About a minute…    │
│ cold-water bowl    │  │                    │ │ [ Finish ]         │
│ [Water is boiling] │  │ [Egg is in — start]│ │ Then: Enjoy        │
└────────────────────┘  └────────────────────┘ └────────────────────┘
```

### Interaction details retained for refinement

- No pause: opening a Cancel dialog does not pause the physical cook or its animation. **Keep cooking** is default-focused; **Cancel timer** terminates only the timer. Escape/backdrop dismissal keeps cooking.
- **Egg removed early** is separate from cancellation. Confirming **Yes, egg is out** enters Cooling and records early removal; dismissal preserves the cook. Cooling shows “Removed before the estimated target.”
- If the target arrives during either dialog, derive Alert first, dismiss the stale dialog, announce removal and focus its heading. Do not let a queued pre-alert action apply to a new state.
- Alert time has no early-removal compensation. Removal confirmation is an observed user action, not a temperature measurement. If confirmation is late, do not invent a historical removal timestamp. No reverse animation during cooling.
- Silence changes audio only. Cancellation shows “Timer cancelled. If the egg is still in hot water, it is still cooking.” A new cook does not imply restarting the physical egg.
- Guided cooling recovery would add an explicit persisted Cooling phase and `removedAtMs`, frozen geometry from that time, plus Finish. A resumed Cooling record must never restart heating. Refine schema/version compatibility when this feature is accepted; quick MVP records have no Cooling state.
- Preserve stage headings, visible focus, dialog focus containment, one completion announcement, reduced-motion static stages, 44 px targets, narrow-screen scrolling, and no every-second screen-reader announcements. Keep explanatory copy short and contextual.

## Acceptance and evidence

| ID   | Observable outcome                                                                                                 | Verification method                                     | Result/evidence |
| ---- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- | --------------- |
| G-01 | Choosing Guided adds the process screens; Quick remains the two-screen experience                                  | Playwright                                              | Pending         |
| G-02 | Only insertion confirmation commits; backing through preparation preserves settings and starts nothing             | Domain test + Playwright                                | Pending         |
| G-03 | Complete process reaches Finish; removal freezes the current image; no simulated cooling or implicit feedback step | Playwright with virtual clock + human device acceptance | Pending         |
| G-04 | Cancel/early-removal dismissal, confirmation and target-arrival races obey the rules above                         | Domain test + Playwright                                | Pending         |
| G-05 | Cooling recovery, invalid records and schema/model mismatch cannot restart heating                                 | Integration test + Playwright                           | Pending         |
| G-06 | Instructions are usable with keyboard/screen reader/reduced motion and on a small phone                            | Playwright/axe + human visual/device acceptance         | Pending         |
| G-07 | Selected preparation/cooling protocol produces useful results without claiming untested method equivalence         | Human kitchen acceptance                                | Pending         |

## Data, privacy, security, compatibility

Share quick-cook's static Pages boundary and environmental lookup/privacy contract. Guided mode needs no extra runtime API. Retain only its active session, not a history. A Cooling schema extension and its deletion/rollback behavior must be specified before implementation; no such data exists today.

## Dependencies and decisions

Depends on an accepted, implemented quick-cook foundation. This document preserves the guided journey, early-removal handling and cooling semantics moved out of the original MVP proposal during maintainer review. The active egg design and shared science remain in 0001. Calibration/feedback and history are separate [backlog](../../planning/backlog.md) items.

## Open questions

Resolve when prioritizing this deferred feature: which preparation protocol to teach, and whether Guided should offer both steam and immersion instructions. Recommended: choose a kitchen-validated protocol first, then add another only when its instructions and outcomes have evidence. Finalize mode-entry placement and the Cooling schema against the then-current accepted quick-cook behavior.
