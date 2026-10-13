import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BOOKS } from '../src/reference.js';
import { VERSE_COUNTS } from '../src/verse-counts.js';

const COMMIT = 'bbb3f86016cd20913f410a95af63d9f7ff9a71d6';
const REPOSITORY = 'https://github.com/BibleAquifer/AquiferOpenStudyNotes';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'public/data/open-study-notes');
if (relative(root, output).replaceAll('\\', '/') !== 'public/data/open-study-notes') {
  throw new Error('Unexpected study-note output path');
}

const entities = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', hellip: '…',
  ndash: '–', mdash: '—', lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”',
};

function decodeEntities(value) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, decimal) => String.fromCodePoint(Number(decimal)))
    .replace(/&([a-z]+);/gi, (match, name) => entities[name.toLowerCase()] ?? match);
}

function htmlToText(value) {
  return decodeEntities(String(value || ''))
    .replace(/<\s*br\s*\/?\s*>/gi, '\n')
    .replace(/<\s*li\b[^>]*>/gi, '\n• ')
    .replace(/<\/\s*(p|div|h[1-6]|li|ul|ol|blockquote)\s*>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/\r/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

let normalizedChapterEnds = 0;

function parsePoint(value, expectedBook, code, isEnd = false) {
  if (!/^\d{8}$/.test(value)) throw new Error(`Unexpected reference point: ${value}`);
  const book = Number(value.slice(0, 2));
  const chapter = Number(value.slice(2, 5));
  let verse = Number(value.slice(5, 8));
  const verseCount = VERSE_COUNTS[code]?.[chapter - 1];
  if (isEnd && verse === 999 && verseCount) {
    verse = verseCount;
    normalizedChapterEnds += 1;
  }
  if (book !== expectedBook || !verseCount || verse < 1 || verse > verseCount) {
    throw new Error(`Invalid reference point: ${value}`);
  }
  return expectedBook * 1_000_000 + chapter * 1_000 + verse;
}

function compactRecord(record, expectedBook, code) {
  const parts = String(record.index_reference || '').split('-');
  if (parts.length < 1 || parts.length > 2) throw new Error(`Unexpected reference: ${record.index_reference}`);
  const start = parsePoint(parts[0], expectedBook, code);
  const end = parsePoint(parts[1] || parts[0], expectedBook, code, parts.length === 2);
  if (end < start) throw new Error(`Reversed reference: ${record.index_reference}`);
  const text = htmlToText(record.content);
  if (!text) throw new Error(`Empty note: ${record.content_id}`);
  return {
    id: String(record.content_id),
    title: htmlToText(record.title) || 'Study note',
    start,
    end,
    text,
  };
}

await mkdir(output, { recursive: true });
let total = 0;
let professionalSourceRecords = 0;
const excludedRecords = [];
const perBook = [];
for (const [index, book] of BOOKS.entries()) {
  const number = String(index + 1).padStart(2, '0');
  const url = `https://raw.githubusercontent.com/BibleAquifer/AquiferOpenStudyNotes/${COMMIT}/eng/json/${number}.content.json`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${book.code}: source returned ${response.status}`);
  const sourceRows = await response.json();
  if (!Array.isArray(sourceRows)) throw new Error(`${book.code}: source is not an array`);
  const professionalRows = sourceRows.filter((record) => record.review_level === 'Professional');
  professionalSourceRecords += professionalRows.length;
  const rows = [];
  for (const record of professionalRows) {
    try { rows.push(compactRecord(record, index + 1, book.code)); }
    catch (error) {
      excludedRecords.push({
        code: book.code,
        id: String(record.content_id),
        indexReference: String(record.index_reference),
        reason: error.message,
      });
    }
  }
  rows.sort((a, b) => a.start - b.start || a.end - b.end || a.title.localeCompare(b.title));
  total += rows.length;
  perBook.push({ code: book.code, records: rows.length });
  await writeFile(join(output, `${book.code}.json`), JSON.stringify(rows));
  console.log(`${book.code}: ${rows.length}`);
}

const metadata = {
  source: 'Aquifer Open Study Notes',
  repository: REPOSITORY,
  commit: COMMIT,
  license: 'CC BY-SA 4.0',
  language: 'eng',
  credits: 'Adapted by Mission Mutual from Tyndale Open Study Notes',
  importedAt: '2026-10-13',
  books: BOOKS.length,
  records: total,
  professionalSourceRecords,
  excludedRecords,
  normalizedChapterEnds,
  perBook,
};
await writeFile(join(output, 'source.json'), JSON.stringify(metadata));
console.log(`Imported ${total} valid records from ${professionalSourceRecords} professional-review source records across ${BOOKS.length} books; excluded ${excludedRecords.length}.`);
