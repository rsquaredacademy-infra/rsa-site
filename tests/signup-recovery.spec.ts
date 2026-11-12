import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

// PR 17 audit fixes: W17-07 (retry), W17-08 (deadlines), W17-09 (focus),
// W17-10 (no JavaScript) and W17-06 (consent prompt coverage).

const APP_ENDPOINT = 'https://app.rsquaredacademy.com/api/subscribe';
const SPAM_LOAD_COPY =
  "Couldn't load the spam check. Check your connection or email support@rsquaredacademy.com.";
const TIMEOUT_COPY = 'That took too long. Check your connection and try again.';
const TURNSTILE_JS = `
  window.__turnstileOptions = null;
  window.turnstile = {
    render: function (container, options) {
      window.__turnstileOptions = options;
      window.setTimeout(function () { options.callback('test-token'); }, 0);
      return 'test-widget';
    },
    reset: function () {},
    remove: function () {}
  };
`;

async function mockTurnstile(page: Page) {
  await page.route('https://challenges.cloudflare.com/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/javascript', body: TURNSTILE_JS }),
  );
}

async function mockSubscribe(page: Page, status: number, body: unknown) {
  let calls = 0;
  await page.route(APP_ENDPOINT, async (route) => {
    calls += 1;
    await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
  });
  return { calls: () => calls };
}

/** Advance the fake clock in small steps until the check passes. */
async function runClockUntil(page: Page, check: () => Promise<boolean>, stepMs = 500, maxMs = 120_000) {
  for (let elapsed = 0; elapsed < maxMs; elapsed += stepMs) {
    if (await check()) return;
    await page.clock.runFor(stepMs);
  }
  throw new Error('condition not met on the fake clock');
}

test.describe('sign-up band recovery, deadlines and fallbacks', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop project only');
  });

  test('W17-07: a failed Turnstile load is retried on the next focus', async ({ page }) => {
    let scriptCalls = 0;
    await page.route('https://challenges.cloudflare.com/**', (route) => {
      scriptCalls += 1;
      if (scriptCalls === 1) return route.abort('failed');
      return route.fulfill({ status: 200, contentType: 'application/javascript', body: TURNSTILE_JS });
    });
    const api = await mockSubscribe(page, 200, { ok: true });

    await page.goto('/');
    const email = page.locator('#home-email');
    const status = page.locator('#home-email-status');

    await email.focus();
    await expect(status).toHaveText(SPAM_LOAD_COPY, { timeout: 10_000 });
    expect(scriptCalls).toBe(1);

    // No page reload: leave the field, focus it again, then submit.
    await email.blur();
    await email.focus();
    await expect
      .poll(async () => page.evaluate(() => Boolean((window as any).__turnstileOptions)))
      .toBe(true);
    expect(scriptCalls).toBe(2);

    await page.keyboard.type('learner@example.com');
    await page.keyboard.press('Enter');
    await expect(status).toHaveText('Check your inbox to confirm.', { timeout: 15_000 });
    expect(api.calls()).toBe(1);
  });

  test('W17-07: a failed load is retried on submit and stops after 3 attempts', async ({ page }) => {
    let scriptCalls = 0;
    await page.route('https://challenges.cloudflare.com/**', (route) => {
      scriptCalls += 1;
      return route.abort('failed');
    });
    const api = await mockSubscribe(page, 200, { ok: true });
    await page.goto('/');
    const email = page.locator('#home-email');
    const status = page.locator('#home-email-status');

    await email.focus();
    await expect(status).toHaveText(SPAM_LOAD_COPY, { timeout: 10_000 });
    await page.keyboard.type('learner@example.com');
    for (let i = 0; i < 3; i += 1) {
      await page.keyboard.press('Enter');
      await expect(status).toHaveText(SPAM_LOAD_COPY);
    }
    expect(scriptCalls).toBe(3);
    expect(api.calls()).toBe(0);
  });

  test('W17-08: a stalled Turnstile script ends with an error and a usable form', async ({ page }) => {
    await page.clock.install();
    await page.route('https://challenges.cloudflare.com/**', () => {
      // Never answered: the request hangs.
    });
    const api = await mockSubscribe(page, 200, { ok: true });
    await page.goto('/');
    const email = page.locator('#home-email');
    const status = page.locator('#home-email-status');
    const submit = page.locator('form[data-signup-form] button[type="submit"]');

    await email.focus();
    await page.keyboard.type('learner@example.com');
    await page.keyboard.press('Enter');
    await expect(status).toHaveText('Signing you up…');
    await runClockUntil(page, async () => (await status.textContent()) === SPAM_LOAD_COPY);
    await expect(submit).not.toHaveAttribute('aria-disabled', 'true');
    await expect(email).toHaveValue('learner@example.com');
    expect(api.calls()).toBe(0);
  });

  test('W17-08: a stalled subscribe request times out with a clear error and a usable form', async ({ page }) => {
    await page.clock.install();
    await mockTurnstile(page);
    let calls = 0;
    await page.route(APP_ENDPOINT, () => {
      calls += 1; // Never answered.
    });
    await page.goto('/');
    const email = page.locator('#home-email');
    const status = page.locator('#home-email-status');
    const submit = page.locator('form[data-signup-form] button[type="submit"]');

    await email.focus();
    await page.keyboard.type('learner@example.com');
    await page.keyboard.press('Enter');
    await runClockUntil(page, async () => calls > 0);
    await expect(status).toHaveText('Signing you up…');
    await runClockUntil(page, async () => (await status.textContent()) === TIMEOUT_COPY);
    await expect(submit).not.toHaveAttribute('aria-disabled', 'true');
    await expect(email).toHaveValue('learner@example.com');
  });

  test('W17-09: focus stays on the submit button after a keyboard submit that fails', async ({ page }) => {
    await mockTurnstile(page);
    await mockSubscribe(page, 429, { ok: false });
    await page.goto('/');
    const email = page.locator('#home-email');
    const status = page.locator('#home-email-status');
    const submit = page.locator('form[data-signup-form] button[type="submit"]');

    await email.focus();
    await page.keyboard.type('learner@example.com');
    await page.keyboard.press('Tab');
    await expect(submit).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(status).toHaveText("Couldn't sign you up just now. Try again in a minute.", {
      timeout: 15_000,
    });
    await expect(submit).toBeFocused();
    await expect(status).toHaveAttribute('aria-live', 'polite');
  });

  test('W17-10: without JavaScript the form is hidden, never uses GET and a mail fallback shows', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    const requests: string[] = [];
    page.on('request', (request) => requests.push(request.url()));
    await page.goto('/');

    const form = page.locator('form[data-signup-form]').first();
    await expect(form).toHaveAttribute('method', 'post');
    await expect(form).toBeHidden();
    // Playwright's text engine skips <noscript>, so select it by element.
    await expect(page.locator('#signup noscript p').first()).toContainText('Sign-up needs JavaScript.');
    await expect(page.locator('#signup a[href^="mailto:"]').first()).toBeVisible();
    await context.close();

    // With JavaScript the form is shown.
    const jsContext = await browser.newContext();
    const jsPage = await jsContext.newPage();
    await jsPage.goto('/');
    await expect(jsPage.locator('form[data-signup-form]').first()).toBeVisible();
    expect(await jsPage.locator('form[data-signup-form]').first().getAttribute('method')).toBe('post');
    await jsContext.close();
    expect(requests.filter((url) => url.includes('email='))).toEqual([]);
  });
});

