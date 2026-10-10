import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BOOKS } from '../src/reference.js';

const sourceCommit = 'cfb1c485d4da6fb63a69cb3b7f5b0752792f46bc';
const sourceHashes = {
  books: '33f17d3c9dc48ffa826932f8598839a7bda330ad6dff2b1877c1357953012484',
  verses: '471b7d7648acd4cf5300437acd9d048514f6a5da1f34f4ce2e43ef9eeec0e858',
  people: '76041eba0b6f36c36514802fcfa69a068cbf06ef7b57aaec82909f509e3b6fb4',
  places: '5a8e929baa4701602e461e66271a0fa6e9f6f6629635053f1a1e4bbcfce06c14',
  events: '59dc86b8ff124813488fa036ffb70ff83127e024aa6ccd326c905d5c5018b5a9',
};
const root = resolve(process.argv[2] || resolve(dirname(fileURLToPath(import.meta.url)), '../../tmp'));
async function read(name) {
  const path = resolve(root, `theographic-${name}.json`);
  if (!existsSync(path)) {
    mkdirSync(root, { recursive: true });
    const response = await fetch(`https://raw.githubusercontent.com/robertrouse/theographic-bible-metadata/${sourceCommit}/json/${name}.json`);
    if (!response.ok) throw new Error(`Could not download ${name}: HTTP ${response.status}`);
    writeFileSync(path, Buffer.from(await response.arrayBuffer()));
  }
  const bytes = readFileSync(path);
  const hash = createHash('sha256').update(bytes).digest('hex');
  if (hash !== sourceHashes[name]) throw new Error(`Source checksum mismatch: ${name}`);
  return JSON.parse(bytes.toString('utf8'));
}
const [sourceBooks, sourceVerses, sourcePeople, sourcePlaces, sourceEvents] = await Promise.all(
  ['books', 'verses', 'people', 'places', 'events'].map(read));
const atlas = JSON.parse(readFileSync(new URL('../public/data/openbible-places.json', import.meta.url), 'utf8'));
const bookIndex = new Map(sourceBooks.map((row) => [row.id, Number(row.fields.bookOrder) - 1]));
const people = sourcePeople.map((row) => ({ id: row.fields.personLookup, name: row.fields.displayTitle || row.fields.name }));
const personIndex = new Map(sourcePeople.map((row, index) => [row.id, index]));
const sourceVerseById = new Map();
const sourceVerseKey = new Map();
for (const row of sourceVerses) {
  const parts = String(row.fields.osisRef).match(/\.(\d+)\.(\d+)$/);
  const book = bookIndex.get(row.fields.book?.[0]);
  if (book === undefined || !parts) throw new Error(`Invalid source verse ${row.fields.osisRef}`);
  const reference = [book, Number(parts[1]), Number(parts[2])];
  const key = reference.join(':');
  if (sourceVerseKey.has(key)) throw new Error(`Duplicate verse ${key}`);
  sourceVerseById.set(row.id, { reference, places: row.fields.places || [] });
  sourceVerseKey.set(key, row.id);
}
if (sourceVerseKey.size !== 31102 || people.length !== 3067 || sourceEvents.length !== 450) throw new Error('Unexpected Theographic source coverage');

