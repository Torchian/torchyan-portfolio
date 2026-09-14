import { VisuallyHidden } from '@/components/primitives';
import { CapabilitiesSection } from '@/components/sections/capabilities/CapabilitiesSection';
import { ContactCTASection } from '@/components/sections/contact-cta/ContactCTASection';

export const metadata = {
  title: 'Case Studies',
  description: 'Design and engineering case studies by Stepan Torchyan.',
};

export default function CaseStudiesPage() {
  return (
    <main id="main-content">
      {/* The page's own title for screen readers and search; the design has no visible one. */}
      <VisuallyHidden as="h1">Case Studies</VisuallyHidden>
      <CapabilitiesSection />
      <ContactCTASection />
    </main>
  );
}
