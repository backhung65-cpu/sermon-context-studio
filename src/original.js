import { formatReference, localizedBookName, parseReference } from './reference.js';
import { loadKjvFallback, loadPublicBibleBook, selectedPublicBibleRows } from './era-text.js';
import { loadCommentaryBook, selectCommentaries } from './commentary-library.js';
import { allNotesMarkdown, listNotes, listVerseNotes, migrateLegacyOriginalNote, passageNoteKey, readPassageNote, writePassageNote } from './notes.js';

const state = { reference: null, book: null, publicBible: null, bibleFallback: {}, morphology: null, manifest: null, selected: null, lemmaShards: new Map(), strongs: new Map() };
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

function canonicalBaseStrong(value = '') {
  const match = String(value).match(/([HG])0*(\d{1,5})/i);
  return match ? `${match[1].toUpperCase()}${Number(match[2])}` : '';
}

async function loadStrongsEntry(strong) {
  const base = canonicalBaseStrong(strong);
  const prefix = base[0];
  if (!state.strongs.has(prefix)) state.strongs.set(prefix, fetchJson(`/public/data/original-language/strongs/${prefix}.json`));
  const dictionary = await state.strongs.get(prefix);
  return { base, entry: dictionary[base] || null, dictionary };
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
  const bibleRows = selectedPublicBibleRows(state.publicBible || {}, state.reference, null, state.bibleFallback);
  const bibleByVerse = new Map(bibleRows.map((row) => [`${row.chapter}:${row.verse}`, row]));
  const languageLabel = state.book.language === 'hebrew' ? '히브리어' : '그리스어';
  $('#original-passage-title').textContent = formatReference(state.reference, 'ko');
  $('#original-passage-meta').textContent = `공개 한국어 성경 1910 · ${languageLabel} · ${rows.length.toLocaleString('ko-KR')}절 · 단어를 누르면 형태와 어휘 관계가 열립니다.`;
  $('#original-open-era').href = `/era.html?ref=${encodeURIComponent(formatReference(state.reference, 'ko'))}`;
  $('#original-verses').innerHTML = rows.length ? rows.map(({ chapter, verse, tokens }) => `
    <article class="original-verse">
      <div class="original-verse-head"><strong>${escapeHtml(localizedBookName(state.reference.code, 'ko'))} ${chapter}:${verse}</strong><span>${languageLabel} ${tokens.length}단어</span></div>
      <div class="parallel-bible"><span>한글 성경 1910${bibleByVerse.get(`${chapter}:${verse}`)?.language === 'en' ? ' · 영문 대체' : ''}</span><p>${escapeHtml(bibleByVerse.get(`${chapter}:${verse}`)?.text || '공개 한국어 원자료에 이 절이 없습니다. 장절 링크에서 대조하세요.')}</p></div>
      <div class="interlinear-labels"><span>원문</span><span>음역</span><span>원자료 문맥 뜻</span></div>
      <div class="original-token-list ${state.book.language === 'greek' ? 'greek' : ''}">${tokens.map((token) => `<button class="original-token" type="button" data-chapter="${chapter}" data-verse="${verse}" data-word="${token.n}"><span class="script">${escapeHtml(token.w)}</span><span class="translit">${escapeHtml(token.t)}</span><span class="source-gloss" lang="en">${escapeHtml(token.x || token.d || '—')}</span></button>`).join('')}</div>
      <div class="source-order-gloss"><span>원어 어순 뜻풀이 · 원자료 영어</span><p lang="en">${tokens.map((token) => escapeHtml(token.x || token.d || '—')).join(' / ')}</p><small>한국어 성경은 위에서 읽고, 이 줄은 원어의 배열과 단어 경계를 확인할 때 사용하세요. 한국어 직역으로 가장하지 않습니다.</small></div>
    </article>`).join('') : '<div class="original-loading">선택한 판본의 해당 절에는 표시할 원어 단어가 없습니다. 판본 차이로 빠진 절일 수 있습니다.</div>';
}

function referenceLabel(parts) {
  const [code, chapter, verse] = parts;
  return `${localizedBookName(code, 'ko')} ${chapter}:${verse}`;
}

