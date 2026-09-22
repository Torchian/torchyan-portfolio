'use client';

import { useEffect, type RefObject } from 'react';
import {
  beginProgrammaticScroll,
  createInViewGate,
  endProgrammaticScroll,
  subscribeScroll,
} from '@/lib/scroll-driver';

/**
 * Minimum time between two steps. It covers the step's own transition, so a
 * change is always seen through.
 */
const STEP_LOCK_MS = 700;

/**
 * A pause this long between wheel events starts a new gesture. A trackpad
 * flick's momentum keeps sending events for a second or more, and a spun mouse
 * wheel sends a burst; neither pauses this long, so each is one gesture.
 */
const GESTURE_GAP_MS = 200;

/**
 * A new swipe during the last one's momentum sends no pause: its events just
 * carry on the stream. What gives it away is the speed: momentum only ever
 * slows down, so once the stream has slowed below its peak, speeding up again
 * (by this factor over its slowest since, and by at least WHEEL_RISE_MIN px a
 * frame) is a new gesture.
 *
 * Events don't arrive evenly, and none of these is the scroll changing speed:
 *  - a busy page gets several merged into one bigger event, spanning the
 *    frames since the last one: its distance is shared across them;
 *  - a late event carries one frame's distance after a longer wait: it isn't
 *    spread over the wait (an event only counts as several frames when it's
 *    that many times bigger than the current speed);
 *  - late events are followed by a bunch 1ms apart: an interval never counts
 *    as less than one frame.
 * The odd one out is then dropped by taking the middle of the last three.
 */
const WHEEL_RISE = 1.4;
const WHEEL_RISE_MIN = 4;
/** The stream counts as slowing once it's below this share of its peak. */
const WHEEL_DECAY = 0.6;

/** Wheel travel (px) a gesture needs before it counts, so a nudge or a stray tick doesn't. */
const WHEEL_THRESHOLD = 24;

/** Finger travel (px) a swipe needs before it counts. */
const SWIPE_THRESHOLD = 40;

const KEYS_DOWN = new Set(['ArrowDown', 'PageDown', ' ']);
const KEYS_UP = new Set(['ArrowUp', 'PageUp']);

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

export interface ScrollSteppingOptions {
  /** Number of stops (screens) in the track. */
  count: number;
  enabled?: boolean;
  /**
   * The height of one stop: `track` divides the track's height by `count` (a
   * pinned stage), `viewport` is one screen (a stack of sticky cards).
   */
  screen?: 'track' | 'viewport';
  /**
   * How long the scroll to the next stop takes. 0 jumps instantly, for a
   * pinned stage whose change is its own animation; a stack whose cards move
   * with the scroll needs the scroll itself animated. Reduced motion always
   * jumps.
   */
  stepMs?: number;
}

/**
 * Steps a scroll track one stop per gesture, however big or small the gesture.
 *
 * A free scroll moves an arbitrary distance: a nudge falls short of the next
 * stop and a flick flies past two or three, and a snap that waits for the
 * scroll to stop makes you sit through a flick's momentum first. So while the
 * page is within the track (from the first stop to the last), wheel, swipe and
 * scroll keys are taken over: the first movement of each gesture moves the page
 * exactly one stop, and everything else in that gesture is ignored.
 *
 *  - A gesture that comes while a step is still playing isn't dropped: it's
 *    held, and taken as soon as that step is done.
 *  - Past either end the gesture goes back to the page, so scrolling carries on
 *    out of the track as normal.
 *  - Arriving from above or below (a scroll carried in by momentum) first
 *    settles on the stop at hand and counts as that gesture's step, so the
 *    first or last stop is never skipped on the way in.
 *  - Anything that can't be intercepted (dragging the scrollbar,
 *    find-in-page) is settled once scrolling stops: the page moves to the
 *    nearest stop, so it never rests between two.
 *  - The wheel and touch listeners have to be non-passive to stop the page
 *    scrolling, which makes the browser wait on them before it scrolls. They're
 *    attached only while the track is near the screen, so the rest of the page
 *    scrolls without that wait.
 */
