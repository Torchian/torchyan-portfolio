/**
 * Every sound on the site, named for the moment it accompanies. Components ask
 * for a cue (`navLine`), never a file, so a sound is swapped or retuned here alone.
 *
 * Adding one:
 *  1. Put the file in /public/sounds: short, mono, MP3 (decodes in every browser).
 *     Leading silence doesn't need trimming — the engine skips it.
 *  2. Add a cue below and pick its channel.
 *  3. Fire it with `playSound('cue', { origin })` from code, or spread
 *     `soundTriggers({ hover: 'cue' })` onto the element.
 */

/** Mix groups, one per kind of moment, each with its own level under the master. */
export type SoundChannel = 'hover' | 'interaction' | 'transition' | 'ambient';

export const MASTER_LEVEL = 0.8;

/**
 * Every interface sound sits at the same level, −14 dBFS peak, so nothing in
 * front jumps out; the bed sits 12 dB under it at −26. The cue files are all
 * peak-normalised, so a shared channel level and a shared cue volume is all it
 * takes: 0.9 × 0.4 × 0.7 × 0.8 = 0.20 (−13.9 dBFS).
 */
export const CHANNEL_LEVELS: Record<SoundChannel, number> = {
  /** Pointer hovers. */
  hover: 0.7,
  /** Keyboard focus and presses (:focus-visible, :active). */
  interaction: 0.7,
  /** Things fading or sliding in and out. */
  transition: 0.7,
  /** Idle and random motion: the bed, well under everything else. */
  ambient: 0.35,
};

/** One level for every cue, so they balance by construction (see CHANNEL_LEVELS). */
const CUE_VOLUME = 0.4;

export interface SoundCue {
  src: string;
  channel: SoundChannel;
  /** 0–1, on top of the channel level. */
  volume: number;
  /** A play sooner than this after the previous one is dropped, so fast sweeps don't machine-gun. */
  cooldownMs: number;
  /** Copies allowed to overlap; the oldest fades out to make room for a new one. */
  maxVoices: number;
  /** Random pitch spread per play, ± cents, so repeats don't sound identical. */
  detune?: number;
  /** Random level spread per play, ± fraction of `volume`. */
  volumeJitter?: number;
  /** Pan towards the element that played it: a link on the left sounds from the left. */
  spatial?: boolean;
}

export const SOUND_CUES = {
  /** Any link or button under the pointer: the site-wide hover cue (see triggers.ts). */
  uiHover: {
    src: '/sounds/ui-hover.wav',
    channel: 'hover',
    /* No detune or jitter: every link and button sounds exactly the same. */
    volume: CUE_VOLUME,
    cooldownMs: 90,
    maxVoices: 2,
    spatial: true,
  },
  /** Pressing a link, button, radio or select: the click itself, pointer or keyboard (see triggers.ts). */
  uiPress: {
    src: '/sounds/click.wav',
    channel: 'interaction',
    volume: CUE_VOLUME,
    cooldownMs: 60,
    maxVoices: 2,
    spatial: true,
  },
  /** A form field taking focus: a radio, a text field or a select (see triggers.ts). */
  fieldFocus: {
    src: '/sounds/field.wav',
    channel: 'interaction',
    volume: CUE_VOLUME,
    cooldownMs: 60,
    maxVoices: 2,
    spatial: true,
  },
  /** The language list opening under the switcher. */
  languageOpen: {
    src: '/sounds/language-open.wav',
    channel: 'interaction',
    volume: CUE_VOLUME,
    cooldownMs: 120,
    maxVoices: 1,
  },
  /** …and closing again. */
  languageClose: {
    src: '/sounds/language-close.wav',
    channel: 'interaction',
    volume: CUE_VOLUME,
    cooldownMs: 120,
    maxVoices: 1,
  },
} as const satisfies Record<string, SoundCue>;

/**
 * The background bed: one looping track under everything, low enough to leave
 * every cue in front of it. The track keeps its own arrangement and level —
 * only its silent head is trimmed, with a short fade in and out at the ends, so
 * each pass round the loop eases rather than cuts. `loopSeconds` is that
 * length, which keeps whatever the decoder pads on (AAC priming) out of it.
 */
export const MUSIC = {
  src: '/sounds/ambient-theme.m4a',
  channel: 'ambient',
  /* −26 dBFS peak: 0.62 (the track's own peak) × 0.29 × 0.35 × 0.8. */
  volume: 0.29,
  loopSeconds: 45.124,
} as const satisfies { src: string; channel: SoundChannel; volume: number; loopSeconds: number };

export type SoundCueId = keyof typeof SOUND_CUES;

export function isSoundCue(id: string | null | undefined): id is SoundCueId {
  return id != null && Object.prototype.hasOwnProperty.call(SOUND_CUES, id);
}
