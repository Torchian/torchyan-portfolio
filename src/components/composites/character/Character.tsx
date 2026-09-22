'use client';

import Image, { getImageProps } from 'next/image';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import styled from 'styled-components';
import { media } from '@/styles/media';
import {
  DEPTH,
  FRAME,
  HEAD,
  HEAD_ORDER,
  bodyBox,
  bodyImage,
  glassesImage,
  headBox,
  headImage,
  partBox,
  type CharacterClothes,
  type GlassesStyle,
  type HeadPart,
  type PercentBox,
} from './characterLayout';

/**
 * The character, assembled live from its Figma parts (Character Body 3871:1230,
 * Character Head 3183:6631, character_glasses 3875:1182). Every part is its own
 * image, so any combination is just props, and changing one swaps one layer:
 * the new image fades in once it has loaded, over the old one, so a switch never
 * flashes empty. Places that only ever show one fixed look (the hero, the footer)
 * use a baked still from scripts/bake-character.py instead.
 */

export interface CharacterProps {
  clothes?: CharacterClothes;
  /** A style, or `false` for none. */
  glasses?: GlassesStyle | false;
  cap?: boolean;
  beard?: boolean;
  ears?: boolean;
  eyes?: boolean;
  eyebrows?: boolean;
  face?: boolean;
  /** Just the 420×780 head, no body. */
  headOnly?: boolean;
  /** Widest the character renders, in CSS px; picks each layer's download size. */
  width?: number;
  /** Above the fold: load eagerly and at high priority. */
  priority?: boolean;
  /** Load straight away (no lazy loading) without a preload: for parts wanted the moment they mount. */
  eager?: boolean;
  /**
   * Follow the look variables set on an ancestor (see useLookAtPointer):
   * `--turn-x/--turn-y` shift each layer by its depth and tilt the head, and
   * `--gaze-x/--gaze-y` move the eyes in their sockets. All are -1…1.
   */
  motion?: boolean;
  /** The black-and-white treatment, matching the baked stills' `--grayscale`. */
  grayscale?: boolean;
  /** Called once every layer has loaded. */
  onReady?: () => void;
  className?: string;
}

const FADE_MS = 200;

/** Which prop hides which head parts. */
const PART_TOGGLE: Record<HeadPart, 'ears' | 'eyes' | 'eyebrows' | 'face' | 'cap' | 'beard'> = {
  'ear-left': 'ears',
  'ear-right': 'ears',
  'eye-left': 'eyes',
  'eye-right': 'eyes',
  'brow-left': 'eyebrows',
  'brow-right': 'eyebrows',
  face: 'face',
  cap: 'cap',
  beard: 'beard',
};

/** How far the nearest layer travels at a full turn, in design px of the frame. */
const TURN_X = 26;
const TURN_Y = 14;
/** The head's tilt at a full turn. */
const TILT_DEG = 3;
/**
 * The eyes are drawn only a pixel or two larger than the face's sockets, so
 * they're enlarged a touch to have room to move without an edge showing.
 */
const EYE_SCALE = 1.16;
const GAZE_X = 5;
const GAZE_Y = 2.5;

const Frame = styled.div<{ $aspect: string; $designWidth: number }>`
  position: relative;
  width: 100%;
  aspect-ratio: ${(p) => p.$aspect};
  pointer-events: none;
  user-select: none;
  /* One design pixel of the frame, for the motion's travel. */
  container-type: inline-size;
  --px: calc(100cqw / ${(p) => p.$designWidth});

  &[data-grayscale='true'] {
    filter: grayscale(1);
  }
`;

const Box = styled.div`
  position: absolute;
`;

/** The head's group: tilts a little about the neck with the turn. */
const HeadBox = styled(Box)`
  [data-motion='true'] > & {
    transform: rotate(calc(var(--turn-x, 0) * ${TILT_DEG}deg));
    transform-origin: 50% 90%;
    will-change: transform;
  }
`;

