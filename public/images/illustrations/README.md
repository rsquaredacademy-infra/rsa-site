# Section illustrations

AI-generated conceptual illustrations for the current Home, Courses, How we teach, About and Support sections. Assets only: pages, components, tokens and existing images are unchanged. Repeated sections share an illustration.

## Current section inventory

Inventory taken from `src/pages/index.astro`, `courses/index.astro`, `how-we-teach/index.astro`, `about/index.astro` and `support/index.astro` before generation. Small icons, numbered steps and text cards are not counted as section illustrations.

| Current section | Illustration or existing visual |
| --- | --- |
| Home / Hero | Existing lesson-player image; no new asset. |
| Home / How it works | how-it-works |
| Home / How you'll learn | learning-steps |
| Home / Three free courses to start with | foundations (home cards currently have no visual) |
| Home / Package trust | open-source |
| Home / Free resources | free-resources |
| Home / Paid tracks coming in 2027 | learning-roadmap |
| Home / Sign-up | updates |
| Courses / Introduction | courses-overview |
| Courses / Foundations | Existing CourseVisual illustrations; no replacement. |
| Courses / How you'll learn | learning-steps |
| Courses / See how a lesson works | Existing six lesson illustrations from 29a69ad; no replacement. |
| Courses / Paid tracks | learning-roadmap |
| Courses / Hear when the free courses open | updates |
| How we teach / Introduction | teaching-overview |
| How we teach / R in your browser | browser-learning |
| How we teach / Four steps in every idea | learning-steps |
| How we teach / Feedback that teaches | teaching-feedback |
| How we teach / One realistic dataset | realistic-dataset |
| How we teach / Pictures where they help | visual-learning |
| How we teach / Short lessons | short-lessons |
| How we teach / Start with the free courses | teaching-overview |
| About / Introduction | about-overview |
| About / Our story | academy-story |
| About / Who runs Rsquared Academy | academy-maintainer |
| About / How we work | academy-principles |
| About / The R packages olsrr, descriptr and rfm | open-source |
| About / Get in touch | contact |
| About / Sign-up | updates |
| Support / Introduction | support |
| Support / Please include | support-details |
| Support / Common problems | support-faq |
| Support / More help | contact |

There is no standalone roadmap page or section in the current routes. `learning-roadmap` illustrates only the existing future paid-track sections; it contains no dates or promises. Other routes (Educators, Resources, Open source, Contact and policy/utility pages) are outside this brief's named page inventory. Existing book covers and package hex stickers remain available for those routes.

## Files and alt text

Each name below has a **1536 × 1024 PNG master** (`name.png`) and a **1200 × 800 WebP derivative** (`name-web.webp`, quality 88, Lanczos resize, no crop). Prefer the WebP when pages are wired later. These are illustrations, not screenshots or factual diagrams. Alt text below describes the artwork; use `alt=""` when an image is decorative beside equivalent section copy.

| Section(s) | PNG master | Suggested alt text | Estimated generation cost (USD) |
| --- | --- | --- | --- |
| Home / How it works | [how-it-works.png](how-it-works.png) | Illustration of a book, a practice window and a check mark connected in a loop. | ~$0.042 |
| Home and Courses / How you'll learn; How we teach / Four steps in every idea | [learning-steps.png](learning-steps.png) | Illustration of a blue ball progressing up four rounded steps. | ~$0.042 |
| Home / Three free courses to start with | [foundations.png](foundations.png) | Illustration of three books supported by a broad foundation block. | ~$0.042 |
| Home / Package trust; About / The R packages olsrr, descriptr and rfm | [open-source.png](open-source.png) | Illustration of open boxes linked by blue branches. | ~$0.042 |
| Home / Free resources | [free-resources.png](free-resources.png) | Illustration of an open book, blank notebook and play tile. | ~$0.042 |
| Home / Paid tracks coming in 2027; Courses / Paid tracks | [learning-roadmap.png](learning-roadmap.png) | Illustration of three branching paths toward distant learning milestones. | ~$0.042 |
| Home and About / Sign-up; Courses / Hear when the free courses open | [updates.png](updates.png) | Illustration of an open envelope carrying a blank blue card. | ~$0.042 |
| Courses / Introduction | [courses-overview.png](courses-overview.png) | Illustration of three learning paths opening from a book. | ~$0.042 |
| How we teach / Introduction; How we teach / Start with the free courses | [teaching-overview.png](teaching-overview.png) | Illustration of a blue seedling growing beside an open book. | ~$0.042 |
| How we teach / R in your browser | [browser-learning.png](browser-learning.png) | Illustration of a blank browser frame with a blue play symbol. | ~$0.042 |
| How we teach / Feedback that teaches | [teaching-feedback.png](teaching-feedback.png) | Illustration of blank speech bubbles beside a guiding blue light. | ~$0.042 |
| How we teach / One realistic dataset | [realistic-dataset.png](realistic-dataset.png) | Illustration of a plain coffee cup and parcel resting on a shared tray. | ~$0.042 |
| How we teach / Pictures where they help | [visual-learning.png](visual-learning.png) | Illustration of a magnifying glass revealing a blue geometric shape. | ~$0.042 |
| How we teach / Short lessons | [short-lessons.png](short-lessons.png) | Illustration of a compact book beside a simple hourglass. | ~$0.042 |
| About / Introduction | [about-overview.png](about-overview.png) | Illustration of a book, shared building blocks and a growing plant. | ~$0.042 |
| About / Our story | [academy-story.png](academy-story.png) | Illustration of blank books unfolding into a welcoming learning space. | ~$0.042 |
| About / Who runs Rsquared Academy | [academy-maintainer.png](academy-maintainer.png) | Illustration of a carefully maintained book and a blue tool. | ~$0.042 |
| About / How we work | [academy-principles.png](academy-principles.png) | Illustration of an open book supported by interlocking blue and white forms. | ~$0.042 |
| About / Get in touch; Support / More help | [contact.png](contact.png) | Illustration of a paper plane beside an open envelope. | ~$0.042 |
| Support / Introduction | [support.png](support.png) | Illustration of a welcoming life ring beside a blank speech bubble. | ~$0.042 |
| Support / Please include | [support-details.png](support-details.png) | Illustration of a blank note, attachment clip and magnifying glass. | ~$0.042 |
| Support / Common problems | [support-faq.png](support-faq.png) | Illustration of interlocking puzzle pieces with a blue piece fitting into place. | ~$0.042 |

