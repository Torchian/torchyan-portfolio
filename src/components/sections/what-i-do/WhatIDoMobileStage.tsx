'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { media } from '@/styles/media';
import { HEADER_HEIGHT } from '@/components/layouts/NavBar';
import {
  FACE_ASPECT,
  FACE_FRAME,
  headImage,
  partBox,
} from '@/components/composites/character/characterLayout';
import { spacing } from '@/styles/tokens/spacing';
import { fontFamily, fontSize, fontWeight, letterSpacing, lineHeight } from '@/styles/tokens/typography';
import { createInViewGate, subscribeScroll } from '@/lib/scroll-driver';
import { WhatIDoCharacter } from './WhatIDoCharacter';
import { WhatIDoCharacterWaiting } from './WhatIDoCharacterWaiting';

/**
 * What I Do on a phone and a tablet.
 *
 * The desktop tells this story down a 720 × 4800 column, with hand-drawn boards
 * passing behind a character that sticks to the middle of the screen. None of
 * that fits a few hundred pixels of width, so the column is hidden there and
 * the steps used to read as a plain list.
 *
 * Here it is the same story in the shape a phone has: the character fills the
 * screen and the words sit along the bottom of it, and one scroll moves both.
 * The two characters the desktop shows at different points are not two
 * characters at all — one is the face with a pencil sketch over it, the other
 * the parts that go around it, drawn at the same size to line up. Stacked, they
 * are one drawing that assembles itself.
 *
 * Five stages, the desktop's own, in order:
 *
 *   1. the face as a pencil sketch
 *   2. the sketch gives way to the drawing underneath, top to bottom
 *   3. the rest of the parts arrive
 *   4. the colour comes in
 *   5. the glasses go on, and the green glow rises behind
 *
 * Each one holds for most of its scroll and then changes over the rest, and the
 * words change on exactly the same curve — so a step is never half-read against
 * a picture that has already moved on.
 */

/** Screens of scroll per step. Long on purpose: the change is what should be felt, not the distance. */
const SCREENS_PER_STEP = 1.8;

/** The share of a step spent holding still before the change to the next begins. */
const HOLD = 0.3;

/** What the drawing looks like at each stage. Everything in between is interpolated. */
interface Stage {
  /** 1: the face is all pencil. 0: all of it is the drawing underneath. */
  pencil: number;
  /** The parts around the face, 0 → 1. */
  reveal: number;
  /** 1: grey. 0: full colour. */
  grayscale: number;
  /** The glasses, 0 → 1. */
  final: number;
  /** The green glow behind, 0 → 1. */
  glow: number;
}

const STAGES: Stage[] = [
  { pencil: 1, reveal: 0, grayscale: 1, final: 0, glow: 0 },
  { pencil: 0, reveal: 0, grayscale: 1, final: 0, glow: 0 },
  { pencil: 0, reveal: 1, grayscale: 1, final: 0, glow: 0.15 },
  { pencil: 0, reveal: 1, grayscale: 0, final: 0, glow: 0.5 },
  { pencil: 0, reveal: 1, grayscale: 0, final: 1, glow: 1 },
];

/** Gentle at both ends, so a change never starts or stops abruptly. */
const ease = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Whether the stage runs. Switched on from JS rather than by the media query
 * alone: which step is on screen can only be known from the scroll position, so
 * before hydration — and with no JavaScript — there is no step to show, and a
 * stage would be several blank screens. Until then the plain list stands.
 */
const STAGED = "[data-whatido-staged='true'] &";

const Track = styled.div<{ $screens: number }>`
  display: none;

  /*
   * The gutter the rest of the site uses — Container's own, repeated here
   * because the stage steps outside Container to reach the screen edges and
   * has to put the words back on the line everything else keeps.
   */
  --gutter: ${spacing[400]}px;

  ${media.down('m')} {
    --gutter: ${spacing[300]}px;
  }

  ${media.down('l')} {
    display: block;
    /*
     * Out of the container and across the whole screen: the picture and the
     * glow behind it are meant to reach the edges, and inside Container they
     * ended at its padding with a visible edge down each side.
     */
    width: 100vw;
    margin-inline: calc(50% - 50vw);
    /*
     * A screen-tall sticky element inside a track of N screens stays pinned for
     * N-1 of them, so the runway carries one screen more than the steps need.
     * The height is the one rule left on the media query, because it has to be
     * right in the first painted frame — reserving it here is what stops the
     * page growing by several screens once the stage turns on.
     */
    height: ${(p) => (p.$screens + 1) * 100}svh;
  }
`;

