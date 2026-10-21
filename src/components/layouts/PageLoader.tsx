'use client';

import { useEffect, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useTranslations } from 'next-intl';
import { LogoMark, VisuallyHidden } from '@/components/primitives';
import { requestScrollFrame } from '@/lib/scroll-driver';
import { media, mediaQueries } from '@/styles/media';
import { neutrals } from '@/styles/tokens/colors';
import { zIndex } from '@/styles/tokens/z-index';
import { delay, layoutSettled } from './page-settle';

/*
 * Covers the page on a full document load — the first page of a visit, or a
 * reload. Moves between pages inside the site are PageTransition's: there is
 * no loader for those. Provisional design — not in Figma yet: the white logo
 * over the hero's glows, with a percentage under it as wide as the logo.
 *
 * Why: several sections are drawn from values only the browser can measure —
 * the What I Do character reveals, Selected Work's magnification, the
 * Capabilities geometry. The server HTML shows them in their top-of-section
 * state, and on a reload mid-page the browser also restores the scroll position
 * while the page is still growing. Until hydration, fonts and that scroll
 * position settle, a visitor saw half-drawn faces and sections jumping past.
 *
 * The overlay is part of the server HTML, so it's there from the first paint.
 * It lifts once the page has loaded, its fonts and first-screen images are in
 * and its height has held still — capped, so a slow network never leaves
 * anyone staring at it. The percentage creeps while the page loads and runs to
 * 100 once it has.
 *
 * Not on a phone (the 480 frame and below): there the cover only fades away
 * as the page is drawn, with no logo, count or wait. A phone loads the slowest,
 * so the wait was longest there; and the page under the cover counts as drawn
 * either way (a fade on the page itself would not), so the browser's own
 * measure of when it showed is untouched by the fade.
 */

/** Longest the loader waits for the page to settle, however slow the network. */
const MAX_WAIT_MS = 4000;
/** The run from wherever the count is to 100, once the page is ready. */
const FINISH_MS = 320;
/** 100 holds this long before the overlay fades. */
const HOLD_MS = 120;
const FADE_MS = 350;
/** Without JavaScript nothing would lift the overlay, so CSS lifts it on its own after this. */
const FAILSAFE_S = 6;
/** A phone has no loader: the cover just fades out over this long. */
const PHONE_FADE_MS = 400;
const PHONE = mediaQueries.down('m');

/** The logo's size; the percentage is set to the same width. */
const MARK_PX = 128;

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

const phoneReveal = keyframes`
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
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
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

  svg {
    position: relative;
    width: ${MARK_PX}px;
    height: ${MARK_PX}px;
  }

  ${media.reducedMotion} {
    &::before {
      animation: none;
    }
  }

  /* A phone: no logo, count or glows, nothing to wait for. The bare cover
     fades straight away, so the page comes in as it is drawn. */
  ${media.down('m')} {
    pointer-events: none;
    animation: ${phoneReveal} ${PHONE_FADE_MS}ms ease-out forwards;

    &::before,
    > * {
      display: none;
    }

    ${media.reducedMotion} {
      display: none;
    }
  }
`;

/** Gilroy semibold at this size sets "000%" to the logo's 128px (measured in the browser: 98.9px at 40px). */
const COUNTER_PX = 51.5;

/**
 * "000%" as wide as the logo. Gilroy's tabular figures keep every count the
 * same width, so one size fits all of them: see COUNTER_PX.
 */
const Counter = styled.p`
  position: relative;
  display: flex;
  justify-content: space-between;
  width: ${MARK_PX}px;
  margin: 0;
  color: ${neutrals[100]};
  font-weight: 600;
  font-size: ${COUNTER_PX}px;
  line-height: 1;
  font-variant-numeric: tabular-nums;

  span:last-child {
    color: ${neutrals[500]};
  }
`;

type Phase = 'loading' | 'finishing' | 'leaving' | 'done';

/**
 * Set once the first page has been uncovered. A language switch remounts the
 * whole tree this loader lives in; the new copy must not cover the page again.
 */
let documentShown = false;

export function PageLoader() {
  const t = useTranslations('common');
  const [phase, setPhase] = useState<Phase>(() => (documentShown ? 'done' : 'loading'));
  const countRef = useRef<HTMLSpanElement>(null);
  const fill = useRef(0);
  const finishFrom = useRef<{ at: number; fill: number } | null>(null);

  // Count, every frame the overlay is up.
  const visible = phase !== 'done';
  useEffect(() => {
    if (!visible || window.matchMedia(PHONE).matches) return;
    const shownAt = performance.now();
    let frame = 0;
    let shownCount = -1;
    const paint = (now: number) => {
      const finish = finishFrom.current;
      if (finish) {
        const k = Math.min(1, (now - finish.at) / FINISH_MS);
        fill.current = finish.fill + (1 - finish.fill) * (1 - (1 - k) ** 3);
      } else {
        const creep = CREEP_MAX * (1 - Math.exp(-(now - shownAt) / CREEP_TAU_MS));
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

  // A phone waits for nothing: the cover's own fade (CSS) is all there is.
  useEffect(() => {
    if (phase !== 'loading' || !window.matchMedia(PHONE).matches) return;
    documentShown = true;
    requestScrollFrame();
    const timer = setTimeout(() => setPhase('done'), PHONE_FADE_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  // Wait for the page under the cover, then run the count to 100 and lift it.
  useEffect(() => {
    if (phase !== 'loading' || window.matchMedia(PHONE).matches) return;
    let finished = false;
    Promise.race([layoutSettled(() => finished), delay(MAX_WAIT_MS)]).then(() => {
      if (finished) return;
      finished = true;
      // Have every scroll-driven effect measure the final layout before it's uncovered.
      requestScrollFrame();
      finishFrom.current = { at: performance.now(), fill: fill.current };
      setPhase('finishing');
    });
    return () => {
      finished = true;
    };
  }, [phase]);

  useEffect(() => {
    // Timers, not frames: a page opened in a background tab gets no frames.
    if (phase === 'finishing') {
      const timer = setTimeout(() => setPhase('leaving'), FINISH_MS + HOLD_MS);
      return () => clearTimeout(timer);
    }
    if (phase === 'leaving') {
      documentShown = true;
      const timer = setTimeout(() => setPhase('done'), FADE_MS);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  if (phase === 'done') return null;

  return (
    <Overlay $leaving={phase === 'leaving'} role="status" aria-live="polite" data-page-loader>
      <LogoMark />
      <Counter aria-hidden>
        <span ref={countRef}>000</span>
        <span>%</span>
      </Counter>
      <VisuallyHidden>{t('loading')}</VisuallyHidden>
    </Overlay>
  );
}
