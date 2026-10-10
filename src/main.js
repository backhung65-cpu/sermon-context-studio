import { bibleReadingUrl, collectPlaceOccurrences, findPlaces, formatReference, localizedBookName, parseReference } from './reference.js';
import { NOTE_PREFIX, createBackup, listNotes, mergeNotes, parseBackup } from './notes.js';
import { LOCALES, t } from './i18n.js';
import { enrichmentText } from './enrichment-i18n.js';
import { passageContext, passageContextCopy, passageRole } from './passage-context.js';
import { evidenceForReference, evidenceMessage, evidencePriority, firstPassageMention } from './passage-evidence.js';
import { JOURNEYS, JOURNEY_CATEGORIES, journeyMessage } from './journeys.js';
import { createPersonExplorer, CURATED_JOURNEYS_BY_PERSON, KOREAN_NAMES } from './person-explorer.js';

const DATA_URL = '/public/data/openbible-places.json';
const EVIDENCE_URL = '/public/data/passage-evidence.json';
const EXAMPLES = ['왕하 4:1-44', '행 16:6-15', '창 12:1-9', '눅 10:25-37'];
const KOREAN_PLACES = {
  'Jerusalem': '예루살렘', 'Jericho': '여리고', 'Bethlehem 1': '베들레헴', 'Moab 1': '모압',
  'Jericho 2': '여리고', 'Ai 1': '아이', 'Bethel 1': '벧엘',
  'Moreh 1': '모레', 'Negeb': '네겝',
  'Nazareth': '나사렛', 'Capernaum': '가버나움', 'Galilee': '갈릴리', 'Galilee 1': '갈릴리',
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
  'Mount Carmel': '갈멜산', 'Mount Zion': '시온산', 'Zion': '시온', 'Mount Esau': '에서 산',
  'Seleucia': '실루기아', 'Salamis': '살라미', 'Perga': '버가',
  'Iconium': '이고니온', 'Lystra': '루스드라', 'Derbe': '더베', 'Attalia': '앗달리아',
  'Gerasa': '거라사', 'Bethsaida 2': '벳새다', 'Caesarea Philippi': '가이사랴 빌립보',
  'Cilicia': '길리기아', 'Caesarea': '가이사랴', 'Assos': '앗소', 'Miletus': '밀레도',
  'Midian': '미디안', 'Rameses': '라암셋', 'Succoth 2': '숙곳', 'Etham': '에담',
  'Marah': '마라', 'Elim': '엘림', 'Wilderness of Sinai': '시내 광야',
  'Kadesh-barnea': '가데스', 'Mount Hor 1': '호르 산', 'Mount Nebo': '느보 산',
  'Nob': '놉', 'Gibeah 1': '기브아', 'Ziph 1': '십', 'Gath 1': '가드',
  'Keilah': '그일라', 'Adullam': '아둘람', 'Ramah 4': '라마',
  'Naioth': '나욧', 'Mizpeh 3': '미스바', 'Carmel 1': '갈멜',
  'Jezreel 3': '이스르엘', 'Bahurim': '바후림', 'Gallim': '갈림',
  'City of David': '다윗 성', 'Baal-perazim': '바알브라심',
  'Mount Horeb': '호렙산', 'Mount Sinai': '시내산',
};

const TYPE_LABELS = {
  settlement: 'typeSettlement', region: 'typeRegion', river: 'typeRiver', mountain: 'typeMountain',
  'body of water': 'typeWater', 'natural area': 'typeNatural', road: 'typeRoad',
  'mountain range': 'typeRange', island: 'typeIsland', valley: 'typeValley',
};

const requestedLocale = new URLSearchParams(location.search).get('lang');
let locale = Object.hasOwn(LOCALES, requestedLocale) ? requestedLocale : 'ko';
const translate = (key, variables) => enrichmentText(locale, key, variables) ?? t(locale, key, variables);

