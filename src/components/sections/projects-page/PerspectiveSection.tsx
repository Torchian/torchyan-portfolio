'use client';

import styled from 'styled-components';
import {
  InfoCard as Card,
  InfoCardBody as CardBody,
  InfoCardTitle as CardTitle,
  PlatformList,
  SectionHeading,
} from '@/components/composites';
import { spacing } from '@/styles/tokens/spacing';
import { grid } from '@/styles/tokens/grid';
import { media } from '@/styles/media';
import { useTranslations } from 'next-intl';

/*
 * Figma: Positioning / Role Definition — "Switch Perspective": 1920 (3155:9825),
 * 1440 (3753:11198), 1024 (3753:14719), 480 (3753:17746).
 *
 * Three cards in a row down to tablet, stacked on a phone. Their text is centred
 * on desktop and reads from the left below that, as the design has it.
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
  align-items: stretch;
  gap: ${spacing[600]}px;
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;

  ${media.down('xl')} {
    gap: ${spacing[300]}px;
  }

  ${media.down('m')} {
    flex-direction: column;
    gap: ${spacing[300]}px;
  }
`;

export function PerspectiveSection() {
  const t = useTranslations('projectsPage.perspective');
  const modes = t.raw('modes') as { title: string; body: string }[];

  return (
    <Section>
      <Container>
        <SectionHeading title={t('title')} subtitle={t('subtitle')} />
        <Cards>
          {modes.map((mode) => (
            <Card key={mode.title}>
              <CardTitle>{mode.title}</CardTitle>
              <CardBody>{mode.body}</CardBody>
            </Card>
          ))}
        </Cards>
        <PlatformList />
      </Container>
    </Section>
  );
}
