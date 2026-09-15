'use client';

/* eslint-disable @next/next/no-img-element -- decorative stretched SVG lines; next/image adds nothing */
import { useLayoutEffect, useRef } from 'react';
import styled from 'styled-components';
import { Button, Container } from '@/components/primitives';
import { SectionHeading } from '@/components/composites';
import { Link } from '@/i18n/navigation';
import { spacing } from '@/styles/tokens/spacing';
import { fontSize, lineHeight, fontWeight, letterSpacing, fontFamily } from '@/styles/tokens/typography';
import { neutrals, accents } from '@/styles/tokens/colors';
import { radius } from '@/styles/tokens/radius';
import { media, mediaQueries } from '@/styles/media';
import { useTranslations } from 'next-intl';
import type { Capability } from './capabilitiesConfig';
import { ACTIVE_CARD, CapabilityCard, HOVER_TRANSITION, gradientEdge, scaled } from './CapabilityCard';
import { notchedCardShape, type NotchCorner } from './notchedCardShape';

/*
 * Figma: Capabilities — Desktop 1920 (2670:10598), 1440 (2670:10956), Tablet 1024 (2670:11650),
 * Mobile 480 (2670:12293); the lines under it: 2670:10610, 3721:13744, 3720:13737, 2670:12305.
 *
 *  - Desktop (from 1025px): section heading, then the four notched cards around the "What I Build" circle.
 *  - Tablet and mobile: section heading, the cards stacked, then a Contact CTA.
 *  - Two textured lines hang below the section, in the space before Trusted By.
 */

/** The grid's width in the 1440 frame; narrower grids scale the whole layout down, wider ones (1920 frame) keep 1. */
const DESIGN_WIDTH = 1372;
const DESIGN_HEIGHT = 957;
const CIRCLE_SIZE = 448;

/** Cards in DOM order (top-left, top-right, bottom-left, bottom-right) and where each is cut. */
const NOTCHES: NotchCorner[] = ['bottom-right', 'bottom-left', 'top-right', 'top-left'];

const TITLE_ID = 'capabilities-title';

const Section = styled.section`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: ${spacing[300]}px;
  padding: 0 0 ${spacing[1000]}px;

  ${media.up('xl')} {
    padding: ${spacing[1000]}px 0;
  }

  ${media.down('m')} {
    padding: ${spacing[600]}px 0;
  }
`;

const HeadingFrame = styled(Container)`
  padding-block: ${spacing[1000]}px;

  ${media.between('m', 'xl')} {
    padding-inline: ${spacing[300]}px;
  }

  ${media.down('m')} {
    padding: 0 ${spacing[200]}px;
  }
`;

