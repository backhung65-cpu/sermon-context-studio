import { readFileSync, writeFileSync } from 'node:fs';
import { passageScenesForRoute, PASSAGE_SCENE_ROUTE_IDS } from '../src/route-passage-scenes.js';

const atlas = JSON.parse(readFileSync(new URL('../public/data/openbible-places.json', import.meta.url), 'utf8'));
const people = JSON.parse(readFileSync(new URL('../public/data/people-index.json', import.meta.url), 'utf8'));
const source = JSON.parse(readFileSync(new URL('../public/data/ubs-person-routes.json', import.meta.url), 'utf8'));
const knownPeople = new Set(people.people.map((person) => person.id));
const expectedPerson = { '031': 'joseph_1710', '153': 'joseph_1715', '202': 'paul_2479', '203': 'paul_2479', '204': 'paul_2479' };
const errors = [];
const rows = source.routes.map((route) => {
  const scenes = passageScenesForRoute(route, atlas.places);
  if (!route.people.length || route.people.some((id) => !knownPeople.has(id))) errors.push(`${route.id}: invalid person assignment`);
  if (PASSAGE_SCENE_ROUTE_IDS.includes(route.id) !== Boolean(scenes.length)) errors.push(`${route.id}: missing or unexpected passage scenes`);
  if (expectedPerson[route.id] && !route.people.includes(expectedPerson[route.id])) errors.push(`${route.id}: incorrect person for passage`);
  if (route.id === '153' && route.people.includes('jesus_905')) errors.push('153: unborn Jesus assigned to pre-birth travel');
  for (const scene of scenes) {
    if (!atlas.index[`${scene.code} ${scene.chapter}`]?.[scene.verse]?.includes(scene.placeIndex)) {
      errors.push(`${route.id}: ${scene.place.name} absent from ${scene.code} ${scene.chapter}:${scene.verse}`);
    }
    if (!Number.isFinite(scene.distanceKm)) errors.push(`${route.id}: no measurable route/place geometry`);
  }
  return { id: route.id, title: route.titleKo, people: route.people, sceneCount: scenes.length,
    references: scenes.map((scene) => `${scene.code} ${scene.chapter}:${scene.verse}`) };
});
const counts = { routeDrawings: rows.length, personRecords: new Set(rows.flatMap((row) => row.people)).size,
  passageLinkedDrawings: rows.filter((row) => row.sceneCount).length,
  uncheckedDrawings: rows.filter((row) => !row.sceneCount).length,
  passageLinkedScenes: rows.reduce((sum, row) => sum + row.sceneCount, 0) };
if (source.routeCount !== rows.length || source.personCount !== counts.personRecords) errors.push('Route/person counts disagree with source metadata');
if (!process.argv.includes('--check')) {
  const table = rows.map((row) => `| ${row.id} | ${row.title} | ${row.sceneCount ? `${row.sceneCount}장면 · ${row.references.join(', ')}` : '장면별 본문 미대조'} |`).join('\n');
  writeFileSync(new URL('../ROUTE_EVIDENCE_STATUS.md', import.meta.url),
    `# UBS 경로별 본문 장면 연결 현황\n\n재생성: \`npm run audit:routes\`. UBS 선은 편집상 경로 도형이며 고대의 실제 도로가 아닙니다. 여기의 장면 연결은 **같은 이야기의 정확한 절에 지명이 있는지**를 검사합니다. 사람의 실제 이동, 모든 경유 도시, 위치의 확정성을 증명하지 않습니다.\n\n- UBS 경로 도형: **${counts.routeDrawings}개**, 연결 인명 기록 **${counts.personRecords}개**\n- 장면별 본문 연결: **${counts.passageLinkedDrawings}개 도형 / ${counts.passageLinkedScenes}개 장면**\n- 장면별 본문 미대조: **${counts.uncheckedDrawings}개 도형**. 이 도형에는 경유 도시 핀을 만들지 않습니다.\n\n| 도형 | 원자료 제목 | 현재 본문 연결 상태 |\n| --- | --- | --- |\n${table}\n`);
}
console.log(JSON.stringify({ counts, errors }, null, 2));
if (errors.length) process.exitCode = 1;
