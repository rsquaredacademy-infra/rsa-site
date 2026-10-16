# CLAUDE.md — rsa-site (www.rsquaredacademy.com)

Astro + Tailwind 4 static site, deployed by Netlify on merge to `main`.
The site's job: explain the Academy in 5 seconds, then get visitors to sign up
for updates (later: start a free course on app.rsquaredacademy.com).

## Sources of truth

The design sources live in the private repo
`rsquaredacademy-infra/rsa-site-design` (local `F:\web\rsa-site-design`).
Copy its `design/` folder into this checkout before building pages; `design/`
is git-ignored here and must never be committed. Track open items and
placeholders in that repo's `TODO.md`, not as TODO comments in this repo.

- `design/mockups/*.dc.html` — the **approved** page mockups (exported from the
  Claude Design canvas). Copy, structure, links and section order come from
  these. Don't invent sections, copy, numbers or links.
  Main = Home, Courses, Educators, About, Resources (= Free resources),
  OpenSource (= Open source). They use `<x-import component-from-global-scope="RSA.X">`
  for components and `{{name}}` for values defined in the `renderVals()` script
  at the bottom of each file.
- `design/design-system.md` — content and visual rules (voice, colour use, type,
  layout, motion). Read it before writing a page.

## Structure

- `src/styles/tokens.css` — design tokens (light + dark). Don't edit colours.
- `src/styles/components.css` — component CSS from the design system (`.rsa-*`).
- `src/styles/global.css` — Tailwind, token→Tailwind mapping, and shared
  helpers: `.wrap`, `.sec`, `.eyebrow`, `.t-display`, `.t-h1`, `.t-h2`, `.t-h3`,
  `.t-lead`, `.t-muted`, `.t-small` (they include the phone sizes).
- `src/components/` — Button, Badge, ConsoleSnippet, CourseCard, Navbar,
  Footer, SignupBand, Wordmark. Mockup `RSA.X` → `src/components/X.astro`.
  Navbar and Footer come from the layout; pages don't add them.
- `src/layouts/Base.astro` — every page uses it (`title`, `description`).
- `src/data/site.ts` — nav, links, courses, badges. Reuse it; add shared data
  here instead of repeating it in pages.
- `public/images/` — logo and page images. `public/site-kit/` — vendored
  site-kit v1.0.0 (GA4 + consent); don't edit.
  - The mockups reference images as `/_blob/<hash>`. Use these files instead:
    eBook covers `public/images/covers/{intro-r,wrangle-r,viz-ggplot2,rdbsql,bash-intro,viz-base}.svg`
    (in the order of the books in `Resources.dc.html`); package hex stickers
    `public/images/hex/hex-<package>.webp`. yahoofinancer and standby now have
    hex stickers, so use them instead of the mockup's outlined-hexagon placeholder.

## Conventions

- One page = `src/pages/<route>/index.astro` (trailing slashes: `/courses/`).
- Translate mockup inline styles into Tailwind utilities, the shared helpers,
  or a scoped `<style>` block in the page. Use the token colours
  (`bg-surface`, `text-ink-muted`, `border-line`, `var(--brand)`), never raw hex.
- Responsive: match the mockup breakpoints (860px, 600px etc.). No horizontal
  scroll at 390px. Tap targets at least 44px where possible.
- Accessibility: one `h1` per page, sections labelled with `aria-labelledby`,
  icons `aria-hidden="true"`, visible focus (already in the component CSS).
- Icons are inline Lucide-style SVGs, copied from the mockups.
- No new dependencies without asking. No client-side framework (no React).
  Small `<script>` blocks are fine.
- Forms: Netlify Forms (`data-netlify="true"`, hidden `form-name`, honeypot),
  posting to `/thanks/`.
- This repo is public: no secrets, drafts or internal notes in code or commits.

## Checks

- `npm run build` must pass with no errors or warnings you introduced.
- `npx astro check` must pass.

## Git

- Work on a branch, one PR per task. Agents commit locally only; Claude reviews,
  pushes and merges.
