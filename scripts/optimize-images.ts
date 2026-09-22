#!/usr/bin/env tsx
/**
 * Prepares images for the site: right-sized, WebP, no metadata.
 *
 *   npm run images                          # everything under public/projects
 *   npm run images -- public/projects/ginosi public/hero
 *   npm run images -- --dry                 # report only, change nothing
 *
 * Drop screenshots in (PNG, JPEG or WebP, any size) and run it. For each one:
 *  - It's sized to twice the largest size the site draws that kind of image,
 *    judged by its shape: desktop screens 1600px wide, phone screens 720px, long
 *    full-page captures 1200px. Anything already smaller is left at its size.
 *  - It's encoded as WebP (quality 80, highest effort), metadata stripped.
 *  - A PNG or JPEG becomes a .webp beside it, and the original moves to
 *    .originals/ (git-ignored) so nothing is lost. An existing WebP is only
 *    rewritten when that saves at least 10%.
 *
 * These are the masters. next/image makes the per-screen copies from them (AVIF
 * or WebP, at the width each device needs), so the masters only need to be
 * sharp enough for the largest one.
 *
 * When you replace an image, give it a new file name rather than overwriting:
 * encoded copies are cached for 31 days (next.config.ts).
 */

import sharp from 'sharp';
import { mkdir, readdir, rename, stat, writeFile } from 'fs/promises';
import { basename, dirname, extname, join, relative } from 'path';

const QUALITY = 80;
const MIN_SAVING = 0.1;

/** Max width by shape (width ÷ height). */
function maxWidth(aspect: number): { kind: string; width: number } {
  if (aspect < 0.35) return { kind: 'page', width: 1200 };
  if (aspect < 0.8) return { kind: 'phone', width: 720 };
  return { kind: 'desktop', width: 1600 };
}

async function* walk(dir: string): AsyncGenerator<string> {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (/\.(png|jpe?g|webp)$/i.test(entry.name)) yield path;
  }
}

const kb = (bytes: number) => `${Math.round(bytes / 1024)} KB`;

async function main() {
  const args = process.argv.slice(2);
  const dry = args.includes('--dry');
  const dirs = args.filter((a) => !a.startsWith('--'));
  const roots = (dirs.length ? dirs : ['public/projects']).map((d) => join(process.cwd(), d));

  let before = 0;
  let after = 0;
  const rows: string[] = [];

  for (const root of roots) {
    for await (const file of walk(root)) {
      const ext = extname(file).toLowerCase();
      const input = await stat(file);
      const meta = await sharp(file).metadata();
      if (!meta.width || !meta.height) continue;

      const { kind, width } = maxWidth(meta.width / meta.height);
      const target = Math.min(meta.width, width);
      const buffer = await sharp(file)
        .rotate()
        .resize({ width: target, withoutEnlargement: true })
        .webp({ quality: QUALITY, effort: 6, smartSubsample: true })
        .toBuffer();

      const isWebp = ext === '.webp';
      const worth = !isWebp || meta.width > width || buffer.length < input.size * (1 - MIN_SAVING);
      before += input.size;
      after += worth ? buffer.length : input.size;
      rows.push(
        `${worth ? (dry ? 'would write' : 'written   ') : 'kept      '}  ${kind.padEnd(7)} ${String(meta.width).padStart(5)} → ${String(target).padStart(4)}px  ${kb(input.size).padStart(8)} → ${kb(worth ? buffer.length : input.size).padStart(7)}  ${relative(process.cwd(), file)}`,
      );
      if (!worth || dry) continue;

      const out = isWebp ? file : join(dirname(file), `${basename(file, ext)}.webp`);
      if (!isWebp) {
        const originals = join(dirname(file), '.originals');
        await mkdir(originals, { recursive: true });
        await rename(file, join(originals, basename(file)));
      }
      await writeFile(out, buffer);
    }
  }

  console.log(rows.join('\n'));
  console.log(`\n${rows.length} images: ${kb(before)} → ${kb(after)}${dry ? ' (dry run)' : ''}`);
  if (!dry && rows.some((r) => /\.(png|jpe?g)$/i.test(r))) {
    console.log('PNG/JPEG sources became .webp: update their paths in the code.');
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
