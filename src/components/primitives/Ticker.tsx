'use client';

import styled, { keyframes } from 'styled-components';
import { spacing } from '@/styles/tokens/spacing';

const scroll = keyframes`
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
`;

export interface TickerProps {
  $speed?: number;
  $direction?: 'left' | 'right';
}

const Track = styled.div<TickerProps>`
  display: flex;
  width: max-content;
  animation: ${scroll} ${(p) => p.$speed ?? 30}s linear infinite;
  animation-direction: ${(p) => (p.$direction === 'right' ? 'reverse' : 'normal')};
`;

const Wrapper = styled.div`
  overflow: hidden;
  width: 100%;
`;

const ItemGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing[400]}px;
  padding-right: ${spacing[400]}px;
`;

interface TickerComponentProps extends TickerProps {
  children: React.ReactNode;
}

export function Ticker({ children, $speed, $direction }: TickerComponentProps) {
  return (
    <Wrapper>
      <Track $speed={$speed} $direction={$direction}>
        <ItemGroup>{children}</ItemGroup>
        <ItemGroup aria-hidden>{children}</ItemGroup>
      </Track>
    </Wrapper>
  );
}
