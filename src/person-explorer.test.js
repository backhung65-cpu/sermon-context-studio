import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BOOKS } from './reference.js';
import { VERSE_COUNTS } from './verse-counts.js';
import { filterPeople, matchingPeople } from './person-explorer.js';

const index = JSON.parse(readFileSync(new URL('../public/data/people-index.json', import.meta.url), 'utf8'));
const atlas = JSON.parse(readFileSync(new URL('../public/data/openbible-places.json', import.meta.url), 'utf8'));
const routeData = JSON.parse(readFileSync(new URL('../public/data/ubs-person-routes.json', import.meta.url), 'utf8'));

test('person index covers each Bible book and preserves distinct identities', () => {
  assert.equal(index.audit.books, 66);
  assert.equal(index.audit.verses, 31102);
  assert.equal(index.codes.length, BOOKS.length);
  assert.deepEqual(index.codes, BOOKS.map((book) => book.code));
  assert.equal(index.people.length, index.audit.people);
  assert.equal(new Set(index.people.map((person) => person.id)).size, index.people.length);
  assert.ok(index.people.find((person) => person.id === 'joseph_1710'));
  assert.ok(index.people.find((person) => person.id === 'joseph_1715'));
  assert.ok(matchingPeople(index.people, '요셉').length >= 2);
  assert.ok(matchingPeople(index.people, 'Ruth', 'en').some((person) => person.id === 'ruth_2450'));
});

test('book and same-verse place filters narrow people without inventing a journey', () => {
  assert.ok(filterPeople(index.people, { query: '룻', bookIndex: 7 }).some((person) => person.id === 'ruth_2450'));
  assert.ok(filterPeople(index.people, { query: '룻', bookIndex: 39 }).some((person) => person.id === 'ruth_2450'));
  assert.ok(filterPeople(index.people, { query: '룻', bookIndex: 7, mappedOnly: true }).some((person) => person.id === 'ruth_2450'));
  assert.ok(!filterPeople(index.people, { query: '룻', bookIndex: 39, mappedOnly: true }).some((person) => person.id === 'ruth_2450'));
});

test('route availability filter returns only people attached to published source drawings', () => {
  const routePersonIds = new Set(routeData.routes.flatMap((route) => route.people));
  const matches = filterPeople(index.people, { routeOnly: true, routePersonIds });
  assert.equal(matches.length, routeData.personCount);
  assert.ok(matches.some((person) => person.id === 'ruth_2450'));
  assert.ok(!matches.some((person) => person.id === 'god_1324'));
});

test('every person reference is a valid verse and every mapped reference matches the atlas', () => {
  let references = 0;
  let mapped = 0;
  for (const person of index.people) {
    const keys = new Set();
    for (const [bookIndex, chapter, verse] of person.refs) {
      const code = index.codes[bookIndex];
      assert.ok(code, `${person.id}: invalid book`);
      assert.ok(chapter >= 1 && chapter <= VERSE_COUNTS[code].length, `${person.id}: invalid chapter`);
      assert.ok(verse >= 1 && verse <= VERSE_COUNTS[code][chapter - 1], `${person.id}: invalid verse`);
      keys.add(`${bookIndex}:${chapter}:${verse}`);
      references += 1;
    }
    assert.equal(keys.size, person.refs.length, `${person.id}: duplicate verse`);
    for (const [bookIndex, chapter, verse, places] of person.mapped) {
      const code = index.codes[bookIndex];
      assert.ok(keys.has(`${bookIndex}:${chapter}:${verse}`));
      assert.deepEqual(places, atlas.index[`${code} ${chapter}`]?.[verse]);
      for (const placeIndex of places) assert.ok(atlas.places[placeIndex]?.id);
      mapped += 1;
    }
  }
  assert.equal(references, index.audit.personVerseLinks);
  assert.equal(mapped, index.audit.mappedPersonVerseLinks);
  assert.equal(index.placeSourceCommit, atlas.sourceCommit);
});
