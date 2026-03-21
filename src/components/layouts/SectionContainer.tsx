'use client';

import styled from 'styled-components';
import { spacing } from '@/styles/tokens/spacing';
import { grid } from '@/styles/tokens/grid';
import { media } from '@/styles/media';

/**
 * Global section content container (hero_container).
 * Use for all section content to keep consistent max-width, padding, and gap.
 */
export const SectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: ${spacing[1000]}px ${spacing[400]}px ${spacing[400]}px;
  gap: ${spacing[600]}px;
  width: 100%;
  max-width: ${grid.maxWidth}px;

  ${media.down('m')} {
    padding: ${spacing[800]}px ${spacing[300]}px ${spacing[300]}px;
  }
`;
