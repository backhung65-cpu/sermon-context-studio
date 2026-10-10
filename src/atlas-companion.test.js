import test from 'node:test';
import assert from 'node:assert/strict';
import { atlasCompanionCopy, atlasPlatesForJourney, atlasPlatesForPassage } from './atlas-companion.js';

test('Exodus 3 points to terrain context, not the later Exodus route', () => {
  const ids = atlasPlatesForPassage({ code: 'EXO', chapter: 3 }).map(({ id }) => id);
  assert.deepEqual(ids, ['sinaiTerrain', 'mountains']);
});

test('Acts plates follow the actual journey period', () => {
  assert.deepEqual(atlasPlatesForPassage({ code: 'ACT', chapter: 16 }).map(({ id }) => id), ['paulFirstSecond']);
  assert.deepEqual(atlasPlatesForPassage({ code: 'ACT', chapter: 15 }).map(({ id }) => id), []);
  assert.deepEqual(atlasPlatesForPassage({ code: 'ACT', chapter: 20 }).map(({ id }) => id), ['paulThird']);
  assert.deepEqual(atlasPlatesForPassage({ code: 'ACT', chapter: 27 }).map(({ id }) => id), ['paulRome']);
  assert.deepEqual(atlasPlatesForJourney('paul-3').map(({ id }) => id), ['paulThird']);
  assert.deepEqual(atlasPlatesForPassage({ code: 'ACT', chapter: 24 }), []);
});

test('historically broad plates do not displace an earlier biblical period', () => {
  assert.deepEqual(atlasPlatesForPassage({ code: 'EXO', chapter: 10 }).map(({ id }) => id), ['egypt']);
  assert.deepEqual(atlasPlatesForPassage({ code: 'EXO', chapter: 20 }).map(({ id }) => id), ['sinaiTerrain']);
  assert.deepEqual(atlasPlatesForPassage({ code: 'NUM', chapter: 27 }), []);
  assert.deepEqual(atlasPlatesForPassage({ code: 'JOS', chapter: 13 }).map(({ id }) => id), ['tribes']);
  assert.deepEqual(atlasPlatesForPassage({ code: '1SA', chapter: 1 }).map(({ id }) => id), ['judges']);
  assert.deepEqual(atlasPlatesForPassage({ code: '1KI', chapter: 3 }).map(({ id }) => id), ['monarchy']);
  assert.deepEqual(atlasPlatesForPassage({ code: '2KI', chapter: 4 }).map(({ id }) => id), ['dividedKingdom']);
  assert.deepEqual(atlasPlatesForPassage({ code: '2KI', chapter: 23 }).map(({ id }) => id), ['dividedKingdom']);
  assert.deepEqual(atlasPlatesForPassage({ code: '2KI', chapter: 25 }).map(({ id }) => id), ['exile']);
  assert.deepEqual(atlasPlatesForPassage({ code: '2CH', chapter: 35 }).map(({ id }) => id), ['dividedKingdom']);
  assert.deepEqual(atlasPlatesForPassage({ code: '2CH', chapter: 36 }).map(({ id }) => id), ['exile']);
  assert.deepEqual(atlasPlatesForPassage({ code: 'MAT', chapter: 27 }).map(({ id }) => id), ['gospelRegion']);
  assert.deepEqual(atlasPlatesForPassage({ code: 'MRK', chapter: 4 }).map(({ id }) => id), ['gospelRegion', 'galileeTerrain']);
});

test('thematic atlas suggestions have verified PDF page indexes', () => {
  const samples = [
    { code: 'GEN', chapter: 12 }, { code: 'EXO', chapter: 1 }, { code: 'EXO', chapter: 18 },
    { code: 'JOS', chapter: 1 }, { code: 'JDG', chapter: 4 }, { code: '1SA', chapter: 1 },
    { code: '2KI', chapter: 4 }, { code: 'EZR', chapter: 1 }, { code: 'MRK', chapter: 4 },
    { code: 'ACT', chapter: 13 },
  ];
  const entries = samples.flatMap(atlasPlatesForPassage);
  assert.ok(entries.length >= samples.length);
  for (const entry of entries) {
    assert.ok(Number.isInteger(entry.studyPage) && entry.studyPage >= 1 && entry.studyPage <= 96);
    assert.ok(!entry.compactPage || Number.isInteger(entry.compactPage) && entry.compactPage >= 1 && entry.compactPage <= 32);
    assert.ok(entry.title[0] && entry.prompt[0]);
  }
  assert.deepEqual(atlasPlatesForPassage({ code: 'PSA', chapter: 23 }), []);
});

test('atlas guide navigation and cautions appear in all nine interface languages', () => {
  for (const locale of ['ko', 'en', 'ja', 'zh-CN', 'es', 'th', 'hi', 'fr', 'de']) {
    const copy = atlasCompanionCopy(locale);
    for (const key of ['title', 'intro', 'study', 'compact', 'page', 'caveat', 'source']) {
      assert.ok(copy[key]?.trim(), `${locale}: ${key}`);
    }
    assert.ok(copy.page.includes('{page}'), `${locale}: PDF page placeholder`);
  }
});
