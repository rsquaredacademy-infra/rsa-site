import { test, expect } from '@playwright/test';
import sqlPlan from '../public/images/home/sql-plan.json' with { type: 'json' };

for (const width of [1280, 820, 390]) for (const theme of ['light', 'dark'] as const) {
  test(`inside cards share row heights and preserve image aspect at ${width}, ${theme}`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Explicit viewports cover desktop, tablet and phone');
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
    await page.goto('/');
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.querySelectorAll<HTMLImageElement>('#inside img')].map(image => {
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
    expect(cards).toHaveLength(6);
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
    expect(rows.size).toBe(cards.length / columns);
    for (const row of rows.values()) {
      expect(row).toHaveLength(columns);
      const maxHeight = Math.max(...row.map(index => cards[index].height));
      for (const index of row) {
        expect(Math.abs(cards[index].height - maxHeight), `${cards[index].src}: row height`).toBeLessThanOrEqual(1);
      }
      for (const part of ['top', 'heading', 'description', 'bottom'] as const) aligned(row, part);
    }
    if (width <= 600) for (let i = 1; i < cards.length; i++) expect(cards[i].top - cards[i - 1].bottom).toBeCloseTo(32, 0);

    const wideCards = page.locator('#inside .inside-wide');
    await expect(wideCards).toHaveCount(2);
    await expect(wideCards.nth(0).locator('h3')).toHaveText('See what you’ll build');
    await expect(wideCards.nth(1).locator('h3')).toHaveText('Plan the query, then see what it did');
    const sqlCard = wideCards.nth(1);
    await expect(sqlCard.locator('.inside-wide-points li')).toHaveCount(3);
    const image = await sqlCard.locator('img').evaluate((img: HTMLImageElement) => ({
      src: img.currentSrc, alt: img.alt, width: img.getBoundingClientRect().width,
      height: img.getBoundingClientRect().height, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight,
    }));
    const capture = sqlPlan.captures.find(capture => capture.theme === theme && capture.layout === (width <= 600 ? 'phone' : 'wide'))!;
    expect(image.src).toMatch(new RegExp(`lesson-sql-plan${width <= 600 ? '-phone' : ''}${theme === 'dark' ? '-dark' : ''}\\.webp$`));
    expect(image.alt).toContain('First six visits');
    expect(image.alt).toContain('LIMIT 6');
    expect(image.naturalWidth).toBe(capture.width);
    expect(image.naturalHeight).toBe(capture.height);
    expect(image.width / image.height).toBeCloseTo(capture.width / capture.height, 3);
    // Production font size × capture pixels/CSS px × rendered image scale.
    const smallestText = Math.min(...capture.cards.map(card =>
      card.smallestTextCssPx * card.pixelWidth / card.cssWidth * image.width / capture.width));
    expect(smallestText).toBeGreaterThanOrEqual(12);
    if (width === 1280) {
      const picture = (await sqlCard.locator('picture').boundingBox())!;
      const text = (await sqlCard.locator('.inside-wide-text').boundingBox())!;
      expect(picture.x + picture.width).toBeLessThan(text.x);
    }
  });
}
