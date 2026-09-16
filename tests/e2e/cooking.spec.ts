import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const now = 1_800_000_000_000;
const key = 'egg-cooker.active-cook.v1';
const record = {
  schemaVersion: 1,
  modelVersion: 'williams-pressure-v1',
  massG: 60,
  initialTemperatureC: 8,
  doneness: 'jammy',
  pressureHpa: 1013.25,
  source: 'standard',
  altitudeM: null,
  weatherTimeSeconds: null,
  startAtMs: now,
  targetAtMs: now + 439000,
  durationSeconds: 439,
  savedAtMs: now,
};
test.use({ reducedMotion: 'reduce' });
test.beforeEach(async ({ page }) => {
  await page.route('https://api.bigdatacloud.net/**', (route) => route.abort());
});
async function setup(page: Page) {
  await page.clock.setFixedTime(now);
  await page.goto('./');
  await expect(page.getByRole('button', { name: /^Start/ })).toBeEnabled();
  await realMode(page);
  await page.getByRole('button', { name: 'Jammy', exact: true }).click();
}
async function realMode(page: Page) {
  await page.getByRole('button', { name: 'Options' }).click();
  await page.getByRole('checkbox', { name: 'Demo' }).uncheck();
  await page.getByRole('button', { name: 'Options' }).click();
}
async function setTime(page: Page, time: number) {
  await page.clock.setFixedTime(time);
}
async function demo(page: Page) {
  await page.getByRole('button', { name: 'Options' }).click();
  await page.getByRole('checkbox', { name: 'Demo' }).check();
  await page.getByRole('button', { name: 'Start demo' }).click();
}
async function locate(page: Page) {
  await page.getByRole('button', { name: 'Use location', exact: true }).click();
}
async function syntheticLocation(page: Page, accuracy = 10) {
  await page.addInitScript((accuracy) => {
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: (success: PositionCallback) =>
          success({
            coords: { latitude: 52.52045, longitude: 13.41049, accuracy },
          } as GeolocationPosition),
      },
    });
  }, accuracy);
}
async function weatherRoutes(
  page: Page,
  weather: Record<string, unknown> = {},
) {
  await page.route('https://api.open-meteo.com/v1/elevation?*', (route) =>
    route.fulfill({ json: { elevation: [1000] } }),
  );
  await page.route('https://api.open-meteo.com/v1/forecast?*', (route) =>
    route.fulfill({
      json: {
        elevation: 1000,
        utc_offset_seconds: 0,
        current_units: { surface_pressure: 'hPa', time: 'unixtime' },
        current: { surface_pressure: 900, time: now / 1000 },
        ...weather,
      },
    }),
  );
}

test('native input presets, category boundaries and exact temperature state update the estimate', async ({
  page,
}) => {
  await setup(page);
  await expect(page.getByLabel('Estimated cooking time 7:19')).toBeVisible();
  for (const [name, grams] of [
    ['S', 50],
    ['M', 60],
    ['L', 70],
    ['XL', 80],
  ] as const) {
    await page
      .getByRole('button', { name: `${name} · ${grams} grams` })
      .click();
    await expect(page.getByLabel('Egg size')).toHaveValue(String(grams));
  }
  const slider = page.getByLabel('Egg size');
  for (const [grams, category] of [
    [40, 'S'],
    [52, 'S'],
    [53, 'M'],
    [62, 'M'],
    [63, 'L'],
    [72, 'L'],
    [73, 'XL'],
    [90, 'XL'],
  ] as const) {
    await slider.fill(String(grams));
    await expect(slider).toHaveAttribute(
      'aria-valuetext',
      `${category}, ${grams} grams`,
    );
    await expect(
      page.getByRole('button', { name: new RegExp(`^${category} ·`) }),
    ).toHaveAttribute('aria-pressed', 'true');
  }
  await slider.press('Home');
  await expect(slider).toHaveValue('40');
  await slider.press('End');
  await expect(slider).toHaveValue('90');
  await page.getByRole('button', { name: 'M · 60 grams' }).click();
  await page.getByRole('button', { name: 'Room', exact: true }).click();
  await expect(page.getByLabel('Estimated cooking time 6:08')).toBeVisible();
  await page.getByLabel('Starting temperature').fill('19');
  await expect(
    page.getByRole('button', { name: 'Room', exact: true }),
  ).toHaveAttribute('aria-pressed', 'false');
  await expect(
    page.getByRole('button', { name: 'Fridge', exact: true }),
  ).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('button', { name: 'Fridge', exact: true }).click();
  await expect(page.getByLabel('Starting temperature')).toHaveValue('8');
  await page.getByRole('button', { name: 'Soft', exact: true }).click();
  await expect(page.getByLabel('Estimated cooking time 4:53')).toBeVisible();
  await expect(page.locator('.preview-egg .egg-art')).toHaveAttribute(
    'data-yolk',
    '0.1500',
  );
  await page.getByRole('button', { name: 'Firm', exact: true }).click();
  await expect(page.locator('.preview-egg .egg-art')).toHaveAttribute(
    'data-yolk',
    '1.0000',
  );
});

test('absolute boundaries, Ready, continued illustration, Done and offline operation', async ({
  page,
  context,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await setup(page);
  await context.setOffline(true);
  await page.getByRole('button', { name: /^Start/ }).click();
  await expect(
    page.getByRole('heading', { name: 'Cooking', exact: true }),
  ).toBeFocused();
  await expect(page.getByLabel('Time remaining')).toHaveText('7:19');
  expect(
    await page.evaluate((key) => JSON.parse(sessionStorage.getItem(key)!), key),
  ).toEqual(record);
  await setTime(page, record.targetAtMs - 1);
  await expect(page.getByLabel('Time remaining')).toHaveText('0:01');
  await setTime(page, record.targetAtMs);
  await expect(
    page.getByRole('heading', { name: 'Ready', exact: true }),
  ).toBeFocused();
  await expect(page.getByLabel('Time past target')).toHaveText('+0:00');
  await expect(page.getByRole('alert')).toHaveText(
    'Cooking time reached. Take the egg out.',
  );
  await setTime(page, now + 586000);
  await expect(page.locator('.active-egg .egg-art')).toHaveAttribute(
    'data-yolk',
    '1.0000',
  );
  await expect(page.getByLabel('Time past target')).toHaveText('+2:27');
  await page
    .getByRole('button', { name: 'Cook another egg', exact: true })
    .click();
  await expect(page.getByRole('button', { name: /^Start/ })).toBeEnabled();
  expect(
    await page.evaluate((key) => sessionStorage.getItem(key), key),
  ).toBeNull();
  expect(errors).toEqual([]);
});

test('Back immediately leaves cooking, clears storage and keeps configuration', async ({
  page,
}) => {
  await setup(page);
  await page.getByRole('button', { name: 'L · 70 grams' }).click();
  await page.getByRole('button', { name: /^Start/ }).click();
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByLabel('Egg size')).toHaveValue('70');
  await expect(
    page.getByRole('heading', { name: 'Configure your egg' }),
  ).toBeFocused();
  expect(
    await page.evaluate((key) => sessionStorage.getItem(key), key),
  ).toBeNull();
});

