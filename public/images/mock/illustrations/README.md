# Mockup illustration exports

Used only by `/mock-a/` and `/mock-b/`. These are deterministic re-exports of
existing artwork, with canvases matched to the site's `surface-tint` token in
each theme. The PNG masters and production derivatives are unchanged.

- `how-it-works`, `foundations`, `learning-steps`, `free-resources`, and
  `learning-roadmap` come from `public/images/illustrations/*.png` and retain
  the existing 1200 × 800 WebP dimensions.
- The six `lesson-*` illustrations come from `public/images/lessons/*.png`
  and retain the existing 800 × 800 dimensions.
- Un-suffixed files use the light palette. `*-dark.webp` uses the dark canvas
  and a luminance/hue adjustment that keeps blue accents and legible lesson
  text while softening white objects. Picture sources follow the system theme.
- Whole-image colour mapping preserves contours, composition and shading;
  no artwork was generated, segmented, cropped or redrawn in these exports.
- All files use WebP quality 88. Run `node scripts/mock-illustrations.mjs`
  from the repository root to reproduce them with Astro's existing Sharp.

The frame, border, padding and section bands are supplied by the mockup CSS.
