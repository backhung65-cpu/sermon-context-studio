import { bibleReadingUrl, localizedBookName } from './reference.js';
import { nearbyBiblicalSettlements } from './route-stop-candidates.js';

const STOP_COPY = {
  ko: ['선 가까이의 성경 도시', '경로 이야기의 성경 책에서 이 인물과 같은 절에 나오며 선에서 8km 이내인 도시 후보입니다. 번호는 선과 가까운 순서이며 이동 순서가 아닙니다. 실제 경유지는 검증되지 않았습니다. 이름이 겹치는 핀은 누르면 볼 수 있습니다.', '같은 절', '경로에서 약', 'km', '한국어 성경 읽기', '이 조건에 맞는 도시가 없습니다. 선만으로 경유지를 확인할 수 없습니다.'],
  en: ['Biblical towns near this line', 'These towns occur with this person in a verse from the route’s narrative book and lie within 8 km of the drawing. Numbers rank proximity to the line, not travel order. Actual stops are unverified. Select overlapping pins to see their names.', 'Same verse', 'About', 'km from line', 'Read in Korean', 'No towns meet these criteria. The line alone does not establish stops.'],
  ja: ['線の近くにある聖書の町', '人物と同じ節に登場し、線から8km以内の町の候補です。実際の経由地や順序は未検証です。', '同じ節', '線から約', 'km', '韓国語聖書を読む', '条件に合う町はありません。'],
  'zh-CN': ['路线附近的圣经城镇', '人物和地名出现在同一节且距路线8公里内。实际途经地和顺序尚未核实。', '同节', '距路线约', '公里', '阅读韩语圣经', '没有符合条件的城镇。'],
  es: ['Poblaciones bíblicas cercanas', 'Aparecen en el mismo versículo que la persona y a menos de 8 km de la línea. Las paradas y el orden no están verificados.', 'Mismo versículo', 'A unos', 'km de la línea', 'Leer en coreano', 'No hay poblaciones que cumplan estos criterios.'],
  th: ['เมืองในพระคัมภีร์ใกล้เส้นทาง', 'เมืองที่กล่าวถึงในข้อเดียวกับบุคคลและอยู่ห่างเส้นไม่เกิน 8 กม. ยังไม่ยืนยันว่าแวะผ่านจริงหรือเป็นลำดับใด', 'ข้อเดียวกัน', 'ห่างเส้นประมาณ', 'กม.', 'อ่านพระคัมภีร์เกาหลี', 'ไม่พบเมืองตามเกณฑ์นี้'],
  hi: ['रेखा के पास बाइबल के नगर', 'ये नगर व्यक्ति के साथ उसी पद में आते हैं और रेखा से 8 किमी के भीतर हैं। वास्तविक पड़ाव और क्रम अप्रमाणित हैं।', 'उसी पद में', 'रेखा से लगभग', 'किमी', 'कोरियाई बाइबल पढ़ें', 'इन मानदंडों पर कोई नगर नहीं मिला।'],
  fr: ['Villes bibliques près du tracé', 'Ces villes figurent dans le même verset que la personne, à moins de 8 km du tracé. Les étapes et leur ordre ne sont pas vérifiés.', 'Même verset', 'À environ', 'km du tracé', 'Lire en coréen', 'Aucune ville ne répond à ces critères.'],
  de: ['Biblische Orte nahe der Linie', 'Diese Orte stehen im selben Vers wie die Person und liegen höchstens 8 km von der Linie entfernt. Aufenthalte und Reihenfolge sind ungeprüft.', 'Gleicher Vers', 'Etwa', 'km von der Linie', 'Auf Koreanisch lesen', 'Kein Ort erfüllt diese Kriterien.'],
};

