# Performance baseline and the Partners carousel — 2026-09-27

Run on a **production build** (`npm run build && npm run start`) served from
localhost in a headless container, driven by Playwright and Lighthouse 12.

## Read these caveats before quoting any number

- **The container's CPU is shared and variable.** Time-based figures below move
  between runs; treat them as a first baseline and a ranking of problems, not as
  a target to defend. The deployed-site baseline in `TODO.md` §7 still stands.
- **There is no real GPU here.** Anything that lives on the compositor —
  blending, backdrop filters, large layers — cannot be timed credibly. Where the
  carousel is concerned this report therefore measures *layer geometry*, which is
  device-independent, rather than frame cost.
- **Localhost distorts two Lighthouse audits.** `canonical` fails on every page
  because `NEXT_PUBLIC_SITE_URL` is localhost while the canonical tag points at
  the real domain, and the byte-weight audits see no CDN.
- **`projects` on mobile did not produce a valid run** (all metrics zero, score
  0). The page is nine screens of pinned stage; Lighthouse's mobile pass never
  reached a state it would report on. That is a measurement failure, not a score.

---

## 1. Lighthouse

| page | preset | perf | a11y | SEO | LCP | TBT | CLS | FCP |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| home | mobile | 49 | 100 | 92 | 8458ms | 1413ms | 0 | 1064ms |
| home | desktop | 58 | 100 | 92 | 1268ms | 3270ms | 0 | 300ms |
| projects | mobile | — | 100 | 92 | *invalid run* | | | |
| projects | desktop | 54 | 100 | 92 | 1144ms | 1986ms | 0.132 | 253ms |
| case study | mobile | 66 | 100 | 92 | 3811ms | 1057ms | 0 | 919ms |
| case study | desktop | 59 | 100 | 92 | 960ms | 4541ms | 0 | 267ms |
| about | mobile | 52 | 100 | 92 | 8065ms | 1031ms | 0.018 | 921ms |
| about | desktop | 58 | 100 | 92 | 1264ms | 2014ms | 0.005 | 257ms |

**Accessibility scores 100 on every page and preset**, which corroborates the
clean axe run in the accessibility audit.

### What the numbers say

**Total Blocking Time is the problem, not paint.** FCP is 250–300ms on desktop
and LCP around 1.2s, both comfortable — but TBT runs from 1.0s to 4.5s. The site
paints quickly and then blocks the main thread for seconds. Every page fails
`total-blocking-time`, `max-potential-fid` and `mainthread-work-breakdown`. This
is where the performance work belongs, ahead of anything about paint.

**Mobile LCP is 8s on home and about.** Under Lighthouse's mobile CPU throttling,
the same blocking work pushes the largest paint out past 8s. Against the LCP
target of 2.5s that is the widest miss on the site.

**CLS is 0.132 on `/projects` desktop**, over the 0.1 target; every other page is
effectively zero. `layout-shifts` and `cls-culprits-insight` both fire there,
which points at the stage's tall track settling after load.

### Audits failing everywhere

| audit | reading |
| --- | --- |
| `unused-javascript` | JavaScript shipped and not run on first load. |
| `render-blocking-insight`, `network-dependency-tree-insight` | The critical path is deeper than it needs to be. |
| `image-delivery-insight` | Images still have room, despite `npm run images`. |
| `legacy-javascript-insight` | Transpiled output for browsers the site need not support. |
| `unsized-images` | Images without intrinsic dimensions — also the CLS risk. |
| `unminified-css` (home) | Unexpected in a production build; worth a look on its own. |
| `bf-cache` | The page is not eligible for the back/forward cache. |
| `canonical` | Localhost artefact, see the caveats. |

---

## 2. The Partners carousel

`TODO.md` said the `mix-blend-mode: exclusion` on the drifting strip was the
likely cause of the lag, and that it "forces the moving track and everything
behind it to repaint every frame". Measured, that guess is half right and the
conclusion changes.

### The main thread is not involved

With the carousel centred at 1440×900 and the CPU throttled 4×, sampling frame
intervals over three alternating pairs of four-second windows:

| arm | fps | median frame | p95 | frames over 32ms | long tasks |
| --- | --- | --- | --- | --- | --- |
| `exclusion` (current) | 59.8 | 16.7ms | 16.8ms | 0.7 | 0ms |
| `normal` (blend off) | 60.0 | 16.7ms | 16.8ms | 0 | 0ms |

There is no main-thread cost to speak of. Blending happens on the compositor, so
a frame-timing measurement of the main thread was the wrong instrument.

### The compositor cost is real and measurable as geometry

Composited layers while the carousel is on screen, from `LayerTree`:

| arm | layers | total area | layers taller than one screen |
| --- | --- | --- | --- |
| `exclusion` (current) | 20 | 64.1 Mpx | 1440×13000, 1440×13000, **1440×12300** |
| `normal` (blend off) | 18 | 46.3 Mpx | 1440×13000, 1440×13000 |

The blend costs **two extra layers and 17.8 Mpx**, and the extra one is
**1440×12300 — the height of the whole page**. That is the blend's backdrop: to
composite `exclusion`, everything behind the strip has to exist as its own
texture. At one device pixel per CSS pixel that is roughly 71 MB of extra raster
memory; the same geometry on a 3× phone screen is nine times the pixels.

So the mechanism in `TODO.md` was right about the backdrop and wrong about the
repaint-per-frame: the backdrop is built because of the blend, not re-rasterised
on every tick of the drift.

### Isolation is already in place and does not help

The usual remedy — `isolation: isolate` on an ancestor, so the blend composites
against a bounded group instead of the page — is **already applied**:
`SiteLayout__Page` has `isolation: isolate`.

Adding it at any other ancestor changes nothing. Tested on `main`,
`SiteLayout__Main`, `SiteLayout__Page` and `body`: layers stayed at 20, area at
64.1 Mpx, the tallest layer at 13000px, and the rendered strip was
**pixel-identical** to the baseline each time (animations paused, same clip,
compared by hash).

The reason is simple: every ancestor between the strip and the page root is
itself page-tall, so there is no shorter group to isolate into. Bounding the
backdrop would mean restructuring what sits behind the strip — and what sits
behind it is the page-tall glow the blend exists to show through.

### What is actually left to decide

Two options, and both are visual calls rather than engineering ones:

1. **Bake the logos and drop the blend.** Pre-process each logo so it reads
   correctly against the strip without a runtime blend. Removes the 17.8 Mpx and
   the extra layers outright. Needs asset work and a look at the result against
   the glow, since `exclusion` is what the Figma file specifies (3053:13727).
2. **Keep it.** 17.8 Mpx of GPU memory on a page that already carries two
   1440×13000 layers. Those two exist with the blend off, so the carousel is not
   the only thing on this page with a page-tall layer, and it may not be the
   biggest contributor to what the owner noticed.

Given the TBT figures in section 1, the honest reading is that the carousel is
unlikely to be the main cause of lag on `/projects`. The main-thread blocking is
the larger and better-evidenced problem.
