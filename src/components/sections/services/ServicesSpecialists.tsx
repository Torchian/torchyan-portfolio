'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { useTranslations } from 'next-intl';
import { VisuallyHidden } from '@/components/primitives';
import { spacing } from '@/styles/tokens/spacing';
import { fontFamily, fontWeight, fontSize, lineHeight, letterSpacing } from '@/styles/tokens/typography';
import { accents, neutrals } from '@/styles/tokens/colors';
import { grid } from '@/styles/tokens/grid';
import { media } from '@/styles/media';
import { HEADER_HEIGHT } from '@/components/layouts/NavBar';

/*
 * Figma: New Services (4105:15024) — Position=Default and one state per
 * specialist. Four specialists stand around a round frame, each on its own
 * edge, heads towards the middle; the middle lists the four services.
 * Pointing at one (or at its service in the list):
 *  - its portrait grows from the edge and gets its colour back, while the
 *    other three step back out of the frame;
 *  - the ring around the middle turns green, thins, and opens a cut in front
 *    of that specialist;
 *  - the middle turns green and shows that service.
 *
 * Figma morphs between the states' cut-ring shapes, which spins the cut the
 * wrong way. Here the cut is a conic-gradient mask whose angle and width are
 * registered custom properties, so the browser tweens them as numbers: the cut
 * opens and closes in place, and moving from one specialist to the next swings
 * it round the short way (the angle is accumulated, never wrapped).
 *
 * Everything is placed in the 1024 design frame and scales with it. Below
 * 720px of frame the middle keeps only the titles, and the details move under
 * the circle at a readable size.
 */

const FRAME = 1024;
/** Design px from the frame's edge in which every portrait stands. */
const PORTRAIT = 260;
const PORTRAIT_ACTIVE = 320;
/** How far the others step back out of the frame. */
const AWAY = 40;
const DISC = 460;
const DISC_ACTIVE = 520;
/** The ring's hole, as a share of its radius: 358.4 at rest, 409.6 when on. */
const HOLE = 358.4 / 512;
const HOLE_ACTIVE = 409.6 / 512;
/** The cut, centred on the chosen specialist. */
const GAP_DEG = 60;

const EASE = 'cubic-bezier(0.65, 0, 0.35, 1)';
const DURATION = 600;

type ServiceId = 'brand' | 'backend' | 'ai' | 'marketing';

interface Specialist {
  id: ServiceId;
  src: string;
  /** Where the specialist stands, clockwise from the top. */
  angle: number;
  /** The AI portrait is drawn mirrored, as in Figma. */
  mirror?: boolean;
}

/** In the order of the copy (servicesPage.teamServices.items). */
const SPECIALISTS: Specialist[] = [
  { id: 'brand', src: '/services/specialists/brand.webp', angle: 180 },
  { id: 'backend', src: '/services/specialists/backend.webp', angle: 270 },
  { id: 'ai', src: '/services/specialists/ai.webp', angle: 90, mirror: true },
  { id: 'marketing', src: '/services/specialists/marketing.webp', angle: 0 },
];

interface ServiceCopy {
  title: string;
  situation: string;
  outcome: string;
  owns: string[];
}

/** Registered, so they transition as numbers rather than flipping. */
const RingProperties = createGlobalStyle`
  @property --ring-at {
    syntax: '<angle>';
    inherits: false;
    initial-value: 0deg;
  }
  @property --ring-gap {
    syntax: '<angle>';
    inherits: false;
    initial-value: 0deg;
  }
  @property --ring-hole {
    syntax: '<percentage>';
    inherits: false;
    initial-value: ${HOLE * 100}%;
  }
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${spacing[1000]}px 0;
  /* The scene runs off the page's sides, cut there; above and below it fades
     out over the sections around it. */
  overflow-x: clip;

  ${media.down('m')} {
    padding: ${spacing[600]}px 0;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: ${grid.maxWidth}px;
  padding: 0 ${spacing[400]}px;

  ${media.down('xl')} {
    padding: 0 ${spacing[300]}px;
  }

  ${media.down('m')} {
    padding: 0 ${spacing[200]}px;
  }
`;

