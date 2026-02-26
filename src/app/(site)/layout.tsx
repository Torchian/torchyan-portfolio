import { SiteLayout } from '@/components/layouts';

export default function SiteGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteLayout>{children}</SiteLayout>;
}
