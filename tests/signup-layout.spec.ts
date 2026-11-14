import { test, expect } from '@playwright/test';

test.describe('shared sign-up card layout', () => {
  for (const width of [1440, 820, 390]) {
    for (const colorScheme of ['light', 'dark'] as const) {
      test(`${width}px ${colorScheme}: copy and controls share one edge`, async ({ page }, testInfo) => {
        test.skip(testInfo.project.name !== 'desktop', 'Explicit viewport matrix');
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ colorScheme });
        await page.goto('/');
        const card = page.locator('.rsa-signup');
        await expect(card.locator('form')).toBeVisible();
        await page.evaluate(() => document.fonts.ready);
        const boxes = await Promise.all([
          card.locator('h2'), card.locator('.rsa-signup-copy > p').first(),
          card.locator('label[for="home-email"]'), card.locator('input[type="email"]'),
          card.locator('button[type="submit"]'), card,
        ].map(locator => locator.boundingBox()));
        expect(boxes.every(Boolean)).toBe(true);
        const [heading, body, label, input, button, band] = boxes.map(box => box!);
        for (const box of [body, label, input]) expect(Math.abs(box.x - heading.x)).toBeLessThan(1);
        expect(input.height).toBe(48);
        expect(button.height).toBe(input.height);
        if (width >= 640) {
          expect(button.y).toBe(input.y);
          expect(button.x).toBeGreaterThan(input.x + input.width);
        } else {
          expect(button.x).toBe(input.x);
          expect(button.width).toBe(input.width);
          expect(button.y - input.y - input.height).toBe(12);
        }
        // An idle challenge/status must not leave an empty block in the card.
        const bottomInset = band.y + band.height - button.y - button.height;
        expect(bottomInset).toBe(width < 768 ? 24 : 32);
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
      });
    }
  }
});
