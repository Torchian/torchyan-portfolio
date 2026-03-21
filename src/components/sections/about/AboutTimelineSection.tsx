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
import { accents, neutrals } from '@/styles/tokens/colors';
import { radius } from '@/styles/tokens/radius';
import { grid } from '@/styles/tokens/grid';
import { media } from '@/styles/media';
import { TIMELINE_ENTRIES } from './timelineConfig';
import { PROJECTS } from '@/components/sections/selected-work/projectsConfig';

/* Timeline */
const Section = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${spacing[2000]}px 0;
  gap: ${spacing[1000]}px;
  position: relative;
  width: 100%;
`;

/* Container */
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[2000]}px;
  width: 100%;
  max-width: ${grid.maxWidth}px;
`;

/* Section Heading */
const SectionHeading = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
  gap: ${spacing[200]}px;
  padding: 0 ${spacing[400]}px;
  width: 100%;
  max-width: ${grid.maxWidth}px;
  flex: none;
  align-self: stretch;
`;

/* whatido_title — typography/display/large */
const SectionTitle = styled(Text)`
  font-family: ${fontFamily.display};
  font-style: normal;
  font-weight: ${fontWeight.black};
  font-size: ${fontSize.display.xl}px;
  line-height: ${lineHeight.display.xl}px;
  text-align: center;
  letter-spacing: ${letterSpacing.xxs}px;
  text-transform: uppercase;
  color: ${neutrals[500]};
  border-radius: ${radius.xl}px;
  margin: 0;
  align-self: stretch;

  ${media.down('l')} {
    font-size: ${fontSize.display.m}px;
    line-height: ${lineHeight.display.m}px;
  }
  ${media.down('m')} {
    font-size: ${fontSize.display.s}px;
    line-height: ${lineHeight.display.s}px;
  }
`;

/* whatido_subtitle — typography/headline/small */
const SectionSubtitle = styled(Text)`
  font-family: ${fontFamily.heading};
  font-style: normal;
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.heading.s}px;
  line-height: ${lineHeight.heading.s}px;
  text-align: center;
  color: ${neutrals[500]};
  margin: 0;
  align-self: stretch;
`;

const ThreeColumn = styled.div`
  display: grid;
  grid-template-columns: 200px 1fr  minmax(280px, 40%);
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

/* Sticky date — left column, stays sticky */
const StickyDateWrapper = styled.div`
  position: relative;

  ${media.down('l')} {
    order: -1;
  }
`;

const StickyDateInner = styled.div`
  position: sticky;
  top: ${spacing[2000]}px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${spacing[300]}px;
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
  font-size: ${fontSize.display.l}px;
  line-height: ${lineHeight.display.l}px;
  color: ${accents.primary};
  margin: 0;

  ${media.down('m')} {
    font-size: ${fontSize.display.m}px;
    line-height: ${lineHeight.display.m}px;
  }
`;

const StickyContentText = styled(Text)`
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.medium};
  font-size: ${fontSize.heading.s}px;
  line-height: ${lineHeight.heading.s}px;
  color: ${neutrals[500]};
  margin: 0;
  text-align: left;
  white-space: pre-line;
`;

/* Frame — timeline cards list */
const TimelineList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-top: ${spacing[500]}px;
  gap: ${spacing[500]}px;
  width: 100%;
  min-width: 0;
`;

/* timeline_card */
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

/* Frame 54 */
const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: ${spacing[500]}px 0;
  gap: ${spacing[400]}px;
  flex: 1;
  min-width: 0;
`;

/* timeline_card_heading */
const CardHeading = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0;
  gap: ${spacing[150]}px;
  flex: none;
`;

/* Company Name — typography/headline/large, dark/background/primary */
const CompanyName = styled(Text)`
  font-family: ${fontFamily.heading};
  font-style: normal;
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.heading.l}px;
  line-height: ${lineHeight.heading.l}px;
  text-align: left;
  color: ${accents.primary};
  margin: 0;
`;

/* Role — typography/headline/small, dark/text/primary */
const Role = styled(Text)`
  font-family: ${fontFamily.heading};
  font-style: normal;
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.heading.s}px;
  line-height: ${lineHeight.heading.s}px;
  text-align: left;
  color: ${neutrals[100]};
  margin: 0;
`;

/* focus / impact block */
const Block = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0;
  gap: ${spacing[100]}px;
  flex: none;
`;

/* Label — typography/title/large, dark/text/mute */
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

/* Body — typography/body/extraLarge, dark/text/primary */
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

/* core_growth — row of keywords */
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

/* Sticky 4-column projects grid */
const StickyGridWrapper = styled.div`
  position: relative;
  min-width: 0;
`;

const ProjectsGrid = styled.div`
  position: sticky;
  top: ${spacing[0]}px;
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

export function AboutTimelineSection() {
  const gridImages = PROJECTS.flatMap((p) => p.images.slice(0, 4)).slice(0, 16);
  const [activeIndex, setActiveIndex] = useState(0);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const ratiosRef = useRef<number[]>([]);

  useEffect(() => {
    const refs = cardRefs.current;
    const count = TIMELINE_ENTRIES.length;
    ratiosRef.current = new Array(count).fill(0);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = refs.findIndex((el) => el === entry.target);
          if (index !== -1) ratiosRef.current[index] = entry.intersectionRatio;
        });
        const ratios = ratiosRef.current;
        const maxRatio = Math.max(...ratios);
        const newIndex = ratios.findIndex((r) => r === maxRatio);
        if (maxRatio > 0 && newIndex !== -1) {
          setActiveIndex(newIndex);
        }
      },
      { root: null, rootMargin: '-10% 0px -55% 0px', threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] }
    );

    const toObserve = refs.slice(0, count);
    toObserve.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const activeEntry = TIMELINE_ENTRIES[activeIndex] ?? TIMELINE_ENTRIES[0];

  return (
    <Section id="timeline">
      <Container>
        <SectionHeading>
          <SectionTitle as="h2">
            Building interface systems since 2016
          </SectionTitle>
          <SectionSubtitle as="p">
            I work at the intersection where design decisions meet technical
            reality. My role is to connect intent, system logic, and execution —
            without losing quality along the way.
          </SectionSubtitle>
        </SectionHeading>
      </Container>
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
          {TIMELINE_ENTRIES.map((entry, index) => (
            <TimelineCard
              key={`${entry.company}-${entry.role}`}
              ref={(el) => { cardRefs.current[index] = el; }}
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
