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

- [ ] **Responsive design** — only the desktop frame exists; the page is built for desktop.
- [ ] **Real content per project** — the Figma frame reuses the same copy, tech stack and artwork across rows (three "World Education" and three "Smartbet" rows). Content lives in `src/components/sections/projects-page/projectShowcaseConfig.ts`.
- [ ] **World Education "View Case Story"** — there's no case study page yet, so the CTA opens `/case-studies`.
- [ ] **"View Random Case"** — links to `/projects/picsart` for now; decide whether it should pick a random case.
- [ ] **Collage hover state** — each collage component in Figma has a hidden "CTA Secondary"; the hover state isn't built.
- [ ] **SoulOne collage image quality** — Figma's export caps these tall screenshots at 4096px high, so they arrive only 142–455px wide and look soft on retina. Replace them with the original screenshots.

## Localization (2026-09-15)

English is the default; Russian and Armenian live under /ru and /hy. See `docs/adr/0002-localization.md`.

- [ ] **Native review of the RU and HY copy** — `messages/ru.json` and `messages/hy.json` are drafts. Check tone and terminology before launch, then run `npm run check:messages`.
- [ ] **Armenian typography** — Bainsley only has 400 and 700, so Medium and Black text on /hy renders Regular or Bold. Review the display headings, and add `:lang(hy)` letter-spacing overrides if Gilroy's tracking looks off.
- [ ] **Footer name artwork is English only** — STEPAN, TORCHYAN and "Designer × Engineer" are SVG lettering. Decide whether /ru and /hy need their own.
- [ ] **Country detection depends on the host** — `src/i18n/detection.ts` reads the Vercel, Cloudflare and CloudFront country headers. On a host without any of them, detection falls back to the browser language. Add that host's header if needed.
- [ ] **All-projects card copy** — `selectedWork.allProjects` (company, roles, title, description, field) is a draft in all three languages; the Figma file only designs its grid (2350:656).
- [ ] **Contact form values are localized** — the option groups submit the translated labels. When the form gets an endpoint (item 2), submit stable ids instead.

