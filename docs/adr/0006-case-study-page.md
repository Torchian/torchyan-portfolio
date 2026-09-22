# ADR-0006: Case Study page

**Status:** Accepted
**Date:** 2026-09-22
**Deciders:** Stepan Torchyan

## Context

Figma section 3155:9107 designs the per-project case study at three sizes: Desktop 3155:10960, Tablet 3920:8937 and Mobile 3921:10850. It has six parts:

1. **Hero:** title, subtitle, description and meta lists, over a screenshot carousel (component 3073:2504, with Start/End/Tablet/Mobile states).
2. **Timeline, "Building Interface Systems":** a long column of steps with a gallery beside it (3155:11129). The gallery has to stay on screen on desktop and tablet and change its images with each step.
3. **System Blueprint & Visual Governance:** the same info cards as the Projects page's Switch Perspective.
4. **Visual System Architecture:** use cases in alternating text and image rows. Figma shows screenshot grids; the page takes a single image, animated in from the sides on scroll.
5. **Positioning:** the Projects page's "Build With Structural Intent".
6. **Footer:** the site footer, already in the layout.

The route already existed (`/projects/[slug]`) with a placeholder hero and body.

## Decision

- **Content:** the copy is in `messages/*.json` under `caseStudy.<slug>`. Imagery is in `src/components/sections/case-study/caseStudyConfig.ts` (`CASE_STUDIES`): carousel rows, one gallery set per Timeline step, and one image per use case.
  - A project gets the new page once both exist. Otherwise it keeps the older layout. Picsart is filled in; Smartbet and SoulOne keep the old layout until their content arrives.
  - Body copy is a list of blocks, and each block is a list of lines: a string is a paragraph, a string array is a bulleted list (`CaseBlocks`). This reproduces the Figma text frames (lines tight within a block, 16px between blocks) without markup in JSON.
- **Hero carousel:** rows of screenshots, each `translateX`'d by the scroll progress through the viewport, alternating direction. The third row covers half the run, as in Figma's Start and End states.
  - The travel is `progress × (100cqw − row width)`, so any row length works. It's written as one CSS variable per frame on the shared scroll driver, gated to when it's in view.
  - Phones show two rows. With reduced motion the rows sit still at the midpoint.
- **Timeline gallery:** an absolutely positioned column beside the steps runs to the viewport's right edge, and a `position: sticky` box inside it sits under the header. Its height is `min(1146px, screen height − header − margins)`.
  - An IntersectionObserver with a centre-line root margin picks the step crossing the middle of the screen, and the gallery crossfades to that step's set.
  - Only the current, outgoing and next sets are mounted, so images load progressively and old sets don't hold GPU memory.
  - On phones the gallery column is hidden, and each step renders one inline image, as in the mobile frame.
- **Blueprint:** the Switch Perspective card was moved into a shared `InfoCard` composite, and both pages use it. The case study lays out five cards: three per row on desktop at 426.67 × 296, centred.
- **Visual System Architecture:** each row reveals once it's 20% in view: the text slides in from its side, the image from the other, both fading in over 0.7–0.9s. A row resets only when it drops back below the screen, so it replays when scrolled into view again.
  - Rows are hidden by script only if they start below the fold, so without JavaScript they simply show.

## Images and performance (2026-09-22)

- **Masters:** WebP (quality 80) at twice their largest drawn size: desktop screens 1600px wide, phone screens 720px, full-page captures 1200px. `npm run images` produces these from any PNG, JPEG or WebP you drop into `public/projects/<project>/`. next/image then serves AVIF or WebP copies at each device's width, cached for 31 days. When you replace an image, use a new file name.
- **The page only does work where you are:** the carousel's rows are GPU layers only while it's on screen, and the Timeline gallery mounts just the current, outgoing and next sets. All images lazy-load, sized per slot through `sizes`.

## Consequences

- A new case study is the copy in `messages` plus one `CASE_STUDIES` entry. No component work is needed.
- **Placeholders to replace:** the Timeline gallery sets and the use-case images are Picsart screenshots standing in until the real images arrive. The Figma gallery showed placeholder shots from other projects.
- **Translations:** the case study copy is English in all three locales until it's translated.
- **Shared components touched:** `SectionHeading` now passes its alignment to a title that wraps, and `PerspectiveSection` uses `InfoCard`.

## Action items

1. [x] Build the page, carousel, sticky gallery, blueprint cards and use-case reveals.
2. [ ] Real Timeline gallery images and use-case images for Picsart.
3. [ ] Case study copy and imagery for Smartbet and SoulOne, and for the other seven projects as their pages come.
4. [ ] Russian and Armenian translations of `caseStudy.*`.
