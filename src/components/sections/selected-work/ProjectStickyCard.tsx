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
  type GridImage,
  type GridScreen,
  type IsometricColumn,
  type IsometricGrid,
  type ProjectGrid,
} from './projectGrids';
import type { FeaturedProject } from './projectsConfig';

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

/**
 * Bottom padding that clears the phone's browser toolbar.
 *
 * The card is `100vh` tall, and on a phone that is the *toolbar-hidden*
 * viewport: with the toolbar out, its bottom `100lvh - 100svh` is behind the
 * toolbar. The measured cost was the year-and-role line ending 16px above the
 * card's edge on a 390px phone — invisible until you scrolled the toolbar away.
 * `100lvh - 100svh` is exactly that strip, and it is 0 wherever there is no
 * toolbar, so desktop keeps the padding as typed. Constant rather than
 * `100dvh`-based on purpose: a padding that tracked the toolbar would reflow
 * the card while it was being scrolled through.
 */
const TOOLBAR_SAFE = (px: number) => `calc(${px}px + (100lvh - 100svh))`;

/* ---------- Card ---------- */

const CardWrapper = styled.article<{ $background?: string }>`
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  /* 100vh rather than 100svh: on a phone vh is the toolbar-hidden viewport, so
     the card is never shorter than the window and two cards can never show at
     once. What the toolbar would cover is given back as padding below. */
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
    padding: ${spacing[1500]}px ${spacing[300]}px ${TOOLBAR_SAFE(spacing[300])};
  }

  ${media.down('m')} {
    padding: ${spacing[1250]}px ${spacing[200]}px ${TOOLBAR_SAFE(spacing[200])};
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

/**
 * A column's size and place differ per card, per column and per breakpoint, but
 * the shape of the rule never does. The numbers therefore ride in as custom
 * properties set inline (`columnVars` below) and the rule is written once, so
 * every column on the page shares one class instead of generating its own copy
 * at three breakpoints plus hover.
 */
/**
 * Each breakpoint reads its own properties. It cannot alias them — redefining
 * `--col-w` inside a media query would lose to the inline style that sets it,
 * since an inline declaration beats any rule in a stylesheet.
 */
const columnSize = (suffix: string) => css`
  width: calc(var(--col-w${suffix}) * var(--u));
  gap: calc(var(--col-gap${suffix}) * var(--u));
`;

const PROJECTION: Record<IsometricGrid['axis'], string> = {
  'down-right': 'rotate(-30deg) skewX(30deg) scaleY(0.866)',
  'down-left': 'rotate(30deg) skewX(-30deg) scaleY(0.866)',
};

/** Centre the column on a frame point, then project it. */
const isometricAt = (suffix: string) =>
  `translate(calc(var(--col-x${suffix}) * var(--u)), calc(var(--col-y${suffix}) * var(--u)))
   translate(-50%, -50%) var(--col-projection)`;

const IsometricColumnBox = styled.div`
  ${columnBase}
  ${columnSize('')}
  transform: ${isometricAt('')};

  ${onDesktopHover(css`
    transform: ${isometricAt('-hover')};
  `)}

  ${media.down('xl')} {
    ${columnSize('-tablet')}
    transform: ${isometricAt('-tablet')};
  }

  ${media.down('m')} {
    ${columnSize('-mobile')}
    transform: ${isometricAt('-mobile')};
  }
`;

/** The inline values an isometric column needs. */
const isometricVars = (grid: IsometricGrid, column: IsometricColumn) =>
  ({
    '--col-projection': PROJECTION[grid.axis],
    '--col-w': column.width * grid.scale.desktop,
    '--col-gap': ISOMETRIC_GAP * grid.scale.desktop,
    '--col-x': column.center.desktop[0],
    '--col-y': column.center.desktop[1],
    '--col-x-hover': column.center.hover[0],
    '--col-y-hover': column.center.hover[1],
    '--col-w-tablet': column.width * grid.scale.tablet,
    '--col-gap-tablet': ISOMETRIC_GAP * grid.scale.tablet,
    '--col-x-tablet': column.center.tablet[0],
    '--col-y-tablet': column.center.tablet[1],
    '--col-w-mobile': column.width * grid.scale.mobile,
    '--col-gap-mobile': ISOMETRIC_GAP * grid.scale.mobile,
    '--col-x-mobile': column.center.mobile[0],
    '--col-y-mobile': column.center.mobile[1],
  }) as React.CSSProperties;

const flatAt = (suffix: string) =>
  `translate(calc(var(--col-x${suffix}) * var(--u)), calc(var(--col-y${suffix}) * var(--u)))`;

const FlatColumnBox = styled.div`
  ${columnBase}
  ${columnSize('')}
  transform: ${flatAt('')};

  ${onDesktopHover(css`
    transform: ${flatAt('-hover')};
  `)}

  ${media.down('xl')} {
    ${columnSize('-tablet')}
    transform: ${flatAt('-tablet')};
  }

  ${media.down('m')} {
    ${columnSize('-mobile')}
    transform: ${flatAt('-mobile')};
  }
`;

/** The inline values a flat column needs. Its hover only moves vertically. */
const flatVars = ({ frame, hoverTop }: FlatColumn) =>
  ({
    '--col-w': frame.desktop.width,
    '--col-gap': frame.desktop.width * FLAT_GAP_RATIO,
    '--col-x': frame.desktop.left,
    '--col-y': frame.desktop.top,
    '--col-x-hover': frame.desktop.left,
    '--col-y-hover': hoverTop,
    '--col-w-tablet': frame.tablet.width,
    '--col-gap-tablet': frame.tablet.width * FLAT_GAP_RATIO,
    '--col-x-tablet': frame.tablet.left,
    '--col-y-tablet': frame.tablet.top,
    '--col-w-mobile': frame.mobile.width,
    '--col-gap-mobile': frame.mobile.width * FLAT_GAP_RATIO,
    '--col-x-mobile': frame.mobile.left,
    '--col-y-mobile': frame.mobile.top,
  }) as React.CSSProperties;

/**
 * The aspect ratio rides in on a custom property rather than being baked into
 * the class. Every distinct ratio used to generate its own copy of this rule —
 * eighteen of them on the homepage — and they are identical but for one number.
 */
const Tile = styled.div<{ $only?: GridScreen }>`
  position: relative;
  flex-shrink: 0;
  width: 100%;
  aspect-ratio: var(--tile-aspect);
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
    <Tile
      key={i}
      $only={image.only}
      style={{ '--tile-aspect': image.aspect } as React.CSSProperties}
    >
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
            <IsometricColumnBox key={i} style={isometricVars(grid, column)}>
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
            <FlatColumnBox key={i} style={flatVars(column)}>
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
  project: FeaturedProject;
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
      grid={project.card.grid}
      href={`/projects/${project.slug}`}
      cta={t('viewCase')}
      ctaFill={project.card.ctaFill}
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
