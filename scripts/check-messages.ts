/**
 * Keeps the translations in step with English: fails if messages/ru.json or
 * messages/hy.json is missing a key messages/en.json has (or has one it
 * doesn't), has a list of a different length, a string where English has an
 * object, an empty string, or different {placeholders} / <tags>.
 *
 *   npm run check:messages
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

const REFERENCE = 'en';
const TRANSLATIONS = ['ru', 'hy'];

function load(locale: string): Json {
  return JSON.parse(readFileSync(join(process.cwd(), 'messages', `${locale}.json`), 'utf8'));
}

function kind(value: Json) {
  if (Array.isArray(value)) return 'list';
  return value === null ? 'null' : typeof value;
}

/** Placeholders ({year}) and rich-text tags (<name>) must survive translation. */
function tokens(text: string) {
  return (text.match(/\{\w+\}|<\/?\w+>/g) ?? []).sort().join(' ');
}

function compare(reference: Json, other: Json, path: string, problems: string[]) {
  if (kind(reference) !== kind(other)) {
    problems.push(`${path}: expected ${kind(reference)}, found ${kind(other)}`);
    return;
  }

  if (Array.isArray(reference) && Array.isArray(other)) {
    if (reference.length !== other.length) {
      problems.push(`${path}: expected ${reference.length} items, found ${other.length}`);
    }
    reference.forEach((item, i) => {
      if (i < other.length) compare(item, other[i], `${path}[${i}]`, problems);
    });
    return;
  }

  if (typeof reference === 'string' && typeof other === 'string') {
    if (!other.trim()) problems.push(`${path}: empty`);
    if (tokens(reference) !== tokens(other)) {
      problems.push(`${path}: placeholders differ (${tokens(reference) || 'none'} → ${tokens(other) || 'none'})`);
    }
    return;
  }

  if (kind(reference) === 'object') {
    const ref = reference as Record<string, Json>;
    const oth = other as Record<string, Json>;
    for (const key of Object.keys(ref)) {
      const child = path ? `${path}.${key}` : key;
      if (!(key in oth)) problems.push(`${child}: missing`);
      else compare(ref[key], oth[key], child, problems);
    }
    for (const key of Object.keys(oth)) {
      if (!(key in ref)) problems.push(`${path ? `${path}.` : ''}${key}: not in ${REFERENCE}.json`);
    }
  }
}

const reference = load(REFERENCE);
let failed = false;

for (const locale of TRANSLATIONS) {
  const problems: string[] = [];
  compare(reference, load(locale), '', problems);
  if (problems.length) {
    failed = true;
    console.error(`messages/${locale}.json — ${problems.length} problem(s):`);
    for (const problem of problems) console.error(`  ${problem}`);
  } else {
    console.log(`messages/${locale}.json matches ${REFERENCE}.json`);
  }
}

process.exit(failed ? 1 : 0);
