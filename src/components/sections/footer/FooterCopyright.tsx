'use client';

import styled from 'styled-components';
import { spacing } from '@/styles/tokens/spacing';
import { neutrals } from '@/styles/tokens/colors';
import { fontSize, lineHeight, fontWeight, letterSpacing, fontFamily } from '@/styles/tokens/typography';
import { media } from '@/styles/media';

const CopyrightRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0;
  gap: ${spacing[600]}px;
  width: 100%;
  max-width: 800px;
  position: relative;
  z-index: 1;

  ${media.down('m')} {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: ${spacing[200]}px;
  }
`;

const CopyrightText = styled.span`
  font-family: ${fontFamily.display};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.body.l}px;
  line-height: ${lineHeight.body.l}px;
  letter-spacing: ${letterSpacing.xs}px;
  color: ${neutrals[700]};
`;

export function FooterCopyright() {
  return (
    <CopyrightRow>
      <CopyrightText>© Copyright {new Date().getFullYear()} Torchyan</CopyrightText>
      <CopyrightText>All Rights Reserved</CopyrightText>
    </CopyrightRow>
  );
}
