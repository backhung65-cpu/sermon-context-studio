import { bibleReadingUrl, formatReference, localizedBookName, parseReference } from './reference.js';
import { NOTE_PREFIX } from './notes.js';
import { ERA_STUDIES, matchEraStudy, relatedEraStudies, sceneReferenceForSelection } from './era-data.js';
import { loadKjvFallback, loadPublicBibleBook, publicBibleChapterUrl, selectedPublicBibleRows } from './era-text.js';
import { formatOpenStudyNoteReference, loadOpenStudyNotesBook, selectOpenStudyNotes } from './open-study-notes.js';
import { loadPastoralBooks, selectPastoralBookGuide } from './pastoral-books.js';
import { ERA_LOCALES, eraText } from './era-i18n.js';
import { t } from './i18n.js';

const search = document.querySelector('#era-search');
const input = document.querySelector('#era-reference');
const error = document.querySelector('#era-error');
const content = document.querySelector('#era-study-content');
const languageSelect = document.querySelector('#era-language-select');
const requestedLocale = new URLSearchParams(location.search).get('lang');
let locale = Object.hasOwn(ERA_LOCALES, requestedLocale) ? requestedLocale : 'ko';
let currentReference;
let currentMatch;
let activeStage = 0;
let readerMode = 'stage';
let readerLimit = 40;
let readerRequest = 0;
let studyNotesLimit = 6;
let studyNotesRequest = 0;
let pastoralBookRequest = 0;
const ui = (key, variables) => eraText(locale, key, variables);

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);

function localUrl(path) {
  const url = new URL(path, location.origin);
  if (locale !== 'ko') url.searchParams.set('lang', locale);
  return `${url.pathname}${url.search}${url.hash}`;
}

function setText(id, value) {
  const element = document.querySelector(`#${id}`);
  if (element) element.textContent = value;
}

function applyStaticCopy() {
  document.documentElement.lang = locale;
  document.title = ui('title');
  document.querySelector('meta[name="description"]')?.setAttribute('content', ui('description'));
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', ui('title'));
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', ui('description'));
  setText('era-brand-name', t(locale, 'brand'));
  document.querySelector('#era-brand-link')?.setAttribute('aria-label', t(locale, 'brandHome'));
  setText('era-edition', t(locale, 'edition'));
  setText('era-nav-places', ui('navPlaces'));
  setText('era-nav-journeys', ui('navJourneys'));
  setText('era-nav-current', ui('navEra'));
  document.querySelector('#era-primary-nav')?.setAttribute('aria-label', t(locale, 'edition'));
  document.querySelector('#era-nav-places').href = localUrl('/');
  document.querySelector('#era-nav-journeys').href = localUrl('/?view=journeys');
  document.querySelector('#era-nav-current').href = localUrl('/era.html');
  setText('era-title-one', ui('hero1'));
  setText('era-title-two', ui('hero2'));
  setText('era-lead', ui('lead'));
  setText('era-reference-label', t(locale, 'reference'));
  input.placeholder = t(locale, 'referencePlaceholder');
  setText('era-search-label', ui('search'));
  setText('era-examples-label', ui('examples'));
  setText('era-locale-note', ui('localeNote'));
  document.querySelector('#era-coverage')?.setAttribute('aria-label', ui('coverageAria'));
  for (const [id, key] of [['era-coverage-1','coverage1'],['era-coverage-1-small','coverage1Small'],['era-coverage-2','coverage2'],['era-coverage-2-small','coverage2Small'],['era-coverage-3','coverage3'],['era-coverage-3-small','coverage3Small'],['era-coverage-4','coverage4'],['era-coverage-4-small','coverage4Small'],['era-coverage-foot','coverageFoot'],['era-section-kicker','sectionKicker'],['era-workspace-title','sectionTitle'],['era-method-kicker','methodKicker'],['era-method-title','methodTitle'],['era-method-1-title','method1Title'],['era-method-1-body','method1Body'],['era-method-2-title','method2Title'],['era-method-2-body','method2Body'],['era-method-3-title','method3Title'],['era-method-3-body','method3Body'],['era-footer-copy','footer'],['era-footer-back','footerBack']]) setText(id, ui(key));
  document.querySelector('#era-open-places').textContent = ui('openPlaces');
  document.querySelector('#era-footer-back').href = localUrl('/');
}

