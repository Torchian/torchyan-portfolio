'use client';

import styled, { createGlobalStyle } from 'styled-components';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { LANGUAGE_LABELS, LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, routing, type Locale } from '@/i18n/routing';
import { fonts, gutter, PAGE_MAX, paper } from './theme';

/*
 * The paintings site's frame: the wall colour, a header with the artist's name
 * and three links, and a footer. Everything the studio site puts round its
 * pages (loader, page transitions, sound, the dark theme) stays out.
 */

/** Over the shared global style, which is the studio's dark one. Mounted only on paintings pages. */
const Wall = createGlobalStyle`
  html,
  body {
    background: ${paper.wall};
    color: ${paper.ink};
  }

  body {
    font-family: ${fonts.sans};
  }

  ::selection {
    background: ${paper.accent};
    color: ${paper.card};
  }
`;

const Notice = styled.p`
  margin: 0;
  padding: 8px ${gutter};
  background: ${paper.ink};
  color: ${paper.wall};
  font-size: 13px;
  line-height: 18px;
  text-align: center;
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 20;
  background: color-mix(in srgb, ${paper.wall} 88%, transparent);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid ${paper.line};
`;

const HeaderInner = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 24px;
  max-width: ${PAGE_MAX}px;
  margin: 0 auto;
  padding: 14px ${gutter};
`;

const Wordmark = styled(Link)`
  display: flex;
  align-items: baseline;
  gap: 10px;
  color: ${paper.ink};
  text-decoration: none;

  strong {
    font-family: ${fonts.serif};
    font-weight: 500;
    font-size: 26px;
    line-height: 1;
    letter-spacing: 0.01em;
  }

  span {
    color: ${paper.inkFaint};
    font-size: 12px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 4px 22px;
  flex-wrap: wrap;

  a {
    color: ${paper.inkSoft};
    font-size: 15px;
    text-decoration: none;
    transition: color 160ms ease;

    &:hover,
    &[aria-current='page'] {
      color: ${paper.ink};
    }
  }

  @media (max-width: 560px) {
    width: 100%;
    justify-content: space-between;
    gap: 4px 14px;

    a {
      font-size: 14px;
    }
  }
`;

const Languages = styled.div`
  display: flex;
  gap: 2px;
  margin-left: 6px;

  a {
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 13px;

    &[aria-current='true'] {
      color: ${paper.ink};
      background: ${paper.wallDeep};
    }
  }
`;

const Footer = styled.footer`
  margin-top: clamp(64px, 10vw, 120px);
  border-top: 1px solid ${paper.line};
`;

const FooterInner = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px 32px;
  max-width: ${PAGE_MAX}px;
  margin: 0 auto;
  padding: 28px ${gutter} 40px;
  color: ${paper.inkFaint};
  font-size: 14px;
  line-height: 20px;

  a {
    color: ${paper.inkSoft};
  }
`;

function rememberLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;
}

export function PaintingsShell({ children, samples }: { children: React.ReactNode; samples: boolean }) {
  const t = useTranslations('paintings');
  const locale = useLocale() as Locale;
  const pathname = usePathname();

  return (
    <>
      <Wall />
      {samples && <Notice role="note">{t('sample')}</Notice>}
      <Header>
        <HeaderInner>
          <Wordmark href="/" aria-label={t('nav.home')}>
            <strong>{t('artist.shortName')}</strong>
            <span>{t('hero.eyebrow')}</span>
          </Wordmark>
          <Nav aria-label={t('nav.home')}>
            <Link href="/#gallery">{t('nav.gallery')}</Link>
            <Link href="/#artist">{t('nav.artist')}</Link>
            <Link href="/commissions" aria-current={pathname === '/commissions' ? 'page' : undefined}>
              {t('nav.commissions')}
            </Link>
            <Languages role="group" aria-label={t('language.label')}>
              {routing.locales.map((l) => (
                <Link
                  key={l}
                  href={pathname}
                  locale={l}
                  lang={l}
                  hrefLang={l}
                  aria-current={l === locale ? 'true' : undefined}
                  onClick={() => rememberLocale(l)}
                >
                  {LANGUAGE_LABELS[l]}
                </Link>
              ))}
            </Languages>
          </Nav>
        </HeaderInner>
      </Header>
      {children}
      <Footer>
        <FooterInner>
          <span>{t('footer.rights', { artist: t('artist.name') })}</span>
          <span>
            {t('footer.madeBy')} <a href="https://torchyan.design">{t('footer.studio')}</a>
          </span>
        </FooterInner>
      </Footer>
    </>
  );
}
