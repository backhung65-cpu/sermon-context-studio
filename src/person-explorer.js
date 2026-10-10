import { bibleReadingUrl, localizedBookName } from './reference.js';
import { createPersonRouteMap } from './person-route-map.js';

// These labels are editorial aliases only. The stable identity is Theographic personLookup.
export const KOREAN_NAMES = {
  jesus_905: '예수 그리스도', paul_2479: '바울', moses_2108: '모세', abraham_58: '아브라함',
  david_994: '다윗', israel_682: '이스라엘 (인물·민족 구분 필요)', aaron_1: '아론', solomon_2762: '솔로몬',
  saul_2478: '사울', judah_1751: '유다', joseph_1710: '요셉 (야곱의 아들)',
  joseph_1715: '요셉 (마리아의 남편)', joshua_1727: '여호수아', peter_2745: '베드로',
  ephraim_1206: '에브라임', benjamin_463: '베냐민', esau_1216: '에서',
  pharaoh_2331: '바로 (출애굽)', pharaoh_2329: '바로 (요셉 시대)',
  jeremiah_853: '예레미야', isaac_616: '이삭', samuel_2469: '사무엘',
  hezekiah_1512: '히스기야', elijah_1131: '엘리야', elisha_1153: '엘리사',
  john_1676: '세례 요한', nebuchadnezzar_2167: '느부갓네살',
  jonathan_1692: '요나단', jeroboam_872: '여로보암', ahab_113: '아합',
  daniel_975: '다니엘', reuben_2429: '르우벤', eleazar_1062: '엘르아살',
  balaam_593: '발람', pilate_2365: '본디오 빌라도', isaiah_617: '이사야',
  job_1639: '욥', mordecai_2107: '모르드개', gideon_1314: '기드온',
  josiah_1730: '요시야', ruth_2450: '룻', naomi_2147: '나오미',
  jonah_1689: '요나', esther_1343: '에스더', god_1324: '하나님',
  holy_spirit_7400: '성령', satan_2476: '사탄',
  hagar_1348: '하갈', lot_1830: '롯', ehud_1039: '에훗', deborah_997: '드보라',
  abimelech_41: '아비멜렉 (기드온의 아들)', jephthah_839: '입다',
  samson_2468: '삼손', hannah_1400: '한나',
  queen_of_sheba_2379: '스바 여왕', rehoboam_2412: '르호보암',
  naaman_2122: '나아만', jehu_817: '예후',
  mary_1938: '마리아 (예수님의 어머니)', philip_2347: '전도자 빌립',
  gehazi_1293: '게하시', jethro_2431: '이드로',
};

