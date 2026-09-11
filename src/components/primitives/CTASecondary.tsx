'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { fontFamily, fontWeight, fontSize, lineHeight, letterSpacing } from '@/styles/tokens/typography';
import { spacing } from '@/styles/tokens/spacing';
import { radius } from '@/styles/tokens/radius';
import { neutrals, accents } from '@/styles/tokens/colors';
import { glass } from '@/styles/tokens/effects';
import { border } from '@/styles/tokens/border';
import { duration, easing } from '@/styles/tokens/motion';

/**
 * Figma: CTA Secondary (2585:1296) — Default / Hover.
 *
 * Two layers, matching the design's own structure:
 *  - cta_background: a bordered "halo" pill that expands outward on hover
 *    (inset 0 → -22px/-24px).
 *  - cta_body: the pill itself, transparent by default, filling with the
 *    primary accent on hover.
 */
const Body = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing[100]}px;
  min-width: 140px;
  width: 196px;
  height: 100%;
  padding: ${spacing[150]}px ${spacing[500]}px;
  border-radius: ${radius.round}px;
  background: transparent;
  overflow: hidden;
  transition: background ${duration.normal} ${easing.out};

  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.heading.s}px;
  line-height: ${lineHeight.heading.s}px;
  letter-spacing: ${letterSpacing.xs}px;
  color: ${neutrals[100]};
  text-align: center;
  white-space: nowrap;
`;

const Root = styled(Link)`
  position: relative;
  isolation: isolate;
  display: inline-flex;
  align-items: stretch;
  justify-content: center;
  height: ${spacing[800]}px;
  text-decoration: none;

  /* cta_background */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border: ${border.medium}px solid ${glass.border};
    background: ${glass.bg};
    border-radius: ${radius.round}px;
    z-index: -1;
    transition: inset ${duration.normal} ${easing.out};
  }

  /**
   * Activates on its own hover, or whenever an ancestor marked with
   * [data-cta-trigger] is hovered. That lets a large surface (a project's
   * media, say) light up its CTA, instead of the hover state only being
   * reachable on the pill itself.
   */
  @media (hover: hover) and (pointer: fine) {
    &:hover::before,
    [data-cta-trigger]:hover &::before {
      /* 22px is intentionally off-scale here — it's the design's own value */
      inset: -22px -${spacing[300]}px;
    }

    &:hover ${Body},
    [data-cta-trigger]:hover & ${Body} {
      background: ${accents.primary};
    }
  }

  &:focus-visible {
    outline: none;

    &::before {
      inset: -22px -${spacing[300]}px;
    }

    ${Body} {
      background: ${accents.primary};
    }
  }
`;

export interface CTASecondaryProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function CTASecondary({ href, children, className }: CTASecondaryProps) {
  return (
    <Root href={href} className={className}>
      <Body>{children}</Body>
    </Root>
  );
}
