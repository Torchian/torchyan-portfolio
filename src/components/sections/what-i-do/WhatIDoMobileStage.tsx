'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { media } from '@/styles/media';
import { spacing } from '@/styles/tokens/spacing';
import { fontFamily, fontSize, fontWeight, letterSpacing, lineHeight } from '@/styles/tokens/typography';
import { duration, easing } from '@/styles/tokens/motion';
import { createInViewGate, subscribeScroll } from '@/lib/scroll-driver';
import { WhatIDoCharacterWaiting } from './WhatIDoCharacterWaiting';

/**
 * What I Do on a phone and a tablet.
 *
 * The desktop tells this story in a 720 × 4800 column: the character sticks to
 * the middle of the screen while the five steps scroll past it on the left, and
 * a set of hand-drawn boards passes behind. None of that fits a screen a few
 * hundred pixels wide, so below the desktop frame the section is simply hidden
 * and the steps read as a plain list — the character never appears at all.
 *
 * Here it is the same story in the shape a phone has: the screen is split, the
 * character pinned in the top of it and the step in the bottom, and one scroll
 * moves both. The character is the one that assembles itself — the parts arrive,
 * the colour comes in, the glasses go on — which needs no boards, so it travels
 * where the desktop's other character cannot.
 *
 * The beats are the desktop's, kept deliberately: nothing until the third step,
 * the parts arriving on the way into it, the colour across the fourth, the
 * glasses on the fifth. One screen of scroll per step.
 */

/** Where the screen is cut. The character takes the top, the words the rest. */
const CHARACTER_SHARE = '44%';

/** The step whose approach brings the parts in ("Design with intent"). */
const REVEAL_AT = 2;
/** How far into the step before it starts, as a share of that step's scroll. */
const REVEAL_LEAD = 0.2;
/** The step the colour arrives across ("Engineer the experience"). */
const COLOUR_AT = 3;
/** The step the glasses go on ("Refine and evolve"), and how far into it. */
const FINAL_AT = 4;
const FINAL_LEAD = 0.25;

const FADE = `${duration.normal} ${easing.out}`;

/**
 * Whether the stage runs. Like the Projects list, it is switched on from JS
 * rather than by the media query alone: which step is on screen can only be
 * known from the scroll position, so before hydration — and for a visitor with
 * no JavaScript — there is no step to show, and a stage would be five blank
 * screens. Until then the steps stay stacked in normal flow and readable.
 */
const STAGED = "[data-whatido-staged='true'] &";

/**
 * The scroll runway: one screen per step. Its height is the one rule left on the
 * media query, because it is the one that has to be right in the first painted
 * frame — reserving it from CSS is what stops the page growing by five screens
 * once the stage turns on, and dragging everything below it down.
 */
const Track = styled.div<{ $count: number }>`
  display: none;

  ${media.down('l')} {
    display: block;
    /*
     * One screen per step, and one more besides: a screen-tall sticky element
     * inside a track of N screens stays pinned for N-1 of them, so without the
     * extra the last step would have no turn at all.
     */
    height: ${(p) => (p.$count + 1) * 100}svh;
  }
`;

const Stage = styled.div`
  display: flex;
  flex-direction: column;

  ${STAGED} {
    position: sticky;
    top: 0;
    height: 100svh;
    overflow: hidden;
  }
`;

const CharacterBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: ${spacing[1000]}px;

  ${STAGED} {
    flex: 0 0 ${CHARACTER_SHARE};
    min-height: 0;
  }

  /* The character keeps its own proportions and takes the height it is given. */
  > * {
    width: auto;
    height: 100%;
    max-width: 100%;
  }
`;

const Steps = styled.ol`
  display: flex;
  flex-direction: column;
  gap: ${spacing[800]}px;
  margin: 0;
  padding: 0;
  list-style: none;

  ${STAGED} {
    position: relative;
    flex: 1;
    gap: 0;
    min-height: 0;
  }
