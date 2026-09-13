'use client';

import { useLayoutEffect, useRef } from 'react';
import styled, { css } from 'styled-components';
import Link from 'next/link';
import Image from 'next/image';
import { spacing } from '@/styles/tokens/spacing';
import { neutrals, accents } from '@/styles/tokens/colors';
import { fontSize, lineHeight, fontWeight, letterSpacing, fontFamily } from '@/styles/tokens/typography';
import { breakpoints } from '@/styles/tokens/breakpoints';
import { grid } from '@/styles/tokens/grid';
import { media } from '@/styles/media';
import { duration, easing } from '@/styles/tokens/motion';

/*
 * Figma: Footer — Desktop 1920 (2670:10716), Desktop 1280 (2670:11420),
 * Tablet 1024 (2670:11742), Tablet 768 (2670:12063), Mobile 480 (2670:12384),
 * Mobile 320 (2670:12704).
 *
 * Two arrangements of the same elements:
 *  - ≥1024: the name runs vertically on the left, each word exactly as tall as
 *    the link column beside it; the portrait sits in the bottom-right corner.
 *  - <1024: links, then "Designer × Engineer", STEPAN and TORCHYAN each exactly
 *    as wide as the container, then the copyright. The portrait sits behind the
 *    links and ends where STEPAN begins.
 */

const LINK_TRANSITION = `${duration.slower} ${easing.spring}`;

/**
 * Ink bounds of each word at font-size 100 in Gilroy (canvas `measureText`
 * actualBoundingBox*): `start`/`end` are where the ink begins and ends along
 * the baseline, `ascent`/`descent` how far it reaches above and below it. The
 * SVG viewBox is cropped to exactly this box, so a word can be sized to a
 * length and still line up with its neighbours ink-to-ink, as in the design.
 * Re-measure if the font files or weights change.
 */
const NAME_WORDS = {
  stepan: { text: 'STEPAN', weight: fontWeight.black, start: 1.8, end: 346.2, ascent: 71.5, descent: 1.5 },
  torchyan: { text: 'TORCHYAN', weight: fontWeight.black, start: 1, end: 513.1, ascent: 71.5, descent: 1.5 },
  role: { text: 'Designer × Engineer', weight: fontWeight.medium, start: 7.5, end: 903.2, ascent: 70.8, descent: 21.3 },
} as const;

type NameWordMetrics = (typeof NAME_WORDS)[keyof typeof NAME_WORDS];

/** Word length on desktop — the link column's height, written by useNameLength. */
const NAME_LENGTH = 'var(--footer-name-length, 622px)';

/** Portrait master: public/footer/stepan-wireframe.webp (trimmed @2x export). */
const PORTRAIT = { src: '/footer/stepan-wireframe.webp', width: 1379, height: 1433 } as const;

const PRIMARY_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Projects', href: '/projects' },
  { label: 'Case Studies', href: '/case-studies' },
  { label: 'Playground', href: '/#what-i-build' },
  { label: 'Contact', href: '/#contact' },
];

const SOCIAL_LINKS = [
  { label: 'Instagram', href: 'https://instagram.com' },
  { label: 'Linkedin', href: 'https://linkedin.com' },
];

const CONTACT_LINKS = [
  { label: 'hello@torchyan.com', href: 'mailto:hello@torchyan.com' },
  { label: '+374 95 334 719', href: 'tel:+37495334719' },
];

/* ─── Layout ─────────────────────────────────────────────────────────────── */

const FooterEl = styled.footer`
  position: relative;
  overflow: hidden;
  /* Transparent so the lower-page glow (LowerPageBackground) runs to the bottom of the footer. */
  background: transparent;
  padding: ${spacing[1000]}px 0;

  ${media.down('l')} {
    padding-bottom: ${spacing[300]}px;
  }

  ${media.down('m')} {
    padding-top: ${spacing[500]}px;
  }
`;

const Inner = styled.div`
  /* Own stacking context: the portrait's negative z-index keeps it behind the text. */
  isolation: isolate;
  display: flex;
  flex-direction: column;
  max-width: ${grid.maxWidth}px;
  margin: 0 auto;
  padding: 0 ${spacing[400]}px;

  ${media.up('l')} {
    flex-direction: row;
    align-items: flex-start;
  }
`;

/** Desktop: the three vertical words side by side. Below 1024 its children join the stacked flow. */
const NameBlock = styled.div`
  ${media.up('l')} {
    display: flex;
    flex: none;
    align-items: flex-start;
    /* Zero height so the words (sized from the column's height) never feed back into it. */
    height: 0;
    margin-right: ${spacing[1000]}px;
  }

  ${media.up('xxl')} {
    margin-right: ${spacing[2000]}px;
  }

  ${media.down('l')} {
    display: contents;
  }
`;

const WordSlot = styled.div`
  display: flex;
  flex: none;
`;

const StepanSlot = styled(WordSlot)`
  color: ${accents.primary};

  ${media.down('l')} {
    order: 3;
    margin-top: 35px;
  }

  ${media.down('s')} {
    margin-top: 19px;
  }
`;

