import { BOOKS, bibleReadingUrl, collectPlaceOccurrences, findPlaces, parseReference } from './reference.js';
import { NOTE_PREFIX, createBackup, listNotes, mergeNotes, noteMarkdown, parseBackup } from './notes.js';

const DATA_URL = '/public/data/openbible-places.json';
const EXAMPLES = ['행 16:6-15', '창 12:1-9', '눅 10:25-37', '마 2:1-12'];
const HERO_TOUR_DELAY = 4600;
const KOREAN_PLACES = {
  'Jerusalem': '예루살렘', 'Jericho': '여리고', 'Bethlehem 1': '베들레헴',
  'Jericho 2': '여리고', 'Ai 1': '아이', 'Bethel 1': '벧엘',
  'Moreh 1': '모레', 'Negeb': '네겝',
  'Nazareth': '나사렛', 'Capernaum': '가버나움', 'Galilee': '갈릴리',
  'Judea 1': '유대', 'Samaria 1': '사마리아', 'Jordan': '요단강',
  'Egypt': '애굽', 'Babylon 1': '바벨론', 'Damascus': '다메섹',
  'Antioch 1': '수리아 안디옥', 'Antioch 2': '비시디아 안디옥',
  'Troas': '드로아', 'Philippi': '빌립보', 'Macedonia': '마게도냐',
  'Mysia': '무시아', 'Bithynia': '비두니아', 'Neapolis': '네압볼리',
  'Thessalonica': '데살로니가', 'Berea': '베뢰아', 'Athens': '아덴',
  'Corinth': '고린도', 'Ephesus': '에베소', 'Rome': '로마',
  'Cyprus': '구브로', 'Paphos': '바보', 'Salamis': '살라미',
  'Asia': '아시아', 'Galatia': '갈라디아', 'Greece': '헬라',
  'Phrygia': '브루기아', 'Samothrace': '사모드라게', 'Thyatira': '두아디라',
  'Haran': '하란', 'Ur': '우르', 'Canaan': '가나안', 'Shechem': '세겜',
  'Bethel': '벧엘', 'Ai': '아이', 'Hebron': '헤브론', 'Beersheba': '브엘세바',
  'Gaza': '가사', 'Tyre': '두로', 'Sidon': '시돈', 'Bethany 1': '베다니',
  'Bethsaida 1': '벳새다', 'Sea of Galilee': '갈릴리 바다', 'Dead Sea': '사해',
  'Shunem': '수넴', 'Baal-shalishah': '바알 살리사', 'Gilgal 2': '길갈',
  'Mount Carmel': '갈멜산', 'Mount Zion': '시온산', 'Mount Esau': '에서 산',
};

const TYPE_LABELS = {
  settlement: '도시·마을', region: '지역', river: '강', mountain: '산',
  'body of water': '수역', 'natural area': '자연 지역', road: '도로',
  'mountain range': '산지', island: '섬', valley: '골짜기',
};

