'use client';

import { useRef, useState, useEffect, useLayoutEffect, useCallback, useId } from 'react';
import { Link } from '@/i18n/navigation';
import { usePathname } from '@/i18n/navigation';
import styled, { css } from 'styled-components';
import { zIndex } from '@/styles/tokens/z-index';
import { duration, easing } from '@/styles/tokens/motion';
import { spacing } from '@/styles/tokens/spacing';
import {
  fontSize,
  lineHeight,
  letterSpacing,
  fontWeight,
  fontFamily,
} from '@/styles/tokens/typography';
import { accents, neutrals } from '@/styles/tokens/colors';
import { glass, blur } from '@/styles/tokens/effects';
import { radius } from '@/styles/tokens/radius';
import { media } from '@/styles/media';
import {
  Button,
  LanguageSwitcher,
  LogoMark,
  MusicToggle,
  SoundToggle,
} from '@/components/primitives';
import { useTranslations } from 'next-intl';
import { border } from '@/styles/tokens/border';

/*
 * Figma: Header (2562:2761) — screens 1920 / 1440 / 1280 / 1024 / 768 / 480 / 320.
 *  - 1280 frame and up: logo · centred link pill (Header Navigation, 1944:4109) · Contact Me.
 *    From 1060px rather than the frame's own 1025px — see DESKTOP_HEADER_QUERY.
 *  - 480–1024 frames (321–1059px): logo · Contact Me · menu button (CTA, 2562:2297).
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
  { key: 'about', href: '/about' },
] as const;

/**
 * Where the header switches between the 1280 frame's design (logo · centred link
 * pill · Contact Me) and the 1024 frame's (logo · Contact Me · menu button).
 *
 * The 1280 frame's own range starts at 1025px, but the pill is centred on the
 * viewport while Contact Me is right-aligned, so the two meet sooner the wider
 * the pill is — and the pill is as wide as its longest translation. Measured on
 * a production build: the Armenian pill is 454px against English's 386px, and
 * with the language switcher and audio flanks the cluster runs 7px into Contact
 * Me at 1025px, clearing at about 1043px. 1060 leaves the same 12px the cluster
 * puts between its own parts.
 *
 * Below it the 1024 frame's design takes over, where the language switcher and
 * the audio switches are rows in the menu panel, so nothing becomes unreachable.
 * The flanks are provisional (they are not in the Figma file yet, see TODO.md
 * §4); revisit this when their placement is designed, since it is their width
 * that sets the number.
 */
const DESKTOP_HEADER_QUERY = '(min-width: 1060px)';
const desktopHeader = `@media ${DESKTOP_HEADER_QUERY}`;
/** Below the desktop bar: the burger is out and the Contact pill is the bar's middle. */
const compactHeader = '@media (max-width: 1059.98px)';

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

/** The fixed bar's height, for anything that has to start below it. */
export const HEADER_HEIGHT = spacing[1000];

