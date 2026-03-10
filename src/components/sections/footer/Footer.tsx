'use client';

import styled from 'styled-components';
import Link from 'next/link';
import { spacing } from '@/styles/tokens/spacing';
import { neutrals, accents } from '@/styles/tokens/colors';
import { fontSize, lineHeight, fontWeight, letterSpacing, fontFamily } from '@/styles/tokens/typography';
import { media } from '@/styles/media';
import { duration, easing } from '@/styles/tokens/motion';

const FooterEl = styled.footer`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${spacing[1000]}px 0;
  background: ${neutrals[900]};
  position: relative;
  overflow: hidden;

  ${media.down('m')} {
    padding: ${spacing[800]}px 0;
    gap: ${spacing[500]}px;
  }
`;

const FooterBg = styled.div`
  position: absolute;
  width: 832px;
  height: 832px;
  left: 50%;
  top: 126px;
  transform: translateX(calc(-50% + 400px));
  pointer-events: none;
  z-index: 0;
  opacity: 0.15;

  ${media.down('l')} {
    display: none;
  }
`;

const MainContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 0 ${spacing[400]}px;
  gap: ${spacing[2000]}px;
  width: 100%;
  max-width: 1440px;
  position: relative;
  z-index: 1;

  ${media.down('l')} {
    gap: ${spacing[1000]}px;
  }

  ${media.down('m')} {
    flex-direction: column;
    align-items: center;
    padding: 0 ${spacing[400]}px;
  }
`;

const VerticalNameBlock = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: ${spacing[600]}px;
  transform: rotate(180deg);
  transform-origin: center;

  ${media.down('m')} {
    flex-direction: column;
    align-items: center;
    gap: ${spacing[400]}px;
  }
`;

const VerticalText = styled.div`
  display: flex;
  flex-direction: column-reverse;
  align-items: flex-start;
  gap: ${spacing[150]}px;
  writing-mode: vertical-lr;
  white-space: nowrap;

  ${media.down('m')} {
    writing-mode: horizontal-tb;
    transform: none;
    align-items: center;
  }
`;

const Name = styled.span`
  font-family: ${fontFamily.display};
  font-weight: ${fontWeight.black};
  font-size: ${fontSize.display.xl}px;
  line-height: ${lineHeight.display.xl}px;
  letter-spacing: ${letterSpacing.s}px;
  text-transform: uppercase;
  color: ${accents.primary};
  display: block;

  ${media.down('m')} {
    font-size: ${fontSize.display.m}px;
    line-height: ${lineHeight.display.m}px;
  }
`;

/* Stepan (6 chars) scaled to match Torchyan (8 chars) width */
const FirstName = styled(Name)`
  font-size: calc(${fontSize.display.xl}px * 1.705);
  line-height: 0.75;
`;

const LastName = styled(Name)`
  font-size: calc(${fontSize.display.xl}px * 1.15);
  line-height: 0.8;
`;

const Title = styled.span`
  font-family: ${fontFamily.display};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.display.s}px;
  line-height: ${lineHeight.display.s}px;
  color: ${neutrals[500]};
  display: block;

  ${media.down('m')} {
    font-size: ${fontSize.heading.l}px;
    line-height: ${lineHeight.heading.l}px;
  }
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0 0 0 ${spacing[150]}px;
  gap: ${spacing[800]}px;
  flex: 1;

  ${media.down('m')} {
    padding: 0;
    align-items: center;
    text-align: center;
  }
`;

const LinkGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${spacing[150]}px;

  ${media.down('m')} {
    align-items: center;
  }
`;

const GroupTitle = styled.span`
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.body.l}px;
  line-height: ${lineHeight.body.l}px;
  letter-spacing: ${letterSpacing.xs}px;
  color: ${neutrals[700]};
`;

const PrimaryLinks = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: ${spacing[200]}px ${spacing[800]}px;

  ${media.down('m')} {
    justify-content: center;
  }
`;

const SocialLinks = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: ${spacing[200]}px ${spacing[800]}px;

  ${media.down('m')} {
    justify-content: center;
  }
