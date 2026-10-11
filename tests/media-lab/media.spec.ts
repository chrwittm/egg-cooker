import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const key = 'egg-cooker.media-lab.v1';
test('real media starts, pause retains deadline, results export and cold reopen does not replay', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Start test' })).toBeEnabled();
  await page.getByRole('button', { name: 'Start test' }).click();
  const audio = page.locator('audio');
  await expect
    .poll(() =>
      audio.evaluate((a: HTMLAudioElement) => !a.paused && a.currentTime > 0),
    )
    .toBe(true);
  const first = await page.evaluate(
    (k) => JSON.parse(localStorage.getItem(k)!).runs[0],
    key,
  );
  await page.getByLabel('Heard the rooster?').selectOption('no');
  await audio.evaluate((a: HTMLAudioElement) => a.pause());
  await expect(
    page.getByText('Playback paused. The original deadline keeps running.'),
  ).toBeVisible();
  const paused = await page.evaluate(
    (k) => JSON.parse(localStorage.getItem(k)!).runs[0],
    key,
  );
  expect(paused.targetAtMs).toBe(first.targetAtMs);
  expect(paused.heard).toBe('no');
  expect(paused.events.some((e: { name: string }) => e.name === 'pause')).toBe(
    true,
  );
  await page.getByRole('button', { name: 'Stop', exact: true }).click();
  await expect
    .poll(() => audio.evaluate((a: HTMLAudioElement) => a.paused))
    .toBe(true);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export results' }).click();
  expect((await downloadPromise).suggestedFilename()).toMatch(
    /^egg-media-lab-.*\.json$/,
  );
  await page.reload();
  await expect(page.getByText(/Latest: quiet · 60 s .* stopped/)).toBeVisible();
  expect(await audio.evaluate((a: HTMLAudioElement) => a.paused)).toBe(true);
  await page.getByRole('button', { name: 'Clear results' }).click();
  await expect(
    page.getByRole('button', { name: 'Export results' }),
  ).toBeDisabled();
});
test('immediate rooster plays actual packaged media and ends', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Start test' })).toBeEnabled();
  await page.getByLabel('Sound', { exact: true }).selectOption('immediate');
  await expect(page.getByRole('button', { name: 'Start test' })).toBeEnabled();
  await page.getByRole('button', { name: 'Start test' }).click();
  await expect(
    page.getByText('Playback ended. Record whether you heard the rooster.'),
  ).toBeVisible({ timeout: 15000 });
  const run = await page.evaluate(
    (k) => JSON.parse(localStorage.getItem(k)!).runs[0],
    key,
  );
  expect(run.heard).toBe('unrecorded');
  expect(run.events.some((e: { name: string }) => e.name === 'ended')).toBe(
    true,
  );
});
test('failed audio download is actionable and never starts a test', async ({
  page,
}) => {
  await page.route('**/*.mp3', (route) =>
    route.fulfill({ status: 503, body: 'unavailable' }),
  );
  await page.goto('/');
  await expect(
    page.getByText('Track could not load. Check the connection and retry.'),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Start test' })).toBeDisabled();
  await expect(
    page.getByRole('button', { name: 'Retry download' }),
  ).toBeVisible();
});
test('timed track is fully downloaded and plays after network loss', async ({
  page,
  context,
}) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Start test' })).toBeEnabled();
  await context.setOffline(true);
  await page.getByRole('button', { name: 'Start test' }).click();
  await expect
    .poll(() =>
      page
        .locator('audio')
        .evaluate((a: HTMLAudioElement) => a.currentTime > 0 && !a.paused),
    )
    .toBe(true);
  await page.getByRole('button', { name: 'Stop', exact: true }).click();
});
test('phone layout and accessibility', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Start test' })).toBeEnabled();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.locator('html').evaluate((element) => {
    element.style.fontSize = '200%';
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test('cold reopening preserves the deadline and recorded playback outcome without replay', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Start test' })).toBeEnabled();
  await page.getByRole('button', { name: 'Start test' }).click();
  await expect
    .poll(() =>
      page
        .locator('audio')
        .evaluate((a: HTMLAudioElement) => !a.paused && a.currentTime > 0),
    )
    .toBe(true);
  const first = await page.evaluate(
    (k) => JSON.parse(localStorage.getItem(k)!).runs[0],
    key,
  );
  await page.reload();
  await expect(
    page.getByText('Previous test recovered. Playback has not been restarted.'),
  ).toBeVisible();
  const recovered = await page.evaluate(
    (k) => JSON.parse(localStorage.getItem(k)!).runs[0],
    key,
  );
  expect(recovered.id).toBe(first.id);
  expect(recovered.targetAtMs).toBe(first.targetAtMs);
  const names = recovered.events.map((event: { name: string }) => event.name);
  // A diagnostic instrument must preserve a genuine codec failure, too. Linux
  // Firefox can advance a quiet MP3 briefly and then emit MEDIA_ERR_DECODE.
  // Event evidence determines the exact terminal result; navigation-context
  // errors alone do not turn interrupted playback into an unrelated failure.
  const expectedStatus = names.some(
    (name: string) =>
      name.startsWith('media-error:') || name === 'play-rejected',
  )
    ? 'failed'
    : names.includes('ended')
      ? 'ended'
      : 'interrupted';
  expect(recovered.status).toBe(expectedStatus);
  expect(recovered.heard).toBe('unrecorded');
  expect(
    await page.locator('audio').evaluate((a: HTMLAudioElement) => a.paused),
  ).toBe(true);
});
