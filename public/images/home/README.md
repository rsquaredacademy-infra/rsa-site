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

## Live square card captures

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
