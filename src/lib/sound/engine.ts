'use client';

import {
  CHANNEL_LEVELS,
  MASTER_LEVEL,
  SOUND_CUES,
  type SoundChannel,
  type SoundCue,
  type SoundCueId,
} from './sounds';

/**
 * The site's sound engine: one Web Audio graph for every cue.
 *
 *   voice (buffer → gain → pan) → channel gain → master gain → speakers
 *
 * Built to cost nothing until it's used, and next to nothing after:
 *  - Files download when the browser is idle, and not at all while sound is off.
 *  - The AudioContext is created on the first press or key with sound on.
 *    Browsers lock audio until then anyway, so earlier hovers are dropped, not
 *    queued — a late swoosh is worse than none.
 *  - Each file is decoded once and its leading silence measured once, so a play
 *    starts on the first audible sample. Hover sounds live or die on latency.
 *  - A play is two or three throwaway nodes: no React state, no re-render.
 *  - A cooldown and a voice cap per cue keep fast pointer sweeps from stacking.
 *  - The context suspends while the tab is hidden or sound is off, so the audio
 *    thread sleeps.
 */

const STORAGE_KEY = 'sound';
/** Off until the visitor turns it on: browsers block audio before a gesture anyway, so an "on" icon would be a lie. */
const DEFAULT_ENABLED = false;

/** Master fade when sound is switched on or off: long enough not to click. */
const MASTER_FADE_S = 0.08;
/** Fade for a voice cut short to make room for a newer one. */
const STEAL_FADE_S = 0.03;
/** Samples at the head of a file quieter than this (−40 dBFS) count as silence… */
const SILENCE_THRESHOLD = 0.01;
/** …but no more than this much is ever skipped. */
const MAX_TRIM_S = 0.1;
/** How far a spatial cue pans at the very edge of the screen (−1…1). */
const SPATIAL_SPREAD = 0.35;
/** Browsers without requestIdleCallback prefetch after this delay instead. */
const IDLE_FALLBACK_MS = 1500;
/** Browsers only let audio start inside one of these. */
const GESTURES = ['pointerdown', 'keydown', 'touchend'] as const;

export interface PlayOptions {
  /** The element the sound belongs to; spatial cues pan towards it. */
  origin?: Element | null;
  /** Level for this play only, 0–1, on top of the cue's. */
  volume?: number;
}

interface Voice {
  source: AudioBufferSourceNode;
  gain: GainNode;
}

interface Decoded {
  buffer: AudioBuffer;
  /** Seconds of leading silence to skip. */
  offset: number;
}

let enabled: boolean | null = null;
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let suspendTimer: ReturnType<typeof setTimeout> | undefined;

const channels = new Map<SoundChannel, GainNode>();
const downloads = new Map<string, Promise<ArrayBuffer | null>>();
const decoding = new Map<string, Promise<void>>();
const decoded = new Map<string, Decoded>();
const voices = new Map<SoundCueId, Voice[]>();
const lastPlayed = new Map<SoundCueId, number>();
const listeners = new Set<() => void>();

/** Each file once, however many cues share it. */
function soundFiles() {
  return [...new Set(Object.values(SOUND_CUES).map((cue) => cue.src))];
}

/* ---------- Preference ---------- */

function readStoredPreference() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === null ? DEFAULT_ENABLED : stored === 'on';
  } catch {
    return DEFAULT_ENABLED;
  }
}

export function getSoundEnabled(): boolean {
  if (typeof window === 'undefined') return DEFAULT_ENABLED;
  enabled ??= readStoredPreference();
  return enabled;
}

/** The server can't see the visitor's choice; the toggle catches up right after hydration. */
export function getServerSoundEnabled(): boolean {
  return DEFAULT_ENABLED;
}

export function subscribeSoundEnabled(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Call from a click or key handler: switching on may have to start audio, which only a gesture allows. */
export function setSoundEnabled(next: boolean) {
  if (next === getSoundEnabled()) return;
  enabled = next;
  try {
    localStorage.setItem(STORAGE_KEY, next ? 'on' : 'off');
  } catch {
    // Storage blocked (private mode): the choice lasts for this visit.
  }
  for (const listener of listeners) listener();

  if (next) {
    if (ensureContext()) wake();
  } else {
    sleep();
  }
}

/* ---------- Audio graph ---------- */

function ensureContext(): AudioContext | null {
  if (ctx) return ctx;
  if (typeof AudioContext === 'undefined') return null;
  try {
    ctx = new AudioContext({ latencyHint: 'interactive' });
  } catch {
    return null;
  }

  master = ctx.createGain();
  master.gain.value = MASTER_LEVEL;
  master.connect(ctx.destination);
  for (const [channel, level] of Object.entries(CHANNEL_LEVELS) as [SoundChannel, number][]) {
    const gain = ctx.createGain();
    gain.gain.value = level;
    gain.connect(master);
    channels.set(channel, gain);
  }

  for (const src of soundFiles()) void decode(src);
  return ctx;
}

function rampMaster(level: number) {
  if (!ctx || !master) return;
  const { gain } = master;
  const t = ctx.currentTime;
  gain.cancelScheduledValues(t);
  gain.setValueAtTime(gain.value, t);
  gain.linearRampToValueAtTime(level, t + MASTER_FADE_S);
}

/** Start (or restart) the audio thread and fade the mix in. */
function wake() {
  if (!ctx) return;
  clearTimeout(suspendTimer);
  if (ctx.state !== 'running') ctx.resume().catch(() => {});
  rampMaster(MASTER_LEVEL);
}

/** Fade the mix out, then let the audio thread sleep. */
function sleep() {
  if (!ctx) return;
  rampMaster(0);
  clearTimeout(suspendTimer);
  suspendTimer = setTimeout(() => {
    if (!getSoundEnabled()) ctx?.suspend().catch(() => {});
  }, MASTER_FADE_S * 1000 + 50);
}

/* ---------- Loading ---------- */

function download(src: string): Promise<ArrayBuffer | null> {
  let job = downloads.get(src);
  if (!job) {
    job = fetch(src)
      .then((response) => (response.ok ? response.arrayBuffer() : null))
      .catch(() => null);
    downloads.set(src, job);
  }
  return job;
}

function decode(src: string): Promise<void> {
  let job = decoding.get(src);
  if (!job) {
    job = download(src)
      .then((data) => {
        if (!data || !ctx) throw new Error(`Sound unavailable: ${src}`);
        return ctx.decodeAudioData(data);
      })
      .then((buffer) => {
        decoded.set(src, { buffer, offset: leadingSilence(buffer) });
      })
      .catch(() => {
        // Decoding consumes the bytes, and a failure shouldn't stick: the next play retries.
        downloads.delete(src);
        decoding.delete(src);
      });
    decoding.set(src, job);
  }
  return job;
}

/** Seconds before the first audible sample on any channel, capped at MAX_TRIM_S. */
function leadingSilence(buffer: AudioBuffer) {
  let first = Math.min(buffer.length, Math.round(buffer.sampleRate * MAX_TRIM_S));
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const samples = buffer.getChannelData(c);
    for (let i = 0; i < first; i++) {
      if (Math.abs(samples[i]) > SILENCE_THRESHOLD) {
        first = i;
        break;
      }
    }
  }
  return first / buffer.sampleRate;
}