function renderExamples() {
  document.querySelector('#era-example-list').innerHTML = ERA_STUDIES.map((study) => {
    const reference = parseReference(study.example);
    return `<button type="button" data-example="${escapeHtml(study.example)}">${escapeHtml(formatReference(reference, locale))}</button>`;
  }).join('');
}

function bibleLink(code, chapter, verse, label) {
  const suffix = String(label).trim().endsWith('↗') ? '' : ' ↗';
  return `<a href="${bibleReadingUrl(code, chapter, verse)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}${suffix}</a>`;
}

function placesUrl(reference) {
  const params = new URLSearchParams();
  if (locale !== 'ko') params.set('lang', locale);
  return `/${params.size ? `?${params}` : ''}#${encodeURIComponent(formatReference(reference))}`;
}

function renderMemo() {
  const textarea = document.querySelector('#era-memo');
  if (!textarea || !currentReference) return;
  try {
    textarea.value = localStorage.getItem(`${NOTE_PREFIX}${currentReference.label}`) || '';
    document.querySelector('#era-memo-status').textContent = textarea.value
      ? ui('memoLoaded') : ui('memoNew');
  } catch {
    document.querySelector('#era-memo-status').textContent = ui('memoUnavailable');
  }
}

function memoMarkup() {
  return `<section class="era-note-card" aria-labelledby="era-note-title">
    <div class="era-card-top"><span>${escapeHtml(ui('memoTop'))}</span><span>${escapeHtml(ui('memoLink'))}</span></div>
    <h3 id="era-note-title">${escapeHtml(ui('memoTitle'))}</h3>
    <p>${escapeHtml(ui('memoIntro'))}</p>
    <label class="sr-only" for="era-memo">${escapeHtml(ui('memoTitle'))}</label>
    <textarea id="era-memo" placeholder="${escapeHtml(ui('memoPlaceholder'))}"></textarea>
    <span id="era-memo-status" class="era-memo-status" role="status"></span>
    <div class="era-note-actions"><button type="button" data-era-action="copy">${escapeHtml(ui('memoCopy'))}</button><button type="button" data-era-action="download">${escapeHtml(ui('memoExport'))}</button></div>
  </section>`;
}

function sceneMarkup(study, stage, partial) {
  const label = `${localizedBookName(study.code, locale)} ${study.chapter}:${stage.start}${stage.end === stage.start ? '' : `–${stage.end}`}`;
  const sceneReference = parseReference(sceneReferenceForSelection(currentReference, stage));
  const first = sceneReference.startVerse;
  return `<div class="era-scene-detail"><div class="era-scene-detail-head"><span>${escapeHtml(ui('sceneDraft'))}</span><span>${escapeHtml(label)}</span></div>
    <div lang="ko"><h3>${escapeHtml(stage.title)}</h3><p>${escapeHtml(stage.summary)}</p></div>
    ${locale !== 'ko' ? `<small class="era-language-notice">${escapeHtml(ui('koreanGuideNotice'))}</small>` : ''}
    ${partial ? `<small class="era-partial-note">${escapeHtml(ui('partialScene'))}</small>` : ''}
    <div class="era-scene-actions"><a href="#era-reader-title">${escapeHtml(ui('sceneRead'))}</a>${bibleLink(study.code, study.chapter, first, ui('currentKorean'))}<a href="${placesUrl(sceneReference)}">${escapeHtml(ui('scenePlaces'))}</a></div>
  </div>`;
}

