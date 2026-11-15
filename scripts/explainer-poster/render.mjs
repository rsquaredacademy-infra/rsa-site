// Render both 1920×1080 posters from HTML and an unchanged crop of the real video.
// Run: node scripts/explainer-poster/render.mjs (requires ffmpeg on PATH).
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const media = path.join(root, 'public/media/explainer');
const work = await mkdtemp(path.join(tmpdir(), 'rsa-explainer-poster-'));
const frame = path.join(work, 'frame.png');
let browser;
try {
  // At 40 seconds the video shows the complete filter() lesson diagram, without
  // browser chrome, a clipped toolbar or the editor's large empty area.
  const result = spawnSync(process.env.FFMPEG || 'ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-ss', '40', '-i',
    path.join(media, 'how-learning-works.mp4'), '-frames:v', '1', '-y', frame,
  ], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr || 'ffmpeg failed');
  const crop = await sharp(await readFile(frame))
    .extract({ left: 384, top: 30, width: 1152, height: 1020 }).png().toBuffer();

  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(path.join(here, 'poster.html')).href, { waitUntil: 'networkidle' });
  await page.locator('.lesson').evaluate((image, data) => { image.src = data; }, `data:image/png;base64,${crop.toString('base64')}`);
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map(image => image.decode()));
  });
  if (!await page.evaluate(() =>
    document.fonts.check('800 112px "Schibsted Grotesk"') &&
    document.fonts.check('400 46px "Source Sans 3"'),
  )) throw new Error('Site fonts did not load; refusing to render fallback fonts.');

  for (const theme of ['light', 'dark']) {
    await page.evaluate(value => { document.documentElement.dataset.theme = value; }, theme);
    const output = path.join(media, `how-learning-works-poster${theme === 'dark' ? '-dark' : ''}.webp`);
    await sharp(await page.screenshot()).webp({ quality: 92 }).toFile(output);
    console.log(`${path.relative(root, output)}: 1920×1080, ${(await stat(output)).size} bytes`);
  }
} finally {
  await browser?.close();
  await rm(work, { recursive: true, force: true });
}
