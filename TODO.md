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
- [ ] **"View Random Case"** — links to `/projects/picsart` for now; decide whether it should pick a random case.
- [ ] **Collage hover state** — each collage component in Figma has a hidden "CTA Secondary"; the hover state isn't built.
- [ ] **SoulOne collage image quality** — Figma's export caps these tall screenshots at 4096px high, so they arrive only 142–455px wide and look soft on retina. Replace them with the original screenshots.

## Performance (2026-09-22)

Measured on a production build at 1440×900 @2x. The case study page loads its largest content at 0.38s with no layout shift, and scrolls at 60fps on the main thread. The dev server is much slower by nature: code is unminified, pages compile on demand, and images are encoded on their first request. Judge speed on `npm run build && npm run start`.

Done:
- Header: 6 live backdrop blurs → 1 on every page. The controls on the bar no longer re-blur the already-blurred strip.
- Case study carousel rows are GPU layers only while on screen (about 40 MB freed after it scrolls away).
- Timeline gallery keeps only the current, outgoing and next image sets mounted.
- `next.config.ts` images: fewer candidate widths, and encoded variants are cached for 31 days instead of 4 hours.
- `npm run images`: right-sizes and converts new project images to WebP (see the script header). Today's images are already optimal.

Done in the lag investigation (2026-09-22, measured on a production build, CPU ×4 throttle):
- `usePauseOffscreen` (src/hooks): infinite animations rest out of view — Years map dots, Partners carousel strip. Mid-homepage idle went from ~90ms/s to ~1ms/s.
- Custom cursor: dropped its backdrop blur, which re-blurred the page under it on every pointer move. The cursor still costs one main-thread frame per move (it's positioned from JS); that's inherent to a custom cursor.
- Rule of thumb: never animate `transform` on an `<svg>` element itself — Chrome ticks it on the main thread every frame (60 style recalcs/s, ~85ms/s, measured). Animate an HTML wrapper instead.

Still to do (homepage, found by layer profiling):
- [ ] **Animated backdrop-filter**: a glass pane in What I Do (a `::before` of about 523×506, `ActiveBackdropFilterAnimation`) animates its blur, which re-blurs the backdrop every frame. This is the single most expensive effect on the site. Animate opacity or transform instead, or bake the look into an image.
- [ ] **What I Do glow is a 1440×5660 layer**: `WhatIDoSection__EllipseGlow`. Split it or bake it into the background images.
- [x] **Map dots animate forever**: paused off screen with `usePauseOffscreen` (2026-09-22). While the map is in view the CSS heartbeat still costs ~30ms/s of main thread (CSS keyframe animations on the dots tick Blink each iteration; the same keyframes through `element.animate()` measured ~0). Optional: move `MapDot` to WAAPI.
- [ ] **Three chip-sized `::before` backdrop blurs** (196×64) on the homepage, plus the Bg4 glass pane. Check whether each is visible enough to earn its cost.
- [ ] **Lighthouse / WebPageTest baseline** on the deployed site once the domain is set.

## Case Study page (2026-09-22)

Built from Figma 3155:9107; see `docs/adr/0006-case-study-page.md`.

- [ ] **Picsart Timeline gallery and use-case images**: placeholders from the Picsart screenshots. Swap them in `src/components/sections/case-study/caseStudyConfig.ts` (one gallery set per Timeline step, one image per use case).
- [ ] **Smartbet and SoulOne case studies**: they still show the older layout until they have copy (`caseStudy.<slug>` in `messages/*.json`) and imagery (`CASE_STUDIES`). The other seven projects need their pages too.
- [ ] **Case study translations**: `caseStudy.*` is English in `ru.json` and `hy.json`.
- [ ] **Blueprint cards on tablet and mobile**: laid out two per row, then one, following the Projects cards. Check against the tablet and mobile frames.

## About page (2026-09-23)

Rebuilt from Figma 2973:9261; see `docs/adr/0007-about-page.md`.

- [ ] **Timeline gallery images**: placeholders from other projects, one set per workplace, in `src/components/sections/about/aboutConfig.ts`. Replace with real screenshots per workplace (the user is providing content and media at the end).
- [ ] **New copy in Russian and Armenian**: `about.practice.circles` (the labels past the first 24) and `about.hero.generate` beyond the button itself.
- [ ] **Armenian 90's outfit**: exported in Figma (3966:16811) but not in the random pool, since it isn't in the list of ten. Add it if it should be.

## Projects page code review (2026-09-22)

Found in the review of `/projects`. #1–#4 were confirmed in the browser; #5 needs a real iPhone.

- [ ] **(1) Short phones cut off the text and hide the CTA** — the stacked full-screen layout (`ProjectShowcase.tsx`, `stageStacked`) sizes the text to fit and gives the grid whatever is left. In Armenian at 375×600 the text runs past the screen (to 642px), the grid is 0px tall and View Case Story sits off screen at 642–690px. In Russian at 375×667 the grid is 95px. Raise `STAGE_STACKED_QUERY`'s min-height, give the grid a minimum height, and tighten the stacked type.
- [ ] **(2) The list is invisible without JavaScript** — the stage turns on from a CSS media query, but the project on screen is only chosen in JS (`active` starts at -1). With JS off, all ten rows are at opacity 0 inside a blank area nine screens tall. The same flashes up on a reload that restores the scroll position into the list. Turn the stage on from JS (a `data-staged` attribute) so the rows stack without it. The comment "server HTML already stages correctly" in `ProjectsListSection.tsx` is out of date.
- [x] **(3) Scroll listeners block scrolling across the whole page** — fixed 2026-09-22: the stepping (now shared, `src/hooks/useScrollStepping.ts`) attaches them only while the track is near the screen. Was: `useStageStepping.ts` added non-passive `wheel` and `touchmove` listeners to `window` on mount, so every scroll anywhere on the page waits for the main thread. Attach them only while the list is on screen.
- [ ] **(4) Pinch-zoom is blocked inside the list** — the touch handler cancels two-finger moves too. Ignore `e.touches.length > 1`.
- [ ] **(5) iOS swipes may scroll freely** — `onTouchMove` returns early for moves under 4px without cancelling them, so Safari may start its own scroll and then ignore the later cancels. Cancel every move inside the list, then check on a device.
- [ ] **(6) Desktop bottom padding** — `ProjectsListSection` lost its desktop `padding-bottom: 160px`; the comment still mentions it. Confirm whether that was intentional.
- [ ] **(7) Background strip is a ten-screen layer** — the sliding gradient strip is a GPU layer ten screens tall (about 2880×18000 px on a retina 1440 screen). It's fine on desktop but heavy on weak phones. Render only the current and next project's background instead.
- [ ] **(8) Unused collage images (~1.8 MB)** — `public/projects/collages/{smartbet,soulone,websites}` plus Picsart's `marketplace-home.webp` and `marketplace-checkout.webp`. Delete them, or keep them for the real project media.
- [ ] **(9) Out-of-date comments** — the headers of `ProjectsListSection.tsx` and `ProjectShowcase.tsx` still describe the collage sliding to its page edge and the 240px phone band.
- [ ] **(10) Naming** — `stage` is both a media-query string and a prop in `ProjectShowcase.tsx`, and the prop's `past`/`upcoming` values are no longer read by any CSS. Make it a boolean again.
- [ ] **(11) Tests** — pull the gesture logic in `src/hooks/useScrollStepping.ts` (Projects stage and homepage Selected Work) out into a pure function and unit-test the momentum, arrival and exit cases.
- [ ] **Project dots placement** — provisional: the pill sits on the stage's right edge in line with Contact Me, side-by-side stage only (not on phones). It isn't placed in Figma yet.

## Localization (2026-09-15)

English is the default; Russian and Armenian live under /ru and /hy. See `docs/adr/0002-localization.md`.

- [ ] **Native review of the RU and HY copy** — `messages/ru.json` and `messages/hy.json` are drafts. Check tone and terminology before launch, then run `npm run check:messages`.
- [ ] **Armenian typography** — Bainsley only has 400 and 700, so Medium and Black text on /hy renders Regular or Bold. Review the display headings, and add `:lang(hy)` letter-spacing overrides if Gilroy's tracking looks off.
- [ ] **Footer name artwork is English only** — STEPAN, TORCHYAN and "Designer × Engineer" are SVG lettering. Decide whether /ru and /hy need their own.
- [ ] **Country detection depends on the host** — `src/i18n/detection.ts` reads the Vercel, Cloudflare and CloudFront country headers. On a host without any of them, detection falls back to the browser language. Add that host's header if needed.
- [ ] **All-projects card copy** — `selectedWork.allProjects` (company, roles, title, description, field) is a draft in all three languages; the Figma file only designs its grid (2350:656).
- [ ] **Contact form values are localized** — the option groups submit the translated labels. When the form gets an endpoint (item 2), submit stable ids instead.



# Full project TODO documentation

## Context

The user sent their own to-do list and asked for a full TODO document, adding anything else outstanding (bugs, features, etc.):
- Homepage: What I Do on tablet and mobile; Capabilities and Trusted By to fit the screen height.
- Projects: the Partners carousel lags.
- Header: responsiveness is broken; redesign the tablet and mobile menu.
- Whole project: Case Studies and About pages, performance (high priority), accessibility, light theme, sound enhancements, backend, the torchyan.design domain, and a mailing system. (The Case Studies list page was dropped on 2026-09-23; cases live under `/projects/<slug>`.)

Today's `TODO.md` is a pile of dated review lists (homepage review, Projects review, localization) with open and done items mixed together. The goal is **one structured, prioritised document**. It merges the user's list, every open item already in `TODO.md`, and new findings from surveying the code. The backend section explains in plain terms what "backend" means for this site, since the user said it isn't their area.

This is a documentation-only change: `TODO.md` is rewritten, and no code changes.

## New findings (from surveying the repo) to fold in

**Launch blockers:**
- **Wrong domain everywhere:** `NEXT_PUBLIC_SITE_URL` falls back to `https://torchyan.com` (`src/lib/seo/constants.ts`, `src/app/robots.ts`). Canonical URLs, hreflang, the sitemap, robots.txt and OG URLs would all point at the wrong domain. The site is torchyan.design.
- **Broken social previews:** the default social preview image `/og/default.png` doesn't exist; `public/og/` is missing.
- **No env setup:** there's no `.env.example`, so the required variables aren't documented (site URL, GA, Yandex, and later the mail provider keys).

**Bugs and cleanup:**
- **Junk in git:** `torchyan-portfolio/node_modules/…` (5 files) is tracked at the repo root by accident. Remove it and ignore it. `.claude/` needs the same commit-or-ignore decision.
- **Likely cause of the Partners carousel lag:** the strip has `mix-blend-mode: exclusion` (`PartnersCarousel.tsx`). The blend forces the moving track and everything behind it to repaint every frame. The animation also runs while the strip is off screen.
- **Light theme is half there:** `src/store/ui.ts` has a working theme toggle and `themes/light.ts` exists, but `app/[locale]/layout.tsx` hard-codes `data-theme="dark"`. There's no light design in Figma yet.
- **Case Studies page removed (2026-09-23):** `/case-studies` was a placeholder (Capabilities plus the Contact CTA) linked from the header and footer. A case is reached from the Projects page instead, at `/projects/<slug>`. Its route, nav and footer links, sitemap entry and `meta.caseStudies` copy are gone. If the site ever goes live with that URL already indexed, add a redirect to `/projects`.
- **About page rebuilt (2026-09-23):** hero with the random character, hero info, timeline with sticky gallery and year rail, "What I Do In Practice", Positioning — from Figma 2973:9261, see `docs/adr/0007-about-page.md`.
- **No security headers** in `next.config.ts` (CSP, HSTS, Referrer-Policy, Permissions-Policy, X-Content-Type-Options).
- **Tooling:** there's no CI (no `.github/`), no test setup, and `README.md` is one line.
- **`sharp` is a devDependency:** fine for the scripts. If the site is self-hosted rather than on Vercel, image optimisation needs it in `dependencies`.
- **Uncommitted change:** the mobile `#main-content` gap of 80px.

## Document structure (new `TODO.md`)

1. **How to read this.** A legend:
   - priority **P0** (launch blocker), **P1** (high), **P2** (normal) and **P3** (nice to have);
   - owner **Dev**, **Design** (needs Figma) or **Decision** (user's call);
   - links to the ADRs.
2. **Launch blockers (P0):** the domain URL, the OG image, `.env.example`, the contact form actually sending, the Projects code-review items #1–#4, and the header responsiveness.
3. **Homepage:**
   - What I Do on tablet and mobile (Design + Dev);
   - Capabilities fit to the viewport height;
   - Trusted By fit to the viewport height;
   - Selected Work snap drift on phones (existing #7);
   - What I Do flashing, WCAG 2.3.1 (existing #1);
   - the glass square tint (existing #12.2);
   - the years map popup and keyboard access (existing #10);
   - the hero blink or idle glance (P3).
4. **Projects page:**
   - carousel lag, with its cause and fix outline (drop or bake the blend, pause off screen);
   - the full code-review list (existing #1–#11);
   - real content per project, the 7 links that 404, "View Random Case", the collage hover state, SoulOne image quality and the dots placement.
5. **Header and navigation:**
   - responsiveness (audit breakpoints 1440 / 1024 / 768 / 480 / 375);
   - the tablet and mobile menu redesign (Design);
   - placement of the sound and language controls (existing);
   - the page loader (provisional, existing).
6. **Case pages:** a case is `/projects/<slug>`, reached from the Projects page; there is no separate Case Studies list page. Remaining: the seven projects without a page (see Projects), and their copy and imagery.
7. **About page:** real timeline gallery screenshots per workplace (placeholders today, `src/components/sections/about/aboutConfig.ts`), image alt text (existing #9), and `about.practice.circles` / `about.hero.generate` in Russian and Armenian (the new labels are English there).
8. **Performance (P1).** Set a baseline first: Lighthouse and WebPageTest on a production build, with targets LCP < 2.5s, INP < 200ms, CLS < 0.1. Then work through:
   - the carousel;
   - the Projects scroll listeners and the ten-screen layer;
   - the backdrop-filter count;
   - What I Do scroll effects;
   - fonts (subset and preload);
   - the styled-components runtime cost and bundle analysis;
   - unused collage images (~1.8 MB);
   - pausing animations while off screen.
9. **Accessibility:**
   - an axe and Lighthouse audit;
   - keyboard paths (the menu, the Projects stage, the dots, the forms);
   - focus management in the menu;
   - reduced-motion coverage;
   - contrast on the light Projects rows;
   - pinch-zoom (Projects #4);
   - screen-reader names for the sound toggles;
   - the flashing item;
   - the years map.
10. **Light theme:** Design first. Then wire the existing toggle, remove the hard-coded `data-theme`, avoid a flash on load, and check every section.
11. **Sound system:**
    - existing: more cues;
    - scaling: a cue per section and state, a volume control, whether the preference should persist beyond the tab (it's sessionStorage today), mobile unlock behaviour, lazy-loading cues per page, and bringing ADR 0001 up to date.
12. **Backend and integrations (plain-language explainer).** What's needed and why:
    - **Contact form endpoint:** a Next.js route handler or server action.
    - **Email delivery:** a provider such as Resend or Postmark, sending from a verified torchyan.design address, which needs SPF, DKIM and DMARC DNS records.
    - **Spam protection:** Cloudflare Turnstile or a honeypot, plus rate limiting.
    - **Validation and storage:** server-side validation, and optionally saving submissions.
    - **Hosting:** choose Vercel (recommended; the i18n country detection already reads Vercel's headers) or another host.
    - **Environment variables and secrets.**
    - **Analytics consent** (existing #11).
    - **Error monitoring:** optional.
    - **Future CMS:** if case studies should be editable without code. The Sanity note already in the file is kept here.
13. **Domain (torchyan.design):**
    - connect it to the host (DNS records), HTTPS, and the canonical URL;
    - redirect www to the apex, or the other way round;
    - set `NEXT_PUBLIC_SITE_URL`;
    - Search Console, submitting the sitemap, and hreflang checks.
14. **Mailing system:**
    - the transactional side: the contact form's notification to the user and an optional auto-reply;
    - a decision on whether a newsletter or list is wanted (a provider, a double opt-in form and GDPR text);
    - email templates in all three languages;
    - the DNS setup shared with item 12.
15. **SEO:**
    - the OG image, including per-page OG images;
    - structured data (a Person schema, replacing the removed `json-ld.tsx`);
    - metadata check per locale;
    - sitemap and robots after the domain is set.
16. **Localization:** the existing items, kept as they are.
17. **Content and assets waiting on design:** the existing items (alt text, the footer character still, the Picsart grid hover, more sounds and so on).
18. **Code quality and tooling:**
    - CI running lint, typecheck, `check:messages` and build on each push;
    - tests (starting with the Projects gesture logic);
    - a README covering setup, scripts, env and deploy;
    - the tracked junk and `.claude/`;
    - the uncommitted `#main-content` gap;
    - the old CMS note.
19. **Done (archive):** every `[x]` item from today's file, moved to the bottom with its date, so the open work reads cleanly.

**Writing rules:**
- Each item is one line: the title in bold, the priority and owner tags, then what and why, with file paths where they help.
- Existing items keep their original numbers in brackets, e.g. "(Projects #3)", so earlier references still resolve.
- No item from the current file is dropped.

## Critical files

- `TODO.md`: rewritten. No other file changes.

## Verification

- Every open item in today's `TODO.md` appears in the new file: cross-check by counting `- [ ]` items before and after, and diff the titles.
- Every item the user listed appears, in its own section.
- The new findings above each appear once, with a priority.
- The file renders cleanly as Markdown: headings, the legend and consistent tags.
- No commit unless asked.
