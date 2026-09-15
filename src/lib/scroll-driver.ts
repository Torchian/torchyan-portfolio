'use client';

/**
 * A single scroll listener and a single rAF for the whole page.
 *
 * Several effects on the homepage are scroll-linked (the What I Do reveals, the
 * Selected Work magnification and snap). Each used to own its own listener and
 * rAF, so every frame ran several read-layout-then-write-style callbacks back to
 * back — and each callback's writes invalidated layout for the next one's reads,
 * forcing a synchronous layout per callback. Here every subscriber's reads run
 * first and every subscriber's writes run after, so the browser lays out once
 * per frame however many subscribers there are.
 *
 * It also owns what no single subscriber can know on its own: whether the user
 * is still mid-gesture, and whether the current scroll is one we're animating.
 */

/** Quiet period (no scroll events, no live gesture) before scrolling counts as stopped. */
const IDLE_MS = 120;

/**
 * Trackpad momentum keeps emitting wheel events after the fingers lift, so the
 * gesture counts as live until they've stopped arriving for this long.
 */
const WHEEL_GESTURE_GRACE_MS = 90;

/** Keys that scroll the page — pressing one interrupts our own scroll animations. */
const SCROLL_KEYS = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ']);

export interface ScrollFrame {
  /** `window.scrollY` for this frame. */
  readonly y: number;
  /** `window.innerHeight` for this frame. */
  readonly vh: number;
  /**
   * Direction of the last scroll the USER made. Frozen while a programmatic
   * scroll is running, so an animation can't be mistaken for user intent.
   */
  readonly direction: 1 | -1;
  /** `getBoundingClientRect()`, memoised for the rest of the frame. */
  rect(el: Element): DOMRect;
}

export interface ScrollSubscriber<Data> {
  /** Cheap gate — when it returns false the subscriber is skipped entirely. */
  active?(): boolean;
  /** Layout reads only. */
  read?(frame: ScrollFrame): Data;
  /** Style writes only, given what `read` returned this frame. */
  write?(frame: ScrollFrame, data: Data): void;
  /** Called once scrolling has genuinely stopped. */
  onIdle?(frame: ScrollFrame): void;
}

type AnySubscriber = ScrollSubscriber<unknown>;

const subscribers = new Set<AnySubscriber>();
const inputListeners = new Set<() => void>();
const rectCache = new Map<Element, DOMRect>();

let started = false;
let rafId = 0;
let idleTimer: ReturnType<typeof setTimeout> | undefined;
let wheelTimer: ReturnType<typeof setTimeout> | undefined;
let lastY = 0;
let direction: 1 | -1 = 1;
let gesturing = false;
let programmaticDepth = 0;
let layoutObserver: ResizeObserver | undefined;

function rect(el: Element): DOMRect {
  let r = rectCache.get(el);
  if (!r) {
    r = el.getBoundingClientRect();
    rectCache.set(el, r);
  }
  return r;
}

function makeFrame(): ScrollFrame {
  return { y: window.scrollY, vh: window.innerHeight, direction, rect };
}

/**
 * A zero-height viewport (a hidden or collapsed frame) has no meaningful layout,
 * and subscribers divide by the viewport height — skipping the frame avoids
 * writing NaN into CSS variables, which invalidates the whole declaration using
 * them (e.g. a card's entire `transform`, rotation included).
 */
function hasViewport() {
  return window.innerHeight > 0;
}

function runFrame() {
  rafId = 0;
  if (!hasViewport()) return;
  const y = window.scrollY;
  if (y !== lastY && programmaticDepth === 0) direction = y > lastY ? 1 : -1;
  lastY = y;

  rectCache.clear();
  const frame = makeFrame();
  const pending: Array<[AnySubscriber, unknown]> = [];
  for (const sub of subscribers) {
    if (sub.active && !sub.active()) continue;
    pending.push([sub, sub.read?.(frame)]);
  }
  for (const [sub, data] of pending) sub.write?.(frame, data);
  rectCache.clear();
}

/** Schedule a driven frame (at most one per animation frame). */
export function requestScrollFrame() {
  if (!rafId) rafId = requestAnimationFrame(runFrame);
}

function fireIdle() {
  // A live gesture or our own animation will re-arm this when it ends.
  if (gesturing || programmaticDepth > 0 || !hasViewport()) return;
  rectCache.clear();
  const frame = makeFrame();
  for (const sub of subscribers) {
    if (sub.active && !sub.active()) continue;
    sub.onIdle?.(frame);
  }
  rectCache.clear();
}

function armIdle() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(fireIdle, IDLE_MS);
}

function notifyInput() {
  for (const listener of inputListeners) listener();
}

function onScroll() {
  requestScrollFrame();
  armIdle();
}

function onWheel() {
  gesturing = true;
  notifyInput();
  clearTimeout(wheelTimer);
  wheelTimer = setTimeout(() => {
    gesturing = false;
    armIdle();
  }, WHEEL_GESTURE_GRACE_MS);
}

