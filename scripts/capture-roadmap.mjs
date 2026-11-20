// Native production crops for /roadmap/. Run: node scripts/capture-roadmap.mjs
// Uses only course navigation, tour dismissal, hints, Run and Submit.
// The SQL exercise is run in a fresh anonymous browser; no account is used.
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const output = new URL('../public/images/roadmap/', import.meta.url);
await mkdir(output, { recursive: true });
const captures = [];
const browser = await chromium.launch();
const tokens = await readFile(new URL('../src/styles/tokens.css', import.meta.url), 'utf8');
const [light, dark] = [...tokens.matchAll(/--surface-tint:\s*(#[0-9a-f]{6})/g)].map(m => m[1]);
const tints = { light, dark };
async function frame(buffer, file, theme) {
  const { width, height } = await sharp(buffer).metadata();
  if (width > 664 || height > 480) throw new Error(`Crop too large: ${file}, ${width} × ${height}`);
  await sharp({ create: { width: 664, height: 480, channels: 3, background: tints[theme] } })
    .composite([{ input: buffer, left: Math.floor((664 - width) / 2), top: Math.floor((480 - height) / 2) }])
    .webp({ quality: 90 }).toFile(fileURLToPath(new URL(file, output)));
}
async function compose(page, locators, name, theme, cropHeight) {
  const layers = [];
  let top = 16;
  for (const locator of locators) {
    await locator.scrollIntoViewIfNeeded();
    await page.evaluate(async () => { await document.fonts.ready; document.activeElement?.blur(); });
    const raw = await locator.screenshot({ animations: 'disabled', caret: 'hide' });
    const info = await sharp(raw).metadata();
    const height = Math.min(info.height, cropHeight ?? info.height);
    const input = await sharp(raw).extract({ left: 0, top: 0, width: info.width, height }).toBuffer();
    layers.push({ input, left: Math.floor((664 - info.width) / 2), top });
    top += height + 12;
  }
  const file = `${name}${theme === 'dark' ? '-dark' : ''}.webp`;
  const height = top + 4;
  const buffer = await sharp({ create: { width: 664, height, channels: 3, background: tints[theme] } }).composite(layers).png().toBuffer();
  await frame(buffer, file, theme);
  captures.push({ file, source: page.url(), theme, width: 664, height: 480, deviceScaleFactor: 2, cssWidth: 332, smallestTextCssPx: 12, composition: locators.length + ' native crops on a shared canvas; no resampling', ...(cropHeight ? { cropHeightPx: cropHeight } : {}) });
  console.log(file, 664, 480);
}
async function capture(page, locator, name, theme, extra = {}) {
  await locator.scrollIntoViewIfNeeded();
  await page.evaluate(async () => { await document.fonts.ready; document.activeElement?.blur(); });
  await page.mouse.move(0, 0);
  const source = await locator.evaluate(element => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const sizes = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!node.textContent.trim() || node.parentElement.closest('.sr-only,[aria-hidden="true"]')) continue;
      const range = document.createRange(); range.selectNodeContents(node);
      if ([...range.getClientRects()].some(r => r.width && r.height)) sizes.push(parseFloat(getComputedStyle(node.parentElement).fontSize));
    }
    return { cssWidth: element.getBoundingClientRect().width, smallestTextCssPx: Math.min(...sizes) };
  });
  const buffer = await locator.screenshot({ animations: 'disabled', caret: 'hide' });
  const { width, height } = await sharp(buffer).metadata();
  const file = `${name}${theme === 'dark' ? '-dark' : ''}.webp`;
  const feature = !name.startsWith('course-');
  if (feature) await frame(buffer, file, theme);
  else await sharp(buffer).webp({ quality: 90 }).toFile(fileURLToPath(new URL(file, output)));
  captures.push({ file, source: page.url(), theme, width: feature ? 664 : width, height: feature ? 480 : height, deviceScaleFactor: 2, ...source, ...extra });
  console.log(file, width, height, source);
}
async function dismissTour(page) {
  const skip = page.getByRole('button', { name: 'Skip tour', exact: true });
  try { await skip.waitFor({ timeout: 10000 }); await page.keyboard.press('Escape'); await skip.waitFor({ state: 'hidden' }); } catch {
    if (await skip.isVisible()) throw new Error('Tour still open');
  }
}
try {
  for (const theme of ['light', 'dark']) {
    const page = await browser.newPage({ viewport: { width: 332, height: 1800 }, deviceScaleFactor: 2, colorScheme: theme, reducedMotion: 'reduce' });
    // Tight crops of the production course-home results, without date headers.
    for (const id of ['intro-r', 'dplyr', 'ggplot2', 'intro-sql', 'intro-python']) {
      await page.goto(`https://app.rsquaredacademy.com/${id}`, { waitUntil: 'domcontentloaded', timeout: 90000 });
      const visual = id === 'intro-r' ? page.locator('[data-report-section="average-best"] .sql-report-card-visual') : page.locator('.sql-report-card-visual').first();
      await capture(page, visual, `course-${id}`, theme);
    }
    await page.goto('https://app.rsquaredacademy.com/intro-sql/first-visits', { waitUntil: 'domcontentloaded' });
    await page.locator('.cm-content').waitFor({ state: 'attached' });
    await dismissTour(page);
    const plan = page.getByTestId('plan-it');
    await plan.locator('summary').click();
    await capture(page, plan, 'plan', theme);
    await page.getByRole('tab', { name: 'Code', exact: true }).click();
    await page.locator('[data-tour="hints"]').click();
    await page.locator('[data-tour="hints"]').click();
    await capture(page, page.getByRole('region', { name: 'Hints and solution' }).locator('ol'), 'hints', theme);
    await page.locator('.cm-content').fill('SELECT 2 + 3 AS total;');
    await page.locator('[data-tour="run"]').click();
    const runButton = page.locator('[data-tour="run"]');
    const editor = page.locator('.cm-content');
    // Crop to the actual code line, excluding the editor's unused blank lines.
    const editorRaw = await sharp(await editor.screenshot({ animations: 'disabled' })).extract({ left: 0, top: 0, width: 600, height: 64 }).png().toBuffer();
    const buttonRaw = await runButton.screenshot({ animations: 'disabled' });
    await page.getByRole('tab', { name: 'Output', exact: true }).click();
    await page.getByRole('tab', { name: 'Results', exact: true }).click();
    await page.locator('[data-tour="output"]').getByText('total', { exact: true }).waitFor();
    const tableRaw = await page.locator('#output-panel-data table').screenshot({ animations: 'disabled' });
    const runLayers = []; let runTop = 24;
    for (const raw of [editorRaw, buttonRaw, tableRaw]) {
      const info = await sharp(raw).metadata();
      runLayers.push({ input: raw, left: Math.floor((664 - info.width) / 2), top: runTop }); runTop += info.height + 24;
    }
    const runFile = `run${theme === 'dark' ? '-dark' : ''}.webp`;
    await frame(await sharp({ create: { width: 664, height: runTop, channels: 3, background: tints[theme] } }).composite(runLayers).png().toBuffer(), runFile, theme);
    captures.push({ file: runFile, source: page.url(), theme, width: 664, height: 480, deviceScaleFactor: 2, cssWidth: 332, smallestTextCssPx: 14, composition: 'Native editor line, Run button and resulting table; no resampling' });
    await page.getByRole('tab', { name: 'Code', exact: true }).click();
    await page.locator('.cm-content').fill('SELECT session_id, device_category, traffic_source\nFROM sessions\nLIMIT 6;');
    await page.locator('[data-tour="submit"]').click();
    await page.getByTestId('query-recap').waitFor();
    await capture(page, page.getByTestId('query-recap'), 'recap', theme);
    await page.goto('https://app.rsquaredacademy.com/dplyr/filter-predict', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('diagram').waitFor();
    await dismissTour(page);
    await page.getByTestId('diagram-next').click();
    const diagram = page.getByTestId('diagram');
    await compose(page, [diagram.getByTestId('diagram-code'), diagram.locator('.diagram-stage')], 'stepthrough', theme);
    await page.getByRole('button', { name: 'Datasets', exact: true }).click();
    const panel = page.getByTestId('datasets-panel');
    await panel.waitFor();
    const article = panel.locator('article').first();
    await compose(page, [article.locator(':scope > div').first(), article.locator(':scope > div').last()], 'datasets', theme, 290);
    await page.close();
  }
} finally { await browser.close(); }
await writeFile(new URL('captures.json', output), JSON.stringify({ capturedAt: new Date().toISOString(), command: 'node scripts/capture-roadmap.mjs', captures }, null, 2) + '\n');