/* ---------- Playing ---------- */

/** True when a play would be heard: sound on, audio unlocked and running. */
export function isSoundReady(): boolean {
  return ctx !== null && ctx.state === 'running' && getSoundEnabled();
}

const spread = (amount: number) => (Math.random() * 2 - 1) * amount;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function panTowards(el: Element) {
  const { left, width } = el.getBoundingClientRect();
  const x = (left + width / 2) / window.innerWidth;
  return clamp((x * 2 - 1) * SPATIAL_SPREAD, -1, 1);
}

/** Fade a voice out quickly and stop it. */
function release({ source, gain }: Voice) {
  if (!ctx) return;
  const t = ctx.currentTime;
  gain.gain.cancelScheduledValues(t);
  gain.gain.setValueAtTime(gain.gain.value, t);
  gain.gain.linearRampToValueAtTime(0, t + STEAL_FADE_S);
  source.stop(t + STEAL_FADE_S);
}

/** Play a cue. Silently does nothing when sound is off, locked, or the file isn't decoded yet. */
export function playSound(id: SoundCueId, { origin, volume = 1 }: PlayOptions = {}) {
  if (!ctx || ctx.state !== 'running' || !getSoundEnabled()) return;
  const cue: SoundCue = SOUND_CUES[id];
  const channel = channels.get(cue.channel);
  const sound = decoded.get(cue.src);
  if (!channel) return;
  if (!sound) {
    void decode(cue.src);
    return;
  }

  const now = performance.now();
  if (now - (lastPlayed.get(id) ?? -Infinity) < cue.cooldownMs) return;
  lastPlayed.set(id, now);

  const playing = voices.get(id) ?? [];
  voices.set(id, playing);
  for (const voice of playing.splice(0, playing.length - cue.maxVoices + 1)) release(voice);

  const source = ctx.createBufferSource();
  source.buffer = sound.buffer;
  if (cue.detune) source.detune.value = spread(cue.detune);

  const gain = ctx.createGain();
  gain.gain.value = clamp(cue.volume * volume * (1 + spread(cue.volumeJitter ?? 0)), 0, 1);
  source.connect(gain);

  let output: AudioNode = gain;
  if (cue.spatial && origin) {
    const panner = ctx.createStereoPanner();
    panner.pan.value = panTowards(origin);
    gain.connect(panner);
    output = panner;
  }
  output.connect(channel);

  const voice: Voice = { source, gain };
  playing.push(voice);
  source.onended = () => {
    const index = playing.indexOf(voice);
    if (index >= 0) playing.splice(index, 1);
    source.disconnect();
    gain.disconnect();
    if (output !== gain) output.disconnect();
  };
  source.start(ctx.currentTime, sound.offset);
}

/* ---------- Page wiring ---------- */

/** Unlock on a gesture. Stays attached: iOS can interrupt a running context, and only a gesture restarts it. */
function onGesture() {
  if (document.hidden || !getSoundEnabled() || ctx?.state === 'running') return;
  if (ensureContext()) wake();
}

function onVisibilityChange() {
  if (!ctx) return;
  if (document.hidden) ctx.suspend().catch(() => {});
  else if (getSoundEnabled()) ctx.resume().catch(() => {});
}

/** Attach the engine to the page. Returns the teardown; the audio graph itself is kept. */
export function installSound(): () => void {
  for (const type of GESTURES) window.addEventListener(type, onGesture, { capture: true, passive: true });
  document.addEventListener('visibilitychange', onVisibilityChange);

  // Have the bytes ready before the first gesture, so unlocking only has to decode.
  const prefetch = () => {
    if (getSoundEnabled()) for (const src of soundFiles()) void download(src);
  };
  const hasIdleCallback = typeof window.requestIdleCallback === 'function';
  const handle = hasIdleCallback
    ? window.requestIdleCallback(prefetch)
    : window.setTimeout(prefetch, IDLE_FALLBACK_MS);

  return () => {
    for (const type of GESTURES) window.removeEventListener(type, onGesture, { capture: true });
    document.removeEventListener('visibilitychange', onVisibilityChange);
    if (hasIdleCallback) window.cancelIdleCallback(handle);
    else window.clearTimeout(handle);
  };
}