/** One layer's box: shifts with the turn, by its --depth. */
const LayerBox = styled(Box)`
  [data-motion='true'] & {
    transform: translate(
      calc(var(--turn-x, 0) * var(--depth, 0) * ${TURN_X} * var(--px)),
      calc(var(--turn-y, 0) * var(--depth, 0) * ${TURN_Y} * var(--px))
    );
    will-change: transform;
  }

  /* The eyes also look: the image moves inside its (slightly enlarged) box. */
  [data-motion='true'] &[data-gaze] img {
    transform: translate(
        calc(var(--gaze-x, 0) * ${GAZE_X} * var(--px)),
        calc(var(--gaze-y, 0) * ${GAZE_Y} * var(--px))
      )
      scale(${EYE_SCALE});
  }
`;

const Img = styled(Image)`
  transition: opacity ${FADE_MS}ms ease-out;

  &[data-shown='false'] {
    opacity: 0;
  }

  ${media.reducedMotion} {
    transition: none;
  }
`;

const place = (box: PercentBox) => ({
  left: `${box.left}%`,
  top: `${box.top}%`,
  width: `${box.width}%`,
  height: `${box.height}%`,
});

type Phase = 'entering' | 'shown' | 'leaving';

interface Shot {
  src: string;
  box: PercentBox;
}

interface Entry extends Shot {
  phase: Phase;
}

interface LayerProps {
  /** What to show; `null` fades the layer out. */
  shot: Shot | null;
  /** Nearness for the motion, 0–1 (DEPTH). */
  depth?: number;
  /** Also moves with the gaze (the eyes). */
  gaze?: boolean;
  eager?: boolean;
  /** The first image this layer shows has loaded. */
  onFirstLoad?: () => void;
  /** CSS px of the frame the boxes are percentages of, at its widest. */
  frameWidth: number;
  priority?: boolean;
}

/**
 * One slot of the character. Holds the image on screen plus, during a swap,
 * the one it's replacing: the newcomer mounts hidden (`entering`), and once it
 * has loaded it fades in while the old one fades out (`leaving`) and is dropped.
 */
