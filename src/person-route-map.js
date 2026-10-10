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

export function createPersonRouteMap(root, { getLocale, getMaplibre, onDataReady }) {
  let data;
  let pending;
  let error = false;
  let personId;
  let routeId;
  let map;
  let mapLoaded = false;
  root.innerHTML = `<section class="person-route-section"><div class="person-route-heading"><h5 id="person-route-title"></h5><p id="person-route-intro"></p></div><div id="person-route-picks" class="person-route-picks"></div><div id="person-route-map" class="person-route-map" aria-label="Bible route map"></div><div id="person-route-status" class="person-route-status"></div><div class="person-route-foot"><p id="person-route-warning"></p><a id="person-route-source" target="_blank" rel="noopener noreferrer"></a><a id="person-route-credit" href="https://translation.bible/tools-resources/bible-routes-from-ubs-project-marble/" target="_blank" rel="noopener noreferrer"></a></div></section>`;
  const mapElement = root.querySelector('#person-route-map');
  root.addEventListener('click', (event) => {
    const button = event.target.closest('[data-ubs-route]');
    if (!button) return;
    routeId = button.dataset.ubsRoute;
    render();
  });

  function currentRoutes() {
    return data?.routes.filter((route) => route.people.includes(personId)) || [];
  }

  function currentRoute() {
    return currentRoutes().find((route) => route.id === routeId);
  }

  function updateMap() {
    if (!mapLoaded) return;
    const route = currentRoute();
    map.getSource('person-route')?.setData(routeGeoJson(route));
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
