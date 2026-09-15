'use client';

import { isSoundReady, playSound } from './engine';
import { isSoundCue, type SoundCueId } from './sounds';

/**
 * Declarative sounds for interaction states. A component opts in with
 * attributes instead of wiring its own handlers, which also works in server
 * components:
 *
 *   <a href="/work" {...soundTriggers({ hover: 'linkHover', press: 'linkPress' })}>
 *
 * Four document listeners serve the whole site, and each returns at once while
 * sound can't play (switched off, or audio not unlocked yet).
 *
 *  - hover:     the mouse enters the element (a tap isn't a hover).
 *  - focus:     keyboard focus lands on it — :focus-visible, like the visual state.
 *  - press:     a primary press, or Enter / Space, on it — the :active moment.
 *  - animation: a CSS animation starts on the element itself — fade-ins,
 *               fade-outs, random motion. Fires after any animation-delay.
 */

const ATTRIBUTES = {
  hover: 'data-sound-hover',
  focus: 'data-sound-focus',
  press: 'data-sound-press',
  animation: 'data-sound-animation',
} as const;

export type SoundTrigger = keyof typeof ATTRIBUTES;

/** The data attributes that attach cues to an element's states. */
export function soundTriggers(cues: Partial<Record<SoundTrigger, SoundCueId>>): Record<string, string> {
  const attributes: Record<string, string> = {};
  for (const [trigger, cue] of Object.entries(cues)) {
    if (cue) attributes[ATTRIBUTES[trigger as SoundTrigger]] = cue;
  }
  return attributes;
}

const LISTENER_OPTIONS = { capture: true, passive: true } as const;

function hostOf(target: EventTarget | null, attribute: string) {
  return target instanceof Element ? target.closest(`[${attribute}]`) : null;
}

function playFrom(host: Element, attribute: string) {
  const id = host.getAttribute(attribute);
  if (isSoundCue(id)) {
    playSound(id, { origin: host });
  } else if (process.env.NODE_ENV !== 'production') {
    console.warn(`Unknown sound cue "${id}" in ${attribute}`, host);
  }
}

function onPointerOver(e: PointerEvent) {
  if (e.pointerType !== 'mouse' || !isSoundReady()) return;
  const host = hostOf(e.target, ATTRIBUTES.hover);
  // Moving between the element's own children isn't entering it.
  if (!host || (e.relatedTarget instanceof Node && host.contains(e.relatedTarget))) return;
  playFrom(host, ATTRIBUTES.hover);
}

function onFocusIn(e: FocusEvent) {
  if (!isSoundReady() || !(e.target instanceof Element) || !e.target.matches(':focus-visible')) return;
  const host = hostOf(e.target, ATTRIBUTES.focus);
  if (host) playFrom(host, ATTRIBUTES.focus);
}

function onPointerDown(e: PointerEvent) {
  if (e.button !== 0 || !isSoundReady()) return;
  const host = hostOf(e.target, ATTRIBUTES.press);
  if (host) playFrom(host, ATTRIBUTES.press);
}

function onKeyDown(e: KeyboardEvent) {
  if (e.repeat || (e.key !== 'Enter' && e.key !== ' ') || !isSoundReady()) return;
  const host = hostOf(e.target, ATTRIBUTES.press);
  if (host) playFrom(host, ATTRIBUTES.press);
}

function onAnimationStart(e: AnimationEvent) {
  // Only the animated element itself: animation events bubble up from its children too.
  if (!isSoundReady() || !(e.target instanceof Element) || !e.target.hasAttribute(ATTRIBUTES.animation)) return;
  playFrom(e.target, ATTRIBUTES.animation);
}

/** Attach the document listeners. Returns the teardown. */
export function installSoundTriggers(): () => void {
  document.addEventListener('pointerover', onPointerOver, LISTENER_OPTIONS);
  document.addEventListener('focusin', onFocusIn, LISTENER_OPTIONS);
  document.addEventListener('pointerdown', onPointerDown, LISTENER_OPTIONS);
  document.addEventListener('keydown', onKeyDown, LISTENER_OPTIONS);
  document.addEventListener('animationstart', onAnimationStart, LISTENER_OPTIONS);
  return () => {
    document.removeEventListener('pointerover', onPointerOver, LISTENER_OPTIONS);
    document.removeEventListener('focusin', onFocusIn, LISTENER_OPTIONS);
    document.removeEventListener('pointerdown', onPointerDown, LISTENER_OPTIONS);
    document.removeEventListener('keydown', onKeyDown, LISTENER_OPTIONS);
    document.removeEventListener('animationstart', onAnimationStart, LISTENER_OPTIONS);
  };
}
