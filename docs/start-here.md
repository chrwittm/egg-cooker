# Work on Egg Cooker

## Start a session

1. Read [current status](planning/status.md), [product context](product/context.md), and the [discovery handoff](discovery/10-codex-handoff.md). Discovery records rationale and candidates; it does not silently authorize the whole backlog.
2. Activate the pinned Node/npm versions, run `npm ci`, install Playwright browsers, and run `npm run verify:all`. A successful fresh install is the baseline, not just an existing `node_modules` tree.
3. Refine [product context](product/context.md) only when a lasting product boundary becomes accepted. Record unknowns instead of guessing acceptance.
4. Keep private learning notes and raw transcripts in ignored `.local/`. Public discovery and examples use role labels or clearly synthetic data, never real names, personal email addresses, private locations or household profiles.
5. Choose one thin vertical slice from the [backlog](planning/backlog.md). New product behavior needs observable acceptance criteria and, when substantial, a numbered specification.
6. Review [ADR 0001](architecture/decisions/0001-baseline.md) before changing the deployment or architectural boundary.

## Establish version control

Inspect every proposed commit from the project root:

```sh
git status --short
git add --patch
git diff --cached --stat
git diff --cached
```

Check that no credentials, personal identifiers, private fixtures, build output or local notes are staged. Review both current files and any history that will become public. Use the repository-scoped GitHub noreply address for public commits.

## Before publishing the source

- Confirm `project.config.json`, package repository/homepage/bugs metadata and the GitHub repository identity agree.
- Review source ownership, Apache-2.0 default, and assets using [licensing](operations/licensing.md). Confirm [PRIVACY](../PRIVACY.md) describes the actual product.
- Enable private vulnerability reporting and test the route in [SECURITY](../SECURITY.md).
- Create/push the repository within the authorized publication scope. Check that `Verify / verify` succeeds. Where available, protect `main` with that required status check and disallow force-pushes. Do not require a second human approval for a solo project that cannot supply one.
- Review Actions permissions, dependency alerts, Dependabot, and notification delivery. These settings are not activated merely by having documentation.
- For Pages, choose GitHub Actions as the Pages source and configure the `github-pages` environment. If desired and supported, protect deployment with a reviewer/environment rule. No deployment runs automatically on push.

## Before first release

Complete the [release runbook](operations/releases.md), identify supported versions/platforms and keep experimental limitations visible. Update both runtime pin files, package engine/packageManager fields, workflow npm pins and setup documentation together when deliberately changing the toolchain.
