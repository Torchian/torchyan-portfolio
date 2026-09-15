import { css } from 'styled-components';
import { blur, glass } from './tokens/effects';
import { border } from './tokens/border';
import { radius } from './tokens/radius';
import { spacing } from './tokens/spacing';

/** The header's glass (Figma dark/glass/action): the link pill, the sound and language controls, the language list. */
export const glassSurface = css`
  background: ${glass.shadow};
  border: ${border.medium}px solid ${glass.border};
  backdrop-filter: blur(${blur.glassMedium});
  -webkit-backdrop-filter: blur(${blur.glassMedium});
`;

/** A 48px glass circle — the sound toggle. */
export const glassCircle = css`
  ${glassSurface}
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: ${spacing[600]}px;
  height: ${spacing[600]}px;
  padding: 0;
  border-radius: ${radius.round}px;
  cursor: pointer;
`;
