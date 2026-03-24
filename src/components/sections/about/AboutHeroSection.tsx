'use client';

import styled from 'styled-components';
import Image from 'next/image';
import Link from 'next/link';
import { Display, Reveal, Text, Button } from '@/components/primitives';
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
import { radius } from '@/styles/tokens/radius';
import { grid } from '@/styles/tokens/grid';
import { media } from '@/styles/media';
import { SectionContainer } from '@/components/layouts';
import { zIndex } from '@/styles/tokens/z-index';

const Section = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[1000]}px;
`;

const HeroSectionContainer = styled(SectionContainer)`
  position: relative;
  flex: 1;
  min-height: 100vh;
  padding-top: calc(${spacing[1000]}px + ${spacing[1000]}px);

  ${media.down('m')} {
    padding-top: calc(${spacing[800]}px + ${spacing[1000]}px);
  }
` as typeof SectionContainer;

/* hero_title: typography/display/large, dark/background/primary */
const HeroTitle = styled(Display)`
  font-family: ${fontFamily.display};
  font-weight: ${fontWeight.black};
  font-size: ${fluidFontSize.display.xl};
  line-height: ${fluidLineHeight.display.xl};
  text-align: center;
  letter-spacing: ${letterSpacing.xxs}px;
  text-transform: uppercase;
  color: ${accents.primary};
  border-radius: ${radius.xl}px;

  ${media.down('l')} {
    font-size: ${fluidFontSize.display.m};
    line-height: ${fluidLineHeight.display.m};
  }

  ${media.down('m')} {
    font-size: ${fluidFontSize.display.s};
    line-height: ${fluidLineHeight.display.s};
  }
`;

const HeroImageWrapper = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: -${spacing[1000]}px;
  width: 100%;
  max-width: 840px;
  aspect-ratio: 1;
  pointer-events: none;
  z-index: ${zIndex.base};

  ${media.down('m')} {
    max-width: 320px;
  }
`;

/* Top layer: sharp image at top, fades to bottom (inverse linear mask) */
const HeroImageSharp = styled.div`
  position: absolute;
  inset: 0;
  mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
  mask-size: cover;
  mask-position: center;
  -webkit-mask-size: cover;
  -webkit-mask-position: center;
`;

const BottomRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  z-index: ${zIndex.overlay};

  ${media.down('m')} {
    flex-direction: column;
    gap: ${spacing[400]}px;
  }
`;

const Label = styled(Text)`
  font-family: ${fontFamily.display};
  font-weight: ${fontWeight.regular};
  font-size: ${fontSize.body.m}px;
  line-height: ${lineHeight.body.m}px;
  color: ${neutrals[500]};
`;

/* Container */
const PositioningContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 ${spacing[400]}px;
  gap: ${spacing[2000]}px;
  width: 100%;
  max-width: ${grid.maxWidth}px;
  flex: none;
`;

/* positioning_text */
const PositioningText = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
  gap: ${spacing[300]}px;
  width: 100%;
  max-width: 1024px;
`;

/* Short Description — typography/headline/large, dark/text/secondary */
const ShortDescription = styled(Text)`
  font-family: ${fontFamily.heading};
  font-style: normal;
  font-weight: ${fontWeight.semibold};
  font-size: ${fluidFontSize.heading.l};
  line-height: ${fluidLineHeight.heading.l};
  text-align: center;
  color: ${neutrals[500]};
  margin: 0;
  width: 100%;
  align-self: stretch;
`;

const NameHighlight = styled.span`
  color: ${accents.secondary};
`;

/* positioning_cards */
const PositioningCards = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 0;
  gap: ${spacing[400]}px;
  width: 100%;
  flex: none;
  align-self: stretch;
  flex-wrap: wrap;
  justify-content: center;

  ${media.down('m')} {
    flex-direction: column;
    align-items: center;
  }
`;

/* Positioning Card */
const Card = styled.article`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
  gap: ${spacing[300]}px;
  flex: 1;
  min-width: 200px;
  max-width: 280px;

  ${media.down('m')} {
    max-width: 100%;
  }
`;

/* Capricorn Puzzle Mobile */
const CardImage = styled.div`
  width: 150px;
  height: 160px;
  flex: none;
  flex-grow: 0;
  background: ${neutrals[800]};
  border-radius: ${radius.l}px;
`;

/* positioning_card_title — typography/headline/medium */
const CardTitle = styled(Text)`
  font-family: ${fontFamily.heading};
  font-style: normal;
  font-weight: ${fontWeight.medium};
  font-size: ${fluidFontSize.heading.m};
  line-height: ${fluidLineHeight.heading.m};
  text-align: center;
  color: ${neutrals[500]};
  margin: 0;
  width: 100%;
  align-self: stretch;
  flex: none;
`;

const POSITIONING_CARDS = [
  'UI architecture & design systems',
  'Product interface design',
  'Frontend implementation',
  'Accessibility & performance',
  'Long-term scalability',
] as const;

export function AboutHeroSection() {
  return (
    <Section id="about">
      <HeroSectionContainer>
        <Reveal>
          <>
            <HeroTitle as="h1">
              I design systems that live longer than trends
            </HeroTitle>
            <BottomRow>
              <Label>Based in Armenia</Label>
              <Button as={Link} href="/#work" $variant="secondary">
                View selected work
              </Button>
              <Label>Working globally</Label>
            </BottomRow>
          </>
        </Reveal>
        <HeroImageWrapper>
          <HeroImageSharp>
            <Image
              src="/hero/character_color.png"
              alt=""
              fill
              priority
              sizes="(max-width: 768px) 320px, 720px"
              style={{ objectFit: 'contain' }}
            />
          </HeroImageSharp>
        </HeroImageWrapper>
      </HeroSectionContainer>
      <PositioningContainer>
        <Reveal delay={0.1}>
          <PositioningText>
            <ShortDescription as="p">
              I&apos;m <NameHighlight>Stepan Torchyan</NameHighlight> — a Design
              Engineer working between UI architecture, product design, and frontend
              engineering. Since 2016, I&apos;ve helped teams turn complex ideas
              into scalable, accessible interfaces. Most teams separate design and
              implementation. I build the bridge.
            </ShortDescription>
            <ShortDescription as="p">
              From defining interaction logic and component structure to shipping
              accessible, multilingual, production-grade UI — I ensure ideas
              don&apos;t degrade during execution.
            </ShortDescription>
            <ShortDescription as="p">
              Because good design is fragile. Systems make it resilient.
            </ShortDescription>
          </PositioningText>
        </Reveal>
        <Reveal delay={0.15}>
          <PositioningCards>
            {POSITIONING_CARDS.map((title) => (
              <Card key={title}>
                <CardImage aria-hidden />
                <CardTitle as="p">{title}</CardTitle>
              </Card>
            ))}
          </PositioningCards>
        </Reveal>
      </PositioningContainer>
    </Section>
  );
}
