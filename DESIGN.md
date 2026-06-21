# ORYZO AI — Style Reference
> Cork coaster in a blackout studio — warm material object floating in engineered darkness, every detail lit from within.

**Theme:** dark

ORYZO AI operates as a dark studio production — near-black canvas (#100904), a single warm cream (#ffedd7) text and border color, and a buried burnt-orange accent (#dc5000) that appears only as a hairline flourish. Typography is handled entirely by halyard-display-variable, a high-contrast variable display face that runs from 10px nav labels up to 51px dramatic headlines — all in the same family, all in the same warm cream on darkness. The hero is a photographic product showcase on a warm wood worktop, while subsequent sections strip everything back to pure black with a single 3D-rendered cork coaster floating in void. Components are sparse and architectural: pill-radius and sharp-edge ghost buttons outlined in cream, dashed borders as spatial dividers, and no decorative gradients or drop shadows anywhere. The entire site reads as a single long cinematic scroll — dark, tactile, and theatrically minimal.

## Colors

| Name | Value | Role |
|------|-------|------|
| Studio Black | `#100904` | Page canvas and primary surface. Near-black with a faint warm brown undertone — warmer than pure black, never cold |
| Warm Cream | `#ffedd7` | All text, all nav labels, all borders, all button outlines. The sole foreground color — cream rather than white keeps the contrast warm against the near-black canvas |
| Cork Shadow | `#40372e` | Dashed divider borders and secondary structural lines. One step lighter than canvas, used for subtle spatial separation |
| Dark Cork | `#382416` | Filled button background — the only non-transparent surface in the button system, mid-dark brown that reads as a contained warm swatch against the canvas |
| Burnt Sienna | `#dc5000` | Accent for link underlines, icon strokes, and ghost-button outlines where a chromatic edge is needed. Vivid orange-red used as a hairline signal, never a fill |
| Grey Brown | `#6c5f51` | Mid-tone warm gray for muted text, secondary labels, and deemphasized UI elements |
| Forest Grid | `#445231` | Deep olive green used in product photography and scene surfaces — not a UI token, but defines the photographic palette |

## Typography

### halyard-display-variable — The only typeface on the site, used at every scale from 10px utility labels to 51px cinematic headlines. Weight 400 at body and nav scale; 500 reserved for display headlines. The variable axis allows a single family to carry both whispered captions and room-filling titles. Line-height 0.90 at 51px makes headlines stack with almost no air — deliberate density at large scale.
- **Substitute:** Plus Jakarta Sans, Figtree, or DM Sans
- **Weights:** 400, 500
- **Sizes:** 10px, 12px, 14px, 15px, 18px, 24px, 29px, 41px, 51px
- **Line height:** 0.90–1.33 (tighter at display sizes, looser at body sizes)
- **Letter spacing:** Normal throughout — no tracked-out or compressed settings

### Arial — System fallback at 8px only — appears in button letter-spaced character animations (the duplicated character reveal effect). Not a design system choice, strictly a motion/animation artifact.
- **Substitute:** System sans-serif
- **Weights:** 400, 500
- **Sizes:** 8px
- **Line height:** 1.20

### Type Scale

| Role | Size | Line Height | Letter Spacing |
|------|------|-------------|----------------|
| caption | 10px | 1.2 | — |
| body | 14px | 1.33 | — |
| subheading | 18px | 1.2 | — |
| heading-sm | 24px | 1.1 | — |
| heading | 29px | 1.09 | — |
| heading-lg | 41px | 1 | — |
| display | 51px | 0.9 | — |

## Spacing & Layout

**Density:** comfortable

- **Section gap:** 80-120px
- **Card padding:** 24px
- **Element gap:** 18px

### Border Radius

- **cards:** 12px
- **inputs:** 0px
- **buttons-flat:** 0px
- **buttons-pill:** 36px
- **buttons-rounded:** 22.5px

## Components

### Dark Cork Filled Button
**Role:** Primary labeled action with contained warm-brown background

Background #382416, text #ffedd7, border transparent, border-radius 36px (full pill). Padding 14.4px top/bottom, 24px left/right. Font: halyard-display-variable 14px weight 400. Letters animate with the duplicated character reveal (spaced pairs). No shadow, no hover fill change — only border or opacity transitions.

### Ghost Pill Button
**Role:** Outlined circular or pill action — no background

Background transparent, text #ffedd7, border 1px solid #ffedd7, border-radius 22.5px. Padding 7.5px top/bottom, 0px horizontal (width driven by content). Font: halyard-display-variable 12-14px weight 400. On hover, border transitions via ease 0.3s.

### Flat Ghost Text Button
**Role:** Inline text-level action with no padding or radius

Background transparent, text #ffedd7, border-bottom 1px solid #ffedd7, border-radius 0px. No padding. Behaves as an underlined inline link with button semantics. Font: halyard-display-variable 14px weight 400.

### Ghost Input Field
**Role:** Single-line text entry on dark canvas

Background transparent, text #ffedd7, border-bottom 1px solid #ffedd7 (no surrounding border — bottom only), border-radius 0px. Padding 1px top/bottom, 2px left, 36px right. Font: halyard-display-variable 15px weight 400. Placeholder in #ffedd7 at reduced opacity.

### Dashed Divider Rule
**Role:** Section separator between content blocks

1px dashed border in #40372e. Full-width horizontal line. No padding — purely spatial. Used to delineate footer regions and content boundaries without introducing visual weight.

### Navigation Bar
**Role:** Top-fixed horizontal nav across all sections

Background transparent over hero photography, then #100904 in dark sections. Nav items in halyard-display-variable 12px weight 400, #ffedd7, spaced 18-24px apart. Bottom border 1px solid #40372e. The nav labels animate letter-by-letter with a stagger — each character appears individually in sequence (the I-n-t-r-o split effect visible in raw data).

### Vertical Rotated Label
**Role:** Sideways edge label indicating model or section name

Text #ffedd7, halyard-display-variable 10px weight 400, CSS transform rotate(90deg). Positioned at extreme right edge of viewport. Used for 'ORYZO-1 MODEL' labeling. No background, no border.

### Product Video Thumbnail
**Role:** Corner-anchored play preview chip

Small card, border-radius 12px, background derived from video frame (warm amber/cork tones). Overlaid 'PLAY ORYZO' label in halyard-display-variable 10px #ffedd7. Fixed to bottom-right corner of hero section. Acts as a persistent video trigger.

### Scroll Prompt
**Role:** Animated bottom-center scroll indicator

Text 'SCROLL TO CONTINUE' in halyard-display-variable 10px weight 400, #ffedd7, centered. Accompanied by a downward-pointing chevron icon in #ffedd7. No background. Opacity transitions in/out on ease 0.3s.

## Do's and Don'ts

### Do
- Use #100904 as the universal background — never true black (#000) or any gray, preserving the warm undertone.
- Keep all UI text and borders in #ffedd7 exclusively — introduce no secondary text color except #6c5f51 for genuinely muted helper labels.
- Apply 36px border-radius to filled pill buttons and 22.5px to outlined pill buttons — never mix radii within a button variant.
- Use halyard-display-variable for every typographic element at every scale; Arial is a motion artifact only and must not appear in static layouts.
- Reserve #dc5000 for hairline accents only (1px borders, icon strokes) — never fill a background or button with it.
- Use 1px dashed borders in #40372 to divide sections; use 1px solid borders in #ffedd7 for interactive elements (buttons, inputs).
- Let photography and 3D product renders carry all visual richness — the UI chrome should remain flat, sparse, and dark.

### Don't
- Do not introduce white (#ffffff or #f0f0f0) — Warm Cream (#ffedd7) is the lightest surface in the system.
- Do not add drop shadows, box-shadows, or blur filters to any UI component — elevation is achieved through color and photography only.
- Do not use more than one typeface — halyard-display-variable handles all type roles from 10px to 51px.
- Do not use #dc5000 as a button fill background or large surface color — it functions only as a 1px chromatic hairline.
- Do not letter-track headlines with positive spacing — leave letter-spacing at normal even at display sizes; the typeface's natural metrics define the headline rhythm.
- Do not add intermediate gray backgrounds between canvas and cream — the surface stack has exactly two levels (#100904 and #382416) with no additional cards or panels.
- Do not center-align body copy — all text blocks use left or right alignment following the asymmetric layout grid; centered text appears only in scroll prompts and nav.

## Elevation

Zero shadows across the entire system. Depth is created photographically — the 3D-rendered product is the only source of dimension. UI components sit flat on the canvas; separation between layers comes from color contrast (cream on near-black) and border lines (dashed or solid), never drop shadows or blurs.

## Surfaces

- **Canvas** (`#100904`) — Full-page background across all non-photo sections
- **Raised Cork** (`#382416`) — Filled button surface — only instance of a raised solid surface token
- **Cream Edge** (`#ffedd7`) — All bordered ghost containers, input fields, and nav rule lines at opacity 1

## Imagery

The site is built around a single physical object — a cork coaster — photographed and 3D-rendered in two distinct modes. The hero section uses a high-resolution overhead photograph of a real wooden worktop with a green cutting mat, pencils, and a box cutter: warm, textured, craft-workshop atmosphere. All subsequent sections strip away the physical environment and present the coaster as a 3D render floating against pure #100904 darkness, lit dramatically from one side to reveal cork texture. There is no lifestyle photography, no people, no UI screenshots. The object is the entire visual system. Icon style is minimal line — small stroke icons in #ffedd7 at approximately 1px stroke weight. The site is image-dominant in the hero and then almost purely typographic in dark sections, with the product render as the only image. Images are full-bleed, never contained in cards or rounded-corner frames — they bleed to the viewport edge and occupy 60–80% of section height.

## Layout

Full-bleed, no max-width container — the layout extends edge to edge at all viewport widths. The hero is a full-viewport photograph with headline text at top-left (giant 51px) and body copy at center-right, creating a diagonal tension across the image. Navigation is a minimal top bar with four items (INTRO, FEATURES, PRODUCT, CONTACT) right-aligned in 12px spaced labels, plus the ORYZO wordmark at top-left. After the hero, sections are full-viewport-height dark panels where the 3D product render occupies the center and large display headlines sit at bottom-left with body copy at center-right — a consistent left-headline / center-right-body split that repeats as a spatial rhythm. No card grids, no multi-column feature lists, no pricing tables — purely cinematic single-object sections stacked vertically. The right edge carries a vertical rotated model label. A sticky scroll prompt anchors the bottom center during the scroll journey.

## Similar Brands

- **Lusion.co** — Same full-bleed WebGL product showcase on near-black canvas with sparse cream typography and no UI chrome
- **Teenage Engineering** — Single physical product as sole visual hero, warm-toned dark backgrounds, editorial restraint with no decorative UI
- **Nothing (nothing.tech)** — Dark near-black canvas, single cream/white typeface across all scales, object photography as dominant visual content
- **Aktai Studio** — Agency portfolio with cinematic full-viewport scroll sections, no card grids, typography as structural element on dark background
- **Makr.io** — Warm dark palette (brown-black rather than cool black), display typography at extreme sizes, material object as the only image