`;

/**
 * Off the stage the steps read one under another. On it they are stacked in the
 * same place and only the one on screen is shown, so the words change under a
 * character that does not move.
 */
const Step = styled.li`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: ${spacing[200]}px;

  ${STAGED} {
    position: absolute;
    inset: 0;
    opacity: 0;
    transition:
      opacity ${FADE},
      visibility ${FADE};
    visibility: hidden;

    &[data-active='true'] {
      opacity: 1;
      visibility: visible;
    }
  }

  ${media.reducedMotion} {
    transition: none;
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
   * this component's own, because the plain list that the stage replaces is a
   * sibling: only an ancestor of both can tell each of them what is happening.
   */
  hostRef: React.RefObject<HTMLElement | null>;
}

/** Runs where the desktop column does not, and only when it can be driven. */
function shouldStage() {
  return window.matchMedia('(max-width: 768px)').matches;
}

export function WhatIDoMobileStage({ steps, hostRef }: WhatIDoMobileStageProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [staged, setStaged] = useState(false);
  const [active, setActive] = useState(0);
  const count = steps.length;

  /*
   * Written straight to the DOM before the first paint rather than rendered
   * from state: state settles after that paint, and the stage would spend a
   * frame at its stacked height.
   */
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

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!staged || !track || !stage) return;

    const gate = createInViewGate(track);
    let lastIndex = -1;
    let lastGrayscale = '';
    let lastReveal = '';
    let lastFinal = '';

    const unsubscribe = subscribeScroll<{
      index: number;
      grayscale: string;
      reveal: string;
      final: string;
    }>({
      active: () => gate.current,
      read: (frame) => {
        const rect = frame.rect(track);
        // The stage is pinned for the track's height less its own screen, so
        // that, not the whole track, is what the steps divide between them.
        const pinned = rect.height - stage.getBoundingClientRect().height;
        const screen = pinned / count;
        // How far into the runway, in steps: 0 at its top, `count` at its end.
        const travelled = screen > 0 ? -rect.top / screen : 0;
        const index = Math.min(count - 1, Math.max(0, Math.floor(travelled)));
        const progress = Math.min(1, Math.max(0, travelled - index));

        const grayscale = index < COLOUR_AT ? 1 : index > COLOUR_AT ? 0 : 1 - progress;

        const raw = index >= REVEAL_AT ? 1 : index === REVEAL_AT - 1 ? progress : 0;
        const reveal = raw <= REVEAL_LEAD ? 0 : (raw - REVEAL_LEAD) / (1 - REVEAL_LEAD);

        const final = index > FINAL_AT || (index === FINAL_AT && progress >= FINAL_LEAD);

        return {
          index,
          // Two decimals is below what the eye resolves here, and it lets the
          // guard below skip most frames outright.
          grayscale: grayscale.toFixed(2),
          reveal: reveal.toFixed(2),
          final: final ? '1' : '0',
        };
      },
      write: (_frame, { index, grayscale, reveal, final }) => {
        if (index !== lastIndex) {
          lastIndex = index;
          setActive(index);
        }
        if (grayscale !== lastGrayscale) {
          stage.style.setProperty('--grayscale', grayscale);
          lastGrayscale = grayscale;
        }
        if (reveal !== lastReveal) {
          stage.style.setProperty('--reveal', reveal);
          /*
           * The beard is the one part the desktop drives from a board rather
           * than from --reveal, and there is no board here. Its own effect
           * writes nothing without one, so the variable it reads is left to be
           * inherited — and this is what it inherits. It arrives with the rest
           * of the parts, which is what the board makes it do over there.
           */
          stage.style.setProperty('--opacity', reveal);
          lastReveal = reveal;
        }
        if (final !== lastFinal) {
          stage.style.setProperty('--final', final);
          lastFinal = final;
        }
      },
    });

    return () => {
      unsubscribe();
      gate.disconnect();
    };
  }, [staged, count]);

  return (
    <Track ref={trackRef} $count={count}>
      <Stage ref={stageRef}>
          <CharacterBox aria-hidden>
            <WhatIDoCharacterWaiting />
          </CharacterBox>
          <Steps>
            {steps.map((step, i) => (
              <Step key={step.title} data-active={!staged || i === active}>
                <Title>{step.title}</Title>
                <Description>{step.description}</Description>
              </Step>
            ))}
          </Steps>
      </Stage>
    </Track>
  );
}
