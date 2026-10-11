import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyMapLanguage, localizedMapTextField } from './map-language.js';

test('Korean map labels prefer a translated name and retain the original fallback', () => {
  const original = ['coalesce', ['get', 'name_en'], ['get', 'name']];
  assert.deepEqual(localizedMapTextField(original, 'ko'), ['coalesce', ['get', 'name:ko'], original]);
  assert.deepEqual(localizedMapTextField(original, 'zh-CN'), ['coalesce', ['get', 'name:zh-Hans'], ['get', 'name:zh'], original]);
  assert.equal(localizedMapTextField(original, 'unknown'), original);
});

test('language changes start from the original style and leave road labels alone', () => {
  const original = ['coalesce', ['get', 'name_en'], ['get', 'name']];
  const layers = [
    { id: 'label_city', type: 'symbol', 'source-layer': 'place', layout: { 'text-field': original } },
    { id: 'highway-name-major', type: 'symbol', 'source-layer': 'transportation_name', layout: { 'text-field': original } },
  ];
  const changes = [];
  const map = {
    getStyle: () => ({ layers }),
    getLayer: (id) => layers.find((layer) => layer.id === id),
    setLayoutProperty: (id, property, value) => changes.push({ id, property, value }),
  };
  applyMapLanguage(map, 'ko');
  applyMapLanguage(map, 'ja');
  assert.equal(changes.length, 2);
  assert.deepEqual(changes[0].value, ['coalesce', ['get', 'name:ko'], original]);
  assert.deepEqual(changes[1].value, ['coalesce', ['get', 'name:ja'], original]);
});
