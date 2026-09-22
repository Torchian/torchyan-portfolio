'use client';

import { useRef, useState, useEffect, useLayoutEffect, useCallback, useId } from 'react';
import { Link } from '@/i18n/navigation';
import { usePathname } from '@/i18n/navigation';
import styled, { css } from 'styled-components';
import { zIndex } from '@/styles/tokens/z-index';
import { duration, easing } from '@/styles/tokens/motion';
import { spacing } from '@/styles/tokens/spacing';
import { fontSize, lineHeight, letterSpacing, fontWeight, fontFamily } from '@/styles/tokens/typography';
import { accents, neutrals } from '@/styles/tokens/colors';
import { glass, blur } from '@/styles/tokens/effects';
import { radius } from '@/styles/tokens/radius';
import { media, mediaQueries } from '@/styles/media';
import { Button, LanguageSwitcher, LogoMark, MusicToggle, SoundToggle } from '@/components/primitives';
import { useTranslations } from 'next-intl';
import { border } from '@/styles/tokens/border';

/*
 * Figma: Header (2562:2761) — screens 1920 / 1440 / 1280 / 1024 / 768 / 480 / 320.
 *  - 1280 frame and up (from 1025px): logo · centred link pill (Header Navigation, 1944:4109) · Contact Me.
 *  - 480–1024 frames (321–1024px): logo · Contact Me · menu button (CTA, 2562:2297).
 *  - 320 frame (up to 320px): logo · menu button.
 * The link pill marks the current page green with a green glow above it; the
 * glow follows the pointer while hovering the pill.
 * Language switcher, sound and music toggles (their placement is provisional, not in Figma yet):
 * flanking the link pill from 1025px — language on the left, the two audio switches on the right —
 * and rows at the bottom of the menu panel below that.
 */

const NAV_LINKS = [
  { key: 'home', href: '/' },
  { key: 'projects', href: '/projects' },
  { key: 'caseStudies', href: '/case-studies' },
  { key: 'about', href: '/about' },
] as const;

const TRANSITION = `${duration.slowest} ${easing.spring}`;
/** How long the pointer can be between links before the glow heads back to the current page's link. */
const LINE_RETURN_DELAY_MS = 120;
const FAST = `${duration.normal} ${easing.out}`;

/** Index of the link for the current route; Home when nothing else matches. */
function activeIndexFor(pathname: string) {
  const index = NAV_LINKS.findIndex((l) => l.href !== '/' && pathname.startsWith(l.href));
  return index >= 0 ? index : 0;
}

/** The header's side padding, which page content lines up with (e.g. the Projects rows' text). */
export const HEADER_INLINE = { base: spacing[400], mobile: spacing[300] } as const;

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
  padding: 0 ${HEADER_INLINE.base}px;

  /* Darkens and softens whatever scrolls under it, fading out towards the
     bottom. On a layer behind the contents rather than the header itself: a
     backdrop-filter on the header would make it the backdrop for every glass
     piece inside (the link pill, the language list hanging below it), and
     they'd stop blurring the page. */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    pointer-events: none;
    background: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0));
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }

  /* The controls on the bar sit on that already-blurred strip, so their own
     glass blur would re-blur a blur: invisible, but each one is another full
     backdrop pass on every scroll frame. They keep their tint; only the panels
     that hang below the bar over the page (the language list, the menu) blur. */
  & > * button,
  & > * a {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }

  ${media.down('m')} {
    padding: 0 ${HEADER_INLINE.mobile}px;
  }
`;

/** Figma Logo (2562:4479): 48px on desktop and tablet, 24px on mobile. */
const LogoLink = styled(Link)`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  text-decoration: none;

  svg {
    width: 48px;
    height: 48px;
  }

  ${media.down('m')} {
    svg {
      width: 24px;
      height: 24px;
    }
  }
`;

/**
 * Desktop (from 1025px): the language switcher, the link pill and the sound toggle as one
 * centred row. The side columns are equal, so the pill stays exactly centred even though the
 * switcher (94px) is wider than the toggle (48px).
 */
const NavCluster = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  display: none;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: ${spacing[150]}px;
  /* Its own content width: positioned from the middle, it would otherwise be squeezed into
     half the header and the link pill would shrink under its links. */
  width: max-content;
  transform: translate(-50%, -50%);

  > :first-child {
    justify-self: end;
  }

  > :last-child {
    justify-self: start;
  }

  ${media.up('xl')} {
    display: grid;
  }
`;

