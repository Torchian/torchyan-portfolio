'use client';

import { useLayoutEffect, useRef } from 'react';
import styled from 'styled-components';
import { Container } from '@/components/primitives';
import { spacing } from '@/styles/tokens/spacing';
import { fontSize, lineHeight, fontWeight, letterSpacing, fontFamily } from '@/styles/tokens/typography';
import { neutrals, accents } from '@/styles/tokens/colors';
import { radius } from '@/styles/tokens/radius';
import { breakpoints } from '@/styles/tokens/breakpoints';
import { media } from '@/styles/media';
import { CAPABILITIES } from './capabilitiesConfig';
import { ACTIVE_CARD, CapabilityCard, HOVER_TRANSITION, gradientEdge, scaled } from './CapabilityCard';
import { notchedCardShape, type NotchCorner } from './notchedCardShape';

/** Figma frame for the desktop layout; the layout scales down uniformly to fit screens smaller than this. */
const DESIGN_WIDTH = 1440;
const DESIGN_HEIGHT = 957;
const CIRCLE_SIZE = 448;

/** Cards in DOM order (top-left, top-right, bottom-left, bottom-right) and where each is cut. */
const NOTCHES: NotchCorner[] = ['bottom-right', 'bottom-left', 'top-right', 'top-left'];

const TITLE_ID = 'capabilities-title';

const Section = styled.section`
  position: relative;
  padding: ${spacing[1000]}px 0;

  /* Desktop fits one screen: the fixed nav bar (80px) covers the top of it. */
  ${media.up('l')} {
    display: flex;
    flex-direction: column;
    min-height: 100svh;
    padding: ${spacing[1000]}px 0 ${spacing[300]}px;
  }
`;

const Frame = styled(Container)`
  ${media.up('l')} {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
`;

const Center = styled.div`
  position: absolute;
  left: var(--capabilities-cx, 50%);
  top: var(--capabilities-cy, 50%);
  z-index: 1;
  display: grid;
  place-items: center;
  width: ${CIRCLE_SIZE}px;
  height: ${CIRCLE_SIZE}px;
  padding: ${spacing[400]}px;
  border-radius: 50%;
  /* Designed at 448px and scaled as a whole, so the title and lists keep their proportions. */
  transform: translate(-50%, -50%) scale(var(--capabilities-scale, 1));
  background-color: transparent;
  transition: background-color ${HOVER_TRANSITION};
  pointer-events: none;

  ${gradientEdge}

  &::before {
    transition: opacity ${HOVER_TRANSITION};
  }

  /* Tablet and mobile have no circle; keep the section title for screen readers. */
  ${media.down('l')} {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    overflow: hidden;
    clip-path: inset(50%);
  }
`;

const CenterPanel = styled.div`
  grid-area: 1 / 1;
  opacity: 0;
  transition: opacity ${HOVER_TRANSITION};

  &[data-center-panel='default'] {
    opacity: 1;
  }
`;

const CenterTitle = styled.h2`
  width: 350px;
  margin: 0;
  font-family: ${fontFamily.display};
  font-weight: ${fontWeight.black};
  font-size: ${fontSize.display.xl}px;
  line-height: ${lineHeight.display.xl}px;
  letter-spacing: ${letterSpacing.xxs}px;
  text-transform: uppercase;
  text-align: center;
  color: ${neutrals[100]};
`;

const CenterSkills = styled.ul`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[150]}px;
  margin: 0;
  padding: 0;
  list-style: none;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.heading.s}px;
  line-height: ${lineHeight.heading.s}px;
  letter-spacing: ${letterSpacing.xs}px;
  text-align: center;
  color: ${neutrals[100]};
`;

const Grid = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: ${scaled(spacing[300])};

  ${media.up('l')} {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-rows: repeat(2, minmax(min-content, 1fr));
    max-height: ${scaled(DESIGN_HEIGHT)};

    /* Hovering (or focusing) a card fills the circle and swaps its title for that card's skills. */
    &:has(${ACTIVE_CARD}) ${Center} {
      background-color: ${accents.primaryDark};

      &::before {
        opacity: 0;
      }
    }

    &:has(${ACTIVE_CARD}) [data-center-panel='default'] {
      opacity: 0;
    }

    ${CAPABILITIES.map(
      (_, i) => `
        &:has([data-capability='${i}']:is(:hover, :focus-visible)) [data-center-panel='${i}'] {
          opacity: 1;
        }
      `,
    ).join('')}
  }

  ${media.reducedMotion} {
    &,
    & *,
    & *::before {
      transition-duration: 0s !important;
    }
  }
