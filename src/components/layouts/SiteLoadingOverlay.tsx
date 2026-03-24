'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { zIndex } from '@/styles/tokens/z-index';
import { accents, neutrals } from '@/styles/tokens/colors';
import { media } from '@/styles/media';
import { easing } from '@/styles/tokens/motion';

const MIN_VISIBLE_MS = 500;
const FADE_OUT_MS = 380;
const FADE_COMPLETE_FALLBACK_MS = FADE_OUT_MS + 80;

const orbit = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const pulse = keyframes`
  0%,
  100% {
    opacity: 0.35;
  }
  50% {
    opacity: 1;
  }
`;

const Root = styled.div<{ $visible: boolean }>`
  position: fixed;
  inset: 0;
  z-index: ${zIndex.loading};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 28px;
  background: var(--color-bg-primary, ${neutrals[900]});
  pointer-events: ${(p) => (p.$visible ? 'auto' : 'none')};
  opacity: ${(p) => (p.$visible ? 1 : 0)};
  transition: opacity ${FADE_OUT_MS}ms ${easing.out};
`;

const Ring = styled.div`
  position: relative;
  width: 72px;
  height: 72px;
  animation: ${orbit} 1.2s ${easing.inOut} infinite;

  ${media.reducedMotion} {
    animation: none;
  }
`;

const Dot = styled.span<{ $accent: 'primary' | 'secondary'; $angle: number }>`
  position: absolute;
  left: 50%;
  top: 50%;
  width: 12px;
  height: 12px;
  margin-left: -6px;
  margin-top: -6px;
  border-radius: 50%;
  background: ${(p) => (p.$accent === 'primary' ? accents.primary : accents.secondary)};
  box-shadow:
    0 0 16px
      ${(p) => (p.$accent === 'primary' ? 'rgba(12, 175, 10, 0.45)' : 'rgba(198, 20, 230, 0.45)')};
  transform: rotate(${(p) => p.$angle}deg) translateY(-28px);
  animation: ${pulse} 1s ${easing.inOut} infinite;
  animation-delay: ${(p) => (p.$accent === 'secondary' ? '0.15s' : '0s')};

  ${media.reducedMotion} {
    animation: none;
    opacity: 1;
  }
`;

const Label = styled.span`
  font-family: var(--font-gilroy), system-ui, sans-serif;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: ${neutrals[500]};
`;

export interface SiteLoadingOverlayProps {
  onFadeComplete?: () => void;
}

export function SiteLoadingOverlay({ onFadeComplete }: SiteLoadingOverlayProps) {
  const [phase, setPhase] = useState<'loading' | 'fade' | 'unmounted'>('loading');
  const fadeCompleteFired = useRef(false);

  const fireFadeComplete = useCallback(() => {
    if (fadeCompleteFired.current) return;
    fadeCompleteFired.current = true;
    onFadeComplete?.();
  }, [onFadeComplete]);

  const dismiss = useCallback(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      fireFadeComplete();
      setPhase('unmounted');
      return;
    }
    setPhase((p) => (p === 'loading' ? 'fade' : p));
  }, [fireFadeComplete]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const minMs = reducedMotion ? 0 : MIN_VISIBLE_MS;
      const started = performance.now();

      await Promise.all([
        document.fonts.ready.catch(() => undefined),
        new Promise<void>((resolve) => {
          if (document.readyState === 'complete') resolve();
          else window.addEventListener('load', () => resolve(), { once: true });
        }),
      ]);

      const elapsed = performance.now() - started;
      const remaining = Math.max(0, minMs - elapsed);
      if (remaining > 0) {
        await new Promise((r) => setTimeout(r, remaining));
      }
      if (!cancelled) dismiss();
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [dismiss]);

  useEffect(() => {
    if (phase !== 'fade') return undefined;
    const t = window.setTimeout(() => {
      fireFadeComplete();
      setPhase('unmounted');
    }, FADE_COMPLETE_FALLBACK_MS);
    return () => window.clearTimeout(t);
  }, [phase, fireFadeComplete]);

  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (phase !== 'fade' || e.propertyName !== 'opacity') return;
    fireFadeComplete();
    setPhase('unmounted');
  };

  if (phase === 'unmounted') {
    return null;
  }

  const visible = phase === 'loading';

  return (
    <Root
      $visible={visible}
      aria-busy={visible}
      aria-live="polite"
      aria-label="Loading site"
      onTransitionEnd={handleTransitionEnd}
    >
      <Ring aria-hidden>
        <Dot $accent="primary" $angle={0} />
        <Dot $accent="secondary" $angle={180} />
      </Ring>
      <Label>Loading</Label>
    </Root>
  );
}
