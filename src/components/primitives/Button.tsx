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

type ButtonVariant = 'primary' | 'secondary' | 'secondaryPink' | 'tertiary';

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
  height: ${spacing[600]}px;
  border: ${border.medium}px solid ${glass.border};
  border-radius: ${radius.round}px;
  backdrop-filter: blur(${blur.glassSmall});
  -webkit-backdrop-filter: blur(${blur.glassSmall});
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

/* Tertiary: same as primary but pink (secondary) accent */
const tertiaryStyles = css`
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
      color: ${accents.secondary};

      &::before {
        filter: blur(${blur.md});
        top: -2px;
        border-top: ${spacing[75]}px solid ${accents.secondary};
        transform: translateX(-50%) scaleX(1.5);
      }

      &::after {
        filter: blur(${blur.md});
        bottom: -2px;
        border-bottom: ${spacing[75]}px solid ${accents.secondary};
        transform: translateX(-50%) scaleX(1.5);
      }
    }
  }

  &:focus, &:active {
    &::before {
      filter: blur(${blur.sm});
      top: -1px;
      border-top: ${spacing[100]}px solid ${accents.secondary};
    }

    &::after {
      filter: blur(${blur.sm});
      bottom: -1px;
      border-bottom: ${spacing[100]}px solid ${accents.secondary};
    }
  }
`;

/* State=Secondary / cta_body + cta_text (typography/title/large) */
const secondaryStyles = css`
  position: relative;
  isolation: isolate;
  overflow: visible;
  display: inline-flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: ${spacing[150]}px ${spacing[500]}px;
  gap: ${spacing[100]}px;
  min-width: 140px;
  width: fit-content;
  max-width: 100%;
  box-sizing: border-box;
  height: ${spacing[600]}px;
  background: ${accents.primary};
  border: none;
  border-radius: ${radius.round}px;
  flex: none;
  flex-grow: 0;

  font-family: ${fontFamily.body};
  font-style: normal;
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.body.xl}px;
  line-height: ${lineHeight.body.xl}px;
  letter-spacing: ${letterSpacing.s}px;
  color: ${neutrals[100]};
  text-align: center;
  transition: opacity ${TRANSITION}, background ${TRANSITION};

  &::before {
    content: '';
    position: absolute;
    inset: -8px;
    background: ${glass.bg};
    border: ${border.medium}px solid ${glass.border};
    border-radius: ${radius.round}px;
    z-index: -1;
    transition: inset ${duration.normal} ${easing.out};
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover:not(:disabled) {
      background: ${accents.primaryDark};

      &::before {
        inset: -12px;
      }
    }
  }

  &:focus-visible {
    outline: ${border.thick}px solid ${accents.primary};
    outline-offset: 2px;
  }
`;

const secondaryPinkStyles = css`
  position: relative;
  isolation: isolate;
  overflow: visible;
  display: inline-flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: ${spacing[150]}px ${spacing[500]}px;
  gap: ${spacing[100]}px;
  min-width: 140px;
  width: fit-content;
  max-width: 100%;
  box-sizing: border-box;
  height: ${spacing[600]}px;
  background: ${accents.secondary};
  border: none;
  border-radius: ${radius.round}px;
  flex: none;
  flex-grow: 0;

  font-family: ${fontFamily.body};
  font-style: normal;
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.body.xl}px;
  line-height: ${lineHeight.body.xl}px;
  letter-spacing: ${letterSpacing.s}px;
  color: ${neutrals[100]};
  text-align: center;
  transition: opacity ${TRANSITION}, background ${TRANSITION};

  &::before {
    content: '';
    position: absolute;
    inset: -8px;
    background: ${glass.bg};
    border: ${border.medium}px solid ${glass.border};
    border-radius: ${radius.round}px;
    z-index: -1;
    transition: inset ${duration.normal} ${easing.out};
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover:not(:disabled) {
      background: ${accents.secondaryDark};

      &::before {
        inset: -12px;
      }
    }
  }

  &:focus-visible {
    outline: ${border.thick}px solid ${accents.secondary};
    outline-offset: 2px;
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

  ${(p) =>
    p.$variant === 'secondary'
      ? secondaryStyles
      : p.$variant === 'secondaryPink'
        ? secondaryPinkStyles
        : p.$variant === 'tertiary'
          ? tertiaryStyles
          : primaryStyles}

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
