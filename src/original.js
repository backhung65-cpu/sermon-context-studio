import { formatReference, localizedBookName, parseReference } from './reference.js';

const state = { reference: null, book: null, morphology: null, manifest: null, selected: null, lemmaShards: new Map() };
const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);

const labels = {
  Function: '품사', Form: '형태', Gender: '성', Number: '수', State: '상태', Stem: '어간', Action: '동작', Voice: '태',
  Tense: '시제', Mood: '법', Person: '인칭', Case: '격', 'Name type': '고유명사 유형', Extra: '추가 정보', Degree: '급',
  Noun: '명사', Verb: '동사', Adjective: '형용사', Adverb: '부사', Preposition: '전치사', Conjunction: '접속사', Article: '관사',
  Pronoun: '대명사', Particle: '불변화사', Masculine: '남성', Feminine: '여성', Neuter: '중성', Common: '공통', Singular: '단수',
  Plural: '복수', Dual: '쌍수', Absolute: '절대형', Construct: '연계형', Nominative: '주격', Genitive: '속격', Dative: '여격',
  Accusative: '목적격', Vocative: '호격', Active: '능동', Passive: '수동', Middle: '중간태', Indicative: '직설법', Imperative: '명령법',
  Infinitive: '부정사', Participle: '분사', Present: '현재', Imperfect: '미완료', Future: '미래', Aorist: '부정과거', Perfect: '완료',
  Pluperfect: '과거완료', First: '1', Second: '2', Third: '3', Location: '장소', Individual: '인물', Title: '칭호', Qal: '칼', Proper: '고유',
};

function koreanMorphology(expansion, raw) {
  if (!expansion) return `원자료 형태 코드: ${raw}`;
  return expansion.split(';').map((part) => {
    const [key, value] = part.split('=').map((item) => item?.trim());
    if (!value) return part.trim();
    let translated = value;
    for (const [english, korean] of Object.entries(labels).sort((a, b) => b[0].length - a[0].length)) {
      translated = translated.replace(new RegExp(`\\b${english}\\b`, 'g'), korean);
    }
    translated = translated.replace(/\b1st\b/g, '1인칭').replace(/\b2nd\b/g, '2인칭').replace(/\b3rd\b/g, '3인칭');
    return `${labels[key] || key}: ${translated}`;
  }).join(' · ');
}

function morphologyInfo(language, code) {
  const prefix = language === 'hebrew' ? 'H' : 'G';
  const direct = state.morphology?.[`${prefix}:${code}`];
  if (direct) return koreanMorphology(direct.expansion, code);
  if (language === 'hebrew' && code.includes('/')) {
    return code.split('/').map((part) => {
      const normalized = part.startsWith('H') ? part : `H${part}`;
      const info = state.morphology?.[`H:${normalized}`];
      return koreanMorphology(info?.expansion, normalized);
    }).join(' / ');
  }
  return `원자료 형태 코드: ${code}`;
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`자료를 불러오지 못했습니다 (${response.status})`);
  return response.json();
}

async function loadLemma(strong) {
  const shard = `${strong[0]}${strong[1]}`;
  if (!state.lemmaShards.has(shard)) state.lemmaShards.set(shard, fetchJson(`/public/data/original-language/lemmas/${shard}.json`));
  return (await state.lemmaShards.get(shard))[strong];
}

function includedVerses(reference) {
  const rows = [];
  for (let chapter = reference.chapter; chapter <= reference.endChapter; chapter += 1) {
    const chapterData = state.book.chapters[chapter] || {};
    for (const [verseText, tokens] of Object.entries(chapterData)) {
      const verse = Number(verseText);
      if (verse < 1) continue;
      if (chapter === reference.chapter && reference.startVerse !== null && verse < reference.startVerse) continue;
      if (chapter === reference.endChapter && reference.endVerse !== null && verse > reference.endVerse) continue;
      rows.push({ chapter, verse, tokens });
    }
  }
  return rows.sort((a, b) => a.chapter - b.chapter || a.verse - b.verse);
}

