# Release, publish, deploy, and recover

The normal release path is: reviewed commit → Linux Verify success → preflight → annotated tag → Linux candidate → artifact acceptance → public release → Pages → hosted smoke. Do not share a stable tag before its exact commit passes Linux Verify. The project-local commands below reduce manual reconstruction; publication and device acceptance remain explicit operational actions.

## Version convention

Use one application version in `package.json`, mirrored by `package-lock.json`. Build metadata derives from it. Tags are `vVERSION`. Use a small SemVer convention: before 1.0, patch for compatible fixes and minor for features or deliberate compatibility changes; explicitly announce breaking data/API changes even in 0.x. After 1.0, incompatible public behavior/contracts require a major version. Prereleases may use `-alpha.N`, `-beta.N`, or `-rc.N`. Application and persisted-schema versions have separate meanings.

Keep user-facing changes under `Unreleased`. Before tagging, create a dated section `## VERSION — YYYY-MM-DD` with features/fixes, compatibility or migration notes, known limitations, and installation changes. Do not use the changelog as a developer task log.

## Prepare and verify the source

1. Confirm the intended release scope and completed acceptance criteria. Review the [first-publication setup](../start-here.md), actual product guide, supported platforms, security-reporting channel, source/assets/dependency notices, and known issues.
2. Activate Node from `.node-version` and npm from `packageManager`; verify `node --version`, `npm --version`, `gh --version` and `gh auth status` before beginning release work. Use the existing version manager; if a command is missing, correct PATH or install the needed tool deliberately. Do not rediscover the toolchain halfway through publication. Check repository/Pages settings on first publication or when they change, rather than repeating initial setup on every patch.
3. Complete the implementation gate once on the resulting code: `BASE_PATH=/egg-cooker/ npm run verify:all`. Obtain the relevant actual-device acceptance early, on a production preview, with device/OS and source/build identity recorded. After corrections, rerun affected device checks; earlier acceptance does not automatically cover later CSS, sound or asset edits.
4. Set the candidate version with `npm version VERSION --no-git-tag-version` and add the dated changelog section. Review and commit the release source. Keep the working tree clean; ignored output is allowed, untracked source is not. Version/notes-only preparation does not require another local full browser gate: Linux Verify checks the final commit. Code or config corrections require the normal completion gate again.
5. Within source-publication authorization, push the reviewed commit to `main` **without a release tag**. Inspect its **Verify** run, including diagnostics on failure. Wait for success, then run:

```sh
npm run release:preflight -- vVERSION &&
git tag -a vVERSION -m "Release vVERSION" &&
npm run release:check -- vVERSION &&
git push origin vVERSION
```

Replace `vVERSION` throughout. Run each step only after the previous succeeds. `release:preflight` is read-only: it checks pinned Node/npm, Git root/cleanliness, package/lock/changelog identity, fetch/push origin and the latest main push Verify run for HEAD. Missing, pending, failed, cancelled or skipped runs block tagging; an older green run cannot substitute for this commit. Its JSON identifies the qualifying run. GitHub CLI access is required; use `gh auth login` if needed. No tag is needed for this check. The run on main covers the Pages subpath on Linux, including Firefox and WebKit.

`release:check` additionally requires an annotated tag at HEAD. Neither command proves human acceptance, advisory status, write permissions or Pages settings. If HEAD changes, repeat the exact-commit Linux gate before tagging. Shared tags remain immutable.

## GitHub candidate and release

Run **Release candidate** from the default branch with the tag, for example `gh workflow run release-candidate.yml -f tag=vVERSION`. Identify the returned run in GitHub (or `gh run list --workflow release-candidate.yml`), verify its source SHA, and use `gh run watch RUN_ID --exit-status`. The workflow rechecks preflight, verifies the generic `BASE_PATH=./` build in a fresh Linux runner, audits dependencies and packages it. Failed browser checks retain reports/traces for seven days. Do not blindly rerun a deterministic failure: inspect the first failed step and fix its cause. Retry unchanged only when there is evidence of a transient infrastructure failure.

Download `release-candidate` with `gh run download RUN_ID --name release-candidate --dir CANDIDATE_DIRECTORY`. Its archive, `SHA256SUMS` and `evidence.json` are the authoritative downloadable candidate; preserve them beyond the 30-day Actions retention. Inspect the archive listing before extraction into a new disposable directory. From the candidate directory run `shasum -a 256 -c SHA256SUMS` (Linux: `sha256sum -c SHA256SUMS`). The checksum file names the archive relative to the working directory.

Serve the extracted files using a static HTTP server, then run from the project with its pinned dependencies installed:

```sh
npm run release:smoke -- http://127.0.0.1:4182/ VERSION FULL_COMMIT_SHA
```

Use the version and full SHA from candidate evidence. The smoke checks identity, page/scripts/styles/manifest/icons, Configure → Cooking → Ready → Cook another egg and reload. It uses a fresh English browser with a controlled clock and blocks external browser requests; it never activates location. Results are written to `out/release-smoke.json`; preserve each result before the next invocation overwrites it. It does not certify audible playback, device behavior or providers. Perform the relevant manual acceptance against this artifact, or explicitly record the earlier tested source and why an intervening metadata-only change preserves that evidence.

