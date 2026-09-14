'use client';

/* eslint-disable @next/next/no-img-element */
import { useRef, useMemo } from 'react';
import styled from 'styled-components';
import { Container } from '@/components/primitives';
import { spacing } from '@/styles/tokens/spacing';
import { media } from '@/styles/media';
import { zIndex } from '@/styles/tokens/z-index';
import { useWhatIDoScroll } from '@/hooks';
import { SectionHeading } from '@/components/composites';
import { WhatidoStep } from './WhatidoStep';
import { WhatIDoCharacter } from './WhatIDoCharacter';
import { WhatIDoCharacterWaiting } from './WhatIDoCharacterWaiting';
import { Bg4Glass } from './Bg4Glass';
import { WHATIDO_GRID, STEP_BACKGROUNDS } from './config';
import { easing } from '@/styles/tokens';

const STEPS = [
  {
    title: 'Frame the problem',
    description:
      'Start by understanding the real problem — not just the symptom. Use the context, goals and constraints to frame it.',
  },
  {
    title: 'Architect the system',
    description:
      'Design the structural foundation of the product so it can grow without losing clarity or coherence.',
  },
  {
    title: 'Design with intent',
    description:
      'Turn ideas into crisp, precise interfaces where every decision serves usability and meaning.',
  },
  {
    title: 'Engineer the experience',
    description:
      'Turn designs into pixel-perfect production ready code that\'s scalable and maintainable.',
  },
  {
    title: 'Refine and evolve',
    description:
      'Improve the product through iteration, feedback, and mindful, data-driven decisions.',
  },
] as const;

/** Figma: whatido_sticky_image - main container */
const WHATIDO_WIDTH = 720;
const WHATIDO_HEIGHT = 4800;

const Section = styled.section`
  position: relative;
  /* The glow and the boards reach past the screen edges; clip them sideways so
     they don't widen the page. clip, not hidden: hidden makes a scroll
     container and breaks the sticky characters. */
  overflow-x: clip;
  padding: ${spacing[1000]}px 0;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: ${spacing[800]}px;
  margin-top: ${spacing[800]}px;

  ${media.down('l')} {
    grid-template-columns: 1fr;
  }
`;

/** The steps are a sequence, so an ordered list. */
const StepsColumn = styled.ol``;

/** Figma: whatido_sticky_image - right section container */
const VisualsColumn = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0;
  isolation: isolate;
  width: ${WHATIDO_WIDTH}px;
  min-width: ${WHATIDO_WIDTH}px;
  height: ${WHATIDO_HEIGHT}px;
  flex: none;
  align-self: stretch;
  flex-grow: 0;
  overflow: visible;

  ${media.down('l')} {
    display: none;
  }
`;

/**
 * Figma: Ellipse 17 - green glow at bottom: a 580px #0caf0a square under
 * blur(320px). Drawn as the radial gradient that blur produces instead (same
 * centre; pixel-diffed against the blur at max 4/255 per channel), so there's
 * no 2400px live filter to repaint behind the sticky characters.
 */
const EllipseGlow = styled.div`
  position: absolute;
  width: 2400px;
  height: 2400px;
  left: calc(50% - 1200px);
  bottom: calc(118px + 290px - 1200px);
  background: radial-gradient(
    circle closest-side,
    rgba(12, 175, 10, 0.403) 0%,
    rgba(12, 175, 10, 0.371) 12.5%,
    rgba(12, 175, 10, 0.289) 25%,
    rgba(12, 175, 10, 0.19) 37.5%,
    rgba(12, 175, 10, 0.105) 50%,
    rgba(12, 175, 10, 0.048) 62.5%,
    rgba(12, 175, 10, 0.018) 75%,
    rgba(12, 175, 10, 0.006) 87.5%,
    transparent 100%
  );
  z-index: 0;
  pointer-events: none;
`;

/** Figma: whatido_grid */
const GridBackground = styled.div`
  position: absolute;
  width: 728px;
  height: 2066px;
  left: -4px;
  top: -68px;
  mix-blend-mode: overlay;
  flex: none;
  flex-grow: 0;
  z-index: 1;
  pointer-events: none;
  opacity: 0.15;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top center;
  }
`;

/** Figma: whatido_bg_1 */
const Bg1 = styled.div`
  position: absolute;
  width: 150%;
  height: auto;
  left: 50%;
  top: -60px;
  transform: translateX(-62%);
  flex: none;
  flex-grow: 0;
  z-index: ${zIndex.whatidoBgForeground};
  pointer-events: none;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center;
  }
`;

/** Spacer - pushes first character to starting point (1481px) */
const StickySpacerTop = styled.div`
  flex-shrink: 0;
  height: 520px;
`;

/** Spacer - pushes second sticky character to step 1 position (keeps current starting place) */
const StickySpacer = styled.div`
  flex-shrink: 0;
  height: 250px;