function renderPassage() {
  const rows = includedVerses(state.reference);
  const languageLabel = state.book.language === 'hebrew' ? '히브리어' : '그리스어';
  $('#original-passage-title').textContent = formatReference(state.reference, 'ko');
  $('#original-passage-meta').textContent = `${languageLabel} · ${rows.length.toLocaleString('ko-KR')}절 · 단어를 누르면 파싱과 전체 쓰임이 열립니다.`;
  $('#original-open-era').href = `/era.html?ref=${encodeURIComponent(formatReference(state.reference, 'ko'))}`;
  $('#original-verses').innerHTML = rows.length ? rows.map(({ chapter, verse, tokens }) => `
    <article class="original-verse">
      <div class="original-verse-head"><strong>${escapeHtml(localizedBookName(state.reference.code, 'ko'))} ${chapter}:${verse}</strong><span>${languageLabel} ${tokens.length}단어</span></div>
      <div class="original-token-list ${state.book.language === 'greek' ? 'greek' : ''}">${tokens.map((token) => `<button class="original-token" type="button" data-chapter="${chapter}" data-verse="${verse}" data-word="${token.n}"><span class="script">${escapeHtml(token.w)}</span><span class="translit">${escapeHtml(token.t)}</span></button>`).join('')}</div>
    </article>`).join('') : '<div class="original-loading">선택한 판본의 해당 절에는 표시할 원어 단어가 없습니다. 판본 차이로 빠진 절일 수 있습니다.</div>';
}

function referenceLabel(parts) {
  const [code, chapter, verse] = parts;
  return `${localizedBookName(code, 'ko')} ${chapter}:${verse}`;
}

async function selectToken(button) {
  document.querySelectorAll('.original-token.is-active').forEach((node) => node.classList.remove('is-active'));
  button.classList.add('is-active');
  const chapter = Number(button.dataset.chapter);
  const verse = Number(button.dataset.verse);
  const token = state.book.chapters[chapter][verse].find((item) => item.n === Number(button.dataset.word));
  if (!token) return;
  $('#word-detail').innerHTML = '<div class="word-detail-empty"><strong>단어 자료를 불러오는 중입니다.</strong></div>';
  const lemma = await loadLemma(token.s);
  state.selected = { token, lemma, chapter, verse };
  renderWordDetail(token, lemma);
}

function occurrenceButtons(refs) {
  return refs.map((ref) => `<button type="button" data-occurrence="${ref[0]} ${ref[1]}:${ref[2]}">${escapeHtml(referenceLabel(ref))}${Number(ref[3]) > 1 ? ` ×${ref[3]}` : ''}</button>`).join('');
}

function renderWordDetail(token, lemma, showAll = false) {
  const refs = lemma?.references || [];
  const visibleRefs = showAll ? refs : refs.slice(0, 240);
  $('#word-detail').innerHTML = `
    <div class="word-detail-head"><span class="word-detail-kicker">${state.book.language === 'hebrew' ? '히브리어' : '그리스어'} 단어 분석</span><div class="word-detail-word">${escapeHtml(token.w)}</div><p>${escapeHtml(token.t || lemma?.transliteration || '음역 정보 없음')} · ${escapeHtml(token.x || '직역 정보 없음')}</p></div>
    <div class="word-facts"><div class="word-fact"><span>표제어</span><strong>${escapeHtml(token.l || lemma?.lemma || '—')}</strong></div><div class="word-fact"><span>식별자</span><strong>${escapeHtml(token.s)}</strong></div><div class="word-fact"><span>기본 뜻</span><strong>${escapeHtml(token.d || lemma?.gloss || token.x || '—')}</strong></div><div class="word-fact"><span>형태 코드</span><strong>${escapeHtml(token.m)}</strong></div></div>
    <div class="morphology-box"><strong>형태 분석</strong><br />${escapeHtml(morphologyInfo(state.book.language, token.m))}</div>
    <div class="occurrence"><h3>성경 전체 사용 <strong>${Number(lemma?.count || 0).toLocaleString('ko-KR')}회</strong></h3><p>같은 확장 Strong 표제어 기준입니다. 같은 절에서 여러 번 쓰이면 각각 셉니다.</p><div class="reference-list">${occurrenceButtons(visibleRefs)}</div>${!showAll && refs.length > visibleRefs.length ? `<button class="occurrence-more" type="button" data-show-all="true">나머지 ${(refs.length - visibleRefs.length).toLocaleString('ko-KR')}개 구절 모두 보기</button>` : ''}</div>`;
}

