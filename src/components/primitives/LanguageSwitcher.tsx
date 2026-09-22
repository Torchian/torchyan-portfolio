'use client';

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import styled, { css } from 'styled-components';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { playSound } from '@/lib/sound';
import { LANGUAGE_LABELS, LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, routing, type Locale } from '@/i18n/routing';
import { glassSurface } from '@/styles/mixins';
import { media } from '@/styles/media';
import { accents, neutrals } from '@/styles/tokens/colors';
import { duration, easing } from '@/styles/tokens/motion';
import { radius } from '@/styles/tokens/radius';
import { spacing } from '@/styles/tokens/spacing';
import { fontFamily, fontSize, fontWeight, letterSpacing, lineHeight } from '@/styles/tokens/typography';
import { zIndex } from '@/styles/tokens/z-index';

/*
 * Figma: language_switcher (3690:10528), language_row (3690:10545), Flags (3690:10556).
 *  - Default: a 94 × 48 glass pill with the current language — its flag in grey, its label white.
 *  - Hover: the flag turns to colour and a glass list of the other languages opens 8px below,
 *    as wide as the pill. A click, a tap or the arrow keys open it too.
 *  - A row in the list: grey flag and white label; hovered, colour flag and green label.
 * The options are real links to the same page in each language: they work without
 * JavaScript and crawlers can follow them.
 */

const FAST = `${duration.fast} ${easing.out}`;
/** The list eases open and leaves a little quicker, so dismissing feels immediate. */
const OPEN = `${duration.normal} ${easing.out}`;
const CLOSE = `${duration.fast} ${easing.in}`;
/** Each row follows the panel, one after the other. */
const ROW_STAGGER_MS = 70;
/** How long the pointer can be off the switcher before the list closes, so a diagonal move to it doesn't. */
const HOVER_CLOSE_DELAY_MS = 150;
const FLAG_SRC: Record<Locale, string> = {
  en: '/flags/en.svg',
  ru: '/flags/ru.svg',
  hy: '/flags/hy.svg',
};

const rowText = css`
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.body.l}px;
  line-height: ${lineHeight.body.l}px;
  letter-spacing: ${letterSpacing.m}px;
  color: ${neutrals[100]};
  white-space: nowrap;
`;

/**
 * Figma's grey ("Neg") flags are the colour artwork luminosity-blended into the dark glass.
 * A real blend has nothing to blend with inside the glass's own layer, so it renders in full
 * colour; grayscale gives the same result over that colourless glass, and it animates.
 * One asset per language; the filter comes off when the flag is lit.
 */
const Flag = styled.img`
  flex-shrink: 0;
  width: 16px;
  height: 12px;
  filter: grayscale(1);
  transition: filter ${FAST};
`;

const Root = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const Trigger = styled.button`
  ${glassSurface}
  ${rowText}
  display: flex;
  align-items: center;
  gap: ${spacing[100]}px;
  width: 94px;
  height: ${spacing[600]}px;
  padding: ${spacing[150]}px ${spacing[250]}px;
  border-radius: ${radius.round}px;
  cursor: pointer;

  &[aria-expanded='true'] ${Flag} {
    filter: none;
  }

  &:focus-visible {
    outline: 2px solid ${accents.primary};
    outline-offset: 2px;
  }
`;

/*
 * Open and closed are both static rules keyed on data-open, not a
 * styled-components prop: a prop that flips generates its open-state class the
 * first time it's used, and injecting that stylesheet rule restyles the whole
 * page in the middle of the first opening — which is what made it stutter.
 */
const Options = styled.ul`
  ${glassSurface}
  position: absolute;
  top: calc(100% + ${spacing[100]}px);
  left: 0;
  z-index: ${zIndex.dropdown};
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${spacing[150]}px;
  width: 100%;
  margin: 0;
  padding: ${spacing[150]}px ${spacing[250]}px;
  list-style: none;
  border-radius: ${radius.xl}px;
  transform-origin: top center;
  transition:
    opacity ${CLOSE},
    transform ${CLOSE},
    visibility ${CLOSE};

  li {
    transition:
      opacity ${CLOSE},
      transform ${CLOSE};
  }

  /* Bridges the 8px gap to the pill, so the pointer never leaves the switcher on its way down. */
  &::before {
    content: '';
    position: absolute;
    right: 0;
    bottom: 100%;
    left: 0;
    height: ${spacing[100]}px;
  }

  &[data-open='true'] {
    opacity: 1;
    transform: none;
    visibility: visible;
    transition:
      opacity ${OPEN},
      transform ${OPEN},
      visibility ${OPEN};

    li {
      opacity: 1;
      transform: none;
      transition:
        opacity ${OPEN},
        transform ${OPEN};
    }

    li:nth-child(2) {
      transition-delay: ${ROW_STAGGER_MS}ms;
    }
  }

  &[data-open='false'] {
    opacity: 0;
    /* Lifted and slightly smaller: it grows out of the pill above it. */
    transform: translateY(-${spacing[150]}px) scale(0.96);
    visibility: hidden;

    li {
      opacity: 0;
      transform: translateY(-${spacing[100]}px);
    }
  }

  ${media.reducedMotion} {
    transform: none;
    transition:
      opacity ${FAST},
      visibility ${FAST};

    li {
      transform: none;
      transition: opacity ${FAST};
    }
  }
`;

