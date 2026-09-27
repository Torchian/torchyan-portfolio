# Header and accessibility audit — 2026-09-27

Run on a **production build** (`npm run build && npm run start`) in headless
Chromium 1194, driven by Playwright. Judge nothing here on the dev server: it
serves unminified code, compiles pages on demand and encodes images on first
request.

Coverage: `/`, `/projects`, `/projects/picsart`, `/about` × `en`, `ru`, `hy` ×
desktop (1440×900) and phone (390×844) — 24 runs. The header was measured
separately at 11 widths from 320 to 1920 in all three locales.

---

## 1. Header responsiveness

The owner's original list said header responsiveness was broken. That report
predates the NavBar rebuild to Figma 2562:2761, and the audit finds the bar
sound at every width in every locale: no horizontal page scroll anywhere, the bar
80px tall throughout, the layout switching cleanly between the three designs, and
nothing hanging outside the viewport or off the bar.

One real defect turned up, and it is fixed:

**Audio controls overlapped Contact Me on `/hy`.** At 1025px wide the cluster ran
7px into the button; clearance returned at about 1043px. Cause: `NavCluster` is
`position: absolute` and centred on the *viewport*, so the header's
`justify-content: space-between` cannot keep it clear of anything, and its width
is its content's — which grows with the longest translation. The Armenian link
pill is 454px against English's 386px.

Fixed by moving the boundary between the 1280 and 1024 frame designs from the
frame's own 1025px to 1060px (`DESKTOP_HEADER_QUERY`), which is where the widest
locale fits with the same 12px the cluster puts between its own parts. Below it
the 1024 design takes over, where the language switcher and audio switches are
rows in the menu panel, so nothing becomes unreachable.

Clearance between the cluster and Contact Me after the fix:

| width | en | ru | hy |
| --- | --- | --- | --- |
| 1024 | *1024 frame design* | *1024 frame design* | *1024 frame design* |
| 1059 | *1024 frame design* | *1024 frame design* | *1024 frame design* |
| 1060 | 52px | 41px | 11px |
| 1100 | 72px | 61px | 31px |
| 1280 | 162px | 151px | 121px |
| 1920 | 482px | 471px | 441px |

The number is set by the width of the language and audio flanks, which are
provisional and not in the Figma file. Revisit it when their placement is
designed.

---

## 2. Automated accessibility (axe-core 4.13.0)

Rules: `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `best-practice`.

**Result: 0 violations across all 24 runs.**

One rule fired before this pass and is fixed:

**`aria-allowed-role` (minor, 102 nodes, homepage in every locale and size).**
Trusted By carried `role="list"` on its container and `role="listitem"` on each
logo. That fails twice over: `listitem` is not allowed on the `<a>` a linked logo
renders as, since a link already has a role, and the `Row` wrappers in between
stop a list from owning its items anyway. The roles are gone. The logos are
images with their company name as `alt` text inside a section labelled by its
heading, which carries the meaning without them. Making them a real list needs
`<ul>`/`<li>` per row with an `<a>` nested in each `<li>`; that is filed rather
than done, since the only thing gained is the item count.

### What this result does *not* mean

axe checks what a machine can check — roughly a third of the WCAG criteria. A
clean axe run says the markup is sound, not that the site is accessible. Every
finding in section 3 below is real and none of it was caught by axe.

---

## 3. Manual checks axe cannot make

### Fixed: focus escaped the open menu

Tabbing past the last row of the phone menu moved focus onto page content behind
the panel — visible to a screen reader and to the tab order, invisible on screen.
Focus is now kept inside the menu button and the panel, wrapping at both ends.

Verified: 12 forward tabs cycle the 7 panel stops and the button, wrapping at the
8th back to Home; Shift+Tab walks back the same way.

### Fixed: focus was dropped on close

Escape closed the panel but left focus on whatever it had reached. The panel goes
`inert` as it closes, so that focus was discarded and the next Tab restarted from
the top of the page. Closing now hands focus back to the menu button.

Verified: after Escape the panel is `visibility: hidden` and focus is on the
button, which reads "Open menu" again.

### Sound: tab order and focus rings

The first stop on every page is Skip to content. Every header control is
reachable and shows a focus ring. Nothing is reachable while off screen.

### Advisory: the CTA buttons signal focus with colour alone

Contact Me and See My Work draw no outline on focus; their label turns brand
green instead. Measured at **6.72:1** against the page background (white-on-dark
is 18.26:1), so it passes WCAG 2.4.7 Focus Visible and 1.4.3 Contrast. Two
caveats worth a decision rather than a fix:

- It is driven by `:focus`, not `:focus-visible`, so a mouse click shows it too.
- WCAG 2.2's 2.4.11 Focus Appearance asks for an indicator of a given area and
  contrast *against the unfocused state*. A label colour change may not meet it.

### Open: reduced motion is only partly covered

Under `prefers-reduced-motion: reduce`, 14 animations were still running two
seconds after load:

| count | target | kind |
| --- | --- | --- |
| 5 | `NavBar__Line` | transition |
| 3 | `LowerPageBackground__Artwork` | transition |
| 2 | `Footer__NameGroup` | transition |
| 1 | `LowerPageBackground__Layer` | transition |
| 1 | `Footer__NameGroupArt` | transition |
| 1 | an `<img>` | transition |
| 1 | `PageLoader__Overlay` | **keyframe animation** |

Transitions are state changes and reduced motion does not require removing them
all, so most of these are a judgement call rather than a defect. The page loader
is the clear one: a keyframe animation that keeps running under an explicit
request for less motion. Filed in TODO.md §8.

---

## 4. Security headers

Added in `next.config.ts` and confirmed on both pages and static assets:
`Strict-Transport-Security` (one year, `includeSubDomains`, no `preload`),
`X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`,
`X-Frame-Options`, `Cross-Origin-Opener-Policy`, and a CSP.

**The CSP is report-only, deliberately.** It reported nothing across all 24 runs,
but that is weaker evidence than it sounds: the analytics scripts only load when
their env vars are set, and they are not set here, so the `script-src` and
`connect-src` entries for Google Tag Manager and Yandex are untested. Watch the
console on the deployed site with the analytics keys in place, walk every page,
and only then rename the header to `Content-Security-Policy` — adding
`upgrade-insecure-requests` in the same change, since a report-only policy
ignores it.

The policy keeps `'unsafe-inline'` in both `script-src` and `style-src`. Next.js
inlines its bootstrap and flight data, and styled-components writes real inline
styles; the nonce alternative would make every page dynamically rendered and cost
this site its static export. `'unsafe-eval'` is not needed.

---

## How to re-run

The scripts are not committed — they are throwaway Playwright drivers. To
reproduce: build, `npm run start`, then drive headless Chromium at
`/opt/pw-browsers/chromium-1194/chrome-linux/chrome` over the matrix at the top,
injecting `axe-core/axe.min.js` and calling `axe.run` with the tag list above.
Note that `/en` 307-redirects, since English is the unprefixed default locale.
