'use client';

import { useMessages } from 'next-intl';
import styled from 'styled-components';
import { Container } from '@/components/primitives';
import { spacing } from '@/styles/tokens/spacing';
import { fontSize, lineHeight, fontWeight, fontFamily } from '@/styles/tokens/typography';
import { neutrals } from '@/styles/tokens/colors';
import { radius } from '@/styles/tokens/radius';
import { grid } from '@/styles/tokens/grid';
import { media } from '@/styles/media';
import type { ProjectConfig } from '@/components/sections/selected-work/projectsConfig';
import { CaseBlocks } from './CaseBlocks';
import { CaseMedia } from './CaseMedia';
import type { CaseBlock } from './caseStudyConfig';

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

/**
 * The short case: labelled parts (relationship & role, context, what I did,
 * evidence, what it shows), each a run of paragraphs and lists. Label on the
 * left and text on the right from the 1024 frame up; stacked below it.
 */
const Story = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[600]}px;
  width: 100%;
  max-width: ${grid.maxWidth}px;
  margin: 0 auto;

  ${media.down('m')} {
    gap: ${spacing[400]}px;
  }
`;

const Part = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: ${spacing[150]}px;

  ${media.up('l')} {
    grid-template-columns: minmax(0, 4fr) minmax(0, 8fr);
    gap: ${spacing[600]}px;
  }
`;

const PartLabel = styled.h2`
  margin: 0;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.heading.s}px;
  line-height: ${lineHeight.heading.s}px;
  color: ${neutrals[100]};
`;

const PartText = styled(CaseBlocks)`
  font-family: ${fontFamily.body};
  font-weight: ${fontWeight.regular};
  font-size: ${fontSize.body.xl}px;
  line-height: ${lineHeight.body.xl}px;
  color: ${neutrals[500]};

  ${media.down('m')} {
    font-size: ${fontSize.body.l}px;
    line-height: ${lineHeight.body.l}px;
  }
`;

/** One labelled part of a short case, from messages/*.json projects.<slug>.story. */
export interface StoryPart {
  label: string;
  blocks: CaseBlock[];
}

export interface CaseStudyBodySectionProps {
  project: ProjectConfig;
}

export function CaseStudyBodySection({ project }: CaseStudyBodySectionProps) {
  const content = useMessages().projects[project.slug] as { story?: StoryPart[] };
  const story = content.story ?? [];
  const images = project.images.slice(0, 9);

  return (
    <Section>
      <Content>
        {story.length > 0 && (
          <Story>
            {story.map((part) => (
              <Part key={part.label}>
                <PartLabel>{part.label}</PartLabel>
                <PartText blocks={part.blocks} />
              </Part>
            ))}
          </Story>
        )}
        {images.length > 0 && (
          <ImagesGrid>
            {images.map((img, i) => (
              <ImageWrapper key={i}>
                <CaseMedia image={{ ...img, aspect: 4 / 3 }} alt={img.alt} sizes="(max-width: 480px) 100vw, 33vw" />
              </ImageWrapper>
            ))}
          </ImagesGrid>
        )}
      </Content>
    </Section>
  );
}
