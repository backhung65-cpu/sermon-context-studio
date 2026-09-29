# 본문의 장소 · 목회 AI 연구소

설교 본문 주소를 입력해 성경 지명을 지도와 근거 링크로 살펴보는 첫 단계 웹앱입니다. 제공된 **목회 AI 연구소 원본 로고 이미지**를 파일 그대로 연결하고, `MINISTRY_AI_LAB_DESIGN_SYSTEM_v2.0_SOFT_FUSION`을 시각 참고 자료로 적용했습니다. 모든 절에 지도 지점이 있는 것은 아닙니다. [전수 검증 결과](COVERAGE_AUDIT.md)를 먼저 확인해 주세요.

배포 주소: [sermon-context-studio.vercel.app](https://sermon-context-studio.vercel.app)

## 실행

```powershell
cd "C:\Users\백형진\Documents\0-미라클ai목회연구소\목회ai연구소\sermon-context-studio"
npm start
```

브라우저에서 `http://127.0.0.1:4173`을 엽니다. 포트를 바꾸려면 `PORT` 환경변수를 설정합니다. Node.js 20 이상을 권장합니다. 앱 실행에 npm 패키지 설치는 필요하지 않습니다.

정적 배포 파일을 만들려면 `npm run build`를 실행합니다. 결과는 `dist/`에 생성되며 `npm run preview`로 확인할 수 있습니다.

## 현재 범위

- 66권의 한글 책 이름·약어와 일반적인 영문 책 이름으로 장·절, 장 범위, 장을 넘는 절 범위 검색
- 예: `창 12`, `행 16:6-15`, `창 12:8-13:3`, `사 10장 15절`
- 첫 화면은 `행 16:6-15`를 예시로 본문 주소 → 지명 확인 → 실제 지도 위치 확인 순서를 보여줍니다. 드로아·사모드라게·빌립보 세 지점은 검색 결과 중 일부이며, 점을 연결한 가상 이동 경로는 그리지 않습니다. 단계와 지도 핀의 짧은 등장 모션은 움직임 줄이기 설정에서 꺼집니다.
- 66권 1,189장의 장별 절 수(KJV 기준)로 존재하지 않는 장·절 입력 검사
- 본문에 연결된 지명을 지도와 절 목록으로 표시
- 직접 연결된 지명이 없는 절에는 빈 지도 안내를 표시하고, 같은 장의 참고 지명은 별도 버튼으로 탐색
- 위치 후보가 여러 곳이면 후보 수를 표시하고 원자료로 연결
- 이용 조건이 확인된 현재 지역 사진을 지명 카드에 표시하고 저작자·원본·라이선스 링크 제공
- 일부 주요 지명의 한글 이름 제공; 나머지는 원자료 영문 이름으로 표시
- 본문별 설교 메모를 해당 브라우저에 자동 저장, 저장된 본문 목록에서 다시 열기
- 현재 메모 Markdown 파일 저장, 전체 메모 JSON 백업·불러오기(기존 메모는 덮어쓰지 않음)
- 인쇄용 레이아웃

현재 버전은 지명 연구의 출발점입니다. **AI 기능은 제공하지 않습니다.** 인물·연표와 자동 해설도 포함하지 않았습니다. 원자료가 열 가지 영어 역본의 지명 언급을 합친 것이므로 한국어 본문과 표기가 다를 수 있습니다. 한 역본에만 나타나는 이름을 줄이기 위해 다섯 역본 이상에서 확인된 언급만 색인에 넣었습니다. 위치가 여러 후보로 제시된 경우 지도에는 원자료 점수가 가장 높은 후보의 대표 좌표 하나를 표시합니다. 이는 확정 위치를 뜻하지 않습니다.

## 메모 저장 위치와 백업

메모는 입력할 때마다 현재 웹사이트 주소의 브라우저 `localStorage`에 `sermon-context-note:본문주소` 키로 저장됩니다. 서버 계정에는 저장되지 않습니다. 같은 브라우저와 같은 주소에서는 새로고침 후에도 남지만, 다른 브라우저·기기·사이트 주소(포트 포함)와 자동 동기화되지 않으며 브라우저 데이터를 삭제하면 사라질 수 있습니다.

- **이 메모 파일로 저장**: 현재 본문의 메모를 `.md` 파일로 내려받습니다.
- **전체 메모 백업**: 현재 주소에 저장된 모든 본문 메모를 `.json` 파일로 내려받습니다.
- **백업 불러오기**: 다른 브라우저에서도 `.json` 백업을 가져올 수 있습니다. 같은 본문에 기존 메모가 있으면 기존 내용을 유지합니다.

메모 파일은 사용자의 기기에만 내려받으며 앱 서버로 전송되지 않습니다.

## 데이터와 라이선스

- 성경 지명·절 연결·좌표: [OpenBible.info Bible Geocoding Data](https://github.com/openbibleinfo/Bible-Geocoding-Data), **CC BY 4.0**. 원자료 `data/ancient.jsonl`을 `scripts/build_openbible_data.py`로 변환했습니다. UI와 인쇄 화면에 출처를 표시합니다.
- 현장 사진: 같은 프로젝트의 `modern.jsonl`·`image.jsonl`에서 Wikimedia Commons 원본, 개별 공개 라이선스, 저작자가 확인되는 사진만 선별했습니다. 현재 1,285개 지명 중 805곳에 사진을 연결했습니다. 사진은 OpenBible의 원격 미리보기를 불러오며 지명 카드에 저작자·원본·개별 라이선스를 표시합니다. 고대 시대의 모습이나 후보 지점의 확정 사진을 뜻하지 않습니다.
- 지도 배경: [OpenFreeMap](https://openfreemap.org/) / [OpenStreetMap](https://www.openstreetmap.org/copyright/). 지도 하단에 제공 서비스의 저작자 표시가 나옵니다.
- 지도 라이브러리: MapLibre GL JS 6.11.2. 배포 파일은 `public/vendor/`에 있으며 라이선스는 `MAPLIBRE-LICENSE.txt`입니다.
- 로고: 사용자가 제공한 원본 PNG 파일을 수정하지 않고 `public/assets/ministry-ai-lab-original.png`로 복사했습니다.
- 브라우저 탭 아이콘: `public/favicon.svg`에 같은 색상과 A+ 형태를 작은 크기에 맞게 표현했습니다.
- 링크 미리보기: `index.html`의 Open Graph·Twitter 카드 메타데이터에서 원본 로고 PNG를 사용합니다. 이미지는 공개 GitHub 저장소의 원본 파일로 연결됩니다.
- 장·절 수 검증: [Free Use Bible API의 KJV 목록](https://bible.helloao.org/api/eng_kjv/books.json)의 장별 절 수만 `src/verse-counts.js`에 보관합니다. 한국어 역본과 장절 차이가 있으면 확인이 필요합니다.
- 성경 본문 전체 텍스트는 앱에 포함하지 않습니다. 대한성서공회 성경 읽기 링크를 제공합니다.

원자료를 새로 받아 색인을 갱신하려면 다음 명령을 사용합니다.

```powershell
python scripts/build_openbible_data.py
```

또는 이미 다운로드한 `ancient.jsonl`, `modern.jsonl`, `image.jsonl` 파일 경로를 순서대로 전달할 수 있습니다.

## 확인

```powershell
npm test
npm run build
npm run audit:coverage
```
