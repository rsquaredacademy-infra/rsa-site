// One-off screenshot capture for the www site (wwwhero1).
//
// Visits the live lesson player read-only, runs a real exercise, and saves the
// hero image and the "See how a lesson works" tiles to public/images/.
// Not a test and not part of the build:
//
//   node scripts/capture-app.mjs
//
// It needs Playwright (already a dev dependency) and sharp (Astro's image
// library). The app's R engine downloads on the first visit; the script waits
// for it before typing (30–60 s).
import { chromium } from 'playwright';
import sharp from 'sharp';
import { mkdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const IMAGES = path.join(ROOT, 'public', 'images');
const LESSONS = path.join(IMAGES, 'lessons');

const VIEWPORT = { width: 1440, height: 900 };
const APP = 'https://app.rsquaredacademy.com';
const BARS_SOLUTION = `big_days <- store_days |>
  group_by(city) |>
  summarise(days_over_1500 = sum(revenue_usd > 1500))

# 1. Select lines 1-6, press Run, and look at big_days
big_days

# 2. Draw one bar per store, as tall as its number of big days
p_big_days <- ggplot(big_days, aes(city, days_over_1500)) +
  geom_col()

# 3. Print your saved plot
p_big_days

# 4. Answer: which store has the most big days?
biggest_store <- "Nairobi"`;

async function fileSize(file) {
  const info = await stat(file);
  return `${Math.round(info.size / 1024)} KB`;
}

/** Save one clipped screenshot as WebP + PNG fallback at the requested size. */
async function saveShot(page, clip, dir, stem, width, height, quality = 82) {
  const raw = await page.screenshot({ clip, animations: 'disabled', caret: 'hide' });
  const resized = sharp(raw).resize(width, height, { fit: 'cover' });
  const webp = path.join(dir, `${stem}.webp`);
  const png = path.join(dir, `${stem}.png`);
  await resized.clone().webp({ quality }).toFile(webp);
  await resized
    .clone()
    .png({ compressionLevel: 9, effort: 10, palette: true, quality: 90 })
    .toFile(png);
  console.log(`  ${stem}: ${width}×${height} — WebP ${await fileSize(webp)}, PNG ${await fileSize(png)}`);
}

async function skipTour(page) {
  const skip = page.locator('button', { hasText: 'Skip tour' });
  try {
    await skip.waitFor({ state: 'visible', timeout: 2500 });
    await skip.click();
    await page.waitForTimeout(200);
  } catch {
    // No tour on this visit.
  }
}

/** Wait for the editor and for R to finish loading (Submit enabled). */
async function ready(page) {
  const editor = page.locator('.cm-content[aria-label="R code editor"]');
  await editor.waitFor({ timeout: 60_000 });
  await page.waitForFunction(
    () => {
      const button = document.querySelector('button[data-tour="submit"]');
      return button instanceof HTMLButtonElement && !button.disabled;
    },
    null,
    { timeout: 180_000 },
  );
  await skipTour(page);
  return editor;
}

/** Replace the whole script with the solution. */
async function typeCode(page, code) {
  const editor = page.locator('.cm-content[aria-label="R code editor"]');
  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText(code);
  await page.waitForTimeout(300);
}

/** Drag the editor/output divider up so the output pane has room. */
async function growOutput(page, pixels = 230) {
  const divider = page.locator('[aria-label="Drag to resize the editor and console"]');
  const box = await divider.boundingBox();
  if (!box) return;
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x, y - pixels, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(300);
}

async function scrollEditor(page, top) {
  await page.locator('.cm-scroller').first().evaluate((el, value) => {
    el.scrollTop = value;
  }, top);
  await page.waitForTimeout(250);
}

/** Wait for text in the feedback area (R runs in the page). */
async function waitForFeedback(page, pattern) {
  await page.waitForFunction(
    (source) => new RegExp(source).test(document.body.innerText),
    pattern,
    { timeout: 180_000 },
  );
}

async function openBarsFill(page) {
  await page.goto(`${APP}/ggplot2/bars-fill`, { waitUntil: 'domcontentloaded', timeout: 90_000 });
  return ready(page);
}

async function main() {
  await mkdir(LESSONS, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    colorScheme: 'light',
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  page.on('pageerror', (error) => console.log('PAGEERROR', error.message.slice(0, 200)));

  console.log('Course 3, Bars: fill the gaps');
  await openBarsFill(page);
  await typeCode(page, BARS_SOLUTION);

  // 1. Lesson pane: the practice badge and the task.
  await saveShot(page, { x: 16, y: 20, width: 536, height: 536 }, LESSONS, 'lesson-practice', 800, 800);

  // Run the code so the console shows real R output.
  await page.locator('button[data-tour="run"]').click();
  await page.waitForFunction(
    () => /Plots \(\d+\)/.test(document.querySelector('#output-tab-plots')?.textContent ?? ''),
    null,
    { timeout: 180_000 },
  );
  await page.waitForTimeout(1200);
  await growOutput(page);
  await scrollEditor(page, 140);
  await page.locator('#output-tab-console').click();
  await page.waitForTimeout(800);
  await page.evaluate(() => document.activeElement?.blur());
  await saveShot(page, { x: 556, y: 20, width: 880, height: 880 }, LESSONS, 'lesson-run', 800, 800);

  // Submit the correct answer and wait for the pass banner.
  await page.locator('button[data-tour="submit"]').click();
  await waitForFeedback(page, '^Correct');
  await page.waitForTimeout(2500);
  const ratingSkip = page.locator('button', { hasText: /^Skip$/ });
  try {
    await ratingSkip.click({ timeout: 2500 });
  } catch {
    // The rating card was not shown.
  }
  await page.locator('#output-tab-plots').click();
  await page.waitForSelector('#panel-output', { state: 'visible', timeout: 30_000 });
  await page.waitForTimeout(1500);
  await scrollEditor(page, 150);
  await page.evaluate(() => document.activeElement?.blur());

  // 2. The hero: the whole player, cropped to the telling area.
  await saveShot(page, { x: 0, y: 0, width: 1440, height: 900 }, IMAGES, 'lesson-player-hero', 1440, 900, 84);

  // 3. Pass banner and feedback.
  await saveShot(page, { x: 556, y: 20, width: 880, height: 880 }, LESSONS, 'lesson-feedback', 800, 800);

  // 4. Datasets panel beside the code.
  await page.locator('button[aria-label="Datasets"]').click();
  await page.getByText('store_days.csv', { exact: true }).first().waitFor({ timeout: 10_000 });
  await page.waitForTimeout(800);
  await saveShot(page, { x: 556, y: 20, width: 880, height: 880 }, LESSONS, 'lesson-datasets', 800, 800);

  // 5. Wrong answer: the not-yet banner with Try again and Show hint.
  console.log('Course 3, a wrong answer');
  await page.evaluate(() => window.localStorage.clear());
  await openBarsFill(page);
  await typeCode(page, BARS_SOLUTION.replace('biggest_store <- "Nairobi"', 'biggest_store <- "Mumbai"'));
  await page.locator('button[data-tour="submit"]').click();
  await waitForFeedback(page, 'Not yet');
  await page.waitForTimeout(1200);
  await growOutput(page);
  await page.evaluate(() => document.activeElement?.blur());
  await saveShot(page, { x: 556, y: 20, width: 880, height: 880 }, LESSONS, 'lesson-hints', 800, 800);

  // 6. The dplyr step-through diagram, at step 2 of 3.
  console.log('Course 2, Group, then summarise: diagram step 2');
  await page.goto(`${APP}/dplyr/group-by-predict`, { waitUntil: 'domcontentloaded', timeout: 90_000 });
  const diagram = page.locator('[data-testid="diagram"]');
  await diagram.waitFor({ timeout: 60_000 });
  await skipTour(page);
  await page.evaluate(() => {
    const card = document.querySelector('[data-testid="diagram"]');
    if (!card) return;
    let pane = card.parentElement;
    while (pane) {
      const style = getComputedStyle(pane);
      if (style.overflowY === 'auto' || style.overflowY === 'scroll') break;
      pane = pane.parentElement;
    }
    if (!pane) {
      card.scrollIntoView({ block: 'start' });
      return;
    }
    const offset = card.getBoundingClientRect().top - pane.getBoundingClientRect().top;
    pane.scrollTop += offset - 8;
  });
  await page.waitForTimeout(400);
  await diagram.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByText('STEP 2 OF 3').waitFor({ timeout: 10_000 });
  await page.waitForTimeout(1200);
  await page.evaluate(() => document.activeElement?.blur());
  await saveShot(page, { x: 16, y: 20, width: 536, height: 536 }, LESSONS, 'lesson-diagram', 800, 800);

  await browser.close();
  console.log('Done.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
