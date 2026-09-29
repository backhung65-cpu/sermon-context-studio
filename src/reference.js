import { VERSE_COUNTS } from './verse-counts.js';

const BOOK_ROWS = [
  ['GEN', '창세기', '창', 'genesis', 'gen'], ['EXO', '출애굽기', '출', 'exodus', 'exod'],
  ['LEV', '레위기', '레', 'leviticus', 'lev'], ['NUM', '민수기', '민', 'numbers', 'num'],
  ['DEU', '신명기', '신', 'deuteronomy', 'deut'], ['JOS', '여호수아', '수', 'joshua', 'josh'],
  ['JDG', '사사기', '삿', 'judges', 'judg'], ['RUT', '룻기', '룻', 'ruth'],
  ['1SA', '사무엘상', '삼상', '1samuel', '1sam'], ['2SA', '사무엘하', '삼하', '2samuel', '2sam'],
  ['1KI', '열왕기상', '왕상', '1kings', '1kgs'], ['2KI', '열왕기하', '왕하', '2kings', '2kgs'],
  ['1CH', '역대상', '대상', '1chronicles', '1chr'], ['2CH', '역대하', '대하', '2chronicles', '2chr'],
  ['EZR', '에스라', '스', 'ezra'], ['NEH', '느헤미야', '느', 'nehemiah'],
  ['EST', '에스더', '에', 'esther'], ['JOB', '욥기', '욥', 'job'],
  ['PSA', '시편', '시', 'psalms', 'psalm', 'ps'], ['PRO', '잠언', '잠', 'proverbs', 'prov'],
  ['ECC', '전도서', '전', 'ecclesiastes', 'eccl'], ['SNG', '아가', '아', 'songofsolomon', 'song'],
  ['ISA', '이사야', '사', 'isaiah', 'isa'], ['JER', '예레미야', '렘', 'jeremiah', 'jer'],
  ['LAM', '예레미야애가', '애', 'lamentations', 'lam'], ['EZK', '에스겔', '겔', 'ezekiel', 'ezek'],
  ['DAN', '다니엘', '단', 'daniel', 'dan'], ['HOS', '호세아', '호', 'hosea', 'hos'],
  ['JOL', '요엘', '욜', 'joel'], ['AMO', '아모스', '암', 'amos'],
  ['OBA', '오바댜', '옵', 'obadiah', 'obad'], ['JON', '요나', '욘', 'jonah'],
  ['MIC', '미가', '미', 'micah'], ['NAM', '나훔', '나', 'nahum'],
  ['HAB', '하박국', '합', 'habakkuk'], ['ZEP', '스바냐', '습', 'zephaniah'],
  ['HAG', '학개', '학', 'haggai'], ['ZEC', '스가랴', '슥', 'zechariah'],
  ['MAL', '말라기', '말', 'malachi'], ['MAT', '마태복음', '마', 'matthew', 'matt'],
  ['MRK', '마가복음', '막', 'mark'], ['LUK', '누가복음', '눅', 'luke'],
  ['JHN', '요한복음', '요', 'john'], ['ACT', '사도행전', '행', 'acts', 'act'],
  ['ROM', '로마서', '롬', 'romans', 'rom'], ['1CO', '고린도전서', '고전', '1corinthians', '1cor'],
  ['2CO', '고린도후서', '고후', '2corinthians', '2cor'], ['GAL', '갈라디아서', '갈', 'galatians', 'gal'],
  ['EPH', '에베소서', '엡', 'ephesians', 'eph'], ['PHP', '빌립보서', '빌', 'philippians', 'phil'],
  ['COL', '골로새서', '골', 'colossians', 'col'], ['1TH', '데살로니가전서', '살전', '1thessalonians', '1thess'],
  ['2TH', '데살로니가후서', '살후', '2thessalonians', '2thess'], ['1TI', '디모데전서', '딤전', '1timothy', '1tim'],
  ['2TI', '디모데후서', '딤후', '2timothy', '2tim'], ['TIT', '디도서', '딛', 'titus'],
  ['PHM', '빌레몬서', '몬', 'philemon'], ['HEB', '히브리서', '히', 'hebrews', 'heb'],
  ['JAS', '야고보서', '약', 'james'], ['1PE', '베드로전서', '벧전', '1peter', '1pet'],
  ['2PE', '베드로후서', '벧후', '2peter', '2pet'], ['1JN', '요한일서', '요일', '1john'],
  ['2JN', '요한이서', '요이', '2john'], ['3JN', '요한삼서', '요삼', '3john'],
  ['JUD', '유다서', '유', 'jude'], ['REV', '요한계시록', '계', 'revelation', 'rev'],
];

