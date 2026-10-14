'use client';

/*
 * Shared by PageLoader (a full document load) and PageTransition (a move to
 * another page inside the site): when a page counts as ready to be shown, how
 * to put it at its start, and which clicks are page changes.
 */

/** The layout counts as settled once the page height has held still this long. */
const STABLE_MS = 150;

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
export const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

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
export async function layoutSettled(stopped: () => boolean) {
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
export function jumpToStart(hash: string) {
  const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
  if (target) target.scrollIntoView({ behavior: 'instant' });
  else window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
}

/**
 * A click that will take the browser to another page of this site, handled
 * client-side: the destination, or null for anything else (a new tab, a
 * download, another site, a #link on this page).
 */
export function internalDestination(event: MouseEvent): URL | null {
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


