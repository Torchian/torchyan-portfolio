'use client';

import styled from 'styled-components';
import { spacing } from '@/styles/tokens/spacing';
import {
  fontFamily,
  fontWeight,
  fontSize,
  lineHeight,
  letterSpacing,
} from '@/styles/tokens/typography';
import { accents, neutrals } from '@/styles/tokens/colors';
import { radius } from '@/styles/tokens/radius';
import { duration, easing } from '@/styles/tokens/motion';
import { media } from '@/styles/media';
import { useTranslations } from 'next-intl';
import { SectionHeading } from '@/components/composites';
import { VisuallyHidden } from '@/components/primitives';

/*
 * Figma: Tools and Technologies — 1920 (2973:16256), 1024 (3960:15416),
 * 480 (3988:15489); the grid is 3984:13656 and one circle 2843:6620.
 *
 * The 1920 frame is a field of soft discs with the heading on a pill over the
 * middle, and two wide outlines (3990:17094 / 3990:17095) crossing it. The
 * tablet and phone frames are a different thing: the heading sits above the
 * grid, and every circle is solid green with its label showing — Figma's
 * Circle Text has its own Tablet (115px, label 14) and Mobile (88px, label 12)
 * states. The grid is 11 circles across at 1920, 8 on a tablet, 5 on a phone.
 */

const Section = styled.section`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[600]}px;
  width: 100%;
  padding: ${spacing[1000]}px 0;
  overflow: hidden;

  ${media.down('m')} {
    gap: ${spacing[500]}px;
    padding: ${spacing[600]}px 0;
  }
`;

/*
 * Figma's Group 29: big blurred ellipses behind the circles — white at 25%,
 * a warm white at 10% and a pink at 12%, each blurred by 500–1200. Painted as
 * radial gradients, which is what such a blur comes to anyway and costs
 * nothing to composite.
 */
const Glows = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(44% 58% at 87% 12%, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0) 100%),
    radial-gradient(40% 60% at 74% 88%, rgba(255, 249, 238, 0.06) 0%, rgba(255, 249, 238, 0) 100%),
    radial-gradient(52% 70% at 118% 78%, rgba(196, 27, 132, 0.16) 0%, rgba(196, 27, 132, 0) 100%);
`;

/**
 * The two outlines: each is as wide as the page and about a quarter as tall,
 * one crossing above the grid and one below.
 */
const Rings = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;

  /* Only the 1920 frame has them. */
  ${media.down('xl')} {
    display: none;
  }

  span {
    position: absolute;
    left: 50%;
    width: 132%;
    aspect-ratio: 1920 / 506;
    /* Figma draws these as white at 25%. */
    border: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: 50%;
    transform: translateX(-50%);
  }

  span:first-child {
    top: -6%;
  }

  span:last-child {
    bottom: -6%;
  }
`;

/*
 * Figma's grid is 1956 wide in a 1920 frame — 11 circles of 156 with 24
 * between them — so it runs off both edges. The circles keep their size and
 * the section clips them, rather than squeezing to fit.
 */
const Grid = styled.ul`
  position: relative;
  display: grid;
  grid-template-columns: repeat(11, 156px);
  justify-content: center;
  gap: ${spacing[300]}px;
  margin: 0;
  padding: 0;
  list-style: none;

  ${media.down('xl')} {
    grid-template-columns: repeat(8, 115px);
    gap: ${spacing[100]}px;
  }

  ${media.down('m')} {
    grid-template-columns: repeat(5, 88px);
    gap: ${spacing[100]}px;
  }
`;

/**
 * Figma's Circle Text: at rest white at 25% under an 80px layer blur, with its
 * label hidden; hovered it's solid green with a 10px blur and the label shows.
 * Both are painted as radial gradients — the same look without blurring 66
 * layers a frame. The rest state spreads well past its own box, as a blur that
 * wide does, so neighbouring circles melt into one field.
 */
