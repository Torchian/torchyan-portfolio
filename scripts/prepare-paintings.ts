/**
 * Turns photographs of the paintings into the site's files.
 *
 *   npm run paintings:prepare -- <folder of photos>
 *
 * For every JPEG, PNG, TIFF or WebP in the folder it writes
 * public/paintings/works/<slug>.webp — upright (camera rotation applied), the
 * long side at most 3000px so the close-ups stay sharp, WebP at quality 84 —
 * and prints a catalogue entry for each, to paste into
 * src/lib/paintings/catalogue.ts and fill in (title, year, size, story…).
 *
 * The slug comes from the file name: "Evening over the hills.jpg" becomes
 * evening-over-the-hills. Name the files the way the pages should be called.
 * Crop the photos to the painting's edge first; frames and walls stay out.
 */
import sharp from 'sharp';
import { mkdir, readdir } from 'fs/promises';
import { extname, join, parse } from 'path';

const OUT = 'public/paintings/works';
const LONG_SIDE = 3000;
const TYPES = new Set(['.jpg', '.jpeg', '.png', '.tif', '.tiff', '.webp']);

function slugify(name: string) {
  return name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  const folder = process.argv[2];
  if (!folder) {
    console.error('Usage: npm run paintings:prepare -- <folder of photos>');
    process.exit(1);
  }
  await mkdir(OUT, { recursive: true });

  const files = (await readdir(folder)).filter((f) => TYPES.has(extname(f).toLowerCase())).sort();
  const entries: string[] = [];
  for (const file of files) {
    const slug = slugify(parse(file).name);
    if (!slug) {
      console.warn(`skipped ${file}: its name has no letters or digits to make a page address from`);
      continue;
    }
    const target = join(OUT, `${slug}.webp`);
    const { width, height } = await sharp(join(folder, file))
      .rotate()
      .resize({ width: LONG_SIDE, height: LONG_SIDE, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 84 })
      .toFile(target);
    console.error(`${file} → ${target} (${width}×${height})`);
    entries.push(`  {
    slug: '${slug}',
    title: { en: '${parse(file).name.replace(/'/g, "\\'")}' },
    year: undefined,
    medium: 'oilOnCanvas',
    size: undefined, // { width: 50, height: 70 } in cm
    theme: 'landscape',
    status: 'available',
    image: { src: '/paintings/works/${slug}.webp', width: ${width}, height: ${height} },
    details: [
      { x: 0.3, y: 0.3, zoom: 3 },
      { x: 0.6, y: 0.55, zoom: 3 },
      { x: 0.45, y: 0.8, zoom: 3 },
    ],
    story: { en: '' },
  },`);
  }
  // The entries on stdout, the progress on stderr: `… > entries.txt` keeps just the entries.
  console.log(entries.join('\n'));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
