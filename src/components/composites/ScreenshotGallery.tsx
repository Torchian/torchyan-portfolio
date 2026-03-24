'use client';

import styled from 'styled-components';
import Image from 'next/image';
import { radius } from '@/styles/tokens/radius';
import { spacing } from '@/styles/tokens/spacing';
import { border } from '@/styles/tokens/border';
import { glass } from '@/styles/tokens/colors';
import { media } from '@/styles/media';

const Wrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  border-radius: ${radius.l}px;
`;

const Grid = styled.div`
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${spacing[200]}px;
  transform: rotate(-12deg) scale(1.3);
  transform-origin: center center;

  ${media.down('m')} {
    grid-template-columns: repeat(2, 1fr);
    transform: rotate(-12deg) scale(1.4);
  }
`;

const Screenshot = styled.div`
  border-radius: ${radius.m}px;
  overflow: hidden;
  box-shadow: 0 ${spacing[50]}px ${spacing[300]}px ${glass.shadow};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Placeholder = styled.div`
  width: 100%;
  aspect-ratio: 4 / 3;
  background: var(--color-bg-secondary);
  border-radius: ${radius.m}px;
  border: ${border.medium}px solid var(--color-border-primary);
`;

export interface ScreenshotGalleryProps {
  images: { src: string; alt: string }[];
}

export function ScreenshotGallery({ images }: ScreenshotGalleryProps) {
  const items = images.length > 0 ? images : Array.from({ length: 6 }, (_, i) => ({ src: '', alt: `Placeholder ${i + 1}` }));

  return (
    <Wrapper>
      <Grid>
        {items.map((img, i) =>
          img.src ? (
            <Screenshot key={i}>
              <Image src={img.src} alt={img.alt} width={400} height={300} sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" />
            </Screenshot>
          ) : (
            <Placeholder key={i} />
          ),
        )}
      </Grid>
    </Wrapper>
  );
}
