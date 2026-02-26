'use client';

import styled from 'styled-components';
import Image from 'next/image';
import { Container } from '@/components/primitives';
import { SectionHeading } from '@/components/composites';
import { spacing } from '@/styles/tokens/spacing';
import { radius } from '@/styles/tokens/radius';
import { border } from '@/styles/tokens/border';
import { duration, easing } from '@/styles/tokens/motion';
import { media } from '@/styles/media';

const Section = styled.section`
  padding: ${spacing[1000]}px 0;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${spacing[200]}px;
  margin-top: ${spacing[800]}px;

  ${media.down('l')} {
    grid-template-columns: repeat(3, 1fr);
  }

  ${media.down('m')} {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const Thumbnail = styled.div`
  position: relative;
  aspect-ratio: 4 / 3;
  border-radius: ${radius.l}px;
  overflow: hidden;
  background: var(--color-bg-secondary);
  border: ${border.medium}px solid var(--color-border-primary);
  cursor: pointer;
  transition: transform ${duration.normal} ${easing.out}, border-color ${duration.normal} ${easing.out};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      transform: scale(1.02);
      border-color: var(--color-border-secondary);
    }
  }
`;

const Placeholder = styled.div`
  width: 100%;
  height: 100%;
  background: var(--color-bg-secondary);
`;

interface BuildItem {
  src?: string;
  alt: string;
}

const ITEMS: BuildItem[] = Array.from({ length: 8 }, (_, i) => ({
  alt: `Project screenshot ${i + 1}`,
}));

export function WhatIBuildSection() {
  return (
    <Section id="what-i-build">
      <Container>
        <SectionHeading title="What I Build" />
        <Grid>
          {ITEMS.map((item, i) => (
            <Thumbnail key={i}>
              {item.src ? (
                <Image src={item.src} alt={item.alt} fill sizes="(max-width: 768px) 50vw, 25vw" />
              ) : (
                <Placeholder />
              )}
            </Thumbnail>
          ))}
        </Grid>
      </Container>
    </Section>
  );
}
