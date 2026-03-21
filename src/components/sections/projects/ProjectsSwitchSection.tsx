'use client';

import styled from 'styled-components';
import { Container, Reveal, Text } from '@/components/primitives';
import { spacing } from '@/styles/tokens/spacing';
import { fontFamily, fontWeight, fontSize, lineHeight, letterSpacing } from '@/styles/tokens/typography';
import { fluidFontSize, fluidLineHeight } from '@/styles/fluid';
import { accents, neutrals, glass } from '@/styles/tokens/colors';
import { radius } from '@/styles/tokens/radius';
import { media } from '@/styles/media';
import { SWITCH_MODE_CARDS } from './projectsPageConfig';
import { ProjectsEcosystemBlock } from './ProjectsEcosystemBlock';

const Section = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Content = styled(Container)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[800]}px;
`;

const Intro = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[300]}px;
  text-align: center;
  max-width: 900px;
`;

const Heading = styled.h2`
  margin: 0;
  text-align: center;
  color: ${neutrals[100]};
  font-family: ${fontFamily.display};
  font-weight: ${fontWeight.black};
  font-size: ${fluidFontSize.display.s};
  line-height: ${fluidLineHeight.display.s};
  text-transform: uppercase;
  letter-spacing: ${letterSpacing.xxs}px;
`;

const Subtitle = styled(Text)`
  margin: 0;
  text-align: center;
  color: ${neutrals[100]};
  font-family: ${fontFamily.body};
  font-weight: ${fontWeight.regular};
  font-size: ${fontSize.body.xl}px;
  line-height: ${lineHeight.body.xl}px;
`;

const Cards = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: ${spacing[600]}px;
  align-items: stretch;

  ${media.down('m')} {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  border-radius: ${radius.xxl}px;
  padding: ${spacing[500]}px;
  background: ${glass.borderSubtle};
  box-shadow: 0 ${spacing[50]}px ${spacing[100]}px ${glass.shadow};
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const CardTitle = styled.h3<{ $accent: 'green' | 'pink' }>`
  margin: 0 0 ${spacing[200]}px;
  color: ${(p) => (p.$accent === 'pink' ? accents.secondary : accents.primary)};
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fluidFontSize.heading.l};
  line-height: ${fluidLineHeight.heading.l};
  text-align: center;
`;

const CardBody = styled(Text)`
  margin: 0;
  flex: 1;
  color: ${neutrals[100]};
  font-family: ${fontFamily.body};
  font-size: ${fontSize.body.l}px;
  line-height: ${lineHeight.body.l}px;
  text-align: center;
`;

export function ProjectsSwitchSection() {
  return (
    <Section>
      <Content>
        <Reveal>
          <Intro>
            <Heading>Switch Perspective</Heading>
            <Subtitle as="p">
              Each project can be explored through multiple lenses:
            </Subtitle>
          </Intro>
        </Reveal>
        <Reveal delay={0.1}>
          <Cards>
            {SWITCH_MODE_CARDS.map((card) => (
              <Card key={card.title}>
                <CardTitle $accent={card.accent}>{card.title}</CardTitle>
                <CardBody as="p">{card.body}</CardBody>
              </Card>
            ))}
          </Cards>
        </Reveal>
        <Reveal delay={0.15}>
          <ProjectsEcosystemBlock />
        </Reveal>
      </Content>
    </Section>
  );
}
