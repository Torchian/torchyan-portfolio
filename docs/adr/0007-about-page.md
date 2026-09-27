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

- **Hero character.** The same layered `Character` as the home hero: mouse-following eyes and head turn, and the bottom fade. It is **hung between two edges rather than given a size**, because the character's frame puts its crown at the very top of its square and its feet at the very bottom (`characterLayout`: head at y 0, body ending at 1024 of 1024), so those two edges are exactly the two things the design asks for: the top is the title's last line less a 24px overlap, so the head always covers a little of it however many lines the title takes, and the bottom is 16px past the section, so the figure always runs on past the row along the bottom. The height between them is its size and the square's width follows. `--hero-title-end` is measured, since the title rewraps with the width. The phone frame keeps its own rule: standing on the bottom edge at 60% of the hero. The fade is the home hero's gradient mask, moved into the character module as an exported `characterFade` style that both heroes apply, rather than each copying the gradient.

- **Generate Random.** A pure `randomCharacter(previous)` in `aboutConfig.ts` picks clothes, cap and glasses under the design's rules, never repeating the current combination:

  | Part | Rule |
  |---|---|
  | Clothes | Russian 90's, Hoodie, Classic, Fight Club, Matrix 2, Sopranos, Pulp Fiction, Big Lebowski, Default, Armenian Traditional 2 |
  | Cap | only with Russian 90's, Hoodie, Default; may be off |
  | Glasses | matrix only with Matrix 2, Classic, Pulp Fiction (and always on Matrix 2); optical and default with any of the clothes above except Armenian Traditional 2; may be off |

  Only the button randomises: the page always opens on the default character, so the first paint is predictable and no extra image set is fetched on arrival. Each new part crossfades in, which the Character component already does per layer.
  - Classic (3960:16688) and Sopranos (3990:17062) are new in Figma. `scripts/export-character.py` gains an `--only` flag so new outfits can be exported without re-exporting the whole character.

- **Timeline.** The cards are a plain column; the gallery is the case study's sticky-gallery pattern (ADR 0006) with one set per workplace, picked by whichever card is under the year marker. On phones the gallery drops out of the flow and sits behind the cards, as in the mobile frame.
  - **The card (2810:6345) is three states, not one.** Desktop (2810:6108), Tablet (3984:12537) and Mobile (3984:12572) differ in rhythm as well as type: the card carries its own padding — 40 top and bottom with an 80 indent at 1920, 24 all round below — and the column sets them 40 apart, or flush on a phone. In all three the labels ("Focus", "Impact") are the muted colour and the lines under them are at full strength, not the other way round.

    | | 1920 | Tablet | Phone |
    |---|---|---|---|
    | Company | 36/48 SemiBold | 28/36 Medium | 24/32 SemiBold |
    | Role | 24/32 | 18/24 | 16/20 |
    | Label | 18/24 | 16/20 | 14/18 |
    | Lines | 18/24, bullets hung 27 | 16/20, 24 | 14/18, 21 |
    | Growth | 18/24, 32 apart | 16/20, 24 apart | 14/18, 24 apart |
  - Galleries hold placeholder screenshots from the projects already in the repo until the real ones arrive (see TODO).

