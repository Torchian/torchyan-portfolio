'use client';

/* eslint-disable @next/next/no-img-element */
import { useLayoutEffect, useRef } from 'react';
import styled, { css } from 'styled-components';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { spacing } from '@/styles/tokens/spacing';
import { neutrals, accents } from '@/styles/tokens/colors';
import { fontSize, lineHeight, fontWeight, letterSpacing, fontFamily } from '@/styles/tokens/typography';
import { breakpoints } from '@/styles/tokens/breakpoints';
import { grid } from '@/styles/tokens/grid';
import { media, mediaQueries } from '@/styles/media';
import { duration, easing } from '@/styles/tokens/motion';
import { useTranslations } from 'next-intl';

/*
 * Figma: Footer — Desktop 1920 (2670:10716), Desktop 1280 (2670:11420),
 * Tablet 1024 (2670:11742), Tablet 768 (2670:12063), Mobile 480 (2670:12384),
 * Mobile 320 (2670:12704).
 *
 * Two arrangements of the same elements:
 *  - 1024 frame and up (from 769px): the name runs vertically on the left, as tall as the link column
 *    beside it.
 *  - 768 frame and below (up to 768px): "Designer × Engineer", STEPAN and TORCHYAN at the container's
 *    full width, then the links, then the copyright.
 * The wireframe portrait sits in the footer's bottom corner at 30%, hard-light blended, behind the text.
 */

/** Word length on desktop — the link column's height, written by useNameLength. */
const NAME_LENGTH = 'var(--footer-name-length, 624px)';

/**
 * The name artwork is Figma's outlined lettering. Every dimension is a fixed
 * fraction of the words' shared length (the same at all six frames):
 * STEPAN 160.013 / 752 thick, a 22.698 / 752 gap, TORCHYAN 107.567 / 752.
 */
const NAME_ART = {
  stepan: { src: '/footer/name-stepan.svg', width: 752, height: 160.013 },
  torchyan: { src: '/footer/name-torchyan.svg', width: 751.996, height: 107.567 },
  role: { src: '/footer/name-designer-engineer.svg', width: 77.0202, height: 752 },
} as const;
const NAME_GAP = 22.698 / 752;
const NAME_GROUP_THICKNESS = (160.013 + 22.698 + 107.567) / 752;

/** Portrait: Figma's grey wireframe character. Positioned by its square, from the footer's bottom-right, as in each frame. */
const PORTRAIT = { src: '/footer/portrait-mesh.webp', size: 1024 } as const;

const LINK_TRANSITION = `${duration.slower} ${easing.spring}`;

const PRIMARY_LINKS = [
  { key: 'home', href: '/' },
  { key: 'about', href: '/about' },
  { key: 'projects', href: '/projects' },
  { key: 'contact', href: '/#contact' },
] as const;

const SOCIAL_LINKS = [
  { label: 'Instagram', href: 'https://www.instagram.com/torchian_/' },
  { label: 'Linkedin', href: 'https://www.linkedin.com/in/torchian/' },
];

const CONTACT_LINKS = [
  { label: 'hello@torchyan.com', href: 'mailto:hello@torchyan.com' },
  { label: '+374 95 334 719', href: 'tel:+37495334719' },
];

/* ─── Layout ─────────────────────────────────────────────────────────────── */

const FooterEl = styled.footer`
  position: relative;
  overflow: hidden;
  /* Stacking context with the background in it: the portrait blends with the footer and stays behind the text. */
  isolation: isolate;
  /* Query container: the desktop portrait interpolates between frames on the footer's width. */
  container-type: inline-size;
  /* Figma: dark/background/dark. Solid, so the lower-page glow stops at the footer's top edge. */
  background: ${neutrals[900]};
  padding: ${spacing[1000]}px 0;

  ${media.between('l', 'xl')} {
    padding: ${spacing[800]}px 0;
  }

  ${media.down('l')} {
    padding: ${spacing[800]}px 0 ${spacing[400]}px;
  }

  ${media.down('m')} {
    padding-bottom: ${spacing[300]}px;
  }
`;

