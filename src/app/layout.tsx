import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Suspense } from 'react';
import { StyledComponentsRegistry } from '@/lib/styled-registry';
import { AnalyticsProvider } from '@/lib/analytics/provider';
import { themeScript } from '@/lib/theme-script';

const gilroy = localFont({
  src: [
    { path: '../../public/fonts/gilroy-thin.woff2', weight: '100' },
    { path: '../../public/fonts/gilroy-ultralight.woff2', weight: '200' },
    { path: '../../public/fonts/gilroy-regular.woff2', weight: '400' },
    { path: '../../public/fonts/gilroy-medium.woff2', weight: '500' },
    { path: '../../public/fonts/gilroy-semibold.woff2', weight: '600' },
    { path: '../../public/fonts/gilroy-bold.woff2', weight: '700' },
    { path: '../../public/fonts/gilroy-heavy.woff2', weight: '800' },
    { path: '../../public/fonts/gilroy-black.woff2', weight: '900' },
  ],
  variable: '--font-gilroy',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: '%s | Stepan Torchyan',
    default: 'Stepan Torchyan — Design Engineer',
  },
  description: 'Design engineering portfolio of Stepan Torchyan.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={gilroy.variable}>
        <a id="skip-to-content" href="#main-content">
          Skip to content
        </a>
        <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
        <Suspense fallback={null}>
          <AnalyticsProvider />
        </Suspense>
      </body>
    </html>
  );
}
