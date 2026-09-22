'use client';

import { Link } from '@/i18n/navigation';
import styled, { css } from 'styled-components';
import { Badge, Button } from '@/components/primitives';
import { spacing } from '@/styles/tokens/spacing';
import { fontFamily, fontWeight, fontSize, lineHeight, letterSpacing } from '@/styles/tokens/typography';
import { neutrals } from '@/styles/tokens/colors';
import { radius } from '@/styles/tokens/radius';
import { media } from '@/styles/media';
import { HEADER_INLINE } from '@/components/layouts/NavBar';
import { COLLAGE_FRAME, ProjectCollage } from './ProjectCollage';
import { useMessages, useTranslations } from 'next-intl';
import {
  STAGE_QUERY,
  STAGE_SPLIT_QUERY,
  STAGE_STACKED_QUERY,
  type ShowcaseProject,
} from './projectShowcaseConfig';

/*
 * Figma: Single Project — 1920 (3155:9806), 1440 (3753:11187), 1024 (3753:15583),
 * 480 (3753:17735). The project's text on one half and its screenshot collage on
 * the other, running out to the page edge with the inner corners rounded. Rows
 * alternate which side the collage is on, and each row is its own slice of the
 * page-long gradient, so its text is light or dark to suit.
 *
 *  - 1920: 640 tall, two 948px halves 24px apart, the collage inset 32.
 *  - 1025–1440: 580 tall, two halves, the collage inset 48.
 *  - Tablet (481–1024): 580 tall, the collage a fixed 400px column beside the text.
 *  - Mobile (up to 768 — the 1024 layout's two columns are too cramped below it): stacked — text, then a full-bleed 240px band of collage
 *    with the CTA centred on top of it.
 *
 * On the Projects stage above tablet width the row follows the newer Single
 * Project (3011:9178) instead: a full screen tall, the text at the top of its
 * half with the CTA at the bottom, and the collage running the full height.
 */

export type MediaSide = 'left' | 'right';

const stage = `@media ${STAGE_QUERY}`;
/** The stage above tablet width: Figma's Single Project (3011:9178), a full screen tall. */
const stageDesktop = `@media ${STAGE_SPLIT_QUERY} and (min-width: 1024.02px)`;
/** The stage with the two halves side by side (tablet and up)… */
const stageSplit = `@media ${STAGE_SPLIT_QUERY}`;
/** …and stacked, at 768 and below. */
const stageStacked = `@media ${STAGE_STACKED_QUERY}`;

/** How far a half travels as it leaves or arrives, towards its own page edge. */
const STAGE_TRAVEL = 'clamp(80px, 12vw, 240px)';
const STAGE_OUT = 'opacity 450ms ease-in, transform 450ms ease-in';
const STAGE_IN =
  'opacity 650ms ease-out 200ms, transform 800ms cubic-bezier(0.22, 1, 0.36, 1) 200ms';

/**
 * One part of a staged row: in place while its row is active, off towards `side`
 * otherwise. `motion: 'fade'` only fades (the collage, whose columns bring their
 * own movement, running along their length; see ProjectCollage). `when` is the
 * stage layout it applies to: the text column moves as one side by side, but
 * when the row stacks that column dissolves (display: contents can't move), so
 * its text and CTA move instead.
 */
const stageHalf = (side: MediaSide, motion: 'slide' | 'fade' = 'slide', when = stage) => css`
  ${when} {
    transition: ${motion === 'slide' ? STAGE_IN : 'opacity 300ms ease-out 150ms'};

    [data-active='false'] & {
      opacity: 0;
      /* calc(): a bare minus in front of clamp() is invalid and drops the whole transform. */
      transform: ${
        motion === 'slide'
          ? `translateX(calc(${side === 'left' ? -1 : 1} * ${STAGE_TRAVEL}))`
          : 'none'
      };
      transition: ${motion === 'slide' ? STAGE_OUT : 'opacity 450ms ease-in 150ms'};
      pointer-events: none;
    }

    ${media.reducedMotion} {
      transform: none !important;
      transition: opacity 300ms ease-out;
    }
  }
`;

const ROW_HEIGHT = { desktop: 640, wide: 580, tablet: 580, mobile: 696 } as const;
/** How far the collage sits from the row's top and bottom edges. */
const MEDIA_INSET = { desktop: 40, wide: 48 } as const;

