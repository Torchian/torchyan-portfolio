'use client';

import styled from 'styled-components';
import { Container } from '@/components/primitives';
import { spacing } from '@/styles/tokens/spacing';
import { radius } from '@/styles/tokens/radius';
import { border } from '@/styles/tokens/border';
import { media } from '@/styles/media';
import { SectionHeading } from '@/components/composites';
import { WhatidoStep } from './WhatidoStep';

const STEPS = [
  {
    title: 'Frame the problem',
    description:
      'Start by understanding the real problem — not just the request, but the context, goals, and constraints behind it.',
  },
  {
    title: 'Architect the system',
    description:
      'Design the structural foundation of the product so it can grow without losing clarity or consistency.',
  },
  {
    title: 'Design with intent',
    description:
      'Turn structure into clear, precise interfaces where every decision serves usability and meaning.',
  },
  {
    title: 'Build with precision',
    description:
      'Translate designs into production-grade code where craft, performance, and accessibility are non-negotiable.',
  },
  {
    title: 'Ship & iterate',
    description:
      'Deliver with confidence, measure impact, and refine based on real feedback — not assumptions.',
  },
] as const;

const Section = styled.section`
  position: relative;
  overflow: hidden;
  padding: ${spacing[1000]}px 0;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: ${spacing[800]}px;
  margin-top: ${spacing[800]}px;

  ${media.down('l')} {
    grid-template-columns: 1fr;
  }
`;

const StepsColumn = styled.div`
  padding-left: ${spacing[800]}px;

  ${media.down('l')} {
    padding-left: 0;
  }
`;

const StickyColumn = styled.div`
  position: relative;

  ${media.down('l')} {
    display: none;
  }
`;

const StickyImageWrapper = styled.div`
  position: sticky;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  aspect-ratio: 640 / 929;
  border-radius: ${radius.l}px;
  overflow: hidden;
`;

const ImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background: var(--color-bg-secondary);
  border: ${border.medium}px solid var(--color-border-primary);
  border-radius: ${radius.l}px;
`;

export function WhatIDoSection() {
  return (
    <Section id="about">
      <Container>
        <SectionHeading
          title="What I Do"
          subtitle="Design decisions that survive production"
        />
        <ContentGrid>
          <StepsColumn>
            {STEPS.map((step, i) => (
              <WhatidoStep
                key={step.title}
                index={i + 1}
                title={step.title}
                description={step.description}
              />
            ))}
          </StepsColumn>
          <StickyColumn>
            <StickyImageWrapper>
              <ImagePlaceholder />
            </StickyImageWrapper>
          </StickyColumn>
        </ContentGrid>
      </Container>
    </Section>
  );
}
