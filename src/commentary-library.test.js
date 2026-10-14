import test from 'node:test';
import assert from 'node:assert/strict';
import { commentaryOverlaps, selectCommentaries } from './commentary-library.js';

const records = [
  { id: 'a', code: 'EXO', chapter: 3, startVerse: 1, endChapter: 3, endVerse: 6 },
  { id: 'b', code: 'EXO', chapter: 4, startVerse: 1, endChapter: 4, endVerse: 10 },
  { id: 'c', code: 'JHN', chapter: 3, startVerse: 1, endChapter: 3, endVerse: 16 },
];

test('commentary selection uses exact book and overlapping verse ranges', () => {
  const reference = { code: 'EXO', chapter: 3, startVerse: 5, endChapter: 4, endVerse: 2 };
  assert.deepEqual(selectCommentaries(records, reference).map((row) => row.id), ['a', 'b']);
  assert.equal(commentaryOverlaps(records[2], reference), false);
});

