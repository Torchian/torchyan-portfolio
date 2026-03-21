'use client';

import { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import Image from 'next/image';
import { Text } from '@/components/primitives';
import { spacing } from '@/styles/tokens/spacing';
import {
  fontFamily,
  fontWeight,
  fontSize,
  lineHeight,
  letterSpacing,
} from '@/styles/tokens/typography';
import { fluidFontSize, fluidLineHeight } from '@/styles/fluid';
import { accents, neutrals } from '@/styles/tokens/colors';
import { radius } from '@/styles/tokens/radius';
import { grid } from '@/styles/tokens/grid';
import { media } from '@/styles/media';
import { zIndex } from '@/styles/tokens/z-index';
import type { TimelineEntry } from '@/components/sections/about/timelineConfig';

const Section = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${spacing[2000]}px 0;
  gap: ${spacing[1000]}px;
  position: relative;
  width: 100%;
`;

const HeadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[2000]}px;
  width: 100%;
  max-width: ${grid.maxWidth}px;
`;

const SectionHeading = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 ${spacing[400]}px;
  gap: ${spacing[200]}px;
  width: 100%;
  max-width: ${grid.maxWidth}px;
  flex: none;
  align-self: stretch;
`;

const SectionTitle = styled(Text)`
  font-family: ${fontFamily.display};
  font-style: normal;
  font-weight: ${fontWeight.black};
  font-size: ${fluidFontSize.display.xl};
  line-height: ${fluidLineHeight.display.xl};
  text-align: center;
  letter-spacing: ${letterSpacing.xxs}px;
  text-transform: uppercase;
  color: ${neutrals[500]};
  border-radius: ${radius.xl}px;
  margin: 0;
  align-self: stretch;

  ${media.down('l')} {
    font-size: ${fluidFontSize.display.m};
    line-height: ${fluidLineHeight.display.m};
  }
  ${media.down('m')} {
    font-size: ${fluidFontSize.display.s};
    line-height: ${fluidLineHeight.display.s};
  }
`;

const SectionSubtitle = styled(Text)`
  font-family: ${fontFamily.heading};
  font-style: normal;
  font-weight: ${fontWeight.semibold};
  font-size: ${fluidFontSize.heading.s};
  line-height: ${fluidLineHeight.heading.s};
  text-align: center;
  color: ${neutrals[500]};
  margin: 0;
  align-self: stretch;
`;

const ThreeColumn = styled.div`
  display: grid;
  grid-template-columns: 200px 1fr minmax(280px, 40%);
  gap: ${spacing[1000]}px;
  width: 100%;
  max-width: ${grid.maxWidth}px;
  margin: 0 auto;
  padding: 0 ${spacing[400]}px;

  ${media.down('l')} {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr auto;
  }
`;

const StickyDateWrapper = styled.div`
  position: relative;

  ${media.down('l')} {
    order: -1;
  }
`;

const StickyDateInner = styled.div`
  position: sticky;
  /* Below fixed header (nav height + small gap) */
  top: calc(${spacing[1000]}px + ${spacing[200]}px);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${spacing[300]}px;
  z-index: ${zIndex.base};
`;

const YearRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: ${spacing[200]}px;
`;

const YearDot = styled.span`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${accents.primary};
  flex-shrink: 0;
`;

const YearText = styled(Text)`
  font-family: ${fontFamily.display};
  font-weight: ${fontWeight.black};
  font-size: ${fluidFontSize.display.l};
  line-height: ${fluidLineHeight.display.l};
  color: ${accents.primary};
  margin: 0;

  ${media.down('m')} {
    font-size: ${fluidFontSize.display.m};
    line-height: ${fluidLineHeight.display.m};
  }
`;

const StickyContentText = styled(Text)`
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.medium};
  font-size: ${fluidFontSize.heading.s};
  line-height: ${fluidLineHeight.heading.s};
  color: ${neutrals[500]};
  margin: 0;
  text-align: left;
  white-space: pre-line;
`;

const TimelineList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-top: ${spacing[500]}px;
  gap: ${spacing[500]}px;
  width: 100%;
  min-width: 0;
`;

const TimelineCard = styled.article`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0;
  gap: ${spacing[1000]}px;
  width: 100%;
  min-width: 0;

  ${media.down('m')} {
    flex-direction: column;
    align-items: flex-start;
    gap: ${spacing[400]}px;
  }
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: ${spacing[500]}px 0;
  gap: ${spacing[400]}px;
  flex: 1;
  min-width: 0;
`;

const CardHeading = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0;
  gap: ${spacing[150]}px;
  flex: none;
`;

const CompanyName = styled(Text)`
  font-family: ${fontFamily.heading};
  font-style: normal;
  font-weight: ${fontWeight.semibold};
  font-size: ${fluidFontSize.heading.l};
  line-height: ${fluidLineHeight.heading.l};
  text-align: left;
  color: ${accents.primary};
  margin: 0;
`;

const Role = styled(Text)`
  font-family: ${fontFamily.heading};
  font-style: normal;
  font-weight: ${fontWeight.semibold};
  font-size: ${fluidFontSize.heading.s};
  line-height: ${fluidLineHeight.heading.s};
  text-align: left;
  color: ${neutrals[100]};
  margin: 0;
`;

const Block = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0;
  gap: ${spacing[100]}px;
  flex: none;
`;

const BlockLabel = styled(Text)`
  font-family: ${fontFamily.body};
  font-style: normal;
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.body.xl}px;
  line-height: ${lineHeight.body.xl}px;
  letter-spacing: ${letterSpacing.s}px;
  color: ${neutrals[700]};
  margin: 0;
