# Specification progression

Read the [current status](../../planning/status.md) for active work. This index makes planned progression and actual delivery traceable; the [backlog](../../planning/backlog.md) owns priority/readiness. A numbered Draft is not accepted scope or implementation evidence.

## Naming and lifecycle convention

- Main specification: **`NNNN-short-name.md`**, four digits, starting at `0001`. Allocate the next unused number when an item gets a real specification. Use the current intended progression when allocating; leave unrefined backlog ideas without placeholder files/numbers.
- Supporting documents share their parent prefix: **`0001-mvp-science.md`** belongs to **`0001-mvp.md`**, not to a separate delivery step. Add a support document only for useful depth; keep behavioral requirements in one canonical place.
- Numbers are permanent specification identifiers/order of introduction. Never recycle or renumber accepted/referenced files when priorities change. A renamed Draft must update every local link and this index; Git preserves prior names.
- The `FEAT-*` backlog ID is linked explicitly; it need not equal the specification number. Bugs/technical tasks reference affected specifications and only get a new specification when they introduce a new product contract.
- Substantial new accepted feature scope gets a new numbered document naming the behavior it extends/replaces. Reconcile accepted MVP discovery changes into the living 0001 as well, so it remains consistent with implementation; preserve dated evidence as history. Do not keep expanding the MVP into the whole product backlog. Refine an unaccepted Draft in place; preserve deferred substantial design in its own linked Draft.
- Before implementation, record acceptance/date. During delivery, link the exact criteria/slice, implementation commit and verification evidence. At release, add the release version/date. Keep Pending where evidence does not exist.
- **Filename order is intended progression, not proof of implementation chronology.** If implementation occurs out of order or one spec spans releases, the delivery ledger below records actual order. Never rename files to make planned and actual history appear identical.

This convention is project-scoped and applies to future Egg Cooker work. It does not change global Codex settings or other repositories.

## Specification index

| Sequence | Specification                                                 | Backlog  | Document status / priority | First implementation evidence                                                       | First release   |
| -------- | ------------------------------------------------------------- | -------- | -------------------------- | ----------------------------------------------------------------------------------- | --------------- |
| 0001     | [Quick-cook MVP](0001-mvp.md); [science](0001-mvp-science.md) | FEAT-001 | Accepted / Verified        | [Local implementation](../../delivery/2026-09-15-mvp-verification.md)               | 0.1.0 candidate |
| 0002     | [Guided cooking mode](0002-guided-cooking.md)                 | FEAT-002 | Draft / Later, Deferred    | Pending                                                                             | Pending         |
| 0003     | [Mobile interaction](0003-mobile-interaction.md)              | FEAT-005 | Accepted / Verified        | [Refinement evidence](../../delivery/2026-09-15-mobile-interaction-verification.md) | 0.1.0 candidate |
| 0004     | [Continuous controls](0004-continuous-controls.md)            | FEAT-006 | Accepted / Verified        | [Evidence](../../delivery/2026-09-15-continuous-controls-verification.md)           | 0.1.0 candidate |

The former unnumbered `mvp.md` and `mvp-science.md` became 0001 in the 2026-09-15 review. This is a documentation rename, not a release. The guided process was split into 0002 before either feature was implemented.

## Actual delivery ledger

0001 was implemented locally on 2026-09-15; [evidence](../../delivery/2026-09-15-mvp-verification.md) records the original automated checks and limits. Subsequent accepted refinements have their own dated evidence. On 2026-09-16 the maintainer accepted the resulting MVP for an experimental 0.1.0 candidate. The sanitized public source baseline is `a5235f4`; no released version exists yet.

| Delivery order             | Spec        | Slice / criteria                                                                            | Date       | Implementation commit | Evidence                                                                      | Release         |
| -------------------------- | ----------- | ------------------------------------------------------------------------------------------- | ---------- | --------------------- | ----------------------------------------------------------------------------- | --------------- |
| 1 (local automated slice)  | 0001        | Quick-cook implementation; AC-01–04, 06–13, 18 automated                                    | 2026-09-15 | `a5235f4`             | [Verification](../../delivery/2026-09-15-mvp-verification.md)                 | 0.1.0 candidate |
| 2 (local refinement)       | 0003        | Single-column controls, shared egg movement, environment sliders and demo clock             | 2026-09-15 | `a5235f4`             | [Verification](../../delivery/2026-09-15-mobile-interaction-verification.md)  | 0.1.0 candidate |
| 3 (local refinement)       | 0004        | Continuous rails, remembered location, stopped result                                       | 2026-09-15 | `a5235f4`             | [Verification](../../delivery/2026-09-15-continuous-controls-verification.md) | 0.1.0 candidate |
| 4 (follow-up)              | 0004 / 0001 | Centered presets, boiling display, locality, persistent sound and living-MVP reconciliation | 2026-09-16 | `a5235f4`             | [Verification](../../delivery/2026-09-16-interaction-polish-verification.md)  | 0.1.0 candidate |
| 5 (accepted MVP follow-up) | 0004 / 0001 | Continuous texture highlights and compact Location data summary                             | 2026-09-16 | `a5235f4`             | [Verification](../../delivery/2026-09-16-texture-location-verification.md)    | 0.1.0 candidate |

When a slice is verified, append a row with **delivery order, specification number, slice/acceptance criteria, date, implementation commit, evidence link, and release version (Pending until published)**. Record later slices of the same specification as additional rows; do not overwrite the first delivery with the latest release. Preserve failed or partial work in dated evidence rather than assigning it a completed delivery order. This lightweight ledger reconstructs actual progression across many releases while the filenames stay stable.

The 0004 refresh-flicker follow-up (2026-09-15, uncommitted) retains conditions until lookup settlement and delays progress. The [same evidence record](../../delivery/2026-09-15-continuous-controls-verification.md#refresh-flicker-follow-up--2026-09-15) records the passing subpath gate with 117 browser checks. Release and human acceptance remain Pending.

The 2026-09-16 follow-up to 0004 aligns preset centers, shows boiling temperature, adds optional locality and final-countdown/persistent alarms, and reconciles 0001 with all accepted session feedback. [Current verification](../../delivery/2026-09-16-interaction-polish-verification.md) records evidence; publication remains pending.
