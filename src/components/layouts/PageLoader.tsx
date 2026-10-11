'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import styled, { keyframes } from 'styled-components';
import { useTranslations } from 'next-intl';
import { VisuallyHidden } from '@/components/primitives';
import { requestScrollFrame } from '@/lib/scroll-driver';
import { media } from '@/styles/media';
import { accents, neutrals, palette } from '@/styles/tokens/colors';
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
 * The scene, in the site's own language: the hero's purple and pink glows and
 * its wireframe floor running to a horizon, two orbits (the Services circle's)
 * crossing in front of and behind the mark, and the mark itself — the logo,
 * white and extruded, half the screen's height. Green runs into it from the
 * foot of the stem, up and round the ring to its end, and last into the leaf,
 * led by a glowing head with a short tail; a counter below keeps pace. At 100%
 * the mark sends out a pulse, and the page opens through a widening circle
 * from its centre. On a page change the cover is there at once, and a ring
 * draws in on the spot that was clicked as the mark comes up.
 *
 * The overlay is part of the server HTML, so it's there from the first paint.
 * It lifts once the page has loaded, its fonts and first-screen images are in
 * and its height has held still — capped, so a slow network never leaves
 * anyone staring at it. Everything that moves for the whole visit is a
 * transform or opacity; the per-frame work is a few attributes on the mark.
 */

/** Longest the loader waits for the page to settle, however slow the network. */
const MAX_WAIT_MS = 4000;
/** Longest a page change waits for its new page before the cover lifts anyway. */
const NAV_TIMEOUT_MS = 8000;
/** The layout counts as settled once the page height has held still this long. */
const STABLE_MS = 150;
/** Shortest time the mark is on screen for a page change, so the fill can be seen. */
const MIN_SHOW_MS = 600;
/** The ring drawing in on a click, and the mark coming up. */
const ENTER_MS = 280;
/** The run from wherever the fill is to 100%, once the page is ready. */
const FINISH_MS = 380;
/** The full mark holds, pulsing, this long before the page opens. */
const HOLD_MS = 260;
/** The circle opening onto the page. */
const IRIS_MS = 720;
/** Without JavaScript nothing would lift the overlay, so CSS lifts it on its own after this. */
const FAILSAFE_S = 6;

/** While loading the fill creeps towards this, never past it… */
const CREEP_MAX = 0.85;
/** …at this rate (ms to cover ~63% of the way). */
const CREEP_TAU_MS = 900;
/** The share of the fill that is the ring; the leaf takes the rest. */
const RING_SHARE = 0.86;
/** How far behind the head each point of its tail runs, as a share of the track. */
const TAIL = [0.018, 0.036, 0.054] as const;

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

const drift = keyframes`
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(80px);
  }
`;

const spin = keyframes`
  from {
    transform: rotateX(var(--rx)) rotateY(var(--ry)) rotateZ(0deg);
  }
  to {
    transform: rotateX(var(--rx)) rotateY(var(--ry)) rotateZ(360deg);
  }
`;

const rise = keyframes`
  from {
    opacity: 0;
    transform: scale(0.82);
  }
`;

const pulse = keyframes`
  from {
    opacity: 0.9;
    transform: scale(0.7);
  }
  to {
    opacity: 0;
    transform: scale(1.9);
  }
`;

const Overlay = styled.div`
  --hole: 0px;
  --hx: 50%;
  --hy: 50%;
  --fill: 0;

  position: fixed;
  inset: 0;
  z-index: ${zIndex.modal};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: clamp(16px, 4vh, 40px);
  overflow: hidden;
  background: ${neutrals[900]};
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

  /* The page shows through a circle: closing in on a click, opening at the end. */
  &[data-iris] {
    mask-image: radial-gradient(circle at var(--hx) var(--hy), transparent var(--hole), #000 calc(var(--hole) + 1px));
  }

  &[data-phase='leaving'] {
    pointer-events: none;
  }

  &[data-hidden] {
    display: none;
    animation: none;
  }

  ${media.reducedMotion} {
    &::before {
      animation: none;
    }

    &[data-phase='leaving'] {
      opacity: 0;
      transition: opacity 300ms ease-out;
    }
  }
`;

/** The hero's wireframe floor, running towards the viewer under the mark. */
const Floor = styled.div`
  position: absolute;
  top: 60%;
  left: -50%;
  width: 200%;
  height: 70%;
  overflow: hidden;
  transform-origin: 50% 0;
  transform: perspective(520px) rotateX(74deg);
  mask-image: linear-gradient(to bottom, transparent, #000 30%, #000 60%, transparent);
  pointer-events: none;

  &::before {
    content: '';
    position: absolute;
    inset: -80px 0 0;
    background-image:
      linear-gradient(to bottom, rgba(12, 175, 10, 0.16) 1px, transparent 1px),
      linear-gradient(to right, rgba(12, 175, 10, 0.16) 1px, transparent 1px);
    background-size: 80px 80px;
    animation: ${drift} 2.4s linear infinite;
  }

  ${media.reducedMotion} {
    &::before {
      animation: none;
    }
  }
`;

const Stage = styled.div`
  /* Half the screen's height; on a phone held upright that is wider than the screen, so capped. */
  --size: min(50vh, 72vw);

  position: relative;
  width: var(--size);
  height: var(--size);
  perspective: 1100px;
  transform-style: preserve-3d;
  transition:
    transform ${IRIS_MS * 0.7}ms cubic-bezier(0.5, 0, 0.2, 1),
    opacity ${IRIS_MS * 0.5}ms ease-in;

  [data-entering] & {
    animation: ${rise} ${ENTER_MS + 120}ms cubic-bezier(0.2, 0.7, 0.2, 1) both;
  }

  [data-phase='leaving'] & {
    opacity: 0;
    transform: scale(1.18);
  }

  ${media.reducedMotion} {
    [data-entering] & {
      animation: none;
    }
  }

  svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
    transform: translateZ(0);
  }
`;

/** A soft light behind the mark that gathers as it fills, and flares green when it's full. */
const Halo = styled.div`
  position: absolute;
  inset: -35%;
  border-radius: 50%;
  background: radial-gradient(closest-side, rgba(138, 56, 245, 0.45), rgba(198, 20, 230, 0.12) 55%, transparent);
  opacity: calc(0.35 + var(--fill) * 0.65);
  transform: translateZ(-60px) scale(calc(0.85 + var(--fill) * 0.15));
  pointer-events: none;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: radial-gradient(closest-side, rgba(12, 175, 10, 0.5), rgba(12, 175, 10, 0.1) 55%, transparent);
    opacity: 0;
    transition: opacity 260ms ease-out;
  }

  [data-phase='finishing'] &::after,
  [data-phase='leaving'] &::after {
    opacity: 1;
  }
`;

const Orbit = styled.div<{ $rx: number; $ry: number; $seconds: number; $dot: string; $reverse?: boolean }>`
  --rx: ${(p) => p.$rx}deg;
  --ry: ${(p) => p.$ry}deg;

  position: absolute;
  inset: -17%;
  border: 1px solid rgba(246, 246, 246, 0.24);
  box-shadow: 0 0 18px rgba(138, 56, 245, 0.25);
  border-radius: 50%;
  transform: rotateX(var(--rx)) rotateY(var(--ry));
  animation: ${spin} ${(p) => p.$seconds}s linear infinite ${(p) => (p.$reverse ? 'reverse' : 'normal')};
  pointer-events: none;

  /* A moon on the orbit. */
  &::after {
    content: '';
    position: absolute;
    top: -5px;
    left: calc(50% - 5px);
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${(p) => p.$dot};
    box-shadow: 0 0 16px 4px ${(p) => p.$dot};
  }

  ${media.reducedMotion} {
    animation: none;
  }
`;

/** Rings sent out by the mark at 100%. */
const Pulse = styled.div<{ $delay: number }>`
  position: absolute;
  inset: 0;
  border: 2px solid ${accents.primary};
  border-radius: 50%;
  box-shadow:
    0 0 24px rgba(12, 175, 10, 0.6),
    inset 0 0 24px rgba(12, 175, 10, 0.35);
  opacity: 0;
  pointer-events: none;

  [data-phase='finishing'] &,
  [data-phase='leaving'] & {
    animation: ${pulse} 900ms cubic-bezier(0.2, 0.6, 0.3, 1) ${(p) => FINISH_MS * 0.75 + p.$delay}ms both;
  }

  ${media.reducedMotion} {
    display: none;
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
  font-size: clamp(14px, 1.6vh, 18px);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.24em;
  transition: opacity 240ms ease-in;

  span:first-child {
    color: ${neutrals[100]};
  }

  [data-phase='leaving'] & {
    opacity: 0;
  }
`;

/** The circle's edge, a green ring riding it as it closes and opens. */
const IrisEdge = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  z-index: ${zIndex.modal};
  width: 200px;
  height: 200px;
  margin: -100px 0 0 -100px;
  border: 1.5px solid ${accents.primary};
  border-radius: 50%;
  box-shadow:
    0 0 30px rgba(12, 175, 10, 0.55),
    inset 0 0 30px rgba(12, 175, 10, 0.25);
  opacity: 0;
  pointer-events: none;
  will-change: transform, opacity;
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
/** The two tracks the glowing head follows: the ring's centre line, then the leaf's. */
const HEAD_RING = 'M5.333 64V32A26.667 26.667 0 1 1 32 58.667H21.5';
const HEAD_LEAF = 'M24 47Q30 32 47 25';

/** Layers under the mark, each a little further down and right: it reads as a solid object. */
const EXTRUDE = [
  { dx: 0.5, dy: 0.7, fill: '#3a2f5c' },
  { dx: 1, dy: 1.4, fill: '#2a2145' },
  { dx: 1.5, dy: 2.1, fill: '#1c1631' },
] as const;

interface MarkRefs {
  ringTrack: React.RefObject<SVGPathElement | null>;
  leafTrack: React.RefObject<SVGPathElement | null>;
  head: React.RefObject<SVGGElement | null>;
}

/** The mark; its fill is set by the --ring and --leaf custom properties (0–1). */
function FillingMark({ ringTrack, leafTrack, head }: MarkRefs) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <g id="page-loader-logo">
          <path d={RING} />
          <path d={LEAF} />
        </g>
        <linearGradient id="page-loader-white" x1="8" y1="2" x2="58" y2="62" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.55" stopColor={neutrals[100]} />
          <stop offset="1" stopColor="#c9c4dc" />
        </linearGradient>
        <linearGradient id="page-loader-green" x1="0" y1="64" x2="64" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#068f04" />
          <stop offset="0.5" stopColor={accents.primary} />
          <stop offset="1" stopColor="#4dff4a" />
        </linearGradient>
        <radialGradient id="page-loader-glow">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.25" stopColor="#b6ffb4" />
          <stop offset="0.55" stopColor={accents.primary} stopOpacity="0.55" />
          <stop offset="1" stopColor={accents.primary} stopOpacity="0" />
        </radialGradient>
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

      {EXTRUDE.map(({ dx, dy, fill }) => (
        <use key={dx} href="#page-loader-logo" fill={fill} transform={`translate(${dx} ${dy})`} />
      ))}
      <use href="#page-loader-logo" fill="url(#page-loader-white)" />
      <path d={RING} fill="url(#page-loader-green)" mask="url(#page-loader-ring)" />
      <path d={LEAF} fill="url(#page-loader-green)" mask="url(#page-loader-leaf)" />

      {/* Measured, never drawn. */}
      <path ref={ringTrack} d={HEAD_RING} visibility="hidden" />
      <path ref={leafTrack} d={HEAD_LEAF} visibility="hidden" />

      {/* The head and its tail, placed every frame. */}
      <g ref={head} opacity="0">
        {TAIL.map((lag, i) => (
          <circle key={lag} r={2.4 - i * 0.6} fill="url(#page-loader-glow)" opacity={0.7 - i * 0.2} />
        ))}
        <circle r="7" fill="url(#page-loader-glow)" />
      </g>
    </svg>
  );
}

