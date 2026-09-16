# Example contract — Temporary checklist

**Status:** Accepted scaffold example, not a product MVP.

The example is deliberately unrelated to cooking, photography, or spaced repetition. Its only purpose is to demonstrate how a small behavior can be specified, implemented, and verified without inventing backend or persistence requirements.

## Behavior and scope

A user adds a named step and marks it complete with a native checkbox. A summary shows completed and total steps. Input is trimmed, must be nonempty, and is limited to 80 UTF-16 code units; the list contains at most 20 items. Case-insensitive duplicates are rejected after trimming. Rejections keep the existing list intact and show an associated error. Success clears the input/error. The form submits with Enter and checkboxes work with the keyboard. All state is discarded on reload; the page clearly states this.

## Acceptance mapping

| Criterion                                                    | Evidence location                                   |
| ------------------------------------------------------------ | --------------------------------------------------- |
| Normalize valid input without mutating the previous list     | `src/domain/checklist.test.ts`                      |
| Reject empty/oversized/duplicate/full inputs                 | `src/domain/checklist.test.ts`                      |
| Toggle selected item; unknown ID does not change values      | `src/domain/checklist.test.ts`                      |
| Add/complete by keyboard, summarize, reset on reload         | `tests/e2e/checklist.spec.ts`                       |
| Visible invalid-input feedback preserves list                | `tests/e2e/checklist.spec.ts`                       |
| Automated accessibility check on the populated error state   | `tests/e2e/checklist.spec.ts`                       |
| Real assistive-technology comfort and actual device behavior | Manual release acceptance; not implied by the tests |

## Boundaries

No accounts, persistence, delete/edit/reorder, network integration, PWA, notifications, or native API. App content is local to the session; if hosted, loading assets contacts that host. The original visual design uses plain CSS and system fonts, with no third-party images or fonts.

When the product is defined, create its own accepted MVP spec and replace this demo's UI/domain/tests together. Retain this document as a clearly labeled teaching example if useful.
