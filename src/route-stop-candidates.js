// Measure disagreement between two sources; proximity alone never establishes
// a biblical stop or a travel sequence.

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