const Circle = styled.li`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  padding: ${spacing[100]}px;
  border-radius: 50%;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.body.xl}px;
  line-height: ${lineHeight.body.xl}px;
  letter-spacing: ${letterSpacing.s}px;
  text-align: center;
  text-wrap: balance;
  color: ${neutrals[100]};

  /* The soft disc, drawn past the circle's own edges. */
  &::before {
    content: '';
    position: absolute;
    inset: -40%;
    border-radius: 50%;
    background: radial-gradient(
      circle at center,
      rgba(255, 255, 255, 0.19) 0%,
      rgba(255, 255, 255, 0.15) 22%,
      rgba(255, 255, 255, 0.06) 45%,
      rgba(255, 255, 255, 0.01) 65%,
      rgba(255, 255, 255, 0) 78%
    );
    transition: opacity ${duration.normal} ${easing.out};
  }

  /* The green disc it becomes, with the design's softer edge. */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: radial-gradient(
      circle at center,
      ${accents.primary} 0%,
      ${accents.primary} 86%,
      rgba(12, 175, 10, 0) 100%
    );
    opacity: 0;
    transition: opacity ${duration.normal} ${easing.out};
  }

  span {
    position: relative;
    z-index: 1;
    opacity: 0;
    transition: opacity ${duration.normal} ${easing.out};
  }

  &:hover::before {
    opacity: 0;
  }

  &:hover::after,
  &:hover span {
    opacity: 1;
  }

  /* The tablet and phone states: solid green, label showing, no hover to wait for. */
  ${media.down('xl')} {
    font-size: ${fontSize.body.m}px;
    line-height: ${lineHeight.body.m}px;

    &::before {
      content: none;
    }

    &::after {
      opacity: 1;
    }

    span {
      opacity: 1;
    }
  }

  ${media.down('m')} {
    font-size: ${fontSize.body.s}px;
    line-height: ${lineHeight.body.s}px;
  }

  @media (prefers-reduced-motion: reduce) {
    &::before,
    &::after,
    span {
      transition: none;
    }
  }
`;

/** Above the grid, as the tablet and phone frames have it. */
const AboveHeading = styled.div`
  display: none;
  width: 100%;
  max-width: 976px;
  padding: 0 ${spacing[600]}px;

  /* Figma sets this section's title in capitals at every size. */
  h2 {
    text-transform: uppercase;
  }

  ${media.down('xl')} {
    display: block;
  }

  ${media.down('m')} {
    padding: 0 ${spacing[200]}px;
  }
`;

/** The heading pill, over the middle of the grid — the 1920 frame only. */
const Heading = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[200]}px;
  max-width: calc(100% - ${spacing[400] * 2}px);
  padding: ${spacing[500]}px ${spacing[800]}px;
  border-radius: ${radius.round}px;
  background: ${neutrals[900]};
  text-align: center;
  transform: translate(-50%, -50%);

  ${media.down('xl')} {
    display: none;
  }
`;

const Title = styled.h2`
  margin: 0;
  font-family: ${fontFamily.display};
  font-weight: ${fontWeight.black};
  font-size: ${fontSize.display.m}px;
  line-height: ${lineHeight.display.m}px;
  letter-spacing: ${letterSpacing.xs}px;
  text-transform: uppercase;
  color: ${accents.primary};

  ${media.down('xl')} {
    font-size: ${fontSize.display.s}px;
    line-height: ${lineHeight.display.s}px;
  }

  ${media.down('m')} {
    font-size: ${fontSize.heading.l}px;
    line-height: ${lineHeight.heading.l}px;
  }
`;

const Subtitle = styled.p`
  margin: 0;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.body.l}px;
  line-height: ${lineHeight.body.l}px;
  letter-spacing: ${letterSpacing.m}px;
  color: ${neutrals[500]};

  ${media.down('m')} {
    font-size: ${fontSize.body.s}px;
    line-height: ${lineHeight.body.s}px;
  }
`;

export function AboutPracticeSection() {
  const t = useTranslations('about.practice');
  const circles = t.raw('circles') as string[];

  return (
    <Section aria-labelledby="about-practice">
      <Glows aria-hidden />
      <Rings aria-hidden>
        <span />
        <span />
      </Rings>
      {/* One heading for the page's outline; the two visible ones are per frame. */}
      <VisuallyHidden as="h2" id="about-practice">
        {t('title')}
      </VisuallyHidden>
      <AboveHeading aria-hidden>
        <SectionHeading title={t('title')} subtitle={t('subtitle')} />
      </AboveHeading>
      <Grid>
        {circles.map((label) => (
          <Circle key={label}>
            <span>{label}</span>
          </Circle>
        ))}
      </Grid>
      <Heading aria-hidden>
        <Title>{t('title')}</Title>
        <Subtitle>{t('subtitle')}</Subtitle>
      </Heading>
    </Section>
  );
}