/**
 * The circle and what goes under it. The circle fits the screen below the
 * header with a little room either side, so it's seen whole; it never drops
 * below a phone's width, where the screen's height stops mattering. Its
 * container queries key on this width — the circle's own.
 */
const Stage = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: min(100%, ${FRAME}px, max(320px, calc(100svh - ${HEADER_HEIGHT}px - ${2 * spacing[600]}px)));
  container-type: inline-size;
`;

const Frame = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  clip-path: circle(50%);
  container-type: inline-size;
  /* One design pixel. */
  --u: calc(100cqw / ${FRAME});
`;

const fill = `
  position: absolute;
  inset: 0;
`;

const Ring = styled.div`
  ${fill}
  border-radius: 50%;
  background: linear-gradient(to bottom, ${neutrals[900]}, ${neutrals[800]});
  --ring-hole: ${HOLE * 100}%;
  --ring-gap: 0deg;
  mask-image:
    radial-gradient(closest-side, transparent calc(var(--ring-hole) - 0.3%), #000 var(--ring-hole)),
    conic-gradient(
      from calc(var(--ring-at) - var(--ring-gap) / 2),
      transparent max(0deg, calc(var(--ring-gap) - 0.4deg)),
      #000 var(--ring-gap),
      #000 calc(360deg - min(0.4deg, var(--ring-gap))),
      transparent 360deg
    );
  mask-composite: intersect;
  -webkit-mask-composite: source-in;
  /* At rest the cut is closed, so its angle jumps: it opens where it's needed. */
  transition:
    --ring-gap ${DURATION}ms ${EASE},
    --ring-hole ${DURATION}ms ${EASE};

  &::after {
    content: '';
    ${fill}
    background: ${accents.primary};
    opacity: 0;
    transition: opacity ${DURATION}ms ${EASE};
  }

  &[data-on='true'] {
    --ring-hole: ${HOLE_ACTIVE * 100}%;
    --ring-gap: ${GAP_DEG}deg;
    transition:
      --ring-at ${DURATION}ms ${EASE},
      --ring-gap ${DURATION}ms ${EASE},
      --ring-hole ${DURATION}ms ${EASE};

    &::after {
      opacity: 1;
    }
  }

  ${media.reducedMotion} {
    transition: none;

    &::after {
      transition: none;
    }
  }
`;

const Disc = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: calc(${DISC} * var(--u));
  aspect-ratio: 1;
  border-radius: 50%;
  background: linear-gradient(to bottom, ${neutrals[900]}, ${neutrals[800]});
  transform: translate(-50%, -50%);
  transition: transform ${DURATION}ms ${EASE};

  &::after {
    content: '';
    ${fill}
    border-radius: 50%;
    background: ${accents.primary};
    opacity: 0;
    transition: opacity ${DURATION}ms ${EASE};
  }

  &[data-on='true'] {
    transform: translate(-50%, -50%) scale(${DISC_ACTIVE / DISC});

    &::after {
      opacity: 1;
    }
  }

  ${media.reducedMotion} {
    transition: none;

    &::after {
      transition: none;
    }
  }
`;

/** The middle: the list at rest, one service when chosen; all stacked in one cell. */
const Middle = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  display: grid;
  /* One shrinkable column: the list's unwrapped longest line mustn't widen it. */
  grid-template-columns: minmax(0, 1fr);
  place-items: center;
  width: calc(${DISC} * var(--u));
  aspect-ratio: 1;
  padding: calc(48 * var(--u));
  transform: translate(-50%, -50%);
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  color: ${neutrals[100]};
  text-align: center;

  > * {
    grid-area: 1 / 1;
    opacity: 0;
    visibility: hidden;
    transition:
      opacity ${DURATION / 2}ms ease-out,
      visibility 0s linear ${DURATION / 2}ms;
  }

  > [data-shown='true'] {
    opacity: 1;
    visibility: visible;
    transition:
      opacity ${DURATION / 2}ms ease-in ${DURATION / 3}ms,
      visibility 0s;
  }

  ${media.reducedMotion} {
    > *,
    > [data-shown='true'] {
      transition: none;
    }
  }
`;