- **Year rail** (3984:15175). A fixed rail on the left, from the header logo down, drawn as a gradient line with a dot, the year, and that year's phrase. It shows **one** year at a time: the entry the page is on, and it fades in with the timeline and out with it.
  - **Timeline Year (2810:6629) is three states and the marker is built from them**, not scaled down to fit: a 52px dot at every size (Figma's Map Dot 3 — 48/30/12 circles at 20%, 30% and full, drawn at 52), hanging 12 below the year's cap line at 1920 and 10 on a tablet; the year 72/80 Bold, 58/72 SemiBold and 36/48 SemiBold; the phrase 18, 16 and 14 in the muted grey; the gaps 24/16/10 beside the dot and 16/8/0 under the year.
  - Figma puts the marker in the 1920 frame's 240px margin. Narrower than that there is no such margin, so it covers the left edge of the page instead, and the gutter is what those sizes actually need (`RAIL_SPACE`: 248 on a desktop, 208 on a tablet, 156 on a phone).
  - **The section is not indented for it.** It uses the page's ordinary centred container, so its heading lines up with every other section's; only the rows the marker rides beside — the gallery strip and the cards — step right, by `RAIL_SPACE` plus a 16px clear. On a desktop that step is `max(0, …)` against the page's own margin, so it closes itself as the window widens and nothing jumps at the width where the margin takes the marker back.
  - This is the one place the build departs from the frames: Figma's tablet and phone put the year label over the cards' text, which can't be read. The cards move over instead — which on a tablet leaves them 312 wide. The phrase is set on one line at every size in Figma, which on a phone is 220px of a 480 screen, so there it steps out and the gutter holds the year alone.
  - **The marker rides in and then holds.** It starts beside the first card — not at the section's top, where it would sit next to the heading — travels up with the page and sticks 80px down, level with the gallery, until the timeline ends. The rail runs from the logo far above, so `--rail-top` places the rail and `--rail-head` pushes the marker down to where the cards begin.
  - Because the year now sits beside the card headings rather than mid-screen, the active entry is the topmost card still crossing a band that starts where the marker holds. The observer keeps its own map of that band's contents, since a record only arrives for a card whose state changed.

- **What I Do In Practice.** The circles are one list of labels laid out by a flex track whose width is Figma's own grid width (1956 / 1024 / 456). That width is what breaks the rows at 11, 8 and 5 and keeps a short last row centred, and it is wider than the screen at every size, so the section clips it exactly as the 1956-wide grid overhangs the 1920 frame.
  - **The disc is a real blur, not a gradient.** Figma's Circle Text (2843:6620) is a circle the size of the cell with a layer blur on it: white at 25% under 80 at rest, `#0CAF0A` under 10 when hovered. `filter: blur(40px)` and `blur(5px)` reproduce both exactly. An earlier build approximated them with radial gradients to avoid blurring 66 layers, and it did not look like the design — the blur is most of what the section *is*. It costs nothing to scroll past, because nothing animates: measured through the section at 4× CPU throttling, the median frame is 16.7ms and the worst is 17.8ms; only the first reveal pays a one-off ~100ms raster.
  - At 1920 the label is transparent until its circle is hovered, so the grid carries no words at all — the heading lies over the middle of it on a dark green pill (`#0d1816`, the CTA card's fill; 96 Black uppercase in green over a 24 line in white). Below 1025 there is no hover, so every circle is already green with its label showing, and the heading stands above the grid with no pill and a white title.
  - Each frame fills its own grid, so the list is as long as the widest (66 = 6 × 11) and the narrower sizes drop the last two (64 = 8 × 8) or the last one (65 = 13 × 5), in CSS.
  - Figma's blurred backdrop ellipses (Group 29) are four radial gradients, placed and weighted from the exported SVG: each gradient's centre carries what a blur of that width leaves of its fill, and reaches the disc plus about two and a half blurs.
  - There are **no ring outlines**. The two large arcs in the frame (4011:17099, 4011:17103) sit entirely outside it — one past the right edge, one below the bottom — so nothing of them is drawn; an earlier build invented them.

- **Positioning.** The Projects page's `CollaborationSection` already draws these two cards from the same Figma component. The pair is extracted into a shared `CTACards` composite, and both pages use it.

## The three frames are different pages, not one scaled

Measured off the frames rather than derived from the 1920 one:

| | 1920 | Tablet 1024 | Phone 480 |
|---|---|---|---|
| Hero title | 96 Black, capitals | 72 Bold, as typed | 58 SemiBold, as typed |
| Hero footer | labels 18, button between them | the same | button above, labels 14 under it |
| Intro copy | 36/48 | 36/48 | 24/32 |
| Timeline | cards 748 indented 80, gallery two columns beside | cards indented 24 beside a single 408 column | cards indented 24, gallery a 244 strip stuck to the top |
| Practice | heading on a pill over the field, 156px circles blurred white, labels on hover | heading above the grid, 114px circles green with their labels | the same, 88px circles |
| Positioning | copy 28/36, cards side by side | the same | cards stacked |

## Consequences

- The About page is Figma-accurate at all three sizes and shares the character, sticky gallery and CTA card with the rest of the site, so those behaviours are fixed in one place.
- `AboutSkillsCirclesSection`, `AboutCTASection` and `timelineConfig.ts` are gone; `about.skills` becomes `about.practice`, whose circle list grows from 24 labels to the frames' 66.
- **Placeholders to replace:** the timeline gallery screenshots, per the user's note that real content and media come at the end.
- Two new outfits mean two more body images (about 160 KB each) in `public/character/v2/body/`.

## Action items

1. [x] Export the Classic and Sopranos outfits; add the `--only` flag to the export script.
2. [x] Build hero, hero info, timeline (cards, gallery, year rail), practice grid and positioning.
3. [ ] Replace the gallery placeholders with real screenshots per workplace.
4. [ ] Russian and Armenian translations for the new `about.*` keys.
