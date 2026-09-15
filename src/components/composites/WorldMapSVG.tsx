'use client';

import styled from 'styled-components';
import { MapDot } from './MapDot';

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
  return (
    <Wrapper>
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