function readerMarkup(curated) {
  return `<section class="era-reader-card" aria-labelledby="era-reader-title">
    <div class="era-card-top"><span>${escapeHtml(ui('readerTop'))}</span><span>${escapeHtml(ui('readerSeparation'))}</span></div>
    <div class="era-reader-head"><div><h3 id="era-reader-title">${escapeHtml(ui('readerTitle'))}</h3><p>${escapeHtml(ui('readerIntro'))}</p></div><span class="era-reader-edition">${escapeHtml(ui('bibleTextLanguage'))}</span></div>
    ${curated ? `<div class="era-reader-modes" role="group" aria-label="${escapeHtml(ui('readerTitle'))}"><button type="button" data-era-action="reader-stage" aria-pressed="${readerMode === 'stage'}">${escapeHtml(ui('selectedScene'))}</button><button type="button" data-era-action="reader-passage" aria-pressed="${readerMode === 'passage'}">${escapeHtml(ui('selectedPassage'))}</button></div>` : ''}
    <div id="era-reader-text" class="era-reader-text" aria-live="polite">${escapeHtml(ui('bibleLoading'))}</div>
    <div id="era-reader-pagination" class="era-reader-pagination"></div>
    <div class="era-reader-credit"><a href="https://ebible.org/find/details.php?id=kor" target="_blank" rel="noopener noreferrer">${escapeHtml(ui('sourceTerms'))}</a><a href="${bibleReadingUrl(currentReference.code, currentReference.chapter, currentReference.startVerse || 1)}" target="_blank" rel="noopener noreferrer">${escapeHtml(ui('compareKorean'))}</a></div>
  </section>`;
}

function studyNotesMarkup() {
  return `<section class="era-open-notes-card" aria-labelledby="era-open-notes-title">
    <div class="era-card-top"><span>${escapeHtml(ui('notesTop'))}</span><span id="era-open-notes-meta">${escapeHtml(ui('notesAudit', { count: '16,918', language: 'English' }))}</span></div>
    <div class="era-open-notes-head"><div><h3 id="era-open-notes-title">${escapeHtml(ui('notesTitle'))}</h3><p>${escapeHtml(ui('notesIntro'))}</p></div><span>CC BY-SA 4.0</span></div>
    <div id="era-open-notes" class="era-open-notes" aria-live="polite">${escapeHtml(ui('notesLoading'))}</div>
    <p class="era-open-notes-source"><a href="https://github.com/BibleAquifer/AquiferOpenStudyNotes/tree/bbb3f86016cd20913f410a95af63d9f7ff9a71d6" target="_blank" rel="noopener noreferrer">${escapeHtml(ui('originalNotes'))}</a><a href="/public/data/study-notes-audit.json" target="_blank" rel="noopener noreferrer">${escapeHtml(ui('auditResult'))}</a><span id="era-open-notes-source-meta">${escapeHtml(ui('notesSourceMeta', { count: '16,918', books: '66', status: 'Professional' }))}</span></p>
  </section>`;
}

function pastoralBookMarkup() {
  return `<section class="era-book-guide-card" aria-labelledby="era-book-guide-title">
    <div class="era-card-top"><span>${escapeHtml(ui('guideTop'))}</span><span>${escapeHtml(locale === 'ko' ? ui('guideLanguage') : ui('bookGuideSourceLanguage'))}</span></div>
    <div id="era-book-guide" class="era-book-guide" aria-live="polite">
      <p class="era-book-guide-loading">${escapeHtml(ui('guideLoading', { book: localizedBookName(currentReference.code, locale) }))}</p>
    </div>
  </section>`;
}

