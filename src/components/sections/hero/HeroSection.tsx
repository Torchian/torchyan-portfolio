'use client';

import styled, { css, keyframes } from 'styled-components';
import { Button } from '@/components/primitives';
import { spacing } from '@/styles/tokens/spacing';
import {
  fontFamily,
  fontWeight,
  fontSize,
  lineHeight,
  letterSpacing,
} from '@/styles/tokens/typography';
import { fluidFontSize, fluidLineHeight } from '@/styles/fluid';
import { accents, neutrals } from '@/styles/tokens/colors';
import { zIndex } from '@/styles/tokens/z-index';
import { media } from '@/styles/media';
import { useContentReveal } from '@/contexts/ContentRevealContext';

const SKILLS = [
  'Product Design',
  'Design Engineering',
  'UI Architecture',
  'Design Systems',
  'Experiments',
];

const heroFadeUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const heroFadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const HERO_ANIM_MS = '550ms';
const FOOTER_ANIM_MS = '500ms';
const HERO_EASE = 'cubic-bezier(0.25, 0.1, 0.25, 1)';

const heroEntrance = (delay: string) => css`
  animation: ${heroFadeUp} ${HERO_ANIM_MS} ${HERO_EASE} ${delay} both;

  ${media.reducedMotion} {
    animation: none;
    opacity: 1;
    transform: none;
  }
`;

const footerEntrance = css`
  animation: ${heroFadeIn} ${FOOTER_ANIM_MS} ${HERO_EASE} 0.32s both;

  ${media.reducedMotion} {
    animation: none;
    opacity: 1;
  }
`;

const Eyebrow = styled.p`
  font-family: ${fontFamily.display};
  font-weight: ${fontWeight.heading};
  font-size: ${fluidFontSize.display.m};
  line-height: ${fluidLineHeight.display.m};
  text-align: center;
  color: ${accents.primary};
  margin: 0;

  ${media.down('s')} {
    font-size: ${fluidFontSize.heading.l};
    line-height: ${fluidLineHeight.heading.l};
  }
`;

const Headline = styled.h1`
  font-family: ${fontFamily.display};
  font-weight: ${fontWeight.black};
  font-size: ${fluidFontSize.display.xl};
  line-height: ${fluidLineHeight.display.xl};
  text-align: center;
  letter-spacing: ${letterSpacing.xxs}px;
  text-transform: uppercase;
  color: ${neutrals[500]};
  margin: 0;

  ${media.down('l')} {
    font-size: ${fluidFontSize.display.l};
    line-height: ${fluidLineHeight.display.l};
  }

  ${media.down('s')} {
    font-size: ${fluidFontSize.heading.l};
    line-height: ${fluidLineHeight.heading.l};
  }
`;

const Description = styled.p`
  font-family: ${fontFamily.body};
  font-weight: ${fontWeight.semibold};
  font-size: ${fluidFontSize.heading.s};
  line-height: ${fluidLineHeight.heading.s};
  text-align: center;
  color: ${neutrals[500]};
  margin: 0;
  max-width: 624px;

  ${media.down('s')} {
    font-size: ${fontSize.body.xl}px;
    line-height: ${lineHeight.body.xl}px;
    max-width: 100%;
  }
`;

const ButtonWrap = styled.div``;

const HeroFooter = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: ${spacing[300]}px;
  width: 100%;
  flex-wrap: wrap;
  z-index: ${zIndex.base};

  ${media.down('s')} {
    gap: ${spacing[200]}px ${spacing[150]}px;
  }
`;

const FooterItem = styled.span`
  font-family: ${fontFamily.body};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.body.l}px;
  line-height: ${lineHeight.body.l}px;
  letter-spacing: ${letterSpacing.m}px;
  color: ${neutrals[500]};
  white-space: nowrap;

  ${media.down('s')} {
    font-size: ${fontSize.body.m}px;
    line-height: ${lineHeight.body.m}px;
  }
`;

const Separator = styled(FooterItem)``;

const HeroBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${spacing[500]}px 0;
  gap: ${spacing[2000]}px;
  width: 100%;
  z-index: ${zIndex.base};

  ${media.down('s')} {
    gap: ${spacing[1000]}px;
    padding: ${spacing[300]}px 0;
  }
`;

const HeroHeading = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[1000]}px;
  width: 100%;

  ${media.down('s')} {
    gap: ${spacing[600]}px;
  }
`;

const Section = styled.section<{ $revealed: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: calc(${spacing[1000]}px + ${spacing[1000]}px) ${spacing[400]}px ${spacing[400]}px;
  max-width: 1440px;
  min-height: 100svh;
  margin: 0 auto;
  overflow: hidden;

  ${media.down('s')} {
    padding: calc(${spacing[1000]}px + ${spacing[1000]}px) ${spacing[300]}px ${spacing[300]}px;
  }

  ${(p) =>
    p.$revealed &&
    css`
      ${Eyebrow} {
        ${heroEntrance('0s')}
      }
      ${Headline} {
        ${heroEntrance('0.08s')}
      }
      ${Description} {
        ${heroEntrance('0.16s')}
      }
      ${ButtonWrap} {
        ${heroEntrance('0.24s')}
      }
      ${HeroFooter} {
        ${footerEntrance}
      }
    `}
`;

export function HeroSection() {
  const { contentRevealed } = useContentReveal();

  return (
    <Section $revealed={contentRevealed}>
      <HeroBody>
        <HeroHeading>
          <Eyebrow>Design Engineer</Eyebrow>
          <Headline>Stepan Torchyan</Headline>
          <Description>
            I work between design and engineering, connecting product thinking,
            UI architecture, and front-end execution into one coherent process.
          </Description>
        </HeroHeading>

        <ButtonWrap>
          <Button as="a" href="#contact" $variant="primary">
            Contact
          </Button>
        </ButtonWrap>
      </HeroBody>

      <HeroFooter>
        {SKILLS.map((skill, i) => (
          <span key={skill} style={{ display: 'contents' }}>
            <FooterItem>{skill}</FooterItem>
            {i < SKILLS.length - 1 && <Separator aria-hidden>×</Separator>}
          </span>
        ))}
      </HeroFooter>
    </Section>
  );
}