`;

const BlockBody = styled(Text)`
  font-family: ${fontFamily.body};
  font-style: normal;
  font-weight: ${fontWeight.regular};
  font-size: ${fontSize.body.xl}px;
  line-height: ${lineHeight.body.xl}px;
  color: ${neutrals[100]};
  margin: 0;
  white-space: pre-line;
`;

const CoreGrowth = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 0;
  gap: ${spacing[400]}px;
  flex-wrap: wrap;
  flex: none;
`;

const CoreGrowthItem = styled(Text)`
  font-family: ${fontFamily.body};
  font-style: normal;
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.body.xl}px;
  line-height: ${lineHeight.body.xl}px;
  letter-spacing: ${letterSpacing.s}px;
  color: ${neutrals[100]};
  margin: 0;
`;

const StickyGridWrapper = styled.div`
  position: relative;
  min-width: 0;
`;

const ProjectsGrid = styled.div`
  position: sticky;
  top: calc(${spacing[1000]}px + ${spacing[200]}px);
  padding-top: ${spacing[1000]}px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${spacing[200]}px;
  width: 100%;
  height: 100vh;
`;

const GridImageWrapper = styled.div`
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
`;

export interface TimelineSectionLayoutProps {
  id?: string;
  title: string;
  subtitle: string;
  entries: TimelineEntry[];
  gridImages: { src: string; alt: string }[];
}

export function TimelineSectionLayout({
  id,
  title,
  subtitle,
  entries,
  gridImages,
}: TimelineSectionLayoutProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const ratiosRef = useRef<number[]>([]);

  useEffect(() => {
    const refs = cardRefs.current;
    const count = entries.length;
    if (count === 0) return;
    ratiosRef.current = new Array(count).fill(0);

    const observer = new IntersectionObserver(
      (observed) => {
        observed.forEach((entry) => {
          const index = refs.findIndex((el) => el === entry.target);
          if (index !== -1) ratiosRef.current[index] = entry.intersectionRatio;
        });
        const ratios = ratiosRef.current;
        const maxRatio = ratios.length ? Math.max(...ratios) : 0;
        const newIndex = ratios.findIndex((r) => r === maxRatio);
        if (maxRatio > 0 && newIndex !== -1) {
          setActiveIndex(newIndex);
        }
      },
      { root: null, rootMargin: '-10% 0px -55% 0px', threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] }
    );

    refs.slice(0, count).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [entries.length]);

  if (entries.length === 0) {
    return null;
  }

  const activeEntry = entries[activeIndex] ?? entries[0];

  return (
    <Section id={id}>
      <HeadingContainer>
        <SectionHeading>
          <SectionTitle as="h2">{title}</SectionTitle>
          <SectionSubtitle as="p">{subtitle}</SectionSubtitle>
        </SectionHeading>
      </HeadingContainer>
      <ThreeColumn>
        <StickyDateWrapper>
          <StickyDateInner>
            <YearRow>
              <YearDot aria-hidden />
              <YearText as="span">{activeEntry.year}</YearText>
            </YearRow>
            <StickyContentText as="p">{activeEntry.stickyContent}</StickyContentText>
          </StickyDateInner>
        </StickyDateWrapper>
        <TimelineList>
          {entries.map((entry, index) => (
            <TimelineCard
              key={`${entry.company}-${entry.role}-${index}`}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
            >
              <CardContent>
                <CardHeading>
                  <CompanyName as="p">{entry.company}</CompanyName>
                  <Role as="p">{entry.role}</Role>
                </CardHeading>
                <Block>
                  <BlockLabel as="p">Focus</BlockLabel>
                  <BlockBody as="p">{entry.focus}</BlockBody>
                </Block>
                <Block>
                  <BlockLabel as="p">Impact</BlockLabel>
                  <BlockBody as="p">{entry.impact}</BlockBody>
                </Block>
                <CoreGrowth>
                  {entry.coreGrowth.map((item) => (
                    <CoreGrowthItem as="span" key={item}>
                      {item}
                    </CoreGrowthItem>
                  ))}
                </CoreGrowth>
              </CardContent>
            </TimelineCard>
          ))}
        </TimelineList>

        <StickyGridWrapper>
          <ProjectsGrid>
            {gridImages.map((img, i) => (
              <GridImageWrapper key={`${img.src}-${i}`}>
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(max-width: 1024px) 25vw, 120px"
                  style={{ objectFit: 'cover' }}
                />
              </GridImageWrapper>
            ))}
          </ProjectsGrid>
        </StickyGridWrapper>
      </ThreeColumn>
    </Section>
  );
}
