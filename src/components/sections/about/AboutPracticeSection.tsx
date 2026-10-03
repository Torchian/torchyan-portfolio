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
import { accents, neutrals, transparents } from '@/styles/tokens/colors';
import { radius } from '@/styles/tokens/radius';
import { duration, easing } from '@/styles/tokens/motion';
import { media } from '@/styles/media';
import { useTranslations } from 'next-intl';
import { SectionHeading } from '@/components/composites';
import { VisuallyHidden } from '@/components/primitives';

/*
 * Figma: What I Do In Practice — 1920 (2973:16256), 1024 (3960:15416),
 * 480 (3988:15489). The grid is Circles Text Grid (3984:13656) and one circle
 * is Circle Text (2843:6620), which has four states: Default, Hover, Tablet
 * and Mobile.
 *
 * A field of circles, and the same field reads differently per size:
 *  - 1920: every circle is a white disc at 25% under an 80px blur, so the grid
 *    is a bank of soft cloud with no words in it. The heading lies over the
 *    middle on a dark green pill. Hovering one circle turns it green under a
 *    10px blur and brings its label up.
 *  - tablet and phone: there is no hover, so every circle is already the green
 *    one with its label showing, and the heading stands above the grid with no
 *    pill behind it.
 *
 * Each frame's grid is a different shape, and Figma fills each one exactly, so
 * the list is as long as the widest (66) and the two narrower sizes drop the
 * last one or two.
 */

/** Figma's Circle Text, one size per state, and the grid pitch around it. */
const CIRCLE = {
  desktop: { size: 150, gap: spacing[200], columns: 11 },
  tablet: { size: 114, gap: spacing[200], columns: 8 },
  mobile: { size: 88, gap: spacing[50], columns: 5 },
} as const;

/** The grid's own width, which is what makes the rows break where Figma breaks them. */
const track = (c: (typeof CIRCLE)[keyof typeof CIRCLE]) =>
  c.columns * c.size + (c.columns - 1) * c.gap;

/** How many circles each frame shows: 6 × 11, 8 × 8, 13 × 5. */
const COUNT = { desktop: 66, tablet: 64, mobile: 65 } as const;

const Section = styled.section`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: ${spacing[1000]}px 0;
  /* The grid is wider than the page at every size, exactly as the frames draw it. */

  /* Full screen on desktop: the field of circles fills the viewport, with the
     pill centred in the middle of it, rather than just as tall as the grid. */
  ${media.up('xl')} {
    justify-content: center;
  }

  ${media.down('xl')} {
    gap: ${spacing[600]}px;
  }

  ${media.down('m')} {
    gap: ${spacing[300]}px;
    padding: ${spacing[600]}px 0;
  }
`;

/** Holds the grid and, at 1920, the heading lying over the middle of it. */
const Field = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  width: 100%;
`;

/**
 * Figma's grid is 1956 wide in a 1920 frame — it runs off both edges, and the
 * section clips it. Its width is what breaks the rows at 11, 8 and 5, so the
 * rows are laid as the frames lay them and a short last row stays centred.
 */
const Grid = styled.ul`
  display: flex;
  flex: none;
  flex-wrap: wrap;
  justify-content: center;
  gap: ${CIRCLE.desktop.gap}px;
  width: ${track(CIRCLE.desktop)}px;
  margin: 0;
  padding: 0;
  list-style: none;

  ${media.down('xl')} {
    gap: ${CIRCLE.tablet.gap}px;
    width: ${track(CIRCLE.tablet)}px;
  }

  ${media.down('m')} {
    gap: ${CIRCLE.mobile.gap}px;
    width: ${track(CIRCLE.mobile)}px;
  }
