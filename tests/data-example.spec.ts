import { test, expect } from '@playwright/test';

test('course example tabs support pointer and keyboard selection', async ({ page }) => {
  await page.goto('/how-we-teach/');
  const tabs = page.getByRole('tab');
  const panel = page.getByRole('tabpanel');
  await expect(tabs).toHaveCount(3);
  await expect(panel).toHaveCount(1);
  await expect(panel).toHaveAccessibleName('R');
  await expect(panel.locator('samp')).toHaveText('[1] 85');

  await tabs.nth(0).focus();
  for (const [key, index, name] of [
    ['ArrowRight', 1, 'Python'], ['ArrowRight', 2, 'SQL'],
    ['ArrowRight', 0, 'R'], ['ArrowLeft', 2, 'SQL'],
    ['Home', 0, 'R'], ['End', 2, 'SQL'],
  ] as const) {
    await page.keyboard.press(key);
    await expect(tabs.nth(index)).toBeFocused();
    await expect(tabs.nth(index)).toHaveAttribute('aria-selected', 'true');
    await expect(tabs.nth(index)).toHaveAttribute('tabindex', '0');
    await expect(page.locator('[role="tab"][tabindex="0"]')).toHaveCount(1);
    await expect(panel).toHaveAccessibleName(name);
  }
  await page.keyboard.press('Tab');
  await expect(panel).toBeFocused();
  await expect(panel.locator('samp')).toContainText('dearest: 2799.0');

  await tabs.nth(1).click();
  await expect(panel).toHaveAccessibleName('Python');
  await expect(panel.locator('samp')).toHaveText('2299');
});

test('all course examples remain readable without JavaScript', async ({ browser }, testInfo) => {
  const context = await browser.newContext({
    javaScriptEnabled: false, baseURL: testInfo.project.use.baseURL,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  try {
    await page.goto('/how-we-teach/');
    await expect(page.getByRole('tab')).toHaveCount(0);
    for (const id of ['r', 'python', 'sql']) {
      await expect(page.locator(`#example-panel-${id}`)).toBeVisible();
    }
  } finally {
    await context.close();
  }
});
