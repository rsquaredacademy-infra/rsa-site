import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const APP_ENDPOINT = 'https://app.rsquaredacademy.com/api/subscribe';
const TURNSTILE_TEST_PASS = '1x00000000000000000000AA';

/** Cloudflare's always-pass test widget, without any network to Cloudflare. */
async function mockTurnstile(page: Page) {
  await page.route('https://challenges.cloudflare.com/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: `
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
      `,
    }),
  );
}

/** Mock the app endpoint and return a getter for the request body. */
async function mockSubscribe(page: Page, status: number, body: unknown) {
  let requestBody: Record<string, unknown> | null = null;
  let calls = 0;
  await page.route(APP_ENDPOINT, async (route) => {
    calls += 1;
    requestBody = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  });
  return {
    body: () => requestBody,
    calls: () => calls,
  };
}

test.describe('native sign-up band', () => {
  test('keyboard submit confirms, sends the app body and one sign_up event', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop project only');
    await mockTurnstile(page);
    const api = await mockSubscribe(page, 200, { ok: true });
    await page.addInitScript(() => {
      (window as any).__alive = true;
      (window as any).__gaEvents = [];
      (window as any).gtag = (...args: unknown[]) => {
        (window as any).__gaEvents.push(args);
      };
    });

    await page.goto('/');
    const email = page.locator('#home-email');
    const status = page.locator('#home-email-status');
    const submit = page.locator('form[data-signup-form] button[type="submit"]');

    await expect(email).toBeVisible();
    await expect(email).toHaveAttribute('autocomplete', 'email');
    await expect(email).toHaveAttribute('required', '');

    // The widget loads only after the field is focused, with the test key.
    await expect.poll(async () => page.evaluate(() => Boolean((window as any).__turnstileOptions))).toBe(false);
    await email.focus();
    await expect
      .poll(async () => page.evaluate(() => (window as any).__turnstileOptions?.sitekey))
      .toBe(TURNSTILE_TEST_PASS);
    expect(await page.evaluate(() => (window as any).__turnstileOptions?.action)).toBe('signup');

    await page.keyboard.type('learner@example.com');
    await page.keyboard.press('Tab');
    await expect(submit).toBeFocused();
    await page.keyboard.press('Enter');

    await expect(status).toHaveText('Check your inbox to confirm.', { timeout: 15_000 });
    await expect(email).toHaveValue('');
    // W17-09: the keyboard user stays on the submit button after completion.
    await expect(submit).toBeFocused();

    const sent = api.body();
    expect(sent).not.toBeNull();
    expect(sent).toMatchObject({
      email: 'learner@example.com',
      site: 'www.rsquaredacademy.com',
      placement: 'www_band',
      hp: '',
      token: 'test-token',
      testMode: 'pass',
    });
    expect(Number(sent!.t)).toBeGreaterThanOrEqual(3000);

    const events = await page.evaluate(() => (window as any).__gaEvents as unknown[][]);
    const signUps = events.filter((args) => args[0] === 'event' && args[1] === 'sign_up');
    expect(signUps).toHaveLength(1);
    expect(signUps[0][2]).toMatchObject({
      method: 'zoho_campaigns',
      signup_site: 'www.rsquaredacademy.com',
      placement: 'www_band',
    });
    expect(JSON.stringify(signUps[0])).not.toContain('learner@example.com');

    // No page reload: a marker set before submit survived.
    expect(await page.evaluate(() => (window as any).__alive)).toBe(true);
  });

  test('a failed response shows a plain error and sends no sign_up', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop project only');
    await mockTurnstile(page);
    const api = await mockSubscribe(page, 500, { ok: false });
    await page.addInitScript(() => {
      (window as any).__gaEvents = [];
      (window as any).gtag = (...args: unknown[]) => {
        (window as any).__gaEvents.push(args);
      };
    });

    await page.goto('/');
    const email = page.locator('#home-email');
    const status = page.locator('#home-email-status');
    const submit = page.locator('form[data-signup-form] button[type="submit"]');

    await email.focus();
    await page.keyboard.type('learner@example.com');
    await page.keyboard.press('Enter');

    await expect(status).toHaveText("Couldn't sign you up just now. Try again in a minute.", {
      timeout: 15_000,
    });
    expect(api.calls()).toBe(1);
    await expect(email).toHaveValue('learner@example.com');
    await expect(submit).toBeEnabled();
    // W17-09: focus is kept (here the field the visitor submitted from).
    await expect(email).toBeFocused();

    const signUps = await page.evaluate(
      () => ((window as any).__gaEvents as unknown[][]).filter(
        (args) => args[0] === 'event' && args[1] === 'sign_up',
      ),
    );
    expect(signUps).toEqual([]);
  });

  test('an invalid address shows the inline error and never posts', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop project only');
    await mockTurnstile(page);
    const api = await mockSubscribe(page, 200, { ok: true });

    await page.goto('/');
    const email = page.locator('#home-email');
    const status = page.locator('#home-email-status');

    await email.focus();
    await page.keyboard.type('not-an-email');
    await page.keyboard.press('Enter');

    await expect(status).toHaveText("That email doesn't look right.");
    await expect(email).toHaveAttribute('aria-invalid', 'true');
    await expect(email).toBeFocused();
    expect(api.calls()).toBe(0);
  });

  test('a Turnstile load failure shows the fallback and never posts', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop project only');
    await page.route('https://challenges.cloudflare.com/**', (route) =>
      route.fulfill({ status: 500, contentType: 'text/plain', body: 'unavailable' }),
    );
    const api = await mockSubscribe(page, 200, { ok: true });

    await page.goto('/');
    const email = page.locator('#home-email');
    const status = page.locator('#home-email-status');

    await email.focus();
    await expect(status).toHaveText(
      "Couldn't load the spam check. Check your connection or email support@rsquaredacademy.com.",
      { timeout: 10_000 },
    );

    await page.keyboard.type('learner@example.com');
    await page.keyboard.press('Enter');
    await expect(status).toHaveText(
      "Couldn't load the spam check. Check your connection or email support@rsquaredacademy.com.",
    );
    expect(api.calls()).toBe(0);
  });

  test('no serious axe issues and no horizontal scroll at 390 px', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop project only');
    await page.setViewportSize({ width: 390, height: 844 });
    await mockTurnstile(page);
    await page.goto('/');

    await page.locator('#home-email').focus();
    await expect.poll(async () => page.evaluate(() => Boolean((window as any).__turnstileOptions))).toBe(true);

    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }));
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.innerWidth);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    const serious = results.violations.filter(
      (violation) => violation.impact === 'serious' || violation.impact === 'critical',
    );
    expect(serious.map((violation) => violation.id)).toEqual([]);
  });
});
