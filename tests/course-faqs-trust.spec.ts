import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import snapshot from '../src/data/trust-signals.json' with { type: 'json' };
import { ebooks } from '../src/data/ebooks';
import { packageGroups } from '../src/data/packages';

const courses = [
  { slug: 'intro-r', id: 'intro', firstLesson: 'why-r', name: 'Intro to R' },
  { slug: 'dplyr', id: 'dplyr', firstLesson: 'why-wrangle', name: 'dplyr' },
  { slug: 'ggplot2', id: 'ggplot2', firstLesson: 'why-visualise', name: 'ggplot2' },
];

for (const course of courses) {
  test(`${course.slug}: FAQ schema matches the accessible answers and launch decisions`, async ({ page }) => {
    const path = `/courses/${course.slug}/`;
    expect((await page.goto(path))?.status()).toBe(200);
    const script = page.locator('script[type="application/ld+json"]');
    await expect(script).toHaveCount(1);
    const schema = JSON.parse((await script.textContent())!);
    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('FAQPage');
    expect(schema.mainEntity).toHaveLength(8);
    expect(schema.mainEntity.map((entity: { name: string }) => entity.name)).toEqual([
      `Is the ${course.name} course free?`,
      'Do I need to install R?',
      'How long does it take?',
      'Do I get a certificate?',
      'Is it for complete beginners?',
      'What comes after this course?',
      'Can I use it on my phone?',
      'Do I need to sign up to start?',
    ]);
    const details = page.locator('#course-faq details');
    for (const [index, entity] of schema.mainEntity.entries()) {
      expect(entity['@type']).toBe('Question');
      expect(entity.acceptedAnswer['@type']).toBe('Answer');
      expect(typeof entity.acceptedAnswer.text).toBe('string');
      expect(entity.acceptedAnswer.text.length).toBeGreaterThan(0);
      const item = details.nth(index);
      await expect(item.locator('summary')).toHaveText(entity.name);
      if (!(await item.evaluate((el) => (el as HTMLDetailsElement).open))) {
        await item.locator('summary').click();
      }
      await expect(item.locator('p')).toBeVisible();
      await expect(item.locator('p')).toHaveText(entity.acceptedAnswer.text);
    }
    const answers = await page.locator('#course-faq').innerText();
    expect(answers).toContain('free forever');
    expect(answers).toContain('Not yet. We do not currently issue a certificate');
    expect(answers).toContain('December 2026');
    expect(answers).toContain('26 January 2027');
    expect(answers).toContain('about 3 hours, at your own pace');
    const faqWidth = await page.locator('.faq-content').evaluate((el) => el.getBoundingClientRect().width);
    expect(faqWidth).toBeLessThanOrEqual(760);
    for (const answer of await details.locator('p').all()) {
      expect(await answer.evaluate((el) => el.getBoundingClientRect().width)).toBe(faqWidth);
    }
    expect(answers).not.toMatch(/₹|\$|\b(?:INR|USD)\b/);
    if (course.id !== 'intro') expect(answers).toContain('take our free Introduction to R course first');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://www.rsquaredacademy.com${path}`);
    const start = page.getByRole('link', { name: 'Start lesson 1 now — no sign-up', exact: true });
    const url = new URL((await start.getAttribute('href'))!);
    expect(url.origin).toBe('https://app.rsquaredacademy.com');
    expect(url.pathname).toBe(`/${course.slug}/${course.firstLesson}`);
    expect(url.searchParams.get('utm_content')).toBe(`course-${course.id}`);

    // Native disclosure remains usable from a keyboard, with no custom script.
    const summary = details.first().locator('summary');
    await summary.focus();
    await page.keyboard.press('Enter');
    await expect(details.first().locator('p')).toBeHidden();
    await page.keyboard.press('Space');
    await expect(details.first().locator('p')).toBeVisible();
  });
}

