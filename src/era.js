import { bibleReadingUrl, formatReference, parseReference } from './reference.js';
import { NOTE_PREFIX } from './notes.js';
import { ERA_STUDIES, matchEraStudy, relatedEraStudies, sceneReferenceForSelection } from './era-data.js';
import { loadPublicBibleBook, publicBibleChapterUrl, selectedPublicBibleRows } from './era-text.js';

const search = document.querySelector('#era-search');
const input = document.querySelector('#era-reference');
const error = document.querySelector('#era-error');
const content = document.querySelector('#era-study-content');
let currentReference;
let currentMatch;
let activeStage = 0;
let readerMode = 'stage';
let readerLimit = 40;
let readerRequest = 0;

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);

function bibleLink(code, chapter, verse, label) {
  return `<a href="${bibleReadingUrl(code, chapter, verse)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)} ↗</a>`;
}

function placesUrl(reference) {
  const params = new URLSearchParams();
  const language = new URLSearchParams(location.search).get('lang');
  if (language) params.set('lang', language);
  return `/${params.size ? `?${params}` : ''}#${encodeURIComponent(formatReference(reference))}`;
}

function renderMemo() {
  const textarea = document.querySelector('#era-memo');
  if (!textarea || !currentReference) return;
  try {
    textarea.value = localStorage.getItem(`${NOTE_PREFIX}${currentReference.label}`) || '';
    document.querySelector('#era-memo-status').textContent = textarea.value
      ? '저장된 메모를 불러왔습니다.' : '입력하면 이 브라우저에 바로 저장됩니다.';
  } catch {
    document.querySelector('#era-memo-status').textContent = '브라우저 저장을 사용할 수 없습니다. 메모를 복사하거나 내보내세요.';
  }
}

function memoMarkup() {
  return `<section class="era-note-card" aria-labelledby="era-note-title">
    <div class="era-card-top"><span>RESEARCH NOTES</span><span>01 ↔ 02 연결</span></div>
    <h3 id="era-note-title">이 본문의 연구 메모</h3>
    <p>읽으면서 생긴 질문과 설교 관찰을 계속 적어 보세요. 01번 도구의 본문 전체 메모에서도 이어집니다.</p>
    <label class="sr-only" for="era-memo">본문 전체 연구 메모</label>
    <textarea id="era-memo" placeholder="본문이 놓인 시대를 생각하며 떠오른 질문을 적어 보세요."></textarea>
    <span id="era-memo-status" class="era-memo-status" role="status"></span>
    <div class="era-note-actions"><button type="button" data-era-action="copy">메모 복사</button><button type="button" data-era-action="download">MD 내보내기 ↓</button></div>
  </section>`;
}

function sceneMarkup(study, stage, partial) {
  const label = `${study.example.split(' ')[0]} ${study.chapter}:${stage.start}${stage.end === stage.start ? '' : `–${stage.end}`}`;
  const sceneReference = parseReference(sceneReferenceForSelection(currentReference, stage));
  const first = sceneReference.startVerse;
  return `<div class="era-scene-detail"><div class="era-scene-detail-head"><span>해당 성경 구간의 편집 요약</span><span>${escapeHtml(label)}</span></div>
    <h3>${escapeHtml(stage.title)}</h3><p>${escapeHtml(stage.summary)}</p>
    ${partial ? '<small class="era-partial-note">선택한 절이 이 장면의 일부입니다. 설명은 표시된 장면 전체 범위에 대한 요약입니다.</small>' : ''}
    <div class="era-scene-actions"><a href="#era-reader-title">이 장면 본문 읽기 ↑</a>${bibleLink(study.code, study.chapter, first, '개역개정으로 읽기')}<a href="${placesUrl(sceneReference)}">01 이 장면의 지명 보기 ↗</a></div>
  </div>`;
}

