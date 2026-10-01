# ADR-0008: Studio relaunch — pages, proof and contact

**Status:** Accepted
**Date:** 2026-10-01
**Deciders:** Stepan Torchyan

## Context

The site was a personal Design Engineer portfolio. It is being relaunched as Torchyan, a founder-led digital product studio, without a redesign: the visual identity, character system, sound, motion, tokens and component architecture stay. The strategy, information architecture and English copy were approved before this change; the factual source for every claim is the founder's project register (roles, dates, relationships, logo and map permissions).

## Decision

- **Navigation.** The pill carries Services · Work · About; the logo is Home; "Start a project" (→ `/contact`) is the button. Three links keep the pill the width `DESKTOP_HEADER_QUERY` was measured against. `/projects` keeps its URL and is labelled "Work".

- **New routes, from existing pieces.** `/services`, `/contact` and `/privacy`. The Projects hero is parametrised (`PageHeroSection`) and reused by Services and Contact; `CollaborationSection` takes its namespace and hrefs as props; the Services body (`sections/services/`) is built from `SectionHeading` and `InfoCard` only.

- **The homepage's four cards are areas of responsibility** (Websites, Product interfaces, Design systems, Launch & improvement), not packaged offers. How an engagement begins (defined project, ongoing partnership, diagnostic) lives on `/services`, with no tiers or prices.

- **Projects are split from homepage cards.** `PROJECTS` lists every project with a case page (it drives the case routes and the sitemap); only entries with a `card` (grid + CTA fill) appear in Selected Work. That keeps the homepage at Picsart, SoulOne, Smartbet and All work, and lets Ginosi, Benzeen, World Education and Brainstorm have case pages without hand-measured grids.

- **Short case format.** Projects without the full Picsart template render a labelled story (`projects.<slug>.story`: relationship & role, context, what I did, evidence, what it shows) with `CaseBlocks`. Every case states the exact role and relationship.

- **Work rows.** Seven rows, one per project in the proof register, each with its own copy and screenshots, laid out in the Picsart row's tilted geometry. A column with few screenshots repeats them to cover its length. A row with no confirmed stack hides "Built with" rather than guessing.

- **Credibility.** Logos are grouped by relationship under visible labels (direct clients, employers, through partner companies, product & teaching), and no longer link out. The set follows the founder's register; the Partners carousel uses the same set.

- **Reach map.** Kept on the home page and reused on `/contact` (one implementation, `YearsMapSection id`). Points are only verified places of past work; a point without a confirmed year shows none. The title sits above the map (it is two lines and covered the US points when laid across it). A visually hidden list carries the same information for screen-reader and keyboard users.

- **Contact.** One destination for every "Start a project". Fields: what you need (the four areas or "not sure"), name, work email, company, website, message, timeline; Project Stage removed; budget deferred until there are price ranges. Success only after a 2xx; validation, rate-limit and delivery failures each say what happened, and field errors are tied to their inputs. The honeypot is now `nickname`, since `company` is a real field.

- **Analytics.** Vercel Web Analytics only (cookieless). GA4 and Yandex Metrica are not rendered until consent handling exists, so the privacy notice is true regardless of environment variables. Events: `cta_click`, `service_interest`, `contact_form_start`, `contact_form_submit`, `contact_form_error`, `case_view`, `outbound_contact`, with no personal data. One document-level listener reads `data-cta`, `data-area` and `data-outbound`, so server components don't become client components for tracking.

- **Localization.** English is the source. Russian and Armenian carry the new English strings until they are adapted (`check:messages` passes; unchanged strings keep their translations). Country-based redirection to `/ru` is suspended until then (`COUNTRY_LOCALES`).

## Consequences

- Russian and Armenian need adapting before launch, then `COUNTRY_LOCALES` restored.
- The privacy notice needs the data controller's legal details and a review before the site is opened.
- The footer's "Designer × Engineer" lettering and the default social image still carry the portfolio identity; both are design assets to replace.
- Vercel Web Analytics must be enabled for the project in the Vercel dashboard; locally its script 404s, which is expected.
- `hello@torchyan.design` receives mail through ImprovMX forwarding (free plan; `MX` and root `SPF` records at GoDaddy, separate from Resend's records). ImprovMX is therefore a processor and is named in the privacy notice. Replying as `hello@` needs a real mailbox, which is deferred.