const Option = styled(Link)`
  ${rowText}
  display: flex;
  align-items: center;
  gap: ${spacing[100]}px;
  text-decoration: none;
  transition: color ${FAST};

  ${media.hover} {
    &:hover {
      color: ${accents.primary};
    }

    &:hover ${Flag} {
      filter: none;
    }
  }

  &:focus-visible {
    color: ${accents.primary};
    outline: 2px solid ${accents.primary};
    outline-offset: 4px;
    border-radius: 4px;
  }

  &:focus-visible ${Flag} {
    filter: none;
  }
`;

/** The proxy reads this on unprefixed pages, so picking English also stops the redirect to /ru or /hy. */
function rememberLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;
}

export interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations('language');
  const tNames = useTranslations('language.names');
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [open, setOpen] = useState(false);
  // Mirrors `open` for the handlers that run outside render (timers, document listeners).
  const openRef = useRef(false);
  // Opened from the keyboard (arrow keys): move focus into the list, onto its first option.
  const [focusFirst, setFocusFirst] = useState(false);

  /** The one way the list opens or closes, so each move sounds exactly once. */
  const changeOpen = useCallback((next: boolean) => {
    if (openRef.current === next) return;
    openRef.current = next;
    playSound(next ? 'languageOpen' : 'languageClose');
    setOpen(next);
  }, []);

  // While open: a press anywhere outside closes the list.
  useEffect(() => {
    if (!open) return;
    const root = rootRef.current;
    const onPointerDown = (e: PointerEvent) => {
      if (root && !root.contains(e.target as Node)) changeOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open, changeOpen]);

  useEffect(() => {
    if (!open || !focusFirst) return;
    rootRef.current?.querySelector<HTMLAnchorElement>('a')?.focus();
  }, [open, focusFirst]);

  // Mouse only: a finger's "hover" is the tap, which the click handler already covers.
  const onPointerEnter = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return;
    clearTimeout(closeTimer.current);
    changeOpen(true);
  };

  const onPointerLeave = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return;
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => changeOpen(false), HOVER_CLOSE_DELAY_MS);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape' && open) {
      e.preventDefault();
      changeOpen(false);
      e.currentTarget.querySelector('button')?.focus();
      return;
    }
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    if (!open) {
      setFocusFirst(true);
      changeOpen(true);
      return;
    }
    const links = [...e.currentTarget.querySelectorAll<HTMLAnchorElement>('a')];
    const index = links.indexOf(document.activeElement as HTMLAnchorElement);
    const step = e.key === 'ArrowDown' ? 1 : -1;
    links[index < 0 ? 0 : (index + step + links.length) % links.length]?.focus();
  };

  // Tabbing out of the switcher closes it.
  const onBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) changeOpen(false);
  };

  return (
    <Root
      ref={rootRef}
      className={className}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <Trigger
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={t('label', { language: tNames(locale) })}
        onClick={() => {
          setFocusFirst(false);
          // Always a toggle, hovered or not: a click that can't dismiss the list feels stuck.
          changeOpen(!openRef.current);
        }}
      >
        <Flag src={FLAG_SRC[locale]} alt="" width={16} height={12} />
        <span lang={locale}>{LANGUAGE_LABELS[locale]}</span>
      </Trigger>
      <Options id={listId} data-open={open}>
        {/* Only the languages you can switch to; the current one is already on the pill. */}
        {routing.locales
          .filter((option) => option !== locale)
          .map((option) => (
            <li key={option}>
              <Option
                href={pathname}
                locale={option}
                lang={option}
                hrefLang={option}
                onClick={() => {
                  rememberLocale(option);
                  changeOpen(false);
                }}
              >
                <Flag src={FLAG_SRC[option]} alt="" width={16} height={12} />
                {LANGUAGE_LABELS[option]}
              </Option>
            </li>
          ))}
      </Options>
    </Root>
  );
}
