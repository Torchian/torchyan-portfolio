import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { AboutHeroSection } from '@/components/sections/about/AboutHeroSection';
import { AboutIntroSection } from '@/components/sections/about/AboutIntroSection';
import { AboutTimelineSection } from '@/components/sections/about/AboutTimelineSection';
import { AboutPracticeSection } from '@/components/sections/about/AboutPracticeSection';
import { AboutPositioningSection } from '@/components/sections/about/AboutPositioningSection';
import { resolveLocale, type LocaleParams } from '@/i18n/server';
import { generatePageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: 'meta' });
  return generatePageMetadata({
    locale,
    path: '/about',
    siteName: t('siteName'),
    title: t('about.title'),
    description: t('about.description'),
  });
}

/*
 * Figma: About (section 2973:9261) — Desktop 2973:16130, Tablet 3960:15294,
 * Mobile 3983:10975. See docs/adr/0007-about-page.md.
 */
export default async function AboutPage({ params }: LocaleParams) {
  await resolveLocale(params);

  return (
    <main id="main-content">
      <AboutHeroSection />
      <AboutIntroSection />
      <AboutTimelineSection />
      <AboutPracticeSection />
      <AboutPositioningSection />
    </main>
  );
}
