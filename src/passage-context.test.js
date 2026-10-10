import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findPlaces, parseReference } from './reference.js';
import { passageContext, passageContextCopy, passageRole } from './passage-context.js';

const atlas = JSON.parse(readFileSync(new URL('../public/data/openbible-places.json', import.meta.url), 'utf8'));

test('Exodus 3 identifies Horeb as the scene, not the frequently mentioned Egypt', () => {
  const reference = parseReference('출애굽기 3장');
  const places = findPlaces(atlas, reference);
  const context = passageContext(reference, places);
  const byName = (name) => places.find((place) => place.name === name);
  assert.ok(context);
  assert.equal(context.scenePlaceId, byName('Mount Horeb').id);
  assert.equal(passageRole(context, byName('Mount Horeb')), 'scene');
  assert.equal(passageRole(context, byName('Midian')), 'background');
  assert.equal(passageRole(context, byName('Egypt')), 'discussed');
  assert.equal(byName('Mount Horeb').references[0].verse, 1);
  assert.equal(byName('Egypt').references[0].verse, 7);
  assert.equal(byName('Mount Sinai'), undefined); // Named elsewhere, not in this chapter.
});

test('scene context is not injected into a verse range that omits Horeb', () => {
  for (const query of ['출 3:7-22', '출 4']) {
    const reference = parseReference(query);
    assert.equal(passageContext(reference, findPlaces(atlas, reference)), null);
  }
  const verseOne = parseReference('출 3:1');
  const context = passageContext(verseOne, findPlaces(atlas, verseOne));
  assert.ok(context);
  assert.equal(context.hasEgypt, false);
});

test('the scene, background, and speech roles are translated for every app language', () => {
  for (const locale of ['ko', 'en', 'ja', 'zh-CN', 'es', 'th', 'hi', 'fr', 'de']) {
    const copy = passageContextCopy(locale);
    for (const key of ['title', 'summary', 'shortSummary', 'note', 'genericNote', 'journeyLink', 'scene', 'background', 'discussed', 'sceneDetail', 'backgroundDetail', 'discussedDetail']) {
      assert.ok(copy[key]?.length > 0, `${locale}: ${key}`);
    }
  }
});
