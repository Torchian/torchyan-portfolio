'use client';

import styled from 'styled-components';
import { zIndex } from '@/styles/tokens/z-index';

const Wrapper = styled.div`
  position: fixed;
  inset: 0;
  z-index: ${zIndex.behind};
  pointer-events: none;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url('/vectors/background.svg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }
`;

export function PageBackground() {
  return <Wrapper aria-hidden />;
}
