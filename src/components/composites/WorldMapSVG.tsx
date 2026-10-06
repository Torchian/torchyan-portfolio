'use client';

import { useLayoutEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { accents } from '@/styles/tokens/colors';
import { media } from '@/styles/media';
import { MapDot } from './MapDot';
import { OrbitAnchor, OrbitScene } from './OrbitScene';
import { usePauseOffscreen } from '@/hooks';

/** The map width the dots were drawn against; the scale is this one over the real one. */
const DESIGN_MAP_WIDTH = 1200;

const Wrapper = styled.div`
  position: relative;
  /* Home's orbit scene sits behind the map. */
  isolation: isolate;
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
}

export interface WorldMapSVGProps {
  locations: MapLocation[];
  alt: string;
  /**
   * The home point, by id: drawn in the secondary pink, with a route out to
   * every other point in the orbit scene's hairline style (OrbitScene).
   */
  hub?: string;
}

/** The map's own frame, so routes drawn on it keep their shape at any width. */
const VIEW = { width: 1550, height: 779 } as const;

const travel = keyframes`
  from {
    stroke-dashoffset: 0;
  }
  to {
    stroke-dashoffset: -1;
  }
`;

const Routes = styled.svg`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;

  .route {
    fill: none;
    stroke-width: 1;
  }

  /* A short green dash running out along each route from home, over and over. */
  .pulse {
    fill: none;
    stroke: ${accents.primary};
    stroke-width: 2;
    stroke-linecap: round;
    stroke-dasharray: 0.04 0.96;
    animation: ${travel} 4s linear infinite;
  }

  ${media.reducedMotion} {
    .pulse {
      display: none;
    }
  }
`;

/**
 * A route from home to a point: a shallow arc, bowed away from the equator
 * like a flight path, so the lines fan out rather than lie on top of one
 * another.
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
  const bow = Math.min(length * 0.22, 160);
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
      {home && (
        <OrbitAnchor style={{ left: `${home.x}%`, top: `${home.y}%`, width: '24%' }}>
          <OrbitScene glow={false} />
        </OrbitAnchor>
      )}
      <MapImage src="/vectors/map.svg" alt={alt} />
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
                  <stop offset="0" stopColor={accents.secondary} stopOpacity="0.55" />
                  <stop offset="1" stopColor="#f6f6f6" stopOpacity="0.18" />
                </linearGradient>
              );
            })}
          </defs>
          {others.map((loc) => {
            const id = loc.id ?? loc.label;
            const d = route(home, loc);
            return (
              <g key={id}>
                <path className="route" d={d} stroke={`url(#route-${id})`} vectorEffect="non-scaling-stroke" />
                <path
                  className="pulse"
                  d={d}
                  pathLength={1}
                  style={{ animationDelay: `${-((hash(id) % 4000) / 1000)}s` }}
                />
              </g>
            );
          })}
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