const app = document.querySelector('#app');
app.innerHTML = `
  <header class="site-header">
    <div class="shell header-inner">
      <a class="brand" href="/" aria-label="목회 AI 연구소 본문의 장소 처음으로">
        <span class="brand-mark"><img src="/public/assets/ministry-ai-lab-original.png" alt="목회 AI 연구소 AI와 십자가 로고" /></span>
        <span class="brand-text"><strong>목회 AI 연구소</strong><small>MINISTRY AI LAB</small></span>
      </a>
      <span class="header-edition">성경 배경 연구 도구 <span>01</span></span>
    </div>
  </header>

  <main>
    <section class="hero shell" aria-labelledby="page-title">
      <div class="hero-copy">
        <div class="eyebrow"><span class="eyebrow-line"></span> SERMON CONTEXT STUDIO</div>
        <h1 id="page-title">본문이 지나간 장소를<br /><em>한눈에 살펴보세요.</em></h1>
        <p class="hero-lead">설교 본문 주소를 입력하면 연결된 지명을 찾아 지도와 근거를 함께 보여줍니다. 준비의 첫 장면을 더 분명하게 시작하세요.</p>
        <form id="reference-form" class="search-form" novalidate>
          <label for="reference-input">성경 본문</label>
          <div class="search-row">
            <input id="reference-input" name="reference" type="text" value="행 16:6-15" placeholder="예: 행 16:6-15" autocomplete="off" spellcheck="false" />
            <button type="submit"><span>장소 찾기</span><span aria-hidden="true">↗</span></button>
          </div>
          <p id="search-error" class="search-error" role="alert" hidden></p>
        </form>
        <div class="example-row"><span>바로 살펴보기</span><div id="examples" class="example-buttons"></div></div>
      </div>
      <aside class="hero-visual" aria-labelledby="visual-title">
        <div id="hero-map" class="visual-map" aria-hidden="true"></div>
        <div class="visual-map-wash" aria-hidden="true"></div>
        <div class="visual-topline">
          <span class="visual-live"><i aria-hidden="true"></i> PASSAGE MAP</span>
          <span id="visual-place-count" class="visual-count">지명 확인 중</span>
        </div>
        <div class="visual-intro"><span>지금 살펴보는 본문</span><strong id="visual-title">행 16:6–15</strong><p>본문에 연결된 지명이 지도 위에 펼쳐집니다.</p></div>
        <p id="hero-map-fallback" class="visual-map-fallback">본문 지도를 불러오고 있습니다.</p>
        <div class="visual-bottom">
          <div id="hero-focus" class="visual-focus">
            <div class="visual-focus-copy"><span id="hero-focus-kicker">본문 속 장소</span><strong id="hero-focus-name">지명 확인 중</strong><small id="hero-focus-detail">지도를 준비하고 있습니다.</small></div>
            <div class="visual-focus-navigation">
              <button id="hero-prev" type="button" aria-label="이전 장소" hidden>←</button>
              <span id="hero-position">—</span>
              <button id="hero-next" type="button" aria-label="다음 장소" hidden>→</button>
            </div>
            <span class="visual-progress" aria-hidden="true"><span id="hero-progress-fill"></span></span>
          </div>
          <div class="visual-footer"><span>© OpenStreetMap · OpenFreeMap</span><div><button id="hero-motion-toggle" type="button" aria-pressed="false" hidden>일시정지</button><button id="visual-results-button" type="button">전체 결과 보기 ↗</button></div></div>
        </div>
      </aside>
    </section>

    <section id="results" class="results-section" aria-labelledby="results-title">
      <div class="shell">
        <div class="section-topline"></div>
        <div class="results-heading">
          <div><div class="section-kicker">본문 연구 · 지명</div><h2 id="results-title">본문 속 장소</h2><p id="results-description">공개 성경 지리 데이터에서 지명을 불러오는 중입니다.</p></div>
          <div class="heading-actions"><span id="result-count" class="result-count">—</span><button id="print-button" class="text-button" type="button" disabled>인쇄하기 <span aria-hidden="true">↗</span></button></div>
        </div>

        <div class="workspace">
          <div class="map-pane">
            <div class="pane-head"><div><span class="pane-index">01</span><strong>지도로 보기</strong></div><span id="map-caption">성경 세계</span></div>
            <div class="map-frame"><div id="map" class="map" role="img" aria-label="본문과 연결된 지명 지도"></div><div id="map-empty" class="map-empty" hidden><span aria-hidden="true">○</span><strong>이 본문에 연결된 지도 지점이 없습니다.</strong><p>지명이 없는 절에는 임의의 장소를 표시하지 않습니다.</p></div></div>
            <p class="map-footnote">핀은 선택된 대표 좌표입니다. 지역·강 또는 위치 논쟁이 있는 곳은 실제 범위와 다를 수 있습니다.</p>
          </div>
          <div class="places-pane">
            <div class="pane-head"><div><span class="pane-index">02</span><strong>지명과 근거</strong></div><span id="places-caption">검색 결과</span></div>
            <div id="place-list" class="place-list" aria-live="polite"><div class="empty-state">자료를 불러오는 중입니다.</div></div>
          </div>
        </div>

        <div class="lower-grid">
          <div class="note-panel">
            <div class="note-title"><span class="pane-index">03</span><h3>설교 준비 메모</h3></div>
            <p>본문을 읽으며 떠오른 관찰과 확인할 질문을 적어 두세요.</p>
            <label class="sr-only" for="sermon-note">설교 준비 메모</label><textarea id="sermon-note" placeholder="이 장소가 본문 이해에 어떤 도움을 주는지 기록하세요."></textarea>
            <span id="note-status" class="note-save" role="status">입력하면 이 브라우저에 자동 저장됩니다.</span>
            <div class="note-actions"><button id="download-note" type="button" disabled>이 메모 파일로 저장 ↗</button><button id="backup-notes" type="button" disabled>전체 메모 백업 ↗</button><button id="import-trigger" type="button">백업 불러오기 ↗</button><input id="import-notes" type="file" accept=".json,application/json" hidden /></div>
            <div class="saved-notes"><strong>이 브라우저에 저장된 본문</strong><div id="saved-note-list">저장된 메모가 없습니다.</div></div>
          </div>
          <aside class="source-panel"><div class="source-top">자료 출처와 사용 범위</div><h3>근거를 따라가며 살펴보세요.</h3><p>지명과 좌표는 OpenBible.info의 성경 지리 공개 자료를 사용합니다. 모든 절에 지명이 있는 것은 아니며, 영어 역본 기반 색인이므로 한국어 본문의 표현과 다를 수 있습니다. 장소별 원자료에서 위치 후보와 근거를 확인해 주세요. 현재 지역 사진은 이용 조건이 확인된 Wikimedia Commons 자료만 표시하며, 고대 현장의 모습을 재현한 사진은 아닙니다. 본문 전체 텍스트는 제공하지 않습니다.</p><div class="source-links"><a href="https://www.openbible.info/geo/" target="_blank" rel="noopener noreferrer">OpenBible.info ↗</a><a href="https://www.bskorea.or.kr/bible/korbibReadpage.php?version=GAE" target="_blank" rel="noopener noreferrer">대한성서공회 성경 읽기 ↗</a></div></aside>
        </div>
      </div>
    </section>
  </main>

  <footer class="site-footer"><div class="shell footer-inner"><span>© 목회 AI 연구소</span><span>Geographic data: <a href="https://www.openbible.info/geo/" target="_blank" rel="noopener noreferrer">OpenBible.info</a> · CC BY 4.0</span></div></footer>
`;

