'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import styled from 'styled-components';
import { AnimatePresence } from 'framer-motion';
import { NavBar } from './NavBar';
import { SiteLoadingOverlay } from './SiteLoadingOverlay';
import { PageTransition } from './PageTransition';
import { SideCharacters } from '@/components/composites/SideCharacters';
import { ContentRevealProvider, useContentReveal } from '@/contexts/ContentRevealContext';

const Footer = dynamic(
  () => import('@/components/sections/footer/Footer').then((m) => ({ default: m.Footer })),
);

const Main = styled.div`
  position: relative;
  min-height: 100vh;
  z-index: 0;
`;

function SiteLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomepage = pathname === '/';
  const { markContentRevealed } = useContentReveal();

  return (
    <>
      <SiteLoadingOverlay onFadeStart={markContentRevealed} />
      {isHomepage && <SideCharacters />}
      <NavBar />
      <Main>
        <AnimatePresence mode="wait">
          <PageTransition key={pathname}>
            {children}
          </PageTransition>
        </AnimatePresence>
      </Main>
      <Footer />
    </>
  );
}

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <ContentRevealProvider>
      <SiteLayoutInner>{children}</SiteLayoutInner>
    </ContentRevealProvider>
  );
}
