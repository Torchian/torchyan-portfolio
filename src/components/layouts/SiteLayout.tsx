'use client';

import { usePathname } from 'next/navigation';
import styled from 'styled-components';
import { AnimatePresence } from 'framer-motion';
import { NavBar } from './NavBar';
import { SiteLoadingOverlay } from './SiteLoadingOverlay';
import { PageTransition } from './PageTransition';
import { Footer } from '@/components/sections/footer/Footer';
import { SideCharacters } from '@/components/composites';
import { ContentRevealProvider, useContentReveal } from '@/contexts/ContentRevealContext';

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
      <SiteLoadingOverlay onFadeComplete={markContentRevealed} />
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