const app = document.querySelector('#app');
app.innerHTML = `
  <header class="site-header">
    <div class="shell header-inner">
      <a class="brand" href="/" data-i18n-aria-label="brandHome" aria-label="목회 AI 연구소 본문의 장소 처음으로">
        <span class="brand-mark"><img src="/public/assets/ministry-ai-lab-original.png" data-i18n-alt="logoAlt" alt="목회 AI 연구소 AI와 십자가 로고" /></span>
        <span class="brand-text"><strong data-i18n="brand">목회 AI 연구소</strong><small>MINISTRY AI LAB</small></span>
      </a>
      <nav class="primary-nav" aria-label="주 메뉴"><a href="/" data-view-link="places" aria-current="page">본문 속 지명</a><a href="/?view=journeys" data-view-link="journeys">성경여행</a></nav>
      <div class="header-tools"><label class="sr-only" for="language-select">Language</label><select id="language-select" aria-label="Language">${Object.entries(LOCALES).map(([code, name]) => `<option value="${code}">${name}</option>`).join('')}</select><span class="header-edition"><span data-i18n="edition">성경 배경 연구 도구</span> <span>01</span></span></div>
    </div>
  </header>

  <main>
    <section class="hero shell" aria-labelledby="page-title">
      <div class="hero-copy">
        <div class="eyebrow"><span class="eyebrow-line"></span> SERMON CONTEXT STUDIO</div>
        <h1 id="page-title"><span data-i18n="hero1">본문이 지나간 장소를</span><br /><em data-i18n="hero2">한눈에 살펴보세요.</em></h1>
        <p class="hero-lead" data-i18n="lead">설교 본문 주소를 입력하면 연결된 지명을 찾아 지도와 근거를 함께 보여줍니다. 준비의 첫 장면을 더 분명하게 시작하세요.</p>
        <form id="reference-form" class="search-form" novalidate>
          <label for="reference-input" data-i18n="reference">성경 본문</label>
          <div class="search-row">
            <input id="reference-input" name="reference" type="text" value="왕하 4:1-44" data-i18n-placeholder="referencePlaceholder" placeholder="예: 행 16:6-15" autocomplete="off" spellcheck="false" />
            <button type="submit"><span data-i18n="search">장소 찾기</span><span aria-hidden="true">↗</span></button>
          </div>
          <p id="search-error" class="search-error" role="alert" hidden></p>
        </form>
        <button id="example-hint" class="example-hint" type="button" hidden></button>
        <div class="example-row"><span data-i18n="examples">바로 살펴보기</span><div id="examples" class="example-buttons"></div></div>
      </div>
      <aside class="hero-visual" aria-labelledby="visual-title">
        <div id="hero-map" class="visual-map" aria-hidden="true"></div>
        <div class="visual-map-wash" aria-hidden="true"></div>
        <div class="visual-topline">
          <span class="visual-live"><i aria-hidden="true"></i> <span data-i18n="mapBadge">본문 지도</span></span>
          <span id="visual-place-count" class="visual-count" data-i18n="checking">지명 확인 중</span>
        </div>
        <div class="visual-intro"><span data-i18n="nowPassage">지금 살펴보는 본문</span><strong id="visual-title">열왕기하 4:1–44</strong><p id="visual-intro-copy" data-i18n="previewIntro">본문에 연결된 지명이 지도 위에 펼쳐집니다.</p></div>
        <p id="hero-map-fallback" class="visual-map-fallback" data-i18n="previewLoading">본문 지도를 불러오고 있습니다.</p>
        <div class="visual-bottom">
          <div id="hero-focus" class="visual-focus">
            <div class="visual-focus-copy"><span id="hero-focus-kicker" data-i18n="focusPlace">본문 속 장소</span><strong id="hero-focus-name" data-i18n="checking">지명 확인 중</strong><small id="hero-focus-detail" data-i18n="focusLoading">지도를 준비하고 있습니다.</small></div>
            <div class="visual-focus-navigation">
              <button id="hero-prev" type="button" data-i18n-aria-label="previous" aria-label="이전 장소" hidden>←</button>
              <span id="hero-position">—</span>
              <button id="hero-next" type="button" data-i18n-aria-label="next" aria-label="다음 장소" hidden>→</button>
            </div>
            <span class="visual-progress" aria-hidden="true"><span id="hero-progress-fill"></span></span>
          </div>
          <div class="visual-footer"><span>© OpenStreetMap · OpenFreeMap</span><div><button id="hero-motion-toggle" type="button" aria-pressed="false" hidden>일시정지</button><button id="visual-results-button" type="button"><span data-i18n="heroExplore">이 장소 살펴보기</span> ↗</button></div></div>
        </div>
      </aside>
    </section>

    <section id="journeys" class="journey-section" aria-labelledby="journey-title" hidden>
      <div class="shell">
        <div class="section-topline"></div>
        <div class="journey-heading"><div><div id="journey-eyebrow" class="section-kicker">본문을 따라 걷는 지도</div><h2 id="journey-title">여행 이야기</h2><p id="journey-intro">지명이 나오는 순서대로 장면을 넘기며, 본문과 지도 근거를 함께 살펴보세요.</p></div></div>
        <div id="person-explorer" class="person-explorer"></div>
        <button id="journey-catalog-reveal" class="journey-catalog-reveal" type="button">다른 검수 여정 보기 ↗</button>
        <div class="journey-catalog-heading"><div><h3 id="journey-catalog-title"></h3><p id="journey-catalog-intro"></p></div><span id="journey-catalog-count"></span></div>
        <input id="journey-search" class="journey-search" type="search" autocomplete="off" />
        <div id="journey-filters" class="journey-filters" role="group"></div>
        <div id="journey-catalog" class="journey-catalog"></div>
        <div id="journey-active-head" class="journey-active-head"></div>
        <p id="journey-route-note" class="journey-route-note"></p>
        <div class="journey-workspace">
          <div class="journey-map-shell"><div id="journey-map" class="journey-map" aria-label="여행 이야기 지도"><span id="journey-map-loading">여정 지도를 불러오는 중입니다.</span></div><button id="journey-fit" class="journey-fit" type="button">전체 여정 ↗</button></div>
          <div class="journey-story"><div class="journey-story-top"><span id="journey-scene-count"></span><span id="journey-step-reference"></span></div><div id="journey-current" class="journey-current" aria-live="polite"></div><div class="journey-controls"><button id="journey-prev" type="button"></button><button id="journey-next" type="button"></button></div><div id="journey-timeline" class="journey-timeline" aria-label="Journey scenes"></div></div>
        </div>
        <a class="journey-data-credit" href="https://www.openbible.info/geo/" target="_blank" rel="noopener noreferrer">OpenBible.info · CC BY 4.0 ↗</a>
      </div>
    </section>

    <section id="results" class="results-section" aria-labelledby="results-title">
      <div class="shell">
        <div class="section-topline"></div>
        <div class="results-heading">
          <div><div class="section-kicker" data-i18n="sectionKicker">본문 연구 · 지명</div><h2 id="results-title" data-i18n="placesTitle">본문 속 장소</h2><p id="results-description" data-i18n="resultsLoading">공개 성경 지리 데이터에서 지명을 불러오는 중입니다.</p></div>
          <div class="heading-actions"><span id="result-count" class="result-count">—</span><button id="print-button" class="text-button" type="button" disabled><span data-i18n="print">인쇄하기</span> <span aria-hidden="true">↗</span></button></div>
        </div>

        <div id="passage-context" class="passage-context" hidden></div>
        <div id="passage-evidence" class="passage-evidence" hidden></div>
        <div id="insight-strip" class="insight-strip" hidden></div>

        <div class="workspace">
          <div class="map-pane">
            <div class="pane-head"><div><span class="pane-index">01</span><strong data-i18n="mapView">지도로 보기</strong></div><span id="map-caption" data-i18n="bibleWorld">성경 세계</span></div>
            <div class="map-frame"><div id="map" class="map" role="img" data-i18n-aria-label="mapView" aria-label="본문과 연결된 지명 지도"></div><div id="map-guide" class="map-guide" hidden></div><div id="map-selection" class="map-selection" aria-live="polite" hidden></div><div id="map-empty" class="map-empty" hidden><span aria-hidden="true">○</span><strong data-i18n="mapEmptyTitle">이 본문에 연결된 지도 지점이 없습니다.</strong><p data-i18n="mapEmptyDesc">지명이 없는 절에는 임의의 장소를 표시하지 않습니다.</p></div></div>
            <p class="map-footnote" data-i18n="mapFootnote">핀은 선택된 대표 좌표입니다. 지역·강 또는 위치 논쟁이 있는 곳은 실제 범위와 다를 수 있습니다.</p>
          </div>
          <div class="places-pane">
            <div class="pane-head"><div><span class="pane-index">02</span><strong data-i18n="placesEvidence">지명과 근거</strong></div><span id="places-caption" data-i18n="searchResults">검색 결과</span></div>
            <button id="selected-place-index" class="selected-place-index" type="button" hidden></button>
            <div id="place-list" class="place-list" aria-live="polite"><div class="empty-state" data-i18n="dataLoading">자료를 불러오는 중입니다.</div></div>
          </div>
        </div>

        <div class="lower-grid">
          <div class="note-panel">
            <div class="note-title"><span class="pane-index">03</span><h3 data-i18n="noteTitle">설교 준비 메모</h3></div>
            <p data-i18n="noteIntro">본문을 읽으며 떠오른 관찰과 확인할 질문을 적어 두세요.</p>
            <label class="sr-only" for="sermon-note" data-i18n="noteTitle">설교 준비 메모</label><textarea id="sermon-note" data-i18n-placeholder="notePlaceholder" placeholder="이 장소가 본문 이해에 어떤 도움을 주는지 기록하세요."></textarea>
            <span id="note-status" class="note-save" role="status" data-i18n="noteAuto">입력하면 이 브라우저에 자동 저장됩니다.</span>
            <div class="note-actions"><button id="download-note" type="button" disabled><span data-i18n="noteDownload">이 메모 파일로 저장</span> ↗</button><button id="backup-notes" type="button" disabled><span data-i18n="noteBackup">전체 메모 백업</span> ↗</button><button id="import-trigger" type="button"><span data-i18n="noteImport">백업 불러오기</span> ↗</button><input id="import-notes" type="file" accept=".json,application/json" hidden /></div>
            <div class="saved-notes"><strong data-i18n="savedPassages">이 브라우저에 저장된 본문</strong><div id="saved-note-list" data-i18n="noNotes">저장된 메모가 없습니다.</div></div>
          </div>
          <aside class="source-panel"><div class="source-top" data-i18n="sourceTop">자료 출처와 사용 범위</div><h3 data-i18n="sourceTitle">근거를 따라가며 살펴보세요.</h3><p data-i18n="sourceBody"></p><div id="source-version" class="source-version"></div><div class="source-links"><a href="https://www.openbible.info/geo/" target="_blank" rel="noopener noreferrer">OpenBible.info ↗</a><a href="https://www.bskorea.or.kr/bible/korbibReadpage.php?version=GAE" target="_blank" rel="noopener noreferrer"><span data-i18n="readBible">한국어 성경 읽기</span> ↗</a></div></aside>
        </div>
      </div>
    </section>
  </main>

  <footer class="site-footer"><div class="shell footer-inner"><span data-i18n="copyright">© 목회 AI 연구소</span><span><span data-i18n="footerData">지리 자료</span>: <a href="https://www.openbible.info/geo/" target="_blank" rel="noopener noreferrer">OpenBible.info</a> · CC BY 4.0</span></div></footer>
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
const journeySection = document.querySelector('#journeys');
const journeyParam = new URLSearchParams(location.search).get('journey');
let currentView = new URLSearchParams(location.search).get('view') === 'journeys' || JOURNEYS.some(({ id }) => id === journeyParam) ? 'journeys' : 'places';
let currentJourney = JOURNEYS.find(({ id }) => id === journeyParam) || JOURNEYS.find(({ id }) => id === 'jesus-early');
let currentJourneyCategory = 'all';
let journeyQuery = '';
const requestedJourneyStep = Number(new URLSearchParams(location.search).get('step'));
let journeyStepIndex = Number.isInteger(requestedJourneyStep) && requestedJourneyStep >= 1
  ? Math.min(requestedJourneyStep - 1, currentJourney.steps.length - 1) : 0;
let journeyMap;
let journeyMapReady = false;
let journeyMapWanted = false;
let journeyMapFailed = false;
let journeyMarkers = [];
let data;
let evidenceData;
let currentEvidence;
let placeOccurrences = new Map();
let currentReference;
let currentPlaces = [];
let currentPassageContext = null;
let selectedPlaceId = null;
let spotlightPlaceId = null;
let map;
let heroMap;
let maplibre;
let markers = [];
let candidateMarkers = [];
let selectedCandidateIndex = 0;
let heroPlaces = [];
let heroReferenceLabel;
let heroActiveIndex = 0;
let heroActiveMarker;
let heroMapReady = false;
const personExplorer = createPersonExplorer(document.querySelector('#person-explorer'), {
  getLocale: () => locale,
  getPlaces: () => data?.places,
  getMaplibre: () => maplibre,
  placeName: displayName,
  journeyName: (id) => journeyName(JOURNEYS.find((journey) => journey.id === id)),
  openJourney: (id) => {
    const selected = JOURNEYS.find((journey) => journey.id === id);
    if (!selected) return;
    const address = new URL(location.href);
    address.searchParams.delete('person');
    history.replaceState(null, '', address);
    journeySection.classList.remove('is-person-only');
    currentJourney = selected;
    currentJourneyCategory = 'all';
    journeyQuery = '';
    document.querySelector('#journey-search').value = '';
    journeyStepIndex = 0;
    updateJourneyAddress();
    renderJourney();
    fitJourneyMap();
    document.querySelector('#journey-active-head').scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
  },
  openReference: (code, chapter, verse) => {
    input.value = `${localizedBookName(code, locale)} ${chapter}:${verse}`;
    switchView('places');
    form.requestSubmit();
    document.querySelector('#results').scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
  },
});
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const heroVisual = document.querySelector('.hero-visual');
const heroFallback = document.querySelector('#hero-map-fallback');
const heroFocus = document.querySelector('#hero-focus');
const heroMotionToggle = document.querySelector('#hero-motion-toggle');

function renderExamples() {
  document.querySelector('#examples').innerHTML = EXAMPLES.map((example) => {
    const localized = formatReference(parseReference(example), locale);
    return `<button type="button" data-example="${escapeHtml(example)}">${escapeHtml(localized)}</button>`;
  }).join('');
}
document.querySelector('#examples').addEventListener('click', (event) => {
  const button = event.target.closest('button[data-example]');
  if (!button) return;
  input.value = button.dataset.example;
  form.requestSubmit();
});
document.querySelector('#visual-results-button').addEventListener('click', () => {
  const place = heroPlaces[heroActiveIndex];
  if (place) selectPlace(place.id, false);
  document.querySelector(place ? '.map-pane' : '#results').scrollIntoView({
    behavior: reducedMotion.matches ? 'auto' : 'smooth',
  });
});

document.querySelector('#example-hint').addEventListener('click', () => {
  if (!spotlightPlaceId) return;
  selectPlace(spotlightPlaceId, false);
  document.querySelector('.map-pane').scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
});

document.querySelector('#insight-strip').addEventListener('click', (event) => {
  const button = event.target.closest('button[data-insight-place]');
  if (!button) return;
  selectPlace(button.dataset.insightPlace, true);
  document.querySelector('.map-pane').scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
});

document.querySelector('#map-selection').addEventListener('click', (event) => {
  const occurrenceButton = event.target.closest('button[data-map-occurrences]');
  if (occurrenceButton) {
    openOccurrences(occurrenceButton.dataset.mapOccurrences, true);
    return;
  }
  const button = event.target.closest('button[data-map-compare]');
  if (!button) return;
  const card = [...placeList.querySelectorAll('.place-card')].find((item) => item.dataset.placeId === button.dataset.mapCompare);
  if (!card) return;
  const details = card.querySelector('.place-candidates');
  if (details) details.open = true;
  card.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'center' });
});

document.querySelector('#selected-place-index').addEventListener('click', () => {
  if (selectedPlaceId) openOccurrences(selectedPlaceId, true);
});

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

function applyView(scroll = false) {
  const showingJourneys = currentView === 'journeys';
  const personId = new URLSearchParams(location.search).get('person');
  journeySection.classList.toggle('is-person-only', showingJourneys && Boolean(personId) && !CURATED_JOURNEYS_BY_PERSON[personId]?.length);
  document.querySelector('.hero').hidden = showingJourneys;
  document.querySelector('#results').hidden = showingJourneys;
  journeySection.hidden = !showingJourneys;
  document.title = showingJourneys ? `${journeyMessage(locale, 'navJourneys')} | ${translate('brand')}` : translate('title');
  document.querySelector('.primary-nav').setAttribute('aria-label', `${journeyMessage(locale, 'navPlaces')} · ${journeyMessage(locale, 'navJourneys')}`);
  for (const link of document.querySelectorAll('[data-view-link]')) {
    const view = link.dataset.viewLink;
    link.textContent = journeyMessage(locale, view === 'places' ? 'navPlaces' : 'navJourneys');
    if (view === currentView) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
    const address = new URL(location.href);
    if (view === 'journeys') {
      address.searchParams.set('view', 'journeys');
      address.searchParams.set('journey', currentJourney.id);
      address.searchParams.set('step', String(journeyStepIndex + 1));
    } else {
      address.searchParams.delete('view');
      address.searchParams.delete('journey');
      address.searchParams.delete('step');
      address.searchParams.delete('person');
    }
    link.href = `${address.pathname}${address.search}${address.hash}`;
  }
  requestAnimationFrame(() => {
    if (showingJourneys) {
      personExplorer.load();
      const personId = new URLSearchParams(location.search).get('person');
      if (personId) personExplorer.focusPerson(personId);
      personExplorer.onShow();
      journeyMapWanted = true;
      setupJourneyMap();
      journeyMap?.resize();
      fitJourneyMap(true);
    } else {
      map?.resize();
      heroMap?.resize();
      if (map && currentPlaces.length) {
        updateMap(currentPlaces);
        if (selectedPlaceId) selectPlace(selectedPlaceId, false);
      }
    }
  });
  if (scroll) window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
}

function switchView(view) {
  if (view === currentView) return;
  currentView = view;
  const address = new URL(location.href);
  if (view === 'journeys') {
    address.searchParams.set('view', 'journeys');
    address.searchParams.set('journey', currentJourney.id);
    address.searchParams.set('step', String(journeyStepIndex + 1));
  } else {
    address.searchParams.delete('view');
    address.searchParams.delete('journey');
    address.searchParams.delete('step');
    address.searchParams.delete('person');
  }
  history.pushState(null, '', address);
  applyView(true);
}

document.querySelector('.primary-nav').addEventListener('click', (event) => {
  const link = event.target.closest('[data-view-link]');
  if (!link) return;
  event.preventDefault();
  switchView(link.dataset.viewLink);
});

document.querySelector('#journey-catalog-reveal').addEventListener('click', () => {
  const address = new URL(location.href);
  address.searchParams.delete('person');
  history.replaceState(null, '', address);
  journeySection.classList.remove('is-person-only');
  document.querySelector('.journey-catalog-heading').scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
});

window.addEventListener('popstate', () => {
  const params = new URLSearchParams(location.search);
  const journey = JOURNEYS.find((item) => item.id === params.get('journey'));
  if (journey) {
    currentJourney = journey;
    const step = Number(params.get('step'));
    journeyStepIndex = Number.isInteger(step) ? Math.max(0, Math.min(step - 1, journey.steps.length - 1)) : 0;
    currentJourneyCategory = 'all';
    if (data) renderJourney();
  }
  currentView = params.get('view') === 'journeys' || journey ? 'journeys' : 'places';
  applyView();
});

function journeyName(journey) {
  return journey.title?.[locale] || journey.title?.en || journeyMessage(locale, journey.id);
}

function journeyIntro(journey) {
  if (!journey.intro) return journeyMessage(locale, `${journey.id}Intro`);
  return journey.intro[locale] || (locale === 'en' ? journey.intro.en : journeyMessage(locale, 'catalogIntro'));
}

function stepCode(journey, step) {
  return step.code || journey.code;
}

function stepStory(journey, step, index) {
  if (step.story) return step.story[locale] || (locale === 'en' ? step.story.en : journeyMessage(locale, `action${step.action[0].toUpperCase()}${step.action.slice(1)}`));
  return journeyMessage(locale, `${journey.id}Events`)?.[index] || journeyMessage(locale, 'storyFallback');
}

function journeyRange(journey) {
  const first = journey.steps[0];
  const last = journey.steps.at(-1);
  return `${localizedBookName(stepCode(journey, first), locale)} ${first.chapter} – ${localizedBookName(stepCode(journey, last), locale)} ${last.chapter}`;
}

function journeyPlace(step) {
  return data?.places.find((place) => place.id === step.placeId);
}

function journeyReference(step) {
  const end = step.endVerse ? `–${step.endVerse}` : '';
  return `${localizedBookName(stepCode(currentJourney, step), locale)} ${step.chapter}:${step.verse}${end}`;
}

function updateJourneyAddress() {
  const url = new URL(location.href);
  url.searchParams.set('view', 'journeys');
  url.searchParams.set('journey', currentJourney.id);
  url.searchParams.set('step', String(journeyStepIndex + 1));
  history.replaceState(null, '', url);
}

function renderJourney() {
  const j = (key, vars) => journeyMessage(locale, key, vars);
  document.querySelector('#journey-eyebrow').textContent = j('eyebrow');
  document.querySelector('#journey-title').textContent = j('navJourneys');
  document.querySelector('#journey-intro').textContent = j('intro');
  document.querySelector('#journey-catalog-title').textContent = j('catalogTitle');
  document.querySelector('#journey-catalog-intro').textContent = j('catalogIntro');
  const searchInput = document.querySelector('#journey-search');
  searchInput.placeholder = j('searchJourneys');
  searchInput.setAttribute('aria-label', j('searchJourneys'));
  document.querySelector('#journey-filters').setAttribute('aria-label', j('catalogTitle'));
  document.querySelector('#journey-filters').innerHTML = JOURNEY_CATEGORIES.map((category) => `<button type="button" data-journey-category="${category}" aria-pressed="${category === currentJourneyCategory}">${escapeHtml(j(`category${category[0].toUpperCase()}${category.slice(1)}`))}</button>`).join('');
  const visible = JOURNEYS.filter((journey) => {
    if (currentJourneyCategory !== 'all' && journey.category !== currentJourneyCategory) return false;
    if (!journeyQuery) return true;
    const terms = [journey.id, journeyName(journey), journey.title?.ko, journey.title?.en,
      journeyMessage('ko', journey.id), journeyMessage('en', journey.id), j(`category${journey.category[0].toUpperCase()}${journey.category.slice(1)}`)];
    return terms.some((term) => String(term || '').toLocaleLowerCase().includes(journeyQuery));
  })
    .sort((a, b) => JOURNEY_CATEGORIES.indexOf(a.category) - JOURNEY_CATEGORIES.indexOf(b.category));
  document.querySelector('#journey-catalog-count').textContent = j('journeyCount', { count: visible.length });
  document.querySelector('#journey-catalog').innerHTML = visible.length
    ? visible.map((journey) => `<button type="button" data-journey="${escapeHtml(journey.id)}" aria-pressed="${journey.id === currentJourney.id}"><span>${escapeHtml(j(`category${journey.category[0].toUpperCase()}${journey.category.slice(1)}`))}</span><strong>${escapeHtml(journeyName(journey))}</strong><small>${escapeHtml(journeyRange(journey))} · ${escapeHtml(j('steps', { count: journey.steps.length }))}</small><i aria-hidden="true">↗</i></button>`).join('')
    : `<p class="journey-empty">${escapeHtml(j('noJourneyResults'))}</p>`;
  document.querySelector('#journey-active-head').innerHTML = `<span>${escapeHtml(j(`category${currentJourney.category[0].toUpperCase()}${currentJourney.category.slice(1)}`))} · ${escapeHtml(journeyRange(currentJourney))}</span><h3>${escapeHtml(journeyName(currentJourney))}</h3><p>${escapeHtml(journeyIntro(currentJourney))}</p>`;
  document.querySelector('#journey-timeline').setAttribute('aria-label', j('steps', { count: currentJourney.steps.length }));
  document.querySelector('#journey-map').setAttribute('aria-label', `${j('title')} · ${j('all')}`);
  document.querySelector('#journey-route-note').textContent = j(currentJourney.linePolicy === 'none' ? 'noRouteNote' : 'routeNote');
  if (!journeyMapReady) document.querySelector('#journey-map-loading').textContent = j(journeyMapFailed ? 'mapFailed' : 'mapLoading');
  document.querySelector('#journey-fit').textContent = `${j('all')} ↗`;
  document.querySelector('#journey-prev').textContent = `← ${j('prev')}`;
  document.querySelector('#journey-next').textContent = `${j('next')} →`;
  document.querySelector('#journey-prev').disabled = journeyStepIndex === 0;
  document.querySelector('#journey-next').disabled = journeyStepIndex === currentJourney.steps.length - 1;
  const step = currentJourney.steps[journeyStepIndex];
  const place = journeyPlace(step);
  if (!place) return;
  const name = displayName(place);
  const scene = j('scene', { current: journeyStepIndex + 1, total: currentJourney.steps.length });
  const story = stepStory(currentJourney, step, journeyStepIndex);
  const photo = step.broad ? null : place.photo;
  document.querySelector('#journey-scene-count').textContent = scene;
  document.querySelector('#journey-step-reference').textContent = journeyReference(step);
  document.querySelector('#journey-current').innerHTML = `<div class="journey-current-heading"><span>${escapeHtml(scene)}</span><h3>${escapeHtml(name)}</h3><p>${escapeHtml(story)}</p></div>
    ${step.broad ? `<p class="journey-broad">${escapeHtml(j('broad'))}</p>` : ''}
    ${photo ? `<figure class="journey-photo"><img src="${escapeHtml(photo.url)}" alt="${escapeHtml(photo.alt)}" loading="lazy" decoding="async" referrerpolicy="no-referrer" /><figcaption>${escapeHtml(j('photo'))} · <a href="${escapeHtml(photo.sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(photo.credit)} · ${escapeHtml(photo.license)} ↗</a></figcaption></figure>` : ''}
    <div class="journey-links"><a href="${bibleReadingUrl(stepCode(currentJourney, step), step.chapter, step.verse)}" target="_blank" rel="noopener noreferrer">${escapeHtml(j('read'))} ↗</a><button type="button" data-journey-open-place>${escapeHtml(j('place'))} ↗</button>${currentJourney.source ? `<a class="journey-source-link" href="${escapeHtml(currentJourney.source)}" target="_blank" rel="noopener noreferrer">${escapeHtml(j('source'))} · KJV ↗</a>` : ''}</div>`;
  document.querySelector('#journey-timeline').innerHTML = currentJourney.steps.map((item, index) => {
    const itemPlace = journeyPlace(item);
    return `<button type="button" data-journey-step="${index}" aria-current="${index === journeyStepIndex ? 'step' : 'false'}"><span>${String(index + 1).padStart(2, '0')}</span><strong>${escapeHtml(itemPlace ? displayName(itemPlace) : '—')}</strong><small>${escapeHtml(`${localizedBookName(stepCode(currentJourney, item), locale)} ${item.chapter}:${item.verse}`)}</small></button>`;
  }).join('');
  const timeline = document.querySelector('#journey-timeline');
  const activeScene = timeline.querySelector('[aria-current="step"]');
  if (activeScene && timeline.scrollHeight > timeline.clientHeight) timeline.scrollTop = activeScene.offsetTop - timeline.offsetTop - 8;
  if (journeyMapReady) updateJourneyMap(false);
}

function selectJourneyStep(index) {
  if (!Number.isInteger(index) || index < 0 || index >= currentJourney.steps.length) return;
  journeyStepIndex = index;
  updateJourneyAddress();
  renderJourney();
}

document.querySelector('#journey-filters').addEventListener('click', (event) => {
  const button = event.target.closest('[data-journey-category]');
  if (!button) return;
  currentJourneyCategory = button.dataset.journeyCategory;
  if (currentJourneyCategory !== 'all' && currentJourney.category !== currentJourneyCategory) {
    currentJourney = JOURNEYS.find((journey) => journey.category === currentJourneyCategory);
    journeyStepIndex = 0;
    updateJourneyAddress();
  }
  renderJourney();
  fitJourneyMap();
});
document.querySelector('#journey-search').addEventListener('input', (event) => {
  journeyQuery = event.target.value.trim().toLocaleLowerCase();
  renderJourney();
});
document.querySelector('#journey-catalog').addEventListener('click', (event) => {
  const button = event.target.closest('[data-journey]');
  const selected = JOURNEYS.find((journey) => journey.id === button?.dataset.journey);
  if (!selected) return;
  currentJourney = selected;
  journeyStepIndex = 0;
  updateJourneyAddress();
  renderJourney();
  fitJourneyMap();
  document.querySelector('#journey-active-head').scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
});
document.querySelector('#journey-prev').addEventListener('click', () => selectJourneyStep(journeyStepIndex - 1));
document.querySelector('#journey-next').addEventListener('click', () => selectJourneyStep(journeyStepIndex + 1));
document.querySelector('#journey-fit').addEventListener('click', () => fitJourneyMap());
document.querySelector('#journey-timeline').addEventListener('click', (event) => {
  const button = event.target.closest('[data-journey-step]');
  if (button) selectJourneyStep(Number(button.dataset.journeyStep));
});
document.querySelector('#journey-current').addEventListener('click', (event) => {
  if (!event.target.closest('[data-journey-open-place]')) return;
  const step = currentJourney.steps[journeyStepIndex];
  input.value = journeyReference(step);
  switchView('places');
  form.requestSubmit();
  selectPlace(step.placeId, false);
  document.querySelector('#results').scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
});

function applyLanguage() {
  document.documentElement.lang = locale;
  document.title = translate('title');
  document.querySelector('meta[name="description"]').content = translate('description');
  document.querySelector('.brand').href = locale === 'ko' ? '/' : `/?lang=${encodeURIComponent(locale)}`;
  document.querySelector('#language-select').value = locale;
  for (const element of document.querySelectorAll('[data-i18n]')) element.textContent = translate(element.dataset.i18n);
  for (const element of document.querySelectorAll('[data-i18n-placeholder]')) element.placeholder = translate(element.dataset.i18nPlaceholder);
  for (const element of document.querySelectorAll('[data-i18n-aria-label]')) element.setAttribute('aria-label', translate(element.dataset.i18nAriaLabel));
  for (const element of document.querySelectorAll('[data-i18n-alt]')) element.alt = translate(element.dataset.i18nAlt);
  document.querySelector('#journey-catalog-reveal').textContent = evidenceMessage(locale).reveal;
  renderSourceVersion();
  renderExamples();
  personExplorer.render();
  if (data) renderJourney();
  applyView();
  if (currentReference && data) {
    input.value = formatReference(currentReference, locale);
    renderPlaces(currentPlaces, currentReference);
    setNoteStatus(translate(note.value ? 'noteRestored' : 'noteNew'));
    renderSavedNotes();
  } else if (!location.hash) {
    input.value = formatReference(parseReference(EXAMPLES[0]), locale);
  }
}

document.querySelector('#language-select').addEventListener('change', (event) => {
  locale = event.target.value;
  const url = new URL(location.href);
  url.searchParams.set('lang', locale);
  if (currentReference && (currentView !== 'journeys' || location.hash)) url.hash = encodeURIComponent(formatReference(currentReference, locale));
  history.replaceState(null, '', url);
  applyLanguage();
});

applyLanguage();

function displayName(place) {
  return locale === 'ko' ? KOREAN_PLACES[place.name] || place.name : place.name;
}

function firstMention(place) {
  return firstPassageMention(place);
}

function passagePriority(place) {
  return evidencePriority(place, currentPassageContext, currentEvidence);
}

function spotlightPlace(places) {
  return [...places].filter((place) => place.coordinate)
    .sort((a, b) => passagePriority(a) - passagePriority(b) || firstMention(a) - firstMention(b))[0];
}

function renderSourceVersion() {
  const target = document.querySelector('#source-version');
  if (!target || !data?.sourceCommit) return;
  const commit = data.sourceCommit;
  const url = `https://github.com/openbibleinfo/Bible-Geocoding-Data/commit/${commit}`;
  target.innerHTML = `<strong>${escapeHtml(translate('sourceVersion'))}</strong> <a href="${url}" target="_blank" rel="noopener noreferrer">${escapeHtml(commit.slice(0, 7))} ↗</a><small>${escapeHtml(translate('sourceVersionNote'))}</small>`;
}

