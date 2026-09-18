import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { sourceCheck } from './release-check.mjs';

export function validateVerification(runs, commit) {
  const run = runs[0];
  if (
    !run ||
    run.headSha !== commit ||
    run.event !== 'push' ||
    run.headBranch !== 'main' ||
    run.status !== 'completed' ||
    run.conclusion !== 'success'
  )
    throw new Error(
      `The latest main push Verify run for ${commit} must have succeeded before tagging. ${run?.url || 'Push the reviewed commit, then wait for Verify.'}`,
    );
  return { runId: run.databaseId, url: run.url };
}

export function validateToolchain(node, npm, expectedNode, expectedNpm) {
  if (node !== `v${expectedNode}` || npm !== expectedNpm)
    throw new Error(
      `Use Node ${expectedNode} and npm ${expectedNpm}; found ${node} and npm ${npm}. Activate the pinned toolchain before release work.`,
    );
}

export function validateRemote(remote, repository) {
  const normalized = remote
    .replace(/^git@github\.com:/, 'https://github.com/')
    .replace(/\.git$/, '');
  if (normalized !== repository)
    throw new Error('origin must match project.config.json repository.');
}

export function releasePreflight(tag) {
  const run = (command, args) =>
    execFileSync(command, args, {
      encoding: 'utf8',
      timeout: 30000,
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  validateToolchain(
    process.version,
    run('npm', ['--version']),
    readFileSync('.node-version', 'utf8').trim(),
    pkg.packageManager.replace(/^npm@/, ''),
  );
  const identity = sourceCheck(tag);
  const { repository } = JSON.parse(
    readFileSync('project.config.json', 'utf8'),
  );
  validateRemote(run('git', ['remote', 'get-url', 'origin']), repository);
  validateRemote(
    run('git', ['remote', 'get-url', '--push', 'origin']),
    repository,
  );
  // This authenticated read also fails closed when gh is missing or logged out.
  // Do not filter by success: a newer failed/running rerun must block release.
  const runs = JSON.parse(
    run('gh', [
      'run',
      'list',
      '--repo',
      repository,
      '--workflow',
      'ci.yml',
      '--commit',
      identity.commit,
      '--branch',
      'main',
      '--event',
      'push',
      '--limit',
      '1',
      '--json',
      'databaseId,headSha,headBranch,event,status,conclusion,url',
    ]),
  );
  return {
    ...identity,
    verification: validateVerification(runs, identity.commit),
  };
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  try {
    console.log(JSON.stringify(releasePreflight(process.argv[2]), null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