`;

const BracketLink = styled(Link)`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.heading.s}px;
  line-height: ${lineHeight.heading.s}px;
  color: ${neutrals[100]};
  text-decoration: none;
  padding: 0 ${spacing[100]}px;
  
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

const BracketLinkAsAnchor = styled.a`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.heading.s}px;
  line-height: ${lineHeight.heading.s}px;
  color: ${neutrals[100]};
  text-decoration: none;
  padding: 0 ${spacing[100]}px;

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

const ContactLink = styled.a`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.heading.s}px;
  line-height: ${lineHeight.heading.s}px;
  color: ${neutrals[100]};
  text-decoration: none;
  padding: 0 ${spacing[100]}px;

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

const LocationLinks = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: ${spacing[200]}px ${spacing[800]}px;

  ${media.down('m')} {
    justify-content: center;
  }
`;

const LocationItem = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing[300]}px;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.heading.s}px;
  line-height: ${lineHeight.heading.s}px;
  color: ${neutrals[100]};
`;

const LocationIcon = styled.img`
  width: 15px;
  height: 26px;
  flex-shrink: 0;
`;

const LocationText = styled.span``;

const CopyrightRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0;
  gap: ${spacing[600]}px;
  width: 100%;
  max-width: 800px;
  position: relative;
  z-index: 1;

  ${media.down('m')} {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: ${spacing[200]}px;
  }
`;

const CopyrightText = styled.span`
  font-family: ${fontFamily.display};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.body.l}px;
  line-height: ${lineHeight.body.l}px;
  letter-spacing: ${letterSpacing.xs}px;
  color: ${neutrals[700]};
`;

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

export function Footer() {
  return (
    <FooterEl>
      <FooterBg aria-hidden />
      <MainContainer>
        <VerticalNameBlock>
          <VerticalText>
            <Title>Designer × Engineer</Title>
          </VerticalText>
          <VerticalText>
            <FirstName>Stepan</FirstName>
            <LastName>Torchyan</LastName>
          </VerticalText>
        </VerticalNameBlock>

        <RightColumn>
          <LinkGroup>
            <GroupTitle>Primary</GroupTitle>
            <PrimaryLinks>
              {PRIMARY_LINKS.map((item) =>
                item.external ? (
                  <BracketLinkAsAnchor key={item.label} href={item.href} target="_blank" rel="noopener noreferrer">
                    {item.label}
                  </BracketLinkAsAnchor>
                ) : (
                  <BracketLink key={item.label} href={item.href}>
                    {item.label}
                  </BracketLink>
                )
              )}
            </PrimaryLinks>
          </LinkGroup>

          <LinkGroup>
            <GroupTitle>Social</GroupTitle>
            <SocialLinks>
              {SOCIAL_LINKS.map((item) => (
                <BracketLinkAsAnchor key={item.label} href={item.href} target="_blank" rel="noopener noreferrer">
                  {item.label}
                </BracketLinkAsAnchor>
              ))}
            </SocialLinks>
          </LinkGroup>

          <LinkGroup>
            <GroupTitle>Contacts</GroupTitle>
            <PrimaryLinks>
              <ContactLink href="mailto:hello@torchyan.com">hello@torchyan.com</ContactLink>
              <ContactLink href="tel:+37495334719">+374 95 334 719</ContactLink>
            </PrimaryLinks>
          </LinkGroup>

          <LinkGroup>
            <GroupTitle>Location</GroupTitle>
            <LocationLinks>
              <LocationItem>
                <LocationIcon src="/vectors/location.svg" alt="" aria-hidden />
                <LocationText>Yerevan, Armenia</LocationText>
              </LocationItem>
            </LocationLinks>
          </LinkGroup>
         
          <CopyrightRow>
            <CopyrightText>© Copyright {new Date().getFullYear()} Torchyan</CopyrightText>
            <CopyrightText>All Rights Reserved</CopyrightText>
          </CopyrightRow>
        </RightColumn>
       
      </MainContainer>
    </FooterEl>
  );
}
