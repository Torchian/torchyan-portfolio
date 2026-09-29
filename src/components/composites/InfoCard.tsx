'use client';

import styled from 'styled-components';
import { spacing } from '@/styles/tokens/spacing';
import { fontFamily, fontWeight, fontSize, lineHeight, letterSpacing } from '@/styles/tokens/typography';
import { accents, neutrals, transparents } from '@/styles/tokens/colors';
import { radius } from '@/styles/tokens/radius';
import { media } from '@/styles/media';

/*
 * The glass info card: a green title over grey copy, centred on desktop and
 * reading from the left below it. Figma: cta_card in "Switch Perspective"
 * (Projects page, 3155:9825) and "System Blueprint & Visual Governance" (Case
 * Study, 3155:11130). Use it as an <li> in a list.
 */

/*
 * A phone takes these cards one step down the scale, the way the Capabilities
 * cards do: the title from Heading M to Heading S, the body from Body XL to
 * Body L. The frames were drawn at a width the phone does not have, and at
 * 390px the cards read as blown up rather than as themselves. Tablet and
 * desktop keep what Figma gave them.
 */
export const InfoCard = styled.li`
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[300]}px;
  min-width: 0;
  padding: ${spacing[400]}px ${spacing[500]}px;
  border-radius: ${radius.xxl}px;
  background: ${transparents.transparent4};
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  letter-spacing: ${letterSpacing.xs}px;
  text-align: center;

  /* Below desktop the cards read from the left. */
  ${media.down('xl')} {
    align-items: flex-start;
    gap: ${spacing[400]}px;
    padding: ${spacing[400]}px;
    text-align: left;
  }

  ${media.down('m')} {
    gap: ${spacing[200]}px;
    min-height: 160px;
    padding: ${spacing[200]}px ${spacing[250]}px;
  }
`;

export const InfoCardTitle = styled.h3`
  width: 100%;
  margin: 0;
  font-size: ${fontSize.heading.l}px;
  line-height: ${lineHeight.heading.l}px;
  color: ${accents.primary};

  ${media.down('m')} {
    font-weight: ${fontWeight.medium};
    font-size: ${fontSize.heading.s}px;
    line-height: ${lineHeight.heading.s}px;
  }
`;

export const InfoCardBody = styled.p`
  width: 100%;
  margin: 0;
  font-size: ${fontSize.heading.s}px;
  line-height: ${lineHeight.heading.s}px;
  color: ${neutrals[500]};

  ${media.down('m')} {
    font-size: ${fontSize.body.l}px;
    line-height: ${lineHeight.body.l}px;
    color: ${neutrals[100]};
  }
`;