function readerMarkup(curated) {
  return `<section class="era-reader-card" aria-labelledby="era-reader-title">
    <div class="era-card-top"><span>READ THE PASSAGE</span><span>성경 번역과 편집 요약 분리</span></div>
    <div class="era-reader-head"><div><h3 id="era-reader-title">성경 본문 바로 읽기</h3><p>공개 한국어 성경 1910년 판본입니다. 옛 표현이 있으므로 설교에 인용할 때는 개역개정을 함께 확인하세요.</p></div><span class="era-reader-edition">공개 본문</span></div>
    ${curated ? `<div class="era-reader-modes" role="group" aria-label="본문 읽기 범위"><button type="button" data-era-action="reader-stage" aria-pressed="${readerMode === 'stage'}">선택한 장면</button><button type="button" data-era-action="reader-passage" aria-pressed="${readerMode === 'passage'}">검색한 본문 전체</button></div>` : ''}
    <div id="era-reader-text" class="era-reader-text" aria-live="polite">본문을 불러오는 중입니다.</div>
    <div id="era-reader-pagination" class="era-reader-pagination"></div>
    <div class="era-reader-credit"><a href="https://ebible.org/find/details.php?id=kor" target="_blank" rel="noopener noreferrer">번역 출처와 이용 조건 ↗</a><a href="${bibleReadingUrl(currentReference.code, currentReference.chapter, currentReference.startVerse || 1)}" target="_blank" rel="noopener noreferrer">개역개정과 대조 ↗</a></div>
  </section>`;
}

