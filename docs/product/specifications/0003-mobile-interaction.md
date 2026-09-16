# FEAT-005 — Mobile configuration and cooking interaction

> Later refinement: [0004](0004-continuous-controls.md) replaces the discrete texture/defaults, location confirmation, cancellation dialog and finish behavior. Read it for the current contract.

**Status:** Accepted for implementation, 2026-09-15. The maintainer's hands-on review authorized these changes to 0001. Human visual/device acceptance was tracked separately from implementation.

## Outcome and replacements

A compact phone-width instrument with configuration above one egg and a centered primary action below it. This supersedes 0001's wide layout, hero, mini-yolk selectors, exact temperature selection, conditions disclosure, hidden opt-in 60× demo, and Ready/Done arrangement. Other 0001 recovery, science, accessibility, privacy and failure contracts remain in force. Guided cooking (0002) remains deferred.

1. One column at every viewport, maximum 440 px including padding; scroll vertically on short screens, retain reflow at 320 px and 200% text. No orientation lock or clipped controls.
2. Remove hero, slogans, selection ticks and action arrows. Consistent unselected, hover, selected and keyboard-focus states for presets, doneness and speed. Use centered SVG utility icons.
3. Fridge highlights 4–8 °C, Room 20–24 °C, inclusive. Clicks still choose 8/20 °C. Doneness has three plain radio choices under “How would you like your egg?”.
4. Keep one preview below all inputs. Target yolk follows doneness immediately; linear egg dimensions scale with the cube root of mass. Temperature and environment change estimated time, not the selected final texture. Start slides configuration up and moves the egg into Cook; returning reverses the journey. Reduced motion is immediate.
5. Elevation slider −500 to 8850 m; moving it resets local pressure from the existing standard-atmosphere formula. Air pressure slider 300–1100 hPa fine-tunes **surface pressure directly**, with manual provenance and no weather timestamp. Pressure is never corrected for altitude twice. Consented location sets both elevation and current surface pressure using existing requests; retries, expiry, cancellation and snapshot isolation remain. Manual edits cancel pending requests. Elevation edits deliberately reset prior weather adjustments. Values below sea level and near Everest are exploratory model inputs.
6. Center Start/Start demo below the egg, with approximate duration on the button. Remove successful-cancel and finish notices from visible content, retain screen-reader announcements and actionable failures.
7. For this testing iteration demo defaults on, initially 1×. Options can select a real timer; a restored real timer remains real. Retain the chosen mode between eggs, default to demo on a fresh page with no recovered timer. Cooking displays 1×, 10×, 20×, 50× and To end. No demo persistence; real timers cannot accelerate. Crossing Ready automatically switches to 1× at the exact virtual target, including across a delayed frame. Users can accelerate again after Ready.
8. Ready's primary action is “Cook another egg”, below the egg and speed controls. Back at Ready returns directly. Before Ready, Back asks “Cancel cooking?” with “Keep cooking” / “Cancel cooking”. Preserve target/cancel race protection and focus handling.

## Science and data compatibility

Extend the existing altitude formula from −500–4000 m to −500–8850 m, pressure from 600–1100 to 300–1100 hPa, and IAPWS inversion bracket from 350–380 K to 330–380 K. Existing fixtures must remain unchanged. The expanded bracket covers low-pressure boiling while staying above the 63 °C Soft boundary. The same equations and texture multipliers apply, without a claim of kitchen validation at altitude.

References checked 2026-09-15: [IAPWS saturation formulation](https://www.iapws.org/relguide/Supp-sat.html), [NASA atmosphere model](https://www.grc.nasa.gov/www/k-12/BGP/atmos.html). NASA supports the tropospheric model's applicability below roughly 11 km; extending the cooking approximation is a product exploration, not experimental evidence. The original [science record](0001-mvp-science.md) remains the baseline with these bounds superseded.

Add `manual` as a conditions source with bounded elevation, bounded surface pressure and null weather timestamp. Preserve the existing snapshot field set and model/schema identifiers because equations and old valid snapshot results are unchanged; old snapshots still recover. Manual values must pass the same strict validation and duration recalculation. Coordinates remain unpersisted. No dependencies or remote assets added.

## Verification

Domain: original fixtures, expanded solver/convergence/monotonicity corners, manual provenance and recovery, target crossing and all rates. Browser: mobile order, mass-responsive egg, temperature ranges, direct/manual/location pressure, request cancellation, default demo, Ready slowdown/reacceleration, back/primary action, keyboard/axe/reduced motion and continuous transition. Run both production-path gates; inspect real rendered phone and desktop views and record animation evidence. Human delight/animation, actual-device and kitchen acceptance stay separate.