const MESSAGES = {
  ko: { eyebrow: '66권 인물·본문 색인', title: '인물의 여정을 지도에서 살펴보세요', intro: 'UBS의 공개 경로 도형과 본문의 지명에 연결한 여정을 구분해 보여줍니다. 근거가 없는 이동선은 만들지 않습니다.', search: '주요 인물 한글 이름 또는 원자료 영문명 검색', result: '검색 결과', mentions: '언급 구절', places: '지명 동시 언급', all: '인물 언급 전체', mapped: '지명과 함께 나온 절', more: '구절 더 보기', morePeople: '인물 더 보기', read: '한국어 성경 읽기', map: '본문 지도', routes: '본문 연결 여정', noRoutes: '이 인물에게 공개한 본문 연결 여정은 아직 없습니다.', caveat: '같은 절에 인물과 지명이 등장한다는 뜻입니다. 그 인물이 그곳에 갔거나 그 장소에서 사건이 일어났다는 뜻은 아닙니다.', english: '원자료의 영문 인명', noResults: '일치하는 인물 기록이 없습니다.', loading: '성경 전체 인명 색인을 불러오는 중입니다.', failed: '인명 색인을 불러오지 못했습니다.', attribution: '인명·구절 자료: Theographic · CC BY-SA 4.0', count: '3,067개 인명 기록', coverage: '66권 · 31,102절 색인', related: 'UBS 경로 도형 100개 · 37개 인명 기록에 연결', show: '인물 살펴보기' },
  en: { eyebrow: 'People and verses across 66 books', title: 'Explore the people of the Bible', intro: 'Find verses naming a person, then open a passage-linked journey when available.', search: 'Search a person · e.g. David, Ruth, Peter', result: 'Results', mentions: 'Mentioned verses', places: 'Verses also naming places', all: 'All person references', mapped: 'Verses with place mentions', more: 'Show more verses', read: 'Read in Korean', map: 'Passage map', routes: 'Passage-linked journeys', noRoutes: 'No passage-linked journey has been published for this person yet.', caveat: 'A person and a place appear in the same verse. This does not establish that the person visited the place or that an event occurred there.', english: 'Source name in English', noResults: 'No matching person record.', loading: 'Loading the full-canon people index.', failed: 'Could not load the people index.', attribution: 'People and verse data: Theographic · CC BY-SA 4.0', count: '3,067 person records', coverage: '66 books · 31,102 verses checked', related: '1,005 records have a same-verse place mention', show: 'Explore person' },
  ja: { eyebrow: '聖書66巻の人物索引', title: '聖書の人物を探す', intro: '人物の登場箇所を探し、検証済みの旅があれば開けます。', search: '人物名を検索', result: '検索結果', mentions: '登場する節', places: '地名もある節', all: '全登場箇所', mapped: '地名もある節', more: 'さらに表示', read: '韓国語聖書を読む', map: '本文の地図', routes: '検証済みの旅', noRoutes: 'この人物の移動経路は未検証です。', caveat: '同じ節に人物と地名が現れるだけで、訪問や現地での出来事を意味しません。', english: '原資料の英語名', noResults: '該当する人物はありません。', loading: '人物索引を読み込み中です。', failed: '人物索引を読み込めません。', attribution: '人物・節資料: Theographic · CC BY-SA 4.0', count: '人物記録3,067件', coverage: '66巻・31,102節を照合', related: '1,005件に同じ節の地名', show: '人物を見る' },
  'zh-CN': { eyebrow: '66卷人物经文索引', title: '探索圣经人物', intro: '先查看提及人物的经节，再阅读已核查的旅程。', search: '搜索人物名称', result: '搜索结果', mentions: '提及经节', places: '同节含地名', all: '全部人物经节', mapped: '同节含地名的经节', more: '查看更多', read: '阅读韩语圣经', map: '经文地图', routes: '已核查旅程', noRoutes: '此人物的移动路线尚未核查。', caveat: '人物和地名出现在同一节，不代表此人到访该地。', english: '原资料英文名', noResults: '没有匹配的人物记录。', loading: '正在加载人物索引。', failed: '无法加载人物索引。', attribution: '人物与经节资料：Theographic · CC BY-SA 4.0', count: '3,067个人物记录', coverage: '核对66卷31,102节', related: '1,005个记录有同节地名', show: '查看人物' },
  es: { eyebrow: 'Índice de personas en 66 libros', title: 'Explora las personas de la Biblia', intro: 'Encuentra sus versículos y abre viajes revisados cuando existan.', search: 'Buscar una persona', result: 'Resultados', mentions: 'Versículos con mención', places: 'Versículos con lugares', all: 'Todas las referencias', mapped: 'Versículos con topónimos', more: 'Ver más', read: 'Leer en coreano', map: 'Mapa del pasaje', routes: 'Viajes revisados', noRoutes: 'Aún no se ha revisado una ruta para esta persona.', caveat: 'La coincidencia en un versículo no demuestra que la persona visitara ese lugar.', english: 'Nombre original en inglés', noResults: 'No hay registros coincidentes.', loading: 'Cargando el índice de personas.', failed: 'No se pudo cargar el índice.', attribution: 'Personas y versículos: Theographic · CC BY-SA 4.0', count: '3.067 registros de personas', coverage: '66 libros y 31.102 versículos', related: '1.005 registros con topónimos en el mismo versículo', show: 'Ver persona' },
  th: { eyebrow: 'ดัชนีบุคคลจากพระคัมภีร์ 66 เล่ม', title: 'สำรวจบุคคลในพระคัมภีร์', intro: 'ค้นหาข้อที่กล่าวถึงบุคคล แล้วเปิดเส้นทางที่ตรวจสอบแล้ว', search: 'ค้นหาชื่อบุคคล', result: 'ผลการค้นหา', mentions: 'ข้อที่กล่าวถึง', places: 'ข้อที่มีชื่อสถานที่', all: 'ข้อทั้งหมด', mapped: 'ข้อที่มีชื่อสถานที่', more: 'ดูเพิ่มเติม', read: 'อ่านพระคัมภีร์ภาษาเกาหลี', map: 'แผนที่ข้อพระคัมภีร์', routes: 'เส้นทางที่ตรวจสอบแล้ว', noRoutes: 'ยังไม่ได้ตรวจสอบเส้นทางของบุคคลนี้', caveat: 'บุคคลและสถานที่ปรากฏในข้อเดียวกัน ไม่ได้ยืนยันว่าเขาเดินทางไปที่นั่น', english: 'ชื่อภาษาอังกฤษจากต้นฉบับ', noResults: 'ไม่พบบุคคลที่ตรงกัน', loading: 'กำลังโหลดดัชนีบุคคล', failed: 'โหลดดัชนีบุคคลไม่ได้', attribution: 'ข้อมูลบุคคลและข้อ: Theographic · CC BY-SA 4.0', count: 'บันทึกบุคคล 3,067 รายการ', coverage: 'ตรวจสอบ 66 เล่ม 31,102 ข้อ', related: '1,005 รายการมีสถานที่ในข้อเดียวกัน', show: 'ดูบุคคล' },
  hi: { eyebrow: '66 पुस्तकों की व्यक्ति सूची', title: 'बाइबल के लोगों को खोजें', intro: 'व्यक्ति के पद देखें और उपलब्ध सत्यापित यात्रा खोलें।', search: 'व्यक्ति का नाम खोजें', result: 'परिणाम', mentions: 'उल्लेख वाले पद', places: 'स्थान वाले पद', all: 'सभी पद', mapped: 'स्थान सहित पद', more: 'और पद देखें', read: 'कोरियाई में पढ़ें', map: 'पाठ का मानचित्र', routes: 'जाँची गई यात्राएँ', noRoutes: 'इस व्यक्ति की यात्रा अभी जाँची नहीं गई है।', caveat: 'एक ही पद में व्यक्ति और स्थान आने से वहाँ यात्रा सिद्ध नहीं होती।', english: 'स्रोत का अंग्रेज़ी नाम', noResults: 'कोई मेल नहीं मिला।', loading: 'व्यक्ति सूची लोड हो रही है।', failed: 'व्यक्ति सूची लोड नहीं हुई।', attribution: 'व्यक्ति और पद: Theographic · CC BY-SA 4.0', count: '3,067 व्यक्ति रिकॉर्ड', coverage: '66 पुस्तकें · 31,102 पद', related: '1,005 रिकॉर्ड में उसी पद में स्थान है', show: 'व्यक्ति देखें' },
  fr: { eyebrow: 'Index des personnes des 66 livres', title: 'Explorez les personnes de la Bible', intro: 'Trouvez leurs versets, puis ouvrez un voyage vérifié s’il existe.', search: 'Rechercher une personne', result: 'Résultats', mentions: 'Versets citant la personne', places: 'Versets citant un lieu', all: 'Toutes les références', mapped: 'Versets avec toponyme', more: 'Voir plus', read: 'Lire en coréen', map: 'Carte du passage', routes: 'Voyages vérifiés', noRoutes: 'Aucun itinéraire vérifié pour cette personne.', caveat: 'Une personne et un lieu dans le même verset ne prouvent pas une visite.', english: 'Nom anglais de la source', noResults: 'Aucune personne correspondante.', loading: 'Chargement de l’index des personnes.', failed: 'Impossible de charger l’index.', attribution: 'Personnes et versets : Theographic · CC BY-SA 4.0', count: '3 067 personnes répertoriées', coverage: '66 livres · 31 102 versets vérifiés', related: '1 005 notices avec un lieu dans le même verset', show: 'Voir la personne' },
  de: { eyebrow: 'Personenindex aus 66 Büchern', title: 'Menschen der Bibel entdecken', intro: 'Finden Sie Personenverse und öffnen Sie geprüfte Reisen, sofern vorhanden.', search: 'Person suchen', result: 'Ergebnisse', mentions: 'Verse mit Erwähnung', places: 'Verse mit Ortsnamen', all: 'Alle Verse', mapped: 'Verse mit Ortsnamen', more: 'Mehr Verse', read: 'Auf Koreanisch lesen', map: 'Textkarte', routes: 'Geprüfte Reisen', noRoutes: 'Für diese Person wurde noch keine Reiseroute geprüft.', caveat: 'Person und Ort im selben Vers belegen keine Reise an diesen Ort.', english: 'Englischer Quellenname', noResults: 'Keine passende Person.', loading: 'Personenindex wird geladen.', failed: 'Personenindex konnte nicht geladen werden.', attribution: 'Personen und Verse: Theographic · CC BY-SA 4.0', count: '3.067 Personen-Datensätze', coverage: '66 Bücher · 31.102 Verse geprüft', related: '1.005 Datensätze mit Ort im selben Vers', show: 'Person ansehen' },
};

