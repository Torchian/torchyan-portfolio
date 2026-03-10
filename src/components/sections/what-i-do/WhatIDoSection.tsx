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
  /* overflow: hidden breaks position: sticky - body has overflow-x: hidden for horizontal clip */
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

const StepsColumn = styled.div``;

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

/** Figma: Ellipse 17 - green glow at bottom */
const EllipseGlow = styled.div`
  position: absolute;
  width: 580px;
  height: 580px;
  left: calc(50% - 580px / 2 - 0px);
  bottom: 118px;
  background: #0caf0a;
  filter: blur(320px);
  transform: rotate(90deg);
  flex: none;
  flex-grow: 0;
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

/** Invert overlay for Bg2 - extra overlays (beyond ::before/::after) */
// const Bg2InvertOverlay = styled.div<{
//   $top: string;
//   $left: string;
//   $width: string;
//   $height: string;
// }>`
//   position: absolute;
//   top: ${(p) => p.$top};
//   left: ${(p) => p.$left};
//   transform: translate(-50%, -50%);
//   width: ${(p) => p.$width};
//   height: ${(p) => p.$height};
//   backdrop-filter: invert(1);
//   z-index: ${zIndex.whatidoBgForeground};
//   pointer-events: none;
// `;

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

  // &::before {
  //   content: '';
  //   position: absolute;
  //   top: 14.3%;
  //   left: 29.2%;
  //   transform: translate(-50%, -50%);
  //   width: 25.2%;
  //   height: 10.2%;
  //   backdrop-filter: invert(1);
  //   z-index: ${zIndex.whatidoBgForeground};
  // }

  // &::after {
  //   content: '';
  //   position: absolute;
  //   top: 5.5%;
  //   left: 69.7%;
  //   transform: translate(-50%, -50%);
  //   width: 31.1%;
  //   height: 8.3%;
  //   backdrop-filter: invert(1);
  //   z-index: ${zIndex.whatidoBgForeground};
  // }

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

  &::before {
    content: '';
    position: absolute;
    inset: 50%;
    transform: translate(-50%, -63%);
    width: 67%;
    height: 57%;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    z-index: ${zIndex.whatidoBgForeground};
    animation: sepiaToInvert 1000ms ${easing.linear} infinite alternate;
  }

  @keyframes sepiaToInvert {
    from {
      backdrop-filter: sepia(1) invert(1) saturate(0%);
    }
    to {
      backdrop-filter: sepia(0) invert(0) saturate(8000%);
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
  const stepRef0 = useRef<HTMLDivElement>(null);
  const stepRef1 = useRef<HTMLDivElement>(null);
  const stepRef2 = useRef<HTMLDivElement>(null);
  const stepRef3 = useRef<HTMLDivElement>(null);
  const stepRef4 = useRef<HTMLDivElement>(null);
  const stepRefs = useMemo(
    () => [stepRef0, stepRef1, stepRef2, stepRef3, stepRef4],
    [],
  );
  const { activeStepIndex, scrollProgress } = useWhatIDoScroll(stepRefs, STEPS.length);

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
                index={i + 1}
                title={step.title}
                description={step.description}
              />
            ))}
          </StepsColumn>
          <VisualsColumn>
            <StickySpacerTop />
            {/* Sticky character - first in flow so it sticks when section scrolls into view */}
            <StickyCharacterWrapper>
              <WhatIDoCharacter
                activeStepIndex={activeStepIndex}
                scrollProgress={scrollProgress}
              />
            </StickyCharacterWrapper>

            <StickySpacer />
            <StickyCharacterWrapper2>
              <WhatIDoCharacterWaiting
                activeStepIndex={activeStepIndex}
                scrollProgress={scrollProgress}
              />
            </StickyCharacterWrapper2>

            <EllipseGlow />
            <GridBackground>
              <img src={WHATIDO_GRID} alt="" />
            </GridBackground>
            <Bg1>
              <img src={STEP_BACKGROUNDS[0]} alt="" />
            </Bg1>
            <Bg2>
              {/* <Bg2InvertOverlay $top="23.2%" $left="90%" $width="14%" $height="21.5%" />
              <Bg2InvertOverlay $top="61%" $left="49.6%" $width="79.6%" $height="62.7%" /> */}
              <img src={STEP_BACKGROUNDS[1]} alt="" />
            </Bg2>
            <Bg3>
              <img src={STEP_BACKGROUNDS[2]} alt="" />
            </Bg3>
            <Bg4Glass />
          </VisualsColumn>
        </ContentGrid>
      </Container>
    </Section>
  );
}
