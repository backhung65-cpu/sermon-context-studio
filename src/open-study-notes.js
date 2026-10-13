import { BOOKS } from './reference.js';
import { VERSE_COUNTS } from './verse-counts.js';

const bookCache = new Map();
const bookNumber = new Map(BOOKS.map(({ code }, index) => [code, index + 1]));
let localeIndexPromise;

export const OPEN_STUDY_NOTE_LOCALES = Object.freeze({
  en: { locale: 'en', language: 'English', path: '', review: 'professional', books: 66, records: 16_918 },
  fr: { locale: 'fr', language: 'Français', path: 'fr/', review: 'publisherTranslation', books: 66, records: 16_910 },
  es: { locale: 'es', language: 'Español', path: 'es/', review: 'publisherTranslation', books: 43, records: 13_299 },
  hi: { locale: 'hi', language: 'हिन्दी', path: 'hi/', review: 'publisherTranslation', books: 13, records: 1_020 },
  'zh-CN': { locale: 'zh-CN', language: '简体中文', path: 'zh-CN/', review: 'publisherTranslation', converted: true, books: 66, records: 16_919 },
});

export function openStudyNotesLocale(locale) {
  const source = OPEN_STUDY_NOTE_LOCALES[locale];
  if (source) return { ...source, requestedLocale: locale, isFallback: false, fallbackReason: null };
  return { ...OPEN_STUDY_NOTE_LOCALES.en, requestedLocale: locale, isFallback: locale !== 'en', fallbackReason: 'locale' };
}

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

async function loadBook(code, source) {
  const key = `${source.locale}:${code}`;
  if (!bookCache.has(key)) {
    bookCache.set(key, fetch(`/public/data/open-study-notes/${source.path}${code}.json`)
      .then((response) => {
        if (!response.ok) {
          const error = new Error(`Study notes ${response.status}`);
          error.status = response.status;
          throw error;
        }
        return response.json();
      }).catch((error) => {
        bookCache.delete(key);
        throw error;
      }));
  }
  return bookCache.get(key);
}

async function sourceHasBook(source, code) {
  if (source.locale === 'en') return true;
  localeIndexPromise ||= fetch('/public/data/open-study-notes/locales.json').then((response) => {
    if (!response.ok) throw new Error(`Study note locale index ${response.status}`);
    return response.json();
  }).catch((error) => {
    localeIndexPromise = null;
    throw error;
  });
  const index = await localeIndexPromise;
  return index.locales.find(({ locale }) => locale === source.locale)?.availableBooks?.includes(code) === true;
}

export async function loadOpenStudyNotesBook(code, locale = 'en') {
  if (!bookNumber.has(code)) throw new Error('Unknown Bible book');
  const source = openStudyNotesLocale(locale);
  if (source.locale !== 'en') {
    if (await sourceHasBook(source, code)) return { rows: await loadBook(code, source), source };
  }
  const fallback = source.locale === 'en' ? source : {
    ...OPEN_STUDY_NOTE_LOCALES.en,
    requestedLocale: locale,
    isFallback: true,
    fallbackReason: 'book',
  };
  return { rows: await loadBook(code, OPEN_STUDY_NOTE_LOCALES.en), source: fallback };
}
