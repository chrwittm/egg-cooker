import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const folder = new URL('../src/experiments/assets/', import.meta.url);
const manifest = JSON.parse(
  readFileSync(new URL('tracks.json', folder), 'utf8'),
);
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
if (
  hash(
    readFileSync(
      new URL('../src/assets/rooster-ready-warm.mp3', import.meta.url),
    ),
  ) !== manifest.sourceSha256
)
  throw new Error('Rooster source identity differs');
if (manifest.tracks.length !== 4) throw new Error('Missing audio variants');
for (const track of manifest.tracks) {
  const bytes = readFileSync(new URL(track.file, folder));
  if (
    hash(bytes) !== track.sha256 ||
    bytes.length !== track.bytes ||
    ![60, 300].includes(track.targetSeconds) ||
    !['quiet', 'ticks'].includes(track.variant) ||
    Math.abs(track.durationSeconds - track.targetSeconds - 3.4) > 0.05 ||
    track.codec !== 'mp3' ||
    track.channels !== 1 ||
    track.sampleRate !== 44100
  )
    throw new Error(`Invalid audio fixture: ${track.file}`);
}
console.log(
  'Four media fixtures match recorded identities, formats and durations.',
);
