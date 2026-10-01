'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { Button } from '@/components/primitives';
import { Character, characterFade } from '@/components/composites/character/Character';
import { useLookAtPointer } from '@/components/composites/character/useLookAtPointer';
import { spacing } from '@/styles/tokens/spacing';
import {
  fontFamily,
  fontWeight,
  fontSize,
  lineHeight,
  letterSpacing,
} from '@/styles/tokens/typography';
import { accents, neutrals } from '@/styles/tokens/colors';
import { grid } from '@/styles/tokens/grid';
import { media } from '@/styles/media';
import { zIndex } from '@/styles/tokens/z-index';
import { useTranslations } from 'next-intl';
import { DEFAULT_LOOK, randomCharacter, type CharacterLook } from './aboutConfig';

/*
 * Figma: About Hero (3983:1266 — Default / Tablet / Mobile).
 *
 * The title, the character standing in the middle of the screen, and a row
 * along the bottom: where I am, "Generate Random", where I work. The character
 * fades out into the page at its feet (the home hero's mask) and follows the
 * pointer with its eyes and head, exactly as the home hero's pair does.
 *
 * Pressing the button dresses it again — see randomCharacter for what can go
 * with what. Only the button randomises, so the first paint is always the same
 * character.
 */

/**
 * The character's width at the widest — Figma's 820 in a 1920 frame, grown
 * 10% past the frame so it reads bigger against the title and the footer row
 * (see GROW). This picks the image's download resolution; the box itself is
 * sized by CharacterStage and scaled by the same factor.
 */
const CHARACTER = 902;
/** How much bigger than the frame the character renders, both mobile and up. */
const GROW = 1.1;

const Section = styled.section`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100svh;
  padding: ${spacing[1000]}px 0 ${spacing[400]}px;
  /*
   * Not \`overflow: hidden\`: the crown is DESIGNED to run above the section's
   * own content box (into the title, via OVERLAP), and the pointer-driven head
   * turn moves it further still — up to about 20px, toward wherever the
   * pointer is. A clipped section cut that motion off the moment the cursor
   * went near the top of the page, which read as the cap's top being sliced
   * flat. Nothing else in the section needs the clip: its own content never
   * exceeds its box, only the character does, on purpose.
   */
`;

const Container = styled.div`
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: ${grid.maxWidth}px;
  padding: ${spacing[1000]}px ${spacing[800]}px ${spacing[400]}px;

  ${media.down('xl')} {
    padding: ${spacing[1000]}px ${spacing[600]}px ${spacing[400]}px;
  }

  ${media.down('m')} {
    padding: ${spacing[1000]}px ${spacing[400]}px ${spacing[400]}px;
  }
`;

const Title = styled.h1`
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1376px;
  margin: 0;
  font-family: ${fontFamily.display};
  font-weight: ${fontWeight.black};
  font-size: ${fontSize.display.l}px;
  line-height: ${lineHeight.display.l}px;
  letter-spacing: ${letterSpacing.xxs}px;
  text-align: center;
  /* Only the 1920 frame shouts; the tablet and phone frames set it as typed. */
  text-transform: uppercase;
  color: ${accents.primary};

  ${media.down('xl')} {
    font-weight: ${fontWeight.heading};
    font-size: ${fontSize.display.s}px;
    line-height: ${lineHeight.display.s}px;
    letter-spacing: ${letterSpacing.xs}px;
    text-transform: none;
  }

  ${media.down('m')} {
    font-weight: ${fontWeight.semibold};
    font-size: ${fontSize.heading.l}px;
    line-height: ${lineHeight.heading.l}px;
  }
`;

/**
 * The character is framed so that its crown is the very top of its square and
 * its feet are the very bottom (characterLayout: the head sits at y 0, the body
 * ends at 1024 of 1024). So the square's two edges are the two things the design
 * asks for, and it is hung from both rather than given a size:
 *  - its top is set into the title's last line by OVERLAP, so the crown always
 *    reaches the middle of that line's letters however many lines the title
 *    takes — a round crown, so it hides about a fifth of the line;
 *  - its bottom is BLEED past the section, so the figure always runs on past the
 *    row along the bottom rather than stopping short of it.
 * The height between them is the character's size, and the square's width
 * follows. `--hero-title-end` is where the title ends, measured.
 */
/**
 * Measured up from the title's bottom edge: the descender and half-leading
 * under the last line, plus half its cap height — which lands the crown in the
 * middle of the letters. It is a little over half the line's height at either
 * size, so it is taken from the line-height and follows the type.
 */
const CROWN = 0.52;
const OVERLAP = {
  base: Math.round(lineHeight.display.xl * CROWN),
  tablet: Math.round(lineHeight.display.m * CROWN),
} as const;
const BLEED = { base: 16, tablet: 12 } as const;

