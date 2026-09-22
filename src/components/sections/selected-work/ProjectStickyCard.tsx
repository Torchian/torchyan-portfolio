'use client';

import Image from 'next/image';
import { useMessages, useTranslations } from 'next-intl';
import styled, { css, type RuleSet } from 'styled-components';
import { CTASecondary, type CTASecondaryProps } from '@/components/primitives';
import { media, mediaQueries } from '@/styles/media';
import { neutrals } from '@/styles/tokens/colors';
import { grid as gridTokens } from '@/styles/tokens/grid';
import { duration, easing } from '@/styles/tokens/motion';
import { radius } from '@/styles/tokens/radius';
import { spacing } from '@/styles/tokens/spacing';
import { fontFamily, fontSize, fontWeight, letterSpacing, lineHeight } from '@/styles/tokens/typography';
import {
  ALL_PROJECTS_GRID,
  FLAT_GAP_RATIO,
  GRID_FRAMES,
  ISOMETRIC_GAP,
  type FlatColumn,
  type FramePoint,
  type GridImage,
  type GridScreen,
  type IsometricColumn,
  type IsometricGrid,
  type ProjectGrid,
} from './projectGrids';
import type { ProjectConfig } from './projectsConfig';

/*
 * Figma: Single Project (2300:1687) — Desktop 2300:1686, Tablet 2650:4265, Mobile 2653:4955.
 *
 * A full-screen sticky card: company and roles, then a screenshot grid with its
 * CTA taking the rest of the screen, then title, description and field.
 *
 * Each grid is laid out in its Figma frame (1440, 976 or 448 × 680, see
 * projectGrids.ts) inside a stage, and the stage scales that frame to cover the
 * media box: `--u` is one frame px. The composition holds at any viewport size,
 * and every move is a transform.
 */

/** How far the grid pushes in as its card is scrolled through (`--card-progress` 0 → 1). */
const MAGNIFY = 0.08;
const SLIDE = `${duration.slowest} ${easing.inOut}`;

const ONLY_ON: Record<GridScreen, string> = {
  desktop: media.up('xl'),
  tablet: media.between('m', 'xl'),
  mobile: media.down('m'),
};

/** Desktop only (tablet and mobile have no hover design): while the media is hovered, or its CTA has focus. */
const onDesktopHover = (styles: RuleSet) => css`
  @media ${mediaQueries.up('xl')} and (hover: hover) and (pointer: fine) {
    [data-cta-trigger]:hover & {
      ${styles}
    }
  }

  ${media.up('xl')} {
    [data-cta-trigger]:focus-within & {
      ${styles}
    }
  }
`;

/* ---------- Card ---------- */

const CardWrapper = styled.article<{ $background?: string }>`
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100vh;
  padding: ${spacing[1500]}px ${spacing[400]}px ${spacing[500]}px;
  overflow: hidden;
  background: ${(p) => p.$background ?? `linear-gradient(180deg, ${neutrals[900]} 0%, ${neutrals[800]} 100%)`};
  isolation: isolate;
  /* Already clipped (overflow: hidden) and its own stacking context; this makes
     that explicit to the browser, so layout and paint inside one card can never
     spill into work on the cards stacked around it. */
  contain: layout paint;

  ${media.down('xl')} {
    padding: ${spacing[1500]}px ${spacing[300]}px ${spacing[300]}px;
  }

  ${media.down('m')} {
    padding: ${spacing[1250]}px ${spacing[200]}px ${spacing[200]}px;
  }
`;

const Container = styled.div`
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  gap: ${spacing[300]}px;
  width: 100%;
  max-width: ${gridTokens.maxWidth}px;
  min-height: 0;
  color: ${neutrals[100]};

  ${media.down('xl')} {
    gap: ${spacing[200]}px;
  }
`;

/** Desktop: company left, roles pushed right on its baseline row. Tablet and mobile: stacked. */
const Header = styled.header`
  display: flex;
  align-items: flex-end;
  gap: ${spacing[600]}px;

  ${media.down('xl')} {
    flex-direction: column;
    align-items: flex-start;
    gap: ${spacing[100]}px;
  }
`;