const Header = styled.header<{ $bare?: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: ${zIndex.sticky};
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: ${HEADER_HEIGHT}px;
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

  /* The About page opens on the character's own dark field and carries the
     year rail up to the logo, so the strip would only smudge both. */
  ${(p) =>
    p.$bare &&
    css`
      &::before {
        content: none;
      }
    `}

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
const LogoLink = styled(Link)<{ $accent?: boolean }>`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  text-decoration: none;
  /* The mark is drawn in currentColor, so the page picks its colour. */
  color: ${(p) => (p.$accent ? accents.primary : neutrals[100])};

  svg {
    width: 48px;
    height: 48px;
  }

  /*
   * One step up from the 24px the mobile frame gives it. At 24 the mark sat
   * against a 48px burger and a 48px-tall pill and read as an afterthought;
   * 32 is the next size in the same family and still well clear of both.
   */
  ${media.down('m')} {
    svg {
      width: 32px;
      height: 32px;
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

  ${desktopHeader} {
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
  position: relative;
  z-index: 1;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: ${spacing[150]}px;

  /*
   * Below the desktop bar it is the middle of the header, and it is centred on
   * the header rather than left to space-between. Between two items of
   * different widths, space-between puts what is between them off centre by
   * half the difference: the logo is 24px on a phone and the burger 48px, so
   * the pill sat exactly 12px left of centre (measured), while on a tablet,
   * where the logo is also 48px, it looked right. Positioned from the middle it
   * is centred whatever sits beside it — the same reason NavCluster is.
   */
  ${compactHeader} {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  ${media.down('s')} {
    display: none;
  }
`;

/** Figma CTA (2562:2297): three green bars that fold into a grey cross when the menu is open. */
const MenuButton = styled.button<{ $open: boolean }>`
  position: relative;
  z-index: 1;
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

  ${desktopHeader} {
    display: none;
  }
`;

/*
 * Provisional: the menu panel isn't in the Figma file yet — a glass panel
 * under the header using the link pill's type and colours.
 */
const MenuPanel = styled.nav<{ $open: boolean }>`
  /*
   * The whole screen, not a card under the bar. Fixed to the viewport with
   * 100dvh rather than 100vh: on a phone vh is the toolbar-hidden viewport, so
   * the last row would sit behind the toolbar. The panel is not scroll-linked,
   * so a height that follows the toolbar costs nothing here.
   *
   * It starts under the bar's own height, and the bar's contents are lifted
   * above it, so the logo, the Contact pill and the close cross stay readable
   * and tappable on top of the panel's glass.
   */
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  gap: ${spacing[100]}px;
  padding: calc(${spacing[1000]}px + ${spacing[300]}px) ${spacing[400]}px ${spacing[500]}px;
  overflow-y: auto;
  overscroll-behavior: contain;
  background: ${glass.bgMedium};
  backdrop-filter: blur(${blur.glassLarge});
  -webkit-backdrop-filter: blur(${blur.glassLarge});
  transition:
    opacity ${FAST},
    visibility ${FAST};

  ${(p) =>
    p.$open
      ? css`
          opacity: 1;
          visibility: visible;
        `
      : css`
          opacity: 0;
          visibility: hidden;
        `}

  ${media.down('m')} {
    padding-left: ${spacing[300]}px;
    padding-right: ${spacing[300]}px;
  }

  ${desktopHeader} {
    display: none;
  }
`;

/** The links take the room the panel now has; the settings sit at its foot. */
const MenuLinks = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${spacing[100]}px;
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
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuPanelRef = useRef<HTMLElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const menuId = useId();
  const t = useTranslations('nav');

  const pathname = usePathname();
  const activeIndex = activeIndexFor(pathname);
  /** The About page wears the header differently: green logo, no scrim. */
  const onAbout = pathname.startsWith('/about');
  const lineIndex = hoverIndex ?? activeIndex;

  // The menu remembers the page it was opened on, so navigating anywhere closes it without an effect.
  const [menuOpenOn, setMenuOpenOn] = useState<string | null>(null);
  const menuOpen = menuOpenOn === pathname;
  const closeMenu = useCallback(() => {
    // The panel goes `inert` as it closes, so focus left inside it would be
    // dropped on the spot and the next Tab would start again from the top of the
    // page. Hand it back to the button that opened it.
    if (menuPanelRef.current?.contains(document.activeElement)) menuButtonRef.current?.focus();
    setMenuOpenOn(null);
  }, []);
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

  /*
   * The panel covers the screen, so the page behind it must not scroll under
   * it: a swipe on the menu would otherwise move the page, and closing it would
   * leave the reader somewhere else. `overscroll-behavior: contain` on the
   * panel stops a scroll inside it reaching the page; this stops one that never
   * started inside it.
   */
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  // While open: close on Escape, a press outside the header, or growing into the desktop layout.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMenu();
        return;
      }
      if (e.key !== 'Tab') return;
      // The panel covers the page but the page behind it stays focusable, so Tab
      // past the last row used to land on content nobody can see. Keep the
      // gesture inside the button and the panel, wrapping at both ends.
      const panel = menuPanelRef.current;
      const button = menuButtonRef.current;
      if (!panel || !button) return;
      const stops = [
        button,
        ...panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ];
      const edge = e.shiftKey ? stops[0] : stops[stops.length - 1];
      if (document.activeElement !== edge) return;
      e.preventDefault();
      (e.shiftKey ? stops[stops.length - 1] : stops[0]).focus();
    };
    const onPointer = (e: PointerEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) closeMenu();
    };
    const desktop = window.matchMedia(DESKTOP_HEADER_QUERY);
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
    <Header ref={headerRef} $bare={onAbout}>
      <LogoLink href="/" aria-label={t('home')} $accent={onAbout}>
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
        ref={menuButtonRef}
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

      <MenuPanel
        ref={menuPanelRef}
        id={menuId}
        $open={menuOpen}
        aria-label={t('menuLabel')}
        inert={!menuOpen}
      >
        <MenuLinks>
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
        </MenuLinks>
        <MenuSetting>
          <span>{t('language')}</span>
          <LanguageSwitcher inline />
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
