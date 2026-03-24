import sharp from 'sharp';
import { readdir, mkdir } from 'fs/promises';
import { join } from 'path';
import fs from 'fs';

const HERO_DIR = join(process.cwd(), 'public/hero');
const BACKUP_DIR = join(HERO_DIR, '.backup');
const MAX_DIMENSION = 768; // Sufficient for hero display, reduces file size
/** Keep full resolution; WebP is generated separately for production */
const SKIP_PNG_RESIZE = new Set(['character_container.png', 'character_color.png']);

async function optimize() {
  const files = await readdir(HERO_DIR);
  const pngFiles = files.filter((f) => f.endsWith('.png'));

  if (pngFiles.length === 0) {
    console.log('No PNG files found in public/hero');
    return;
  }

  await mkdir(BACKUP_DIR, { recursive: true });

  for (const file of pngFiles) {
    const inputPath = join(HERO_DIR, file);
    const backupPath = join(BACKUP_DIR, file);

    const meta = await sharp(inputPath).metadata();
    const inSize = fs.statSync(inputPath).size;
    const needsResize =
      !SKIP_PNG_RESIZE.has(file) &&
      ((meta.width ?? 0) > MAX_DIMENSION || (meta.height ?? 0) > MAX_DIMENSION);

    let pipeline = sharp(inputPath);
    if (needsResize) {
      pipeline = pipeline.resize(MAX_DIMENSION, MAX_DIMENSION, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    await pipeline
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toFile(backupPath);

    const outSize = fs.statSync(backupPath).size;

    if (outSize < inSize) {
      fs.renameSync(backupPath, inputPath);
      console.log(`${file}: ${(inSize / 1024).toFixed(1)}KB → ${(outSize / 1024).toFixed(1)}KB`);
    } else {
      fs.unlinkSync(backupPath);
      console.log(`${file}: kept original (${(inSize / 1024).toFixed(1)}KB)`);
    }
  }

  if (fs.existsSync(BACKUP_DIR) && fs.readdirSync(BACKUP_DIR).length === 0) {
    fs.rmdirSync(BACKUP_DIR);
  }
}

/** WebP sidecar for desktop half-cut bust (alpha, tuned for size vs quality) */
async function encodeCharacterContainerWebp() {
  const src = join(HERO_DIR, 'character_container.png');
  const dest = join(HERO_DIR, 'character_container.webp');
  if (!fs.existsSync(src)) {
    console.log('encodeCharacterContainerWebp: skip (no character_container.png)');
    return;
  }

  await sharp(src)
    .webp({
      quality: 80,
      alphaQuality: 82,
      effort: 6,
      smartSubsample: true,
    })
    .toFile(dest);

  const kb = fs.statSync(dest).size / 1024;
  console.log(`character_container.webp: ${kb.toFixed(1)}KB`);
}

/** WebP for mobile hero side characters (alpha) */
async function encodeCharacterColorWebp() {
  const src = join(HERO_DIR, 'character_color.png');
  const dest = join(HERO_DIR, 'character_color.webp');
  if (!fs.existsSync(src)) {
    console.log('encodeCharacterColorWebp: skip (no character_color.png)');
    return;
  }

  await sharp(src)
    .webp({
      quality: 80,
      alphaQuality: 82,
      effort: 6,
      smartSubsample: true,
    })
    .toFile(dest);

  const kb = fs.statSync(dest).size / 1024;
  console.log(`character_color.webp: ${kb.toFixed(1)}KB`);
}

async function main() {
  await optimize();
  await encodeCharacterContainerWebp();
  await encodeCharacterColorWebp();
}

main().catch(console.error);
