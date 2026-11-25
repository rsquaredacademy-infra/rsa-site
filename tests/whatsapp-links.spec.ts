import { test, expect } from '@playwright/test';

const URL_EXPECTED =
  'https://wa.me/916361750386?text=Hi%2C%20I%20have%20a%20question%20about%20Rsquared%20Academy%20courses';

const CHANNEL = 'https://whatsapp.com/channel/0029Vb9cKd7ISTkRY5ThKX0u';

const pages = ['/', '/courses/', '/roadmap/', '/pricing/', '/about/', '/contact/', '/educators/', '/how-we-teach/', '/resources/', '/open-source/', '/help/', '/privacy/', '/terms/', '/refund/', '/delivery/', '/support/'];

for (const path of pages) {
  test(`WhatsApp links on ${path}`, async ({ page }) => {
    await page.goto(path);
    const footer = page.locator('footer a', { hasText: /^WhatsApp$/ });
    await expect(footer).toHaveCount(1);
    await expect(footer).toHaveAttribute('href', URL_EXPECTED);
    await expect(page.locator('footer a', { hasText: /^WhatsApp channel$/ })).toHaveAttribute('href', CHANNEL);
    expect(await page.locator('a[href^="tel:"]').count()).toBe(0);
    const all = await page.locator('a[href*="wa.me"]').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
    for (const h of all) expect(h).toBe(URL_EXPECTED);
  });
}

test('Contact page and Help FAQ use the same URL', async ({ page }) => {
  await page.goto('/contact/');
  await expect(page.locator('main a[href*="wa.me"]')).toHaveAttribute('href', URL_EXPECTED);
  await page.goto('/help/');
  await expect(page.locator('main a[href*="wa.me"]')).toHaveAttribute('href', URL_EXPECTED);
});