const input = document.querySelector('#reference-input');
const form = document.querySelector('#reference-form');
const error = document.querySelector('#search-error');
const resultDescription = document.querySelector('#results-description');
const resultCount = document.querySelector('#result-count');
const placeList = document.querySelector('#place-list');
const placesCaption = document.querySelector('#places-caption');
const mapCaption = document.querySelector('#map-caption');
const mapEmpty = document.querySelector('#map-empty');
const note = document.querySelector('#sermon-note');
const noteStatus = document.querySelector('#note-status');
const savedNoteList = document.querySelector('#saved-note-list');
const downloadNoteButton = document.querySelector('#download-note');
const backupNotesButton = document.querySelector('#backup-notes');
const importNotesInput = document.querySelector('#import-notes');
const importTrigger = document.querySelector('#import-trigger');
const printButton = document.querySelector('#print-button');
let data;
let placeOccurrences = new Map();
let currentReference;
let currentPlaces = [];
let selectedPlaceId = null;
let map;
let heroMap;
let maplibre;
let markers = [];
let heroPlaces = [];
let heroActiveIndex = 0;
let heroActiveMarker;
let heroMapReady = false;
let heroTourTimer;
let heroIsVisible = true;
let heroMotionPaused = false;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const heroVisual = document.querySelector('.hero-visual');
const heroFallback = document.querySelector('#hero-map-fallback');
const heroFocus = document.querySelector('#hero-focus');
const heroMotionToggle = document.querySelector('#hero-motion-toggle');

document.querySelector('#examples').innerHTML = EXAMPLES.map((example) => `<button type="button" data-example="${example}">${example}</button>`).join('');
document.querySelector('#examples').addEventListener('click', (event) => {
  const button = event.target.closest('button[data-example]');
  if (!button) return;
  input.value = button.dataset.example;
  form.requestSubmit();
});
document.querySelector('#visual-results-button').addEventListener('click', () => {
  document.querySelector('#results').scrollIntoView({
    behavior: reducedMotion.matches ? 'auto' : 'smooth',
  });
});

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

function displayName(place) {
  return KOREAN_PLACES[place.name] || place.name;
}

const bookByCode = new Map(BOOKS.map((book) => [book.code, book]));

function readingLink(code, chapter, verse, label) {
  const book = bookByCode.get(code);
  return `<a href="${bibleReadingUrl(code, chapter, verse)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(`${book.name} ${chapter}장 ${verse}절 개역개정으로 읽기`)}">${escapeHtml(label)} <span aria-hidden="true">↗</span></a>`;
}

