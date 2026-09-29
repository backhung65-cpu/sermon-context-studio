import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { BOOKS, CHAPTER_COUNTS, bibleReadingUrl, collectPlaceOccurrences, findPlaces, parseReference } from './reference.js';
import { VERSE_COUNTS } from './verse-counts.js';

test('Korean full and short Bible references resolve to the same passage', () => {
  assert.deepEqual(parseReference('사도행전 16:6–15'), parseReference('행 16:6-15'));
  assert.equal(parseReference('창 12').startVerse, null);
  assert.equal(parseReference('1 Corinthians 13:1').code, '1CO');
  assert.equal(parseReference('이사야 10장 15절').label, '사 10:15');
  assert.equal(parseReference('시편 23편 1-6절').label, '시 23:1–6');
});

test('invalid ranges do not silently return unrelated places', () => {
  assert.ok(parseReference('행 16:15-6').error);
  assert.ok(parseReference('창 51').error);
  assert.ok(parseReference('마 29:1').error);
  assert.ok(parseReference('요 3:16-2:2').error);
  assert.ok(parseReference('알 수 없는 책 4:1').error);
});

test('all 66 books and all 1,189 chapters accept a passage reference', () => {
  assert.equal(BOOKS.length, 66);
  assert.equal(Object.values(CHAPTER_COUNTS).reduce((sum, count) => sum + count, 0), 1189);
  assert.equal(Object.values(VERSE_COUNTS).flat().reduce((sum, count) => sum + count, 0), 31102);
  for (const book of BOOKS) {
    for (let chapter = 1; chapter <= CHAPTER_COUNTS[book.code]; chapter += 1) {
      assert.equal(parseReference(`${book.name} ${chapter}`).code, book.code);
      const lastVerse = VERSE_COUNTS[book.code][chapter - 1];
      assert.equal(parseReference(`${book.name} ${chapter}:${lastVerse}`).code, book.code);
      assert.ok(parseReference(`${book.name} ${chapter}:${lastVerse + 1}`).error);
    }
  }
});

test('place lookup stays inside the requested verses, including chapter crossings', () => {
  const data = {
    places: [{ name: 'A' }, { name: 'B' }],
    index: { 'ACT 16': { 6: [0], 7: [0, 1], 20: [1] }, 'ACT 17': { 1: [0], 2: [1], 6: [1] } },
  };
  assert.deepEqual(findPlaces(data, parseReference('행 16:6-7')).map((p) => [p.name, p.references]), [
    ['A', [{ chapter: 16, verse: 6 }, { chapter: 16, verse: 7 }]],
    ['B', [{ chapter: 16, verse: 7 }]],
  ]);
  assert.deepEqual(findPlaces(data, parseReference('행 16:7-17:2')).map((p) => [p.name, p.references]), [
    ['A', [{ chapter: 16, verse: 7 }, { chapter: 17, verse: 1 }]],
    ['B', [{ chapter: 16, verse: 7 }, { chapter: 16, verse: 20 }, { chapter: 17, verse: 2 }]],
  ].reverse());
});

test('place occurrences cover the full index once per verse in Bible order', () => {
  const data = {
    places: [{ id: 'a' }, { id: 'b' }],
    index: {
      'ACT 16': { 9: [0, 0, 1], 6: [0] },
      'GEN 12': { 5: [0] },
      'ACT 15': { 4: [0] },
    },
  };
  const occurrences = collectPlaceOccurrences(data);
  assert.deepEqual(occurrences.get('a'), [
    { code: 'GEN', chapter: 12, verse: 5 },
    { code: 'ACT', chapter: 15, verse: 4 },
    { code: 'ACT', chapter: 16, verse: 6 },
    { code: 'ACT', chapter: 16, verse: 9 },
  ]);
  assert.deepEqual(occurrences.get('b'), [{ code: 'ACT', chapter: 16, verse: 9 }]);
});

test('Bible reading links use the Korean Bible Society book and verse parameters', () => {
  assert.equal(bibleReadingUrl('GEN', 12, 5), 'https://www.bskorea.or.kr/bible/korbibReadpage.php?book=gen&chap=12&sec=5&version=GAE');
  assert.equal(bibleReadingUrl('JON', 1, 3), 'https://www.bskorea.or.kr/bible/korbibReadpage.php?book=jnh&chap=1&sec=3&version=GAE');
  assert.equal(bibleReadingUrl('ACT', 16, 9), 'https://www.bskorea.or.kr/bible/korbibReadpage.php?book=act&chap=16&sec=9&version=GAE');
  assert.throws(() => bibleReadingUrl('XYZ', 1, 1));
});

test('real data does not invent a map point for a verse without a linked place', () => {
  const data = JSON.parse(readFileSync(new URL('../public/data/openbible-places.json', import.meta.url)));
  assert.equal(findPlaces(data, parseReference('이사야 10:15')).length, 0);
  assert.ok(findPlaces(data, parseReference('이사야 10')).length > 0);
  assert.equal(findPlaces(data, parseReference('시 23')).length, 0);
  assert.equal(findPlaces(data, parseReference('요 3:16')).length, 0);
});

test('real place occurrence list includes references outside the searched passage', () => {
  const data = JSON.parse(readFileSync(new URL('../public/data/openbible-places.json', import.meta.url)));
  const jerusalem = data.places.find((place) => place.name === 'Jerusalem');
  const occurrences = collectPlaceOccurrences(data).get(jerusalem.id);
  assert.equal(occurrences.length, 768);
  assert.ok(occurrences.some((reference) => reference.code === 'JHN'));
  assert.ok(occurrences.some((reference) => reference.code === 'ZEC'));
});

test('all 31,102 single-verse queries agree with the published place index', () => {
  const data = JSON.parse(readFileSync(new URL('../public/data/openbible-places.json', import.meta.url)));
  let withPlaces = 0;
  let withCoordinates = 0;
  for (const book of BOOKS) {
    for (const [chapterIndex, lastVerse] of VERSE_COUNTS[book.code].entries()) {
      for (let verse = 1; verse <= lastVerse; verse += 1) {
        const reference = parseReference(`${book.short} ${chapterIndex + 1}:${verse}`);
        assert.equal(reference.error, undefined);
        const places = findPlaces(data, reference);
        if (places.length) withPlaces += 1;
        if (places.some((place) => place.coordinate)) withCoordinates += 1;
      }
    }
  }
  assert.equal(withPlaces, 5127);
  assert.equal(withCoordinates, 5110);
});
