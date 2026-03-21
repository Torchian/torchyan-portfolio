'use client';

import styled from 'styled-components';
import Image from 'next/image';
import { Container } from '@/components/primitives';
import { spacing } from '@/styles/tokens/spacing';
import { fontSize, lineHeight, fontWeight, fontFamily } from '@/styles/tokens/typography';
import { neutrals } from '@/styles/tokens/colors';
import { radius } from '@/styles/tokens/radius';
import { grid } from '@/styles/tokens/grid';
import { media } from '@/styles/media';
import type { ProjectConfig } from '@/components/sections/selected-work/projectsConfig';

const Section = styled.section`
  padding: ${spacing[1000]}px 0;

  ${media.down('m')} {
    padding: ${spacing[600]}px 0;
  }
`;

const Content = styled(Container)`
  display: flex;
  flex-direction: column;
  gap: ${spacing[800]}px;
`;

const ImagesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: ${spacing[400]}px;
  width: 100%;
  max-width: ${grid.maxWidth}px;
  margin: 0 auto;

  ${media.down('m')} {
    grid-template-columns: 1fr;
    gap: ${spacing[300]}px;
  }
`;

const ImageWrapper = styled.div`
  position: relative;
  border-radius: ${radius.l}px;
  overflow: hidden;
  aspect-ratio: 4/3;
  background: ${neutrals[800]};

  img {
    object-fit: cover;
  }
`;

const Caption = styled.p`
  font-family: ${fontFamily.display};
  font-weight: ${fontWeight.regular};
  font-size: ${fontSize.body.l}px;
  line-height: ${lineHeight.body.l}px;
  color: ${neutrals[500]};
  margin: 0;
  max-width: 640px;
`;

export interface CaseStudyBodySectionProps {
  project: ProjectConfig;
}

export function CaseStudyBodySection({ project }: CaseStudyBodySectionProps) {
  const images = project.images.slice(0, 9);

  return (
    <Section>
      <Content>
        {images.length > 0 && (
          <ImagesGrid>
            {images.map((img, i) => (
              <ImageWrapper key={i}>
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  style={{ objectFit: 'cover' }}
                />
              </ImageWrapper>
            ))}
          </ImagesGrid>
        )}
        <Caption>{project.description}</Caption>
      </Content>
    </Section>
  );
}
