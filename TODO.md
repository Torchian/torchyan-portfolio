# TODO

The single work list for the site. Restructured 2026-09-27 from the dated review lists
(homepage 2026-09-14, Projects 2026-09-22, localization 2026-09-15) plus the owner's own
list and a fresh survey of the repo. Completed items are archived at the bottom with their
dates, so the open work reads cleanly.

## How to read this

**Priority**

| Tag | Meaning |
| --- | --- |
| **P0** | Launch blocker. The site should not go live with this open. |
| **P1** | High. Do before launch if at all possible. |
| **P2** | Normal. Post-launch is acceptable. |
| **P3** | Nice to have. |

**Owner**

| Tag | Meaning |
| --- | --- |
| **Dev** | Code only; nothing else is needed to start. |
| **Design** | Needs a Figma frame or an asset first. |
| **Decision** | Needs the owner's call before any work. |

**References** — items carried over from the earlier lists keep their old numbers in
brackets, e.g. *(Projects review #3)*, so older notes and commit messages still resolve.
Architecture decisions live in `docs/adr/`: 0001 sound, 0002 localization, 0003 page-load
reveal, 0004 Selected Work grids, 0005 Character component, 0006 case study page,
0007 About page.

---

## 1. Launch blockers (P0)

- [ ] **Default social preview image is missing** — **P0 · Dev + Design** — `defaultOgImage` points at `/og/default.png` (`src/lib/seo/constants.ts:9`) and `public/og/` does not exist, so every share card is blank. Needs a 1200×630 export.
- [ ] **(Homepage #2) Contact form sends nothing** — **P0 · Dev + Decision** — submit only calls `preventDefault()`. Needs an endpoint (see §12), `required` fields with validation, success and error states, and a `gaEvents.contactFormSubmit` call.
- [ ] **Footer email is on the wrong domain** — **P0 · Decision** — `Footer.tsx:64` shows `hello@torchyan.com`. Confirm the real address; if it is on torchyan.design it needs a mailbox or forwarder, and it shares the DNS work in §12.
- [ ] **Header responsiveness re-audit** — **P0 · Dev** — the owner reported the header as broken across sizes. `NavBar.tsx` has since been rebuilt to Figma 2562:2761 and its header comment names every screen (1920 / 1440 / 1280 / 1024 / 768 / 480 / 320), so the original complaint may be stale. Walk the breakpoints (1440 / 1280 / 1024 / 768 / 480 / 375 / 320) in all three locales and either close this or list what actually breaks.

---

## 2. Homepage

- [ ] **What I Do on tablet and mobile** — **P1 · Design + Dev** — the section has no tablet or mobile design yet; the desktop layout is what renders. Owner's list.
- [ ] **Capabilities section should fit the viewport height** — **P1 · Design + Dev** — owner's list. Decide the target height behaviour (fit, or scroll with a minimum) before coding.
- [ ] **Trusted By section should fit the viewport height** — **P1 · Design + Dev** — owner's list; same decision as Capabilities.
- [ ] **(Homepage #7) Selected Work snap drifts on phones** — **P1 · Dev** — cards are `100vh` tall but the snap maths uses `innerHeight`, so snaps drift on browsers with a collapsing toolbar. Use `visualViewport` or `svh`. Do it with the project components update.
- [ ] **(Homepage #1) What I Do `sepiaToInvert` flashing** — **P1 · Dev + Decision** — 400ms per cycle with 4 invert swings is about 5 flashes/s; WCAG 2.3.1 allows at most 3/s. An 800ms cycle keeps the same sequence at about 2.5/s. Needs the owner's sign-off on the slower feel.
- [ ] **(Homepage #12.2) Glass square tints the background** — **P2 · Dev** — `backdrop-filter: saturate(10000%)` saturates the page and the green glow behind the character, so a rounded rectangle shows around it. A saturated copy of the characters clipped to the square (`SaturationBand`, tried 2026-09-14) lagged scrolling and cut the beard, and was reverted. Needs a different approach.
- [ ] **(Homepage #10) Years map locations popup** — **P2 · Design + Dev** — design is coming. The same work should make the locations reachable by keyboard and screen reader; today the dots are `aria-hidden` with hover-only titles.
- [ ] **(Homepage #12) Picsart grid hover, middle and right columns** — **P2 · Design + Decision** — Figma's Hover variant (3662:2958) only moves the first column. In code the middle column slides 400px up-right and the right one 220px down-left, alternating like Smartbet and Soulone (`src/components/sections/selected-work/projectGrids.ts`). 428px and 236px are the most they can travel before a column end shows. Update the variant or confirm the values.
- [ ] **All-projects card copy** — **P2 · Decision** — `selectedWork.allProjects` (company, roles, title, description, field) is a draft in all three languages; Figma only designs its grid (2350:656).
- [ ] **Hero characters: blink or idle glance** — **P3 · Dev** — they follow the mouse today (ADR 0005, "Hero motion"). An occasional blink, or a glance around when the pointer is idle, could use the same layers.
- [ ] **Footer character still** — **P3 · Design + Dev** — pick a combination, bake it with `scripts/bake-character.py`, and swap it in for `public/footer/portrait-mesh.webp`. See ADR 0005.

---

## 3. Projects page (Figma 3155:9789)

The stage layout and responsive frames are done (see the archive). What remains is content,
the code-review findings and the hover state.

- [ ] **Stacked stage type for short phones** — **P2 · Design** — the stacked stage now needs an 800px screen, so phones shorter than that (iPhone SE class, 667px) scroll instead of staging. Getting the stage back on them means less tall copy: Armenian's text block is 590px at 375 wide against English's 460px, and it would have to come down to about 400px to fit a 560px screen. That is a type-scale decision, so it needs a Figma frame for the short-phone stacked row rather than sizes picked by eye.
- [ ] **Partners carousel lags** — **P1 · Dev** — owner's list. Likely cause: `mix-blend-mode: exclusion` on the moving strip (`src/components/composites/PartnersCarousel.tsx:74`) forces the track and everything behind it to repaint every frame. Off-screen pausing is already in place (`usePauseOffscreen`, line 162), so the cost is only while it is visible. Options: drop the blend, bake the logos to the needed colour, or composite the strip on its own layer.
- [ ] **Real content per project** — **P1 · Decision** — the ten rows carry their real titles, but every one shares one description, tech stack and a collage borrowed from the four existing sets. Roles are real for the four that had them and the design's placeholder pair for the rest. Content lives in `src/components/sections/projects-page/projectShowcaseConfig.ts` and `messages/*.json` under `projectsPage.showcase`.
- [ ] **Seven project rows link to pages that don't exist** — **P1 · Dev + Decision** — Ginosi, Brainstorm, Benzeen, World Education, Infinity Rings, Off My Case and By Robyn Blair point at `/projects/<slug>` as agreed, but only picsart, smartbet and soulone are in `PROJECTS`, so the rest 404. Either build the pages (§6) or make the rows non-links until they exist.
- [ ] **"View Random Case"** — **P2 · Decision** — links to `/projects/picsart` for now. Decide whether it should pick a random case.
- [ ] **Collage hover state** — **P2 · Design + Dev** — each collage component in Figma has a hidden "CTA Secondary"; the hover state isn't built.
- [ ] **SoulOne collage image quality** — **P2 · Design** — Figma's export caps these tall screenshots at 4096px high, so they arrive 142–455px wide and look soft on retina. Replace them with the original screenshots.
- [ ] **(Projects review #5) Confirm the iOS swipe fix on a device** — **P1 · Dev** — the 4px dead zone that let Safari commit to its own scroll is gone (2026-09-27); every one-finger move inside the list is now cancelled from the first pixel. Only a real iPhone can confirm it, which this environment cannot do.
- [ ] **(Projects review #6) Desktop bottom padding** — **P2 · Decision** — `ProjectsListSection` lost its desktop `padding-bottom: 160px` and the comment still mentions it. Confirm whether that was intentional.
- [ ] **(Projects review #7) Background strip is a ten-screen layer** — **P2 · Dev** — the sliding gradient strip is a GPU layer ten screens tall (about 2880×18000px on a retina 1440 screen). Fine on desktop, heavy on weak phones. Render only the current and next project's background.
- [ ] **(Projects review #8) Unused collage images (~1.8 MB)** — **P2 · Decision** — `public/projects/collages/{smartbet,soulone,websites}` plus Picsart's `marketplace-home.webp` and `marketplace-checkout.webp`. Delete them, or keep them for the real project media.
- [ ] **(Projects review #9) Out-of-date comments** — **P3 · Dev** — the headers of `ProjectsListSection.tsx` and `ProjectShowcase.tsx` still describe the collage sliding to its page edge and the 240px phone band.
- [ ] **(Projects review #11) Tests for the gesture logic** — **P2 · Dev** — pull the logic in `src/hooks/useScrollStepping.ts` (Projects stage and homepage Selected Work) into a pure function and unit-test momentum, arrival and exit. Needs the test runner from §18.
- [ ] **Project dots placement** — **P3 · Design** — provisional: the pill sits on the stage's right edge in line with Contact Me, side-by-side stage only (not on phones). Not placed in Figma yet.

---

## 4. Header and navigation

- [ ] **Tablet and mobile menu panel** — **P1 · Design + Dev** — the current panel is provisional; it isn't in the Figma file yet. Owner's list asks for a redesign.
- [ ] **Placement of the sound and language controls** — **P2 · Design** — the components follow Figma (Sound CTA 3690:10694, language_switcher 3690:10528), but where they sit in the header isn't designed. Today they flank the link pill above 1024px (language left, sound right) and appear as "Language" / "Sound" rows in the menu panel at 1024px and below.
- [ ] **Page loader** — **P2 · Design + Decision** — provisional, not in Figma: a full-screen logo with a green glint, shown on full page loads until the layout settles (`src/components/layouts/PageLoader.tsx`, ADR 0003). Confirm it stays, and how it should look.

---

## 5. Case pages (`/projects/<slug>`, Figma 3155:9107)

A case is reached from the Projects page; there is no separate Case Studies list page (that
placeholder was removed 2026-09-23). See ADR 0006.

- [ ] **Picsart Timeline gallery and use-case images** — **P1 · Design** — placeholders from the Picsart screenshots. Swap them in `src/components/sections/case-study/caseStudyConfig.ts`: one gallery set per Timeline step, one image per use case.
- [ ] **Smartbet and SoulOne case studies** — **P1 · Design + Decision** — they show the older layout until they have copy (`caseStudy.<slug>` in `messages/*.json`) and imagery (`CASE_STUDIES`). The other seven projects need pages too (§3).
- [ ] **Case study translations** — **P1 · Decision** — `caseStudy.*` is still English in `ru.json` and `hy.json`.
- [ ] **Blueprint cards on tablet and mobile** — **P2 · Dev** — laid out two per row, then one, following the Projects cards. Check against the tablet and mobile frames.

---

## 6. About page (Figma 2973:9261)

Rebuilt 2026-09-23; see ADR 0007.

- [ ] **Timeline gallery images** — **P1 · Design** — placeholders from other projects, one set per workplace, in `src/components/sections/about/aboutConfig.ts`. Replace with real screenshots per workplace (the owner is providing content and media at the end).
- [ ] **New copy in Russian and Armenian** — **P1 · Decision** — `about.practice.circles` (the labels past the first 24) and `about.hero.generate` beyond the button itself are English on /ru and /hy.
- [ ] **Armenian 90's outfit** — **P3 · Decision** — exported in Figma (3966:16811) but not in the random pool, since it isn't in the list of ten. Add it if it should be.

---

## 7. Performance (P1)

Measured on a production build at 1440×900 @2x: the case study page loads its largest
content at 0.38s with no layout shift and scrolls at 60fps on the main thread. **Judge speed
on `npm run build && npm run start`** — the dev server is unminified, compiles pages on
demand and encodes images on first request. What is already done is in the archive.

- [ ] **Set a baseline** — **P1 · Dev** — Lighthouse and WebPageTest on a production build, then again on the deployed site once the domain is live. Targets: LCP < 2.5s, INP < 200ms, CLS < 0.1. Everything below should be judged against this.
- [ ] **Animated backdrop-filter in What I Do** — **P1 · Dev** — a `::before` of about 523×506 (`ActiveBackdropFilterAnimation`) animates its blur, re-blurring the backdrop every frame. The single most expensive effect on the site. Animate opacity or transform instead, or bake the look into an image.
- [ ] **What I Do glow is a 1440×5660 layer** — **P1 · Dev** — `WhatIDoSection__EllipseGlow`. Split it, or bake it into the background images.
- [ ] **Audit the remaining backdrop blurs** — **P2 · Dev** — three chip-sized `::before` blurs (196×64) on the homepage plus the Bg4 glass pane. Check whether each is visible enough to earn its cost.
- [ ] **Fonts** — **P2 · Dev** — subset and preload the display faces; check for layout shift on first paint.
- [ ] **Bundle analysis and the styled-components runtime** — **P2 · Dev** — measure the client bundle and the styled-components cost, and decide whether any of it moves to static CSS.
- [ ] **`MapDot` to WAAPI (optional)** — **P3 · Dev** — while the Years map is in view its CSS heartbeat costs ~30ms/s of main thread; the same keyframes through `element.animate()` measured ~0.

---

## 8. Accessibility

- [ ] **axe and Lighthouse accessibility audit** — **P1 · Dev** — run both on every page in all three locales and turn the findings into items here.
- [ ] **Keyboard paths** — **P1 · Dev** — the menu, the Projects stage, the project dots and both forms need to be reachable and operable by keyboard, including focus management and trapping in the menu panel.
- [ ] **(Homepage #9) Image alt text** — **P1 · Dev** — after the new image sets arrive. Collage and decorative images get `alt=""`, and duplicates are hidden from screen readers. Affects `/projects`, `/projects/[slug]` and the About timeline grid.
- [ ] **Screen-reader names for the sound toggles** — **P1 · Dev** — the two audio switches need accessible names and pressed state.
- [ ] **Reduced-motion coverage** — **P1 · Dev** — check every scroll effect, carousel and character animation against `prefers-reduced-motion`.
- [ ] **Contrast on the light Projects rows** — **P2 · Dev** — verify text and CTA contrast against the lighter backgrounds.
- [ ] Also tracked elsewhere: pinch-zoom (§1, Projects review #4), the flashing cycle (§2, Homepage #1), the Years map keyboard access (§2, Homepage #10).

---

## 9. Light theme

- [ ] **Light theme design** — **P3 · Design** — there is no light design in Figma. Nothing below can start without it.
- [ ] **Wire the existing toggle** — **P3 · Dev** — `src/store/ui.ts` has a working toggle and `src/styles/themes/light.ts` exists, but `src/app/[locale]/layout.tsx:88` hard-codes `data-theme="dark"`. Once there is a design: read the preference, avoid a flash on load (an inline head script or a cookie), and check every section in both themes.

---

## 10. Sound system (ADR 0001)

- [ ] **More sounds** — **P2 · Design + Dev** — hover, focus/active, fade-in/out and random-motion cues, once the assets arrive. Each is a cue in `src/lib/sound/sounds.ts` plus a `soundTriggers(...)` attribute or a `playSound(...)` call.
- [ ] **Scale the cue map** — **P3 · Dev + Decision** — a cue per section and state, a volume control, and whether the preference should persist beyond the tab (it is `sessionStorage` today).
- [ ] **Mobile unlock behaviour** — **P2 · Dev** — confirm how audio unlocks on iOS and Android after the first gesture, and that nothing plays before it.
- [ ] **Lazy-load cues per page** — **P3 · Dev** — don't ship every cue to every page.
- [ ] **Bring ADR 0001 up to date** — **P3 · Dev** — it predates the separate music and effects switches.

---

## 11. SEO

- [ ] **Per-page OG images** — **P2 · Design + Dev** — after the default one (§1). At minimum: home, projects, each case, about.
- [ ] **Structured data** — **P2 · Dev** — a `Person` schema for the owner, replacing the `lib/seo/json-ld.tsx` that was removed with Sanity.
- [ ] **Metadata check per locale** — **P2 · Dev** — title, description, canonical and hreflang on every route in en / ru / hy.
- [ ] **Sitemap and robots after the domain is set** — **P2 · Dev** — both read the site URL from §1; re-check once it is correct.
- [ ] **Redirect `/case-studies` if it was ever indexed** — **P3 · Decision** — the route was removed 2026-09-23. If the site goes live on a domain where that URL is already indexed, redirect it to `/projects`.

---

## 12. Backend and integrations

Plain terms: the site is static apart from the contact form. "Backend" here means the small
amount of server code and third-party setup the form needs, plus the hosting decisions
around it. Nothing here requires a database.

- [ ] **Contact form endpoint** — **P0 · Dev** — a Next.js route handler or server action that receives the form, validates it on the server and returns a result. Pairs with the form work in §1.
- [ ] **Email delivery** — **P0 · Decision + Dev** — pick a provider (Resend and Postmark are both straightforward) and send from a verified address on torchyan.design. Verification needs SPF, DKIM and DMARC DNS records — the same DNS as §13.
- [ ] **Spam protection** — **P1 · Dev** — Cloudflare Turnstile or a honeypot field, plus rate limiting per IP on the endpoint. Without it the form will be abused within days of launch.
- [ ] **Submission storage (optional)** — **P3 · Decision** — whether submissions are also saved somewhere, or email is the only record.
- [ ] **Hosting** — **P1 · Decision** — Vercel is the recommended default: the i18n country detection already reads Vercel's headers (`src/i18n/detection.ts`), and Next.js image optimisation works without extra setup. Any other host needs the checks in §13 and §18.
- [ ] **Environment variables and secrets** — **P0 · Dev** — set the site URL, analytics and mail provider keys on the host, and document them in `.env.example` (§1).
- [ ] **(Homepage #11) Analytics consent** — **P1 · Decision + Dev** — only applies when the GA / Yandex variables are set. Yandex Webvisor records sessions including typing in the contact form, and both trackers load without consent. Options: turn Webvisor off, exclude the form fields, or add a consent banner. A banner is the only option that is defensible under GDPR for EU visitors.
- [ ] **Contact form submits translated labels** — **P1 · Dev** — the option groups submit the localized text, so submissions differ per locale. Submit stable ids and map them to labels when the endpoint lands.
- [ ] **Error monitoring (optional)** — **P3 · Decision** — Sentry or the host's own reporting, so a broken form is noticed without a user report.
- [ ] **Future CMS** — **P3 · Decision** — only if case studies should be editable without code. Sanity was removed 2026-09-16 (`src/lib/cms`, the `sanity/` studio and schemas, `lib/seo/json-ld.tsx`, and the packages `@sanity/client`, `@sanity/image-url`, `next-sanity`, `gsap`, `three`, `@react-three/*`, `@types/three`; the `cdn.sanity.io` image host and the `/studio` exclusions in `robots.ts` and `proxy.ts` went with it). To restore: `git checkout f3eb7d6^ -- sanity src/lib/cms src/lib/seo/json-ld.tsx` and reinstall those packages (`f3eb7d6` is the commit that deleted them; the old file's `git checkout HEAD -- …` no longer works).

---

## 13. Domain (torchyan.design)

- [ ] **Connect the domain to the host** — **P0 · Dev + Decision** — DNS records, HTTPS certificate, and `NEXT_PUBLIC_SITE_URL` set to the live origin (§1).
- [ ] **Pick the canonical host** — **P0 · Decision** — apex or `www`, with a permanent redirect the other way. Everything in §11 depends on the choice.
- [ ] **Search Console** — **P2 · Dev** — verify the domain, submit the sitemap, and check that hreflang resolves for en / ru / hy.
- [ ] **Country detection depends on the host** — **P2 · Dev** — `src/i18n/detection.ts` reads the Vercel, Cloudflare and CloudFront country headers. On a host with none of them, detection falls back to the browser language; add that host's header if needed.

---

## 14. Mailing

- [ ] **Contact form notification** — **P0 · Dev** — the message that reaches the owner when someone submits. Shares the provider and DNS work in §12.
- [ ] **Auto-reply to the sender (optional)** — **P3 · Decision** — a short confirmation, in the sender's locale.
- [ ] **Newsletter or mailing list** — **P3 · Decision** — whether one is wanted at all. If yes: a provider, a double opt-in form, a consent record and GDPR text, all of which are more work than the contact form.
- [ ] **Email templates in three languages** — **P2 · Dev + Decision** — needed for anything sent to a visitor rather than to the owner.

---

## 15. Localization (ADR 0002)

English is the default; Russian and Armenian live under `/ru` and `/hy`.

- [ ] **Native review of the RU and HY copy** — **P1 · Decision** — `messages/ru.json` and `messages/hy.json` are drafts. Check tone and terminology before launch, then run `npm run check:messages`.
- [ ] **Armenian typography** — **P2 · Design + Dev** — Bainsley only ships 400 and 700, so Medium and Black text on /hy renders Regular or Bold. Review the display headings, and add `:lang(hy)` letter-spacing overrides if Gilroy's tracking looks off.
- [ ] **Footer name artwork is English only** — **P2 · Design + Decision** — STEPAN, TORCHYAN and "Designer × Engineer" are SVG lettering. Decide whether /ru and /hy need their own.

---

## 16. Code quality and tooling

- [ ] **Tracked `node_modules` junk** — **P2 · Dev** — five files under `torchyan-portfolio/node_modules/` are tracked at the repo root by accident. `.gitignore` has `/node_modules`, anchored to the root, which is why a nested copy slipped through. Fix both: `git rm -r --cached torchyan-portfolio` and change the pattern to an unanchored `node_modules/`.
- [ ] **CI** — **P2 · Dev** — there is no `.github/`. Add a workflow running `npm run lint`, `tsc --noEmit`, `npm run check:messages` and `npm run build` on every push.
- [ ] **Test setup** — **P2 · Dev** — no test runner is installed. Add one (Vitest fits a Next.js app without extra config) and start with the gesture logic in §3.
- [ ] **README** — **P2 · Dev** — it is two lines. Cover setup, the scripts in `package.json` (`dev`, `build`, `tokens`, `images`, `check:messages`), the environment variables, the ADR index and how to deploy.
- [ ] **Security headers** — **P1 · Dev** — `next.config.ts` (27 lines) sets none. Add CSP, HSTS, Referrer-Policy, Permissions-Policy and X-Content-Type-Options via `headers()`. A CSP needs care with styled-components' inline styles — start in report-only.
- [ ] **`sharp` is a devDependency** — **P3 · Dev** — fine on Vercel and for the local scripts. If the site is self-hosted, Next.js image optimisation needs it in `dependencies`.
- [ ] **Ignore `.claude/`** — **P3 · Dev** — not present and not tracked today, but add it to `.gitignore` so a local session directory never lands in a commit.
- [ ] **Capabilities skill "Playground experiments"** — **P3 · No action** — kept deliberately. It is a skill label, not a reference to the removed Playground page. Recorded so it isn't "fixed" by mistake.

---

## Archive

Completed, kept for reference with the date each was resolved.

**Homepage review (2026-09-14)**

- [x] **(3 / 12.3) Decorative line art** — 2026-09-14. The What I Do grid, the three boards and the hero grid lines are WebP: about 380 KB total, down from about 14.5 MB of SVG. Each pixel-checked against its SVG at on-page size. The person artwork (character parts, portraits, sketch) is untouched, and the images still load on mobile for the upcoming mobile design.
- [x] **(8) Soulone card contrast** — 2026-09-15. Every Selected Work card now has the dark background (Figma 2300:1687); the brand gradient is only on the resting CTA.
- [x] **ProjectStickyCard no-images fallback** — 2026-09-15, removed with the grid rebuild (ADR 0004).

**Cleanup (2026-09-16)**

- [x] **Dead code deleted** — composites `CapabilityListItem`, `HeroTagline`, `YearMarker`; primitives `Divider`, `NavIcon`, `NavLink`, `RatingDots`, `CompanyLogo`; `sections/selected-work/SelectedWorkCard`; hooks `use-intersection`, `use-media-query`, `use-mounted`, `use-theme`; `utils/cn`, `utils/format`, `types/common`, `types/sanity`, and the barrels that only re-exported them. `Stack` stayed — it is used.
- [x] **Unused assets deleted (1.6 MB)** — `sounds/swoosh.mp3`, two Picsart "Untitled-Project" exports, Smartbet `thumb.png` and the broken-name `\.png`, `vectors/Line 15.svg`, `logo/companies/Gemmed.svg`.

**Projects page**

- [x] **(Projects review #1) Short phones cut off the text and hid the CTA** — 2026-09-27. The stacked stage is gated on a measured height now (`STACKED_STAGE_MIN_HEIGHT`, 800px): below it the rows stack and scroll, which is the layout a short window has always had. Measured on a production build at 375 wide: the text block is 460px in English and Russian and 590px in Armenian, so with the 104px gap under the header and the 48px CTA the row needs 612px, or 742px in Armenian, before the collage band gets a pixel — against the old 560px gate. The check is made in JS against `100svh` rather than the media query's `height`, because mobile Safari reports the toolbar-hidden viewport there and would have staged rows whose CTA then sits under the toolbar. Verified across eight device sizes in English and Armenian: every staged row fits its CTA (tightest: Armenian at 360×800, 793 of 800px, 62px band), every unstaged one scrolls to it, the side-by-side stage is untouched, and a swipe still steps exactly one project. The remaining type question is in §3.

- [x] **Site URL and `.env.example`** — 2026-09-27. The fallback is `https://torchyan.design`, in one place: `robots.ts` reads `siteMetadata.siteUrl` instead of repeating the variable. `.env.example` documents all four variables (site URL, GA, Yandex, `DEV_COUNTRY`) with their defaults, and `.gitignore` un-ignores it with `!.env.example`. Verified: `/robots.txt` on a production build prints the torchyan.design sitemap URL.
- [x] **(Projects review #2) The list was invisible without JavaScript** — 2026-09-27. Every stage rule is now gated on `data-staged`, set from JS once `STAGE_QUERY` matches (on the section in `ProjectsListSection`, on each row in `ProjectShowcase`); the media query alone can no longer stage a list whose active row nothing has chosen. Measured on a production build at 1440×900: with JS off the rows are `static` and laid out one after another, exactly as in a window too short for the stage; with JS on the stage is unchanged (track 9000px, rows absolute, one active). One frame of the old flash survives a reload part-way down the list, because the row on screen is only read on the next animation frame; a layout effect that closed it was reverted, since `react-hooks/set-state-in-effect` rejects it.
- [x] **(Projects review #4) Pinch-zoom was blocked inside the list** — 2026-09-27. A second finger hands the whole touch back to the browser until the last finger lifts. Verified on a production build with real multi-touch events: two-finger moves inside the stage arrive with `defaultPrevented === false`, one-finger moves with `true`, and a swipe still steps exactly one project.
- [x] **(Projects review #10) `stage` naming** — 2026-09-27. The tri-state `stage` prop is gone; `ProjectShowcase` takes `staged` and `active` booleans. The unread `data-stage` attribute went with it.

- [x] **Responsive design** — 2026-09-17, from the four frames in section 3155:8425 (1920 / 1440 / 1024 / 480). Section heights match Figma exactly at 1024; mobile rows run ~24px taller each because the placeholder description wraps further than the design's.
- [x] **(Projects review #3) Scroll listeners blocked scrolling across the whole page** — 2026-09-22. The stepping is now shared (`src/hooks/useScrollStepping.ts`) and attaches its listeners only while the track is near the screen. Before: `useStageStepping.ts` added non-passive `wheel` and `touchmove` listeners to `window` on mount, so every scroll anywhere on the page waited on the main thread.

**Character**

- [x] **Hero character stills** — 2026-09-22. Left: Big Lebowski, colour, no cap or glasses. Right: Matrix with the default glasses, black and white. Each is only its visible half; the phone hero's portrait is the full left character. All three baked with `scripts/bake-character.py`.

**Performance (2026-09-22)**

- [x] **Header blurs** — 6 live backdrop blurs → 1 on every page. The controls on the bar no longer re-blur the already-blurred strip.
- [x] **Case study carousel rows** — GPU layers only while on screen (about 40 MB freed after it scrolls away).
- [x] **Timeline gallery** — keeps only the current, outgoing and next image sets mounted.
- [x] **`next.config.ts` images** — fewer candidate widths; encoded variants cached for 31 days instead of 4 hours.
- [x] **`npm run images`** — right-sizes and converts new project images to WebP (see the script header). Today's images are already optimal.
- [x] **`usePauseOffscreen`** — infinite animations rest out of view: Years map dots, Partners carousel strip. Mid-homepage idle went from ~90ms/s to ~1ms/s.
- [x] **Custom cursor backdrop blur dropped** — it re-blurred the page under it on every pointer move. The cursor still costs one main-thread frame per move (it is positioned from JS); that is inherent to a custom cursor.
- [x] **Map dots animate forever** — paused off screen with `usePauseOffscreen`. The remaining in-view cost is tracked in §7.
- [x] **Mobile `#main-content` gap** — the 80px mobile gap is committed (`src/styles/global.ts`, `spacing[1000]` below `m`).

**Structural decisions**

- [x] **Case Studies list page removed** — 2026-09-23. `/case-studies` was a placeholder (Capabilities plus the Contact CTA) linked from the header and footer. Cases are reached from the Projects page at `/projects/<slug>`. Its route, nav and footer links, sitemap entry and `meta.caseStudies` copy are gone. The redirect question is in §11.
- [x] **About page rebuilt** — 2026-09-23. Hero with the random character, hero info, timeline with sticky gallery and year rail, "What I Do In Practice", Positioning — from Figma 2973:9261, ADR 0007.

**Measurement notes worth keeping**

- Never animate `transform` on an `<svg>` element itself: Chrome ticks it on the main thread every frame (60 style recalcs/s, ~85ms/s, measured). Animate an HTML wrapper instead.
- CSS keyframe animations tick Blink each iteration; the same keyframes through `element.animate()` measured ~0.
