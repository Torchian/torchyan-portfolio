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

---

# Addendum — chasing the blocking time (same day)

Section 1 said Total Blocking Time was the site's main problem. Digging into it
produced one correction, several environment-independent facts, and a warning
about the numbers.

## The TBT figure is not safe to act on

Measured with the browser's own `longtask` entries (authoritative: that API is
the renderer main thread by definition), TBT is 2.1–4.8s per page, which agrees
with Lighthouse. But the shape is wrong for real work:

| page | CPU 1× | CPU 4× |
| --- | --- | --- |
| home | longest task 2339ms | longest task 2444ms |
| projects | 2293ms | 2168ms |
| case study | 2381ms | 2200ms |
| about | 2386ms | 2097ms |

**One task of roughly 2.3s dominates every page, and it barely moves when the
CPU is throttled four times slower.** Genuine JavaScript would take about four
times as long. A task whose wall-clock duration ignores CPU speed is a thread
that is not running, not a thread that is busy: the container's scheduler
preempting the renderer for seconds at a time.

Two other readings agree. The V8 CPU profiler attributes only ~300–800ms across
all the site's own scripts at 4× throttle, the largest named function being
`resolveLocale` at 79ms. And a timeline trace accounts for about 1.4s of
main-thread work in total. Neither leaves room for a real 2.3s task.

**So: do not optimise against these TBT numbers.** Whether the site has a
blocking problem has to be settled on the deployed site, which is already filed
in §7. What follows is limited to what this environment *can* establish.

### On the earlier attempts

Four attempts to derive long tasks from a trace each produced a number that was
wrong in a different way: a flood of `cc`/`viz` events that never completed; zero
long tasks, because the `toplevel` category was missing; 21 seconds of blocking
inside a 6-second window, because worker and compositor threads were summed in;
and then 11ms, because the `CrRendererMain` filter matched a different renderer
process. Recorded so the next person reaches for `PerformanceObserver` first.

## What is solid: bytes

None of this depends on the container's CPU.

| | home | /projects |
| --- | --- | --- |
| HTML document | **314 KB** | 197 KB |
| — styled-components CSS | **127 KB (40%)** | 76 KB (38%) |
| — RSC flight payload | 39 KB (12%) | 38 KB (19%) |
| — markup and the rest | 147 KB | 82 KB |
| JavaScript | 836 KB over 18 files | 836 KB over 18 files |

**127 KB of inline CSS on the homepage** is the clearest target. It is generated
by styled-components at render, arrives in the document, and has to be parsed
before anything paints — which fits the trace putting style recalculation at 19%
of main-thread work, second only to script execution, and `insertRule` showing up
in the CPU profile.

The largest JS chunks are react-dom (220 KB), the Next router (120 KB), an
unidentified 112 KB chunk, styled-components with next-intl (88 KB) and next-intl
alone (72 KB).

**Translations do not bloat the client.** Checked directly: no Russian or
Armenian string appears in any client chunk. next-intl serialises only the active
locale's messages into the flight payload, which is the 38–39 KB above.

## Work profile

From the timeline trace. The proportions hold across pages even though the
absolute times do not mean much here:

| | home | /projects | case study |
| --- | --- | --- | --- |
| script: run | 48% | 46% | 48% |
| style recalc | 19% | 16% | 11% |
| script: evaluate | 14% | 14% | 22% |
| layout | 10% | 11% | 9% |
| paint | 3% | 6% | — |
| parse HTML | 5% | 4% | 5% |

## What to do next, in order

1. **Cut the inline CSS.** 127 KB on the homepage, before first paint. Worth
   understanding where it comes from before changing anything — a homepage with
   this many sections generates a lot of per-component CSS, and some of it is
   likely duplicated across components that could share.
2. **Look at the 112 KB chunk** that matches none of the known library markers.
3. **Act on Lighthouse's byte-level audits**, which are facts rather than
   timings: `unused-javascript`, `legacy-javascript-insight`, `unsized-images`,
   and `unminified-css` on the homepage.
4. **Then measure on the deployed site**, and only then decide whether blocking
   time is a real problem.
