# ADR-0007: About page

**Status:** Accepted
**Date:** 2026-09-23
**Deciders:** Stepan Torchyan

## Context

Figma section 2973:9261 redesigns `/about` at three sizes: Desktop 2973:16130, Tablet 3960:15294 and Mobile 3983:10975. The page that exists today was built from an older design (hero, timeline, skills circles, CTA) and doesn't match any of it.

The new page has five parts:

1. **Hero** (3983:1266): the title over the layered Character, with "Based in Armenia" / "Working globally" and a **Generate Random** button between them.
2. **Hero info** (2973:16233 / 3960:15393 / 3983:11074): three centred paragraphs, the name in green.
3. **Timeline** (2973:16245 …): one card per workplace, a gallery that stays on screen and changes with the card, and a year rail down the left edge of the page.
4. **What I Do In Practice** (2973:16256 …): a grid of labelled circles behind a centred pill heading, over two large circle outlines.
5. **Positioning** (2973:16266 …): paragraphs, two CTA cards, a closing line.

## Decision

- **Rebuild the whole page**, one section per component under `src/components/sections/about/`, replacing today's four. Copy stays in `messages/*.json` under `about.*`, extended rather than restructured where the old keys still fit.

- **Hero character.** The same layered `Character` as the home hero: mouse-following eyes and head turn, and the bottom fade. It's sized from the section's height, as the frames have it (76% at 1920, hanging 4% past the bottom; 77% and 60% standing on the bottom edge at tablet and phone), capped by the frame's share of the screen width. The fade is the home hero's gradient mask, moved into the character module as an exported `characterFade` style that both heroes apply, rather than each copying the gradient.

- **Generate Random.** A pure `randomCharacter(previous)` in `aboutConfig.ts` picks clothes, cap and glasses under the design's rules, never repeating the current combination:

  | Part | Rule |
  |---|---|
  | Clothes | Russian 90's, Hoodie, Classic, Fight Club, Matrix 2, Sopranos, Pulp Fiction, Big Lebowski, Default, Armenian Traditional 2 |
  | Cap | only with Russian 90's, Hoodie, Default; may be off |
  | Glasses | matrix only with Matrix 2, Classic, Pulp Fiction (and always on Matrix 2); optical and default with any of the clothes above except Armenian Traditional 2; may be off |

  Only the button randomises: the page always opens on the default character, so the first paint is predictable and no extra image set is fetched on arrival. Each new part crossfades in, which the Character component already does per layer.
  - Classic (3960:16688) and Sopranos (3990:17062) are new in Figma. `scripts/export-character.py` gains an `--only` flag so new outfits can be exported without re-exporting the whole character.

- **Timeline.** The cards are a plain column; the gallery is the case study's sticky-gallery pattern (ADR 0006) with one set per workplace, picked by whichever card is crossing the middle of the screen. On phones the gallery drops out of the flow and sits behind the cards, as in the mobile frame.
  - Galleries hold placeholder screenshots from the projects already in the repo until the real ones arrive (see TODO).

- **Year rail** (3984:15175). A fixed rail on the left, from the header logo down, drawn as a gradient line with a dot, the year, and that year's phrase. It shows **one** year at a time: the entry the page is on, and it fades in with the timeline and out with it.
  - Figma puts it in the 1920 frame's 240px margin. Narrower than 1800px there is no such margin, so the rail keeps the year, drops the phrase, and the timeline leaves a gutter for it (`RAIL_SPACE`: 192 on a narrow desktop, 112 on a tablet, 96 on a phone) — measured at 1920, 1440, 1024 and 480 so the marker never crosses the cards.
  - This is the one place the build departs from the frames: Figma's tablet and phone put the year label over the cards' text, which can't be read. The cards move over instead.

- **What I Do In Practice.** The circles are a CSS grid (11 columns at desktop, 8 at tablet, 5 on a phone, as in the frames), rendered from one list of labels, with the heading pill over the middle.
  - The circles keep Figma's own sizes (156 / 114 / 88), so the grid is wider than the screen and the section clips it, exactly as the 1956-wide grid overhangs the 1920 frame.
  - At rest a circle is Figma's soft white disc (white at 25% under an 80px blur) with its label hidden; hovered it's solid green with the label in white. Both are radial gradients rather than blur filters: the same look without blurring 66 layers a frame, and the resting glow spreads past its own box so the circles melt into one field.
  - The two outlines behind them are bordered ellipses in CSS, and Figma's blurred backdrop ellipses (Group 29) are three more gradients.

- **Positioning.** The Projects page's `CollaborationSection` already draws these two cards from the same Figma component. The pair is extracted into a shared `CTACards` composite, and both pages use it.

## The three frames are different pages, not one scaled

Measured off the frames rather than derived from the 1920 one:

| | 1920 | Tablet 1024 | Phone 480 |
|---|---|---|---|
| Hero title | 96 Black, capitals | 72 Bold, as typed | 58 SemiBold, as typed |
| Hero footer | labels 18, button between them | the same | button above, labels 14 under it |
| Intro copy | 36/48 | 36/48 | 24/32 |
| Timeline | cards 756, gallery two columns beside | cards beside a single 408 column | cards full width, gallery a 244 strip stuck to the top |
| Practice | heading on a pill over the field, circles soft white, labels on hover | heading above the grid, 115px circles solid green with their labels | the same, 88px circles |
| Positioning | copy 28/36, cards side by side | the same | cards stacked |

## Consequences

- The About page is Figma-accurate at all three sizes and shares the character, sticky gallery and CTA card with the rest of the site, so those behaviours are fixed in one place.
- `AboutSkillsCirclesSection`, `AboutCTASection` and `timelineConfig.ts` are gone; `about.skills` becomes `about.practice`, whose circle list grows from 24 labels to the frames' 59.
- **Placeholders to replace:** the timeline gallery screenshots, per the user's note that real content and media come at the end.
- Two new outfits mean two more body images (about 160 KB each) in `public/character/v2/body/`.

## Action items

1. [x] Export the Classic and Sopranos outfits; add the `--only` flag to the export script.
2. [x] Build hero, hero info, timeline (cards, gallery, year rail), practice grid and positioning.
3. [ ] Replace the gallery placeholders with real screenshots per workplace.
4. [ ] Russian and Armenian translations for the new `about.*` keys.
