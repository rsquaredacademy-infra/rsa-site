import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const mediaPath = '/media/explainer/how-learning-works.mp4';
const heroName = 'Watch how it works · 1 min';
const sectionName = 'Play: how learning works here (1 min)';

async function stubAnalytics(page: Page, choice: 'granted' | 'denied' | null = 'granted') {
  await page.route(/googletagmanager|google-analytics/, route => route.abort());
  await page.addInitScript((consent) => {
    if (consent) document.cookie = `rsa_consent=${consent}; Path=/`;
    (window as any).__gaEvents = [];
    (window as any).gtag = (...args: unknown[]) => (window as any).__gaEvents.push(args);
  }, choice);
}

async function starts(page: Page) {
  return page.evaluate(() => ((window as any).__gaEvents as unknown[][]).filter(args => args[0] === 'event' && args[1] === 'video_start'));
}

for (const path of ['/', '/courses/']) {
  test(`hero and section open an accessible player with optional captions on ${path}`, async ({ page, request }) => {
    await stubAnalytics(page);
    const videoRequests: string[] = [];
    page.on('request', req => { if (req.url().endsWith(mediaPath)) videoRequests.push(req.url()); });
    await page.goto(path);
    const dialog = page.getByRole('dialog', { name: 'How learning works here (1 min)' });
    const video = page.locator('#learning-explainer-dialog video');
    const hero = page.getByRole('button', { name: heroName, exact: true });
    const section = page.getByRole('button', { name: sectionName, exact: true });
    await expect(hero).toHaveClass(/rsa-btn-secondary/);
    await expect(hero.locator('svg')).toHaveAttribute('aria-hidden', 'true');
    await expect(dialog).not.toBeVisible();
    await expect(video).toHaveCount(1);
    await expect(video).toHaveAttribute('aria-label', 'How learning works here (57 s)');
    await expect(video).toHaveAttribute('controls', '');
    await expect(video).toHaveAttribute('preload', 'none');
    await expect(video).toHaveAttribute('playsinline', '');
    await expect(video).not.toHaveAttribute('autoplay');
    await expect(video).toHaveAttribute('poster', '/media/explainer/how-learning-works-poster.webp');
    await expect(video.locator('source')).toHaveAttribute('src', mediaPath);
    const track = video.locator('track[kind="captions"]');
    await expect(track).toHaveAttribute('srclang', 'en');
    await expect(track).toHaveAttribute('label', 'English');
    await expect(track).toHaveAttribute('src', '/media/explainer/how-learning-works.vtt');
    await expect(track).not.toHaveAttribute('default');
    await section.scrollIntoViewIfNeeded();
    expect(await page.locator('.ladder').evaluate(el => {
      let previous = el.previousElementSibling;
      while (previous?.matches('script, style')) previous = previous.previousElementSibling;
      return previous?.classList.contains('learning-explainer');
    })).toBe(true);
    await page.waitForTimeout(300);
    expect(videoRequests).toEqual([]);
    expect(await video.evaluate((el: HTMLVideoElement) => el.paused && el.currentTime === 0 && !el.muted && [...el.textTracks].every(t => t.mode === 'disabled'))).toBe(true);
    expect(await starts(page)).toEqual([]);

    const poster = await request.get((await video.getAttribute('poster'))!);
    expect(poster.status()).toBe(200);
    expect(poster.headers()['content-type']).toContain('image/webp');
    const captions = await request.get((await track.getAttribute('src'))!);
    expect(captions.status()).toBe(200);
    expect(await captions.text()).toMatch(/^WEBVTT/);
    const full = await request.get(mediaPath);
    expect(full.status()).toBe(200);
    expect(full.headers()['content-type']).toContain('video/mp4');
    expect((await full.body()).length).toBeLessThanOrEqual(3_000_000);
    const range = await request.get(mediaPath, { headers: { Range: 'bytes=0-1023' } });
    expect(range.status()).toBe(206);
    expect(range.headers()['content-range']).toMatch(/^bytes 0-1023\/\d+$/);
    expect((await range.body()).length).toBe(1024);

    await hero.focus();
    await hero.press('Enter');
    await expect(dialog).toBeVisible();
    await expect(video).toHaveAccessibleName('How learning works here (57 s)');
    const close = dialog.getByRole('button', { name: 'Close', exact: true });
    await expect(close).toBeFocused();
    await expect.poll(() => video.evaluate((el: HTMLVideoElement) => !el.paused && el.currentTime > 0)).toBe(true);
    expect(await video.evaluate((el: HTMLVideoElement) => el.duration)).toBeCloseTo(57.33, 1);
    expect(await video.evaluate((el: HTMLVideoElement) => [...el.textTracks].every(t => t.mode === 'disabled'))).toBe(true);
    await track.evaluate((el: HTMLTrackElement) => { el.track.mode = 'showing'; });
    await expect.poll(() => track.evaluate((el: HTMLTrackElement) => el.track.cues?.length ?? 0)).toBe(14);
    // Native media controls have their own Tab stops; none may reach the page outside the modal.
    for (let i = 0; i < 16; i++) {
      await page.keyboard.press(i < 8 ? 'Tab' : 'Shift+Tab');
      expect(await dialog.evaluate(el => el.contains(document.activeElement))).toBe(true);
    }
    expect(await starts(page)).toEqual([['event', 'video_start', { placement: 'hero', page: path }]]);
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(hero).toBeFocused();
    expect(await video.evaluate((el: HTMLVideoElement) => el.paused)).toBe(true);

    const before = (await section.boundingBox())!;
    await section.focus();
    await section.press('Space');
    await expect(dialog).toBeVisible();
    await expect.poll(async () => (await starts(page)).length).toBe(2);
    expect((await starts(page))[1]).toEqual(['event', 'video_start', { placement: 'section', page: path }]);
    expect((await new AxeBuilder({ page }).include('#learning-explainer-dialog').analyze()).violations).toEqual([]);
    await close.click();
    await expect(section).toBeFocused();
    expect(await video.evaluate((el: HTMLVideoElement) => el.paused)).toBe(true);
    const after = (await section.boundingBox())!;
    expect(after.width).toBeCloseTo(before.width, 1);
    expect(after.height).toBeCloseTo(before.height, 1);
    // Each actual resume counts once, rather than counting both click and play.
    await hero.click();
    await expect.poll(async () => (await starts(page)).length).toBe(3);
    await video.evaluate((el: HTMLVideoElement) => el.pause());
    await video.evaluate((el: HTMLVideoElement) => el.play());
    await expect.poll(async () => (await starts(page)).length).toBe(4);
    await close.click();
  });

  test(`no-JS hero link reaches the section's native player on ${path}`, async ({ browser, baseURL }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'One no-JS context covers each page');
    const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
    const page = await context.newPage();
    await page.goto(path);
    const hero = page.getByRole('link', { name: heroName, exact: true });
    await expect(hero).toHaveAttribute('href', '#learning-explainer');
    await hero.click();
    await expect(page).toHaveURL(`${baseURL}${path}#learning-explainer`);
    await expect(page.locator('#learning-explainer video')).toBeInViewport();
    await expect(page.locator('#learning-explainer video')).toHaveAttribute('controls', '');
    await context.close();
  });
}