async function renderPastoralBookGuide() {
  const target = document.querySelector('#era-book-guide');
  if (!target || !currentReference) return;
  const request = ++pastoralBookRequest;
  const code = currentReference.code;
  try {
    const data = await loadPastoralBooks();
    if (request !== pastoralBookRequest) return;
    const guide = selectPastoralBookGuide(data, code);
    if (!guide) throw new Error('Book guide not found');
    const bookName = localizedBookName(guide.code, locale);
    target.innerHTML = `<div class="era-book-guide-head"><div><span>${escapeHtml(guide.genre)} · ${guide.chapterCount}</span><h3 id="era-book-guide-title">${escapeHtml(ui('guideTitle', { book: bookName }))}</h3></div><span class="era-book-guide-status">${escapeHtml(ui('draftStatus'))}</span></div>
      ${locale !== 'ko' ? `<p class="era-language-notice">${escapeHtml(ui('koreanGuideNotice'))}</p>` : ''}
      <div class="era-book-guide-grid" lang="ko">
        <article><span>${escapeHtml(ui('readingDirection'))}</span><p>${escapeHtml(guide.readingDirection)}</p></article>
        <article><span>${escapeHtml(ui('bigFlow'))}</span><p>${escapeHtml(guide.bigFlow)}</p></article>
        <article><span>${escapeHtml(ui('sermonQuestion'))}</span><strong>${escapeHtml(guide.sermonQuestion)}</strong></article>
        <article class="era-book-guide-caution"><span>${escapeHtml(ui('interpretationCaution'))}</span><p>${escapeHtml(guide.interpretationCaution)}</p></article>
      </div>
      <p class="era-book-guide-source"><a href="/public/data/pastoral-books.json" target="_blank" rel="noopener noreferrer">${escapeHtml(ui('guideIndex'))}</a><span>${escapeHtml(ui('guideMeta'))}</span></p>`;
  } catch {
    if (request !== pastoralBookRequest) return;
    target.innerHTML = `<p class="era-book-guide-warning">${escapeHtml(ui('guideFailed'))}</p>`;
  }
}

