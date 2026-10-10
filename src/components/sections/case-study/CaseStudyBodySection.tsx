'use client';

import { useMessages } from 'next-intl';
import styled from 'styled-components';
import { Container } from '@/components/primitives';
import { HEADER_INLINE } from '@/components/layouts/NavBar';
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

/*
 * Joined to the hero (no page gap between them): the story starts half the
 * usual distance below the band. Nothing below it either, so the page gap
 * alone leads on to the closing CTA.
 */
const Section = styled.section`
  padding: ${spacing[1500]}px 0 0;

  ${media.down('xl')} {
    padding-top: ${spacing[1250]}px;
  }

  ${media.down('m')} {
    padding-top: ${spacing[800]}px;
  }
`;

const Content = styled(Container)`
  display: flex;
  flex-direction: column;
  gap: ${spacing[800]}px;

  /* Lined up with the header: its own three steps (32, 24, 16). */
  padding-inline: ${HEADER_INLINE.base}px;

  ${media.down('xl')} {
    padding-inline: ${HEADER_INLINE.tablet}px;
  }

  ${media.down('m')} {
    padding-inline: ${HEADER_INLINE.mobile}px;
  }
`;

/*
 * Screens at their own shape in two columns, each next screen going to the
 * shorter column, so neither runs out before the other (CSS columns can't
 * balance mixed heights, and left one ending half a page early). One column
 * on a phone: the columns step aside (display: contents) and `order` puts the
 * screens back in their own sequence.
 */
const ImagesGrid = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${spacing[400]}px;
  width: 100%;
  max-width: ${grid.maxWidth}px;
  margin: 0 auto;

  ${media.down('m')} {
    flex-direction: column;
    align-items: stretch;
    gap: ${spacing[300]}px;
  }
`;

const ImagesColumn = styled.div`
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  gap: ${spacing[400]}px;
  min-width: 0;

  ${media.down('m')} {
    display: contents;
  }
`;

/** Height of a piece in column widths: its screen (never past about two screens tall), a caption if it has one. */
const pieceHeight = (aspect: number, captioned: boolean) => 1 / Math.max(aspect, MIN_ASPECT) + (captioned ? 0.1 : 0);
const MIN_ASPECT = 0.6;

/**
 * Splits the pieces, each keeping its place in the sequence, into two columns
 * as near in height as they can be: a subset-sum over the pieces' heights
 * (in hundredths of a column width) finds the group closest to half the total.
 * Greedy "shorter column next" can't do this when a few screens are very tall.
 */
function balance<T extends { aspect?: number; caption?: string }>(items: T[]) {
  const sizes = items.map((item) => Math.round((pieceHeight(item.aspect ?? 4 / 3, Boolean(item.caption)) + 0.04) * 100));
  const total = sizes.reduce((a, b) => a + b, 0);
  const half = Math.floor(total / 2);
  // reach[i][t]: some subset of the first i pieces sums to t.
  const reach = [new Uint8Array(half + 1)];
  reach[0][0] = 1;
  sizes.forEach((size, i) => {
    const next = Uint8Array.from(reach[i]);
    for (let t = size; t <= half; t++) if (reach[i][t - size]) next[t] = 1;
    reach.push(next);
  });
  let best = half;
  while (best > 0 && !reach[items.length][best]) best--;
  // Walk back to find which pieces make up `best`; they form the second column.
  const second = new Set<number>();
  for (let i = items.length; i > 0 && best > 0; i--) {
    if (!reach[i - 1][best]) {
      second.add(i - 1);
      best -= sizes[i - 1];
    }
  }
  // The first piece always leads the left column, whichever group it landed in.
  const flip = second.has(0);
  const columns: { item: T; index: number }[][] = [[], []];
  items.forEach((item, index) => columns[second.has(index) !== flip ? 1 : 0].push({ item, index }));
  return columns;
}

/** A captioned piece: the image, then a line naming what it is. */
const Figure = styled.figure`
  margin: 0;

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

/** An uncaptioned piece: just the screen. Its own box so `order` can sequence it on a phone. */
const Piece = styled.div``;

/** A very long page capture is shown from its top, no taller than about two screens. */
const ImageWrapper = styled.div`
  position: relative;
  border-radius: ${radius.l}px;
  overflow: hidden;
  aspect-ratio: max(var(--aspect, 1.3333), ${MIN_ASPECT});
  background: ${neutrals[800]};
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
    <Section data-joined>
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
            {balance(images).map((column, side) => (
              <ImagesColumn key={side}>
                {column.map(({ item: img, index }) => {
                  const media = (
                    <ImageWrapper style={{ '--aspect': img.aspect ?? 4 / 3 } as React.CSSProperties}>
                      <CaseMedia
                        image={{ ...img, aspect: img.aspect ?? 4 / 3 }}
                        alt={img.alt}
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </ImageWrapper>
                  );
                  // A captioned piece is a figure, its caption under the image.
                  return img.caption ? (
                    <Figure key={index} style={{ order: index }}>
                      {media}
                      <figcaption>{img.caption}</figcaption>
                    </Figure>
                  ) : (
                    <Piece key={index} style={{ order: index }}>
                      {media}
                    </Piece>
                  );
                })}
              </ImagesColumn>
            ))}
          </ImagesGrid>
        )}
      </Content>
    </Section>
  );
}
