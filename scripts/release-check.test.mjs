import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateMetadata } from './release-check.mjs';

test('release metadata rejects mismatched tags, lockfiles, and missing setup', () => {
  const pkg = { name: 'demo', version: '0.1.0' };
  const lock = { ...pkg, packages: { '': { ...pkg } } };
  const project = { repository: 'https://github.com/example/demo' };
  const changelog = '## 0.1.0 — 2026-09-12\n';
  assert.doesNotThrow(() =>
    validateMetadata(pkg, lock, project, changelog, 'v0.1.0'),
  );
  assert.throws(
    () => validateMetadata(pkg, lock, project, changelog, 'v0.2.0'),
    /Tag/,
  );
  assert.throws(
    () =>
      validateMetadata(
        pkg,
        { ...lock, version: '0.0.1' },
        project,
        changelog,
        'v0.1.0',
      ),
    /identities/,
  );
  assert.throws(
    () => validateMetadata(pkg, lock, { repository: '' }, changelog, 'v0.1.0'),
    /repository/,
  );
  assert.throws(
    () => validateMetadata(pkg, lock, project, '', 'v0.1.0'),
    /changelog/,
  );
});
