# Security, privacy, and dependency handling

## Current trust boundaries

The MVP has no backend. Its trust inputs include slider values, sessionStorage records, browser location, Open-Meteo and BigDataCloud JSON, device time and delivered app/build dependencies. Strict domain validators and bounded browser adapters protect those boundaries. Svelte text interpolation presents values without raw HTML. No secrets belong in source or browser configuration. Vite exposes `VITE_*` values to client code as documented in [environment variables](https://vite.dev/guide/env-and-mode); a `.env` file does not make a bundled value secret.

Keep the dev/preview server on loopback. Test fixtures and screenshots should be synthetic. Ignore personal data and local notes; `.gitignore` does not remove a secret already committed. If a credential leaks, revoke/rotate it and then assess history/artifact cleanup.

Public specifications, discovery, examples and verification records use roles or clearly synthetic identities. Do not record real names, personal email addresses, private locations or household profiles in public project files. Before first publication, scan both the proposed tree and the full history; sanitizing only the current file does not remove earlier copies.

At each new external capability, record: input source, data held, where it travels, owner, retention/deletion, permission timing, malformed/denied/unavailable behavior, and abuse/resource limits. For a server, add authentication AND authorization, rate/input limits, secrets, secure sessions, and logs with redaction. For local files, define read/write ownership and protect originals.

### Implemented MVP boundaries

The [quick-cook specification](../product/specifications/0001-mvp.md) owns the accepted consent, bounded response validation, timeout/fallback and active-session schema contracts. On informed activation, rounded browser coordinates go directly to Open-Meteo elevation/weather and BigDataCloud client-side locality endpoints; requests expose an IP address to the provider. No location history, raw responses or coordinates are persisted by the app. The [science/provider record](../product/specifications/0001-mvp-science.md) documents provider retention/terms and required attribution. Do not log coordinates or capture real locations in test traces. Same-tab recovery stores only the validated active cooking snapshot.

Direct public environmental APIs are expressly within the accepted MVP scope. An application backend, secret-bearing API, proxy, account or alternative host remains excluded. Provider access/terms changes require an explicit product decision; they cannot be worked around by embedding credentials in the static bundle. Standard conditions allow a loaded cooking journey to continue without external access.

The explicit interface-language preference stores only validated `en` or `de` under `egg-cooker.language.v1`. It is independent of the active-cook schema and contains no personal data. Changing language does not trigger a location request; the selected language is sent to BigDataCloud only with an otherwise authorized locality lookup.

## Dependency policy

Use the lockfile and `npm ci` for verification and releases. Direct versions are exact; update deliberately with the manifest and lockfile together. Review compatibility, maintenance, license, and reason for adding a package. Installation and npm audit need network access; audit sends dependency metadata to npm. Those are normal documented development operations, not app telemetry.

`audit:prod` is a useful filtered view; `audit:all` includes build/test dependencies. The candidate/deployment gates require a successful complete-tree audit with no reported vulnerabilities. A service/network error also blocks; it is not evidence of a clean audit. There is **no inherited advisory allowlist** from other projects.

If a finding has no compatible fix, investigate severity, actual runtime/build reachability, exploit conditions, alternatives, mitigation and upstream status. If a temporary exception is warranted, record the specific advisory/package/path, owner, rationale, expiry/review trigger and approved scope, then implement a precise gate with negative tests. Do not change a threshold or add `continue-on-error` merely to ship. The repository intentionally omits a generic exception engine until one is needed.

Dependabot proposes updates; it does not auto-merge them. Weekly advisory checks complement source CI because new advisories can appear without a code change. Watch notification delivery and review pending updates. Supply-chain compromise and undisclosed vulnerabilities remain outside the assurance of a clean audit.

## Incident response

1. Triage confidentially through the configured reporting channel; reproduce on synthetic data and identify affected versions and impact.
2. Contain the relevant exposure: suspend a deployment/feature, withdraw an artifact, or rotate affected credentials as appropriate and authorized. Record facts and timestamps.
3. Fix the cause, add regression evidence, rebuild and test the exact replacement artifact. Check stored data/compatibility implications.
4. Publish a new version and accurate advisory/notice within the authorized scope. Never silently replace a versioned artifact with different bytes.
5. Record the cause and one preventive change; reconcile the backlog, supported-version statement, and affected public docs.

Set up the actual private reporting channel before public publication; [SECURITY](../../SECURITY.md) deliberately says pending until that happens.

## Hosted security posture

Use HTTPS. Configure and verify appropriate CSP, `X-Content-Type-Options`, referrer and permissions policies where the chosen host supports them. Test the actual browser/network behavior after deployment. GitHub Pages does not offer arbitrary response-header configuration through a repository file. The accepted MVP boundary excludes switching hosts or adding services to bypass that limit; narrow or defer incompatible requirements instead. Do not claim a header was deployed merely because a policy document lists it.

## Current location preference

[0004](../product/specifications/0004-continuous-controls.md) authorizes an informed direct lookup and one automatic lookup on later visible visits when its stored boolean preference is enabled and browser permission is already granted. A failed/unsupported query must not cause a startup prompt. About removes the preference. No coordinates are persisted; permission inspection and API work must be invalidated by manual adjustment or Start. Provider attribution and sharing details are in About. BigDataCloud accepts only current coordinates from the requesting client; no synthetic live probes, proxy or IP fallback. Optional names are validated bounded plain text and never stored. City failure cannot change the cooking calculation. Stop timer freezes only in-memory results and deletes the active cook record.
