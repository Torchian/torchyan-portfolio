'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import styled, { keyframes } from 'styled-components';
import { useTranslations } from 'next-intl';
import { LogoMark, VisuallyHidden } from '@/components/primitives';
import { requestScrollFrame } from '@/lib/scroll-driver';
import { media } from '@/styles/media';
import { neutrals } from '@/styles/tokens/colors';
import { zIndex } from '@/styles/tokens/z-index';

/*
 * Covers the page while one loads: on a full document load, and on every move
 * to another page inside the site (a link, back/forward, a language switch).
 * Provisional design — not in Figma yet: the white logo over the hero's glows,
 * with a three-digit percentage under it.
 *
 * Why: several sections are drawn from values only the browser can measure —
 * the What I Do character reveals, Selected Work's magnification, the
 * Capabilities geometry. The server HTML shows them in their top-of-section
 * state, and a new page was seen scrolling to its top and filling in. Under the
 * cover the page settles, goes back to its top, and only then is uncovered.
 *
 * The overlay is part of the server HTML, so it's there from the first paint.
 * It lifts once the page has loaded, its fonts and first-screen images are in
 * and its height has held still — capped, so a slow network never leaves
 * anyone staring at it. The percentage creeps while the page loads and runs to
 * 100 once it has.
 */

/** Longest the loader waits for the page to settle, however slow the network. */
const MAX_WAIT_MS = 4000;
/** Longest a page change waits for its new page before the cover lifts anyway. */
const NAV_TIMEOUT_MS = 8000;
/** The layout counts as settled once the page height has held still this long. */
const STABLE_MS = 150;
/** Shortest time the loader is on screen for a page change, so the count can be seen. */
const MIN_SHOW_MS = 450;
/** The run from wherever the count is to 100, once the page is ready. */
const FINISH_MS = 320;
/** 100 holds this long before the overlay fades. */
const HOLD_MS = 120;
const FADE_MS = 350;
/** Without JavaScript nothing would lift the overlay, so CSS lifts it on its own after this. */
const FAILSAFE_S = 6;

/** While loading the count creeps towards this, never past it… */
const CREEP_MAX = 0.85;
/** …at this rate (ms to cover ~63% of the way). */
const CREEP_TAU_MS = 900;

const failsafe = keyframes`
  to {
    opacity: 0;
    visibility: hidden;
  }
`;

const breathe = keyframes`
  from {
    transform: rotate(0deg) scale(1);
  }
  to {
    transform: rotate(10deg) scale(1.12);
  }
`;

const Overlay = styled.div<{ $leaving: boolean }>`
  position: fixed;
  inset: 0;
  z-index: ${zIndex.modal};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 32px;
  overflow: hidden;
  background: ${neutrals[900]};
  color: ${neutrals[100]};
  opacity: ${(p) => (p.$leaving ? 0 : 1)};
  pointer-events: ${(p) => (p.$leaving ? 'none' : 'auto')};
  transition: opacity ${FADE_MS}ms ease-out;
  animation: ${failsafe} 0s linear ${FAILSAFE_S}s forwards;

  /* The hero's glows, slowly turning. */
  &::before {
    content: '';
    position: absolute;
    inset: -25%;
    background:
      radial-gradient(38% 34% at 26% 30%, rgba(138, 56, 245, 0.3), transparent 70%),
      radial-gradient(34% 30% at 76% 72%, rgba(198, 20, 230, 0.22), transparent 70%),
      radial-gradient(26% 26% at 50% 48%, rgba(12, 175, 10, 0.07), transparent 70%);
    animation: ${breathe} 9s ease-in-out infinite alternate;
    pointer-events: none;
  }

  &[data-hidden] {
    display: none;
    animation: none;
  }

  svg {
    position: relative;
    width: 128px;
    height: 128px;
  }

  ${media.reducedMotion} {
    &::before {
      animation: none;
    }
  }
`;