function readingLink(code, chapter, verse, label) {
  const reference = `${localizedBookName(code, locale)} ${chapter}:${verse}`;
  return `<a href="${bibleReadingUrl(code, chapter, verse)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(translate('readAria', { reference }))}">${escapeHtml(label)} <span aria-hidden="true">↗</span></a>`;
}

function versesLabel(count) {
  return locale === 'en' && count === 1 ? '1 verse' : translate('verses', { count });
}

function occurrenceMarkup(placeId) {
  const references = placeOccurrences.get(placeId) || [];
  const groups = new Map();
  for (const reference of references) {
    if (!groups.has(reference.code)) groups.set(reference.code, []);
    groups.get(reference.code).push(reference);
  }
  return `<p class="occurrence-note">${escapeHtml(translate('occurrenceNote'))}</p>
    <div class="occurrence-books">${[...groups].map(([code, verses]) => {
      return `<section class="occurrence-book"><h4>${escapeHtml(localizedBookName(code, locale))} <span>${escapeHtml(versesLabel(verses.length))}</span></h4><div class="occurrence-verses">${verses.map(({ chapter, verse }) => readingLink(code, chapter, verse, `${chapter}:${verse}`)).join('')}</div></section>`;
    }).join('')}</div>`;
}

function openOccurrences(placeId, scroll = false) {
  const card = [...placeList.querySelectorAll('.place-card')].find((item) => item.dataset.placeId === placeId);
  const details = card?.querySelector('.place-occurrences');
  if (!details) return;
  if (!details.dataset.loaded) {
    details.querySelector('.occurrence-content').innerHTML = occurrenceMarkup(placeId);
    details.dataset.loaded = 'true';
  }
  details.open = true;
  if (scroll) details.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'center' });
}

