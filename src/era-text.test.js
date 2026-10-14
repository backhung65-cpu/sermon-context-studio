import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ERA_STUDIES } from './era-data.js';
import { parseReference } from './reference.js';
import { VERSE_COUNTS } from './verse-counts.js';
import { publicBibleChapterUrl, selectedPublicBibleRows } from './era-text.js';

const base = new URL('../public/data/kor1910/', import.meta.url);
const readBook = (code) => JSON.parse(readFileSync(new URL(`${code}.json`, base), 'utf8'));
const fallback = JSON.parse(readFileSync(new URL('../public/data/kjv-fallback.json', import.meta.url), 'utf8')).verses;

test('public Bible import identifies its source and covers each of the five reviewed chapters', () => {
  const source = JSON.parse(readFileSync(new URL('source.json', base), 'utf8'));
  assert.equal(source.books, 66);
  assert.equal(source.verses, 30991);
  assert.match(source.source, /^https:\/\/ebible\.org\//);
  for (const study of ERA_STUDIES) {
    const expected = VERSE_COUNTS[study.code][study.chapter - 1];
    const rows = readBook(study.code)[study.chapter];
    assert.equal(Object.keys(rows).length, expected, `${study.id} has incomplete text`);
    for (let verse = 1; verse <= expected; verse += 1) {
      assert.ok(rows[verse]?.trim(), `${study.id} missing ${verse}`);
    }
    assert.ok(study.furtherReading?.url.startsWith('https://'), `${study.id} missing external reading`);
  }
});

test('reader preserves selected verse range and exposes missing source verses', () => {
  const acts = parseReference('행 16:6-15');
  const book = readBook('ACT');
  const stage = { start: 6, end: 10 };
  assert.deepEqual(selectedPublicBibleRows(book, acts, stage).map(({ verse }) => verse), [6, 7, 8, 9, 10]);
  assert.equal(selectedPublicBibleRows(book, acts).length, 10);

  const genesis = selectedPublicBibleRows(readBook('GEN'), parseReference('창 30'));
  assert.equal(genesis.length, 43);
  assert.equal(genesis.filter(({ text }) => !text).length, 12);
  assert.equal(genesis.find(({ verse }) => verse === 32).text, null);
});

test('source link never points to the absent 1 Peter 5 chapter page', () => {
  assert.equal(publicBibleChapterUrl('1PE', 5), null);
  assert.equal(publicBibleChapterUrl('EXO', 3), 'https://ebible.org/kor/EXO03.htm');
});

test('KJV fallback fills every Korean-source gap without being labelled Korean', () => {
  let rows = 0;
  let fallbacks = 0;
  for (const [code, chapterCounts] of Object.entries(VERSE_COUNTS)) {
    const book = readBook(code);
    for (let chapter = 1; chapter <= chapterCounts.length; chapter += 1) {
      const reference = { code, chapter, endChapter: chapter, startVerse: null, endVerse: null };
      const selected = selectedPublicBibleRows(book, reference, null, fallback);
      rows += selected.length;
      fallbacks += selected.filter((row) => row.language === 'en').length;
      assert.equal(selected.filter((row) => !row.text).length, 0, `${code} ${chapter} still has a text gap`);
    }
  }
  assert.equal(rows, 31_102);
  assert.equal(fallbacks, 111);
});

test('every published Korean book file has valid verse keys and matches the pinned source totals', () => {
  const source = JSON.parse(readFileSync(new URL('source.json', base), 'utf8'));
  let chapters = 0;
  let verses = 0;
  for (const [code, chapterCounts] of Object.entries(VERSE_COUNTS)) {
    const book = readBook(code);
    chapters += Object.keys(book).length;
    for (const [chapterKey, rows] of Object.entries(book)) {
      const chapter = Number(chapterKey);
      assert.ok(Number.isInteger(chapter) && chapter >= 1 && chapter <= chapterCounts.length, `${code} ${chapterKey}`);
      for (const [verseKey, text] of Object.entries(rows)) {
        const verse = Number(verseKey);
        assert.ok(Number.isInteger(verse) && verse >= 1 && verse <= chapterCounts[chapter - 1], `${code} ${chapter}:${verseKey}`);
        assert.ok(typeof text === 'string' && text.trim(), `${code} ${chapter}:${verse} blank`);
        verses += 1;
      }
    }
  }
  assert.equal(Object.keys(VERSE_COUNTS).length, source.books);
  assert.equal(chapters, source.chapters);
  assert.equal(verses, source.verses);
});
