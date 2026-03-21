'use client';

import {
  forwardRef,
  useRef,
  useEffect,
  useCallback,
  type ElementType,
} from 'react';
import styled from 'styled-components';
import { fontFamily } from '@/styles/tokens/typography';
import { spacing } from '@/styles/tokens/spacing';
import { duration, easing } from '@/styles/tokens/motion';
import { neutrals } from '@/styles/tokens/colors';
import { fontWeight } from '@/styles/tokens/typography';
import {
  primaryStyles,
  secondaryStyles,
  secondaryPinkStyles,
  tertiaryStyles,
  spinKeyframes,
} from './Button.styles';

type ButtonVariant = 'primary' | 'secondary' | 'secondaryPink' | 'tertiary';

export interface ButtonProps extends React.HTMLAttributes<HTMLElement> {
  $variant?: ButtonVariant;
  $loading?: boolean;
  as?: ElementType;
  href?: string;
  disabled?: boolean;
  type?: string;
  target?: string;
  rel?: string;
}

const StyledButton = styled.button<{ $variant?: ButtonVariant; $loading?: boolean }>`
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
  text-decoration: none;

  ${(p) =>
    p.$variant === 'secondary'
      ? secondaryStyles
      : p.$variant === 'secondaryPink'
        ? secondaryPinkStyles
        : p.$variant === 'tertiary'
          ? tertiaryStyles
          : primaryStyles}

  transition: transform ${duration.fast} ${easing.out};

  &:active:not(:disabled) {
    transform: scale(0.97);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ${(p) =>
    p.$loading &&
    `
    pointer-events: none;
    color: transparent !important;
  `}
`;

const Spinner = styled.span`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  &::after {
    content: '';
    width: 18px;
    height: 18px;
    border: 2px solid ${neutrals[100]};
    border-top-color: transparent;
    border-radius: 50%;
    animation: ${spinKeyframes} 600ms linear infinite;
  }
`;

const NEEDS_WIDTH_VAR: Set<ButtonVariant | undefined> = new Set([
  'primary',
  'tertiary',
  undefined,
]);

export const Button = forwardRef<HTMLElement, ButtonProps>(
  function Button({ children, $loading, ...props }, externalRef) {
    const internalRef = useRef<HTMLElement>(null);
    const needsObserver = NEEDS_WIDTH_VAR.has(props.$variant);

    const measure = useCallback(() => {
      const el = internalRef.current;
      if (!el) return;
      const width = el.getBoundingClientRect().width;
      el.style.setProperty('--btn-width', `${width}px`);
    }, []);

    useEffect(() => {
      if (!needsObserver) return;
      measure();
      const el = internalRef.current;
      if (!el) return;
      const observer = new ResizeObserver(measure);
      observer.observe(el);
      return () => observer.disconnect();
    }, [measure, needsObserver]);

    const setRef = useCallback(
      (node: HTMLElement | null) => {
        (internalRef as React.MutableRefObject<HTMLElement | null>).current = node;
        if (typeof externalRef === 'function') externalRef(node);
        else if (externalRef)
          (externalRef as React.MutableRefObject<HTMLElement | null>).current = node;
      },
      [externalRef],
    );

    return (
      <StyledButton
        ref={setRef as React.Ref<HTMLButtonElement>}
        $loading={$loading}
        disabled={$loading || props.disabled}
        {...props}
      >
        {children}
        {$loading && <Spinner aria-hidden />}
      </StyledButton>
    );
  },
);
