import { parseReference } from './reference.js';

export const NOTE_PREFIX = 'sermon-context-note:';
export const VERSE_NOTE_PREFIX = 'sermon-context-verse-note:';
export const BACKUP_FORMAT = 'sermon-context-notes-v1';

export function validVerseNoteKey(key) {
  const parts = String(key).match(/^([1-3A-Z]{3}):(\d{1,3}):(\d{1,3})$/);
  if (!parts) return false;
  const parsed = parseReference(`${parts[1]} ${parts[2]}:${parts[3]}`);
  return !parsed.error && parsed.code === parts[1] && parsed.chapter === Number(parts[2])
    && parsed.startVerse === Number(parts[3]);
}

export function listVerseNotes(storage) {
  const notes = [];
  for (let i = 0; i < storage.length; i += 1) {
    const key = storage.key(i);
    if (!key?.startsWith(VERSE_NOTE_PREFIX)) continue;
    const verse = key.slice(VERSE_NOTE_PREFIX.length);
    const text = storage.getItem(key);
    if (validVerseNoteKey(verse) && text?.trim()) notes.push({ verse, text });
  }
  return notes.sort((a, b) => a.verse.localeCompare(b.verse));
}

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

export function createStudyBackup(notes, verseNotes, timestamp = new Date().toISOString()) {
  return {
    ...createBackup(notes, timestamp),
    verseNotes: Object.fromEntries(verseNotes.map(({ verse, text }) => [verse, text])),
  };
}

export function parseStudyBackup(text) {
  const notes = parseBackup(text); // Also accepts older passage-only backups.
  const backup = JSON.parse(text);
  const verseNotes = [];
  if (backup.verseNotes !== undefined) {
    if (!backup.verseNotes || typeof backup.verseNotes !== 'object' || Array.isArray(backup.verseNotes)
      || Object.keys(backup.verseNotes).length > 31102) {
      throw new Error('절별 메모 백업 형식이 올바르지 않습니다.');
    }
    for (const [verse, value] of Object.entries(backup.verseNotes)) {
      if (!validVerseNoteKey(verse) || typeof value !== 'string' || value.length > 200000) {
        throw new Error('백업 파일에 사용할 수 없는 절 주소나 메모가 있습니다.');
      }
      if (value.trim()) verseNotes.push({ verse, text: value });
    }
  }
  return { notes, verseNotes };
}

export function mergeVerseNotes(storage, verseNotes) {
  let imported = 0;
  let skipped = 0;
  for (const { verse, text } of verseNotes) {
    if (!validVerseNoteKey(verse)) throw new Error('절 주소가 올바르지 않습니다.');
    const key = `${VERSE_NOTE_PREFIX}${verse}`;
    if (storage.getItem(key)?.trim()) skipped += 1;
    else { storage.setItem(key, text); imported += 1; }
  }
  return { imported, skipped };
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

export function allNotesMarkdown(passageNotes, verseNotes, options = {}) {
  const {
    title = '설교 연구 메모 모음', passageTitle = '본문 전체 메모', verseTitle = '절별 메모',
    formatPassage = (reference) => reference, formatVerse = (verse) => verse,
    timestamp = new Date().toISOString(),
  } = options;
  const parts = [`# ${title}`, '', `${timestamp}`];
  if (passageNotes.length) {
    parts.push('', `## ${passageTitle}`);
    for (const { reference, text } of passageNotes) parts.push('', `### ${formatPassage(reference)}`, '', text.trimEnd());
  }
  if (verseNotes.length) {
    parts.push('', `## ${verseTitle}`);
    for (const { verse, text } of verseNotes) parts.push('', `### ${formatVerse(verse)}`, '', text.trimEnd());
  }
  return `${parts.join('\n')}\n`;
}
