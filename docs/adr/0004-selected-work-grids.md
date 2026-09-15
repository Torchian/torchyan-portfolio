# ADR-0004: Selected Work cards and screenshot grids

**Status:** Accepted
**Date:** 2026-09-15
**Deciders:** Stepan Torchyan

## Context

The Selected Work section is a stack of full-screen sticky cards, one per case study. Figma redesigned them:

- **Single Project** (2300:1687): the company and roles, then a screenshot grid with a centred CTA filling the rest of the screen, then title, description and field. There are Desktop, Tablet and Mobile layouts.
- **One grid per project:** Smartbet 2283:1279, Picsart 2311:2405 and Soulone 2346:512. Each has:
  - three columns of screenshots projected onto an isometric plane;
  - a Default and a Hover state for desktop, where the columns slide along their axes;
  - a Tablet and a Mobile arrangement.
- **A fourth card for all projects:** Various, 2350:656, has four upright columns that slide vertically on hover, and a "View All Cases" CTA.
- **CTA Secondary** gains a brand-gradient resting state, a hover state with a glass halo, and a solid "Hover Default" state.

What shapes the implementation:

- **Real sizes aren't design sizes.** The grid's box is whatever height the viewport leaves after the header and footer. Figma's frames are fixed: 1440 × 680, 976 × 680 and 448 × 680.
- **Exact positions.** The columns sit at exact, per-state coordinates, and hover is a slide between two of them.
- **Performance.** Four cards × 8–15 large screenshots, in a section that already runs scroll-driven snapping and a push-in scale.
- **Other users of the config.** `PROJECTS` also feeds the sitemap, the case-study routes and the About timeline, so a card that isn't a case study must not become one.

## Decision

- **Grid data** lives in `projectGrids.ts`. Per grid it holds:
  - every column's images: tile aspect, crop position and screen restrictions;
  - the column's width and position per screen, plus its hover position.

  Isometric columns store their projected centre, which is Figma's bounding box `left + width/2`, `top + height/2`. Flat columns store their top-left corner.
- **The card** (`ProjectStickyCard.tsx`) lays each grid out in its Figma frame, inside a stage:
  - The stage covers the media box through container units: `--u: max(100cqw / frameW, 100cqh / frameH)`, one frame px.
  - Every column is `position: absolute` with a single `transform`: translate by `x·u`, `y·u`, centre, then `rotate(∓30°) skewX(±30°) scaleY(0.866)`. That's exactly the matrix behind Figma's bounding boxes.
  - Hover and focus-within change only that transform, on desktop (above 1024px) with a fine pointer. Tablet and mobile use their own positions and have no hover.
- **The CTA** is centred on the media box, and sits 64px above its bottom on mobile. It is positioned against the box, not the stage, so cover-cropping never pushes it out of view.
- **`CTASecondary`** gains:
  - `fill`: a resting background, faded out through `::after` opacity because gradients can't transition;
  - `appearance="dark"`: Hover Default;
  - `activeBelow`: the active look on touch-sized screens, which the tablet and mobile designs show.

  The halo gets the header glass blur. The body grows past 196px for longer labels instead of clipping.
- **The all-projects card** is `AllProjectsStickyCard`. Its copy is in `selectedWork.allProjects` and it links to `/projects`. It is not added to `PROJECTS`.
- **Images:**
  - Screenshots already in the repo are reused.
  - Figma-only ones are exported and converted to WebP. Soulone's grid uses different captures from its case study, and Various is new.
  - All of them go through `next/image` (`fill`, lazy, `sizes` per column).

## Options considered

### A: Frame-space layout scaled with container units (chosen)

| Dimension | Assessment |
|---|---|
| Complexity | Medium: numbers in config, one transform per column |
| Fidelity | Matches Figma coordinates at every state; covers any box |
| Performance | Transforms only; no JS measuring, no layout on hover |
| Maintainability | A new grid is data; a Figma move is a number change |

**Pros:** exact to the design; resize-proof without JS; hover is a compositor transition.
**Cons:** hand-derived coordinates; container query units need Safari 16+ and Chrome 105+.

### B: Keep the generic rotated masonry

| Dimension | Assessment |
|---|---|
| Complexity | Low |
| Fidelity | Poor: can't express per-column isometric positions or the flat Various grid |
| Performance | Duplicated image tracks for infinite scrolling, 50+ images per card |

**Cons:** doesn't match the new design, and loads twice the images.

### C: Measure the box in JS and position columns with inline styles

| Dimension | Assessment |
|---|---|
| Complexity | Medium–high: ResizeObserver plus state per card |
| Performance | A React re-render or style write on every resize; SSR renders unscaled |

**Cons:** a flash before hydration, and more work on the scroll-critical section. CSS already expresses "cover" directly.

### D: Export each grid state as one flattened image

**Pros:** trivial to lay out.
**Cons:** no column slide on hover, heavy files for every state and screen, and blurry when scaled to cover.

## Trade-off analysis

Option A keeps the design's own coordinate system, so fidelity and maintenance both come from the same numbers. The cost is a data file of hand-derived centres, and every value in it can be traced to a Figma bounding box. A JS measurement layer (C) would buy nothing CSS can't already do, and it would add work to the section that's most sensitive to scrolling.

## Consequences

- Updating a grid from Figma means copying the new bounding boxes into `projectGrids.ts`.
- The cover scale crops the frame's edges when the box's aspect ratio differs from the design's. Tall tablets crop left and right; short desktop windows crop top and bottom.
- The card background is now the dark gradient on every card. Brand gradients appear only on the CTA at rest; the case-study hero keeps using `project.gradient`.
- `selectedWork.preview` and `selectedWork.previewAlt` are gone with the isometric placeholder.
- The all-projects copy in ru and hy is a draft, to review with the rest (TODO.md).

## Action items

1. [x] Grid data for Smartbet, Picsart, Soulone and Various, for desktop, hover, tablet and mobile.
2. [x] Card layout for Desktop, Tablet and Mobile; stage cover scaling; hover slide.
3. [x] CTA Secondary brand fills, dark appearance and `activeBelow`.
4. [x] All-projects card with en, ru and hy copy.
5. [ ] Review the all-projects copy (en draft, ru and hy translations).
6. [ ] Swap the Soulone grid captures for higher-resolution originals if they exist (Figma exports cap at 4096px).
