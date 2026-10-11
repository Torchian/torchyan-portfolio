'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import styled, { keyframes } from 'styled-components';
import { useTranslations } from 'next-intl';
import { VisuallyHidden } from '@/components/primitives';
import { requestScrollFrame } from '@/lib/scroll-driver';
import { accents, neutrals } from '@/styles/tokens/colors';
import { zIndex } from '@/styles/tokens/z-index';

/*
 * Covers the page while one loads: on a full document load, and on every move
 * to another page inside the site (a link, back/forward, a language switch).
 * Provisional design — not in Figma yet.
 *
 * Why: several sections are drawn from values only the browser can measure —
 * the What I Do character reveals, Selected Work's magnification, the
 * Capabilities geometry. The server HTML shows them in their top-of-section
 * state, and a new page was seen scrolling to its top and filling in. Under the
 * cover the page settles, goes back to its top, and only then is uncovered.
 *
 * The mark: the logo in white, half the screen's height, filling with green
 * from the foot of its stem, up and round the ring to its end, and last the
 * leaf inside it. The fill creeps while the page loads and runs to 100% once
 * it has.
 *
 * The overlay is part of the server HTML, so it's there from the first paint.
 * It lifts once the page has loaded, its fonts and first-screen images are in
 * and its height has held still — capped, so a slow network never leaves
 * anyone staring at it.
 */

/** Longest the loader stays up, however slow the network. */
const MAX_WAIT_MS = 4000;
/** The layout counts as settled once the page height has held still this long. */
const STABLE_MS = 150;
/** Longest a page change waits for its new page before the cover lifts anyway. */
const NAV_TIMEOUT_MS = 8000;
/** Shortest time the mark is on screen for a page change, so the fill can be seen. */
const MIN_SHOW_MS = 450;
/** The run from wherever the fill is to 100%, once the page is ready. */
const FINISH_MS = 320;
/** The full mark holds this long before the overlay fades. */
const HOLD_MS = 120;
const FADE_MS = 350;
/** Without JavaScript nothing would lift the overlay, so CSS lifts it on its own after this. */
const FAILSAFE_S = 6;

/** While loading the fill creeps towards this, never past it… */
const CREEP_MAX = 0.85;
/** …at this rate (ms to cover ~63% of the way). */
const CREEP_TAU_MS = 900;
/** The share of the fill that is the ring; the leaf takes the rest. */
const RING_SHARE = 0.86;

const failsafe = keyframes`
  to {
    opacity: 0;
    visibility: hidden;
  }
`;

const Overlay = styled.div<{ $leaving: boolean }>`
  position: fixed;
  inset: 0;
  z-index: ${zIndex.modal};
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${neutrals[900]};
  opacity: ${(p) => (p.$leaving ? 0 : 1)};
  pointer-events: ${(p) => (p.$leaving ? 'none' : 'auto')};
  transition: opacity ${FADE_MS}ms ease-out;
  animation: ${failsafe} 0s linear ${FAILSAFE_S}s forwards;

  &[data-hidden] {
    display: none;
    animation: none;
  }

  svg {
    /* Half the screen's height; on a phone held upright that is wider than the screen, so capped. */
    width: min(50vh, 80vw);
    height: min(50vh, 80vw);
  }
`;

/*
 * The logo's own two shapes (LogoMark, Figma 2562:4479): the ring, which is a
 * stem rising from the bottom-left into a circle that comes round to a foot at
 * the bottom, and the leaf inside it.
 */
const RING =
  'M5.39297 14.2218C1.87677 19.4841 5.53299e-07 25.671 0 32V64H10.6667L10.6667 32C10.6667 27.7805 11.9168 23.6557 14.2611 20.1473C16.6053 16.6388 19.9373 13.9043 23.8357 12.2896C27.734 10.6748 32.0237 10.2524 36.1621 11.0755C40.3006 11.8987 44.102 13.9306 47.0857 16.9143C50.0694 19.898 52.1013 23.6994 52.9245 27.8379C53.7477 31.9763 53.3252 36.266 51.7104 40.1643C50.0957 44.0627 47.3612 47.3947 43.8527 49.7389C40.3443 52.0832 36.2195 53.3344 32 53.3344L21.3333 53.3333V64H32C38.329 64 44.5159 62.1232 49.7782 58.607C55.0406 55.0908 59.1421 50.0931 61.5641 44.2459C63.9861 38.3987 64.6198 31.9645 63.3851 25.7571C62.1504 19.5497 59.1027 13.8479 54.6274 9.3726C50.1521 4.89732 44.4503 1.84961 38.2429 0.614886C32.0355 -0.619842 25.6014 0.0138638 19.7541 2.43587C13.9069 4.85787 8.90918 8.95939 5.39297 14.2218Z';
