'use client';

import styled from 'styled-components';
import { Container, Text } from '@/components/primitives';
import { spacing } from '@/styles/tokens/spacing';
import { fontFamily, fontWeight, fontSize, lineHeight } from '@/styles/tokens/typography';
import { fluidFontSize, fluidLineHeight } from '@/styles/fluid';
import { accents, neutrals, glass } from '@/styles/tokens/colors';
import { radius } from '@/styles/tokens/radius';
import { grid } from '@/styles/tokens/grid';
import { media } from '@/styles/media';
import type { CaseStudyBlueprintBlock } from '@/components/sections/case-study/caseStudyContent';

const Section = styled.section`
  padding: ${spacing[2000]}px 0;
  width: 100%;
`;

const Inner = styled(Container)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[800]}px;
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
  font-weight: ${fontWeight.heading};
  font-size: ${fluidFontSize.display.s};
  line-height: ${fluidLineHeight.display.s};
  color: ${neutrals[100]};
`;

const Subtitle = styled(Text)`
  margin: 0;
  font-family: ${fontFamily.body};
  font-weight: ${fontWeight.regular};
  font-size: ${fontSize.body.xl}px;
  line-height: ${lineHeight.body.xl}px;
  color: ${neutrals[500]};
`;

const TopRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: ${spacing[600]}px;
  width: 100%;

  ${media.down('m')} {
    grid-template-columns: 1fr;
  }
`;

const BottomRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${spacing[600]}px;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;

  ${media.down('m')} {
    grid-template-columns: 1fr;
    max-width: none;
  }
`;

const Card = styled.div`
  border-radius: ${radius.xxl}px;
  padding: ${spacing[500]}px;
  background: ${glass.borderSubtle};
  border: 1px solid ${glass.border};
  display: flex;
  flex-direction: column;
  gap: ${spacing[300]}px;
  align-items: center;
  text-align: center;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fluidFontSize.heading.l};
  line-height: ${fluidLineHeight.heading.l};
  color: ${accents.primary};
`;

const CardBody = styled(Text)`
  margin: 0;
  font-family: ${fontFamily.body};
  font-weight: ${fontWeight.regular};
  font-size: ${fontSize.body.l}px;
  line-height: ${lineHeight.body.l}px;
  color: ${neutrals[100]};
`;

export interface CaseStudyBlueprintSectionProps {
  content: CaseStudyBlueprintBlock;
}

export function CaseStudyBlueprintSection({ content }: CaseStudyBlueprintSectionProps) {
  const [a, b, c, d, e] = content.cards;
  const top = [a, b, c].filter(Boolean);
  const bottom = [d, e].filter(Boolean);

  return (
    <Section id="case-study-blueprint" aria-labelledby="blueprint-title">
      <Inner>
        <Head>
          <Title id="blueprint-title">{content.title}</Title>
          <Subtitle as="p">{content.subtitle}</Subtitle>
        </Head>
        {top.length > 0 && (
          <TopRow>
            {top.map((card) => (
              <Card key={card.title}>
                <CardTitle>{card.title}</CardTitle>
                <CardBody as="p">{card.body}</CardBody>
              </Card>
            ))}
          </TopRow>
        )}
        {bottom.length > 0 && (
          <BottomRow>
            {bottom.map((card) => (
              <Card key={card.title}>
                <CardTitle>{card.title}</CardTitle>
                <CardBody as="p">{card.body}</CardBody>
              </Card>
            ))}
          </BottomRow>
        )}
      </Inner>
    </Section>
  );
}