const FILTER_TEXT = {
  ko: ['성경 책으로 찾기', '성경 전체', '인물 범위', '모든 인물 기록', '같은 절에 지명이 있는 인물', 'UBS 경로 지도가 있는 인물'],
  en: ['Filter by book', 'All books', 'Person scope', 'All person records', 'People with same-verse places', 'People with a UBS route map'],
  ja: ['書巻で絞り込む', '聖書全巻', '人物の範囲', '全人物記録', '同じ節に地名がある人物', 'UBS経路図がある人物'],
  'zh-CN': ['按书卷筛选', '全部书卷', '人物范围', '全部人物记录', '同节有地名的人物', '有UBS路线图的人物'],
  es: ['Filtrar por libro', 'Todos los libros', 'Alcance', 'Todas las personas', 'Personas con lugares en el mismo versículo', 'Personas con mapa UBS'],
  th: ['เลือกเล่ม', 'ทุกเล่ม', 'ขอบเขตบุคคล', 'บุคคลทั้งหมด', 'บุคคลที่มีสถานที่ในข้อเดียวกัน', 'บุคคลที่มีแผนที่ UBS'],
  hi: ['पुस्तक से छाँटें', 'सभी पुस्तकें', 'व्यक्ति सीमा', 'सभी व्यक्ति', 'एक ही पद में स्थान वाले व्यक्ति', 'UBS मानचित्र वाले व्यक्ति'],
  fr: ['Filtrer par livre', 'Tous les livres', 'Portée', 'Toutes les personnes', 'Personnes avec un lieu dans le même verset', 'Personnes avec carte UBS'],
  de: ['Nach Buch filtern', 'Alle Bücher', 'Personenkreis', 'Alle Personen', 'Personen mit Ortsnamen im selben Vers', 'Personen mit UBS-Karte'],
};
const ROUTE_CHIP = {
  ko: ['경로 지도 37명', '경로'], en: ['37 with route maps', 'routes'],
  ja: ['経路図のある37人', '経路'], 'zh-CN': ['37人有路线图', '路线'],
  es: ['37 con mapas', 'rutas'], th: ['37 คนมีแผนที่', 'เส้นทาง'],
  hi: ['37 के मार्ग मानचित्र', 'मार्ग'], fr: ['37 avec cartes', 'parcours'],
  de: ['37 mit Routenkarten', 'Routen'],
};

