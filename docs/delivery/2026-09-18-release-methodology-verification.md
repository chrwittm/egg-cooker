# Release methodology improvement — verification

**Date:** 2026-09-18
**Source:** Local methodology/script/workflow diff based on `8d5ee65c145fa11361172fb290632b5e45d07388`; uncommitted during verification. This is maintenance of the existing release process, not a new product specification or release.
**Environment:** macOS, Node 24.20.0, npm 11.19.0; installed Playwright Chromium/Firefox/WebKit. Standalone smoke used Chromium 153.0.8010.12.
**Authority:** Maintainer requested a more efficient and reliable methodology based on implementation/publication experience. [Release runbook](../operations/releases.md), [cookbook](../cookbook.md).

## Findings and changes

- v0.1.1 was tagged before its exact source passed Linux Verify. The failed [push run 35249780349](https://github.com/chrwittm/egg-cooker/actions/runs/35249780349) preceded the failed [candidate run 35256601291](https://github.com/chrwittm/egg-cooker/actions/runs/35256601291). The new sequence waits for Linux before tagging, with an executable read-only preflight and a second check in the candidate workflow. Missing/pending/failed/cancelled/skipped or wrong-source results are rejected.
- macOS verification did not expose the Linux WebKit narrow German layout issue or the Firefox language-test audio coupling. Normal Linux Verify now explicitly uses the Pages subpath; guidance moves risky device checks earlier and separates incidental capability fixtures from essential integration evidence. Existing audio/layout fixes and assertions are preserved.
- Local repackaging, manual smoke snippets and scattered evidence increased work. The Linux candidate is now the canonical download, `release:package` names the existing packaging operation, and `release:smoke` verifies archive/live identity, assets, flow and reload with generated JSON evidence. Documentation removes redundant fresh local candidate builds from the normal path and links one canonical release record.
- Candidate and Pages builds now retain failed browser reports/traces. Guidance requires diagnosis before an unchanged retry, explicit continuation state and affected-device retesting after corrections.
- The previous local/download build difference came from `/egg-cooker/` versus `./`, not simply from the operating system. Candidate base is explicit; independently packaged tar bytes remain non-reproducible because metadata is not normalized. Approved CI bytes are preserved and compared with the public download.

## Evidence

| Check                                                                     | Result             | Scope                                                                                                                                                                                                            |
| ------------------------------------------------------------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BASE_PATH=/egg-cooker/ npm run verify:all`                               | Passed             | 96 unit/integration, 4 script and 150 browser checks; format/lint/type/docs/build included                                                                                                                       |
| Preflight regression cases                                                | Passed             | Latest successful exact-commit main push; rejects missing, wrong SHA/event/branch, pending, failed, cancelled, skipped and timed-out runs; toolchain/origin drift                                                |
| Real temporary Git fixture                                                | Passed             | Untagged clean source accepted for preflight; lightweight tags, stale tags and untracked source rejected for their respective gates; annotated tag at HEAD accepted                                              |
| Read-only GitHub lookup using preflight query/validator                   | Passed             | Existing source `8d5ee65` resolves to successful [Verify 35259629467](https://github.com/chrwittm/egg-cooker/actions/runs/35259629467); this is API integration evidence, not Linux verification of the new diff |
| Preflight CLI on current edited worktree                                  | Expected rejection | Exit 1: release source must be clean, including untracked files                                                                                                                                                  |
| Reusable smoke against retained Linux v0.1.2 candidate, locally served    | Passed             | Expected `0.1.2` / `6fb8d2fdac2be7639b5b56abe6fa1cc21646ea4f`; relative-base archive, resources, flow and reload                                                                                                 |
| Reusable smoke against live Pages                                         | Passed             | Same expected version/SHA at [Egg Cooker](https://chrwittm.github.io/egg-cooker/); real hosted subpath, resources, flow and reload                                                                               |
| Smoke with an intentionally incorrect expected version                    | Expected rejection | Exit 1 before interaction; reported the actual/expected build mismatch                                                                                                                                           |
| Smoke with an icon replaced by an HTTP 200 HTML fallback in a local proxy | Expected rejection | Exit 1 identifying the Apple icon; HTTP success alone does not establish a usable asset                                                                                                                          |

The smoke's initial strict `Demo` checkbox matcher failed because its accessible name includes more text. The matcher was corrected to the existing test convention and both archive/live runs then passed. No application fix was needed. The smoke uses a controlled clock for completion and does not claim elapsed wall-clock timer or audible playback acceptance.

The complete preflight CLI also passed against a disposable clean checkout of existing source `8d5ee65`, using the pinned local tools and the real GitHub lookup. This establishes its source-preflight path; `release:check` separately verifies a tag at HEAD. It does not tag, push, or certify the new uncommitted methodology diff.

## Limits and next action

No new version, tag, source push, public release or deployment was performed. These changed GitHub workflow definitions have not yet executed on GitHub; validate them after an authorized commit/push and on the next candidate. The successful historical API lookup does not substitute for that validation. The full preflight correctly cannot pass this uncommitted diff.

No new real-device, provider, VoiceOver or kitchen acceptance is claimed. Existing release evidence remains historical. The smoke never activates location and blocks external browser requests. Its generated `out/release-smoke.json` is overwritten per invocation; preserve each accepted result with the release artifacts.

The bounded improvement retains separate generic and Pages builds, manual device acceptance and authorized publication. A complete release orchestrator, deterministic archive metadata and Actions runtime upgrades remain possible later improvements; no time-saving percentage is claimed before observing a future release.
