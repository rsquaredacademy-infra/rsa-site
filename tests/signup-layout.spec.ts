import { test, expect } from '@playwright/test';

test.describe('shared two-column sign-up band', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Explicit viewport matrix');
  });

  for (const width of [1440, 820, 768, 390]) {
    for (const colorScheme of ['light', 'dark'] as const) {
      test(`${width}px ${colorScheme}: bounded controls and aligned labels`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ colorScheme });
        await page.route('https://challenges.cloudflare.com/**', route => route.abort());
        // Cover every placement, including the longer re-permission copy.
        for (const path of ['/', '/about/', '/stay-subscribed/']) {
          await page.goto(path);
          const band = page.locator('#signup');
          const panel = band.locator('.rsa-signup');
          await expect(panel.locator('form')).toBeVisible();
          await page.evaluate(() => document.fonts.ready);
          const boxes = await Promise.all([
            panel.locator('h2'), panel.locator('.rsa-signup-copy > p').first(),
            panel.locator('.rsa-signup-field label'), panel.locator('input[type="email"]'),
            panel.locator('button[type="submit"]'), panel,
            panel.locator('.rsa-signup-copy'), panel.locator('form'),
          ].map(locator => locator.boundingBox()));
          expect(boxes.every(Boolean)).toBe(true);
          const [heading, body, label, input, button, container, copy, form] = boxes.map(box => box!);
          const rem = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize));
          expect(Math.abs(body.x - heading.x)).toBeLessThan(1);
          expect(Math.abs(label.x - input.x)).toBeLessThan(1);
          expect(input.width).toBeLessThanOrEqual(26 * rem);
          expect(input.height).toBeGreaterThanOrEqual(44);
          expect(button.height).toBe(input.height);
          expect(button.width).toBeGreaterThanOrEqual(44);
          if (width >= 600) {
            expect(input.width).toBe(22 * rem);
            expect(button.y).toBe(input.y);
            expect(button.x).toBeGreaterThan(input.x + input.width);
          } else {
            expect(button.x).toBe(input.x);
            expect(button.width).toBe(input.width);
            expect(button.y - input.y - input.height).toBe(12);
          }
          if (width === 1440) {
            expect(input.x).toBeGreaterThan(copy.x + copy.width);
            expect(Math.abs(copy.y + copy.height / 2 - form.y - form.height / 2)).toBeLessThan(1);
            if (path !== '/stay-subscribed/') {
              const lineHeight = await panel.locator('.rsa-signup-copy > p').first().evaluate(el => parseFloat(getComputedStyle(el).lineHeight));
              expect(body.height).toBe(lineHeight);
            }
          } else {
            expect(Math.abs(input.x - heading.x)).toBeLessThan(1);
            // An idle challenge/status leaves no empty block below the controls.
            const bottomInset = container.y + container.height - button.y - button.height;
            expect(bottomInset).toBe(width < 768 ? 24 : 32);
          }
          expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
          // Focus remains visible in both themes.
          for (const control of [panel.locator('input[type="email"]'), panel.locator('button[type="submit"]')]) {
            await control.focus();
            const ring = await control.evaluate(el => {
              const style = getComputedStyle(el);
              return { width: style.outlineWidth, style: style.outlineStyle, color: style.outlineColor };
            });
            expect(ring.width).toBe('2px');
            expect(ring.style).toBe('solid');
            expect(ring.color).not.toBe('rgba(0, 0, 0, 0)');
          }
        }
      });
    }
  }

  for (const width of [768, 820, 390]) {
    for (const colorScheme of ['light', 'dark'] as const) {
      test(`${width}px ${colorScheme}: Home, Courses and About have no horizontal overflow`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ colorScheme });
        for (const path of ['/', '/courses/', '/about/']) {
          await page.goto(path);
          await page.evaluate(() => document.fonts.ready);
          expect(await page.evaluate(() => document.documentElement.scrollWidth), path).toBeLessThanOrEqual(width);
        }
      });
    }
  }
});