export const CURATED_JOURNEYS_BY_PERSON = {
  jesus_905: ['jesus-early', 'jesus-ministry'], paul_2479: ['paul', 'paul-2', 'paul-3'],
  moses_2108: ['moses'], abraham_58: ['abraham'],
};
const FEATURED = ['jesus_905', 'david_994', 'moses_2108', 'ruth_2450', 'elijah_1131', 'paul_2479'];
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const normalized = (value) => String(value || '').toLocaleLowerCase().normalize('NFKC').trim();

export function matchingPeople(people, query, locale = 'ko') {
  const q = normalized(query);
  if (!q) return people;
  return people.filter((person) => normalized(`${person.name} ${person.title} ${person.id} ${locale === 'ko' ? KOREAN_NAMES[person.id] || '' : ''}`).includes(q));
}

export function filterPeople(people, { query = '', locale = 'ko', bookIndex = -1, mappedOnly = false, routeOnly = false, routePersonIds = new Set() } = {}) {
  return matchingPeople(people, query, locale).filter((person) => {
    if (routeOnly && !routePersonIds.has(person.id)) return false;
    const rows = mappedOnly ? person.mapped : person.refs;
    return bookIndex < 0 ? !mappedOnly || rows.length > 0 : rows.some((row) => row[0] === bookIndex);
  });
}

