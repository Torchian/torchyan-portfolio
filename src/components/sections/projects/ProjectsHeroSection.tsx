'use client';

import styled from 'styled-components';
import { Container, Reveal, Text } from '@/components/primitives';
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
import { media } from '@/styles/media';

const Section = styled.section`
  padding-top: calc(${spacing[1000]}px + ${spacing[1000]}px);
`;

const HeroContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[800]}px;
`;

const Title = styled.h1`
  margin: 0;
  font-family: ${fontFamily.display};
  font-weight: ${fontWeight.black};
  font-size: ${fluidFontSize.display.xl};
  line-height: ${fluidLineHeight.display.xl};
  letter-spacing: ${letterSpacing.xxs}px;
  text-transform: uppercase;
  text-align: center;
  color: ${accents.secondary};

  ${media.down('l')} {
    font-size: ${fluidFontSize.display.m};
    line-height: ${fluidLineHeight.display.m};
  }
`;

const Description = styled(Text)`
  margin: 0;
  max-width: 820px;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fluidFontSize.heading.s};
  line-height: ${fluidLineHeight.heading.s};
  text-align: center;
  color: ${neutrals[500]};
`;

const Footer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: ${spacing[300]}px;
`;

const FooterItem = styled(Text)`
  margin: 0;
  font-family: ${fontFamily.body};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.body.l}px;
  line-height: ${lineHeight.body.l}px;
  letter-spacing: ${letterSpacing.m}px;
  color: ${neutrals[500]};
`;

const HERO_ITEMS = [
  'Deconstructing ambiguity into structure',
  'Translating business goals into user flows',
  'Architecting component ecosystems',
  'Aligning visual language with engineering reality',
  'Optimizing for accessibility, performance, and long-term maintainability',
] as const;

export function ProjectsHeroSection() {
  return (
    <Section>
      <HeroContainer>
        <Reveal>
          <>
            <Title>Projects As Structured Systems</Title>
            <Description as="p">
              I don&apos;t treat projects as isolated deliverables. Each one is a layered
              product architecture—where research, interaction logic, visual systems, and
              engineering constraints are resolved into a scalable interface.
            </Description>
          </>
        </Reveal>
        <Reveal delay={0.1}>
          <Footer>
            {HERO_ITEMS.map((item, index) => (
              <span key={item} style={{ display: 'contents' }}>
                <FooterItem as="span">{item}</FooterItem>
                {index < HERO_ITEMS.length - 1 && <FooterItem as="span">×</FooterItem>}
              </span>
            ))}
          </Footer>
        </Reveal>
      </HeroContainer>
    </Section>
  );
}
