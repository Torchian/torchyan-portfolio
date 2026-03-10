'use client';

import styled from 'styled-components';
import { Container, Text } from '@/components/primitives';
import { SectionHeading } from '@/components/composites';
import { CompanyLogo } from '@/components/primitives';
import { spacing } from '@/styles/tokens/spacing';
import { grid } from '@/styles/tokens/grid';
import { media } from '@/styles/media';

const Section = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${spacing[1000]}px 0 0;
  gap: ${spacing[1000]}px;
  isolation: isolate;
  position: relative;
`;

const HeadingContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${spacing[0]}px ${spacing[400]}px;
  max-width: ${grid.maxWidth}px;

  ${media.down('m')} {
    padding: ${spacing[0]}px ${spacing[300]}px;
  }
`;

const LogosWrapper = styled.div`
  margin-top: ${spacing[800]}px;
  width: 100%;
  max-width: ${grid.maxWidth}px;
  margin-left: auto;
  margin-right: auto;
  padding: 0 ${spacing[400]}px;
`;

const Blurb = styled(Text).attrs({
  as: 'p',
  $scale: 'body',
  $size: 'l',
  $color: 'var(--color-text-secondary)',
  $align: 'center',
})`
  max-width: 600px;
  margin: ${spacing[400]}px auto 0;
`;

const LogoGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[800]}px;
`;

const LogoRow = styled.div<{ $align?: 'start' | 'center' | 'end' }>`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;

  &:first-child {
    padding-inline: ${spacing[400]}px;
  }
    
  &:last-child {
    padding-inline: ${spacing[200]}px;
  }

  ${media.down('m')} {
    justify-content: center;
    gap: ${spacing[600]}px ${spacing[800]}px;
  }
`;

const LOGO_SIZE = { width: 160, height: 40, $hoverScale: 1.1 };

const ROW_1 = [
  { src: '/logo/companies/SoftConstruct.svg', alt: 'SoftConstruct', ...LOGO_SIZE },
  { src: '/logo/companies/Volo.svg', alt: 'Volo', ...LOGO_SIZE },
  { src: '/logo/companies/Fortinet.svg', alt: 'Fortinet', ...LOGO_SIZE },
  { src: '/logo/companies/byRobinblair.svg', alt: 'by robynblair', ...LOGO_SIZE },
];

const ROW_2 = [
  { src: '/logo/companies/InfinitiRings.svg', alt: 'InfinitiRings', ...LOGO_SIZE },
  { src: '/logo/companies/Ginosi.svg', alt: 'Ginosi', ...LOGO_SIZE },
  { src: '/logo/companies/ArmenianCodeAcademy.svg', alt: 'Armenian Code Academy', ...LOGO_SIZE },
  { src: '/logo/companies/Picsart.svg', alt: 'Picsart', ...LOGO_SIZE },
  { src: '/logo/companies/IT365.svg', alt: 'IT365', ...LOGO_SIZE },
];

const ROW_3 = [
  { src: '/logo/companies/SoulOne.svg', alt: 'SoulOne', ...LOGO_SIZE },
  { src: '/logo/companies/Brainstorm.svg', alt: 'Brainstorm', ...LOGO_SIZE },
  { src: '/logo/companies/Smartbet.svg', alt: 'smartbet', ...LOGO_SIZE },
  { src: '/logo/companies/Benzeen.svg', alt: 'Benzeen', ...LOGO_SIZE },
];

const ROW_4 = [
  { src: '/logo/companies/PlayEngine.svg', alt: 'PlayEngine', ...LOGO_SIZE },
  { src: '/logo/companies/WorldEdu.svg', alt: 'World Education', ...LOGO_SIZE },
  { src: '/logo/companies/Adrasheg.svg', alt: 'Adrasheg', ...LOGO_SIZE },
  { src: '/logo/companies/BrainRocket.svg', alt: 'BRO BrainRocket', ...LOGO_SIZE },
  { src: '/logo/companies/Inlogic.svg', alt: 'Inlogic', ...LOGO_SIZE },
];

const ROW_5 = [
  { src: '/logo/companies/Gemmed.svg', alt: 'Gemmed', ...LOGO_SIZE },
  { src: '/logo/companies/TCO.svg', alt: 'TCO', ...LOGO_SIZE },
  { src: '/logo/companies/Scunci.svg', alt: 'Scunci', ...LOGO_SIZE },
  { src: '/logo/companies/Rostelecom.svg', alt: 'Rostelecom', ...LOGO_SIZE },
];

export function TrustedBySection() {
  return (
    <Section id="trusted-by">
      <HeadingContainer $padding={false}>
        <SectionHeading
          title="Trusted by Teams"
          subtitle="I've worked with companies from early-stage startups to enterprise — always shipping real products."
        />
      </HeadingContainer>
      <LogosWrapper>
        <LogoGrid>
          <LogoRow $align="center">
            {ROW_1.map((logo) => (
              <CompanyLogo key={logo.alt} {...logo} />
            ))}
          </LogoRow>
          <LogoRow $align="center">
            {ROW_2.map((logo) => (
              <CompanyLogo key={logo.alt} {...logo} />
            ))}
          </LogoRow>
          <LogoRow $align="center">
            {ROW_3.map((logo) => (
              <CompanyLogo key={logo.alt} {...logo} />
            ))}
          </LogoRow>
          <LogoRow $align="center">
            {ROW_4.map((logo) => (
              <CompanyLogo key={logo.alt} {...logo} />
            ))}
          </LogoRow>
          <LogoRow $align="center">
            {ROW_5.map((logo) => (
              <CompanyLogo key={logo.alt} {...logo} />
            ))}
          </LogoRow>
        </LogoGrid>
      </LogosWrapper>
    </Section>
  );
}
