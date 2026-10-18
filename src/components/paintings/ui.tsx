'use client';

import styled, { css } from 'styled-components';
import { Link } from '@/i18n/navigation';
import { fonts, gutter, PAGE_MAX, paper } from './theme';

/** The page column. */
export const Container = styled.div`
  width: 100%;
  max-width: ${PAGE_MAX}px;
  margin: 0 auto;
  padding: 0 ${gutter};
`;

export const Eyebrow = styled.p`
  margin: 0;
  color: ${paper.inkFaint};
  font-size: 12px;
  line-height: 16px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
`;

export const SectionTitle = styled.h2`
  margin: 0;
  font-family: ${fonts.serif};
  font-weight: 500;
  font-size: clamp(34px, 4.6vw, 56px);
  line-height: 1.05;
  letter-spacing: -0.005em;
`;

export const Lead = styled.p`
  margin: 0;
  max-width: 60ch;
  color: ${paper.inkSoft};
  font-size: clamp(16px, 1.4vw, 18px);
  line-height: 1.6;
`;

const button = css<{ $variant?: 'solid' | 'outline' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 48px;
  padding: 0 24px;
  border: 1px solid ${paper.ink};
  border-radius: 999px;
  font-family: ${fonts.sans};
  font-size: 15px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition:
    background 160ms ease,
    color 160ms ease,
    border-color 160ms ease;

  ${(p) =>
    p.$variant === 'outline'
      ? css`
          background: transparent;
          color: ${paper.ink};

          &:hover {
            background: ${paper.ink};
            color: ${paper.wall};
          }
        `
      : css`
          background: ${paper.ink};
          color: ${paper.wall};

          &:hover {
            background: ${paper.accent};
            border-color: ${paper.accent};
          }
        `}

  &:focus-visible {
    outline: 2px solid ${paper.accent};
    outline-offset: 3px;
  }

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`;

export const ButtonLink = styled(Link)<{ $variant?: 'solid' | 'outline' }>`
  ${button}
`;

export const Button = styled.button<{ $variant?: 'solid' | 'outline' }>`
  ${button}
`;
