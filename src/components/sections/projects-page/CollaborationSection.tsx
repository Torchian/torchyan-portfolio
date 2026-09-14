'use client';

import Link from 'next/link';
import styled, { css } from 'styled-components';
import { Button } from '@/components/primitives';
import { SectionHeading } from '@/components/composites';
import { spacing } from '@/styles/tokens/spacing';
import { fontFamily, fontWeight, fontSize, lineHeight, letterSpacing } from '@/styles/tokens/typography';
import { accents, neutrals } from '@/styles/tokens/colors';
import { radius } from '@/styles/tokens/radius';
import { grid } from '@/styles/tokens/grid';

/* Figma: Positioning / Role Definition — "Build With Structural Intent" (3155:9848). Desktop only for now. */

type Tone = 'green' | 'pink';

/** Card fills from the design (not tokens), as on the About page's CTA cards. */
const CARD_BACKGROUND: Record<Tone, string> = { green: '#0d1816', pink: '#1c0b27' };

const Section = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${spacing[2000]}px 0;
  /* The page's section gap, before the footer. */
  margin-bottom: ${spacing[2000]}px;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[2000]}px;
  width: 100%;
  max-width: ${grid.maxWidth}px;
  padding: 0 ${spacing[400]}px;
`;

const Cards = styled.div`
  display: flex;
  align-items: stretch;
  gap: ${spacing[800]}px;
  width: 100%;
`;

const Card = styled.article<{ $tone: Tone }>`
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${spacing[800]}px;
  min-width: 0;
  padding: ${spacing[400]}px ${spacing[500]}px;
  border-radius: ${radius.xxl}px;
  background: ${(p) => CARD_BACKGROUND[p.$tone]};

  ${(p) =>
    p.$tone === 'green' &&
    css`
      box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
    `}
`;

const CardText = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${spacing[300]}px;
  width: 100%;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  letter-spacing: ${letterSpacing.xs}px;
  text-align: center;
`;

const CardTitle = styled.h3<{ $tone: Tone }>`
  margin: 0;
  font-size: ${fontSize.heading.l}px;
  line-height: ${lineHeight.heading.l}px;
  color: ${(p) => (p.$tone === 'green' ? accents.primary : accents.secondary)};
`;

const CardBody = styled.p`
  margin: 0;
  font-size: ${fontSize.heading.s}px;
  line-height: ${lineHeight.heading.s}px;
  color: ${neutrals[500]};
`;

/** The second card's CTA is a fixed 250px wide in the design. */
const FixedCta = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;

  && > a {
    width: 250px;
  }
`;

export function CollaborationSection() {
  return (
    <Section>
      <Container>
        <SectionHeading
          size="medium"
          title="Build With Structural Intent"
          subtitle="If your product demands clarity between design vision and engineering execution, the next step should be deliberate - not improvised."
        />
        <Cards>
          <Card $tone="green">
            <CardText>
              <CardTitle $tone="green">Initiate a System-Level Collaboration</CardTitle>
              <CardBody>
                For products requiring scalable UI governance, architectural consistency, and measurable performance
                improvements - let’s define the foundation before expanding the surface.
              </CardBody>
            </CardText>
            <Button as={Link} href="/#contact" $variant="secondary">
              Start a Project Discussion
            </Button>
          </Card>

          <Card $tone="pink">
            <CardText>
              <CardTitle $tone="pink">Analyze Case Studies</CardTitle>
              <CardBody>
                Explore projects where interface systems, frontend architecture, accessibility integration, and
                performance refinement were developed under real production constraints.
              </CardBody>
            </CardText>
            <FixedCta>
              <Button as={Link} href="/projects/picsart" $variant="secondaryPink">
                View Random Case
              </Button>
            </FixedCta>
          </Card>
        </Cards>
      </Container>
    </Section>
  );
}
