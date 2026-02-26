'use client';

import styled from 'styled-components';
import { Container, Display, Text, NavLink, Divider } from '@/components/primitives';
import { spacing } from '@/styles/tokens/spacing';
import { fontSize, lineHeight, letterSpacing } from '@/styles/tokens/typography';
import { media } from '@/styles/media';

const FooterEl = styled.footer`
  padding: ${spacing[800]}px 0 ${spacing[400]}px;
`;

const TopRow = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: ${spacing[400]}px;
  padding-bottom: ${spacing[600]}px;

  ${media.down('m')} {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const Brand = styled(Display)`
  text-transform: uppercase;
  letter-spacing: ${letterSpacing.xxs}px;
  font-size: ${fontSize.display.s}px;
  line-height: ${lineHeight.display.s}px;

  ${media.down('m')} {
    font-size: ${fontSize.heading.l}px;
    line-height: ${lineHeight.heading.l}px;
  }
`;

const NavLinks = styled.nav`
  display: flex;
  gap: ${spacing[300]}px;
  flex-wrap: wrap;
`;

const BottomRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: ${spacing[300]}px;
  gap: ${spacing[200]}px;

  ${media.down('m')} {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: ${spacing[200]}px;
`;

const NAV_ITEMS = [
  { label: 'Work', href: '#work' },
  { label: 'Capabilities', href: '#capabilities' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

const SOCIAL_ITEMS = [
  { label: 'LinkedIn', href: '#' },
  { label: 'GitHub', href: '#' },
  { label: 'Dribbble', href: '#' },
];

export function Footer() {
  return (
    <FooterEl>
      <Container>
        <TopRow>
          <Brand as="span" $size="s">Stepan Torchyan</Brand>
          <NavLinks>
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.label} href={item.href}>
                {item.label}
              </NavLink>
            ))}
          </NavLinks>
        </TopRow>
        <Divider />
        <BottomRow>
          <Text $scale="body" $size="s" $color="var(--color-text-tertiary)">
            &copy; {new Date().getFullYear()} Stepan Torchyan. All rights reserved.
          </Text>
          <SocialLinks>
            {SOCIAL_ITEMS.map((item) => (
              <NavLink key={item.label} href={item.href}>
                {item.label}
              </NavLink>
            ))}
          </SocialLinks>
        </BottomRow>
      </Container>
    </FooterEl>
  );
}
