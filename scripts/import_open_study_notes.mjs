import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import OpenCC from 'opencc-js';
import { BOOKS } from '../src/reference.js';
import { VERSE_COUNTS } from '../src/verse-counts.js';

const COMMIT = 'bbb3f86016cd20913f410a95af63d9f7ff9a71d6';
const REPOSITORY = 'https://github.com/BibleAquifer/AquiferOpenStudyNotes';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'public/data/open-study-notes');
if (relative(root, output).replaceAll('\\', '/') !== 'public/data/open-study-notes') throw new Error('Unexpected study-note output path');

const traditionalToSimplified = OpenCC.Converter({ from: 'tw', to: 'cn' });
const SOURCES = [
  { locale: 'en', sourceLanguage: 'eng', language: 'English', output, professionalOnly: true },
  { locale: 'fr', sourceLanguage: 'fra', language: 'Français' },
  { locale: 'es', sourceLanguage: 'spa', language: 'Español' },
  { locale: 'hi', sourceLanguage: 'hin', language: 'हिन्दी' },
  {
    locale: 'zh-CN', sourceLanguage: 'zht', language: '简体中文', transform: traditionalToSimplified,
    adaptation: 'Aquifer zht source converted from Traditional to Simplified Chinese with opencc-js 1.4.2 (tw → cn).',
  },
];

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

function parsePoint(value, expectedBook, code, isEnd, stats) {
  if (!/^\d{8}$/.test(value)) throw new Error(`Unexpected reference point: ${value}`);
  const book = Number(value.slice(0, 2));
  const chapter = Number(value.slice(2, 5));
  let verse = Number(value.slice(5, 8));
  const verseCount = VERSE_COUNTS[code]?.[chapter - 1];
  if (isEnd && verse === 999 && verseCount) {
    verse = verseCount;
    stats.normalizedChapterEnds += 1;
  }
  if (book !== expectedBook || !verseCount || verse < 1 || verse > verseCount) throw new Error(`Invalid reference point: ${value}`);
  return expectedBook * 1_000_000 + chapter * 1_000 + verse;
}

function compactRecord(record, expectedBook, code, source, stats) {
  const parts = String(record.index_reference || '').split('-');
  if (parts.length < 1 || parts.length > 2) throw new Error(`Unexpected reference: ${record.index_reference}`);
  const start = parsePoint(parts[0], expectedBook, code, false, stats);
  const end = parsePoint(parts[1] || parts[0], expectedBook, code, parts.length === 2, stats);
  if (end < start) throw new Error(`Reversed reference: ${record.index_reference}`);
  const transform = source.transform || ((value) => value);
  const text = transform(htmlToText(record.content));
  if (!text) throw new Error(`Empty note: ${record.content_id}`);
  return { id: String(record.content_id), title: transform(htmlToText(record.title) || 'Study note'), start, end, text };
}

async function importLanguage(source) {
  const target = source.output || join(output, source.locale);
  if (source.locale !== 'en') await rm(target, { recursive: true, force: true });
  await mkdir(target, { recursive: true });
  const stats = { normalizedChapterEnds: 0 };
  let total = 0;
  let sourceRecords = 0;
  const reviewLevels = {};
  const excludedRecords = [];
  const perBook = [];

  for (const [index, book] of BOOKS.entries()) {
    const number = String(index + 1).padStart(2, '0');
    const url = `https://raw.githubusercontent.com/BibleAquifer/AquiferOpenStudyNotes/${COMMIT}/${source.sourceLanguage}/json/${number}.content.json`;
    const response = await fetch(url);
    if (response.status === 404) {
      perBook.push({ code: book.code, records: 0, available: false });
      continue;
    }
    if (!response.ok) throw new Error(`${source.locale}/${book.code}: source returned ${response.status}`);
    const allRows = await response.json();
    if (!Array.isArray(allRows)) throw new Error(`${source.locale}/${book.code}: source is not an array`);
    for (const record of allRows) reviewLevels[record.review_level || 'Unspecified'] = (reviewLevels[record.review_level || 'Unspecified'] || 0) + 1;
    const sourceRows = source.professionalOnly ? allRows.filter((record) => record.review_level === 'Professional') : allRows;
    sourceRecords += sourceRows.length;
    const rows = [];
    for (const record of sourceRows) {
      try { rows.push(compactRecord(record, index + 1, book.code, source, stats)); }
      catch (error) {
        excludedRecords.push({ code: book.code, id: String(record.content_id), indexReference: String(record.index_reference), reason: error.message });
      }
    }
    rows.sort((a, b) => a.start - b.start || a.end - b.end || a.title.localeCompare(b.title, source.locale));
    total += rows.length;
    perBook.push({ code: book.code, records: rows.length, available: true });
    await writeFile(join(target, `${book.code}.json`), JSON.stringify(rows));
    console.log(`${source.locale}/${book.code}: ${rows.length}`);
  }

  const metadata = {
    source: 'Aquifer Open Study Notes', repository: REPOSITORY, commit: COMMIT, license: 'CC BY-SA 4.0',
    locale: source.locale, sourceLanguage: source.sourceLanguage, language: source.language,
    reviewPolicy: source.professionalOnly ? 'Only records marked Professional' : 'All publisher-provided translated records; source review status retained in aggregate metadata',
    reviewLevels, adaptation: source.adaptation || null,
    credits: 'Adapted by Mission Mutual from Tyndale Open Study Notes', importedAt: '2026-10-14',
    books: perBook.filter((book) => book.available).length, records: total, sourceRecords,
    professionalSourceRecords: source.professionalOnly ? sourceRecords : null,
    excludedRecords, normalizedChapterEnds: stats.normalizedChapterEnds, perBook,
  };
  await writeFile(join(target, 'source.json'), JSON.stringify(metadata));
  return metadata;
}

await mkdir(output, { recursive: true });
const locales = [];
for (const source of SOURCES) locales.push(await importLanguage(source));
await writeFile(join(output, 'locales.json'), JSON.stringify({
  source: 'Aquifer Open Study Notes', repository: REPOSITORY, commit: COMMIT, license: 'CC BY-SA 4.0',
  locales: locales.map(({ locale, sourceLanguage, language, books, records, reviewLevels, adaptation, perBook }) => ({
    locale, sourceLanguage, language, books, records, reviewLevels, adaptation,
    availableBooks: perBook.filter(({ available }) => available).map(({ code }) => code),
  })),
}));
console.log(locales.map(({ locale, books, records }) => `${locale}: ${records} records / ${books} books`).join('\n'));
