'use client';

/* eslint-disable @next/next/no-img-element */
import { useLayoutEffect, useRef } from 'react';
import styled, { css } from 'styled-components';
import { Link } from '@/i18n/navigation';
import { spacing } from '@/styles/tokens/spacing';
import { neutrals, accents } from '@/styles/tokens/colors';
import { fontSize, lineHeight, fontWeight, letterSpacing, fontFamily } from '@/styles/tokens/typography';
import { grid } from '@/styles/tokens/grid';
import { media, mediaQueries } from '@/styles/media';
import { duration, easing } from '@/styles/tokens/motion';
import { useTranslations } from 'next-intl';

/*
 * Figma: Footer — Desktop 1920 (4037:14070), Tablet 1024 (4037:14206),
 * Mobile 480 (4037:14275). No separate frame exists for 481-768px; that range
 * takes the mobile numbers, same as the rest of the site's down('l') blocks.
 *
 * Two arrangements of the same elements:
 *  - 769px and up: the wordmark runs vertically on the left, turned on its
 *    side to read bottom-to-top, as tall as the link column beside it. The
 *    tagline stands beside it, upright already (its own artwork is drawn
 *    vertical) at the same height.
 *  - Up to 768px: the wordmark upright and the tagline under it (turned
 *    upright itself, since its artwork is vertical) at the container's full
 *    width, then the links, then the copyright.
 */

/** Word length on desktop — the link column's height, written by useNameLength. */
const NAME_LENGTH = 'var(--footer-name-length, 624px)';

/**
 * The logo, as two pieces of outlined lettering, each kept at its own native
 * aspect ratio (confirmed equal at all three Figma frames — the same artwork,
 * scaled): the wordmark is drawn horizontal, the tagline vertical. Below 769px
 * each stands in its own drawn orientation; at 769px and up the wordmark turns
 * onto its side to run the link column's height and the tagline, already
 * vertical, stands beside it unrotated.
 */
const WORDMARK = { src: '/footer/name-wordmark.svg', width: 540, height: 77.2426 } as const;
const TAGLINE = { src: '/footer/name-tagline.svg', width: 51, height: 540 } as const;
/** The same words laid out as a row, for the phone, where they sit under the wordmark. */
const TAGLINE_ROW = { src: '/footer/name-tagline-row.svg', width: 540, height: 51 } as const;

const LINK_TRANSITION = `${duration.slower} ${easing.spring}`;

const PRIMARY_LINKS = [
  { key: 'services', href: '/services' },
  { key: 'projects', href: '/work' },
  { key: 'about', href: '/about' },
  { key: 'startProject', href: '/start-a-project' },
  { key: 'contact', href: '/contact' },
  { key: 'privacy', href: '/privacy' },
] as const;

/** `channel` names the outbound_contact analytics event (src/lib/analytics/track.ts). */
const SOCIAL_LINKS = [
  { label: 'Instagram', href: 'https://www.instagram.com/torchian_/', channel: 'instagram' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/torchian/', channel: 'linkedin' },
];

const CONTACT_LINKS = [
  // On the site's own domain. It needs a forwarder in the registrar's DNS
  // before it receives anything — see docs/setup/domain-email-hosting.md.
  { label: 'hello@torchyan.design', href: 'mailto:hello@torchyan.design', channel: 'email' },
  { label: '+374 95 334 719', href: 'tel:+37495334719', channel: 'phone' },
];

/* ─── Layout ─────────────────────────────────────────────────────────────── */

const FooterEl = styled.footer`
  position: relative;
  overflow: hidden;
  /* Figma: dark/background/dark. Solid, so the lower-page glow stops at the footer's top edge. */
  background: ${neutrals[900]};
  padding: ${spacing[1000]}px 0;

  ${media.between('l', 'xl')} {
    padding: ${spacing[500]}px 0;
  }

  ${media.down('l')} {
    padding: ${spacing[500]}px 0 ${spacing[300]}px;
  }
`;

const Inner = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[500]}px;
  /* 1440px of content in the 1920 frame; 32px sides in the 1440 frame. */
  max-width: ${grid.maxWidth + 2 * spacing[400]}px;
  margin: 0 auto;
  padding: 0 ${spacing[400]}px;

  ${media.between('l', 'xl')} {
    padding: 0 ${spacing[300]}px;
  }

  ${media.down('m')} {
    padding: 0 ${spacing[200]}px;
  }

  ${media.up('l')} {
    flex-direction: row;
    align-items: flex-start;
    gap: ${spacing[600]}px;
  }

  ${media.up('xl')} {
    gap: ${spacing[1500]}px;
  }
