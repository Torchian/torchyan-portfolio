'use client';

import styled from 'styled-components';
import { Badge } from '@/components/primitives';
import { SectionHeading } from '@/components/composites';
import { spacing } from '@/styles/tokens/spacing';
import { fontFamily, fontWeight, fontSize, lineHeight, letterSpacing } from '@/styles/tokens/typography';
import { accents, neutrals, transparents } from '@/styles/tokens/colors';
import { radius } from '@/styles/tokens/radius';
import { grid } from '@/styles/tokens/grid';
import { useTranslations } from 'next-intl';

/* Figma: Positioning / Role Definition — "Switch Perspective" (3155:9825). Desktop only for now. */

const Section = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${spacing[1000]}px 0;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[1000]}px;
  width: 100%;
  max-width: ${grid.maxWidth}px;
  padding: 0 ${spacing[400]}px;
`;

const Cards = styled.ul`
  display: flex;
  align-items: stretch;
  gap: ${spacing[600]}px;
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
`;

const Card = styled.li`
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[300]}px;
  min-width: 0;
  padding: ${spacing[400]}px ${spacing[500]}px;
  border-radius: ${radius.xxl}px;
  background: ${transparents.transparent4};
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  letter-spacing: ${letterSpacing.xs}px;
  text-align: center;
`;

const CardTitle = styled.h3`
  width: 100%;
  margin: 0;
  font-size: ${fontSize.heading.l}px;
  line-height: ${lineHeight.heading.l}px;
  color: ${accents.primary};
`;

const CardBody = styled.p`
  width: 100%;
  margin: 0;
  font-size: ${fontSize.heading.s}px;
  line-height: ${lineHeight.heading.s}px;
  color: ${neutrals[500]};
`;

const Ecosystems = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[300]}px;
  width: 100%;
`;

const EcosystemsLabel = styled.p`
  margin: 0;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.heading.s}px;
  line-height: ${lineHeight.heading.s}px;
  letter-spacing: ${letterSpacing.xs}px;
  text-align: center;
  color: ${neutrals[100]};
`;

const EcosystemList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: ${spacing[300]}px;
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    display: flex;
  }
`;

export function PerspectiveSection() {
  const t = useTranslations('projectsPage.perspective');
  const modes = t.raw('modes') as { title: string; body: string }[];
  const ecosystems = t.raw('ecosystems') as string[];

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
        <Ecosystems>
          <EcosystemsLabel>{t('ecosystemsLabel')}</EcosystemsLabel>
          <EcosystemList>
            {ecosystems.map((item) => (
              <li key={item}>
                <Badge $size="large">{item}</Badge>
              </li>
            ))}
          </EcosystemList>
        </Ecosystems>
      </Container>
    </Section>
  );
}
