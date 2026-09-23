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

/** The character's width at the widest, from Figma's 820 in a 1920 frame. */
const CHARACTER = 820;

const Section = styled.section`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100svh;
  padding: ${spacing[1000]}px 0 ${spacing[400]}px;
  overflow: hidden;
`;

const Container = styled.div`
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: ${grid.maxWidth}px;
  padding: ${spacing[1000]}px ${spacing[400]}px ${spacing[400]}px;

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
  font-size: ${fontSize.display.xl}px;
  line-height: ${lineHeight.display.xl}px;
  letter-spacing: ${letterSpacing.xxs}px;
  text-align: center;
  /* Only the 1920 frame shouts; the tablet and phone frames set it as typed. */
  text-transform: uppercase;
  color: ${accents.primary};

  ${media.down('xl')} {
    font-weight: ${fontWeight.heading};
    font-size: ${fontSize.display.m}px;
    line-height: ${lineHeight.display.m}px;
    letter-spacing: ${letterSpacing.xs}px;
    text-transform: none;
  }

  ${media.down('m')} {
    font-weight: ${fontWeight.semibold};
    font-size: ${fontSize.display.s}px;
    line-height: ${lineHeight.display.s}px;
  }
`;

/**
 * Centred, near the section's bottom edge, under the title and the row.
 * Figma's 1920 frame gives it 820 of the 1085-tall hero (76%), hanging 4% past
 * the bottom; the tablet and phone frames stand it on the bottom edge (77% and
 * 60% of their heights). It's sized from the section's height, and never wider
 * than the frame's share of the screen (43% at 1920, 80% on a tablet, 112% on a
 * phone).
 */
const CharacterStage = styled.div`
  position: absolute;
  left: 50%;
  bottom: -4%;
  height: min(76%, 43vw);
  aspect-ratio: 1;
  transform: translateX(-50%);
  pointer-events: none;
  z-index: ${zIndex.base};
  ${characterFade}

  ${media.down('xl')} {
    bottom: 0;
    height: min(77%, 80vw);
  }

  ${media.down('m')} {
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
  max-width: 1376px;
  margin-top: auto;

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
  const targets = useMemo(() => [stageRef], []);

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
    <Section id="about">
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
        <Title>{t('title')}</Title>
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
