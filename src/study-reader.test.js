import test from 'node:test';
import assert from 'node:assert/strict';
import { BOOKS, parseReference } from './reference.js';
import { VERSE_COUNTS } from './verse-counts.js';
import { notesForPassage, passageVerses, studyReaderCopy } from './study-reader.js';

test('reading order includes every selected verse, including verses without places', () => {
  assert.deepEqual(passageVerses(parseReference('행 16:6-8')).map(({ key }) => key),
    ['ACT:16:6', 'ACT:16:7', 'ACT:16:8']);
  assert.deepEqual(passageVerses(parseReference('출 3:21-4:2')).map(({ key }) => key),
    ['EXO:3:21', 'EXO:3:22', 'EXO:4:1', 'EXO:4:2']);
  assert.equal(passageVerses(parseReference('시 119')).length, 176);
});

test('all 66 books can open a complete first chapter in the study reader', () => {
  for (const book of BOOKS) {
    const rows = passageVerses(parseReference(`${book.name} 1`));
    assert.equal(rows.length, VERSE_COUNTS[book.code][0], book.code);
    assert.equal(rows[0].key, `${book.code}:1:1`);
  }
});

test('guided reading labels and storage cautions exist in every interface language', () => {
  for (const locale of ['ko', 'en', 'ja', 'zh-CN', 'es', 'th', 'hi', 'fr', 'de']) {
    const copy = studyReaderCopy(locale);
    for (const [key, value] of Object.entries(copy)) assert.ok(value.trim(), `${locale}: ${key}`);
    assert.ok(copy.savedVerseCount.includes('{count}'));
  }
});

test('export keeps only the selected verses in Bible reading order', () => {
  const sequence = passageVerses(parseReference('출 3:1-12'));
  const notes = [
    { verse: 'EXO:3:10', text: 'tenth' }, { verse: 'EXO:4:1', text: 'outside' },
    { verse: 'EXO:3:2', text: 'second' },
  ];
  assert.deepEqual(notesForPassage(notes, sequence).map(({ verse }) => verse), ['EXO:3:2', 'EXO:3:10']);
});
