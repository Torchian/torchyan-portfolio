import Link from 'next/link';
import styled from 'styled-components';
import { zIndex } from '@/styles/tokens/z-index';
import { duration, easing } from '@/styles/tokens/motion';
import { spacing } from '@/styles/tokens/spacing';
import { fontSize, lineHeight, letterSpacing, fontWeight, fontFamily } from '@/styles/tokens/typography';
import { accents, neutrals, glass, blur } from '@/styles/tokens/colors';
import { radius } from '@/styles/tokens/radius';
import { media } from '@/styles/media';
import { border } from '@/styles/tokens/border';

const TRANSITION = `${duration.slowest} ${easing.spring}`;
export const NAV_HEIGHT = spacing[1000];

export const Header = styled.header<{ $hidden: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: ${zIndex.toast};
  display: grid;
  grid-template-columns: auto 1fr auto 1fr auto;
  align-items: center;
  height: calc(${NAV_HEIGHT}px + env(safe-area-inset-top, 0px));
  padding: env(safe-area-inset-top, 0px) max(${spacing[400]}px, env(safe-area-inset-right, 0px)) 0 max(${spacing[400]}px, env(safe-area-inset-left, 0px));
  column-gap: ${spacing[200]}px;
  transform: translateY(${(p) => (p.$hidden ? '-100%' : '0')});
  transition: transform ${duration.normal} ${easing.out};

  ${media.up('l')} {
    grid-template-columns: 1fr auto 1fr;
    column-gap: ${spacing[300]};
  }

  ${media.down('l')} {
    padding:
      env(safe-area-inset-top, 0px)
      max(${spacing[300]}px, env(safe-area-inset-right, 0px))
      0
      max(${spacing[300]}px, env(safe-area-inset-left, 0px));
  }

  ${media.down('s')} {
    padding:
      env(safe-area-inset-top, 0px)
      max(${spacing[200]}px, env(safe-area-inset-right, 0px))
      0
      max(${spacing[200]}px, env(safe-area-inset-left, 0px));
    column-gap: ${spacing[100]}px;
  }

  ${media.reducedMotion} {
    transition: none;
  }
`;

export const LogoLink = styled(Link)`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  text-decoration: none;
  justify-self: start;
  grid-column: 1;

  svg {
    width: 56px;
    height: 56px;
  }

  ${media.down('l')} {
    svg {
      width: 52px;
      height: 52px;
    }
  }

  ${media.down('s')} {
    svg {
      width: 48px;
      height: 48px;
    }
  }

  &:focus-visible {
    outline: ${border.thick}px solid ${accents.primary};
    outline-offset: 2px;
    border-radius: ${radius.m}px;
  }
`;

export const NavCenter = styled.nav`
  position: relative;
  display: flex;
  align-items: center;
  overflow: hidden;
  gap: ${spacing[800]}px;
  padding: ${spacing[100]}px ${spacing[400]}px;
  height: ${spacing[600]}px;
  background: ${glass.shadow};
  border-radius: ${radius.round}px;
  border: ${border.medium}px solid ${glass.border};
  backdrop-filter: blur(${blur.glassMedium});
  -webkit-backdrop-filter: blur(${blur.glassMedium});

  ${media.down('l')} {
    gap: ${spacing[500]}px;
  }

  ${media.down('l')} {
    display: none;
  }
`;

export const LineContainer = styled.div`
  position: absolute;
  height: ${spacing[75]}px;
  left: ${spacing[0]};
  right: ${spacing[0]};
  top: ${spacing[0]};
  z-index: ${zIndex.base};
  pointer-events: none;
  overflow: visible;
`;

export const Line = styled.div`
  position: absolute;
  top: ${spacing[0]};
  height: ${spacing[75]}px;
  left: var(--nav-line-left, 0px);
  width: var(--nav-line-width, 0px);
  opacity: var(--nav-line-visible, 0);
  transition:
    left ${TRANSITION},
    width ${TRANSITION},
    filter ${TRANSITION},
    opacity ${TRANSITION};

  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: 50%;
    transform: translateX(-50%) scaleX(1.5);
    width: 0;
    height: 0;
    border-left: calc(var(--nav-line-width, 0px) / 2) solid transparent;
    border-right: calc(var(--nav-line-width, 0px) / 2) solid transparent;
    border-top: ${spacing[75]}px solid ${accents.primary};
    filter: blur(${blur.md});
    transition:
      filter ${TRANSITION},
      border ${TRANSITION};
  }

  ${media.reducedMotion} {
    transition: none;

    &::before {
      transition: none;
    }
  }
`;

export const NavItem = styled(Link)<{ $active?: boolean }>`
  position: relative;
  z-index: 1;
  font-family: ${fontFamily.body};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.body.l}px;
  line-height: ${lineHeight.body.l}px;
  letter-spacing: ${letterSpacing.m}px;
  color: ${(p) => (p.$active ? accents.primary : neutrals[100])};
  text-decoration: none;
  cursor: pointer;
  white-space: nowrap;
  transition: color ${TRANSITION};
  user-select: none;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      color: ${accents.primary};
    }
  }

  &:focus-visible {
    outline: ${border.thick}px solid ${accents.primary};
    outline-offset: 2px;
    border-radius: ${radius.s}px;
  }
`;

export const CTAWrapper = styled.div`
  flex-shrink: 0;
  grid-column: 3;
  justify-self: center;

  ${media.up('l')} {
    grid-column: auto;
    justify-self: end;
  }
`;
