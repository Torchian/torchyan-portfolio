'use client';

import styled from 'styled-components';
import { GreenDot } from '@/components/primitives';
import { neutrals } from '@/styles/tokens/colors';

const Wrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 2 / 1;
`;

const MapSVG = styled.svg`
  width: 100%;
  height: 100%;
  opacity: 0.15;
`;

interface DotPosition {
  x: number;
  y: number;
}

const DotMarker = styled.div<DotPosition>`
  position: absolute;
  left: ${(p) => p.x}%;
  top: ${(p) => p.y}%;
  transform: translate(-50%, -50%);
`;

export interface MapLocation {
  label: string;
  year?: number | string;
  x: number;
  y: number;
}

export interface WorldMapSVGProps {
  locations: MapLocation[];
}

export function WorldMapSVG({ locations }: WorldMapSVGProps) {
  return (
    <Wrapper>
      <MapSVG viewBox="0 0 1000 500" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Simplified world map path */}
        <path
          d="M150,120 C180,80 250,70 300,90 C350,110 380,80 420,100 C460,120 500,90 540,110 C580,130 620,100 660,120 C700,140 740,110 780,130 C820,100 860,120 880,110 L880,200 C860,220 820,200 780,220 C740,200 700,230 660,210 C620,230 580,200 540,220 C500,240 460,210 420,230 C380,210 350,240 300,220 C250,240 180,220 150,200 Z"
          fill={neutrals[800]}
        />
        <path
          d="M200,220 C240,210 280,230 320,220 C360,240 400,220 440,240 C480,220 520,250 560,230 C600,250 640,220 680,240 L680,320 C640,340 600,320 560,340 C520,320 480,350 440,330 C400,350 360,320 320,340 C280,320 240,340 200,320 Z"
          fill={neutrals[800]}
        />
        <path
          d="M50,180 C70,160 110,170 130,190 C150,170 130,210 110,230 C90,250 60,230 50,210 Z"
          fill={neutrals[800]}
        />
        <path
          d="M700,280 C740,260 780,270 820,290 C860,270 880,300 870,330 C850,360 810,350 770,340 C730,350 700,320 700,300 Z"
          fill={neutrals[800]}
        />
        <path
          d="M820,330 C840,320 870,330 890,350 C910,370 900,400 880,420 C860,440 830,430 810,410 C790,390 800,360 820,340 Z"
          fill={neutrals[800]}
        />
      </MapSVG>

      {locations.map((loc) => (
        <DotMarker key={loc.label} x={loc.x} y={loc.y} title={`${loc.label}${loc.year ? ` (${loc.year})` : ''}`}>
          <GreenDot $size="md" $pulse />
        </DotMarker>
      ))}
    </Wrapper>
  );
}