test.describe('consent prompt covers the EEA, UK and Switzerland (W17-06)', () => {
  const shown = [
    'Asia/Nicosia',
    'Atlantic/Azores',
    'Atlantic/Canary',
    'Atlantic/Madeira',
    'Arctic/Longyearbyen',
    'Africa/Ceuta',
    'Europe/London',
    'Europe/Zurich',
    'Europe/Berlin',
    'Atlantic/Reykjavik',
  ];
  const hidden = ['Asia/Kolkata', 'America/New_York', 'Australia/Sydney'];

  async function bannerCount(browser: import('@playwright/test').Browser, timezoneId: string) {
    const context = await browser.newContext({ timezoneId });
    const page = await context.newPage();
    await page.route(/googletagmanager|google-analytics|fonts\.(googleapis|gstatic)/, (route) => route.abort());
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const count = await page.locator('#rsa-consent-banner').count();
    await context.close();
    return count;
  }

  for (const zone of shown) {
    test(`banner shown in ${zone}`, async ({ browser }, testInfo) => {
      test.skip(testInfo.project.name !== 'desktop', 'Desktop project only');
      expect(await bannerCount(browser, zone)).toBe(1);
    });
  }
  for (const zone of hidden) {
    test(`no banner in ${zone}`, async ({ browser }, testInfo) => {
      test.skip(testInfo.project.name !== 'desktop', 'Desktop project only');
      expect(await bannerCount(browser, zone)).toBe(0);
    });
  }

  test('an unparsable time zone fails closed (banner shown)', async ({ browser }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop project only');
    const context = await browser.newContext({ timezoneId: 'Asia/Kolkata' });
    const page = await context.newPage();
    await page.route(/googletagmanager|google-analytics|fonts\.(googleapis|gstatic)/, (route) => route.abort());
    await page.addInitScript(() => {
      Intl.DateTimeFormat.prototype.resolvedOptions = function () {
        throw new Error('no time zone');
      };
    });
    await page.goto('/');
    await expect(page.locator('#rsa-consent-banner')).toHaveCount(1);
    await context.close();
  });
});
