import { HeroSection } from '@/components/sections/hero/HeroSection';
import { WhatIDoSection } from '@/components/sections/what-i-do/WhatIDoSection';
import { SelectedWorkSection } from '@/components/sections/selected-work/SelectedWorkSection';
import { CapabilitiesSection } from '@/components/sections/capabilities/CapabilitiesSection';
import { TrustedBySection } from '@/components/sections/trusted-by/TrustedBySection';
import { YearsMapSection } from '@/components/sections/years-map/YearsMapSection';
import { ContactCTASection } from '@/components/sections/contact-cta/ContactCTASection';

export const metadata = {
  title: 'Stepan Torchyan — Design Engineer',
  description: 'Design engineering portfolio of Stepan Torchyan. Building interfaces that bridge design and engineering.',
  openGraph: {
    title: 'Stepan Torchyan — Design Engineer',
    description: 'Design engineering portfolio of Stepan Torchyan.',
  },
};

export default function HomePage() {
  return (
    <main id="main-content">
      <HeroSection />
      <WhatIDoSection />
      <SelectedWorkSection />
      <CapabilitiesSection />
      <TrustedBySection />
      <YearsMapSection />
      <ContactCTASection />
    </main>
  );
}
