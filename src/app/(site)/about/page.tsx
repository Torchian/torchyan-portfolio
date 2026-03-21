import { AboutHeroSection } from '@/components/sections/about/AboutHeroSection';
import { AboutTimelineSection } from '@/components/sections/about/AboutTimelineSection';
import { AboutSkillsCirclesSection } from '@/components/sections/about/AboutSkillsCirclesSection';
import { AboutCTASection } from '@/components/sections/about/AboutCTASection';

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