const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: calc(12 * var(--u));
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: calc(${fontSize.heading.l} * var(--u));
  line-height: calc(${lineHeight.heading.l} * var(--u));
  letter-spacing: ${letterSpacing.xs}px;
  /* As in Figma, the longest title runs past the padding rather than wrap. */
  white-space: nowrap;

  button {
    padding: 0;
    border: 0;
    background: none;
    font: inherit;
    color: inherit;
    cursor: pointer;
  }

  @container (width < 720px) {
    font-size: max(13px, calc(${fontSize.heading.l} * var(--u)));
    line-height: 1.3;
    white-space: normal;
  }
`;

const Service = styled.div`
  display: flex;
  flex-direction: column;
  gap: calc(32 * var(--u));
  width: 100%;
`;

const ServiceTitle = styled.p`
  margin: 0;
  font: inherit;
  font-size: calc(${fontSize.heading.l} * var(--u));
  line-height: calc(${lineHeight.heading.l} * var(--u));
  letter-spacing: ${letterSpacing.xs}px;

  @container (width < 720px) {
    font-size: max(14px, calc(${fontSize.heading.l} * var(--u)));
    line-height: 1.3;
  }
`;

/** Situation, outcome and bullets: inside the middle only where the frame has room. */
const Details = styled.div`
  display: flex;
  flex-direction: column;
  gap: calc(32 * var(--u));

  @container (width < 720px) {
    display: none;
  }
`;

const Paragraphs = styled.div`
  display: flex;
  flex-direction: column;
  gap: calc(16 * var(--u));
  font-size: max(12px, calc(${fontSize.body.xl} * var(--u)));
  line-height: max(16px, calc(${lineHeight.body.xl} * var(--u)));
  letter-spacing: ${letterSpacing.s}px;

  p {
    margin: 0;
  }
`;

const Bullets = styled.ul`
  display: flex;
  flex-direction: column;
  gap: calc(2 * var(--u));
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: max(12px, calc(${fontSize.body.l} * var(--u)));
  line-height: max(15px, calc(${lineHeight.body.l} * var(--u)));
  letter-spacing: ${letterSpacing.s}px;
`;

/**
 * One specialist's edge: the whole frame, turned so the specialist stands on
 * its bottom edge. Only the portrait inside takes the pointer.
 */
const Side = styled.div`
  ${fill}
  pointer-events: none;
`;

const Portrait = styled.button`
  position: absolute;
  bottom: 0;
  left: 50%;
  width: calc(${PORTRAIT} * var(--u));
  aspect-ratio: 1;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
  pointer-events: auto;
  transform: translate(-50%, 0) scale(1);
  transform-origin: 50% 100%;
  transition: transform ${DURATION}ms ${EASE};

  &[data-state='on'] {
    transform: translate(-50%, 0) scale(${PORTRAIT_ACTIVE / PORTRAIT});
  }

  &[data-state='away'] {
    transform: translate(-50%, calc(${AWAY} * var(--u))) scale(1);
  }

  img {
    object-fit: cover;
    object-position: bottom;
    filter: grayscale(1);
    transition: filter ${DURATION}ms ${EASE};
  }

  &[data-mirror='true'] img {
    transform: scaleX(-1);
  }

  &[data-state='on'] img {
    filter: grayscale(0);
  }

  ${media.reducedMotion} {
    transition: none;

    img {
      transition: none;
    }
  }