const norm = (name) => String(name || '').toLowerCase().replace(/\s+\d+$/, '').replace(/[^a-z0-9]/g, '');
const km = (a, b) => Math.hypot((a[0] - b[0]) * 111 * Math.cos(a[1] * Math.PI / 180), (a[1] - b[1]) * 111);
const atlasByName = new Map();
for (const [index, place] of atlas.places.entries()) {
  const key = norm(place.name);
  if (!atlasByName.has(key)) atlasByName.set(key, []);
  atlasByName.get(key).push(index);
}
const atlasVersesByPlace = new Map();
for (const [chapterKey, verses] of Object.entries(atlas.index)) {
  const [code, chapter] = chapterKey.split(' ');
  for (const [verse, indices] of Object.entries(verses)) for (const index of indices) {
    if (!atlasVersesByPlace.has(index)) atlasVersesByPlace.set(index, new Set());
    atlasVersesByPlace.get(index).add(`${code}:${chapter}:${verse}`);
  }
}
const mappedSourcePlaces = new Map();
const crosswalk = [];
const geographyNoteCandidates = new Map();
let historicalLanguageNotes = 0;
for (const row of sourcePlaces) {
  const names = new Set([row.fields.kjvName, row.fields.esvName, row.fields.displayTitle].map(norm));
  const named = [...names].flatMap((name) => atlasByName.get(name) || []);
  const lon = Number(row.fields.openBibleLong || row.fields.longitude);
  const lat = Number(row.fields.openBibleLat || row.fields.latitude);
  const hasCoordinate = Number.isFinite(lon) && Number.isFinite(lat) && lon !== 0 && lat !== 0;
  const sourceReferences = new Set((row.fields.verses || []).map((id) => sourceVerseById.get(id)?.reference)
    .filter(Boolean).map(([book, chapter, verse]) => `${BOOKS[book].code}:${chapter}:${verse}`));
  const candidates = (named.length ? [...new Set(named)] : atlas.places.map((_, index) => index))
    .map((index) => {
      const atlasPlace = atlas.places[index];
      const distance = hasCoordinate && atlasPlace.coordinate ? km([lon, lat], atlasPlace.coordinate) : Infinity;
      const overlap = [...sourceReferences].filter((ref) => atlasVersesByPlace.get(index)?.has(ref)).length;
      return { index, distance, overlap, named: named.includes(index) };
    })
    .filter((candidate) => candidate.named || (candidate.overlap >= 2 && candidate.distance <= 10))
    .sort((a, b) => Number(b.named) - Number(a.named) || b.overlap - a.overlap || a.distance - b.distance);
  const best = candidates[0];
  const runnerUp = candidates[1];
  const valid = best && best.overlap > 0 && (!hasCoordinate || best.distance <= 80)
    && (!runnerUp || best.overlap > runnerUp.overlap || (hasCoordinate && best.distance + 5 < runnerUp.distance));
  if (!valid) continue;
  mappedSourcePlaces.set(row.id, best.index);
  crosswalk.push({ source: row.fields.displayTitle, atlas: atlas.places[best.index].name, overlap: best.overlap, km: Number.isFinite(best.distance) ? Math.round(best.distance) : null });
  // A dictionary entry must have the same normalized name and a shared verse.
  // Never attach historical prose on coordinate proximity alone.
  const paragraphs = (row.fields.dictText || []).map((value) => String(value).trim()).filter(Boolean);
  const atlasName = atlas.places[best.index].name;
  const sameName = norm(row.fields.displayTitle) === norm(atlasName);
  const qualifiedName = norm(row.fields.displayTitle) === norm(atlasName.replace(/^(mount|mt\.?|sea of|river|brook of)\s+/i, ''));
  const strongQualifiedMatch = qualifiedName && best.overlap >= 3 && best.distance <= 10;
  if ((sameName && best.named || strongQualifiedMatch) && best.overlap > 0 && paragraphs.length) {
    // Easton is a 19th-century source. Suppress entries with obsolete racial or
    // religious classifications rather than displaying them as pastoral context.
    if (/\brace\b|nigrit|low-class population|mohammedan|\bheathen\b/i.test(paragraphs.join(' '))) {
      historicalLanguageNotes++;
      continue;
    }
    if (!geographyNoteCandidates.has(best.index)) geographyNoteCandidates.set(best.index, []);
    geographyNoteCandidates.get(best.index).push({
      sourcePlaceId: row.fields.placeLookup,
      sourceName: row.fields.displayTitle,
      sharedVerses: best.overlap,
      paragraphs,
    });
  }
}