const Row = styled.article<{ $side: MediaSide; $background: string; $light: boolean }>`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  align-items: center;
  gap: ${spacing[400]}px;
  min-height: ${ROW_HEIGHT.wide}px;
  padding-block: ${MEDIA_INSET.wide}px;
  background: ${(p) => p.$background};
  color: ${(p) => (p.$light ? neutrals[900] : neutrals[100])};

  ${media.up('xxxl')} {
    min-height: ${ROW_HEIGHT.desktop}px;
    padding-block: ${MEDIA_INSET.desktop}px;
  }

  /* Tablet: the collage keeps a fixed column and the text takes the rest. */
  ${media.between('l', 'xl')} {
    grid-template-columns: ${(p) =>
      p.$side === 'right' ? 'minmax(0, 1fr) 400px' : '400px minmax(0, 1fr)'};
    min-height: ${ROW_HEIGHT.tablet}px;
  }

  ${media.down('l')} {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas: 'text' 'media';
    align-items: start;
    gap: ${spacing[400]}px;
    min-height: ${ROW_HEIGHT.mobile}px;
    padding-block: ${spacing[800]}px;
  }

  /* Staged: one screen tall, over the stage's own animated background, with the
     row's design-height band centred in it. */
  ${stage} {
    position: absolute;
    inset: 0;
    min-height: 0;
    padding-block: 0;
    align-content: center;
    grid-template-rows: ${ROW_HEIGHT.wide - 2 * MEDIA_INSET.wide}px;
    background: none;

    ${media.up('xxxl')} {
      grid-template-rows: ${ROW_HEIGHT.desktop - 2 * MEDIA_INSET.desktop}px;
    }

    /* The rows lie stacked on top of each other: only the one on screen may
       catch the pointer, or the topmost (last) row swallows every click. */
    &[data-active='false'] {
      pointer-events: none;
    }
  }

  /* Desktop stage (Figma 3011:9178): the row fills the screen, 80 clear at the
     top for the header and 32 at the bottom; the halves run its full height,
     80 apart. */
  ${stageDesktop} {
    align-content: stretch;
    align-items: stretch;
    grid-template-rows: minmax(0, 1fr);
    gap: ${spacing[1000]}px;
    padding-block: ${spacing[1000]}px ${spacing[400]}px;

    ${media.up('xxxl')} {
      grid-template-rows: minmax(0, 1fr);
    }
  }

  /* Stacked stage (768 and below): a screen tall too — the text under the
     header, and the collage filling all the rest down to the bottom edge. */
  ${stageStacked} {
    align-content: stretch;
    align-items: stretch;
    grid-template-rows: auto minmax(0, 1fr);
    gap: ${spacing[300]}px;
    padding-block: ${spacing[1000] + spacing[300]}px 0;
  }
`;

/** The text and its CTA; on mobile it dissolves so the CTA can move onto the collage. */
const TextColumn = styled.div<{ $side: MediaSide }>`
  ${(p) => stageHalf(p.$side, 'slide', stageSplit)}
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: ${spacing[500]}px;
  min-width: 0;
  height: 100%;
  /* In line with the header's logo and Contact Me at every width. */
  padding-inline: ${HEADER_INLINE.base}px;

  ${media.down('l')} {
    display: contents;
  }

  /* The text at the top of its half and the CTA at the bottom. */
  ${stageDesktop} {
    justify-content: space-between;
    padding-block: ${spacing[1000]}px;
  }

  /* On the stage the project dots sit at the right edge (ProjectsListSection):
     text on the right keeps clear of them. */
  ${(p) =>
    p.$side === 'right' &&
    css`
      ${stageSplit} {
        padding-right: ${HEADER_INLINE.base + spacing[600] + spacing[400]}px;
      }
    `}
`;

const Info = styled.div`
  ${stageHalf('left', 'slide', stageStacked)}
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${spacing[400]}px;
  width: 100%;

  ${media.down('l')} {
    grid-area: text;
    gap: ${spacing[300]}px;
    padding-inline: ${HEADER_INLINE.mobile}px;
  }

  ${stageDesktop} {
    gap: ${spacing[800]}px;
  }
`;

const Heading = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[100]}px;
  width: 100%;

  ${stageDesktop} {
    gap: ${spacing[150]}px;
  }
`;

const Title = styled.h2`
  margin: 0;
  font-family: ${fontFamily.display};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.display.s}px;
  line-height: ${lineHeight.display.s}px;
  letter-spacing: ${letterSpacing.xs}px;
  color: inherit;

  ${media.down('l')} {
    font-size: ${fontSize.heading.l}px;
    line-height: ${lineHeight.heading.l}px;
  }
`;

const Roles = styled.ul`
  display: flex;
  align-items: center;
  gap: ${spacing[150]}px;
  margin: 0;
  padding: 0;
  list-style: none;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.medium};
  font-size: ${fontSize.heading.m}px;
  line-height: ${lineHeight.heading.m}px;
  letter-spacing: ${letterSpacing.xs}px;
  color: inherit;
  /* Roles move to a second line as a whole when they don't fit (longer Russian and Armenian titles). */
  flex-wrap: wrap;

  li {
    display: flex;
    align-items: center;
    gap: ${spacing[150]}px;
    white-space: nowrap;
  }

  li:not(:last-child)::after {
    content: '×' / '';
  }

  ${media.down('l')} {
    font-size: ${fontSize.body.xl}px;
    line-height: ${lineHeight.body.xl}px;
  }
