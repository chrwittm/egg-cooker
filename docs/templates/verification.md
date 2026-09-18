# Verification — Work or release identifier

**Date:** YYYY-MM-DD
**Source:** Exact tested commit; note a dirty diff if applicable.
**Environment:** OS, architecture, runtime and relevant browser/device versions.
**Specification:** Link the numbered specification and criteria/slice actually tested.
**Delivery tracking:** Link the specification index; add a delivery-ledger row only for a verified slice, with implementation commit and this evidence. Keep release Pending until published.

| Check / acceptance criterion | Command or procedure | Result                              | Evidence                             |
| ---------------------------- | -------------------- | ----------------------------------- | ------------------------------------ |
| Example                      | Exact command        | Passed / Failed / Blocked / Not run | Redacted log, CI run, or observation |

## Artifact and acceptance

Version, build commit, filename/checksum, CI run where applicable. Record who performed real-device or human acceptance and on which artifact. Never fill this section from assumption.

For a release, record the exact-commit Linux Verify, candidate and Pages run URLs; the downloadable and hosted base paths; candidate/public-download checksum comparison; archive and hosted `release:smoke` results; and device/OS/source identity. If device acceptance predates the final commit, name the intervening changes and any affected retest. Link to this record from status/ledger instead of duplicating it there.

## Limits and follow-up

Unverified claims, confirmed defects, accepted risks with owner/review trigger, and next action. Large/private artifacts belong outside committed docs.

For an interrupted release, include the last completed stage, next command, source/tag/run IDs, retained candidate location/checksum and publication authorization already given. At completion, note material deviations, their causes and a useful process correction. Not run, blocked and failed are distinct from passed; identify any accepted limitation explicitly.
