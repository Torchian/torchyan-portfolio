'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import styled from 'styled-components';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { THEMES, type PaintingMedium, type PaintingTheme } from '@/lib/paintings/types';
import { fonts, hung, paper } from './theme';
import { ButtonLink, Container, Eyebrow, Lead, SectionTitle } from './ui';

/** What the landing page needs of a painting; the server trims the catalogue to this. */
export interface PaintingCard {
  slug: string;
  title: string;
  year?: number;
  medium: PaintingMedium;
  theme: PaintingTheme;
  image: { src: string; width: number; height: number };
}

/* ---------- Opening ---------- */

const HeroSection = styled.section`
  padding: clamp(40px, 7vw, 96px) 0 clamp(56px, 8vw, 112px);
`;

const HeroGrid = styled(Container)`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: clamp(40px, 6vw, 80px);
  align-items: center;

  @media (min-width: 900px) {
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
  }
`;

const HeroText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;

  h1 {
    margin: 0;
    font-family: ${fonts.serif};
    font-weight: 500;
    font-size: clamp(52px, 8.4vw, 116px);
    line-height: 0.95;
    letter-spacing: -0.015em;
  }
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
`;

const Featured = styled.figure`
  margin: 0;
  justify-self: center;
  width: min(100%, 520px);

  a {
    display: block;
  }

  img {
    display: block;
    width: 100%;
    height: auto;
    ${hung}
  }

  figcaption {
    margin-top: 18px;
    color: ${paper.inkFaint};
    font-size: 14px;
    line-height: 20px;

    em {
      color: ${paper.inkSoft};
      font-family: ${fonts.serif};
      font-size: 18px;
    }
  }
`;

export function PaintingsHero({ featured }: { featured: PaintingCard }) {
  const t = useTranslations('paintings');
  return (
    <HeroSection>
      <HeroGrid>
        <HeroText>
          <Eyebrow>{t('hero.eyebrow')}</Eyebrow>
          <h1>{t('artist.name')}</h1>
          <Lead>{t('hero.intro')}</Lead>
          <Actions>
            <ButtonLink href="/#gallery">{t('hero.viewGallery')}</ButtonLink>
            <ButtonLink href="/commissions" $variant="outline">
              {t('hero.commission')}
            </ButtonLink>
          </Actions>
        </HeroText>
        <Featured>
          <Link href={`/${featured.slug}`}>
            <Image
              src={featured.image.src}
              width={featured.image.width}
              height={featured.image.height}
              alt={featured.title}
              sizes="(max-width: 900px) 92vw, 520px"
              priority
            />
          </Link>
          <figcaption>
            {t('hero.featured')} · <em>{featured.title}</em>
            {featured.year ? `, ${featured.year}` : ''}
          </figcaption>
        </Featured>
      </HeroGrid>
    </HeroSection>
  );
}

/* ---------- Gallery ---------- */

const GallerySection = styled.section`
  scroll-margin-top: 80px;
  padding-top: clamp(24px, 4vw, 48px);
`;

const GalleryHead = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px 40px;
  margin-bottom: clamp(28px, 4vw, 48px);

  > div:first-child {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
`;

const Filters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  button {
    min-height: 36px;
    padding: 0 14px;
    border: 1px solid ${paper.line};
    border-radius: 999px;
    background: transparent;
    color: ${paper.inkSoft};
    font: inherit;
    font-size: 14px;
    cursor: pointer;
    transition:
      border-color 160ms ease,
      color 160ms ease,
      background 160ms ease;

    &:hover {
      border-color: ${paper.lineStrong};
      color: ${paper.ink};
    }

    &[aria-pressed='true'] {
      border-color: ${paper.ink};
      background: ${paper.ink};
      color: ${paper.wall};
    }

    small {
      margin-left: 6px;
      opacity: 0.6;
      font-size: 12px;
    }
  }
`;

/** Columns that keep each painting's own shape: CSS columns, filled top to bottom. */
const Grid = styled.ul`
  columns: 1;
  column-gap: clamp(20px, 3vw, 40px);
  margin: 0;
  padding: 0;
  list-style: none;

  @media (min-width: 600px) {
    columns: 2;
  }

  @media (min-width: 1000px) {
    columns: 3;
  }

  li {
    break-inside: avoid;
    margin-bottom: clamp(28px, 4vw, 48px);
  }
`;

const Card = styled(Link)`
  display: block;
  color: ${paper.ink};
  text-decoration: none;

  img {
    display: block;
    width: 100%;
    height: auto;
    ${hung}
    transition: transform 320ms cubic-bezier(0.2, 0.7, 0.2, 1);
  }

  &:hover img {
    transform: translateY(-4px);
  }

  &:focus-visible {
    outline: 2px solid ${paper.accent};
    outline-offset: 6px;
  }
`;

const Caption = styled.span`
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 16px;

  strong {
    font-family: ${fonts.serif};
    font-weight: 500;
    font-size: 21px;
    line-height: 1.2;
  }

  span {
    color: ${paper.inkFaint};
    font-size: 14px;
  }