function occurrenceMarkup(placeId) {
  const references = placeOccurrences.get(placeId) || [];
  const groups = new Map();
  for (const reference of references) {
    if (!groups.has(reference.code)) groups.set(reference.code, []);
    groups.get(reference.code).push(reference);
  }
  return `<p class="occurrence-note">OpenBible.info의 영어 역본 5종 이상에서 확인된 지명 연결 구절입니다. 절을 누르면 대한성서공회 개역개정 본문을 새 탭에서 읽을 수 있습니다. 한글 본문의 지명 표기나 절 번호가 다를 수 있습니다.</p>
    <div class="occurrence-books">${[...groups].map(([code, verses]) => {
      const book = bookByCode.get(code);
      return `<section class="occurrence-book"><h4>${escapeHtml(book.name)} <span>${verses.length}절</span></h4><div class="occurrence-verses">${verses.map(({ chapter, verse }) => readingLink(code, chapter, verse, `${chapter}:${verse}`)).join('')}</div></section>`;
    }).join('')}</div>`;
}

function placeStatus(place) {
  if (!place.coordinate) return '위치 미확정';
  if (place.candidateCount > 1) return `위치 후보 ${place.candidateCount}곳`;
  if (['region', 'river', 'body of water', 'natural area', 'mountain range'].includes(place.type)) return '대표 좌표';
  return '위치 자료 있음';
}

function clearMarkers() {
  for (const marker of markers) marker.remove();
  markers = [];
}

function syncHeroTour() {
  clearInterval(heroTourTimer);
  heroTourTimer = undefined;
  const canTour = heroPlaces.length > 1 && !reducedMotion.matches;
  const playing = canTour && !heroMotionPaused && heroIsVisible && !document.hidden;
  heroMotionToggle.hidden = !canTour;
  heroMotionToggle.textContent = heroMotionPaused ? '재생' : '일시정지';
  heroMotionToggle.setAttribute('aria-pressed', String(heroMotionPaused));
  heroFocus.classList.toggle('is-playing', playing);
  if (playing) {
    const progress = document.querySelector('#hero-progress-fill');
    progress.style.animation = 'none';
    void progress.offsetWidth;
    progress.style.animation = '';
    heroTourTimer = setInterval(() => setHeroFocus(heroActiveIndex + 1), HERO_TOUR_DELAY);
  }
}

function setHeroFocus(index) {
  if (!heroPlaces.length) return;
  heroActiveIndex = (index + heroPlaces.length) % heroPlaces.length;
  const place = heroPlaces[heroActiveIndex];
  const verse = place.references[0];
  document.querySelector('#hero-focus-kicker').textContent = `본문 속 장소 · ${String(heroActiveIndex + 1).padStart(2, '0')}`;
  document.querySelector('#hero-focus-name').textContent = displayName(place);
  document.querySelector('#hero-focus-detail').textContent = verse
    ? `${currentReference.short} ${verse.chapter}:${verse.verse} · ${placeStatus(place)}`
    : placeStatus(place);
  document.querySelector('#hero-position').textContent = `${heroActiveIndex + 1} / ${heroPlaces.length}`;
  heroFocus.classList.remove('focus-changing');
  void heroFocus.offsetWidth;
  heroFocus.classList.add('focus-changing');
  if (heroMapReady) {
    if (!heroActiveMarker) {
      const element = document.createElement('span');
      element.className = 'hero-active-pin';
      element.innerHTML = '<span></span>';
      heroActiveMarker = new maplibre.Marker({ element, anchor: 'center' }).setLngLat(place.coordinate).addTo(heroMap);
    } else {
      heroActiveMarker.setLngLat(place.coordinate);
    }
  }
  if (heroTourTimer) {
    const progress = document.querySelector('#hero-progress-fill');
    progress.style.animation = 'none';
    void progress.offsetWidth;
    progress.style.animation = '';
  }
}

function renderHeroMap() {
  if (!heroMapReady) return;
  heroMap.getSource('passage-places').setData({
    type: 'FeatureCollection',
    features: heroPlaces.map((place) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: place.coordinate },
      properties: { id: place.id },
    })),
  });
  heroActiveMarker?.remove();
  heroActiveMarker = undefined;
  if (!heroPlaces.length) {
    heroMap.easeTo({ center: [34, 32], zoom: 3.4, duration: reducedMotion.matches ? 0 : 700 });
    return;
  }
  if (heroPlaces.length === 1) {
    heroMap.easeTo({ center: heroPlaces[0].coordinate, zoom: 6, duration: reducedMotion.matches ? 0 : 950 });
  } else {
    const bounds = new maplibre.LngLatBounds();
    heroPlaces.forEach((place) => bounds.extend(place.coordinate));
    heroMap.fitBounds(bounds, {
      padding: { top: 98, right: 46, bottom: 145, left: 46 },
      maxZoom: 6.7,
      duration: reducedMotion.matches ? 0 : 950,
    });
  }
  setHeroFocus(heroActiveIndex);
}