const Frame = styled(Container)`
  display: flex;
  flex-direction: column;
  gap: ${spacing[600]}px;
  padding-top: ${spacing[300]}px;

  ${media.up('xl')} {
    padding-bottom: ${spacing[300]}px;
  }

  ${media.up('xxxl')} {
    padding-block: 0;
  }

  ${media.between('m', 'xl')} {
    padding-inline: ${spacing[300]}px;
  }

  ${media.down('m')} {
    padding-inline: ${spacing[200]}px;
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

  /* Tablet and mobile have no circle; the section heading names the section there. */
  ${media.down('xl')} {
    display: none;
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

const CenterTitle = styled.p`
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

  /* Even Armenian's shortest fitting title ("Իմ գործը") is wider than the circle at 96px. */
  :lang(hy) & {
    font-size: ${fontSize.display.l}px;
    line-height: ${lineHeight.display.l}px;
  }
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

  ${media.up('xl')} {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-rows: repeat(2, minmax(min-content, 1fr));
    height: ${scaled(DESIGN_HEIGHT)};

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

    ${NOTCHES.map(
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
 * Figma CTA Primary under the stacked cards: its own width on tablet, full width on mobile.
 * A wrapper rather than styled(Button): styled-components doesn't pass $variant through to the Button.
 */
const ContactCTA = styled.div`
  display: flex;
  justify-content: center;

  ${media.up('xl')} {
    display: none;
  }

  ${media.down('m')} {
    > * {
      width: 100%;
      max-width: none;
    }
  }
`;

/**
 * Two textured lines just below the section, centred, the lower one 83% as wide.
 * Length and depth per frame: 1920 1640px at 130px, 1440 1340px at 94px,
 * 1024 841px at 70px, 480 452px at 48px (the depth is the long line's bottom edge).
 */
const Lines = styled.div`
  --line-length: calc(100% - 28px);
  --line-depth: 48px;
  position: absolute;
  top: 100%;
  right: 0;
  left: 0;
  height: 0;
  pointer-events: none;

  ${media.up('m')} {
    --line-length: 82.1%;
    --line-depth: 70px;
  }

  ${media.up('xl')} {
    --line-length: calc(100% - 100px);
    --line-depth: 94px;
  }

  ${media.up('xxxl')} {
    --line-length: clamp(1340px, 100% - 280px, 1640px);
    --line-depth: 130px;
  }

  img {
    position: absolute;
    left: 50%;
    display: block;
    width: var(--line-length);
    max-width: none;
    height: 8px;
    /* Figma overlays the white texture on the page. The page content is its own layer here, so a real
       overlay would blend with nothing and paint plain white; this opacity matches the overlay over the dark glow. */
    opacity: 0.16;
    /* Figma draws them mirrored. */
    transform: translateX(-50%) scaleX(-1);
  }

  img:first-child {
    top: calc(var(--line-depth) - 8px);
  }

  img:last-child {
    top: calc(var(--line-depth) + 22px);
    width: calc(var(--line-length) * 0.832);
  }
`;

/**
 * Fits the desktop layout to its width and keeps its geometry in sync:
 *  - scales the whole Figma frame (type, spacing, circle, cut-outs) by the
 *    largest factor ≤ 1 that fits the grid's width;
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
    const desktop = window.matchMedia(mediaQueries.up('xl'));

    const update = () => {
      if (!desktop.matches) {
        // Leaving the desktop layout (a resize or rotation): drop everything it measured.
        section.style.removeProperty('--capabilities-scale');
        grid.style.removeProperty('--capabilities-cx');
        grid.style.removeProperty('--capabilities-cy');
        return;
      }

      if (grid.clientWidth === 0) return;
      const scale = Math.min(1, grid.clientWidth / DESIGN_WIDTH);
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
  const t = useTranslations('capabilities');
  const capabilities = t.raw('items') as Capability[];

  return (
    <Section ref={sectionRef} id="capabilities" aria-labelledby={TITLE_ID}>
      <HeadingFrame>
        <SectionHeading id={TITLE_ID} title={t('heading')} subtitle={t('subtitle')} />
      </HeadingFrame>

      <Frame>
        <Grid ref={gridRef}>
          {/* First in the DOM so the circle's title comes before the cards' titles;
              it's absolutely positioned, so the order doesn't affect layout. */}
          <Center>
            <CenterPanel data-center-panel="default">
              <CenterTitle>{t('title')}</CenterTitle>
            </CenterPanel>
            {/* Visual duplicates of each card's own (screen-reader) skills list. */}
            {capabilities.map((capability, i) => (
              <CenterPanel key={capability.title} data-center-panel={i} aria-hidden>
                <CenterSkills>
                  {capability.skills.map((skill) => (
                    <li key={skill}>{skill}</li>
                  ))}
                </CenterSkills>
              </CenterPanel>
            ))}
          </Center>

          {capabilities.map((capability, i) => (
            <CapabilityCard key={capability.title} capability={capability} index={i} notch={NOTCHES[i]} />
          ))}
        </Grid>

        <ContactCTA>
          <Button as={Link} href="/#contact" $variant="secondary">
            {t('cta')}
          </Button>
        </ContactCTA>
      </Frame>

      <Lines aria-hidden>
        <img src="/vectors/section-lines/long.svg" alt="" />
        <img src="/vectors/section-lines/short.svg" alt="" />
      </Lines>
    </Section>
  );
}
