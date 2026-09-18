import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { sourceCheck, releaseCheck } from './release-check.mjs';
import {
  validateRemote,
  validateToolchain,
  validateVerification,
} from './release-preflight.mjs';

test('preflight requires the latest successful main push run for the exact commit', () => {
  const passed = {
    databaseId: 123,
    headSha: 'a'.repeat(40),
    event: 'push',
    headBranch: 'main',
    status: 'completed',
    conclusion: 'success',
    url: 'https://github.com/example/demo/actions/runs/123',
  };
  assert.deepEqual(validateVerification([passed], passed.headSha), {
    runId: 123,
    url: passed.url,
  });
  for (const runs of [
    [],
    [{ ...passed, headSha: 'b'.repeat(40) }],
    [{ ...passed, event: 'pull_request' }],
    [{ ...passed, headBranch: 'feature' }],
    [{ ...passed, status: 'in_progress', conclusion: '' }, passed],
    ...['failure', 'cancelled', 'skipped', 'timed_out'].map((conclusion) => [
      { ...passed, conclusion },
      passed,
    ]),
  ])
    assert.throws(
      () => validateVerification(runs, passed.headSha),
      /before tagging/,
    );
});

test('preflight rejects toolchain drift and unrelated fetch/push repositories', () => {
  assert.doesNotThrow(() =>
    validateToolchain('v24.20.0', '11.19.0', '24.20.0', '11.19.0'),
  );
  assert.throws(() =>
    validateToolchain('v22.0.0', '11.19.0', '24.20.0', '11.19.0'),
  );
  assert.throws(() =>
    validateToolchain('v24.20.0', '10.0.0', '24.20.0', '11.19.0'),
  );
  for (const remote of [
    'https://github.com/example/demo.git',
    'https://github.com/example/demo',
    'git@github.com:example/demo.git',
  ])
    assert.doesNotThrow(() =>
      validateRemote(remote, 'https://github.com/example/demo'),
    );
  assert.throws(() =>
    validateRemote(
      'https://github.com/example/other.git',
      'https://github.com/example/demo',
    ),
  );
});

test('pre-tag source check needs no tag; release check rejects lightweight, stale and dirty tags', () => {
  const directory = mkdtempSync(join(tmpdir(), 'egg-release-check-'));
  const previous = process.cwd();
  const git = (...args) =>
    execFileSync('git', args, { cwd: directory, encoding: 'utf8' }).trim();
  try {
    git('init', '--quiet');
    git('config', 'user.name', 'Release test');
    git('config', 'user.email', 'release-test@example.invalid');
    const pkg = { name: 'demo', version: '0.1.0' };
    writeFileSync(join(directory, 'package.json'), JSON.stringify(pkg));
    writeFileSync(
      join(directory, 'package-lock.json'),
      JSON.stringify({ ...pkg, packages: { '': pkg } }),
    );
    writeFileSync(
      join(directory, 'project.config.json'),
      JSON.stringify({ repository: 'https://github.com/example/demo' }),
    );
    writeFileSync(join(directory, 'CHANGELOG.md'), '## 0.1.0 — 2026-09-18\n');
    git('add', '.');
    git('-c', 'commit.gpgsign=false', 'commit', '--quiet', '-m', 'Fixture');
    process.chdir(directory);
    assert.equal(sourceCheck('v0.1.0').commit, git('rev-parse', 'HEAD'));
    git('-c', 'tag.gpgsign=false', 'tag', 'v0.1.0');
    assert.throws(() => releaseCheck('v0.1.0'), /annotated/);
    git('tag', '-d', 'v0.1.0');
    git(
      '-c',
      'tag.gpgsign=false',
      'tag',
      '-a',
      'v0.1.0',
      '-m',
      'Fixture release',
    );
    assert.equal(releaseCheck('v0.1.0').tag, 'v0.1.0');
    writeFileSync(join(directory, 'untracked.txt'), 'Unreviewed source');
    assert.throws(() => sourceCheck('v0.1.0'), /clean/);
    git('add', '.');
    git(
      '-c',
      'commit.gpgsign=false',
      'commit',
      '--quiet',
      '-m',
      'Later source',
    );
    assert.throws(() => releaseCheck('v0.1.0'), /HEAD/);
  } finally {
    process.chdir(previous);
    rmSync(directory, { recursive: true, force: true });
  }
});