`;

/**
 * Fits the desktop layout to the screen and keeps its geometry in sync:
 *  - scales the whole Figma frame (type, spacing, circle, cut-outs) by the
 *    largest factor ≤ 1 that fits the width and the screen height under the
 *    nav bar — worked out from the viewport, not the content, so the scale
 *    can't feed back into itself;
 *  - centres the circle where the gaps cross and redraws each card's cut-out
 *    at the card's measured size.
 * Runs whenever the section, grid or a card changes size. Writes go straight
 * to the DOM (CSS variables and SVG attributes), so resizing never re-renders React.
 */
function useCapabilityGeometry(
  sectionRef: React.RefObject<HTMLElement | null>,
  gridRef: React.RefObject<HTMLDivElement | null>,
) {
  useLayoutEffect(() => {
    const section = sectionRef.current;
    const grid = gridRef.current;
    if (!section || !grid) return;
    const cards = Array.from(grid.querySelectorAll<HTMLElement>('[data-capability]'));
    if (cards.length !== NOTCHES.length) return;
    const desktop = window.matchMedia(`(min-width: ${breakpoints.l}px)`);

    const update = () => {
      if (!desktop.matches) {
        section.style.removeProperty('--capabilities-scale');
        return;
      }

      const sectionStyle = getComputedStyle(section);
      const availableHeight =
        window.innerHeight - parseFloat(sectionStyle.paddingTop) - parseFloat(sectionStyle.paddingBottom);
      if (grid.clientWidth === 0 || availableHeight <= 0) return;
      const scale = Math.min(1, grid.clientWidth / DESIGN_WIDTH, availableHeight / DESIGN_HEIGHT);
      section.style.setProperty('--capabilities-scale', scale.toFixed(4));

      // Measured after the scale is applied: it changes the gaps, and so the cards.
      const gridRect = grid.getBoundingClientRect();
      const rects = cards.map((card) => card.getBoundingClientRect());
      const [topLeft, topRight, bottomLeft] = rects;
      const gapX = topRight.left - topLeft.right;
      const gapY = bottomLeft.top - topLeft.bottom;
      // The ring of space around the circle is as wide as the gap between cards.
      const notchRadius = (CIRCLE_SIZE / 2) * scale + gapX;

      grid.style.setProperty('--capabilities-cx', `${topLeft.right - gridRect.left + gapX / 2}px`);
      grid.style.setProperty('--capabilities-cy', `${topLeft.bottom - gridRect.top + gapY / 2}px`);

      cards.forEach((card, i) => {
        const { width, height } = rects[i];
        const shape = notchedCardShape({
          width,
          height,
          gapX,
          gapY,
          notchRadius,
          notch: NOTCHES[i],
          cornerRadius: radius.xl * scale,
          filletRadius: radius.xl * scale,
        });
        const svg = card.querySelector('svg');
        svg?.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svg?.querySelector('path')?.setAttribute('d', shape.d);
        card.style.setProperty('--notch-span', `${shape.span}px`);
      });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(section);
    observer.observe(grid);
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [sectionRef, gridRef]);
}

export function CapabilitiesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  useCapabilityGeometry(sectionRef, gridRef);

  return (
    <Section ref={sectionRef} id="capabilities" aria-labelledby={TITLE_ID}>
      <Frame>
        <Grid ref={gridRef}>
          {CAPABILITIES.map((capability, i) => (
            <CapabilityCard key={capability.title} capability={capability} index={i} notch={NOTCHES[i]} />
          ))}

          <Center>
            <CenterPanel data-center-panel="default">
              <CenterTitle id={TITLE_ID}>What I Build</CenterTitle>
            </CenterPanel>
            {/* Visual duplicates of each card's own (screen-reader) skills list. */}
            {CAPABILITIES.map((capability, i) => (
              <CenterPanel key={capability.title} data-center-panel={i} aria-hidden>
                <CenterSkills>
                  {capability.skills.map((skill) => (
                    <li key={skill}>{skill}</li>
                  ))}
                </CenterSkills>
              </CenterPanel>
            ))}
          </Center>
        </Grid>
      </Frame>
    </Section>
  );
}