function noteBodyMarkup(text) {
  return String(text).split(/\n{2,}/).filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replaceAll('\n', '<br>')}</p>`).join('');
}

async function renderOpenStudyNotes() {
  const target = document.querySelector('#era-open-notes');
  if (!target || !currentReference) return;
  const request = ++studyNotesRequest;
  const reference = currentReference;
  target.textContent = ui('notesLoading');
  try {
    let result = await loadOpenStudyNotesBook(reference.code, locale);
    if (request !== studyNotesRequest) return;
    let selected = selectOpenStudyNotes(result.rows, reference);
    if (!selected.rows.length && result.source.locale !== 'en') {
      const english = await loadOpenStudyNotesBook(reference.code, 'en');
      const englishSelected = selectOpenStudyNotes(english.rows, reference);
      if (englishSelected.rows.length) {
        result = { ...english, source: { ...english.source, requestedLocale: locale, isFallback: true, fallbackReason: 'passage' } };
        selected = englishSelected;
      }
    }
    if (request !== studyNotesRequest) return;
    const meta = document.querySelector('#era-open-notes-meta');
    if (meta) meta.textContent = ui('notesAudit', {
      count: result.source.records.toLocaleString(locale),
      language: result.source.language,
    });
    const sourceMeta = document.querySelector('#era-open-notes-source-meta');
    if (sourceMeta) sourceMeta.textContent = ui('notesSourceMeta', {
      count: result.source.records.toLocaleString(locale),
      books: result.source.books.toLocaleString(locale),
      status: result.source.review === 'professional' ? 'Professional' : 'None',
    });
    let languageNotice = result.source.review === 'professional'
      ? ui('notesEnglishStatus')
      : ui('notesTranslationStatus', { language: result.source.language });
    if (result.source.isFallback) languageNotice = ui('notesFallbackStatus');
    if (result.source.converted && !result.source.isFallback) languageNotice += ` ${ui('notesConvertedStatus')}`;
    const languageStatus = `<p class="era-language-notice">${escapeHtml(languageNotice)}</p>`;
    if (!selected.rows.length) {
      target.innerHTML = `${languageStatus}<p class="era-open-notes-warning">${escapeHtml(ui('noNotes'))}</p>`;
      return;
    }
    const visible = selected.rows.slice(0, studyNotesLimit);
    const scopeNotice = selected.scope === 'chapter'
      ? `<p class="era-open-notes-scope">${escapeHtml(ui('chapterNotes'))}</p>`
      : `<p class="era-open-notes-count">${escapeHtml(ui('directNotes', { count: selected.rows.length }))}</p>`;
    target.innerHTML = `${languageStatus}${scopeNotice}<div class="era-open-notes-list" lang="${escapeHtml(result.source.locale)}">${visible.map((row, index) => `<details${index === 0 ? ' open' : ''}><summary><span>${escapeHtml(row.title)}</span><small>${formatOpenStudyNoteReference(row.start, row.end)}</small></summary><div class="era-open-note-body">${noteBodyMarkup(row.text)}</div></details>`).join('')}</div>
      ${selected.rows.length > studyNotesLimit ? `<button type="button" class="era-open-notes-more" data-era-action="notes-more">${escapeHtml(ui('moreNotes', { shown: studyNotesLimit, count: selected.rows.length }))}</button>` : `<p class="era-open-notes-complete">${escapeHtml(ui('allNotes', { count: selected.rows.length }))}</p>`}`;
  } catch {
    if (request !== studyNotesRequest) return;
    target.innerHTML = `<p class="era-open-notes-warning">${escapeHtml(ui('notesFailed'))}</p>`;
  }
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
    const book = localizedBookName(currentReference.code, locale);
    return url
      ? `<a href="${url}" target="_blank" rel="noopener noreferrer">${escapeHtml(ui('sourceChapterLink', { book, chapter: number }))} ↗</a>`
      : `<span class="era-source-absent">${escapeHtml(book)} ${number} · ${escapeHtml(ui('sourcePageMissing'))}</span>`;
  }).join('');
  const sourceNote = hasAbsentChapter
    ? ui('sourcePageMissingNote')
    : chapterCount > 6
      ? ui('sourceRangeLinkNote', { count: chapterCount })
      : ui('sourceVerseAttribution');
  return `<section class="era-sources-card" aria-labelledby="era-sources-title"><div class="era-card-top"><span>${escapeHtml(ui('sourcesTop'))}</span><span>${escapeHtml(ui('sourcesScope'))}</span></div><h3 id="era-sources-title">${escapeHtml(ui('sourcesTitle'))}</h3>
    <ol><li><strong>${escapeHtml(ui('publicKorean'))}</strong>${sourceLinks}<small>${escapeHtml(sourceNote)}</small><a href="https://ebible.org/find/details.php?id=kor" target="_blank" rel="noopener noreferrer">${escapeHtml(ui('sourceEdition'))}</a></li>
    <li><strong>${escapeHtml(ui('currentKoreanLabel'))}</strong>${bibleLink(currentReference.code, chapter, currentReference.startVerse || 1, ui('currentKoreanLink'))}<small>${escapeHtml(ui('currentKoreanNote'))}</small></li>
    <li><strong>${escapeHtml(ui('englishNotes'))}</strong><a href="https://github.com/BibleAquifer/AquiferOpenStudyNotes/tree/bbb3f86016cd20913f410a95af63d9f7ff9a71d6" target="_blank" rel="noopener noreferrer">Aquifer Open Study Notes · bbb3f86 ↗</a><a href="/public/data/study-notes-audit.json" target="_blank" rel="noopener noreferrer">${escapeHtml(ui('auditResult'))}</a><small>${escapeHtml(ui('notesAuditDetail'))}</small></li>
    ${study?.furtherReading ? `<li><strong>${escapeHtml(ui('backgroundEnglish'))}</strong><a href="${escapeHtml(study.furtherReading.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(study.furtherReading.label)} ↗</a><small>${escapeHtml(ui('backgroundSourceNote'))}</small></li>` : ''}</ol>
    <p>${escapeHtml(ui('sourceSeparation'))}</p>
  </section>`;
}

async function renderReader() {
  const target = document.querySelector('#era-reader-text');
  if (!target || !currentReference) return;
  const request = ++readerRequest;
  const reference = currentReference;
  const stage = currentMatch && readerMode === 'stage' ? currentMatch.stages[activeStage] : null;
  const pagination = document.querySelector('#era-reader-pagination');
  target.textContent = ui('bibleLoading');
  pagination.innerHTML = '';
  try {
    const [book, fallback] = await Promise.all([loadPublicBibleBook(reference.code), loadKjvFallback()]);
    if (request !== readerRequest) return;
    const rows = selectedPublicBibleRows(book, reference, stage, fallback);
    const missing = rows.filter((row) => !row.text).length;
    const fallbackCount = rows.filter((row) => row.language === 'en').length;
    if (missing === rows.length) {
      target.innerHTML = `<p class="era-reader-warning">${escapeHtml(ui('sourceAllMissing', { count: rows.length }))} <a href="${bibleReadingUrl(reference.code, rows[0].chapter, rows[0].verse)}" target="_blank" rel="noopener noreferrer">${escapeHtml(ui('currentKoreanLink'))}</a></p>`;
      pagination.textContent = ui('sourceAllMissingStatus', { count: rows.length });
      return;
    }
    const visible = rows.slice(0, readerLimit);
    target.innerHTML = `${fallbackCount ? `<p class="era-reader-warning">${escapeHtml(ui('koreanSourceWarning', { count: fallbackCount }))}</p>` : ''}${missing ? `<p class="era-reader-warning">${escapeHtml(ui('sourceMissingWarning', { count: missing }))}</p>` : ''}
      <div class="era-reader-rows" lang="ko">${visible.map(({ chapter, verse, text: verseText, language }) => `<p class="${verseText ? language === 'en' ? 'era-reader-fallback' : '' : 'era-reader-missing'}"><a href="${bibleReadingUrl(reference.code, chapter, verse)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(ui('readerAria', { book: localizedBookName(reference.code, locale), chapter, verse }))}">${chapter}:${verse}</a><span>${verseText ? `${escapeHtml(verseText)}${language === 'en' ? `<small lang="en">${escapeHtml(ui('englishFallback'))}</small>` : ''}` : escapeHtml(ui('missingVerseText'))}</span></p>`).join('')}</div>`;
    pagination.innerHTML = rows.length > readerLimit
      ? `<span>${escapeHtml(ui('versesShown', { count: `${readerLimit} / ${rows.length}` }))}</span><button type="button" data-era-action="reader-more">${escapeHtml(ui('readerMore'))}</button>`
      : `<span>${escapeHtml(ui('versesShown', { count: rows.length }))}${fallbackCount ? ` · ${escapeHtml(ui('fallbackSummary', { count: fallbackCount }))}` : ''}${missing ? ` · ${escapeHtml(ui('missingSummary', { count: missing }))}` : ''}</span>`;
  } catch {
    if (request !== readerRequest) return;
    target.innerHTML = `<p class="era-reader-warning">${escapeHtml(ui('bibleLoadFailed'))}</p>`;
  }
}

function renderCurated(match) {
  const { study, stages, isPartial } = match;
  activeStage = Math.min(activeStage, stages.length - 1);
  const stage = stages[activeStage];
  const heading = formatReference(currentReference, locale);
  document.querySelector('#era-workspace-subtitle').textContent = ui('curatedSubtitle', { reference: heading, count: stages.length });
  content.innerHTML = `<div class="era-study-heading"><div><span class="era-study-ref">${escapeHtml(heading)}</span><div lang="ko"><h3>${escapeHtml(study.title)}</h3></div><p>${escapeHtml(ui('curatedHeadingIntro'))}</p>${locale !== 'ko' ? `<p class="era-language-notice">${escapeHtml(ui('curatedContentNotice'))}</p>` : ''}</div><span class="era-reviewed">${escapeHtml(ui('draftStatus'))}</span></div>
    <div class="era-study-grid"><div class="era-story-column">
      ${readerMarkup(true)}
      ${pastoralBookMarkup()}
      ${studyNotesMarkup()}
      <section class="era-flow-card" aria-labelledby="era-flow-title"><div class="era-card-top"><span>${escapeHtml(ui('flowTop'))}</span><span>${escapeHtml(ui('flowScenes', { count: stages.length }))}</span></div><h3 id="era-flow-title">${escapeHtml(ui('flowTitle'))}</h3>
        ${isPartial ? `<p class="era-scope-note">${escapeHtml(ui('partialScope', { reference: heading }))}</p>` : ''}
        <div class="era-stage-list" role="tablist" aria-label="${escapeHtml(ui('sceneTabsAria'))}" lang="ko">${stages.map((item, index) => `<button id="era-tab-${index}" type="button" role="tab" data-stage="${index}" tabindex="${index === activeStage ? 0 : -1}" aria-selected="${index === activeStage}" aria-controls="era-active-scene"><span>${String(index + 1).padStart(2, '0')}</span><strong>${escapeHtml(item.title)}</strong><small>${study.chapter}:${item.start}–${item.end}</small></button>`).join('')}</div>
        <div id="era-active-scene" role="tabpanel" aria-labelledby="era-tab-${activeStage}">${sceneMarkup(study, stage, isPartial && (currentReference.startVerse > stage.start || currentReference.endVerse < stage.end))}</div>
      </section>
      <div class="era-neighbors"><div><span>${escapeHtml(ui('previousStory'))}</span><span lang="ko">${bibleLink(study.before.code, study.before.chapter, study.before.verse, study.before.label)}</span></div><div><span>${escapeHtml(ui('nextStory'))}</span><span lang="ko">${bibleLink(study.after.code, study.after.chapter, study.after.verse, study.after.label)}</span></div></div>
    </div><aside class="era-context-column">
      <section class="era-period-card"><div class="era-card-top"><span>${escapeHtml(ui('timeContext'))}</span><span>${escapeHtml(ui('timeSection'))}</span></div><span class="era-period-label">${escapeHtml(ui('storyFlow'))}</span><div lang="ko"><h3>${escapeHtml(study.period)}</h3><p>${escapeHtml(study.setting)}</p></div></section>
      <section class="era-evidence-card"><span class="era-context-index">${escapeHtml(ui('passageObservation'))}</span><p lang="ko">${escapeHtml(study.background)}</p>${bibleLink(study.code, study.chapter, 1, ui('chapterRead', { book: localizedBookName(study.code, locale), chapter: study.chapter }))}
        <div class="era-caution"><strong>${escapeHtml(ui('interpretationCheck'))}</strong><p lang="ko">${escapeHtml(study.caution)}</p>${study.external ? `<a href="${escapeHtml(study.external.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(study.external.label)} ↗</a>` : ''}</div></section>
      <section class="era-question-card"><span>${escapeHtml(ui('sermonObservation'))}</span><strong lang="ko">${escapeHtml(study.question)}</strong></section>
      ${sourcesMarkup(study)}
      ${memoMarkup()}
    </aside></div>`;
  renderMemo();
  renderReader();
  renderPastoralBookGuide();
  renderOpenStudyNotes();
}

function renderUnreviewed() {
  const heading = formatReference(currentReference, locale);
  const related = relatedEraStudies(currentReference);
  const hasRelated = related.length > 0;
  document.querySelector('#era-workspace-subtitle').textContent = ui('generalSubtitle', { reference: heading });
  const relatedMarkup = hasRelated ? `<div class="era-suggestions era-related-studies"><strong>${escapeHtml(ui('relatedTitle'))}</strong><p>${escapeHtml(ui('relatedIntro'))}</p><div lang="ko">${related.map(({ study, reference }) => `<button type="button" data-example="${escapeHtml(reference)}">${escapeHtml(formatReference(parseReference(reference), locale))} · ${escapeHtml(study.title)}</button>`).join('')}</div></div>` : '';
  content.innerHTML = `<div class="era-study-heading"><div><span class="era-study-ref">${escapeHtml(heading)}</span><h3>${escapeHtml(ui('generalHeading'))}</h3><p>${escapeHtml(ui('generalHeadingIntro'))}</p></div><span class="era-reviewed">${escapeHtml(ui('allBookStatus'))}</span></div>
    <div class="era-study-grid"><div class="era-story-column">${readerMarkup(false)}
      ${pastoralBookMarkup()}
      ${studyNotesMarkup()}
      ${relatedMarkup}</div><aside class="era-context-column">${sourcesMarkup(null)}${memoMarkup()}</aside></div>`;
  renderMemo();
  renderReader();
  renderPastoralBookGuide();
  renderOpenStudyNotes();
}

function render() {
  if (!currentReference) return;
  document.querySelector('#era-open-places').href = placesUrl(currentReference);
  currentMatch = matchEraStudy(currentReference);
  if (currentMatch) renderCurated(currentMatch);
  else renderUnreviewed();
}

function openReference(value, updateHistory = true) {
  const parsed = parseReference(value);
  if (parsed.error) { error.textContent = t(locale, parsed.errorKey); error.hidden = false; return false; }
  error.hidden = true;
  currentReference = parsed;
  input.value = formatReference(parsed, locale);
  activeStage = 0;
  readerMode = 'stage';
  readerLimit = 40;
  studyNotesLimit = 6;
  if (updateHistory) {
    const url = new URL(location.href);
    url.searchParams.set('ref', formatReference(parsed, locale));
    if (locale === 'ko') url.searchParams.delete('lang');
    else url.searchParams.set('lang', locale);
    history.pushState(null, '', url);
  }
  render();
  return true;
}

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
  if (action.dataset.eraAction === 'notes-more') {
    studyNotesLimit += 6;
    renderOpenStudyNotes();
    return;
  }
  const value = document.querySelector('#era-memo').value;
  const status = document.querySelector('#era-memo-status');
  if (action.dataset.eraAction === 'copy') {
    try { await navigator.clipboard.writeText(value); status.textContent = ui('memoCopied'); }
    catch { status.textContent = ui('memoCopyFailed'); }
  } else if (action.dataset.eraAction === 'download') {
    const reference = formatReference(currentReference, locale);
    const markdown = `# ${ui('markdownTitle', { reference })}\n\n${value}\n`;
    const url = URL.createObjectURL(new Blob([markdown], { type: 'text/markdown;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${ui('markdownFilePrefix')}-${reference.replace(/[^\p{L}\p{N}-]+/gu, '-')}.md`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status.textContent = ui('memoDownloaded');
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
    document.querySelector('#era-memo-status').textContent = ui('memoSaved');
  } catch {
    document.querySelector('#era-memo-status').textContent = ui('saveFailed');
  }
});