function renderCommentaries(records) {
  const target = $('#commentary-results');
  if (!records.length) {
    target.innerHTML = `<div class="commentary-empty"><strong>이 본문에 연결된 사용자 주석이 아직 없습니다.</strong><p><code>content/commentaries/library</code>에 장절이 표시된 MD 또는 PDF를 넣고 색인을 다시 만들면 여기에 나타납니다.</p><a href="/sources.html#commentary-library">파일명·MD 머리말·PDF 페이지 연결 방법 보기 ↗</a></div>`;
    return;
  }
  target.innerHTML = records.map((record) => `<details class="commentary-card"><summary><div><span>${escapeHtml(record.label)}${record.pages?.length ? ` · PDF ${record.pages.join(', ')}쪽` : ''}</span><strong>${escapeHtml(record.sectionTitle || record.title)}</strong><small>${escapeHtml(record.author)} · ${escapeHtml(record.source || record.sourceFile)}</small></div><b>읽기</b></summary><div class="commentary-body"><p>${escapeHtml(record.text)}</p><footer><span>출처 ${escapeHtml(record.source || record.sourceFile)}</span><span>이용 조건 ${escapeHtml(record.license)}</span><span>원자료 언어 ${escapeHtml(record.language)}</span></footer></div></details>`).join('');
}

async function loadCommentaries(reference) {
  const target = $('#commentary-results');
  target.innerHTML = '<div class="original-loading">주석 색인을 불러오는 중입니다.</div>';
  try { renderCommentaries(selectCommentaries(await loadCommentaryBook(reference.code), reference)); }
  catch (error) { target.innerHTML = `<div class="commentary-empty"><strong>주석 색인을 불러오지 못했습니다.</strong><p>${escapeHtml(error.message)}</p></div>`; }
}

async function selectToken(button) {
  document.querySelectorAll('.original-token.is-active').forEach((node) => node.classList.remove('is-active'));
  button.classList.add('is-active');
  const chapter = Number(button.dataset.chapter);
  const verse = Number(button.dataset.verse);
  const token = state.book.chapters[chapter][verse].find((item) => item.n === Number(button.dataset.word));
  if (!token) return;
  $('#word-detail').innerHTML = '<div class="word-detail-empty"><strong>단어 자료를 불러오는 중입니다.</strong></div>';
  const [lemma, strongs] = await Promise.all([loadLemma(token.s), loadStrongsEntry(token.s)]);
  state.selected = { token, lemma, strongs, chapter, verse };
  renderWordDetail(token, lemma, strongs);
}

function occurrenceButtons(refs) {
  return refs.map((ref) => `<button type="button" data-occurrence="${ref[0]} ${ref[1]}:${ref[2]}">${escapeHtml(referenceLabel(ref))}${Number(ref[3]) > 1 ? ` ×${ref[3]}` : ''}</button>`).join('');
}

function relationCards(ids, dictionary) {
  if (!ids?.length) return '<span class="relation-empty">연결된 번호 없음</span>';
  return ids.slice(0, 40).map((id) => {
    const row = dictionary[id] || {};
    return `<span class="relation-node"><b>${escapeHtml(row.lemma || id)}</b><small>${escapeHtml(id)}${row.transliteration ? ` · ${escapeHtml(row.transliteration)}` : ''}</small></span>`;
  }).join('');
}

function formCards(forms, language, showAllForms) {
  const rows = showAllForms ? forms : forms.slice(0, 24);
  return rows.map(([surface, transliteration, morphology, count]) => `<div class="form-row"><span class="form-script">${escapeHtml(surface)}</span><span>${escapeHtml(transliteration || '음역 없음')}</span><span>${escapeHtml(morphologyInfo(language, morphology))}</span><strong>${Number(count).toLocaleString('ko-KR')}회</strong></div>`).join('');
}

