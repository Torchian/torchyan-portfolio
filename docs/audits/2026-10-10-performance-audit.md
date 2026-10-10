# Performance audit and optimisation — 2026-10-10

Run on **production builds** (`next build && next start`) on localhost in a
headless container: `main` at 316d8f6 as the baseline (served from a separate
worktree on port 3001) against this branch (port 3000), side by side.
Lighthouse 12.8.2 (mobile and desktop presets), Chromium 1194 and WebKit 2215
driven by Playwright, Chrome traces.

## Read these caveats first

- **Lab numbers only.** Nothing here is real-user data. INP needs real input
  and was not measured; Vercel Web Analytics will show field data after deploy.
- **The container has no GPU.** Chrome rasterises on the CPU here. That is what
  exposed the main finding below, and it also exaggerates it: a phone or laptop
  with GPU rasterisation pays less. The direction of every change holds; the
  size of the time savings will be smaller on real hardware.
- **Shared, variable CPU.** Single Lighthouse runs move by a few hundred
  milliseconds between runs; read the tables for direction and size, not to
  the millisecond.
- **Localhost.** No CDN, no HTTP/2 multiplexing, `next/image` encodes on first
  request. A missing image in a first-load screenshot was always a cold encode,
  never the change (checked by re-requesting).

---

## 1. Architecture, as found

- **Next.js 16.1 (Turbopack), App Router.** Every page is statically generated
  (`/[locale]`, `/about`, `/services`, `/work`, `/work/[slug]`, `/contact`,
  `/start-a-project`, `/privacy`) for `en`, `ru`, `hy`; one dynamic API route
  (`/api/contact`); the proxy handles locale and the maintenance gate.
- **React 19.2 with the React Compiler on.** 89 of 102 `.tsx` files are client
  components; pages are server components that compose them.
- **styled-components 6** with SSR via `StyledComponentsRegistry`. One dark
  theme, rendered as `data-theme="dark"` on `<html>`; there is no theme switch.
- **next-intl 4.** Messages per locale in `messages/*.json` (108 / 158 / 169 KB).
- **No GSAP and no Three.js.** Checked: neither is in `package.json` or imported
  anywhere (the `three`/`gsap` hits are comments and words). All motion is CSS
  plus a few gated `requestAnimationFrame` loops (scroll driver, character gaze,
  page loader), each stopped when idle or hidden.
- **Dependencies:** `next`, `react`, `next-intl`, `styled-components`,
  `zustand`, `@vercel/analytics`. JavaScript: 1196 KB raw / 368 KB gzip across
  all chunks; ~335–350 KB transferred per page.
- **Assets:** local fonts (Gilroy, Bainsley Armenian), `next/image` for most
  photography, plain `<img>` for SVG artwork, raw WebP for the Work collages,
  WAV cues and one AAC music loop for the sound engine.

## 2. Bottlenecks found

