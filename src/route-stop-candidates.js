// The UBS shapes contain lines but no ordered waypoints. These are nearby
// settlement references, not verified stops or a travel sequence.
export function routePassageScope(route) {
  const id = route?.id || '';
  const number = Number.parseInt(id, 10);
  if (!Number.isFinite(number)) return null;
  if (id === '155') return { books: ['JON'] };
  if (number <= 36) return { books: ['GEN'] };
  if (number <= 47) return { books: number >= 46 ? ['NUM', 'DEU'] : ['EXO'] };
  if (number === 49) return { books: ['NUM'] };
  if (number <= 56) return { books: ['JOS'] };
  if (number <= 72) return { books: ['JDG'] };
  if (number === 75) return { books: ['RUT'] };
  if (number <= 89) return number >= 86
    ? { books: ['1SA'], startChapter: 19, endChapter: 30 }
    : { books: ['1SA'] };
  if (number <= 107) return { books: ['1KI', '2CH'] };
  if (number <= 132) return { books: ['1KI', '2KI'] };
  if (number <= 193) return { books: ['MAT', 'MRK', 'LUK', 'JHN'] };
  return { books: ['ACT'] };
}

export function distanceToRouteKm(coordinate, lines) {
  if (!Array.isArray(coordinate) || coordinate.length !== 2) return Infinity;
  const [lng, lat] = coordinate;
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return Infinity;
  const northKm = 111.2;
  const eastKm = northKm * Math.cos(lat * Math.PI / 180);
  let nearest = Infinity;
  for (const line of lines || []) {
    for (let i = 1; i < line.length; i++) {
      const [ax, ay] = line[i - 1];
      const [bx, by] = line[i];
      const dx = (bx - ax) * eastKm;
      const dy = (by - ay) * northKm;
      const px = (lng - ax) * eastKm;
      const py = (lat - ay) * northKm;
      const lengthSquared = dx * dx + dy * dy;
      const t = lengthSquared ? Math.max(0, Math.min(1, (px * dx + py * dy) / lengthSquared)) : 0;
      nearest = Math.min(nearest, Math.hypot(px - t * dx, py - t * dy));
    }
  }
  return nearest;
}

export function nearbyBiblicalSettlements(route, person, places, { codes, maxDistanceKm = 8, limit = 12 } = {}) {
  if (!route?.lines?.length || !person?.mapped?.length || !Array.isArray(places)) return [];
  const scope = codes ? routePassageScope(route) : null;
  const referencesByPlace = new Map();
  for (const row of person.mapped) {
    if (scope && (!scope.books.includes(codes[row[0]]) || row[1] < (scope.startChapter || 1) || row[1] > (scope.endChapter || Infinity))) continue;
    for (const placeIndex of row[3] || []) {
      if (!referencesByPlace.has(placeIndex)) referencesByPlace.set(placeIndex, []);
      referencesByPlace.get(placeIndex).push(row);
    }
  }
  const candidates = [];
  for (const [placeIndex, references] of referencesByPlace) {
    const place = places[placeIndex];
    if (place?.type !== 'settlement' || !place.name) continue;
    const distanceKm = distanceToRouteKm(place.coordinate, route.lines);
    if (distanceKm > maxDistanceKm) continue;
    candidates.push({ place, placeIndex, distanceKm, references });
  }
  candidates.sort((a, b) => a.distanceKm - b.distanceKm || b.references.length - a.references.length || a.place.name.localeCompare(b.place.name));
  const selected = [];
  for (const candidate of candidates) {
    // The gazetteer contains several ancient names for the same coordinate.
    if (selected.some(({ place }) => distanceToRouteKm(candidate.place.coordinate, [[place.coordinate, place.coordinate]]) < 1)) continue;
    selected.push(candidate);
    if (selected.length >= limit) break;
  }
  return selected;
}