`;

/** Under the circle, where the frame is too small for the details inside it. */
const Below = styled.div`
  display: none;

  @container (width < 720px) {
    display: grid;
    width: 100%;
    max-width: 480px;
    margin-top: ${spacing[400]}px;
    font-family: ${fontFamily.heading};
    font-weight: ${fontWeight.semibold};
    text-align: center;
    color: ${neutrals[500]};

    > * {
      grid-area: 1 / 1;
      opacity: 0;
      visibility: hidden;
      transition:
        opacity ${DURATION / 2}ms ease-out,
        visibility 0s linear ${DURATION / 2}ms;
    }

    > [data-shown='true'] {
      opacity: 1;
      visibility: visible;
      transition:
        opacity ${DURATION / 2}ms ease-in,
        visibility 0s;
    }
  }
`;

const BelowText = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[300]}px;
  font-size: ${fontSize.body.l}px;
  line-height: ${lineHeight.body.l}px;
  letter-spacing: ${letterSpacing.s}px;

  p {
    margin: 0;
  }

  ul {
    display: flex;
    flex-direction: column;
    gap: ${spacing[25]}px;
    margin: 0;
    padding: 0;
    list-style: none;
    color: ${neutrals[100]};
  }
`;

/** The short way round from one angle to the next, as a running total. */
function towards(from: number, to: number) {
  const delta = ((((to - from) % 360) + 540) % 360) - 180;
  return from + delta;
}

/**
 * The scene around the circle, behind it: a glow, three orbits (one with a
 * dot travelling round it), and hairline axes running out from each
 * specialist towards the page's edges, ticked like a ruler. Drawn in the
 * circle's own units, centred on it, and left to spill past it; strokes stay
 * 1px at any size. The chosen specialist's axis and node light up green.
 */
const Scene = styled.div`
  /* Three circles square, the circle in the middle: room for the scene to run
     out past the section, top and bottom, and fade there. */
  position: absolute;
  top: -100%;
  left: -100%;
  width: 300%;
  aspect-ratio: 1;
  pointer-events: none;
  /* Whole from the section's padding inwards, so the top and bottom nodes and
     numbers show; then fading out over the next 260px, into the sections
     around it, rather than ending on a line. */
  --reach: ${spacing[1000] + 260}px;
  --solid: ${spacing[1000]}px;
  mask-image: linear-gradient(
    to bottom,
    transparent max(0%, calc(100% / 3 - var(--reach))),
    #000 calc(100% / 3 - var(--solid)),
    #000 calc(200% / 3 + var(--solid)),
    transparent min(100%, calc(200% / 3 + var(--reach)))
  );

  ${media.down('m')} {
    --reach: ${spacing[600] + 160}px;
    --solid: ${spacing[600]}px;
  }

  /* Ambient glow, and a green one that comes up with a choice: the circle
     plus 45% of it all round. */
  &::before,
  &::after {
    content: '';
    position: absolute;
    inset: ${((1 - 0.45) / 3) * 100}%;
    border-radius: 50%;
    transition: opacity ${DURATION}ms ${EASE};
  }

  &::before {
    background: radial-gradient(closest-side, rgba(43, 36, 92, 0.55), rgba(31, 26, 56, 0.25) 55%, transparent);
  }

  &::after {
    background: radial-gradient(closest-side, rgba(12, 175, 10, 0.16), rgba(12, 175, 10, 0.05) 50%, transparent 75%);
    opacity: 0;
  }

  &[data-on='true']::after {
    opacity: 1;
  }

  svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
  }

  .orbit {
    fill: none;
    stroke: rgba(246, 246, 246, 0.09);
  }

  .orbit-dashed {
    stroke-dasharray: 2 10;
    stroke: rgba(246, 246, 246, 0.14);
  }

  .orbit-far {
    stroke: rgba(246, 246, 246, 0.05);
  }

  .traveller {
    transform-origin: 0 0;
    animation: ${keyframes`to { transform: rotate(360deg); }`} 60s linear infinite;
  }

  .traveller circle {
    fill: ${accents.primary};
  }

  .axis {
    stroke-width: 1;
    transition: opacity ${DURATION}ms ${EASE};
  }

  .axis-lit {
    opacity: 0;
  }

  .ticks {
    stroke: rgba(246, 246, 246, 0.12);
  }

  .node {
    fill: ${neutrals[900]};
    stroke: rgba(246, 246, 246, 0.35);
    transition:
      fill ${DURATION}ms ${EASE},
      stroke ${DURATION}ms ${EASE};
  }

  .index {
    font-family: ${fontFamily.heading};
    font-weight: ${fontWeight.semibold};
    font-size: 16px;
    letter-spacing: 1px;
    fill: rgba(246, 246, 246, 0.35);
    transition: fill ${DURATION}ms ${EASE};
  }

  [data-on='true'] {
    .axis-lit {
      opacity: 1;
    }

    .node {
      fill: ${accents.primary};
      stroke: ${accents.primary};
    }

    .index {
      fill: ${accents.primary};
    }
  }

  /* On a small circle the details sit under it, where an axis would cross them. */
  @container (width < 720px) {
    .axis,
    .index,
    .ticks {
      display: none;
    }
  }

  ${media.reducedMotion} {
    .traveller {
      animation: none;
    }

    &::after,
    .axis,
    .node,
    .index {
      transition: none;
    }
  }
`;

