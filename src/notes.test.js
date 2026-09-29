import test from 'node:test';
import assert from 'node:assert/strict';
import { BACKUP_FORMAT, NOTE_PREFIX, createBackup, listNotes, mergeNotes, noteMarkdown, parseBackup } from './notes.js';

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
