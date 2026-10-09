'use client';

import { Fragment } from 'react';

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

/** Screens at their own shape, in columns that fill top to bottom (a masonry). */
const ImagesGrid = styled.div`
  columns: 3 320px;
  column-gap: ${spacing[400]}px;
  width: 100%;
  max-width: ${grid.maxWidth}px;
  margin: 0 auto;

  ${media.down('m')} {
    columns: 1;
  }
`;

/** A captioned piece: the image, then a line naming what it is. */
const Figure = styled.figure`
  margin: 0 0 ${spacing[400]}px;
  break-inside: avoid;

  > div {
    margin-bottom: ${spacing[150]}px;
  }

  figcaption {
    font-family: ${fontFamily.body};
    font-size: ${fontSize.body.m}px;
    line-height: ${lineHeight.body.m}px;
    color: ${neutrals[500]};
  }
`;

/** A very long page capture is shown from its top, no taller than about two screens. */
const ImageWrapper = styled.div`
  position: relative;
  break-inside: avoid;
  margin-bottom: ${spacing[400]}px;
  border-radius: ${radius.l}px;
  overflow: hidden;
  aspect-ratio: max(var(--aspect, 1.3333), 0.6);
  background: ${neutrals[800]};

  ${media.down('m')} {
    margin-bottom: ${spacing[300]}px;
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
  const images = project.images;

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
            {images.map((img, i) => {
              const media = (
                <ImageWrapper style={{ '--aspect': img.aspect ?? 4 / 3 } as React.CSSProperties}>
                  <CaseMedia
                    image={{ ...img, aspect: img.aspect ?? 4 / 3 }}
                    alt={img.alt}
                    sizes="(max-width: 480px) 100vw, 33vw"
                  />
                </ImageWrapper>
              );
              // A captioned piece is a figure, its caption under the image.
              return img.caption ? (
                <Figure key={i}>
                  {media}
                  <figcaption>{img.caption}</figcaption>
                </Figure>
              ) : (
                <Fragment key={i}>{media}</Fragment>
              );
            })}
          </ImagesGrid>
        )}
      </Content>
    </Section>
  );
}