/** Ruler ticks along one axis, from just outside the orbits outwards. */
function ticks(from: number, to: number) {
  const marks: string[] = [];
  for (let d = from; d <= to; d += 48) {
    const long = (d - from) % 192 === 0;
    marks.push(`M ${d} ${long ? -8 : -4} V ${long ? 8 : 4}`);
  }
  return marks.join(' ');
}

function SpecialistScene({ active }: { active: ServiceId | null }) {
  const R = FRAME / 2;
  return (
    <Scene data-on={active !== null}>
      <svg viewBox={`${-3 * R} ${-3 * R} ${3 * FRAME} ${3 * FRAME}`} aria-hidden>
        <defs>
          <linearGradient id="axis-fade" gradientUnits="userSpaceOnUse" x1={R + 144} x2={R * 3} y1="0" y2="0">
            <stop offset="0" stopColor="#f6f6f6" stopOpacity="0.22" />
            <stop offset="1" stopColor="#f6f6f6" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="axis-lit" gradientUnits="userSpaceOnUse" x1={R + 144} x2={R * 2.2} y1="0" y2="0">
            <stop offset="0" stopColor={accents.primary} stopOpacity="0.9" />
            <stop offset="1" stopColor={accents.primary} stopOpacity="0" />
          </linearGradient>
        </defs>

        <circle className="orbit" r={R + 72} vectorEffect="non-scaling-stroke" />
        <circle className="orbit orbit-dashed" r={R + 176} vectorEffect="non-scaling-stroke" />
        <circle className="orbit orbit-far" r={R + 320} vectorEffect="non-scaling-stroke" />
        <g className="traveller">
          <circle cx={R + 176} cy={0} r={4} />
        </g>
        <g className="traveller" style={{ animationDuration: '90s', animationDirection: 'reverse' }}>
          <circle cx={0} cy={R + 320} r={3} opacity={0.6} />
        </g>

        {SPECIALISTS.map((s, i) => (
          // Each axis is drawn pointing right, then turned to its specialist.
          <g key={s.id} transform={`rotate(${s.angle - 90})`} data-on={active === s.id}>
            <path
              className="axis"
              d={`M ${R + 144} 0 H ${R * 3}`}
              stroke="url(#axis-fade)"
              vectorEffect="non-scaling-stroke"
            />
            <path
              className="axis axis-lit"
              d={`M ${R + 144} 0 H ${R * 2.2}`}
              stroke="url(#axis-lit)"
              vectorEffect="non-scaling-stroke"
            />
            <path className="ticks" d={ticks(R + 176 + 48, R * 3)} vectorEffect="non-scaling-stroke" />
            <circle className="node" cx={R + 72} cy={0} r={6} vectorEffect="non-scaling-stroke" />
            {/* Beside its node, upright wherever the axis points; the axis carries on past it. */}
            <text
              className="index"
              x={R + 118}
              y={0}
              transform={`rotate(${90 - s.angle} ${R + 118} 0)`}
              textAnchor="middle"
              dominantBaseline="central"
            >
              {String(i + 1).padStart(2, '0')}
            </text>
          </g>
        ))}
      </svg>
    </Scene>
  );
}

