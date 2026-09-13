'use client';

import { useId } from 'react';
import styled, { css } from 'styled-components';
import { spacing } from '@/styles/tokens/spacing';
import { fontSize, lineHeight, fontWeight, letterSpacing, fontFamily } from '@/styles/tokens/typography';
import { neutrals, accents, transparents } from '@/styles/tokens/colors';
import { radius } from '@/styles/tokens/radius';
import { border } from '@/styles/tokens/border';
import { media } from '@/styles/media';
import type { Capability } from './capabilitiesConfig';
import { notchedCardShape, type NotchCorner } from './notchedCardShape';

/** Hover crossfade, measured from the Figma prototype recording. */
export const HOVER_TRANSITION = '200ms cubic-bezier(0.4, 0, 0.2, 1)';

/** Matches a hovered or keyboard-focused card. */
export const ACTIVE_CARD = '[data-capability]:is(:hover, :focus-visible)';

/**
 * A design-size length, scaled with the desktop layout. The section sets
 * `--capabilities-scale` (≤ 1) on desktop so the whole Figma frame fits the
 * screen with its proportions and line breaks intact; tablet and mobile don't
 * set it, so there this is the plain pixel value.
 */
export const scaled = (px: number) => `calc(${px}px * var(--capabilities-scale, 1))`;

/** Figma frame the desktop layout was drawn at — the shape rendered before the section measures itself. */
const DESIGN_CARD = { width: 708, height: 467, gap: 24, notchRadius: 248 } as const;

/**
 * Text that sits beside the cut-out keeps clear of it. `--notch-span` is how far
 * the cut-out reaches into the card (written by the section once it measures
 * itself); 40px is the card padding plus the few pixels Figma lets the fillet
 * overlap the text box.
 */
const BESIDE_NOTCH = `calc(100% + ${scaled(spacing[500])} - var(--notch-span, 256px))`;

/** A 1px edge that's brighter at the top, as on the Figma cards. */
export const gradientEdge = css`
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    padding: ${border.medium}px;
    border-radius: inherit;
    background: linear-gradient(to bottom, ${transparents.transparent25}, ${transparents.transparent4});
    -webkit-mask:
      linear-gradient(#000 0 0) content-box,
      linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask:
      linear-gradient(#000 0 0) content-box exclude,
      linear-gradient(#000 0 0);
    pointer-events: none;
  }
`;

