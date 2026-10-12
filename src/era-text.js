import { VERSE_COUNTS } from './verse-counts.js';

const SOURCE_CODES = {
  SNG: 'SOL', EZK: 'EZE', JOL: 'JOE', NAM: 'NAH', MRK: 'MAR',
  JHN: 'JOH', PHP: 'PHI', JAS: 'JAM', '1JN': '1JO',
  '2JN': '2JO', '3JN': '3JO',
};
const bookCache = new Map();

// This chapter is absent from the pinned kor_vpl.zip source. eBible's chapter
// page is also 404, so link to the edition record instead.
const ABSENT_SOURCE_CHAPTERS = new Set(['1PE 5']);

export function publicBibleChapterUrl(code, chapter) {
  if (ABSENT_SOURCE_CHAPTERS.has(`${code} ${chapter}`)) return null;
  const sourceCode = SOURCE_CODES[code] || code;
  return `https://ebible.org/kor/${sourceCode}${String(chapter).padStart(2, '0')}.htm`;
}

export async function loadPublicBibleBook(code) {
  if (!VERSE_COUNTS[code]) throw new Error('Unknown Bible book');
  if (!bookCache.has(code)) {
    bookCache.set(code, fetch(`/public/data/kor1910/${code}.json`)
      .then((response) => {
        if (!response.ok) throw new Error(`Bible text ${response.status}`);
        return response.json();
      }).catch((error) => {
        bookCache.delete(code);
        throw error;
      }));
  }
  return bookCache.get(code);
}

export function selectedPublicBibleRows(book, reference, stage = null) {
  const rows = [];
  for (let chapter = reference.chapter; chapter <= reference.endChapter; chapter += 1) {
    const start = chapter === reference.chapter ? reference.startVerse || 1 : 1;
    const end = chapter === reference.endChapter
      ? reference.endVerse || VERSE_COUNTS[reference.code][chapter - 1]
      : VERSE_COUNTS[reference.code][chapter - 1];
    for (let verse = start; verse <= end; verse += 1) {
      if (stage && (chapter !== reference.chapter || verse < stage.start || verse > stage.end)) continue;
      rows.push({ chapter, verse, text: book[String(chapter)]?.[String(verse)] || null });
    }
  }
  return rows;
}