const geographyNotes = {};
let ambiguousNotes = 0;
for (const [index, entries] of geographyNoteCandidates) {
  // Same-name locations remain unresolved if more than one dictionary record maps here.
  if (entries.length !== 1) { ambiguousNotes++; continue; }
  geographyNotes[atlas.places[index].id] = entries[0];
}
// Some Theographic place records reuse a full dictionary article for different
// locations (for example, Brook of Egypt receives the Egypt article). Neither
// a matching verse nor an alias is enough to decide which use is correct.
const noteIdsByText = new Map();
for (const [placeId, note] of Object.entries(geographyNotes)) {
  const text = note.paragraphs.join('\n').trim();
  if (!noteIdsByText.has(text)) noteIdsByText.set(text, []);
  noteIdsByText.get(text).push(placeId);
}
let duplicateTextNotes = 0;
for (const placeIds of noteIdsByText.values()) {
  if (placeIds.length < 2) continue;
  duplicateTextNotes += placeIds.length;
  for (const placeId of placeIds) delete geographyNotes[placeId];
}
const geographyOutput = {
  source: 'Theographic Bible Metadata · Easton’s Bible Dictionary (1897)',
  sourceCommit,
  placeSourceCommit: atlas.sourceCommit,
  license: 'CC BY-SA 4.0',
  language: 'en',
  notes: geographyNotes,
  audit: {
    sourcePlaces: sourcePlaces.length,
    sourcePlacesWithDictionaryText: sourcePlaces.filter((row) => row.fields.dictText?.length).length,
    mappedPlaces: mappedSourcePlaces.size,
    matchedNotes: Object.keys(geographyNotes).length,
    ambiguousNotes,
    duplicateTextNotes,
    historicalLanguageNotes,
  },
};
writeFileSync(new URL('../public/data/geography-notes.json', import.meta.url), `${JSON.stringify(geographyOutput)}\n`);

const verseRows = new Map();
for (const row of sourceVerses) {
  const { reference } = sourceVerseById.get(row.id);
  const persons = [...new Set((row.fields.people || []).map((id) => personIndex.get(id)).filter((id) => id !== undefined))];
  const places = [...new Set((row.fields.places || []).map((id) => mappedSourcePlaces.get(id)).filter((id) => id !== undefined))];
  if (persons.length || places.length) verseRows.set(reference.join(':'), { reference, persons, places, events: [] });
}

const events = [];
const eventAudit = { total: sourceEvents.length, withLocation: 0, local: 0, usableLocation: 0 };
for (const row of sourceEvents) {
  const verseItems = row.fields.verses.map((id) => sourceVerseById.get(id));
  if (verseItems.some((item) => !item)) throw new Error(`Broken event verse ${row.fields.eventID}`);
  const chapterKeys = new Set(verseItems.map((item) => item.reference.slice(0, 2).join(':')));
  const bookKeys = new Set(verseItems.map((item) => item.reference[0]));
  const local = bookKeys.size === 1 && chapterKeys.size <= 2 && verseItems.length <= 80
    && !/\b(lifetime|reign|judgeship|sojourn)\b/i.test(row.fields.title);
  const locationIds = row.fields.locations || [];
  if (locationIds.length) eventAudit.withLocation++;
  if (!local) continue;
  eventAudit.local++;
  const locations = [...new Set(locationIds.filter((id) => verseItems.some((item) => item.places.includes(id)))
    .map((id) => mappedSourcePlaces.get(id)).filter((id) => id !== undefined))];
  if (locations.length) eventAudit.usableLocation++;
  const event = { id: row.fields.eventID, title: row.fields.title, locations,
    participants: [...new Set((row.fields.participants || []).map((id) => personIndex.get(id)).filter((id) => id !== undefined))] };
  events.push(event);
  for (const item of verseItems) {
    const key = item.reference.join(':');
    if (!verseRows.has(key)) verseRows.set(key, { reference: item.reference, persons: [], places: [], events: [] });
    verseRows.get(key).events.push(event.id);
  }
}

const index = {};
for (const row of verseRows.values()) {
  const [book, chapter, verse] = row.reference;
  const chapterKey = `${BOOKS[book].code} ${chapter}`;
  if (!index[chapterKey]) index[chapterKey] = {};
  index[chapterKey][verse] = [row.persons, row.places, row.events];
}
const output = { source: 'Theographic Bible Metadata', sourceCommit, placeSourceCommit: atlas.sourceCommit,
  license: 'CC BY-SA 4.0', people, events, index,
  audit: { books: 66, verses: sourceVerses.length, people: people.length, events: eventAudit,
    mappedPlaces: mappedSourcePlaces.size, sourcePlaces: sourcePlaces.length, indexedVerses: verseRows.size,
    versesWithMappedTheographicPlaces: [...verseRows.values()].filter((row) => row.places.length).length,
    versesWithExactPlaceAgreement: [...verseRows.values()].filter((row) => {
      const [book, chapter, verse] = row.reference;
      const direct = atlas.index[`${BOOKS[book].code} ${chapter}`]?.[verse] || [];
      return row.places.some((index) => direct.includes(index));
    }).length,
    versesWithLocalEvents: [...verseRows.values()].filter((row) => row.events.length).length } };
