// Re-record the real live lesson, without answering or submitting an exercise.
// Requires the existing Playwright/sharp dependencies and ffmpeg on PATH.
// Run: node scripts/record-hero-loop.mjs
// Optional: FFMPEG, HERO_OUTPUT, HERO_WORK (raw captures stay outside the repo).
import { chromium } from 'playwright';
import sharp from 'sharp';
import { mkdir, writeFile, stat } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = process.env.HERO_OUTPUT || path.join(root, 'public/media/hero');
const work = process.env.HERO_WORK || path.join(tmpdir(), 'rsa-hero-loop');
const lesson = 'https://app.rsquaredacademy.com/dplyr/filter-predict';
const duration = 8;
const fps = 12;
const zoom = 1.3;
const evidence = { lesson, recordedAt: new Date().toISOString(), deviceScaleFactor: 2, zoom, duration, fps, captures: [] };
await mkdir(output, { recursive: true });
await mkdir(work, { recursive: true });

function ffmpeg(args) {
  const result = spawnSync(process.env.FFMPEG || 'ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr || 'ffmpeg failed');
}

const browser = await chromium.launch();
try {
  for (const size of ['desktop', 'phone']) for (const theme of ['light', 'dark']) {
    const stem = `${size}-${theme}`;
    const frames = path.join(work, stem);
    await mkdir(frames, { recursive: true });
    const context = await browser.newContext({
      viewport: { width: size === 'desktop' ? 1440 : 390, height: 1800 },
      deviceScaleFactor: 2, colorScheme: theme, reducedMotion: 'no-preference',
    });
    const page = await context.newPage();
    await page.goto(lesson, { waitUntil: 'domcontentloaded', timeout: 90_000 });
    const diagram = page.getByTestId('diagram');
    await diagram.waitFor({ timeout: 60_000 });
    const skip = page.getByRole('button', { name: 'Skip tour', exact: true });
    if (await skip.isVisible()) await skip.click();
    await page.evaluate((value) => { document.documentElement.style.zoom = String(value); }, zoom);
    await page.evaluate(() => document.fonts.ready);
    await diagram.scrollIntoViewIfNeeded();
    const topBar = (await page.locator('body').innerText()).split('WHAT YOU')[0];
    const fonts = await diagram.evaluate((el) => [...el.querySelectorAll('.diagram-code-line, .diagram-stepno, .diagram-grid-cell, .diagram-caption-text, .diagram-btn, .diagram-tibble')]
      .map((node) => parseFloat(getComputedStyle(node).fontSize)));
    const boxes = [];
    boxes.push(await diagram.boundingBox());
    await page.getByTestId('diagram-next').click();
    await page.waitForTimeout(1000);
    boxes.push(await diagram.boundingBox());
    await page.getByTestId('diagram-back').click();
    await page.waitForTimeout(400);
    // Crop only the real diagram inside the lesson pane. Its height changes as
    // rows disappear; pad the crop with the app's page background, keeping the
    // export dimensions fixed and excluding subsequent exercise/solution code.
    const width = Math.ceil(Math.max(...boxes.map((box) => box.width))) * 2;
    const height = Math.ceil(Math.max(...boxes.map((box) => box.height))) * 2;
    const background = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--bg').trim());
    async function capture() {
      const box = await diagram.boundingBox();
      const raw = await page.screenshot({ clip: { x: box.x, y: box.y, width: width / 2, height: Math.min(height / 2, box.height) }, caret: 'hide' });
      return sharp(raw).extend({ top: 0, left: 0, right: 0, bottom: Math.max(0, height - (await sharp(raw).metadata()).height), background }).png().toBuffer();
    }
    const still = await capture();
    await sharp(still).webp({ quality: 85 }).toFile(path.join(output, `${stem}.webp`));
    const timeline = [];
    const started = performance.now();
    let playing = false;
    let reset = false;
    while (performance.now() - started < duration * 1000) {
      const elapsed = performance.now() - started;
      if (!playing && elapsed > 650) {
        await page.getByTestId('diagram-play').click();
        await page.mouse.move(0, 0);
        await page.evaluate(() => document.activeElement?.blur());
        playing = true;
      }
      if (!reset && elapsed > 6600) {
        await page.getByTestId('diagram-back').click();
        await page.mouse.move(0, 0);
        await page.evaluate(() => document.activeElement?.blur());
        reset = true;
      }
      const time = (performance.now() - started) / 1000;
      const filename = `frame-${String(timeline.length).padStart(4, '0')}.png`;
      await writeFile(path.join(frames, filename), await capture());
      timeline.push({ filename, time });
      const delay = 1000 / fps - (performance.now() - started - time * 1000);
      if (delay > 0) await page.waitForTimeout(delay);
    }
    // End on the identical first still, so the loop has no boundary jump.
    await writeFile(path.join(frames, 'end.png'), still);
    const concat = timeline.map((frame, i) => `file '${frame.filename}'\nduration ${Math.max(0.001, (timeline[i + 1]?.time ?? 7.9) - frame.time).toFixed(4)}`).join('\n') + "\nfile 'end.png'\nduration 0.1\nfile 'end.png'\n";
    const input = path.join(frames, 'frames.txt');
    await writeFile(input, concat);
    const common = ['-f', 'concat', '-safe', '0', '-i', input, '-t', String(duration), '-vf', `fps=${fps},format=yuv420p`, '-an'];
    ffmpeg([...common, '-c:v', 'libx264', '-preset', 'slow', '-crf', '31', '-movflags', '+faststart', path.join(output, `${stem}.mp4`)]);
    ffmpeg([...common, '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '40', '-row-mt', '1', path.join(output, `${stem}.webm`)]);
    const bytes = Object.fromEntries(await Promise.all(['mp4', 'webm', 'webp'].map(async (ext) => [ext, (await stat(path.join(output, `${stem}.${ext}`))).size])));
    evidence.captures.push({ stem, width, height, cssWidth: width / 2, cssHeight: height / 2, minimumTextPx: Math.min(...fonts) * zoom, topBar, frames: timeline.length, bytes });
    console.log(JSON.stringify(evidence.captures.at(-1)));
    await context.close();
  }
} finally { await browser.close(); }
const total = evidence.captures.reduce((sum, capture) => sum + Object.values(capture.bytes).reduce((a, b) => a + b, 0), 0);
if (total > 1_500_000) throw new Error(`Hero assets exceed budget: ${total} bytes`);
await writeFile(path.join(output, 'capture.json'), JSON.stringify(evidence, null, 2) + '\n');
console.log(`All variants together: ${total} bytes`);
