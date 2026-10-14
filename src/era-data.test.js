import test from 'node:test';
import assert from 'node:assert/strict';
import { ERA_STUDIES, matchEraStudy, relatedEraStudies, sceneReferenceForSelection } from './era-data.js';
import { CHAPTER_COUNTS, parseReference } from './reference.js';
import { VERSE_COUNTS } from './verse-counts.js';

test('every reviewed era has complete, non-overlapping chapter scenes and valid neighbor references', () => {
  assert.equal(ERA_STUDIES.length, 5);
  for (const study of ERA_STUDIES) {
    assert.ok(CHAPTER_COUNTS[study.code] >= study.chapter);
    assert.equal(matchEraStudy(parseReference(study.example))?.study.id, study.id);
    let nextVerse = 1;
    for (const stage of study.stages) {
      assert.equal(stage.start, nextVerse, `${study.id} scene gap or overlap`);
      assert.ok(stage.end >= stage.start);
      nextVerse = stage.end + 1;
    }
    assert.equal(nextVerse - 1, VERSE_COUNTS[study.code][study.chapter - 1], `${study.id} incomplete chapter`);
    for (const neighbor of [study.before, study.after]) {
      assert.equal(parseReference(`${neighbor.code} ${neighbor.chapter}:${neighbor.verse}`).error, undefined);
    }
  }
});

test('a verse selection only shows scenes intersecting that selected range', () => {
  const acts = matchEraStudy(parseReference('행 16:6-15'));
  assert.equal(acts.study.id, 'acts-16');
  assert.deepEqual(acts.stages.map(({ start, end }) => [start, end]), [[6, 10], [11, 15]]);
  const exodus = matchEraStudy(parseReference('출 3:1-6'));
  assert.deepEqual(exodus.stages.map(({ start, end }) => [start, end]), [[1, 6]]);
  assert.equal(matchEraStudy(parseReference('출 3:20-4:1')), null);
  assert.equal(matchEraStudy(parseReference('시편 23')), null);
});

test('a cross-chapter search surfaces the reviewed portion without implying full review', () => {
  const range = parseReference('출 3:20-4:1');
  assert.equal(matchEraStudy(range), null);
  assert.deepEqual(relatedEraStudies(range).map(({ reference }) => reference), ['EXO 3:20-22']);
  assert.deepEqual(relatedEraStudies(parseReference('창 12-13')).map(({ reference }) => reference), ['GEN 12']);
  assert.deepEqual(relatedEraStudies(parseReference('시편 23')), []);
});

test('a selected scene opens the exact overlapping passage in the place tool', () => {
  assert.equal(sceneReferenceForSelection(parseReference('출 3'), { start: 7, end: 12 }), 'EXO 3:7-12');
  assert.equal(sceneReferenceForSelection(parseReference('출 3:8-9'), { start: 7, end: 12 }), 'EXO 3:8-9');
  assert.equal(sceneReferenceForSelection(parseReference('행 16:10'), { start: 6, end: 10 }), 'ACT 16:10');
});
