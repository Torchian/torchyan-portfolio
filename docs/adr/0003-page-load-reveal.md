# ADR-0003: Covering the first load of scroll-driven pages

**Status:** Accepted
**Date:** 2026-09-15
**Deciders:** Stepan Torchyan

## Context

Reloading the home page mid-scroll showed broken states for up to a second or two:
- the What I Do face without its beard or eyes, in grayscale;
- Selected Work cards caught mid-magnification;
- the page jumping through Capabilities and a project card before landing.

Headless Chrome reload timelines at 1000px and 1440px narrowed the causes to three:

1. **Server defaults.** Several sections are drawn from values only the browser can measure: `--reveal`, `--grayscale`, the beard's `--opacity`, the pencil/colour clip, `--card-progress`, and the Capabilities geometry. The server HTML carries their top-of-section defaults, which are wrong wherever the visitor actually is, until hydration writes the real values. That took about 0.3–1s in dev.
2. **Scroll restoration.** On reload the browser restores the scroll position while the page is still growing, so it passes through other sections and keeps nudging the position until the layout settles.
3. **Stale measurements.** The scroll driver only re-measured on scroll and resize. A layout change without a scroll (fonts swapping in, images loading, the restored position) left effects on stale values until the visitor next scrolled.

The server can't know the visitor's scroll position, so no server-rendered default is right everywhere.

## Decision

1. **`src/components/layouts/PageLoader.tsx`**
   - **What it is:** a full-screen overlay (page background, logo mark, a thin track with a green glint) rendered in the root layout's server HTML. It covers the page from the first paint on a document load; client-side navigation keeps the root layout mounted, so it doesn't appear then.
   - **When it lifts:** once the page has loaded, fonts are ready, and both the page height and the scroll position have held still for 150ms. It then asks every scroll effect for a fresh frame and fades out over 400ms.
   - **Caps:**
     - It never stays longer than 4s, however slow the network.
     - A CSS animation hides it after 6s even if JavaScript never runs.
     - A timer, not an animation frame, lifts it, so background tabs aren't stuck behind it.
   - **Accessibility:** `role="status"` with a translated "Loading" (`common.loading`); the glint stops under reduced motion.
2. **`src/lib/scroll-driver.ts`** requests a frame on `load`, on `document.fonts.ready`, and whenever the document's size changes (a `ResizeObserver` on `<html>`). Effects now correct themselves after any layout shift, with or without the loader. It doesn't arm the idle timer, so a late image never triggers a Selected Work snap.
3. **`src/components/primitives/LogoMark.tsx`**: the logo SVG, shared by the NavBar and the loader.

## Options considered

### A: Loader covering first load, plus self-correcting scroll effects (chosen)

| Dimension | Assessment |
|---|---|
| Complexity | Low: one component, three listeners |
| Cost | Content shows up to ~0.5–2s later on a cold load (capped at 4s); LCP moves to reveal time |
| Robustness | Covers every scroll-driven section, present and future |
| Brand | A designed moment instead of glitches |

**Pros:** hides all three causes at once, and the driver change fixes the underlying staleness too.
**Cons:** adds a short wait on every full load, including fast ones; the design is provisional (not in Figma).

### B: Hide only the scroll-driven sections until their first frame

**Pros:** the rest of the page shows immediately.
**Cons:** the scroll-restoration jumps (cause 2) stay visible, and every new effect must opt in.

### C: Reset scroll to the top on reload (`history.scrollRestoration = 'manual'`)

**Pros:** no restoration jumps, and the server defaults are right at the top.
**Cons:** visitors lose their place on every reload, which breaks expected browser behaviour.

### D: Driver fix only

**Pros:** no loader wait.
**Cons:** the pre-hydration frames (cause 1) still flash.

## Consequences

- New scroll-driven effects are covered automatically, as long as they subscribe to the shared scroll driver.
- The overlay's timing constants live at the top of `PageLoader.tsx`: `MAX_WAIT_MS`, `STABLE_MS`, `FADE_MS`, `FAILSAFE_S`.
- To revisit: the loader's visual design once it's in Figma, and the reveal timing on a production deploy (dev hydration is much slower).

## Action items

1. [x] PageLoader in the root layout; LogoMark shared with the NavBar.
2. [x] Scroll driver re-measures on load, fonts and document resize.
3. [ ] Design the loader in Figma and replace the provisional one.
4. [ ] Check reveal timing on the production deploy.
