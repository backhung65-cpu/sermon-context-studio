import { readFileSync, writeFileSync } from 'node:fs';
import { BOOKS } from '../src/reference.js';
import { VERSE_COUNTS } from '../src/verse-counts.js';

const root = new URL('../public/data/kor1910/', import.meta.url);
const source = JSON.parse(readFileSync(new URL('source.json', root), 'utf8'));
const errors = [];
const missingReferences = [];
const outOfCanonReferences = [];
const blankReferences = [];
const perBook = [];
let presentVerses = 0;
let presentChapters = 0;

for (const bookMeta of BOOKS) {
  const code = bookMeta.code;
  const chapterCounts = VERSE_COUNTS[code];
  const book = JSON.parse(readFileSync(new URL(`${code}.json`, root), 'utf8'));
  let bookPresent = 0;
  let bookMissing = 0;
  presentChapters += Object.keys(book).length;
  for (const [chapterText, rows] of Object.entries(book)) {
    const chapter = Number(chapterText);
    for (const [verseText, text] of Object.entries(rows)) {
      const verse = Number(verseText);
      presentVerses += 1;
      bookPresent += 1;
      if (!chapterCounts[chapter - 1] || verse < 1 || verse > chapterCounts[chapter - 1]) {
        outOfCanonReferences.push(`${code} ${chapter}:${verse}`);
      }
      if (!String(text).trim()) blankReferences.push(`${code} ${chapter}:${verse}`);
    }
  }
  for (let chapter = 1; chapter <= chapterCounts.length; chapter += 1) {
    for (let verse = 1; verse <= chapterCounts[chapter - 1]; verse += 1) {
      if (!book[String(chapter)]?.[String(verse)]) {
        missingReferences.push(`${code} ${chapter}:${verse}`);
        bookMissing += 1;
      }
    }
  }
  perBook.push({ code, name: bookMeta.name, verses: bookPresent, missingCanonicalVerses: bookMissing });
}

if (BOOKS.length !== 66) errors.push(`book count ${BOOKS.length}`);
if (presentChapters !== source.chapters) errors.push(`chapter total ${presentChapters} != manifest ${source.chapters}`);
if (presentVerses !== source.verses) errors.push(`verse total ${presentVerses} != manifest ${source.verses}`);
if (presentVerses !== 30_991) errors.push(`unexpected source verse total ${presentVerses}`);
if (missingReferences.length !== 111) errors.push(`unexpected canonical gaps ${missingReferences.length}`);
if (outOfCanonReferences.length) errors.push(`out-of-canon verses: ${outOfCanonReferences.slice(0, 20).join(', ')}`);
if (blankReferences.length) errors.push(`blank verses: ${blankReferences.slice(0, 20).join(', ')}`);

const report = {
  generatedAt: new Date().toISOString(),
  source: {
    title: source.title,
    url: source.source,
    sha256: source.source_sha256,
    license: source.license,
  },
  totals: {
    books: 66,
    canonicalChapters: 1_189,
    sourceChapters: presentChapters,
    canonicalVerses: 31_102,
    sourceVerses: presentVerses,
    missingCanonicalVerses: missingReferences.length,
    outOfCanonVerses: outOfCanonReferences.length,
    blankVerses: blankReferences.length,
  },
  perBook,
  missingReferences,
  outOfCanonReferences,
  blankReferences,
  errors,
};

if (process.argv.includes('--write')) {
  writeFileSync(new URL('../public/data/kor1910-audit.json', import.meta.url), `${JSON.stringify(report)}\n`);
}

console.log(`Korean 1910 full audit: ${presentVerses}/31,102 verses present; ${missingReferences.length} source gaps; ${errors.length} unexpected errors.`);
if (errors.length) {
  errors.forEach((error) => console.error(error));
  process.exitCode = 1;
}
