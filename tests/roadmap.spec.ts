import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
const captures: { captures: { file: string; smallestTextCssPx: number; deviceScaleFactor: number; width: number }[] } =
  JSON.parse(readFileSync(new URL('../public/images/roadmap/captures.json', import.meta.url), 'utf8'));

for (const width of [390, 820, 1280]) {
  for (const colorScheme of ['light', 'dark'] as const) {
    test(`roadmap: ${width}px ${colorScheme}, readable crops and aligned cards`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== 'desktop', 'Explicit viewport matrix');
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme });
      await page.goto('/roadmap/');
      await page.evaluate(async () => {
        document.querySelectorAll('img').forEach(image => { image.loading = 'eager'; });
        await document.fonts.ready;
        await Promise.all([...document.images].map(image => image.decode()));
      });
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      await expect(page.getByRole('link', { name: 'Suggest a topic or feature' })).toHaveAttribute('href', 'https://app.rsquaredacademy.com/intro-r#feedback-title');
      await expect(page.getByRole('progressbar', { name: '9 of 11 lessons live' })).toHaveAttribute('value', '9');

      const stops = await page.locator('.track-stop').evaluateAll(elements => elements.map(element => {
        const rect = element.getBoundingClientRect(); return { x: rect.x, y: rect.y };
      }));
      if (width === 390) expect(new Set(stops.map(stop => stop.x)).size).toBe(1);
      else expect(new Set(stops.map(stop => stop.y)).size).toBe(1);
      for (const link of await page.locator('.roadmap-track a').all()) {
        const href = await link.getAttribute('href');
        await expect(page.locator(href!)).toBeVisible();
      }
      const images = await page.locator('.feature-picture img').evaluateAll(elements => elements.map(element => {
        const image = element as HTMLImageElement;
        return { file: image.currentSrc.split('/').pop(), width: image.getBoundingClientRect().width };
      }));
      for (const image of images) {
        const capture = captures.captures.find(capture => capture.file === image.file)!;
        expect(capture.smallestTextCssPx * capture.deviceScaleFactor * image.width / capture.width, image.file).toBeGreaterThanOrEqual(12);
      }
      const rows = await page.locator('.course-grid, .feature-grid').evaluateAll(grids => grids.flatMap(grid => {
        const grouped = new Map<number, number[]>();
        for (const card of grid.children) {
          const top = Math.round(card.getBoundingClientRect().top);
          const row = grouped.get(top) ?? [];
          row.push(card.querySelector('h4')!.getBoundingClientRect().top);
          grouped.set(top, row);
        }
        return [...grouped.values()];
      }));
      for (const row of rows) expect(Math.max(...row) - Math.min(...row)).toBeLessThan(1);
      expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()).violations).toEqual([]);
    });
  }
}
