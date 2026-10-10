'use client';

import { useLayoutEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { accents } from '@/styles/tokens/colors';
import { media } from '@/styles/media';
import { MapDot } from './MapDot';
import { usePauseOffscreen } from '@/hooks';

/** The map width the dots were drawn against; the scale is this one over the real one. */
const DESIGN_MAP_WIDTH = 1200;

const Wrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1550 / 779;
  margin: 0 auto;
`;

const MapImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
`;

export interface MapLocation {
  /** Stable across languages: keys the dot and seeds its pulse timing. Falls back to the label. */
  id?: string;
  label: string;
  year?: number | string;
  x: number;
  y: number;
  /**
   * How far the route from home bows, as a share of its length: positive
   * towards the top of the map, negative towards the bottom. Points in the
   * same direction from home take different bows, so their routes fan out
   * rather than run over each other.
   */
  bow?: number;
}

export interface WorldMapSVGProps {
  locations: MapLocation[];
  alt: string;
  /**
   * The home point, by id: drawn in the secondary pink, pinging, with a
   * grey route out to every other point, with a green comet running along it.
   */
  hub?: string;
}

/** The map's own frame, so routes drawn on it keep their shape at any width. */
const VIEW = { width: 1550, height: 779 } as const;

/** How long the green comet is, as a share of its route. */
const TAIL = 0.3;
/** The comet is stacked dashes, each shorter and brighter towards the head, so its tail fades out. */
const LAYERS = [1, 0.75, 0.5, 0.3, 0.15].map((share) => share * TAIL);

/*
 * The heads run together from home to past the city, so the comet enters and
 * leaves whole. Each layer's dash pattern (an empty gap of TAIL minus its
 * length first) puts its head on the shared one.
 */
const travel = keyframes`
  from {
    stroke-dashoffset: ${TAIL};
  }
  to {
    stroke-dashoffset: -1;
  }
`;

/** Lines of longitude and latitude every 15°, on the map's frame. */
const MERIDIANS = Array.from({ length: 23 }, (_, i) => ((i + 1) * VIEW.width) / 24);
const PARALLELS = Array.from({ length: 11 }, (_, i) => ((i + 1) * VIEW.height) / 12);

const Graticule = styled.svg`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  /* Strongest in the middle of the map, gone at its edges. */
  mask-image: radial-gradient(closest-side, #000 40%, transparent);

  line {
    stroke: rgba(246, 246, 246, 0.06);
  }
`;

const ping = keyframes`
  from {
    transform: scale(1);
    opacity: 0.6;
  }
  to {
    transform: scale(9);
    opacity: 0;
  }
`;

const Routes = styled.svg`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;

  /* A short green dash running out along each route from home, over and over. */
  .route {
    fill: none;
  }

  .pulse {
    fill: none;
    stroke: ${accents.primary};
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-opacity: 0.22;
    animation: ${travel} 5s linear infinite;
  }

  /* Home sends out rings, like a radar. */
  .ping {
    fill: none;
    stroke: ${accents.secondary};
    transform-box: fill-box;
    transform-origin: center;
    animation: ${ping} 3.6s ease-out infinite;
  }

  ${media.reducedMotion} {
    .pulse,
    .ping {
      display: none;
    }
  }
`;

/**
 * A route from home to a point: a shallow arc, bowed like a flight path by the
 * point's own bow.
 */
function route(from: MapLocation, to: MapLocation) {
  const ax = (from.x / 100) * VIEW.width;
  const ay = (from.y / 100) * VIEW.height;
  const bx = (to.x / 100) * VIEW.width;
  const by = (to.y / 100) * VIEW.height;
  const dx = bx - ax;
  const dy = by - ay;
  const length = Math.hypot(dx, dy);
  // The perpendicular that points up the map.
  let nx = dy / length;
  let ny = -dx / length;
  if (ny > 0) {
    nx = -nx;
    ny = -ny;
  }
  const bow = length * (to.bow ?? 0.15);
  const cx = (ax + bx) / 2 + nx * bow;
  const cy = (ay + by) / 2 + ny * bow;
  return `M ${ax.toFixed(1)} ${ay.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}`;
}

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function WorldMapSVG({ locations, alt, hub }: WorldMapSVGProps) {
  // The dots beat forever; only while the map is in view.
  const pauseRef = usePauseOffscreen<HTMLDivElement>();
  const wrapperRef = useRef<HTMLDivElement>(null);

  /*
   * How wide the map is against the size the dots were drawn at. Written to the
   * DOM rather than held in state: it changes on every resize frame, and a dot's
   * size is not worth a render.
   */
  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const update = () => {
      const width = wrapper.getBoundingClientRect().width;
      if (width > 0) wrapper.style.setProperty('--map-scale', String(width / DESIGN_MAP_WIDTH));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, []);

  const home = hub ? locations.find((loc) => loc.id === hub) : undefined;
  const others = home ? locations.filter((loc) => loc !== home) : [];

  return (
    <Wrapper
      ref={(node) => {
        wrapperRef.current = node;
        pauseRef.current = node;
      }}
    >
      <Graticule viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} aria-hidden>
        {MERIDIANS.map((x) => (
          <line key={`m${x}`} x1={x} x2={x} y1={0} y2={VIEW.height} vectorEffect="non-scaling-stroke" />
        ))}
        {PARALLELS.map((y) => (
          <line key={`p${y}`} x1={0} x2={VIEW.width} y1={y} y2={y} vectorEffect="non-scaling-stroke" />
        ))}
      </Graticule>
      <MapImage src="/vectors/map.svg" alt={alt} loading="lazy" />
      {home && (
        <Routes viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} aria-hidden>
          <defs>
            {others.map((loc) => {
              const id = loc.id ?? loc.label;
              return (
                <linearGradient
                  key={id}
                  id={`route-${id}`}
                  gradientUnits="userSpaceOnUse"
                  x1={(home.x / 100) * VIEW.width}
                  y1={(home.y / 100) * VIEW.height}
                  x2={(loc.x / 100) * VIEW.width}
                  y2={(loc.y / 100) * VIEW.height}
                >
                  <stop offset="0" stopColor="#f6f6f6" stopOpacity="0.32" />
                  <stop offset="1" stopColor="#f6f6f6" stopOpacity="0.06" />
                </linearGradient>
              );
            })}
          </defs>
          {others.map((loc) => {
            const id = loc.id ?? loc.label;
            const d = route(home, loc);
            const delay = `${-((hash(id) % 5000) / 1000)}s`;
            return (
              <g key={id}>
                {/* A grey route, fading out towards the city. */}
                <path className="route" d={d} stroke={`url(#route-${id})`} vectorEffect="non-scaling-stroke" />
                {/* A green comet running along it. */}
                {LAYERS.map((len) => (
                  <path
                    key={len}
                    className="pulse"
                    d={d}
                    pathLength={1}
                    style={{ strokeDasharray: `0 ${TAIL - len} ${len} 2`, animationDelay: delay }}
                  />
                ))}
              </g>
            );
          })}
          {[0, 1.2, 2.4].map((delay) => (
            <circle
              key={delay}
              className="ping"
              cx={(home.x / 100) * VIEW.width}
              cy={(home.y / 100) * VIEW.height}
              r={6}
              vectorEffect="non-scaling-stroke"
              style={{ animationDelay: `${delay}s` }}
            />
          ))}
        </Routes>
      )}
      {locations.map((loc) => {
        const id = loc.id ?? loc.label;
        const h = hash(id);
        const delay = (h % 2000) / 1000;
        const duration = 1.1 + (h % 600) / 1000;
        return (
          <MapDot
            key={id}
            x={loc.x}
            y={loc.y}
            title={`${loc.label}${loc.year ? ` (${loc.year})` : ''}`}
            delay={delay}
            duration={duration}
            color={loc === home ? accents.secondary : undefined}
          />
        );
      })}
    </Wrapper>
  );
}
