'use client';

import { useRef, useState, useEffect, useLayoutEffect, useCallback, useId } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styled, { css } from 'styled-components';
import { zIndex } from '@/styles/tokens/z-index';
import { duration, easing } from '@/styles/tokens/motion';
import { spacing } from '@/styles/tokens/spacing';
import { fontSize, lineHeight, letterSpacing, fontWeight, fontFamily } from '@/styles/tokens/typography';
import { accents, neutrals } from '@/styles/tokens/colors';
import { glass, blur } from '@/styles/tokens/effects';
import { radius } from '@/styles/tokens/radius';
import { media, mediaQueries } from '@/styles/media';
import { Button } from '@/components/primitives';
import { border } from '@/styles/tokens/border';

/*
 * Figma: Header (2562:2761) — screens 1920 / 1440 / 1280 / 1024 / 768 / 480 / 320.
 *  - 1280 frame and up (from 1025px): logo · centred link pill (Header Navigation, 1944:4109) · Contact Me.
 *  - 480–1024 frames (321–1024px): logo · Contact Me · menu button (CTA, 2562:2297).
 *  - 320 frame (up to 320px): logo · menu button.
 * The link pill marks the current page green with a green glow above it; the
 * glow follows the pointer while hovering the pill.
 */

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Projects', href: '/projects' },
  { label: 'Case Studies', href: '/case-studies' },
  { label: 'About', href: '/about' },
];

const TRANSITION = `${duration.slowest} ${easing.spring}`;
const FAST = `${duration.normal} ${easing.out}`;

/** Index of the link for the current route; Home when nothing else matches. */
function activeIndexFor(pathname: string) {
  const index = NAV_LINKS.findIndex((l) => l.href !== '/' && pathname.startsWith(l.href));
  return index >= 0 ? index : 0;
}

const Header = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: ${zIndex.sticky};
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: ${spacing[1000]}px;
  padding: 0 ${spacing[400]}px;

  ${media.down('m')} {
    padding: 0 ${spacing[300]}px;
  }
`;

/** Figma Logo (2562:4479): 64px on desktop, 48px on tablet, 24px on mobile. */
const LogoLink = styled(Link)`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  text-decoration: none;

  svg {
    width: 64px;
    height: 64px;
  }

  ${media.down('xl')} {
    svg {
      width: 48px;
      height: 48px;
    }
  }

  ${media.down('m')} {
    svg {
      width: 24px;
      height: 24px;
    }
  }
`;

const NavCenter = styled.nav`
  position: absolute;
  top: 50%;
  left: 50%;
  display: none;
  align-items: center;
  gap: ${spacing[800]}px;
  height: ${spacing[600]}px;
  padding: ${spacing[100]}px ${spacing[400]}px;
  overflow: hidden;
  background: ${glass.shadow};
  border: ${border.medium}px solid ${glass.border};
  border-radius: ${radius.round}px;
  backdrop-filter: blur(${blur.glassMedium});
  -webkit-backdrop-filter: blur(${blur.glassMedium});
  transform: translate(-50%, -50%);

  ${media.up('xl')} {
    display: flex;
  }
`;

const LineContainer = styled.div`
  position: absolute;
  height: ${spacing[75]}px;
  left: 0;
  right: 0;
  top: 0;
  z-index: ${zIndex.base};
  pointer-events: none;
  overflow: visible;
`;

/** Active-link glow: a blurred green wedge under the pill's top edge, as wide as the link. */
const Line = styled.div`
  position: absolute;
  top: 0;
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
`;

const NavItem = styled(Link)<{ $active?: boolean }>`
  position: relative;
  z-index: 1;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.body.l}px;
  line-height: ${lineHeight.body.l}px;
  letter-spacing: ${letterSpacing.m}px;
  color: ${(p) => (p.$active ? accents.primary : neutrals[100])};
  text-decoration: none;
  white-space: nowrap;
  user-select: none;
  transition: color ${TRANSITION};

  ${media.hover} {
    &:hover {
      color: ${accents.primary};
    }
  }

  &:focus-visible {
    outline: 2px solid ${accents.primary};
    outline-offset: 4px;
    border-radius: 4px;
  }
`;

const ContactButton = styled.div`
  flex-shrink: 0;

  ${media.down('s')} {
    display: none;
  }