function renderHeroPreview(places, reference) {
  const firstMention = (place) => Math.min(...place.references.map(({ chapter, verse }) => chapter * 1000 + verse));
  heroPlaces = places.filter((place) => place.coordinate).sort((a, b) =>
    firstMention(a) - firstMention(b) || displayName(a).localeCompare(displayName(b), 'ko'));
  heroActiveIndex = 0;
  document.querySelector('#visual-title').textContent = reference.label;
  document.querySelector('#visual-place-count').textContent = heroPlaces.length
    ? `지도에 ${heroPlaces.length}곳` : '지도 지점 없음';
  const hasSeveral = heroPlaces.length > 1;
  document.querySelector('#hero-prev').hidden = !hasSeveral;
  document.querySelector('#hero-next').hidden = !hasSeveral;
  heroFocus.classList.toggle('is-empty', !heroPlaces.length);
  if (!heroPlaces.length) {
    document.querySelector('#hero-focus-kicker').textContent = '검색한 본문';
    document.querySelector('#hero-focus-name').textContent = '연결된 지명이 없습니다';
    document.querySelector('#hero-focus-detail').textContent = '본문에 지명이 없거나 공개 자료에 연결되지 않았을 수 있습니다.';
    document.querySelector('#hero-position').textContent = '—';
  } else {
    setHeroFocus(0);
  }
  renderHeroMap();
  syncHeroTour();
}

document.querySelector('#hero-prev').addEventListener('click', () => {
  setHeroFocus(heroActiveIndex - 1);
  syncHeroTour();
});
document.querySelector('#hero-next').addEventListener('click', () => {
  setHeroFocus(heroActiveIndex + 1);
  syncHeroTour();
});
heroMotionToggle.addEventListener('click', () => {
  heroMotionPaused = !heroMotionPaused;
  syncHeroTour();
});
reducedMotion.addEventListener('change', syncHeroTour);
document.addEventListener('visibilitychange', syncHeroTour);
new IntersectionObserver(([entry]) => {
  heroIsVisible = entry.isIntersecting;
  syncHeroTour();
}, { threshold: 0.1 }).observe(heroVisual);

function updateMap(places) {
  if (!map) return;
  clearMarkers();
  const mapped = places.filter((place) => place.coordinate);
  if (!mapped.length) {
    map.flyTo({ center: [34, 32], zoom: 3.4, essential: true });
    return;
  }
  const bounds = new maplibre.LngLatBounds();
  for (const [index, place] of mapped.entries()) {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'map-marker';
    el.textContent = String(index + 1);
    el.setAttribute('aria-label', `${displayName(place)} 지도 핀`);
    el.addEventListener('click', () => selectPlace(place.id));
    const marker = new maplibre.Marker({ element: el, anchor: 'bottom' }).setLngLat(place.coordinate).addTo(map);
    markers.push(marker);
    bounds.extend(place.coordinate);
  }
  if (mapped.length === 1) map.flyTo({ center: mapped[0].coordinate, zoom: 6.3, essential: true });
  else map.fitBounds(bounds, { padding: 68, maxZoom: 6.3, duration: 850 });
}

function selectPlace(id) {
  selectedPlaceId = id;
  for (const card of placeList.querySelectorAll('.place-card')) {
    const selected = card.dataset.placeId === id;
    card.classList.toggle('selected', selected);
    card.querySelector('.place-focus').setAttribute('aria-pressed', String(selected));
  }
  const place = currentPlaces.find((item) => item.id === id);
  if (place?.coordinate) map?.flyTo({ center: place.coordinate, zoom: Math.max(map.getZoom(), 6.3), essential: true });
}

