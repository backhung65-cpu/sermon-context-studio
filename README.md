# 본문의 장소 · 목회 AI 연구소

설교 본문 주소를 입력해 성경 지명을 지도와 근거 링크로 살펴보는 첫 단계 웹앱입니다. 제공된 **목회 AI 연구소 원본 로고 이미지**를 파일 그대로 연결하고, `MINISTRY_AI_LAB_DESIGN_SYSTEM_v2.0_SOFT_FUSION`을 시각 참고 자료로 적용했습니다. 모든 절에 지도 지점이 있는 것은 아닙니다. [전수 검증 결과](COVERAGE_AUDIT.md)를 먼저 확인해 주세요.

배포 주소: [sermon-context-studio.vercel.app](https://sermon-context-studio.vercel.app)

개발·배포 전에는 [사용자 관점 출시 점검표](RELEASE_QA_CHECKLIST.md)를 확인합니다. 지명 ID가 있는지만 검사하지 않고, 지도에서 이름과 장절이 실제로 읽히는지 데스크톱·모바일에서 확인합니다.

소개용 가로 카드뉴스(1600×900): [전체 ZIP](public/cardnews/bible-place-cardnews.zip) · [1장 소개](public/cardnews/01-intro.png) · [2장 사용법](public/cardnews/02-how-it-works.png) · [3장 성경여행](public/cardnews/03-journey.png). 수정 가능한 구성은 [HTML 원본](public/cardnews/source.html)에 있습니다.

## 실행

```powershell
cd "C:\Users\백형진\Documents\0-미라클ai목회연구소\목회ai연구소\sermon-context-studio"
npm start
```

브라우저에서 `http://127.0.0.1:4173`을 엽니다. 포트를 바꾸려면 `PORT` 환경변수를 설정합니다. Node.js 20 이상을 권장합니다. 앱 실행에 npm 패키지 설치는 필요하지 않습니다.

정적 배포 파일을 만들려면 `npm run build`를 실행합니다. 결과는 `dist/`에 생성되며 `npm run preview`로 확인할 수 있습니다.

## 현재 범위

- 66권의 한글 책 이름·약어와 일반적인 영문 책 이름으로 장·절, 장 범위, 장을 넘는 절 범위 검색
- 한국어·영어·일본어·중국어 간체·스페인어·태국어·힌디어·프랑스어·독일어 화면 전환. ‘인도어’는 힌디어로 구현했습니다. 언어 선택은 `?lang=ja`처럼 주소에 남아 공유할 수 있고, 언어별 성경 책 이름으로 검색할 수 있습니다.
- 예: `창 12`, `행 16:6-15`, `창 12:8-13:3`, `사 10장 15절`
- 첫 화면의 지도는 현재 검색한 본문에 따라 바뀝니다. 처음 열면 위치 후보를 직접 비교해 볼 수 있는 `왕하 4:1-44`가 입력되어 있습니다. 검색 결과 위의 장소 바로가기에서 길갈 등 본문 지명을 선택하면 지도가 해당 장소로 이동합니다. 지도 안에는 선택한 장소의 이름·구절·위치 후보 수·대표 후보·현장 사진·성경 읽기 링크를 표시합니다. 후보 비교 버튼을 누르면 상세 후보 목록이 열립니다.
- 다른 본문을 검색하면 지도 좌표·지명 수·장소 카드와 지도 안내가 함께 갱신됩니다. 검수한 여정 장면이 검색한 정확한 절의 지명과 만날 때만 먼저 강조하고, 나머지는 **본문에 나온 절 순서**로 보여줍니다. 사건 자료의 위치만으로 첫 장면을 정하지 않습니다. 강조 지명은 자동으로 바뀌지 않으며 이전·다음 버튼으로 직접 넘길 수 있습니다. 역사적 이동 경로를 추정해 그리지 않습니다. **본문에 지명이 나온다는 사실만으로 사건 현장이라고 판정하지 않습니다.**
- **66권 전체 연결 점검**: `npm test`는 각 절의 지명·인물·사건 ID, 지도 자료 간 판본 일치, 70개 여정 장면의 정확한 절·지명 연결 및 본문 첫 강조 우선순위를 점검합니다. 책별 지명 연결 범위는 검색 결과의 `66권 전체 점검표`와 [감사 보고서](CORPUS_INTEGRITY_AUDIT.md)에 공개합니다. 재생성 명령은 `npm run audit:integrity`입니다. 이 점검은 자료 연결의 무결성을 보장하는 절차이며, 31,102절 모두의 역사적 장소·이동을 확정하는 주석학적 검수는 아닙니다.
- 검수한 여정의 70장면은 본문 검색에서도 해당 정확한 절에 등장한 장소 카드로 표시합니다. 장면 카드에서 지도를 선택하거나 성경여행의 같은 장면으로 이동할 수 있습니다. 다수 지명이 한 절에 나와도 관련 없는 사건 자료 위치를 현장으로 승격하지 않습니다.
- **본문 근거 연결**: Theographic 31,102절의 인명·지명·사건 색인을 OpenBible 지명 색인과 절 단위로 대조합니다. 직접 나온 지명, 두 자료가 같은 절에 연결한 지명, Theographic의 사건 장소, 인명 언급, 수작업 검수 여정 장면을 구분해 보여줍니다. 지명에서 지도·전체 구절로, 인물에서 인물 색인과 해당 검수 여정으로 이동합니다. [재현 가능한 연결 감사](PASSAGE_EVIDENCE_AUDIT.md)에 적용 범위와 배제 기준을 기록했습니다.
- **출애굽기 3장 장면 검수**: [본문 3:1](https://www.bskorea.or.kr/bible/korbibReadpage.php?book=Exo&chap=3&sec=1&version=GAE)을 대조해 호렙산을 모세가 이른 사건 현장, 미디안을 이드로의 배경, 애굽을 뒤이은 대화와 사명의 언급 지명으로 구분했습니다. 이 검색에서는 호렙산을 먼저 선택하고 자동 장소 순환을 멈춥니다. 검수된 모세 여정에도 호렙산 장면을 넣고 검색 결과에서 바로 연결합니다. ‘시내산’은 이 장에 직접 나오지 않으므로 검색 결과에 추가하지 않습니다. 이 장면 역할 판정은 현재 출애굽기 3장에 한해 수작업으로 검수한 것이며, 다른 본문에서는 지명 출현 목록임을 명시합니다.
- 66권 1,189장의 장별 절 수(KJV 기준)로 존재하지 않는 장·절 입력 검사
- 본문에 연결된 지명을 지도와 절 목록으로 표시
- 각 지명 카드에서 현재 본문의 절을 개역개정 읽기 페이지로 연결하고, 성경 전체 색인에서 해당 지명이 등장하는 모든 절을 책별로 펼쳐 확인
- 직접 연결된 지명이 없는 절에는 빈 지도 안내를 표시하고, 같은 장의 참고 지명은 별도 버튼으로 탐색
- 위치 후보가 여러 곳이면 모든 좌표·현대 지명·원자료 점수·판정 기록 수를 비교하고, 후보를 누르면 지도가 해당 지점으로 이동합니다. 점수는 확률이 아닙니다.
- **인물·본문 색인**: 성경여행 메뉴 안에서 Theographic의 66권 31,102절과 3,067개 인명 기록을 검색합니다. 성경 책과 같은 절의 지명 여부로 목록을 좁힐 수 있습니다. 인물마다 그 인물이 언급된 절과 지명도 같은 절에 등장하는 절을 구분해 보여주고, 본문 지도와 성경 읽기로 연결합니다. **같은 절에서 인명·지명이 발견되어도 이동의 증거가 아닙니다.** [66권별 기계 점검표](PERSON_INDEX_AUDIT.md)에 검사 범위와 한계를 공개합니다. 원자료의 인명은 영어이며, 주요 인물만 편집한 한국어 표기를 제공합니다. 그 밖의 인물은 원자료 영문명으로 검색합니다.
- **인물 경로 지도**: [United Bible Societies Project MARBLE Bible Routes](https://translation.bible/tools-resources/bible-routes-from-ubs-project-marble/)의 GeoJSON 179개 중 인물과 연결을 확인할 수 있는 경로 도형 100개를 37개 인명 기록에 연결했습니다. 인물 범위에서 `UBS 경로 지도가 있는 인물`만 골라 볼 수 있습니다. 원자료에는 인물 ID나 선분별 장절이 없어, 원본 제목과 성경 이야기 문맥을 근거로 앱에서 인물을 분류했습니다. 현재 6개 도형의 42개 본문 장면에 지명과 정확한 절을 연결했고, 한나의 길에는 **실로(삼상 1:9) → 라마(1:19) → 실로(1:24)**를 표시합니다. 미대조 94개 도형에는 지도 앞에서 상태를 밝히고 추정 도시를 경유지로 붙이지 않습니다. 선은 UBS의 **편집상 재구성**이며, 실제 고대 도로나 확정 이동을 뜻하지 않습니다. [적용한 도형과 제외 기준](UBS_ROUTE_AUDIT.md)을 공개합니다.
- **검수된 성경여행**: 인물 색인과 분리된 여정 목록에서 현재 공개된 7개 여정을 고릅니다. 예수님의 탄생·성장과 갈릴리에서 예루살렘까지, 바울의 1·2·3차 선교 여행, 아브라함, 모세의 주요 장면 등 총 70장면입니다. 지도 번호·장절·성경 읽기·본문 지도 바로가기를 연결했습니다. `?view=journeys&journey=paul-2&step=3`처럼 공유할 수 있습니다. 점선은 이야기 순서만 연결하며 실제 도로나 거리가 아닙니다. 출애굽 여정에는 이동선을 그리지 않습니다. 한국어·영어 장면 설명을 제공하고, 나머지 7개 언어에서는 번역된 행동별 간략 설명을 보여줍니다. 다른 인물의 이동은 본문 근거를 검수한 뒤 추가합니다.
- 이용 조건이 확인된 현재 지역 사진을 지명 카드에 표시하고 저작자·원본·라이선스 링크 제공
- 일부 주요 지명의 한글 이름 제공; 나머지는 원자료 영문 이름으로 표시
- 본문별 설교 메모를 해당 브라우저에 자동 저장, 저장된 본문 목록에서 다시 열기
- 현재 메모 Markdown 파일 저장, 전체 메모 JSON 백업·불러오기(기존 메모는 덮어쓰지 않음)
- 인쇄용 레이아웃

현재 버전은 지명 연구의 출발점입니다. **AI 기능은 제공하지 않습니다.** 3,067개 인명 기록 모두에게 여행 경로가 있는 것은 아닙니다. 현재 UBS 도형이 연결된 기록은 37개이고, 앱이 장면별 본문·장소를 직접 대조한 여정은 7개입니다. 없는 이동을 자동 생성하지 않습니다. 원자료가 열 가지 영어 역본의 지명 언급을 합친 것이므로 한국어 본문과 표기가 다를 수 있습니다. 한 역본에만 나타나는 이름을 줄이기 위해 다섯 역본 이상에서 확인된 언급만 색인에 넣었습니다. 위치가 여러 후보로 제시된 경우 지도에는 원자료 점수가 가장 높은 후보의 대표 좌표 하나를 표시합니다. 이는 확정 위치를 뜻하지 않습니다.

Theographic의 인명·장절 연결과 좁은 범위의 사건 자료를 함께 사용합니다. 같은 책의 두 장 이내·80절 이내 사건만 본문에 연결하고, 사건 장소는 사건에 속한 절에 직접 지명이 나오는 경우에만 지도와 연결합니다. 사건 제목·연대·이동 경로를 자동 병합하지 않습니다. 원자료 자체에도 ‘이스라엘’의 인물/민족 구분이나 ‘미디안’의 사람/지명 구분 오류가 있으므로 요약 목록에서 충돌 항목을 제외하고, 인물 원자료 색인에는 한계를 명시합니다. 지도 지명과 같은 절에 인물이 등장해도 그 사람이 현장에 있었다고 표시하지 않습니다. 본문별 이동은 별도 검토가 필요합니다.

다국어 범위는 **앱 화면과 성경 책 이름 검색**입니다. 성경 본문 자체를 번역하거나 제공하지 않으며, 성경 읽기 링크는 언어 선택과 관계없이 대한성서공회 **한국어 개역개정**으로 연결됩니다. OpenBible.info의 일부 지명과 사진 설명은 영어 원문으로 표시됩니다. 화면 문구의 여러 언어 번역은 기계번역을 바탕으로 주요 표현을 수정한 초안이므로 출판 수준의 원어민 검수는 별도로 필요합니다.

## 메모 저장 위치와 백업

메모는 입력할 때마다 현재 웹사이트 주소의 브라우저 `localStorage`에 `sermon-context-note:본문주소` 키로 저장됩니다. 서버 계정에는 저장되지 않습니다. 같은 브라우저와 같은 주소에서는 새로고침 후에도 남지만, 다른 브라우저·기기·사이트 주소(포트 포함)와 자동 동기화되지 않으며 브라우저 데이터를 삭제하면 사라질 수 있습니다.

- **이 메모 파일로 저장**: 현재 본문의 메모를 `.md` 파일로 내려받습니다.
- **전체 메모 백업**: 현재 주소에 저장된 모든 본문 메모를 `.json` 파일로 내려받습니다.
- **백업 불러오기**: 다른 브라우저에서도 `.json` 백업을 가져올 수 있습니다. 같은 본문에 기존 메모가 있으면 기존 내용을 유지합니다.

메모 파일은 사용자의 기기에만 내려받으며 앱 서버로 전송되지 않습니다.

## 데이터와 라이선스

- 성경 지명·절 연결·좌표·위치 후보: [OpenBible.info Bible Geocoding Data](https://github.com/openbibleinfo/Bible-Geocoding-Data), **CC BY 4.0**. 원자료 `data/ancient.jsonl`을 `scripts/build_openbible_data.py`로 변환했습니다. 원자료 판본은 [7eb18a5](https://github.com/openbibleinfo/Bible-Geocoding-Data/commit/7eb18a5ee62f27b9b93bd6689ea272d76dd23b8f)로 고정했고 UI에도 표시합니다. 후보 점수와 판정 기록 수는 OpenBible의 값으로, 확률이나 학계 합의율이 아닙니다.
- 현장 사진: 같은 프로젝트의 `modern.jsonl`·`image.jsonl`에서 Wikimedia Commons 원본, 개별 공개 라이선스, 저작자가 확인되는 사진만 선별했습니다. 현재 1,285개 지명 중 805곳에 사진을 연결했습니다. 사진은 OpenBible의 원격 미리보기를 불러오며 지명 카드에 저작자·원본·개별 라이선스를 표시합니다. 고대 시대의 모습이나 후보 지점의 확정 사진을 뜻하지 않습니다.
- 지도 배경: [OpenFreeMap](https://openfreemap.org/) / [OpenStreetMap](https://www.openstreetmap.org/copyright/). 지도 하단에 제공 서비스의 저작자 표시가 나옵니다.
- 지도 라이브러리: MapLibre GL JS 6.11.2. 배포 파일은 `public/vendor/`에 있으며 라이선스는 `MAPLIBRE-LICENSE.txt`입니다.
- 로고: 사용자가 제공한 원본 PNG 파일을 수정하지 않고 `public/assets/ministry-ai-lab-original.png`로 복사했습니다.
- 브라우저 탭 아이콘: `public/favicon.svg`에 같은 색상과 A+ 형태를 작은 크기에 맞게 표현했습니다.
- 링크 미리보기: `index.html`의 Open Graph·Twitter 카드 메타데이터에서 원본 로고 PNG를 사용합니다. 이미지는 공개 GitHub 저장소의 원본 파일로 연결됩니다.
- 장·절 수 검증: [Free Use Bible API의 KJV 목록](https://bible.helloao.org/api/eng_kjv/books.json)의 장별 절 수만 `src/verse-counts.js`에 보관합니다. 한국어 역본과 장절 차이가 있으면 확인이 필요합니다.
- 다국어 성경 책 이름·검색 별칭: [OpenBible.info Bible-Passage-Reference-Parser-Languages](https://github.com/openbibleinfo/Bible-Passage-Reference-Parser-Languages)의 언어별 자료를 `scripts/build_book_names.py`로 `src/book-names.js`에 담았습니다. 원자료 라이선스는 MIT입니다.
- 화면 번역: `src/i18n-source.json`의 한국어·영어 문구를 바탕으로 빌드 시 번역 초안을 생성해 `src/i18n.js`에 저장했고, 주요 표현은 `src/i18n-overrides.js`에서 수정했습니다. 앱 실행 중 외부 번역 서비스를 호출하지 않습니다.
- 성경 본문 전체 텍스트는 앱에 포함하지 않습니다. 대한성서공회 성경 읽기 링크를 제공합니다.
- 인물·장절 색인: [Theographic Bible Metadata](https://github.com/robertrouse/theographic-bible-metadata), **CC BY-SA 4.0**. 고정 판본 `cfb1c485d4da6fb63a69cb3b7f5b0752792f46bc`의 `books.json`·`people.json`·`verses.json`에서 본문 텍스트를 제외하고 인명 ID·이름·장절 연결만 가공했습니다. 파생 파일 [`public/data/people-index.json`](public/data/people-index.json)은 같은 CC BY-SA 4.0 조건으로 제공합니다. 사람과 지명이 같은 절에 등장하는지 확인할 때는 위 OpenBible.info 색인을 사용합니다. [말씀숲 저장소 검토](MALSSUMSOOP_REVIEW.md)도 참고하세요.
- 본문 근거 연결: 같은 Theographic 고정 판본의 `books.json`·`verses.json`·`people.json`·`places.json`·`events.json`을 `scripts/build_passage_evidence.mjs`로 대조해 [`public/data/passage-evidence.json`](public/data/passage-evidence.json)을 만들었습니다. 지명 대조에는 OpenBible 고정 판본의 동일 절·이름·좌표를 함께 요구합니다. 파생 파일도 **CC BY-SA 4.0**으로 제공합니다. 사건 장소는 편집 자료의 분류이고, 동명이소와 인물·민족명 혼동은 [감사 문서](PASSAGE_EVIDENCE_AUDIT.md)에 설명합니다.
- 인물 경로 도형: [United Bible Societies Project MARBLE](https://translation.bible/tools-resources/bible-routes-from-ubs-project-marble/) · Dr. Leen Ritmeyer · **CC BY-SA 4.0**. [원본 저장소](https://github.com/ubsicap/ubs-open-license/tree/main/ubs-bible-routes)의 GeoJSON을 `scripts/build_ubs_routes.mjs`로 가공했습니다. 배포하는 [`public/data/ubs-person-routes.json`](public/data/ubs-person-routes.json)도 CC BY-SA 4.0으로 제공합니다. 원본 파일별 링크는 [UBS 경로 적용 점검표](UBS_ROUTE_AUDIT.md)와 앱 지도 아래에 표시합니다. SVG 파일은 복제하지 않았습니다.
- 성경여행의 순서와 한 문장 요약은 [창세기 12–13장](https://www.biblegateway.com/passage/?search=Genesis+12-13&version=KJV), [출애굽기](https://www.biblegateway.com/passage/?search=Exodus&version=KJV), [민수기](https://www.biblegateway.com/passage/?search=Numbers&version=KJV), [신명기 34장](https://www.biblegateway.com/passage/?search=Deuteronomy+34&version=KJV), [마가복음](https://www.biblegateway.com/passage/?search=Mark&version=KJV), [누가복음 2장](https://www.biblegateway.com/passage/?search=Luke+2&version=KJV), [사도행전 13–21장](https://www.biblegateway.com/passage/?search=Acts+13-21&version=KJV)을 바탕으로 수작업으로 정리했습니다. 각 장면의 지명 ID와 구절은 위 OpenBible.info 고정 판본의 색인에서 검증합니다. 지명의 실제 위치는 추정일 수 있습니다.
- 성경 절 링크는 대한성서공회 [개역개정 성경읽기](https://www.bskorea.or.kr/bible/korbibReadpage.php?book=gen&chap=12&sec=5&version=GAE)의 장·절 주소로 연결합니다. OpenBible.info의 영어 역본 기반 지명 색인을 역으로 모아 보여주므로 한국어 본문의 지명 표기와 다를 수 있습니다.

원자료를 새로 받아 색인을 갱신하려면 다음 명령을 사용합니다.

```powershell
python scripts/build_openbible_data.py
```

또는 이미 다운로드한 `ancient.jsonl`, `modern.jsonl`, `image.jsonl` 파일 경로를 순서대로 전달할 수 있습니다.

인물 색인을 재생성할 때는 Theographic 저장소를 별도 디렉터리에 내려받아 위에 적힌 커밋으로 고정한 다음 실행합니다. 이 명령은 `people-index.json`과 `PERSON_INDEX_AUDIT.md`를 함께 갱신합니다.

본문 근거 색인은 다음 명령으로 다시 만들 수 있습니다. 고정 판본 원자료가 없으면 저장소 밖 임시 폴더에 내려받습니다.

```powershell
node scripts/build_passage_evidence.mjs
```

```powershell
git clone https://github.com/robertrouse/theographic-bible-metadata.git "$env:TEMP\theographic-review"
git -C "$env:TEMP\theographic-review" checkout cfb1c485d4da6fb63a69cb3b7f5b0752792f46bc
node scripts/build_people_index.mjs "$env:TEMP\theographic-review"
```

UBS 경로 도형을 재생성할 때는 별도 저장소의 고정 커밋 `33dcc8c671511151551804e073f1d461bc5d5b1a`를 사용합니다. 이 명령은 경로 JSON과 점검표를 함께 갱신합니다.

```powershell
git clone --filter=blob:none --sparse https://github.com/ubsicap/ubs-open-license.git "$env:TEMP\ubs-route-review"
git -C "$env:TEMP\ubs-route-review" sparse-checkout set ubs-bible-routes
git -C "$env:TEMP\ubs-route-review" checkout 33dcc8c671511151551804e073f1d461bc5d5b1a
node scripts/build_ubs_routes.mjs "$env:TEMP\ubs-route-review"
```

## 확인

```powershell
npm test
npm run build
npm run audit:coverage
```
