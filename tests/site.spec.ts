import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// The sign-up band embeds Zoho's hosted form. Tests must never reach or submit
// to Zoho: a static stub keeps rendering checks deterministic and cannot create
// contacts.
test.beforeEach(async ({ page }) => {
  await page.route('https://zgnp-zngp.maillist-manage.com/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<!doctype html><html lang="en"><head><title>Sign-up form</title></head><body><input type="email" aria-label="Email"></body></html>',
    }),
  );
});

const PAGES = [
  '/',
  '/courses/',
  '/resources/',
  '/open-source/',
  '/educators/',
  '/about/',
  '/contact/',
  '/support/',
  '/refund/',
  '/delivery/',
  '/pricing/',
  '/privacy/',
  '/terms/',
  '/thanks/',
];

for (const path of PAGES) {
  test(`page quality checks for ${path}`, async ({ page }, testInfo) => {
    try {
      // 1. Response status 200; exactly one h1
      const response = await page.goto(path);
      expect(response?.status(), `Expected status 200 for ${path}`).toBe(200);

      const h1Count = await page.locator('h1').count();
      expect(h1Count, `Expected exactly one h1 on ${path}, found ${h1Count}`).toBe(1);

      // 2. No horizontal overflow: document.documentElement.scrollWidth <= window.innerWidth
      const overflowInfo = await page.evaluate(() => {
        const scrollWidth = document.documentElement.scrollWidth;
        const innerWidth = window.innerWidth;
        const isOverflowing = scrollWidth > innerWidth;
        if (!isOverflowing) {
          return { isOverflowing: false, scrollWidth, innerWidth, offenders: [] };
        }

        const allElements = Array.from(document.querySelectorAll('*'));
        const offenders: { selector: string; right: number; width: number; text: string }[] = [];
        for (const el of allElements) {
          const rect = el.getBoundingClientRect();
          if (rect.right > innerWidth) {
            let sel = el.tagName.toLowerCase();
            if (el.id) {
              sel += `#${el.id}`;
            } else if (el.className && typeof el.className === 'string') {
              sel += `.${el.className.trim().split(/\s+/).filter(Boolean).join('.')}`;
            }
            offenders.push({
              selector: sel,
              right: Math.round(rect.right),
              width: Math.round(rect.width),
              text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 50),
            });
          }
        }
        return { isOverflowing: true, scrollWidth, innerWidth, offenders };
      });

      if (overflowInfo.isOverflowing) {
        const details = overflowInfo.offenders
          .slice(0, 15)
          .map((o) => `  - <${o.selector}> width=${o.width}px right=${o.right}px text="${o.text}"`)
          .join('\n');
        expect(
          overflowInfo.scrollWidth,
          `Horizontal overflow detected on ${path} (scrollWidth=${overflowInfo.scrollWidth}px > innerWidth=${overflowInfo.innerWidth}px).\nOffending elements:\n${details}`
        ).toBeLessThanOrEqual(overflowInfo.innerWidth);
      } else {
        expect(overflowInfo.scrollWidth).toBeLessThanOrEqual(overflowInfo.innerWidth);
      }

      // 3. No broken images: set every img to loading="eager", scroll to bottom, wait for network idle, assert naturalWidth > 0
      await page.evaluate(() => {
        const images = document.querySelectorAll('img');
        for (const img of images) {
          img.loading = 'eager';
        }
      });

      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });

      await page.waitForLoadState('networkidle');

      // Wait for all images to complete loading
      await page.evaluate(async () => {
        const imgs = Array.from(document.querySelectorAll('img'));
        await Promise.all(
          imgs.map((img) => {
            if (img.complete) return;
            return new Promise((resolve) => {
              img.addEventListener('load', resolve);
              img.addEventListener('error', resolve);
            });
          })
        );
      });

      const brokenImages = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        return images
          .filter((img) => !img.complete || img.naturalWidth === 0)
          .map((img) => ({
            src: img.currentSrc || img.src,
            alt: img.alt || '',
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
          }));
      });

      expect(
        brokenImages,
        `Broken images found on ${path}:\n${brokenImages.map((b) => `  - src="${b.src}" alt="${b.alt}" naturalWidth=${b.naturalWidth}`).join('\n')}`
      ).toEqual([]);

      // 4. Tap targets (tablet and phone only)
      const projectName = testInfo.project.name;
      if (projectName === 'tablet' || projectName === 'phone') {
        const checkTapTargets = async (stateLabel: string) => {
          const offenders = await page.evaluate(() => {
            const elements = Array.from(
              document.querySelectorAll<HTMLElement>(
                'a, button, summary, input:not([type="hidden"]), select, textarea'
              )
            );
            const issues: { selector: string; text: string; width: number; height: number }[] = [];

            for (const el of elements) {
              // Exclude inline text links (WCAG 2.5.8 inline exception): links inside <p>,
              // or inline links that sit in a sentence with other text around them
              if (el.tagName.toLowerCase() === 'a') {
                if (el.closest('p')) continue;
                const parent = el.parentElement;
                const inSentence =
                  window.getComputedStyle(el).display === 'inline' &&
                  !!parent &&
                  (parent.textContent || '').trim() !== (el.textContent || '').trim();
                if (inSentence) continue;
              }

              // Must be visible
              if (el.hasAttribute('hidden') || el.closest('[hidden]')) {
                continue;
              }
              const style = window.getComputedStyle(el);
              if (
                style.display === 'none' ||
                style.visibility === 'hidden' ||
                parseFloat(style.opacity) === 0
              ) {
                continue;
              }

              const rect = el.getBoundingClientRect();
              if (rect.width === 0 || rect.height === 0) {
                continue;
              }

              if (rect.height < 44) {
                let sel = el.tagName.toLowerCase();
                if (el.id) {
                  sel += `#${el.id}`;
                } else if (el.className && typeof el.className === 'string') {
                  sel += `.${el.className.trim().split(/\s+/).filter(Boolean).join('.')}`;
                }
                const text = (
                  el.textContent ||
                  (el as HTMLInputElement).value ||
                  (el as HTMLInputElement).placeholder ||
                  ''
                )
                  .trim()
                  .replace(/\s+/g, ' ')
                  .slice(0, 50);

                issues.push({
                  selector: sel,
                  text,
                  width: Math.round(rect.width * 100) / 100,
                  height: Math.round(rect.height * 100) / 100,
                });
              }
            }
            return issues;
          });

          if (offenders.length > 0) {
            const list = offenders
              .map((o) => `  - <${o.selector}> text="${o.text}" size=${o.width}x${o.height}px`)
              .join('\n');
            expect(
              offenders,
              `Tap targets smaller than 44px on ${path} (${projectName}, ${stateLabel}):\n${list}`
            ).toEqual([]);
          }
        };

        await checkTapTargets('default');

        if (projectName === 'phone') {
          const toggle = page.locator('.rsa-nav-toggle');
          if (await toggle.isVisible()) {
            await toggle.click();
            await page.waitForTimeout(100);
            await checkTapTargets('nav open');
            // Close nav again
            await toggle.click();
            await page.waitForTimeout(100);
          }
        }
      }

      // 5. Accessibility: @axe-core/playwright with tags wcag2a, wcag2aa, wcag21a, wcag21aa
      const axeResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      const seriousOrCritical = axeResults.violations.filter(
        (v) => v.impact === 'serious' || v.impact === 'critical'
      );

      if (seriousOrCritical.length > 0) {
        const summary = seriousOrCritical
          .map((v) => {
            const targets = v.nodes.flatMap((n) => n.target).join(', ');
            return `  - Rule ID: ${v.id} | Impact: ${v.impact} | Help: ${v.help}\n    Target selectors: ${targets}`;
          })
          .join('\n');
        expect(
          seriousOrCritical,
          `Accessibility violations with serious or critical impact on ${path} (${projectName}):\n${summary}`
        ).toEqual([]);
      }
    } finally {
      // 6. Full-page screenshot attached to the test (testInfo.attach), not a snapshot comparison
      try {
        const screenshot = await page.screenshot({ fullPage: true });
        await testInfo.attach('full-page-screenshot', {
          body: screenshot,
          contentType: 'image/png',
        });
      } catch {
        // Continue even if screenshot could not be captured
      }
    }
  });
}