function revealPlaceCard(placeId) {
  const card = [...placeList.querySelectorAll('.place-card')].find((item) => item.dataset.placeId === placeId);
  if (!card || placeList.scrollHeight <= placeList.clientHeight) return;
  const top = card.getBoundingClientRect().top - placeList.getBoundingClientRect().top + placeList.scrollTop;
  if (top < placeList.scrollTop || top > placeList.scrollTop + placeList.clientHeight - 90) {
    placeList.scrollTop = Math.max(0, top - 10);
  }
}

function placeStatus(place) {
  if (!place.coordinate) return translate('statusUnknown');
  if (place.candidateCount > 1) return translate('statusCandidates', { count: place.candidateCount });
  if (['region', 'river', 'body of water', 'natural area', 'mountain range'].includes(place.type)) return translate('statusRepresentative');
  return translate('statusAvailable');
}

function renderPassageContext(places) {
  const panel = document.querySelector('#passage-context');
  if (!currentPassageContext) { panel.hidden = true; panel.innerHTML = ''; return; }
  const copy = passageContextCopy(locale);
  const roles = ['scene', 'background', 'discussed'];
  const entries = roles.map((role) => places.find((place) => passageRole(currentPassageContext, place) === role)).filter(Boolean);
  const mosesSceneStep = JOURNEYS.find((journey) => journey.id === 'moses')?.steps
    .findIndex((step) => step.code === 'EXO' && step.chapter === 3 && step.verse === 1);
  const journeyHref = mosesSceneStep >= 0
    ? `/?view=journeys&journey=moses&step=${mosesSceneStep + 1}${locale === 'ko' ? '' : `&lang=${encodeURIComponent(locale)}`}` : null;
  panel.hidden = false;
  panel.innerHTML = `<div class="passage-context-head"><span>${escapeHtml(localizedBookName('EXO', locale))} 3:1</span><h3>${escapeHtml(copy.title)}</h3><p>${escapeHtml(currentPassageContext.hasEgypt ? copy.summary : copy.shortSummary)}</p></div>
    <div class="passage-context-places">${entries.map((place) => {
      const role = passageRole(currentPassageContext, place);
      return `<button type="button" class="passage-context-place passage-context-place--${role}" data-context-place="${escapeHtml(place.id)}"><small>${escapeHtml(copy[role])}</small><strong>${escapeHtml(displayName(place))}</strong><span>${escapeHtml(copy[`${role}Detail`])}</span></button>`;
    }).join('')}</div><p class="passage-context-note">${escapeHtml(copy.note)} <a href="${bibleReadingUrl('EXO', 3, 1)}" target="_blank" rel="noopener noreferrer">${escapeHtml(localizedBookName('EXO', locale))} 3:1 ↗</a>${journeyHref ? ` <a href="${escapeHtml(journeyHref)}">${escapeHtml(copy.journeyLink)} ↗</a>` : ''}</p>`;
}

