// Capture real lesson UI without running, answering or submitting an exercise.
// Run after mock-illustrations.mjs, which exports the other home illustrations.
import { chromium } from 'playwright';
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const output = fileURLToPath(new URL('../public/images/home/', import.meta.url));
const tokens = await readFile(new URL('../src/styles/tokens.css', import.meta.url), 'utf8');
const tints = [...tokens.matchAll(/--surface-tint:\s*(#[0-9a-f]{6})/g)].slice(0, 2).map(match => match[1]);
const lesson = 'https://app.rsquaredacademy.com/dplyr/filter-predict';
const captures = [];
const browser = await chromium.launch();
try {
  for (const [index, theme] of ['light', 'dark'].entries()) {
    const context = await browser.newContext({ viewport: { width: 390, height: 1800 }, deviceScaleFactor: 2, colorScheme: theme, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto(lesson, { waitUntil: 'domcontentloaded', timeout: 90000 });
    const diagram = page.getByTestId('diagram');
    await diagram.waitFor({ timeout: 60000 });
    const skip = page.getByRole('button', { name: 'Skip tour', exact: true });
    if (await skip.isVisible()) await skip.click();
    await page.evaluate(() => { document.documentElement.style.zoom = '1.3'; });
    await page.evaluate(() => document.fonts.ready);
    const frames = [];
    for (let step = 0; step < 2; step++) {
      if (step) await page.getByTestId('diagram-next').click();
      await page.waitForTimeout(600);
      await page.mouse.move(0, 0);
      await page.evaluate(() => document.activeElement?.blur());
      // Keep the real code, step label, explanation and table. Crop out the
      // playback controls so a still does not resemble working card buttons.
      await diagram.scrollIntoViewIfNeeded();
      const box = await diagram.boundingBox();
      const controls = await diagram.locator('.diagram-controls').boundingBox();
      const stage = await diagram.locator('.diagram-stage').boundingBox();
      const raw = await diagram.screenshot({ animations: 'disabled' });
      const info = await sharp(raw).metadata();
      const scale = info.width / box.width;
      const topHeight = Math.floor((controls.y - box.y - 6) * scale);
      const stageTop = Math.ceil((stage.y - box.y) * scale);
      const bottomHeight = info.height - stageTop;
      const input = await sharp({ create: { width: info.width, height: topHeight + bottomHeight, channels: 3, background: tints[index] } }).composite([
        { input: await sharp(raw).extract({ left: 0, top: 0, width: info.width, height: topHeight }).toBuffer(), left: 0, top: 0 },
        { input: await sharp(raw).extract({ left: 0, top: stageTop, width: info.width, height: bottomHeight }).toBuffer(), left: 0, top: topHeight },
      ]).png().toBuffer();
      frames.push({ input, ...await sharp(input).metadata() });
    }
    const width = Math.max(...frames.map(frame => frame.width));
    const gutter = 24;
    const height = frames.reduce((sum, frame) => sum + frame.height, 0) + gutter;
    const suffix = theme === 'dark' ? '-dark' : '';
    await sharp({ create: { width, height, channels: 3, background: tints[index] } })
      .composite(frames.map((frame, i) => ({ input: frame.input, left: 0, top: i ? frames[0].height + gutter : 0 })))
      .webp({ quality: 90 }).toFile(`${output}lesson-diagram-portrait${suffix}.webp`);

    // The desktop app's actual 560px drawer, including its natural overflow.
    // Match the strip's portrait ratio so both cards share the same media box.
    await page.evaluate(() => { document.documentElement.style.zoom = ''; });
    const panelHeight = Math.round(560 * height / width);
    await page.setViewportSize({ width: 1440, height: panelHeight });
    await page.getByRole('button', { name: 'Datasets', exact: true }).click();
    const panel = page.getByTestId('datasets-panel');
    await panel.waitFor();
    await page.evaluate(() => document.activeElement?.blur());
    const raw = await panel.screenshot({ animations: 'disabled' });
    await sharp(raw).resize({ width }).webp({ quality: 90 }).toFile(`${output}lesson-datasets-portrait${suffix}.webp`);
    captures.push({ theme, width, height, panelWidth: 560, panelHeight, frames: 2 });
    console.log(captures.at(-1));
    await context.close();
  }
} finally { await browser.close(); }
await writeFile(`${output}portraits.json`, JSON.stringify({ lesson, capturedAt: new Date().toISOString(), captures }, null, 2) + '\n');