const Card = styled.article<{ $alignEnd: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: ${scaled(spacing[400])};
  border-radius: ${radius.xl}px;
  outline: none;

  ${media.up('l')} {
    align-items: ${(p) => (p.$alignEnd ? 'flex-end' : 'flex-start')};
    text-align: ${(p) => (p.$alignEnd ? 'right' : 'left')};
    /* The painted shape is the hit area, so the cut-out and the ring around the
       circle don't count as hovering the card. Text opts back in below. */
    pointer-events: none;
  }

  ${media.down('l')} {
    background: ${transparents.transparent4};
    ${gradientEdge}
  }

  ${media.down('m')} {
    padding: ${spacing[200]}px ${spacing[250]}px;
  }
`;

const Shape = styled.svg`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;

  path {
    pointer-events: auto;
    fill: ${transparents.transparent4};
    transition: fill ${HOVER_TRANSITION};
  }

  ${ACTIVE_CARD} > & path {
    fill: ${accents.primaryDark};
  }

  ${media.down('l')} {
    display: none;
  }
`;

const Body = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: inherit;
  flex: 1;
  gap: ${scaled(spacing[300])};
  width: 100%;

  ${media.between('m', 'l')} {
    gap: ${spacing[400]}px;
  }
`;

const Title = styled.h3`
  margin: 0;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${scaled(fontSize.heading.l)};
  line-height: ${scaled(lineHeight.heading.l)};
  letter-spacing: ${letterSpacing.xs}px;
  color: ${accents.primary};
  pointer-events: auto;

  ${media.up('l')} {
    transition: color ${HOVER_TRANSITION};

    ${ACTIVE_CARD} & {
      color: ${neutrals[100]};
    }
  }

  ${media.down('m')} {
    font-weight: ${fontWeight.medium};
    font-size: ${fontSize.heading.m}px;
    line-height: ${lineHeight.heading.m}px;
  }
`;

const MainText = styled.div<{ $besideNotch: boolean }>`
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${scaled(fontSize.heading.s)};
  line-height: ${scaled(lineHeight.heading.s)};
  letter-spacing: ${letterSpacing.xs}px;
  color: ${neutrals[100]};
  pointer-events: auto;

  p {
    margin: 0;
  }

  ul {
    margin: 0;
    padding: 0;
    list-style: disc;
  }

  li {
    margin-inline-start: ${scaled(36)};
  }

  ${(p) =>
    p.$besideNotch &&
    css`
      ${media.up('l')} {
        max-width: ${BESIDE_NOTCH};
      }
    `}

  ${media.between('m', 'l')} {
    font-weight: ${fontWeight.medium};
    font-size: ${fontSize.heading.m}px;
    line-height: ${lineHeight.heading.m}px;
  }

  ${media.down('m')} {
    font-size: ${fontSize.body.xl}px;
    line-height: ${lineHeight.body.xl}px;
    letter-spacing: ${letterSpacing.s}px;
  }
`;

/** The bulleted variant keeps its lines left-aligned, even on a right-aligned card. */
const ListText = styled(MainText)`
  text-align: left;
`;

const Footer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: inherit;
  flex: 1;
  gap: ${spacing[600]}px;
  width: 100%;
  padding-top: ${scaled(spacing[300])};
`;

const Skills = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;

  /* Desktop shows these in the centre circle instead; keep them for screen readers. */
  ${media.up('l')} {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  ${media.down('l')} {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: ${spacing[100]}px ${spacing[200]}px;
    font-family: ${fontFamily.heading};
    font-weight: ${fontWeight.semibold};
    font-size: ${fontSize.heading.s}px;
    line-height: ${lineHeight.heading.s}px;
    color: ${neutrals[500]};
  }

  ${media.down('m')} {
    gap: ${spacing[50]}px ${spacing[100]}px;
    font-size: ${fontSize.body.xl}px;
    line-height: ${lineHeight.body.xl}px;
    letter-spacing: ${letterSpacing.s}px;
  }
`;

const Skill = styled.li`
  ${media.down('l')} {
    display: flex;
    align-items: center;
    gap: ${spacing[200]}px;
    white-space: nowrap;

    &:not(:last-child)::after {
      /* Decorative separator — empty alt text keeps screen readers from announcing "times". */
      content: '×' / '';
      font-size: ${fontSize.body.xl}px;
      line-height: ${lineHeight.body.xl}px;
      letter-spacing: ${letterSpacing.s}px;
    }
  }

  ${media.down('m')} {
    gap: ${spacing[100]}px;
  }
`;

const Footnote = styled.p<{ $besideNotch: boolean }>`
  margin: 0;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${scaled(fontSize.body.xl)};
  line-height: ${scaled(lineHeight.body.xl)};
  letter-spacing: ${letterSpacing.s}px;
  color: ${neutrals[100]};
  pointer-events: auto;

  ${(p) =>
    p.$besideNotch &&
    css`
      ${media.up('l')} {
        max-width: ${BESIDE_NOTCH};
      }
    `}

  ${media.down('l')} {
    font-family: ${fontFamily.body};
    font-weight: ${fontWeight.regular};
    letter-spacing: ${letterSpacing.xs}px;
  }
`;

export interface CapabilityCardProps {
  capability: Capability;
  index: number;
  notch: NotchCorner;
}

export function CapabilityCard({ capability, index, notch }: CapabilityCardProps) {
  const edgeId = useId();
  const { title, text, footnote, skills } = capability;
  const notchOnTop = notch.startsWith('top');
  const initialShape = notchedCardShape({
    width: DESIGN_CARD.width,
    height: DESIGN_CARD.height,
    gapX: DESIGN_CARD.gap,
    gapY: DESIGN_CARD.gap,
    notchRadius: DESIGN_CARD.notchRadius,
    notch,
  });

  return (
    // Focusable so keyboard users can reveal the skills in the centre circle too.
    <Card data-capability={index} $alignEnd={notch.endsWith('left')} tabIndex={0}>
      {/* viewBox and d are rewritten to the measured size by the section. */}
      <Shape
        aria-hidden
        viewBox={`0 0 ${DESIGN_CARD.width} ${DESIGN_CARD.height}`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={edgeId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={transparents.transparent25} />
            <stop offset="1" stopColor={transparents.transparent4} />
          </linearGradient>
        </defs>
        <path d={initialShape.d} stroke={`url(#${edgeId})`} strokeWidth={border.medium} />
      </Shape>

      <Body>
        <Title>{title}</Title>
        {typeof text === 'string' ? (
          <MainText as="p" $besideNotch={notchOnTop}>
            {text}
          </MainText>
        ) : (
          <ListText $besideNotch={notchOnTop}>
            <p>{text.lead}</p>
            <ul>
              {text.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </ListText>
        )}
        <Footer>
          <Skills aria-label={`${title} skills`}>
            {skills.map((skill) => (
              <Skill key={skill}>{skill}</Skill>
            ))}
          </Skills>
          <Footnote $besideNotch={!notchOnTop}>{footnote}</Footnote>
        </Footer>
      </Body>
    </Card>
  );
}