## Generation and cost

- Model: `gpt-image-2`, Image API, `quality=medium`, `size=1536x1024`, `n=1`, `output_format=png`.
- Execution: bundled imagegen CLI, `generate-batch --no-augment`; one full prompt per distinct asset. No page integration.
- Style source: existing www lesson illustrations from commit `29a69ad`. Their original generator uses pale `#f6f8fc`, blue `#2563eb`, white rounded forms and soft shadows. This set removes all code, data and writing.
- Expected retained-image cost: **22 × ~$0.042 = ~$0.924**.
- Two initial style probes were rejected for excessive 3D depth: **~$0.084**. Rejected probes are not included in this asset directory.
- Estimated task total including rejected probes: **~$1.008 (about $1.01)**, below the $5 ceiling. Local resizing and the contact sheet require no API generation.
- Cost basis: [OpenAI image-generation cost guide](https://developers.openai.com/api/docs/guides/image-generation), medium 1536 × 1024 output estimate ~$0.041 plus ~$0.001 prompt-input allowance per call. These are estimates, not a billing export: the bundled CLI saves image bytes but does not persist response usage. Actual token charges may differ.

## Shared prompt

The full prompt for each retained image is the following shared prefix immediately followed by its subject prompt below. No automatic prompt augmentation was used.

```text
Use case: illustration-story
Asset type: flat editorial website section illustration, landscape 3:2.
Style/medium: STRICTLY TWO-DIMENSIONAL FLAT VECTOR-STYLE GRAPHIC matching minimal learning website tiles. Soft pale blue-grey solid background #f6f8fc, white rounded silhouettes and cards, delicate blue-grey outlines, barely visible soft drop shadows beneath flat cutout shapes. Pale blue #eaf1ff secondary fills, brand blue #2563eb the only strong accent. Flat uniform fills, crisp smooth edges, generous whitespace. Every object is drawn as a simplified flat icon-like illustration, NOT a rendered physical product.
Composition: a balanced central arrangement viewed straight on, ample clear margins, every silhouette fully visible. Use overlap and simple connecting curves only; no perspective, dimensional modelling, extrusion, bevels, clay, gloss, realistic lighting, volumetric shading, textures or gradients.
Text: none.
Constraints: absolutely no text, letters, numbers, code, labels, pseudo-writing, data, tables, graphs, charts, axes, ticks, logos, watermarks, people or faces. Conceptual metaphors only; never an app screenshot.
Subject: ```

## Subject prompts

### how-it-works

Section: Home / How it works.

```text
An open blank book on the left, an empty upright rounded practice frame in the centre, and a white disc bearing a blue check mark on the right. One curved blue line connects these physical objects. Purely conceptual, no software interface details.
```

### learning-steps

Section: Home and Courses / How you'll learn; How we teach / Four steps in every idea.

```text
Four broad rounded white steps ascending gently from left to right. A single blue ball rests at the top. A delicate curved blue trail rises along the steps. The steps have no markings.
```

### foundations

Section: Home / Three free courses to start with.

```text
Three upright blank white books with different heights stand on a single broad white foundation slab. One book has a solid blue spine, the others have pale blue spines. Grounded simple architectural arrangement.
```

### open-source

Section: Home / Package trust; About / The R packages olsrr, descriptr and rfm.

```text
An open white cube-shaped box in the centre, with a simple blue branch extending to two smaller open white boxes. A few blue rounded building blocks sit inside the boxes. A metaphor for shared open-source tools, no symbols on the boxes.
```

### free-resources

Section: Home / Free resources.

```text
A generously spaced still life: an open blank white book, a closed blank pale-blue notebook and a small upright white tile containing only a single blue triangular play symbol. All objects are unbranded and unmarked.
```

### learning-roadmap

Section: Home / Paid tracks coming in 2027; Courses / Paid tracks.

```text
A broad pale-blue path starts at the lower centre and gently branches toward three simple white rounded gateway arches at the horizon. A single brand-blue milestone pebble sits near the start. No flags, timelines or dates. A conceptual future-learning journey.
```

### updates

Section: Home and About / Sign-up; Courses / Hear when the free courses open.

```text
A single open white envelope holding one completely blank blue rounded card, accompanied by a tiny white bell with a blue clapper. No notification counts or interface controls. Calm, welcoming still life.
```

### courses-overview

Section: Courses / Introduction.

```text
A blank open white book in the foreground, with three soft pale-blue ribbons unfolding from the pages toward three blank white upright booklets behind. A single blue ribbon provides the focal accent. No charts or interface.
```

### teaching-overview

Section: How we teach / Introduction; How we teach / Start with the free courses.

```text
A small blue seedling emerges from a rounded white pot beside an open blank book. A gently curving pale-blue line links the book and the seedling. Learning by practice expressed as growth.
```

### browser-learning

Section: How we teach / R in your browser.

```text
One large floating white rounded rectangular window with a thin pale-blue top rim and a single blue triangular play symbol in its otherwise empty centre. A soft pale-blue cloud-like shape sits behind the window. No address bar, tabs, code, toolbar, controls or screenshot details.
```

### teaching-feedback

Section: How we teach / Feedback that teaches.

```text
Two overlapping completely empty white speech bubbles, one small and one large, beside a simple blue lightbulb shape with a white inner glow. A thin curved connector suggests patient guidance. No text-like lines inside bubbles.
```

### realistic-dataset

Section: How we teach / One realistic dataset.

```text
A plain white coffee cup on a saucer and a small unbranded white parcel rest on a broad rounded pale-blue tray. One small solid blue tag without a hole or marking rests beside them. A metaphor for everyday business contexts, no data representation.
```

### visual-learning

Section: How we teach / Pictures where they help.

```text
A large white-rimmed magnifying glass lies over a simple blue geometric knot made from smooth interlocking loops. The lens reveals the shape clearly. No letters, diagrams, graphs, labels or annotations.
```

### short-lessons

Section: How we teach / Short lessons.

```text
A slim blank white pocket book with one blue bookmark beside a small white-framed hourglass containing pale-blue sand. The hourglass is a physical object without ticks, numerals or dials. Plenty of breathing room.
```

### about-overview

Section: About / Introduction.

```text
An open blank book in front, a compact cluster of white interlocking building blocks behind and a small blue leafy sprig to one side. A cohesive still life connecting learning, making and growth.
```

### academy-story

Section: About / Our story.

```text
A small stack of blank white books on the left gradually opens into a broad open book on the right. A single curved blue ribbon travels between them. A gentle progression from published material to active learning, no timeline.
```

### academy-maintainer

Section: About / Who runs Rsquared Academy.

```text
An open completely blank white book on a clean pale surface beside a simple small blue spanner and a neatly arranged pair of unmarked white building blocks. A metaphor for writing and maintaining learning tools. No person or portrait.
```

### academy-principles

Section: About / How we work.

```text
An open blank white book rests on three solid rounded interlocking supports, two white and one blue. A small open loop in pale blue encircles the base. A metaphor for practical, accessible, shared learning, no emblems or badges.
```

### contact

Section: About / Get in touch; Support / More help.

```text
A simple white folded paper plane angled upward beside an open white envelope. A single blue curved trail gently links the two. No writing, postal stamps, addresses or logos.
```

### support

Section: Support / Introduction.

```text
A white life ring with small pale-blue bands rests beside a single completely empty white speech bubble. One band of the ring is brand blue. Calm and reassuring, no emergency scene or people.
```

### support-details

Section: Support / Please include.

```text
A completely blank white note card held by one blue paperclip, with a small white-rimmed magnifying glass leaning against it. A simple white envelope sits behind. No lines, bullets, forms or writing.
```

### support-faq

Section: Support / Common problems.

```text
A small cluster of rounded white jigsaw pieces with a single blue piece hovering just above its matching gap. Clear and calm physical puzzle, no question marks, symbols, lettering or diagrams.
```

## Review

All 22 retained masters were inspected individually. All 22 WebP derivatives were reviewed together in a contact sheet. The retained set passes checks for a consistent pale surface and blue palette, clean illustrative style, complete focal objects, and absence of text, code, data, labels, brand logos and people. Light outlines and soft shading vary slightly across the generated artwork.

File validation confirms that every PNG decodes at 1536 × 1024, every WebP decodes at 1200 × 800, and all 22 master hashes are distinct. The 22 WebP files total 433,858 bytes (9,422–41,708 bytes each). Resize preserves the full 3:2 composition without cropping. The contact sheet uses the WebP derivatives, with file labels outside the artwork.

Repository validation: `npm run build` and `npx astro check` passed; Astro reported zero errors, warnings and hints. Integration into pages is deferred.
