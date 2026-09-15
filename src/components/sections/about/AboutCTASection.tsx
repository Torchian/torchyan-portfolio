'use client';

import styled from 'styled-components';
import { Link } from '@/i18n/navigation';
import { Button, Container, Text } from '@/components/primitives';
import { spacing } from '@/styles/tokens/spacing';
import {
  fontFamily,
  fontWeight,
  fontSize,
  lineHeight,
} from '@/styles/tokens/typography';
import { accents, neutrals } from '@/styles/tokens/colors';
import { radius } from '@/styles/tokens/radius';
import { media } from '@/styles/media';
import { useTranslations } from 'next-intl';

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
  font-size: ${fontSize.heading.m}px;
  line-height: ${lineHeight.heading.m}px;
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
  font-size: ${fontSize.heading.l}px;
  line-height: ${lineHeight.heading.l}px;
  text-align: center;
  color: ${(p) => (p.$accent === 'green' ? accents.primary : accents.secondary)};
`;

const CardBody = styled(Text)`
  font-family: ${fontFamily.body};
  font-weight: ${fontWeight.medium};
  font-size: ${fontSize.heading.s}px;
  line-height: ${lineHeight.heading.s}px;
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
  font-size: ${fontSize.heading.l}px;
  line-height: ${lineHeight.heading.l}px;
  color: ${neutrals[500]};
  text-align: center;
`;

export function AboutCTASection() {
  const t = useTranslations('about.cta');
  const intro = t.raw('intro') as string[];

  return (
    <Section>
      <Inner>
        <Intro>
          {intro.map((paragraph) => (
            <IntroParagraph as="p" key={paragraph}>
              {paragraph}
            </IntroParagraph>
          ))}
        </Intro>

        <CardsRow>
          <Card $bg="green">
            <CardTitle as="h2" $accent="green">
              {t('build.title')}
            </CardTitle>
            <CardBody as="p">
              {t('build.body')}
            </CardBody>
            <CardFooter>
              <Button as={Link} href="#contact" $variant="secondary">
                {t('build.cta')}
              </Button>
            </CardFooter>
          </Card>

          <Card $bg="purple">
            <CardTitle as="h2" $accent="pink">
              {t('practice.title')}
            </CardTitle>
            <CardBody as="p">
              {t('practice.body')}
            </CardBody>
            <CardFooter>
              <Button as={Link} href="/projects" $variant="secondaryPink">
                {t('practice.cta')}
              </Button>
            </CardFooter>
          </Card>
        </CardsRow>

        <BottomLine as="p">
          {t('bottomLine')}
        </BottomLine>
      </Inner>
    </Section>
  );
}