`;

/** Figma CTA (2562:2297): three green bars that fold into a grey cross when the menu is open. */
const MenuButton = styled.button<{ $open: boolean }>`
  position: relative;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: ${spacing[600]}px;
  height: ${spacing[600]}px;
  padding: ${spacing[100]}px;
  background: transparent;
  border: ${border.medium}px solid ${glass.border};
  border-radius: ${radius.round}px;
  overflow: hidden;
  cursor: pointer;

  span {
    position: absolute;
    left: 50%;
    width: 24px;
    height: 3px;
    margin-left: -12px;
    border-radius: 20px;
    background: ${(p) => (p.$open ? neutrals[500] : accents.primary)};
    transition:
      transform ${FAST},
      opacity ${FAST},
      background-color ${FAST};
  }

  /* Bars 8px apart in a 19px-tall stack, centred. */
  span:nth-child(1) {
    top: calc(50% - 9.5px);
    ${(p) => p.$open && 'transform: translateY(8px) rotate(45deg);'}
  }

  span:nth-child(2) {
    top: calc(50% - 1.5px);
    ${(p) => p.$open && 'opacity: 0;'}
  }

  span:nth-child(3) {
    top: calc(50% + 6.5px);
    ${(p) => p.$open && 'transform: translateY(-8px) rotate(-45deg);'}
  }

  &:focus-visible {
    outline: 2px solid ${accents.primary};
    outline-offset: 2px;
  }

  ${media.up('xl')} {
    display: none;
  }
`;

/*
 * Provisional: the menu panel isn't in the Figma file yet — a glass panel
 * under the header using the link pill's type and colours.
 */
const MenuPanel = styled.nav<{ $open: boolean }>`
  position: absolute;
  top: calc(100% - ${spacing[100]}px);
  left: ${spacing[400]}px;
  right: ${spacing[400]}px;
  display: flex;
  flex-direction: column;
  gap: ${spacing[100]}px;
  padding: ${spacing[300]}px ${spacing[400]}px;
  background: ${glass.bgMedium};
  border: ${border.medium}px solid ${glass.border};
  border-radius: ${radius.xxl}px;
  backdrop-filter: blur(${blur.glassLarge});
  -webkit-backdrop-filter: blur(${blur.glassLarge});
  transition:
    opacity ${FAST},
    transform ${FAST},
    visibility ${FAST};

  ${(p) =>
    p.$open
      ? css`
          opacity: 1;
          transform: none;
          visibility: visible;
        `
      : css`
          opacity: 0;
          transform: translateY(-${spacing[100]}px);
          visibility: hidden;
        `}

  ${media.down('m')} {
    left: ${spacing[300]}px;
    right: ${spacing[300]}px;
  }

  ${media.up('xl')} {
    display: none;
  }
`;

const MenuItem = styled(Link)<{ $active?: boolean }>`
  padding: ${spacing[150]}px 0;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.heading.s}px;
  line-height: ${lineHeight.heading.s}px;
  letter-spacing: ${letterSpacing.xs}px;
  color: ${(p) => (p.$active ? accents.primary : neutrals[100])};
  text-decoration: none;

  ${media.hover} {
    &:hover {
      color: ${accents.primary};
    }
  }

  &:focus-visible {
    outline: 2px solid ${accents.primary};
    outline-offset: 4px;
    border-radius: 4px;
  }
