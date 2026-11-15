import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const mediaPath = '/media/explainer/how-learning-works.mp4';

for (const path of ['/', '/courses/']) {
  test(`learning explainer waits for play and has optional English captions on ${path}`, async ({ page, request }) => {
    const videoRequests: string[] = [];
    page.on('request', req => { if (req.url().endsWith(mediaPath)) videoRequests.push(req.url()); });
    await page.goto(path);
    const video = page.locator('.learning-explainer video');
    await expect(video).toHaveCount(1);
    await expect(video).toHaveAccessibleName('How learning works here (57 s)');
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
    await video.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    expect(videoRequests).toEqual([]);
    expect(await video.evaluate((el: HTMLVideoElement) => el.paused && el.currentTime === 0 && [...el.textTracks].every(t => t.mode === 'disabled'))).toBe(true);

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

    const before = (await video.boundingBox())!;
    await video.focus();
    await video.press('Space');
    await expect.poll(() => video.evaluate((el: HTMLVideoElement) => !el.paused && el.currentTime > 0)).toBe(true);
    expect(await video.evaluate((el: HTMLVideoElement) => el.duration)).toBeCloseTo(57.33, 1);
    expect(await video.evaluate((el: HTMLVideoElement) => [...el.textTracks].every(t => t.mode === 'disabled'))).toBe(true);
    await track.evaluate((el: HTMLTrackElement) => { el.track.mode = 'showing'; });
    await expect.poll(() => track.evaluate((el: HTMLTrackElement) => el.track.cues?.length ?? 0)).toBe(14);
    await video.press('Space');
    const after = (await video.boundingBox())!;
    expect(after.width).toBeCloseTo(before.width, 1);
    expect(after.height).toBeCloseTo(before.height, 1);
  });
}

for (const width of [1440, 820, 390]) for (const theme of ['light', 'dark'] as const) {
  test(`learning explainer fits its column at ${width}, ${theme}`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Explicit viewports cover all three widths');
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
    for (const path of ['/', '/courses/']) {
      await page.goto(path);
      await page.evaluate(async () => {
        document.querySelectorAll('img').forEach(image => { image.loading = 'eager'; });
        await document.fonts.ready;
        await Promise.all([...document.images].map(image => image.decode()));
      });
      const figure = page.locator('.learning-explainer');
      const video = figure.locator('video');
      await video.scrollIntoViewIfNeeded();
      await video.evaluate((el: HTMLVideoElement) => new Promise<void>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve();
        image.onerror = () => reject(new Error('Poster failed to decode'));
        image.src = el.poster;
      }));
      // Let the native controls finish their initial poster transition.
      await page.waitForTimeout(700);
      const box = (await video.boundingBox())!;
      const column = await figure.evaluate(el => el.closest('.wrap')!.getBoundingClientRect().width - parseFloat(getComputedStyle(el.closest('.wrap')!).paddingLeft) - parseFloat(getComputedStyle(el.closest('.wrap')!).paddingRight));
      expect(box.width).toBeLessThanOrEqual(760);
      expect(box.width).toBeLessThanOrEqual(column);
      expect(box.width / box.height).toBeCloseTo(16 / 9, 3);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
      if (width === 390) expect(box.width).toBeCloseTo(column, 0);
      if (process.env.A12_SHOTS_DIR) {
        mkdirSync(process.env.A12_SHOTS_DIR, { recursive: true });
        const name = `${path === '/' ? 'home' : 'courses'}-${width}-${theme}`;
        await page.screenshot({ path: join(process.env.A12_SHOTS_DIR, `${name}.png`), fullPage: true });
        const section = path === '/' ? page.locator('.teaching-section') : page.locator('section[aria-labelledby="ladder-h"]');
        await section.screenshot({ path: join(process.env.A12_SHOTS_DIR, `${name}-section.png`) });
      }
    }
  });
}
