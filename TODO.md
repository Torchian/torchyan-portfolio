# TODO

Deferred items from the homepage review (2026-09-14). Numbers match the review.

## Waiting on design or assets

- [ ] **(10) Years map locations popup** — design coming. The same work should make the locations reachable by keyboard and screen readers (the dots are `aria-hidden`, with hover-only titles).
- [ ] **(9) Image alt text** — after the new image sets arrive. Collage and decorative images get `alt=""`, and duplicates are hidden from screen readers. Affects Selected Work (108 images, "Picsart" ×48), `/projects`, `/projects/[slug]` and the About timeline grid.
- [ ] **Mobile menu panel** — provisional; it isn't in the Figma file yet.

## Later

- [ ] **(2) Contact form sends nothing** — submit only calls `preventDefault()`. To do: pick a service or endpoint, mark fields `required` and validate them, add success and error states, and call `gaEvents.contactFormSubmit`.
- [ ] **(7) Selected Work snap on phones** — cards are `100vh` tall but the snap maths uses `innerHeight`. Snaps drift on browsers with a collapsing toolbar. Do this with the project components update.
- [ ] **(8) Soulone card contrast** — white header text on `#8FAF52` is 2.3:1. It needs 4.5:1, or 3:1 for the large title.
- [ ] **(11) Analytics** — a bigger piece of work, planned for after the project coding is finished. Only applies when the GA / Yandex env vars are set. Yandex Webvisor records sessions, including typing in the contact form, and both trackers load without consent. Options: turn Webvisor off, exclude the form fields, or add a consent banner.
- [ ] **ProjectStickyCard no-images fallback** (isometric grid) — unreachable with the current data. Review it with the project components update.

## Pending decision

- [ ] **(1) What I Do `sepiaToInvert` flashing** — 400ms per cycle with 4 invert swings is about 5 flashes/s. WCAG 2.3.1 allows at most 3/s. An 800ms cycle keeps the same sequence at about 2.5/s.
- [x] **(3 / 12.3) Decorative line art** — done 2026-09-14. The What I Do grid, the three boards and the hero grid lines are WebP now: about 380 KB total, down from about 14.5 MB of SVG. Each was pixel-checked against its SVG at on-page size. The person artwork (character parts, portraits, sketch) is untouched, and the images still load on mobile, since the upcoming mobile design will use them.
- [ ] **(12.2) Glass square tints the background** — `backdrop-filter: saturate(10000%)` also saturates the page and the green glow behind the character, so a rounded rectangle shows around it. Tried on 2026-09-14: a saturated copy of the characters clipped to the square (`SaturationBand`). It made scrolling lag and cut the beard, so it was reverted. This needs a different approach.

## Cleanup to verify

- [ ] **Imported nowhere:**
  - composites: `CapabilityListItem`, `HeroTagline`, `YearMarker`
  - primitives: `Divider`, `NavIcon`, `NavLink`, `RatingDots`, `Stack`
  - `sections/selected-work/SelectedWorkCard`
  - hooks: `use-intersection`, `use-media-query`, `use-mounted`, `use-theme`
- [ ] **Capabilities skill "Playground experiments"** — kept. It's a skill label, not the removed Playground page.

## Projects page (Figma 3155:9789)

- [ ] **Responsive design** — only the desktop frame exists; the page is built for desktop.
- [ ] **Real content per project** — the Figma frame reuses the same copy, tech stack and artwork across rows (three "World Education" and three "Smartbet" rows). Content lives in `src/components/sections/projects-page/projectShowcaseConfig.ts`.
- [ ] **World Education "View Case Story"** — there's no case study page yet, so the CTA opens `/case-studies`.
- [ ] **"View Random Case"** — links to `/projects/picsart` for now; decide whether it should pick a random case.
- [ ] **Collage hover state** — each collage component in Figma has a hidden "CTA Secondary"; the hover state isn't built.
- [ ] **SoulOne collage image quality** — Figma's export caps these tall screenshots at 4096px high, so they arrive only 142–455px wide and look soft on retina. Replace them with the original screenshots.
