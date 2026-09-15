import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { HeroSection } from '@/components/sections/hero/HeroSection';
import { WhatIDoSection } from '@/components/sections/what-i-do/WhatIDoSection';
import { SelectedWorkSection } from '@/components/sections/selected-work/SelectedWorkSection';
import { CapabilitiesSection } from '@/components/sections/capabilities/CapabilitiesSection';
import { TrustedBySection } from '@/components/sections/trusted-by/TrustedBySection';
import { YearsMapSection } from '@/components/sections/years-map/YearsMapSection';
import { ContactCTASection } from '@/components/sections/contact-cta/ContactCTASection';
import { resolveLocale, type LocaleParams } from '@/i18n/server';
import { generatePageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: 'meta' });
  return generatePageMetadata({
    locale,
    path: '/',
    siteName: t('siteName'),
    title: t('defaultTitle'),
    absoluteTitle: true,
    description: t('description'),
  });
}

export default async function HomePage({ params }: LocaleParams) {
  await resolveLocale(params);

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
