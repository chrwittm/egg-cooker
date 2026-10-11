# GitHub Pages media feasibility — 2026-10-11

**Scope:** The maintainer corrected the intended architecture to a GitHub Pages-only web app and then authorized this isolated experiment and its test deployment. No native host, Xcode, App Store, notification server or product release is involved. The public experimental timer remains v0.1.2. This is technical discovery, not acceptance of suspended alarms.

**Question:** Can a user-started, completely downloaded HTML audio track finish with the accepted rooster while an iPhone is locked? Does Media Session supply readable static egg artwork, playback progress and navigation back to the same page? What interrupts it?

## Implementation and reproducibility

Source: `src/experiments/`, entry `experiments/media/index.html`, build `vite.media.config.ts`. The lab is a separate Svelte 5 entry with its own standalone manifest and relative asset paths. It does not import the cooking app, its storage or location adapters. No new npm dependency. Assets use existing original egg icon artwork and the public-domain rooster derivative.

The immediate sound check uses the existing 3.4-second rooster. Four complete mono 44.1 kHz MP3s contain a 60/300-second silent or soft-ticking segment followed by the same rooster. No deadline callback starts the recording. The generator uses FFmpeg 8.0.1, already installed locally; playback needs no FFmpeg or server. Committed files and SHA-256/format identities are in `src/experiments/assets/tracks.json`.

```sh
node scripts/generate-media-tracks.mjs # only when intentionally regenerating fixtures; requires FFmpeg
node scripts/check-media-tracks.mjs
BASE_PATH=/egg-cooker/ npm run verify:all
npm run build:media-lab
npm run test:media-lab
npm run preview:media-lab
```

Use Node 24.20.0 / npm 11.19.0. `npm run verify:media-lab` checks identities, builds the experiment and tests the built page. The normal Linux Verify adds that command after the existing product gate. Build identity and every trial name their exact source commit; local precommit builds are development evidence only. Repeat the final build after committing before deployment.

Each track is fetched fully into a Blob before enabling Start. Start freezes the wall-clock deadline before asking the audio element to play. Pauses/seeks cannot change this target; page countdown and media progress/drift are separate observations. Reopening never starts playback. System media controls can pause/resume playback; interrupted playback can fall behind the physical cooking timeline. A media card is not an AlarmKit countdown or a Live Activity.

Diagnostics use a dedicated, versioned browser-local key: `egg-cooker.media-lab.v1`. Up to 20 runs and 250 event observations per run are retained, with model/OS text, manually selected conditions and audibility/artwork/progress/navigation observations. Validation bounds imported data and strips extra fields. Export downloads JSON; Clear removes the lab record. No diagnostic upload, location, microphone, account or telemetry. Hosting request logs are outside this local-data claim.

## Actual-device procedure

Use normal media volume and phone speaker first. Record phone model and exact iOS version in the lab. On a second device, start a stopwatch or make a recording that captures Start and the rooster. Page event timestamps can arrive after suspension and cannot establish audibility or exact locked-screen timing.

1. Run Immediate rooster with the page visible. Confirm audibility.
2. Run 1-minute quiet, lock immediately, wait past the target without reopening, then return and record sound/artwork/progress/navigation observations and independently measured offset.
3. Repeat with soft ticks. For successful quiet/ticking variants, repeat locked tests three times. Also compare visible-page and another-app foreground cases.
4. Add the lab to the Home Screen as a web app, launch its distinct icon, and repeat. Export records from both contexts; their storage may differ. Identify Safari versus standalone from the recorded capability.
5. For a successful variant, repeat at 5 minutes, then lock → reopen → lock. Confirm the original target and no second playback source.
6. Test Silent Mode, Focus and Low Power Mode separately; select the corresponding condition before Start. Record audible behavior rather than assuming alarm priority.
7. Test incoming calls and competing media, Lock Screen pause/seek controls, and losing connectivity after Track downloaded. Record delay/interruption. Closing/reopening must preserve the record without automatically replaying sound.
8. Export results for review. Do not publish personal exports/screenshots in Git; use synthetic public records only.

