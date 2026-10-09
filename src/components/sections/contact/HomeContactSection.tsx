'use client';

import styled from 'styled-components';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/primitives';
import { SectionHeading } from '@/components/composites';
import { Link } from '@/i18n/navigation';
import { spacing } from '@/styles/tokens/spacing';
import { grid } from '@/styles/tokens/grid';
import { media } from '@/styles/media';
import { ContactChannels } from './ContactChannels';

/*
 * The homepage's close: the ring of contact channels from /contact, and the
 * way into the project form, which lives on /start-a-project.
 */

const Section = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  /* The channel ring's ripples spread past the circle: cut them at the screen's edge, not past it. */
  overflow-x: clip;
  padding: ${spacing[1000]}px 0 ${spacing[1500]}px;

  ${media.down('m')} {
    padding: ${spacing[600]}px 0 ${spacing[1000]}px;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[800]}px;
  width: 100%;
  max-width: ${grid.maxWidth}px;
  padding: 0 ${spacing[400]}px;

  ${media.down('xl')} {
    padding: 0 ${spacing[300]}px;
  }

  ${media.down('m')} {
    gap: ${spacing[600]}px;
    padding: 0 ${spacing[200]}px;
  }
`;

export function HomeContactSection() {
  const t = useTranslations('homeContact');

  return (
    <Section id="contact" aria-labelledby="home-contact-title">
      <Container>
        <SectionHeading id="home-contact-title" title={t('title')} subtitle={t('subtitle')} size="large" />
        <ContactChannels titleAs="h3" />
        <Button as={Link} href="/start-a-project" $variant="secondary" data-cta="home-contact">
          {t('cta')}
        </Button>
      </Container>
    </Section>
  );
}