writeFileSync(new URL('../public/data/passage-evidence.json', import.meta.url), `${JSON.stringify(output)}\n`);
writeFileSync(new URL('../PASSAGE_EVIDENCE_AUDIT.md', import.meta.url), `# 본문·지명·인물·사건 연결 감사\n\n원자료: [Theographic Bible Metadata](https://github.com/robertrouse/theographic-bible-metadata/tree/${sourceCommit}) (CC BY-SA 4.0)와 [OpenBible.info Bible Geocoding Data](https://github.com/openbibleinfo/Bible-Geocoding-Data/tree/${atlas.sourceCommit}) (CC BY 4.0). 생성: \`node scripts/build_passage_evidence.mjs\`. 처음 실행하면 고정 판의 원자료를 저장소 밖 임시 폴더에 내려받습니다.\n\n- 66권 ${sourceVerses.length.toLocaleString()}절 및 인명 ${people.length.toLocaleString()}건 대조.\n- Theographic 지명 ${sourcePlaces.length.toLocaleString()}곳 중 OpenBible 지도 지명과 절 중복·이름/좌표 기준으로 연결한 곳 ${mappedSourcePlaces.size.toLocaleString()}곳. 별명·좌표 불일치·불확실한 동명이소는 연결하지 않았습니다.\n- 지도 지명과 연결된 Theographic 절 ${output.audit.versesWithMappedTheographicPlaces.toLocaleString()}절. 두 자료가 **같은 절에서 같은 지도 지명**을 연결한 절은 ${output.audit.versesWithExactPlaceAgreement.toLocaleString()}절입니다. 기존 OpenBible 지도 색인은 별도로 유지합니다.\n- 원자료 사건 ${sourceEvents.length}건 중 장소 필드 ${eventAudit.withLocation}건. 같은 책·두 장 이내·80절 이내이며 생애/재위 같은 광범위 제목을 제외한 사건 ${eventAudit.local}건. 그중 사건의 장소가 사건 본문에 직접 등장하고 지도 지명과도 일치한 사건 ${eventAudit.usableLocation}건.\n- 사건 위치는 Theographic의 편집 자료입니다. 한 사건에 여러 장소가 나와도 이동 순서·실제 경로로 해석하지 않습니다. 같은 절에 인명과 지명이 있다는 사실도 방문 증거가 아닙니다.\n\n## 자동 연결 규칙\n\n1. 서로 다른 두 원자료에서 같은 장소로 연결하려면 지명 일치 또는 가까운 좌표, 그리고 실제 **동일 절의 중복**이 필요합니다.\n2. 동명이소가 구분되지 않거나 좌표가 충돌하면 지도 연결을 생략합니다.\n3. 사건의 지명은 사건에 속한 절에서 직접 이름이 등장했을 때만 지도로 연결합니다.\n4. UI는 본문 지명, 사건 자료 위치, 인명 언급, 수작업 검수 여정을 서로 다른 근거 단계로 표시해야 합니다.\n\n## 알려진 원자료 분류 오류\n\nTheographic가 출애굽기 3장의 ‘이스라엘’을 야곱 인물 기록으로, ‘미디안’을 사람과 지명 양쪽으로 연결합니다. 본문 요약에서는 이런 민족명·동명 지명 충돌을 인물 목록에서 제외합니다. 전체 인명 검색은 원자료를 살펴보는 색인이므로 원자료의 분류를 그대로 보존하고, 인명과 지명이 함께 나와도 이동이라고 주장하지 않습니다. 다른 동명이인/동명이소에도 같은 문제가 있을 수 있어 구절별 검토가 계속 필요합니다.\n\n모든 본문·인물의 실제 이동을 검증했다는 뜻이 아닙니다. 성경 본문에 언급된 사실과 현장/이동 추론의 차이를 화면에서 유지합니다.\n`);
console.log(JSON.stringify({ ...output.audit, sample: crosswalk.filter((row) => ['Horeb', 'Egypt', 'Gilgal', 'Ur of the Chaldees'].includes(row.source)).slice(0, 15), bytes: readFileSync(new URL('../public/data/passage-evidence.json', import.meta.url)).length }, null, 2));