function renderPlaces(places, reference) {
  currentPlaces = places;
  selectedPlaceId = null;
  const mappedCount = places.filter((place) => place.coordinate).length;
  const sameChapter = reference.chapter === reference.endChapter;
  const chapterReference = !places.length && sameChapter && reference.startVerse !== null
    ? parseReference(`${reference.short} ${reference.chapter}`) : null;
  const chapterPlaceCount = chapterReference ? findPlaces(data, chapterReference).length : 0;
  resultCount.textContent = `${places.length}곳`;
  resultDescription.textContent = places.length
    ? `${reference.label}에 연결된 지명 ${places.length}곳을 찾았습니다. 지도에는 위치 자료가 있는 ${mappedCount}곳을 표시합니다.`
    : `${reference.label}에 직접 연결된 지명이 없습니다. 본문에 지명이 없거나 원자료에 아직 연결되지 않았을 수 있습니다.`;
  placesCaption.textContent = `${places.length}곳 발견`;
  mapCaption.textContent = mappedCount ? `${mappedCount}곳 표시` : '표시할 지점 없음';
  mapEmpty.hidden = mappedCount > 0;
  printButton.disabled = !places.length;
  placeList.innerHTML = places.length ? places.map((place, index) => {
    const name = displayName(place);
    const english = name === place.name ? 'OpenBible.info 표기' : place.name;
    const refs = place.references.map(({ chapter, verse }) => readingLink(reference.code, chapter, verse, `${reference.short} ${chapter}:${verse}`)).join('');
    const allReferenceCount = placeOccurrences.get(place.id)?.length || 0;
    const photo = place.photo;
    const photoMarkup = photo ? `<div class="place-photo">
      <img src="${escapeHtml(photo.url)}" alt="${escapeHtml(photo.alt)}" loading="lazy" decoding="async" referrerpolicy="no-referrer" />
      <div class="place-photo-copy"><span>현재 지역 사진${place.candidateCount > 1 ? ' · 대표 위치 후보' : ''}</span><p>${escapeHtml(photo.alt)}</p><small>사진: ${escapeHtml(photo.credit)}${photo.edited ? ' · 미리보기 가공' : ''}</small><div class="photo-links"><a href="${escapeHtml(photo.sourceUrl)}" target="_blank" rel="noopener noreferrer">사진 원본 ↗</a><a href="${escapeHtml(photo.licenseUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(photo.license)} ↗</a></div></div>
    </div>` : '';
    return `<article class="place-card" data-place-id="${escapeHtml(place.id)}">
      <button class="place-focus" type="button" aria-pressed="false" data-focus="${escapeHtml(place.id)}">
        <span class="place-number">${String(index + 1).padStart(2, '0')}</span>
        <span class="place-main"><strong>${escapeHtml(name)}</strong><small>${escapeHtml(english)}</small></span>
        <span class="place-arrow" aria-hidden="true">↗</span>
      </button>
      <div class="place-meta"><span>${escapeHtml(TYPE_LABELS[place.type] || '지명')}</span><span class="meta-dot"></span><span>${escapeHtml(placeStatus(place))}</span></div>
      <div class="verse-list" aria-label="현재 본문의 등장 절">${refs}</div>
      <details class="place-occurrences" data-occurrence-place="${escapeHtml(place.id)}"><summary><span>성경 전체 색인 구절 <strong>${allReferenceCount}절</strong></span><span class="occurrence-summary-action">모두 보기 <i aria-hidden="true">⌄</i></span></summary><div class="occurrence-content"></div></details>
      ${photoMarkup}
      <a class="source-link" href="${escapeHtml(place.sourceUrl)}" target="_blank" rel="noopener noreferrer">위치 후보와 근거 보기 <span aria-hidden="true">↗</span></a>
    </article>`;
  }).join('') : `<div class="empty-state"><span class="empty-symbol">○</span><strong>이 범위에서 확인된 지명이 없습니다.</strong><p>본문 전체를 읽으며 지명을 직접 확인해 주세요. 연결 자료가 빠졌을 수도 있습니다.</p>${chapterPlaceCount ? `<p>같은 장에는 연결된 지명 ${chapterPlaceCount}곳이 있습니다.</p><button class="chapter-button" type="button" data-chapter="${escapeHtml(chapterReference.label)}">${escapeHtml(chapterReference.label)} 전체 지명 보기 ↗</button>` : ''}</div>`;
  updateMap(places);
  renderHeroPreview(places, reference);
}

placeList.addEventListener('click', (event) => {
  const chapterButton = event.target.closest('button[data-chapter]');
  if (chapterButton) {
    input.value = chapterButton.dataset.chapter;
    form.requestSubmit();
    return;
  }
  const button = event.target.closest('button[data-focus]');
  if (button) selectPlace(button.dataset.focus);
});