test('demo preserves virtual elapsed, returns to 1× at Ready and stays available for another egg', async ({
  page,
}) => {
  await setup(page);
  await demo(page);
  await expect(page.getByText('DEMO · 1×', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '50×', exact: true }).click();
  await setTime(page, now + 1000);
  await expect(page.getByLabel('Time remaining')).toHaveText('6:29');
  await page.getByRole('button', { name: '10×', exact: true }).click();
  await setTime(page, now + 2000);
  await expect(page.getByLabel('Time remaining')).toHaveText('6:19');
  expect(
    await page.evaluate((key) => sessionStorage.getItem(key), key),
  ).toBeNull();
  await page.getByRole('button', { name: 'To end' }).click();
  await expect(page.getByLabel('Time past target')).toHaveText('+0:00');
  await expect(
    page.getByRole('button', { name: '1×', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await setTime(page, now + 3000);
  await expect(page.getByLabel('Time past target')).toHaveText('+0:01');
  await page.getByRole('button', { name: '20×', exact: true }).click();
  await setTime(page, now + 4000);
  await expect(page.getByLabel('Time past target')).toHaveText('+0:21');
  await page.getByRole('button', { name: 'Cook another egg' }).click();
  await page.getByRole('button', { name: /^Start demo/ }).click();
  await expect(
    page.getByRole('button', { name: '1×', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'To end' }).click();
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByRole('button', { name: /^Start demo/ })).toBeEnabled();
  await page.reload();
  await expect(page.getByRole('button', { name: /^Start demo/ })).toBeEnabled();
});

test('recover real session at its current frame, sound off, and handle a backward clock', async ({
  page,
}) => {
  await setup(page);
  await page.getByRole('button', { name: /^Start/ }).click();
  await setTime(page, now + 300000);
  await expect(page.getByLabel('Time remaining')).toHaveText('2:19');
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Recovered · Still cooking?' }),
  ).toBeVisible();
  await expect(page.getByLabel('Time remaining')).toHaveText('2:19');
  await expect(
    page.getByRole('button', { name: 'Enable and test sound' }),
  ).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('button', { name: 'Yes', exact: true }).click();
  await setTime(page, now + 299999);
  await expect(
    page.getByRole('heading', { name: 'Time uncertain', exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel('Time remaining')).not.toBeVisible();
  expect(
    await page.evaluate((key) => sessionStorage.getItem(key), key),
  ).toBeNull();
  await page
    .getByRole('button', { name: 'Cancel cooking', exact: true })
    .click();
  await expect(page.getByRole('button', { name: /^Start/ })).toBeEnabled();
});

for (const [name, saved] of [
  ['corrupt', { ...record, modelVersion: 'unknown' }],
  [
    'old',
    {
      ...record,
      startAtMs: now - 86400000,
      targetAtMs: now - 86400000 + 439000,
      savedAtMs: now - 86400000,
    },
  ],
] as const) {
  test(`${name} storage requires discard without guessing a timer`, async ({
    page,
  }) => {
    await page.clock.setFixedTime(now);
    await page.addInitScript(
      ({ key, saved }) => sessionStorage.setItem(key, JSON.stringify(saved)),
      { key, saved },
    );
    await page.goto('./');
    await expect(
      page.getByRole('heading', {
        name: name === 'old' ? 'Old timer' : 'Cannot recover timer',
      }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: /^Start/ })).toBeDisabled();
    await page.getByRole('button', { name: 'Discard' }).click();
    await expect(page.getByRole('button', { name: /^Start/ })).toBeEnabled();
    expect(
      await page.evaluate((key) => sessionStorage.getItem(key), key),
    ).toBeNull();
  });
}

test('denied storage and unavailable audio do not block the real timer', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'sessionStorage', {
      get: () => {
        throw new Error('denied');
      },
    });
    Object.defineProperty(window, 'AudioContext', {
      value: class {
        constructor() {
          throw new Error('denied');
        }
      },
    });
  });
  await setup(page);
  await expect(
    page.getByText('Recovery unavailable', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: /^Start/ }).click();
  await expect(page.getByLabel('Time remaining')).toHaveText('7:19');
  await expect(
    page.getByText('Sound unavailable', { exact: true }),
  ).toBeVisible();
  await setTime(page, record.targetAtMs);
  await expect(
    page.getByRole('heading', { name: 'Ready', exact: true }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Cook another egg', exact: true })
    .click();
  await expect(page.getByRole('button', { name: /^Start/ })).toBeEnabled();
});

test('location is consented, rounded, applied once, credited and not stored', async ({
  page,
}) => {
  await syntheticLocation(page);
  await weatherRoutes(page);
  const requests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('api.open-meteo.com'))
      requests.push(request.url());
  });
  await setup(page);
  await page.getByLabel('Egg size').fill('61');
  expect(requests).toEqual([]);
  await page.getByLabel('Egg size').fill('60');
  expect(requests).toEqual([]);
  await expect(
    page.getByRole('button', { name: 'Use location', exact: true }),
  ).toHaveAttribute('aria-describedby', 'location-summary');
  await page.getByRole('button', { name: 'Use location', exact: true }).click();
  await expect(
    page.getByText('Local · 900 hPa', { exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel('Estimated cooking time 7:49')).toBeVisible();
  expect(requests).toHaveLength(2);
  expect(requests[0]).toContain('latitude=52.52&longitude=13.41');
  await expect(
    page.getByRole('link', { name: 'Copernicus DEM', exact: true }),
  ).not.toBeVisible();
  await page.getByRole('button', { name: 'About this timer' }).click();
  await expect(
    page.getByRole('link', { name: 'Copernicus DEM', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await page.getByRole('button', { name: /^Start/ }).click();
  const saved = await page.evaluate((key) => sessionStorage.getItem(key), key);
  expect(JSON.parse(saved!)).toMatchObject({
    pressureHpa: 900,
    source: 'weather',
    altitudeM: 1000,
    durationSeconds: 469,
  });
  expect(saved).not.toMatch(/latitude|longitude|52\.52|13\.41/);
});

test('weather failures preserve altitude; expired weather at Start refreshes before committing', async ({
  page,
}) => {
  await syntheticLocation(page);
  await weatherRoutes(page, {
    current_units: { surface_pressure: 'Pa', time: 'unixtime' },
  });
  await setup(page);
  await locate(page);
  await expect(
    page.getByText('Altitude estimate', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('Weather unavailable', { exact: true }),
  ).toBeVisible();
  await weatherRoutes(page);
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(
    page.getByText('Local · 900 hPa', { exact: true }),
  ).toBeVisible();
  await setTime(page, now + 7200001);
  await page.getByRole('button', { name: /^Start/ }).click();
  await expect(
    page.getByText('Altitude estimate', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('status').filter({ hasText: 'Conditions updated' }),
  ).toBeVisible();
  expect(
    await page.evaluate((key) => sessionStorage.getItem(key), key),
  ).toBeNull();
  await page.getByRole('button', { name: /^Start/ }).click();
  expect(
    JSON.parse(
      (await page.evaluate((key) => sessionStorage.getItem(key), key))!,
    ),
  ).toMatchObject({ source: 'altitude' });
});

test('Start during lookup freezes the accepted altitude despite late weather', async ({
  page,
}) => {
  await syntheticLocation(page);
  await page.route('https://api.open-meteo.com/v1/elevation?*', (route) =>
    route.fulfill({ json: { elevation: [1000] } }),
  );
  let release!: () => void;
  const held = new Promise<void>((resolve) => (release = resolve));
  await page.route(
    'https://api.open-meteo.com/v1/forecast?*',
    async (route) => {
      await held;
      await route
        .fulfill({
          json: {
            elevation: 1000,
            utc_offset_seconds: 0,
            current_units: { surface_pressure: 'hPa', time: 'unixtime' },
            current: { surface_pressure: 700, time: now / 1000 },
          },
        })
        .catch(() => {});
    },
  );
  await setup(page);
  await page.getByLabel('Elevation', { exact: true }).fill('1000');
  const weatherRequested = page.waitForRequest(
    'https://api.open-meteo.com/v1/forecast?*',
  );
  await locate(page);
  await weatherRequested;
  await expect(
    page.getByText('Altitude estimate', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: /^Start/ }).click();
  const saved = await page.evaluate((key) => sessionStorage.getItem(key), key);
  release();
  await expect(page.getByLabel('Time remaining')).toHaveText('7:50');
  expect(await page.evaluate((key) => sessionStorage.getItem(key), key)).toBe(
    saved,
  );
});

test('imprecise location stays standard and makes no API requests', async ({
  page,
}) => {
  await syntheticLocation(page, 1001);
  const request: string[] = [];
  page.on('request', (r) => {
    if (r.url().includes('api.open-meteo.com')) request.push(r.url());
  });
  await setup(page);
  await locate(page);
  await expect(
    page.getByText('Location imprecise', { exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel('Estimated cooking time 7:19')).toBeVisible();
  expect(request).toEqual([]);
});

test('accessible configure, cooking, ready and dialog surfaces reflow at 320 px', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await setup(page);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole('button', { name: /^Start/ }).click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole('button', { name: 'About this timer' }).click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.keyboard.press('Escape');
  await setTime(page, record.targetAtMs);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.addStyleTag({ content: ':root{font-size:200%}' });
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).fontSize,
    ),
  ).toBe('32px');
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(
    page.getByRole('button', { name: 'Cook another egg', exact: true }),
  ).toBeVisible();
});

test('normal-motion SVG interpolates between anchors and reduced motion snaps to reached anchors', async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await setup(page);
  await page.screenshot({
    path: testInfo.outputPath('configure.png'),
    fullPage: true,
  });
  await page.getByRole('button', { name: /^Start/ }).click();
  await setTime(page, now + 100000);
  await expect(page.locator('.active-egg .egg-art')).toHaveAttribute(
    'data-white',
    '0.3413',
  );
  const before = await page
    .locator('.active-egg .egg-art')
    .getAttribute('data-white');
  await setTime(page, now + 100050);
  await expect(page.locator('.active-egg .egg-art')).not.toHaveAttribute(
    'data-white',
    before!,
  );
  await setTime(page, now + 366000);
  await expect(page.locator('.active-egg .egg-art')).toHaveAttribute(
    'data-yolk',
    '0.4000',
  );
  await page.screenshot({
    path: testInfo.outputPath('cooking.png'),
    fullPage: true,
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.active-egg .egg-art')).toHaveAttribute(
    'data-white',
    '0.9000',
  );
  await expect(page.locator('.active-egg .egg-art')).toHaveAttribute(
    'data-yolk',
    '0.1500',
  );
});

test('restored pages re-read storage and missing sessions return to defaults', async ({
  page,
}) => {
  await setup(page);
  await page.getByRole('button', { name: 'L · 70 grams' }).click();
  await page.getByRole('button', { name: /^Start/ }).click();
  await page.evaluate((key) => {
    sessionStorage.removeItem(key);
    window.dispatchEvent(
      new PageTransitionEvent('pageshow', { persisted: true }),
    );
  }, key);
  await expect(page.getByRole('button', { name: /^Start/ })).toBeEnabled();
  await expect(page.getByLabel('Egg size')).toHaveValue('60');
  await realMode(page);
  await page.getByRole('button', { name: /^Start/ }).click();
  await page.goto('about:blank');
  await page.goBack();
  await expect(
    page.getByRole('heading', { name: 'Recovered · Still cooking?' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Yes', exact: true }).click();
  await expect(page.getByLabel('Time remaining')).toHaveText('4:53');
});

test('failed storage deletion never revives the cook in the current page', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.removeItem = () => {
      throw new Error('denied');
    };
  });
  await setup(page);
  await page.getByRole('button', { name: /^Start/ }).click();
  await setTime(page, record.targetAtMs);
  await page
    .getByRole('button', { name: 'Cook another egg', exact: true })
    .click();
  await expect(
    page.getByText(
      'Recovery unavailable. An older timer may reappear after reload.',
      { exact: true },
    ),
  ).toBeVisible();
  await page.evaluate(() =>
    window.dispatchEvent(
      new PageTransitionEvent('pageshow', { persisted: true }),
    ),
  );
  await expect(page.getByRole('button', { name: /^Start/ })).toBeEnabled();
  await expect(
    page.getByRole('heading', { name: 'Recovered · Still cooking?' }),
  ).not.toBeVisible();
});

test('overdue recovery is immediate, has no autoplay, and retains the committed weather snapshot', async ({
  page,
}) => {
  await page.clock.setFixedTime(now + 8000000);
  await page.addInitScript(
    ({ key, record }) =>
      sessionStorage.setItem(
        key,
        JSON.stringify({
          ...record,
          pressureHpa: 900,
          source: 'weather',
          altitudeM: 1000,
          weatherTimeSeconds: record.startAtMs / 1000,
          durationSeconds: 469,
          targetAtMs: record.startAtMs + 469000,
        }),
      ),
    { key, record },
  );
  await page.goto('./');
  await expect(
    page.getByRole('heading', { name: 'Ready', exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel('Time past target')).toHaveText('+2:05:31');
  await page.getByRole('button', { name: 'Yes', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Enable and test sound' }),
  ).toBeVisible();
  await expect(page.locator('.active-egg .egg-art')).toHaveAttribute(
    'data-yolk',
    '1.0000',
  );
  await page
    .getByRole('button', { name: 'Cook another egg', exact: true })
    .click();
  await expect(
    page.getByText('Altitude estimate', { exact: true }),
  ).toBeVisible();
});

test('invalid runtime input removes the estimate and cannot commit a stale timer', async ({
  page,
}) => {
  await setup(page);
  await page.getByLabel('Egg size').evaluate((element: HTMLInputElement) => {
    element.type = 'text';
    element.value = 'not a mass';
    element.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await expect(
    page.getByLabel('Estimate unavailable', { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: /^Start/ })).toBeDisabled();
  expect(
    await page.evaluate((key) => sessionStorage.getItem(key), key),
  ).toBeNull();
});

test('narrow configuration and landscape retain controls at 200% text size', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 600 });
  await setup(page);
  await page.addStyleTag({ content: ':root{font-size:200%}' });
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).fontSize,
    ),
  ).toBe('32px');
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole('button', { name: /^Start/ }).click();
  await expect(page.getByLabel('Time remaining')).toBeVisible();
  await page.setViewportSize({ width: 740, height: 320 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.getByRole('button', { name: /^Start/ })).toBeVisible();
});

test('Escape dismisses a corrupt-record dialog while preserving the required Discard action', async ({
  page,
}) => {
  await page.addInitScript(
    (key) => sessionStorage.setItem(key, 'invalid'),
    key,
  );
  await page.goto('./');
  await expect(page.getByRole('button', { name: 'Discard' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByRole('button', { name: /^Start/ })).toBeDisabled();
  await page.getByRole('button', { name: 'Discard' }).click();
  await expect(page.getByRole('button', { name: /^Start/ })).toBeEnabled();
});

test('built assets and build identity load from the configured base without remote assets', async ({
  page,
}) => {
  const failures: string[] = [];
  const remote: string[] = [];
  page.on('response', (r) => {
    if (r.status() >= 400) failures.push(r.url());
  });
  page.on('request', (r) => {
    if (!r.url().startsWith('http://127.0.0.1:4173/')) remote.push(r.url());
  });
  await setup(page);
  const response = await page.request.get('build-info.json');
  expect(response.ok()).toBe(true);
  expect(await response.json()).toMatchObject({ version: '0.1.0' });
  expect(failures).toEqual([]);
  expect(remote).toEqual([]);
});

test('returning from a hidden page catches up immediately without replaying illustration frames', async ({
  page,
}) => {
  await setup(page);
  await page.getByRole('button', { name: /^Start/ }).click();
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await setTime(page, now + 600000);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      value: false,
    });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(
    page.getByRole('heading', { name: 'Ready', exact: true }),
  ).toBeFocused();
  await expect(page.getByLabel('Time past target')).toHaveText('+2:41');
  await expect(page.locator('.active-egg .egg-art')).toHaveAttribute(
    'data-yolk',
    '1.0000',
  );
});

test('phone configuration is ordered, compact, mass-responsive and uses temperature ranges', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');
  await expect(page.getByRole('button', { name: /^Start demo/ })).toBeEnabled();
  const start = await page
    .getByRole('button', { name: /^Start demo/ })
    .boundingBox();
  expect(start!.y + start!.height).toBeLessThanOrEqual(844);
  const egg = page.locator('.egg-stage');
  const elevation = await page
    .getByLabel('Elevation', { exact: true })
    .boundingBox();
  expect((await egg.boundingBox())!.y).toBeGreaterThan(
    elevation!.y + elevation!.height,
  );
  await page.getByLabel('Egg size').fill('40');
  const small = (await egg.boundingBox())!.width;
  await page.getByLabel('Egg size').fill('90');
  expect((await egg.boundingBox())!.width / small).toBeCloseTo(
    Math.cbrt(90 / 40),
    2,
  );
  for (const [temperature, fridge, room] of [
    [3, false, false],
    [4, true, false],
    [8, true, false],
    [9, false, false],
    [19, false, false],
    [20, false, true],
    [24, false, true],
    [25, false, false],
  ] as const) {
    await page.getByLabel('Starting temperature').fill(String(temperature));
    await expect(
      page.getByRole('button', { name: 'Fridge', exact: true }),
    ).toHaveAttribute('aria-pressed', String(fridge));
    await expect(
      page.getByRole('button', { name: 'Room', exact: true }),
    ).toHaveAttribute('aria-pressed', String(room));
  }
  for (const [doneness, yolk] of [
    ['Soft', '0.1500'],
    ['Jammy', '0.6500'],
    ['Firm', '1.0000'],
  ] as const) {
    await page.getByRole('button', { name: doneness, exact: true }).click();
    await expect(egg.locator('.egg-art')).toHaveAttribute('data-yolk', yolk);
  }
  await page.setViewportSize({ width: 390, height: 740 });
  const shortStart = (await page
    .getByRole('button', { name: /^Start demo/ })
    .boundingBox())!;
  expect(shortStart.y + shortStart.height).toBeLessThanOrEqual(740);
  await page.setViewportSize({ width: 1440, height: 1000 });
  expect((await page.locator('main').boundingBox())!.width).toBe(440);
  expect((await egg.boundingBox())!.y).toBeGreaterThan(
    (await page.getByLabel('Air pressure').boundingBox())!.y,
  );
});

test('manual elevation and pressure update the estimate and persist a recoverable real snapshot', async ({
  page,
}) => {
  await setup(page);
  await page.getByLabel('Elevation', { exact: true }).fill('8850');
  await expect(page.getByLabel('Air pressure')).toHaveValue('314');
  await page.getByLabel('Air pressure').fill('320');
  await expect(
    page.getByText('Adjusted pressure', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: /^Start/ }).click();
  const saved = JSON.parse(
    (await page.evaluate((key) => sessionStorage.getItem(key), key))!,
  );
  expect(saved).toMatchObject({
    altitudeM: 8850,
    pressureHpa: 320,
    source: 'manual',
    weatherTimeSeconds: null,
  });
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Recovered · Still cooking?' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Yes', exact: true }).click();
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.getByLabel('Elevation', { exact: true })).toHaveValue(
    '8850',
  );
  await page.getByLabel('Elevation', { exact: true }).fill('0');
  await expect(page.getByLabel('Air pressure')).toHaveValue('1013');
  await expect(page.getByLabel('Estimated cooking time 7:19')).toBeVisible();
});

