'use client';

import { useEffect, type RefObject } from 'react';
import {
  beginProgrammaticScroll,
  createInViewGate,
  endProgrammaticScroll,
  subscribeScroll,
} from '@/lib/scroll-driver';

/**
 * Minimum time between two project changes. It covers the stage's own swap (the
 * halves out, the new ones in), so a change is always seen through.
 */
const STEP_LOCK_MS = 700;

/**
 * Quiet needed after a change before the next gesture counts. A trackpad flick's
 * momentum keeps sending wheel events for a second or more, and a spun mouse
 * wheel sends a burst; both are one gesture, and waiting for the gap is what
 * keeps one gesture to one project.
 */
const GESTURE_GAP_MS = 160;

/** Wheel travel (px) a gesture needs before it counts, so a nudge or a stray tick doesn't. */
const WHEEL_THRESHOLD = 24;

/** Finger travel (px) a swipe needs before it counts. */
const SWIPE_THRESHOLD = 40;

const KEYS_DOWN = new Set(['ArrowDown', 'PageDown', ' ']);
const KEYS_UP = new Set(['ArrowUp', 'PageUp']);

/**
 * Steps the Projects stage one project per gesture.
 *
 * The stage is pinned while the page scrolls one screen per project, and a free
 * scroll moves an arbitrary distance: a nudge falls short of the next project
 * and a flick flies past two or three. So while the page is within the stage
 * (from the first project's screen to the last one's), wheel, swipe and scroll
 * keys are taken over, and each gesture jumps the page exactly one screen,
 * straight to the next project's position. The jump is instant, since the stage
 * is pinned and scrolling inside it shows nothing; the change itself is the
 * stage's animation. Then everything else in that gesture is ignored.
 *
 *  - Past either end the gesture goes back to the page, so scrolling carries on
 *    out of the stage as normal.
 *  - Arriving from above or below (a scroll carried in by momentum) first
 *    settles on the project at hand and counts as that gesture's step, so the
 *    first or last project is never skipped on the way in.
 *  - Anything that can't be intercepted (dragging the scrollbar,
 *    find-in-page) is settled once scrolling stops: the page moves to the
 *    nearest project, so it never rests between two.
 */
export function useStageStepping(
  trackRef: RefObject<HTMLElement | null>,
  count: number,
  enabled: boolean,
) {
  useEffect(() => {
    const track = trackRef.current;
    if (!enabled || !track || count < 2) return;

    /** No change before this time, so the previous one is seen through. */
    let lockedUntil = 0;
    /** The current gesture has already moved the stage (or settled it on the way in). */
    let spent = false;
    /** Whether the page was inside the stage at the last gesture; false means it's arriving. */
    let engaged = false;
    let lastWheelAt = 0;
    let wheelTravel = 0;

    const geometry = () => {
      // The track's height over the projects: the stage is 100svh, and on phones
      // innerHeight changes as the toolbar hides and shows.
      const rect = track.getBoundingClientRect();
      const screen = rect.height / count;
      const top = rect.top + window.scrollY;
      return { screen, top, progress: (window.scrollY - top) / screen };
    };

    /** Within the stage: from the first project's screen to the last one's. */
    const inside = (progress: number) => progress > -0.001 && progress < count - 1 + 0.001;

    const scrollToProject = (index: number) => {
      const { screen, top } = geometry();
      beginProgrammaticScroll();
      window.scrollTo({ top: Math.round(top + index * screen), behavior: 'instant' });
      endProgrammaticScroll();
    };

    /** A gesture's step: move, then hold off the rest of the gesture. */
    const jumpTo = (index: number) => {
      scrollToProject(index);
      lockedUntil = performance.now() + STEP_LOCK_MS;
      spent = true;
    };

    /**
     * A gesture in `direction` (1 down, -1 up). `ready`: it has travelled far
     * enough to count. Returns true when the stage takes it (the page mustn't
     * scroll), false when it belongs to the page.
     */
    const gesture = (direction: 1 | -1, ready: boolean): boolean => {
      const { progress } = geometry();
      if (!inside(progress)) {
        engaged = false;
        return false;
      }

      const current = Math.round(progress);
      const settled = Math.abs(progress - current) < 0.01;

      // Arriving (carried in from above or below): settle on the project at
      // hand, and let that be this gesture's step.
      if (!engaged) {
        engaged = true;
        if (!settled) jumpTo(current);
        else spent = true;
        return true;
      }

      const target = current + direction;
      // Past either end: the gesture carries on out of the stage.
      if (settled && (target < 0 || target > count - 1)) {
        if (spent) return true; // …but not the tail of the step that got us here
        engaged = false;
        return false;
      }

      if (ready && !spent && performance.now() >= lockedUntil) {
        jumpTo(settled ? target : direction > 0 ? Math.ceil(progress) : Math.floor(progress));
      }
      return true;
    };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return; // pinch zoom, sideways
      const now = performance.now();
      const direction = e.deltaY > 0 ? 1 : -1;
      // A pause, or a turn, starts a new gesture: momentum and a spun wheel
      // never pause this long, so their whole run counts as one.
      if (now - lastWheelAt >= GESTURE_GAP_MS || Math.sign(wheelTravel) !== direction) {
        spent = false;
        wheelTravel = 0;
      }
      lastWheelAt = now;
      wheelTravel += e.deltaY;
      if (gesture(direction, Math.abs(wheelTravel) >= WHEEL_THRESHOLD)) e.preventDefault();
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;
      // Space on a focused button or link presses it.
      if (e.key === ' ' && target?.closest('button, a, [role="button"]')) return;
      const up = KEYS_UP.has(e.key) || (e.key === ' ' && e.shiftKey);
      const down = !up && KEYS_DOWN.has(e.key);
      if (!down && !up) return;
      // Every press is its own gesture; a held key's repeats are not.
      if (!e.repeat) {
        spent = false;
        engaged = true;
      }
      if (gesture(down ? 1 : -1, !e.repeat)) e.preventDefault();
    };

    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
      spent = false;
    };
    const onTouchMove = (e: TouchEvent) => {
      const dy = touchStartY - e.touches[0].clientY;
      if (Math.abs(dy) < 4) return;
      if (gesture(dy > 0 ? 1 : -1, Math.abs(dy) >= SWIPE_THRESHOLD)) e.preventDefault();
    };

    // Settle anything that slipped through (scrollbar drags) on the nearest project.
    const gate = createInViewGate(track);
    const unsubscribe = subscribeScroll<null>({
      active: () => gate.current,
      read: () => null,
      write: () => {},
      onIdle: () => {
        const { progress } = geometry();
        if (!inside(progress)) {
          engaged = false;
          return;
        }
        // Resting inside, on a project: the next gesture is a plain step, not an
        // arrival. No lock, so it can come straight away.
        engaged = true;
        const nearest = Math.round(progress);
        if (Math.abs(progress - nearest) > 0.005) scrollToProject(nearest);
      },
    });

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      unsubscribe();
      gate.disconnect();
    };
  }, [trackRef, count, enabled]);
}