test('catalogue exposes FAQ pages and preserves A1 direct lesson CTAs', async ({ page }) => {
  await page.goto('/courses/');
  for (const course of courses) {
    const card = page.locator('section[aria-labelledby="found-h"] .rsa-card').nth(courses.indexOf(course));
    await expect(card.locator('.rsa-card-title a')).toHaveAttribute('href', `/courses/${course.slug}/`);
    const href = await card.getByRole('link', { name: /Start lesson 1 now/ }).getAttribute('href');
    const url = new URL(href!);
    expect(url.pathname).toBe(`/${course.slug}/${course.firstLesson}`);
    expect(Object.fromEntries(url.searchParams)).toEqual({
      utm_source: 'www', utm_medium: 'cta', utm_campaign: 'start-lesson-1', utm_content: `course-${course.id}`,
    });
  }
  await page.goto('/');
  const hero = page.getByRole('link', { name: 'Start lesson 1 now — no sign-up', exact: true });
  const url = new URL((await hero.getAttribute('href'))!);
  expect(url.pathname).toBe('/intro-r/why-r');
  expect(url.searchParams.get('utm_content')).toBe('hero');
});

test('trust figures have consistent totals, package coverage and public source links', async ({ page }) => {
  expect(new Set(snapshot.cran.packages.map((pkg) => pkg.package))).toEqual(
    new Set(packageGroups.flatMap((group) => group.pkgs.map((pkg) => pkg.name))),
  );
  expect(snapshot.cran.total).toBe(snapshot.cran.packages.reduce((total, pkg) => total + pkg.downloads, 0));
  for (const pkg of snapshot.cran.packages) {
    expect(Number.isSafeInteger(pkg.downloads)).toBe(true);
    expect(pkg.downloads).toBeGreaterThanOrEqual(0);
  }
  for (const path of ['/', '/about/']) {
    await page.goto(path);
    const trust = page.locator('#trust-signals');
    await expect(trust.getByRole('heading', { name: '2.9 million downloads', exact: true })).toBeVisible();
    await expect(trust).toContainText('Learn from an experienced data science consultant, author of popular R packages and eBooks');
    await expect(trust).toContainText('CRAN downloads, all time');
    await expect(trust).toContainText('Posit CRAN mirror only');
    await expect(trust).toContainText('Downloads are not a count of people');
    await expect(trust.locator(`a[href="${snapshot.cran.source}"]`)).toHaveCount(1);
    await expect(trust).toContainText(`${ebooks.length} public eBooks`);
    for (const book of ebooks) {
      await expect(trust.getByRole('link', { name: `${book.title} eBook cover`, exact: true })).toHaveAttribute('href', book.web);
      await expect(trust.getByRole('img', { name: `${book.title} eBook cover`, exact: true })).toHaveAttribute('src', book.cover);
    }
    for (const pkg of packageGroups.flatMap((group) => group.pkgs)) {
      await expect(trust.getByRole('link', { name: `${pkg.name} R package logo`, exact: true })).toHaveAttribute('href', pkg.docs);
      await expect(trust.getByRole('img', { name: `${pkg.name} R package logo`, exact: true })).toHaveAttribute('src', pkg.hex);
    }
    await expect(trust.locator('img')).toHaveCount(16);
    await trust.scrollIntoViewIfNeeded();
    await expect.poll(() => trust.locator('img').evaluateAll((images) => images.every((img) => {
      const image = img as HTMLImageElement;
      return image.complete && image.naturalWidth > 0 && image.hasAttribute('width') && image.hasAttribute('height');
    }))).toBe(true);
    await expect(trust).not.toContainText('YouTube');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width);
  }
});

test('capture FAQ and trust sections for review', async ({ page }, testInfo) => {
  const output = process.env.A4A5_SHOTS;
  test.skip(!output || testInfo.project.name !== 'desktop', 'Set A4A5_SHOTS to capture review images');
  await mkdir(output!, { recursive: true });
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/courses/intro-r/');
    await page.addStyleTag({ content: 'astro-dev-toolbar { display: none !important; }' });
    await page.locator('#course-faq details').evaluateAll((items) => items.forEach((el) => { (el as HTMLDetailsElement).open = true; }));
    await page.evaluate(() => document.fonts.ready);
    await page.locator('#course-faq').screenshot({ path: join(output!, `intro-r-faq-${width}.png`) });
    await page.goto('/');
    await page.addStyleTag({ content: 'astro-dev-toolbar { display: none !important; }' });
    await page.evaluate(() => document.fonts.ready);
    await page.locator('#trust-signals img').evaluateAll(async (images) => {
      await Promise.all(images.map(async (el) => {
        const image = el as HTMLImageElement;
        image.loading = 'eager';
        await image.decode();
      }));
    });
    await page.locator('#trust-signals').screenshot({ path: join(output!, `trust-${width}.png`) });
  }
});