export const BOOKS = BOOK_ROWS.map(([code, name, ...aliases]) => ({ code, name, short: aliases[0] }));

export const CHAPTER_COUNTS = Object.fromEntries(
  Object.entries(VERSE_COUNTS).map(([code, counts]) => [code, counts.length]),
);

const aliases = BOOK_ROWS.flatMap(([code, name, ...names]) =>
  [name, code, ...names].map((alias) => ({ alias: alias.toLowerCase(), code, name, short: names[0] })),
).sort((a, b) => b.alias.length - a.alias.length);

export function parseReference(input) {
  const normalized = String(input ?? '').trim().toLowerCase()
    .replace(/\s+/g, '').replace(/\./g, '').replace(/[：]/g, ':')
    .replace(/[–—~〜]/g, '-');
  const book = aliases.find(({ alias }) => normalized.startsWith(alias));
  if (!book) return { error: '성경 책 이름을 찾지 못했습니다. 예: 행 16:6-15' };
  const remainder = normalized.slice(book.alias.length)
    .replace(/[장편](?=\d)/g, ':').replace(/[장절편]/g, '');
  const match = remainder.match(/^(\d{1,3})(?::(\d{1,3}))?(?:-(\d{1,3})(?::(\d{1,3}))?)?$/);
  if (!match) return { error: '장·절 형식을 확인해 주세요. 예: 창 12, 행 16:6-15, 사 10:15-11:3' };

  const chapter = Number(match[1]);
  const startVerse = match[2] ? Number(match[2]) : null;
  if (startVerse === null && match[4]) return { error: '장 범위에는 절 끝값을 함께 쓸 수 없습니다.' };
  const endChapter = startVerse === null || match[4] ? Number(match[3] || chapter) : chapter;
  const endVerse = startVerse === null ? null : Number(match[4] || match[3] || startVerse);
  if (chapter < 1 || chapter > CHAPTER_COUNTS[book.code]
    || endChapter < chapter || endChapter > CHAPTER_COUNTS[book.code]
    || (startVerse !== null && (startVerse < 1 || endVerse < 1
      || startVerse > VERSE_COUNTS[book.code]?.[chapter - 1]
      || endVerse > VERSE_COUNTS[book.code]?.[endChapter - 1]
      || (endChapter === chapter && endVerse < startVerse)))) {
    return { error: '장·절 범위를 확인해 주세요.' };
  }
  const endLabel = endChapter !== chapter ? `${endChapter}${endVerse === null ? '' : `:${endVerse}`}`
    : endVerse !== startVerse ? String(endVerse) : '';
  const label = `${book.short} ${chapter}${startVerse === null ? '' : `:${startVerse}`}${endLabel ? `–${endLabel}` : ''}`;
  return { code: book.code, name: book.name, short: book.short, chapter, startVerse, endChapter, endVerse, label };
}

export function findPlaces(data, reference) {
  const matched = new Map();
  for (let chapter = reference.chapter; chapter <= reference.endChapter; chapter += 1) {
    const verses = data.index[`${reference.code} ${chapter}`] || {};
    for (const [verseText, ids] of Object.entries(verses)) {
      const verse = Number(verseText);
      if (chapter === reference.chapter && reference.startVerse !== null && verse < reference.startVerse) continue;
      if (chapter === reference.endChapter && reference.endVerse !== null && verse > reference.endVerse) continue;
      for (const id of ids) {
        if (!matched.has(id)) matched.set(id, new Set());
        matched.get(id).add(`${chapter}:${verse}`);
      }
    }
  }
  return [...matched].map(([id, verses]) => ({
    ...data.places[id],
    references: [...verses].map((value) => {
      const [chapter, verse] = value.split(':').map(Number);
      return { chapter, verse };
    }).sort((a, b) => (a.chapter - b.chapter) || (a.verse - b.verse)),
  })).sort((a, b) => (b.references.length - a.references.length) || a.name.localeCompare(b.name));
}
