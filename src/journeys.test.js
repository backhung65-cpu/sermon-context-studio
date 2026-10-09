import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JOURNEYS, JOURNEY_MESSAGES } from './journeys.js';

const atlas = JSON.parse(readFileSync(new URL('../public/data/openbible-places.json', import.meta.url), 'utf8'));

test('every journey scene is backed by the pinned place and verse index', () => {
  for (const journey of JOURNEYS) {
    assert.ok(journey.steps.length >= 5);
    for (const step of journey.steps) {
      const index = atlas.places.findIndex((place) => place.id === step.placeId);
      assert.ok(index >= 0, `${journey.id}: missing place ${step.placeId}`);
      assert.ok(atlas.places[index].coordinate, `${journey.id}: missing coordinate`);
      const versePlaces = atlas.index[`${journey.code} ${step.chapter}`]?.[step.verse] || [];
      assert.ok(versePlaces.includes(index), `${journey.id}: ${journey.code} ${step.chapter}:${step.verse} does not name ${atlas.places[index].name}`);
    }
  }
});

test('all interface languages have a scene description for every waypoint', () => {
  const required = Object.keys(JOURNEY_MESSAGES.en).sort();
  for (const [locale, messages] of Object.entries(JOURNEY_MESSAGES)) {
    assert.deepEqual(Object.keys(messages).sort(), required, `${locale}: missing journey message`);
    for (const journey of JOURNEYS) {
      assert.equal(messages[`${journey.id}Events`]?.length, journey.steps.length, `${locale}: ${journey.id} scene count`);
      for (const line of messages[`${journey.id}Events`]) assert.ok(line.trim(), `${locale}: empty story scene`);
      assert.ok(messages[journey.id] && messages[`${journey.id}Intro`], `${locale}: missing journey name`);
    }
  }
});
