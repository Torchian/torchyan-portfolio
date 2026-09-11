'use client';

/* eslint-disable @next/next/no-img-element */
import styled from 'styled-components';
import { fontFamily, fontWeight, fontSize, lineHeight, letterSpacing } from '@/styles/tokens/typography';
import { spacing } from '@/styles/tokens/spacing';
import { radius } from '@/styles/tokens/radius';
import { neutrals, accents } from '@/styles/tokens/colors';
import { duration, easing } from '@/styles/tokens/motion';

const TRANSITION = `opacity ${duration.fast} ${easing.linear}, color ${duration.fast} ${easing.linear}`;

// Figma: Radio Input atom (2484:5947) — Default / Hover / Active states.
// Hover and Active share the same background glow and a green dot, but
// differ in dot tightness and text color; Default is a muted gray glow.
// Built with :has() so hover/checked are pure CSS — no JS state needed.
const Wrapper = styled.label`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: ${spacing[200]}px;
  height: ${spacing[600]}px;
  min-width: 140px;
  padding: ${spacing[75]}px ${spacing[250]}px;
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
`;

const Effect = styled.img<{ $active?: boolean }>`
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  height: ${(p) => (p.$active ? '56px' : '78px')};
  object-fit: contain;
  pointer-events: none;
  opacity: ${(p) => (p.$active ? 0 : 1)};
  transition: ${TRANSITION};

  ${Wrapper}:hover &,
  ${Wrapper}:has(input:checked) & {
    opacity: ${(p) => (p.$active ? 1 : 0)};
  }
`;

const DotSlot = styled.span`
  position: relative;
  flex-shrink: 0;
  width: 14px;
  height: 14px;
`;

const Dot = styled.img<{ $show: 'default' | 'hover' | 'active' }>`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: ${(p) => (p.$show === 'default' ? 1 : 0)};
  transition: ${TRANSITION};

  ${Wrapper}:hover:not(:has(input:checked)) & {
    opacity: ${(p) => (p.$show === 'hover' ? 1 : 0)};
  }

  ${Wrapper}:has(input:checked) & {
    opacity: ${(p) => (p.$show === 'active' ? 1 : 0)};
  }
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

  ${Wrapper}:hover:not(:has(input:checked)) & {
    color: ${neutrals[100]};
  }

  ${Wrapper}:has(input:checked) & {
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
      <Effect src="/icons/radio-input/effect-default.svg" alt="" $active={false} />
      <Effect src="/icons/radio-input/effect-active.svg" alt="" $active />
      <DotSlot>
        <Dot src="/icons/radio-input/dot-default.svg" alt="" $show="default" />
        <Dot src="/icons/radio-input/dot-hover.svg" alt="" $show="hover" />
        <Dot src="/icons/radio-input/dot-active.svg" alt="" $show="active" />
      </DotSlot>
      <Label>{label}</Label>
    </Wrapper>
  );
}
