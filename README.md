# rsa-site

The new www.rsquaredacademy.com: Astro + Tailwind 4, deployed on Netlify.

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
```

See `CLAUDE.md` for structure and conventions.

Trust figures on Home and About use `src/data/trust-signals.json`. Refresh the
snapshot in Windows PowerShell, review the diff, then commit it:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/refresh-trust.ps1
```

The script queries cranlogs through yesterday (UTC) for the packages listed in
`src/data/packages.ts`, and reads the public YouTube About page without a key.
Use `-Through yyyy-MM-dd` for a specific completed day. CRAN figures cover the
Posit mirror's available logs from October 2012; downloads are not unique users.
YouTube's subscriber label is rounded and omitted when unavailable. Failed
requests leave the committed snapshot intact, so builds need no network access
for these figures. Public eBook counts and links come from `src/data/ebooks.ts`;
author credentials come from the existing About page.

The three course pages use `src/data/course-faqs.ts` for both visible answers
and FAQPage JSON-LD. `tests/course-faqs-trust.spec.ts` checks their agreement and
preservation of the direct lesson CTAs. Set `A4A5_SHOTS` to an output directory
when running that test to capture the FAQ and trust sections at 1280 and 390px.
