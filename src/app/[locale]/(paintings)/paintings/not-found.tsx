'use client';

import { useTranslations } from 'next-intl';
import { ButtonLink, Container, Lead, SectionTitle } from '@/components/paintings/ui';

/** A painting address that doesn't exist, inside the paintings site's own frame. */
export default function PaintingsNotFound() {
  const t = useTranslations('paintings.notFound');
  return (
    <main id="main-content">
      <Container style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '96px 0 0' }}>
        <SectionTitle as="h1">{t('title')}</SectionTitle>
        <Lead>{t('text')}</Lead>
        <div>
          <ButtonLink href="/#gallery">{t('back')}</ButtonLink>
        </div>
      </Container>
    </main>
  );
}