const Company = styled.h3`
  flex: 0 1 auto;
  min-width: 0;
  margin: 0;
  font-family: ${fontFamily.display};
  font-weight: ${fontWeight.black};
  font-size: ${fontSize.display.xl}px;
  line-height: ${lineHeight.display.xl}px;
  letter-spacing: ${letterSpacing.xxs}px;
  text-transform: uppercase;

  /* Tablet: 72px Bold, as typed */
  ${media.down('xl')} {
    font-weight: ${fontWeight.heading};
    font-size: ${fontSize.display.m}px;
    line-height: ${lineHeight.display.m}px;
    letter-spacing: ${letterSpacing.xs}px;
    text-transform: none;
  }

  /* Mobile: 36px SemiBold */
  ${media.down('m')} {
    font-family: ${fontFamily.heading};
    font-weight: ${fontWeight.semibold};
    font-size: ${fontSize.heading.l}px;
    line-height: ${lineHeight.heading.l}px;
  }
`;

const Roles = styled.p`
  display: flex;
  flex: 1 1 auto;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: ${spacing[100]}px ${spacing[300]}px;
  margin: 0;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.body.xl}px;
  line-height: ${lineHeight.body.xl}px;
  letter-spacing: ${letterSpacing.s}px;

  ${media.down('xl')} {
    flex: none;
    justify-content: flex-start;
  }

  ${media.down('m')} {
    gap: ${spacing[150]}px;
    font-size: ${fontSize.body.l}px;
    line-height: ${lineHeight.body.l}px;
    letter-spacing: ${letterSpacing.m}px;
  }
`;

/** A role with the × before it, so a wrapped line never starts on a lone ×. */
const Role = styled.span`
  white-space: nowrap;
`;

const Separator = styled.span`
  margin-inline-end: ${spacing[300]}px;

  ${media.down('m')} {
    margin-inline-end: ${spacing[150]}px;
  }
`;

const Body = styled.footer`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  ${media.down('m')} {
    flex-direction: column;
    align-items: flex-end;
    gap: ${spacing[200]}px;
  }
`;

const Info = styled.div`
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  gap: ${spacing[150]}px;
  min-width: 0;
  padding-inline-end: ${spacing[300]}px;

  ${media.down('m')} {
    flex: none;
    gap: ${spacing[100]}px;
    width: 100%;
  }
`;

const Title = styled.h4`
  margin: 0;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.medium};
  font-size: ${fontSize.heading.m}px;
  line-height: ${lineHeight.heading.m}px;
  letter-spacing: ${letterSpacing.xs}px;
`;

const Description = styled.p`
  margin: 0;
  font-family: ${fontFamily.body};
  font-weight: ${fontWeight.regular};
  font-size: ${fontSize.body.l}px;
  line-height: ${lineHeight.body.l}px;
  letter-spacing: ${letterSpacing.xs}px;
`;

const Field = styled.p`
  flex-shrink: 0;
  margin: 0;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.body.l}px;
  line-height: ${lineHeight.body.l}px;
  letter-spacing: ${letterSpacing.m}px;
  white-space: nowrap;
`;

/* ---------- Grid ---------- */

const MediaBox = styled.div`
  position: relative;
  flex: 1 1 0;
  min-height: 0;
  overflow: hidden;
  border-radius: ${radius.xl}px;
  /* The stage measures this box through container units. */
  container-type: size;
`;