/*
 * dvh, not svh. On a phone the browser's bottom bar hides as you scroll down,
 * and the viewport grows by exactly `100lvh - 100svh`. An svh-tall stage keeps
 * its old height and leaves that strip empty below it, with the words stranded
 * above the gap. dvh is the height of what is actually visible, so the stage
 * grows with the viewport and the words stay on the bottom edge either way.
 *
 * The track below stays in svh: its height is the page's, and a page that grew
 * and shrank as the bar came and went would move the scroll under the reader.
 */
const Stage = styled.div`
  ${STAGED} {
    position: sticky;
    top: 0;
    height: 100dvh;
    overflow: hidden;
  }
`;

/**
 * The green glow the desktop puts behind the finished character — the same
 * radial gradient, which is what a 320px blur of a green square comes to.
 */
const Glow = styled.div`
  display: none;

  ${STAGED} {
    position: absolute;
    top: 50%;
    left: 50%;
    display: block;
    width: 160vmax;
    height: 160vmax;
    transform: translate(-50%, -40%);
    opacity: var(--glow, 0);
    pointer-events: none;
    background: radial-gradient(
      circle closest-side,
      rgba(12, 175, 10, 0.403) 0%,
      rgba(12, 175, 10, 0.289) 25%,
      rgba(12, 175, 10, 0.105) 50%,
      rgba(12, 175, 10, 0.018) 75%,
      transparent 100%
    );
  }
`;

/** The drawing: the screen under the header, with the words lying over its foot. */
const Drawing = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: ${spacing[1000]}px var(--gutter, ${spacing[300]}px) 0;

  ${STAGED} {
    position: absolute;
    inset: 0;
    /* Clear of the fixed header; the words lie over the foot of it. */
    padding-top: ${HEADER_HEIGHT + spacing[100]}px;
    padding-bottom: 0;
  }
`;

/**
 * The box both layers fill. They are one drawing in two files — the face and
 * the parts that go around it, cut from the same artwork — so they only line up
 * while they are the same size in the same place. One box, filled twice, is
 * what guarantees that; sizing each of them separately is what pulled the face
 * apart. The doubled class is there so this wins over each component's own
 * width whichever order the two stylesheets land in.
 */
const FIGURE_MAX = 414;

/**
 * The beard is drawn past the bottom of the face frame — its box ends at 129%
 * of the frame's height. So what has to fit above the words is not the box but
 * that: sizing the box to the free height puts the beard through the title,
 * which is what it did.
 */
const BEARD = partBox(headImage('beard'), 'face');
const DROP = (BEARD.top + BEARD.height) / 100;

/** Free height → the box's width, through the drop and the frame's own ratio. */
const FIT = ((FACE_FRAME.width / FACE_FRAME.height) / DROP).toFixed(4);

/** Until the words have been measured. Two lines of title and three of body. */
const WORDS_FALLBACK = 248;

/*
 * What sits below the words, and the air the drawing keeps above them. Both are
 * tighter than the page's usual rhythm on purpose: the drawing is sized to
 * whatever is left over, so every pixel reserved here comes straight off it.
 */
const WORDS_BELOW = spacing[600];
const WORDS_GAP = spacing[200];

const Figure = styled.div`
  position: relative;
  width: min(100%, ${FIGURE_MAX}px);
  aspect-ratio: ${FACE_ASPECT};

  ${STAGED} {
    /*
     * svh, not dvh: this is a size, and a picture that grew and shrank as the
     * browser's bottom bar came and went would be worse than the gap it fixes.
     * The smallest viewport is the one it has to fit.
     */
    width: min(
      100%,
      ${FIGURE_MAX}px,
      calc(
        (100svh - ${HEADER_HEIGHT + spacing[100]}px - var(--words, ${WORDS_FALLBACK}px)) * ${FIT}
      )
    );
  }

  && > * {
    position: absolute;
    inset: 0;
    width: 100%;
    max-width: none;
    height: 100%;
  }