Prepare a GitHub draft release targeting the existing tag with user-facing notes, archive, `SHA256SUMS`, and evidence. For a tester release mark it as a prerelease. Publish within the maintainer's authorization, then download the published artifact and compare the checksum with the tested candidate. A draft, pushed tag, and public release are distinct states. Do not regenerate different bytes after approval and upload them under the same version.

Do not repeat fresh local cloning, full verification and packaging after a successful fresh Linux candidate unless investigating a failure or testing a materially different environment. For a necessary local reproduction, use a fresh tagged checkout: `npm ci --no-audit --no-fund`, `npx playwright install` (`--with-deps` on Linux), `npm run release:check -- vVERSION`, `BASE_PATH=./ npm run verify:all`, `npm run audit:all`, then `npm run release:package -- vVERSION`. Packaging checks built version/commit and relies on the preceding gate. Local archives are diagnostic outputs; upload the accepted CI bytes. Tar metadata is not normalized, so independently created archives are not promised to have identical checksums.

The new preflight/package commands apply to source that includes them. Historical tags retain their historical scripts and evidence; use the historical workflow revision when reproducing an old candidate. Pages rollback below remains compatible with the existing tagged release-check command.

## GitHub Pages

GitHub Pages is the hard deployment boundary for the Egg Cooker MVP. The [accepted MVP](../product/specifications/0001-mvp.md) requires subpath, loaded-page network-loss and recovery/model-version checks; see [current evidence](../delivery/2026-09-16-texture-location-verification.md) for automated results and remaining human/deployed-origin checks. Version 0.1.0 is an experimental release: kitchen calibration and broader actual-device evidence remain backlog work and the product must not claim validated texture, food safety, installation/offline reopening or guaranteed suspended alarms. The MVP persists only versioned real active-cook records in sessionStorage. Unknown schema/model versions require Discard; rollback must preserve that explicit incompatibility behavior.

The accepted contract also requires elevation and weather-pressure integration. Verify both from the deployed browser origin, alongside denied permission, stale data and offline fallback. Recheck provider terms when the integration or intended use changes, plus source attribution and informed coordinate sharing; no secret/proxy workaround is authorized. A synthetic API probe is research evidence, not deployed acceptance. If a required check cannot be performed, record Not run/Blocked and the maintainer's existing acceptance of that limitation, or obtain the unresolved decision; never silently call it passed. Check that demo acceleration is clearly marked, never changes a real cook and creates no recoverable real-cook record.

Set Pages source to GitHub Actions; configure a custom domain/environment if wanted. The [official Pages workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) describes the required build artifact, deployment permissions, and environment.

Dispatch **Deploy Pages** from the default branch with the accepted tag. This is an intentional publication action. The workflow determines the actual Pages base path, builds and browser-tests using that same path, performs a fresh audit, uploads only `dist/`, and deploys via the `github-pages` environment. It rebuilds from the tag for the host-specific path; its workflow run is the evidence for that hosted build, distinct from the generic downloadable candidate archive.

After deployment, run `npm run release:smoke -- https://chrwittm.github.io/egg-cooker/ VERSION FULL_COMMIT_SHA`. Preserve the output and record the tag, commit, workflow run and URL. This is a separate invocation against the live origin, not another full source suite. Investigate a mismatch before declaring publication complete. A green local preview does not prove the hosted path. The application has a single route; adding client routing requires an explicit deep-link/fallback decision for the host.

The downloadable candidate explicitly uses `./`; Pages uses its configured subpath. Their generated asset URLs and JavaScript hashes can differ intentionally, even on the same OS. Compare each artifact with its own acceptance evidence. Compare the public download byte-for-byte with the accepted CI download; compare Pages by source identity plus its host-specific workflow and live smoke.

## Evidence and continuation

Keep one dated release verification record with the source SHA, local gate, Linux Verify/candidate/Pages run URLs, base paths, checksum, published URL, artifact smoke, device identity/results and unresolved limitations. Use the [verification template](../templates/verification.md). Status and the [delivery ledger](../product/specifications/README.md) link to that record instead of copying the entire timeline. Record actual version/date after publication; a later evidence-only commit does not change the released source identity.

When interrupted, record the last completed stage and next command, exact source/tag and run IDs, candidate directory/checksum and authorization already given. Resume by inspecting these states; do not republish, recreate tags, reinstall tools or rerun successful builds simply because a session resumed. Summarize material deviations and turn repeated manual recovery into a bounded script improvement.

## Rollback and failed release

- Before publication, fix the candidate and retest. Do not move a tag that has already been shared; use a new patch/prerelease version.
- For the Pages app, dispatch **Deploy Pages** for the previous known-good tag. Its fresh verification and audit must pass. Then smoke-test the live page/build identity and record the rollback.
- If fresh audit results block the old tag, investigate and prepare a patched recovery release; do not silently bypass the gate. Keep the previous candidate archives outside expiring CI retention. A hosting outage requires host recovery, not another local build.
- Withdraw a broken downloadable release to draft or mark it clearly superseded, within authorized scope, and publish a new version. Do not overwrite an already published checksum/artifact under its old identity.
- With the current session schema and any future PWA/backend changes, app rollback may not restore schema/cache compatibility. Define and test that recovery before deploying the change. Restore user data only through an explicit, rehearsed procedure.

## Release confidence is layered

`verify:all` proves the automated source/built-browser checks; audit adds current known-advisory information; artifact/device acceptance checks the delivered experience; post-deploy smoke checks the host. None of these alone is the complete release gate. The checklist is short because the product is small, not because those responsibilities disappear.
