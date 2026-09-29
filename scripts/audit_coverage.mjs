import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { BOOKS, CHAPTER_COUNTS, findPlaces, parseReference } from '../src/reference.js';
import { VERSE_COUNTS } from '../src/verse-counts.js';

const data = JSON.parse(readFileSync(new URL('../public/data/openbible-places.json', import.meta.url), 'utf8'));
const KJV_TOTAL_VERSES = 31102;
const CANONICAL_CHAPTERS = Object.values(CHAPTER_COUNTS).reduce((sum, count) => sum + count, 0);
const chapters = Object.entries(data.index).filter(([, verses]) => Object.keys(verses).length > 0);
for (const [key, verses] of chapters) {
  const [code, chapterText] = key.split(' ');
  const chapter = Number(chapterText);
  const lastVerse = VERSE_COUNTS[code]?.[chapter - 1];
  if (!lastVerse) throw new Error(`Invalid indexed chapter: ${key}`);
  for (const [verseText, ids] of Object.entries(verses)) {
    const verse = Number(verseText);
    if (!Number.isInteger(verse) || verse < 1 || verse > lastVerse) throw new Error(`Invalid indexed verse: ${key}:${verseText}`);
    if (!Array.isArray(ids) || ids.some((id) => !Number.isInteger(id) || id < 0 || id >= data.places.length)) {
      throw new Error(`Invalid place reference: ${key}:${verseText}`);
    }
  }
}
for (const place of data.places) {
  if (place.coordinate && (place.coordinate[0] < -180 || place.coordinate[0] > 180
    || place.coordinate[1] < -90 || place.coordinate[1] > 90)) throw new Error(`Invalid coordinate: ${place.id}`);
  if (place.photo && (!place.photo.url.startsWith('https://a.openbible.info/geo/images/512/')
    || !place.photo.sourceUrl.startsWith('https://commons.wikimedia.org/wiki/File:')
    || !place.photo.licenseUrl.startsWith('https://creativecommons.org/'))) {
    throw new Error(`Invalid photo source or license: ${place.id}`);
  }
}
const bookCodes = new Set(chapters.map(([key]) => key.split(' ')[0]));
const indexedVerses = chapters.reduce((sum, [, verses]) => sum + Object.keys(verses).length, 0);
const versesWithCoordinates = chapters.reduce((sum, [, verses]) => sum + Object.values(verses)
  .filter((ids) => ids.some((id) => data.places[id]?.coordinate)).length, 0);

const result = {
  source: data.source,
  sourceUrl: data.sourceUrl,
  referenceCanon: 'KJV, https://bible.helloao.org/api/eng_kjv/books.json',
  books: { accepted: BOOKS.length, withLinkedPlaces: bookCodes.size },
  chapters: { total: CANONICAL_CHAPTERS, withLinkedPlaces: chapters.length },
  verses: {
    kjvTotal: KJV_TOTAL_VERSES,
    withLinkedPlaces: indexedVerses,
    withMappableCoordinates: versesWithCoordinates,
    linkedPercentOfKjv: Number((indexedVerses / KJV_TOTAL_VERSES * 100).toFixed(1)),
  },
  places: { total: data.places.length, withCoordinates: data.places.filter((place) => place.coordinate).length },
  photosWithIndividualCredits: data.places.filter((place) => place.photo).length,
  booksWithoutLinkedPlaces: BOOKS.filter((book) => !bookCodes.has(book.code)).map((book) => book.name),
  sampleQueries: Object.fromEntries(['이사야 10:15', '이사야 10', '시 23', '요 3:16', '창 12:1-9', '행 16:6-15']
    .map((query) => [query, findPlaces(data, parseReference(query)).length])),
};

const rawPath = process.argv[2];
if (rawPath) {
  const rawVerses = new Set();
  const fiveTranslationVerses = new Set();
  for (const line of readFileSync(resolve(rawPath), 'utf8').split('\n')) {
    if (!line.trim()) continue;
    for (const verse of JSON.parse(line).verses || []) {
      if (!verse.usx) continue;
      rawVerses.add(verse.usx);
      if ((verse.translations || []).length >= 5) fiveTranslationVerses.add(verse.usx);
    }
  }
  result.rawSourceVerses = { anyTranslation: rawVerses.size, atLeastFiveTranslations: fiveTranslationVerses.size };
}

console.log(JSON.stringify(result, null, 2));
