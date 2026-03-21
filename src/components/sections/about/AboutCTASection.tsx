'use client';

import styled from 'styled-components';
import Link from 'next/link';
import { Button, Container, Text } from '@/components/primitives';
import { spacing } from '@/styles/tokens/spacing';
import { fontFamily, fontWeight } from '@/styles/tokens/typography';
import { fluidFontSize, fluidLineHeight } from '@/styles/fluid';
import { accents, neutrals } from '@/styles/tokens/colors';
import { radius } from '@/styles/tokens/radius';
import { media } from '@/styles/media';

const Section = styled.section`
  padding: ${spacing[1000]}px 0;

  ${media.down('m')} {
    padding: ${spacing[800]}px 0;
  }
`;

const Inner = styled(Container)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[2000]}px;
`;

const Intro = styled.div`
  max-width: 960px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[300]}px;
`;

const IntroParagraph = styled(Text)`
  font-family: ${fontFamily.body};
  font-weight: ${fontWeight.regular};
  font-size: ${fluidFontSize.heading.m};
  line-height: ${fluidLineHeight.heading.m};
  color: ${neutrals[500]};
  text-align: center;
`;

const CardsRow = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${spacing[600]}px;

  ${media.down('m')} {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div<{ $bg: 'green' | 'purple' }>`
  background: ${(p) => (p.$bg === 'green' ? '#0D1816' : '#1C0B27')};
  border-radius: ${radius.xl}px;
  padding: ${spacing[400]}px ${spacing[500]}px;
  display: flex;
  flex-direction: column;
  gap: ${spacing[600]}px;
  color: ${neutrals[100]};

  ${media.down('m')} {
    padding: ${spacing[500]}px ${spacing[400]}px;
  }
`;

const CardTitle = styled(Text)<{ $accent: 'green' | 'pink' }>`
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fluidFontSize.heading.l};
  line-height: ${fluidLineHeight.heading.l};
  text-align: center;
  color: ${(p) => (p.$accent === 'green' ? accents.primary : accents.secondary)};
`;

const CardBody = styled(Text)`
  font-family: ${fontFamily.body};
  font-weight: ${fontWeight.medium};
  font-size: ${fluidFontSize.heading.s};
  line-height: ${fluidLineHeight.heading.s};
  text-align: center;
`;

const CardFooter = styled.div`
  margin-top: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

const BottomLine = styled(Text)`
  font-family: ${fontFamily.body};
  font-weight: ${fontWeight.medium};
  font-size: ${fluidFontSize.heading.l};
  line-height: ${fluidLineHeight.heading.l};
  color: ${neutrals[500]};
  text-align: center;
`;

export function AboutCTASection() {
  return (
    <Section>
      <Inner>
        <Intro>
          <IntroParagraph as="p">
            I stay relentlessly current - not by consuming trends, but by testing them in production.
          </IntroParagraph>
          <IntroParagraph as="p">
            Every day I work with modern design systems, evolving frontend architectures, and AI-driven creative tools that accelerate research, media generation, and development workflows.
          </IntroParagraph>
          <IntroParagraph as="p">
            From Figma ecosystems to code editors, performance tooling, and generative systems - I treat technology as a thinking partner, not just an instrument.
          </IntroParagraph>
          <IntroParagraph as="p">
            The result is simple: clarity in complexity, structure in chaos, and products that are ready for what’s next.
          </IntroParagraph>
        </Intro>

        <CardsRow>
          <Card $bg="green">
            <CardTitle as="h3" $accent="green">
              Let&apos;s Build Something That Scales
            </CardTitle>
            <CardBody as="p">
              If you&apos;re building a product that requires system thinking, precision,
              and long-term architectural clarity—let&apos;s talk.
            </CardBody>
            <CardFooter>
              <Button as={Link} href="#contact" $variant="secondary">
                Start a conversation
              </Button>
            </CardFooter>
          </Card>

          <Card $bg="purple">
            <CardTitle as="h3" $accent="pink">
              See How I Think in Practice
            </CardTitle>
            <CardBody as="p">
              Explore selected case studies, architecture decisions, and real-world
              implementations.
            </CardBody>
            <CardFooter>
              <Button as={Link} href="/projects" $variant="secondaryPink">
                View selected work
              </Button>
            </CardFooter>
          </Card>
        </CardsRow>

        <BottomLine as="p">
          Currently exploring advanced UI systems, AI-assisted workflows, and
          performance-first interfaces.
        </BottomLine>
      </Inner>
    </Section>
  );
}

