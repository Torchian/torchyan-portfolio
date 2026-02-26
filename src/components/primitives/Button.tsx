'use client';

import {
  forwardRef,
  useRef,
  useEffect,
  useCallback,
  type ElementType,
} from 'react';
import styled, { css } from 'styled-components';
import { fontWeight, fontSize, lineHeight, letterSpacing, fontFamily } from '@/styles/tokens/typography';
import { spacing } from '@/styles/tokens/spacing';
import { radius } from '@/styles/tokens/radius';
import { duration, easing } from '@/styles/tokens/motion';
import { neutrals, accents, glass, blur } from '@/styles/tokens/colors';
import { border } from '@/styles/tokens/border';

type ButtonVariant = 'primary' | 'secondary';

export interface ButtonProps extends React.HTMLAttributes<HTMLElement> {
  $variant?: ButtonVariant;
  as?: ElementType;
  href?: string;
  disabled?: boolean;
  type?: string;
  target?: string;
  rel?: string;
}

const TRANSITION = `${duration.fast} ${easing.linear}`;

const primaryStyles = css`
  padding: ${spacing[150]}px ${spacing[400]}px;
  min-width: 140px;
  background: ${glass.bg};
  border: ${border.medium}px solid ${glass.border};
  border-radius: ${radius.round}px;
  isolation: isolate;
  overflow: hidden;

  font-size: ${fontSize.body.l}px;
  line-height: ${lineHeight.body.l}px;
  letter-spacing: ${letterSpacing.m}px;
  color: ${neutrals[100]};
  transition: color ${TRANSITION};

  &::before {
    content: '';
    position: absolute;
    left: 50%;
    top: -3px;
    width: 0;
    height: 0;
    border-left: calc(var(--btn-width, 0px) / 4) solid transparent;
    border-right: calc(var(--btn-width, 0px) / 4) solid transparent;
    border-top: ${spacing[50]}px solid ${neutrals[100]};
    filter: blur(${blur.sm});
    transform: translateX(-50%);
    pointer-events: none;
    transition:
      transform ${TRANSITION},
      top ${TRANSITION},
      filter ${TRANSITION},
      border ${TRANSITION};
  }

  &::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: -3px;
    width: 0;
    height: 0;
    border-left: calc(var(--btn-width, 0px) / 4) solid transparent;
    border-right: calc(var(--btn-width, 0px) / 4) solid transparent;
    border-bottom: ${spacing[50]}px solid ${neutrals[100]};
    transform: translateX(-50%);
    filter: blur(${blur.sm});
    pointer-events: none;
    transition:
      transform ${TRANSITION},
      bottom ${TRANSITION},
      filter ${TRANSITION},
      border ${TRANSITION};
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover:not(:disabled) {
      color: ${accents.primary};

      &::before {
        filter: blur(${blur.md});
        top: -2px;
        border-top: ${spacing[75]}px solid ${accents.primary};
        transform: translateX(-50%) scaleX(1.5);
      }

      &::after {
        filter: blur(${blur.md});
        bottom: -2px;
        border-bottom: ${spacing[75]}px solid ${accents.primary};
        transform: translateX(-50%) scaleX(1.5);
      }
    }
  }

  &:focus, &:active {
    &::before {
      filter: blur(${blur.sm});
      top: -1px;
      border-top: ${spacing[100]}px solid ${accents.primary};
    }

    &::after {
      filter: blur(${blur.sm});
      bottom: -1px;
      border-bottom: ${spacing[100]}px solid ${accents.primary};
    }
  }
`;

const secondaryStyles = css`
  padding: ${spacing[150]}px ${spacing[400]}px;
  min-width: 140px;
  height: ${spacing[600]}px;
  background: ${accents.primary};
  border: none;
  border-radius: ${radius.round}px;
  isolation: isolate;

  font-size: ${fontSize.body.l}px;
  line-height: ${lineHeight.body.l}px;
  letter-spacing: ${letterSpacing.m}px;
  color: ${neutrals[100]};
  transition: background ${TRANSITION};

  @media (hover: hover) and (pointer: fine) {
    &:hover:not(:disabled) {
      background: ${accents.primaryDark};
    }
  }

  &:focus-visible {
    outline: ${border.thick}px solid ${accents.primary};
    outline-offset: 3px;
  }
`;

const StyledButton = styled.button<{ $variant?: ButtonVariant }>`
  position: relative;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: ${spacing[100]}px;
  border: none;
  font-family: ${fontFamily.body};
  font-weight: ${fontWeight.semibold};
  cursor: pointer;
  white-space: nowrap;
  user-select: none;

  ${(p) => (p.$variant === 'secondary' ? secondaryStyles : primaryStyles)}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const Button = forwardRef<HTMLElement, ButtonProps>(
  function Button({ children, ...props }, externalRef) {
    const internalRef = useRef<HTMLElement>(null);

    const measure = useCallback(() => {
      const el = internalRef.current;
      if (!el) return;
      const width = el.getBoundingClientRect().width;
      el.style.setProperty('--btn-width', `${width}px`);
    }, []);

    useEffect(() => {
      measure();
      const el = internalRef.current;
      if (!el) return;
      const observer = new ResizeObserver(measure);
      observer.observe(el);
      return () => observer.disconnect();
    }, [measure]);

    const setRef = useCallback(
      (node: HTMLElement | null) => {
        (internalRef as React.MutableRefObject<HTMLElement | null>).current = node;
        if (typeof externalRef === 'function') externalRef(node);
        else if (externalRef) (externalRef as React.MutableRefObject<HTMLElement | null>).current = node;
      },
      [externalRef],
    );

    return (
      <StyledButton ref={setRef as React.Ref<HTMLButtonElement>} {...props}>
        {children}
      </StyledButton>
    );
  },
);
