'use client';

import styled from 'styled-components';
import { Button, Container, Text } from '@/components/primitives';
import { spacing } from '@/styles/tokens/spacing';
import { fontFamily, fontWeight, fontSize, lineHeight } from '@/styles/tokens/typography';
import { accents, neutrals } from '@/styles/tokens/colors';
import { radius } from '@/styles/tokens/radius';
import { media } from '@/styles/media';
import type { ProjectConfig } from '@/components/sections/selected-work/projectsConfig';

const Section = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[800]}px;
  padding: ${spacing[2000]}px 0;
  width: 100%;
`;

const ClosingInner = styled(Container)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[800]}px;
`;

const Title = styled.h2`
  margin: 0;
  color: ${neutrals[100]};
  text-align: center;
  font-family: ${fontFamily.display};
  font-weight: ${fontWeight.heading};
  font-size: ${fontSize.display.s}px;
  line-height: ${lineHeight.display.s}px;
`;

const Subtitle = styled(Text)`
  margin: 0;
  color: ${neutrals[500]};
  max-width: 720px;
  text-align: center;
  font-family: ${fontFamily.heading};
  font-size: ${fontSize.heading.s}px;
  line-height: ${lineHeight.heading.s}px;
`;

const Cards = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${spacing[800]}px;
  max-width: 960px;
  margin: 0 auto;

  ${media.down('m')} {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div<{ $bg: string }>`
  background: ${(p) => p.$bg};
  border-radius: ${radius.xxl}px;
  padding: ${spacing[500]}px;
  display: flex;
  flex-direction: column;
  gap: ${spacing[600]}px;
`;

const CardTitle = styled.h3<{ $color: string }>`
  margin: 0;
  color: ${(p) => p.$color};
  text-align: center;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.heading.l}px;
  line-height: ${lineHeight.heading.l}px;
`;

const CardBody = styled(Text)`
  margin: 0;
  color: ${neutrals[500]};
  text-align: center;
  font-family: ${fontFamily.heading};
  font-size: ${fontSize.heading.s}px;
  line-height: ${lineHeight.heading.s}px;
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

export interface CaseStudyClosingSectionProps {
  project: ProjectConfig;
}

export function CaseStudyClosingSection({ project }: CaseStudyClosingSectionProps) {
  return (
    <Section id="case-study-cta" aria-labelledby="case-study-closing-title">
      <ClosingInner>
        <Title id="case-study-closing-title">Build With Structural Intent</Title>
        <Subtitle as="p">
          If your product demands clarity between design vision and engineering execution, the next
          step should be deliberate—not improvised.
        </Subtitle>
        <Cards>
          <Card $bg="#0D1816">
            <CardTitle $color={accents.primary}>Continue exploring</CardTitle>
            <CardBody as="p">
              See more structured work and how systems scale in production environments.
            </CardBody>
            <CardFooter>
              <Button as="a" href="/projects" $variant="secondary">
                View all projects
              </Button>
            </CardFooter>
          </Card>
          <Card $bg="#1C0B27">
            <CardTitle $color={accents.secondary}>This case study</CardTitle>
            <CardBody as="p">
              Revisit the narrative for {project.company} or jump into another selected project.
            </CardBody>
            <CardFooter>
              <Button as="a" href="/case-studies" $variant="secondaryPink">
                Browse case studies
              </Button>
            </CardFooter>
          </Card>
        </Cards>
      </ClosingInner>
    </Section>
  );
}