async function loadReference(input, updateHash = true) {
  const parsed = parseReference(input);
  if (parsed.error) { $('#original-error').hidden = false; $('#original-error').textContent = parsed.error; return; }
  $('#original-error').hidden = true;
  $('#original-verses').innerHTML = '<div class="original-loading">원어 자료를 불러오는 중입니다.</div>';
  try {
    const book = await fetchJson(`/public/data/original-language/books/${parsed.code}.json`);
    state.reference = parsed; state.book = book; state.selected = null;
    $('#word-detail').innerHTML = '<div class="word-detail-empty"><span>단어 분석</span><strong>원어 단어를 눌러 보세요.</strong><p>표제어, 음역, 형태 분석, 전체 출현 횟수와 등장 구절이 이곳에 표시됩니다.</p></div>';
    renderPassage();
    $('#original-reference').value = formatReference(parsed, 'ko');
    if (updateHash) history.replaceState(null, '', `/original.html#${encodeURIComponent(formatReference(parsed, 'ko'))}`);
    loadMemo();
  } catch (error) { $('#original-verses').innerHTML = `<div class="original-loading">${escapeHtml(error.message)}</div>`; }
}

const memoKey = () => `ministry-ai-lab:original-memo:${state.reference?.code || ''}:${state.reference?.chapter || ''}`;
function loadMemo() { $('#original-memo').value = localStorage.getItem(memoKey()) || ''; $('#memo-status').textContent = '입력하면 이 브라우저에 자동 저장됩니다.'; }
let memoTimer;
$('#original-memo').addEventListener('input', () => { clearTimeout(memoTimer); localStorage.setItem(memoKey(), $('#original-memo').value); $('#memo-status').textContent = '브라우저에 저장했습니다.'; memoTimer = setTimeout(() => { $('#memo-status').textContent = '입력하면 이 브라우저에 자동 저장됩니다.'; }, 1800); });
$('#memo-toggle').addEventListener('click', () => { const body = $('#memo-body'); body.hidden = !body.hidden; $('#memo-toggle').textContent = body.hidden ? '펼치기' : '접기'; $('#memo-toggle').setAttribute('aria-expanded', String(!body.hidden)); });
$('#memo-copy').addEventListener('click', async () => { await navigator.clipboard.writeText($('#original-memo').value); $('#memo-status').textContent = '메모를 복사했습니다.'; });
$('#memo-download').addEventListener('click', () => { const title = formatReference(state.reference, 'ko'); const content = `# ${title} 원어 연구 메모\n\n${$('#original-memo').value}\n`; const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([content], { type: 'text/markdown;charset=utf-8' })); link.download = `${title.replace(/[:–\s]+/g, '-')}-원어메모.md`; link.click(); URL.revokeObjectURL(link.href); });

$('#original-search').addEventListener('submit', (event) => { event.preventDefault(); loadReference($('#original-reference').value); });
$('.original-examples').addEventListener('click', (event) => { const button = event.target.closest('[data-reference]'); if (button) loadReference(button.dataset.reference); });
$('#original-verses').addEventListener('click', (event) => { const button = event.target.closest('.original-token'); if (button) selectToken(button); });
$('#word-detail').addEventListener('click', (event) => { const button = event.target.closest('[data-occurrence]'); if (button) loadReference(button.dataset.occurrence); const more = event.target.closest('[data-show-all]'); if (more && state.selected) renderWordDetail(state.selected.token, state.selected.lemma, true); });

try {
  [state.morphology, state.manifest] = await Promise.all([fetchJson('/public/data/original-language/morphology.json'), fetchJson('/public/data/original-language/manifest.json')]);
  $('#original-total-tokens').textContent = state.manifest.totals.tokens.toLocaleString('ko-KR');
  const initial = decodeURIComponent(location.hash.slice(1)) || '출애굽기 3:1-6';
  await loadReference(initial, false);
} catch (error) { $('#original-verses').innerHTML = `<div class="original-loading">${escapeHtml(error.message)}</div>`; }
