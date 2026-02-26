'use client';

import styled from 'styled-components';
import { Container, Text } from '@/components/primitives';
import { SectionHeading, CompanyLogoMarquee } from '@/components/composites';
import { spacing } from '@/styles/tokens/spacing';

const Section = styled.section`
  padding: ${spacing[1000]}px 0;
`;

const MarqueeWrapper = styled.div`
  margin-top: ${spacing[800]}px;
`;

const Blurb = styled(Text).attrs({
  as: 'p',
  $scale: 'body',
  $size: 'l',
  $color: 'var(--color-text-secondary)',
  $align: 'center',
})`
  max-width: 600px;
  margin: ${spacing[400]}px auto 0;
`;

const LOGOS = [
  { src: '/logos/fortinet.svg', alt: 'Fortinet' },
  { src: '/logos/brainstorm.svg', alt: 'Brainstorm' },
  { src: '/logos/picsart.svg', alt: 'Picsart' },
  { src: '/logos/world.svg', alt: 'World' },
  { src: '/logos/smartbet.svg', alt: 'Smartbet' },
  { src: '/logos/gemmed.svg', alt: 'Gemmed' },
  { src: '/logos/soulone.svg', alt: 'SoulOne' },
  { src: '/logos/softconstruct.svg', alt: 'SoftConstruct' },
  { src: '/logos/8890.svg', alt: '8890' },
  { src: '/logos/bro.svg', alt: 'BRO' },
  { src: '/logos/ginosi.svg', alt: 'Ginosi' },
  { src: '/logos/sciinci.svg', alt: 'Sciinci' },
];

export function TrustedBySection() {
  return (
    <Section id="trusted-by">
      <Container>
        <SectionHeading title="Trusted by Teams" />
        <Blurb>
          I&apos;ve worked with companies from early-stage startups to enterprise — always shipping real products.
        </Blurb>
        <MarqueeWrapper>
          <CompanyLogoMarquee logos={LOGOS} speed={45} />
        </MarqueeWrapper>
      </Container>
    </Section>
  );
}
