# Contributing

Describe the user problem before expanding scope. Follow the [cookbook](docs/cookbook.md) and [operating contract](AGENTS.md). Small fixes need a clear reproduction/outcome and appropriate checks; substantial features need an accepted specification before broad implementation.

Install the pinned toolchain, run `npm ci`, install Playwright browsers, and run `npm run verify:all`. Explain any remaining manual checks. Keep changes focused and update affected user/architecture/operations docs in the same change.

Do not submit private data, credentials, copyrighted assets without permission, or unreviewed dependency overrides. Follow [SECURITY](SECURITY.md) for vulnerabilities rather than creating a public exploit report. The repository uses Apache-2.0 for its source; retain applicable notices for third-party contributions and assets.