function setLocale(nextLocale, updateHistory = true) {
  locale = Object.hasOwn(ERA_LOCALES, nextLocale) ? nextLocale : 'ko';
  languageSelect.value = locale;
  applyStaticCopy();
  renderExamples();
  if (currentReference) {
    input.value = formatReference(currentReference, locale);
    render();
  }
  if (updateHistory) {
    const url = new URL(location.href);
    if (locale === 'ko') url.searchParams.delete('lang');
    else url.searchParams.set('lang', locale);
    if (currentReference) url.searchParams.set('ref', formatReference(currentReference, locale));
    history.replaceState(null, '', url);
  }
}

languageSelect.innerHTML = Object.entries(ERA_LOCALES)
  .map(([code, label]) => `<option value="${escapeHtml(code)}">${escapeHtml(label)}</option>`).join('');
languageSelect.addEventListener('change', () => setLocale(languageSelect.value));
setLocale(locale, false);

window.addEventListener('popstate', () => {
  const params = new URLSearchParams(location.search);
  setLocale(params.get('lang') || 'ko', false);
  openReference(params.get('ref') || 'EXO 3', false);
});
const hasLinkedReference = new URLSearchParams(location.search).has('ref');
const initialReference = new URLSearchParams(location.search).get('ref') || 'EXO 3';
if (!openReference(initialReference, false)) {
  const reason = error.textContent;
  openReference('EXO 3', false);
  error.textContent = ui('defaultFallback', { reason });
  error.hidden = false;
}
if (hasLinkedReference && error.hidden) {
  requestAnimationFrame(() => document.querySelector('#era-workspace').scrollIntoView({ block: 'start' }));
}
