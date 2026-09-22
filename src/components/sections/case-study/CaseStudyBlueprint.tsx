'use client';

import styled from 'styled-components';
import { InfoCard, InfoCardBody, InfoCardTitle, SectionHeading } from '@/components/composites';
import { spacing } from '@/styles/tokens/spacing';
import { grid } from '@/styles/tokens/grid';
import { media } from '@/styles/media';
import type { CaseStudyCopy } from './caseStudyConfig';

/*
 * Figma: System Blueprint & Visual Governance (3155:11130). The Projects page's
 * info cards, five of them: three to a row on desktop, a fixed 426.67 × 296 each
 * and centred, so the last row of two sits in the middle.
 */

const Section = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${spacing[1000]}px 0;

  ${media.down('m')} {
    padding: ${spacing[600]}px 0;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[1000]}px;
  width: 100%;
  max-width: ${grid.maxWidth}px;
  padding: 0 ${spacing[400]}px;

  ${media.down('xl')} {
    gap: ${spacing[800]}px;
    padding: 0 ${spacing[300]}px;
  }

  ${media.down('m')} {
    gap: ${spacing[600]}px;
    padding: 0 ${spacing[200]}px;
  }
`;

const Cards = styled.ul`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: ${spacing[300]}px;
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
`;

const Card = styled(InfoCard)`
  flex: 0 1 426.67px;
  min-height: 296px;

  ${media.down('xl')} {
    flex: 1 1 calc(50% - ${spacing[300] / 2}px);
    min-height: 0;
  }

  ${media.down('m')} {
    flex-basis: 100%;
  }
`;

export function CaseStudyBlueprint({ copy }: { copy: CaseStudyCopy['blueprint'] }) {
  return (
    <Section>
      <Container>
        <SectionHeading size="medium" title={copy.title} subtitle={copy.subtitle} />
        <Cards>
          {copy.cards.map((card) => (
            <Card key={card.title}>
              <InfoCardTitle>{card.title}</InfoCardTitle>
              <InfoCardBody>{card.body}</InfoCardBody>
            </Card>
          ))}
        </Cards>
      </Container>
    </Section>
  );
}
