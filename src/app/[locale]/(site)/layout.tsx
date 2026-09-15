import { SiteLayout } from '@/components/layouts';
import { resolveLocale, type LocaleParams } from '@/i18n/server';

export default async function SiteGroupLayout({ children, params }: LocaleParams & { children: React.ReactNode }) {
  await resolveLocale(params);
  return <SiteLayout>{children}</SiteLayout>;
}
