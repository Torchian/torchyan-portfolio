'use client';

import { useEffect, type RefObject } from 'react';
import { createInViewGate } from '@/lib/scroll-driver';

/**
 * Makes live Characters (with `motion`) look at the mouse: writes
 * `--gaze-x/y` and `--turn-x/y` (each -1…1) on every target element, which
 * the Character inside reads.
 *
 *  - Each target looks from where it stands: the value is the pointer's offset
 *    from that character's head, so with the pointer mid-screen the left
 *    character looks right and the right one looks left.
 *  - Both ease towards the pointer, independent of frame rate: the eyes quickly,
 *    the head more slowly, so the eyes lead and the head follows.
 *  - The loop only runs while something is still moving, and not at all while
 *    the targets are off screen or the tab is hidden. When the pointer leaves
 *    the window, everything eases back to centre.
 */

/** Easing time constants: how long (ms) to cover ~63% of the way to the pointer. */
const GAZE_TAU = 90;
const TURN_TAU = 220;
/**
 * The pointer's distance from a head, as a share of the viewport, that counts as
 * a full turn. Less than half: the characters stand at the screen edges, so a
 * pointer mid-screen already has them turned most of the way.
 */
const FULL_TURN_X = 0.6;
const FULL_TURN_Y = 0.5;
/** Where the head sits in the character's frame, as a fraction of its size. */
const HEAD_CENTRE = { x: 0.5, y: 0.34 } as const;
const SETTLED = 0.002;

interface Look {
  el: HTMLElement;
  target: { x: number; y: number };
  gaze: { x: number; y: number };
  turn: { x: number; y: number };
  written: string;
}

const clamp = (v: number) => Math.max(-1, Math.min(1, v));

export function useLookAtPointer(targets: RefObject<HTMLElement | null>[], enabled: boolean) {
  useEffect(() => {
    const els = targets.map((ref) => ref.current).filter((el): el is HTMLElement => el !== null);
    if (!enabled || els.length === 0) return;

    const looks: Look[] = els.map((el) => ({
      el,
      target: { x: 0, y: 0 },
      gaze: { x: 0, y: 0 },
      turn: { x: 0, y: 0 },
      written: '',
    }));
    const gate = createInViewGate(els[0], '0px');
    let raf = 0;
    let last = 0;

    const aim = (pointerX: number | null, pointerY: number | null) => {
      for (const look of looks) {
        if (pointerX === null || pointerY === null) {
          look.target = { x: 0, y: 0 };
          continue;
        }
        const r = look.el.getBoundingClientRect();
        const headX = r.left + r.width * HEAD_CENTRE.x;
        const headY = r.top + r.height * HEAD_CENTRE.y;
        look.target = {
          x: clamp((pointerX - headX) / (window.innerWidth * FULL_TURN_X)),
          y: clamp((pointerY - headY) / (window.innerHeight * FULL_TURN_Y)),
        };
      }
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    const tick = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      const kGaze = 1 - Math.exp(-dt / GAZE_TAU);
      const kTurn = 1 - Math.exp(-dt / TURN_TAU);
      let moving = false;

      for (const look of looks) {
        const { target, gaze, turn } = look;
        gaze.x += (target.x - gaze.x) * kGaze;
        gaze.y += (target.y - gaze.y) * kGaze;
        turn.x += (target.x - turn.x) * kTurn;
        turn.y += (target.y - turn.y) * kTurn;
        const unsettled =
          Math.abs(target.x - turn.x) > SETTLED ||
          Math.abs(target.y - turn.y) > SETTLED ||
          Math.abs(target.x - gaze.x) > SETTLED ||
          Math.abs(target.y - gaze.y) > SETTLED;
        if (unsettled) moving = true;
        // Settled values snap to the target, so the loop can stop on them exactly.
        const values = unsettled
          ? [gaze.x, gaze.y, turn.x, turn.y]
          : [target.x, target.y, target.x, target.y];
        const written = values.map((v) => v.toFixed(3)).join(' ');
        if (written !== look.written) {
          look.written = written;
          const [gx, gy, tx, ty] = written.split(' ');
          look.el.style.setProperty('--gaze-x', gx);
          look.el.style.setProperty('--gaze-y', gy);
          look.el.style.setProperty('--turn-x', tx);
          look.el.style.setProperty('--turn-y', ty);
        }
      }

      raf = moving && gate.current && !document.hidden ? requestAnimationFrame(tick) : 0;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || !gate.current || document.hidden) return;
      aim(e.clientX, e.clientY);
    };
    // Leaving the window (relatedTarget null) sends both heads back to centre.
    const onOut = (e: PointerEvent) => {
      if (e.relatedTarget === null) aim(null, null);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerout', onOut, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerout', onOut);
      cancelAnimationFrame(raf);
      gate.disconnect();
    };
  }, [targets, enabled]);
}