function renderPassageEvidence(places, reference) {
  const panel = document.querySelector('#passage-evidence');
  const m = evidenceMessage(locale);
  if (!evidenceData) {
    panel.hidden = false;
    panel.innerHTML = `<p class="passage-evidence-unavailable">${escapeHtml(m.unavailable)}</p>`;
    return;
  }
  const ko = locale === 'ko';
  const evidence = currentEvidence;
  const confirmed = new Set(evidence.confirmedPlaces.map((place) => place.id));
  const people = evidence.people.filter((person) => person.id !== 'god_1324'
    && !(person.id === 'israel_682' && reference.code !== 'GEN')
    && !places.some((place) => place.name === person.name)).slice(0, 5);
  const events = evidence.events.slice(0, 4);
  const scenes = evidence.scenes.slice(0, 3);
  const eventPlaceIds = new Set(evidence.eventPlaceIds);
  panel.hidden = false;
  panel.innerHTML = `<div class="passage-evidence-heading"><div><span>${escapeHtml(m.eyebrow)}</span><h3>${escapeHtml(m.title)}</h3></div><a href="https://github.com/robertrouse/theographic-bible-metadata/tree/${escapeHtml(evidenceData.sourceCommit)}" target="_blank" rel="noopener noreferrer">Theographic · CC BY-SA 4.0 ↗</a></div>
    <div class="passage-evidence-metrics"><span>${escapeHtml(m.direct)} <b>${places.length}</b></span><span>${escapeHtml(m.confirmed)} <b>${evidence.confirmedPlaces.length}</b></span><span>${escapeHtml(m.events)} <b>${evidence.events.length}</b></span><span>${escapeHtml(m.people)} <b>${evidence.people.length}</b></span><span>${escapeHtml(m.journeys)} <b>${evidence.scenes.length}</b></span></div>
    <div class="passage-evidence-columns"><div><strong>${escapeHtml(m.placeEvents)}</strong><div class="passage-evidence-chips">${places.slice(0, 8).map((place) => `<button type="button" data-evidence-place="${escapeHtml(place.id)}"><span>${escapeHtml(displayName(place))}</span><small>${escapeHtml(eventPlaceIds.has(place.id) ? m.eventLocation : confirmed.has(place.id) ? m.both : m.mention)}</small></button>`).join('') || `<span class="passage-evidence-muted">${escapeHtml(m.noPlaces)}</span>`}</div>${events.length ? `<div class="passage-evidence-events">${events.map((event) => `<span><b>${escapeHtml(event.title)}</b><small>${escapeHtml(m.eventCategory)} · ${event.verses} ${escapeHtml(m.linkedVerses)}</small></span>`).join('')}</div>` : ''}</div>
    <div><strong>${escapeHtml(m.personJourneys)}</strong><div class="passage-evidence-chips">${people.map((person) => `<button type="button" data-evidence-person="${escapeHtml(person.id)}"><span>${escapeHtml(ko ? KOREAN_NAMES[person.id] || person.name : person.name)}</span><small>${person.verses} ${escapeHtml(m.personVerses)}</small></button>`).join('') || `<span class="passage-evidence-muted">${escapeHtml(m.noPeople)}</span>`}</div>${scenes.length ? `<div class="passage-evidence-journeys">${scenes.map(({ journey, step, index }) => `<a href="/?view=journeys&journey=${encodeURIComponent(journey.id)}&step=${index + 1}${ko ? '' : `&lang=${encodeURIComponent(locale)}`}">${escapeHtml(journeyName(journey))} · ${escapeHtml(`${localizedBookName(step.code || journey.code, locale)} ${step.chapter}:${step.verse}`)} ↗</a>`).join('')}</div>` : ''}</div></div>
    <p class="passage-evidence-caveat">${escapeHtml(m.caveat)}</p>`;
}

