// Exercise a served archive or the deployed site without requesting location.
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium, expect } from '@playwright/test';

const [target, version, commit] = process.argv.slice(2);
if (!target || !version || !/^[a-f0-9]{40}$/.test(commit || ''))
  throw new Error(
    'Usage: npm run release:smoke -- URL VERSION FULL_COMMIT_SHA',
  );
const base = new URL(target);
if (
  !['http:', 'https:'].includes(base.protocol) ||
  !base.pathname.endsWith('/') ||
  base.username ||
  base.password ||
  base.search ||
  base.hash
)
  throw new Error(
    'Use an HTTP(S) base URL ending in /, without credentials, query or fragment.',
  );

const browser = await chromium.launch();
const evidence = {
  checkedAt: new Date().toISOString(),
  url: base.href,
  version,
  commit,
  browser: browser.version(),
  checks: [],
  limitations: ['No provider request or real-device/audio acceptance.'],
};
try {
  const context = await browser.newContext({
    locale: 'en-US',
    reducedMotion: 'reduce',
    serviceWorkers: 'block',
  });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => {
    if (response.status() >= 400)
      errors.push(`HTTP ${response.status()}: ${response.url()}`);
  });
  page.on('requestfailed', (request) =>
    errors.push(`Failed request: ${request.url()}`),
  );
  await page.route('**/*', (route) => {
    if (new URL(route.request().url()).origin !== base.origin) {
      errors.push('Unexpected external request');
      return route.abort();
    }
    return route.continue();
  });
  const fetchAsset = async (url) => {
    const asset = new URL(url, base);
    assert.equal(asset.origin, base.origin, 'Asset must use this origin');
    assert.ok(
      asset.pathname.startsWith(base.pathname),
      'Asset must use the deployment base path',
    );
    const response = await context.request.get(asset.href);
    assert.equal(
      response.status(),
      200,
      `Asset unavailable: ${asset.pathname}`,
    );
    assert.ok((await response.body()).length > 0, 'Empty asset');
    assert.ok(
      !response.headers()['content-type']?.includes('text/html'),
      `Asset returned HTML instead of its contents: ${asset.pathname}`,
    );
    return response;
  };
  const identity = await (await fetchAsset('build-info.json')).json();
  assert.deepEqual(identity, { version, commit }, 'Unexpected deployed build');
  evidence.checks.push('Exact build identity');
  const now = Date.now();
  await page.clock.setFixedTime(now);
  const response = await page.goto(base.href);
  assert.equal(response.status(), 200, 'Page unavailable');
  await expect(page.getByRole('button', { name: /^Start/ })).toBeEnabled();
  const assets = await page
    .locator(
      'script[src], link[rel="stylesheet"], link[rel="icon"], link[rel="apple-touch-icon"], link[rel="manifest"]',
    )
    .evaluateAll((elements) =>
      elements.map((element) => ({
        url: element.getAttribute('src') || element.getAttribute('href'),
        rel: element.getAttribute('rel'),
      })),
    );
  assert.ok(
    assets.some((asset) => asset.rel === 'manifest'),
    'Missing manifest',
  );
  assert.ok(
    assets.some((asset) => asset.rel === 'apple-touch-icon'),
    'Missing Apple icon',
  );
  for (const asset of assets) {
    const response = await fetchAsset(asset.url);
    if (asset.rel === 'manifest') {
      const manifest = await response.json();
      assert.ok(manifest.icons?.length, 'Missing manifest icons');
      for (const icon of manifest.icons)
        await fetchAsset(new URL(icon.src, new URL(asset.url, base)).href);
    }
  }
  evidence.checks.push('Page, scripts, styles, manifest and icons');
  await page.getByRole('button', { name: 'Options', exact: true }).click();
  await page.getByRole('checkbox', { name: /^Demo/ }).uncheck();
  await page.getByRole('button', { name: /^Start/ }).click();
  await expect(
    page.getByRole('heading', { name: 'Cooking', exact: true }),
  ).toBeVisible();
  await page.clock.setFixedTime(now + 3600000);
  await expect(
    page.getByRole('heading', { name: 'Ready', exact: true }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Cook another egg', exact: true })
    .click();
  await expect(page.getByRole('button', { name: /^Start/ })).toBeEnabled();
  await page.reload();
  await expect(page.getByRole('button', { name: /^Start/ })).toBeEnabled();
  assert.deepEqual(errors, [], 'Browser or asset failures');
  evidence.checks.push(
    'Configure → Cooking → Ready → Cook another egg → reload',
  );
  evidence.result = 'passed';
} catch (error) {
  evidence.result = 'failed';
  evidence.error = error.message;
  process.exitCode = 1;
} finally {
  await browser.close();
  mkdirSync('out', { recursive: true });
  writeFileSync(
    'out/release-smoke.json',
    JSON.stringify(evidence, null, 2) + '\n',
  );
  console.log(JSON.stringify(evidence, null, 2));
}
