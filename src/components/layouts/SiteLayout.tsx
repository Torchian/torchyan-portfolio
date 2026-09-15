'use client';

import { usePathname } from '@/i18n/navigation';
import styled from 'styled-components';
import { NavBar } from './NavBar';
import { Footer } from '@/components/sections/footer/Footer';
import { LowerPageBackground, PageBackground, SideCharacters } from '@/components/composites';

/**
 * Page content plus footer: the positioning context for LowerPageBackground,
 * which has to span from a section inside the page to the end of the footer.
 * Isolated so the glow's negative z-index stays above the fixed PageBackground.
 */
const Page = styled.div`
  position: relative;
  isolation: isolate;
`;

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
      <PageBackground />
      {isHomepage && <SideCharacters />}
      <NavBar />
      <Page>
        <LowerPageBackground />
        <Main>{children}</Main>
        <Footer />
      </Page>
    </>
  );
}
