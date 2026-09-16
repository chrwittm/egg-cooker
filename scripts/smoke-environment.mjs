// Optional live integration check. Uses public synthetic Berlin coordinates only.
// Run against a production preview, including the intended BASE_PATH.
import { chromium } from '@playwright/test';
const url = process.argv[2] || 'http://127.0.0.1:4174/egg-cooker/';
const browser = await chromium.launch();
try {
  const context = await browser.newContext({
    geolocation: { latitude: 52.52, longitude: 13.41, accuracy: 10 },
    permissions: ['geolocation'],
  });
  const page = await context.newPage();
  // The city provider permits only the calling device's real location.
  await page.route('https://api.bigdatacloud.net/**', (route) => route.abort());
  await page.goto(url);
  await page.getByRole('button', { name: 'Use location', exact: true }).click();
  await page.getByText(/^Local ·/).waitFor({ timeout: 30000 });
  await page.reload();
  await page.getByText(/^Local ·/).waitFor({ timeout: 30000 });
  const conditions = await page.locator('.conditions-label').innerText();
  const estimate = await page.locator('.estimate').innerText();
  await page.getByRole('button', { name: 'Options' }).click();
  await page.getByRole('checkbox', { name: 'Demo' }).uncheck();
  await page.getByRole('button', { name: /^Start/ }).click();
  await page.getByRole('heading', { name: 'Cooking', exact: true }).waitFor();
  const stored = await page.evaluate(() =>
    JSON.parse(sessionStorage.getItem('egg-cooker.active-cook.v1')),
  );
  if (
    stored.source !== 'weather' ||
    'latitude' in stored ||
    'longitude' in stored
  )
    throw new Error('Invalid committed snapshot');
  console.log(
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        browser: browser.version(),
        origin: new URL(url).origin,
        path: new URL(url).pathname,
        conditions,
        estimate,
        source: stored.source,
        coordinatesPersisted: false,
        automaticRefresh: true,
      },
      null,
      2,
    ),
  );
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await page.getByRole('button', { name: /^Start/ }).waitFor();
} finally {
  await browser.close();
}
