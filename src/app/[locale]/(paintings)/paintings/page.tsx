import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { resolveLocale, type LocaleParams } from '@/i18n/server';
import { FEATURED, localized, PAINTING_SINCE, PAINTINGS, type Painting } from '@/lib/paintings/catalogue';
import { paintingsMetadata } from '@/lib/paintings/metadata';
import type { Locale } from '@/i18n/routing';
import {
  PaintingsArtist,
  PaintingsCommissionBand,
  PaintingsGallery,
  PaintingsHero,
  type PaintingCard,
} from '@/components/paintings/Landing';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: 'paintings.meta' });
  return paintingsMetadata({
    locale,
    path: '/',
    title: t('home.title'),
    absoluteTitle: true,
    description: t('home.description'),
    siteName: t('siteName'),
    image: { url: FEATURED.image.src, width: FEATURED.image.width, height: FEATURED.image.height },
  });
}

/** Only what the cards show: the stories stay on the server. */
function card(painting: Painting, locale: Locale): PaintingCard {
  const { slug, year, medium, theme, image } = painting;
  return { slug, year, medium, theme, image, title: localized(painting.title, locale) };
}

export default async function PaintingsHome({ params }: LocaleParams) {
  const locale = await resolveLocale(params);
  // Newest first; undated works at the end.
  const ordered = [...PAINTINGS].sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
  return (
    <main id="main-content">
      <PaintingsHero featured={card(FEATURED, locale)} />
      <PaintingsGallery paintings={ordered.map((p) => card(p, locale))} />
      <PaintingsArtist works={PAINTINGS.length} since={PAINTING_SINCE} years={new Date().getFullYear() - PAINTING_SINCE} />
      <PaintingsCommissionBand />
    </main>
  );
}
