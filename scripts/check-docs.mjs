import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const ignored = new Set([
  'node_modules',
  '.git',
  '.local',
  'dist',
  'out',
  'coverage',
  'test-results',
  'playwright-report',
]);
function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (ignored.has(entry.name) || entry.isSymbolicLink()) return [];
    const path = resolve(directory, entry.name);
    return entry.isDirectory()
      ? walk(path)
      : path.endsWith('.md')
        ? [path]
        : [];
  });
}
const errors = [];
for (const file of walk('.')) {
  const source = readFileSync(file, 'utf8').replace(/```[\s\S]*?```/g, '');
  for (const [, raw] of source.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const target = raw.split('#')[0];
    if (!target || /^(https?:|mailto:)/.test(target)) continue;
    const path = resolve(dirname(file), decodeURIComponent(target));
    if (
      !existsSync(path) ||
      !(statSync(path).isFile() || statSync(path).isDirectory())
    ) {
      errors.push(`${file}: missing ${target}`);
    }
  }
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else
  console.log(
    'Local Markdown file links are valid (anchors and external URLs are not checked).',
  );