`;

export function NavBar() {
  const headerRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const menuId = useId();

  const pathname = usePathname();
  const activeIndex = activeIndexFor(pathname);
  const lineIndex = hoverIndex ?? activeIndex;

  // The menu remembers the page it was opened on, so navigating anywhere closes it without an effect.
  const [menuOpenOn, setMenuOpenOn] = useState<string | null>(null);
  const menuOpen = menuOpenOn === pathname;
  const closeMenu = useCallback(() => setMenuOpenOn(null), []);

  const applyLinePosition = useCallback((index: number) => {
    const nav = navRef.current;
    const link = linkRefs.current[index];
    if (!nav || !link) return;
    const navRect = nav.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    nav.style.setProperty('--nav-line-left', `${linkRect.left - navRect.left}px`);
    nav.style.setProperty('--nav-line-width', `${linkRect.width}px`);
    nav.style.setProperty('--nav-line-visible', linkRect.width > 0 ? '1' : '0');
  }, []);

  useLayoutEffect(() => {
    applyLinePosition(lineIndex);
  }, [lineIndex, applyLinePosition]);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    // Fonts loading or the pill appearing (1280 frame and up) changes the link boxes.
    const observer = new ResizeObserver(() => applyLinePosition(lineIndex));
    observer.observe(nav);
    return () => observer.disconnect();
  }, [lineIndex, applyLinePosition]);

  // While open: close on Escape, a press outside the header, or growing into the desktop layout.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };
    const onPointer = (e: PointerEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) closeMenu();
    };
    const desktop = window.matchMedia(mediaQueries.up('xl'));
    const onDesktop = () => {
      if (desktop.matches) closeMenu();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    desktop.addEventListener('change', onDesktop);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
      desktop.removeEventListener('change', onDesktop);
    };
  }, [menuOpen, closeMenu]);

  return (
    <Header ref={headerRef}>
      <LogoLink href="/" aria-label="Home">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M5.39297 14.2218C1.87677 19.4841 5.53299e-07 25.671 0 32V64H10.6667L10.6667 32C10.6667 27.7805 11.9168 23.6557 14.2611 20.1473C16.6053 16.6388 19.9373 13.9043 23.8357 12.2896C27.734 10.6748 32.0237 10.2524 36.1621 11.0755C40.3006 11.8987 44.102 13.9306 47.0857 16.9143C50.0694 19.898 52.1013 23.6994 52.9245 27.8379C53.7477 31.9763 53.3252 36.266 51.7104 40.1643C50.0957 44.0627 47.3612 47.3947 43.8527 49.7389C40.3443 52.0832 36.2195 53.3344 32 53.3344L21.3333 53.3333V64H32C38.329 64 44.5159 62.1232 49.7782 58.607C55.0406 55.0908 59.1421 50.0931 61.5641 44.2459C63.9861 38.3987 64.6198 31.9645 63.3851 25.7571C62.1504 19.5497 59.1027 13.8479 54.6274 9.3726C50.1521 4.89732 44.4503 1.84961 38.2429 0.614886C32.0355 -0.619842 25.6014 0.0138638 19.7541 2.43587C13.9069 4.85787 8.90918 8.95939 5.39297 14.2218Z" fill={neutrals[100]}/>
          <path d="M41.0874 23.7692C42.673 23.1124 44.305 22.5859 45.9674 22.1927C47.3255 24.1269 48.2734 26.3314 48.7387 28.6705C48.9862 29.9146 49.0929 31.1758 49.0612 32.431C47.732 32.7027 46.4285 33.1012 45.169 33.6229C42.5806 34.6951 40.2287 36.2666 38.2476 38.2476C36.2665 40.2287 34.6951 42.5806 33.6229 45.169C33.1012 46.4285 32.7027 47.732 32.431 49.0612L21.619 49.0667C21.9871 46.3311 22.7083 43.6486 23.7692 41.0875C25.3773 37.2051 27.7344 33.6774 30.7059 30.7059C33.6774 27.7345 37.205 25.3773 41.0874 23.7692Z" fill={neutrals[100]}/>
        </svg>
      </LogoLink>

      <NavCenter ref={navRef} aria-label="Main" onMouseLeave={() => setHoverIndex(null)}>
        <LineContainer aria-hidden>
          <Line />
        </LineContainer>
        {NAV_LINKS.map((link, i) => (
          <NavItem
            key={link.label}
            href={link.href}
            $active={i === activeIndex}
            aria-current={i === activeIndex ? 'page' : undefined}
            ref={(el) => {
              linkRefs.current[i] = el;
            }}
            onMouseEnter={() => setHoverIndex(i)}
          >
            {link.label}
          </NavItem>
        ))}
      </NavCenter>

      <ContactButton>
        <Button as={Link} href="/#contact" $variant="primary">
          Contact Me
        </Button>
      </ContactButton>

      <MenuButton
        type="button"
        $open={menuOpen}
        aria-expanded={menuOpen}
        aria-controls={menuId}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        onClick={() => setMenuOpenOn(menuOpen ? null : pathname)}
      >
        <span />
        <span />
        <span />
      </MenuButton>

      <MenuPanel id={menuId} $open={menuOpen} aria-label="Menu" inert={!menuOpen}>
        {NAV_LINKS.map((link, i) => (
          <MenuItem
            key={link.label}
            href={link.href}
            $active={i === activeIndex}
            aria-current={i === activeIndex ? 'page' : undefined}
            onClick={closeMenu}
          >
            {link.label}
          </MenuItem>
        ))}
        <MenuItem href="/#contact" onClick={closeMenu}>
          Contact Me
        </MenuItem>
      </MenuPanel>
    </Header>
  );
}
