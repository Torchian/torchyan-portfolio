'use client';

import styled from 'styled-components';
import Link from 'next/link';
import { Container } from '@/components/primitives';
import { SectionHeading } from '@/components/composites';
import { Button } from '@/components/primitives';
import { spacing } from '@/styles/tokens/spacing';
import { fontSize, lineHeight, fontWeight, letterSpacing, fontFamily } from '@/styles/tokens/typography';
import { fluidFontSize, fluidLineHeight } from '@/styles/fluid';
import { neutrals, accents, transparents } from '@/styles/tokens/colors';
import { radius } from '@/styles/tokens/radius';
import { grid } from '@/styles/tokens/grid';
import { media } from '@/styles/media';

/* Capabilities - main section */
const Section = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${spacing[1000]}px 0 0;
  gap: ${spacing[1000]}px;
  isolation: isolate;
  position: relative;
`;

const HeadingContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${spacing[0]}px ${spacing[400]}px;
  max-width: ${grid.maxWidth}px;

  ${media.down('m')} {
    padding: ${spacing[0]}px ${spacing[300]}px;
  }
`;

const ContentContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${spacing[300]}px ${spacing[400]}px;
  gap: ${spacing[1000]}px;
  max-width: ${grid.maxWidth}px;
  position: relative;

  ${media.down('m')} {
    padding: ${spacing[300]}px ${spacing[300]}px;
  }
`;

/* 2x2 grid - equal height cards */
const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: ${spacing[400]}px;
  width: 100%;
  max-width: ${grid.maxWidth}px;

  ${media.down('m')} {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
    gap: ${spacing[300]}px;
  }
`;

/* Capability Card - Figma specs */
const CapabilityCard = styled.article`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: ${spacing[400]}px;
  gap: ${spacing[400]}px;
  isolation: isolate;
  position: relative;
  background: ${transparents.transparent4};
  border-radius: ${radius.xl}px;
  min-height: 402px;

  ${media.down('m')} {
    padding: ${spacing[300]}px;
    gap: ${spacing[300]}px;
    min-height: 0;
  }
`;

const CapabilityCardBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0;
  gap: ${spacing[300]}px;
  flex: 1;
  z-index: 1;
  position: relative;
`;

const CapabilityTitle = styled.h3`
  font-family: ${fontFamily.display};
  font-weight: ${fontWeight.semibold};
  font-size: ${fluidFontSize.heading.l};
  line-height: ${fluidLineHeight.heading.l};
  color: ${accents.primary};
  margin: 0;
`;

const CapabilityText = styled.p<{ $size?: 'large' | 'small' }>`
  font-family: ${fontFamily.display};
  font-weight: ${fontWeight.semibold};
  font-size: ${(p) =>
    p.$size === 'small' ? `${fontSize.body.xl}px` : fluidFontSize.heading.s};
  line-height: ${(p) =>
    p.$size === 'small' ? `${lineHeight.body.xl}px` : fluidLineHeight.heading.s};
  letter-spacing: ${(p) => (p.$size === 'small' ? letterSpacing.s : 0)}px;
  text-align: left;
  color: ${neutrals[100]};
  margin: 0;
`;

const CapabilityTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-start;
  padding: ${spacing[300]}px 0 0;
  flex: 1;
`;

/* CTA Secondary */
const CTAWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

const LinesGroup = styled.div`
  position: relative;
  width: 100%;
  max-width: 1640px;
  height: 40px;
  z-index: 2;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[300]}px;
`;

const LineImage = styled.img<{ $width: string }>`
  width: ${(p) => p.$width};
  height: auto;
  object-fit: contain;
  mix-blend-mode: overlay;
  filter: brightness(0.6);
  opacity: 0.5;
`;

const CAPABILITIES = [
  {
    title: 'Product UI Architecture',
    mainText:
      'Designing the structural foundation of a product - how screens, components, and interactions relate and scale.',
    secondaryText: 'A UI that feels intentional, consistent, and future-proof.',
  },
  {
    title: 'Experimental & Systems Work',
    mainText:
      'Exploring new interaction models, logic systems, and ideas beyond standard UI patterns.',
    secondaryText: 'I design interface structures that scale - from navigation logic to component ecosystems.',
  },
  {
    title: 'Frontend Engineering',
    mainText:
      'Turning design intent into production-ready interfaces that are accessible, performant, and maintainable.',
    secondaryText: 'Interfaces that look right, feel right, and hold up in production.',
  },
  {
    title: 'Motion & Interaction',
    mainText: (
      <>
        • Better user orientation
        <br />
        • Clear feedback and transitions
        <br />
        • More intuitive interactions
        <br />
        • Motion that supports, not distracts
      </>
    ),
    secondaryText:
      'Using motion and interaction to guide attention, communicate state, and improve usability.',
  },
];

export function CapabilitiesSection() {
  return (
    <Section id="capabilities">
      <HeadingContainer $padding={false}>
        <SectionHeading
          title="Capabilities"
          subtitle="I design, engineer, and ship digital products where structure, performance, and clarity matter."
        />
      </HeadingContainer>

      <ContentContainer $padding={false}>
        <CardsGrid>
          {CAPABILITIES.map((cap) => (
            <CapabilityCard key={cap.title}>
              <CapabilityCardBody>
                <CapabilityTitle>{cap.title}</CapabilityTitle>
                <CapabilityText>{cap.mainText}</CapabilityText>
                <CapabilityTextContainer>
                  <CapabilityText $size="small">{cap.secondaryText}</CapabilityText>
                </CapabilityTextContainer>
              </CapabilityCardBody>
            </CapabilityCard>
          ))}
        </CardsGrid>

        <CTAWrapper>
          <Button as={Link} href="#contact" $variant="tertiary">
            Contact Me
          </Button>
        </CTAWrapper>

        <LinesGroup>
          <LineImage src="/vectors/Line%2015.svg" alt="" $width="100%" />
          <LineImage src="/vectors/Line%2015.svg" alt="" $width="83%" />
        </LinesGroup>
      </ContentContainer>
    </Section>
  );
}
