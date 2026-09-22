# TODO

Deferred items from the homepage review (2026-09-14). Numbers match the review.

## Waiting on design or assets

- [ ] **(10) Years map locations popup** — design coming. The same work should make the locations reachable by keyboard and screen readers (the dots are `aria-hidden`, with hover-only titles).
- [ ] **(9) Image alt text** — after the new image sets arrive. Collage and decorative images get `alt=""`, and duplicates are hidden from screen readers. Affects `/projects`, `/projects/[slug]` and the About timeline grid.
- [ ] **Mobile menu panel** — provisional; it isn't in the Figma file yet.
- [ ] **Placement of the sound and language controls** — the components now follow Figma (Sound CTA 3690:10694, language_switcher 3690:10528), but where they sit in the header isn't designed yet. Right now they flank the link pill above 1024px (language on the left, sound on the right), and appear as "Language" / "Sound" rows in the menu panel at 1024px and below.
- [ ] **Page loader** — provisional; it isn't in the Figma file yet. It's a full-screen logo with a green glint, shown on full page loads until the layout settles (`src/components/layouts/PageLoader.tsx`, see `docs/adr/0003-page-load-reveal.md`).
- [ ] **Picsart grid hover, middle and right columns** — Figma's Hover variant (3662:2958) only moves the first column. In code the middle column slides 400px up-right and the right one 220px down-left, alternating like Smartbet and Soulone (`src/components/sections/selected-work/projectGrids.ts`). About 428px and 236px are the most they can travel before a column end shows. Update the variant, or confirm these values.
- [ ] **More sounds** — hover, focus/active, fade-in/out and random-motion cues, once the assets arrive. Each one is a cue in `src/lib/sound/sounds.ts` plus a `soundTriggers(...)` attribute or a `playSound(...)` call (see `docs/adr/0001-sound-system.md`).

- [x] **Hero character stills**: done 2026-09-22. Left: Big Lebowski, colour, no cap or glasses. Right: Matrix with the default glasses, black and white. Each is only its visible half, and the phone hero's portrait is the full left character. All three are baked with `scripts/bake-character.py`.
- [ ] **Hero characters: blink / idle glance?** — they follow the mouse now (ADR 0005, "Hero motion"). An occasional blink, or a glance around when the pointer is idle, could be added with the same layers.
- [ ] **Footer character still**: pick a combination, bake it, and swap it in for `public/footer/portrait-mesh.webp`. See `docs/adr/0005-character-component.md`.

## Later

- [ ] **(2) Contact form sends nothing** — submit only calls `preventDefault()`. To do: pick a service or endpoint, mark fields `required` and validate them, add success and error states, and call `gaEvents.contactFormSubmit`.
- [ ] **(7) Selected Work snap on phones** — cards are `100vh` tall but the snap maths uses `innerHeight`. Snaps drift on browsers with a collapsing toolbar. Do this with the project components update.
- [x] **(8) Soulone card contrast** — resolved 2026-09-15: every Selected Work card now has the dark background (Figma 2300:1687); the brand gradient is only on the resting CTA.
- [ ] **(11) Analytics** — a bigger piece of work, planned for after the project coding is finished. Only applies when the GA / Yandex env vars are set. Yandex Webvisor records sessions, including typing in the contact form, and both trackers load without consent. Options: turn Webvisor off, exclude the form fields, or add a consent banner.
- [x] **ProjectStickyCard no-images fallback** — removed 2026-09-15 with the grid rebuild (`docs/adr/0004-selected-work-grids.md`).

## Pending decision

