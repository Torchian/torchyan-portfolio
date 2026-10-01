# torchyan-portfolio

Stepan Torchyan's portfolio site: Next.js 16 (App Router, React 19), TypeScript,
styled-components, next-intl. English, Russian and Armenian.

Built to a Figma file, so most components carry the frame id they were built from
in a comment at the top. When a component's layout looks arbitrary, that comment
is the reason.

---

## Getting started

```bash
npm ci            # exactly the lockfile; `npm install` may drift from it
cp .env.example .env.local
npm run dev       # http://localhost:3000
```

Nothing in `.env.local` is required to run the site — every variable falls back to
a safe default, and `.env.example` documents each one.

**Judge speed on a production build, never on `npm run dev`.** The dev server
serves unminified code, compiles each page the first time it is asked for, and
encodes images on their first request, so it is several times slower by design:

```bash
npm run build && npm run start
```

---

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server. |
| `npm run build` | Production build. |
| `npm run start` | Serves the build. Use this to judge performance. |
| `npm run lint` | ESLint, including the React Compiler rules. |
| `npx tsc --noEmit` | Typecheck. There is no script alias for it. |
| `npm run check:messages` | Fails if `ru.json` or `hy.json` has drifted from `en.json`: a missing or extra key, a list of a different length, an empty string, different `{placeholders}`. Run it after touching any translation. |
| `npm run tokens` | Regenerates `src/styles/tokens/` from `tokens.json`. |
| `npm run images` | Right-sizes new project images and converts them to WebP. `-- --dry` reports without changing anything. |
| `npm run push` | `git push` with a larger buffer, for pushes with big assets. |

Two Python scripts bake the character artwork: `scripts/bake-character.py` and
`scripts/export-character.py`. See `docs/adr/0005-character-component.md`.

### Design tokens are generated

`src/styles/tokens/*.ts` is generated from `tokens.json` (a Figma export) and
every file says so at the top. Edit `tokens.json` and run `npm run tokens`; a
hand-edit to a generated file is overwritten by the next run, and CI fails if the
two have drifted.

---

## Environment

All four variables are optional in development. See `.env.example` for the
defaults and the details.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | The site's own origin. Canonical URLs, hreflang, the sitemap, `robots.txt` and the Open Graph URLs are all built from it. |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4. Blank loads no GA script at all. |
| `NEXT_PUBLIC_YM_COUNTER_ID` | Yandex Metrica. Blank loads no Yandex script. Read the analytics consent item in `TODO.md` before setting this in production. |
| `DEV_COUNTRY` | Development only: forces the country used for locale detection. |

---

## Layout

```
src/
  app/[locale]/       routes; (site) holds the pages that share the site chrome
  components/
    primitives/       buttons, toggles, the logo — the smallest pieces
    composites/       pieces built from primitives
    layouts/          NavBar, SiteLayout, PageLoader, CustomCursor
    sections/         one folder per page section, each with its own config
  hooks/              scroll stepping, off-screen pausing
  i18n/               routing, request config, country detection
  lib/                analytics, seo, sound, the scroll driver
  store/              zustand stores (ui state)
  styles/             tokens (generated), themes, media helpers, global css
messages/             en.json, ru.json, hy.json
docs/
  adr/                why things are built the way they are
  audits/             measured audit results, dated
tokens.json           the Figma token export that src/styles/tokens is built from
TODO.md               the prioritised work list
```

### Breakpoints follow Figma frames

`src/styles/media.ts` maps each breakpoint token to a Figma frame, where a frame
covers everything up to its own width: the 1280 frame is 1025–1280px, the 1024
frame 769–1024px. So `media.up('xl')` is `min-width: 1024.02px`, not 1280. The
`.02` leaves no gap at fractional widths when the browser is zoomed.

---

## Localization

English is the default and has no prefix; Russian and Armenian live under `/ru`
and `/hy`. Copy lives in `messages/*.json`. After any change there, run
`npm run check:messages`.

Armenian and Russian strings are consistently longer than English — often enough
to change a layout. Both are worth checking whenever a layout is height- or
width-constrained. See `docs/adr/0002-localization.md`.

---

## Architecture decisions

| ADR | Subject |
| --- | --- |
| `0001` | Sound system |
| `0002` | Localization |
| `0003` | Page-load reveal |
| `0004` | Selected Work grids |
| `0005` | Character component |
| `0006` | Case study page |
| `0007` | About page |
| `0008` | Studio relaunch: pages, proof and contact |

---

## CI

`.github/workflows/ci.yml` runs on every push and pull request: lint, typecheck,
`check:messages`, a check that the generated tokens are up to date, and a build.
Each is its own step, so a failure names itself.

There is no test runner yet — see `TODO.md` §16.

---

## Deploying

Vercel is the intended host: the locale detection in `src/i18n/detection.ts`
already reads Vercel's country header, and image optimisation needs no extra
setup there. On another host, check two things: that host's country header (or
detection falls back to the browser language), and whether `sharp` needs moving
from `devDependencies` into `dependencies` for image optimisation.

Security headers, including a Content-Security-Policy, are set in
`next.config.ts`. **The CSP is report-only.** Before enforcing it, load the
deployed site with the analytics variables set and walk every page watching the
console — the analytics entries in the policy are untested without those keys.
See `docs/audits/2026-09-27-header-and-accessibility.md` §4.

---

## Before launch

`TODO.md` is the single work list: 16 sections, each item tagged with a priority
(P0 launch blocker → P3) and an owner (Dev / Design / Decision), with finished
work archived at the bottom. Start at §1.