document.querySelector('#passage-evidence').addEventListener('click', (event) => {
  const place = event.target.closest('[data-evidence-place]');
  if (place) { selectPlace(place.dataset.evidencePlace, true); document.querySelector('.map-pane').scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' }); return; }
  const person = event.target.closest('[data-evidence-person]');
  if (person) {
    const id = person.dataset.evidencePerson;
    const matchingScene = currentEvidence?.scenes.find(({ journey }) => CURATED_JOURNEYS_BY_PERSON[id]?.includes(journey.id));
    const journey = matchingScene?.journey || JOURNEYS.find((item) => CURATED_JOURNEYS_BY_PERSON[id]?.includes(item.id));
    if (journey) {
      currentJourney = journey;
      journeyStepIndex = matchingScene?.index || 0;
    }
    switchView('journeys');
    if (journey) { updateJourneyAddress(); renderJourney(); fitJourneyMap(); }
    const address = new URL(location.href);
    address.searchParams.set('person', id);
    if (!journey) {
      address.searchParams.delete('journey');
      address.searchParams.delete('step');
      journeySection.classList.add('is-person-only');
    }
    history.replaceState(null, '', address);
  }
});

document.querySelector('#passage-context').addEventListener('click', (event) => {
  const button = event.target.closest('[data-context-place]');
  if (button) selectPlace(button.dataset.contextPlace);
});

function renderDiscovery(places, reference) {
  const spotlight = currentPassageContext
    ? places.find((place) => place.id === currentPassageContext.scenePlaceId)
    : spotlightPlace(places);
  spotlightPlaceId = spotlight?.id || null;
  const hint = document.querySelector('#example-hint');
  const intro = document.querySelector('#visual-intro-copy');
  const strip = document.querySelector('#insight-strip');
  const guide = document.querySelector('#map-guide');
  if (!spotlight) {
    hint.hidden = true;
    intro.textContent = translate('previewIntro');
    strip.hidden = true;
    guide.hidden = true;
    return;
  }
  const name = displayName(spotlight);
  hint.hidden = false;
  hint.textContent = `${spotlight.candidateCount > 1 ? translate('exampleHint', { name, count: spotlight.candidateCount }) : translate('examplePlain')} ↗`;
  intro.textContent = spotlight.candidateCount > 1
    ? translate('heroCandidateHint', { name, count: spotlight.candidateCount })
    : translate('previewIntro');
  const options = [...places].filter((place) => place.coordinate)
    .sort((a, b) => passagePriority(a) - passagePriority(b) || b.candidateCount - a.candidateCount || firstMention(a) - firstMention(b))
    .slice(0, 3);
  strip.hidden = false;
  strip.innerHTML = `<div class="insight-copy"><span>${escapeHtml(translate('insightTitle'))}</span><strong>${escapeHtml(formatReference(reference, locale))}</strong><small>${escapeHtml(translate('insightHint'))}</small></div>
    <div class="insight-actions">${options.map((place) => {
      const role = passageRole(currentPassageContext, place);
      const subtitle = role ? passageContextCopy(locale)[role] : place.candidateCount > 1 ? translate('mapCandidates', { count: place.candidateCount }) : placeStatus(place);
      return `<button type="button" data-insight-place="${escapeHtml(place.id)}"><strong>${escapeHtml(displayName(place))}</strong><span>${escapeHtml(subtitle)}</span><i aria-hidden="true">↗</i></button>`;
    }).join('')}</div>`;
  guide.hidden = false;
  guide.innerHTML = `<strong>${escapeHtml(translate('mapGuide'))}</strong><div><span><i class="legend-place"></i>${escapeHtml(translate('legendPlace'))}</span>${places.some((place) => place.candidateCount > 1) ? `<span><i class="legend-candidate"></i>${escapeHtml(translate('legendCandidate'))}</span>` : ''}</div>`;
}

function renderMapSelection(place) {
  const panel = document.querySelector('#map-selection');
  const indexButton = document.querySelector('#selected-place-index');
  if (!place) {
    panel.hidden = true;
    panel.innerHTML = '';
    indexButton.hidden = true;
    indexButton.innerHTML = '';
    return;
  }
  const verse = [...place.references].sort((a, b) => a.chapter - b.chapter || a.verse - b.verse)[0];
  const candidate = place.candidates?.[selectedCandidateIndex] || place.candidates?.[0];
  const name = displayName(place);
  const candidateName = place.candidateCount > 1 ? candidate?.name || name : name;
  const role = passageRole(currentPassageContext, place);
  const contextCopy = role ? passageContextCopy(locale) : null;
  const eventLocation = currentEvidence?.eventPlaceIds.includes(place.id);
  const occurrenceCount = placeOccurrences.get(place.id)?.length || 0;
  indexButton.hidden = false;
  indexButton.innerHTML = `<span>${escapeHtml(translate('legendPlace'))}: <strong>${escapeHtml(name)}</strong></span><span>${escapeHtml(translate('wholeBible'))} <strong>${escapeHtml(versesLabel(occurrenceCount))}</strong> ↗</span>`;
  const position = currentPlaces.findIndex((item) => item.id === place.id) + 1;
  const photo = selectedCandidateIndex === 0 ? place.photo : null;
  panel.classList.toggle('no-photo', !photo);
  panel.classList.toggle('is-alternative', selectedCandidateIndex > 0);
  const photoMarkup = photo ? `<div class="map-selection-media"><img src="${escapeHtml(photo.url)}" alt="${escapeHtml(photo.alt)}" loading="lazy" decoding="async" referrerpolicy="no-referrer" /><a href="${escapeHtml(photo.sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(photo.credit)} · ${escapeHtml(photo.license)} ↗</a></div>` : '';
  panel.hidden = false;
  panel.innerHTML = `<div class="map-selection-content"><span class="map-selection-kicker">${escapeHtml(role ? contextCopy[role] : eventLocation ? evidenceMessage(locale).eventLocation : translate('legendPlace'))}: ${escapeHtml(name)} · ${String(position).padStart(2, '0')}</span><strong>${escapeHtml(candidateName)}</strong><span class="map-selection-verse">${escapeHtml(`${localizedBookName(currentReference.code, locale)} ${verse.chapter}:${verse.verse}`)}</span>
    ${role ? `<span class="map-selection-role">${escapeHtml(contextCopy[`${role}Detail`])}</span>` : ''}
    ${place.candidateCount > 1 ? `<span class="map-selection-candidate">${escapeHtml(selectedCandidateIndex ? translate('candidateRank', { rank: selectedCandidateIndex + 1 }) : translate('candidateOne'))} · ${escapeHtml(placeStatus(place))}</span>` : ''}
    <button class="map-selection-occurrences" type="button" data-map-occurrences="${escapeHtml(place.id)}">${escapeHtml(translate('wholeBible'))} <strong>${escapeHtml(versesLabel(occurrenceCount))}</strong> ↗</button>
    <div class="map-selection-actions">${place.candidateCount > 1 ? `<button type="button" data-map-compare="${escapeHtml(place.id)}">${escapeHtml(translate('compareNow', { count: place.candidateCount }))} ↗</button>` : ''}<a href="${bibleReadingUrl(currentReference.code, verse.chapter, verse.verse)}" target="_blank" rel="noopener noreferrer">${escapeHtml(translate('readBible'))} ↗</a></div></div>${photoMarkup}`;
}

function clearMarkers() {
  for (const marker of markers) marker.remove();
  markers = [];
  for (const marker of candidateMarkers) marker.remove();
  candidateMarkers = [];
}

function syncHeroTour() {
  // Automatic focus changes made an unrelated mention look like the scene.
  // Keep the animated previous/next controls, but let the reader choose each place.
  heroMotionToggle.hidden = true;
  heroFocus.classList.remove('is-playing');
}

function setHeroFocus(index) {
  if (!heroPlaces.length) return;
  heroActiveIndex = (index + heroPlaces.length) % heroPlaces.length;
  const place = heroPlaces[heroActiveIndex];
  const role = passageRole(currentPassageContext, place);
  const contextCopy = role ? passageContextCopy(locale) : null;
  document.querySelector('#visual-intro-copy').textContent = currentPassageContext
    ? (currentPassageContext.hasEgypt ? passageContextCopy(locale).summary : passageContextCopy(locale).shortSummary)
    : place.candidateCount > 1 ? translate('heroCandidateHint', { name: displayName(place), count: place.candidateCount })
      : translate('previewIntro');
  const verse = place.references[0];
  document.querySelector('#hero-focus-kicker').textContent = `${role ? contextCopy[role] : translate('focusPlace')} · ${String(heroActiveIndex + 1).padStart(2, '0')}`;
  document.querySelector('#hero-focus-name').textContent = displayName(place);
  document.querySelector('#hero-focus-detail').textContent = verse
    ? `${localizedBookName(currentReference.code, locale)} ${verse.chapter}:${verse.verse} · ${role ? contextCopy[`${role}Detail`] : placeStatus(place)}`
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
    if (currentPassageContext) heroMap.easeTo({ center: place.coordinate, zoom: 5.3, duration: reducedMotion.matches ? 0 : 650 });
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
  if (currentPassageContext) { setHeroFocus(heroActiveIndex); return; }
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
  heroReferenceLabel = reference.label;
  heroPlaces = places.filter((place) => place.coordinate).sort((a, b) =>
    passagePriority(a) - passagePriority(b) || firstMention(a) - firstMention(b) || displayName(a).localeCompare(displayName(b), 'ko'));
  heroActiveIndex = Math.max(0, heroPlaces.findIndex((place) => place.id === spotlightPlaceId));
  document.querySelector('#visual-title').textContent = formatReference(reference, locale);
  document.querySelector('#visual-place-count').textContent = heroPlaces.length
    ? translate('mappedCount', { count: heroPlaces.length }) : translate('noMapPoints');
  const hasSeveral = heroPlaces.length > 1;
  document.querySelector('#hero-prev').hidden = !hasSeveral;
  document.querySelector('#hero-next').hidden = !hasSeveral;
  heroFocus.classList.toggle('is-empty', !heroPlaces.length);
  if (!heroPlaces.length) {
    document.querySelector('#hero-focus-kicker').textContent = translate('searchedPassage');
    document.querySelector('#hero-focus-name').textContent = translate('noLinkedPlace');
    document.querySelector('#hero-focus-detail').textContent = translate('noLinkedDetail');
    document.querySelector('#hero-position').textContent = '—';
  } else {
    setHeroFocus(heroActiveIndex);
  }
  renderHeroMap();
  syncHeroTour();
}

document.querySelector('#hero-prev').addEventListener('click', () => {
  setHeroFocus(heroActiveIndex - 1);
  selectPlace(heroPlaces[heroActiveIndex].id, false);
  syncHeroTour();
});
document.querySelector('#hero-next').addEventListener('click', () => {
  setHeroFocus(heroActiveIndex + 1);
  selectPlace(heroPlaces[heroActiveIndex].id, false);
  syncHeroTour();
});

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
    el.dataset.placeId = place.id;
    el.innerHTML = `<span class="map-marker-number">${index + 1}</span><span class="map-marker-label">${escapeHtml(displayName(place))}</span>`;
    el.setAttribute('aria-label', translate('mapPin', { name: displayName(place) }));
    el.addEventListener('click', () => selectPlace(place.id));
    const marker = new maplibre.Marker({ element: el, anchor: 'bottom' }).setLngLat(place.coordinate).addTo(map);
    markers.push(marker);
    bounds.extend(place.coordinate);
  }
  const scene = currentPassageContext && mapped.find((place) => place.id === currentPassageContext.scenePlaceId);
  if (scene) { map.flyTo({ center: scene.coordinate, zoom: 6.3, essential: true }); return; }
  const eventPlace = currentEvidence?.eventPlaceIds.length === 1 && mapped.find((place) => place.id === currentEvidence.eventPlaceIds[0]);
  if (eventPlace) { map.flyTo({ center: eventPlace.coordinate, zoom: 6.3, essential: true }); return; }
  if (mapped.length === 1) map.flyTo({ center: mapped[0].coordinate, zoom: 6.3, essential: true });
  else map.fitBounds(bounds, { padding: 68, maxZoom: 6.3, duration: 850 });
}

function renderCandidateMarkers(place) {
  for (const marker of candidateMarkers) marker.remove();
  candidateMarkers = [];
  if (!map || !place?.candidates?.length) return;
  for (const [index, candidate] of place.candidates.entries()) {
    if (index === 0) continue; // The primary map pin already shows the first candidate.
    const element = document.createElement('button');
    element.type = 'button';
    element.className = 'candidate-marker';
    element.innerHTML = `<span>${index + 1}</span><span class="candidate-marker-label">${escapeHtml(candidate.name)}</span>`;
    element.setAttribute('aria-label', translate('candidateLocation', { name: displayName(place), rank: index + 1 }));
    element.classList.toggle('active', selectedCandidateIndex === index);
    element.addEventListener('click', () => selectCandidate(place.id, index, true));
    candidateMarkers.push(new maplibre.Marker({ element, anchor: 'center' }).setLngLat(candidate.coordinate).addTo(map));
  }
}

function selectPlace(id, center = true) {
  selectedPlaceId = id;
  selectedCandidateIndex = 0;
  for (const card of placeList.querySelectorAll('.place-card')) {
    const selected = card.dataset.placeId === id;
    card.classList.toggle('selected', selected);
    card.querySelector('.place-focus').setAttribute('aria-pressed', String(selected));
  }
  for (const button of placeList.querySelectorAll('[data-candidate]')) {
    const active = button.dataset.candidate === `${id}:0`;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  }
  const place = currentPlaces.find((item) => item.id === id);
  if (heroReferenceLabel === currentReference?.label) {
    const heroIndex = heroPlaces.findIndex((item) => item.id === id);
    if (heroIndex >= 0 && heroIndex !== heroActiveIndex) setHeroFocus(heroIndex);
  }
  for (const marker of markers) marker.getElement().classList.toggle('is-selected', marker.getElement().dataset.placeId === id);
  renderCandidateMarkers(place);
  renderMapSelection(place);
  const occurrenceCount = placeOccurrences.get(id)?.length || 0;
  if (occurrenceCount > 0 && occurrenceCount <= 20) openOccurrences(id);
  if (center) revealPlaceCard(id);
  if (center && place?.coordinate) map?.flyTo({ center: place.coordinate, zoom: Math.max(map.getZoom(), 6.3), essential: true });
}