const Inner = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[800]}px;
  /* 1440px of content in the 1920 frame; 32px sides in the 1440 frame. */
  max-width: ${grid.maxWidth + 2 * spacing[400]}px;
  margin: 0 auto;
  padding: 0 ${spacing[400]}px;

  ${media.between('l', 'xl')} {
    padding: 0 ${spacing[300]}px;
  }

  ${media.down('m')} {
    gap: ${spacing[500]}px;
    padding: 0 ${spacing[200]}px;
  }

  ${media.up('l')} {
    flex-direction: row;
    align-items: flex-start;
    gap: ${spacing[1000]}px;
  }

  ${media.up('xxl')} {
    gap: ${spacing[2000]}px;
  }
`;

const NameBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[400]}px;

  ${media.down('m')} {
    gap: ${spacing[300]}px;
  }

  ${media.up('l')} {
    flex: none;
    flex-direction: row;
    align-items: flex-start;
    gap: ${spacing[500]}px;
    /* Zero height so the words (sized from the column's height) never feed back into it. */
    height: 0;
  }

  ${media.up('xl')} {
    gap: ${spacing[800]}px;
  }
`;

/** STEPAN + TORCHYAN. On desktop the pair is laid out horizontally, then turned to read bottom-to-top. */
const NameGroup = styled.div`
  order: 2;

  ${media.up('l')} {
    display: flex;
    flex: none;
    align-items: center;
    justify-content: center;
    order: 0;
    width: calc(${NAME_LENGTH} * ${NAME_GROUP_THICKNESS.toFixed(6)});
    height: ${NAME_LENGTH};
  }
`;

const NameGroupArt = styled.div`
  img {
    display: block;
    width: 100%;
    height: auto;
  }

  img + img {
    /* Percentage margins resolve against the width — the words' length. */
    margin-top: ${(NAME_GAP * 100).toFixed(4)}%;
  }

  ${media.up('l')} {
    flex: none;
    width: ${NAME_LENGTH};
    transform: rotate(-90deg);
  }
`;

/** "Designer × Engineer" — exported vertical; turned upright on tablet / mobile. */
const RoleSlot = styled.div`
  order: 1;

  img {
    display: block;
  }

  ${media.down('l')} {
    position: relative;
    aspect-ratio: ${NAME_ART.role.height} / ${NAME_ART.role.width};
    container-type: inline-size;

    img {
      position: absolute;
      top: 50%;
      left: 50%;
      width: auto;
      max-width: none;
      height: 100cqw;
      transform: translate(-50%, -50%) rotate(90deg);
    }
  }

  ${media.up('l')} {
    flex: none;

    img {
      width: auto;
      height: ${NAME_LENGTH};
    }
  }
`;

const Portrait = styled(Image)`
  position: absolute;
  z-index: -1;
  /* Wider than the footer in places by design; override the global img max-width. */
  max-width: none;
  height: auto;
  opacity: 0.3;
  mix-blend-mode: hard-light;
  pointer-events: none;
  user-select: none;

  /* The 768 frame (481–768px). */
  right: -94px;
  bottom: -62.66px;
  width: 603px;

  /* The 480 frame (up to 480px). */
  ${media.down('m')} {
    right: -149px;
    bottom: -19.63px;
    width: 527px;
  }

  /* The 1024 frame (769–1024px). */
  ${media.up('l')} {
    right: -165px;
    bottom: -68.89px;
  }

  /* The 1440 frame (1025–1440px). */
  ${media.up('xl')} {
    right: -158px;
    bottom: -23.5px;
  }

  /* Interpolated from the 1440 frame to the 1920 frame (cqw = footer width), then held. */
  ${media.up('xxxl')} {
    right: max(-163px, min(-158px, calc(-158px - (100cqw - ${breakpoints.xxl}px) * 0.010417)));
    bottom: max(-88.5px, min(-23.5px, calc(-23.5px - (100cqw - ${breakpoints.xxl}px) * 0.135417)));
    width: min(699px, max(603px, calc(603px + (100cqw - ${breakpoints.xxl}px) * 0.2)));
  }
`;

const Column = styled.div`
  display: contents;

  ${media.up('l')} {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: ${spacing[500]}px;
    min-width: 0;
    padding-left: ${spacing[150]}px;
  }
`;

const Groups = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[500]}px;
  order: 1;
  padding-left: ${spacing[150]}px;

  /* Desktop: the groups join the column's own gap, alongside the copyright. */
  ${media.up('l')} {
    display: contents;
  }
