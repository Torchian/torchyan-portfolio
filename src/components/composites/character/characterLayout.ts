import layout from './characterLayout.json';

/**
 * Typed access to characterLayout.json: every part's box in px of its frame,
 * exported from Figma (see docs/adr/0005-character-component.md). The live
 * <Character /> and scripts/bake-character.py both read the JSON, so a baked
 * still and the component are the same picture.
 *
 * Frames:
 *  - `frame`: the 1024×1024 Character — Head + Body (3884:1468). Bodies live here.
 *  - `head`: the 420×780 Character Head (3183:6631). Head parts and glasses live here.
 *  - `face`: the 421×573 box around the face alone, 38px down the head — the
 *    frame the What I Do section and its pencil drawing were drawn in.
 */

export type CharacterClothes = keyof typeof layout.bodies;
export type GlassesStyle = keyof typeof layout.glasses;
export type HeadPart = keyof typeof layout.parts;
/** Bottom-to-top paint order of the head, with the glasses slot among the parts. */
export type HeadLayer = HeadPart | 'glasses';

export interface PartImage {
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

/** A box as percentages of its frame, ready for `left/top/width/height`. */
export interface PercentBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * How near each layer sits, 0 (back) to 1 (front), for the look-at-the-pointer
 * motion (Character's `motion`): nearer layers travel further, so the head
 * reads as turning. The body barely moves.
 *
 * The face, ears, eyebrows and beard move as one: since v3 they're cut from one
 * flat render (scripts/cut-character.py), so nothing exists under where they
 * overlap, and any difference in travel opened a gap at the ears or slid the
 * beard's mouth hole off the lips. The turn is carried by the head against the
 * body, the tilt, the eyes' gaze, and the cap and glasses sliding over the face.
 */
export const DEPTH: Record<HeadLayer | 'body', number> = {
  body: 0.12,
  'ear-left': 0.6,
  'ear-right': 0.6,
  'eye-left': 0.6,
  'eye-right': 0.6,
  face: 0.6,
  'brow-left': 0.6,
  'brow-right': 0.6,
  cap: 0.7,
  beard: 0.6,
  glasses: 1,
};

export const CHARACTER_CLOTHES = Object.keys(layout.bodies) as CharacterClothes[];
export const GLASSES_STYLES = Object.keys(layout.glasses) as GlassesStyle[];
export const HEAD_ORDER = layout.order as HeadLayer[];

export const FRAME = layout.frame;
export const HEAD = layout.head;
const FACE = layout.faceFrame;

export const bodyImage = (clothes: CharacterClothes): PartImage => layout.bodies[clothes];
export const headImage = (part: HeadPart): PartImage => layout.parts[part];
export const glassesImage = (style: GlassesStyle): PartImage => layout.glasses[style];

const percent = (
  { x, y, width, height }: PartImage | typeof HEAD,
  frame: { x?: number; y?: number; width: number; height: number },
): PercentBox => ({
  left: ((x - (frame.x ?? 0)) / frame.width) * 100,
  top: ((y - (frame.y ?? 0)) / frame.height) * 100,
  width: (width / frame.width) * 100,
  height: (height / frame.height) * 100,
});

/** The head's box inside the 1024 frame. */
export const headBox = (): PercentBox => percent(HEAD, FRAME);
export const bodyBox = (clothes: CharacterClothes): PercentBox => percent(bodyImage(clothes), FRAME);

/** A head part or a glasses style, placed in the head frame or the face frame. */
export function partBox(image: PartImage, frame: 'head' | 'face' = 'head'): PercentBox {
  return percent(image, frame === 'head' ? HEAD.frame : FACE);
}

export const FACE_ASPECT = `${FACE.width} / ${FACE.height}`;

/** The face frame itself, for anything that has to size a drawing to fit a screen. */
export const FACE_FRAME = FACE;