function selectCandidate(placeId, index, fromMap = false) {
  const place = currentPlaces.find((item) => item.id === placeId);
  const candidate = place?.candidates?.[index];
  if (!candidate?.coordinate) return;
  if (selectedPlaceId !== placeId) selectPlace(placeId, false);
  selectedCandidateIndex = index;
  for (const button of placeList.querySelectorAll('[data-candidate]')) {
    button.classList.toggle('active', button.dataset.candidate === `${placeId}:${index}`);
    button.setAttribute('aria-pressed', String(button.dataset.candidate === `${placeId}:${index}`));
  }
  for (const [candidateIndex, marker] of candidateMarkers.entries()) {
    marker.getElement().classList.toggle('active', candidateIndex + 1 === index);
  }
  for (const marker of markers) marker.getElement().classList.toggle('is-selected', index === 0 && marker.getElement().dataset.placeId === placeId);
  renderMapSelection(place);
  if (fromMap) revealPlaceCard(placeId);
  map?.flyTo({ center: candidate.coordinate, zoom: Math.max(map.getZoom(), 8), essential: true });
  if (window.matchMedia('(max-width: 760px)').matches) {
    document.querySelector('.map-pane').scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
  }
}

function renderPlaces(places, reference) {
  currentPassageContext = passageContext(reference, places);
  currentEvidence = evidenceForReference(evidenceData, data, reference, JOURNEYS);
  places = [...places].sort((a, b) => passagePriority(a) - passagePriority(b)
    || firstMention(a) - firstMention(b) || displayName(a).localeCompare(displayName(b), 'ko'));
  currentPlaces = places;
  selectedPlaceId = null;
  selectedCandidateIndex = 0;
  const mappedCount = places.filter((place) => place.coordinate).length;
  const sameChapter = reference.chapter === reference.endChapter;
  const chapterReference = !places.length && sameChapter && reference.startVerse !== null
    ? parseReference(`${reference.short} ${reference.chapter}`) : null;
  const chapterPlaceCount = chapterReference ? findPlaces(data, chapterReference).length : 0;
  resultCount.textContent = translate('count', { count: places.length });
  resultDescription.textContent = places.length
    ? translate('resultsFound', { reference: formatReference(reference, locale), count: places.length, mapped: mappedCount })
    : translate('resultsNone', { reference: formatReference(reference, locale) });
  if (places.length && !currentPassageContext) resultDescription.textContent += ` ${passageContextCopy(locale).genericNote}`;
  placesCaption.textContent = translate('found', { count: places.length });
  mapCaption.textContent = mappedCount ? translate('shown', { count: mappedCount }) : translate('noPoint');
  mapEmpty.hidden = mappedCount > 0;
  renderPassageContext(places);
  renderPassageEvidence(places, reference);
  renderDiscovery(places, reference);
  printButton.disabled = !places.length;
  placeList.innerHTML = places.length ? places.map((place, index) => {
    const name = displayName(place);
    const role = passageRole(currentPassageContext, place);
    const english = name === place.name ? translate('sourceSpelling') : place.name;
    const refs = place.references.map(({ chapter, verse }) => readingLink(reference.code, chapter, verse, `${localizedBookName(reference.code, locale)} ${chapter}:${verse}`)).join('');
    const allReferenceCount = placeOccurrences.get(place.id)?.length || 0;
    const candidateMarkup = place.candidates?.length ? `<details class="place-candidates" data-candidate-place="${escapeHtml(place.id)}">
      <summary><span>${escapeHtml(translate('candidateTitle'))} <strong>${place.candidates.length}</strong></span><span class="occurrence-summary-action">${escapeHtml(translate('showAll'))} <i aria-hidden="true">⌄</i></span></summary>
      <div class="candidate-content"><p>${escapeHtml(translate('candidateIntro'))}</p><ol class="candidate-list">${place.candidates.map((candidate, candidateIndex) => `<li>
        <button type="button" data-candidate="${escapeHtml(place.id)}:${candidateIndex}" aria-pressed="false">
          <span class="candidate-rank">${escapeHtml(candidateIndex === 0 ? translate('candidateOne') : translate('candidateRank', { rank: candidateIndex + 1 }))}</span>
          <strong>${escapeHtml(candidate.name)}</strong>
          <small>${candidate.score !== null ? `${escapeHtml(translate('candidateScore', { score: candidate.score }))}` : ''}${candidate.votes ? ` · ${escapeHtml(translate('candidateVotes', { count: candidate.votes }))}` : ''}</small>
          <span class="candidate-action">${escapeHtml(translate('candidateMap'))} ↗</span>
        </button></li>`).join('')}</ol>
        <p class="candidate-help">${escapeHtml(translate('candidateScoreHelp'))}</p><a href="${escapeHtml(place.sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(translate('sourceRecord'))} ↗</a>
      </div></details>` : '';
    const photo = place.photo;
    const photoMarkup = photo ? `<div class="place-photo">
      <img src="${escapeHtml(photo.url)}" alt="${escapeHtml(photo.alt)}" loading="lazy" decoding="async" referrerpolicy="no-referrer" />
      <div class="place-photo-copy"><span>${escapeHtml(translate('currentPhoto'))}${place.candidateCount > 1 ? ` · ${escapeHtml(translate('candidatePhoto'))}` : ''}</span><p>${escapeHtml(photo.alt)}</p><small>${escapeHtml(translate('photoCredit'))}: ${escapeHtml(photo.credit)}${photo.edited ? ` · ${escapeHtml(translate('previewEdited'))}` : ''}</small><div class="photo-links"><a href="${escapeHtml(photo.sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(translate('photoOriginal'))} ↗</a><a href="${escapeHtml(photo.licenseUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(photo.license)} ↗</a></div></div>
    </div>` : '';
    return `<article class="place-card" data-place-id="${escapeHtml(place.id)}">
      <button class="place-focus" type="button" aria-pressed="false" data-focus="${escapeHtml(place.id)}">
        <span class="place-number">${String(index + 1).padStart(2, '0')}</span>
        <span class="place-main"><strong>${escapeHtml(name)}</strong><small>${escapeHtml(english)}</small>${role ? `<em class="place-role place-role--${role}">${escapeHtml(passageContextCopy(locale)[role])}</em>` : currentEvidence?.eventPlaceIds.includes(place.id) ? `<em class="place-role place-role--scene">${escapeHtml(evidenceMessage(locale).eventLocation)}</em>` : ''}${currentEvidence?.confirmedPlaces.some((item) => item.id === place.id) ? `<em class="place-role">${escapeHtml(evidenceMessage(locale).both)}</em>` : ''}</span>
        <span class="place-arrow" aria-hidden="true">↗</span>
      </button>
      <div class="place-meta"><span>${escapeHtml(translate(TYPE_LABELS[place.type] || 'genericPlace'))}</span><span class="meta-dot"></span><span>${escapeHtml(placeStatus(place))}</span></div>
      <div class="verse-list" aria-label="${escapeHtml(translate('currentVerses'))}">${refs}</div>
      <details class="place-occurrences" data-occurrence-place="${escapeHtml(place.id)}"><summary><span>${escapeHtml(translate('wholeBible'))} <strong>${escapeHtml(versesLabel(allReferenceCount))}</strong></span><span class="occurrence-summary-action">${escapeHtml(translate('showAll'))} <i aria-hidden="true">⌄</i></span></summary><div class="occurrence-content"></div></details>
      ${candidateMarkup}
      ${photoMarkup}
      <a class="source-link" href="${escapeHtml(place.sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(translate('sourceEvidence'))} <span aria-hidden="true">↗</span></a>
    </article>`;
  }).join('') : `<div class="empty-state"><span class="empty-symbol">○</span><strong>${escapeHtml(translate('emptyTitle'))}</strong><p>${escapeHtml(translate('emptyDesc'))}</p>${chapterPlaceCount ? `<p>${escapeHtml(translate('chapterPlaces', { count: chapterPlaceCount }))}</p><button class="chapter-button" type="button" data-chapter="${escapeHtml(chapterReference.label)}">${escapeHtml(translate('chapterButton', { reference: formatReference(chapterReference, locale) }))} ↗</button>` : ''}</div>`;
  updateMap(places);
  if (spotlightPlaceId) {
    selectPlace(spotlightPlaceId, false);
    const card = [...placeList.querySelectorAll('.place-card')].find((item) => item.dataset.placeId === spotlightPlaceId);
    if (card && placeList.scrollHeight > placeList.clientHeight) {
      placeList.scrollTop = card.getBoundingClientRect().top - placeList.getBoundingClientRect().top + placeList.scrollTop - 10;
    }
  }
  else renderMapSelection(null);
  renderHeroPreview(places, reference);
}

