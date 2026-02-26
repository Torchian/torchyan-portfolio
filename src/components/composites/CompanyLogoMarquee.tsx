'use client';

import styled, { keyframes } from 'styled-components';
import { spacing } from '@/styles/tokens/spacing';
import { CompanyLogo, type CompanyLogoProps } from '@/components/primitives';

const scroll = keyframes`
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[300]}px;
  overflow: hidden;
  width: 100%;
`;

interface TrackProps {
  $speed?: number;
  $reverse?: boolean;
}

const Track = styled.div<TrackProps>`
  display: flex;
  width: max-content;
  animation: ${scroll} ${(p) => p.$speed ?? 40}s linear infinite;
  animation-direction: ${(p) => (p.$reverse ? 'reverse' : 'normal')};
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing[500]}px;
  padding-right: ${spacing[500]}px;
`;

export interface CompanyLogoMarqueeProps {
  logos: CompanyLogoProps[];
  speed?: number;
}

export function CompanyLogoMarquee({ logos, speed = 40 }: CompanyLogoMarqueeProps) {
  const midpoint = Math.ceil(logos.length / 2);
  const row1 = logos.slice(0, midpoint);
  const row2 = logos.slice(midpoint);

  return (
    <Wrapper>
      <Track $speed={speed}>
        <Row>
          {row1.map((logo) => (
            <CompanyLogo key={logo.alt} {...logo} />
          ))}
        </Row>
        <Row aria-hidden>
          {row1.map((logo) => (
            <CompanyLogo key={`dup-${logo.alt}`} {...logo} />
          ))}
        </Row>
      </Track>
      {row2.length > 0 && (
        <Track $speed={speed * 0.85} $reverse>
          <Row>
            {row2.map((logo) => (
              <CompanyLogo key={logo.alt} {...logo} />
            ))}
          </Row>
          <Row aria-hidden>
            {row2.map((logo) => (
              <CompanyLogo key={`dup-${logo.alt}`} {...logo} />
            ))}
          </Row>
        </Track>
      )}
    </Wrapper>
  );
}
