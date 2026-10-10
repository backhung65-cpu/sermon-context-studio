import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { routeGeoJson } from './person-route-map.js';
import { nearbyBiblicalSettlements, distanceToRouteKm, routePassageScope } from './route-stop-candidates.js';

const routes = JSON.parse(readFileSync(new URL('../public/data/ubs-person-routes.json', import.meta.url), 'utf8'));
const people = JSON.parse(readFileSync(new URL('../public/data/people-index.json', import.meta.url), 'utf8'));
const places = JSON.parse(readFileSync(new URL('../public/data/openbible-places.json', import.meta.url), 'utf8')).places;

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

test('David route shows distinct named towns with same-verse evidence, not just a line', () => {
  const route = routes.routes.find((item) => item.id === '086');
  const person = people.people.find((item) => item.id === 'david_994');
  const stops = nearbyBiblicalSettlements(route, person, places, { codes: people.codes });
  assert.ok(stops.length >= 6);
  for (const name of ['Nob', 'Gibeah 1', 'Hebron', 'Ziph 1', 'Gath 1']) {
    assert.ok(stops.some((stop) => stop.place.name === name), `${name} missing`);
  }
  for (const stop of stops) {
    assert.equal(stop.place.type, 'settlement');
    assert.ok(stop.distanceKm <= 8);
    assert.ok(stop.references.some((row) => row[3].includes(stop.placeIndex)));
    assert.ok(stop.references.every((row) => people.codes[row[0]] === '1SA' && row[1] >= 19 && row[1] <= 30));
  }
  for (let i = 0; i < stops.length; i++) for (let j = i + 1; j < stops.length; j++) {
    assert.ok(distanceToRouteKm(stops[i].place.coordinate, [[stops[j].place.coordinate, stops[j].place.coordinate]]) >= 1);
  }
});

test('all linked route maps only expose nearby settlements with person references', () => {
  const byId = new Map(people.people.map((person) => [person.id, person]));
  let routesWithCities = 0;
  for (const route of routes.routes) for (const personId of route.people) {
    const stops = nearbyBiblicalSettlements(route, byId.get(personId), places, { codes: people.codes });
    if (stops.length) routesWithCities++;
    assert.ok(stops.length <= 12);
    for (const stop of stops) {
      assert.ok(stop.distanceKm <= 8, `${route.id} / ${stop.place.name}`);
      assert.ok(stop.references.length, `${route.id} / ${stop.place.name}`);
      assert.equal(stop.place.type, 'settlement');
    }
  }
  assert.equal(routesWithCities, 92);
  assert.deepEqual(routePassageScope(routes.routes.find((route) => route.id === '155')).books, ['JON']);
  assert.deepEqual(routePassageScope(routes.routes.find((route) => route.id === '155a')).books, ['MAT', 'MRK', 'LUK', 'JHN']);
});
