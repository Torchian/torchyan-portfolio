'use client';

import { forwardRef, useRef, useEffect, useCallback } from 'react';
import styled, { css } from 'styled-components';
import {
  fontWeight,
  fontSize,
  lineHeight,
  letterSpacing,
  fontFamily,
} from '@/styles/tokens/typography';
import { spacing } from '@/styles/tokens/spacing';
import { radius } from '@/styles/tokens/radius';
import { duration, easing } from '@/styles/tokens/motion';
import { neutrals, accents, glass, blur } from '@/styles/tokens/colors';
import { border } from '@/styles/tokens/border';

const TRANSITION = `${duration.fast} ${easing.linear}`;

const primaryInputStyles = css`
  min-width: 140px;
  border: ${border.medium}px solid ${glass.border};
  border-radius: ${radius.xxl}px;
  backdrop-filter: blur(${blur.glassSmall});
  -webkit-backdrop-filter: blur(${blur.glassSmall});
  isolation: isolate;
  overflow: hidden;
  
  font-family: ${fontFamily.body};
  font-size: ${fontSize.body.l}px;
  font-weight: ${fontWeight.medium};
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
    border-left: calc(var(--input-width, 0px) / 4) solid transparent;
    border-right: calc(var(--input-width, 0px) / 4) solid transparent;
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
    border-left: calc(var(--input-width, 0px) / 4) solid transparent;
    border-right: calc(var(--input-width, 0px) / 4) solid transparent;
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
    &:hover {
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

  &:focus-within {
    color: ${accents.primary};

    &::before {
      filter: blur(${blur.md});
      top: -1px;
      border-top: ${spacing[75]}px solid ${accents.primary};
      transform: translateX(-50%) scaleX(1.5);
    }

    &::after {
      filter: blur(${blur.md});
      bottom: -1px;
      border-bottom: ${spacing[75]}px solid ${accents.primary};
      transform: translateX(-50%) scaleX(1.5);
    }
  }
`;

const Wrapper = styled.div<{ $multiline?: boolean }>`
  position: relative;
  display: inline-flex;
  align-items: ${(p) => (p.$multiline ? 'flex-start' : 'center')};
  padding: ${({ $multiline }) => ($multiline ? `${spacing[200]}px ${spacing[400]}px` : `${spacing[75]}px ${spacing[400]}px`)};
  height: ${({ $multiline }) => ($multiline ? 'auto' : `${spacing[600]}px`)};
  width: 100%;
  cursor: text;

  ${primaryInputStyles}
`;

const StyledInput = styled.input`
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  outline: none;
  font: inherit;
  color: inherit;
  letter-spacing: inherit;

  &::placeholder {
    color: ${neutrals[700]};
  }
`;

const StyledTextArea = styled.textarea`
  flex: 1;
  min-width: 0;
  min-height: 72px;
  padding: 0;
  background: transparent;
  border: none;
  outline: none;
  font: inherit;
  color: inherit;
  letter-spacing: inherit;
  resize: vertical;

  &::placeholder {
    color: ${neutrals[700]};
  }
`;

export interface TextInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement> &
      React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    'size'
  > {
  as?: 'input' | 'textarea';
}

export const TextInput = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  TextInputProps
>(function TextInput({ as = 'input', ...props }, ref) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const measure = useCallback(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const width = el.getBoundingClientRect().width;
    el.style.setProperty('--input-width', `${width}px`);
  }, []);

  useEffect(() => {
    measure();
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure]);

  const isTextarea = as === 'textarea';

  return (
    <Wrapper ref={wrapperRef} $multiline={isTextarea}>
      {isTextarea ? (
        <StyledTextArea
          ref={ref as React.Ref<HTMLTextAreaElement>}
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <StyledInput
          ref={ref as React.Ref<HTMLInputElement>}
          {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
    </Wrapper>
  );
});
