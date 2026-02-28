'use client';

import styled from 'styled-components';
import { NavBar } from './NavBar';
import { Footer } from '@/components/sections/footer/Footer';
import { PageBackground, SideCharacters } from '@/components/composites';

const Main = styled.div`
  position: relative;
  min-height: 100vh;
  z-index: 0;
`;

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageBackground />
      <SideCharacters />
      <NavBar />
      <Main>{children}</Main>
      <Footer />
    </>
  );
}
