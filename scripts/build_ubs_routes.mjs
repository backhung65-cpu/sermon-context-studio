import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { PERSON_ROUTE_CODES, KOREAN_ROUTE_TITLES, KOREAN_FILE_TITLES } from './ubs_route_manifest.mjs';

const sourceRoot = process.argv[2];
if (!sourceRoot) throw new Error('Usage: node scripts/build_ubs_routes.mjs <ubs-open-license-repository-path>');
const routeDirectory = join(sourceRoot, 'ubs-bible-routes', 'GeoJsonRoutes');
const sourceCommit = execFileSync('git', ['-C', sourceRoot, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const allFiles = readdirSync(routeDirectory).filter((file) => file.endsWith('.geojson')).sort();
const peopleIndex = JSON.parse(readFileSync(new URL('../public/data/people-index.json', import.meta.url), 'utf8'));
const knownPeople = new Set(peopleIndex.people.map((person) => person.id));
const codePeople = new Map();
for (const [personId, codes] of Object.entries(PERSON_ROUTE_CODES)) {
  if (!knownPeople.has(personId)) throw new Error(`Unknown person: ${personId}`);
  for (const code of codes) {
    if (!KOREAN_ROUTE_TITLES[code]) throw new Error(`Missing Korean route label: ${code}`);
    if (!codePeople.has(code)) codePeople.set(code, []);
    codePeople.get(code).push(personId);
  }
}

const routes = [];
for (const [code, personIds] of codePeople) {
  let files = allFiles.filter((file) => file.startsWith(`${code}.`));
  // Two unrelated drawings share the source's 153 prefix; only the Bethlehem journey is assigned here.
  if (code === '153') files = files.filter((file) => file.includes('Nazareth to Bethlehem'));
  if (!files.length || (files.length > 1 && code !== '199b')) {
    throw new Error(`Unexpected UBS route files for ${code}: ${files.join(', ')}`);
  }
  for (const [fileIndex, file] of files.entries()) {
    const original = JSON.parse(readFileSync(join(routeDirectory, file), 'utf8'));
    const features = original?.type === 'FeatureCollection' ? original.features : [original];
    if (!Array.isArray(features) || !features.length) throw new Error(`No geometry in ${file}`);
    const lines = features.map((feature) => {
      if (feature?.geometry?.type !== 'LineString' || !Array.isArray(feature.geometry.coordinates)) {
        throw new Error(`Unexpected geometry in ${file}`);
      }
      const coordinates = feature.geometry.coordinates.map((coordinate) => {
        if (!Array.isArray(coordinate) || coordinate.length !== 2 ||
            !coordinate.every(Number.isFinite) || Math.abs(coordinate[0]) > 180 || Math.abs(coordinate[1]) > 90) {
          throw new Error(`Invalid coordinate in ${file}`);
        }
        return coordinate.map((value) => Number(value.toFixed(6)));
      });
      if (coordinates.length < 2) throw new Error(`Too few coordinates in ${file}`);
      return coordinates;
    });
    const title = file.replace(/\.geojson$/, '').replace(/^[^ ]+ /, '');
    routes.push({
      id: files.length === 1 ? code : `${code}-${fileIndex + 1}`,
      code,
      title,
      titleKo: KOREAN_FILE_TITLES[file] || KOREAN_ROUTE_TITLES[code],
      people: personIds,
      sourceFile: file,
      sourceUrl: `https://github.com/ubsicap/ubs-open-license/blob/${sourceCommit}/ubs-bible-routes/GeoJsonRoutes/${encodeURIComponent(file)}`,
      lines,
    });
  }
}
routes.sort((a, b) => a.id.localeCompare(b.id, 'en', { numeric: true }));
const output = {
  source: 'United Bible Societies Project MARBLE Bible Routes',
  sourceUrl: 'https://translation.bible/tools-resources/bible-routes-from-ubs-project-marble/',
  author: 'Dr. Leen Ritmeyer for United Bible Societies',
  license: 'CC BY-SA 4.0',
  sourceCommit,
  sourceGeoJsonFiles: allFiles.length,
  routeCount: routes.length,
  personCount: Object.keys(PERSON_ROUTE_CODES).length,
  editorialStatus: 'UBS route drawing, person assignment by this app; route-specific verse links have not been audited',
  routes,
};
writeFileSync(new URL('../public/data/ubs-person-routes.json', import.meta.url), `${JSON.stringify(output)}\n`);
const lines = routes.map((route) => `| ${route.id} | ${route.titleKo} | ${route.people.join(', ')} | [원본](${route.sourceUrl}) |`).join('\n');
writeFileSync(new URL('../UBS_ROUTE_AUDIT.md', import.meta.url), `# UBS 성경 경로 자료 적용 점검\n\n원자료: [United Bible Societies Project MARBLE Bible Routes](${output.sourceUrl}) · Dr. Leen Ritmeyer · CC BY-SA 4.0 · [저장소](https://github.com/ubsicap/ubs-open-license/tree/${sourceCommit}/ubs-bible-routes) · 커밋 ${sourceCommit}.\n\n원자료 GeoJSON ${allFiles.length}개 중 제목과 인물 식별이 비교적 분명한 ${routes.length}개 경로 도형을 ${output.personCount}개 인명 기록에 연결했습니다. 한 경로가 여러 인물에게 연결될 수 있습니다. 전체 ${peopleIndex.people.length.toLocaleString('ko-KR')}개 인명 기록 가운데 나머지 ${(peopleIndex.people.length - output.personCount).toLocaleString('ko-KR')}개에는 이 자료로 연결할 수 있는 경로 도형이 없습니다. 앱은 좌표를 소수 여섯 자리로 반올림하고 인물 ID·한국어 제목을 붙였습니다. 이 파생 경로 파일은 CC BY-SA 4.0으로 제공합니다.\n\n**중요한 제한:** UBS GeoJSON에는 경로별 인물 ID, 장절, 각 선분의 이동 근거가 들어 있지 않습니다. 아래의 인물 연결은 원본 제목과 이야기 문맥을 바탕으로 한 편집 분류이며, 모든 경로를 성경 본문으로 구간별 검수한 결과가 아닙니다. 지도 선은 UBS의 재구성 도형으로 고대의 실제 길 또는 이동 시간이라는 뜻이 아닙니다. 출애굽 경로안들은 서로 다른 제안을 병렬로 보여줍니다. 이동 기록이 없거나 원자료에서 명확한 경로가 없는 인물에게 선을 만들지 않았습니다. 원자료의 전쟁·영토·성전 도형 등은 인물 개인의 이동으로 무리하게 연결하지 않았습니다. 기존 앱의 본문 검수 여정 7개와 이 경로 도형을 구별해 표시합니다.\n\n| 자료 번호 | 앱의 제목 | 연결한 인명 ID | UBS 원본 |\n| --- | --- | --- | --- |\n${lines}\n`);
console.log(JSON.stringify({ sourceFiles: allFiles.length, routes: routes.length, people: output.personCount, bytes: readFileSync(new URL('../public/data/ubs-person-routes.json', import.meta.url)).length }));
