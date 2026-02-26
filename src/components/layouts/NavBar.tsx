'use client';

import { useRef, useState, useEffect, useLayoutEffect, useCallback } from 'react';
import styled from 'styled-components';
import { zIndex } from '@/styles/tokens/z-index';
import { duration, easing } from '@/styles/tokens/motion';
import { spacing } from '@/styles/tokens/spacing';
import { fontSize, lineHeight, letterSpacing, fontWeight, fontFamily } from '@/styles/tokens/typography';
import { accents, neutrals, glass, blur } from '@/styles/tokens/colors';
import { radius } from '@/styles/tokens/radius';
import { media } from '@/styles/media';
import { Button } from '@/components/primitives';
import { border } from '@/styles/tokens/border';

const NAV_LINKS = [
  { label: 'Home', href: '#' },
  { label: 'Projects', href: '#work' },
  { label: 'Case Studies', href: '#capabilities' },
  { label: 'Playground', href: '#what-i-build' },
  { label: 'About Me', href: '#about' },
];

const TRANSITION = `${duration.normal} ${easing.spring}`;

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

const LogoLink = styled.a`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  text-decoration: none;
`;

const NavCenter = styled.nav`
  position: relative;
  display: flex;
  align-items: center;
  overflow: hidden;
  gap: ${spacing[800]}px;
  padding: ${spacing[100]}px ${spacing[400]}px;
  gap: ${spacing[800]}px;
  height: ${spacing[600]}px;
  background: ${glass.bg};
  border-radius: ${radius.round}px;
  background: ${glass.bg};
  border: ${border.medium}px solid ${glass.border};
  backdrop-filter: blur(${blur.sm});
  -webkit-backdrop-filter: blur(${blur.sm});

  ${media.down('l')} {
    gap: ${spacing[500]}px;
  }

  ${media.down('m')} {
    display: none;
  }
`;

const LineContainer = styled.div`
  position: absolute;
  height: ${spacing[75]}px;
  left: ${spacing[0]};
  right: ${spacing[0]};
  top: ${spacing[0]};
  z-index: ${zIndex.base};
  pointer-events: none;
  overflow: visible;
`;

const Line = styled.div`
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
`;

interface NavItemProps {
  $active?: boolean;
}

const NavItem = styled.a<NavItemProps>`
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
`;

const CTAWrapper = styled.div`
  flex-shrink: 0;

  ${media.down('m')} {
    display: none;
  }
`;

export function NavBar() {
  const navRef = useRef<HTMLElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const applyLinePosition = useCallback((index: number) => {
    const nav = navRef.current;
    const link = linkRefs.current[index];
    if (!nav || !link) return;

    const navRect = nav.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    const left = linkRect.left - navRect.left;
    const width = linkRect.width;

    nav.style.setProperty('--nav-line-left', `${left}px`);
    nav.style.setProperty('--nav-line-width', `${width}px`);
    nav.style.setProperty('--nav-line-visible', width > 0 ? '1' : '0');
  }, []);

  const displayIndex = hoverIndex ?? activeIndex;

  useLayoutEffect(() => {
    applyLinePosition(displayIndex);
  }, [displayIndex, applyLinePosition]);

  useEffect(() => {
    const handleResize = () => applyLinePosition(displayIndex);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [displayIndex, applyLinePosition]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY + 120;

      for (let i = NAV_LINKS.length - 1; i >= 0; i--) {
        const href = NAV_LINKS[i].href;
        if (href === '#') {
          if (scrollY < 200) {
            setActiveIndex(0);
            return;
          }
          continue;
        }
        const id = href.replace('#', '');
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollY) {
          setActiveIndex(i);
          return;
        }
      }
      setActiveIndex(0);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Header>
      <LogoLink href="#" aria-label="Home">
        <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5.39297 14.2218C1.87677 19.4841 5.53299e-07 25.671 0 32V64H10.6667L10.6667 32C10.6667 27.7805 11.9168 23.6557 14.2611 20.1473C16.6053 16.6388 19.9373 13.9043 23.8357 12.2896C27.734 10.6748 32.0237 10.2524 36.1621 11.0755C40.3006 11.8987 44.102 13.9306 47.0857 16.9143C50.0694 19.898 52.1013 23.6994 52.9245 27.8379C53.7477 31.9763 53.3252 36.266 51.7104 40.1643C50.0957 44.0627 47.3612 47.3947 43.8527 49.7389C40.3443 52.0832 36.2195 53.3344 32 53.3344L21.3333 53.3333V64H32C38.329 64 44.5159 62.1232 49.7782 58.607C55.0406 55.0908 59.1421 50.0931 61.5641 44.2459C63.9861 38.3987 64.6198 31.9645 63.3851 25.7571C62.1504 19.5497 59.1027 13.8479 54.6274 9.3726C50.1521 4.89732 44.4503 1.84961 38.2429 0.614886C32.0355 -0.619842 25.6014 0.0138638 19.7541 2.43587C13.9069 4.85787 8.90918 8.95939 5.39297 14.2218Z" fill="#C614E6"/>
          <path d="M41.0874 23.7692C42.673 23.1124 44.305 22.5859 45.9674 22.1927C47.3255 24.1269 48.2734 26.3314 48.7387 28.6705C48.9862 29.9146 49.0929 31.1758 49.0612 32.431C47.732 32.7027 46.4285 33.1012 45.169 33.6229C42.5806 34.6951 40.2287 36.2666 38.2476 38.2476C36.2665 40.2287 34.6951 42.5806 33.6229 45.169C33.1012 46.4285 32.7027 47.732 32.431 49.0612L21.619 49.0667C21.9871 46.3311 22.7083 43.6486 23.7692 41.0875C25.3773 37.2051 27.7344 33.6774 30.7059 30.7059C33.6774 27.7345 37.205 25.3773 41.0874 23.7692Z" fill="#C614E6"/>
        </svg>
      </LogoLink>

      <NavCenter
        ref={navRef}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <LineContainer>
        <Line />
        </LineContainer>
        {NAV_LINKS.map((link, i) => (
          <NavItem
            key={link.label}
            href={link.href}
            $active={activeIndex === i}
            ref={(el) => { linkRefs.current[i] = el; }}
            onClick={() => setActiveIndex(i)}
            onMouseEnter={() => setHoverIndex(i)}
          >
            {link.label}
          </NavItem>
        ))}
      </NavCenter>

      <CTAWrapper>
        <Button as="a" href="#contact" $variant="primary">
          Contact Me
        </Button>
      </CTAWrapper>
    </Header>
  );
}
