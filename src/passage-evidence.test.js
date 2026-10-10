import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { BOOKS, findPlaces, parseReference } from './reference.js';
import { EVIDENCE_MESSAGES, auditMessage, choosePassageFocus, evidenceForReference, evidencePriority, firstPassageMention, reviewedSceneMessage, verseInReference } from './passage-evidence.js';
import { passageContext } from './passage-context.js';
import { JOURNEYS } from './journeys.js';
import { VERSE_COUNTS } from './verse-counts.js';

const atlas = JSON.parse(readFileSync(new URL('../public/data/openbible-places.json', import.meta.url), 'utf8'));
const source = JSON.parse(readFileSync(new URL('../public/data/passage-evidence.json', import.meta.url), 'utf8'));
const inspect = (query) => {
  const reference = parseReference(query);
  return { reference, places: findPlaces(atlas, reference), evidence: evidenceForReference(source, atlas, reference, JOURNEYS) };
};

test('31,102 verse connections point to valid people, places and local events', () => {
  assert.equal(source.audit.verses, 31102);
  assert.equal(source.audit.people, 3067);
  assert.equal(source.placeSourceCommit, atlas.sourceCommit);
  const eventIds = new Set(source.events.map((event) => event.id));
  let verseRows = 0;
  let exactPlaceVerses = 0;
  for (const [chapterKey, verses] of Object.entries(source.index)) {
    const [code, chapterText] = chapterKey.split(' ');
    const chapter = Number(chapterText);
    assert.ok(BOOKS.some((book) => book.code === code));
    assert.ok(VERSE_COUNTS[code]?.[chapter - 1]);
    for (const [verseText, [persons, places, events]] of Object.entries(verses)) {
      verseRows++;
      const verse = Number(verseText);
      assert.ok(verse > 0 && verse <= VERSE_COUNTS[code][chapter - 1]);
      assert.ok(persons.every((index) => source.people[index]?.id));
      assert.ok(places.every((index) => atlas.places[index]?.id));
      assert.ok(events.every((id) => eventIds.has(id)));
      assert.equal(new Set(persons).size, persons.length);
      assert.equal(new Set(places).size, places.length);
      if (places.some((index) => atlas.index[chapterKey]?.[verse]?.includes(index))) exactPlaceVerses++;
    }
  }
  assert.equal(verseRows, source.audit.indexedVerses);
  assert.equal(exactPlaceVerses, source.audit.versesWithExactPlaceAgreement);
  for (const event of source.events) {
    assert.ok(event.locations.every((index) => atlas.places[index]?.id));
    assert.ok(event.participants.every((index) => source.people[index]?.id));
  }
});

test('the evidence panel has every label in all nine interface languages', () => {
  const keys = Object.keys(EVIDENCE_MESSAGES.ko);
  assert.equal(Object.keys(EVIDENCE_MESSAGES).length, 9);
  for (const [locale, messages] of Object.entries(EVIDENCE_MESSAGES)) {
    assert.deepEqual(Object.keys(messages).sort(), [...keys].sort(), locale);
    assert.ok(Object.values(messages).every((value) => typeof value === 'string' && value.trim()), locale);
  }
});

test('Exodus 3 keeps Horeb as the reviewed scene and Egypt as a mention', () => {
  const { reference, places, evidence } = inspect('출애굽기 3');
  const context = passageContext(reference, places);
  assert.equal(places.find((place) => place.id === context.scenePlaceId)?.name, 'Mount Horeb');
  assert.ok(evidence.confirmedPlaces.some((place) => place.name === 'Mount Horeb'));
  assert.ok(evidence.confirmedPlaces.some((place) => place.name === 'Egypt'));
  assert.ok(evidence.scenes.some(({ journey }) => journey.id === 'moses'));
  assert.ok(evidence.people.some((person) => person.id === 'moses_2108'));
  assert.ok(evidencePriority(places.find((place) => place.name === 'Mount Horeb'), context, evidence)
    < evidencePriority(places.find((place) => place.name === 'Egypt'), context, evidence));
});

