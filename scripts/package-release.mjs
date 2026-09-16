import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { releaseCheck } from './release-check.mjs';

const identity = releaseCheck(process.argv[2]);
const build = JSON.parse(readFileSync('dist/build-info.json', 'utf8'));
if (build.version !== identity.version || build.commit !== identity.commit)
  throw new Error(
    'Build identity does not match release source. Rebuild and retest.',
  );
mkdirSync('out/release', { recursive: true });
const archive = `app-${identity.version}.tar.gz`;
execFileSync('tar', ['-czf', `out/release/${archive}`, '-C', 'dist', '.']);
const sha256 = createHash('sha256')
  .update(readFileSync(`out/release/${archive}`))
  .digest('hex');
writeFileSync('out/release/SHA256SUMS', `${sha256}  ${archive}\n`);
writeFileSync(
  'out/release/evidence.json',
  JSON.stringify(
    {
      ...identity,
      sha256,
      archive,
      node: process.version,
      createdAt: new Date().toISOString(),
    },
    null,
    2,
  ) + '\n',
);
console.log(
  `Packaged ${archive}; retain the matching verification and manual acceptance record.`,
);
