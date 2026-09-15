'use client';

import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useTranslations } from 'next-intl';
import { LogoMark, VisuallyHidden } from '@/components/primitives';
import { requestScrollFrame } from '@/lib/scroll-driver';
import { media } from '@/styles/media';
import { accents, neutrals } from '@/styles/tokens/colors';
import { glass } from '@/styles/tokens/effects';
import { radius } from '@/styles/tokens/radius';
import { spacing } from '@/styles/tokens/spacing';
import { zIndex } from '@/styles/tokens/z-index';

/*
 * Covers the page on a full document load (not on client-side navigation, where
 * the root layout stays mounted). Provisional design — not in Figma yet.
 *
 * Why: several sections are drawn from values only the browser can measure —
 * the What I Do character reveals, Selected Work's magnification, the
 * Capabilities geometry. The server HTML shows them in their top-of-section
 * state, and on a reload mid-page the browser also restores the scroll position
 * while the page is still growing. Until hydration, fonts and that scroll
 * position settle, a visitor saw half-drawn faces and sections jumping past.
 *
 * The overlay is part of the server HTML, so it's there from the first paint.
 * It lifts once the page has loaded, its fonts are in and its height has held
 * still — capped, so a slow network never leaves anyone staring at it.
 */

/** Longest the loader stays up, however slow the network. */
const MAX_WAIT_MS = 4000;
/** The layout counts as settled once the page height has held still this long. */
const STABLE_MS = 150;
const FADE_MS = 400;
/** Without JavaScript nothing would lift the overlay, so CSS lifts it on its own after this. */
const FAILSAFE_S = 6;

const failsafe = keyframes`
  to {
    opacity: 0;
    visibility: hidden;
  }
`;

const sweep = keyframes`
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(250%);
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
  gap: ${spacing[300]}px;
  background: ${neutrals[900]};
  opacity: ${(p) => (p.$leaving ? 0 : 1)};
  pointer-events: ${(p) => (p.$leaving ? 'none' : 'auto')};
  transition: opacity ${FADE_MS}ms ease-out;
  animation: ${failsafe} 0s linear ${FAILSAFE_S}s forwards;

  svg {
    width: 64px;
    height: 64px;
  }

  ${media.down('m')} {
    svg {
      width: 48px;
      height: 48px;
    }
  }
`;

/** A thin track with a green glint sweeping across — the nav glow's colour. */
const Track = styled.div`
  position: relative;
  width: 120px;
  height: 2px;
  overflow: hidden;
  border-radius: ${radius.round}px;
  background: ${glass.border};

  &::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 40%;
    background: linear-gradient(90deg, transparent, ${accents.primary}, transparent);
    animation: ${sweep} 1.1s ease-in-out infinite;
  }

  ${media.reducedMotion} {
    &::after {
      left: 30%;
      animation: none;
    }
  }
`;

type Phase = 'loading' | 'leaving' | 'done';

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Resolves once the page has loaded, its fonts are in, and both its height and
 * the scroll position have stopped changing — on a reload the browser keeps
 * nudging the restored position while the page grows.
 */
async function layoutSettled(stopped: () => boolean) {
  if (document.readyState !== 'complete') {
    await new Promise<void>((resolve) => window.addEventListener('load', () => resolve(), { once: true }));
  }
  await document.fonts.ready;

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

export function PageLoader() {
  const t = useTranslations('common');
  const [phase, setPhase] = useState<Phase>('loading');

  useEffect(() => {
    let finished = false;
    Promise.race([layoutSettled(() => finished), delay(MAX_WAIT_MS)]).then(() => {
      if (finished) return;
      finished = true;
      // Have every scroll-driven effect measure the final layout before it's uncovered.
      requestScrollFrame();
      // A timer, not a frame: a page opened in a background tab gets no frames.
      setTimeout(() => setPhase('leaving'), 50);
    });
    return () => {
      finished = true;
    };
  }, []);

  useEffect(() => {
    if (phase !== 'leaving') return;
    const timer = setTimeout(() => setPhase('done'), FADE_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  if (phase === 'done') return null;

  return (
    <Overlay $leaving={phase === 'leaving'} role="status" aria-live="polite" data-page-loader>
      <LogoMark />
      <Track aria-hidden />
      <VisuallyHidden>{t('loading')}</VisuallyHidden>
    </Overlay>
  );
}