function renderWordDetail(token, lemma, strongs, showAll = false, showAllForms = false) {
  const refs = lemma?.references || [];
  const visibleRefs = showAll ? refs : refs.slice(0, 240);
  const forms = lemma?.forms || [];
  const exactFormCount = forms.filter(([surface]) => surface === token.w).reduce((sum, row) => sum + Number(row[3]), 0);
  const source = strongs?.entry;
  $('#word-detail').innerHTML = `
    <div class="word-detail-head"><span class="word-detail-kicker">${state.book.language === 'hebrew' ? '히브리어' : '그리스어'} 단어 분석</span><div class="word-detail-word">${escapeHtml(token.w)}</div><p>${escapeHtml(token.t || lemma?.transliteration || '음역 정보 없음')} · ${escapeHtml(token.x || '직역 정보 없음')}</p></div>
    <div class="word-facts"><div class="word-fact"><span>표제어</span><strong>${escapeHtml(token.l || lemma?.lemma || '—')}</strong></div><div class="word-fact"><span>식별자</span><strong>${escapeHtml(token.s)}</strong></div><div class="word-fact"><span>기본 뜻 · 원자료 영어</span><strong lang="en">${escapeHtml(token.d || lemma?.gloss || token.x || '—')}</strong></div><div class="word-fact"><span>현재 표기 전체</span><strong>${exactFormCount.toLocaleString('ko-KR')}회</strong></div></div>
    <div class="morphology-box"><strong>형태 분석</strong><br />${escapeHtml(morphologyInfo(state.book.language, token.m))}</div>
    <section class="word-section"><div class="word-section-head"><div><span>INFLECTIONS</span><h3>같은 표제어의 실제 굴절형 ${forms.length.toLocaleString('ko-KR')}개</h3></div></div><p class="word-section-note">성경 원문에 실제 나온 표기·음역·문법·횟수입니다. 파생어와 굴절형을 구분해 보여 줍니다.</p><div class="form-list">${formCards(forms, state.book.language, showAllForms)}</div>${!showAllForms && forms.length > 24 ? `<button class="occurrence-more" type="button" data-show-all-forms="true">나머지 ${(forms.length - 24).toLocaleString('ko-KR')}개 굴절형 모두 보기</button>` : ''}</section>
    <section class="word-section derivation-section"><div class="word-section-head"><div><span>WORD FAMILY</span><h3>사전에 기록된 파생 관계</h3></div><small>Strong 1890/1894 · Open Scriptures 교정판</small></div>${source ? `<p class="source-dictionary" lang="en"><b>파생 설명 원문</b> ${escapeHtml(source.derivation || '기록 없음')}<br /><b>간결 정의 원문</b> ${escapeHtml(source.definition || '기록 없음')}</p><div class="relation-group"><strong>이 단어가 연결된 바탕말</strong><div>${relationCards(source.parents, strongs.dictionary)}</div></div><div class="relation-group"><strong>이 단어에서 연결된 낱말</strong><div>${relationCards(source.children, strongs.dictionary)}</div></div>` : '<p class="word-section-note">이 확장 Strong 표제어에 대응하는 고전 Strong 사전 항목을 찾지 못했습니다.</p>'}<p class="derivation-caution">어원과 파생 관계는 단어의 역사를 보여 주지만, 현재 본문의 뜻은 문장·문법·문맥에서 판단해야 합니다.</p></section>
    <div class="occurrence"><h3>성경 전체 사용 <strong>${Number(lemma?.count || 0).toLocaleString('ko-KR')}회</strong></h3><p>같은 확장 Strong 표제어 기준입니다. 같은 절에서 여러 번 쓰이면 각각 셉니다.</p><div class="reference-list">${occurrenceButtons(visibleRefs)}</div>${!showAll && refs.length > visibleRefs.length ? `<button class="occurrence-more" type="button" data-show-all="true">나머지 ${(refs.length - visibleRefs.length).toLocaleString('ko-KR')}개 구절 모두 보기</button>` : ''}</div>`;
}

async function loadReference(input, updateHash = true) {
  const parsed = parseReference(input);
  if (parsed.error) { $('#original-error').hidden = false; $('#original-error').textContent = parsed.error; return; }
  $('#original-error').hidden = true;
  $('#original-verses').innerHTML = '<div class="original-loading">원어 자료를 불러오는 중입니다.</div>';
  try {
    const [book, publicBible, fallback] = await Promise.all([
      fetchJson(`/public/data/original-language/books/${parsed.code}.json`),
      loadPublicBibleBook(parsed.code), loadKjvFallback(),
    ]);
    state.reference = parsed; state.book = book; state.publicBible = publicBible; state.bibleFallback = fallback; state.selected = null;
    $('#word-detail').innerHTML = '<div class="word-detail-empty"><span>단어 분석</span><strong>원어 단어를 눌러 보세요.</strong><p>표제어, 음역, 형태 분석, 전체 출현 횟수와 등장 구절이 이곳에 표시됩니다.</p></div>';
    renderPassage();
    loadCommentaries(parsed);
    updateMemoToolLinks(parsed);
    $('#original-reference').value = formatReference(parsed, 'ko');
    if (updateHash) history.replaceState(null, '', `/original.html#${encodeURIComponent(formatReference(parsed, 'ko'))}`);
    loadMemo();
  } catch (error) { $('#original-verses').innerHTML = `<div class="original-loading">${escapeHtml(error.message)}</div>`; }
}