`;

/**
 * A darkening along the bottom, under the words. The drawing fills the screen
 * by the end — colour, beard and all — and white text laid straight on it stops
 * being readable. This is the least that fixes it: nothing anyone should see,
 * only enough that the words keep their contrast wherever the picture happens
 * to be light.
 */
const Scrim = styled.div`
  display: none;

  ${STAGED} {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    display: block;
    height: 52dvh;
    pointer-events: none;
    background: linear-gradient(
      to bottom,
      rgba(11, 9, 21, 0) 0%,
      rgba(11, 9, 21, 0.55) 45%,
      rgba(11, 9, 21, 0.88) 100%
    );
  }
`;

/** The words, along the bottom of the screen. */
const Steps = styled.ol`
  display: flex;
  flex-direction: column;
  gap: ${spacing[800]}px;
  margin: 0;
  padding: 0;
  list-style: none;

  ${STAGED} {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    gap: 0;
    padding: 0 var(--gutter) ${WORDS_BELOW}px;
  }
`;

const Step = styled.li`
  display: flex;
  flex-direction: column;
  gap: ${spacing[200]}px;

  ${STAGED} {
    position: absolute;
    right: var(--gutter);
    bottom: ${WORDS_BELOW}px;
    left: var(--gutter);
    /* Opacity is written per frame, on the same curve the drawing moves on. */
    opacity: 0;
    pointer-events: none;
  }
`;

const Title = styled.h3`
  margin: 0;
  font-family: ${fontFamily.display};
  font-size: ${fontSize.display.s}px;
  line-height: ${lineHeight.display.s}px;
  font-weight: ${fontWeight.heading};
  color: var(--color-accent-primary);

  ${media.down('m')} {
    font-size: ${fontSize.heading.l}px;
    line-height: ${lineHeight.heading.l}px;
  }
`;

const Description = styled.p`
  margin: 0;
  font-family: ${fontFamily.heading};
  font-size: ${fontSize.heading.s}px;
  line-height: ${lineHeight.heading.s}px;
  font-weight: ${fontWeight.medium};
  letter-spacing: ${letterSpacing.xs}px;
  color: var(--color-text-secondary);

  ${media.down('m')} {
    font-size: ${fontSize.body.xl}px;
    line-height: ${lineHeight.body.xl}px;
  }
