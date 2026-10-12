import { BOOKS } from './reference.js';
import { VERSE_COUNTS } from './verse-counts.js';

const bookCache = new Map();
const bookNumber = new Map(BOOKS.map(({ code }, index) => [code, index + 1]));

function point(code, chapter, verse) {
  const number = bookNumber.get(code);
  if (!number) throw new Error('Unknown Bible book');
  return number * 1_000_000 + chapter * 1_000 + verse;
}

export function referenceBounds(reference, chapterOnly = false) {
  const startChapter = reference.chapter;
  const endChapter = chapterOnly ? reference.chapter : reference.endChapter;
  const startVerse = chapterOnly ? 1 : reference.startVerse || 1;
  const endVerse = chapterOnly
    ? VERSE_COUNTS[reference.code][startChapter - 1]
    : reference.endVerse || VERSE_COUNTS[reference.code][endChapter - 1];
  return {
    start: point(reference.code, startChapter, startVerse),
    end: point(reference.code, endChapter, endVerse),
  };
}

function overlaps(row, bounds) {
  return row.start <= bounds.end && row.end >= bounds.start;
}

export function selectOpenStudyNotes(rows, reference) {
  const direct = rows.filter((row) => overlaps(row, referenceBounds(reference)));
  if (direct.length || reference.startVerse === null) return { scope: 'passage', rows: direct };
  const chapter = rows.filter((row) => overlaps(row, referenceBounds(reference, true)));
  return { scope: 'chapter', rows: chapter };
}

export function formatOpenStudyNoteReference(value, end = value) {
  const chapter = Math.floor((value % 1_000_000) / 1_000);
  const verse = value % 1_000;
  const endChapter = Math.floor((end % 1_000_000) / 1_000);
  const endVerse = end % 1_000;
  if (chapter === endChapter && verse === endVerse) return `${chapter}:${verse}`;
  return chapter === endChapter ? `${chapter}:${verse}–${endVerse}` : `${chapter}:${verse}–${endChapter}:${endVerse}`;
}

export async function loadOpenStudyNotesBook(code) {
  if (!bookNumber.has(code)) throw new Error('Unknown Bible book');
  if (!bookCache.has(code)) {
    bookCache.set(code, fetch(`/public/data/open-study-notes/${code}.json`)
      .then((response) => {
        if (!response.ok) throw new Error(`Study notes ${response.status}`);
        return response.json();
      }).catch((error) => {
        bookCache.delete(code);
        throw error;
      }));
  }
  return bookCache.get(code);
}
