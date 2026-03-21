'use client';

import { usePathname } from 'next/navigation';
import styled from 'styled-components';
import { AnimatePresence } from 'framer-motion';
import { NavBar } from './NavBar';
import { PageTransition } from './PageTransition';
import { Footer } from '@/components/sections/footer/Footer';
import { SideCharacters } from '@/components/composites';

const Main = styled.div`
  position: relative;
  min-height: 100vh;
  z-index: 0;
`;

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomepage = pathname === '/';

  return (
    <>
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
