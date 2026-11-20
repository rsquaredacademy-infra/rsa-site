// Real app captures composed into square media without cropping lesson content.
// Default mode uses only the pane divider, Next, Skip tour and Datasets.
// SQL mode opens Plan it and submits the supplied lesson's sql solution chunk:
// node scripts/capture-inside-cards.mjs --sql-plan --solution-file <lesson.md>
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const output = fileURLToPath(new URL('../public/images/home/', import.meta.url));
const tokens = await readFile(new URL('../src/styles/tokens.css', import.meta.url), 'utf8');
const tints = [...tokens.matchAll(/--surface-tint:\s*(#[0-9a-f]{6})/g)].slice(0, 2).map(match => match[1]);
const sqlPlan = process.argv.includes('--sql-plan');
const lesson = sqlPlan
  ? 'https://app.rsquaredacademy.com/intro-sql/units-sold-by-category'
  : 'https://app.rsquaredacademy.com/dplyr/filter-predict';
let solution;
if (sqlPlan) {
  const solutionFile = process.argv[process.argv.indexOf('--solution-file') + 1];
  if (!process.argv.includes('--solution-file') || !solutionFile) throw new Error('Provide --solution-file <lesson.md>');
  solution = (await readFile(solutionFile, 'utf8')).match(/```\{sql solution\}\r?\n([\s\S]*?)```/)?.[1].trim();
  if (!solution) throw new Error('No sql solution chunk in the supplied file');
}
const captures = [];
const browser = await chromium.launch();
async function square(layers, width, height, background, target, size = 1000) {
  const composed = await sharp({ create: { width, height, channels: 3, background } }).composite(layers).png().toBuffer();
  await sharp(composed).resize(size, size, { fit: 'contain', background })
    .webp({ quality: 90 }).toFile(`${output}${target}`);
}
try {
  for (const [index, theme] of ['light', 'dark'].entries()) {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1600 }, deviceScaleFactor: sqlPlan ? 2 : 1, colorScheme: theme, reducedMotion: 'reduce' });
    await page.goto(lesson, { waitUntil: 'domcontentloaded', timeout: 90000 });
    if (sqlPlan) {
      await page.locator('.cm-content[aria-label="SQL code editor"]').waitFor({ timeout: 90000 });
      // The tour starts asynchronously; wait for it before dismissing with Esc.
      await page.getByRole('button', { name: 'Skip tour', exact: true }).waitFor({ timeout: 30000 });
      await page.keyboard.press('Escape');
      await page.getByRole('button', { name: 'Skip tour', exact: true }).waitFor({ state: 'hidden' });
      // Use the real divider to give both native cards similar widths.
      await page.setViewportSize({ width: 1440, height: 1600 });
      const divider = await page.getByTestId('pane-divider').boundingBox();
      await page.mouse.move(divider.x + divider.width / 2, divider.y + 50);
      await page.mouse.down();
      await page.mouse.move(864, divider.y + 50, { steps: 12 });
      await page.mouse.up();
      const plan = page.getByTestId('plan-it');
      await plan.locator('summary').click();
      await page.locator('.cm-content[aria-label="SQL code editor"]').fill(solution);
      await page.locator('[data-tour="submit"]').click();
      const recap = page.getByTestId('query-recap');
      await recap.waitFor({ timeout: 90000 });
      await page.getByText('Correct', { exact: true }).waitFor();
      await page.evaluate(() => document.fonts.ready);
      await page.mouse.move(0, 0);
      await page.evaluate(() => document.activeElement?.blur());
      const frames = [];
      for (const card of [plan, recap]) {
        const input = await sharp(await card.screenshot({ animations: 'disabled' })).resize({ width: 656 }).png().toBuffer();
        frames.push({ input, ...await sharp(input).metadata() });
      }
      const gap = 40;
      const top = Math.floor((800 - frames[0].height - frames[1].height - gap) / 2);
      if (top < 72) throw new Error('SQL cards no longer fit with the intended padding');
      const suffix = theme === 'dark' ? '-dark' : '';
      await square(frames.map((frame, i) => ({ input: frame.input, left: 72, top: top + (i ? frames[0].height + gap : 0) })),
        800, 800, tints[index], `lesson-sql-plan${suffix}.webp`, 800);
      captures.push({ theme, width: 800, height: 800, paddingX: 72, paddingY: top, gap, planQuestions: 6, recapClauses: 5 });
      console.log(captures.at(-1));
      await page.close();
      continue;
    }
    const diagram = page.getByTestId('diagram');
    await diagram.waitFor({ timeout: 60000 });
    const skip = page.getByRole('button', { name: 'Skip tour', exact: true });
    if (await skip.isVisible()) await skip.click();
    const divider = await page.getByTestId('pane-divider').boundingBox();
    await page.mouse.move(divider.x + divider.width / 2, divider.y + 50);
    await page.mouse.down();
    await page.mouse.move(1000, divider.y + 50, { steps: 12 });
    await page.mouse.up();
    await page.evaluate(() => document.fonts.ready);
    const frames = [];
    for (let step = 0; step < 2; step++) {
      if (step) await page.getByTestId('diagram-next').click();
      await page.waitForTimeout(600);
      await page.mouse.move(0, 0);
      await page.evaluate(() => document.activeElement?.blur());
      await diagram.scrollIntoViewIfNeeded();
      const box = await diagram.boundingBox();
      const controls = await diagram.locator('.diagram-controls').boundingBox();
      const stage = await diagram.locator('.diagram-stage').boundingBox();
      const raw = await diagram.screenshot({ animations: 'disabled' });
      const info = await sharp(raw).metadata();
      const topHeight = Math.floor(controls.y - box.y - 6);
      const stageTop = Math.ceil(stage.y - box.y);
      const height = topHeight + info.height - stageTop;
      const input = await sharp({ create: { width: info.width, height, channels: 3, background: tints[index] } }).composite([
        { input: await sharp(raw).extract({ left: 0, top: 0, width: info.width, height: topHeight }).toBuffer(), left: 0, top: 0 },
        { input: await sharp(raw).extract({ left: 0, top: stageTop, width: info.width, height: info.height - stageTop }).toBuffer(), left: 0, top: topHeight },
      ]).png().toBuffer();
      frames.push({ input, width: info.width, height });
    }
    const suffix = theme === 'dark' ? '-dark' : '';
    const gap = 16;
    await square(frames.map((frame, i) => ({ input: frame.input, left: 0, top: i ? frames[0].height + gap : 0 })),
      frames[0].width, frames[0].height + frames[1].height + gap, tints[index], `lesson-diagram-card${suffix}.webp`);

    // Preserve both full dataset dictionaries and their first rows, side by side.
    // The narrower native drawer provides a square composition at readable scale.
    await page.setViewportSize({ width: 390, height: 1800 });
    await page.getByRole('button', { name: 'Datasets', exact: true }).click();
    const panel = page.getByTestId('datasets-panel');
    await panel.waitFor();
    await page.evaluate(() => document.activeElement?.blur());
    const header = await panel.locator('h2').locator('../..').screenshot({ animations: 'disabled' });
    const headerInfo = await sharp(header).metadata();
    const articles = [];
    for (const article of (await panel.locator('article').all()).slice(0, 2)) {
      const input = await article.screenshot({ animations: 'disabled' });
      articles.push({ input, ...await sharp(input).metadata() });
    }
    const width = articles[0].width + articles[1].width + gap;
    const headerBuffer = await sharp(header).resize({ width }).png().toBuffer();
    const headerHeight = Math.round(headerInfo.height * width / headerInfo.width);
    const height = headerHeight + gap + Math.max(...articles.map(article => article.height));
    await square([
      { input: headerBuffer, left: 0, top: 0 },
      ...articles.map((article, i) => ({ input: article.input, left: i ? articles[0].width + gap : 0, top: headerHeight + gap })),
    ], width, height, tints[index], `lesson-datasets-card${suffix}.webp`);
    captures.push({ theme, width: 1000, height: 1000, diagramFrames: 2, datasets: ['sales.csv', 'stores.csv'] });
    console.log(captures.at(-1));
    await page.close();
  }
} finally { await browser.close(); }
await writeFile(`${output}${sqlPlan ? 'sql-plan' : 'cards'}.json`, JSON.stringify({ lesson, capturedAt: new Date().toISOString(), captures }, null, 2) + '\n');