`;

export interface WhatIDoMobileStageProps {
  steps: { title: string; description: string }[];
  /**
   * The section element. The attribute goes there rather than on a wrapper of
   * this component's own, because the plain list the stage replaces is a
   * sibling: only an ancestor of both can tell each of them what is happening.
   */
  hostRef: React.RefObject<HTMLElement | null>;
}

function shouldStage() {
  return window.matchMedia('(max-width: 768px)').matches;
}

export function WhatIDoMobileStage({ steps, hostRef }: WhatIDoMobileStageProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const faceRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [staged, setStaged] = useState(false);
  const count = steps.length;
  const screens = useMemo(() => count * SCREENS_PER_STEP, [count]);

  useLayoutEffect(() => {
    hostRef.current?.setAttribute('data-whatido-staged', String(shouldStage()));
  }, [hostRef]);

  useEffect(() => {
    const sync = () => {
      const next = shouldStage();
      hostRef.current?.setAttribute('data-whatido-staged', String(next));
      setStaged(next);
    };
    sync();
    const query = window.matchMedia('(max-width: 768px)');
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, [hostRef]);

  /*
   * How much of the bottom the words take, so the drawing can be sized to the
   * rest of it rather than to a number picked by eye. Measured rather than
   * assumed, because it is a translation: the longest step's title wraps to two
   * lines in English and three in Russian, and a fixed reserve would either
   * crop the drawing everywhere or let the beard through the title in one
   * language.
   */
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!staged || !stage) return;

    const measure = () => {
      const tallest = stepRefs.current.reduce((most, el) => Math.max(most, el?.offsetHeight ?? 0), 0);
      if (!tallest) return;
      stage.style.setProperty('--words', `${tallest + WORDS_BELOW + WORDS_GAP}px`);
    };

    measure();
    const observer = new ResizeObserver(measure);
    for (const el of stepRefs.current) if (el) observer.observe(el);
    return () => observer.disconnect();
  }, [staged, steps]);

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    const face = faceRef.current;
    if (!staged || !track || !stage || !face) return;

    const gate = createInViewGate(track);
    const written = { pencil: NaN, parts: '', reveal: '', grayscale: '', final: '', glow: '' };
    const opacities: number[] = steps.map(() => NaN);

    const unsubscribe = subscribeScroll<{ value: Stage; index: number; blend: number; height: number }>({
      active: () => gate.current,
      read: (frame) => {
        const rect = frame.rect(track);
        // The stage is pinned for the track's height less its own screen, so
        // that, and not the whole track, is what the steps divide between them.
        const pinned = rect.height - frame.rect(stage).height;
        const per = pinned / count;
        const travelled = per > 0 ? -rect.top / per : 0;
        const index = Math.min(count - 1, Math.max(0, Math.floor(travelled)));
        const within = Math.min(1, Math.max(0, travelled - index));
        // Still for the first part of a step, then eased across the rest. The
        // last step has nothing to change into, so it holds all the way: without
        // this the final words faded out and the section ended on an empty
        // screen.
        const blend =
          index >= count - 1 || within <= HOLD ? 0 : ease((within - HOLD) / (1 - HOLD));

        const from = STAGES[index];
        const to = STAGES[Math.min(STAGES.length - 1, index + 1)];
        return {
          index,
          blend,
          height: frame.rect(face).height,
          value: {
            pencil: lerp(from.pencil, to.pencil, blend),
            reveal: lerp(from.reveal, to.reveal, blend),
            grayscale: lerp(from.grayscale, to.grayscale, blend),
            final: lerp(from.final, to.final, blend),
            glow: lerp(from.glow, to.glow, blend),
          },
        };
      },
      write: (_frame, { value, index, blend, height }) => {
        /*
         * The cut between the sketch and the drawing under it: a line across the
         * face, at the bottom while it is all pencil and at the top once it is
         * all drawing. In pixels, the way the board drives it on desktop, so
         * both layers measure it against the same box.
         */
        const cut = Math.round(value.pencil * height);
        if (cut !== written.pencil) {
          face.style.setProperty('--clip-above', `${cut}px`);
          face.style.setProperty('--clip-below', `${height - cut}px`);
          written.pencil = cut;
        }

        // The parts that wait come in as the sketch gives way, the way the
        // desktop's second character enters — not before it, over the pencil.
        const parts = (1 - value.pencil).toFixed(2);
        if (parts !== written.parts) {
          stage.style.setProperty('--parts', parts);
          written.parts = parts;
        }

        // Two decimals is below what the eye resolves, and it lets most frames
        // skip the write outright.
        const reveal = value.reveal.toFixed(2);
        if (reveal !== written.reveal) {
          stage.style.setProperty('--reveal', reveal);
          // The beard is the one part the desktop drives from a board, and
          // there is no board here; its own effect writes nothing without one,
          // so the variable it reads is left to be inherited from here.
          stage.style.setProperty('--opacity', reveal);
          written.reveal = reveal;
        }
        const grayscale = value.grayscale.toFixed(2);
        if (grayscale !== written.grayscale) {
          stage.style.setProperty('--grayscale', grayscale);
          written.grayscale = grayscale;
        }
        const final = value.final.toFixed(2);
        if (final !== written.final) {
          stage.style.setProperty('--final', final);
          written.final = final;
        }
        const glow = value.glow.toFixed(2);
        if (glow !== written.glow) {
          stage.style.setProperty('--glow', glow);
          written.glow = glow;
        }

        // The words leave and arrive on the same curve the drawing moves on.
        for (let i = 0; i < stepRefs.current.length; i++) {
          const next = i === index ? 1 - blend : i === index + 1 ? blend : 0;
          if (Math.abs(next - opacities[i]) < 0.005) continue;
          opacities[i] = next;
          const el = stepRefs.current[i];
          if (el) el.style.opacity = next.toFixed(3);
        }
      },
    });

    return () => {
      unsubscribe();
      gate.disconnect();
    };
  }, [staged, count, steps]);

  return (
    <Track ref={trackRef} $screens={screens}>
      <Stage ref={stageRef}>
        <Glow aria-hidden />
        <Drawing aria-hidden>
          <Figure>
            <WhatIDoCharacter clipRef={faceRef} />
            <WhatIDoCharacterWaiting />
          </Figure>
        </Drawing>
        <Scrim aria-hidden />
        <Steps>
          {steps.map((step, i) => (
            <Step
              key={step.title}
              ref={(el) => {
                stepRefs.current[i] = el;
              }}
              style={staged ? { opacity: i === 0 ? 1 : 0 } : undefined}
            >
              <Title>{step.title}</Title>
              <Description>{step.description}</Description>
            </Step>
          ))}
        </Steps>
      </Stage>
    </Track>
  );
}
