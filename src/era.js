import { bibleReadingUrl, formatReference, parseReference } from './reference.js';
import { NOTE_PREFIX } from './notes.js';
import { ERA_STUDIES, matchEraStudy } from './era-data.js';

const search = document.querySelector('#era-search');
const input = document.querySelector('#era-reference');
const error = document.querySelector('#era-error');
const content = document.querySelector('#era-study-content');
let currentReference;
let currentMatch;
let activeStage = 0;

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
  return `<div class="era-scene-detail"><div class="era-scene-detail-head"><span>해당 성경 구간의 편집 요약</span><span>${escapeHtml(label)}</span></div>
    <h3>${escapeHtml(stage.title)}</h3><p>${escapeHtml(stage.summary)}</p>
    ${partial ? '<small class="era-partial-note">선택한 절이 이 장면의 일부입니다. 설명은 표시된 장면 전체 범위에 대한 요약입니다.</small>' : ''}
    <div class="era-scene-actions">${bibleLink(study.code, study.chapter, stage.start, '대한성서공회에서 본문 읽기')}<a href="${placesUrl(currentReference)}">01 본문의 장소에서 보기 ↗</a></div>
  </div>`;
}

function renderCurated(match) {
  const { study, stages, isPartial } = match;
  activeStage = Math.min(activeStage, stages.length - 1);
  const stage = stages[activeStage];
  const heading = formatReference(currentReference);
  document.querySelector('#era-workspace-subtitle').textContent = `${heading} · 검수된 장면 ${stages.length}개`;
  content.innerHTML = `<div class="era-study-heading"><div><span class="era-study-ref">${escapeHtml(heading)}</span><h3>${escapeHtml(study.title)}</h3><p>이 화면의 순서는 본문에 적힌 순서입니다. 책의 집필 시점이나 확정 연대를 뜻하지 않습니다.</p></div><span class="era-reviewed">본문 장면 검수</span></div>
    <div class="era-study-grid"><div class="era-story-column">
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
      ${memoMarkup()}
    </aside></div>`;
  renderMemo();
}

function renderUnreviewed() {
  const heading = formatReference(currentReference);
  document.querySelector('#era-workspace-subtitle').textContent = `${heading} · 검수된 시대 카드 없음`;
  content.innerHTML = `<div class="era-study-heading"><div><span class="era-study-ref">${escapeHtml(heading)}</span><h3>이 본문은 아직 시대 자료를 검수하지 않았습니다.</h3><p>연대나 역사 배경을 추측해서 채우지 않았습니다. 본문을 읽고 메모는 계속 남길 수 있습니다.</p></div><span class="era-pending">검수 대기</span></div>
    <div class="era-study-grid"><div class="era-story-column"><section class="era-flow-card era-empty-card"><span class="era-card-top">START WITH THE TEXT</span><h3>먼저 본문을 읽어 보세요.</h3><p>검수한 본문을 선택하면 장면의 순서와 시대 설명, 주의할 점이 함께 나타납니다.</p><div class="era-scene-actions">${bibleLink(currentReference.code, currentReference.chapter, currentReference.startVerse || 1, '대한성서공회에서 본문 읽기')}<a href="${placesUrl(currentReference)}">01 본문의 장소에서 보기 ↗</a></div></section>
      <div class="era-suggestions"><strong>바로 살펴볼 수 있는 본문</strong><div>${ERA_STUDIES.map((study) => `<button type="button" data-example="${escapeHtml(study.example)}">${escapeHtml(study.example)}</button>`).join('')}</div></div></div><aside class="era-context-column">${memoMarkup()}</aside></div>`;
  renderMemo();
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
    stage.focus();
    return;
  }
  const action = event.target.closest('[data-era-action]');
  if (!action || !currentReference) return;
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
const initialReference = new URLSearchParams(location.search).get('ref') || '출애굽기 3';
if (!openReference(initialReference, false)) {
  const reason = error.textContent;
  openReference('출애굽기 3', false);
  error.textContent = `${reason} 기본 본문인 출애굽기 3장을 표시합니다.`;
  error.hidden = false;
}