`;

const Description = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[200]}px;
  width: 100%;
  font-family: ${fontFamily.body};
  font-weight: ${fontWeight.regular};
  font-size: ${fontSize.body.l}px;
  line-height: ${lineHeight.body.l}px;
  letter-spacing: ${letterSpacing.xs}px;
  color: inherit;

  p {
    margin: 0;
  }

  ${media.down('l')} {
    gap: ${spacing[150]}px;
  }
`;

const TechStack = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing[200]}px;
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    display: flex;
  }

  /* The design drops to the small badge on a phone. */
  ${media.down('l')} {
    gap: ${spacing[150]}px;

    li > * {
      height: 22px;
      padding: ${spacing[50]}px ${spacing[150]}px;
      font-size: ${fontSize.body.m}px;
      line-height: ${lineHeight.body.m}px;
      letter-spacing: ${letterSpacing.s}px;
    }
  }
`;

/**
 * On mobile the button leaves the text and sits in the middle of the collage band.
 * A wrapper, not styled(Button): styled-components drops the transient $variant
 * on the way through a wrapper, and the button loses its fill.
 */
const CtaSlot = styled.div`
  ${stageHalf('left', 'fade', stageStacked)}
  display: flex;

  ${media.down('l')} {
    grid-area: media;
    z-index: 1;
    place-self: center;
  }
`;

const Media = styled.div<{ $side: MediaSide }>`
  ${(p) => stageHalf(p.$side, 'fade')}
  position: relative;
  min-width: 0;
  height: 100%;
  overflow: hidden;
  /* clip, not just hidden: nothing (focus, scrollIntoView) can scroll the collage inside its box. */
  overflow: clip;
  /* One design pixel of the collage's own media box (--frame-w × --frame-h, set
     per collage), scaled to cover this one. */
  container-type: size;
  --u: max(100cqw / var(--frame-w), 100cqh / var(--frame-h));

  ${(p) =>
    p.$side === 'right'
      ? css`
          border-radius: ${radius.xxl}px 0 0 ${radius.xxl}px;
        `
      : css`
          order: -1;
          border-radius: 0 ${radius.xxl}px ${radius.xxl}px 0;
        `}

  ${media.down('l')} {
    grid-area: media;
    order: 0;
    height: 240px;
    border-radius: 0;
  }

  /* The stacked stage gives the collage everything below the text. */
  ${stageStacked} {
    height: auto;
  }
`;

export interface ProjectShowcaseProps {
  project: ShowcaseProject;
  mediaSide: MediaSide;
  /** On the stage: whether this row is before, on or after the one on screen. Ignored when the rows stack. */
  stage?: 'past' | 'active' | 'upcoming';
  /** Render the collage; the stage holds it back until a row is near, so ten load one by one. */
  showMedia?: boolean;
}

export function ProjectShowcase({
  project,
  mediaSide,
  stage: position = 'active',
  showMedia = true,
}: ProjectShowcaseProps) {
  const t = useTranslations('projectsPage.showcase');
  const content = useMessages().projectsPage.showcase.items[project.content];
  const description = t.raw('description') as string[];
  const stack = t.raw('stack') as string[];

  return (
    <Row
      $side={mediaSide}
      $background={project.background}
      $light={project.tone === 'light'}
      data-active={position === 'active'}
      data-stage={position}
    >
      <TextColumn $side={mediaSide === 'right' ? 'left' : 'right'}>
        <Info>
          <Heading>
            <Title>{content.title}</Title>
            <Roles aria-label={t('rolesLabel')}>
              {content.roles.map((role) => (
                <li key={role}>{role}</li>
              ))}
            </Roles>
          </Heading>
          <TechStack aria-label={t('stackLabel')}>
            {stack.map((item) => (
              <li key={item}>
                <Badge $size="medium">{item}</Badge>
              </li>
            ))}
          </TechStack>
          <Description>
            {description.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </Description>
        </Info>
        <CtaSlot>
          <Button as={Link} href={project.href} $variant="secondary">
            {t('cta')}
          </Button>
        </CtaSlot>
      </TextColumn>

      <Media
        $side={mediaSide}
        aria-hidden
        style={
          {
            '--frame-w': (project.collage.frame ?? COLLAGE_FRAME).width,
            '--frame-h': (project.collage.frame ?? COLLAGE_FRAME).height,
          } as React.CSSProperties
        }
      >
        {showMedia && <ProjectCollage collage={project.collage} mirrored={mediaSide === 'left'} />}
      </Media>
    </Row>
  );
}
