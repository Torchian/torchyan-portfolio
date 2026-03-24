import dynamic from 'next/dynamic';
import { AboutHeroSection } from '@/components/sections/about/AboutHeroSection';

const AboutTimelineSection = dynamic(() =>
  import('@/components/sections/about/AboutTimelineSection').then((m) => ({
    default: m.AboutTimelineSection,
  })),
);
const AboutSkillsCirclesSection = dynamic(() =>
  import('@/components/sections/about/AboutSkillsCirclesSection').then((m) => ({
    default: m.AboutSkillsCirclesSection,
  })),
);
const AboutCTASection = dynamic(() =>
  import('@/components/sections/about/AboutCTASection').then((m) => ({
    default: m.AboutCTASection,
  })),
);

export const metadata = {
  title: 'About',
  description: 'About Stepan Torchyan — Designer × Engineer.',
  openGraph: {
    title: 'About | Stepan Torchyan',
    description: 'About Stepan Torchyan — Designer × Engineer.',
  },
};

export default function AboutPage() {
  return (
    <main id="main-content">
      <AboutHeroSection />
      <AboutTimelineSection />
      <AboutSkillsCirclesSection />
      <AboutCTASection />
    </main>
  );
}