const LEAF =
  'M41.0874 23.7692C42.673 23.1124 44.305 22.5859 45.9674 22.1927C47.3255 24.1269 48.2734 26.3314 48.7387 28.6705C48.9862 29.9146 49.0929 31.1758 49.0612 32.431C47.732 32.7027 46.4285 33.1012 45.169 33.6229C42.5806 34.6951 40.2287 36.2666 38.2476 38.2476C36.2665 40.2287 34.6951 42.5806 33.6229 45.169C33.1012 46.4285 32.7027 47.732 32.431 49.0612L21.619 49.0667C21.9871 46.3311 22.7083 43.6486 23.7692 41.0875C25.3773 37.2051 27.7344 33.6774 30.7059 30.7059C33.6774 27.7345 37.205 25.3773 41.0874 23.7692Z';
/**
 * The ring's centre line, in the order the green travels: up the stem from its
 * foot, clockwise over the top and round to the bottom, then along the foot to
 * its end. Drawn as a wide stroke into a mask, it uncovers the ring as it grows.
 */
const RING_TRACK = 'M5.333 66V32A26.667 26.667 0 1 1 32 58.667H19';
/** The leaf's, from its bottom-left corner to its tip. */
const LEAF_TRACK = 'M20 52Q27 31 50 21';

/** The mark; its fill is set by the --ring and --leaf custom properties (0–1). */
function FillingMark() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <mask id="page-loader-ring" maskUnits="userSpaceOnUse" x="-2" y="-2" width="68" height="68">
          <path
            d={RING_TRACK}
            stroke="#fff"
            strokeWidth="12"
            pathLength={1}
            strokeDasharray="1 2"
            style={{ strokeDashoffset: 'calc(1 - var(--ring, 0))' }}
          />
        </mask>
        <mask id="page-loader-leaf" maskUnits="userSpaceOnUse" x="-2" y="-2" width="68" height="68">
          <path
            d={LEAF_TRACK}
            stroke="#fff"
            strokeWidth="22"
            pathLength={1}
            strokeDasharray="1 2"
            style={{ strokeDashoffset: 'calc(1 - var(--leaf, 0))' }}
          />
        </mask>
      </defs>
      <path d={RING} fill={neutrals[100]} />
      <path d={LEAF} fill={neutrals[100]} />
      <path d={RING} fill={accents.primary} mask="url(#page-loader-ring)" />
      <path d={LEAF} fill={accents.primary} mask="url(#page-loader-leaf)" />
    </svg>
  );
}

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
  const overlayRef = useRef<HTMLDivElement>(null);

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

  // Paint the fill, every frame the overlay is up.
  const visible = phase !== 'done';
  useEffect(() => {
    if (!visible) return;
    if (!shownAt.current) shownAt.current = performance.now();
    let frame = 0;
    const paint = (now: number) => {
      const finish = finishFrom.current;
      if (finish) {
        const k = Math.min(1, (now - finish.at) / FINISH_MS);
        fill.current = finish.fill + (1 - finish.fill) * (1 - (1 - k) ** 3);
      } else {
        const creep = CREEP_MAX * (1 - Math.exp(-(now - shownAt.current) / CREEP_TAU_MS));
        fill.current = Math.max(fill.current, creep);
      }
      const el = overlayRef.current;
      if (el) {
        el.style.setProperty('--ring', String(Math.min(1, fill.current / RING_SHARE)));
        el.style.setProperty('--leaf', String(Math.max(0, (fill.current - RING_SHARE) / (1 - RING_SHARE))));
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
      // Straight back to opaque, without the fade-in: the old page shouldn't be seen changing.
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
      ref={overlayRef}
      $leaving={phase === 'leaving'}
      role="status"
      aria-live="polite"
      data-page-loader
      data-hidden={phase === 'done' ? '' : undefined}
    >
      <FillingMark />
      <VisuallyHidden>{t('loading')}</VisuallyHidden>
    </Overlay>
  );
}
