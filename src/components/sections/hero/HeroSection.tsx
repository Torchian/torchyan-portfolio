'use client';

import styled from 'styled-components';
import { Button } from '@/components/primitives';
import { spacing } from '@/styles/tokens/spacing';
import {
  fontFamily,
  fontWeight,
  fontSize,
  lineHeight,
  letterSpacing,
} from '@/styles/tokens/typography';
import { accents, neutrals } from '@/styles/tokens/colors';
import { zIndex } from '@/styles/tokens/z-index';
import { media } from '@/styles/media';

const SKILLS = [
  'Product Design',
  'Design Engineering',
  'UI Architecture',
  'Design Systems',
  'Experiments',
];

const Section = styled.section`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: ${spacing[1000]}px ${spacing[400]}px ${spacing[400]}px;
  max-width: 1440px;
  min-height: 100vh;
  margin: 0 auto;
  overflow: hidden;

  ${media.down('m')} {
    padding: ${spacing[1000]}px ${spacing[200]}px ${spacing[300]}px;
  }
`;

const HeroBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${spacing[500]}px 0;
  gap: ${spacing[2000]}px;
  width: 100%;
  z-index: ${zIndex.base};

  ${media.down('m')} {
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

  ${media.down('m')} {
    gap: ${spacing[600]}px;
  }
`;

const Title = styled.h2`
  font-family: ${fontFamily.display};
  font-weight: ${fontWeight.heading};
  font-size: ${fontSize.display.m}px;
  line-height: ${lineHeight.display.m}px;
  text-align: center;
  color: ${accents.primary};
  margin: 0;

  ${media.down('m')} {
    font-size: ${fontSize.display.s}px;
    line-height: ${lineHeight.display.s}px;
  }

  ${media.down('s')} {
    font-size: ${fontSize.heading.l}px;
    line-height: ${lineHeight.heading.l}px;
  }
`;

const Subtitle = styled.h1`
  font-family: ${fontFamily.display};
  font-weight: ${fontWeight.black};
  font-size: ${fontSize.display.xl}px;
  line-height: ${lineHeight.display.xl}px;
  text-align: center;
  letter-spacing: ${letterSpacing.xxs}px;
  text-transform: uppercase;
  color: ${neutrals[500]};
  margin: 0;

  ${media.down('l')} {
    font-size: ${fontSize.display.l}px;
    line-height: ${lineHeight.display.l}px;
  }

  ${media.down('m')} {
    font-size: ${fontSize.display.s}px;
    line-height: ${lineHeight.display.s}px;
  }

  ${media.down('s')} {
    font-size: ${fontSize.heading.l}px;
    line-height: ${lineHeight.heading.l}px;
  }
`;

const Description = styled.p`
  font-family: ${fontFamily.body};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.heading.s}px;
  line-height: ${lineHeight.heading.s}px;
  text-align: center;
  color: ${neutrals[500]};
  margin: 0;
  max-width: 624px;

  ${media.down('m')} {
    font-size: ${fontSize.body.xl}px;
    line-height: ${lineHeight.body.xl}px;
    max-width: 100%;
  }
`;

const HeroFooter = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: ${spacing[300]}px;
  width: 100%;
  flex-wrap: wrap;
  z-index: ${zIndex.base};

  ${media.down('m')} {
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

  ${media.down('m')} {
    font-size: ${fontSize.body.m}px;
    line-height: ${lineHeight.body.m}px;
  }
`;

const Separator = styled(FooterItem)``;

export function HeroSection() {
  return (
    <Section>

      <HeroBody>
        <HeroHeading>
          <Title>Design Engineer</Title>
          <Subtitle>Stepan Torchyan</Subtitle>
          <Description>
            I work between design and engineering, connecting product thinking,
            UI architecture, and front-end execution into one coherent process.
          </Description>
        </HeroHeading>

        <Button as="a" href="#contact" $variant="primary">
          Contact
        </Button>
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
