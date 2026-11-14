import { test, expect } from '@playwright/test';

for (const width of [1440, 820, 390]) for (const theme of ['light', 'dark'] as const) {
  test(`inside bento keeps full media and aligned text at ${width}, ${theme}`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Explicit viewports cover desktop, tablet and phone');
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
    await page.goto('/');
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.querySelectorAll<HTMLImageElement>('.inside-card img')].map(image => {
        image.loading = 'eager';
        return image.decode();
      }));
    });
    const cards = await page.locator('.inside-card').evaluateAll(elements => elements.map(card => {
      const picture = card.querySelector('picture')!;
      const image = card.querySelector('img')!;
      const title = card.querySelector('h3')!;
      const description = card.querySelector('.t-muted')!;
      const box = card.getBoundingClientRect();
      const media = picture.getBoundingClientRect();
      const heading = title.getBoundingClientRect();
      const text = description.getBoundingClientRect();
      return {
        top: box.top, bottom: box.bottom, heading: heading.top, description: text.top,
        width: box.width, mediaWidth: media.width, mediaHeight: media.height,
        mediaInset: media.left - box.left, titleInset: heading.left + parseFloat(getComputedStyle(title).paddingLeft) - box.left,
        gaps: [heading.top - media.bottom, text.top - heading.bottom],
        tail: box.bottom - text.bottom, src: image.currentSrc,
        naturalRatio: image.naturalHeight / image.naturalWidth,
        objectFit: getComputedStyle(image).objectFit,
      };
    }));
    expect(cards).toHaveLength(6);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    for (const [index, card] of cards.entries()) {
      expect(card.mediaWidth).toBeCloseTo(card.width - 2, 0);
      expect(card.mediaInset).toBeCloseTo(1, 0);
      expect(card.titleInset).toBeCloseTo(19, 0);
      card.gaps.forEach(gap => expect(gap).toBeCloseTo(10, 0));
      expect(card.tail).toBeCloseTo(19, 0);
      expect(card.src).toMatch(new RegExp(`${theme === 'dark' ? '-dark' : ''}\\.webp$`));
      expect(card.objectFit).toBe('contain');
      if (index < 4) expect(card.mediaHeight).toBeCloseTo(card.mediaWidth, 0);
      else {
        expect(card.src).toContain('-portrait');
        expect(card.naturalRatio).toBeGreaterThan(2);
        expect(card.mediaHeight).toBeGreaterThan(card.mediaWidth);
        if (width <= 600) expect(card.mediaHeight).toBeLessThanOrEqual(640);
      }
    }
    const aligned = (indices: number[], part: 'top' | 'bottom' | 'heading' | 'description') => {
      const values = indices.map(index => cards[index][part]);
      expect(Math.max(...values) - Math.min(...values)).toBeLessThan(1);
    };
    if (width > 1100) {
      aligned([0, 1, 4, 5], 'top');
      aligned([2, 3], 'top');
      for (const part of ['heading', 'description', 'bottom'] as const) aligned([2, 3, 4, 5], part);
    } else if (width > 600) {
      for (const pair of [[0, 1], [2, 3], [4, 5]]) {
        for (const part of ['top', 'heading', 'description', 'bottom'] as const) aligned(pair, part);
      }
    } else for (let i = 1; i < cards.length; i++) expect(cards[i].top - cards[i - 1].bottom).toBeCloseTo(32, 0);
  });
}
