/**
 * Makes the case hero carousel's images (see
 * src/components/sections/case-study/carousel.ts): for every image in every
 * case's carousel, a WebP cropped to the shape it's shown in (from the top, as
 * the carousel frames it) at twice its desktop size.
 *
 *   npm run images:carousel
 *
 * Files already there are left alone; delete one to remake it.
 */
import sharp from 'sharp';
import { access, mkdir } from 'fs/promises';
import { join } from 'path';
import { CASE_STUDIES } from '../src/components/sections/case-study/caseStudyConfig';
import { carouselRows, carouselSize, carouselSrc } from '../src/components/sections/case-study/carousel';

const PUBLIC = 'public';

async function exists(path: string) {
  return access(path).then(
    () => true,
    () => false,
  );
}

async function main() {
  await mkdir(join(PUBLIC, 'projects/carousel'), { recursive: true });
  const seen = new Set<string>();
  let made = 0;
  let bytes = 0;
  for (const [slug, imagery] of Object.entries(CASE_STUDIES)) {
    for (const image of carouselRows(imagery?.carousel ?? []).flat()) {
      const target = join(PUBLIC, carouselSrc(image));
      if (seen.has(target)) continue;
      seen.add(target);
      if (await exists(target)) continue;
      const { width, height } = carouselSize(image);
      const info = await sharp(join(PUBLIC, image.src))
        .resize({ width, height, fit: 'cover', position: 'top' })
        .webp({ quality: 62, effort: 6, smartSubsample: true })
        .toFile(target);
      made += 1;
      bytes += info.size;
      console.log(`${slug}: ${image.src} → ${target} (${width}×${height}, ${Math.round(info.size / 1024)} KB)`);
    }
  }
  console.log(`${seen.size} carousel images, ${made} made (${Math.round(bytes / 1024)} KB)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
