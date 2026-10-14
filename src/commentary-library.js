const cache = new Map();
let manifestPromise;

function point(chapter, verse) { return chapter * 1000 + verse; }

export function commentaryOverlaps(record, reference) {
  if (record.code !== reference.code) return false;
  const recordStart = point(record.chapter, record.startVerse);
  const recordEnd = point(record.endChapter, record.endVerse);
  const selectedStart = point(reference.chapter, reference.startVerse || 1);
  const selectedEnd = point(reference.endChapter, reference.endVerse || 999);
  return recordStart <= selectedEnd && selectedStart <= recordEnd;
}

export function selectCommentaries(records, reference) {
  return records.filter((record) => commentaryOverlaps(record, reference));
}

export async function loadCommentaryBook(code) {
  if (!manifestPromise) manifestPromise = fetch('/public/data/commentaries/manifest.json').then((response) => {
    if (!response.ok) throw new Error(`주석 목록 ${response.status}`);
    return response.json();
  }).catch((error) => { manifestPromise = null; throw error; });
  const manifest = await manifestPromise;
  if (Array.isArray(manifest.bookCodes) && !manifest.bookCodes.includes(code)) return [];
  if (!cache.has(code)) cache.set(code, fetch(`/public/data/commentaries/books/${code}.json`)
    .then((response) => {
      if (!response.ok) throw new Error(`주석 색인 ${response.status}`);
      return response.json();
    }).catch((error) => { cache.delete(code); throw error; }));
  return cache.get(code);
}

