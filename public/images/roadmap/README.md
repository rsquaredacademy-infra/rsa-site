# Roadmap production crops

Reproduce all images with `node scripts/capture-roadmap.mjs` from the site root.
The script uses Playwright and Astro's existing Sharp dependency. No generated
artwork is used. Every crop comes from `https://app.rsquaredacademy.com` in its
native light or dark theme, captured at device scale 2 without resampling.

`captures.json` records each URL, dimensions, theme and minimum text size.
To refresh only the Python light/dark images while retaining all other captures
and their original provenance: `node scripts/capture-roadmap.mjs --python-only`.

- `course-{intro-r,dplyr,ggplot2,intro-sql}`: native result previews
  from each course home. R uses the average/best-day result; the others use the
  first report result. Their surrounding page headings and dates are excluded.
- `course-intro-python`: the live Python course home's Receipt messages ticket,
  selected with `[data-report-section="receipt"] .report-receipt-ticket`.
  It shows order ORD-03159, 3 lines / 6 items and total to pay ₹10,994.00.
  The surrounding 11px explanatory footnote is excluded. The native ticket is
  258 CSS pixels wide, captured at 2× without resizing; its smallest text is
  12px, retained at the roadmap's 258px image width at 390/820/1280 viewports.
  Native light and dark themes are captured separately. This distinct panel
  avoids repeating SQL's headline metrics: SQL revenue includes shipping,
  whereas Python revenue is before shipping. SQL's image is unchanged.
  Each Python manifest entry records its refresh timestamp and command.
- `plan`, `recap`, `hints`: First six visits in Intro to SQL. The tour is
  dismissed with Escape. Plan it is expanded; the first two hints are revealed;
  a correct query is submitted to reveal the clause recap.
- `run`: the actual SQL editor line, Run button and resulting table for
  `SELECT 2 + 3 AS total;`. The unused editor lines are cropped out.
- `stepthrough`: the native code bar and filtered table from dplyr/filter-predict,
  after advancing to the second step. Playback controls and caption are excluded.
- `datasets`: the actual sales.csv heading/count and the start of its first-row
  table from the Datasets drawer. The column dictionary is excluded; the app's
  native horizontal table overflow remains visible.

Feature crops are placed on a shared 664 × 480 canvas using the existing
`surface-tint` token. The script preserves all native text and colours. At the
smallest requested desktop card width, 344.7px, the 12px source text renders at
12 × 2 × 344.7 / 664 = 12.46px. It is larger at 390px and 820px viewports.
The layout tests verify this calculation against the rendered images in both themes.

Course outcomes are adapted from the five course.yml manifests. Live course-home
lesson counts were checked alongside the captures: R 12, dplyr 15, ggplot2 13,
SQL 13; Python 9 ready of 11 planned. Course-home values are used because the SQL
manifest's status can lag the live publishing state.
