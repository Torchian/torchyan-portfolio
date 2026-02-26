'use client';

import styled from 'styled-components';
import { Container, Display, Text } from '@/components/primitives';
import { HeroTagline } from '@/components/composites';
import { spacing } from '@/styles/tokens/spacing';
import { fontSize, lineHeight, letterSpacing } from '@/styles/tokens/typography';
import { radius } from '@/styles/tokens/radius';
import { border } from '@/styles/tokens/border';
import { media } from '@/styles/media';

const Section = styled.section`
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  overflow: hidden;
  padding: ${spacing[2000]}px 0 ${spacing[1000]}px;

  ${media.down('l')} {
    padding: ${spacing[1000]}px 0 ${spacing[800]}px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${spacing[800]}px;
  align-items: center;

  ${media.down('l')} {
    grid-template-columns: 1fr;
    gap: ${spacing[600]}px;
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[400]}px;
`;

const Name = styled(Display)`
  text-transform: uppercase;
  letter-spacing: ${letterSpacing.xxs}px;

  ${media.down('m')} {
    font-size: ${fontSize.display.s}px;
    line-height: ${lineHeight.display.s}px;
  }
`;

const Subtitle = styled(Text).attrs({
  as: 'p',
  $scale: 'body',
  $size: 'xl',
  $color: 'var(--color-text-secondary)',
})`
  max-width: 480px;
`;

const ImageColumn = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  ${media.down('l')} {
    max-height: 400px;
  }
`;

const ImagePlaceholder = styled.div`
  width: 100%;
  max-width: 560px;
  aspect-ratio: 1 / 1.2;
  background: var(--color-bg-secondary);
  border-radius: ${radius.l}px;
  border: ${border.medium}px solid var(--color-border-primary);
`;

const TICKER_TEXTS = [
  'Systems, Interfaces, and real-world products',
  'Design Engineering',
  'Accessible & Performant',
  'Systems, Interfaces, and real-world products',
];

export function HeroSection() {
  return (
    <Section>
      <Container>
        <Grid>
          <Content>
            <HeroTagline
              tagline="Design Engineer"
              tickerTexts={TICKER_TEXTS}
            />
            <Name $size="xl">
              Stepan
              <br />
              Torchyan
            </Name>
            <Subtitle>
              I design &amp; build systems, interfaces, and real-world products — shipped, tested, and refined.
            </Subtitle>
          </Content>
          <ImageColumn>
            <ImagePlaceholder />
          </ImageColumn>
        </Grid>
      </Container>
    </Section>
  );
}
