'use client';

import { useEffect, useRef, useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { accents, neutrals } from '@/styles/tokens/colors';
import { zIndex } from '@/styles/tokens/z-index';
import {
  CROSSHAIR_BOX,
  CROSSHAIR_VIEWBOX,
  CrosshairMark,
  CrosshairRing,
  crosshairGlass,
} from '@/components/primitives/Crosshair';

/*
 * Figma: Cursor (3945:15184), in Figma units (drawn at 32/41.5 on screen) — three states of one crosshair: a dashed ring
 * with four inward ticks, and a mark in the middle, over a round glass
 * backing.
 *  - Default: 38px, light, the mark a plus.
 *  - Hover (over anything you can press): the whole thing turned 45° and grown
 *    to 44px, so the plus becomes a cross, in green; the glass grows to 48px.
 *  - Pressed: the ring and the glass pull in (smaller than the default) while
 *    the cross swells to 16px, still green.
 * Drawn once; the ring, the mark and the glass each ease between their states.
 *
 * It follows the pointer on every move with no easing of its own (a cursor that
 * trails feels broken); only the state changes animate, and with reduced motion
 * they switch instantly. Mouse and trackpad only: on touch screens the system
 * cursor stays. Over text fields the system's text cursor comes back, so you
 * can see where you type.
 */

const DRAWING = CROSSHAIR_BOX;
/**
 * Drawn size on screen: Figma's 41.5px box brought down to 32px, as the full
 * size felt big on the live site. Every part scales with it (the SVG and the
 * glass fill this box), so the proportions between the states stay Figma's.
 */
const SIZE = 32;
/** 44px over 38px. */
const HOVER_SCALE = 44 / 38;
/** Pressed: the ring pulls in from 36.3 to 34px across; the cross grows from 10.4 to 16px. */
const PRESS_RING_SCALE = 34 / 36.2727;
const PRESS_MARK_SCALE = 16 / 10.3636;
/** The glass: the drawing's box by default, 48px on hover, 38px pressed. */
const GLASS_HOVER_SCALE = 48 / DRAWING;
const GLASS_PRESS_SCALE = 38 / DRAWING;
const EASE = 'cubic-bezier(0.2, 0.8, 0.2, 1)';

/** Where the custom cursor takes over (a real mouse or trackpad), and what counts as pressable. */
const QUERY = '(hover: hover) and (pointer: fine)';
const PRESSABLE =
  'a[href], button:not([disabled]), [role="button"], summary, label, select, input[type="radio"], input[type="checkbox"], input[type="submit"], input[type="button"], [data-cursor="hover"]';
const TEXT_FIELD =
  'input:not([type="radio"]):not([type="checkbox"]):not([type="submit"]):not([type="button"]):not([type="range"]), textarea, [contenteditable="true"]';

/** Hides the system cursor everywhere except text fields, while ours is on. */
const HideSystemCursor = createGlobalStyle`
  html[data-custom-cursor='true'],
  html[data-custom-cursor='true'] * {
    cursor: none !important;
  }

  html[data-custom-cursor='true'] :is(${TEXT_FIELD}) {
    cursor: text !important;
  }
`;

/** Placed by transform only, straight from the pointer. */
const Follower = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  z-index: ${zIndex.cursor};
  width: ${SIZE}px;
  height: ${SIZE}px;
  margin: ${-SIZE / 2}px 0 0 ${-SIZE / 2}px;
  pointer-events: none;
  will-change: transform;
  transition: opacity 150ms ease-out;

  &[data-visible='false'] {
    opacity: 0;
  }
`;

const Glass = styled.span`
  position: absolute;
  inset: 0;
  ${crosshairGlass}
  transition: transform 260ms ${EASE};

  [data-state='hover'] > & {
    transform: scale(${GLASS_HOVER_SCALE});
  }

  [data-state='pressed'] > & {
    transform: scale(${GLASS_PRESS_SCALE});
    transition-duration: 140ms;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none !important;
  }
`;

const Crosshair = styled.svg`
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
  color: ${neutrals[100]};
  transition: color 180ms ease-out;

  g {
    transform-box: fill-box;
    transform-origin: center;
    transition: transform 260ms ${EASE};
  }

  [data-state='hover'] > & {
    color: ${accents.primary};
  }

  [data-state='hover'] > & g {
    transform: rotate(45deg) scale(${HOVER_SCALE});
  }

  [data-state='pressed'] > & {
    color: ${accents.primary};
    transition-duration: 100ms;

    .ring {
      transform: rotate(45deg) scale(${PRESS_RING_SCALE});
    }

    .mark {
      transform: rotate(45deg) scale(${PRESS_MARK_SCALE});
    }

    g {
      transition-duration: 140ms;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    &,
    & g {
      transition: none !important;
    }
  }
`;

type CursorState = 'default' | 'hover' | 'pressed';

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const query = window.matchMedia(QUERY);
    const sync = () => setEnabled(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    const root = document.documentElement;
    root.dataset.customCursor = 'true';

    let over: CursorState = 'default';
    let down = false;
    const setState = () => {
      el.dataset.state = down ? 'pressed' : over;
    };
    const aim = (target: EventTarget | null) => {
      const node = target instanceof Element ? target : null;
      // Over a text field the system text cursor shows instead.
      el.dataset.visible = String(!node?.closest(TEXT_FIELD));
      over = node?.closest(PRESSABLE) ? 'hover' : 'default';
      setState();
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    };
    const onOver = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') aim(e.target);
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true;
      setState();
    };
    const onUp = () => {
      down = false;
      setState();
    };
    // Leaving the window hides it; it comes back on the next move in.
    const onOut = (e: PointerEvent) => {
      if (!e.relatedTarget) el.dataset.visible = 'false';
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerover', onOver, { passive: true });
    document.addEventListener('pointerout', onOut, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    window.addEventListener('blur', onUp);
    return () => {
      delete root.dataset.customCursor;
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
      document.removeEventListener('pointerout', onOut);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('blur', onUp);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <>
      <HideSystemCursor />
      {/* Hidden until the first move puts it under the pointer. */}
      <Follower ref={ref} data-state="default" data-visible="false" aria-hidden>
        <Glass />
        <Crosshair viewBox={CROSSHAIR_VIEWBOX} fill="currentColor">
          <defs>
            <filter id="cursor-soften" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="0.4" />
            </filter>
          </defs>
          <g className="ring" filter="url(#cursor-soften)">
            <CrosshairRing />
          </g>
          <g className="mark" filter="url(#cursor-soften)">
            <CrosshairMark />
          </g>
        </Crosshair>
      </Follower>
    </>
  );
}
