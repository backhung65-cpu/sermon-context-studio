import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BOOKS } from '../src/reference.js';
import { VERSE_COUNTS } from '../src/verse-counts.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const directory = join(root, 'public/data/open-study-notes');
const metadata = JSON.parse(await readFile(join(directory, 'source.json'), 'utf8'));
const errors = [];
const chapterGaps = [];
let total = 0;

for (const [bookIndex, book] of BOOKS.entries()) {
  const rows = JSON.parse(await readFile(join(directory, `${book.code}.json`), 'utf8'));
  total += rows.length;
  const bookBase = (bookIndex + 1) * 1_000_000;
  for (const row of rows) {
    if (!row.id || !row.title || !row.text || !Number.isInteger(row.start) || !Number.isInteger(row.end)) {
      errors.push(`${book.code}: malformed row ${row.id || '(no id)'}`);
      continue;
    }
    if (row.start < bookBase || row.end >= bookBase + 1_000_000 || row.end < row.start) {
      errors.push(`${book.code}: invalid range ${row.start}-${row.end}`);
    }
  }
  for (const [chapterIndex, verseCount] of VERSE_COUNTS[book.code].entries()) {
    const chapter = chapterIndex + 1;
    const start = bookBase + chapter * 1_000 + 1;
    const end = bookBase + chapter * 1_000 + verseCount;
    if (!rows.some((row) => row.start <= end && row.end >= start)) chapterGaps.push(`${book.code} ${chapter}`);
  }
}

if (metadata.books !== 66) errors.push(`metadata books: ${metadata.books}`);
if (metadata.records !== total) errors.push(`metadata records ${metadata.records} != files ${total}`);
if (metadata.commit !== 'bbb3f86016cd20913f410a95af63d9f7ff9a71d6') errors.push('unexpected source commit');
if (chapterGaps.length) errors.push(`chapters without a source note (${chapterGaps.length}): ${chapterGaps.join(', ')}`);

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Open Study Notes audit passed: ${BOOKS.length} books, ${total} records, 1,189 chapters covered.`);
}