test.describe('Extra tests', () => {
  test('payment pages return 200, footer links exist and /pricing/ is unlisted', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop project only');

    const paymentPages = ['/contact/', '/support/', '/refund/', '/delivery/', '/pricing/'];
    const legalLinks = [
      ['Contact', '/contact/'],
      ['Support', '/support/'],
      ['Refund', '/refund/'],
      ['Delivery', '/delivery/'],
      ['Privacy', '/privacy/'],
      ['Terms', '/terms/'],
    ];

    for (const path of paymentPages) {
      const response = await page.goto(path);
      expect(response?.status(), `Expected status 200 for ${path}`).toBe(200);
      for (const [label, href] of legalLinks) {
        const link = page.locator(`footer a[href="${href}"]`);
        await expect(link, `Footer ${label} link missing on ${path}`).toHaveCount(1);
        await expect(link).toHaveText(label);
      }
    }

    // The unlisted pricing page must not be linked from any page.
    for (const path of [...PAGES, ...paymentPages]) {
      await page.goto(path);
      const pricingLinks = await page.locator('a[href="/pricing/"]').count();
      expect(pricingLinks, `${path} links to the unlisted /pricing/ page`).toBe(0);
    }

    // /pricing/ is noindex and absent from the sitemap.
    await page.goto('/pricing/');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
    const sitemap = await page.request.get('/sitemap-0.xml');
    expect(sitemap.status()).toBe(200);
    expect(await sitemap.text()).not.toContain('/pricing/');
  });

  test('404 page returns 404 and shows "Page not found" h1', async ({ page }) => {
    const response = await page.goto('/does-not-exist/');
    expect(response?.status()).toBe(404);
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
    await expect(h1).toHaveText('Page not found');
  });

  test('phone menu toggle', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'phone', 'Phone project only');
    await page.goto('/');

    const toggle = page.locator('.rsa-nav-toggle');
    const navLinks = page.locator('.rsa-nav-links');

    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(navLinks).toBeHidden();

    await toggle.click();

    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(toggle).toHaveText('Close');
    await expect(navLinks).toBeVisible();
  });

  test('sign-up band embeds the Zoho hosted form', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop project only');
    await page.goto('/');

    const iframe = page.locator('iframe[data-signup-embed]');
    await expect(iframe).toHaveCount(1);
    await expect(iframe).toHaveAttribute('title', 'Sign up for Rsquared Academy updates');
    await expect(iframe).toHaveAttribute('loading', 'lazy');
    await expect(iframe).toHaveAttribute(
      'src',
      /^https:\/\/zgnp-zngp\.maillist-manage\.com\/ua\/Optin\?/,
    );
    await expect(iframe).toBeVisible();

    const box = await iframe.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(310);
    expect(box!.height).toBe(320);

    const borderWidth = await iframe.evaluate((el) => getComputedStyle(el).borderTopWidth);
    expect(borderWidth).toBe('0px');

    // The old site-kit form and script are gone.
    await expect(page.locator('form[data-rsa-signup]')).toHaveCount(0);
    expect(await page.locator('script[src*="rsa-signup"]').count()).toBe(0);
  });

  test('sign-up embed tracks first interaction', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop project only');
    await page.addInitScript(() => {
      (window as any).__gaEvents = [];
      (window as any).gtag = (...args: unknown[]) => {
        (window as any).__gaEvents.push(args);
      };
    });
    await page.goto('/');

    await page.frameLocator('iframe[data-signup-embed]').locator('input[type="email"]').click();

    await expect.poll(async () =>
      page.evaluate(
        () =>
          ((window as any).__gaEvents as unknown[][]).filter(
            (args) => args[1] === 'signup_embed_interact',
          ).length,
      ),
    ).toBe(1);

    const event = await page.evaluate(
      () =>
        ((window as any).__gaEvents as unknown[][]).find(
          (args) => args[1] === 'signup_embed_interact',
        ),
    );
    expect(event?.[2]).toMatchObject({
      event_category: 'signup',
      event_label: 'www.rsquaredacademy.com',
    });

    // Interacting again must not send a second event.
    await page.frameLocator('iframe[data-signup-embed]').locator('input[type="email"]').click();
    await page.waitForTimeout(100);
    expect(
      await page.evaluate(
        () =>
          ((window as any).__gaEvents as unknown[][]).filter(
            (args) => args[1] === 'signup_embed_interact',
          ).length,
      ),
    ).toBe(1);
  });

  test('educators form validation and submission', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop project only');
    await page.goto('/educators/');

    const form = page.locator('form[name="educators"]');
    const submitBtn = form.locator('button[type="submit"]');
    const nameInput = page.locator('#ed-name');
    const emailInput = page.locator('#ed-email');
    const instInput = page.locator('#ed-inst');
    const alert = page.locator('#form-error-summary');

    // Submitting empty
    await submitBtn.click();

    await expect(alert).toBeVisible();
    await expect(alert).toHaveText('Please fill in the fields marked below.');
    await expect(nameInput).toHaveAttribute('aria-invalid', 'true');
    await expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    await expect(instInput).toHaveAttribute('aria-invalid', 'true');
    await expect(nameInput).toBeFocused();

    // Fill valid values
    await nameInput.fill('Jane Doe');
    await emailInput.fill('jane@university.edu');
    await instInput.fill('State University');

    let requestBody: string | null = null;
    await page.route('**/thanks/', async (route) => {
      const req = route.request();
      requestBody = req.postData();
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<!DOCTYPE html><html><body><h1>Thank you</h1></body></html>',
      });
    });

    await submitBtn.click();

    await expect.poll(() => requestBody).not.toBeNull();
    expect(requestBody).toContain('form-name=educators');
  });

  // Cards in the same row must line up section by section (badges, title, description, link)
  const alignmentCases = [
    { path: '/', grid: '.rsa-card-grid', parts: ['.rsa-card-title', '.rsa-card-text'] },
    { path: '/courses/', grid: '.rsa-card-grid', parts: ['.rsa-card-title', '.rsa-card-text'] },
    { path: '/educators/', grid: '.rsa-card-grid', parts: ['.rsa-card-title', '.rsa-card-text'] },
    { path: '/', grid: '.res-grid', parts: [':scope > :nth-child(2)', ':scope > :nth-child(3)'] },
  ];
  for (const { path, grid, parts } of alignmentCases) {
    test(`card sections align across a row: ${grid} on ${path}`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name === 'phone', 'Cards stack in one column on phones');
      await page.goto(path);
      const misaligned = await page.evaluate(({ grid, parts }) => {
        const cards = Array.from(document.querySelector(grid)!.children) as HTMLElement[];
        // group cards by row (same top edge)
        const rows = new Map<number, HTMLElement[]>();
        for (const c of cards) {
          const top = Math.round(c.getBoundingClientRect().top);
          rows.set(top, [...(rows.get(top) || []), c]);
        }
        const issues: string[] = [];
        for (const row of rows.values()) {
          if (row.length < 2) continue;
          for (const part of parts) {
            const tops = row.map((c) => Math.round(c.querySelector(part)!.getBoundingClientRect().top));
            if (Math.max(...tops) - Math.min(...tops) > 1) issues.push(`${part}: tops ${tops.join(', ')}`);
          }
        }
        return issues;
      }, { grid, parts });
      expect(misaligned, `Misaligned card sections in ${grid} on ${path}`).toEqual([]);
    });
  }
});