function onTouchStart() {
  gesturing = true;
  notifyInput();
}

function onTouchEnd() {
  gesturing = false;
  armIdle();
}

// Mouse only: dragging the scrollbar scrolls without wheel events. Touch goes
// through touchstart/touchend instead, because the browser fires pointercancel
// as soon as a finger starts panning — while the finger is still down.
function onPointerDown(e: PointerEvent) {
  if (e.pointerType !== 'mouse') return;
  gesturing = true;
  notifyInput();
}

function onPointerUp(e: PointerEvent) {
  if (e.pointerType !== 'mouse') return;
  gesturing = false;
  armIdle();
}

function onKeyDown(e: KeyboardEvent) {
  if (SCROLL_KEYS.has(e.key)) notifyInput();
}

function onBlur() {
  // A release outside the window never reaches us; don't stay stuck "gesturing".
  gesturing = false;
  armIdle();
}

function onResize() {
  requestScrollFrame();
  armIdle();
}

/**
 * Layout also changes without any scroll or resize: fonts swapping in, images
 * loading, the browser restoring a reload's scroll position once the page is
 * tall enough. Run a frame then too, so no effect keeps values it measured
 * against a layout that no longer exists. (No idle timer: a late image
 * shouldn't make Selected Work snap.)
 */
function onLayoutChange() {
  requestScrollFrame();
}

function start() {
  started = true;
  lastY = window.scrollY;
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('wheel', onWheel, { passive: true });
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchend', onTouchEnd, { passive: true });
  window.addEventListener('touchcancel', onTouchEnd, { passive: true });
  window.addEventListener('pointerdown', onPointerDown, { passive: true });
  window.addEventListener('pointerup', onPointerUp, { passive: true });
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('blur', onBlur);
  window.addEventListener('resize', onResize);
  window.addEventListener('load', onLayoutChange);
  document.fonts?.ready.then(() => {
    if (started) requestScrollFrame();
  });
  layoutObserver = new ResizeObserver(onLayoutChange);
  layoutObserver.observe(document.documentElement);
}

function stop() {
  started = false;
  window.removeEventListener('scroll', onScroll);
  window.removeEventListener('wheel', onWheel);
  window.removeEventListener('touchstart', onTouchStart);
  window.removeEventListener('touchend', onTouchEnd);
  window.removeEventListener('touchcancel', onTouchEnd);
  window.removeEventListener('pointerdown', onPointerDown);
  window.removeEventListener('pointerup', onPointerUp);
  window.removeEventListener('keydown', onKeyDown);
  window.removeEventListener('blur', onBlur);
  window.removeEventListener('resize', onResize);
  window.removeEventListener('load', onLayoutChange);
  layoutObserver?.disconnect();
  layoutObserver = undefined;
  cancelAnimationFrame(rafId);
  rafId = 0;
  clearTimeout(idleTimer);
  clearTimeout(wheelTimer);
  gesturing = false;
}

/** Subscribe to driven scroll frames. Returns the unsubscribe function. */
export function subscribeScroll<Data>(subscriber: ScrollSubscriber<Data>): () => void {
  const sub = subscriber as AnySubscriber;
  subscribers.add(sub);
  if (!started) start();
  requestScrollFrame();
  return () => {
    subscribers.delete(sub);
    if (subscribers.size === 0) stop();
  };
}

/**
 * Wrap a scroll animation we drive ourselves: freezes user-direction tracking
 * and holds off idle callbacks until the matching end call.
 */
export function beginProgrammaticScroll() {
  programmaticDepth++;
}

export function endProgrammaticScroll() {
  programmaticDepth = Math.max(0, programmaticDepth - 1);
  lastY = window.scrollY;
  armIdle();
}

/**
 * Fires on wheel, touchstart, mouse press and scroll keys — anything that means
 * the user is taking over. Returns the unsubscribe function.
 */
export function onUserInput(listener: () => void): () => void {
  inputListeners.add(listener);
  return () => {
    inputListeners.delete(listener);
  };
}

/**
 * Tracks whether `el` is near the viewport, for use as a subscriber's `active`
 * gate so off-screen effects do no work at all. The generous default margin (a
 * full viewport above and below) means an effect is back up to date before it
 * scrolls into view, even on a fast fling.
 */
export function createInViewGate(el: Element, rootMargin = '100% 0px') {
  // Until the observer's first (async) callback, report visible so the very
  // first frame still initialises the effect.
  let known = false;
  let visible = false;
  const observer = new IntersectionObserver(
    ([entry]) => {
      const wasVisible = visible;
      visible = entry.isIntersecting;
      known = true;
      if (visible && !wasVisible) requestScrollFrame();
    },
    { rootMargin },
  );
  observer.observe(el);
  return {
    get current() {
      return !known || visible;
    },
    disconnect: () => observer.disconnect(),
  };
}