/** The two audio switches sit together at the right of the cluster. */
const AudioControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing[150]}px;
`;

const NavCenter = styled.nav`
  position: relative;
  display: flex;
  align-items: center;
  gap: ${spacing[800]}px;
  height: ${spacing[600]}px;
  padding: ${spacing[100]}px ${spacing[400]}px;
  overflow: hidden;
  background: ${glass.shadow};
  border-radius: ${radius.round}px;
  /* No backdrop blur: it sits on the header's blurred strip (see Header). */
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

/** Contact Me (not in the 320 frame). */
const HeaderActions = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: ${spacing[150]}px;

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

/* Provisional, like the panel: the language and sound settings under the links, behind one divider. */
const MenuSetting = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: ${spacing[100]}px;
  padding-top: ${spacing[200]}px;
  border-top: ${border.medium}px solid ${glass.border};

  & + & {
    margin-top: 0;
    padding-top: 0;
    border-top: none;
  }
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.heading.s}px;
  line-height: ${lineHeight.heading.s}px;
  letter-spacing: ${letterSpacing.xs}px;
  color: ${neutrals[100]};
`;

export function NavBar() {
  const headerRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const menuId = useId();
  const t = useTranslations('nav');

  const pathname = usePathname();
  const activeIndex = activeIndexFor(pathname);
  const lineIndex = hoverIndex ?? activeIndex;

  // The menu remembers the page it was opened on, so navigating anywhere closes it without an effect.
  const [menuOpenOn, setMenuOpenOn] = useState<string | null>(null);
  const menuOpen = menuOpenOn === pathname;
  const closeMenu = useCallback(() => setMenuOpenOn(null), []);
  const soundLabelId = useId();
  const musicLabelId = useId();

  const lineReturnTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // The glow slides to the hovered link, and back to the current page's link once the pointer is off
  // the links — in the gaps between them too, not only outside the pill. The short delay lets the
  // pointer cross from one link to the next without the glow bouncing home in between.
  // The hover sound is site-wide, on every link and button (src/lib/sound/triggers.ts).
  const enterLink = (index: number) => {
    clearTimeout(lineReturnTimer.current);
    setHoverIndex(index);
  };

  const leaveLink = () => {
    clearTimeout(lineReturnTimer.current);
    lineReturnTimer.current = setTimeout(() => setHoverIndex(null), LINE_RETURN_DELAY_MS);
  };

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
      <LogoLink href="/" aria-label={t('home')}>
        <LogoMark />
      </LogoLink>

      <NavCluster>
        <LanguageSwitcher />
        <NavCenter ref={navRef} aria-label={t('mainLabel')}>
          <LineContainer aria-hidden>
            <Line />
          </LineContainer>
          {NAV_LINKS.map((link, i) => (
            <NavItem
              key={link.key}
              href={link.href}
              $active={i === activeIndex}
              aria-current={i === activeIndex ? 'page' : undefined}
              ref={(el) => {
                linkRefs.current[i] = el;
              }}
              onMouseEnter={() => enterLink(i)}
              onMouseLeave={() => leaveLink()}
            >
              {t(link.key)}
            </NavItem>
          ))}
        </NavCenter>
        <AudioControls>
          <SoundToggle />
          <MusicToggle />
        </AudioControls>
      </NavCluster>

      <HeaderActions>
        <Button as={Link} href="/#contact" $variant="primary">
          {t('contactMe')}
        </Button>
      </HeaderActions>

      <MenuButton
        type="button"
        $open={menuOpen}
        aria-expanded={menuOpen}
        aria-controls={menuId}
        aria-label={menuOpen ? t('closeMenu') : t('openMenu')}
        onClick={() => setMenuOpenOn(menuOpen ? null : pathname)}
      >
        <span />
        <span />
        <span />
      </MenuButton>

      <MenuPanel id={menuId} $open={menuOpen} aria-label={t('menuLabel')} inert={!menuOpen}>
        {NAV_LINKS.map((link, i) => (
          <MenuItem
            key={link.key}
            href={link.href}
            $active={i === activeIndex}
            aria-current={i === activeIndex ? 'page' : undefined}
            onClick={closeMenu}
          >
            {t(link.key)}
          </MenuItem>
        ))}
        <MenuItem href="/#contact" onClick={closeMenu}>
          {t('contactMe')}
        </MenuItem>
        <MenuSetting>
          <span>{t('language')}</span>
          <LanguageSwitcher />
        </MenuSetting>
        <MenuSetting>
          <span id={soundLabelId}>{t('sound')}</span>
          <SoundToggle aria-labelledby={soundLabelId} />
        </MenuSetting>
        <MenuSetting>
          <span id={musicLabelId}>{t('music')}</span>
          <MusicToggle aria-labelledby={musicLabelId} />
        </MenuSetting>
      </MenuPanel>
    </Header>
  );
}