Provisional feasibility threshold: three locked runs with audible rooster within ±2 seconds of the committed target, then successful 5-minute runs. Artwork, progress and tap-to-return are separate results. A successful normal case is not a guarantee through force-close, interruptions, OS reclamation or all device versions. If only audible ticks work, revisit whether that experience is acceptable; do not silently replace quiet cooking.

## Evidence

- Native/device audibility, Lock Screen artwork/progress/navigation, Safari versus standalone, Focus/Silent/Low Power/interruption behavior: **Pending actual iPhone observation**.
- Local decoded-audio inspection: all four tracks decode to 63.400/303.400 seconds. Rooster amplitude first exceeds 0.02 at 60.021/300.021 seconds. Quiet prefixes are silent; ticking prefixes have a soft audible pulse. This establishes file content, not phone-speaker sound.
- Automated source/browser gates and final deployed identity: record results below once run.
- Publication target: dedicated `egg-cooker-media-lab` Pages site. Its generated artifact refers to the source in the cooking repository; product Pages deployment is unchanged.

References: [Media Session specification](https://www.w3.org/TR/mediasession/), [WebKit background lifecycle](https://webkit.org/blog/8970/how-web-content-can-affect-power-usage/), [Safari background audio notes](https://developer.apple.com/documentation/safari-release-notes/safari-17_5-release-notes).

### Local automated checkpoint

- Node 24.20.0 / npm 11.19.0: `BASE_PATH=/egg-cooker/ npm run verify:all` passed (104 unit/adapter tests, 4 script tests, 150 product browser checks).
- `npm run verify:media-lab` passed on the resulting experiment: four fixture identity checks and 18 browser checks across Chromium/Firefox/WebKit. Actual HTMLAudioElement playback, completion and pause are exercised; the sound integration is not replaced by a mock. Controlled unit tests separately exercise play rejection, Stop during pending play, repeated Start and storage failures.
- Format, lint, Svelte/TypeScript, documentation links and `git diff --check` passed. A 390 px phone render was inspected; 320 px and enlarged-text checks passed.
- No actual-device result is inferred from these passes. Published source/deployment results will be appended separately.

### Linux failure inspected before retry

[First Linux Verify](https://github.com/chrwittm/egg-cooker/actions/runs/38147222828) passed the product gate and 17/18 experiment checks. The Firefox cold-reopen test reloaded immediately after Start, before establishing that media was playing. On this runner, unloading rejected the still-pending play promise and correctly preserved a failed attempt, while the test expected an interrupted active playback. The downloaded trace/context showed the original deadline and failed result still present. The test now waits for actual media advancement before reloading; identity/deadline/no-replay assertions are unchanged. This fixes its precondition rather than substituting mock audio or treating the first run as passed.

[Second Linux Verify](https://github.com/chrwittm/egg-cooker/actions/runs/38147606213) reproduced the Firefox recovery failure even after actual playback was established. Its trace shows `media-error:3` immediately before `pagehide` during reload. The first precondition correction was insufficient. The player now records navigation lifecycle (`beforeunload`/`pagehide`) separately and preserves decoder teardown signals as contextual observations rather than replacing the recoverable interrupted trial with a playback failure. Genuine errors outside navigation still fail the trial. A regression test establishes both paths; real-media browser checks remain intact. This experiment's diagnostic beforeunload listener can affect browser back/forward caching, so cold reopening and ordinary visibility return are recorded separately.

[Third Linux Verify](https://github.com/chrwittm/egg-cooker/actions/runs/38148058406) still failed the same assertion. Its event ordering refutes the teardown-only explanation: `seeking → waiting → seeked → playing → media-error:3` precedes `navigation-started`. Start was issuing an unnecessary `currentTime = 0` seek that raced initial decoding on Firefox/Linux. The player now reloads the already-downloaded Blob resource at Start instead of seeking; the original deadline is still committed before media work. The navigation context remains diagnostic; it does not suppress failures occurring before navigation. All earlier failures remain failures rather than being promoted to evidence.

Local validation of the reset adjustment found that reloading a fresh Blob at Start can fail in offline WebKit. Start now leaves a freshly prepared zero-position resource intact, issuing neither seek nor reload; only repeating a previously played resource resets it. This preserves initial offline playback while removing the Firefox zero-seek race. The offline browser assertion remains unchanged.
