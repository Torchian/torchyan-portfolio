'use client';

import styled from 'styled-components';
import { CTACards, SectionHeading } from '@/components/composites';
import { spacing } from '@/styles/tokens/spacing';
import { grid } from '@/styles/tokens/grid';
import { media } from '@/styles/media';
import { useTranslations } from 'next-intl';

/*
 * Figma: Positioning / Role Definition — "Build With Structural Intent":
 * 1920 (3155:9848), 1440 (3753:11221), 1024 (3753:14742), 480 (3753:17769).
 * Two cards side by side, stacked on a phone, where the generous 160px page
 * margins close up to 48.
 */

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

export function CollaborationSection() {
  const t = useTranslations('projectsPage.collaboration');

  return (
    <Section>
      <Container>
        <SectionHeading size="medium" title={t('title')} subtitle={t('subtitle')} />
        <CTACards
          cards={[
            {
              tone: 'green',
              title: t('initiate.title'),
              body: t('initiate.body'),
              cta: t('initiate.cta'),
              href: '/#contact',
            },
            {
              tone: 'pink',
              title: t('analyze.title'),
              body: t('analyze.body'),
              cta: t('analyze.cta'),
              href: '/projects/picsart',
            },
          ]}
        />
      </Container>
    </Section>
  );
}
