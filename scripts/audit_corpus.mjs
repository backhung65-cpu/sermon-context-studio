import { readFileSync, writeFileSync } from 'node:fs';
import { BOOKS, findPlaces } from '../src/reference.js';
import { VERSE_COUNTS } from '../src/verse-counts.js';
import { choosePassageFocus, evidenceForReference } from '../src/passage-evidence.js';
import { passageContext } from '../src/passage-context.js';
import { JOURNEYS } from '../src/journeys.js';

const atlas = JSON.parse(readFileSync(new URL('../public/data/openbible-places.json', import.meta.url)));
const source = JSON.parse(readFileSync(new URL('../public/data/passage-evidence.json', import.meta.url)));
const people = JSON.parse(readFileSync(new URL('../public/data/people-index.json', import.meta.url)));
const routes = JSON.parse(readFileSync(new URL('../public/data/ubs-person-routes.json', import.meta.url)));
const errors = [];
const issue = (message) => errors.push(message);
const bookOrder = new Map(BOOKS.map((book, index) => [book.code, index]));
const sourceEvents = new Set(source.events.map((event) => event.id));
const placeById = new Map(atlas.places.map((place, index) => [place.id, index]));
if (source.placeSourceCommit !== atlas.sourceCommit || people.placeSourceCommit !== atlas.sourceCommit) issue('Place source commits do not match');
if (source.audit.verses !== 31102 || people.audit.verses !== 31102) issue('Theographic verse count changed');
if (people.people.length !== source.people.length || source.people.length !== 3067) issue('Person catalogue count changed');
if (new Set(atlas.places.map((place) => place.id)).size !== atlas.places.length) issue('Duplicate atlas place ID');
if (new Set(people.people.map((person) => person.id)).size !== people.people.length) issue('Duplicate person ID');
if (new Set(source.events.map((event) => event.id)).size !== source.events.length) issue('Duplicate event ID');

const stats = BOOKS.map((book) => ({ code: book.code, name: book.name, chapters: VERSE_COUNTS[book.code].length,
  chaptersWithPlaces: 0, verses: VERSE_COUNTS[book.code].reduce((sum, count) => sum + count, 0),
  versesWithPlaces: 0, versesWithPeople: 0, versesWithEvents: 0, reviewedScenes: 0 }));