const COPY = {
  ko: { heading: '인물의 경로를 지도에서', intro: 'United Bible Societies가 공개한 경로 도형입니다. 제목과 문맥으로 인물에 연결했으며, 각 선분의 장절은 아직 대조하지 않았습니다.', noRoute: '이 인물에게 연결할 수 있는 공개 경로 도형이 없습니다. 이동 기록이 없다는 뜻은 아닙니다.', loading: '경로 자료를 불러오는 중입니다.', failed: '경로 자료를 불러오지 못했습니다.', mapFailed: '지도 배경을 불러오지 못했습니다. 아래 원자료 링크를 사용할 수 있습니다.', source: 'UBS 원자료', license: 'Dr. Leen Ritmeyer · UBS · CC BY-SA 4.0', warning: '선은 역사적 실제 도로나 확정 이동 경로가 아닌 편집상 재구성입니다. 출애굽에는 복수의 경로안이 있습니다.' },
  en: { heading: 'Map this person’s routes', intro: 'Route drawings published by United Bible Societies, assigned to people by title and narrative context. Segment-level verses have not been audited.', noRoute: 'No published drawing could be linked to this person; that does not prove there was no travel.', loading: 'Loading route drawings.', failed: 'Could not load route drawings.', mapFailed: 'Map background unavailable; the source link remains available.', source: 'UBS source', license: 'Dr. Leen Ritmeyer · UBS · CC BY-SA 4.0', warning: 'Lines are editorial reconstructions, not historical roads or certain itineraries. Exodus has competing proposed routes.' },
  ja: { heading: '人物の経路を地図で見る', intro: 'UBS公開の経路図を題名と文脈から人物に結びました。線分ごとの聖書箇所は未照合です。', noRoute: 'この人物に結び付けられる経路図はありません。移動がなかったという意味ではありません。', loading: '経路図を読み込み中です。', failed: '経路図を読み込めません。', mapFailed: '地図を読み込めません。原資料リンクを利用できます。', source: 'UBS原資料', license: 'Dr. Leen Ritmeyer · UBS · CC BY-SA 4.0', warning: '線は編集上の再構成で、実際の古道や確定経路ではありません。' },
  'zh-CN': { heading: '在地图上查看人物路线', intro: 'UBS公开路线图按标题和叙事背景关联人物；每段路线的经文尚未逐一核查。', noRoute: '没有可关联的公开路线图；不代表此人没有移动。', loading: '正在加载路线图。', failed: '路线图加载失败。', mapFailed: '地图不可用，仍可打开原始资料。', source: 'UBS原始资料', license: 'Dr. Leen Ritmeyer · UBS · CC BY-SA 4.0', warning: '线条是编辑性重建，并非历史道路或确定行程。' },
  es: { heading: 'Rutas de esta persona en el mapa', intro: 'Dibujos de UBS vinculados por título y contexto; faltan verificar los versículos de cada tramo.', noRoute: 'No hay un dibujo vinculable; esto no prueba que no viajara.', loading: 'Cargando rutas.', failed: 'No se pudieron cargar las rutas.', mapFailed: 'Mapa no disponible; puede abrir la fuente.', source: 'Fuente de UBS', license: 'Dr. Leen Ritmeyer · UBS · CC BY-SA 4.0', warning: 'Las líneas son reconstrucciones editoriales, no caminos históricos confirmados.' },
  th: { heading: 'ดูเส้นทางบุคคลบนแผนที่', intro: 'เส้นทางของ UBS เชื่อมกับบุคคลจากชื่อและบริบท ยังไม่ได้ตรวจข้อพระคัมภีร์ทีละช่วง', noRoute: 'ไม่มีภาพเส้นทางที่เชื่อมได้ ไม่ได้หมายความว่าไม่มีการเดินทาง', loading: 'กำลังโหลดเส้นทาง', failed: 'โหลดเส้นทางไม่ได้', mapFailed: 'โหลดแผนที่ไม่ได้ แต่เปิดแหล่งข้อมูลได้', source: 'แหล่งข้อมูล UBS', license: 'Dr. Leen Ritmeyer · UBS · CC BY-SA 4.0', warning: 'เส้นเป็นการสร้างภาพตามการตีความ ไม่ใช่ถนนจริงที่ยืนยันแล้ว' },
  hi: { heading: 'व्यक्ति की यात्रा मानचित्र पर', intro: 'UBS के मार्ग चित्र शीर्षक और प्रसंग से जोड़े गए हैं; हर खंड के पद जाँचे नहीं गए हैं।', noRoute: 'इस व्यक्ति से जुड़ा चित्र नहीं मिला; इसका अर्थ यह नहीं कि उसने यात्रा नहीं की।', loading: 'मार्ग लोड हो रहे हैं।', failed: 'मार्ग लोड नहीं हुए।', mapFailed: 'मानचित्र उपलब्ध नहीं; स्रोत लिंक खोलें।', source: 'UBS स्रोत', license: 'Dr. Leen Ritmeyer · UBS · CC BY-SA 4.0', warning: 'रेखाएँ संपादकीय पुनर्निर्माण हैं, प्रमाणित प्राचीन सड़कें नहीं।' },
  fr: { heading: 'Parcours de cette personne sur la carte', intro: 'Tracés UBS associés selon le titre et le contexte; les versets de chaque segment restent à vérifier.', noRoute: 'Aucun tracé associé; cela ne prouve pas l’absence de déplacement.', loading: 'Chargement des tracés.', failed: 'Impossible de charger les tracés.', mapFailed: 'Carte indisponible; le lien source reste accessible.', source: 'Source UBS', license: 'Dr. Leen Ritmeyer · UBS · CC BY-SA 4.0', warning: 'Ces lignes sont des reconstructions éditoriales, pas des routes historiques certaines.' },
  de: { heading: 'Wege dieser Person auf der Karte', intro: 'UBS-Zeichnungen nach Titel und Kontext zugeordnet; Bibelstellen je Abschnitt sind noch nicht geprüft.', noRoute: 'Keine Zeichnung zuordenbar; das belegt nicht, dass es keine Reise gab.', loading: 'Routen werden geladen.', failed: 'Routen konnten nicht geladen werden.', mapFailed: 'Karte nicht verfügbar; Quellenlink bleibt nutzbar.', source: 'UBS-Quelle', license: 'Dr. Leen Ritmeyer · UBS · CC BY-SA 4.0', warning: 'Linien sind redaktionelle Rekonstruktionen, keine bestätigten antiken Straßen.' },
};
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);