test('manual adjustment cancels an in-flight location response', async ({
  page,
}) => {
  await syntheticLocation(page);
  await page.route('https://api.open-meteo.com/v1/elevation?*', (route) =>
    route.fulfill({ json: { elevation: [1000] } }),
  );
  let release!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(
    'https://api.open-meteo.com/v1/forecast?*',
    async (route) => {
      await held;
      await route
        .fulfill({
          json: {
            elevation: 1000,
            utc_offset_seconds: 0,
            current_units: { surface_pressure: 'hPa', time: 'unixtime' },
            current: { surface_pressure: 900, time: now / 1000 },
          },
        })
        .catch(() => {});
    },
  );
  await setup(page);
  await page.getByLabel('Elevation', { exact: true }).fill('1000');
  const weatherRequested = page.waitForRequest(
    'https://api.open-meteo.com/v1/forecast?*',
  );
  await locate(page);
  await weatherRequested;
  await expect(
    page.getByText('Altitude estimate', { exact: true }),
  ).toBeVisible();
  await page.getByLabel('Air pressure').fill('950');
  release();
  await expect(page.getByText('Finding local conditions…')).not.toBeVisible();
  await page.getByRole('button', { name: /^Start/ }).click();
  expect(
    JSON.parse(
      (await page.evaluate((key) => sessionStorage.getItem(key), key))!,
    ),
  ).toMatchObject({ source: 'manual', pressureHpa: 950, altitudeM: 1000 });
});

