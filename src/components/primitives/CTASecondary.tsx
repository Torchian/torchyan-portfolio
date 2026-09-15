'use client';

import { Link } from '@/i18n/navigation';
import styled, { css } from 'styled-components';
import { fontFamily, fontWeight, fontSize, lineHeight, letterSpacing } from '@/styles/tokens/typography';
import { spacing } from '@/styles/tokens/spacing';
import { radius } from '@/styles/tokens/radius';
import { neutrals, accents } from '@/styles/tokens/colors';
import { blur, glass } from '@/styles/tokens/effects';
import { border } from '@/styles/tokens/border';
import { duration, easing } from '@/styles/tokens/motion';
import { media } from '@/styles/media';
import type { BreakpointKey } from '@/styles/tokens/breakpoints';

/**
 * Figma: CTA Secondary (2585:1296) — Default, Smartbet / Picsart / Soulone, Hover, Hover Default.
 *
 * Two layers, matching the design's own structure:
 *  - cta_background: a glass "halo" pill that expands outward when active
 *    (inset 0 → -22px/-24px). A brand variant also paints its gradient into
 *    the resting pill, fading out as the halo opens.
 *  - cta_body: the pill itself, transparent at rest, filling with the primary
 *    accent when active.
 *
 * "Active" is its own hover or focus, a hover on an ancestor marked
 * [data-cta-trigger], or — with `activeBelow` — every screen at or below that
 * breakpoint, where there's no hover to reveal it.
 */
const HALO_INSET = `-22px -${spacing[300]}px`; /* 22px is the design's own value, off the spacing scale */
const TRANSITION = `${duration.normal} ${easing.out}`;

const Body = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing[100]}px;
  /* 196px is the design's width; longer labels (other languages, "View All Cases") grow instead of clipping. */
  min-width: 196px;
  height: 100%;
  padding: ${spacing[150]}px ${spacing[500]}px;
  border-radius: ${radius.round}px;
  background: transparent;
  overflow: hidden;
  transition: background ${TRANSITION};

  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.heading.s}px;
  line-height: ${lineHeight.heading.s}px;
  letter-spacing: ${letterSpacing.xs}px;
  color: ${neutrals[100]};
  text-align: center;
  white-space: nowrap;
`;

const activeLook = css`
  &::before {
    inset: ${HALO_INSET};
  }

  &::after {
    opacity: 0;
  }

  ${Body} {
    background: ${accents.primary};
  }
`;

const Root = styled(Link)<{ $fill?: string; $appearance: CTASecondaryAppearance; $activeBelow?: BreakpointKey }>`
  position: relative;
  isolation: isolate;
  display: inline-flex;
  align-items: stretch;
  justify-content: center;
  height: ${spacing[800]}px;
  text-decoration: none;

  /* cta_background: the halo */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border: ${border.medium}px solid ${glass.border};
    background: ${glass.bg};
    backdrop-filter: blur(${blur.glassMedium});
    -webkit-backdrop-filter: blur(${blur.glassMedium});
    border-radius: ${radius.round}px;
    z-index: -1;
    transition: inset ${TRANSITION};
  }

  /* cta_background's brand fill, at rest only (a gradient can't transition, its opacity can) */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border: ${border.medium}px solid ${glass.border};
    background: ${(p) => p.$fill ?? 'none'};
    border-radius: ${radius.round}px;
    z-index: -1;
    opacity: ${(p) => (p.$fill ? 1 : 0)};
    pointer-events: none;
    transition: opacity ${TRANSITION};
  }

  ${media.hover} {
    &:hover,
    [data-cta-trigger]:hover & {
      ${activeLook}
    }
  }

  &:focus-visible {
    outline: none;
    ${activeLook}
  }

  ${(p) =>
    p.$activeBelow &&
    css`
      ${media.down(p.$activeBelow)} {
        ${activeLook}
      }
    `}

  /* Hover Default: always active, on a solid dark halo (the "View All Cases" card). */
  ${(p) =>
    p.$appearance === 'dark' &&
    css`
      &::before {
        border: none;
        background: ${neutrals[900]};
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
      }

      ${activeLook}
    `}
`;

export type CTASecondaryAppearance = 'glass' | 'dark';

export interface CTASecondaryProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  /** Resting pill background, e.g. a brand gradient; it gives way to the halo when active. */
  fill?: string;
  /** `dark`: always active, on a solid dark halo. */
  appearance?: CTASecondaryAppearance;
  /** Show the active look on every screen at or below this breakpoint. */
  activeBelow?: BreakpointKey;
}

export function CTASecondary({
  href,
  children,
  className,
  fill,
  appearance = 'glass',
  activeBelow,
}: CTASecondaryProps) {
  return (
    <Root href={href} className={className} $fill={fill} $appearance={appearance} $activeBelow={activeBelow}>
      <Body>{children}</Body>
    </Root>
  );
}
