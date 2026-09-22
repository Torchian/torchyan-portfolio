# ADR-0005: Character component

**Status:** Accepted
**Date:** 2026-09-21
**Deciders:** Stepan Torchyan

## Context

The character was redesigned in Figma as a set of components:

| Figma | Node | Holds |
|---|---|---|
| Character Body | `3871:1230` | 12 `Clothes=` outfits, 1024×1024 each |
| Character Head | `3183:6631` | 420×780. Booleans `beard`, `cap`, `ears`, `eyes` (eyes and eyebrows together), `face`, `glasses` |
| character_glasses | `3875:1182` | `Glasses style=` default, matrix, pixel, optical |
| Character — Head + Body | `3884:1468` | 1024×1024: body, with the head at `inset: 0 31.25% 30.34% 31.25%` |

What the site needs:
- **A live component**, where any outfit, glasses and part toggle is just props, and changing one at runtime swaps smoothly.
- **Stills for the hero and footer.** They always show one fixed look, so they shouldn't pay for layers.
- **The What I Do section** on the new parts, so every character on the site matches. The pencil drawing stays.
- **The hero's bottom fade in CSS**, not baked into the art.

The previous character was eight SVG files wrapping raster art (150–220 KB each). What I Do placed them with hand-tuned percentages.

## Decision

**Layered raster parts, one geometry file, three consumers.**

- **Assets:** `public/character/v2/{body,head,glasses}/*.webp`.
  - Each Figma fill is placed exactly as Figma draws it (fill, cover, crop, and the ear rotation baked in), rendered at 2× the head frame (bodies at 1×, which is the source's limit), and trimmed to its alpha bounding box.
  - Encoding is WebP q85 with alpha.
  - Made by `scripts/export-character.py`.
- **Geometry:** `src/components/composites/character/characterLayout.json`.
  - Every part's trimmed box, in px of its frame, plus the paint order.
  - Typed access is in `characterLayout.ts`, including `partBox(image, 'head' | 'face')`. The face frame (421×573, 38px down the head) is the box What I Do and its pencil drawing were drawn in.
- **Live:** `<Character clothes glasses cap beard ears eyes eyebrows face headOnly width priority />`.
  - `eyes` and `eyebrows` are separate props (in Figma one boolean drives both).
  - Each part renders through `next/image`, sized from `width`, so the browser gets AVIF or WebP at the size it draws.
  - A prop change swaps one layer: the new image mounts hidden, fades in over 200ms once loaded, and the old one fades out and is dropped. There's no flash, and reduced motion cuts instead of fading.
  - `preloadCharacterParts()` warms the variants a UI is about to offer.
- **Stills:** `scripts/bake-character.py --clothes … --glasses … --no-cap … --size … --out …` composites the same layout into one WebP.
- **What I Do:** `WhatIDoCharacter` (the colour face under the pencil clip) and `WhatIDoCharacterWaiting` (ears, eyes, eyebrows, beard) read the same parts through `partBox(…, 'face')`. The scroll logic is unchanged.

## Hero motion (2026-09-22)

The hero's side characters look at the mouse: the eyes move in their sockets, and the head turns toward the pointer while the body barely moves.

- **Loading:** the page still opens on the baked stills. On the first real mouse move, the live Characters load (the same combinations as the stills) and crossfade in over 300ms once every layer has loaded. The stills then unmount.
  - This happens only on screens that show the side characters, with a fine pointer and without reduced motion.
  - Touch devices, reduced-motion users and phones never download the layers.
- **Motion:** `<Character motion>` reads `--turn-x/y` and `--gaze-x/y` (each −1…1) from an ancestor. `useLookAtPointer` sets them.
  - **Turn:** each layer shifts by its depth (`DEPTH` in `characterLayout.ts`) up to 26×14 design px, and the head tilts up to 3° about the neck. Nearer layers moving further reads as a turn.
  - **Gaze:** the eyes are only 0–2.5px larger than the face's sockets, so they're enlarged 16% to leave room for ±5×2.5px of gaze without an edge showing.
- **Pointer driver:** each character looks at the pointer from where it stands. The eyes ease in about 90ms and the head in about 220ms, so the eyes lead.
  - The rAF loop runs only while something is still moving, and not while the hero is off screen or the tab is hidden.
  - When the pointer leaves the window, both characters ease back to centre.
- **Black and white:** the right character gets `grayscale` (CSS `grayscale(1)`), which uses the same Rec. 709 weights as the baked still.
- **Measured at 1440 on a retina screen:** 60fps (17ms per frame) through pointer sweeps; no style writes once settled. At rest the live characters match the stills to an average difference of about 4/255.

## Options considered

### A: Layered raster parts (chosen)

| Dimension | Assessment |
|---|---|
| Page weight | Only the parts shown are fetched. The default look is about 700 KB of masters and much less after `next/image` resizing. |
| Flexibility | Any combination; one layer per change |
| Fidelity | The Figma fills themselves: MAE 6/255 against Figma's own render, within 1px |
| Upkeep | Re-run the export when the art changes; a new outfit is one line in `BODIES` |

### B: A flattened image per combination

12 outfits × 5 glasses options × 2⁶ toggles is far too many files, and none of them could change live.

### C: SVG parts, like v1

The art is raster, and wrapping it in SVG only adds bytes and decode time.

### D: A runtime canvas composite

It's more JavaScript, delays the first paint until scripts run, and the result looks the same.

## Consequences

- The outfit count costs disk space (about 2 MB for 12), not page weight.
- `eyebrows={false}` shows the face art's brow cut-outs, and `eyes={false}` its eye holes, because that's how the parts were cut in Figma.
- Figma quirks to remember when re-exporting:
  - A rotated node's metadata `x`/`y` is its rotated origin, not its box, so use the design-context insets. The left ear was 8px off.
  - The MCP asset is the raw fill, which can be stretched (glasses) or uncropped (pixel glasses, optical). The export script re-applies Figma's fill, cover or crop.
- The fade on stills is a CSS `mask-image`, as in `SideCharacters`.

## Action items

1. [x] Export parts, write the layout, build `<Character />`, write the bake script.
2. [x] Move What I Do onto the new parts; delete the v1 SVGs.
3. [ ] Bake the hero and footer stills once a variant is chosen.
