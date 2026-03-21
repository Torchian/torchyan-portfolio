'use client';

import styled, { css } from 'styled-components';
import Image from 'next/image';
import { Container, Text } from '@/components/primitives';
import { spacing } from '@/styles/tokens/spacing';
import { fontFamily, fontWeight, fontSize, lineHeight, letterSpacing } from '@/styles/tokens/typography';
import { accents, neutrals } from '@/styles/tokens/colors';
import { radius } from '@/styles/tokens/radius';
import { grid } from '@/styles/tokens/grid';
import { media } from '@/styles/media';
import type { CaseStudyVisualArchitectureBlock } from '@/components/sections/case-study/caseStudyContent';
import type { ProjectConfig } from '@/components/sections/selected-work/projectsConfig';

const Section = styled.section`
  padding: ${spacing[2000]}px 0 ${spacing[1000]}px;
  width: 100%;
`;

const Inner = styled(Container)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[1000]}px;
  max-width: ${grid.maxWidth}px;
`;

const Head = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[300]}px;
  text-align: center;
  max-width: 900px;
`;

const Title = styled.h2`
  margin: 0;
  font-family: ${fontFamily.display};
  font-weight: ${fontWeight.black};
  font-size: ${fontSize.display.m}px;
  line-height: ${lineHeight.display.m}px;
  letter-spacing: ${letterSpacing.xxs}px;
  text-transform: uppercase;
  color: ${neutrals[100]};

  ${media.down('m')} {
    font-size: ${fontSize.display.s}px;
    line-height: ${lineHeight.display.s}px;
  }
`;

const Subtitle = styled(Text)`
  margin: 0;
  font-family: ${fontFamily.body};
  font-weight: ${fontWeight.regular};
  font-size: ${fontSize.body.xl}px;
  line-height: ${lineHeight.body.xl}px;
  color: ${neutrals[500]};
`;

const Row = styled.article<{ $reverse: boolean }>`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${spacing[800]}px;
  align-items: center;
  width: 100%;

  ${(p) =>
    p.$reverse &&
    css`
      > *:first-child {
        order: 2;
      }
      > *:last-child {
        order: 1;
      }
    `}

  ${media.down('l')} {
    grid-template-columns: 1fr;
    > * {
      order: unset !important;
    }
  }
`;

const TextBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[300]}px;
  min-width: 0;
`;

const RowNumber = styled.span`
  font-family: ${fontFamily.display};
  font-weight: ${fontWeight.black};
  font-size: ${fontSize.display.s}px;
  line-height: ${lineHeight.display.s}px;
  color: ${accents.primary};
`;

const RowTitle = styled.h3`
  margin: 0;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.heading.l}px;
  line-height: ${lineHeight.heading.l}px;
  color: ${neutrals[100]};
`;

const RowBody = styled(Text)`
  margin: 0;
  font-family: ${fontFamily.body};
  font-weight: ${fontWeight.regular};
  font-size: ${fontSize.body.l}px;
  line-height: ${lineHeight.body.l}px;
  color: ${neutrals[500]};
`;

const MediaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: ${spacing[200]}px;
  min-height: 200px;
`;

const MediaCell = styled.div`
  position: relative;
  border-radius: ${radius.m}px;
  overflow: hidden;
  aspect-ratio: 4 / 3;
  background: ${neutrals[800]};
`;

export interface CaseStudyVisualArchitectureSectionProps {
  project: ProjectConfig;
  content: CaseStudyVisualArchitectureBlock;
}

function pickImages(project: ProjectConfig, rowIndex: number, count: number) {
  const imgs = project.images;
  if (imgs.length === 0) return [];
  const start = (rowIndex * count) % imgs.length;
  const out: { src: string; alt: string }[] = [];
  for (let i = 0; i < count; i += 1) {
    out.push(imgs[(start + i) % imgs.length]);
  }
  return out;
}

export function CaseStudyVisualArchitectureSection({
  project,
  content,
}: CaseStudyVisualArchitectureSectionProps) {
  return (
    <Section id="case-study-visual-architecture" aria-labelledby="visual-arch-title">
      <Inner>
        <Head>
          <Title id="visual-arch-title">{content.title}</Title>
          <Subtitle as="p">{content.subtitle}</Subtitle>
        </Head>
        {content.rows.map((row, index) => {
          const reverse = index % 2 === 1;
          const imgs = pickImages(project, index, 3);
          return (
            <Row key={row.title} $reverse={reverse}>
              <TextBlock>
                <RowNumber aria-hidden>{String(index + 1).padStart(2, '0')}</RowNumber>
                <RowTitle>{row.title}</RowTitle>
                <RowBody as="p">{row.body}</RowBody>
              </TextBlock>
              <MediaGrid>
                {imgs.map((img, i) => (
                  <MediaCell key={`${row.title}-${img.src}-${i}`}>
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      style={{ objectFit: 'cover' }}
                    />
                  </MediaCell>
                ))}
              </MediaGrid>
            </Row>
          );
        })}
      </Inner>
    </Section>
  );
}
