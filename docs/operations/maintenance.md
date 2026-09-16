# Maintain what users rely on

The sole maintainer owns product support and decides how much time the project can sustain. Agents can investigate and implement work; somebody still has to receive reports, decide priority, and verify real-world usefulness.

| Cadence / trigger                    | Small useful action                                                                                                       |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Each change                          | Run the relevant gate and update affected docs                                                                            |
| Weekly while actively used           | Triage bugs, dependency alerts, and failed scheduled audits; confirm notification delivery                                |
| Each release                         | Check platform claims, user guide, known issues, artifact identity, rollback, and unresolved risks                        |
| Monthly while active                 | Review one slow/painful part of the workflow; prune stale backlog and unused dependencies                                 |
| New storage/backend                  | Define recovery objectives and rehearse export/backup restoration before users rely on durability                         |
| New major platform/toolchain version | Test representative flows before changing the support statement                                                           |
| Paused/retired project               | State support status honestly; disable obsolete deployments/secrets/jobs deliberately and preserve access/export guidance |

## Diagnostics and feedback

Start with version/build identity, understandable error messages, and reproducible synthetic cases. `dist/build-info.json` identifies a build. Local diagnostic export, if added, should be explicit and redact personal data. Do not add remote analytics/crash reporting by default. Add it only when a product question justifies the data collection and its retention/consent/operational cost is understood.

## Recovery

The application has no durable user data, so there is no meaningful backup procedure yet. As soon as durable persistence is introduced, define what is recoverable, where backups live, restore prerequisites, migration compatibility and a representative restoration drill. A successful backup command does not prove the backup can be used. Test restores into a separate disposable destination; never use originals as a rehearsal target.

Review recurring obligations when choosing a feature: third-party API drift, hosting costs, map/data licenses, device compatibility, and schema upgrades can matter more than the initial implementation effort. Prefer the smallest product promise the maintainer can actually support.
