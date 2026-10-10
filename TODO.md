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

Studio relaunch (ADR 0008). The pages, copy and contact flow are built; these
must be done before the maintenance gate comes off.

- [ ] **Russian adaptation** — **P0 · Decision + Dev** — `messages/ru.json` carries the new English strings wherever the English changed. Adapt (not translate word for word), run `npm run check:messages`, then restore `COUNTRY_LOCALES` in `src/i18n/detection.ts`.
- [ ] **Armenian adaptation** — **P0 · Decision + Dev** — same for `messages/hy.json`. Check the long-copy layouts afterwards: Projects phone stage, header pill, hero.
- [ ] **Privacy notice: data controller** — **P0 · Owner** — add the legal name, form and registration to `privacyPage.sections[0]`, and have the notice reviewed (including whether an EU representative is needed).
- [ ] **Live contact test** — **P0 · Owner** — Resend variables in Vercel production; send one message through `/contact` and confirm it arrives. Then confirm `hello@torchyan.design` receives mail — the form's error messages point to it. (2026-10-01: forwarding to the founder's inbox is set up through ImprovMX, free plan, MX + SPF records at GoDaddy; send one test mail from another address to close this. Reply-as `hello@` needs a real mailbox, P2.)
- [ ] **Vercel Web Analytics** — **P0 · Owner** — enable Web Analytics for the project in the Vercel dashboard, and confirm custom events are available on the plan.
- [ ] **Footer role lettering** — **P0 · Design** — `public/footer/name-designer-engineer.svg` still reads "Designer × Engineer"; replace with "Digital Product Studio" lettering at the same size.
- [x] **Default social image** — **P0 · Design** — `public/og/default.jpg` is now the Torchyan · Digital Product Studio card (1200×630).
- [ ] **Screens to confirm** — **P1 · Owner** — the Smartbet screens on its card, row and case are the ones you implemented; Ad Wizard has no screenshots yet (its case step shows Picsart editor screens).
- [ ] **"Built with" per project** — **P1 · Owner** — only Picsart has a confirmed stack; the other rows hide the line until one is added to `projectsPage.showcase.items.<key>.stack`.


---

## 2. Homepage

