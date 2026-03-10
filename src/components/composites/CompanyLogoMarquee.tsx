'use client';

import styled, { keyframes } from 'styled-components';
import { spacing } from '@/styles/tokens/spacing';
import { CompanyLogo, type CompanyLogoProps } from '@/components/primitives';

const scrollLeft = keyframes`
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
`;

const scrollRight = keyframes`
  from { transform: translateX(-50%); }
  to { transform: translateX(0); }
`;

const Wrapper = styled.div<{ $rowGap?: number }>`
  display: flex;
  flex-direction: column;
  gap: ${(p) => p.$rowGap ?? spacing[300]}px;
  width: 100%;
  overflow: hidden;
`;

const TrackWrapper = styled.div`
  width: 100%;
  overflow: hidden;
`;

interface TrackProps {
  $speed?: number;
  $reverse?: boolean;
}

const Track = styled.div<TrackProps>`
  display: flex;
  width: max-content;
  animation: ${(p) => (p.$reverse ? scrollRight : scrollLeft)} ${(p) => p.$speed ?? 40}s linear infinite;
`;

const Row = styled.div<{ $gap?: number }>`
  display: flex;
  align-items: center;
  gap: ${(p) => p.$gap ?? spacing[500]}px;
  flex-shrink: 0;
`;

export interface CompanyLogoMarqueeProps {
  logos: CompanyLogoProps[];
  speed?: number;
  rowSpeeds?: number[];
  rows?: number;
  gapMultiplier?: number;
}

export function CompanyLogoMarquee({
  logos,
  speed = 80,
  rowSpeeds,
  rows = 2,
  gapMultiplier = 1,
}: CompanyLogoMarqueeProps) {
  const rowSize = Math.ceil(logos.length / rows);
  const rowGroups = Array.from({ length: rows }, (_, i) =>
    logos.slice(i * rowSize, (i + 1) * rowSize)
  );

  const rowGap = spacing[300] * gapMultiplier;
  const iconGap = spacing[500] * gapMultiplier;

  const getRowSpeed = (rowIndex: number) =>
    rowSpeeds?.[rowIndex] ?? speed * (rowIndex % 2 === 0 ? 1 : 0.85);

  return (
    <Wrapper $rowGap={rowGap}>
      {rowGroups.map((rowLogos, i) =>
        rowLogos.length > 0 ? (
          <TrackWrapper key={i}>
            <Track $speed={getRowSpeed(i)} $reverse={i % 2 === 1}>
              <Row $gap={iconGap}>
                {rowLogos.map((logo) => (
                  <CompanyLogo key={logo.alt} {...logo} />
                ))}
                {rowLogos.map((logo) => (
                  <CompanyLogo key={`dup-${logo.alt}`} {...logo} aria-hidden />
                ))}
              </Row>
            </Track>
          </TrackWrapper>
        ) : null
      )}
    </Wrapper>
  );
}
