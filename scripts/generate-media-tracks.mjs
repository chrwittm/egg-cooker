import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const folder = `${root}src/experiments/assets`;
mkdirSync(folder, { recursive: true });
const source = `${root}src/assets/rooster-ready-warm.mp3`;
const expected =
  '1db417d0bced989e534683dcba90708f5ec5d037ae9caf95ae1ea7b8642d3a90';
const hash = (path) =>
  createHash('sha256').update(readFileSync(path)).digest('hex');
if (hash(source) !== expected) throw new Error('Unexpected rooster source');
const tracks = [];
for (const seconds of [60, 300]) {
  for (const variant of ['quiet', 'ticks']) {
    const file = `rooster-${seconds}-${variant}.mp3`;
    // A short, soft 1 kHz tick each second, with an attack/release envelope.
    const signal =
      variant === 'quiet'
        ? 'anullsrc=r=44100:cl=mono'
        : "aevalsrc='0.06*sin(2*PI*1000*t)*if(lt(mod(t,1),0.05),sin(PI*mod(t,1)/0.05)^2,0)':s=44100";
    execFileSync('ffmpeg', [
      '-hide_banner',
      '-loglevel',
      'error',
      '-y',
      '-f',
      'lavfi',
      '-t',
      String(seconds),
      '-i',
      signal,
      '-i',
      source,
      '-filter_complex',
      '[0:a][1:a]concat=n=2:v=0:a=1[out]',
      '-map',
      '[out]',
      '-ar',
      '44100',
      '-ac',
      '1',
      '-codec:a',
      'libmp3lame',
      '-q:a',
      '5',
      `${folder}/${file}`,
    ]);
    const probe = JSON.parse(
      execFileSync(
        'ffprobe',
        [
          '-v',
          'error',
          '-show_entries',
          'format=duration:stream=codec_name,sample_rate,channels',
          '-of',
          'json',
          `${folder}/${file}`,
        ],
        { encoding: 'utf8' },
      ),
    );
    tracks.push({
      file,
      targetSeconds: seconds,
      variant,
      durationSeconds: Number(probe.format.duration),
      codec: probe.streams[0].codec_name,
      sampleRate: Number(probe.streams[0].sample_rate),
      channels: probe.streams[0].channels,
      bytes: readFileSync(`${folder}/${file}`).length,
      sha256: hash(`${folder}/${file}`),
    });
  }
}
writeFileSync(
  `${folder}/tracks.json`,
  `${JSON.stringify({ sourceSha256: expected, ffmpeg: execFileSync('ffmpeg', ['-version'], { encoding: 'utf8' }).split('\n')[0], tracks }, null, 2)}\n`,
);
console.log(
  'Generated four complete tracks with embedded rooster; see tracks.json.',
);