let totalVerses = 0;
let exactAgreement = 0;
let selectedChapters = 0;
const ambiguousEventLead = [];
for (const [bookIndex, book] of BOOKS.entries()) {
  for (let chapter = 1; chapter <= VERSE_COUNTS[book.code].length; chapter += 1) {
    const chapterKey = `${book.code} ${chapter}`;
    const indexed = atlas.index[chapterKey] || {};
    const evidenceIndex = source.index[chapterKey] || {};
    const reference = { code: book.code, chapter, endChapter: chapter, startVerse: null, endVerse: null };
    const places = findPlaces(atlas, reference);
    const evidence = evidenceForReference(source, atlas, reference, JOURNEYS);
    const context = passageContext(reference, places);
    const focus = choosePassageFocus(places, context, evidence);
    const mapped = places.filter((place) => place.coordinate);
    const expected = evidence.scenes.map(({ step }) => places.find((place) => place.id === step.placeId))
      .filter((place) => place?.coordinate);
    if (context) expected.unshift(places.find((place) => place.id === context.scenePlaceId));
    if (expected.length && !expected.some((place) => place?.id === focus?.id)) issue(`${chapterKey}: reviewed scene not selected`);
    if (!expected.length && mapped.length) {
      const first = mapped.reduce((winner, place) => {
        const at = Math.min(...place.references.map((item) => item.chapter * 1000 + item.verse));
        return !winner || at < winner.at ? { place, at } : winner;
      }, null);
      if (focus?.id !== first.place.id && focus?.references[0].chapter * 1000 + focus?.references[0].verse !== first.at) issue(`${chapterKey}: focus does not follow first verse`);
      if (evidence.eventPlaceIds.length === 1 && evidence.eventPlaceIds[0] !== first.place.id) {
        ambiguousEventLead.push({ chapter: chapterKey, firstPlace: first.place.name,
          eventPlace: atlas.places[placeById.get(evidence.eventPlaceIds[0])]?.name });
      }
    }
    if (places.length) stats[bookIndex].chaptersWithPlaces += 1;
    stats[bookIndex].reviewedScenes += evidence.scenes.length;
    if (focus) selectedChapters += 1;
    for (let verse = 1; verse <= VERSE_COUNTS[book.code][chapter - 1]; verse += 1) {
      totalVerses += 1;
      const placeIds = indexed[verse] || [];
      const row = evidenceIndex[verse] || [[], [], []];
      if (new Set(placeIds).size !== placeIds.length) issue(`${chapterKey}:${verse}: duplicate atlas place`);
      if (placeIds.some((index) => !atlas.places[index])) issue(`${chapterKey}:${verse}: invalid atlas place`);
      if (row[0].some((index) => !source.people[index])) issue(`${chapterKey}:${verse}: invalid person`);
      if (row[1].some((index) => !atlas.places[index])) issue(`${chapterKey}:${verse}: invalid source place`);
      if (row[2].some((id) => !sourceEvents.has(id))) issue(`${chapterKey}:${verse}: invalid event`);
      if (placeIds.length) stats[bookIndex].versesWithPlaces += 1;
      if (row[0].length) stats[bookIndex].versesWithPeople += 1;
      if (row[2].length) stats[bookIndex].versesWithEvents += 1;
      if (row[1].some((index) => placeIds.includes(index))) exactAgreement += 1;
    }
  }
}
for (const [chapterKey, verses] of Object.entries(atlas.index)) {
  const [code, chapterText] = chapterKey.split(' ');
  if (!bookOrder.has(code) || !VERSE_COUNTS[code]?.[Number(chapterText) - 1]) issue(`Invalid atlas chapter ${chapterKey}`);
  for (const verseText of Object.keys(verses)) if (Number(verseText) > VERSE_COUNTS[code]?.[Number(chapterText) - 1]) issue(`Invalid atlas verse ${chapterKey}:${verseText}`);
}
for (const [chapterKey, verses] of Object.entries(source.index)) {
  const [code, chapterText] = chapterKey.split(' ');
  if (!bookOrder.has(code) || !VERSE_COUNTS[code]?.[Number(chapterText) - 1]) issue(`Invalid evidence chapter ${chapterKey}`);
  for (const verseText of Object.keys(verses)) if (Number(verseText) > VERSE_COUNTS[code]?.[Number(chapterText) - 1]) issue(`Invalid evidence verse ${chapterKey}:${verseText}`);
}
let sceneCount = 0;
for (const journey of JOURNEYS) for (const step of journey.steps) {
  sceneCount += 1;
  const placeIndex = placeById.get(step.placeId);
  const code = step.code || journey.code;
  if (placeIndex === undefined || !atlas.index[`${code} ${step.chapter}`]?.[step.verse]?.includes(placeIndex)) {
    issue(`${journey.id} ${code} ${step.chapter}:${step.verse}: journey place is not in the exact verse`);
  }
  if (!atlas.places[placeIndex]?.coordinate) issue(`${journey.id}: journey place has no coordinate`);
}
if (totalVerses !== 31102 || BOOKS.length !== 66 || stats.reduce((sum, row) => sum + row.chapters, 0) !== 1189) issue('Bible coverage changed');
if (exactAgreement !== source.audit.versesWithExactPlaceAgreement) issue('Cross-source same-verse agreement changed');
if (stats.reduce((sum, row) => sum + row.versesWithPlaces, 0) !== 5127) issue('Atlas place verse count changed');
if (sceneCount !== JOURNEYS.reduce((sum, journey) => sum + journey.steps.length, 0)) issue('Journey scene count mismatch');

