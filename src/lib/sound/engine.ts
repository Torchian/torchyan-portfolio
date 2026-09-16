'use client';

import {
  CHANNEL_LEVELS,
  MASTER_LEVEL,
  MUSIC,
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
 *  - The music bed is one looping voice on the ambient channel, fading in with
 *    the mix and out again when music is switched off.
 *
 * Effects and music are two separate switches, each with its own control in the
 * header. Either one holds the audio graph open; with both off it sleeps.
 */

/**
 * Every visit starts silent — a site that starts talking because of something
 * you clicked last week is worse than one you switch on again, and browsers
 * block audio before a gesture anyway, so an "on" button on arrival would be a
 * lie. The choice does follow you through this tab, though (session storage):
 * switching language reloads the page, and sound cutting out there would be a
 * bug, not a fresh visit.
 */
const STORAGE_KEYS = { effects: 'sound.effects', music: 'sound.music' } as const;
const DEFAULT_ENABLED = false;

/** The two switches: interface sounds, and the music bed. */
export type AudioKind = keyof typeof STORAGE_KEYS;

/** Master fade when sound is switched on or off: long enough not to click. */
const MASTER_FADE_S = 0.08;
/** Fade for a voice cut short to make room for a newer one. */
const STEAL_FADE_S = 0.03;
/** The music bed comes up gently, and leaves a little quicker. */
const MUSIC_FADE_IN_S = 2;
const MUSIC_FADE_OUT_S = 0.8;
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
/**
 * Moving or scrolling isn't a gesture a browser will unlock audio for, but by
 * then it may allow one anyway — Chrome lets a site it considers engaged resume
 * on its own. Worth one quiet attempt when sound is already on from before;
 * after that these come off and a real gesture takes over.
 */
const NUDGES = ['pointermove', 'wheel', 'scroll'] as const;

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

const enabled: Record<AudioKind, boolean | null> = { effects: null, music: null };
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let suspendTimer: ReturnType<typeof setTimeout> | undefined;
let music: Voice | null = null;

const channels = new Map<SoundChannel, GainNode>();
const downloads = new Map<string, Promise<ArrayBuffer | null>>();
const decoding = new Map<string, Promise<void>>();
const decoded = new Map<string, Decoded>();
const voices = new Map<SoundCueId, Voice[]>();
const lastPlayed = new Map<SoundCueId, number>();
const listeners = new Set<() => void>();

/** The files each switch needs: cue files once each, and the bed's own track. */
function soundFiles(kind?: AudioKind) {
  const cues = [...new Set(Object.values(SOUND_CUES).map((cue) => cue.src))];
  if (kind === 'effects') return cues;
  if (kind === 'music') return [MUSIC.src];
  return [...cues, MUSIC.src];
}

/** What's worth downloading and decoding right now. */
function wantedFiles() {
  return [...(isEnabled('effects') ? soundFiles('effects') : []), ...(isEnabled('music') ? soundFiles('music') : [])];
}

/* ---------- Preference ---------- */

function readStoredPreference(kind: AudioKind) {
  try {
    return sessionStorage.getItem(STORAGE_KEYS[kind]) === 'on';
  } catch {
    return DEFAULT_ENABLED;
  }
}

export function isEnabled(kind: AudioKind): boolean {
  if (typeof window === 'undefined') return DEFAULT_ENABLED;
  enabled[kind] ??= readStoredPreference(kind);
  return enabled[kind];
}

/** Either switch keeps the audio graph awake. */
function anyEnabled() {
  return isEnabled('effects') || isEnabled('music');
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
export function setEnabled(kind: AudioKind, next: boolean) {
  if (next === isEnabled(kind)) return;
  enabled[kind] = next;
  try {
    sessionStorage.setItem(STORAGE_KEYS[kind], next ? 'on' : 'off');
  } catch {
    // Storage blocked (private mode): the choice lasts until the next page load.
  }
  for (const listener of listeners) listener();

  if (anyEnabled()) {
    if (ensureContext()) wake();
    // Switched on after the graph was built: its files still have to be fetched,
    // or the first cue would be dropped while it decodes.
    if (next) for (const src of soundFiles(kind)) void decode(src);
    if (kind === 'music' && !next) stopMusic();
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

  for (const src of wantedFiles()) void decode(src);
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
  if (isEnabled('music')) startMusic();
}

/** Fade the mix out, then let the audio thread sleep. */
function sleep() {
  if (!ctx) return;
  stopMusic();
  rampMaster(0);
  clearTimeout(suspendTimer);
  suspendTimer = setTimeout(() => {
    if (!anyEnabled()) ctx?.suspend().catch(() => {});
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

/* ---------- Music ---------- */

/** Ride the bed's level; its own gain, under the ambient channel. */
function rampMusic(level: number, seconds: number) {
  if (!ctx || !music) return;
  const { gain } = music;
  const t = ctx.currentTime;
  gain.gain.cancelScheduledValues(t);
  gain.gain.setValueAtTime(gain.gain.value, t);
  gain.gain.linearRampToValueAtTime(level, t + seconds);
}

/**
 * Bring the bed in, starting it the first time. One voice serves the whole
 * visit: switching sound off only fades it down, and the suspended context
 * pauses it where it is, so it can never end up playing over itself. The loop
 * points come from the file's own musical length, so the decoder's padding is
 * never heard.
 */
function startMusic() {
  if (!ctx || !isEnabled('music')) return;
  if (music) {
    rampMusic(MUSIC.volume, MUSIC_FADE_IN_S);
    return;
  }

  const channel = channels.get(MUSIC.channel);
  const sound = decoded.get(MUSIC.src);
  if (!channel) return;
  if (!sound) {
    void decode(MUSIC.src).then(() => {
      if (ctx?.state === 'running') startMusic();
    });
    return;
  }

  const source = ctx.createBufferSource();
  source.buffer = sound.buffer;
  source.loop = true;
  source.loopStart = sound.offset;
  /* Safari keeps the AAC priming silence, so the loop is measured from the first
     audible sample; clamped in case a decoder hands back a shorter buffer. */
  source.loopEnd = Math.min(sound.offset + MUSIC.loopSeconds, sound.buffer.duration);

  const gain = ctx.createGain();
  gain.gain.value = 0;
  source.connect(gain);
  gain.connect(channel);

  music = { source, gain };
  source.start(ctx.currentTime, sound.offset);
  rampMusic(MUSIC.volume, MUSIC_FADE_IN_S);
}

/** Fade the bed down. The voice keeps running, silent, ready for the next wake. */
function stopMusic() {
  rampMusic(0, MUSIC_FADE_OUT_S);
}

/* ---------- Playing ---------- */

/** True when a play would be heard: sound on, audio unlocked and running. */
export function isSoundReady(): boolean {
  return ctx !== null && ctx.state === 'running' && isEnabled('effects');
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
  if (!ctx || ctx.state !== 'running' || !isEnabled('effects')) return;
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
  if (document.hidden || !anyEnabled() || ctx?.state === 'running') return;
  if (ensureContext()) wake();
}

/**
 * Sound was already on when this page loaded — a reload, or the page change a
 * language switch makes. The choice was the visitor's, so try to pick the sound
 * back up without making them click again: build the graph (which also starts
 * the decodes) and ask to resume. Browsers may refuse until a real gesture, and
 * then the listeners above take it.
 */
function resumeFromPreference() {
  if (!anyEnabled() || document.hidden) return;
  if (ensureContext()) wake();
}

function onVisibilityChange() {
  if (!ctx) return;
  if (document.hidden) ctx.suspend().catch(() => {});
  else if (anyEnabled()) ctx.resume().catch(() => {});
}

/**
 * Tear the whole graph down: the music stops, the context closes and every
 * decode is dropped. Called when the provider unmounts — in development that is
 * also every hot reload, and without it the reloaded module would build a second
 * graph while this one kept playing, two copies of the loop drifting apart.
 */
function teardownAudio() {
  if (!ctx) return;
  const dying = ctx;
  music?.source.stop();
  music = null;
  ctx = null;
  master = null;
  channels.clear();
  decoded.clear();
  decoding.clear();
  downloads.clear();
  voices.clear();
  clearTimeout(suspendTimer);
  dying.close().catch(() => {});
}

/** Attach the engine to the page. Returns the teardown, which closes the audio graph. */
export function installSound(): () => void {
  for (const type of GESTURES) window.addEventListener(type, onGesture, { capture: true, passive: true });
  document.addEventListener('visibilitychange', onVisibilityChange);

  // One attempt per movement kind, then they're done: mousemove fires far too
  // often to be asking the browser for audio each time.
  const onNudge = () => {
    dropNudges();
    onGesture();
  };
  const dropNudges = () => {
    for (const type of NUDGES) window.removeEventListener(type, onNudge, { capture: true });
  };
  for (const type of NUDGES) window.addEventListener(type, onNudge, { capture: true, passive: true, once: true });

  resumeFromPreference();

  // Have the bytes ready before the first gesture, so unlocking only has to decode.
  const prefetch = () => {
    for (const src of wantedFiles()) void download(src);
  };
  const hasIdleCallback = typeof window.requestIdleCallback === 'function';
  const handle = hasIdleCallback
    ? window.requestIdleCallback(prefetch)
    : window.setTimeout(prefetch, IDLE_FALLBACK_MS);

  return () => {
    for (const type of GESTURES) window.removeEventListener(type, onGesture, { capture: true });
    dropNudges();
    document.removeEventListener('visibilitychange', onVisibilityChange);
    if (hasIdleCallback) window.cancelIdleCallback(handle);
    else window.clearTimeout(handle);
    teardownAudio();
  };
}
