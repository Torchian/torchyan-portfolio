'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { requestScrollFrame } from '@/lib/scroll-driver';
import { delay, internalDestination, jumpToStart, layoutSettled } from './page-settle';

/*
 * Moving between pages inside the site (a link, back/forward, a language
 * switch). The page's content — everything marked data-page-content — fades
 * out, leaving the background and the header; the view holds on the
 * background while the next page loads and settles; then that page, from its
 * top, fades in, its first section rising into place.
 *
 * A link waits for the fade before it navigates, so the old page is never seen
 * being replaced. Back and forward can't wait — the browser has already moved
 * — so there the content goes at once.
 *
 * The states are an attribute on <html>, styled in the global stylesheet:
 * data-page-transition="out" (fading out), "hold" (gone), "in" (coming in).
 */

/** The fade out, before a link navigates. */
const OUT_MS = 280;
/** The new page coming in (matches the global stylesheet's pageIn animation). */
const IN_MS = 650;
/**
 * Longest the view holds, once the new page is there, for its fonts, its
 * first-screen images and its height to settle. Short: a page that keeps
 * changing height (a carousel, a late image) would otherwise hold the blank
 * view for the whole of it — better a picture that finishes loading in view.
 */
const MAX_WAIT_MS = 1200;
/** Longest it waits for the new page at all (a slow fetch, a failed one). */
const NAV_TIMEOUT_MS = 5000;

type Stage = 'out' | 'hold' | 'in';

function setStage(stage: Stage | null) {
  const html = document.documentElement;
  if (stage) html.dataset.pageTransition = stage;
  else delete html.dataset.pageTransition;
}

interface Flight {
  /**
   * The path being moved away from. The move has arrived once the page on
   * screen is any other path — not one particular one: a link can redirect
   * (the old /projects/… URLs land on /work/…), and waiting for the address in
   * the link then held the blank view until the timeout.
   */
  from: string;
  hash: string;
  startedAt: number;
}

/**
 * The move in flight. Module state, not component state: a language switch
 * remounts the whole tree this lives in, and the new copy carries on with it.
 */
let flight: Flight | null = null;
let clearInTimer = 0;

/**
 * Read through a call, never as a bare variable: the React Compiler treats a
 * module variable read inside a component as fixed, and folded
 * `const current = flight` back into `flight` — so after `flight = null` the
 * reveal read `null.hash`, threw inside the promise, and the page stayed hidden.
 */
function currentFlight() {
  return flight;
}

export function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  /** Bumped whenever a move starts or gives up waiting, to re-run the wait below. */
  const [run, setRun] = useState(0);
  const shownPath = useRef(pathname);
  useEffect(() => {
    shownPath.current = pathname;
  }, [pathname]);

  // A language switch re-renders <html> and drops the attribute; put it back before paint.
  useLayoutEffect(() => {
    if (currentFlight()) setStage('hold');
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let navigateTimer = 0;

    const start = (to: URL, stage: Stage) => {
      window.clearTimeout(clearInTimer);
      flight = { from: shownPath.current, hash: to.hash, startedAt: performance.now() };
      setStage(stage);
      setRun((n) => n + 1);
    };

    const onClick = (event: MouseEvent) => {
      const to = internalDestination(event);
      if (!to) return;
      // Hold the link back (its own handlers, like closing the menu, still run)
      // and navigate once the content has gone.
      event.preventDefault();
      start(to, 'out');
      window.clearTimeout(navigateTimer);
      navigateTimer = window.setTimeout(
        () => router.push(to.pathname + to.search + to.hash, { scroll: false }),
        reduced ? 0 : OUT_MS,
      );
    };

    // Back and forward: the address has already changed when this fires; the page hasn't yet.
    // A step back or forward between #links on the page on screen isn't a page change.
    const onPopState = () => {
      if (window.location.pathname !== shownPath.current) start(new URL(window.location.href), 'hold');
    };

    /*
     * Every page opens at its top, back and forward included, so the browser
     * mustn't restore the old position itself: it did, as a smooth scroll under
     * the hidden content, and the page counted as still moving until the cap.
     * Back to "auto" as the document unloads, so a reload keeps its place.
     */
    history.scrollRestoration = 'manual';
    const onPageHide = () => {
      history.scrollRestoration = 'auto';
    };
    const onPageShow = () => {
      history.scrollRestoration = 'manual';
    };

    document.addEventListener('click', onClick, { capture: true });
    window.addEventListener('popstate', onPopState);
    window.addEventListener('pagehide', onPageHide);
    window.addEventListener('pageshow', onPageShow);
    return () => {
      document.removeEventListener('click', onClick, { capture: true });
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('pagehide', onPageHide);
      window.removeEventListener('pageshow', onPageShow);
      window.clearTimeout(navigateTimer);
      history.scrollRestoration = 'auto';
    };
  }, [router]);

  // Hold until the new page is rendered and settled, then bring it in from its top.
  useEffect(() => {
    const current = currentFlight();
    if (!current) return;
    if (current.from === pathname) {
      const timer = setTimeout(() => {
        current.from = '';
        setRun((n) => n + 1);
      }, NAV_TIMEOUT_MS);
      return () => clearTimeout(timer);
    }
    let cancelled = false;
    // To the top first, while nothing is shown: the images worth waiting for are the top's.
    jumpToStart(current.hash);
    let waited = false;
    Promise.race([layoutSettled(() => cancelled || waited), delay(MAX_WAIT_MS)])
      .then(() => {
        // Whichever won, stop the settle check's frame loop.
        waited = true;
      })
      // Never cut the fade out short.
      .then(() => delay(Math.max(0, OUT_MS - (performance.now() - current.startedAt))))
      .then(() => {
        if (cancelled || currentFlight() !== current) return;
        flight = null;
        jumpToStart(current.hash);
        // Have every scroll-driven effect measure the new layout before it's seen.
        requestScrollFrame();
        setStage('in');
        clearInTimer = window.setTimeout(() => setStage(null), IN_MS);
      });
    return () => {
      cancelled = true;
    };
  }, [pathname, run]);

  return null;
}
