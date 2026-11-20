# Home illustration exports

Used by the home page. These are deterministic re-exports of
existing artwork, with canvases matched to the site's `surface-tint` token in
each theme. The PNG masters and production derivatives are unchanged.

- `how-it-works`, `foundations`, `learning-steps`, `free-resources`, and
  `learning-roadmap` come from `public/images/illustrations/*.png` and retain
  the existing 1200 × 800 WebP dimensions.
- The six square `lesson-*` illustrations come from `public/images/lessons/*.png`
  and retain the existing 800 × 800 dimensions.
- Un-suffixed files use the light palette. `*-dark.webp` uses the dark canvas
  and a luminance/hue adjustment that keeps blue accents and legible lesson
  text while softening white objects. Picture sources follow the system theme.
- Whole-image colour mapping preserves contours, composition and shading;
  no artwork was generated, segmented, cropped or redrawn in these exports.
- All files use WebP quality 88. Run `node scripts/mock-illustrations.mjs`
  from the repository root to reproduce them with Astro's existing Sharp.

The frame, border, padding and section bands are supplied by the home CSS.

## Intro SQL query aids (2026-11-20)

`lesson-sql-plan{,-dark}.webp` contains real production captures from
https://app.rsquaredacademy.com/intro-sql/units-sold-by-category in each native
theme. Reproduce with the existing capture script's SQL mode:

```powershell
node scripts/capture-inside-cards.mjs --sql-plan --solution-file <path-to-09d-units-sold-by-category.md>
```

The script waits for the guided tour and dismisses it with Escape, resizes the
panes with the native divider, clicks the Plan it summary, fills the editor from
the supplied file's `sql solution` chunk and submits it. It waits for Correct and
the clause recap, then captures the complete open Plan it card and recap without
changing their text or colours. Each theme is captured separately at device scale
2 and exported as an 800 × 800 WebP at quality 90. The cards are stacked with a
40px gap, 72px side padding and centred vertical padding on the site's theme tint,
matching the generous square composition of `lesson-hints`. `sql-plan.json`
records the source, capture date and dimensions. These images are used only on
the home page; the lesson tiles are unchanged.

## Step-through and Datasets cards (2026-11-15)

Aravind picked illustrations in the same style as the other cards (option C of three):
`lesson-stepthrough` and `lesson-datasets-panel`, generated with gpt-image-2 using the
same style prompt as the other lesson tiles (masters in `public/images/lessons/`), then
exported here by `scripts/mock-illustrations.mjs` like the rest. Text and values come
from the dplyr lesson data (sales.csv: S-0001 Latte Large 3 … S-0005 Cappuccino Large 1;
160 rows · 7 columns; stores.csv 9 rows · 6 columns). The live captures below are kept
for reference but no longer used on the home page.

## Live square card captures (superseded 2026-11-15)

The home uses `lesson-diagram-card{,-dark}.webp` and
`lesson-datasets-card{,-dark}.webp`, captured from the actual app in both
themes. Run `node scripts/capture-inside-cards.mjs` to reproduce them;
`cards.json` records the source, date and 1000 × 1000 dimensions.

- Diagram: resize the lesson pane using its native divider, then capture both
  filter steps with their code, explanations and full tables. Only playback
  controls are removed; the two frames are stacked in a square canvas.
- Datasets: capture the native mobile drawer header and the complete sales.csv
  and stores.csv cards, then place the two dataset cards beside each other.
  Horizontal table overflow remains as supplied by the app.
- Both compositions preserve each capture's aspect, using the theme tint for
  the canvas. No lesson text is changed. Only navigation and pane resizing
  are used; the script does not run code or submit exercises.
- CSS uses square media with `object-fit: cover`, so images fill the card
  width without distortion. Matching capture and frame aspects avoid content
  clipping. Three desktop columns become two on tablet and one on phone;
  subgrid shares image, heading and description tracks across each row.

## Previous live portrait captures

The retained `lesson-diagram-portrait{,-dark}.webp` and
`lesson-datasets-portrait{,-dark}.webp` assets are superseded. These are
**700 × 1900** captures of the live app in each actual theme, rather than
colour-mapped illustrations. Run `node scripts/capture-inside-portraits.mjs`
after the illustration export to reproduce them. Dimensions and capture date
are recorded in `portraits.json`.

Source: https://app.rsquaredacademy.com/dplyr/filter-predict

- Diagram: two vertically stacked frames, before and after `filter()` keeps
  the Large sales. Captured at 390px, device scale 2 and 130% browser zoom.
  Playback controls are cropped out; the real code, step labels, explanations
  and tables remain. The source app abbreviates some narrow table cells.
  A 24px theme-tint separator divides the frames. No UI text is substituted.
- Datasets: the actual desktop 560px-wide drawer at 1520px viewport height,
  showing its header, column dictionaries and first rows. The app's horizontal
  table overflow and vertical drawer clipping remain as supplied by the app.
- Capturing uses only Next, Skip tour and Datasets. It does not run code,
  answer an exercise, submit work or change course content.
- The previous layout used `object-fit: contain`, two-row desktop slots and
  a 640px phone media-height cap.
