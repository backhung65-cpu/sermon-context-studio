import { bibleReadingUrl, localizedBookName } from './reference.js';
import { passageScenesForRoute, PASSAGE_SCENE_ROUTE_IDS } from './route-passage-scenes.js';

const STOP_COPY = {
  ko: ['본문으로 연결한 장소', '이 경로의 본문 장면에서 이름이 확인된 장소입니다. 번호는 본문 순서이며 UBS 선은 실제 길이 아닙니다. 서로 다른 자료의 좌표 차이를 함께 표시합니다.', '본문', 'UBS 선과 약', 'km 차이', '한국어 성경 읽기', '이 경로는 장면별 장소 근거를 아직 대조하지 않았습니다. 원자료의 선만으로 경유 도시를 확정할 수 없습니다.'],
  en: ['Places linked to this account', 'Named places in passages for this particular account, in narrative order. The UBS line is not a historical road; coordinate differences between sources are shown.', 'Passage', 'About', 'km from UBS line', 'Read in Korean', 'Passage-specific places have not yet been checked for this drawing. The line alone cannot establish stops.'],
  ja: ['本文と結び付いた場所', 'この物語の本文に記された場所を順に示します。UBSの線は実際の道ではなく、資料間の位置の差も表示します。', '本文', 'UBS線から約', 'km', '韓国語聖書を読む', 'この図の場所と本文はまだ照合されていません。線だけでは経由地を確定できません。'],
  'zh-CN': ['与经文相连的地点', '按叙事顺序显示这段记载中明确出现的地点。UBS线不是实际道路，也显示资料间坐标差异。', '经文', '距UBS线约', '公里', '阅读韩语圣经', '这幅路线图的地点尚未逐段核对，不能仅凭线条确定途经地。'],
  es: ['Lugares vinculados al relato', 'Lugares nombrados en pasajes de este relato, en orden narrativo. La línea de UBS no es un camino histórico; se muestra la diferencia de coordenadas.', 'Pasaje', 'A unos', 'km de la línea UBS', 'Leer en coreano', 'Los lugares de este trazado aún no se han cotejado con sus pasajes. La línea no confirma paradas.'],
  th: ['สถานที่ที่เชื่อมกับพระคัมภีร์', 'แสดงสถานที่ในเรื่องนี้ตามลำดับเนื้อหา เส้น UBS ไม่ใช่ถนนจริง และแสดงความต่างของพิกัดจากแต่ละแหล่ง', 'พระคัมภีร์', 'ห่างจากเส้น UBS ราว', 'กม.', 'อ่านพระคัมภีร์เกาหลี', 'ยังไม่ได้ตรวจสถานที่ทีละฉากจากพระคัมภีร์ เส้นเพียงอย่างเดียวยืนยันเมืองที่ผ่านไม่ได้'],
  hi: ['इस वृत्तांत से जुड़े स्थान', 'इस वृत्तांत में नामित स्थान कथा के क्रम में हैं। UBS रेखा ऐतिहासिक सड़क नहीं है; स्रोतों के निर्देशांक में अंतर दिखाया गया है।', 'पाठ', 'UBS रेखा से लगभग', 'किमी', 'कोरियाई बाइबल पढ़ें', 'इस रेखा के स्थान अभी पदवार नहीं जाँचे गए हैं। केवल रेखा पड़ाव सिद्ध नहीं करती।'],
  fr: ['Lieux liés à ce récit', 'Lieux nommés dans les passages de ce récit, dans l’ordre narratif. Le tracé UBS n’est pas une route historique; les écarts de coordonnées sont indiqués.', 'Passage', 'À environ', 'km du tracé UBS', 'Lire en coréen', 'Les lieux de ce tracé ne sont pas encore vérifiés verset par verset. La ligne seule ne confirme aucune étape.'],
  de: ['Orte dieses Berichts', 'Orte, die im Text dieses Berichts genannt werden, in Erzählreihenfolge. Die UBS-Linie ist keine historische Straße; Koordinatenabweichungen werden angezeigt.', 'Bibelstelle', 'Etwa', 'km von der UBS-Linie', 'Auf Koreanisch lesen', 'Die Orte dieser Zeichnung sind noch nicht abschnittsweise geprüft. Die Linie allein belegt keine Stationen.'],
};
const ROUTE_STATUS = {
  ko: ['본문 장면 연결', '선만 · 미대조'], en: ['Passage scenes linked', 'Line only · unchecked'],
  ja: ['本文の場面あり', '線のみ・未照合'], 'zh-CN': ['已连接经文场景', '仅有线条·未核对'],
  es: ['Escenas bíblicas enlazadas', 'Solo línea · sin cotejar'], th: ['เชื่อมฉากพระคัมภีร์', 'มีเพียงเส้น · ยังไม่ตรวจ'],
  hi: ['पाठ के दृश्य जुड़े', 'केवल रेखा · अप्रमाणित'], fr: ['Scènes bibliques liées', 'Tracé seul · non vérifié'],
  de: ['Bibelstellen verbunden', 'Nur Linie · ungeprüft'],
};
const linkedRouteIds = new Set(PASSAGE_SCENE_ROUTE_IDS);
const ITINERARY_COPY = {
  ko: '본문에 나온 장소 순서', en: 'Places in narrative order', ja: '本文の場所の順序',
  'zh-CN': '经文中的地点顺序', es: 'Lugares en orden del relato', th: 'สถานที่ตามลำดับเรื่อง',
  hi: 'कथा क्रम में स्थान', fr: 'Lieux dans l’ordre du récit', de: 'Orte in Erzählreihenfolge',
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

export function createPersonRouteMap(root, { getLocale, getMaplibre, getPlaces, placeName, onDataReady }) {
  let data;
  let pending;
  let error = false;
  let personId;
  let routeId;
  let map;
  let mapLoaded = false;
  let markers = [];
  let stops = [];
  root.innerHTML = `<section class="person-route-section"><div class="person-route-heading"><h5 id="person-route-title"></h5><p id="person-route-intro"></p></div><div id="person-route-picks" class="person-route-picks"></div><div id="person-route-map" class="person-route-map" aria-label="Bible route map"></div><div id="person-route-itinerary" class="person-route-itinerary" hidden></div><div id="person-route-status" class="person-route-status"></div><div id="person-route-stops" class="person-route-stops" hidden><div class="person-route-stops-heading"><strong id="person-route-stops-title"></strong><p id="person-route-stops-intro"></p></div><div id="person-route-stops-list" class="person-route-stops-list"></div></div><div class="person-route-foot"><p id="person-route-warning"></p><a id="person-route-source" target="_blank" rel="noopener noreferrer"></a><a id="person-route-credit" href="https://translation.bible/tools-resources/bible-routes-from-ubs-project-marble/" target="_blank" rel="noopener noreferrer"></a></div></section>`;
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
    markers.forEach(({ marker, stopIndices }) => marker.getElement().setAttribute('aria-pressed', String(stopIndices.includes(index))));
    layoutMarkerLabels();
    if (mapLoaded) map.flyTo({ center: stop.place.coordinate, zoom: Math.max(map.getZoom(), 9), duration: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 400 });
  }

  function layoutMarkerLabels() {
    if (!mapLoaded || !markers.length) return;
    const mapBox = mapElement.getBoundingClientRect();
    const accepted = [];
    const ordered = [...markers].sort((a, b) => Number(b.marker.getElement().getAttribute('aria-pressed') === 'true') - Number(a.marker.getElement().getAttribute('aria-pressed') === 'true'));
    for (const { marker } of ordered) {
      const label = marker.getElement().querySelector('.person-route-stop-label');
      label.hidden = false;
      const box = label.getBoundingClientRect();
      const outside = box.left < mapBox.left + 4 || box.right > mapBox.right - 4 || box.top < mapBox.top + 4 || box.bottom > mapBox.bottom - 4;
      const overlap = accepted.some((other) => box.left < other.right + 4 && box.right + 4 > other.left && box.top < other.bottom + 4 && box.bottom + 4 > other.top);
      if (outside || overlap) label.hidden = true;
      else accepted.push(box);
    }
  }

  function updateMarkers() {
    markers.forEach(({ marker }) => marker.remove());
    markers = [];
    const lib = getMaplibre();
    const groups = new Map();
    stops.forEach((stop, index) => groups.set(stop.placeId, [...(groups.get(stop.placeId) || []), index]));
    const placedLabels = [];
    for (const indices of groups.values()) {
      const stop = stops[indices[0]];
      const [lng, lat] = stop.place.coordinate;
      const nearby = placedLabels.filter(({ coordinate }) => Math.hypot((lng - coordinate[0]) * 111.2 * Math.cos(lat * Math.PI / 180), (lat - coordinate[1]) * 111.2) < 120);
      const labelSide = nearby.length && nearby.at(-1).side === 'right' ? 'left' : 'right';
      placedLabels.push({ coordinate: stop.place.coordinate, side: labelSide });
      const element = document.createElement('button');
      element.type = 'button';
      element.className = `person-route-stop-marker${labelSide === 'left' ? ' label-left' : ''}${stop.place.candidateCount > 1 ? ' uncertain' : ''}`;
      element.setAttribute('aria-label', `${indices.map((index) => stops[index].order).join(', ')} · ${placeName(stop.place)}`);
      const number = document.createElement('span');
      number.className = 'person-route-stop-number';
      number.textContent = indices.length > 1 ? `${stop.order}+` : String(stop.order);
      const label = document.createElement('span');
      label.className = 'person-route-stop-label';
      label.textContent = placeName(stop.place);
      element.append(number, label);
      element.addEventListener('click', (event) => { event.stopPropagation(); focusStop(indices[0]); });
      markers.push({ marker: new lib.Marker({ element, anchor: 'bottom' }).setLngLat(stop.place.coordinate).addTo(map), stopIndices: indices });
    }
    requestAnimationFrame(layoutMarkerLabels);
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
    for (const stop of stops) if (stop.place.coordinate) bounds.extend(stop.place.coordinate);
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
      map.on('moveend', () => requestAnimationFrame(layoutMarkerLabels));
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
    const routeStatus = ROUTE_STATUS[locale] || ROUTE_STATUS.en;
    root.querySelector('#person-route-picks').innerHTML = routes.map((route) => `<button type="button" data-ubs-route="${escapeHtml(route.id)}" aria-pressed="${route.id === routeId}"><span>${escapeHtml(locale === 'ko' ? route.titleKo : route.title)}</span><small>${escapeHtml(route.code)} · ${escapeHtml(routeStatus[linkedRouteIds.has(route.id) ? 0 : 1])}</small></button>`).join('');
    const route = currentRoute();
    const stopCopy = STOP_COPY[locale] || STOP_COPY.en;
    stops = passageScenesForRoute(route, getPlaces?.());
    const stopsSection = root.querySelector('#person-route-stops');
    stopsSection.hidden = !route;
    root.querySelector('#person-route-stops-title').textContent = `${stopCopy[0]} · ${stops.length}`;
    root.querySelector('#person-route-stops-intro').textContent = stops.length ? stopCopy[1] : stopCopy[6];
    const itinerary = root.querySelector('#person-route-itinerary');
    itinerary.hidden = !stops.length;
    itinerary.innerHTML = stops.length ? `<strong>${escapeHtml(ITINERARY_COPY[locale] || ITINERARY_COPY.en)}</strong><div>${stops.map((stop, index) => `<button type="button" data-route-stop="${index}">${stop.order}. ${escapeHtml(placeName(stop.place))}</button>`).join('')}</div>` : '';
    root.querySelector('#person-route-stops-list').innerHTML = stops.length ? stops.map((stop, index) => {
      const reference = `${localizedBookName(stop.code, locale)} ${stop.chapter}:${stop.verse}`;
      const uncertainty = stop.place.candidateCount > 1 ? ` · ${stop.place.candidateCount} ${locale === 'ko' ? '위치 후보' : 'location candidates'}` : '';
      return `<div class="person-route-stop-card"><button type="button" data-route-stop="${index}" aria-pressed="false"><span class="person-route-stop-card-number">${stop.order}</span><span><strong>${escapeHtml(placeName(stop.place))}</strong><small>${escapeHtml(stop.place.name)}${escapeHtml(uncertainty)} · ${escapeHtml(stopCopy[3])} ${stop.distanceKm.toFixed(1)} ${escapeHtml(stopCopy[4])}</small></span></button><span class="person-route-stop-evidence">${escapeHtml(stopCopy[2])} · ${escapeHtml(reference)}</span><a href="${bibleReadingUrl(stop.code, stop.chapter, stop.verse)}" target="_blank" rel="noopener noreferrer">${escapeHtml(stopCopy[5])} ↗</a></div>`;
    }).join('') : '';
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