placeList.addEventListener('toggle', (event) => {
  const details = event.target;
  if (!(details instanceof HTMLDetailsElement) || !details.open || !details.matches('[data-occurrence-place]')) return;
  if (details.dataset.loaded) return;
  details.querySelector('.occurrence-content').innerHTML = occurrenceMarkup(details.dataset.occurrencePlace);
  details.dataset.loaded = 'true';
}, true);

placeList.addEventListener('error', (event) => {
  if (event.target instanceof HTMLImageElement && event.target.closest('.place-photo')) {
    event.target.closest('.place-photo').classList.add('photo-failed');
  }
}, true);

function showError(message) {
  error.textContent = message;
  error.hidden = false;
  input.setAttribute('aria-invalid', 'true');
}

function clearError() {
  error.textContent = '';
  error.hidden = true;
  input.removeAttribute('aria-invalid');
}

function setNoteStatus(message, failed = false) {
  noteStatus.textContent = message;
  noteStatus.classList.toggle('failed', failed);
}

function renderSavedNotes() {
  try {
    const saved = listNotes(localStorage);
    savedNoteList.innerHTML = saved.length
      ? saved.map(({ reference }) => `<button type="button" data-note-ref="${escapeHtml(reference)}"${currentReference?.label === reference ? ' class="active"' : ''}>${escapeHtml(reference)}</button>`).join('')
      : '<span>저장된 메모가 없습니다.</span>';
    backupNotesButton.disabled = saved.length === 0;
    downloadNoteButton.disabled = !currentReference || !note.value.trim();
  } catch {
    savedNoteList.textContent = '이 브라우저의 저장 공간을 사용할 수 없습니다.';
    backupNotesButton.disabled = true;
    downloadNoteButton.disabled = !currentReference || !note.value.trim();
    setNoteStatus('브라우저 저장이 차단되었습니다. 메모 파일로 저장해 주세요.', true);
  }
}

function downloadText(filename, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function search() {
  clearError();
  const reference = parseReference(input.value);
  if (reference.error) return showError(reference.error);
  if (!data) return showError('자료를 불러오는 중입니다. 잠시 후 다시 시도해 주세요.');
  currentReference = reference;
  renderPlaces(findPlaces(data, reference), reference);
  try {
    note.value = localStorage.getItem(`${NOTE_PREFIX}${reference.label}`) || '';
    setNoteStatus(note.value ? '저장된 메모를 불러왔습니다. 변경 내용은 이 브라우저에 자동 저장됩니다.' : '입력하면 이 브라우저에 자동 저장됩니다. 다른 기기에서는 백업 파일을 불러오세요.');
  } catch {
    note.value = '';
    setNoteStatus('브라우저 저장이 차단되었습니다. 메모 파일로 저장해 주세요.', true);
  }
  renderSavedNotes();
  history.replaceState(null, '', `#${encodeURIComponent(input.value.trim())}`);
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  search();
});
note.addEventListener('input', () => {
  if (!currentReference) return;
  try {
    const key = `${NOTE_PREFIX}${currentReference.label}`;
    if (note.value.trim()) localStorage.setItem(key, note.value);
    else localStorage.removeItem(key);
    setNoteStatus(note.value.trim() ? '이 브라우저에 저장했습니다.' : '빈 메모를 삭제했습니다.');
  } catch {
    setNoteStatus('브라우저 저장 공간이 부족하거나 차단되었습니다. 메모 파일로 저장해 주세요.', true);
  }
  renderSavedNotes();
});

savedNoteList.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-note-ref]');
  if (!button) return;
  input.value = button.dataset.noteRef;
  form.requestSubmit();
  note.focus();
});

downloadNoteButton.addEventListener('click', () => {
  if (!currentReference || !note.value.trim()) return;
  const part = currentReference.label.replace(/[^\p{L}\p{N}-]+/gu, '-');
  downloadText(`설교메모-${part}.md`, noteMarkdown(currentReference.label, note.value), 'text/markdown;charset=utf-8');
  setNoteStatus('현재 본문 메모를 Markdown 파일로 저장했습니다.');
});

