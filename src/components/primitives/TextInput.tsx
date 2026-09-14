'use client';

/* eslint-disable @next/next/no-img-element -- tiny decorative SVGs; next/image adds nothing here */
import { forwardRef } from 'react';
import styled, { css } from 'styled-components';
import { fontWeight, fontSize, lineHeight, letterSpacing, fontFamily } from '@/styles/tokens/typography';
import { spacing } from '@/styles/tokens/spacing';
import { radius } from '@/styles/tokens/radius';
import { duration, easing } from '@/styles/tokens/motion';
import { neutrals, accents } from '@/styles/tokens/colors';
import { glass } from '@/styles/tokens/effects';
import { border } from '@/styles/tokens/border';
import { media } from '@/styles/media';

/*
 * Figma: Text Input (2484:6150) — Default / Hover / Active; multiline variant
 * from the Contact section ("What are you building?").
 *
 * A 56px pill (multiline: 120px tall, 32px radius) with a thin blurred wedge of
 * light along its top and bottom edges. The wedges sit outside the field and
 * the field clips them, so only their soft inner edge shows. They move in as
 * the state changes — 14px out (Default) → 5px (Hover) → 2px (Active, focused)
 * — and turn green when focused. The text follows: grey → white → green.
 */

const EFFECT_OFFSET = { default: 14, hover: 5, active: 2 } as const;
const TRANSITION = `${duration.fast} ${easing.linear}`;
/** The multiline placeholder is a touch lighter than the single-line one in the design. */
const MULTILINE_PLACEHOLDER = '#c5c5c5';

const Wrapper = styled.div<{ $multiline: boolean }>`
  --effect-offset: ${EFFECT_OFFSET.default}px;
  --placeholder-color: ${(p) => (p.$multiline ? MULTILINE_PLACEHOLDER : neutrals[700])};
  --value-color: ${neutrals[100]};
  position: relative;
  display: flex;
  align-items: ${(p) => (p.$multiline ? 'flex-start' : 'center')};
  width: 100%;
  height: ${(p) => (p.$multiline ? 120 : 56)}px;
  padding: ${(p) =>
    p.$multiline ? `${spacing[200]}px ${spacing[400]}px` : `${spacing[75]}px ${spacing[400]}px`};
  border: ${border.medium}px solid ${glass.border};
  border-radius: ${(p) => (p.$multiline ? radius.xxl : radius.round)}px;
  overflow: hidden;
  cursor: text;

  ${media.hover} {
    &:hover:not(:focus-within) {
      --effect-offset: ${EFFECT_OFFSET.hover}px;
      --placeholder-color: ${neutrals[100]};
    }
  }

  &:focus-within {
    --effect-offset: ${EFFECT_OFFSET.active}px;
    --placeholder-color: ${accents.primary};
    --value-color: ${accents.primary};
  }
`;

const Effect = styled.span`
  position: absolute;
  left: 0;
  right: 0;
  top: calc(-1 * var(--effect-offset));
  bottom: calc(-1 * var(--effect-offset));
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  pointer-events: none;
  transition:
    top ${TRANSITION},
    bottom ${TRANSITION};
`;

/** One 6px line; its wedge artwork is 22px tall and a little wider than the field, bleeding past it. */
const Line = styled.span<{ $flip?: boolean; $multiline: boolean }>`
  position: relative;
  height: 6px;
  ${(p) => p.$flip && 'transform: scaleY(-1);'}

  img {
    position: absolute;
    top: -8px;
    left: ${(p) => (p.$multiline ? -0.97 : -1.71)}%;
    width: ${(p) => (p.$multiline ? 101.94 : 103.42)}%;
    max-width: none;
    height: 22px;
    transition: opacity ${TRANSITION};
  }

  img:last-child {
    opacity: 0;
  }

  ${Wrapper}:focus-within & {
    img:first-child {
      opacity: 0;
    }

    img:last-child {
      opacity: 1;
    }
  }
`;

const fieldStyles = css`
  position: relative;
  flex: 1;
  min-width: 0;
  margin: 0;
  padding: 0;
  background: transparent;
  border: none;
  outline: none;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.body.xl}px;
  line-height: ${lineHeight.body.xl}px;
  letter-spacing: ${letterSpacing.s}px;
  color: var(--value-color);
  transition: color ${TRANSITION};

  &::placeholder {
    color: var(--placeholder-color);
    opacity: 1;
    transition: color ${TRANSITION};
  }
`;

const StyledInput = styled.input`
  ${fieldStyles}
`;

const StyledTextArea = styled.textarea`
  ${fieldStyles}
  height: 100%;
  overflow-y: auto;
  resize: none;
`;

export interface TextInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement> & React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    'size'
  > {
  as?: 'input' | 'textarea';
}

export const TextInput = forwardRef<HTMLInputElement | HTMLTextAreaElement, TextInputProps>(
  function TextInput({ as = 'input', className, ...props }, ref) {
    const multiline = as === 'textarea';
    const lightWedge = multiline ? '/icons/text-input/effect-default-wide.svg' : '/icons/text-input/effect-default.svg';

    return (
      <Wrapper $multiline={multiline} className={className}>
        <Effect aria-hidden>
          {[true, false].map((flip) => (
            <Line key={String(flip)} $flip={flip} $multiline={multiline}>
              <img src={lightWedge} alt="" />
              <img src="/icons/text-input/effect-active.svg" alt="" />
            </Line>
          ))}
        </Effect>
        {multiline ? (
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
  },
);