placeList.addEventListener('click', (event) => {
  const candidateButton = event.target.closest('button[data-candidate]');
  if (candidateButton) {
    const separator = candidateButton.dataset.candidate.lastIndexOf(':');
    selectCandidate(candidateButton.dataset.candidate.slice(0, separator), Number(candidateButton.dataset.candidate.slice(separator + 1)));
    return;
  }
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
  if (details instanceof HTMLDetailsElement && details.open && details.matches('[data-candidate-place]')) {
    if (selectedPlaceId !== details.dataset.candidatePlace) selectPlace(details.dataset.candidatePlace, false);
    return;
  }
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
      ? saved.map(({ reference }) => `<button type="button" data-note-ref="${escapeHtml(reference)}"${currentReference?.label === reference ? ' class="active"' : ''}>${escapeHtml(formatReference(parseReference(reference), locale) || reference)}</button>`).join('')
      : `<span>${escapeHtml(translate('noNotes'))}</span>`;
    backupNotesButton.disabled = saved.length === 0;
    downloadNoteButton.disabled = !currentReference || !note.value.trim();
  } catch {
    savedNoteList.textContent = translate('storageUnavailable');
    backupNotesButton.disabled = true;
    downloadNoteButton.disabled = !currentReference || !note.value.trim();
    setNoteStatus(translate('noteBlocked'), true);
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
  if (reference.error) return showError(translate(reference.errorKey || 'badFormat'));
  if (!data) return showError(translate('loadingTry'));
  currentReference = reference;
  renderPlaces(findPlaces(data, reference), reference);
  try {
    note.value = localStorage.getItem(`${NOTE_PREFIX}${reference.label}`) || '';
    setNoteStatus(translate(note.value ? 'noteRestored' : 'noteNew'));
  } catch {
    note.value = '';
    setNoteStatus(translate('noteBlocked'), true);
  }
  renderSavedNotes();
  const url = new URL(location.href);
  if (currentView !== 'journeys' || location.hash) url.hash = encodeURIComponent(input.value.trim());
  history.replaceState(null, '', url);
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
    setNoteStatus(translate(note.value.trim() ? 'noteSaved' : 'noteDeleted'));
  } catch {
    setNoteStatus(translate('noteSpace'), true);
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
  const content = `# ${translate('noteTitle')}\n\n${translate('reference')}: ${formatReference(currentReference, locale)}\n${new Date().toISOString()}\n\n${note.value.trimEnd()}\n`;
  downloadText(`sermon-note-${part}.md`, content, 'text/markdown;charset=utf-8');
  setNoteStatus(translate('noteDownloaded'));
});

backupNotesButton.addEventListener('click', () => {
  try {
    const backup = createBackup(listNotes(localStorage));
    downloadText(`sermon-notes-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(backup, null, 2), 'application/json;charset=utf-8');
    setNoteStatus(translate('backupSaved', { count: Object.keys(backup.notes).length }));
  } catch {
    setNoteStatus(translate('backupFailed'), true);
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
    setNoteStatus(translate('imported', { count: imported, skipped }));
  } catch (cause) {
    setNoteStatus(locale === 'ko' && cause instanceof Error ? cause.message : translate('importFailed'), true);
  } finally {
    importNotesInput.value = '';
  }
});
importTrigger.addEventListener('click', () => importNotesInput.click());
printButton.addEventListener('click', () => window.print());

function journeyLineData() {
  const features = [];
  if (currentJourney.linePolicy === 'none') return { type: 'FeatureCollection', features };
  let segment = [];
  const flush = () => {
    if (segment.length > 1) features.push({ type: 'Feature', geometry: { type: 'LineString', coordinates: segment }, properties: {} });
    segment = [];
  };
  for (const step of currentJourney.steps) {
    const place = journeyPlace(step);
    if (step.breakBefore) flush();
    if (step.broad || !place?.coordinate) { flush(); continue; }
    segment.push(place.coordinate);
  }
  flush();
  return { type: 'FeatureCollection', features };
}

function fitJourneyMap(instant = false) {
  if (!journeyMapReady) return;
  const coordinates = currentJourney.steps.map(journeyPlace).map((place) => place?.coordinate).filter(Boolean);
  if (!coordinates.length) return;
  const bounds = coordinates.reduce((box, coordinate) => box.extend(coordinate), new maplibre.LngLatBounds(coordinates[0], coordinates[0]));
  journeyMap.fitBounds(bounds, { padding: window.innerWidth < 760 ? 62 : 75, maxZoom: 7, duration: instant || reducedMotion.matches ? 0 : 650 });
}

window.addEventListener('resize', () => {
  if (!journeyMapReady) return;
  journeyMap.resize();
  fitJourneyMap(true);
});

function updateJourneyMap(fit = false) {
  if (!journeyMapReady) return;
  journeyMap.getSource('journey-route')?.setData(journeyLineData());
  for (const marker of journeyMarkers) marker.remove();
  journeyMarkers = [];
  const groups = new Map();
  currentJourney.steps.forEach((step, index) => {
    const group = groups.get(step.placeId) || [];
    group.push(index);
    groups.set(step.placeId, group);
  });
  for (const [placeId, indices] of groups) {
    const place = data.places.find((item) => item.id === placeId);
    if (!place?.coordinate) continue;
    const element = document.createElement('button');
    element.type = 'button';
    element.className = 'journey-marker';
    element.classList.toggle('active', indices.includes(journeyStepIndex));
    element.classList.toggle('broad', currentJourney.steps[indices[0]].broad === true);
    element.textContent = indices.map((index) => index + 1).join('·');
    element.setAttribute('aria-label', `${displayName(place)} · ${indices.map((index) => index + 1).join(', ')}`);
    element.addEventListener('click', () => selectJourneyStep(indices.find((index) => index > journeyStepIndex) ?? indices[0]));
    journeyMarkers.push(new maplibre.Marker({ element, anchor: 'bottom' }).setLngLat(place.coordinate).addTo(journeyMap));
  }
  if (fit) fitJourneyMap();
  else {
    const coordinate = journeyPlace(currentJourney.steps[journeyStepIndex])?.coordinate;
    if (coordinate) {
      const view = { center: coordinate, zoom: Math.max(journeyMap.getZoom(), 5.7) };
      if (reducedMotion.matches) journeyMap.jumpTo(view);
      else journeyMap.flyTo({ ...view, speed: 1.2, essential: true });
    }
  }
}

function setupJourneyMap() {
  if (!journeyMapWanted || journeyMap || !maplibre || !data) return;
  try {
    journeyMap = new maplibre.Map({
      container: 'journey-map', style: 'https://tiles.openfreemap.org/styles/positron',
      center: [34, 34], zoom: 3.4, attributionControl: true,
    });
    journeyMap.addControl(new maplibre.NavigationControl({ showCompass: false }), 'top-right');
    journeyMap.on('load', () => {
      journeyMap.addSource('journey-route', { type: 'geojson', data: journeyLineData() });
      journeyMap.addLayer({ id: 'journey-route-line', type: 'line', source: 'journey-route', paint: { 'line-color': '#644ca7', 'line-width': 3, 'line-opacity': .75, 'line-dasharray': [2, 2] } });
      journeyMapReady = true;
      document.querySelector('#journey-map-loading').hidden = true;
      updateJourneyMap(true);
    });
    journeyMap.on('error', () => {
      if (!journeyMapReady) {
        journeyMapFailed = true;
        document.querySelector('#journey-map-loading').textContent = journeyMessage(locale, 'mapFailed');
      }
    });
  } catch {
    journeyMapFailed = true;
    document.querySelector('#journey-map-loading').textContent = journeyMessage(locale, 'mapFailed');
  }
}

if ('IntersectionObserver' in window) {
  const journeyObserver = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    journeyMapWanted = true;
    setupJourneyMap();
    journeyObserver.disconnect();
  }, { rootMargin: '350px' });
  journeyObserver.observe(journeySection);
} else journeyMapWanted = true;

async function loadMap() {
  try {
    const vendorModule = `/public/vendor/${'maplibre-gl.mjs'}`;
    maplibre = await import(/* @vite-ignore */ vendorModule);
    maplibre.setWorkerUrl('/public/vendor/maplibre-gl-worker.mjs');
    personExplorer.onShow();
    map = new maplibre.Map({
      container: 'map',
      style: 'https://tiles.openfreemap.org/styles/positron',
      center: [34, 32],
      zoom: 3.4,
      attributionControl: true,
      preserveDrawingBuffer: true,
    });
    map.addControl(new maplibre.NavigationControl({ showCompass: false }), 'top-right');
    map.on('error', () => { document.querySelector('.map-footnote').textContent = translate('mapBgError'); });
    map.on('load', () => {
      updateMap(currentPlaces);
      if (selectedPlaceId) selectPlace(selectedPlaceId, false);
    });
    setupHeroMap();
    setupJourneyMap();
  } catch {
    document.querySelector('#map').classList.add('map-unavailable');
    document.querySelector('#map').textContent = translate('mapUnavailable');
    heroFallback.textContent = translate('heroUnavailable');
    journeyMapFailed = true;
    document.querySelector('#journey-map-loading').textContent = journeyMessage(locale, 'mapFailed');
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
    if (!heroMapReady) heroFallback.textContent = translate('heroUnavailable');
  });
}

async function loadData() {
  try {
    const [response, evidenceResult] = await Promise.all([
      fetch(DATA_URL),
      fetch(EVIDENCE_URL).then(async (result) => {
        if (!result.ok) throw new Error(`Evidence HTTP ${result.status}`);
        const payload = await result.json();
        if (payload.audit?.verses !== 31102 || payload.audit?.people !== 3067 || !payload.index) throw new Error('Incomplete evidence index');
        return payload;
      }).catch(() => null),
    ]);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    data = await response.json();
    if (!Array.isArray(data.places) || !data.index) throw new Error('자료 형식 오류');
    evidenceData = evidenceResult?.placeSourceCommit === data.sourceCommit ? evidenceResult : null;
    personExplorer.render();
    renderSourceVersion();
    placeOccurrences = collectPlaceOccurrences(data);
    setupHeroMap();
    renderJourney();
    setupJourneyMap();
    if (location.hash.length > 1) {
      try { input.value = decodeURIComponent(location.hash.slice(1)); } catch { /* default example stays */ }
    }
    search();
    applyView();
  } catch {
    resultDescription.textContent = translate('dataFailed');
    placeList.innerHTML = `<div class="empty-state">${escapeHtml(translate('dataFailedShort'))}</div>`;
    document.querySelector('#journey-current').textContent = translate('dataFailedShort');
  }
}

applyView();
loadMap();
loadData();
