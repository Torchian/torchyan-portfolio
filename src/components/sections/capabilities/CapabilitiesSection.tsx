'use client';

import styled from 'styled-components';
import { Container } from '@/components/primitives';
import { SectionHeading } from '@/components/composites';
import { CapabilityCard } from './CapabilityCard';
import { spacing } from '@/styles/tokens/spacing';
import { media } from '@/styles/media';

const Section = styled.section`
  padding: ${spacing[1000]}px 0;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${spacing[300]}px;
  margin-top: ${spacing[800]}px;

  ${media.down('l')} {
    grid-template-columns: repeat(2, 1fr);
  }

  ${media.down('m')} {
    grid-template-columns: 1fr;
  }
`;

const CAPABILITIES = [
  {
    title: 'Product Design',
    description: 'End-to-end interface design from research through high-fidelity prototypes and handoff.',
    $variant: 'dark' as const,
  },
  {
    title: 'Design Systems',
    description: 'Scalable component libraries, token architectures, and documentation that keep teams aligned.',
    $variant: 'accent' as const,
  },
  {
    title: 'Frontend Engineering',
    description: 'Production-grade React, Next.js, and TypeScript — accessible, performant, pixel-perfect.',
    $variant: 'dark' as const,
  },
  {
    title: 'Interaction Design',
    description: 'Micro-interactions, transitions, and motion systems that make interfaces feel alive.',
    $variant: 'dark' as const,
  },
  {
    title: 'Creative Direction',
    description: 'Visual identity, brand systems, and art direction for digital products and campaigns.',
    $variant: 'dark' as const,
  },
  {
    title: 'Consulting',
    description: 'Strategic design and engineering guidance for teams shipping real products.',
    $variant: 'accent' as const,
  },
];

export function CapabilitiesSection() {
  return (
    <Section id="capabilities">
      <Container>
        <SectionHeading title="Capabilities" />
        <Grid>
          {CAPABILITIES.map((cap) => (
            <CapabilityCard key={cap.title} {...cap} />
          ))}
        </Grid>
      </Container>
    </Section>
  );
}
