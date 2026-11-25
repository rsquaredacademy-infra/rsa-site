import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const POLL = '[data-course-poll]';
const STORAGE_KEY = 'rsa-course-poll-v1';
const OPTIONS = [
  ['Excel', 'excel'],
  ['AI for Data Analysts', 'ai-for-data-analysts'],
  ['Statistics', 'statistics'],
  ['Data Science & ML', 'data-science-ml'],
  ['Power BI', 'power-bi'],
  ['Tableau', 'tableau'],
  ['Data Engineering', 'data-engineering'],
  ['Other', 'other'],
] as const;

/** Stub gtag and (optionally) the site-kit consent cookie before any script runs. */
async function stubAnalytics(page: Page, consent: 'granted' | 'denied' | null = 'granted') {
  await page.route(/googletagmanager|google-analytics/, (route) => route.abort());
  await page.addInitScript((choice) => {
    if (choice) document.cookie = `rsa_consent=${choice}; Path=/`;
    (window as any).__gaEvents = [];
    (window as any).__pollAlive = true;
    (window as any).gtag = (...args: unknown[]) => (window as any).__gaEvents.push(args);
  }, consent);
}

async function pollEvents(page: Page) {
  return page.evaluate(
    () => ((window as any).__gaEvents as unknown[][]).filter(
      (args) => args[0] === 'event' && args[1] === 'course_poll_vote',
    ),
  );
}

for (const path of ['/courses/', '/roadmap/']) {
  test(`course poll renders on ${path}`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'One explicit viewport per test');
    await stubAnalytics(page);
    await page.goto(path);

    const poll = page.locator(POLL);
    await expect(poll).toBeVisible();
    await expect(poll.getByRole('heading', { name: 'Which course should we build next?' })).toBeVisible();
    await expect(poll.getByText("Pick the ones you'd take. We read every vote.")).toBeVisible();
    await expect(poll.getByRole('group', { name: "Courses you'd take" })).toBeVisible();

    for (const [label, slug] of OPTIONS) {
      const box = poll.getByLabel(label, { exact: true });
      await expect(box).toBeVisible();
      await expect(box).toHaveAttribute('type', 'checkbox');
      await expect(box).toHaveAttribute('value', slug);
      await expect(box).not.toBeChecked();
    }
    await expect(poll.getByRole('button', { name: 'Submit my picks' })).toBeVisible();
    await expect(poll.locator('[data-poll-other]')).toBeHidden();
    await expect(poll.getByRole('link', { name: 'Get updates' })).toHaveAttribute('href', '/#signup');
    expect(await pollEvents(page)).toEqual([]);
  });
}

test('multi-select submits one event per option, thanks in place, and survives a reload', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'One explicit viewport per test');
  await stubAnalytics(page);
  await page.goto('/courses/');

  const poll = page.locator(POLL);
  await poll.getByLabel('Excel', { exact: true }).check();
  await poll.getByLabel('AI for Data Analysts', { exact: true }).check();
  await poll.getByLabel('Other', { exact: true }).check();
  await expect(poll.locator('[data-poll-other]')).toBeVisible();
  await poll.getByLabel('Which course? (optional)').fill('Rust for analysts');
  expect(await pollEvents(page)).toEqual([]);

  await poll.getByRole('button', { name: 'Submit my picks' }).click();

  const done = poll.locator('[data-poll-done]');
  await expect(done).toBeVisible();
  await expect(done).toHaveText('Thanks. Your picks are in.');
  await expect(done).toBeFocused();
  await expect(poll.getByRole('button', { name: 'Submit my picks' })).toHaveCount(0);
  for (const label of ['Excel', 'AI for Data Analysts', 'Other']) {
    await expect(poll.getByLabel(label, { exact: true })).toBeChecked();
    await expect(poll.getByLabel(label, { exact: true })).toBeDisabled();
  }
  await expect(poll.getByLabel('Statistics', { exact: true })).not.toBeChecked();
  await expect(poll.getByLabel('Statistics', { exact: true })).toBeDisabled();

  const events = await pollEvents(page);
  expect(events).toHaveLength(3);
  expect(events.map((event) => event[2])).toEqual([
    { course: 'excel', placement: 'courses' },
    { course: 'ai-for-data-analysts', placement: 'courses' },
    { course: 'other', placement: 'courses' },
  ]);
  // The free text never reaches analytics, and no second, aggregate event is sent.
  expect(JSON.stringify(events)).not.toContain('Rust for analysts');
  expect(await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)).toBe(
    '{"version":1,"courses":["excel","ai-for-data-analysts","other"]}',
  );

  // Reload: still thanked, choices still disabled, no invite to vote twice.
  await page.reload();
  await expect(poll.locator('[data-poll-done]')).toBeVisible();
  await expect(poll.getByLabel('Excel', { exact: true })).toBeChecked();
  await expect(poll.getByLabel('Excel', { exact: true })).toBeDisabled();
  await expect(poll.getByRole('button', { name: 'Submit my picks' })).toHaveCount(0);
  await expect(poll.locator('[data-poll-other]')).toBeVisible();
  expect(await pollEvents(page)).toEqual([]);
  // The vote is site-wide, so the roadmap instance also opens in the thanked state.
  await page.goto('/roadmap/');
  await expect(page.locator(POLL).locator('[data-poll-done]')).toBeVisible();
  await expect(page.locator(POLL).getByLabel('Excel', { exact: true })).toBeChecked();
});

