import { css, keyframes } from 'styled-components';
import { fontWeight, fontSize, lineHeight, letterSpacing, fontFamily } from '@/styles/tokens/typography';
import { spacing } from '@/styles/tokens/spacing';
import { radius } from '@/styles/tokens/radius';
import { duration, easing } from '@/styles/tokens/motion';
import { neutrals, accents, glass, blur } from '@/styles/tokens/colors';
import { border } from '@/styles/tokens/border';

export const TRANSITION = `${duration.fast} ${easing.linear}`;

const glowTriangleBefore = (color: string) => css`
  &::before {
    content: '';
    position: absolute;
    left: 50%;
    top: -3px;
    width: 0;
    height: 0;
    border-left: calc(var(--btn-width, 0px) / 4) solid transparent;
    border-right: calc(var(--btn-width, 0px) / 4) solid transparent;
    border-top: ${spacing[50]}px solid ${color};
    filter: blur(${blur.sm});
    transform: translateX(-50%);
    pointer-events: none;
    transition: transform ${TRANSITION}, top ${TRANSITION},
      filter ${TRANSITION}, border ${TRANSITION};
  }
`;

const glowTriangleAfter = (color: string) => css`
  &::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: -3px;
    width: 0;
    height: 0;
    border-left: calc(var(--btn-width, 0px) / 4) solid transparent;
    border-right: calc(var(--btn-width, 0px) / 4) solid transparent;
    border-bottom: ${spacing[50]}px solid ${color};
    transform: translateX(-50%);
    filter: blur(${blur.sm});
    pointer-events: none;
    transition: transform ${TRANSITION}, bottom ${TRANSITION},
      filter ${TRANSITION}, border ${TRANSITION};
  }
`;

const glowHover = (accentColor: string) => css`
  @media (hover: hover) and (pointer: fine) {
    &:hover:not(:disabled) {
      color: ${accentColor};

      &::before {
        filter: blur(${blur.md});
        top: -2px;
        border-top: ${spacing[75]}px solid ${accentColor};
        transform: translateX(-50%) scaleX(1.5);
      }

      &::after {
        filter: blur(${blur.md});
        bottom: -2px;
        border-bottom: ${spacing[75]}px solid ${accentColor};
        transform: translateX(-50%) scaleX(1.5);
      }
    }
  }

  &:focus,
  &:active {
    &::before {
      filter: blur(${blur.sm});
      top: -1px;
      border-top: ${spacing[100]}px solid ${accentColor};
    }

    &::after {
      filter: blur(${blur.sm});
      bottom: -1px;
      border-bottom: ${spacing[100]}px solid ${accentColor};
    }
  }
`;

const glowVariant = (accentColor: string, hasBg = false) => css`
  padding: ${spacing[150]}px ${spacing[400]}px;
  min-width: 140px;
  height: ${spacing[600]}px;
  ${hasBg ? `background: ${glass.bg};` : ''}
  border: ${border.medium}px solid ${glass.border};
  border-radius: ${radius.round}px;
  ${hasBg ? '' : `backdrop-filter: blur(${blur.glassSmall}); -webkit-backdrop-filter: blur(${blur.glassSmall});`}
  isolation: isolate;
  overflow: hidden;

  font-size: ${fontSize.body.l}px;
  line-height: ${lineHeight.body.l}px;
  letter-spacing: ${letterSpacing.m}px;
  color: ${neutrals[100]};
  transition: color ${TRANSITION};

  ${glowTriangleBefore(neutrals[100])}
  ${glowTriangleAfter(neutrals[100])}
  ${glowHover(accentColor)}
`;

export const primaryStyles = css`
  ${glowVariant(accents.primary)}
`;

export const tertiaryStyles = css`
  ${glowVariant(accents.secondary, true)}
`;

const pillVariant = (bg: string, bgHover: string, accentColor: string) => css`
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
  background: ${bg};
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
      background: ${bgHover};

      &::before {
        inset: -12px;
      }
    }
  }

  &:focus-visible {
    outline: ${border.thick}px solid ${accentColor};
    outline-offset: 2px;
  }
`;

export const secondaryStyles = css`
  ${pillVariant(accents.primary, accents.primaryDark, accents.primary)}
`;

export const secondaryPinkStyles = css`
  ${pillVariant(accents.secondary, accents.secondaryDark, accents.secondary)}
`;

export const spinKeyframes = keyframes`
  to { transform: rotate(360deg); }
`;
