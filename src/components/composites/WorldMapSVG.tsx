'use client';

import { useLayoutEffect, useRef } from 'react';
import styled from 'styled-components';
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
}

export interface WorldMapSVGProps {
  locations: MapLocation[];
  alt: string;
}

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function WorldMapSVG({ locations, alt }: WorldMapSVGProps) {
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

  return (
    <Wrapper
      ref={(node) => {
        wrapperRef.current = node;
        pauseRef.current = node;
      }}
    >
      <MapImage src="/vectors/map.svg" alt={alt} />
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
          />
        );
      })}
    </Wrapper>
  );
}