test('accelerated crossing returns to 1× at the target even across a delayed frame', async ({
  page,
}) => {
  await page.clock.setFixedTime(now);
  await page.goto('./');
  await page.getByRole('button', { name: /^Start demo/ }).click();
  await page.getByRole('button', { name: '50×', exact: true }).click();
  await setTime(page, now + 10000);
  await expect(
    page.getByRole('heading', { name: 'Ready', exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel('Time past target')).toHaveText('+0:04');
  await expect(
    page.getByRole('button', { name: '1×', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  const egg = await page.locator('.active-egg').boundingBox();
  const another = await page
    .getByRole('button', { name: 'Cook another egg' })
    .boundingBox();
  expect(another!.y).toBeGreaterThan(egg!.y + egg!.height);
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('the same egg slides upward into cooking and returns below configuration', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');
  await page.getByRole('button', { name: /^Start demo/ }).waitFor();
  await page.locator('.egg-stage').evaluate((el) => {
    el.setAttribute('data-original', 'yes');
  });
  await page.getByRole('button', { name: /^Start demo/ }).click();
  const frames = await page.locator('.egg-stage').evaluate(async (el) => {
    const animation = el.getAnimations()[0];
    if (!animation) throw new Error('Expected egg movement');
    animation.pause();
    const positions = [0, 500, 1000].map((time) => {
      animation.currentTime = time;
      return el.getBoundingClientRect().y;
    });
    animation.finish();
    return positions;
  });
  expect(frames[0]!).toBeGreaterThan(frames[1]!);
  expect(frames[1]!).toBeGreaterThan(frames[2]!);
  await expect(page.locator('.active-egg')).toHaveAttribute(
    'data-original',
    'yes',
  );
  await page.getByRole('button', { name: 'To end' }).click();
  await page.getByRole('button', { name: 'Cook another egg' }).click();
  await expect(page.locator('.preview-egg')).toHaveAttribute(
    'data-original',
    'yes',
  );
  await page.locator('.egg-stage').evaluate(async (el) => {
    await Promise.all(el.getAnimations().map((a) => a.finished));
  });
  expect((await page.locator('.preview-egg').boundingBox())!.y).toBeGreaterThan(
    (await page.getByLabel('Air pressure').boundingBox())!.y,
  );
});

test('favorite defaults and the continuous rail support taps, dragging and keyboard input', async ({
  page,
}) => {
  await page.goto('./');
  await expect(
    page.getByRole('button', { name: 'M · 60 grams' }),
  ).toHaveAttribute('aria-pressed', 'true');
  await expect(
    page.getByRole('button', { name: 'Fridge', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await expect(
    page.getByRole('button', { name: 'Soft', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByLabel('Estimated cooking time 4:53')).toBeVisible();
  const slider = page.getByLabel('How would you like your egg?');
  await slider.fill('1.25');
  await expect(slider).toHaveAttribute('aria-valuetext', 'Jammy');
  await expect(page.getByLabel('Estimated cooking time 6:06')).toBeVisible();
  const yolk = Number(await page.locator('.egg-art').getAttribute('data-yolk'));
  expect(yolk).toBeGreaterThan(0.15);
  expect(yolk).toBeLessThan(0.65);
  await slider.press('Home');
  await expect(slider).toHaveValue('0.75');
  await expect(slider).toHaveAttribute('aria-valuetext', 'Soft');
  await expect(page.getByLabel('Estimated cooking time 3:40')).toBeVisible();
  await slider.press('End');
  await expect(slider).toHaveValue('2.25');
  await slider.press('ArrowLeft');
  await expect(slider).toHaveValue('2.24');
  const box = (await slider.boundingBox())!;
  await page.mouse.move(box.x + box.width - 12, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
    steps: 5,
  });
  await page.mouse.up();
  const dragged = Number(await slider.inputValue());
  expect(dragged).toBeGreaterThan(1);
  expect(dragged).toBeLessThan(1.6);
  await page.getByRole('button', { name: 'Jammy', exact: true }).click();
  await expect(slider).toHaveValue('1.5');
});

test('continuous real timer recovers the exact chosen texture', async ({
  page,
}) => {
  await setup(page);
  await page.getByLabel('How would you like your egg?').fill('1.23');
  await page.getByRole('button', { name: /^Start/ }).click();
  const saved = JSON.parse(
    (await page.evaluate((key) => sessionStorage.getItem(key), key))!,
  );
  expect(saved).toMatchObject({
    schemaVersion: 2,
    modelVersion: 'williams-pressure-v2',
    doneness: 1.23,
    durationSeconds: 360,
  });
  await page.reload();
  await page.getByRole('button', { name: 'Yes', exact: true }).click();
  await expect(page.getByLabel('Time remaining')).toHaveText('6:00');
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.getByLabel('How would you like your egg?')).toHaveValue(
    '1.23',
  );
});

test('Stop timer freezes elapsed and illustration, silences reminders and removes recovery', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = AudioContext.prototype.createOscillator;
    Object.defineProperty(window, 'cues', { value: 0, writable: true });
    AudioContext.prototype.createOscillator = function () {
      const w = window as unknown as { cues: number };
      w.cues++;
      return original.call(this);
    };
  });
  await setup(page);
  await page.getByRole('button', { name: /^Start/ }).click();
  await setTime(page, record.targetAtMs + 2000);
  await expect(page.getByLabel('Time past target')).toHaveText('+0:02');
  await page.getByRole('button', { name: 'Stop timer', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Egg taken out' }),
  ).toBeFocused();
  const frame = await page.locator('.egg-art').getAttribute('data-yolk');
  const cues = await page.evaluate(
    () => (window as unknown as { cues: number }).cues,
  );
  await setTime(page, record.targetAtMs + 50000);
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(page.getByLabel('Time past target')).toHaveText('+0:02');
  await expect(page.locator('.egg-art')).toHaveAttribute('data-yolk', frame!);
  expect(
    await page.evaluate(() => (window as unknown as { cues: number }).cues),
  ).toBe(cues);
  expect(
    await page.evaluate((key) => sessionStorage.getItem(key), key),
  ).toBeNull();
  await page.reload();
  await expect(page.getByRole('button', { name: /^Start demo/ })).toBeEnabled();
  await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('stopping a demo keeps the result and Cook another egg available', async ({
  page,
}) => {
  await page.goto('./');
  await page.getByRole('button', { name: /^Start demo/ }).click();
  await page.getByRole('button', { name: 'To end' }).click();
  const stop = (await page
    .getByRole('button', { name: 'Stop timer' })
    .boundingBox())!;
  const speed = (await page.locator('.demo-controls').boundingBox())!;
  const another = (await page
    .getByRole('button', { name: 'Cook another egg' })
    .boundingBox())!;
  expect(stop.y).toBeGreaterThan(speed.y + speed.height);
  expect(another.y).toBeGreaterThan(stop.y + stop.height);
  await page.getByRole('button', { name: 'Stop timer' }).click();
  await expect(page.getByRole('button', { name: '50×' })).not.toBeVisible();
  await page.getByRole('button', { name: 'Cook another egg' }).click();
  await expect(page.getByRole('button', { name: /^Start demo/ })).toBeEnabled();
});

async function permission(
  page: Page,
  state: 'granted' | 'prompt' | 'denied' | 'unsupported',
) {
  await page.addInitScript((state) => {
    Object.defineProperty(navigator, 'permissions', {
      configurable: true,
      value: {
        query: async () => {
          if (state === 'unsupported') throw new Error('Not supported');
          return { state };
        },
      },
    });
  }, state);
}

test('one location tap remembers refresh, later granted visits refresh once and opt-out persists', async ({
  page,
}) => {
  await syntheticLocation(page);
  await weatherRoutes(page);
  await permission(page, 'granted');
  const requests: string[] = [];
  page.on('request', (r) => {
    if (r.url().includes('api.open-meteo.com')) requests.push(r.url());
  });
  await setup(page);
  expect(requests).toHaveLength(0);
  await locate(page);
  await expect(
    page.getByText('Local · 900 hPa', { exact: true }),
  ).toBeVisible();
  expect(requests).toHaveLength(2);
  expect(
    await page.evaluate(() =>
      localStorage.getItem('egg-cooker.auto-location.v1'),
    ),
  ).toBe('true');
  await page.reload();
  await expect(
    page.getByText('Local · 900 hPa', { exact: true }),
  ).toBeVisible();
  expect(requests).toHaveLength(4);
  await page.getByLabel('Air pressure').fill('950');
  await page.getByRole('button', { name: 'Refresh location' }).click();
  await expect(page.getByLabel('Air pressure')).toHaveValue('900');
  expect(requests).toHaveLength(6);
  await page.getByRole('button', { name: 'About this timer' }).click();
  await page
    .getByRole('checkbox', { name: 'Refresh location automatically on visits' })
    .uncheck();
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Use location', exact: true }),
  ).toBeEnabled();
  expect(requests).toHaveLength(6);
});

for (const state of ['prompt', 'denied', 'unsupported'] as const) {
  test(`remembered location with ${state} permission waits for a tap`, async ({
    page,
  }) => {
    await syntheticLocation(page);
    await weatherRoutes(page);
    await permission(page, state);
    await page.addInitScript(() =>
      localStorage.setItem('egg-cooker.auto-location.v1', 'true'),
    );
    const requests: string[] = [];
    page.on('request', (r) => {
      if (r.url().includes('api.open-meteo.com')) requests.push(r.url());
    });
    await setup(page);
    expect(requests).toHaveLength(0);
    await page.getByRole('button', { name: 'Refresh location' }).click();
    await expect(
      page.getByText('Local · 900 hPa', { exact: true }),
    ).toBeVisible();
    expect(requests).toHaveLength(2);
  });
}

test('manual elevation wins over a delayed startup permission check', async ({
  page,
}) => {
  await syntheticLocation(page);
  await page.addInitScript(() => {
    localStorage.setItem('egg-cooker.auto-location.v1', 'true');
    Object.defineProperty(navigator, 'permissions', {
      configurable: true,
      value: {
        query: () =>
          new Promise((resolve) => {
            Object.defineProperty(window, 'grantLocation', {
              value: () => resolve({ state: 'granted' }),
            });
          }),
      },
    });
  });
  const requests: string[] = [];
  page.on('request', (r) => {
    if (r.url().includes('api.open-meteo.com')) requests.push(r.url());
  });
  await setup(page);
  await page.getByLabel('Elevation', { exact: true }).fill('1500');
  await page.evaluate(() =>
    (window as unknown as { grantLocation: () => void }).grantLocation(),
  );
  await page.getByRole('button', { name: /^Start/ }).click();
  const saved = JSON.parse(
    (await page.evaluate((key) => sessionStorage.getItem(key), key))!,
  );
  expect(saved).toMatchObject({ altitudeM: 1500, source: 'altitude' });
  expect(requests).toEqual([]);
});

test('denied preference storage still permits a direct lookup', async ({
  page,
}) => {
  await syntheticLocation(page);
  await weatherRoutes(page);
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get: () => {
        throw new Error('Storage denied');
      },
    });
  });
  await setup(page);
  await locate(page);
  await expect(
    page.getByText('Local · 900 hPa', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: /^Start/ }).click();
  expect(
    JSON.parse(
      (await page.evaluate((key) => sessionStorage.getItem(key), key))!,
    ),
  ).toMatchObject({ source: 'weather', pressureHpa: 900 });
});

test('refresh keeps accepted values and estimate until the complete response, with delayed progress', async ({
  page,
}) => {
  await syntheticLocation(page);
  await weatherRoutes(page);
  await setup(page);
  await locate(page);
  await expect(
    page.getByText('Local · 900 hPa', { exact: true }),
  ).toBeVisible();
  await page.clock.install({ time: now });
  await page.clock.pauseAt(now);
  let release!: () => void;
  const held = new Promise<void>((resolve) => (release = resolve));
  await page.route(
    'https://api.open-meteo.com/v1/forecast?*',
    async (route) => {
      await held;
      await route.fulfill({
        json: {
          elevation: 1000,
          utc_offset_seconds: 0,
          current_units: { surface_pressure: 'hPa', time: 'unixtime' },
          current: { surface_pressure: 910, time: now / 1000 },
        },
      });
    },
  );
  const requested = page.waitForRequest(
    'https://api.open-meteo.com/v1/forecast?*',
  );
  await page.getByRole('button', { name: 'Refresh location' }).click();
  await requested;
  await page.clock.runFor(799);
  await expect(
    page.getByText('Local · 900 hPa', { exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel('Air pressure', { exact: true })).toHaveValue(
    '900',
  );
  await expect(page.getByLabel('Estimated cooking time 7:49')).toBeVisible();
  await expect(page.getByText('Finding local conditions…')).not.toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Refresh location' }),
  ).toHaveText('Refresh');
  await page.clock.runFor(1);
  await expect(page.getByText('Finding local conditions…')).toBeVisible();
  await expect(
    page.getByText('Local · 900 hPa', { exact: true }),
  ).toBeVisible();
  release();
  await expect(
    page.getByText('Local · 910 hPa', { exact: true }),
  ).toBeVisible();
  await expect(page.getByText('Finding local conditions…')).not.toBeVisible();
});

test('refresh only falls back after timeout and cancelling preserves current conditions', async ({
  page,
}) => {
  await syntheticLocation(page);
  await weatherRoutes(page);
  await setup(page);
  await locate(page);
  await expect(
    page.getByText('Local · 900 hPa', { exact: true }),
  ).toBeVisible();
  await page.clock.install({ time: now });
  await page.clock.pauseAt(now);
  await page.route('https://api.open-meteo.com/v1/elevation?*', () => {});
  let requested = page.waitForRequest(
    'https://api.open-meteo.com/v1/elevation?*',
  );
  await page.getByRole('button', { name: 'Refresh location' }).click();
  await requested;
  await page.clock.runFor(800);
  await page.getByRole('button', { name: 'Cancel lookup' }).click();
  await page.clock.runFor(8000);
  await expect(
    page.getByText('Local · 900 hPa', { exact: true }),
  ).toBeVisible();
  await expect(page.getByText('Finding local conditions…')).not.toBeVisible();
  requested = page.waitForRequest('https://api.open-meteo.com/v1/elevation?*');
  await page.getByRole('button', { name: 'Refresh location' }).click();
  await requested;
  await page.clock.runFor(7999);
  await expect(
    page.getByText('Local · 900 hPa', { exact: true }),
  ).toBeVisible();
  await page.clock.runFor(1);
  await expect(
    page.getByText('Elevation unavailable', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('Standard · 1013 hPa', { exact: true }),
  ).toBeVisible();
  await expect(page.getByText('Finding local conditions…')).not.toBeVisible();
});

test('size and texture preset centres match native thumb positions, with boiling temperature on Start', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');
  for (const [id, names] of [
    ['mass', ['S · 50 grams', 'M · 60 grams', 'L · 70 grams', 'XL · 80 grams']],
    ['texture', ['Soft', 'Jammy', 'Firm']],
  ] as const) {
    for (const name of names) {
      const button = page.getByRole('button', { name, exact: true });
      await button.click();
      const centre = await page.locator(`#${id}`).evaluate((node) => {
        const input = node as HTMLInputElement;
        const bounds = input.getBoundingClientRect();
        return (
          bounds.x +
          12 +
          ((Number(input.value) - Number(input.min)) /
            (Number(input.max) - Number(input.min))) *
            (bounds.width - 24)
        );
      });
      const bounds = (await button.boundingBox())!;
      expect(Math.abs(centre - bounds.x - bounds.width / 2)).toBeLessThan(1);
    }
  }
  await expect(page.getByLabel('Water boiling temperature')).toHaveText(
    ' at 100.0 °C',
  );
  await expect(page.locator('.start-details')).toHaveText(
    /≈ \d+:\d{2}\s+at 100\.0 °C/,
  );
  await page.getByLabel('Elevation').fill('8850');
  await expect(page.getByLabel('Water boiling temperature')).toContainText(
    '70.2 °C',
  );
  await expect(
    page.getByText(
      'Low boiling temperature · texture estimate is exploratory.',
    ),
  ).toBeVisible();
  await page.getByLabel('How would you like your egg?').press('End');
  await expect(page.getByLabel('How would you like your egg?')).toHaveAttribute(
    'aria-valuetext',
    'Firm',
  );
  await expect(page.locator('.egg-art')).toHaveAttribute('data-yolk', '1.0000');
});

test('city name is optional, nonblocking and never persisted; manual edits reject a late name', async ({
  page,
}) => {
  await syntheticLocation(page);
  await weatherRoutes(page);
  let release!: () => Promise<void>;
  await page.route('https://api.bigdatacloud.net/**', (route) => {
    expect(route.request().url()).toContain('latitude=52.52&longitude=13.41');
    release = () =>
      route.fulfill({
        json: {
          lookupSource: 'coordinates',
          latitude: 52.52,
          longitude: 13.41,
          city: 'Berlin',
        },
      });
  });
  await setup(page);
  await locate(page);
  await expect(
    page.getByText('Local · 900 hPa', { exact: true }),
  ).toBeVisible();
  await expect(page.getByText('Finding local conditions…')).not.toBeVisible();
  await release();
  await expect(page.locator('.place')).toHaveText('Berlin');
  await expect(page.locator('.conditions-label')).toHaveText(
    'Berlin · 900 hPa',
  );
  const cityBounds = (await page.locator('.place').boundingBox())!;
  const pressureBounds = (await page.locator('.place-pressure').boundingBox())!;
  expect(Math.abs(cityBounds.y - pressureBounds.y)).toBeLessThan(1);
  await expect(page.getByLabel('Estimated cooking time 7:49')).toBeVisible();
  await page.getByRole('button', { name: /^Start/ }).click();
  expect(
    await page.evaluate(() =>
      JSON.stringify({ ...localStorage, ...sessionStorage }),
    ),
  ).not.toMatch(/Berlin|latitude|longitude/);
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  const request = page.waitForRequest('https://api.bigdatacloud.net/**');
  await page.getByRole('button', { name: 'Refresh location' }).click();
  await request;
  await page.getByLabel('Elevation').fill('500');
  await release();
  await expect(page.locator('.place')).toHaveCount(0);
  await expect(page.getByLabel('Elevation')).toHaveValue('500');
});

test('last ten seconds tick, target alarms persist beyond a minute, Stop timer silences them', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const tones: number[] = [];
    Object.assign(window, { testTones: tones });
    class TestAudio {
      state = 'running';
      currentTime = 0;
      destination = {};
      async resume() {}
      async close() {}
      createGain() {
        return {
          gain: {
            setValueAtTime() {},
            linearRampToValueAtTime() {},
            exponentialRampToValueAtTime() {},
          },
          connect() {},
          disconnect() {},
        };
      }
      createOscillator() {
        const node = {
          frequency: { value: 0 },
          type: '',
          onended: null as (() => void) | null,
          connect() {},
          disconnect() {},
          start() {
            tones.push(node.frequency.value);
          },
          stop() {
            node.onended?.();
          },
        };
        return node;
      }
    }
    Object.assign(window, { AudioContext: TestAudio });
  });
  await setup(page);
  await page.getByRole('button', { name: /^Start/ }).click();
  const tones = () =>
    page.evaluate(
      () => (window as unknown as { testTones: number[] }).testTones,
    );
  await expect.poll(async () => (await tones()).length).toBe(1);
  for (let seconds = 10; seconds >= 1; seconds--) {
    await setTime(page, record.targetAtMs - seconds * 1000);
    await expect
      .poll(async () => (await tones()).filter((n) => n === 1000).length)
      .toBe(11 - seconds);
  }
  await setTime(page, record.targetAtMs);
  await expect.poll(async () => (await tones()).length).toBe(14);
  await setTime(page, record.targetAtMs + 2000);
  await expect.poll(async () => (await tones()).length).toBe(17);
  await setTime(page, record.targetAtMs + 62000);
  await expect.poll(async () => (await tones()).length).toBe(20);
  await page.getByRole('button', { name: 'Stop timer' }).click();
  await setTime(page, record.targetAtMs + 70000);
  await expect(
    page.getByRole('heading', { name: 'Egg taken out' }),
  ).toBeVisible();
  expect((await tones()).length).toBe(20);
});

test('a late city name cannot restore weather that has expired', async ({
  page,
}) => {
  await syntheticLocation(page);
  await weatherRoutes(page, {
    current: { surface_pressure: 900, time: now / 1000 - 7199 },
  });
  let release!: () => Promise<void>;
  await page.route('https://api.bigdatacloud.net/**', (route) => {
    release = () =>
      route.fulfill({
        json: {
          lookupSource: 'coordinates',
          latitude: 52.52,
          longitude: 13.41,
          city: 'Berlin',
        },
      });
  });
  await setup(page);
  await locate(page);
  await expect(
    page.getByText('Local · 900 hPa', { exact: true }),
  ).toBeVisible();
  await setTime(page, now + 2000);
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(
    page.getByText('Altitude estimate', { exact: true }),
  ).toBeVisible();
  await release();
  await expect(page.locator('.place')).toHaveText('Berlin');
  await expect(
    page.getByText('Weather expired', { exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel('Air pressure')).not.toHaveValue('900');
});

test('texture highlighting covers the continuum and location has clear separation', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 740 });
  await page.goto('./');
  const slider = page.getByLabel('How would you like your egg?');
  for (const [value, selected] of [
    ['0.75', 'Soft'],
    ['1', 'Soft'],
    ['1.01', 'Soft'],
    ['1.24', 'Soft'],
    ['1.25', 'Jammy'],
    ['1.5', 'Jammy'],
    ['1.74', 'Jammy'],
    ['1.75', 'Firm'],
    ['2', 'Firm'],
    ['2.25', 'Firm'],
  ]) {
    await slider.fill(value!);
    for (const name of ['Soft', 'Jammy', 'Firm']) {
      await expect(
        page.getByRole('button', { name, exact: true }),
      ).toHaveAttribute('aria-pressed', String(name === selected));
    }
  }
  await expect(page.getByText('Longer', { exact: true })).toHaveCount(0);
  const heading = page.getByRole('heading', { name: 'Location data' });
  await expect(heading).toBeVisible();
  const rail = (await page.locator('.doneness .preset-rail').boundingBox())!;
  const title = (await heading.boundingBox())!;
  expect(title.y - rail.y - rail.height).toBeGreaterThanOrEqual(16);
  await expect(page.locator('.conditions-label')).toHaveText(
    'Standard · 1013 hPa',
  );
  const start = (await page
    .getByRole('button', { name: /^Start/ })
    .boundingBox())!;
  expect(start.y + start.height).toBeLessThanOrEqual(740);
});