const totals = { books: 66, chapters: 1189, verses: totalVerses, placeVerses: stats.reduce((sum, row) => sum + row.versesWithPlaces, 0),
  chaptersWithPlaces: stats.reduce((sum, row) => sum + row.chaptersWithPlaces, 0), exactAgreement,
  peopleRecords: people.people.length, eventRecords: source.events.length, journeys: JOURNEYS.length, reviewedScenes: sceneCount,
  sourceRouteDrawings: routes.routes.length, chaptersWithMappedFocus: selectedChapters,
  eventLocationWouldDisplaceFirstMention: ambiguousEventLead.length };
const result = { generatedAt: new Date().toISOString(), sources: { atlas: atlas.sourceCommit, theographic: source.sourceCommit }, totals,
  books: stats, eventLocationExamples: ambiguousEventLead.slice(0, 20), errors };
if (!process.argv.includes('--check')) {
  writeFileSync(new URL('../public/data/corpus-audit.json', import.meta.url), `${JSON.stringify(result)}\n`);
  const rows = stats.map((row) => `| ${row.name} | ${row.chaptersWithPlaces}/${row.chapters} | ${row.versesWithPlaces}/${row.verses} | ${row.versesWithPeople} | ${row.reviewedScenes} |`).join('\n');
  writeFileSync(new URL('../CORPUS_INTEGRITY_AUDIT.md', import.meta.url), `# 66권 전체 연결 점검\n\n재생성: \`npm run audit:integrity\`. 점검 단위는 개신교 66권, 1,189장, 31,102절(KJV 장절 체계)입니다. 각 절의 지명·인물·사건 ID와 검수 여정의 정확한 절·지명 연결을 검사합니다.\n\n- 지도 지명이 연결된 절: **${totals.placeVerses.toLocaleString()} / ${totals.verses.toLocaleString()}**. 지명 연결이 없는 절에는 장소를 만들지 않습니다.\n- 지명이 연결된 장: **${totals.chaptersWithPlaces.toLocaleString()} / ${totals.chapters.toLocaleString()}**. 이 중 지도가 그려지는 장은 **${totals.chaptersWithMappedFocus}장**입니다. 출애굽기 26·28장과 레위기 16장은 지명 기록은 있으나 현재 좌표가 없어 핀을 표시하지 않습니다.\n- 두 원자료가 같은 절의 같은 지명에 연결된 절: **${totals.exactAgreement.toLocaleString()}**.\n- 검수 여정: **${totals.journeys}개 / ${totals.reviewedScenes}장면**. 각 장면은 해당 정확한 절에 그 지명이 있는지 재검사합니다.\n- UBS의 인물 연결 경로 도형: **${totals.sourceRouteDrawings}개**. 선분마다 성경 장절과 경유지를 검수한 자료가 아니므로 검수 여정 수에 합치지 않습니다.\n- 사건 자료 위치 하나를 첫 장소로 자동 승격했다면 본문 첫 언급과 달라질 수 있었던 장: **${totals.eventLocationWouldDisplaceFirstMention}장**. 자동 승격을 없애고 본문 순서 및 검수 장면을 사용합니다.\n\n| 책 | 지명 연결 장 | 지명 연결 절 | 인물 언급 절 | 검수 장면 |\n| --- | ---: | ---: | ---: | ---: |\n${rows}\n\n## 판정의 한계\n\n이 점검은 **연결의 무결성**을 검사합니다. 동명이소·원자료 분류 오류, 본문에서 실제 이동이 있었는지, 옛 지명의 확정 좌표는 자동 검사만으로 확정할 수 없습니다. 31,102절 전체를 사람이 주석학적으로 검수했다는 뜻이 아닙니다. 지명 언급·사건 자료 위치·여정 장면·UBS 경로 도형을 서로 다른 근거로 유지합니다. 원자료: [OpenBible.info](https://github.com/openbibleinfo/Bible-Geocoding-Data/tree/${atlas.sourceCommit}), [Theographic](https://github.com/robertrouse/theographic-bible-metadata/tree/${source.sourceCommit}).\n`);
}
console.log(JSON.stringify({ totals, errors: errors.slice(0, 20) }, null, 2));
if (errors.length) process.exitCode = 1;
