import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { BOOKS, parseReference } from '../src/reference.js';

const sourceRoot = process.argv[2];
if (!sourceRoot) {
  throw new Error('Usage: node scripts/build_people_index.mjs <theographic-repository-path>');
}

const readSource = (name) => JSON.parse(readFileSync(join(sourceRoot, 'json', `${name}.json`), 'utf8'));
const sourceBooks = readSource('books');
const sourcePeople = readSource('people');
const sourceVerses = readSource('verses');
const sourceCommit = execFileSync('git', ['-C', sourceRoot, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const atlas = JSON.parse(readFileSync(new URL('../public/data/openbible-places.json', import.meta.url), 'utf8'));

const bookByRecordId = new Map(sourceBooks.map(({ id, fields }) => [id, Number(fields.bookOrder) - 1]));
if (sourceBooks.length !== BOOKS.length || new Set(bookByRecordId.values()).size !== BOOKS.length) {
  throw new Error('Theographic book ordering does not match the 66-book reference parser.');
}
for (const { fields } of sourceBooks) {
  const expectedCode = BOOKS[Number(fields.bookOrder) - 1]?.code;
  const parsedCode = parseReference(`${fields.bookName} 1:1`)?.code;
  if (!expectedCode || parsedCode !== expectedCode) {
    throw new Error(`Theographic book mismatch at ${fields.bookOrder}: ${fields.bookName}`);
  }
}

const people = sourcePeople.map(({ id, fields }) => ({
  sourceId: id,
  id: fields.personLookup,
  name: fields.name,
  title: fields.displayTitle || fields.name,
  proper: fields.isProperName === true,
  ambiguous: fields.ambiguous === true,
  refs: [],
  mapped: [],
}));
const personBySourceId = new Map(people.map((person) => [person.sourceId, person]));
if (personBySourceId.size !== people.length || new Set(people.map((person) => person.id)).size !== people.length) {
  throw new Error('Duplicate or missing person identifier.');
}

const seenVerses = new Set();
const bookVerseCounts = Array(BOOKS.length).fill(0);
const bookPeopleCounts = Array(BOOKS.length).fill(0);
const bookMappedPeopleCounts = Array(BOOKS.length).fill(0);
let placeVerses = 0;
let unmatchedPeople = 0;
for (const { fields } of sourceVerses) {
  const bookIndex = bookByRecordId.get(fields.book?.[0]);
  const parts = String(fields.osisRef || '').split('.');
  const chapter = Number(parts.at(-2));
  const verse = Number(parts.at(-1));
  if (bookIndex === undefined || !Number.isInteger(chapter) || !Number.isInteger(verse)) {
    throw new Error(`Invalid verse: ${fields.osisRef}`);
  }
  const key = `${bookIndex}:${chapter}:${verse}`;
  if (seenVerses.has(key)) throw new Error(`Duplicate verse: ${fields.osisRef}`);
  seenVerses.add(key);
  bookVerseCounts[bookIndex] += 1;
  const places = atlas.index[`${BOOKS[bookIndex].code} ${chapter}`]?.[verse] || [];
  if (places.length) placeVerses += 1;
  for (const personId of new Set(fields.people || [])) {
    const person = personBySourceId.get(personId);
    if (!person) { unmatchedPeople += 1; continue; }
    person.refs.push([bookIndex, chapter, verse]);
    bookPeopleCounts[bookIndex] += 1;
    if (places.length) {
      person.mapped.push([bookIndex, chapter, verse, places]);
      bookMappedPeopleCounts[bookIndex] += 1;
    }
  }
}
if (unmatchedPeople) throw new Error(`${unmatchedPeople} person references have no matching person record.`);
if (sourceVerses.length !== 31102 || bookVerseCounts.some((count) => count === 0)) {
  throw new Error(`Expected all 31,102 verses in 66 books; found ${sourceVerses.length}.`);
}
for (const person of people) {
  person.refs.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
  person.mapped.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
  delete person.sourceId;
}

const output = {
  source: 'Theographic Bible Metadata',
  sourceUrl: 'https://github.com/robertrouse/theographic-bible-metadata',
  sourceCommit,
  license: 'CC BY-SA 4.0',
  placeSource: 'OpenBible.info Bible Geocoding Data',
  placeSourceCommit: atlas.sourceCommit,
  codes: BOOKS.map(({ code }) => code),
  audit: {
    books: sourceBooks.length,
    verses: sourceVerses.length,
    people: people.length,
    versesWithMappedPlaces: placeVerses,
    peopleWithMappedVerses: people.filter((person) => person.mapped.length).length,
    peopleWithNoVerses: people.filter((person) => !person.refs.length).length,
    personVerseLinks: bookPeopleCounts.reduce((sum, count) => sum + count, 0),
    mappedPersonVerseLinks: bookMappedPeopleCounts.reduce((sum, count) => sum + count, 0),
  },
  people,
};
const outputPath = new URL('../public/data/people-index.json', import.meta.url);
writeFileSync(outputPath, `${JSON.stringify(output)}\n`);
const auditRows = BOOKS.map((book, index) => `| ${index + 1} | ${book.name} | ${bookVerseCounts[index].toLocaleString('ko-KR')} | ${bookPeopleCounts[index].toLocaleString('ko-KR')} | ${bookMappedPeopleCounts[index].toLocaleString('ko-KR')} |`).join('\n');
writeFileSync(new URL('../PERSON_INDEX_AUDIT.md', import.meta.url), `# 성경 전체 인명 색인 범위 점검\n\n자료: [Theographic Bible Metadata](https://github.com/robertrouse/theographic-bible-metadata) (CC BY-SA 4.0, 판 ${sourceCommit})과 [OpenBible.info Bible Geocoding Data](https://github.com/openbibleinfo/Bible-Geocoding-Data) (CC BY 4.0, 판 ${atlas.sourceCommit}).\n\n이 표는 **기계적 범위 검사**입니다. Theographic의 66권 ${sourceVerses.length.toLocaleString('ko-KR')}절에서 인명 레코드 ${people.length.toLocaleString('ko-KR')}개를 대조했습니다. 사람과 장소가 같은 절에 등장해도 그 사람이 그 장소에 갔다고 판단하지 않습니다. 본문별 이동과 인물 동명이인·우리말 표기는 별도 사람의 검토가 필요합니다.\n\n- 인명 언급 연결: ${output.audit.personVerseLinks.toLocaleString('ko-KR')}건\n- 지도 지명이 같은 절에 등장하는 인명 연결: ${output.audit.mappedPersonVerseLinks.toLocaleString('ko-KR')}건\n- 지도 지명과 같은 절에서 연결되는 인명: ${output.audit.peopleWithMappedVerses.toLocaleString('ko-KR')}개\n- 지도 지명과 같은 절에서 연결되지 않은 인명: ${(people.length - output.audit.peopleWithMappedVerses).toLocaleString('ko-KR')}개\n- OpenBible.info 색인에 지도 지명이 있는 절: ${placeVerses.toLocaleString('ko-KR')}절\n\n| 순서 | 성경 책 | 대조한 절 | 인명 언급 연결 | 인명·지명 동시 언급 연결 |\n| ---: | --- | ---: | ---: | ---: |\n${auditRows}\n\n**자료 한계:** Theographic의 인명·장절 연결과 OpenBible.info의 지명 연결은 서로 다른 원자료입니다. 후자는 여러 영어 역본에서 반복 확인된 지명만 앱 색인에 수록합니다. 지도 지명이 없는 절이나 인물이 언급되지 않은 절도 정상입니다. 인명 기록 수는 원자료의 분류 기준이며, 성경에 등장하는 모든 인물을 사람이 빠짐없이 검수했다는 뜻이 아닙니다. 현재 **이동을 수작업으로 검수한 것은 7개 여정뿐**입니다. 베들레헴 성경 파일과 개역개정 본문은 이 색인에 포함하지 않았습니다.\n`);
appendFileSync(new URL('../PERSON_INDEX_AUDIT.md', import.meta.url), '\n**경로 지도와의 관계:** [UBS 공개 경로 도형 100개](UBS_ROUTE_AUDIT.md)는 별도 자료입니다. 37개 인명 기록에 연결했지만 선분별 장절을 앱에서 모두 검수한 것은 아닙니다.\n');
console.log(JSON.stringify({ ...output.audit, bytes: readFileSync(outputPath).length }));
