'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { zIndex } from '@/styles/tokens/z-index';
import { duration, easing } from '@/styles/tokens/motion';
import { spacing } from '@/styles/tokens/spacing';
import { fontWeight, letterSpacing, fontFamily } from '@/styles/tokens/typography';
import { fluidFontSize, fluidLineHeight } from '@/styles/fluid';
import { accents, neutrals, glass, blur } from '@/styles/tokens/colors';
import { radius } from '@/styles/tokens/radius';
import { media } from '@/styles/media';
import { Button } from '@/components/primitives';
import { border } from '@/styles/tokens/border';

const NAV_HEIGHT = spacing[1000];

/* ─── Hamburger ─── */

export const HamburgerButton = styled.button<{ $open: boolean }>`
  display: none;
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  justify-self: end;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  -webkit-tap-highlight-color: transparent;
  z-index: ${zIndex.tooltip};

  ${media.down('m')} {
    display: inline-flex;
  }
`;

export const HamburgerBar = styled.span<{ $open: boolean }>`
  display: block;
  position: relative;
  width: 24px;
  height: 2px;
  background: ${(p) => (p.$open ? 'transparent' : neutrals[100])};
  border-radius: 2px;
  transition: background ${duration.fast} ${easing.out};

  &::before,
  &::after {
    content: '';
    position: absolute;
    left: 0;
    width: 24px;
    height: 2px;
    background: ${neutrals[100]};
    border-radius: 2px;
    transition: transform ${duration.normal} ${easing.out};
  }

  &::before {
    top: ${(p) => (p.$open ? '0' : '-7px')};
    transform: ${(p) => (p.$open ? 'rotate(45deg)' : 'none')};
  }

  &::after {
    top: ${(p) => (p.$open ? '0' : '7px')};
    transform: ${(p) => (p.$open ? 'rotate(-45deg)' : 'none')};
  }
`;

/* ─── Drawer ─── */

const Overlay = styled.div<{ $open: boolean }>`
  position: fixed;
  inset: 0;
  z-index: ${zIndex.overlay};
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(${blur.glassSmall});
  -webkit-backdrop-filter: blur(${blur.glassSmall});
  opacity: ${(p) => (p.$open ? 1 : 0)};
  pointer-events: ${(p) => (p.$open ? 'auto' : 'none')};
  transition: opacity ${duration.normal} ${easing.out};
  display: none;

  ${media.down('m')} {
    display: block;
  }
`;

const DrawerNav = styled.nav<{ $open: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: ${zIndex.modal};
  width: min(320px, 85vw);
  background: ${neutrals[900]};
  border-left: ${border.medium}px solid ${glass.border};
  display: flex;
  flex-direction: column;
  padding: ${NAV_HEIGHT + spacing[400]}px ${spacing[400]}px ${spacing[400]}px;
  gap: ${spacing[100]}px;
  transform: translateX(${(p) => (p.$open ? '0' : '100%')});
  transition: transform ${duration.normal} ${easing.out};
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;

  ${media.up('m')} {
    display: none;
  }
`;

const DrawerLink = styled(Link)<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  padding: ${spacing[200]}px ${spacing[300]}px;
  border-radius: ${radius.l}px;
  font-family: ${fontFamily.body};
  font-weight: ${fontWeight.semibold};
  font-size: ${fluidFontSize.heading.s};
  line-height: ${fluidLineHeight.heading.s};
  letter-spacing: ${letterSpacing.m}px;
  color: ${(p) => (p.$active ? accents.primary : neutrals[100])};
  text-decoration: none;
  min-height: 44px;
  transition: background ${duration.fast} ${easing.out},
    color ${duration.fast} ${easing.out};

  &:active {
    background: ${glass.borderSubtle};
  }
`;

const DrawerCTA = styled.div`
  margin-top: auto;
  padding-top: ${spacing[400]}px;
`;

/* ─── Component ─── */

interface NavLinkItem {
  label: string;
  href: string;
}

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  pathname: string;
  links: NavLinkItem[];
}

export function MobileDrawer({ open, onClose, pathname, links }: MobileDrawerProps) {
  const drawerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', onKeyDown);
      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', onKeyDown);
      };
    }
    document.body.style.overflow = '';
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !drawerRef.current) return;

    const drawer = drawerRef.current;
    const focusable = drawer.querySelectorAll<HTMLElement>(
      'a[href], button, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    first.focus();

    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', trap);
    return () => document.removeEventListener('keydown', trap);
  }, [open]);

  return (
    <>
      <Overlay $open={open} onClick={onClose} />

      <DrawerNav
        ref={drawerRef}
        $open={open}
        aria-label="Mobile navigation"
        role="dialog"
        aria-modal="true"
      >
        {links.map((link) => (
          <DrawerLink
            key={link.label}
            href={link.href}
            $active={link.href === pathname || (link.href !== '/' && pathname.startsWith(link.href.split('#')[0]))}
            onClick={onClose}
          >
            {link.label}
          </DrawerLink>
        ))}
        <DrawerCTA>
          <Button
            as={Link}
            href="/#contact"
            $variant="secondary"
            onClick={onClose}
          >
            Contact Me
          </Button>
        </DrawerCTA>
      </DrawerNav>
    </>
  );
}
