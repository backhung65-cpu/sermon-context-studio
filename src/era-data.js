// Editorial scene summaries. Each item names its Bible passage; no Bible text is reproduced.
// The order describes the time of the narrative, not when a book was written.
export const ERA_STUDIES = [
  {
    id: 'genesis-12', code: 'GEN', chapter: 12, example: '창세기 12:1-9',
    period: '족장 이야기', title: '아브람의 출발과 약속',
    setting: '아브람이 떠나라는 부름을 듣고 가나안에 이릅니다. 장의 뒤쪽에는 기근 때문에 애굽으로 내려가는 이야기도 이어집니다. 이 장 자체는 사건의 절대 연도를 제시하지 않습니다.',
    background: '본문은 출발과 도착, 땅에 대한 약속, 제단을 쌓는 장면, 이어지는 기근과 애굽 체류를 차례로 놓습니다. 약속이 주어졌다는 사실과 그 땅을 곧바로 소유했다는 주장은 구분해서 읽어야 합니다.',
    caution: '족장 이야기의 사건 연도를 하나의 확정 연도로 표시하지 않습니다.',
    question: '아브람이 이미 얻은 것과 아직 약속으로 남은 것은 각각 무엇인가요?',
    furtherReading: { label: '미국성서공회 · 창세기 12:1–9 읽기와 질문', url: 'https://www.americanbible.org/engage/daily-bible-reading/articles/june-1-genesis-12-1-9/' },
    before: { code: 'GEN', chapter: 11, verse: 31, label: '앞 이야기 · 데라의 가족과 하란' },
    after: { code: 'GEN', chapter: 13, verse: 1, label: '다음 이야기 · 아브람과 롯' },
    stages: [
      { start: 1, end: 3, title: '떠나라는 부름', summary: '아브람에게 땅과 후손, 복에 관한 약속이 주어집니다.' },
      { start: 4, end: 5, title: '하란에서 출발', summary: '아브람은 사래와 롯, 일행을 데리고 가나안으로 향합니다.' },
      { start: 6, end: 9, title: '가나안에서의 응답', summary: '세겜과 벧엘 주변에서 약속을 듣고 제단을 쌓습니다.' },
      { start: 10, end: 20, title: '기근과 애굽 체류', summary: '기근이 일어나 아브람 일행이 애굽으로 내려가며 새로운 갈등을 겪습니다.' },
    ],
  },
  {
    id: 'exodus-3', code: 'EXO', chapter: 3, example: '출애굽기 3',
    period: '출애굽 이야기 이전', title: '호렙에서 부름받은 모세',
    setting: '모세가 미디안에서 양 떼를 돌보다 하나님의 산 호렙에 이릅니다. 애굽은 뒤이은 대화에서 이스라엘의 고통과 모세의 사명과 연결됩니다.',
    background: '앞 장은 모세가 미디안에 머물게 된 경위를 전합니다. 이 장의 현장인 호렙과 앞으로 향할 애굽을 구별하면 본문의 흐름이 선명해집니다.',
    caution: '출애굽 사건의 정확한 연도와 호렙의 현대 지점은 이 화면에서 확정하지 않습니다.',
    question: '모세는 지금 어디에 있으며, 앞으로 어디로 보내질 예정인가요?',
    furtherReading: { label: '미국성서공회 · 출애굽기 연구 안내', url: 'https://www.americanbible.org/engage/bible-resources/articles/bible-study-guide-exodus/' },
    before: { code: 'EXO', chapter: 2, verse: 15, label: '앞 이야기 · 모세의 미디안 생활' },
    after: { code: 'EXO', chapter: 4, verse: 1, label: '다음 이야기 · 부르심에 대한 응답' },
    stages: [
      { start: 1, end: 6, title: '호렙의 떨기나무', summary: '모세가 양 떼를 이끌고 호렙에 이르러 부름을 듣습니다.' },
      { start: 7, end: 12, title: '고통과 사명', summary: '이스라엘의 고통이 언급되고 모세를 애굽으로 보내겠다는 말씀이 이어집니다.' },
      { start: 13, end: 22, title: '이름과 약속', summary: '모세의 질문에 대한 응답과 장차 일어날 일이 제시됩니다.' },
    ],
  },
  {
    id: 'kings-4', code: '2KI', chapter: 4, example: '열왕기하 4:1-44',
    period: '분열 왕국 이야기', title: '엘리사와 여러 가정의 이야기',
    setting: '열왕기하가 전하는 북이스라엘의 엘리사 이야기 가운데 한 장입니다. 한 가정에서 일어난 한 사건으로 묶기보다 네 장면을 나누어 읽습니다.',
    background: '빚을 진 과부, 수넴 여인, 길갈의 공동체, 처음 익은 열매를 가져온 사람이 차례로 등장합니다. 장면마다 인물과 문제가 달라집니다.',
    caution: '네 장면의 정확한 날짜·이동 순서·모든 현장을 이 장만으로 확정하지 않습니다.',
    question: '각 장면에서 누가 어떤 필요를 말하고, 엘리사는 어떻게 응답하나요?',
    furtherReading: { label: '미국성서공회 · 열왕기하 개관과 엘리사 이야기', url: 'https://www.americanbible.org/engage/bible-resources/articles/2-kings/' },
    before: { code: '2KI', chapter: 3, verse: 1, label: '앞 이야기 · 모압과 두 왕국' },
    after: { code: '2KI', chapter: 5, verse: 1, label: '다음 이야기 · 나아만' },
    stages: [
      { start: 1, end: 7, title: '과부의 기름', summary: '빚을 진 여인의 어려움과 기름 그릇의 이야기가 나옵니다.' },
      { start: 8, end: 37, title: '수넴 여인', summary: '수넴 여인의 환대와 아들에 관한 긴 이야기가 이어집니다.' },
      { start: 38, end: 41, title: '길갈의 솥', summary: '흉년 속 공동체의 식사와 솥에 담긴 음식이 등장합니다.' },
      { start: 42, end: 44, title: '처음 익은 열매', summary: '바알 살리사에서 온 사람이 음식을 가져오고 여러 사람이 함께 먹습니다.' },
    ],
  },
  {
    id: 'luke-2', code: 'LUK', chapter: 2, example: '누가복음 2',
    period: '로마 제국 아래의 유대', title: '예수의 탄생과 성장',
    setting: '누가는 아구스도와 구레뇨를 언급하며 탄생 이야기를 시작합니다. 이어 목자들, 성전, 성장한 예수의 장면을 전합니다.',
    background: '탄생 장면과 열두 살 때의 성전 장면 사이에는 시간이 흐릅니다. 한 장에 이어져 있어도 모두 같은 날의 사건은 아닙니다.',
    caution: '누가복음 2장의 인구조사와 다른 역사 연대의 관계에는 학술적 논의가 있습니다. 예수 탄생 연도를 여기서 단정하지 않습니다.',
    question: '이 장에서 시간의 흐름이 크게 바뀌는 지점은 어디인가요?',
    furtherReading: { label: 'Bible Odyssey · 누가복음과 역사 연대 논의', url: 'https://www.bibleodyssey.org/articles/how-does-the-new-testament-relate-to-history/' },
    before: { code: 'LUK', chapter: 1, verse: 26, label: '앞 이야기 · 탄생 예고' },
    after: { code: 'LUK', chapter: 3, verse: 1, label: '다음 이야기 · 요한과 예수의 사역' },
    external: { label: 'Bible Odyssey · 누가복음과 역사 연대', url: 'https://www.bibleodyssey.org/articles/how-does-the-new-testament-relate-to-history/' },
    stages: [
      { start: 1, end: 7, title: '탄생 이야기', summary: '로마 황제의 명령을 언급한 뒤 요셉과 마리아가 베들레헴으로 가는 장면입니다.' },
      { start: 8, end: 20, title: '목자들의 방문', summary: '들에 있던 목자들이 소식을 듣고 아기를 찾아갑니다.' },
      { start: 21, end: 40, title: '성전과 성장', summary: '할례와 성전 방문, 시므온과 안나의 이야기가 이어집니다.' },
      { start: 41, end: 52, title: '열두 살의 예수', summary: '시간이 흐른 뒤 유월절에 예루살렘을 찾은 가족의 이야기가 나옵니다.' },
    ],
  },
  {
    id: 'acts-16', code: 'ACT', chapter: 16, example: '사도행전 16:6-15',
    period: '로마 제국 시대 · 초기 교회', title: '마게도냐로 향한 바울 일행',
    setting: '바울 일행이 아시아와 비두니아 쪽으로 가려다 방향을 바꾸고 마게도냐로 건너갑니다. 빌립보에서 루디아를 만나는 장면으로 이어집니다.',
    background: '본문은 이동 결정, 바다를 건넘, 빌립보 도착, 강가에서의 만남을 구분해 적습니다. 12절은 빌립보를 로마 식민 도시로 소개합니다.',
    caution: '이 화면의 순서는 사도행전 16장의 서술 순서입니다. 연도나 이동 경로의 실제 도로를 확정한 지도가 아닙니다.',
    question: '일행의 계획과 실제로 열린 길은 본문에서 어떻게 달라지나요?',
    furtherReading: { label: '미국성서공회 · 사도행전 16:1–15 읽기와 질문', url: 'https://www.americanbible.org/engage/daily-bible-reading/articles/acts-161-15-2/' },
    before: { code: 'ACT', chapter: 15, verse: 36, label: '앞 이야기 · 다음 방문을 의논함' },
    after: { code: 'ACT', chapter: 17, verse: 1, label: '다음 이야기 · 데살로니가' },
    stages: [
      { start: 1, end: 5, title: '디모데와 동행', summary: '바울이 디모데를 만나 일행과 함께 움직입니다.' },
      { start: 6, end: 10, title: '마게도냐의 부름', summary: '가려던 방향이 막히고 마게도냐로 향하기로 합니다.' },
      { start: 11, end: 15, title: '빌립보와 루디아', summary: '일행이 빌립보에 도착하고 강가에서 루디아를 만납니다.' },
      { start: 16, end: 40, title: '빌립보에서의 일', summary: '뒤이은 갈등과 투옥, 간수와의 대화가 기록됩니다.' },
    ],
  },
];

export function matchEraStudy(reference) {
  if (!reference?.code || reference.chapter !== reference.endChapter) return null;
  const study = ERA_STUDIES.find((item) => item.code === reference.code && item.chapter === reference.chapter);
  if (!study) return null;
  const first = reference.startVerse ?? 1;
  const last = reference.endVerse ?? Infinity;
  const stages = study.stages.filter(({ start, end }) => start <= last && end >= first);
  return { study, stages, isPartial: reference.startVerse !== null };
}
