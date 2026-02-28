'use client';

import styled from 'styled-components';
import { WhatIDoCharacter } from './WhatIDoCharacter';
import { STEP_BACKGROUNDS } from './config';

export interface WhatIDoStickyVisualProps {
  activeStepIndex: number;
  scrollProgress: number;
}

const Wrapper = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 480px;
`;

const BackgroundLayer = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
`;

const BackgroundImage = styled.img<{ $isActive: boolean }>`
  position: absolute;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  opacity: ${(p) => (p.$isActive ? 1 : 0)};
  transition: opacity 0.3s ease;
`;

const CharacterLayer = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export function WhatIDoStickyVisual({ activeStepIndex, scrollProgress }: WhatIDoStickyVisualProps) {
  return (
    <Wrapper>
      <BackgroundLayer>
        {STEP_BACKGROUNDS.map((src, i) => (
          <BackgroundImage
            key={i}
            src={src}
            alt=""
            $isActive={i === activeStepIndex}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ))}
      </BackgroundLayer>
      <CharacterLayer>
        <WhatIDoCharacter activeStepIndex={activeStepIndex} scrollProgress={scrollProgress} />
      </CharacterLayer>
    </Wrapper>
  );
}
