import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JOURNEYS, JOURNEY_CATEGORIES, JOURNEY_MESSAGES } from './journeys.js';

const atlas = JSON.parse(readFileSync(new URL('../public/data/openbible-places.json', import.meta.url), 'utf8'));

test('every journey scene is backed by the pinned place and verse index', () => {
  assert.equal(new Set(JOURNEYS.map((journey) => journey.id)).size, JOURNEYS.length);
  assert.deepEqual(JOURNEYS.filter((journey) => journey.category === 'paul').map((journey) => journey.id), ['paul', 'paul-2', 'paul-3']);
  for (const journey of JOURNEYS) {
    assert.ok(journey.steps.length >= 5);
    assert.ok(JOURNEY_CATEGORIES.includes(journey.category));
    for (const step of journey.steps) {
      const index = atlas.places.findIndex((place) => place.id === step.placeId);
      assert.ok(index >= 0, `${journey.id}: missing place ${step.placeId}`);
      assert.ok(atlas.places[index].coordinate, `${journey.id}: missing coordinate`);
      const code = step.code || journey.code;
      const versePlaces = atlas.index[`${code} ${step.chapter}`]?.[step.verse] || [];
      assert.ok(versePlaces.includes(index), `${journey.id}: ${code} ${step.chapter}:${step.verse} does not name ${atlas.places[index].name}`);
    }
  }
});

test('Moses journey includes the Horeb scene before returning to Egypt', () => {
  const steps = JOURNEYS.find((journey) => journey.id === 'moses').steps;
  const horebIndex = steps.findIndex((step) => step.code === 'EXO' && step.chapter === 3 && step.verse === 1);
  const egyptReturnIndex = steps.findIndex((step) => step.code === 'EXO' && step.chapter === 4 && step.verse === 20);
  assert.ok(horebIndex > 0);
  assert.ok(egyptReturnIndex > horebIndex);
  assert.equal(steps[horebIndex].placeId, 'a9bb03e');
});

test('all interface languages have a scene description for every waypoint', () => {
  const required = Object.keys(JOURNEY_MESSAGES.en).sort();
  for (const [locale, messages] of Object.entries(JOURNEY_MESSAGES)) {
    assert.deepEqual(Object.keys(messages).sort(), required, `${locale}: missing journey message`);
    for (const journey of JOURNEYS) {
      if (journey.title) {
        assert.ok(journey.title[locale]?.trim(), `${locale}: missing ${journey.id} title`);
        assert.ok(journey.intro.ko?.trim() && journey.intro.en?.trim());
        for (const step of journey.steps) {
          assert.ok(step.story.ko?.trim() && step.story.en?.trim(), `${journey.id}: missing story`);
          const actionKey = `action${step.action[0].toUpperCase()}${step.action.slice(1)}`;
          assert.ok(messages[actionKey]?.trim(), `${locale}: missing ${actionKey}`);
        }
      } else {
        assert.equal(messages[`${journey.id}Events`]?.length, journey.steps.length, `${locale}: ${journey.id} scene count`);
        for (const line of messages[`${journey.id}Events`]) assert.ok(line.trim(), `${locale}: empty story scene`);
        assert.ok(messages[journey.id] && messages[`${journey.id}Intro`], `${locale}: missing journey name`);
      }
    }
  }
});