export function ServicesSpecialists() {
  const t = useTranslations('servicesPage.teamServices');
  const items = t.raw('items') as ServiceCopy[];
  const [active, setActive] = useState<ServiceId | null>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  // The cut's angle, never wrapped, so each move turns the short way.
  const atRef = useRef(0);

  const choose = (id: ServiceId | null) => {
    const ring = ringRef.current;
    const specialist = SPECIALISTS.find((s) => s.id === id);
    if (ring && specialist) {
      const next = towards(atRef.current, specialist.angle);
      atRef.current = next;
      ring.style.setProperty('--ring-at', `${next}deg`);
      // From rest the ring has no transition on its angle: make the jump land
      // before the ring turns on, so the cut opens in place.
      if (!active) getComputedStyle(ring).getPropertyValue('--ring-at');
    }
    setActive(id);
  };

  const toggle = (id: ServiceId) => () => choose(active === id ? null : id);
  const point = (id: ServiceId) => (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') choose(id);
  };

  return (
    <Section aria-labelledby="team-services-title">
      <RingProperties />
      <Container>
        <VisuallyHidden as="h2" id="team-services-title">
          {t('title')}
        </VisuallyHidden>
        <Stage>
          <SpecialistScene active={active} />
          {/* The circle is a picture of the list below it, which is what assistive tech reads. */}
          <Frame aria-hidden onPointerLeave={(e) => e.pointerType === 'mouse' && choose(null)}>
            <Ring ref={ringRef} data-on={active !== null} />
            <Disc data-on={active !== null} />

            <Middle>
              <List data-shown={active === null}>
                {SPECIALISTS.map((s, i) => (
                  <li key={s.id}>
                    <button type="button" tabIndex={-1} onPointerEnter={point(s.id)} onClick={toggle(s.id)}>
                      {items[i]?.title}
                    </button>
                  </li>
                ))}
              </List>
              {SPECIALISTS.map((s, i) => {
                const copy = items[i];
                if (!copy) return null;
                return (
                  <Service key={s.id} data-shown={active === s.id}>
                    <ServiceTitle>{copy.title}</ServiceTitle>
                    <Details>
                      <Paragraphs>
                        <p>{copy.situation}</p>
                        <p>{copy.outcome}</p>
                      </Paragraphs>
                      <Bullets>
                        {copy.owns.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </Bullets>
                    </Details>
                  </Service>
                );
              })}
            </Middle>

            {SPECIALISTS.map((s) => (
              <Side key={s.id} style={{ transform: `rotate(${s.angle - 180}deg)` }}>
                <Portrait
                  type="button"
                  data-state={active === s.id ? 'on' : active ? 'away' : 'rest'}
                  data-mirror={s.mirror || undefined}
                  tabIndex={-1}
                  onPointerEnter={point(s.id)}
                  onClick={toggle(s.id)}
                >
                  <Image src={s.src} alt="" fill sizes="(max-width: 1024px) 32vw, 320px" />
                </Portrait>
              </Side>
            ))}
          </Frame>

          <Below aria-hidden>
            <BelowText data-shown={active === null}>
              <p>{t('hint')}</p>
            </BelowText>
            {SPECIALISTS.map((s, i) => {
              const copy = items[i];
              if (!copy) return null;
              return (
                <BelowText key={s.id} data-shown={active === s.id}>
                  <p>{copy.situation}</p>
                  <p>{copy.outcome}</p>
                  <ul>
                    {copy.owns.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </BelowText>
              );
            })}
          </Below>
        </Stage>

        <VisuallyHidden as="ul">
          {items.map((copy) => (
            <li key={copy.title}>
              <h3>{copy.title}</h3>
              <p>{copy.situation}</p>
              <p>{copy.outcome}</p>
              <ul>
                {copy.owns.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </li>
          ))}
        </VisuallyHidden>
      </Container>
    </Section>
  );
}