`;

const Group = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${spacing[200]}px;
  /* Reset for the <address> variant. */
  font-style: normal;
`;

const GroupTitle = styled.h2`
  margin: 0;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.body.l}px;
  line-height: ${lineHeight.body.l}px;
  letter-spacing: ${letterSpacing.m}px;
  color: ${neutrals[100]};
`;

const LinkList = styled.ul<{ $stacked?: boolean }>`
  display: flex;
  flex-direction: ${(p) => (p.$stacked ? 'column' : 'row')};
  flex-wrap: wrap;
  align-items: flex-start;
  gap: ${spacing[200]}px ${spacing[800]}px;
  margin: 0;
  padding: 0;
  list-style: none;

  /* Flex items, so the list item's own line box can't make a row taller than its link. */
  li {
    display: flex;
  }
`;

/** Figma Navigation Link Hover / Active Tablet: the word stays, the brackets turn green and open out by 6px. */
const bracketsOpen = css`
  &::before,
  &::after {
    color: ${accents.primary};
  }

  &::before {
    transform: translateX(calc(-50% - 6px));
  }

  &::after {
    transform: translateX(calc(50% + 6px)) scaleX(-1);
  }
`;

/** Figma "Navigation Link" (2510:1115): the word, with brackets hanging outside it. */
const bracketLink = css`
  --bracket-offset: 7.5px;
  position: relative;
  display: inline-flex;
  align-items: center;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.medium};
  font-size: ${fontSize.heading.m}px;
  line-height: ${lineHeight.heading.m}px;
  letter-spacing: ${letterSpacing.xs}px;
  color: ${neutrals[100]};
  text-decoration: none;
  white-space: nowrap;
  transition: color ${duration.normal} ${easing.out};

  &::before,
  &::after {
    /* Decorative — empty alt text keeps screen readers from announcing the brackets. */
    content: '[' / '';
    position: absolute;
    top: 0;
    transition:
      transform ${LINK_TRANSITION},
      color ${duration.normal} ${easing.out};
  }

  &::before {
    left: calc(-1 * var(--bracket-offset));
    transform: translateX(-50%);
  }

  /* The closing bracket is the opening one mirrored, as in the design. */
  &::after {
    right: calc(-1 * var(--bracket-offset));
    transform: translateX(50%) scaleX(-1);
  }

  ${media.hover} {
    &:hover {
      ${bracketsOpen}
    }
  }

  /* Pressed (the tablet "Active" state) and keyboard focus show the same open brackets. */
  &:active {
    ${bracketsOpen}
  }

  &:focus-visible {
    outline: 2px solid ${accents.primary};
    outline-offset: 4px;
    border-radius: 4px;
    ${bracketsOpen}
  }

  ${media.down('l')} {
    --bracket-offset: 8px;
    font-weight: ${fontWeight.semibold};
    font-size: ${fontSize.heading.s}px;
    line-height: ${lineHeight.heading.s}px;
  }
`;

const InternalLink = styled(Link)`
  ${bracketLink}
`;

const ExternalLink = styled.a`
  ${bracketLink}
`;

const Location = styled.p`
  display: flex;
  align-items: center;
  gap: ${spacing[300]}px;
  margin: 0;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.medium};
  font-size: ${fontSize.heading.m}px;
  line-height: ${lineHeight.heading.m}px;
  letter-spacing: ${letterSpacing.xs}px;
  color: ${neutrals[100]};

  img {
    flex: none;
    /* A 13×24 slot; the pin's stroke bleeds 0.6px past it, as in the design. */
    width: 14.2px;
    height: 25.2px;
    margin: -0.6px;
  }

  ${media.down('m')} {
    gap: ${spacing[200]}px;
    font-weight: ${fontWeight.semibold};
    font-size: ${fontSize.heading.s}px;
    line-height: ${lineHeight.heading.s}px;
  }
`;

const Copyright = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${spacing[300]}px;
  order: 3;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.body.xl}px;
  line-height: ${lineHeight.body.xl}px;
  letter-spacing: ${letterSpacing.s}px;
  color: ${neutrals[100]};

  p {
    margin: 0;
    white-space: nowrap;
  }

  ${media.up('l')} {
    justify-content: flex-start;
    gap: ${spacing[800]}px;
  }