export function routeGeoJson(route) {
  return { type: 'FeatureCollection', features: route ? route.lines.map((coordinates) => ({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates } })) : [] };
}

export function createPersonRouteMap(root, { getLocale, getMaplibre, getPerson, getCodes, getPlaces, placeName, onDataReady }) {
  let data;
  let pending;
  let error = false;
  let personId;
  let routeId;
  let map;
  let mapLoaded = false;
  let markers = [];
  let stops = [];
  root.innerHTML = `<section class="person-route-section"><div class="person-route-heading"><h5 id="person-route-title"></h5><p id="person-route-intro"></p></div><div id="person-route-picks" class="person-route-picks"></div><div id="person-route-map" class="person-route-map" aria-label="Bible route map"></div><div id="person-route-status" class="person-route-status"></div><div id="person-route-stops" class="person-route-stops" hidden><div class="person-route-stops-heading"><strong id="person-route-stops-title"></strong><p id="person-route-stops-intro"></p></div><div id="person-route-stops-list" class="person-route-stops-list"></div></div><div class="person-route-foot"><p id="person-route-warning"></p><a id="person-route-source" target="_blank" rel="noopener noreferrer"></a><a id="person-route-credit" href="https://translation.bible/tools-resources/bible-routes-from-ubs-project-marble/" target="_blank" rel="noopener noreferrer"></a></div></section>`;
  const mapElement = root.querySelector('#person-route-map');
  root.addEventListener('click', (event) => {
    const button = event.target.closest('[data-ubs-route]');
    if (button) { routeId = button.dataset.ubsRoute; render(); return; }
    const stopButton = event.target.closest('[data-route-stop]');
    if (stopButton) focusStop(Number(stopButton.dataset.routeStop));
  });

  function currentRoutes() {
    return data?.routes.filter((route) => route.people.includes(personId)) || [];
  }

  function currentRoute() {
    return currentRoutes().find((route) => route.id === routeId);
  }

  function focusStop(index) {
    const stop = stops[index];
    if (!stop) return;
    root.querySelectorAll('[data-route-stop]').forEach((button) => { button.setAttribute('aria-pressed', String(Number(button.dataset.routeStop) === index)); });
    markers.forEach((marker, markerIndex) => marker.getElement().setAttribute('aria-pressed', String(markerIndex === index)));
    if (mapLoaded) map.flyTo({ center: stop.place.coordinate, zoom: Math.max(map.getZoom(), 9), duration: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 400 });
    root.querySelector(`#person-route-stops-list [data-route-stop="${index}"]`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  function updateMarkers() {
    markers.forEach((marker) => marker.remove());
    markers = [];
    const lib = getMaplibre();
    const namedCoordinates = [];
    for (const [index, stop] of stops.entries()) {
      const hasVisibleName = namedCoordinates.every((coordinate) => {
        const [lng, lat] = stop.place.coordinate;
        const eastKm = 111.2 * Math.cos(lat * Math.PI / 180);
        return Math.hypot((lng - coordinate[0]) * eastKm, (lat - coordinate[1]) * 111.2) >= 12;
      });
      if (hasVisibleName) namedCoordinates.push(stop.place.coordinate);
      const element = document.createElement('button');
      element.type = 'button';
      element.className = `person-route-stop-marker${hasVisibleName ? '' : ' person-route-stop-marker--compact'}`;
      element.dataset.routeStop = String(index);
      element.setAttribute('aria-label', `${placeName(stop.place)} · ${stop.references.length} ${STOP_COPY[getLocale()]?.[2] || STOP_COPY.en[2]}`);
      const number = document.createElement('span');
      number.className = 'person-route-stop-number';
      number.textContent = String(index + 1);
      const label = document.createElement('span');
      label.className = 'person-route-stop-label';
      label.textContent = placeName(stop.place);
      element.append(number, label);
      element.addEventListener('click', (event) => { event.stopPropagation(); focusStop(index); });
      markers.push(new lib.Marker({ element, anchor: 'bottom' }).setLngLat(stop.place.coordinate).addTo(map));
    }
  }

  function updateMap() {
    if (!mapLoaded) return;
    const route = currentRoute();
    map.getSource('person-route')?.setData(routeGeoJson(route));
    updateMarkers();
    if (!route) return;
    const lib = getMaplibre();
    const bounds = new lib.LngLatBounds();
    for (const line of route.lines) for (const coordinate of line) bounds.extend(coordinate);
    map.resize();
    map.fitBounds(bounds, { padding: 42, maxZoom: 9, duration: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 450 });
  }

  function setupMap() {
    if (map || !currentRoute() || !getMaplibre() || !root.offsetWidth) return;
    const lib = getMaplibre();
    try {
      map = new lib.Map({ container: mapElement, style: 'https://tiles.openfreemap.org/styles/positron', center: [34, 33], zoom: 4, attributionControl: true });
      map.addControl(new lib.NavigationControl({ showCompass: false }), 'top-right');
      map.on('load', () => {
        map.addSource('person-route', { type: 'geojson', data: routeGeoJson(currentRoute()) });
        map.addLayer({ id: 'person-route-line', type: 'line', source: 'person-route', paint: { 'line-color': '#be5ca4', 'line-width': 4, 'line-opacity': .88, 'line-dasharray': [1.5, 1.5] } });
        mapLoaded = true;
        updateMap();
      });
      map.on('error', () => { if (!mapLoaded) root.querySelector('#person-route-status').textContent = (COPY[getLocale()] || COPY.en).mapFailed; });
    } catch {
      map = undefined;
      root.querySelector('#person-route-status').textContent = (COPY[getLocale()] || COPY.en).mapFailed;
    }
  }

  function render() {
    const locale = getLocale();
    const copy = COPY[locale] || COPY.en;
    const routes = currentRoutes();
    root.querySelector('#person-route-title').textContent = `${copy.heading}${routes.length ? ` · ${routes.length}` : ''}`;
    mapElement.setAttribute('aria-label', copy.heading);
    root.querySelector('#person-route-intro').textContent = copy.intro;
    root.querySelector('#person-route-warning').textContent = copy.warning;
    root.querySelector('#person-route-credit').textContent = `${copy.license} ↗`;
    if (!routes.some((route) => route.id === routeId)) routeId = routes[0]?.id;
    root.querySelector('#person-route-picks').innerHTML = routes.map((route) => `<button type="button" data-ubs-route="${escapeHtml(route.id)}" aria-pressed="${route.id === routeId}"><span>${escapeHtml(locale === 'ko' ? route.titleKo : route.title)}</span><small>${escapeHtml(route.code)}</small></button>`).join('');
    const route = currentRoute();
    const stopCopy = STOP_COPY[locale] || STOP_COPY.en;
    stops = nearbyBiblicalSettlements(route, getPerson?.(personId), getPlaces?.(), { codes: getCodes?.() });
    const stopsSection = root.querySelector('#person-route-stops');
    stopsSection.hidden = !route;
    root.querySelector('#person-route-stops-title').textContent = `${stopCopy[0]} · ${stops.length}`;
    root.querySelector('#person-route-stops-intro').textContent = stopCopy[1];
    root.querySelector('#person-route-stops-list').innerHTML = stops.length ? stops.map((stop, index) => {
      const row = stop.references[0];
      const code = getCodes?.()[row[0]];
      const reference = code ? `${localizedBookName(code, locale)} ${row[1]}:${row[2]}` : '';
      return `<div class="person-route-stop-card"><button type="button" data-route-stop="${index}" aria-pressed="false"><span class="person-route-stop-card-number">${index + 1}</span><span><strong>${escapeHtml(placeName(stop.place))}</strong><small>${escapeHtml(stop.place.name)} · ${escapeHtml(stopCopy[3])} ${stop.distanceKm.toFixed(1)} ${escapeHtml(stopCopy[4])}</small></span></button><span class="person-route-stop-evidence">${escapeHtml(stopCopy[2])} ${stop.references.length} · ${escapeHtml(reference)}</span>${code ? `<a href="${bibleReadingUrl(code, row[1], row[2])}" target="_blank" rel="noopener noreferrer">${escapeHtml(stopCopy[5])} ↗</a>` : ''}</div>`;
    }).join('') : `<p class="person-route-no-stops">${escapeHtml(stopCopy[6])}</p>`;
    mapElement.hidden = !route;
    root.querySelector('#person-route-status').textContent = error ? copy.failed : !data ? copy.loading : !route ? copy.noRoute : '';
    const source = root.querySelector('#person-route-source');
    source.hidden = !route;
    if (route) { source.href = route.sourceUrl; source.textContent = `${copy.source} · ${route.title} ↗`; }
    if (mapLoaded) updateMap();
    else if (route) requestAnimationFrame(setupMap);
  }

  function setPerson(id) {
    personId = id;
    render();
  }

  async function load() {
    if (data || pending || error) return pending;
    pending = fetch('/public/data/ubs-person-routes.json').then(async (response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      data = await response.json();
      if (data.routeCount !== data.routes.length || data.sourceGeoJsonFiles < data.routeCount) throw new Error('Incomplete UBS routes');
      render();
      onDataReady?.();
    }).catch(() => { error = true; render(); });
    return pending;
  }

  render();
  return { load, setPerson, render, personIds: () => new Set(data?.routes.flatMap((route) => route.people) || []), countFor: (id) => data?.routes.filter((route) => route.people.includes(id)).length || 0, onShow: () => { if (mapLoaded) updateMap(); else setupMap(); } };
}
