'use client';

import styled from 'styled-components';
import { CTACards } from '@/components/composites';
import { spacing } from '@/styles/tokens/spacing';
import {
  fontFamily,
  fontWeight,
  fontSize,
  lineHeight,
  letterSpacing,
} from '@/styles/tokens/typography';
import { neutrals } from '@/styles/tokens/colors';
import { grid } from '@/styles/tokens/grid';
import { media } from '@/styles/media';
import { useTranslations } from 'next-intl';

/*
 * Figma: Positioning / Role Definition — 1920 (2973:16266), 1024 (3984:13085),
 * 480 (3984:13117). Four centred paragraphs, the two closing cards, and a last
 * line about what I'm exploring now.
 */

const Section = styled.section`
  display: flex;
  justify-content: center;
  width: 100%;
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
    padding: 0 ${spacing[600]}px;
  }

  ${media.down('m')} {
    gap: ${spacing[600]}px;
    padding: 0 ${spacing[200]}px;
  }
`;

const Copy = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[400]}px;
  max-width: 1024px;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  /* Figma: 28/36 on every frame. */
  font-size: ${fontSize.heading.m}px;
  line-height: ${lineHeight.heading.m}px;
  letter-spacing: ${letterSpacing.xs}px;
  text-align: center;
  color: ${neutrals[500]};

  p {
    margin: 0;
  }

  ${media.down('xl')} {
    max-width: none;
  }

  ${media.down('m')} {
    gap: ${spacing[300]}px;
  }
`;

const Closing = styled.p`
  max-width: 1024px;
  margin: 0;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  /* Figma: 36/48 on every frame. */
  font-size: ${fontSize.heading.l}px;
  line-height: ${lineHeight.heading.l}px;
  letter-spacing: ${letterSpacing.xs}px;
  text-align: center;
  color: ${neutrals[700]};

  ${media.down('xl')} {
    max-width: none;
  }
`;

export function AboutPositioningSection() {
  const t = useTranslations('about.cta');
  const intro = t.raw('intro') as string[];

  return (
    <Section>
      <Container>
        <Copy>
          {intro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </Copy>
        <CTACards
          cards={[
            {
              tone: 'green',
              title: t('build.title'),
              body: t('build.body'),
              cta: t('build.cta'),
              href: '/#contact',
            },
            {
              tone: 'pink',
              title: t('practice.title'),
              body: t('practice.body'),
              cta: t('practice.cta'),
              href: '/projects',
            },
          ]}
        />
        <Closing>{t('bottomLine')}</Closing>
      </Container>
    </Section>
  );
}
