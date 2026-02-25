'use client';

import styled, { css } from 'styled-components';
import { fontSize, lineHeight, fontWeight, letterSpacing } from '@/styles/tokens/typography';

type TextScale = keyof typeof fontSize;
type TextWeight = keyof typeof fontWeight;
type LetterSpacingKey = keyof typeof letterSpacing;

export interface TextProps {
  $scale?: TextScale;
  $size?: string;
  $weight?: TextWeight;
  $tracking?: LetterSpacingKey;
  $color?: string;
  $align?: 'left' | 'center' | 'right';
  $truncate?: boolean;
}

function resolveFont(scale: TextScale, size: string) {
  const sizeMap = fontSize[scale] as Record<string, number>;
  const lhMap = lineHeight[scale] as Record<string, number>;
  return {
    fontSize: sizeMap[size] ?? fontSize.body.l,
    lineHeight: lhMap[size] ?? lineHeight.body.l,
  };
}

export const Text = styled.p<TextProps>`
  ${(p) => {
    const s = p.$scale ?? 'body';
    const sz = p.$size ?? (s === 'display' ? 'l' : s === 'heading' ? 'm' : 'l');
    const resolved = resolveFont(s, sz);
    return css`
      font-size: ${resolved.fontSize}px;
      line-height: ${resolved.lineHeight}px;
    `;
  }}
  font-weight: ${(p) => fontWeight[p.$weight ?? 'regular']};
  letter-spacing: ${(p) => p.$tracking != null ? `${letterSpacing[p.$tracking]}px` : 'normal'};
  color: ${(p) => p.$color ?? 'var(--color-text-primary)'};
  text-align: ${(p) => p.$align ?? 'left'};

  ${(p) =>
    p.$truncate &&
    css`
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    `}
`;

export const Display = styled(Text).attrs<TextProps>((p) => ({
  as: p.as ?? 'h1',
  $scale: 'display' as TextScale,
  $weight: p.$weight ?? 'black',
}))``;

export const Heading = styled(Text).attrs<TextProps>((p) => ({
  as: p.as ?? 'h2',
  $scale: 'heading' as TextScale,
  $weight: p.$weight ?? 'heading',
}))``;
