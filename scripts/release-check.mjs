import { execFileSync } from 'node:child_process';
import { readFileSync, realpathSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export function validateMetadata(pkg, lock, project, changelog, tag) {
  if (
    !/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-(?:alpha|beta|rc)\.(0|[1-9]\d*))?$/.test(
      pkg.version,
    )
  )
    throw new Error('Use a release version such as 0.1.0 or 0.1.0-beta.1.');
  if (
    pkg.version !== lock.version ||
    pkg.version !== lock.packages?.['']?.version ||
    pkg.name !== lock.name ||
    pkg.name !== lock.packages?.['']?.name
  )
    throw new Error('Package and lockfile identities disagree.');
  if (tag !== `v${pkg.version}`)
    throw new Error('Tag and package version disagree.');
  if (
    !/^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(
      project.repository,
    ) ||
    project.repository.endsWith('.git')
  )
    throw new Error(
      'Set project.config.json repository to the actual GitHub repository URL (without .git or trailing slash).',
    );
  if (
    !changelog
      .split('\n')
      .some(
        (line) =>
          line.startsWith(`## ${pkg.version} — `) &&
          / — \d{4}-\d{2}-\d{2}$/.test(line),
      )
  )
    throw new Error('Add a dated changelog section for this version.');
}

export function sourceCheck(tag) {
  const git = (...args) =>
    execFileSync('git', args, { encoding: 'utf8' }).trim();
  if (realpathSync(git('rev-parse', '--show-toplevel')) !== realpathSync('.'))
    throw new Error('Run from this project’s Git root.');
  if (git('status', '--porcelain'))
    throw new Error('Release source must be clean, including untracked files.');
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  validateMetadata(
    pkg,
    JSON.parse(readFileSync('package-lock.json', 'utf8')),
    JSON.parse(readFileSync('project.config.json', 'utf8')),
    readFileSync('CHANGELOG.md', 'utf8'),
    tag,
  );
  const commit = git('rev-parse', 'HEAD');
  return { version: pkg.version, commit, tag };
}

export function releaseCheck(tag) {
  const identity = sourceCheck(tag);
  const git = (...args) =>
    execFileSync('git', args, { encoding: 'utf8' }).trim();
  if (git('cat-file', '-t', `refs/tags/${tag}`) !== 'tag')
    throw new Error('Release tags must be annotated.');
  if (git('rev-parse', `refs/tags/${tag}^{commit}`) !== identity.commit)
    throw new Error('HEAD is not the requested release tag.');
  return identity;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  try {
    console.log(JSON.stringify(releaseCheck(process.argv[2]), null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
