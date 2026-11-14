import { test, expect } from '@playwright/test';
import { execSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';

// A second build with the e2e switch off, to check what production ships.
const OUT_DIR = 'dist-prod';

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });
}

test.describe('production build', () => {
  test.describe.configure({ mode: 'serial' });
  test.setTimeout(300_000);

  test.beforeAll(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop project only');
    rmSync(OUT_DIR, { recursive: true, force: true });
    execSync(`npx astro build --outDir ${OUT_DIR}`, {
      stdio: 'pipe',
      env: { ...process.env, PUBLIC_TURNSTILE_TEST: '' },
    });
  });
  test.afterAll(() => rmSync(OUT_DIR, { recursive: true, force: true }));

  test('W17-11: no Turnstile test keys or test-mode branch in any shipped file', async ({}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop project only');
    const text = files(OUT_DIR)
      .filter((file) => /\.(html|js|mjs|css|json|xml|txt)$/.test(file))
      .map((file) => readFileSync(file, 'utf8'))
      .join('\n');
    expect(text).not.toContain('1x00000000000000000000AA');
    expect(text).not.toContain('2x00000000000000000000AB');
    expect(text).not.toContain('turnstile-test-mode');
    expect(text).not.toContain('testMode:"pass"');
    // The real public site key is what ships.
    expect(text).toContain('0x4AAAAAAF8S08JtgwM8pxF9');
  });

  test('public pricing is emitted, indexed and contains launch prices', async ({}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop project only');
    expect(existsSync(join(OUT_DIR, 'pricing', 'index.html'))).toBe(true);
    const pricing = readFileSync(join(OUT_DIR, 'pricing', 'index.html'), 'utf8');
    for (const price of ['₹299', '₹629', '₹1,299', 'US$12', 'US$29', 'US$79']) {
      expect(pricing).toContain(price);
    }
    expect(pricing).not.toContain('noindex');
    for (const file of files(OUT_DIR).filter((f) => f.endsWith('.html'))) {
      expect(readFileSync(file, 'utf8'), file).not.toContain('[TBD]');
    }
    expect(readFileSync(join(OUT_DIR, 'sitemap-0.xml'), 'utf8')).toContain('/pricing/');
  });

  test('W17-02: no page calls the synthetic course data real', async ({}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop project only');
    const html = files(OUT_DIR)
      .filter((file) => file.endsWith('.html'))
      .map((file) => readFileSync(file, 'utf8'))
      .join('\n');
    expect(html).not.toMatch(/real (dataset|online shop|data\b)/i);
    expect(html).not.toMatch(/small, real\b/i);
  });

  test('W17-13: the store-table visual names as many stores as it draws', async ({}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop project only');
    const html = readFileSync(join(OUT_DIR, 'courses', 'index.html'), 'utf8');
    const svg = html.match(/<div class="course-visual cv-1"[^>]*>[\s\S]*?<\/svg>/);
    expect(svg, 'cv-1 visual on the courses page').not.toBeNull();
    const words = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
    const label = svg![0].match(/aria-label="A table of (\w+) example stores/);
    expect(label, 'store-table aria-label').not.toBeNull();
    const rows = (svg![0].match(/data-store-row/g) ?? []).length;
    expect(rows).toBeGreaterThan(0);
    expect(words.indexOf(label![1])).toBe(rows);
  });
});