| # | Bottleneck | Root cause | Impact | Risk to fix | Complexity |
| --- | --- | --- | --- | --- | --- |
| 1 | 2–5 s Total Blocking Time on every page; `load` never firing on `/about` within 60 s | `PageBackground` drew `/vectors/background.svg`: a 1920×12745 Figma export with **ten SVG Gaussian blurs, `stdDeviation` up to 1000**, on a full-viewport fixed layer. Chrome re-rasterises it per size and tile; traces show ~4.3 s of raster per load and the main thread stuck in `LayerTree::WaitForCommitCompletion` (two 2.35 s tasks per page). The 2026-09-27 audit read this as JavaScript; it was raster. | **High** | Low | Low |
| 2 | Every page shipped every page's copy | `NextIntlClientProvider` had no `messages` prop, so the whole message file went into each page's HTML and RSC payload (the case studies alone are 26 KB of English, used only on the server) | **High** (bytes) | Medium (a missed namespace shows keys) | Medium |
| 3 | 8 font preloads (208 KB) on every page | Gilroy declared in 8 weights; the design tokens use 5. `next/font` preloads every declared face | Medium | Low | Low |
| 4 | Up to 47 image preloads in the home page `<head>` | React 19 preloads every eager `<img>` in the HTML; below-the-fold artwork (footer lettering, What I Do, 25 logos, the map) was all promoted ahead of the hero | Medium | Low | Low |
| 5 | Mobile LCP 13–17 s on Home and About | The LCP image shared the throttled connection with ~1.3 MB of audio the sound engine fetched at hydration (sound is on by default), plus 1–4 above | **High** (mobile) | Low | Low |
| 6 | CLS 0.33–0.75 on About from 768 px up | The hero character is positioned from the title's measured end; the server HTML guesses 40%, so it jumped after hydration (under the loader, invisible, but counted) | Medium | Low | Low |
| 7 | Music fetched again and again where it can't decode | `startMusic` retried after `decode()` had swallowed a failure: in a browser without AAC (open-source Chromium, some Linux Firefox) the 0.9 MB track was re-downloaded hundreds of times a minute | Medium (rare, severe) | Low | Low |
| 8 | Work page LCP waits on a CSS background | The logo-scroll grid (the LCP) is only discovered once styles apply | Low | Low | Low |

Not bottlenecks: JavaScript size and hydration (scripting is 0.3–0.5 s on
desktop once the raster stall is gone), listeners and animation loops (gated
and cleaned up), memory (no growth trend over 40 client-side navigations;
heap 5.3 → 7.4 MB at home in both builds).

## 3. What changed

1. **Page background is a raster.** `public/backgrounds/page-background.webp`
   (600×3983, 12.9 KB) rendered from the SVG; `PageBackground` points at it.
   The glows are blurred so far that the raster is visually identical: max
   per-channel difference ≤ 6/255 against the SVG at 390@3x, 768@2x, 1440@2x
   and 1920@1x. Kept under 4096 px tall, which avoids an edge seam Chrome draws
   on taller images. The SVG stays in `public/vectors/` as the source.
2. **Per-page client messages.** `src/i18n/ClientMessages.tsx`: the root
   provider gets only the shell's namespaces; each page wraps its content in
   `<PageMessages namespaces={...}>` with the namespaces its client components
   read (traced from imports). Server components are unaffected.
3. **Five Gilroy weights.** 100, 200 and 800 removed (nothing uses them) and
   their files deleted.
4. **Below-the-fold artwork at low priority.** `fetchPriority="low"` on footer
   lettering, What I Do images and sketch, Capabilities lines, Trusted By logos,
   the Partners strip and the world map. They still load eagerly, so nothing
   pops in; React just stops preloading them. Hero portrait (mobile LCP) gets
   `fetchPriority="high"`.
5. **Audio waits for `load`.** The sound engine downloads and resumes after the
   page's `load` event and an idle moment, instead of at hydration. A gesture
   before then still starts it at once. Nothing audible changes: audio can't
   play before a gesture anyway.
6. **About hero CLS.** The character stays unpainted (`visibility: hidden`,
   768 px and up) until the title end is measured.
7. **Music retry loop fixed.** `startMusic` retries only after a successful
   decode.
8. **Logo-scroll grid preloaded** (`react-dom` `preload`, high priority).

## 4. Before / after

### Lighthouse (lab, simulated throttling for mobile)

