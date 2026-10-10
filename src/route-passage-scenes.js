import { JOURNEYS } from './journeys.js';
import { distanceToRouteKm } from './route-stop-candidates.js';

// Only show places tied to this particular account. A line's proximity to a
// person/place co-mention is never evidence that the person passed through it.
const MANUAL_ROUTE_SCENES = {
  '031': [
    { placeId: 'adf74d4', code: 'GEN', chapter: 37, verse: 14 }, // Joseph came to Shechem.
    { placeId: 'ab635e4', code: 'GEN', chapter: 37, verse: 17 }, // Joseph found his brothers in Dothan.
  ],
  '076': [
    { placeId: 'aa4680a', code: '1SA', chapter: 1, verse: 9 }, // Hannah prays at Shiloh.
    { placeId: 'a90f6e1', code: '1SA', chapter: 1, verse: 19 }, // Hannah and Elkanah return home to Ramah.
    { placeId: 'aa4680a', code: '1SA', chapter: 1, verse: 24 }, // Hannah brings Samuel to Shiloh.
  ],
  '153': [
    { placeId: 'af5884f', code: 'LUK', chapter: 2, verse: 4 }, // Joseph leaves Nazareth.
    { placeId: 'a112427', code: 'LUK', chapter: 2, verse: 4 }, // Joseph goes to Bethlehem.
  ],
};

const CURATED_ROUTE_JOURNEYS = { '202': 'paul', '203': 'paul-2', '204': 'paul-3' };

export function passageScenesForRoute(route, places) {
  if (!route || !Array.isArray(places)) return [];
  const journey = JOURNEYS.find(({ id }) => id === CURATED_ROUTE_JOURNEYS[route.id]);
  const scenes = MANUAL_ROUTE_SCENES[route.id] || journey?.steps.map((step) => ({
    placeId: step.placeId,
    code: step.code || journey.code,
    chapter: step.chapter,
    verse: step.verse,
    endVerse: step.endVerse,
    broad: Boolean(step.broad),
  })) || [];
  const byId = new Map(places.map((place, index) => [place.id, { place, index }]));
  return scenes.map((scene, index) => {
    const found = byId.get(scene.placeId);
    if (!found) return null;
    return {
      ...scene,
      order: index + 1,
      place: found.place,
      placeIndex: found.index,
      distanceKm: distanceToRouteKm(found.place.coordinate, route.lines),
    };
  }).filter(Boolean);
}

export const PASSAGE_SCENE_ROUTE_IDS = Object.keys(MANUAL_ROUTE_SCENES).concat(Object.keys(CURATED_ROUTE_JOURNEYS));