for (const choice of [null, 'denied', 'granted'] as const) {
  test.describe(`European consent: ${choice ?? 'pending'}`, () => {
    test.use({ timezoneId: 'Europe/London' });
    test('video_start follows site-kit consent and never replays pre-consent events', async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== 'desktop', 'Consent policy is independent of viewport');
      await stubAnalytics(page, choice);
      await page.goto('/');
      if (choice === null) await expect(page.locator('#rsa-consent-banner')).toBeVisible();
      await page.getByRole('button', { name: heroName, exact: true }).click();
      const video = page.locator('#learning-explainer-dialog video');
      await expect.poll(() => video.evaluate((el: HTMLVideoElement) => !el.paused && el.currentTime > 0)).toBe(true);
      expect((await starts(page)).length).toBe(choice === 'granted' ? 1 : 0);
      await page.keyboard.press('Escape');
      await expect(page.getByRole('button', { name: heroName, exact: true })).toBeFocused();
      if (choice === null) {
        await expect(page.locator('#rsa-consent-banner')).toBeVisible();
        await page.locator('#rsa-consent-accept').click();
        expect(await starts(page)).toEqual([]);
        await page.getByRole('button', { name: sectionName, exact: true }).click();
        await expect.poll(async () => (await starts(page)).length).toBe(1);
        expect((await starts(page))[0][2]).toEqual({ placement: 'section', page: '/' });
      }
    });
  });
}

