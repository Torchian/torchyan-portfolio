# ADR-0002: Localization

**Status:** Accepted
**Date:** 2026-09-15
**Deciders:** Stepan Torchyan

## Context

The site was English-only. It now needs Russian and Armenian, with English as the default. First-time visitors should land in their language based on where they are, and a header switcher shows **Eng / Рус / Հայ**.

What shaped the design:
- **Copy location.** All copy was hardcoded in about 20 section components and five config files.
- **Client components.** Almost every section is a client component (styled-components).
- **Font coverage.** Gilroy covers Latin and Cyrillic but has no Armenian glyphs.

## Decision

- **Library.** next-intl 4 handles routing, message loading and typed keys.
  - `src/i18n/routing.ts` holds the locales and `localePrefix: 'as-needed'`: English at `/about`, Russian at `/ru/about`, Armenian at `/hy/about`.
  - `src/i18n/navigation.ts` provides locale-aware `Link` and `usePathname`.
- **Detection and redirects** live in `src/proxy.ts` (Next 16's replacement for middleware), not in next-intl:
  - **Bots** are never redirected; hreflang covers them.
  - **Prefixed URLs** always render their own language and never change the saved choice.
  - **Unprefixed pages** use the `NEXT_LOCALE` cookie. Without it, the proxy detects the language once and remembers it for a year.
  - **Detection order:** country header first (Vercel, Cloudflare, CloudFront), then `Accept-Language`, then English.
  - **Country map:** `COUNTRY_LOCALES` in `src/i18n/detection.ts`.
- **Messages.**
  - **Files:** `messages/{en,ru,hy}.json`, one namespace per area.
  - **Config files** keep only data that doesn't change between languages (slugs, years, company names, images, geometry).
  - **Keys are typed** against `en.json` through next-intl's `AppConfig`, so a wrong key fails `tsc`.
  - **`npm run check:messages`** checks that ru and hy have the same keys, list lengths and placeholders as English.
- **Armenian font.** Bainsley (SIL OFL, 400 and 700) is subset into two woff2 files with separate `unicode-range`s:
  - A 4 KB file for the switcher's "Հայ", which appears on every page.
  - A 19 KB file for the rest of the Armenian block, downloaded only by pages that contain Armenian text.
- **Switcher.** A glass circle with a disclosure list of real links, placed left of the link pill with sound on its right. Below 1025px it becomes a menu panel row.
- **SEO.**
  - **Metadata:** every page emits a canonical URL, hreflang alternates (including `x-default`) and `og:locale`.
  - **Sitemap:** lists each page once per language, with its alternates.

## Options considered

### A: next-intl with a custom detection proxy (chosen)

| Dimension | Assessment |
|---|---|
| Complexity | Medium |
| Cost | About 15 KB client runtime |
| SEO | Crawlable, prefixed URLs with hreflang |
| Maintainability | Typed keys and a parity check |

**Pros:** built for the App Router with static rendering; typed messages; locale-aware navigation.
**Cons:** its built-in detection can't rank country above browser language, so the proxy owns detection.

### B: Extend the old `src/lib/i18n` scaffold (plain JSON and a React context)

**Cons:** we'd have to build routing, the client provider, typed keys and navigation ourselves. Removed.

### C: Cookie-only language with no URL change

**Cons:** search engines see English only, and links can't point to a specific language. Rejected by the user.

## Consequences

- **Adding copy** means adding a key to all three files; `tsc` and `check:messages` catch gaps.
- **Adding a language** means a locale in `routing.ts`, a messages file, a label in `LANGUAGE_LABELS`, and a font check.
- **The first visit** on an unprefixed URL may cost one 307 redirect; cached pages stay static.
- **Country detection depends on the host.** On a host without one of the known headers, it falls back to the browser language.
- **Not localized yet:**
  - the footer's SVG name lettering;
  - the contact form submits translated option labels.

## Action items

1. [x] Routing, proxy, messages, switcher, Armenian font, SEO.
2. [x] Draft Russian and Armenian translations.
3. [ ] Native review of the RU and HY copy.
4. [ ] Armenian typography QA, and a design for the switcher in Figma.