test('a submit without a choice asks for one and sends no event', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'One explicit viewport per test');
  await stubAnalytics(page);
  await page.goto('/roadmap/');

  const poll = page.locator(POLL);
  await poll.getByRole('button', { name: 'Submit my picks' }).click();
  await expect(poll.locator('[data-poll-status]')).toHaveText('Pick at least one course.');
  await expect(poll.getByLabel('Excel', { exact: true })).toBeFocused();
  await expect(poll.locator('[data-poll-done]')).toBeHidden();
  expect(await pollEvents(page)).toEqual([]);
  expect(await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)).toBeNull();
});

for (const choice of [null, 'denied', 'granted'] as const) {
  test.describe(`European consent: ${choice ?? 'pending'}`, () => {
    test.use({ timezoneId: 'Europe/London' });
    test('a vote fires no GA4 event before consent and never replays', async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== 'desktop', 'Consent policy is independent of viewport');
      await stubAnalytics(page, choice);
      await page.goto('/courses/');
      if (choice === null) await expect(page.locator('#rsa-consent-banner')).toBeVisible();

      const poll = page.locator(POLL);
      await poll.getByLabel('Power BI', { exact: true }).check();
      await poll.getByRole('button', { name: 'Submit my picks' }).click();
      await expect(poll.locator('[data-poll-done]')).toBeVisible();
      await expect.poll(async () => (await pollEvents(page)).length).toBe(choice === 'granted' ? 1 : 0);

      if (choice === null) {
        // The vote counts for the visitor, but accepting later does not replay it.
        await page.locator('#rsa-consent-accept').click();
        expect(await pollEvents(page)).toEqual([]);
      }
      if (choice === 'granted') {
        expect((await pollEvents(page))[0][2]).toEqual({ course: 'power-bi', placement: 'courses' });
      }
    });
  });
}

test.describe('non-European consent', () => {
  test.use({ timezoneId: 'Asia/Kolkata' });
  test('site-kit default permits the vote; without site-kit it fails closed', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Consent policy is independent of viewport');
    await stubAnalytics(page, null);
    await page.goto('/courses/');
    await expect(page.locator('#rsa-consent-banner')).toHaveCount(0);
    await page.locator(POLL).getByLabel('Tableau', { exact: true }).check();
    await page.locator(POLL).getByRole('button', { name: 'Submit my picks' }).click();
    await expect.poll(async () => (await pollEvents(page)).length).toBe(1);

    await page.evaluate((key) => localStorage.removeItem(key), STORAGE_KEY);
    await page.route('**/site-kit/rsa-analytics.js', (route) => route.abort());
    await page.reload();
    await page.locator(POLL).getByLabel('Tableau', { exact: true }).check();
    await page.locator(POLL).getByRole('button', { name: 'Submit my picks' }).click();
    await expect(page.locator(POLL).locator('[data-poll-done]')).toBeVisible();
    expect(await pollEvents(page)).toEqual([]);
  });
});

for (const width of [1280, 390]) {
  for (const theme of ['light', 'dark'] as const) {
    test(`course poll has no overflow and no axe violations at ${width}, ${theme}`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== 'desktop', 'Explicit viewport matrix');
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme: theme });
      await stubAnalytics(page);
      for (const path of ['/courses/', '/roadmap/']) {
        await page.goto(path);
        const poll = page.locator(POLL);
        await poll.scrollIntoViewIfNeeded();
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);

        const heights = await poll.locator('.course-poll-option').evaluateAll(
          (labels) => labels.map((label) => label.getBoundingClientRect().height),
        );
        expect(Math.min(...heights)).toBeGreaterThanOrEqual(44);

        const results = await new AxeBuilder({ page })
          .include(POLL)
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze();
        expect(results.violations).toEqual([]);

        // The thanked state is part of the poll too.
        await poll.getByLabel('Excel', { exact: true }).check();
        await poll.getByRole('button', { name: 'Submit my picks' }).click();
        await expect(poll.locator('[data-poll-done]')).toBeVisible();
        const after = await new AxeBuilder({ page })
          .include(POLL)
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze();
        expect(after.violations).toEqual([]);
        await page.evaluate((key) => localStorage.removeItem(key), STORAGE_KEY);
      }
    });
  }
}
