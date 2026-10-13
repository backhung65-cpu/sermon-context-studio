import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BOOKS } from '../src/reference.js';
import { VERSE_COUNTS } from '../src/verse-counts.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const directory = join(root, 'public/data/open-study-notes');
const metadata = JSON.parse(await readFile(join(directory, 'source.json'), 'utf8'));
const errors = [];
const warnings = [];
const chapterGaps = [];
const verseGaps = [];
const seenIds = new Set();
const perBook = [];
let totalRecords = 0;
let totalVerses = 0;
let directlyCoveredVerses = 0;

function decodePoint(value) {
  return {
    book: Math.floor(value / 1_000_000),
    chapter: Math.floor((value % 1_000_000) / 1_000),
    verse: value % 1_000,
  };
}

for (const [bookIndex, book] of BOOKS.entries()) {
  const rows = JSON.parse(await readFile(join(directory, `${book.code}.json`), 'utf8'));
  totalRecords += rows.length;
  let bookVerses = 0;
  let bookCovered = 0;
  for (const row of rows) {
    if (!row.id || !row.title || !row.text || !Number.isInteger(row.start) || !Number.isInteger(row.end)) {
      errors.push(`${book.code}: malformed row ${row.id || '(no id)'}`);
      continue;
    }
    if (seenIds.has(row.id)) errors.push(`${book.code}: duplicate content ID ${row.id}`);
    seenIds.add(row.id);
    const start = decodePoint(row.start);
    const end = decodePoint(row.end);
    const startCount = VERSE_COUNTS[book.code]?.[start.chapter - 1];
    const endCount = VERSE_COUNTS[book.code]?.[end.chapter - 1];
    if (start.book !== bookIndex + 1 || end.book !== bookIndex + 1
      || !startCount || !endCount || start.verse < 1 || end.verse < 1
      || start.verse > startCount || end.verse > endCount || row.end < row.start) {
      errors.push(`${book.code}: invalid canonical range ${row.start}-${row.end} (${row.id})`);
    }
    if (/<[^>]+>/.test(row.title) || /<[^>]+>/.test(row.text)) errors.push(`${book.code}: HTML remained in ${row.id}`);
    if (/&(?:#\d+|#x[\da-f]+|[a-z]+);/i.test(row.title) || /&(?:#\d+|#x[\da-f]+|[a-z]+);/i.test(row.text)) {
      errors.push(`${book.code}: encoded entity remained in ${row.id}`);
    }
    if (row.text.length < 8) warnings.push(`${book.code}: unusually short note ${row.id}`);
  }
  for (const [chapterIndex, verseCount] of VERSE_COUNTS[book.code].entries()) {
    const chapter = chapterIndex + 1;
    const bookBase = (bookIndex + 1) * 1_000_000;
    const start = bookBase + chapter * 1_000 + 1;
    const end = bookBase + chapter * 1_000 + verseCount;
    if (!rows.some((row) => row.start <= end && row.end >= start)) chapterGaps.push(`${book.code} ${chapter}`);
    for (let verse = 1; verse <= verseCount; verse += 1) {
      totalVerses += 1;
      bookVerses += 1;
      const point = bookBase + chapter * 1_000 + verse;
      if (rows.some((row) => row.start <= point && row.end >= point)) {
        directlyCoveredVerses += 1;
        bookCovered += 1;
      } else verseGaps.push({ code: book.code, chapter, verse });
    }
  }
  perBook.push({
    code: book.code,
    name: book.name,
    records: rows.length,
    verses: bookVerses,
    directlyCoveredVerses: bookCovered,
    uncoveredVerses: bookVerses - bookCovered,
    directCoveragePercent: Number((bookCovered / bookVerses * 100).toFixed(1)),
  });
}

if (metadata.books !== 66) errors.push(`metadata books: ${metadata.books}`);
if (metadata.records !== totalRecords) errors.push(`metadata records ${metadata.records} != files ${totalRecords}`);
if (metadata.professionalSourceRecords !== 16_922) errors.push(`professional source records ${metadata.professionalSourceRecords}`);
const expectedExclusions = new Set(['14406:64001013-64001015', '14409:64001015', '25228:66012018', '25227:66012018-66013018']);
if (!Array.isArray(metadata.excludedRecords) || metadata.excludedRecords.length !== expectedExclusions.size
  || metadata.excludedRecords.some((row) => !expectedExclusions.has(`${row.id}:${row.indexReference}`))) {
  errors.push('unexpected out-of-canon source exclusion');
}
if (metadata.commit !== 'bbb3f86016cd20913f410a95af63d9f7ff9a71d6') errors.push('unexpected source commit');
if (totalVerses !== 31_102) errors.push(`canonical verse total ${totalVerses}`);
if (chapterGaps.length) errors.push(`chapters without a source note (${chapterGaps.length}): ${chapterGaps.join(', ')}`);

const report = {
  generatedAt: new Date().toISOString(),
  source: { repository: metadata.repository, commit: metadata.commit, license: metadata.license },
  totals: {
    books: BOOKS.length,
    chapters: Object.values(VERSE_COUNTS).reduce((sum, chapters) => sum + chapters.length, 0),
    verses: totalVerses,
    records: totalRecords,
    professionalSourceRecords: metadata.professionalSourceRecords,
    excludedOutOfCanonRecords: metadata.excludedRecords.length,
    directlyCoveredVerses,
    uncoveredVerses: verseGaps.length,
    directCoveragePercent: Number((directlyCoveredVerses / totalVerses * 100).toFixed(1)),
    chaptersWithAtLeastOneNote: 1_189 - chapterGaps.length,
    normalizedChapterEnds: metadata.normalizedChapterEnds || 0,
  },
  perBook,
  uncoveredVerseReferences: verseGaps.map(({ code, chapter, verse }) => `${code} ${chapter}:${verse}`),
  excludedRecords: metadata.excludedRecords,
  warnings,
  errors,
};

if (process.argv.includes('--write')) {
  await writeFile(join(root, 'public/data/study-notes-audit.json'), `${JSON.stringify(report)}\n`);
  const rows = perBook.map((book) => `| ${book.name} | ${book.records.toLocaleString()} | ${book.directlyCoveredVerses.toLocaleString()} / ${book.verses.toLocaleString()} | ${book.directCoveragePercent}% | ${book.uncoveredVerses.toLocaleString()} |`).join('\n');
  await writeFile(join(root, 'OPEN_STUDY_NOTES_AUDIT.md'), `# 성경 66권 공개 스터디 노트 전수 검사\n\n재생성: \`node scripts/audit_open_study_notes.mjs --write\`\n\n이 검사는 고정된 Aquifer Open Study Notes의 전문 편집 단계 원자료 ${metadata.professionalSourceRecords.toLocaleString()}건과 개신교 66권 ${totalVerses.toLocaleString()}절을 **모두 순회**합니다. 각 레코드의 책·장·절 범위, 중복 ID, 빈 내용, 남은 HTML/문자 엔티티와 각 절의 직접 연결 여부를 검사합니다.\n\n- 원자료: [Aquifer Open Study Notes](${metadata.repository}/tree/${metadata.commit}) · ${metadata.license}\n- 앱에 연결한 유효 범위 노트: **${totalRecords.toLocaleString()}건**\n- 장절표 범위를 벗어나 제외한 원자료: **${metadata.excludedRecords.length}건** · ${metadata.excludedRecords.map((row) => `${row.code} ${row.indexReference} (${row.id})`).join(', ')}\n- 직접 노트가 연결된 절: **${directlyCoveredVerses.toLocaleString()} / ${totalVerses.toLocaleString()} (${report.totals.directCoveragePercent}%)**\n- 직접 노트가 없는 절: **${verseGaps.length.toLocaleString()}절**. 앱은 이 경우 같은 장의 노트를 표시하면서 직접 연결이 아님을 밝힙니다.\n- 노트가 하나 이상 있는 장: **${report.totals.chaptersWithAtLeastOneNote.toLocaleString()} / 1,189장**\n- 원자료가 999를 장 끝 표기로 사용한 범위를 실제 마지막 절로 정규화: **${report.totals.normalizedChapterEnds.toLocaleString()}건**\n- 앱에 포함된 자료의 구조 오류: **${errors.length}건** · 품질 경고: **${warnings.length}건**\n\n| 성경 | 노트 | 직접 연결 절 | 직접 연결률 | 직접 노트 없는 절 |\n| --- | ---: | ---: | ---: | ---: |\n${rows}\n\n## 이 검사가 보장하지 않는 것\n\n이 검사는 모든 레코드와 모든 절의 **구조와 연결 범위**를 전수 검사합니다. 각 주석의 신학적 타당성, 번역 품질, 특정 교단의 해석과 일치하는지는 자동 검사로 확정할 수 없습니다. 원문은 영어이며 한국어 전문 검수를 마친 자료로 표시하지 않습니다. 직접 노트가 없는 절의 전체 목록은 [study-notes-audit.json](public/data/study-notes-audit.json)에 기록합니다.\n`);
}

if (errors.length) {
  console.error(errors.slice(0, 100).join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Open Study Notes full audit passed: ${totalRecords} records and ${totalVerses} verses checked; ${directlyCoveredVerses} direct, ${verseGaps.length} chapter-fallback.`);
}
