import { test, expect } from '@playwright/test';

for (const width of [1440, 820, 390]) for (const theme of ['light', 'dark'] as const) {
  test(`inside cards share row heights and preserve image aspect at ${width}, ${theme}`, async ({ page }, testInfo) => {
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
      const rendered = image.getBoundingClientRect();
      const heading = title.getBoundingClientRect();
      const text = description.getBoundingClientRect();
      return {
        top: box.top, bottom: box.bottom, heading: heading.top, description: text.top,
        width: box.width, height: box.height, left: box.left, mediaWidth: media.width, mediaHeight: media.height,
        imageWidth: rendered.width, imageHeight: rendered.height,
        mediaInset: media.left - box.left, titleInset: heading.left + parseFloat(getComputedStyle(title).paddingLeft) - box.left,
        gaps: [heading.top - media.bottom, text.top - heading.bottom],
        tail: box.bottom - text.bottom, src: image.currentSrc,
        naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight,
        objectFit: getComputedStyle(image).objectFit,
      };
    }));
    expect(cards).toHaveLength(7);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    const grid = (await page.locator('.inside-grid').boundingBox())!;
    for (const card of cards) {
      expect(card.mediaWidth).toBeCloseTo(card.width - 2, 0);
      expect(card.mediaInset).toBeCloseTo(1, 0);
      expect(card.titleInset).toBeCloseTo(19, 0);
      card.gaps.forEach(gap => expect(gap).toBeCloseTo(10, 0));
      expect(card.tail).toBeCloseTo(19, 0);
      expect(card.src).toMatch(new RegExp(`${theme === 'dark' ? '-dark' : ''}\\.webp$`));
      expect(card.objectFit).toBe('cover');
      expect(card.naturalWidth).toBeGreaterThan(0);
      expect(card.naturalHeight).toBeGreaterThan(0);
      expect(card.mediaHeight).toBeCloseTo(card.mediaWidth, 0);
      expect(card.imageWidth).toBeCloseTo(card.mediaWidth, 0);
      expect(card.imageHeight).toBeCloseTo(card.mediaHeight, 0);
      // Compare intrinsic aspect with the rendered box. These square captures
      // need no content crop; cover also preserves scale if the box changes.
      const naturalAspect = card.naturalWidth / card.naturalHeight;
      expect(card.imageWidth / card.imageHeight).toBeCloseTo(naturalAspect, 3);
      const scale = Math.max(card.imageWidth / card.naturalWidth, card.imageHeight / card.naturalHeight);
      const renderedWidth = card.naturalWidth * scale;
      const renderedHeight = card.naturalHeight * scale;
      expect(renderedWidth / renderedHeight).toBeCloseTo(naturalAspect, 5);
      expect(renderedWidth + 1).toBeGreaterThanOrEqual(card.mediaWidth);
      expect(renderedHeight + 1).toBeGreaterThanOrEqual(card.mediaHeight);
      if (width <= 600) {
        expect(card.width).toBeCloseTo(grid.width, 0);
        expect(card.left).toBeCloseTo(grid.x, 0);
      }
    }
    const aligned = (indices: number[], part: 'top' | 'bottom' | 'heading' | 'description') => {
      const values = indices.map(index => cards[index][part]);
      expect(Math.max(...values) - Math.min(...values)).toBeLessThan(1);
    };
    const rows = new Map<number, number[]>();
    cards.forEach((card, index) => {
      const top = Math.round(card.top);
      rows.set(top, [...(rows.get(top) ?? []), index]);
    });
    const columns = width > 1100 ? 3 : width > 600 ? 2 : 1;
    expect(rows.size).toBe(Math.ceil(cards.length / columns));
    for (const [rowIndex, row] of [...rows.values()].entries()) {
      expect(row).toHaveLength(Math.min(columns, cards.length - rowIndex * columns));
      const maxHeight = Math.max(...row.map(index => cards[index].height));
      for (const index of row) {
        expect(Math.abs(cards[index].height - maxHeight), `${cards[index].src}: row height`).toBeLessThanOrEqual(1);
      }
      for (const part of ['top', 'heading', 'description', 'bottom'] as const) aligned(row, part);
    }
    if (width <= 600) for (let i = 1; i < cards.length; i++) expect(cards[i].top - cards[i - 1].bottom).toBeCloseTo(32, 0);
  });
}