type Phase = 'loading' | 'finishing' | 'leaving' | 'done';

const easeOut = (k: number) => 1 - (1 - k) ** 3;
const easeInOut = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2);
const clamp01 = (k: number) => Math.min(1, Math.max(0, k));

/** Far enough from (x, y) to clear every corner of the screen. */
function coverRadius(x: number, y: number) {
  return Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y)) + 40;
}

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
  const edgeRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const ringTrack = useRef<SVGPathElement>(null);
  const leafTrack = useRef<SVGPathElement>(null);
  const head = useRef<SVGGElement>(null);

  // Animation state, read by the frame loop; refs, so a frame never re-renders.
  const fill = useRef(carried?.fill ?? 0);
  const shownAt = useRef(0);
  const finishFrom = useRef<{ at: number; fill: number } | null>(null);
  /** The circle: where it's centred, and when it started closing (a click) or opening (the end). */
  const iris = useRef({ x: 0, y: 0, enterAt: 0, leaveAt: 0 });
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

  // Paint the scene, every frame the overlay is up.
  const visible = phase !== 'done';
  useEffect(() => {
    if (!visible) return;
    if (!shownAt.current) shownAt.current = performance.now();
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame = 0;
    let shownCount = -1;

    const placeHead = (f: number) => {
      const g = head.current;
      const ringPath = ringTrack.current;
      const leafPath = leafTrack.current;
      if (!g || !ringPath || !leafPath) return;
      const onLeaf = f > RING_SHARE;
      const path = onLeaf ? leafPath : ringPath;
      const along = onLeaf ? (f - RING_SHARE) / (1 - RING_SHARE) : f / RING_SHARE;
      const length = path.getTotalLength();
      const at = (k: number) => path.getPointAtLength(clamp01(k) * length);
      const circles = g.children;
      TAIL.forEach((lag, i) => {
        const point = at(along - lag * (onLeaf ? 3 : 1));
        circles[i].setAttribute('transform', `translate(${point.x} ${point.y})`);
      });
      const point = at(along);
      circles[TAIL.length].setAttribute('transform', `translate(${point.x} ${point.y})`);
      // In as the fill starts, out as it completes.
      g.setAttribute('opacity', String(Math.min(1, f * 25, (1 - f) * 25)));
    };

    const paint = (now: number) => {
      const finish = finishFrom.current;
      if (finish) {
        const k = Math.min(1, (now - finish.at) / FINISH_MS);
        fill.current = finish.fill + (1 - finish.fill) * (1 - (1 - k) ** 3);
      } else {
        const creep = CREEP_MAX * (1 - Math.exp(-(now - shownAt.current) / CREEP_TAU_MS));
        fill.current = Math.max(fill.current, creep);
      }
      const f = fill.current;
      const el = overlayRef.current;
      if (el) {
        el.style.setProperty('--fill', f.toFixed(3));
        el.style.setProperty('--ring', String(Math.min(1, f / RING_SHARE)));
        el.style.setProperty('--leaf', String(Math.max(0, (f - RING_SHARE) / (1 - RING_SHARE))));
      }
      placeHead(f);
      const count = Math.round(f * 100);
      if (count !== shownCount && countRef.current) {
        shownCount = count;
        countRef.current.textContent = String(count).padStart(3, '0');
      }

      // The circle. A page change covers at once — the old page must not be
      // seen changing — and the ring only draws in on the click; at the end
      // the page opens through the circle from the centre of the mark.
      const { x, y, enterAt, leaveAt } = iris.current;
      let hole = 0;
      let edgeRadius = 0;
      let edge = 0;
      if (!reduced && enterAt && now - enterAt < ENTER_MS) {
        const k = (now - enterAt) / ENTER_MS;
        edgeRadius = coverRadius(x, y) * (1 - easeOut(k));
        edge = 1 - k;
      } else if (!reduced && leaveAt) {
        const k = clamp01((now - leaveAt) / IRIS_MS);
        hole = coverRadius(x, y) * easeInOut(k);
        edgeRadius = hole;
        edge = 1 - k;
      }
      if (el) {
        el.toggleAttribute('data-iris', hole > 0);
        el.toggleAttribute('data-entering', Boolean(enterAt) && now - enterAt < ENTER_MS + 120);
        el.style.setProperty('--hole', `${hole.toFixed(1)}px`);
        el.style.setProperty('--hx', `${x}px`);
        el.style.setProperty('--hy', `${y}px`);
      }
      const ring = edgeRef.current;
      if (ring) {
        ring.style.opacity = edgeRadius > 0 ? String(edge) : '0';
        ring.style.transform = `translate(${x}px, ${y}px) scale(${edgeRadius / 100})`;
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
      const timer = setTimeout(() => {
        // The page opens from the centre of the mark.
        iris.current = { x: window.innerWidth / 2, y: window.innerHeight / 2, enterAt: 0, leaveAt: performance.now() };
        setPhase('leaving');
      }, FINISH_MS + HOLD_MS);
      return () => clearTimeout(timer);
    }
    if (phase === 'leaving') {
      const timer = setTimeout(() => setPhase('done'), IRIS_MS);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // Cover the page the moment a page change starts.
  useEffect(() => {
    const begin = (to: URL, from?: { x: number; y: number }) => {
      targetPath.current = to.pathname;
      toStart.current = true;
      hash.current = to.hash;
      fill.current = 0;
      shownAt.current = performance.now();
      finishFrom.current = null;
      iris.current = {
        x: from?.x ?? window.innerWidth / 2,
        y: from?.y ?? window.innerHeight / 2,
        enterAt: performance.now(),
        leaveAt: 0,
      };
      setPhase('loading');
      setRun((n) => n + 1);
    };
    const onClick = (event: MouseEvent) => {
      const to = internalDestination(event);
      // A keyboard "click" has no position; the circle then closes on the centre.
      if (to) begin(to, event.detail > 0 ? { x: event.clientX, y: event.clientY } : undefined);
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
    <>
      <Overlay
        ref={overlayRef}
        role="status"
        aria-live="polite"
        data-page-loader
        data-phase={phase}
        data-hidden={phase === 'done' ? '' : undefined}
      >
        <Floor aria-hidden />
        <Stage aria-hidden>
          <Halo />
          <Orbit $rx={74} $ry={-16} $seconds={7} $dot={accents.primary} />
          <Orbit $rx={68} $ry={24} $seconds={11} $dot={palette.pink} $reverse />
          <Pulse $delay={0} />
          <Pulse $delay={180} />
          <FillingMark ringTrack={ringTrack} leafTrack={leafTrack} head={head} />
        </Stage>
        <Counter aria-hidden>
          <span ref={countRef}>000</span>
          <span>%</span>
        </Counter>
        <VisuallyHidden>{t('loading')}</VisuallyHidden>
      </Overlay>
      <IrisEdge ref={edgeRef} aria-hidden />
    </>
  );
}