`;

/**
 * Figma's Circle Text. The disc behind the label is the whole of it: a circle
 * the size of the cell under a blur, white at 25% and blurred by 80 at rest,
 * green and blurred by 10 once it's yours. The label sits over it unblurred,
 * and at rest it's transparent — at 1920 the grid carries no words until you
 * hover one.
 */
const Circle = styled.li`
  position: relative;
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: ${CIRCLE.desktop.size}px;
  height: ${CIRCLE.desktop.size}px;
  padding: ${spacing[300]}px ${spacing[200]}px;
  border-radius: 50%;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.body.xl}px;
  line-height: ${lineHeight.body.xl}px;
  letter-spacing: ${letterSpacing.s}px;
  text-align: center;
  /* Figma lets a long word break rather than escape its circle. */
  word-break: break-word;
  color: ${neutrals[100]};

  /* At rest: the white disc, its blur spreading well past the cell. */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: ${transparents.transparent25};
    filter: blur(40px);
    transition: opacity ${duration.normal} ${easing.out};
  }

  /* Hovered: the same disc in green, barely blurred. */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: ${accents.primary};
    filter: blur(5px);
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

  /* The tablet and phone states: green and labelled from the start, no hover. */
  ${media.down('xl')} {
    width: ${CIRCLE.tablet.size}px;
    height: ${CIRCLE.tablet.size}px;
    padding: ${spacing[200]}px ${spacing[100]}px;
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

    /* The tablet grid is two circles shorter than the desktop one. */
    &:nth-child(n + ${COUNT.tablet + 1}) {
      display: none;
    }
  }

  ${media.down('m')} {
    width: ${CIRCLE.mobile.size}px;
    height: ${CIRCLE.mobile.size}px;
    padding: ${spacing[150]}px ${spacing[75]}px;
    font-weight: ${fontWeight.medium};
    font-size: ${fontSize.body.s}px;
    line-height: ${lineHeight.body.s}px;
    letter-spacing: ${letterSpacing.xxl}px;

    /* The phone grid takes one of those two back: 13 rows of 5. */
    &:nth-child(${COUNT.mobile}) {
      display: flex;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    &::before,
    &::after,
    span {
      transition: none;
    }
  }
`;

/** Above the grid, as the tablet and phone frames have it — no pill, white title. */
const AboveHeading = styled.div`
  display: none;
  width: 100%;
  max-width: 899px;
  padding: ${spacing[400]}px ${spacing[600]}px;

  /* Figma sets this section's title in capitals at every size. */
  h2 {
    text-transform: uppercase;
  }

  /* Figma's heading sets the line under the title at full strength, not muted. */
  p {
    color: ${neutrals[100]};
  }

  ${media.down('xl')} {
    display: block;
  }

  ${media.down('m')} {
    max-width: none;
    padding: ${spacing[400]}px ${spacing[200]}px;
  }
`;

/**
 * The 1920 frame's heading: a dark green pill lying across the middle of the
 * field — the same fill as the closing CTA card.
 */
const Pill = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${spacing[200]}px;
  max-width: calc(100% - ${spacing[100] * 2}px);
  padding: ${spacing[200]}px ${spacing[400]}px;
  border-radius: ${radius.round}px;
  background: #0d1816;
  text-align: center;
  transform: translate(-50%, -50%);

  ${media.down('xl')} {
    display: none;
  }
`;

const Title = styled.p`
  margin: 0;
  font-family: ${fontFamily.display};
  font-weight: ${fontWeight.black};
  font-size: ${fontSize.display.xl}px;
  line-height: ${lineHeight.display.xl}px;
  letter-spacing: ${letterSpacing.xxs}px;
  text-transform: uppercase;
  color: ${accents.primary};
`;

const Subtitle = styled.p`
  margin: 0;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.heading.s}px;
  line-height: ${lineHeight.heading.s}px;
  letter-spacing: ${letterSpacing.xs}px;
  color: ${neutrals[100]};
`;

export function AboutPracticeSection() {
  const t = useTranslations('about.practice');
  const circles = (t.raw('circles') as string[]).slice(0, COUNT.desktop);

  return (
    <Section aria-labelledby="about-practice">
      {/* One heading for the page's outline; the two visible ones are per frame. */}
      <VisuallyHidden as="h2" id="about-practice">
        {t('title')}
      </VisuallyHidden>
      <AboveHeading aria-hidden>
        <SectionHeading title={t('title')} subtitle={t('subtitle')} />
      </AboveHeading>
      <Field>
        <Grid>
          {circles.map((label) => (
            <Circle key={label}>
              <span>{label}</span>
            </Circle>
          ))}
        </Grid>
        <Pill aria-hidden>
          <Title>{t('title')}</Title>
          <Subtitle>{t('subtitle')}</Subtitle>
        </Pill>
      </Field>
    </Section>
  );
}