export function useScrollStepping(
  trackRef: RefObject<HTMLElement | null>,
  { count, enabled = true, screen: screenMode = 'track', stepMs = 0 }: ScrollSteppingOptions,
) {
  useEffect(() => {
    const track = trackRef.current;
    if (!enabled || !track || count < 2) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const animate = stepMs > 0 && !reduceMotion;

    /** No step before this time, so the previous one is seen through. */
    let lockedUntil = 0;
    /** The current gesture has already stepped (or settled on the way in). */
    let spent = false;
    /** Whether the page was inside the track at the last gesture; false means it's arriving. */
    let engaged = false;
    let lastWheelAt = 0;
    let wheelTravel = 0;
    /** The wheel stream's last three speeds (px a frame), its peak, and its slowest since slowing. */
    let wheelSpeeds: number[] = [];
    let wheelPeak = 0;
    let wheelTrough = Infinity;
    let wheelSlowing = false;
    let raf = 0;
    /** A gesture made while a step was playing, waiting for it to finish. */
    let queued: 1 | -1 | 0 = 0;
    let queueTimer: ReturnType<typeof setTimeout> | undefined;

    const geometry = () => {
      // Measured each time: on phones innerHeight changes as the toolbar hides and shows.
      const rect = track.getBoundingClientRect();
      const screen = screenMode === 'viewport' ? window.innerHeight : rect.height / count;
      const top = rect.top + window.scrollY;
      return { screen, top, progress: (window.scrollY - top) / screen };
    };

    /** Within the track: from the first stop to the last. */
    const inside = (progress: number) => progress > -0.001 && progress < count - 1 + 0.001;

    const cancelScroll = () => {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
      endProgrammaticScroll();
    };

    const scrollToStop = (index: number) => {
      const { screen, top } = geometry();
      const target = Math.round(top + index * screen);
      cancelScroll();
      if (!animate) {
        beginProgrammaticScroll();
        window.scrollTo({ top: target, behavior: 'instant' });
        endProgrammaticScroll();
        return;
      }
      // Animated by hand, one frame at a time: a native smooth scroll can't be
      // observed or cancelled, and `html { scroll-behavior: smooth }` would
      // make each step its own smooth scroll, hence `behavior: 'instant'`.
      const from = window.scrollY;
      const distance = target - from;
      const startedAt = performance.now();
      let expectedY = from;
      beginProgrammaticScroll();
      const step = (now: number) => {
        // Something else moved the page (an anchor link, find-in-page): yield to it.
        if (Math.abs(window.scrollY - expectedY) > 2) {
          raf = 0;
          endProgrammaticScroll();
          return;
        }
        const t = Math.min(1, (now - startedAt) / stepMs);
        expectedY = from + distance * easeOutCubic(t);
        window.scrollTo({ top: expectedY, behavior: 'instant' });
        if (t < 1) {
          raf = requestAnimationFrame(step);
          return;
        }
        raf = 0;
        endProgrammaticScroll();
      };
      raf = requestAnimationFrame(step);
    };

    /** A gesture's step: move, then hold off the rest of the gesture. */
    const stepTo = (index: number) => {
      scrollToStop(index);
      lockedUntil = performance.now() + Math.max(STEP_LOCK_MS, stepMs);
      spent = true;
    };

    /** Takes the held gesture once the step in progress is done. */
    const runQueued = () => {
      queueTimer = undefined;
      if (!queued) return;
      const wait = Math.max(raf ? 50 : 0, lockedUntil - performance.now());
      if (wait > 0) {
        queueTimer = setTimeout(runQueued, wait);
        return;
      }
      const direction = queued;
      queued = 0;
      const { progress } = geometry();
      if (!inside(progress)) return;
      const target = Math.round(progress) + direction;
      // Held past either end: the rest of that gesture carries on out of the track.
      if (target < 0 || target > count - 1) {
        spent = false;
        return;
      }
      scrollToStop(target);
      lockedUntil = performance.now() + Math.max(STEP_LOCK_MS, stepMs);
    };

    /** Holds a gesture made during a step; it counts as that gesture's step. */
    const queue = (direction: 1 | -1) => {
      queued = direction;
      spent = true;
      if (!queueTimer) queueTimer = setTimeout(runQueued, 0);
    };

    /**
     * A gesture in `direction` (1 down, -1 up). `ready`: it has travelled far
     * enough to count. Returns true when the track takes it (the page mustn't
     * scroll), false when it belongs to the page.
     */
    const gesture = (direction: 1 | -1, ready: boolean): boolean => {
      // Mid-step the page is between stops on purpose: a new gesture waits its turn.
      if (raf) {
        if (ready && !spent) queue(direction);
        return true;
      }
      const { progress } = geometry();
      if (!inside(progress)) {
        engaged = false;
        return false;
      }

      const current = Math.round(progress);
      const settled = Math.abs(progress - current) < 0.01;

      // Arriving (carried in from above or below): settle on the stop at hand,
      // and let that be this gesture's step.
      if (!engaged) {
        engaged = true;
        if (!settled) stepTo(current);
        else spent = true;
        return true;
      }

      const target = current + direction;
      // Past either end: the gesture carries on out of the track.
      if (settled && (target < 0 || target > count - 1)) {
        if (spent) return true; // …but not the tail of the step that got us here
        engaged = false;
        return false;
      }

      if (ready && !spent) {
        if (performance.now() >= lockedUntil) {
          stepTo(settled ? target : direction > 0 ? Math.ceil(progress) : Math.floor(progress));
        } else {
          queue(direction);
        }
      }
      return true;
    };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return; // pinch zoom, sideways
      // When the event was made, not handled: a busy page handles a steady
      // stream in bursts, which mustn't read as pauses.
      const now = e.timeStamp;
      const direction = e.deltaY > 0 ? 1 : -1;
      const interval = now - lastWheelAt;
      // A pause, or a turn, starts a new gesture: momentum and a spun wheel
      // never pause this long, so their whole run counts as one.
      const paused = interval >= GESTURE_GAP_MS;
      const turned = Math.sign(wheelTravel) !== direction;
      if (paused || turned) wheelSpeeds = [];
      const median = () => [...wheelSpeeds].sort((a, b) => a - b)[wheelSpeeds.length >> 1] ?? 0;
      const current = median();
      const spanned = Math.min(6, Math.max(1, interval / 16.7));
      const frames = current > 0 ? Math.min(spanned, Math.max(1, Math.abs(e.deltaY) / current)) : 1;
      wheelSpeeds = [...wheelSpeeds.slice(-2), Math.abs(e.deltaY) / frames];
      const wheelSpeed = median();
      // So does the stream speeding up again after slowing: a new swipe over momentum.
      const rose =
        wheelSlowing &&
        wheelSpeed >= wheelTrough * WHEEL_RISE &&
        wheelSpeed - wheelTrough >= WHEEL_RISE_MIN;
      if (paused || turned || rose) {
        spent = false;
        wheelTravel = 0;
        wheelPeak = 0;
        wheelTrough = Infinity;
        wheelSlowing = false;
      }
      wheelPeak = Math.max(wheelPeak, wheelSpeed);
      if (wheelSpeed < wheelPeak * WHEEL_DECAY) wheelSlowing = true;
      if (wheelSlowing) wheelTrough = Math.min(wheelTrough, wheelSpeed);
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

    // The blocking listeners, only while the track is near the screen.
    let listening = false;
    const listen = (on: boolean) => {
      if (on === listening) return;
      listening = on;
      if (on) {
        window.addEventListener('wheel', onWheel, { passive: false });
        window.addEventListener('keydown', onKey);
        window.addEventListener('touchstart', onTouchStart, { passive: true });
        window.addEventListener('touchmove', onTouchMove, { passive: false });
      } else {
        window.removeEventListener('wheel', onWheel);
        window.removeEventListener('keydown', onKey);
        window.removeEventListener('touchstart', onTouchStart);
        window.removeEventListener('touchmove', onTouchMove);
        engaged = false;
      }
    };
    const near = new IntersectionObserver(([entry]) => listen(entry.isIntersecting), {
      rootMargin: '50% 0px',
    });
    near.observe(track);

    // Settle anything that slipped through (scrollbar drags) on the nearest stop.
    const gate = createInViewGate(track);
    const unsubscribe = subscribeScroll<null>({
      active: () => gate.current,
      read: () => null,
      write: () => {},
      onIdle: () => {
        if (raf) return;
        const { progress } = geometry();
        if (!inside(progress)) {
          engaged = false;
          return;
        }
        // Resting inside, on a stop: the next gesture is a plain step, not an
        // arrival. No lock, so it can come straight away.
        engaged = true;
        const nearest = Math.round(progress);
        if (Math.abs(progress - nearest) > 0.005) scrollToStop(nearest);
      },
    });

    return () => {
      near.disconnect();
      listen(false);
      clearTimeout(queueTimer);
      cancelScroll();
      unsubscribe();
      gate.disconnect();
    };
  }, [trackRef, count, enabled, screenMode, stepMs]);
}