`;

/** Second character - also sticky, starts at step 1 position */
const StickyCharacterWrapper2 = styled.div`
  position: sticky;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: ${zIndex.whatidoCharacter};
  pointer-events: none;
  flex-shrink: 0;
  align-self: flex-start;

  ${media.down('l')} {
    display: none;
  }
`;

/** Figma: whatido_bg_2 */
const Bg2 = styled.div`
  position: absolute;
  width: 60%;
  transform: translateX(-50%);
  left: 50%;
  top: 1228.42px;
  flex: none;
  flex-grow: 0;
  z-index: ${zIndex.whatidoBgForeground};
  pointer-events: none;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center;
  }
`;

/** Figma: whatido_bg_3 */
const Bg3 = styled.div`
  position: absolute;
  width: 110%;
  top: 2024px;
  left: 50%;
  transform: translateX(-50%);
  flex: none;
  flex-grow: 0;
  z-index: ${zIndex.whatidoBgForeground};
  pointer-events: none;
  /* This box contains an infinite backdrop-filter animation, which is
     expensive on every frame it's rendered. content-visibility lets the
     browser skip that work entirely while it's off-screen, instead of
     running it for the whole time the page is open. */
  content-visibility: auto;
  /* auto: once rendered, keep reporting the real size while skipped instead of
     the placeholder — the beard's fade measures this box, and the placeholder
     would make its reveal line jump on the frame the box un-skips. */
  contain-intrinsic-size: auto 800px 700px;

  &::before {
    content: '';
    position: absolute;
    inset: 50%;
    transform: translate(-50%, -63%);
    width: 66%;
    height: 56.7%;
    z-index: ${zIndex.whatidoBgForeground};
    animation: sepiaToInvert 800ms ${easing.linear} infinite alternate;
  }

  @keyframes sepiaToInvert {
    0% {
      backdrop-filter: sepia(0) invert(1) saturate(100%);
    }
    25% {
      backdrop-filter: sepia(1) invert(0) saturate(4000%);
    }
    50% {
      backdrop-filter: sepia(0.6) invert(1) saturate(1000%);
    }
    75% {
      backdrop-filter: sepia(0) invert(0) saturate(5000%);
    }
    100% {
      backdrop-filter: sepia(0.6) invert(1) saturate(2000%);
    }
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }
`;

/** Sticky character - sticks to viewport center while scrolling through steps */
const StickyCharacterWrapper = styled.div`
  position: sticky;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: ${zIndex.whatidoCharacter};
  pointer-events: none;
  flex-shrink: 0;
  align-self: flex-start;

  ${media.down('l')} {
    display: none;
  }
`;

export function WhatIDoSection() {
  const stepRef0 = useRef<HTMLLIElement>(null);
  const stepRef1 = useRef<HTMLLIElement>(null);
  const stepRef2 = useRef<HTMLLIElement>(null);
  const stepRef3 = useRef<HTMLLIElement>(null);
  const stepRef4 = useRef<HTMLLIElement>(null);
  const stepRefs = useMemo(
    () => [stepRef0, stepRef1, stepRef2, stepRef3, stepRef4],
    [],
  );
  // Common ancestor of both characters: the scroll-driven --grayscale and
  // --reveal variables are written here and inherited down.
  const visualsRef = useRef<HTMLDivElement>(null);
  useWhatIDoScroll(visualsRef, stepRefs);
  // Bg1 is the framed "board"; its bottom line drives the head's pencil→color cut.
  const boardRef = useRef<HTMLDivElement>(null);
  // Bg3 is the "Design with intent" square; a line across it gates the beard's fade-in.
  const squareRef = useRef<HTMLDivElement>(null);

  return (
    <Section id="about">
      <Container>
        <SectionHeading
          title="What I Do"
          subtitle="Design strategy & full-stack development"
        />
        <ContentGrid>
          <StepsColumn>
            {STEPS.map((step, i) => (
              <WhatidoStep
                key={step.title}
                ref={stepRefs[i]}
                title={step.title}
                description={step.description}
              />
            ))}
          </StepsColumn>
          <VisualsColumn ref={visualsRef}>
            <StickySpacerTop />
            {/* Sticky character - first in flow so it sticks when section scrolls into view */}
            <StickyCharacterWrapper>
              <WhatIDoCharacter boardRef={boardRef} />
            </StickyCharacterWrapper>

            <StickySpacer />
            <StickyCharacterWrapper2>
              <WhatIDoCharacterWaiting squareRef={squareRef} />
            </StickyCharacterWrapper2>

            <EllipseGlow />
            <GridBackground>
              <img src={WHATIDO_GRID} alt="" />
            </GridBackground>
            <Bg1 ref={boardRef}>
              <img src={STEP_BACKGROUNDS[0]} alt="" />
            </Bg1>
            <Bg2>
              <img src={STEP_BACKGROUNDS[1]} alt="" />
            </Bg2>
            <Bg3 ref={squareRef}>
              <img src={STEP_BACKGROUNDS[2]} alt="" />
            </Bg3>
            <Bg4Glass />
          </VisualsColumn>
        </ContentGrid>
      </Container>
    </Section>
  );
}
