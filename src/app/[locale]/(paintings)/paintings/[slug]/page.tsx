import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { resolveLocale } from '@/i18n/server';
import type { Locale } from '@/i18n/routing';
import { getPainting, localized, neighbours, PAINTINGS, type Painting } from '@/lib/paintings/catalogue';
import { paintingsMetadata } from '@/lib/paintings/metadata';
import type { PaintingCard } from '@/components/paintings/Landing';
import { PaintingPage } from '@/components/paintings/PaintingPage';

interface Params {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  return PAINTINGS.map(({ slug }) => ({ slug }));
}


function card(painting: Painting, locale: Locale): PaintingCard {
  const { slug, year, medium, theme, image } = painting;
  return { slug, year, medium, theme, image, title: localized(painting.title, locale) };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const locale = await resolveLocale(params);
  const painting = getPainting(slug);
  if (!painting) return {};
  const t = await getTranslations({ locale, namespace: 'paintings' });
  const title = localized(painting.title, locale);
  return paintingsMetadata({
    locale,
    path: `/${slug}`,
    title,
    description: t('meta.painting.description', {
      title,
      year: painting.year ?? '',
      medium: t(`media.${painting.medium}`),
    }),
    siteName: t('meta.siteName'),
    image: { url: painting.image.src, width: painting.image.width, height: painting.image.height },
  });
}

export default async function PaintingRoute({ params }: Params) {
  const { slug } = await params;
  const locale = await resolveLocale(params);
  const painting = getPainting(slug);
  if (!painting) notFound();

  const { previous, next } = neighbours(slug);
  // Four others, starting after this one, so each painting suggests different ones.
  const index = PAINTINGS.indexOf(painting);
  const more = Array.from({ length: Math.min(4, PAINTINGS.length - 1) }, (_, i) => PAINTINGS[(index + 2 + i) % PAINTINGS.length])
    .filter((p) => p !== painting)
    .map((p) => card(p, locale));

  return (
    <PaintingPage
      painting={{
        slug,
        title: localized(painting.title, locale),
        year: painting.year,
        medium: painting.medium,
        theme: painting.theme,
        size: painting.size,
        status: painting.status,
        image: painting.image,
        details: painting.details.map((d) => ({ ...d, caption: localized(d.caption, locale) })),
        story: localized(painting.story, locale)
          .split(/\n\s*\n/)
          .map((p) => p.trim())
          .filter(Boolean),
      }}
      previous={card(previous, locale)}
      next={card(next, locale)}
      more={more}
    />
  );
}
