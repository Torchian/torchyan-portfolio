'use client';

import styled from 'styled-components';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/primitives';
import { spacing } from '@/styles/tokens/spacing';
import { fontFamily, fontSize, fontWeight, lineHeight } from '@/styles/tokens/typography';
import { neutrals } from '@/styles/tokens/colors';

const Main = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${spacing[300]}px;
  min-height: 100svh;
  padding: 0 ${spacing[300]}px;
  text-align: center;
  color: ${neutrals[100]};

  h1 {
    margin: 0;
    font-family: ${fontFamily.display};
    font-weight: ${fontWeight.semibold};
    font-size: ${fontSize.display.s}px;
    line-height: ${lineHeight.display.s}px;
  }

  p {
    margin: 0;
    font-family: ${fontFamily.body};
    font-size: ${fontSize.body.l}px;
    line-height: ${lineHeight.body.l}px;
    color: ${neutrals[500]};
  }
`;

export default function LocaleNotFound() {
  const t = useTranslations('notFound');

  return (
    <Main id="main-content">
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
      <Button as={Link} href="/" $variant="primary">
        {t('home')}
      </Button>
    </Main>
  );
}