const Counter = styled.p`
  position: relative;
  display: flex;
  align-items: baseline;
  gap: 2px;
  margin: 0;
  color: ${neutrals[500]};
  font-weight: 600;
  font-size: 16px;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.24em;

  span:first-child {
    color: ${neutrals[100]};
  }
`;

type Phase = 'loading' | 'finishing' | 'leaving' | 'done';

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** The page's images that are in the first screen and still loading. */
function firstScreenImages() {
  return [...document.images].filter((img) => {
    if (img.complete) return false;
    const rect = img.getBoundingClientRect();
    return rect.width > 0 && rect.bottom > 0 && rect.top < window.innerHeight;
  });
}

/**
 * Resolves once the page has loaded, its fonts and first-screen images are in,
 * and both its height and the scroll position have stopped changing — on a
 * reload the browser keeps nudging the restored position while the page grows.
 */
async function layoutSettled(stopped: () => boolean) {
  if (document.readyState !== 'complete') {
    await new Promise<void>((resolve) => window.addEventListener('load', () => resolve(), { once: true }));
  }
  await document.fonts.ready;
  await Promise.all(
    firstScreenImages().map(
      (img) =>
        new Promise<void>((resolve) => {
          img.addEventListener('load', () => resolve(), { once: true });
          img.addEventListener('error', () => resolve(), { once: true });
        }),
    ),
  );

  let snapshot = '';
  let stableSince = 0;
  while (!stopped()) {
    await nextFrame();
    const now = performance.now();
    const current = `${document.documentElement.scrollHeight}:${Math.round(window.scrollY)}`;
    if (current !== snapshot) {
      snapshot = current;
      stableSince = now;
    } else if (now - stableSince >= STABLE_MS) {
      return;
    }
  }
}

/** Straight to the top (or to the link's #target), skipping the page's smooth scrolling. */
function jumpToStart(hash: string) {
  const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
  if (target) target.scrollIntoView({ behavior: 'instant' });
  else window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
}

/**
 * A click that will take the browser to another page of this site, handled
 * client-side: the destination, or null for anything else (a new tab, a
 * download, another site, a #link on this page).
 */
function internalDestination(event: MouseEvent): URL | null {
  if (event.defaultPrevented || event.button !== 0) return null;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null;
  const anchor = (event.target as Element | null)?.closest?.('a[href]');
  if (!(anchor instanceof HTMLAnchorElement)) return null;
  if (anchor.target && anchor.target !== '_self') return null;
  if (anchor.hasAttribute('download')) return null;
  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return null;
  if (url.pathname === window.location.pathname) return null;
  return url;
}


/**
 * Where a page change left off. A language switch replaces the whole tree this
 * loader lives in, so the new copy picks the fill up where the old one was.
 */
let carried: { fill: number; hash: string } | null = null;