function sourcesMarkup(study) {
  const chapter = currentReference.chapter;
  const chapterCount = currentReference.endChapter - chapter + 1;
  const linkedChapters = chapterCount <= 6
    ? Array.from({ length: chapterCount }, (_, index) => chapter + index)
    : [chapter, currentReference.endChapter];
  const hasAbsentChapter = linkedChapters.some((number) => !publicBibleChapterUrl(currentReference.code, number));
  const sourceLinks = linkedChapters.map((number) => {
    const url = publicBibleChapterUrl(currentReference.code, number);
    return url
      ? `<a href="${url}" target="_blank" rel="noopener noreferrer">eBible 한국어 성경 1910 · ${escapeHtml(currentReference.name)} ${number}장 ↗</a>`
      : `<span class="era-source-absent">${escapeHtml(currentReference.name)} ${number}장 · 원자료 장 페이지 없음</span>`;
  }).join('');
  const sourceNote = hasAbsentChapter
    ? '표시된 원자료 누락 장은 장별 페이지가 없으므로 개역개정에서 읽어 주세요.'
    : chapterCount > 6
      ? `검색한 ${chapterCount}장 중 첫 장과 마지막 장을 연결했습니다. 나머지는 판본 안내에서 확인하세요.`
      : '화면의 절별 본문 출처 · 공개 저작물 표기';
  return `<section class="era-sources-card" aria-labelledby="era-sources-title"><div class="era-card-top"><span>SOURCES</span><span>본문별 확인</span></div><h3 id="era-sources-title">직접 대조할 자료</h3>
    <ol><li><strong>공개 한국어 본문</strong>${sourceLinks}<small>${sourceNote}</small><a href="https://ebible.org/find/details.php?id=kor" target="_blank" rel="noopener noreferrer">판본·이용 조건 확인 ↗</a></li>
    <li><strong>현재 한국어 번역</strong>${bibleLink(currentReference.code, chapter, currentReference.startVerse || 1, '대한성서공회 개역개정 읽기')}<small>번역 비교용 외부 링크 · 본문을 복제하지 않음</small></li>
    ${study?.furtherReading ? `<li><strong>배경 참고 · 영문</strong><a href="${escapeHtml(study.furtherReading.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(study.furtherReading.label)} ↗</a><small>외부 자료 · 표제에 적힌 본문 범위를 확인하세요 · 설명을 그대로 옮기지 않음</small></li>` : ''}</ol>
    <p>장면 구분과 한국어 설명은 성경 장절을 읽고 이 도구에서 편집했습니다. 외부 자료의 해석과 동일하다는 뜻은 아닙니다.</p>
  </section>`;
}

async function renderReader() {
  const target = document.querySelector('#era-reader-text');
  if (!target || !currentReference) return;
  const request = ++readerRequest;
  const reference = currentReference;
  const stage = currentMatch && readerMode === 'stage' ? currentMatch.stages[activeStage] : null;
  const pagination = document.querySelector('#era-reader-pagination');
  target.textContent = '성경 본문을 불러오는 중입니다.';
  pagination.innerHTML = '';
  try {
    const book = await loadPublicBibleBook(reference.code);
    if (request !== readerRequest) return;
    const rows = selectedPublicBibleRows(book, reference, stage);
    const missing = rows.filter((row) => !row.text).length;
    if (missing === rows.length) {
      target.innerHTML = `<p class="era-reader-warning">이 공개 판본에는 요청한 ${rows.length}절의 본문이 모두 없습니다. <a href="${bibleReadingUrl(reference.code, rows[0].chapter, rows[0].verse)}" target="_blank" rel="noopener noreferrer">대한성서공회 개역개정에서 읽기 ↗</a></p>`;
      pagination.textContent = `${rows.length}절 모두 원자료 없음`;
      return;
    }
    const visible = rows.slice(0, readerLimit);
    target.innerHTML = `${missing ? `<p class="era-reader-warning">이 공개 판본의 요청 범위에서 ${missing}절이 누락되어 있습니다. 빠진 절은 개역개정 링크에서 확인하세요.</p>` : ''}
      <div class="era-reader-rows">${visible.map(({ chapter, verse, text: verseText }) => `<p class="${verseText ? '' : 'era-reader-missing'}"><a href="${bibleReadingUrl(reference.code, chapter, verse)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(`${reference.name} ${chapter}장 ${verse}절 개역개정에서 읽기`)}">${chapter}:${verse}</a><span>${verseText ? escapeHtml(verseText) : '이 공개 판본에 본문이 없습니다. 장절을 눌러 개역개정을 확인하세요.'}</span></p>`).join('')}</div>`;
    pagination.innerHTML = rows.length > readerLimit
      ? `<span>${readerLimit} / ${rows.length}절 표시</span><button type="button" data-era-action="reader-more">다음 절 더 읽기 ↓</button>`
      : `<span>${rows.length}절 표시${missing ? ` · 원자료 누락 ${missing}절` : ''}</span>`;
  } catch {
    if (request !== readerRequest) return;
    target.innerHTML = `<p class="era-reader-warning">공개 본문을 불러오지 못했습니다. 아래 원본 또는 개역개정 링크에서 읽어 주세요.</p>`;
  }
}

function renderCurated(match) {
  const { study, stages, isPartial } = match;
  activeStage = Math.min(activeStage, stages.length - 1);
  const stage = stages[activeStage];
  const heading = formatReference(currentReference);
  document.querySelector('#era-workspace-subtitle').textContent = `${heading} · 검수된 장면 ${stages.length}개`;
  content.innerHTML = `<div class="era-study-heading"><div><span class="era-study-ref">${escapeHtml(heading)}</span><h3>${escapeHtml(study.title)}</h3><p>이 화면의 순서는 본문에 적힌 순서입니다. 책의 집필 시점이나 확정 연대를 뜻하지 않습니다.</p></div><span class="era-reviewed">본문 장면 검수</span></div>
    <div class="era-study-grid"><div class="era-story-column">
      ${readerMarkup(true)}
      <section class="era-flow-card" aria-labelledby="era-flow-title"><div class="era-card-top"><span>PASSAGE FLOW</span><span>${stages.length} SCENES</span></div><h3 id="era-flow-title">이 장면들을 따라 읽으세요.</h3>
        ${isPartial ? `<p class="era-scope-note">입력한 ${escapeHtml(heading)}와 만나는 장면만 표시합니다. 장면 설명은 각 카드에 적힌 전체 절 범위를 다룹니다.</p>` : ''}
        <div class="era-stage-list" role="tablist" aria-label="본문의 장면">${stages.map((item, index) => `<button id="era-tab-${index}" type="button" role="tab" data-stage="${index}" tabindex="${index === activeStage ? 0 : -1}" aria-selected="${index === activeStage}" aria-controls="era-active-scene"><span>${String(index + 1).padStart(2, '0')}</span><strong>${escapeHtml(item.title)}</strong><small>${study.chapter}:${item.start}–${item.end}</small></button>`).join('')}</div>
        <div id="era-active-scene" role="tabpanel" aria-labelledby="era-tab-${activeStage}">${sceneMarkup(study, stage, isPartial && (currentReference.startVerse > stage.start || currentReference.endVerse < stage.end))}</div>
      </section>
      <div class="era-neighbors"><div><span>앞 이야기</span>${bibleLink(study.before.code, study.before.chapter, study.before.verse, study.before.label)}</div><div><span>다음 이야기</span>${bibleLink(study.after.code, study.after.chapter, study.after.verse, study.after.label)}</div></div>
    </div><aside class="era-context-column">
      <section class="era-period-card"><div class="era-card-top"><span>TIME CONTEXT</span><span>02 / 시대</span></div><span class="era-period-label">이야기가 놓인 큰 흐름</span><h3>${escapeHtml(study.period)}</h3><p>${escapeHtml(study.setting)}</p></section>
      <section class="era-evidence-card"><span class="era-context-index">01 · 본문을 따라 읽는 관찰</span><p>${escapeHtml(study.background)}</p>${bibleLink(study.code, study.chapter, 1, `${study.example.split(' ')[0]} ${study.chapter}장 읽기`)}
        <div class="era-caution"><strong>02 · 해석할 때 주의</strong><p>${escapeHtml(study.caution)}</p>${study.external ? `<a href="${escapeHtml(study.external.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(study.external.label)} ↗</a>` : ''}</div></section>
      <section class="era-question-card"><span>설교를 위한 관찰 질문</span><strong>${escapeHtml(study.question)}</strong></section>
      ${sourcesMarkup(study)}
      ${memoMarkup()}
    </aside></div>`;
  renderMemo();
  renderReader();
}

function renderUnreviewed() {
  const heading = formatReference(currentReference);
  const related = relatedEraStudies(currentReference);
  const hasRelated = related.length > 0;
  document.querySelector('#era-workspace-subtitle').textContent = `${heading} · ${hasRelated ? `검수된 장 ${related.length}개 포함` : '검수된 시대 카드 없음'}`;
  const relatedMarkup = hasRelated ? `<div class="era-suggestions era-related-studies"><strong>이 범위에 포함된 검수 장면</strong><p>검수된 장을 따로 열면 장면별 설명을 읽을 수 있습니다.</p><div>${related.map(({ study, reference }) => `<button type="button" data-example="${escapeHtml(reference)}">${escapeHtml(formatReference(parseReference(reference)))} · ${escapeHtml(study.title)}</button>`).join('')}</div></div>` : '';
  content.innerHTML = `<div class="era-study-heading"><div><span class="era-study-ref">${escapeHtml(heading)}</span><h3>${hasRelated ? '이 검색 범위 전체를 검수한 시대 자료는 없습니다.' : '이 본문은 아직 시대 자료를 검수하지 않았습니다.'}</h3><p>${hasRelated ? '아래 검수된 장을 따로 열어 장면별 설명을 확인하세요. 검색한 범위의 본문과 메모는 계속 사용할 수 있습니다.' : '연대나 역사 배경을 추측해서 채우지 않았습니다. 본문을 읽고 메모는 계속 남길 수 있습니다.'}</p></div><span class="era-pending">${hasRelated ? '일부 장 검수' : '검수 대기'}</span></div>
    <div class="era-study-grid"><div class="era-story-column">${readerMarkup(false)}
      ${relatedMarkup}
      <div class="era-suggestions"><strong>시대 설명을 볼 수 있는 검수 본문</strong><div>${ERA_STUDIES.map((study) => `<button type="button" data-example="${escapeHtml(study.example)}">${escapeHtml(study.example)}</button>`).join('')}</div></div></div><aside class="era-context-column">${sourcesMarkup(null)}${memoMarkup()}</aside></div>`;
  renderMemo();
  renderReader();
}

function render() {
  if (!currentReference) return;
  document.querySelector('#era-open-places').href = placesUrl(currentReference);
  currentMatch = matchEraStudy(currentReference);
  document.querySelector('#era-overview').innerHTML = ERA_STUDIES.map((study, index) =>
    `<li><button type="button" data-example="${escapeHtml(study.example)}"${currentMatch?.study.id === study.id ? ' aria-current="true"' : ''}><span>${String(index + 1).padStart(2, '0')}</span><strong>${escapeHtml(study.period)}</strong><small>${escapeHtml(study.example)}</small></button></li>`).join('');
  if (currentMatch) renderCurated(currentMatch);
  else renderUnreviewed();
}

function openReference(value, updateHistory = true) {
  const parsed = parseReference(value);
  if (parsed.error) { error.textContent = parsed.error; error.hidden = false; return false; }
  error.hidden = true;
  currentReference = parsed;
  input.value = formatReference(parsed);
  activeStage = 0;
  readerMode = 'stage';
  readerLimit = 40;
  if (updateHistory) {
    const url = new URL(location.href);
    url.searchParams.set('ref', formatReference(parsed));
    history.pushState(null, '', url);
  }
  render();
  return true;
}

document.querySelector('#era-example-list').innerHTML = ERA_STUDIES.map((study) =>
  `<button type="button" data-example="${escapeHtml(study.example)}">${escapeHtml(study.example)}</button>`).join('');

search.addEventListener('submit', (event) => {
  event.preventDefault();
  if (openReference(input.value)) document.querySelector('#era-workspace').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

document.addEventListener('click', async (event) => {
  const example = event.target.closest('[data-example]');
  if (example) {
    if (openReference(example.dataset.example)) document.querySelector('#era-workspace').scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  const stage = event.target.closest('[data-stage]');
  if (stage && currentMatch) {
    activeStage = Number(stage.dataset.stage);
    for (const button of content.querySelectorAll('[data-stage]')) {
      const selected = Number(button.dataset.stage) === activeStage;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
    }
    const selected = currentMatch.stages[activeStage];
    const partial = currentMatch.isPartial
      && (currentReference.startVerse > selected.start || currentReference.endVerse < selected.end);
    document.querySelector('#era-active-scene').innerHTML = sceneMarkup(currentMatch.study, selected, partial);
    document.querySelector('#era-active-scene').setAttribute('aria-labelledby', `era-tab-${activeStage}`);
    readerLimit = 40;
    renderReader();
    stage.focus();
    return;
  }
  const action = event.target.closest('[data-era-action]');
  if (!action || !currentReference) return;
  if (action.dataset.eraAction === 'reader-stage' || action.dataset.eraAction === 'reader-passage') {
    readerMode = action.dataset.eraAction === 'reader-stage' ? 'stage' : 'passage';
    readerLimit = 40;
    for (const button of content.querySelectorAll('.era-reader-modes button')) {
      button.setAttribute('aria-pressed', String(button === action));
    }
    renderReader();
    return;
  }
  if (action.dataset.eraAction === 'reader-more') {
    readerLimit += 40;
    renderReader();
    return;
  }
  const value = document.querySelector('#era-memo').value;
  const status = document.querySelector('#era-memo-status');
  if (action.dataset.eraAction === 'copy') {
    try { await navigator.clipboard.writeText(value); status.textContent = '메모를 복사했습니다.'; }
    catch { status.textContent = '복사할 수 없습니다. 메모를 직접 선택해 복사해 주세요.'; }
  } else if (action.dataset.eraAction === 'download') {
    const markdown = `# ${formatReference(currentReference)} · 본문의 시대 연구 메모\n\n${value}\n`;
    const url = URL.createObjectURL(new Blob([markdown], { type: 'text/markdown;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `본문의-시대-${currentReference.label.replace(/[^\p{L}\p{N}-]+/gu, '-')}.md`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status.textContent = 'Markdown 파일을 내보냈습니다.';
  }
});

content.addEventListener('keydown', (event) => {
  const stage = event.target.closest('[data-stage]');
  if (!stage || !currentMatch || !['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  const count = currentMatch.stages.length;
  const index = Number(stage.dataset.stage);
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? count - 1
    : (index + (event.key === 'ArrowRight' ? 1 : -1) + count) % count;
  content.querySelectorAll('[data-stage]')[next].click();
});

content.addEventListener('input', (event) => {
  if (event.target.id !== 'era-memo' || !currentReference) return;
  const key = `${NOTE_PREFIX}${currentReference.label}`;
  try {
    if (event.target.value.trim()) localStorage.setItem(key, event.target.value);
    else localStorage.removeItem(key);
    document.querySelector('#era-memo-status').textContent = '이 브라우저에 저장했습니다.';
  } catch {
    document.querySelector('#era-memo-status').textContent = '저장할 수 없습니다. 메모를 복사하거나 내보내세요.';
  }
});

window.addEventListener('popstate', () => openReference(new URLSearchParams(location.search).get('ref') || '출애굽기 3', false));
const hasLinkedReference = new URLSearchParams(location.search).has('ref');
const initialReference = new URLSearchParams(location.search).get('ref') || '출애굽기 3';
if (!openReference(initialReference, false)) {
  const reason = error.textContent;
  openReference('출애굽기 3', false);
  error.textContent = `${reason} 기본 본문인 출애굽기 3장을 표시합니다.`;
  error.hidden = false;
}
if (hasLinkedReference && error.hidden) {
  requestAnimationFrame(() => document.querySelector('#era-workspace').scrollIntoView({ block: 'start' }));
}
