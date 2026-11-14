import { test, expect } from '@playwright/test';

test('hero plays a muted loop in the matching layout; phone waits for scrolling', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference', colorScheme: 'light' });
  const requests: string[] = [];
  page.on('request', (request) => { if (/\/media\/hero\/.*\.(mp4|webm)$/.test(request.url())) requests.push(request.url()); });
  await page.goto('/');
  const video = page.locator('[data-hero-loop] video');
  await expect(video).toHaveAttribute('muted', '');
  await expect(video).toHaveAttribute('loop', '');
  await expect(video).toHaveAttribute('playsinline', '');
  await expect(video).toHaveAttribute('autoplay', '');
  const phone = page.viewportSize()!.width <= 760;
  if (phone) {
    await page.waitForTimeout(500);
    expect(requests).toEqual([]);
    await expect(video.locator('source')).toHaveCount(0);
  }
  const before = await page.locator('.hero-media').boundingBox();
  await page.locator('.hero-media').scrollIntoViewIfNeeded();
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.readyState)).toBeGreaterThanOrEqual(2);
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => !element.paused && element.muted && element.loop)).toBe(true);
  await expect(video.locator('source')).toHaveCount(2);
  await expect(video).toHaveAttribute('poster', new RegExp(`${phone ? 'phone' : 'desktop'}-light.webp$`));
  await expect(video.locator('source[type="video/mp4"]')).toHaveAttribute('src', /\.mp4$/);
  await expect(video.locator('source[type="video/webm"]')).toHaveAttribute('src', /\.webm$/);
  const after = await page.locator('.hero-media').boundingBox();
  expect(after!.width).toBe(before!.width);
  expect(after!.height).toBe(before!.height);
  await page.getByRole('button', { name: 'Pause lesson preview', exact: true }).click();
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
  await expect(page.locator('[data-hero-loop]')).toHaveAttribute('data-playing', 'false');
});

test('reduced motion keeps the poster and fetches video only after Play', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' });
  const requests: string[] = [];
  page.on('request', (request) => { if (/\/media\/hero\/.*\.(mp4|webm)$/.test(request.url())) requests.push(request.url()); });
  await page.goto('/');
  const video = page.locator('[data-hero-loop] video');
  await page.locator('.hero-media').scrollIntoViewIfNeeded();
  await expect(page.getByRole('button', { name: 'Play lesson preview', exact: true })).toBeVisible();
  await expect(video.locator('source')).toHaveCount(0);
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
  await expect(video).toHaveAttribute('poster', /-dark.webp$/);
  await expect.poll(() => page.locator('.hero-poster img').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  expect(requests).toEqual([]);
  await page.getByRole('button', { name: 'Play lesson preview', exact: true }).click();
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => !element.paused)).toBe(true);
  await expect(page.getByRole('button', { name: 'Pause lesson preview', exact: true })).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(video).toHaveAttribute('autoplay', '');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(video.locator('source')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Play lesson preview', exact: true })).toBeVisible();
});

test('home keeps the calm section rhythm and illustrations fill their cards', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(async () => {
    document.querySelectorAll('img').forEach((image) => { image.loading = 'eager'; });
    await document.fonts.ready;
    await Promise.all([...document.images].map((image) => image.decode()));
  });
  const gaps = await page.locator('.home > section > .wrap').evaluateAll((wraps) => wraps.slice(1).map((wrap, i) => wrap.getBoundingClientRect().top - wraps[i].getBoundingClientRect().bottom));
  for (const gap of gaps) expect(gap).toBeCloseTo(page.viewportSize()!.width <= 600 ? 44 : 72, 0);
  for (const card of await page.locator('.inside-card').all()) {
    const box = await card.boundingBox();
    const image = await card.locator('picture').boundingBox();
    expect(image!.width).toBeCloseTo(box!.width - 2, 0);
    if (!(await card.getAttribute('class'))!.includes('inside-card-portrait')) {
      expect(image!.height).toBeCloseTo(image!.width, 0);
    } else {
      expect(image!.height).toBeGreaterThan(image!.width);
    }
  }
});