- [ ] **(1) What I Do `sepiaToInvert` flashing** — 400ms per cycle with 4 invert swings is about 5 flashes/s. WCAG 2.3.1 allows at most 3/s. An 800ms cycle keeps the same sequence at about 2.5/s.
- [x] **(3 / 12.3) Decorative line art** — done 2026-09-14. The What I Do grid, the three boards and the hero grid lines are WebP now: about 380 KB total, down from about 14.5 MB of SVG. Each was pixel-checked against its SVG at on-page size. The person artwork (character parts, portraits, sketch) is untouched, and the images still load on mobile, since the upcoming mobile design will use them.
- [ ] **(12.2) Glass square tints the background** — `backdrop-filter: saturate(10000%)` also saturates the page and the green glow behind the character, so a rounded rectangle shows around it. Tried on 2026-09-14: a saturated copy of the characters clipped to the square (`SaturationBand`). It made scrolling lag and cut the beard, so it was reverted. This needs a different approach.

## Cleanup to verify

- [x] **Imported nowhere** — deleted 2026-09-16: composites `CapabilityListItem`, `HeroTagline`, `YearMarker`; primitives `Divider`, `NavIcon`, `NavLink`, `RatingDots`, `CompanyLogo`; `sections/selected-work/SelectedWorkCard`; hooks `use-intersection`, `use-media-query`, `use-mounted`, `use-theme`; plus `utils/cn`, `utils/format`, `types/common`, `types/sanity` and the barrels that only re-exported them. `Stack` stayed — it is used.
- [x] **Unused assets** — deleted 2026-09-16 (1.6 MB): `sounds/swoosh.mp3`, two Picsart "Untitled-Project" exports, Smartbet `thumb.png` and the broken-name `\.png`, `vectors/Line 15.svg`, `logo/companies/Gemmed.svg`.
- [ ] **Sanity CMS removed 2026-09-16** — nothing imported it: `src/lib/cms`, the `sanity/` studio and schemas, `lib/seo/json-ld.tsx`, and the packages `@sanity/client`, `@sanity/image-url`, `next-sanity`, `gsap`, `three`, `@react-three/*`, `@types/three`. The `cdn.sanity.io` image host and the `/studio` exclusions in `robots.ts` and `proxy.ts` went with them. If a CMS is still planned: `git checkout HEAD -- sanity src/lib/cms src/lib/seo/json-ld.tsx` and reinstall those packages.
- [ ] **Capabilities skill "Playground experiments"** — kept. It's a skill label, not the removed Playground page.

## Projects page (Figma 3155:9789)

- [x] **Responsive design** — done 2026-09-17 from the four frames in section 3155:8425 (1920 / 1440 / 1024 / 480). Section heights match Figma exactly at 1024; mobile rows run ~24px taller each because the placeholder description wraps further than the design's.
- [ ] **Real content per project** — the ten rows now carry their real titles, but every one still shares one description, tech stack and a collage borrowed from the four existing sets. Roles are per project for the four that had them and the design's placeholder pair for the rest. Content lives in `src/components/sections/projects-page/projectShowcaseConfig.ts` and `messages/*.json` under `projectsPage.showcase`.
- [ ] **Seven project rows link to pages that don't exist** — Ginosi, Brainstorm, Benzeen, World Education, Infinity Rings, Off My Case and By Robyn Blair point at `/projects/<slug>` as agreed, but only picsart, smartbet and soulone are in `PROJECTS`, so the rest 404 until their case pages exist.
- [ ] **World Education "View Case Story"** — there's no case study page yet, so the CTA opens `/case-studies`.
- [ ] **"View Random Case"** — links to `/projects/picsart` for now; decide whether it should pick a random case.
- [ ] **Collage hover state** — each collage component in Figma has a hidden "CTA Secondary"; the hover state isn't built.
- [ ] **SoulOne collage image quality** — Figma's export caps these tall screenshots at 4096px high, so they arrive only 142–455px wide and look soft on retina. Replace them with the original screenshots.

## Projects page code review (2026-09-22)

Found in the review of `/projects`. #1–#4 were confirmed in the browser; #5 needs a real iPhone.