const Stage = styled.div`
  --frame-w: ${GRID_FRAMES.desktop.width};
  --frame-h: ${GRID_FRAMES.desktop.height};
  /* One frame px: the frame scaled to cover the media box. */
  --u: max(100cqw / var(--frame-w), 100cqh / var(--frame-h));
  position: absolute;
  top: 50%;
  left: 50%;
  width: calc(var(--frame-w) * var(--u));
  height: calc(var(--frame-h) * var(--u));
  transform: translate(-50%, -50%) scale(calc(1 + ${MAGNIFY} * var(--card-progress, 0)));

  ${media.down('xl')} {
    --frame-w: ${GRID_FRAMES.tablet.width};
    --frame-h: ${GRID_FRAMES.tablet.height};
  }

  ${media.down('m')} {
    --frame-w: ${GRID_FRAMES.mobile.width};
    --frame-h: ${GRID_FRAMES.mobile.height};
  }

  /* A compositor layer only while its card is being scrolled through (the
     Selected Work hook sets data-magnifying), never on every card at once. */
  [data-magnifying] & {
    will-change: transform;
  }
`;

const columnBase = css`
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  transition: transform ${SLIDE};

  ${media.reducedMotion} {
    transition: none;
  }
`;

const columnSize = (width: number, gap: number) => css`
  width: calc(${width} * var(--u));
  gap: calc(${gap} * var(--u));
`;

const PROJECTION: Record<IsometricGrid['axis'], string> = {
  'down-right': 'rotate(-30deg) skewX(30deg) scaleY(0.866)',
  'down-left': 'rotate(30deg) skewX(-30deg) scaleY(0.866)',
};

/** Centre the column on a frame point, then project it. */
const isometric = (axis: IsometricGrid['axis'], [x, y]: FramePoint) =>
  `translate(calc(${x} * var(--u)), calc(${y} * var(--u))) translate(-50%, -50%) ${PROJECTION[axis]}`;

const IsometricColumnBox = styled.div<{ $grid: IsometricGrid; $column: IsometricColumn }>`
  ${columnBase}
  ${({ $grid, $column }) => css`
    ${columnSize($column.width * $grid.scale.desktop, ISOMETRIC_GAP * $grid.scale.desktop)}
    transform: ${isometric($grid.axis, $column.center.desktop)};

    ${onDesktopHover(css`
      transform: ${isometric($grid.axis, $column.center.hover)};
    `)}

    ${media.down('xl')} {
      ${columnSize($column.width * $grid.scale.tablet, ISOMETRIC_GAP * $grid.scale.tablet)}
      transform: ${isometric($grid.axis, $column.center.tablet)};
    }

    ${media.down('m')} {
      ${columnSize($column.width * $grid.scale.mobile, ISOMETRIC_GAP * $grid.scale.mobile)}
      transform: ${isometric($grid.axis, $column.center.mobile)};
    }
  `}
`;

const flat = (left: number, top: number) => `translate(calc(${left} * var(--u)), calc(${top} * var(--u)))`;

const FlatColumnBox = styled.div<{ $column: FlatColumn }>`
  ${columnBase}
  ${({ $column: { frame, hoverTop } }) => css`
    ${columnSize(frame.desktop.width, frame.desktop.width * FLAT_GAP_RATIO)}
    transform: ${flat(frame.desktop.left, frame.desktop.top)};

    ${onDesktopHover(css`
      transform: ${flat(frame.desktop.left, hoverTop)};
    `)}

    ${media.down('xl')} {
      ${columnSize(frame.tablet.width, frame.tablet.width * FLAT_GAP_RATIO)}
      transform: ${flat(frame.tablet.left, frame.tablet.top)};
    }

    ${media.down('m')} {
      ${columnSize(frame.mobile.width, frame.mobile.width * FLAT_GAP_RATIO)}
      transform: ${flat(frame.mobile.left, frame.mobile.top)};
    }
  `}
`;

const Tile = styled.div<{ $aspect: number; $only?: GridScreen }>`
  position: relative;
  flex-shrink: 0;
  width: 100%;
  aspect-ratio: ${(p) => p.$aspect};
  overflow: hidden;

  ${(p) =>
    p.$only &&
    css`
      display: none;

      ${ONLY_ON[p.$only]} {
        display: block;
      }
    `}
`;

/** Figma: CTA Secondary, centred on the media; 64px above its bottom on mobile. */
const GridCTA = styled(CTASecondary)`
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 1;
  transform: translate(-50%, -50%);
`;

