'use client';

import { Link } from '@/i18n/navigation';
import styled, { css } from 'styled-components';
import { Button } from '@/components/primitives';
import { SectionHeading } from '@/components/composites';
import { spacing } from '@/styles/tokens/spacing';
import { fontFamily, fontWeight, fontSize, lineHeight, letterSpacing } from '@/styles/tokens/typography';
import { accents, neutrals } from '@/styles/tokens/colors';
import { radius } from '@/styles/tokens/radius';
import { grid } from '@/styles/tokens/grid';
import { media } from '@/styles/media';
import { useTranslations } from 'next-intl';

/*
 * Figma: Positioning / Role Definition — "Build With Structural Intent":
 * 1920 (3155:9848), 1440 (3753:11221), 1024 (3753:14742), 480 (3753:17769).
 * Two cards side by side, stacked on a phone, where the generous 160px page
 * margins close up to 48.
 */

type Tone = 'green' | 'pink';

/** Card fills from the design (not tokens), as on the About page's CTA cards. */
const CARD_BACKGROUND: Record<Tone, string> = { green: '#0d1816', pink: '#1c0b27' };

const Section = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${spacing[1000]}px 0;
  /* The page's section gap, before the footer. */
  margin-bottom: ${spacing[1000]}px;

  /* The 1920 frame breathes twice as much as the rest. */
  ${media.up('xxxl')} {
    padding: ${spacing[2000]}px 0;
    margin-bottom: ${spacing[2000]}px;
  }

  ${media.down('m')} {
    padding: ${spacing[600]}px 0;
    margin-bottom: ${spacing[600]}px;
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

  ${media.up('xxxl')} {
    gap: ${spacing[2000]}px;
  }

  ${media.down('xl')} {
    gap: ${spacing[800]}px;
    padding: 0 ${spacing[300]}px;
  }

  ${media.down('m')} {
    gap: ${spacing[600]}px;
    padding: 0 ${spacing[200]}px;
  }
`;

const Cards = styled.div`
  display: flex;
  align-items: stretch;
  gap: ${spacing[800]}px;
  width: 100%;

  ${media.down('xl')} {
    gap: ${spacing[600]}px;
  }

  ${media.down('m')} {
    flex-direction: column;
  }
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

  ${media.down('m')} {
    font-weight: ${fontWeight.medium};
    font-size: ${fontSize.heading.m}px;
    line-height: ${lineHeight.heading.m}px;
  }
`;

const CardBody = styled.p`
  margin: 0;
  font-size: ${fontSize.heading.s}px;
  line-height: ${lineHeight.heading.s}px;
  color: ${neutrals[500]};

  ${media.down('m')} {
    font-size: ${fontSize.body.xl}px;
    line-height: ${lineHeight.body.xl}px;
    color: ${neutrals[100]};
  }
`;

/** The second card's CTA is a fixed 250px wide in the design. */
const FixedCta = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;

  && > a {
    width: 250px;
  }

  ${media.down('m')} {
    && > a {
      width: 100%;
      max-width: 250px;
    }
  }
`;

export function CollaborationSection() {
  const t = useTranslations('projectsPage.collaboration');

  return (
    <Section>
      <Container>
        <SectionHeading
          size="medium"
          title={t('title')}
          subtitle={t('subtitle')}
        />
        <Cards>
          <Card $tone="green">
            <CardText>
              <CardTitle $tone="green">{t('initiate.title')}</CardTitle>
              <CardBody>{t('initiate.body')}</CardBody>
            </CardText>
            <Button as={Link} href="/#contact" $variant="secondary">
              {t('initiate.cta')}
            </Button>
          </Card>

          <Card $tone="pink">
            <CardText>
              <CardTitle $tone="pink">{t('analyze.title')}</CardTitle>
              <CardBody>{t('analyze.body')}</CardBody>
            </CardText>
            <FixedCta>
              <Button as={Link} href="/projects/picsart" $variant="secondaryPink">
                {t('analyze.cta')}
              </Button>
            </FixedCta>
          </Card>
        </Cards>
      </Container>
    </Section>
  );
}
