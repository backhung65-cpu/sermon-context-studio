import { parseReference } from './reference.js';

export const NOTE_PREFIX = 'sermon-context-note:';
export const BACKUP_FORMAT = 'sermon-context-notes-v1';

export function listNotes(storage) {
  const notes = [];
  for (let i = 0; i < storage.length; i += 1) {
    const key = storage.key(i);
    if (!key?.startsWith(NOTE_PREFIX)) continue;
    const text = storage.getItem(key);
    if (text?.trim()) notes.push({ reference: key.slice(NOTE_PREFIX.length), text });
  }
  return notes.sort((a, b) => a.reference.localeCompare(b.reference, 'ko'));
}

export function createBackup(notes, timestamp = new Date().toISOString()) {
  return {
    format: BACKUP_FORMAT,
    exportedAt: timestamp,
    notes: Object.fromEntries(notes.map(({ reference, text }) => [reference, text])),
  };
}

export function parseBackup(text) {
  const backup = JSON.parse(text);
  if (backup?.format !== BACKUP_FORMAT || !backup.notes || typeof backup.notes !== 'object'
    || Array.isArray(backup.notes) || Object.keys(backup.notes).length > 2000) {
    throw new Error('이 앱에서 만든 메모 백업 파일이 아닙니다.');
  }
  const notes = [];
  for (const [reference, value] of Object.entries(backup.notes)) {
    if (typeof value !== 'string' || value.length > 200000 || parseReference(reference).error) {
      throw new Error('백업 파일에 사용할 수 없는 본문 주소나 메모가 있습니다.');
    }
    if (value.trim()) notes.push({ reference, text: value });
  }
  return notes;
}

export function mergeNotes(storage, notes) {
  let imported = 0;
  let skipped = 0;
  for (const { reference, text } of notes) {
    const key = `${NOTE_PREFIX}${reference}`;
    if (storage.getItem(key)?.trim()) {
      skipped += 1;
    } else {
      storage.setItem(key, text);
      imported += 1;
    }
  }
  return { imported, skipped };
}

export function noteMarkdown(reference, text, timestamp = new Date().toISOString()) {
  return `# 설교 준비 메모\n\n본문: ${reference}\n저장: ${timestamp}\n\n${text.trimEnd()}\n`;
}
