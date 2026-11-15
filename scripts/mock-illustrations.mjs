// Re-export the existing masters with matching theme canvases. No new artwork.
// Sharp is already supplied by Astro's image pipeline.
import sharp from 'sharp';
import { mkdir, readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = `${root}public/images/home`;
await mkdir(output, { recursive: true });
const tokens = await readFile(`${root}src/styles/tokens.css`, 'utf8');
const tints = [...tokens.matchAll(/--surface-tint:\s*#([0-9a-f]{6})/g)].slice(0, 2)
  .map(match => [0, 2, 4].map(i => parseInt(match[1].slice(i, i + 2), 16)));
const sections = ['how-it-works', 'foundations', 'learning-steps', 'free-resources', 'learning-roadmap'];
const lessons = ['lesson-run', 'lesson-practice', 'lesson-feedback', 'lesson-hints', 'lesson-diagram', 'lesson-datasets', 'lesson-stepthrough', 'lesson-datasets-panel'];
const hue180 = [[-.574, 1.43, .144], [.426, .43, .144], [.426, 1.43, -.856]];
const clamp = value => Math.max(0, Math.min(255, Math.round(value)));

for (const name of [...sections, ...lessons]) {
  const section = sections.includes(name);
  const folder = section ? 'illustrations' : 'lessons';
  const width = section ? 1200 : 800;
  const { data, info } = await sharp(`${root}public/images/${folder}/${name}.png`)
    .resize({ width }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const pixels = info.width * info.height;
  const backdrop = [0, 1, 2].map(c => Math.round(
    [0, info.width - 1, pixels - info.width, pixels - 1].reduce((sum, p) => sum + data[p * 3 + c], 0) / 4,
  ));
  for (const [theme, tint] of [['light', tints[0]], ['dark', tints[1]]]) {
    const result = Buffer.alloc(data.length);
    for (let p = 0; p < pixels; p++) {
      const offset = p * 3;
      const rgb = [...data.subarray(offset, offset + 3)];
      // Suppress faint canvas texture smoothly, retaining object shading,
      // outlines and fine lesson text without segmentation or edge masks.
      const delta = rgb.map((value, c) => value - backdrop[c]);
      const distance = Math.max(...delta.map(Math.abs));
      const weight = Math.min(1, distance / 10);
      const white = Math.max(0, Math.min(1, (Math.min(...rgb) - 240) / 12));
      for (let c = 0; c < 3; c++) {
        let change = delta[c] * .95;
        if (theme === 'dark') {
          // Invert luminance and rotate hue to retain blue accents, then lift
          // near-white objects slightly above the dark blue canvas.
          const inverted = hue180[c].reduce((sum, v, i) => sum - v * delta[i] * .76, 0);
          change = inverted * (1 - white) + Math.abs(delta[c]) * 1.8 * white;
        }
        result[offset + c] = clamp(tint[c] + change * weight);
      }
    }
    const target = `${output}/${name}${theme === 'dark' ? '-dark' : ''}.webp`;
    await sharp(result, { raw: { width: info.width, height: info.height, channels: 3 } })
      .webp({ quality: 88 }).toFile(target);
    console.log(`${name} ${theme}: ${info.width}x${info.height}, ${(await stat(target)).size} bytes`);
  }
}
