# Documentation map

Read documents for the question at hand; no task requires loading the whole repository handbook.

| Question                               | Authoritative place                                                                                                             |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| How do I start?                        | [Start here](start-here.md), [cookbook](cookbook.md)                                                                            |
| What does this product do now?         | [Product context](product/context.md), accepted product specifications                                                          |
| What is the accepted MVP?              | [Accepted MVP](product/specifications/0001-mvp.md), [science and validation record](product/specifications/0001-mvp-science.md) |
| Where did the product ideas come from? | [Discovery package](discovery/README.md)                                                                                        |
| What is the next action?               | [Status](planning/status.md)                                                                                                    |
| What might we build?                   | [Backlog](planning/backlog.md)                                                                                                  |
| What is broken?                        | [Known issues](planning/known-issues.md)                                                                                        |
| Why these technical choices?           | [Architecture](architecture/overview.md), [ADR 0001](architecture/decisions/0001-baseline.md)                                   |
| What proves it works?                  | [Testing strategy](testing.md), [delivery records](delivery/README.md)                                                          |
| How do we ship and support it?         | [Releases](operations/releases.md), [maintenance](operations/maintenance.md)                                                    |
| How do we protect data and sources?    | [Security/privacy](operations/security-privacy.md), [licensing](operations/licensing.md)                                        |
| How do we add a platform?              | [Extension recipes](architecture/extensions.md)                                                                                 |
| What is the example meant to do?       | [Example specification](examples/checklist-specification.md); current [user guide](user-guide.md) describes the MVP             |

## Authority and lifecycle

For ordered product navigation use the [specification index and delivery ledger](product/specifications/README.md). Main files use `NNNN-short-name.md`; supporting files share that prefix. Allocate the next unused four-digit number when writing a real specification, never recycle it, and do not renumber history when priority changes. Record actual implementation commits, evidence and releases in the index/ledger; filenames alone cannot prove delivery order. The [backlog](planning/backlog.md) owns priority and readiness.

The maintainer's current instruction governs the task. Among project documents, accepted specifications govern behavior and scope; accepted architecture decisions govern technical boundaries. Current context summarizes those decisions. Status records execution; it does not introduce product scope. Backlog, plans, historical evidence, examples, and discovery cannot silently override an accepted contract.

Resolve conflicts explicitly and update the affected living documents. A later accepted feature specification must name the earlier behavior it replaces. Keep the MVP as a living contract for accepted MVP discovery: reconcile changed behavior in place alongside implementation, as the maintainer decided on 2026-09-16. Keep future unaccepted ideas and substantial separate features out of it; preserve historical baselines through Git and dated evidence. Keep historical evidence dated; add corrections or replacement records without rewriting past results as if they were known then.

The reusable templates are [feature specification](templates/feature-specification.md), [implementation plan](templates/implementation-plan.md), [decision](templates/decision.md), [verification](templates/verification.md), and [learning note](templates/learning-note.md). Copy only the documents a task needs. Product specifications belong in `docs/product/specifications/` when created; dated plans and evidence belong in `docs/delivery/`.

Use `FEAT-001`, `BUG-001`, and `TECH-001` identifiers within each repository; qualify them with the project name in cross-project conversations. Number ADRs sequentially. Use ISO dates in dated records. Keep one canonical backlog: GitHub issues are intake by default, with links to accepted local items; move the canonical backlog to issues only by a deliberate workflow decision.
