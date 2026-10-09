'use client';

import styled from 'styled-components';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/primitives';
import { spacing } from '@/styles/tokens/spacing';
import { fontFamily, fontWeight, fontSize, lineHeight, letterSpacing } from '@/styles/tokens/typography';
import { neutrals } from '@/styles/tokens/colors';
import { media } from '@/styles/media';

/*
 * The platforms built on, as badges under a label. One list (`platforms` in
 * the messages), shown on the Work page's "Switch Perspective" and on Services,
 * so the two never drift apart.
 */

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[300]}px;
  width: 100%;
`;

const Label = styled.p`
  margin: 0;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.heading.s}px;
  line-height: ${lineHeight.heading.s}px;
  letter-spacing: ${letterSpacing.xs}px;
  text-align: center;
  color: ${neutrals[100]};

  /* A step down on a phone. */
  ${media.down('m')} {
    font-size: ${fontSize.body.xl}px;
    line-height: ${lineHeight.body.xl}px;
  }
`;

const List = styled.ul`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: ${spacing[300]}px;
  /* Two even rows on a wide screen, rather than one full row and a straggler. */
  max-width: 880px;
  margin: 0 auto;
  padding: 0;
  list-style: none;

  li {
    display: flex;
  }

  /* The badge steps down a size with the breakpoint (Large → Medium → Small). */
  ${media.down('xl')} {
    gap: ${spacing[200]}px;
    max-width: 680px;

    li > * {
      height: 24px;
      padding: ${spacing[50]}px ${spacing[200]}px;
      font-size: ${fontSize.body.l}px;
      line-height: ${lineHeight.body.l}px;
      letter-spacing: ${letterSpacing.m}px;
    }
  }

  ${media.down('m')} {
    gap: ${spacing[150]}px;

    li > * {
      height: 22px;
      padding: ${spacing[50]}px ${spacing[150]}px;
      font-size: ${fontSize.body.m}px;
      line-height: ${lineHeight.body.m}px;
      letter-spacing: ${letterSpacing.s}px;
    }
  }
`;

export function PlatformList() {
  const t = useTranslations('platforms');
  const items = t.raw('items') as string[];

  return (
    <Wrap>
      <Label>{t('label')}</Label>
      <List>
        {items.map((item) => (
          <li key={item}>
            <Badge $size="large">{item}</Badge>
          </li>
        ))}
      </List>
    </Wrap>
  );
}
