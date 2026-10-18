import { SiteLayout } from '@/components/layouts';
import { PageLoader } from '@/components/layouts/PageLoader';
import { PageTransition } from '@/components/layouts/PageTransition';
import { SoundProvider } from '@/lib/sound/provider';
import { resolveLocale, type LocaleParams } from '@/i18n/server';

/** torchyan.design: the studio site. The paintings site (../(paintings)) shares only the root layout. */
export default async function SiteGroupLayout({ children, params }: LocaleParams & { children: React.ReactNode }) {
  await resolveLocale(params);
  return (
    <>
      <PageLoader />
      <PageTransition />
      <SiteLayout>{children}</SiteLayout>
      <SoundProvider />
    </>
  );
}