test.describe('non-European consent', () => {
  test.use({ timezoneId: 'Asia/Kolkata' });
  test('default permits video_start; unavailable site-kit fails closed', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Consent policy is independent of viewport');
    await stubAnalytics(page, null);
    await page.goto('/');
    await page.getByRole('button', { name: heroName, exact: true }).click();
    await expect.poll(async () => (await starts(page)).length).toBe(1);
    await page.route('**/site-kit/rsa-analytics.js', route => route.abort());
    await page.reload();
    await page.getByRole('button', { name: heroName, exact: true }).click();
    await expect.poll(() => page.locator('#learning-explainer-dialog video').evaluate((el: HTMLVideoElement) => !el.paused && el.currentTime > 0)).toBe(true);
    expect(await starts(page)).toEqual([]);
  });
});

for (const width of [1440, 820, 390]) for (const theme of ['light', 'dark'] as const) {
  test(`learning explainer fits its column at ${width}, ${theme}`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Explicit viewports cover all three widths');
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
    await stubAnalytics(page);
    for (const path of ['/', '/courses/']) {
      await page.goto(path);
      await page.evaluate(async () => {
        document.querySelectorAll('img').forEach(image => { image.loading = 'eager'; });
        await document.fonts.ready;
        await Promise.all([...document.images].map(image => image.decode()));
      });
      const figure = page.locator('.learning-explainer');
      const poster = figure.locator('.explainer-poster');
      await poster.scrollIntoViewIfNeeded();
      const box = (await poster.boundingBox())!;
      const column = await figure.evaluate(el => el.closest('.wrap')!.getBoundingClientRect().width - parseFloat(getComputedStyle(el.closest('.wrap')!).paddingLeft) - parseFloat(getComputedStyle(el.closest('.wrap')!).paddingRight));
      expect(box.width).toBeLessThanOrEqual(760);
      expect(box.width).toBeLessThanOrEqual(column);
      expect(box.width / box.height).toBeCloseTo(16 / 9, 2);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      const overlay = (await poster.locator('.explainer-play').boundingBox())!;
      expect(overlay.width).toBeGreaterThanOrEqual(64);
      expect(overlay.height).toBeGreaterThanOrEqual(64);
      const hero = page.getByRole('button', { name: heroName, exact: true });
      const heroBox = (await hero.boundingBox())!;
      expect(heroBox.height).toBeGreaterThanOrEqual(44);
      if (width === 390) {
        expect(box.width).toBeCloseTo(column, 0);
        const start = (await page.locator('.hero-actions a').first().boundingBox())!;
        expect(heroBox.y).toBeGreaterThanOrEqual(start.y + start.height);
      }
      const name = `${path === '/' ? 'home' : 'courses'}-${width}-${theme}`;
      const directory = process.env.A12MODAL_SHOTS_DIR;
      if (directory) {
        mkdirSync(directory, { recursive: true });
        const section = path === '/' ? page.locator('.teaching-section') : page.locator('section[aria-labelledby="ladder-h"]');
        await section.screenshot({ path: join(directory, `${name}-section.png`) });
        const heroSection = path === '/' ? page.locator('.home-hero') : page.locator('.page-sec');
        await heroSection.screenshot({ path: join(directory, `${name}-hero.png`) });
      }
      await hero.click();
      const dialog = page.getByRole('dialog', { name: 'How learning works here (1 min)' });
      await expect(dialog).toBeVisible();
      const modal = (await dialog.boundingBox())!;
      expect(modal.x).toBeGreaterThanOrEqual(0);
      expect(modal.x + modal.width).toBeLessThanOrEqual(width);
      const video = dialog.locator('video');
      await expect.poll(() => video.evaluate((el: HTMLVideoElement) => el.readyState)).toBeGreaterThanOrEqual(2);
      await video.evaluate((el: HTMLVideoElement) => { el.pause(); el.currentTime = 0; });
      const playerBox = (await video.boundingBox())!;
      expect(playerBox.width / playerBox.height).toBeCloseTo(16 / 9, 3);
      if (directory) await page.screenshot({ path: join(directory, `${name}-modal.png`) });
      await dialog.getByRole('button', { name: 'Close', exact: true }).click();
    }
  });
}