const TorchyanSlot = styled(WordSlot)`
  color: ${accents.primary};

  /* The STEPAN→TORCHYAN gap grows with the words. */
  ${media.up('l')} {
    margin-left: calc(${spacing[100]}px + ${NAME_LENGTH} * 0.023);
  }

  ${media.down('l')} {
    order: 4;
    /* A vertical percentage margin resolves against the container's width — the word length. */
    margin-top: calc(${spacing[100]}px + 2.3%);
  }
`;

const RoleSlot = styled(WordSlot)`
  color: ${neutrals[500]};

  ${media.up('l')} {
    margin-left: 56px;
  }

  ${media.down('l')} {
    /* Containing block for the portrait on tablet / mobile. */
    position: relative;
    order: 2;
    margin-top: ${spacing[1000]}px;
  }

  ${media.down('s')} {
    margin-top: ${spacing[500]}px;
  }
`;

const HorizontalWord = styled.svg`
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
  fill: currentColor;
  font-family: ${fontFamily.display};

  ${media.up('l')} {
    display: none;
  }
`;

const VerticalWord = styled.svg`
  display: block;
  width: auto;
  height: ${NAME_LENGTH};
  overflow: visible;
  fill: currentColor;
  font-family: ${fontFamily.display};

  ${media.down('l')} {
    display: none;
  }
`;

const Column = styled.div`
  ${media.up('l')} {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: ${spacing[600]}px;
    min-width: 0;
  }

  ${media.up('xxl')} {
    gap: ${spacing[1000]}px;
  }

  ${media.down('l')} {
    display: contents;
  }
`;

const Groups = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[600]}px;

  ${media.up('xxl')} {
    gap: ${spacing[1000]}px;
  }

  ${media.down('l')} {
    order: 1;
  }

  ${media.down('s')} {
    gap: ${spacing[400]}px;
  }
`;

const Group = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[200]}px;
  /* Reset for the <address> variant. */
  font-style: normal;

  ${media.down('s')} {
    gap: ${spacing[150]}px;
  }
`;

const GroupTitle = styled.h2`
  margin: 0;
  padding-left: ${spacing[150]}px;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.body.l}px;
  line-height: ${lineHeight.body.l}px;
  letter-spacing: ${letterSpacing.xs}px;
  color: ${neutrals[100]};

  ${media.down('s')} {
    font-weight: ${fontWeight.medium};
    font-size: ${fontSize.body.xl}px;
    line-height: ${lineHeight.body.xl}px;
    color: ${neutrals[500]};
  }
`;

const LinkList = styled.ul<{ $stacked?: boolean }>`
  display: flex;
  flex-direction: ${(p) => (p.$stacked ? 'column' : 'row')};
  flex-wrap: wrap;
  align-items: flex-start;
  gap: ${spacing[200]}px ${spacing[500]}px;
  margin: 0;
  padding: 0;
  list-style: none;

  /* Flex items, so the list item's own line box can't make a row taller than its link. */
  li {
    display: flex;
  }

  ${media.down('s')} {
    column-gap: ${spacing[300]}px;
  }
`;

const bracketLink = css`
  display: inline-flex;
  align-items: baseline;
  font-family: ${fontFamily.body};
  font-weight: ${fontWeight.regular};
  font-size: ${fontSize.heading.m}px;
  line-height: ${lineHeight.heading.m}px;
  letter-spacing: ${letterSpacing.xs}px;
  color: ${neutrals[100]};
  text-decoration: none;
  white-space: nowrap;
  transition: color ${duration.normal} ${easing.out};

  &::before,
  &::after {
    display: inline-block;
    transition: transform ${LINK_TRANSITION};
  }

  &::before {
    content: '[';
    margin-right: 0.15em;
  }

  &::after {
    content: ']';
    margin-left: 0.15em;
  }

  &:focus-visible {
    outline: 2px solid ${accents.primary};
    outline-offset: 4px;
    border-radius: 4px;
  }

  ${media.hover} {
    &:hover {
      color: ${accents.primary};

      &::before {
        transform: translateX(-50%);
      }

      &::after {
        transform: translateX(50%);
      }
    }
  }

  ${media.down('l')} {
    font-size: ${fontSize.heading.s}px;
    line-height: ${lineHeight.heading.s}px;
  }

  ${media.down('s')} {
    font-size: ${fontSize.body.l}px;
    line-height: ${lineHeight.body.l}px;
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
  padding-left: ${spacing[150]}px;
  font-family: ${fontFamily.body};
  font-weight: ${fontWeight.regular};
  font-size: ${fontSize.heading.m}px;
  line-height: ${lineHeight.heading.m}px;
  color: ${neutrals[100]};

  img {
    flex: none;
    width: 15px;
    height: 26px;
  }

  ${media.down('s')} {
    gap: ${spacing[150]}px;
    font-size: ${fontSize.body.xl}px;
    line-height: ${lineHeight.body.xl}px;

    img {
      width: 12px;
      height: 21px;
    }
  }
`;

