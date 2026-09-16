# Release, publish, deploy, and recover

The repository implements source verification, release preflight, candidate archives with SHA-256/build identity and a manually dispatched GitHub Pages deployment. Repository settings, public release creation and hosted smoke checks remain explicit operational actions.

## Version convention

Use one application version in `package.json`, mirrored by `package-lock.json`. Build metadata derives from it. Tags are `vVERSION`. Use a small SemVer convention: before 1.0, patch for compatible fixes and minor for features or deliberate compatibility changes; explicitly announce breaking data/API changes even in 0.x. After 1.0, incompatible public behavior/contracts require a major version. Prereleases may use `-alpha.N`, `-beta.N`, or `-rc.N`. Application and persisted-schema versions have separate meanings.

Keep user-facing changes under `Unreleased`. Before tagging, create a dated section `## VERSION — YYYY-MM-DD` with features/fixes, compatibility or migration notes, known limitations, and installation changes. Do not use the changelog as a developer task log.

## Prepare a candidate

1. Confirm the intended release scope and completed acceptance criteria. Review the [first-publication setup](../start-here.md), actual product guide, supported platforms, security-reporting channel, source/assets/dependency notices, and known issues.
2. Set the candidate version with `npm version VERSION --no-git-tag-version` (substitute the actual version) and update the changelog. Run formatting and the full gate. Review and commit the release source. Keep the working tree clean; ignored output is allowed, untracked source is not.
3. Create an annotated local `vVERSION` tag at that reviewed commit. `npm run release:check -- vVERSION` verifies Git root/cleanliness, tag/HEAD, package/lock identity, real repository URL, and a dated changelog section. It does not certify human acceptance or GitHub settings.
4. From a fresh checkout of that tag, use the pinned toolchain and execute:

```sh
npm ci --no-audit --no-fund
npx playwright install
npm run release:check -- vVERSION
npm run verify:all
npm run audit:all
node scripts/package-release.mjs vVERSION
```

Replace `vVERSION` with the actual tag throughout. On Linux use `npx playwright install --with-deps`. The archive and checksum/evidence file are under `out/release/`. Packaging verifies that `dist/build-info.json` matches the tag, but relies on the preceding browser gate; it is not a substitute for that gate. Release automation performs the sequence in one fresh runner.

5. Inspect the archive contents and extract it to a disposable directory; serve it with a static HTTP server and smoke-test the primary flow. Check version/build info and the SHA-256 checksum. Use the actual supported device for acceptance that automation cannot supply. The simple static archive contains `dist/` only; it is not a desktop installer.
6. Record source, command results, audit date, artifact checksum, real-device checks, limitations, and remaining decisions using the [verification template](../templates/verification.md). The tested source commit precedes a later evidence-only documentation commit; name both if needed rather than implying untested code was checked. Link the verified slice and commit in the [specification delivery ledger](../product/specifications/README.md); record actual release version/date after publication. Specification numbers are not release or implementation order.

## GitHub candidate and release

When authorized to publish source/tags, push the reviewed commit and tag. Run the **Release candidate** workflow from the default branch, supplying that tag. It checks out the tag, reruns verification/audit, and uploads the candidate archive/checksum/evidence for 30 days. Download and preserve approved artifacts before retention expires. The workflow does not create a public release.

Prepare a GitHub draft release targeting the existing tag with user-facing notes, archive, `SHA256SUMS`, and evidence. For a tester release mark it as a prerelease. Publish within the maintainer's authorization, then download the published artifact and compare the checksum with the tested candidate. A draft, pushed tag, and public release are distinct states. Do not regenerate different bytes after approval and upload them under the same version.

## GitHub Pages

GitHub Pages is the hard deployment boundary for the Egg Cooker MVP. The [accepted MVP](../product/specifications/0001-mvp.md) requires subpath, loaded-page network-loss and recovery/model-version checks; see [current evidence](../delivery/2026-09-16-texture-location-verification.md) for automated results and remaining human/deployed-origin checks. Version 0.1.0 is an experimental release: kitchen calibration and broader actual-device evidence remain backlog work and the product must not claim validated texture, food safety, installation/offline reopening or guaranteed suspended alarms. The MVP persists only versioned real active-cook records in sessionStorage. Unknown schema/model versions require Discard; rollback must preserve that explicit incompatibility behavior.

The accepted contract also requires elevation and weather-pressure integration. Verify both from the deployed browser origin, alongside denied permission, stale data and offline fallback. Recheck provider terms for the actual intended use, source attribution and informed coordinate sharing; no secret/proxy workaround is authorized. A synthetic API probe is research evidence, not deployed acceptance. Check that demo acceleration is clearly marked, never changes a real cook and creates no recoverable real-cook record.

Set Pages source to GitHub Actions; configure a custom domain/environment if wanted. The [official Pages workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) describes the required build artifact, deployment permissions, and environment.

Dispatch **Deploy Pages** from the default branch with the accepted tag. This is an intentional publication action. The workflow determines the actual Pages base path, builds and browser-tests using that same path, performs a fresh audit, uploads only `dist/`, and deploys via the `github-pages` environment. It rebuilds from the tag for the host-specific path; its workflow run is the evidence for that hosted build, distinct from the generic downloadable candidate archive.

After deployment, verify the actual URL, main interaction, asset loading, reload and `/build-info.json` under the site's base path. Record the tag, commit, workflow run and URL. A green local preview does not prove DNS, HTTPS, headers or the hosted path. The application has a single route; adding client routing requires an explicit deep-link/fallback decision for the host.

## Rollback and failed release

- Before publication, fix the candidate and retest. Do not move a tag that has already been shared; use a new patch/prerelease version.
- For the Pages app, dispatch **Deploy Pages** for the previous known-good tag. Its fresh verification and audit must pass. Then smoke-test the live page/build identity and record the rollback.
- If fresh audit results block the old tag, investigate and prepare a patched recovery release; do not silently bypass the gate. Keep the previous candidate archives outside expiring CI retention. A hosting outage requires host recovery, not another local build.
- Withdraw a broken downloadable release to draft or mark it clearly superseded, within authorized scope, and publish a new version. Do not overwrite an already published checksum/artifact under its old identity.
- With the current session schema and any future PWA/backend changes, app rollback may not restore schema/cache compatibility. Define and test that recovery before deploying the change. Restore user data only through an explicit, rehearsed procedure.

## Release confidence is layered

`verify:all` proves the automated source/built-browser checks; audit adds current known-advisory information; artifact/device acceptance checks the delivered experience; post-deploy smoke checks the host. None of these alone is the complete release gate. The checklist is short because the product is small, not because those responsibilities disappear.
