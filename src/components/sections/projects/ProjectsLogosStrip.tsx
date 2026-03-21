'use client';

import styled from 'styled-components';
import { CompanyLogoMarquee } from '@/components/composites';
import { spacing } from '@/styles/tokens/spacing';
import { neutrals } from '@/styles/tokens/colors';

const Strip = styled.section`
  padding: ${spacing[500]}px 0;
  background: ${neutrals[800]};
`;

const LOGOS = [
  { src: '/logo/companies/SoftConstruct.svg', alt: 'SoftConstruct', width: 240, height: 48 },
  { src: '/logo/companies/Volo.svg', alt: 'Volo', width: 120, height: 48 },
  { src: '/logo/companies/Fortinet.svg', alt: 'Fortinet', width: 220, height: 48 },
  { src: '/logo/companies/Ginosi.svg', alt: 'Ginosi', width: 160, height: 42 },
  { src: '/logo/companies/byRobinblair.svg', alt: 'by robynblair', width: 180, height: 48 },
  { src: '/logo/companies/Smartbet.svg', alt: 'Smartbet', width: 180, height: 48 },
  { src: '/logo/companies/Picsart.svg', alt: 'Picsart', width: 160, height: 48 },
] as const;

export function ProjectsLogosStrip() {
  return (
    <Strip>
      <CompanyLogoMarquee logos={[...LOGOS, ...LOGOS]} rows={1} speed={55} />
    </Strip>
  );
}
