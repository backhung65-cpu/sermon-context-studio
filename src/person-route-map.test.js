import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { routeGeoJson } from './person-route-map.js';
import { passageScenesForRoute, PASSAGE_SCENE_ROUTE_IDS } from './route-passage-scenes.js';

const routes = JSON.parse(readFileSync(new URL('../public/data/ubs-person-routes.json', import.meta.url), 'utf8'));
const people = JSON.parse(readFileSync(new URL('../public/data/people-index.json', import.meta.url), 'utf8'));
const atlas = JSON.parse(readFileSync(new URL('../public/data/openbible-places.json', import.meta.url), 'utf8'));
const places = atlas.places;

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
  assert.deepEqual(routes.routes.find((route) => route.id === '153').people, ['mary_1938', 'joseph_1715']);
  assert.equal(routes.routes.filter((route) => route.code === '199b').length, 2);
  assert.ok(!routes.routes.some((route) => route.id === '061'));
});

test('Nazareth to Bethlehem shows only places in the family travel passage', () => {
  const scenes = passageScenesForRoute(routes.routes.find((route) => route.id === '153'), places);
  assert.deepEqual(scenes.map(({ place }) => place.name), ['Nazareth', 'Bethlehem 1']);
  assert.ok(scenes.every(({ code, chapter, verse }) => code === 'LUK' && chapter === 2 && verse === 4));
  assert.ok(!scenes.some(({ place }) => ['Bethany 1', 'Jericho 2'].includes(place.name)));
});

test('Joseph to Dothan retains the biblical destination despite a coordinate disagreement', () => {
  const scenes = passageScenesForRoute(routes.routes.find((route) => route.id === '031'), places);
  assert.deepEqual(scenes.map(({ place }) => place.name), ['Shechem', 'Dothan']);
  assert.deepEqual(scenes.map(({ verse }) => verse), [14, 17]);
  assert.ok(scenes[1].distanceKm > 20, 'the map must not hide the source discrepancy');
});

test('Hannah names Shiloh and Ramah in the order of the account', () => {
  const scenes = passageScenesForRoute(routes.routes.find((route) => route.id === '076'), places);
  assert.deepEqual(scenes.map(({ place }) => place.name), ['Shiloh', 'Ramah 4', 'Shiloh']);
  assert.deepEqual(scenes.map(({ code, chapter, verse }) => [code, chapter, verse]),
    [['1SA', 1, 9], ['1SA', 1, 19], ['1SA', 1, 24]]);
  assert.ok(scenes.every(({ distanceKm }) => distanceKm < 3));
});

test('only route-specific scenes have map markers and each one names its exact verse', () => {
  assert.equal(new Set(PASSAGE_SCENE_ROUTE_IDS).size, 6);
  for (const route of routes.routes) {
    const scenes = passageScenesForRoute(route, places);
    assert.equal(scenes.length > 0, PASSAGE_SCENE_ROUTE_IDS.includes(route.id), route.id);
    for (const scene of scenes) {
      assert.ok(atlas.index[`${scene.code} ${scene.chapter}`]?.[scene.verse]?.includes(scene.placeIndex),
        `${route.id}: ${scene.place.name} absent from ${scene.code} ${scene.chapter}:${scene.verse}`);
      assert.ok(Number.isFinite(scene.distanceKm), `${route.id}: missing source distance`);
    }
  }
  assert.equal(passageScenesForRoute(routes.routes.find((route) => route.id === '086'), places).length, 0);
});
