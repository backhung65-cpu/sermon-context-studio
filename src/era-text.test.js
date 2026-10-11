import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ERA_STUDIES } from './era-data.js';
import { parseReference } from './reference.js';
import { VERSE_COUNTS } from './verse-counts.js';
import { selectedPublicBibleRows } from './era-text.js';

const base = new URL('../public/data/kor1910/', import.meta.url);
const readBook = (code) => JSON.parse(readFileSync(new URL(`${code}.json`, base), 'utf8'));

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
