'use client';

import styled from 'styled-components';
import { NavBar } from './NavBar';
import { Footer } from '@/components/sections/footer/Footer';

const Main = styled.div`
  min-height: 100vh;
`;

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavBar />
      <Main>{children}</Main>
      <Footer />
    </>
  );
}