- [ ] **What I Do on tablet and mobile** — **P1 · Design + Dev** — the section has no tablet or mobile design yet; the desktop layout is what renders. Owner's list.
- [ ] **Capabilities section should fit the viewport height** — **P1 · Design + Dev** — owner's list. Decide the target height behaviour (fit, or scroll with a minimum) before coding.
- [ ] **Trusted By section should fit the viewport height** — **P1 · Design + Dev** — owner's list; same decision as Capabilities.
- [x] **(Homepage #7) Selected Work snap drifts on phones** — **P1 · Dev** — the step now comes from the track's own height over the cards in it, never `innerHeight`, so it is right whatever the toolbar is doing; the card's bottom padding gains `100lvh - 100svh` so its last line is never under the toolbar. Measured with the two heights forced 88px apart: the seam grew 88 → 176 → 264px before, and is 0 at every stop after.
- [x] **Selected Work stepped the scroll on touch** — **P1 · Dev** — the card-by-card stepping is desktop-only now, gated on `(hover: hover) and (pointer: fine)` as well as the desktop width, so a large tablet in landscape counts as touch. Stepping has to cancel the page's own scroll, which on a finger costs the momentum the gesture expects; touch gets the plain sticky stack instead. Verified: a 200px swipe moves the page 295px on a phone and 185px on a tablet with no `touchmove` cancelled, while a wheel notch still steps exactly one card on desktop; at 1366×1024 the same width steps with a mouse and scrolls freely with a finger.
- [ ] **Does the Projects stage want the same?** — **P1 · Decision** — `/projects` still steps on touch (`STAGE_QUERY` stages down to 768px). Unlike the homepage the stepping there *is* the section — each step swaps the project — so dropping it means falling back to the stacked rows, which is a design call rather than a fix.
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
- [ ] **Partners carousel: bake the logos, or accept 17.8 Mpx** — **P2 · Decision** — measured 2026-09-27, and the earlier diagnosis needs correcting. There is no main-thread cost: with the carousel centred and the CPU throttled 4x, `exclusion` gives 59.8fps against 60.0 with the blend off. The cost is on the compositor and shows up as geometry: the blend adds two layers and 17.8 Mpx, one of them 1440x12300 — the whole page height — because everything behind the strip must exist as a texture for `exclusion` to composite against. That is about 71 MB of extra raster memory at 1x, nine times the pixels on a 3x phone. `isolation: isolate` is already on `SiteLayout__Page` and adding it at any other ancestor changes nothing (tested on four, pixel-identical each time): every ancestor is page-tall, so there is no shorter group to isolate into, and what sits behind the strip is the page-tall glow the blend exists to show through. So the options are to bake each logo so it reads without a runtime blend — asset work, and `exclusion` is what Figma 3053:13727 specifies — or to keep it. Note the page already carries two 1440x13000 layers with the blend off, and the baseline in §7 says main-thread blocking is the larger problem, so the carousel is probably not what the owner noticed. Detail in `docs/audits/2026-09-27-performance-baseline.md` §2.
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

- [ ] **Inline CSS: 112 KB left on the homepage** — **P1 · Dev** — down from 128 KB (see the archive). What remains is mostly legitimate: 481 rules became 396 for a page with this many sections, and exact duplicates account for only 6 KB. The next candidates are the 27% that sits inside media queries (330 blocks) and whatever else bakes per-instance numbers into a class — the same pattern the Selected Work cards had. Worth re-running the near-duplicate count after any change.
- [ ] **An unidentified 112 KB JS chunk** — **P2 · Dev** — matches none of the known library markers (react-dom, the Next router, styled-components, next-intl, zustand). 836 KB of JavaScript ships over 18 files; worth knowing what an eighth of it is.
- [ ] **`legacy-javascript`: 14 KB** — **P2 · Dev** — transpiled helpers for browsers the site need not support, all in the react-dom chunk (`69be…js`). Check whether the browserslist target can be raised.
- [ ] **`unused-javascript`: 25 KB** — **P3 · Dev** — also in the react-dom chunk, so mostly framework code that this page never reaches. Little to do unless the chunk can be split.
- [ ] **`unminified-css`: 3 KB on the homepage** — **P3 · Dev** — Lighthouse points at the block of `:root` custom properties. Unexpected in a production build; worth ten minutes to find what emits it unminified.
- [ ] **`unsized-images`** — **P3 · Dev** — the company logos on `/projects` and the homepage carry no width or height. CLS is 0.000 everywhere now, so this costs nothing measurable today; it is insurance against reflow while they load.
- [ ] **The glows as CSS gradients** — **P2 · Design + Dev** — the Figma source (3155:9814) is nine blurred ellipses, and a `radial-gradient` renders that natively with no blur filter, which is what made the raster the cheaper option originally. Measured 2026-09-27: on `/projects` the glow is invisible from scrollY 1040 to 8450 — 8000px, 62% of the artwork — because the stage draws its own full-screen background over it. It is visible at the hero (70% of pixels) and below the stage (66–78%). Doing this would drop the remaining 122 KB and, if the span is split into those two bands, shrink the page-tall composited layer. It changes a designed element and will not be pixel-identical, so it needs the owner's go-ahead.
- [ ] **Is blocking time real? Settle it on the deployed site** — **P1 · Dev** — Total Blocking Time measures 2.1–4.8s here, agreeing with Lighthouse, but one task of about 2.3s dominates every page and **barely changes when the CPU is throttled 4x** — real JavaScript would take four times as long. The V8 profiler attributes only 300–800ms to the site's own scripts and a timeline trace accounts for about 1.4s of work in total, so neither leaves room for it. It reads as the container descheduling the renderer, not the site blocking. Do not optimise against these numbers; re-measure on the real host. See the addendum in `docs/audits/2026-09-27-performance-baseline.md`.
- [ ] **Lighthouse cannot measure `/projects` on mobile** — **P2 · Dev** — the mobile run returns all-zero metrics and a score of 0. Nine screens of pinned stage never reach a state Lighthouse reports on. Worth solving so the page can be measured at all, and it may say something about how the page behaves on a real phone.
- [ ] **Baseline on the deployed site** — **P1 · Dev** — the 2026-09-27 baseline was taken on localhost in a shared-CPU container with no real GPU, so compositor cost is unmeasurable there and the time figures move between runs. Re-run Lighthouse and WebPageTest once the domain is live. Targets: LCP < 2.5s, INP < 200ms, CLS < 0.1.
- [ ] **`unminified-css` on the homepage** — **P2 · Dev** — Lighthouse flags it on a production build, which should not happen. Worth a look on its own.
- [ ] **`bf-cache` ineligible** — **P3 · Dev** — every page fails it, so back and forward navigation re-runs the whole load.
- [ ] **`unsized-images`** — **P2 · Dev** — images without intrinsic dimensions on home and `/projects`; also the likely CLS contributor above.
- [ ] **Animated backdrop-filter in What I Do** — **P1 · Dev** — a `::before` of about 523×506 (`ActiveBackdropFilterAnimation`) animates its blur, re-blurring the backdrop every frame. The single most expensive effect on the site. Animate opacity or transform instead, or bake the look into an image.
- [ ] **What I Do glow is a 1440×5660 layer** — **P1 · Dev** — `WhatIDoSection__EllipseGlow`. Split it, or bake it into the background images.
- [ ] **Audit the remaining backdrop blurs** — **P2 · Dev** — three chip-sized `::before` blurs (196×64) on the homepage plus the Bg4 glass pane. Check whether each is visible enough to earn its cost.
- [ ] **Fonts** — **P2 · Dev** — subset and preload the display faces; check for layout shift on first paint.
- [ ] **Bundle analysis and the styled-components runtime** — **P2 · Dev** — measure the client bundle and the styled-components cost, and decide whether any of it moves to static CSS.
- [ ] **`MapDot` to WAAPI (optional)** — **P3 · Dev** — while the Years map is in view its CSS heartbeat costs ~30ms/s of main thread; the same keyframes through `element.animate()` measured ~0.

---

## 8. Accessibility

- [ ] **Lighthouse accessibility pass** — **P2 · Dev** — axe is clean (see below); Lighthouse's own checks overlap but not entirely. Worth running with the performance baseline in §7 rather than on its own.
- [ ] **Keyboard paths: the Projects stage, the dots and the forms** — **P1 · Dev** — the header and the menu panel are done and verified (see the archive). Still to check: stepping the Projects stage by keyboard, the project dots, and both forms.
- [ ] **(Homepage #9) Image alt text** — **P1 · Dev** — after the new image sets arrive. Collage and decorative images get `alt=""`, and duplicates are hidden from screen readers. Affects `/projects`, `/projects/[slug]` and the About timeline grid.
- [ ] **Screen-reader names for the sound toggles** — **P1 · Dev** — the two audio switches need accessible names and pressed state.
- [ ] **Reduced-motion coverage** — **P1 · Dev** — measured 2026-09-27: 14 animations still run two seconds after load under `prefers-reduced-motion: reduce`. Thirteen are transitions, which reduced motion does not require removing, so each is a judgement call; `PageLoader__Overlay` is a keyframe animation and the clear one to fix. Full list in `docs/audits/2026-09-27-header-and-accessibility.md` §3. Still unchecked: the scroll effects, the carousel and the character animations.
- [ ] **CTA buttons signal focus with colour alone** — **P2 · Decision** — Contact Me and See My Work draw no focus outline; the label turns brand green instead, measured at 6.72:1 against the page background, so WCAG 2.4.7 and 1.4.3 both pass. Two open points: it fires on `:focus` rather than `:focus-visible`, so a mouse click shows it too, and a label colour change may not satisfy WCAG 2.2's 2.4.11 Focus Appearance. Decide whether to add an outline.
- [ ] **Trusted By logos as a real list** — **P3 · Dev** — the invalid list roles were removed (see the archive). Restoring list semantics properly means `<ul>`/`<li>` per row with an `<a>` nested in each `<li>`; the only gain is the item count being announced.
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

- [ ] **Spam protection beyond the honeypot** — **P2 · Dev** — the endpoint has a honeypot field and an in-memory rate limit of 5 per IP per hour. The rate limit only holds for the life of one serverless instance and only for the requests that instance sees, so it stops a crude script and nothing more. Real limiting needs shared state (Vercel KV or Upstash); a Cloudflare Turnstile challenge is the other half.
- [ ] **Submission storage (optional)** — **P3 · Decision** — whether submissions are also saved somewhere, or email is the only record. Today the mail is the only copy: if Resend is down, the message is lost and the sender is told so.
- [ ] **An error colour in the token set** — **P2 · Design** — the contact form's failure message uses a literal `#ff6b6b` (7.1:1 on the page background) because `accents` has no error colour. Add one when the design has a view on it; `ProjectForm.tsx` marks the spot.
- [ ] **Auto-reply to the sender** — **P3 · Decision** — the form confirms on screen but sends nothing to the person who wrote. A short confirmation in their own language would need the email templates in §14.
- [ ] **(Homepage #11) Analytics consent** — **P1 · Decision + Dev** — only applies when the GA / Yandex variables are set. Yandex Webvisor records sessions including typing in the contact form, and both trackers load without consent. Options: turn Webvisor off, exclude the form fields, or add a consent banner. A banner is the only option that is defensible under GDPR for EU visitors.
- [ ] **Error monitoring (optional)** — **P3 · Decision** — Sentry or the host's own reporting, so a broken form is noticed without a user report.
- [ ] **Future CMS** — **P3 · Decision** — only if case studies should be editable without code. Sanity was removed 2026-09-16 (`src/lib/cms`, the `sanity/` studio and schemas, `lib/seo/json-ld.tsx`, and the packages `@sanity/client`, `@sanity/image-url`, `next-sanity`, `gsap`, `three`, `@react-three/*`, `@types/three`; the `cdn.sanity.io` image host and the `/studio` exclusions in `robots.ts` and `proxy.ts` went with it). To restore: `git checkout f3eb7d6^ -- sanity src/lib/cms src/lib/seo/json-ld.tsx` and reinstall those packages (`f3eb7d6` is the commit that deleted them; the old file's `git checkout HEAD -- …` no longer works).

---

## 13. Domain (torchyan.design)

- [ ] **Confirm the contact form sends from the live site** — **P0 · Owner** — the domain is live and Resend has verified it, so all that is left is the four variables in Vercel and a redeploy (they are read at build time). Then send one message through the live form and check it arrives. If it shows the error state, Vercel's logs carry a line starting `[contact]` naming the cause.
- [ ] **Receiving at hello@torchyan.design** — **P2 · Owner** — the footer now prints it, but nothing receives there yet: GoDaddy has no mail on the domain. Forwarding to a personal inbox is the free start; a real mailbox is $6–7/mo and only worth it once clients write. The contact form does not depend on this. `docs/setup/domain-email-hosting.md` §5.
- [ ] **Search Console** — **P2 · Dev** — verify the domain, submit the sitemap, and check that hreflang resolves for en / ru / hy.
- [ ] **Country detection depends on the host** — **P2 · Dev** — `src/i18n/detection.ts` reads the Vercel, Cloudflare and CloudFront country headers. On a host with none of them, detection falls back to the browser language; add that host's header if needed.

---

## 14. Mailing

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

- [ ] **Test setup** — **P2 · Dev** — no test runner is installed. Add one (Vitest fits a Next.js app without extra config) and start with the gesture logic in §3.
- [ ] **Turn the CSP from report-only to enforced** — **P1 · Dev** — the policy is in place and reported nothing across 24 runs, but the analytics entries are untested here because their env vars are unset. On the deployed site with the keys in place, walk every page watching the console, then rename the header to `Content-Security-Policy` and add `upgrade-insecure-requests` in the same change (a report-only policy ignores it). See `docs/audits/2026-09-27-header-and-accessibility.md` §4.
- [ ] **`sharp` is a devDependency** — **P3 · Dev** — fine on Vercel and for the local scripts. If the site is self-hosted, Next.js image optimisation needs it in `dependencies`.
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

**Background glows re-encoded (2026-09-27)**

- [x] **147 KB off the two page glows** — 2026-09-27. `lower-page-glow.webp` 129 → 56 KB and `projects-page-glow.webp` 140 → 66 KB, re-encoded at WebP quality 70. They are small rasters (452×1046 and 460×1452) stretched over the page, and at 0.21–0.28 bytes per pixel they were far heavier than a smooth gradient needs. Note they sit outside what `npm run images` covers, and that script would re-encode them at its own quality 80; 70 is deliberate here because a blurred gradient stretched three times over hides far more than a project screenshot does.
- [x] **Verified on the rendered page, not just the file** — 2026-09-27. Stretching amplifies banding, so the check was screenshots at the five scroll positions where the glow actually shows: max channel difference 3–4 of 255, average under 1. One position read 225, which a same-build control reproduced exactly — the drifting Partners logo strip pausing at a different offset, not the encoding.

**Layout shift on the Projects page (2026-09-27)**

- [x] **CLS 0.132 on `/projects`, caused by this branch's own no-JS fix** — 2026-09-27. Staging the list from JS meant the track only reached its full height after hydration: the page grew 9800 → 13000px and dragged the page glow down with it, which the browser recorded as a single 0.1319 shift, 12ms after `data-staged` flipped. `LowerPageBackground__Artwork` was the only element it could see move; everything else that shifted was off screen.
- [x] **Reserving the runway in CSS fixes it without losing the no-JS layout** — 2026-09-27. The track's height is the one stage rule back on the media query, because it is the one that has to be right in the first painted frame; everything else still waits for `data-staged`. Writing that attribute before paint was tried first and does not work: `useLayoutEffect` runs before the paint that follows React's commit, and hydration lands seconds after the server HTML is already on screen (measured: attribute at 6629ms, first paint at 3491ms). Verified after: page 13000px from the first measurement and never grows, CLS 0.000 on every page at desktop and phone, all ten rows visible and in flow with JS off, one project per swipe and one active row with JS on. The cost is a stretch of empty space at the end of the section for a visitor with no JavaScript — every row is still readable, which the CSS-only staging could not manage.
- [x] **The row gate moved from each row onto the section** — 2026-09-27. One attribute now gates the whole stage through an ancestor selector, instead of a copy on every row that React had to render.

**Inline CSS on the homepage (2026-09-27)**

- [x] **15.6 KB of CSS removed by moving per-instance numbers into custom properties** — 2026-09-27. Analysis found 48 groups of rules identical but for a number, wasting 20 KB (15% of the CSS): styled-components generates a class per distinct prop combination, so each Selected Work column and tile carried its own copy of the same rule at three breakpoints plus hover. `IsometricColumnBox`, `FlatColumnBox` and `Tile` now take those numbers as CSS custom properties set inline and share one class each. Homepage CSS 127.9 → 112.2 KB (−12%), 481 → 396 rules, document 314.4 → 305.0 KB. Verified pixel-identical at 1440, 768 and 390: the first two hash identically to a rebuild of the original, and the 0.04% at 390 is the same noise the build shows against itself across two runs.
- [x] **A specificity trap worth remembering** — 2026-09-27. The first attempt aliased the properties per breakpoint (`--col-w: var(--col-w-tablet)` inside a media query), which silently does nothing: an inline style declaration beats any stylesheet rule, so tablet and phone kept their desktop geometry. Caught by the screenshot comparison, which showed 1440 identical and the two smaller widths 40% different. Each breakpoint reads its own property now.
- [x] **Translations do not bloat the client** — 2026-09-27. Checked directly: no Russian or Armenian string appears in any client chunk. next-intl serialises only the active locale into the flight payload (38–39 KB).

**Contact form, social preview and domain decisions (2026-09-27)**

Setup guide for the owner's side: `docs/setup/domain-email-hosting.md`.

- [x] **Contact form sends** — 2026-09-27. `POST /api/contact` validates on the server (name, email, message, lengths), resolves the option groups and mails through Resend's REST API over `fetch` — no SDK, no new dependency. The form has sending, success and error states, `required` fields, and fires both analytics goals. Verified against a running build: missing fields give 400 with per-field reasons, a malformed address 400, malformed JSON 400, the honeypot a silent 200 with nothing sent, the sixth post from one IP 429, and the success path shows the green confirmation, resets the fields and clears the option groups.
- [x] **(Localization) The form submitted translated labels** — 2026-09-27. It sends option indexes plus the locale; the server reads the labels back off `messages/en.json`, so the same answer reaches the inbox identically whatever language it was sent in. Verified: a Russian submission sends `intent: 1, timeline: 0, locale: "ru"`, not Russian strings.
- [x] **A bug the browser test caught** — 2026-09-27. `event.currentTarget` is null once the fetch resolves, so `form.reset()` threw inside the try and a message that had sent perfectly well reported a failure. The element is captured before the await now, and the post-send work sits outside the try where it cannot be mistaken for a send failure.
- [x] **Default social preview image** — 2026-09-27. The owner's 1200x630 artwork is at `public/og/default.jpg`. JPEG rather than PNG: 145 KB against 642 KB with no visible difference on photographic artwork, and LinkedIn still does not render WebP previews. The constant moved with it.
- [x] **Footer email** — 2026-09-27. `hello@torchyan.design`. It needs a forwarder before it receives anything, which is §12.
- [x] **Provider, host and canonical decisions** — 2026-09-27. Resend for mail, Vercel for hosting, and the bare domain as canonical with `www` redirecting to it.

**Header and accessibility audit (2026-09-27)**

Full write-up: `docs/audits/2026-09-27-header-and-accessibility.md`. Production
build, 4 pages x 3 locales x 2 sizes, plus the header at 11 widths.

- [x] **Header responsiveness re-audit** — 2026-09-27. The bar is sound at every width in all three locales: no horizontal page scroll, 80px tall throughout, the three frame designs switching cleanly, nothing off the bar or off screen. The original "responsiveness is broken" report predates the NavBar rebuild to Figma 2562:2761. One real defect found and fixed: on `/hy` at 1025px the provisional audio flank ran 7px into Contact Me, because `NavCluster` is centred on the viewport at its content's width and the Armenian link pill is 454px against English's 386px. The boundary between the 1280 and 1024 designs moved from 1025 to 1060px (`DESKTOP_HEADER_QUERY`), leaving the widest locale the same 12px the cluster uses internally; below it the 1024 design keeps every control reachable through the menu panel.
- [x] **axe accessibility audit** — 2026-09-27. Zero violations across all 24 runs (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `best-practice`). One rule fired first and was fixed: Trusted By carried `role="list"` with `role="listitem"` on each logo, invalid on the `<a>` a linked logo renders as and with the `Row` wrappers breaking list ownership anyway. axe covers about a third of WCAG, so this is a statement about the markup, not a clean bill of health — the manual findings are in §3 of the write-up.
- [x] **Focus escaped the open menu** — 2026-09-27. Tab past the last panel row moved focus to page content behind the overlay. Focus is now kept inside the menu button and the panel and wraps at both ends; verified by 12 forward tabs cycling the 7 panel stops plus the button, and Shift+Tab walking back.
- [x] **Focus was dropped when the menu closed** — 2026-09-27. The panel goes `inert` as it closes, so focus left inside it was discarded and the next Tab restarted from the top of the page. Closing hands focus back to the menu button; verified after Escape.
- [x] **Security headers** — 2026-09-27. HSTS (one year, `includeSubDomains`, no `preload`), `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`, `Cross-Origin-Opener-Policy` and a CSP, confirmed on pages and static assets. The CSP is report-only on purpose and its remaining step is in §16.
- [x] **Header tab order and focus rings** — 2026-09-27. Skip to content is the first stop on every page, every header control is reachable and shows a focus ring, and nothing is reachable while off screen.

**Performance baseline and tooling (2026-09-27)**

Write-up: `docs/audits/2026-09-27-performance-baseline.md`.

- [x] **Performance baseline** — 2026-09-27. Lighthouse on a production build, 4 pages x mobile and desktop. Accessibility 100 everywhere. The findings became the items in §7; the headline is that Total Blocking Time (1.0–4.5s) is the problem rather than paint (FCP 250–300ms, desktop LCP ~1.2s). Taken on localhost in a shared-CPU container with no real GPU, so §7 keeps an item for the deployed-site run.
- [x] **Partners carousel measured** — 2026-09-27. No main-thread cost (59.8fps vs 60.0 with the blend off, CPU throttled 4x); the cost is two composited layers and 17.8 Mpx, one of them page-tall. `isolation: isolate` is already applied and cannot be improved on. The remaining choice is in §3.
- [x] **Tracked `node_modules` junk** — 2026-09-27. The five files were broken symlinks into a nested `node_modules` whose targets never existed. Removed from the index, and `.gitignore`'s root-anchored `/node_modules` became an unanchored `node_modules/`, which is what let a nested copy through in the first place. `.claude/` is ignored now too.
- [x] **CI** — 2026-09-27. `.github/workflows/ci.yml` runs on every push and pull request: `npm ci`, lint, `tsc --noEmit`, `check:messages`, a check that the generated tokens match `tokens.json`, and a build. Each is its own step so a failure names itself; a second push to a branch cancels the run still going. Every step verified locally first.
- [x] **README** — 2026-09-27. Setup, why performance is judged on a production build, every script, the environment variables, the source layout, how the breakpoints map to Figma frames, the localization rules, the ADR index, CI and deploying.

**Structural decisions**

- [x] **Case Studies list page removed** — 2026-09-23. `/case-studies` was a placeholder (Capabilities plus the Contact CTA) linked from the header and footer. Cases are reached from the Projects page at `/projects/<slug>`. Its route, nav and footer links, sitemap entry and `meta.caseStudies` copy are gone. The redirect question is in §11.
- [x] **About page rebuilt** — 2026-09-23. Hero with the random character, hero info, timeline with sticky gallery and year rail, "What I Do In Practice", Positioning — from Figma 2973:9261, ADR 0007.

**Measurement notes worth keeping**

- Never animate `transform` on an `<svg>` element itself: Chrome ticks it on the main thread every frame (60 style recalcs/s, ~85ms/s, measured). Animate an HTML wrapper instead.
- CSS keyframe animations tick Blink each iteration; the same keyframes through `element.animate()` measured ~0.
