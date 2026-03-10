#!/usr/bin/env tsx
/**
 * Optimize PNG/JPEG images in public folders.
 * Usage:
 *   npm run optimize:images                    # optimizes hero + selected-work
 *   npm run optimize:images -- hero            # only public/hero
 *   npm run optimize:images -- selected-work  # only public/selected-work
 */

import sharp from 'sharp';
import { readdir, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import fs from 'fs';

const DEFAULT_DIRS = ['hero', 'selected-work'];
const MAX_DIMENSION = 1200; // Good for masonry/grid display
const QUALITY = 85; // JPEG quality if converting

async function findImages(dir: string, base = ''): Promise<string[]> {
  const fullPath = join(process.cwd(), 'public', dir, base);
  if (!fs.existsSync(fullPath)) return [];
  const entries = await readdir(fullPath, { withFileTypes: true });
  const files: string[] = [];
  for (const e of entries) {
    const rel = base ? `${base}/${e.name}` : e.name;
    if (e.isFile() && /\.(png|jpe?g|webp)$/i.test(e.name)) {
      files.push(rel);
    } else if (e.isDirectory() && !e.name.startsWith('.') && e.name !== 'node_modules') {
      files.push(...(await findImages(dir, rel)));
    }
  }
  return files;
}

async function optimizeDir(dir: string) {
  const fullPath = join(process.cwd(), 'public', dir);
  if (!fs.existsSync(fullPath)) {
    console.log(`Skipping ${dir} (folder not found)`);
    return;
  }

  const files = await findImages(dir);
  if (files.length === 0) {
    console.log(`No images in public/${dir}`);
    return;
  }

  for (const file of files) {
    const inputPath = join(fullPath, file);
    const fileDir = join(fullPath, dirname(file));
    const backupDir = join(fileDir, '.backup');
    await mkdir(backupDir, { recursive: true });
    const backupPath = join(backupDir, file.split('/').pop()!);
    const ext = file.slice(file.lastIndexOf('.')).toLowerCase();

    try {
      const meta = await sharp(inputPath).metadata();
      const inSize = fs.statSync(inputPath).size;
      const needsResize =
        (meta.width ?? 0) > MAX_DIMENSION || (meta.height ?? 0) > MAX_DIMENSION;

      let pipeline = sharp(inputPath);
      if (needsResize) {
        pipeline = pipeline.resize(MAX_DIMENSION, MAX_DIMENSION, {
          fit: 'inside',
          withoutEnlargement: true,
        });
      }

      if (ext === '.png') {
        await pipeline
          .png({ compressionLevel: 9, adaptiveFiltering: true })
          .toFile(backupPath);
      } else if (ext === '.jpg' || ext === '.jpeg') {
        await pipeline
          .jpeg({ quality: QUALITY, mozjpeg: true })
          .toFile(backupPath);
      } else if (ext === '.webp') {
        await pipeline
          .webp({ quality: QUALITY })
          .toFile(backupPath);
      } else {
        continue;
      }

      const outPath = backupPath;
      if (fs.existsSync(outPath)) {
        const outSize = fs.statSync(outPath).size;
        if (outSize < inSize) {
          fs.renameSync(outPath, inputPath);
          console.log(
            `  ${file}: ${(inSize / 1024).toFixed(1)}KB → ${(outSize / 1024).toFixed(1)}KB`
          );
        } else {
          fs.unlinkSync(outPath);
          console.log(`  ${file}: kept original (${(inSize / 1024).toFixed(1)}KB)`);
        }
      }
    } catch (err) {
      console.error(`  ${file}: error`, err);
    }
  }

  // Clean empty .backup dirs
  function cleanBackups(p: string) {
    if (!fs.existsSync(p)) return;
    const entries = fs.readdirSync(p, { withFileTypes: true });
    for (const e of entries) {
      if (e.isDirectory() && e.name === '.backup') {
        const bp = join(p, e.name);
        if (fs.readdirSync(bp).length === 0) fs.rmdirSync(bp);
      } else if (e.isDirectory() && !e.name.startsWith('.')) {
        cleanBackups(join(p, e.name));
      }
    }
  }
  cleanBackups(fullPath);
}

async function main() {
  const args = process.argv.slice(2);
  const dirs = args.length > 0 ? args : DEFAULT_DIRS;

  console.log('Optimizing images...\n');
  for (const dir of dirs) {
    console.log(`public/${dir}:`);
    await optimizeDir(dir);
    console.log('');
  }
  console.log('Done.');
}

main().catch(console.error);
