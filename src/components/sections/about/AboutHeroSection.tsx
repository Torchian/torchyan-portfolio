'use client';

import styled from 'styled-components';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { Display, Text, Button } from '@/components/primitives';
import { spacing } from '@/styles/tokens/spacing';
import {
  fontFamily,
  fontWeight,
  fontSize,
  lineHeight,
  letterSpacing,
} from '@/styles/tokens/typography';
import { accents, neutrals } from '@/styles/tokens/colors';
import { radius } from '@/styles/tokens/radius';
import { grid } from '@/styles/tokens/grid';
import { media } from '@/styles/media';
import { SectionContainer } from '@/components/layouts';
import { zIndex } from '@/styles/tokens/z-index';
import { useTranslations } from 'next-intl';

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
` as typeof SectionContainer;

/* hero_title: typography/display/large, dark/background/primary */
const HeroTitle = styled(Display)`
  font-family: ${fontFamily.display};
  font-weight: ${fontWeight.black};
  font-size: ${fontSize.display.xl}px;
  line-height: ${lineHeight.display.xl}px;
  text-align: center;
  letter-spacing: ${letterSpacing.xxs}px;
  text-transform: uppercase;
  color: ${accents.primary};
  border-radius: ${radius.xl}px;

  ${media.down('l')} {
    font-size: ${fontSize.display.m}px;
    line-height: ${lineHeight.display.m}px;
  }

  ${media.down('m')} {
    font-size: ${fontSize.display.s}px;
    line-height: ${lineHeight.display.s}px;
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
  font-size: ${fontSize.heading.l}px;
  line-height: ${lineHeight.heading.l}px;
  text-align: center;
  color: ${neutrals[500]};
  margin: 0;
  width: 100%;
  align-self: stretch;

  /* Russian and Armenian words don't fit the 320 frame at 36px. */
  ${media.down('s')} {
    :lang(ru) & {
      font-size: ${fontSize.heading.m}px;
      line-height: ${lineHeight.heading.m}px;
    }

    :lang(hy) & {
      font-size: ${fontSize.heading.s}px;
      line-height: ${lineHeight.heading.s}px;
    }
  }
`;

const NameHighlight = styled.span`
  color: ${accents.secondary};
`;

/* positioning_cards */
const PositioningCards = styled.ul`
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
const Card = styled.li`
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
  font-size: ${fontSize.heading.m}px;
  line-height: ${lineHeight.heading.m}px;
  text-align: center;
  color: ${neutrals[500]};
  margin: 0;
  width: 100%;
  align-self: stretch;
  flex: none;
`;

export function AboutHeroSection() {
  const t = useTranslations('about.hero');
  const cards = t.raw('cards') as string[];

  return (
    <Section id="about">
      <HeroSectionContainer>
        <HeroTitle as="h1">{t('title')}</HeroTitle>
        <BottomRow>
          <Label>{t('basedIn')}</Label>
          <Button as={Link} href="/#work" $variant="secondary">
            {t('cta')}
          </Button>
          <Label>{t('workingGlobally')}</Label>
        </BottomRow>
        <HeroImageWrapper>
          <HeroImageSharp>
            <Image
              src="/hero/character_color.png"
              alt=""
              fill
              sizes="(max-width: 480px) 320px, 720px"
              style={{ objectFit: 'contain' }}
            />
          </HeroImageSharp>
        </HeroImageWrapper>
      </HeroSectionContainer>
      <PositioningContainer>
        <PositioningText>
          <ShortDescription as="p">
            {t.rich('intro', { name: (chunks) => <NameHighlight>{chunks}</NameHighlight> })}
          </ShortDescription>
          <ShortDescription as="p">{t('execution')}</ShortDescription>
          <ShortDescription as="p">{t('resilience')}</ShortDescription>
        </PositioningText>
        <PositioningCards>
          {cards.map((title) => (
            <Card key={title}>
              <CardImage aria-hidden />
              <CardTitle as="p">{title}</CardTitle>
            </Card>
          ))}
        </PositioningCards>
      </PositioningContainer>
    </Section>
  );
}
