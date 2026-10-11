import test from 'node:test';
import assert from 'node:assert/strict';
import { BACKUP_FORMAT, NOTE_PREFIX, VERSE_NOTE_PREFIX, allNotesMarkdown, createBackup, createStudyBackup, listNotes, listVerseNotes, mergeNotes, mergeVerseNotes, noteMarkdown, parseBackup, parseStudyBackup } from './notes.js';

class MemoryStorage {
  entries = new Map();
  get length() { return this.entries.size; }
  key(index) { return [...this.entries.keys()][index] ?? null; }
  getItem(key) { return this.entries.get(key) ?? null; }
  setItem(key, value) { this.entries.set(key, value); }
}

test('notes can be backed up and restored without overwriting existing work', () => {
  const source = new MemoryStorage();
  source.setItem(`${NOTE_PREFIX}사 10:15`, '직접 지명 없음.');
  source.setItem(`${NOTE_PREFIX}행 16:6–15`, '빌립보 방문을 확인.');
  source.setItem('unrelated', 'keep out');
  const backup = createBackup(listNotes(source), '2026-09-29T00:00:00.000Z');
  assert.equal(backup.format, BACKUP_FORMAT);
  assert.equal(Object.keys(backup.notes).length, 2);
  const target = new MemoryStorage();
  target.setItem(`${NOTE_PREFIX}사 10:15`, '기존 기록');
  assert.deepEqual(mergeNotes(target, parseBackup(JSON.stringify(backup))), { imported: 1, skipped: 1 });
  assert.equal(target.getItem(`${NOTE_PREFIX}사 10:15`), '기존 기록');
  assert.equal(target.getItem(`${NOTE_PREFIX}행 16:6–15`), '빌립보 방문을 확인.');
});

test('backup import rejects invalid files and individual Markdown contains the reference', () => {
  assert.throws(() => parseBackup('{"format":"other","notes":{}}'));
  assert.throws(() => parseBackup('{"format":"sermon-context-notes-v1","notes":{"없는책 1:1":"x"}}'));
  assert.match(noteMarkdown('사 10:15', '본문 관찰', '2026-09-29T00:00:00.000Z'), /본문: 사 10:15[\s\S]*본문 관찰/);
});

test('verse annotations are shared across passage ranges and included in the full backup', () => {
  const source = new MemoryStorage();
  source.setItem(`${VERSE_NOTE_PREFIX}EXO:3:1`, '호렙은 이 장면의 장소.');
  source.setItem(`${VERSE_NOTE_PREFIX}EXO:3:7`, '애굽은 대화 속 언급.');
  source.setItem(`${NOTE_PREFIX}출 3`, '본문 전체 정리');
  const backup = createStudyBackup(listNotes(source), listVerseNotes(source));
  assert.equal(Object.keys(backup.verseNotes).length, 2);
  const restored = parseStudyBackup(JSON.stringify(backup));
  const target = new MemoryStorage();
  target.setItem(`${VERSE_NOTE_PREFIX}EXO:3:1`, '기존 절별 기록');
  assert.deepEqual(mergeVerseNotes(target, restored.verseNotes), { imported: 1, skipped: 1 });
  assert.equal(target.getItem(`${VERSE_NOTE_PREFIX}EXO:3:1`), '기존 절별 기록');
  assert.equal(target.getItem(`${VERSE_NOTE_PREFIX}EXO:3:7`), '애굽은 대화 속 언급.');
  assert.deepEqual(parseStudyBackup(JSON.stringify(createBackup([]))).verseNotes, []);
  assert.throws(() => parseStudyBackup(JSON.stringify({ ...backup, verseNotes: { 'EXO:3:999': 'invalid' } })));
});

test('all-notes Markdown includes every passage and verse note once in storage order', () => {
  const source = new MemoryStorage();
  source.setItem(`${NOTE_PREFIX}출 3`, '본문 전체 관찰');
  source.setItem(`${NOTE_PREFIX}창 12:1–9`, '아브라함 메모');
  source.setItem(`${VERSE_NOTE_PREFIX}EXO:3:1`, '호렙 기록');
  source.setItem(`${VERSE_NOTE_PREFIX}EXO:3:7`, '애굽 언급');
  const markdown = allNotesMarkdown(listNotes(source), listVerseNotes(source), {
    formatVerse: (key) => key.replace('EXO:3:', '출애굽기 3:'),
    timestamp: '2026-10-11T00:00:00.000Z',
  });
  assert.match(markdown, /## 본문 전체 메모[\s\S]*아브라함 메모[\s\S]*본문 전체 관찰/);
  assert.match(markdown, /## 절별 메모[\s\S]*출애굽기 3:1[\s\S]*호렙 기록[\s\S]*출애굽기 3:7[\s\S]*애굽 언급/);
  assert.equal(markdown.split('호렙 기록').length - 1, 1);
});
