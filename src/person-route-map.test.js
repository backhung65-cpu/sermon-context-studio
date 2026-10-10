import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { routeGeoJson } from './person-route-map.js';

const routes = JSON.parse(readFileSync(new URL('../public/data/ubs-person-routes.json', import.meta.url), 'utf8'));
const people = JSON.parse(readFileSync(new URL('../public/data/people-index.json', import.meta.url), 'utf8'));

test('UBS route drawings are validated and linked only to known distinct person IDs', () => {
  const personIds = new Set(people.people.map((person) => person.id));
  assert.equal(routes.sourceGeoJsonFiles, 179);
  assert.equal(routes.routeCount, routes.routes.length);
  assert.equal(new Set(routes.routes.map((route) => route.id)).size, routes.routeCount);
  assert.equal(new Set(routes.routes.flatMap((route) => route.people)).size, routes.personCount);
  for (const route of routes.routes) {
    assert.ok(route.title && route.titleKo && route.sourceUrl.includes('/ubs-bible-routes/GeoJsonRoutes/'));
    assert.ok(route.people.length);
    for (const personId of route.people) assert.ok(personIds.has(personId), `${route.id}: ${personId}`);
    const geojson = routeGeoJson(route);
    assert.equal(geojson.features.length, route.lines.length);
    for (const line of route.lines) {
      assert.ok(line.length >= 2, route.id);
      for (const [lng, lat] of line) {
        assert.ok(Number.isFinite(lng) && Math.abs(lng) <= 180, route.id);
        assert.ok(Number.isFinite(lat) && Math.abs(lat) <= 90, route.id);
      }
    }
  }
  assert.equal(routeGeoJson().features.length, 0);
});

test('clearly different names are not merged into one Bible person', () => {
  const byPerson = (personId) => routes.routes.filter((route) => route.people.includes(personId));
  assert.ok(byPerson('ruth_2450').some((route) => route.id === '075'));
  assert.ok(byPerson('naomi_2147').some((route) => route.id === '075'));
  assert.ok(byPerson('joshua_1727').length > 0);
  assert.equal(byPerson('joshua_893').length, 0);
  assert.ok(byPerson('philip_2347').some((route) => route.id === '198'));
  assert.equal(byPerson('philip_2344').length, 0);
  assert.ok(byPerson('jesus_905').length >= 20);
  assert.ok(byPerson('paul_2479').length >= 9);
  assert.equal(routes.routes.find((route) => route.id === '153').sourceFile, '153. Nazareth to Bethlehem.geojson');
  assert.equal(routes.routes.filter((route) => route.code === '199b').length, 2);
  assert.ok(!routes.routes.some((route) => route.id === '061'));
});
