import dynamic from 'next/dynamic';

const CapabilitiesSection = dynamic(() =>
  import('@/components/sections/capabilities/CapabilitiesSection').then((m) => ({
    default: m.CapabilitiesSection,
  })),
);
const ContactCTASection = dynamic(() =>
  import('@/components/sections/contact-cta/ContactCTASection').then((m) => ({
    default: m.ContactCTASection,
  })),
);

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