export function createPersonExplorer(root, { getLocale, getPlaces, getMaplibre, placeName, openJourney, openReference, journeyName }) {
  let index;
  let pending;
  let selectedId = 'jesus_905';
  let query = '';
  let bookFilter = -1;
  let mappedOnly = false;
  let routeOnly = false;
  let mode = 'mapped';
  let personLimit = 24;
  let verseLimit = 20;
  let error = false;

  root.innerHTML = `<div class="person-intro"><div><span id="person-eyebrow"></span><h3 id="person-title"></h3><p id="person-intro"></p></div><div class="person-stats"><strong id="person-count"></strong><span id="person-coverage"></span><small id="person-related"></small></div></div>
    <div class="person-layout"><div class="person-browser"><label class="sr-only" for="person-search"></label><input id="person-search" type="search" autocomplete="off" /><div id="person-featured" class="person-featured"></div><div class="person-filters"><label><span id="person-book-label"></span><select id="person-book"></select></label><label><span id="person-scope-label"></span><select id="person-scope"></select></label></div><div class="person-result-heading"><strong id="person-result-label"></strong><span id="person-result-count"></span></div><div id="person-results" class="person-results"></div><button id="person-more" class="person-more" type="button" hidden></button></div>
    <div id="person-detail" class="person-detail"><div id="person-detail-top"></div><div id="person-route-host"></div><div id="person-detail-bottom"></div></div></div>
    <a id="person-attribution" class="person-attribution" href="https://github.com/robertrouse/theographic-bible-metadata" target="_blank" rel="noopener noreferrer"></a>`;
  const routeViewer = createPersonRouteMap(root.querySelector('#person-route-host'), {
    getLocale, getMaplibre, getPlaces, placeName,
    onDataReady: () => render(),
  });
  const input = root.querySelector('#person-search');
  input.addEventListener('input', () => {
    query = input.value;
    personLimit = 24;
    render();
  });
  root.querySelector('#person-book').addEventListener('change', (event) => { bookFilter = Number(event.target.value); personLimit = 24; render(); });
  root.querySelector('#person-scope').addEventListener('change', (event) => { mappedOnly = event.target.value === 'mapped'; routeOnly = event.target.value === 'routes'; if (mappedOnly) mode = 'mapped'; personLimit = 24; render(); });
  root.querySelector('#person-more').addEventListener('click', () => { personLimit += 24; render(); });
  root.addEventListener('click', (event) => {
    if (event.target.closest('[data-person-routes-filter]')) {
      query = '';
      input.value = '';
      bookFilter = -1;
      mappedOnly = false;
      routeOnly = true;
      personLimit = 24;
      render();
      return;
    }
    const personButton = event.target.closest('[data-person-id]');
    if (personButton) {
      const fromFeatured = Boolean(personButton.closest('#person-featured'));
      if (fromFeatured) { query = ''; input.value = ''; bookFilter = -1; mappedOnly = false; routeOnly = false; }
      selectedId = personButton.dataset.personId;
      mode = index?.people.find((person) => person.id === selectedId)?.mapped.length ? 'mapped' : 'all';
      verseLimit = 20;
      render();
      if (fromFeatured) root.querySelector('#person-results [aria-pressed="true"]')?.scrollIntoView({ behavior: 'instant', block: 'nearest' });
      root.querySelector('#person-detail').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'nearest' });
      return;
    }
    const tab = event.target.closest('[data-person-mode]');
    if (tab) { mode = tab.dataset.personMode; verseLimit = 20; render(); return; }
    if (event.target.closest('[data-person-more-verses]')) { verseLimit += 20; render(); return; }
    const route = event.target.closest('[data-person-journey]');
    if (route) { openJourney(route.dataset.personJourney); return; }
    const map = event.target.closest('[data-person-map]');
    if (map) {
      const [book, chapter, verse] = map.dataset.personMap.split(':').map(Number);
      openReference(index.codes[book], chapter, verse);
    }
  });

  function personName(person) {
    return getLocale() === 'ko' ? KOREAN_NAMES[person.id] || person.title : person.title;
  }

  function reference(row) {
    return `${localizedBookName(index.codes[row[0]], getLocale())} ${row[1]}:${row[2]}`;
  }

  function render() {
    const locale = getLocale();
    const m = MESSAGES[locale] || MESSAGES.en;
    root.querySelector('#person-eyebrow').textContent = m.eyebrow;
    root.querySelector('#person-title').textContent = m.title;
    root.querySelector('#person-intro').textContent = m.intro;
    root.querySelector('#person-count').textContent = m.count;
    root.querySelector('#person-coverage').textContent = m.coverage;
    root.querySelector('#person-related').textContent = m.related;
    root.querySelector('label[for="person-search"]').textContent = m.search;
    input.placeholder = m.search;
    root.querySelector('#person-result-label').textContent = m.result;
    root.querySelector('#person-attribution').textContent = `${m.attribution} ↗`;
    const filterText = FILTER_TEXT[locale] || FILTER_TEXT.en;
    root.querySelector('#person-book-label').textContent = filterText[0];
    root.querySelector('#person-scope-label').textContent = filterText[2];
    if (!index) {
      root.querySelector('#person-results').innerHTML = `<p class="person-status">${escapeHtml(error ? m.failed : m.loading)}</p>`;
      root.querySelector('#person-detail').hidden = true;
      return;
    }
    const featured = FEATURED.map((id) => index.people.find((person) => person.id === id)).filter(Boolean);
    const routeChip = ROUTE_CHIP[locale] || ROUTE_CHIP.en;
    root.querySelector('#person-featured').innerHTML = `${featured.map((person) => `<button type="button" data-person-id="${person.id}">${escapeHtml(personName(person))}</button>`).join('')}<button type="button" class="person-routes-chip" data-person-routes-filter aria-pressed="${routeOnly}">${escapeHtml(routeChip[0])} ↗</button>`;
    const bookSelect = root.querySelector('#person-book');
    bookSelect.innerHTML = `<option value="-1">${escapeHtml(filterText[1])}</option>${index.codes.map((code, bookIndex) => `<option value="${bookIndex}">${escapeHtml(localizedBookName(code, locale))}</option>`).join('')}`;
    bookSelect.value = String(bookFilter);
    const scopeSelect = root.querySelector('#person-scope');
    scopeSelect.innerHTML = `<option value="all">${escapeHtml(filterText[3])}</option><option value="mapped">${escapeHtml(filterText[4])}</option><option value="routes">${escapeHtml(filterText[5])}</option>`;
    scopeSelect.value = routeOnly ? 'routes' : mappedOnly ? 'mapped' : 'all';
    const matches = filterPeople(index.people, { query, locale, bookIndex: bookFilter, mappedOnly, routeOnly, routePersonIds: routeViewer.personIds() });
    if (matches.length && !matches.some((person) => person.id === selectedId)) {
      selectedId = matches[0].id;
      mode = matches[0].mapped.length ? 'mapped' : 'all';
      verseLimit = 20;
    }
    root.querySelector('#person-result-count').textContent = `${matches.length.toLocaleString(locale)}`;
    root.querySelector('#person-results').innerHTML = matches.length ? matches.slice(0, personLimit).map((person) => {
      const relevantRows = mappedOnly ? person.mapped : person.refs;
      const count = routeOnly ? routeViewer.countFor(person.id) : bookFilter < 0 ? relevantRows.length : relevantRows.filter((row) => row[0] === bookFilter).length;
      return `<button type="button" data-person-id="${escapeHtml(person.id)}" aria-pressed="${person.id === selectedId}"><span><strong>${escapeHtml(personName(person))}</strong><small>${escapeHtml(person.title)}</small></span><em>${count.toLocaleString(locale)} ${escapeHtml(routeOnly ? routeChip[1] : mappedOnly ? m.places : m.mentions)}</em></button>`;
    }).join('') : `<p class="person-status">${escapeHtml(m.noResults)}</p>`;
    const morePeople = root.querySelector('#person-more');
    morePeople.hidden = matches.length <= personLimit;
    morePeople.textContent = `${m.morePeople || m.more} · ${(matches.length - personLimit).toLocaleString(locale)}`;
    if (!matches.length) { root.querySelector('#person-detail').hidden = true; return; }
    root.querySelector('#person-detail').hidden = false;
    const person = matches.find((item) => item.id === selectedId) || matches[0];
    const scopedRefs = bookFilter < 0 ? person.refs : person.refs.filter((row) => row[0] === bookFilter);
    const scopedMapped = bookFilter < 0 ? person.mapped : person.mapped.filter((row) => row[0] === bookFilter);
    if (mode === 'mapped' && !scopedMapped.length) mode = 'all';
    const rows = mode === 'mapped' ? scopedMapped : scopedRefs;
    const detail = root.querySelector('#person-detail');
    const routes = CURATED_JOURNEYS_BY_PERSON[person.id] || [];
    detail.querySelector('#person-detail-top').innerHTML = `<div class="person-detail-head"><div><span class="person-detail-kicker">${escapeHtml(m.show)}${bookFilter < 0 ? '' : ` · ${escapeHtml(localizedBookName(index.codes[bookFilter], locale))}`}</span><h4>${escapeHtml(personName(person))}</h4><p>${escapeHtml(m.english)} · ${escapeHtml(person.title)}</p></div><div class="person-detail-number">${scopedRefs.length.toLocaleString(locale)}<small>${escapeHtml(m.mentions)}</small></div></div>
      <div class="person-detail-metrics"><span>${escapeHtml(m.places)} <b>${scopedMapped.length.toLocaleString(locale)}</b></span>${routes.length ? `<span>${escapeHtml(m.routes)} <b>${routes.length}</b></span>` : ''}</div>
      ${routes.length ? `<div class="person-curated">${routes.map((id) => `<button type="button" data-person-journey="${id}">${escapeHtml(journeyName(id))} ↗</button>`).join('')}</div>` : ''}
      <p class="person-caveat">${escapeHtml(m.caveat)}</p>`;
    routeViewer.setPerson(person.id);
    detail.querySelector('#person-detail-bottom').innerHTML = `<div class="person-ref-tabs"><button type="button" data-person-mode="mapped" aria-pressed="${mode === 'mapped'}">${escapeHtml(m.mapped)} <b>${scopedMapped.length.toLocaleString(locale)}</b></button><button type="button" data-person-mode="all" aria-pressed="${mode === 'all'}">${escapeHtml(m.all)} <b>${scopedRefs.length.toLocaleString(locale)}</b></button></div>
      <div class="person-reference-list">${rows.slice(0, verseLimit).map((row) => {
        const places = row[3]?.map((placeIndex) => getPlaces()?.[placeIndex]).filter(Boolean).map(placeName) || [];
        const code = index.codes[row[0]];
        const mapKey = `${row[0]}:${row[1]}:${row[2]}`;
        return `<div class="person-reference"><div><strong>${escapeHtml(reference(row))}</strong>${places.length ? `<small>${escapeHtml(places.slice(0, 3).join(' · '))}${places.length > 3 ? ` +${places.length - 3}` : ''}</small>` : ''}</div><div><a href="${bibleReadingUrl(code, row[1], row[2])}" target="_blank" rel="noopener noreferrer">${escapeHtml(m.read)} ↗</a>${places.length ? `<button type="button" data-person-map="${mapKey}">${escapeHtml(m.map)} ↗</button>` : ''}</div></div>`;
      }).join('')}</div>${rows.length > verseLimit ? `<button class="person-more-verses" type="button" data-person-more-verses>${escapeHtml(m.more)} · ${(rows.length - verseLimit).toLocaleString(locale)}</button>` : ''}`;
  }

  async function load() {
    if (index || pending || error) return pending;
    pending = fetch('/public/data/people-index.json').then(async (response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      index = await response.json();
      if (index.audit.books !== 66 || index.audit.verses !== 31102 || index.people.length !== index.audit.people) throw new Error('Incomplete people index');
      index.people.sort((a, b) => {
        const aFeatured = FEATURED.indexOf(a.id);
        const bFeatured = FEATURED.indexOf(b.id);
        if (aFeatured !== -1 || bFeatured !== -1) {
          if (aFeatured === -1) return 1;
          if (bFeatured === -1) return -1;
          return aFeatured - bFeatured;
        }
        return b.refs.length - a.refs.length || a.title.localeCompare(b.title);
      });
      render();
      routeViewer.load();
    }).catch(() => { error = true; render(); });
    return pending;
  }

  async function focusPerson(id) {
    selectedId = id;
    query = '';
    input.value = '';
    bookFilter = -1;
    mappedOnly = false;
    routeOnly = false;
    personLimit = 24;
    await load();
    if (!index?.people.some((person) => person.id === id)) return false;
    mode = index.people.find((person) => person.id === id).mapped.length ? 'mapped' : 'all';
    render();
    root.querySelector('#person-detail')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return true;
  }

  render();
  return { load, render, focusPerson, onShow: routeViewer.onShow };
}
