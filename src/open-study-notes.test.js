import test from 'node:test';
import assert from 'node:assert/strict';
import { formatOpenStudyNoteReference, openStudyNotesLocale, referenceBounds, selectOpenStudyNotes } from './open-study-notes.js';
import { parseReference } from './reference.js';

test('selects notes whose source range intersects the requested passage', () => {
  const reference = parseReference('출애굽기 3:1-6');
  const bounds = referenceBounds(reference);
  const rows = [
    { id: 'before', start: bounds.start - 5, end: bounds.start - 1 },
    { id: 'overlap', start: bounds.start, end: bounds.start + 2 },
    { id: 'after', start: bounds.end + 1, end: bounds.end + 3 },
  ];
  assert.deepEqual(selectOpenStudyNotes(rows, reference), { scope: 'passage', rows: [rows[1]] });
});

test('uses clearly labelled chapter notes when a verse has no direct note', () => {
  const reference = parseReference('창세기 1:5');
  const chapterBounds = referenceBounds(reference, true);
  const row = { id: 'chapter', start: chapterBounds.start, end: chapterBounds.start + 2 };
  assert.deepEqual(selectOpenStudyNotes([row], reference), { scope: 'chapter', rows: [row] });
});

test('formats source ranges without losing chapter transitions', () => {
  assert.equal(formatOpenStudyNoteReference(2_003_001, 2_003_010), '3:1–10');
  assert.equal(formatOpenStudyNoteReference(2_003_022, 2_004_003), '3:22–4:3');
});

test('maps supported note languages and clearly falls back for unsupported locales', () => {
  assert.deepEqual(
    { locale: openStudyNotesLocale('fr').locale, fallback: openStudyNotesLocale('fr').isFallback },
    { locale: 'fr', fallback: false },
  );
  assert.deepEqual(
    { locale: openStudyNotesLocale('ko').locale, fallback: openStudyNotesLocale('ko').isFallback, reason: openStudyNotesLocale('ko').fallbackReason },
    { locale: 'ko', fallback: false, reason: null },
  );
  assert.equal(openStudyNotesLocale('ko').review, 'machineTranslation');
  assert.equal(openStudyNotesLocale('zh-CN').converted, true);
});