const Copyright = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${spacing[300]}px;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.body.xl}px;
  line-height: ${lineHeight.body.xl}px;
  letter-spacing: ${letterSpacing.xs}px;
  color: ${neutrals[100]};

  p {
    margin: 0;
  }

  ${media.up('l')} {
    padding-left: ${spacing[150]}px;
  }

  ${media.down('l')} {
    order: 5;
    margin-top: ${spacing[1000]}px;
  }

  ${media.down('s')} {
    flex-direction: column;
    gap: ${spacing[150]}px;
    margin-top: ${spacing[500]}px;
    font-weight: ${fontWeight.medium};
    font-size: ${fontSize.body.m}px;
    line-height: ${lineHeight.body.m}px;
    color: ${neutrals[500]};
  }
`;

const Portrait = styled(Image)`
  position: absolute;
  z-index: -1;
  /* The global img reset caps images at their container; this one is meant to spill past it. */
  max-width: none;
  height: auto;
  pointer-events: none;
  user-select: none;

  /* Desktop: anchored to the footer's bottom-right corner. */
  ${media.up('l')} {
    bottom: 0;
    width: 501px;
    /* 1024 → 1280 frames: from 69px past the edge to 34px inside it. */
    right: calc((100% - ${breakpoints.l}px) * 0.4023 - 69px);
  }

  ${media.up('xxl')} {
    width: 690px;
    right: 0;
  }

  /* Tablet / mobile: positioned against the "Designer × Engineer" slot, ending where STEPAN begins. */
  ${media.down('l')} {
    bottom: -35px;
    width: 501px;
    right: -10px;
  }

  ${media.down('m')} {
    /* 480 → 768 frames (container 416 → 704px wide): from 113px past the container's edge to 10px. */
    right: calc((100% - 416px) * 0.3583 - 113px);
  }

  ${media.down('s')} {
    bottom: -19px;
    width: 316px;
    right: -82px;
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

/* ─── Pieces ─────────────────────────────────────────────────────────────── */

function NameWord({ word }: { word: NameWordMetrics }) {
  const { text, weight, start, end, ascent, descent } = word;
  const length = end - start;
  const thickness = ascent + descent;

  return (
    <>
      <HorizontalWord viewBox={`${start} ${-ascent} ${length} ${thickness}`} aria-hidden focusable="false">
        <text fontSize={100} fontWeight={weight}>
          {text}
        </text>
      </HorizontalWord>
      {/* Rotated to read bottom-to-top, letter tops facing left. */}
      <VerticalWord viewBox={`${-ascent} ${-end} ${thickness} ${length}`} aria-hidden focusable="false">
        <text fontSize={100} fontWeight={weight} transform="rotate(-90)">
          {text}
        </text>
      </VerticalWord>
    </>
  );
}

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
    const desktop = window.matchMedia(`(min-width: ${breakpoints.l}px)`);
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

  return (
    <FooterEl id="site-footer">
      <Inner ref={innerRef}>
        <VisuallyHiddenText>Stepan Torchyan — Designer × Engineer</VisuallyHiddenText>

        <NameBlock>
          <StepanSlot>
            <NameWord word={NAME_WORDS.stepan} />
          </StepanSlot>
          <TorchyanSlot>
            <NameWord word={NAME_WORDS.torchyan} />
          </TorchyanSlot>
          <RoleSlot>
            <NameWord word={NAME_WORDS.role} />
            <Portrait
              src={PORTRAIT.src}
              width={PORTRAIT.width}
              height={PORTRAIT.height}
              alt=""
              sizes="(min-width: 1440px) 690px, (min-width: 480px) 501px, 316px"
              loading="lazy"
              draggable={false}
            />
          </RoleSlot>
        </NameBlock>

        <Column ref={columnRef}>
          <Groups>
            <Group as="nav" aria-labelledby="footer-primary">
              <GroupTitle id="footer-primary">Primary</GroupTitle>
              <LinkList>
                {PRIMARY_LINKS.map((item) => (
                  <li key={item.label}>
                    <InternalLink href={item.href}>{item.label}</InternalLink>
                  </li>
                ))}
              </LinkList>
            </Group>

            <Group as="nav" aria-labelledby="footer-social">
              <GroupTitle id="footer-social">Social</GroupTitle>
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
              <GroupTitle as="p">Contacts</GroupTitle>
              <LinkList $stacked>
                {CONTACT_LINKS.map((item) => (
                  <li key={item.label}>
                    <ExternalLink href={item.href}>{item.label}</ExternalLink>
                  </li>
                ))}
              </LinkList>
            </Group>

            <Location>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/vectors/location.svg" alt="" aria-hidden />
              <span>Yerevan, Armenia</span>
            </Location>
          </Groups>

          <Copyright>
            <p>© Copyright {new Date().getFullYear()} Torchyan</p>
            <p>All Rights Reserved</p>
          </Copyright>
        </Column>
      </Inner>
    </FooterEl>
  );
}
