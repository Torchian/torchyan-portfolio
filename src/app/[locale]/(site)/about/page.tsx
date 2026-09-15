import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { AboutHeroSection } from '@/components/sections/about/AboutHeroSection';
import { AboutTimelineSection } from '@/components/sections/about/AboutTimelineSection';
import { AboutSkillsCirclesSection } from '@/components/sections/about/AboutSkillsCirclesSection';
import { AboutCTASection } from '@/components/sections/about/AboutCTASection';
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

export default async function AboutPage({ params }: LocaleParams) {
  await resolveLocale(params);

  return (
    <main id="main-content">
      <AboutHeroSection />
      <AboutTimelineSection />
      <AboutSkillsCirclesSection />
      <AboutCTASection />
    </main>
  );
}