/*
 * GROW is baked into the layout size itself (the height calc's own factor),
 * not a \`transform: scale()\` on top of it. A CSS scale on a raster image
 * resamples every pixel, and the cap's own artwork has its button flush
 * against the very top of its canvas with no transparent margin at all — the
 * least forgiving pixel on the whole character. Scaling reintroduced exactly
 * the sub-pixel rounding that \`overflow: hidden\` used to hide: at some
 * fractional \`--hero-title-end\` values the resampled top row thins to
 * nothing and the button reads as clipped, intermittently, which is why
 * removing the section's overflow didn't fix it. Growing the box's own layout
 * size instead means the browser rasterises the image once, at its true
 * final size — nothing to resample away.
 */
const CharacterStage = styled.div`
  position: absolute;
  left: 50%;
  top: calc(var(--hero-title-end, 40%) - ${OVERLAP.base}px);
  height: calc(${GROW} * (100% + ${BLEED.base + OVERLAP.base}px - var(--hero-title-end, 40%)));
  aspect-ratio: 1;
  transform: translateX(-50%);
  pointer-events: none;
  z-index: ${zIndex.sticky};
  ${characterFade}

  ${media.down('xl')} {
    top: calc(var(--hero-title-end, 40%) - ${OVERLAP.tablet}px);
    height: calc(
      ${GROW} * (100% + ${BLEED.tablet + OVERLAP.tablet}px - var(--hero-title-end, 40%))
    );
  }

  /* The phone frame stands it on the bottom edge instead, at 60% of the hero,
     without GROW: that rule is tuned on its own, and the extra size would only
     push it further over the title's lower lines. */
  ${media.down('m')} {
    top: auto;
    bottom: 0;
    height: min(60%, 112vw);
  }
`;

const Footer = styled.div`
  position: relative;
  z-index: ${zIndex.overlay};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing[400]}px;
  width: 100%;
  margin-top: auto;
  padding: ${spacing[0]}px ${spacing[400]}px;

  /* The phone frame stands the button above the two labels, which share a line. */
  ${media.down('m')} {
    flex-wrap: wrap;
    gap: ${spacing[400]}px;

    & > button {
      order: -1;
      flex: 1 0 100%;
    }
  }
`;

const Label = styled.p`
  flex: 1 1 0;
  margin: 0;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.body.xl}px;
  line-height: ${lineHeight.body.xl}px;
  letter-spacing: ${letterSpacing.s}px;
  color: ${neutrals[500]};

  &:last-of-type {
    text-align: right;
  }

  ${media.down('m')} {
    font-size: ${fontSize.body.m}px;
    line-height: ${lineHeight.body.m}px;
  }
`;

/** Where the custom look is worth fetching: a pointer that can drive the eyes. */
const LIVE_QUERY = '(hover: hover) and (pointer: fine)';

export function AboutHeroSection() {
  const t = useTranslations('about.hero');
  const [look, setLook] = useState<CharacterLook>(DEFAULT_LOOK);
  const [live, setLive] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const targets = useMemo(() => [stageRef], []);

  // Where the title ends inside the section — it moves whenever the title
  // rewraps, so the character keeps meeting its last line at any width.
  useEffect(() => {
    const section = sectionRef.current;
    const title = titleRef.current;
    if (!section || !title) return;
    const measure = () => {
      const end = title.getBoundingClientRect().bottom - section.getBoundingClientRect().top;
      section.style.setProperty('--hero-title-end', `${Math.max(0, end)}px`);
    };
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(title);
    resize.observe(section);
    return () => resize.disconnect();
  }, []);

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointer = window.matchMedia(LIVE_QUERY);
    const sync = () => setLive(pointer.matches && !motion.matches);
    sync();
    pointer.addEventListener('change', sync);
    motion.addEventListener('change', sync);
    return () => {
      pointer.removeEventListener('change', sync);
      motion.removeEventListener('change', sync);
    };
  }, []);

  useLookAtPointer(targets, live);

  return (
    <Section id="about" ref={sectionRef}>
      <CharacterStage ref={stageRef} aria-hidden>
        <Character
          clothes={look.clothes}
          glasses={look.glasses}
          cap={look.cap}
          width={CHARACTER}
          priority
          motion={live}
        />
      </CharacterStage>
      <Container>
        <Title ref={titleRef}>{t('title')}</Title>
        <Footer>
          <Label>{t('basedIn')}</Label>
          <Button $variant="tertiary" onClick={() => setLook(randomCharacter(look))}>
            {t('generate')}
          </Button>
          <Label>{t('workingGlobally')}</Label>
        </Footer>
      </Container>
    </Section>
  );
}