`;

export function PaintingsGallery({ paintings }: { paintings: PaintingCard[] }) {
  const t = useTranslations('paintings');
  const [theme, setTheme] = useState<PaintingTheme | 'all'>('all');

  // Only the groups that have paintings in them, in a fixed order ("Other" last).
  const groups = useMemo(() => {
    const counts = new Map<PaintingTheme, number>();
    for (const p of paintings) counts.set(p.theme, (counts.get(p.theme) ?? 0) + 1);
    return THEMES.filter((key) => counts.has(key)).map((key) => [key, counts.get(key)!] as const);
  }, [paintings]);

  const shown = theme === 'all' ? paintings : paintings.filter((p) => p.theme === theme);

  return (
    <GallerySection id="gallery" aria-labelledby="gallery-title">
      <Container>
        <GalleryHead>
          <div>
            <SectionTitle id="gallery-title">{t('gallery.title')}</SectionTitle>
            <Lead>{t('gallery.lead', { count: paintings.length })}</Lead>
          </div>
          {groups.length > 1 && (
            <Filters role="group" aria-label={t('gallery.filterLabel')}>
              <button type="button" aria-pressed={theme === 'all'} onClick={() => setTheme('all')}>
                {t('gallery.all')}
                <small>{paintings.length}</small>
              </button>
              {groups.map(([key, count]) => (
                <button key={key} type="button" aria-pressed={theme === key} onClick={() => setTheme(key)}>
                  {t(`themes.${key}`)}
                  <small>{count}</small>
                </button>
              ))}
            </Filters>
          )}
        </GalleryHead>
        {shown.length ? (
          <Grid>
            {shown.map((p) => (
              <li key={p.slug}>
                <Card href={`/${p.slug}`}>
                  <Image
                    src={p.image.src}
                    width={p.image.width}
                    height={p.image.height}
                    alt={p.title}
                    sizes="(max-width: 600px) 92vw, (max-width: 1000px) 46vw, 400px"
                  />
                  <Caption>
                    <strong>{p.title}</strong>
                    <span>{[p.year, t(`media.${p.medium}`)].filter(Boolean).join(' · ')}</span>
                  </Caption>
                </Card>
              </li>
            ))}
          </Grid>
        ) : (
          <Lead>{t('gallery.empty')}</Lead>
        )}
      </Container>
    </GallerySection>
  );
}

/* ---------- The artist ---------- */

const ArtistSection = styled.section`
  scroll-margin-top: 80px;
  margin-top: clamp(56px, 8vw, 120px);
  padding: clamp(56px, 8vw, 112px) 0;
  background: ${paper.wallDeep};
`;

const ArtistGrid = styled(Container)`
  display: grid;
  gap: clamp(32px, 5vw, 72px);
  align-items: start;

  @media (min-width: 900px) {
    grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
  }
`;

const Portrait = styled.div`
  display: flex;
  align-items: flex-end;
  aspect-ratio: 4 / 5;
  padding: 20px;
  background:
    linear-gradient(160deg, rgba(255, 255, 255, 0.35), transparent 60%),
    ${paper.wall};
  color: ${paper.inkFaint};
  font-size: 14px;
  ${hung}
`;

const ArtistText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;

  p {
    margin: 0;
    max-width: 62ch;
    color: ${paper.inkSoft};
    font-size: 17px;
    line-height: 1.7;
  }

  blockquote {
    margin: 12px 0 0;
    padding-left: 20px;
    border-left: 2px solid ${paper.accent};
    font-family: ${fonts.serif};
    font-style: italic;
    font-size: clamp(22px, 2.4vw, 30px);
    line-height: 1.3;
  }
`;

const Facts = styled.dl`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin: 16px 0 0;
  padding-top: 24px;
  border-top: 1px solid ${paper.lineStrong};

  div {
    display: flex;
    flex-direction: column-reverse;
    gap: 4px;
  }

  dt {
    color: ${paper.inkFaint};
    font-size: 13px;
    line-height: 18px;
  }

  dd {
    margin: 0;
    font-family: ${fonts.serif};
    font-size: clamp(34px, 4vw, 48px);
    line-height: 1;
  }
`;

export function PaintingsArtist({ works, since, years }: { works: number; since: number; years: number }) {
  const t = useTranslations('paintings');
  const paragraphs = t.raw('artistSection.paragraphs') as string[];
  return (
    <ArtistSection id="artist" aria-labelledby="artist-title">
      <ArtistGrid>
        {/* Until there's a photograph of him. */}
        <Portrait role="img" aria-label={t('artistSection.portraitAlt')}>
          {t('artistSection.portraitPlaceholder')}
        </Portrait>
        <ArtistText>
          <Eyebrow>{t('artistSection.eyebrow')}</Eyebrow>
          <SectionTitle id="artist-title">{t('artistSection.title')}</SectionTitle>
          {paragraphs.map((text) => (
            <p key={text}>{text}</p>
          ))}
          <blockquote>{t('artistSection.quote')}</blockquote>
          <Facts>
            <div>
              <dt>{t('artistSection.facts.years')}</dt>
              <dd>{years}</dd>
            </div>
            <div>
              <dt>{t('artistSection.facts.works')}</dt>
              <dd>{works}</dd>
            </div>
            <div>
              <dt>{t('artistSection.facts.since')}</dt>
              <dd>{since}</dd>
            </div>
          </Facts>
        </ArtistText>
      </ArtistGrid>
    </ArtistSection>
  );
}

/* ---------- Commission band ---------- */

const Band = styled(Container)`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px 48px;
  margin-top: clamp(64px, 9vw, 120px);

  > div {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
`;

export function PaintingsCommissionBand() {
  const t = useTranslations('paintings');
  return (
    <section aria-labelledby="commission-band-title">
      <Band>
        <div>
          <SectionTitle id="commission-band-title">{t('commissionBand.title')}</SectionTitle>
          <Lead>{t('commissionBand.text')}</Lead>
        </div>
        <ButtonLink href="/commissions">{t('commissionBand.cta')}</ButtonLink>
      </Band>
    </section>
  );
}