export function PageLoader() {
  const t = useTranslations('common');
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>('loading');
  const countRef = useRef<HTMLSpanElement>(null);

  // Animation state, read by the frame loop; refs, so a frame never re-renders.
  const fill = useRef(carried?.fill ?? 0);
  const shownAt = useRef(0);
  const finishFrom = useRef<{ at: number; fill: number } | null>(null);
  const hash = useRef(carried?.hash ?? '');
  /** The page change in flight: the path it is going to. */
  const targetPath = useRef<string | null>(null);
  /** The path on screen, for the listeners below. */
  const shownPath = useRef(pathname);
  useEffect(() => {
    shownPath.current = pathname;
  }, [pathname]);
  /** Bumped to re-run the wait, for a page change that starts while one is already covered. */
  const [run, setRun] = useState(0);
  /** Whether this load is a page change, which starts at the top of the new page. */
  const toStart = useRef(carried !== null);

  // Count, every frame the overlay is up.
  const visible = phase !== 'done';
  useEffect(() => {
    if (!visible) return;
    if (!shownAt.current) shownAt.current = performance.now();
    let frame = 0;
    let shownCount = -1;
    const paint = (now: number) => {
      const finish = finishFrom.current;
      if (finish) {
        const k = Math.min(1, (now - finish.at) / FINISH_MS);
        fill.current = finish.fill + (1 - finish.fill) * (1 - (1 - k) ** 3);
      } else {
        const creep = CREEP_MAX * (1 - Math.exp(-(now - shownAt.current) / CREEP_TAU_MS));
        fill.current = Math.max(fill.current, creep);
      }
      const count = Math.round(fill.current * 100);
      if (count !== shownCount && countRef.current) {
        shownCount = count;
        countRef.current.textContent = String(count).padStart(3, '0');
      }
      frame = requestAnimationFrame(paint);
    };
    frame = requestAnimationFrame(paint);
    return () => cancelAnimationFrame(frame);
  }, [visible]);

  // Wait for the page under the cover, then run the fill to 100% and lift it.
  useEffect(() => {
    if (phase !== 'loading') return;
    // A page change: wait until the new page is the one rendered — or give up
    // waiting after a while (a link that redirected somewhere else, a failed
    // fetch), so the cover can never stay up for good.
    if (targetPath.current !== null && targetPath.current !== pathname) {
      const timer = setTimeout(() => {
        targetPath.current = null;
        setRun((n) => n + 1);
      }, NAV_TIMEOUT_MS);
      return () => clearTimeout(timer);
    }
    targetPath.current = null;
    let finished = false;
    const startedAt = performance.now();
    Promise.race([layoutSettled(() => finished), delay(MAX_WAIT_MS)])
      .then(() => delay(Math.max(0, MIN_SHOW_MS - (performance.now() - startedAt))))
      .then(() => {
        if (finished) return;
        finished = true;
        if (toStart.current) jumpToStart(hash.current);
        toStart.current = false;
        hash.current = '';
        // Have every scroll-driven effect measure the final layout before it's uncovered.
        requestScrollFrame();
        finishFrom.current = { at: performance.now(), fill: fill.current };
        setPhase('finishing');
      });
    return () => {
      finished = true;
    };
  }, [phase, pathname, run]);

  useEffect(() => {
    // Timers, not frames: a page opened in a background tab gets no frames.
    if (phase === 'finishing') {
      const timer = setTimeout(() => setPhase('leaving'), FINISH_MS + HOLD_MS);
      return () => clearTimeout(timer);
    }
    if (phase === 'leaving') {
      const timer = setTimeout(() => setPhase('done'), FADE_MS);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // Cover the page the moment a page change starts.
  useEffect(() => {
    const begin = (to: URL) => {
      targetPath.current = to.pathname;
      toStart.current = true;
      hash.current = to.hash;
      fill.current = 0;
      shownAt.current = performance.now();
      finishFrom.current = null;
      // Straight back to opaque, without a fade-in: the old page shouldn't be seen changing.
      setPhase('loading');
      setRun((n) => n + 1);
    };
    const onClick = (event: MouseEvent) => {
      const to = internalDestination(event);
      if (to) begin(to);
    };
    // Back and forward: the address has already changed when this fires; the page hasn't yet.
    // A step back or forward between #links on the page on screen isn't a page change.
    const onPopState = () => {
      if (window.location.pathname !== shownPath.current) begin(new URL(window.location.href));
    };
    document.addEventListener('click', onClick, { capture: true });
    window.addEventListener('popstate', onPopState);
    return () => {
      document.removeEventListener('click', onClick, { capture: true });
      window.removeEventListener('popstate', onPopState);
    };
  }, []);

  // The carried state is this copy's now; keep the fill's progress for the next one.
  useEffect(() => {
    carried = null;
    return () => {
      if (toStart.current) carried = { fill: fill.current, hash: hash.current };
    };
  }, []);

  return (
    <Overlay
      $leaving={phase === 'leaving'}
      role="status"
      aria-live="polite"
      data-page-loader
      data-hidden={phase === 'done' ? '' : undefined}
    >
      <LogoMark />
      <Counter aria-hidden>
        <span ref={countRef}>000</span>
        <span>%</span>
      </Counter>
      <VisuallyHidden>{t('loading')}</VisuallyHidden>
    </Overlay>
  );
}