backupNotesButton.addEventListener('click', () => {
  try {
    const backup = createBackup(listNotes(localStorage));
    downloadText(`설교메모-전체백업-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(backup, null, 2), 'application/json;charset=utf-8');
    setNoteStatus(`${Object.keys(backup.notes).length}개 본문 메모를 백업 파일로 저장했습니다.`);
  } catch {
    setNoteStatus('메모 백업에 실패했습니다. 브라우저 저장 상태를 확인해 주세요.', true);
  }
});

importNotesInput.addEventListener('change', async () => {
  const file = importNotesInput.files?.[0];
  if (!file) return;
  try {
    if (file.size > 4_000_000) throw new Error('백업 파일은 4MB 이하만 불러올 수 있습니다.');
    const notes = parseBackup(await file.text());
    const { imported, skipped } = mergeNotes(localStorage, notes);
    if (currentReference && !note.value.trim()) note.value = localStorage.getItem(`${NOTE_PREFIX}${currentReference.label}`) || '';
    renderSavedNotes();
    setNoteStatus(`${imported}개 메모를 불러왔습니다. 기존 메모 ${skipped}개는 덮어쓰지 않았습니다.`);
  } catch (cause) {
    setNoteStatus(cause instanceof Error ? cause.message : '백업 파일을 불러오지 못했습니다.', true);
  } finally {
    importNotesInput.value = '';
  }
});
importTrigger.addEventListener('click', () => importNotesInput.click());
printButton.addEventListener('click', () => window.print());

async function loadMap() {
  try {
    const vendorModule = `/public/vendor/${'maplibre-gl.mjs'}`;
    maplibre = await import(/* @vite-ignore */ vendorModule);
    maplibre.setWorkerUrl('/public/vendor/maplibre-gl-worker.mjs');
    map = new maplibre.Map({
      container: 'map',
      style: 'https://tiles.openfreemap.org/styles/positron',
      center: [34, 32],
      zoom: 3.4,
      attributionControl: true,
      preserveDrawingBuffer: true,
    });
    map.addControl(new maplibre.NavigationControl({ showCompass: false }), 'top-right');
    map.on('error', () => { document.querySelector('.map-footnote').textContent = '지도 배경을 불러오지 못해도 아래 지명 목록과 원자료 링크를 이용할 수 있습니다.'; });
    map.on('load', () => updateMap(currentPlaces));
    setupHeroMap();
  } catch {
    document.querySelector('#map').classList.add('map-unavailable');
    document.querySelector('#map').textContent = '지도 배경을 열지 못했습니다. 지명 카드의 원자료는 사용할 수 있습니다.';
    heroFallback.textContent = '지도 미리보기를 열지 못했습니다. 아래 검색 결과에서 지명을 확인해 주세요.';
  }
}

function setupHeroMap() {
  if (heroMap || !maplibre || !data) return;
  heroMap = new maplibre.Map({
    container: 'hero-map',
    style: 'https://tiles.openfreemap.org/styles/positron',
    center: [34, 32],
    zoom: 3.4,
    interactive: false,
    attributionControl: false,
  });
  heroMap.on('load', () => {
    // The small preview has its own passage labels; basemap labels overlap them.
    for (const layer of heroMap.getStyle().layers) {
      if (layer.type === 'symbol') heroMap.setLayoutProperty(layer.id, 'visibility', 'none');
    }
    heroMap.addSource('passage-places', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    });
    heroMap.addLayer({
      id: 'passage-places-pins',
      type: 'circle',
      source: 'passage-places',
      paint: {
        'circle-radius': 6,
        'circle-color': '#1d3e72',
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 2,
      },
    });
    heroMapReady = true;
    heroVisual.classList.add('hero-map-ready');
    heroFallback.hidden = true;
    renderHeroMap();
  });
  heroMap.on('error', () => {
    if (!heroMapReady) heroFallback.textContent = '지도 미리보기를 열지 못했습니다. 아래 검색 결과에서 지명을 확인해 주세요.';
  });
}

async function loadData() {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    data = await response.json();
    if (!Array.isArray(data.places) || !data.index) throw new Error('자료 형식 오류');
    placeOccurrences = collectPlaceOccurrences(data);
    setupHeroMap();
    if (location.hash.length > 1) {
      try { input.value = decodeURIComponent(location.hash.slice(1)); } catch { /* default example stays */ }
    }
    search();
  } catch {
    resultDescription.textContent = '지명 자료를 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요.';
    placeList.innerHTML = '<div class="empty-state">자료를 불러오지 못했습니다.</div>';
  }
}

loadMap();
loadData();