function Layer({ shot, frameWidth, priority, depth, gaze, eager, onFirstLoad }: LayerProps) {
  const src = shot?.src ?? null;
  const [current, setCurrent] = useState(src);
  // The first paint (including the server HTML) shows its image straight away.
  const [entries, setEntries] = useState<Entry[]>(shot ? [{ ...shot, phase: 'shown' }] : []);

  if (src !== current) {
    setCurrent(src);
    setEntries((prev) => {
      // A newcomer that never finished loading is simply superseded.
      const kept = prev.filter((e) => e.phase !== 'entering' && e.src !== src);
      const out = kept.map((e): Entry => ({ ...e, phase: 'leaving' }));
      return shot ? [...out, { ...shot, phase: 'entering' }] : out;
    });
  }

  const leaving = entries.some((e) => e.phase === 'leaving');
  useEffect(() => {
    if (!leaving) return;
    const timer = window.setTimeout(
      () => setEntries((prev) => prev.filter((e) => e.phase !== 'leaving')),
      FADE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [leaving]);

  const reveal = (loaded: string) =>
    setEntries((prev) =>
      prev.some((e) => e.src === loaded && e.phase === 'entering')
        ? prev.map((e) => ({ ...e, phase: e.src === loaded ? 'shown' : 'leaving' }))
        : prev,
    );

  return entries.map((e) => (
    <LayerBox
      key={e.src}
      style={{ ...place(e.box), '--depth': depth } as CSSProperties}
      data-gaze={gaze || undefined}
    >
      <Img
        src={e.src}
        alt=""
        fill
        sizes={`${Math.ceil((frameWidth * e.box.width) / 100)}px`}
        priority={priority}
        loading={eager && !priority ? 'eager' : undefined}
        draggable={false}
        data-shown={e.phase === 'shown'}
        onLoad={e.phase === 'entering' ? () => reveal(e.src) : onFirstLoad}
      />
    </LayerBox>
  ));
}

export function Character({
  clothes = 'default',
  glasses = 'default',
  cap = true,
  beard = true,
  ears = true,
  eyes = true,
  eyebrows = true,
  face = true,
  headOnly = false,
  width = 512,
  priority = false,
  eager = false,
  motion = false,
  grayscale = false,
  onReady,
  className,
}: CharacterProps) {
  const toggles = { ears, eyes, eyebrows, face, cap, beard };
  // Counts the layers still loading their first image; onReady fires at zero.
  const pending = useRef<Set<string> | null>(null);
  // CSS px of the head frame, for sizing each head layer's download.
  const headWidth = headOnly ? width : (width * HEAD.width) / FRAME.width;

  const shots = HEAD_ORDER.map((layer) => {
    // Glasses are one slot for every style, so a style change crossfades in place.
    const image =
      layer === 'glasses'
        ? glasses && glassesImage(glasses)
        : toggles[PART_TOGGLE[layer]] && headImage(layer);
    return { layer, shot: image ? { src: image.src, box: partBox(image) } : null };
  });
  const bodyShot = headOnly ? null : { src: bodyImage(clothes).src, box: bodyBox(clothes) };

  if (pending.current === null) {
    pending.current = new Set(
      [bodyShot, ...shots.map((s) => s.shot)].flatMap((shot) => (shot ? [shot.src] : [])),
    );
  }
  const loaded = (src: string) => () => {
    const waiting = pending.current;
    if (!waiting || !waiting.delete(src) || waiting.size > 0) return;
    onReady?.();
  };

  const head = shots.map(({ layer, shot }) => (
    <Layer
      key={layer}
      shot={shot}
      frameWidth={headWidth}
      priority={priority}
      eager={eager}
      depth={DEPTH[layer]}
      gaze={layer === 'eye-left' || layer === 'eye-right'}
      onFirstLoad={shot ? loaded(shot.src) : undefined}
    />
  ));

  const frameProps = {
    className,
    'aria-hidden': true,
    'data-motion': motion,
    'data-grayscale': grayscale,
  } as const;

  if (headOnly) {
    return (
      <Frame
        {...frameProps}
        $aspect={`${HEAD.frame.width} / ${HEAD.frame.height}`}
        $designWidth={HEAD.frame.width}
      >
        {head}
      </Frame>
    );
  }

  return (
    <Frame {...frameProps} $aspect={`${FRAME.width} / ${FRAME.height}`} $designWidth={FRAME.width}>
      <Layer
        shot={bodyShot}
        frameWidth={width}
        priority={priority}
        eager={eager}
        depth={DEPTH.body}
        onFirstLoad={bodyShot ? loaded(bodyShot.src) : undefined}
      />
      <HeadBox style={place(headBox())}>{head}</HeadBox>
    </Frame>
  );
}

/**
 * Warms the browser cache for parts a UI is about to offer (an outfit picker,
 * say), so switching to them is instant. Requests the same optimised URL the
 * component will, at the same width. Call it when idle.
 */
export function preloadCharacterParts(
  parts: { clothes?: CharacterClothes[]; glasses?: GlassesStyle[] },
  width = 512,
) {
  const images = [
    ...(parts.clothes ?? []).map((c) => ({ src: bodyImage(c).src, size: (width * bodyBox(c).width) / 100 })),
    ...(parts.glasses ?? []).map((g) => ({
      src: glassesImage(g).src,
      size: (((width * HEAD.width) / FRAME.width) * partBox(glassesImage(g)).width) / 100,
    })),
  ];
  for (const { src, size } of images) {
    const { props } = getImageProps({ src, alt: '', fill: true, sizes: `${Math.ceil(size)}px` });
    const img = new window.Image();
    if (props.sizes) img.sizes = props.sizes;
    if (props.srcSet) img.srcset = props.srcSet;
    img.src = props.src;
  }
}
