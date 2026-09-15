'use client';

import styled, { css } from 'styled-components';
import { fontFamily, fontWeight, fontSize, lineHeight, letterSpacing } from '@/styles/tokens/typography';
import { spacing } from '@/styles/tokens/spacing';
import { radius } from '@/styles/tokens/radius';
import { neutrals, accents } from '@/styles/tokens/colors';
import { duration, easing } from '@/styles/tokens/motion';
import { glass } from '@/styles/tokens/effects';
import { border } from '@/styles/tokens/border';

/*
 * Figma: Radio Input atom (2484:5947) — Default / Hover / Active.
 *
 * Each state has its own artwork: glow lines above and below the pill, and a
 * blurred dot. Both are drawn larger than their slot so the blur can bleed
 * past it, then clipped by the pill:
 *  - glow lines: the pill's width + 4.76% each side; 94 / 72 / 68px tall
 *    (the lines sit closer to the pill as it goes Default → Hover → Active);
 *  - dot: a 14px slot holding 38 / 30 / 22px artwork (it sharpens as it goes Default → Hover → Active).
 * Hover and checked are pure CSS (:hover, :has()) — no JS state.
 */

type VisualState = 'default' | 'hover' | 'active';

const EFFECT_HEIGHT: Record<VisualState, number> = { default: 94, hover: 72, active: 68 };
const DOT_SIZE: Record<VisualState, number> = { default: 38, hover: 30, active: 22 };
const STATES: VisualState[] = ['default', 'hover', 'active'];

const TRANSITION = `opacity ${duration.fast} ${easing.linear}, color ${duration.fast} ${easing.linear}`;

const Wrapper = styled.label`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: ${spacing[200]}px;
  height: ${spacing[600]}px;
  min-width: 140px;
  padding: ${spacing[75]}px ${spacing[250]}px;
  border: ${border.medium}px solid ${glass.border};
  border-radius: ${radius.round}px;
  overflow: hidden;
  cursor: pointer;

  input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
    margin: 0;
  }

  &:has(input:focus-visible) {
    outline: 2px solid ${accents.primary};
    outline-offset: 2px;
  }
`;

/** Hovered or keyboard-focused, and not already selected. */
const HOVER = css`
  ${Wrapper}:is(:hover, :has(input:focus-visible)):not(:has(input:checked))
`;
const ACTIVE = css`
  ${Wrapper}:has(input:checked)
`;

/** Shows the layer that belongs to the current state and hides the others. */
const stateLayer = css<{ $state: VisualState }>`
  pointer-events: none;
  opacity: ${(p) => (p.$state === 'default' ? 1 : 0)};
  transition: ${TRANSITION};

  ${HOVER} & {
    opacity: ${(p) => (p.$state === 'hover' ? 1 : 0)};
  }

  ${ACTIVE} & {
    opacity: ${(p) => (p.$state === 'active' ? 1 : 0)};
  }
`;

const Effect = styled.img<{ $state: VisualState }>`
  ${stateLayer}
  position: absolute;
  top: 50%;
  left: -4.76%;
  width: 109.52%;
  max-width: none;
  height: ${(p) => EFFECT_HEIGHT[p.$state]}px;
  transform: translateY(-50%);
`;

const DotSlot = styled.span`
  position: relative;
  flex-shrink: 0;
  width: 14px;
  height: 14px;
`;

const Dot = styled.img<{ $state: VisualState }>`
  ${stateLayer}
  position: absolute;
  top: 50%;
  left: 50%;
  width: ${(p) => DOT_SIZE[p.$state]}px;
  max-width: none;
  height: ${(p) => DOT_SIZE[p.$state]}px;
  transform: translate(-50%, -50%);
`;

const Label = styled.span`
  position: relative;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.body.l}px;
  line-height: ${lineHeight.body.l}px;
  letter-spacing: ${letterSpacing.m}px;
  color: ${neutrals[700]};
  white-space: nowrap;
  transition: ${TRANSITION};

  ${HOVER} & {
    color: ${accents.primaryDark};
  }

  ${ACTIVE} & {
    color: ${accents.primary};
  }
`;

export interface RadioInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label: string;
}

export function RadioInput({ label, className, ...inputProps }: RadioInputProps) {
  return (
    <Wrapper className={className}>
      <input type="radio" {...inputProps} />
      {STATES.map((state) => (
        <Effect key={state} src={`/icons/radio-input/effect-${state}.svg`} alt="" $state={state} />
      ))}
      <DotSlot>
        {STATES.map((state) => (
          <Dot key={state} src={`/icons/radio-input/dot-${state}.svg`} alt="" $state={state} />
        ))}
      </DotSlot>
      <Label>{label}</Label>
    </Wrapper>
  );
}