| page | preset | score | FCP | LCP | TBT | CLS | Speed Index |
| --- | --- | --- | --- | --- | --- | --- | --- |
| home | mobile | 48 → **63** | 1.07 → 1.07s | 17.36 → 7.11s | 1359 → 505ms | 0.000 → 0.000 | 4.31 → 3.23s |
| about | mobile | 38 → **67** | 1.07 → 0.91s | 13.66 → 6.47s | 1901 → 397ms | 0.018 → 0.018 | 11.02 → 3.21s |
| services | mobile | 69 → **73** | 1.07 → 0.91s | 2.73 → 5.65s | 781 → 297ms | 0.000 → 0.000 | 8.01 → 1.99s |
| work | mobile | 62 → **66** | 1.06 → 0.91s | 8.21 → 7.55s | 515 → 400ms | 0.000 → 0.000 | 2.79 → 2.36s |
| picsart | mobile | 63 → **85** | 1.07 → 0.91s | 3.96 → 3.41s | 1286 → 296ms | 0.000 → 0.000 | 2.98 → 2.09s |
| soulone | mobile | 62 → **78** | 1.07 → 0.91s | 5.02 → 4.42s | 810 → 305ms | 0.000 → 0.000 | 2.83 → 1.97s |
| contact | mobile | 78 → **80** | 0.91 → 0.91s | 4.82 → 4.26s | 232 → 273ms | 0.000 → 0.000 | 2.37 → 2.33s |
| start | mobile | 74 → **78** | 1.06 → 0.91s | 4.54 → 4.34s | 403 → 318ms | 0.000 → 0.000 | 2.74 → 1.98s |
| home | desktop | 53 → **98** | 0.30 → 0.31s | 1.91 → 1.11s | 1976 → 5ms | 0.000 → 0.000 | 3.96 → 1.05s |
| about | desktop | 26 → **80** | 0.30 → 0.25s | 2.80 → 1.06s | 5074 → 16ms | 0.381 → 0.381 | 8.51 → 1.03s |
| services | desktop | 61 → **97** | 0.30 → 0.27s | 0.67 → 1.19s | 2060 → 0ms | 0.000 → 0.000 | 4.25 → 0.80s |
| work | desktop | 39 → **78** | 0.30 → 0.26s | 4.66 → 4.44s | 3060 → 15ms | 0.000 → 0.000 | 3.82 → 0.94s |
| picsart | desktop | 60 → **100** | 0.29 → 0.26s | 0.83 → 0.70s | 3294 → 20ms | 0.000 → 0.000 | 4.64 → 0.82s |
| soulone | desktop | 60 → **99** | 0.29 → 0.27s | 0.82 → 0.87s | 2919 → 31ms | 0.000 → 0.000 | 4.22 → 0.81s |
| contact | desktop | 61 → **99** | 0.25 → 0.25s | 0.82 → 0.87s | 2079 → 7ms | 0.000 → 0.000 | 3.63 → 0.75s |
| start | desktop | 59 → **99** | 0.32 → 0.25s | 1.06 → 0.91s | 3002 → 21ms | 0.000 → 0.000 | 3.89 → 0.70s |

Desktop TBT drops from **2–5 s to 0–31 ms** on every page; desktop scores
26–61 → 78–100. Mobile LCP on Home and About roughly halves (17.4 → 7.1 s,
13.7 → 6.5 s). Desktop About CLS shows 0.381 in both columns because this run
predates fix 6; measured directly afterwards it is 0.004–0.006 at 1350–1920 px
and 0 at 768 px.

**What still bounds mobile LCP is the page loader.** On every mobile page the
remaining LCP is mostly "render delay": content is covered until `load`, fonts
and a stable layout, capped at 4 s by design (`PageLoader.tsx`). Services
moved from 2.7 to 5.7 s between runs for that reason (its loader ran to the
cap). Changing that is a UX decision, not an optimisation, so it is untouched.

### Main-thread blocking, unthrottled, 8 pages per width

Sum over Home, About, Services, Work, Picsart, SoulOne, Contact and Start a
project of long-task time over 50 ms, plus time to `load`:

| Width | Blocking, before | Blocking, after | Load (sum), before | Load (sum), after |
| --- | --- | --- | --- | --- |
| 390 | 3394 ms | 261 ms | 4.1 s | 3.5 s |
| 768 | 15750 ms | 89 ms | 8.9 s | 2.7 s |
| 1440 | 18497 ms | 165 ms | 21.4 s | 3.0 s |
| 1920 | 35345 ms | 309 ms | 38.2 s | 3.0 s |

### Bytes