function updateMemoToolLinks(reference) {
  const label = formatReference(reference, 'ko');
  const encoded = encodeURIComponent(label);
  const links = Object.fromEntries([...document.querySelectorAll('#original-memo-tools [data-tool]')].map((link) => [link.dataset.tool, link]));
  links.places.href = `/#${encoded}`;
  links.journeys.href = `/?view=journeys&ref=${encoded}`;
  links.era.href = `/era.html?ref=${encoded}`;
  links.original.href = `/original.html#${encoded}`;
}
function loadMemo() {
  try {
    $('#original-memo').value = migrateLegacyOriginalNote(localStorage, state.reference);
    const passageCount = listNotes(localStorage).length;
    const verseCount = listVerseNotes(localStorage).length;
    $('#memo-status').textContent = `네 도구가 함께 쓰는 메모입니다. 저장된 본문 ${passageCount}개 · 절 메모 ${verseCount}개`;
  } catch { $('#memo-status').textContent = '브라우저 저장 공간을 사용할 수 없습니다. 메모를 복사해 보관하세요.'; }
}
function downloadText(filename, content) {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([content], { type: 'text/markdown;charset=utf-8' }));
  link.download = filename; link.click(); setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}
function allMemoMarkdown() {
  return allNotesMarkdown(listNotes(localStorage), listVerseNotes(localStorage), {
    title: '성경 배경 연구 통합 메모', passageTitle: '본문 전체 메모', verseTitle: '절별 메모',
  });
}
let memoTimer;
$('#original-memo').addEventListener('input', () => { clearTimeout(memoTimer); writePassageNote(localStorage, state.reference, $('#original-memo').value); $('#memo-status').textContent = '네 도구에서 함께 보도록 저장했습니다.'; memoTimer = setTimeout(loadMemo, 1800); });
$('#memo-toggle').addEventListener('click', () => { const body = $('#memo-body'); body.hidden = !body.hidden; $('#memo-toggle').textContent = body.hidden ? '펼치기' : '접기'; $('#memo-toggle').setAttribute('aria-expanded', String(!body.hidden)); });
$('#memo-copy').addEventListener('click', async () => { await navigator.clipboard.writeText($('#original-memo').value); $('#memo-status').textContent = '메모를 복사했습니다.'; });
$('#memo-download').addEventListener('click', () => { const title = formatReference(state.reference, 'ko'); downloadText(`${title.replace(/[:–\s]+/g, '-')}-연구메모.md`, `# ${title} 통합 연구 메모\n\n${$('#original-memo').value}\n`); });
$('#memo-copy-all').addEventListener('click', async () => { await navigator.clipboard.writeText(allMemoMarkdown()); $('#memo-status').textContent = '모든 연구 메모를 복사했습니다.'; });
$('#memo-download-all').addEventListener('click', () => { downloadText(`성경-배경-연구-전체-메모-${new Date().toISOString().slice(0, 10)}.md`, allMemoMarkdown()); $('#memo-status').textContent = '모든 연구 메모를 내보냈습니다.'; });
window.addEventListener('storage', (event) => { if (state.reference && event.key === passageNoteKey(state.reference) && document.activeElement !== $('#original-memo')) $('#original-memo').value = readPassageNote(localStorage, state.reference); });

$('#original-search').addEventListener('submit', (event) => { event.preventDefault(); loadReference($('#original-reference').value); });
$('.original-examples').addEventListener('click', (event) => { const button = event.target.closest('[data-reference]'); if (button) loadReference(button.dataset.reference); });
$('#original-verses').addEventListener('click', (event) => { const button = event.target.closest('.original-token'); if (button) selectToken(button); });
$('#word-detail').addEventListener('click', (event) => {
  const button = event.target.closest('[data-occurrence]');
  if (button) loadReference(button.dataset.occurrence);
  const more = event.target.closest('[data-show-all]');
  if (more && state.selected) renderWordDetail(state.selected.token, state.selected.lemma, state.selected.strongs, true, false);
  const forms = event.target.closest('[data-show-all-forms]');
  if (forms && state.selected) renderWordDetail(state.selected.token, state.selected.lemma, state.selected.strongs, false, true);
});
window.addEventListener('hashchange', () => {
  const reference = decodeURIComponent(location.hash.slice(1));
  if (reference) loadReference(reference, false);
});

try {
  [state.morphology, state.manifest] = await Promise.all([fetchJson('/public/data/original-language/morphology.json'), fetchJson('/public/data/original-language/manifest.json')]);
  $('#original-total-tokens').textContent = state.manifest.totals.tokens.toLocaleString('ko-KR');
  const initial = decodeURIComponent(location.hash.slice(1)) || '출애굽기 3:1-6';
  await loadReference(initial, false);
} catch (error) { $('#original-verses').innerHTML = `<div class="original-loading">${escapeHtml(error.message)}</div>`; }
