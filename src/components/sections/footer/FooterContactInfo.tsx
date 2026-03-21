'use client';

import styled from 'styled-components';
import { spacing } from '@/styles/tokens/spacing';
import { neutrals } from '@/styles/tokens/colors';
import { fontWeight, fontFamily } from '@/styles/tokens/typography';
import { fluidFontSize, fluidLineHeight } from '@/styles/fluid';
import { media } from '@/styles/media';
import { LinkGroup, GroupTitle, BracketLinkAnchor } from './FooterLinks';

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
  font-size: ${fluidFontSize.heading.s};
  line-height: ${fluidLineHeight.heading.s};
  color: ${neutrals[100]};
`;

const LocationIcon = styled.img`
  width: 15px;
  height: 26px;
  flex-shrink: 0;
`;

const ContactsRow = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: ${spacing[200]}px ${spacing[800]}px;

  ${media.down('m')} {
    justify-content: center;
  }
`;

export function FooterContactInfo() {
  return (
    <>
      <LinkGroup>
        <GroupTitle>Contacts</GroupTitle>
        <ContactsRow>
          <BracketLinkAnchor href="mailto:hello@torchyan.com">hello@torchyan.com</BracketLinkAnchor>
          <BracketLinkAnchor href="tel:+37495334719">+374 95 334 719</BracketLinkAnchor>
        </ContactsRow>
      </LinkGroup>

      <LinkGroup>
        <GroupTitle>Location</GroupTitle>
        <LocationLinks>
          <LocationItem>
            <LocationIcon src="/vectors/location.svg" alt="" aria-hidden />
            <span>Yerevan, Armenia</span>
          </LocationItem>
        </LocationLinks>
      </LinkGroup>
    </>
  );
}
