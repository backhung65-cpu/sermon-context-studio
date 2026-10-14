import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { BOOKS } from './reference.js';
import { VERSE_COUNTS } from './verse-counts.js';
import { selectPastoralBookGuide } from './pastoral-books.js';

const data = JSON.parse(await readFile(new URL('../public/data/pastoral-books.json', import.meta.url), 'utf8'));

test('pastoral book guide covers all 66 books and 1,189 chapters', () => {
  assert.equal(data.books.length, 66);
  assert.equal(data.coverage.books, 66);
  assert.equal(data.coverage.chapters, 1189);
  assert.deepEqual(data.books.map(({ code }) => code), BOOKS.map(({ code }) => code));
  assert.equal(data.books.reduce((sum, book) => sum + book.chapterCount, 0),
    Object.values(VERSE_COUNTS).reduce((sum, chapters) => sum + chapters.length, 0));
});

test('every guide has real content and an honest review status', () => {
  for (const book of data.books) {
    assert.equal(book.status, 'editorial-draft');
    assert.equal(book.review, 'pending');
    for (const field of ['readingDirection', 'bigFlow', 'sermonQuestion', 'interpretationCaution']) {
      assert.ok(book[field].length >= 20, `${book.code}.${field}`);
      assert.doesNotMatch(book[field], /TODO|TBD|작성\s*대기|나중에/i);
    }
  }
});

test('guide selection follows the requested Bible book', () => {
  assert.equal(selectPastoralBookGuide(data, 'EXO').name, '출애굽기');
  assert.match(selectPastoralBookGuide(data, 'EXO').interpretationCaution, /출애굽 경로/);
  assert.equal(selectPastoralBookGuide(data, 'REV').name, '요한계시록');
  assert.equal(selectPastoralBookGuide(data, 'XXX'), null);
});

