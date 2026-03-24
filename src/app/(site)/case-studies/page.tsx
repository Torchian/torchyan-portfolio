import { CapabilitiesSection } from '@/components/sections/capabilities/CapabilitiesSection';
import { ContactCTASection } from '@/components/sections/contact-cta/ContactCTASection';

export const metadata = {
  title: 'Case Studies',
  description: 'Design and engineering case studies by Stepan Torchyan.',
};

export default function CaseStudiesPage() {
  return (
    <main id="main-content">
      <div style={{ paddingTop: '80px' }}>
        <CapabilitiesSection />
      </div>
      <ContactCTASection />
    </main>
  );
}
