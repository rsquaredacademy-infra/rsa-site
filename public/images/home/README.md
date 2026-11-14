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

## Live portrait captures

The home uses `lesson-diagram-portrait{,-dark}.webp` and
`lesson-datasets-portrait{,-dark}.webp` for its two tall cards. These are
**700 × 1900** captures of the live app in each actual theme, rather than
colour-mapped illustrations. Run `node scripts/capture-inside-portraits.mjs`
after the illustration export to reproduce them. Dimensions and capture date
are recorded in `portraits.json` and consumed by the component.

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
- Both variants use `object-fit: contain` over the existing theme tint.
  Desktop gives them two-row slots; tablet pairs them below the square cards;
  phone stacks them with a 640px media-height cap.