| | Before | After |
| --- | --- | --- |
| Fonts per page | 8 files, 208 KB | 5 files, 131 KB |
| Image preloads in Home `<head>` | 47 | 10 (flags, sound and contact icons) |
| JavaScript | 1196 KB raw / 368 KB gzip | unchanged (1198 / 369) |
| Background artwork | 6.9 KB SVG + ~4 s raster | 12.9 KB WebP |

HTML (gzip) and RSC payload (raw; fetched on client-side navigation):

| Page | HTML gz before → after | RSC before → after |
| --- | --- | --- |
| en / | 63 → 47 KB | 83 → 31 KB |
| en /about | 48 → 30 KB | 81 → 21 KB |
| en /services | 48 → 31 KB | 83 → 27 KB |
| en /work | 49 → 33 KB | 83 → 32 KB |
| en /work/picsart | 44 → 30 KB | 88 → 43 KB |
| en /contact | 39 → 19 KB | 80 → 13 KB |
| ru / | 72 → 51 KB | 132 → 43 KB |
| ru /contact | 47 → 20 KB | 129 → 15 KB |
| hy / | 71 → 51 KB | 143 → 45 KB |
| hy /work/picsart | 52 → 34 KB | 148 → 64 KB |
| hy /contact | 46 → 20 KB | 140 → 16 KB |

Total transfer per page is about the same as before (2.0–3.2 MB on localhost):
the audio still downloads, after `load` instead of during it.

## 5. Verification

- **Visual:** screenshots of 10 pages (incl. `/hy`, `/ru/about`) at 390, 768,
  1440 and 1920, top and middle, `main` vs this branch with animations paused.
  Once both pages had lifted their loader and warmed the image cache, every
  pair differs by at most 3–4/255 per channel (the background raster). Early
  diffs were the old build still behind its loader at 1920, and cold image
  encodes; re-checked.
- **Translations:** page text (`innerText`) of 33 pages (11 routes × 3 locales)
  is identical before and after; no missing-message errors and no raw keys at
  390 px with menus, language list and the Services circle opened.
- **CLS:** About 0.33–0.75 → ≤ 0.006 (390 px keeps a pre-existing 0.019 from
  the year rail).
- **Overflow:** none at 390, 768, 1440, 1920 on 8 pages, both builds.
- **SEO:** `robots.txt` identical; `sitemap.xml` identical apart from
  `lastmod`; title, description, canonical and hreflang identical on 4 pages.
- **Forms:** `/api/contact` untouched; answers 503 locally (no Resend keys),
  same as before. The form sounds still play.
- **Sound:** cues play on hover/press (Chromium); the music loop starts after a
  click in WebKit, one request for the track.
- **Memory:** no growth trend across 40 client-side navigations.
- `tsc --noEmit`, `eslint` (0 errors, 4 pre-existing warnings),
  `check:messages`, `next build`: pass. There is no test suite.

## 6. Not done, and why

- **Page loader.** It is now the main contributor to mobile LCP (up to 4 s by
  design). Shortening its cap or lifting it earlier would be the next large lab
  win, but it changes what a visitor sees on arrival.
- **Audio bytes.** Sound on by default means ~1.3 MB per first visit (0.9 MB
  music). Fetching the music only on the first gesture would save it for
  visitors who never interact, at the cost of the music starting a beat later.
  Your call.
- **WAV cues** (~360 KB) could be compressed; left as is, because the engine's
  timing was tuned on these files.
- **Work collages** are raw WebP, not `next/image`, by an earlier decision
  (columns larger than their clip). They are 100–200 KB each; resizing them is
  an asset task.
- **Long-lived cache headers** for `public/` would save revalidation requests,
  but files there have been replaced in place before; safe only with renamed
  files.
- **`The AudioContext was not allowed to start`** console warning on load: the
  engine deliberately tries to resume a sound the visitor already turned on.
  Harmless; noted because Lighthouse's Best Practices counts it.
- **Pre-existing lint warnings:** unused imports in `about/page.tsx`
  (`AboutPracticeSection`), `PartnersCarousel.tsx`, `TrustedBySection.tsx`.
