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

  test('W17-04: /pricing/ is not emitted and no [TBD] reaches production', async ({}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop project only');
    expect(existsSync(join(OUT_DIR, 'pricing'))).toBe(false);
    for (const file of files(OUT_DIR).filter((f) => f.endsWith('.html'))) {
      expect(readFileSync(file, 'utf8'), file).not.toContain('[TBD]');
    }
    expect(readFileSync(join(OUT_DIR, 'sitemap-0.xml'), 'utf8')).not.toContain('/pricing/');
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
});