/** Tile widths per screen, for the image `sizes` hint. */
function tileSizes(widths: Record<GridScreen, number>) {
  const px = (width: number) => `${Math.ceil(width)}px`;
  return `${mediaQueries.down('m')} ${px(widths.mobile)}, ${mediaQueries.down('xl')} ${px(widths.tablet)}, ${px(widths.desktop)}`;
}

function Tiles({ images, sizes }: { images: GridImage[]; sizes: string }) {
  return images.map((image, i) => (
    <Tile key={i} $aspect={image.aspect} $only={image.only}>
      <Image
        src={image.src}
        alt=""
        fill
        sizes={sizes}
        style={{ objectFit: 'cover', objectPosition: image.position }}
      />
    </Tile>
  ));
}

function GridStage({ grid }: { grid: ProjectGrid }) {
  return (
    <Stage aria-hidden>
      {grid.kind === 'isometric'
        ? grid.columns.map((column, i) => (
            <IsometricColumnBox key={i} $grid={grid} $column={column}>
              <Tiles
                images={column.images}
                sizes={tileSizes({
                  desktop: column.width * grid.scale.desktop,
                  tablet: column.width * grid.scale.tablet,
                  mobile: column.width * grid.scale.mobile,
                })}
              />
            </IsometricColumnBox>
          ))
        : grid.columns.map((column, i) => (
            <FlatColumnBox key={i} $column={column}>
              <Tiles
                images={column.images}
                sizes={tileSizes({
                  desktop: column.frame.desktop.width,
                  tablet: column.frame.tablet.width,
                  mobile: column.frame.mobile.width,
                })}
              />
            </FlatColumnBox>
          ))}
    </Stage>
  );
}

/* ---------- Components ---------- */

interface StickyCardProps {
  company: string;
  roles: string[];
  title: string;
  description: string;
  field: string;
  /** Card background; the dark gradient when omitted. */
  background?: string;
  grid: ProjectGrid;
  href: string;
  cta: string;
  ctaFill?: string;
  ctaAppearance?: CTASecondaryProps['appearance'];
}

function StickyCard({ company, roles, title, description, field, background, grid, href, cta, ctaFill, ctaAppearance }: StickyCardProps) {
  return (
    <CardWrapper data-project-card $background={background}>
      <Container>
        <Header>
          <Company>{company}</Company>
          <Roles>
            {roles.map((role, i) => (
              <Role key={role}>
                {i > 0 && <Separator aria-hidden>×</Separator>}
                {role}
              </Role>
            ))}
          </Roles>
        </Header>

        <MediaBox data-cta-trigger>
          <GridStage grid={grid} />
          <GridCTA href={href} fill={ctaFill} appearance={ctaAppearance} activeBelow="xl">
            {cta}
          </GridCTA>
        </MediaBox>

        <Body>
          <Info>
            <Title>{title}</Title>
            <Description>{description}</Description>
          </Info>
          <Field>{field}</Field>
        </Body>
      </Container>
    </CardWrapper>
  );
}

export interface ProjectStickyCardProps {
  project: ProjectConfig;
}

export function ProjectStickyCard({ project }: ProjectStickyCardProps) {
  const t = useTranslations('selectedWork');
  const content = useMessages().projects[project.slug];

  return (
    <StickyCard
      company={project.company}
      roles={content.roles}
      title={content.title}
      description={content.description}
      field={`${content.field} · ${project.year}`}
      background={project.gradient}
      grid={project.grid}
      href={`/projects/${project.slug}`}
      cta={t('viewCase')}
      ctaFill={project.ctaFill}
    />
  );
}

/** The last card: a sample of other client work, linking to every project. */
export function AllProjectsStickyCard() {
  const t = useTranslations('selectedWork');
  const content = useMessages().selectedWork.allProjects;

  return (
    <StickyCard
      company={content.company}
      roles={content.roles}
      title={content.title}
      description={content.description}
      field={content.field}
      grid={ALL_PROJECTS_GRID}
      href="/projects"
      cta={t('viewAllCases')}
      ctaAppearance="dark"
    />
  );
}
