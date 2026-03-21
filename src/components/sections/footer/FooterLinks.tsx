'use client';

import styled, { css } from 'styled-components';
import Link from 'next/link';
import { spacing } from '@/styles/tokens/spacing';
import { neutrals, accents } from '@/styles/tokens/colors';
import { fontSize, lineHeight, fontWeight, letterSpacing, fontFamily } from '@/styles/tokens/typography';
import { fluidFontSize, fluidLineHeight } from '@/styles/fluid';
import { media } from '@/styles/media';
import { duration, easing } from '@/styles/tokens/motion';

export const LinkGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${spacing[150]}px;

  ${media.down('m')} {
    align-items: center;
  }
`;

export const GroupTitle = styled.span`
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.body.l}px;
  line-height: ${lineHeight.body.l}px;
  letter-spacing: ${letterSpacing.xs}px;
  color: ${neutrals[700]};
`;

const LinksRow = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: ${spacing[200]}px ${spacing[800]}px;

  ${media.down('m')} {
    justify-content: center;
  }
`;

const bracketLinkStyles = css`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fluidFontSize.heading.s};
  line-height: ${fluidLineHeight.heading.s};
  color: ${neutrals[100]};
  text-decoration: none;
  padding: ${spacing[100]}px ${spacing[100]}px;
  min-height: 44px;

  &::before {
    content: '[';
    position: absolute;
    left: -${spacing[100]}px;
    transition: transform ${duration.slower} ${easing.spring};
  }

  &::after {
    content: ']';
    position: absolute;
    right: -${spacing[100]}px;
    transition: transform ${duration.slower} ${easing.spring};
  }

  &:hover {
    color: ${accents.primary};

    &::before {
      transform: translateX(-50%);
    }

    &::after {
      transform: translateX(50%);
    }
  }
`;

const BracketLink = styled(Link)`${bracketLinkStyles}`;
export const BracketLinkAnchor = styled.a`${bracketLinkStyles}`;

const PRIMARY_LINKS = [
  { label: 'Home', href: '/', external: false },
  { label: 'About', href: '/about', external: false },
  { label: 'Projects', href: '/projects', external: false },
  { label: 'Case Studies', href: '/case-studies', external: false },
  { label: 'Playground', href: '/#what-i-build', external: false },
  { label: 'Contact', href: '/#contact', external: false },
];

const SOCIAL_LINKS = [
  { label: 'Instagram', href: 'https://instagram.com', external: true },
  { label: 'LinkedIn', href: 'https://linkedin.com', external: true },
];

export function FooterLinks() {
  return (
    <>
      <LinkGroup>
        <GroupTitle>Primary</GroupTitle>
        <LinksRow>
          {PRIMARY_LINKS.map((item) =>
            item.external ? (
              <BracketLinkAnchor key={item.label} href={item.href} target="_blank" rel="noopener noreferrer">
                {item.label}
              </BracketLinkAnchor>
            ) : (
              <BracketLink key={item.label} href={item.href}>
                {item.label}
              </BracketLink>
            )
          )}
        </LinksRow>
      </LinkGroup>

      <LinkGroup>
        <GroupTitle>Social</GroupTitle>
        <LinksRow>
          {SOCIAL_LINKS.map((item) => (
            <BracketLinkAnchor key={item.label} href={item.href} target="_blank" rel="noopener noreferrer">
              {item.label}
            </BracketLinkAnchor>
          ))}
        </LinksRow>
      </LinkGroup>
    </>
  );
}
