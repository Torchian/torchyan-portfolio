'use client';

import styled from 'styled-components';
import { Button, Container, Reveal, Text } from '@/components/primitives';
import { spacing } from '@/styles/tokens/spacing';
import { fontFamily, fontWeight } from '@/styles/tokens/typography';
import { fluidFontSize, fluidLineHeight } from '@/styles/fluid';
import { accents, neutrals } from '@/styles/tokens/colors';
import { radius } from '@/styles/tokens/radius';
import { media } from '@/styles/media';

const Section = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[800]}px;
  padding-bottom: ${spacing[2000]}px;
`;

const Title = styled.h2`
  margin: 0;
  color: ${neutrals[100]};
  text-align: center;
  font-family: ${fontFamily.display};
  font-weight: ${fontWeight.heading};
  font-size: ${fluidFontSize.display.s};
  line-height: ${fluidLineHeight.display.s};
`;

const Subtitle = styled(Text)`
  margin: 0;
  color: ${neutrals[500]};
  max-width: 980px;
  text-align: center;
  font-family: ${fontFamily.heading};
  font-size: ${fluidFontSize.heading.s};
  line-height: ${fluidLineHeight.heading.s};
`;

const Cards = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${spacing[800]}px;

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

const CardHeading = styled.h3<{ $color: string }>`
  margin: 0;
  color: ${(p) => p.$color};
  text-align: center;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fluidFontSize.heading.l};
  line-height: ${fluidLineHeight.heading.l};
`;

const CardBody = styled(Text)`
  margin: 0;
  color: ${neutrals[500]};
  text-align: center;
  font-family: ${fontFamily.heading};
  font-size: ${fluidFontSize.heading.s};
  line-height: ${fluidLineHeight.heading.s};
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

export function ProjectsBuildSection() {
  return (
    <Section>
      <Container>
        <Reveal>
          <>
            <Title>Build With Structural Intent</Title>
            <Subtitle as="p">
              If your product demands clarity between design vision and engineering execution,
              the next step should be deliberate—not improvised.
            </Subtitle>
          </>
        </Reveal>
        <Reveal delay={0.1}>
          <Cards>
          <Card $bg="#0D1816">
            <CardHeading $color={accents.primary}>
              Initiate a System-Level Collaboration
            </CardHeading>
            <CardBody as="p">
              For products requiring scalable UI governance, architectural consistency,
              and measurable performance improvements—let&apos;s define the foundation first.
            </CardBody>
            <CardFooter>
              <Button as="a" href="/#contact" $variant="secondary">
                Start a Project Discussion
              </Button>
            </CardFooter>
          </Card>
          <Card $bg="#1C0B27">
            <CardHeading $color={accents.secondary}>
              Analyze Case Studies
            </CardHeading>
            <CardBody as="p">
              Explore projects where interface systems, frontend architecture,
              accessibility integration, and performance refinement were developed under
              real production constraints.
            </CardBody>
            <CardFooter>
              <Button as="a" href="/projects/picsart" $variant="secondaryPink">
                View Random Case
              </Button>
            </CardFooter>
          </Card>
        </Cards>
        </Reveal>
      </Container>
    </Section>
  );
}