`;

/**
 * Figma gives the wordmark-to-tagline gap as 24px at every frame it specifies
 * (mobile's stacked pair and desktop/tablet's side-by-side one alike), so it is
 * written once here rather than per breakpoint.
 */
const NameBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[300]}px;

  ${media.up('l')} {
    flex: none;
    flex-direction: row;
    align-items: flex-start;
    /* Zero height so the words (sized from the column's height) never feed back into it. */
    height: 0;
  }
`;

/**
 * TORCHYAN. Drawn horizontal — upright as the page's own full-width logo on a
 * phone, turned on its side at 769px and up to run the link column's height,
 * the same way the name always has.
 */
const Wordmark = styled.div`
  width: 100%;

  img {
    display: block;
    width: 100%;
    height: auto;
  }

  ${media.up('l')} {
    display: flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: calc(${NAME_LENGTH} * ${(WORDMARK.height / WORDMARK.width).toFixed(6)});
    height: ${NAME_LENGTH};

    > div {
      flex: none;
      width: ${NAME_LENGTH};
      transform: rotate(-90deg);
    }
  }
`;

/**
 * Digital Product Studio. Drawn vertical — the opposite of the wordmark, so it
 * stands upright already beside it at 769px and up. On a phone, where it sits
 * under the wordmark, a second file has the same words laid out as a row, shown
 * like the wordmark: full width, height from its own proportions.
 *
 * Nothing on the phone is turned or sized from a measured box. It used to be
 * (the upright file, turned, at a percentage of an aspect-ratio box), and iOS
 * Safari kept that size from the side-by-side layout after the screen turned
 * back from landscape: the words came back hundreds of pixels tall.
 */
const Tagline = styled.div`
  width: 100%;

  img {
    display: block;
    width: 100%;
    height: auto;
  }

  img:first-child {
    display: none;
  }

  ${media.up('l')} {
    flex: none;
    width: calc(${NAME_LENGTH} * ${(TAGLINE.width / TAGLINE.height).toFixed(6)});
    height: ${NAME_LENGTH};

    img:first-child {
      display: block;
      height: 100%;
    }

    img:last-child {
      display: none;
    }
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

/**
 * Figma keeps this gap at 40px whichever breakpoint's Input blocks it is
 * between — the same at the mobile frame as at the desktop one — so unlike
 * most of this file it takes no override at all.
 */
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

/** Also unchanged at every frame: a label to its links is always 16px. */
const Group = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${spacing[200]}px;
  /* Reset for the <address> variant. */
  font-style: normal;
`;

/** Figma keeps this one size — 16/20, SemiBold — at every frame; no override. */
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
  /* Figma's tablet and mobile frames agree on 16px row-gap, 48px column-gap;
     only the desktop frame widens the column-gap, to 64px, below. */
  gap: ${spacing[200]}px ${spacing[600]}px;
  margin: 0;
  padding: 0;
  list-style: none;

  ${media.up('xl')} {
    column-gap: ${spacing[800]}px;
  }

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

  ${media.down('m')} {
    --bracket-offset: 5.5px;
    font-weight: ${fontWeight.semibold};
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

  /* Tablet keeps the gap and the pin's box, but drops to SemiBold 24/32. */
  ${media.down('l')} {
    font-weight: ${fontWeight.semibold};
    font-size: ${fontSize.heading.s}px;
    line-height: ${lineHeight.heading.s}px;
  }

  ${media.down('m')} {
    gap: ${spacing[100]}px;
    font-size: ${fontSize.body.l}px;
    line-height: ${lineHeight.body.l}px;

    img {
      width: 9px;
      height: 16px;
      margin: 0;
    }
  }
`;

const Copyright = styled.div`
  display: flex;
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

  ${media.down('m')} {
    gap: ${spacing[200]}px;
    font-size: ${fontSize.body.m}px;
    line-height: ${lineHeight.body.m}px;

    /* The two halves were held on one line at a size that did not fit one, so
       the second ran off the right edge. Smaller, and free to wrap rather than
       be cut — which is what keeps it whole in a language with longer words. */
    p {
      white-space: normal;
    }
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
          <Wordmark>
            <div>
              <img {...WORDMARK} alt="" />
            </div>
          </Wordmark>
          <Tagline>
            <img {...TAGLINE} alt="" />
            <img {...TAGLINE_ROW} alt="" />
          </Tagline>
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
                    <ExternalLink
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-outbound={item.channel}
                    >
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
                    <ExternalLink href={item.href} data-outbound={item.channel}>
                      {item.label}
                    </ExternalLink>
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
          </Copyright>
        </Column>
      </Inner>
    </FooterEl>
  );
}
