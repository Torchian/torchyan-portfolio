'use client';

import styled from 'styled-components';
import { spacing } from '@/styles/tokens/spacing';
import { neutrals } from '@/styles/tokens/colors';
import { media } from '@/styles/media';
import { FooterNameBlock } from './FooterNameBlock';
import { FooterLinks } from './FooterLinks';
import { FooterContactInfo } from './FooterContactInfo';
import { FooterCopyright } from './FooterCopyright';

const FooterEl = styled.footer`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${spacing[1000]}px 0 calc(${spacing[1000]}px + env(safe-area-inset-bottom, 0px));
  background: ${neutrals[900]};
  position: relative;
  overflow: hidden;

  ${media.down('m')} {
    padding: ${spacing[800]}px 0 calc(${spacing[800]}px + env(safe-area-inset-bottom, 0px));
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

export function Footer() {
  return (
    <FooterEl>
      <FooterBg aria-hidden />
      <MainContainer>
        <FooterNameBlock />
        <RightColumn>
          <FooterLinks />
          <FooterContactInfo />
          <FooterCopyright />
        </RightColumn>
      </MainContainer>
    </FooterEl>
  );
}
