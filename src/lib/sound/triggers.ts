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
 *  - hover:     the mouse enters the element (a tap isn't a hover). Every link and
 *               button plays DEFAULT_HOVER without asking; an element only needs
 *               the attribute to play something else.
 *  - focus:     keyboard focus lands on it — :focus-visible, like the visual state.
 *               Form fields are the exception: a radio, text field or select
 *               sounds whenever it takes focus, by pointer or by keyboard, since
 *               that is the moment it answers you.
 *  - press:     a primary press, or Enter / Space, on it — the :active moment.
 *               Like hover, every link and button plays DEFAULT_PRESS without
 *               asking; the attribute is only for playing something else.
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

/** Hovering or pressing anything interactive sounds, so no component has to repeat the cue. */
const DEFAULT_HOVER: SoundCueId = 'uiHover';
const DEFAULT_PRESS: SoundCueId = 'uiPress';
const FIELD_CUE: SoundCueId = 'fieldFocus';

/** What a press sounds on: the things you click to go somewhere or do something. */
const PRESSABLE = 'a[href], button:not([disabled]), [role="button"], summary';

/**
 * Form fields have their own cue, on focus rather than on press: clicking one
 * focuses it anyway, so focus catches the pointer and the keyboard both, and
 * only once.
 */
const FIELD = 'input:not([type="hidden"]), textarea, select';
/** The controls a key can act on; a text field is left out, or typing a space would sound. */
const KEY_FIELD = 'input[type="radio"], input[type="checkbox"], select';

/** Hover covers everything interactive, fields included. */
const HOVERABLE = `${PRESSABLE}, ${FIELD}, label:has(input), label:has(textarea), label:has(select)`;

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
  const tagged = hostOf(e.target, ATTRIBUTES.hover);
  const host = tagged ?? (e.target instanceof Element ? e.target.closest(HOVERABLE) : null);
  // Moving between the element's own children isn't entering it.
  if (!host || (e.relatedTarget instanceof Node && host.contains(e.relatedTarget))) return;
  if (tagged) playFrom(tagged, ATTRIBUTES.hover);
  else playSound(DEFAULT_HOVER, { origin: host });
}

function onFocusIn(e: FocusEvent) {
  if (!isSoundReady() || !(e.target instanceof Element)) return;
  const tagged = hostOf(e.target, ATTRIBUTES.focus);
  if (tagged) {
    if (e.target.matches(':focus-visible')) playFrom(tagged, ATTRIBUTES.focus);
    return;
  }
  // A field's own cue: however it was reached, this is the moment it opens up.
  if (e.target.matches(FIELD)) playSound(FIELD_CUE, { origin: e.target });
}

function onPointerDown(e: PointerEvent) {
  if (e.button !== 0 || !isSoundReady()) return;
  playPress(e.target);
}

function onKeyDown(e: KeyboardEvent) {
  if (e.repeat || (e.key !== 'Enter' && e.key !== ' ') || !isSoundReady()) return;
  // Choosing a radio or an option with the keyboard: its own cue, not a press.
  if (e.target instanceof Element && e.target.matches(KEY_FIELD)) {
    playSound(FIELD_CUE, { origin: e.target });
    return;
  }
  playPress(e.target);
}

/** The element's own press cue, or the site-wide one if it's a link or button. */
function playPress(target: EventTarget | null) {
  const tagged = hostOf(target, ATTRIBUTES.press);
  if (tagged) {
    playFrom(tagged, ATTRIBUTES.press);
    return;
  }
  const host = target instanceof Element ? target.closest(PRESSABLE) : null;
  if (host) playSound(DEFAULT_PRESS, { origin: host });
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
