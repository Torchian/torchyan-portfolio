import dynamic from 'next/dynamic';
import { HeroSection } from '@/components/sections/hero/HeroSection';

const WhatIDoSection = dynamic(() =>
  import('@/components/sections/what-i-do/WhatIDoSection').then((m) => ({
    default: m.WhatIDoSection,
  })),
);
const SelectedWorkSection = dynamic(() =>
  import('@/components/sections/selected-work/SelectedWorkSection').then((m) => ({
    default: m.SelectedWorkSection,
  })),
);
const CapabilitiesSection = dynamic(() =>
  import('@/components/sections/capabilities/CapabilitiesSection').then((m) => ({
    default: m.CapabilitiesSection,
  })),
);
const TrustedBySection = dynamic(() =>
  import('@/components/sections/trusted-by/TrustedBySection').then((m) => ({
    default: m.TrustedBySection,
  })),
);
const YearsMapSection = dynamic(() =>
  import('@/components/sections/years-map/YearsMapSection').then((m) => ({
    default: m.YearsMapSection,
  })),
);
const ContactCTASection = dynamic(() =>
  import('@/components/sections/contact-cta/ContactCTASection').then((m) => ({
    default: m.ContactCTASection,
  })),
);

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
