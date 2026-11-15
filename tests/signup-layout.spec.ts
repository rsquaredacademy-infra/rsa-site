import { test, expect } from '@playwright/test';

test.describe('shared sign-up band options', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Explicit viewport matrix');
  });

  for (const option of ['a', 'b']) {
    for (const width of [1440, 820, 390]) {
      for (const colorScheme of ['light', 'dark'] as const) {
        test(`${option.toUpperCase()} ${width}px ${colorScheme}: bounded controls and aligned labels`, async ({ page }) => {
          await page.setViewportSize({ width, height: 900 });
          await page.emulateMedia({ colorScheme });
          // Cover every placement, including the longer re-permission copy.
          for (const path of ['/', '/about/', '/stay-subscribed/']) {
            await page.goto(`${path}?signup=${option}`);
            const band = page.locator('#signup');
            const card = band.locator('.rsa-signup');
            await expect(band).toHaveAttribute('data-signup-layout', option);
            await expect(card.locator('form')).toBeVisible();
            await page.evaluate(() => document.fonts.ready);
            const boxes = await Promise.all([
              card.locator('h2'), card.locator('.rsa-signup-copy > p').first(),
              card.locator('.rsa-signup-field label'), card.locator('input[type="email"]'),
              card.locator('button[type="submit"]'), card,
              card.locator('.rsa-signup-copy'), card.locator('form'), band,
            ].map(locator => locator.boundingBox()));
            expect(boxes.every(Boolean)).toBe(true);
            const [heading, body, label, input, button, panel, copy, form, outer] = boxes.map(box => box!);
            const rem = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize));
            expect(Math.abs(body.x - heading.x)).toBeLessThan(1);
            expect(Math.abs(label.x - input.x)).toBeLessThan(1);
            expect(input.width).toBeLessThanOrEqual(26 * rem);
            expect(input.height).toBe(48);
            expect(button.height).toBe(input.height);
            if (width >= 600) {
              expect(input.width).toBe(22 * rem);
              expect(button.y).toBe(input.y);
              expect(button.x).toBeGreaterThan(input.x + input.width);
            } else {
              expect(button.x).toBe(input.x);
              expect(button.width).toBe(input.width);
              expect(button.y - input.y - input.height).toBe(12);
            }
            if (option === 'a' && width === 1440) {
              expect(input.x).toBeGreaterThan(copy.x + copy.width);
              expect(Math.abs(copy.y + copy.height / 2 - form.y - form.height / 2)).toBeLessThan(1);
              if (path !== '/stay-subscribed/') {
                const lineHeight = await card.locator('.rsa-signup-copy > p').first().evaluate(el => parseFloat(getComputedStyle(el).lineHeight));
                expect(body.height).toBe(lineHeight);
              }
            } else {
              expect(Math.abs(input.x - heading.x)).toBeLessThan(1);
              // An idle challenge/status leaves no empty block below the controls.
              const bottomInset = panel.y + panel.height - button.y - button.height;
              expect(bottomInset).toBe((width < 768 ? 24 : 32) + (option === 'b' ? 1 : 0));
            }
            if (option === 'b') {
              expect(panel.width).toBeLessThanOrEqual(36 * rem);
              expect(Math.abs(panel.x + panel.width / 2 - outer.x - outer.width / 2)).toBeLessThan(1);
            }
            expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
            // Focus remains visible with either theme and layout.
            await page.route('https://challenges.cloudflare.com/**', route => route.abort());
            for (const control of [card.locator('input[type="email"]'), card.locator('button[type="submit"]')]) {
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
  }

  test('missing or unknown flag defaults to A', async ({ page }) => {
    for (const query of ['', '?signup=a', '?signup=unknown']) {
      await page.goto(`/${query}`);
      await expect(page.locator('#signup')).toHaveAttribute('data-signup-layout', 'a');
    }
  });
});
