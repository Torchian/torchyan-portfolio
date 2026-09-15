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

export const CHANNEL_LEVELS: Record<SoundChannel, number> = {
  /** Pointer hovers: the most frequent, so the quietest in front. */
  hover: 0.5,
  /** Keyboard focus and presses (:focus-visible, :active). */
  interaction: 0.7,
  /** Things fading or sliding in and out. */
  transition: 0.7,
  /** Idle and random motion: texture, never in front. */
  ambient: 0.35,
};

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
  /** Header link pill: the green glow sliding to the hovered link, and back to the current page's. */
  navLine: {
    src: '/sounds/swoosh.mp3',
    channel: 'hover',
    volume: 0.6,
    cooldownMs: 90,
    maxVoices: 2,
    detune: 60,
    volumeJitter: 0.15,
    spatial: true,
  },
} as const satisfies Record<string, SoundCue>;

export type SoundCueId = keyof typeof SOUND_CUES;

export function isSoundCue(id: string | null | undefined): id is SoundCueId {
  return id != null && Object.prototype.hasOwnProperty.call(SOUND_CUES, id);
}