- [ ] **(1) Short phones cut off the text and hide the CTA** — the stacked full-screen layout (`ProjectShowcase.tsx`, `stageStacked`) sizes the text to fit and gives the grid whatever is left. In Armenian at 375×600 the text runs past the screen (to 642px), the grid is 0px tall and View Case Story sits off screen at 642–690px. In Russian at 375×667 the grid is 95px. Raise `STAGE_STACKED_QUERY`'s min-height, give the grid a minimum height, and tighten the stacked type.
- [ ] **(2) The list is invisible without JavaScript** — the stage turns on from a CSS media query, but the project on screen is only chosen in JS (`active` starts at -1). With JS off, all ten rows are at opacity 0 inside a blank area nine screens tall. The same flashes up on a reload that restores the scroll position into the list. Turn the stage on from JS (a `data-staged` attribute) so the rows stack without it. The comment "server HTML already stages correctly" in `ProjectsListSection.tsx` is out of date.
- [ ] **(3) Scroll listeners block scrolling across the whole page** — `useStageStepping.ts` adds non-passive `wheel` and `touchmove` listeners to `window` on mount, so every scroll anywhere on the page waits for the main thread. Attach them only while the list is on screen.
- [ ] **(4) Pinch-zoom is blocked inside the list** — the touch handler cancels two-finger moves too. Ignore `e.touches.length > 1`.
- [ ] **(5) iOS swipes may scroll freely** — `onTouchMove` returns early for moves under 4px without cancelling them, so Safari may start its own scroll and then ignore the later cancels. Cancel every move inside the list, then check on a device.
- [ ] **(6) Desktop bottom padding** — `ProjectsListSection` lost its desktop `padding-bottom: 160px`; the comment still mentions it. Confirm whether that was intentional.
- [ ] **(7) Background strip is a ten-screen layer** — the sliding gradient strip is a GPU layer ten screens tall (about 2880×18000 px on a retina 1440 screen). It's fine on desktop but heavy on weak phones. Render only the current and next project's background instead.
- [ ] **(8) Unused collage images (~1.8 MB)** — `public/projects/collages/{smartbet,soulone,websites}` plus Picsart's `marketplace-home.webp` and `marketplace-checkout.webp`. Delete them, or keep them for the real project media.
- [ ] **(9) Out-of-date comments** — the headers of `ProjectsListSection.tsx` and `ProjectShowcase.tsx` still describe the collage sliding to its page edge and the 240px phone band.
- [ ] **(10) Naming** — `stage` is both a media-query string and a prop in `ProjectShowcase.tsx`, and the prop's `past`/`upcoming` values are no longer read by any CSS. Make it a boolean again.
- [ ] **(11) Tests** — pull the gesture logic in `useStageStepping.ts` out into a pure function and unit-test the momentum, arrival and exit cases.
- [ ] **Project dots placement** — provisional: the pill sits on the stage's right edge in line with Contact Me, side-by-side stage only (not on phones). It isn't placed in Figma yet.

## Localization (2026-09-15)

English is the default; Russian and Armenian live under /ru and /hy. See `docs/adr/0002-localization.md`.

- [ ] **Native review of the RU and HY copy** — `messages/ru.json` and `messages/hy.json` are drafts. Check tone and terminology before launch, then run `npm run check:messages`.
- [ ] **Armenian typography** — Bainsley only has 400 and 700, so Medium and Black text on /hy renders Regular or Bold. Review the display headings, and add `:lang(hy)` letter-spacing overrides if Gilroy's tracking looks off.
- [ ] **Footer name artwork is English only** — STEPAN, TORCHYAN and "Designer × Engineer" are SVG lettering. Decide whether /ru and /hy need their own.
- [ ] **Country detection depends on the host** — `src/i18n/detection.ts` reads the Vercel, Cloudflare and CloudFront country headers. On a host without any of them, detection falls back to the browser language. Add that host's header if needed.
- [ ] **All-projects card copy** — `selectedWork.allProjects` (company, roles, title, description, field) is a draft in all three languages; the Figma file only designs its grid (2350:656).
- [ ] **Contact form values are localized** — the option groups submit the translated labels. When the form gets an endpoint (item 2), submit stable ids instead.