`;

const VisuallyHiddenText = styled.p`
  position: absolute;
  width: 1px;
  height: 1px;
  margin: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
`;

/* ─── Behaviour ──────────────────────────────────────────────────────────── */

/**
 * Desktop: makes the vertical name exactly as tall as the link column by
 * writing the column's height to `--footer-name-length`. The column's width —
 * and so how its links wrap — depends on how wide the name is, which depends on
 * that height, so a width where the links flip between two wraps could
 * ping-pong; once a height repeats at the same width, settle on the taller one.
 */
function useNameLength(
  innerRef: React.RefObject<HTMLDivElement | null>,
  columnRef: React.RefObject<HTMLDivElement | null>,
) {
  useLayoutEffect(() => {
    const inner = innerRef.current;
    const column = columnRef.current;
    if (!inner || !column) return;
    const desktop = window.matchMedia(mediaQueries.up('l'));
    let width = 0;
    let seen: number[] = [];

    const update = () => {
      if (!desktop.matches) {
        inner.style.removeProperty('--footer-name-length');
        seen = [];
        return;
      }
      if (inner.clientWidth !== width) {
        width = inner.clientWidth;
        seen = [];
      }
      const height = Math.round(column.getBoundingClientRect().height);
      if (height === 0) return;
      const length = seen.includes(height) ? Math.max(height, ...seen) : height;
      if (!seen.includes(height)) seen.push(height);
      inner.style.setProperty('--footer-name-length', `${length}px`);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(inner);
    observer.observe(column);
    return () => observer.disconnect();
  }, [innerRef, columnRef]);
}

export function Footer() {
  const innerRef = useRef<HTMLDivElement>(null);
  const columnRef = useRef<HTMLDivElement>(null);
  useNameLength(innerRef, columnRef);
  const t = useTranslations('footer');
  const tLinks = useTranslations('footer.links');

  return (
    <FooterEl id="site-footer">
      <Inner ref={innerRef}>
        <VisuallyHiddenText>{t('srName')}</VisuallyHiddenText>

        <NameBlock aria-hidden>
          <NameGroup>
            <NameGroupArt>
              <img {...NAME_ART.stepan} alt="" />
              <img {...NAME_ART.torchyan} alt="" />
            </NameGroupArt>
            <Portrait
              src={PORTRAIT.src}
              width={PORTRAIT.size}
              height={PORTRAIT.size}
              alt=""
              sizes="(min-width: 1441px) 699px, (min-width: 481px) 603px, 527px"
              loading="lazy"
              draggable={false}
            />
          </NameGroup>
          <RoleSlot>
            <img {...NAME_ART.role} alt="" />
          </RoleSlot>
        </NameBlock>

        <Column ref={columnRef}>
          <Groups>
            <Group as="nav" aria-labelledby="footer-primary">
              <GroupTitle id="footer-primary">{t('primary')}</GroupTitle>
              <LinkList>
                {PRIMARY_LINKS.map((item) => (
                  <li key={item.key}>
                    <InternalLink href={item.href}>{tLinks(item.key)}</InternalLink>
                  </li>
                ))}
              </LinkList>
            </Group>

            <Group as="nav" aria-labelledby="footer-social">
              <GroupTitle id="footer-social">{t('social')}</GroupTitle>
              <LinkList $stacked>
                {SOCIAL_LINKS.map((item) => (
                  <li key={item.label}>
                    <ExternalLink href={item.href} target="_blank" rel="noopener noreferrer">
                      {item.label}
                    </ExternalLink>
                  </li>
                ))}
              </LinkList>
            </Group>

            <Group as="address">
              <GroupTitle as="p">{t('contacts')}</GroupTitle>
              <LinkList $stacked>
                {CONTACT_LINKS.map((item) => (
                  <li key={item.label}>
                    <ExternalLink href={item.href}>{item.label}</ExternalLink>
                  </li>
                ))}
              </LinkList>
            </Group>

            <Location>
              <img src="/footer/location-pin.svg" alt="" aria-hidden />
              <span>{t('location')}</span>
            </Location>
          </Groups>

          <Copyright>
            <p>{t('copyright', { year: String(new Date().getFullYear()) })}</p>
            <p>{t('rights')}</p>
          </Copyright>
        </Column>
      </Inner>
    </FooterEl>
  );
}
