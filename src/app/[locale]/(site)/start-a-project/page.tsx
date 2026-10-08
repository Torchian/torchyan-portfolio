import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { TalkOpener } from '@/components/sections/contact/ContactTalkSections';
import { ProjectForm } from '@/components/sections/contact-cta/ProjectForm';
import { NextStepsSection } from '@/components/sections/contact-page/ContactPageSections';
import { YearsMapSection } from '@/components/sections/years-map/YearsMapSection';
import { resolveLocale, type LocaleParams } from '@/i18n/server';
import { generatePageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: 'meta' });
  return generatePageMetadata({
    locale,
    path: '/start-a-project',
    siteName: t('siteName'),
    title: t('startProject.title'),
    description: t('startProject.description'),
  });
}

/*
 * The one destination for every "Start a project": the form first, under the
 * same opener as /contact; then the reach map, trust that supports the form
 * rather than competing with it; then what happens once it's sent.
 */
export default async function StartProjectPage({ params }: LocaleParams) {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: 'contactPage.hero' });

  return (
    <main id="main-content">
      <TalkOpener titleId="start-project-title" title={t('title')} lead={`${t('lead')} ${t('body')}`}>
        <ProjectForm />
      </TalkOpener>
      <YearsMapSection id="reach" />
      <NextStepsSection />
    </main>
  );
}