test('2 Kings 4 starts with Shunem by verse order, never by location uncertainty', () => {
  const { places, evidence } = inspect('왕하 4:1-44');
  const sorted = [...places].sort((a, b) => evidencePriority(a, null, evidence) - evidencePriority(b, null, evidence)
    || firstPassageMention(a) - firstPassageMention(b));
  assert.equal(sorted[0].name, 'Shunem');
  assert.ok(sorted.some((place) => place.name === 'Gilgal 2'));
});

test('events never invent a location for a parable or an empty verse', () => {
  const parable = inspect('눅 10:25-37').evidence;
  assert.ok(parable.events.some((event) => event.title.includes('Samaritan')));
  assert.deepEqual(parable.eventPlaceIds, []);
  const empty = inspect('사 10:15');
  assert.equal(empty.places.length, 0);
  assert.equal(empty.evidence.eventPlaceIds.length, 0);
});

test('cross-chapter and single-verse selection do not leak nearby evidence', () => {
  const passage = inspect('행 16:6-17:2');
  assert.ok(passage.evidence.people.some((person) => person.id === 'paul_2479'));
  assert.ok(verseInReference(passage.reference, 'ACT', 17, 2));
  assert.ok(!verseInReference(passage.reference, 'ACT', 17, 3));
  const single = inspect('출 3:1');
  assert.ok(single.evidence.confirmedPlaces.some((place) => place.name === 'Mount Horeb'));
  assert.ok(!single.evidence.confirmedPlaces.some((place) => place.name === 'Egypt'));
});

test('two sources must name the place in the exact same verse', () => {
  const reference = parseReference('창 1:1-2');
  const smallAtlas = { places: [{ id: 'place-1', name: 'Place' }], index: { 'GEN 1': { 2: [0] } } };
  const smallSource = { people: [], events: [], index: { 'GEN 1': { 1: [[], [0], []] } } };
  assert.equal(evidenceForReference(smallSource, smallAtlas, reference).confirmedPlaces.length, 0);
  smallAtlas.index['GEN 1'][1] = [0];
  assert.equal(evidenceForReference(smallSource, smallAtlas, reference).confirmedPlaces.length, 1);
});

test('event metadata cannot displace a passage’s first named place', () => {
  const places = [
    { id: 'later', name: 'Later', coordinate: [35, 32], references: [{ chapter: 4, verse: 38 }] },
    { id: 'first', name: 'First', coordinate: [34, 32], references: [{ chapter: 4, verse: 8 }] },
  ];
  const evidence = { eventPlaceIds: ['later'], scenes: [] };
  assert.equal(choosePassageFocus(places, null, evidence).id, 'first');
  evidence.scenes.push({ step: { placeId: 'later' } });
  assert.equal(choosePassageFocus(places, null, evidence).id, 'later');
});

test('every reviewed journey scene can surface its exact verse place in passage search', () => {
  for (const journey of JOURNEYS) for (const step of journey.steps) {
    const code = step.code || journey.code;
    const reference = { code, chapter: step.chapter, startVerse: step.verse,
      endChapter: step.chapter, endVerse: step.verse };
    const places = findPlaces(atlas, reference);
    const evidence = evidenceForReference(source, atlas, reference, JOURNEYS);
    assert.ok(places.some((place) => place.id === step.placeId), `${journey.id} ${code} ${step.chapter}:${step.verse}`);
    assert.ok(evidence.scenes.some((scene) => scene.journey.id === journey.id && scene.step.placeId === step.placeId));
    assert.ok(evidence.scenes.some((scene) => scene.step.placeId === choosePassageFocus(places, null, evidence)?.id),
      `${journey.id}: a different reviewed place may share the verse, but the focus must stay within reviewed scenes`);
  }
});

test('reviewed scene explanation is available in every interface language', () => {
  for (const locale of Object.keys(EVIDENCE_MESSAGES)) {
    assert.ok(Object.values(reviewedSceneMessage(locale)).every((value) => typeof value === 'string' && value.trim()));
    assert.ok(Object.values(auditMessage(locale)).every((value) => typeof value === 'string' && value.trim()));
  }
});
