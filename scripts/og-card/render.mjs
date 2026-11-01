// Render the 1200×630 social share card with the repo's Playwright.
// Usage: node scripts/og-card/render.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const source = path.join(here, 'card.html');
const output = path.join(root, 'public/og/rsquared-academy.png');

const WIDTH = 1200;
const HEIGHT = 630;

fs.mkdirSync(path.dirname(output), { recursive: true });

const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
  });

  await page.goto(pathToFileURL(source).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  const fontsLoaded = await page.evaluate(
    () =>
      document.fonts.check('800 92px "Schibsted Grotesk"') &&
      document.fonts.check('400 33px "Source Sans 3"'),
  );
  if (!fontsLoaded) {
    throw new Error('Web fonts did not load; refusing to render a fallback card.');
  }

  await page.screenshot({
    path: output,
    type: 'png',
    clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT },
  });
} finally {
  await browser.close();
}

const { size } = fs.statSync(output);
console.log(`Wrote ${path.relative(root, output)} (${WIDTH}×${HEIGHT}, ${size} bytes)`);
