# 공개 한국어 성경 본문 점검

## 출처와 사용 범위

- 원자료: [eBible.org Korean Bible 1910](https://ebible.org/find/details.php?id=kor)의 [`kor_vpl.zip`](https://ebible.org/Scriptures/kor_vpl.zip). 제공자는 Public Domain으로 표기합니다. 이 표기와 판본명은 제공처의 정보이며, 앱이 개역개정이나 개역한글판과 동일한 번역이라고 주장하지 않습니다.
- 가져온 자료: VPL의 한국어 절별 텍스트. [`scripts/import_kor1910.py`](scripts/import_kor1910.py)로 66권을 책별 JSON으로 변환했습니다. 텍스트 자체를 의역·수정하지 않았습니다. 원본 ZIP 및 VPL 파일의 SHA-256은 [`source.json`](public/data/kor1910/source.json)에 있습니다.
- 앱의 시대 설명·장면 요약은 별도의 편집 자료입니다. `1910 공개 번역 본문`, `개역개정 외부 읽기`, `배경 참고 링크`를 화면에서 분리합니다.

## 완전성

VPL을 그대로 읽으면 **66권, 1,188장, 30,991절**입니다. 앱의 입력 검증에 사용하는 KJV 장절표는 66권, 1,189장, 31,102절입니다. `node scripts/audit_kor1910.mjs`로 두 장절표를 비교하면 **43개 장의 범위·절 수가 다르며, 그 가운데 베드로전서 5장은 VPL에 없습니다**. 일부 장은 말미가 크게 잘려 있습니다. 예를 들어 창세기 30장은 32–43절, 시편 118편은 10–29절, 골로새서 4장은 10–18절이 이 파일에 없습니다. 이는 번역 차이로 단정할 수 없는 원자료의 누락입니다.

`node scripts/audit_kor1910.mjs --write`는 66권 파일의 모든 행과 KJV 장절표 31,102절을 전수 비교합니다. 현재 결과는 한국어 원자료 **30,991절**, 원자료 누락 **111절**, 범위 밖 절 **0건**, 빈 본문 **0건**이며 전체 목록은 [`kor1910-audit.json`](public/data/kor1910-audit.json)에 기록합니다.

앱은 누락 111절을 [eBible.org KJV 1769](https://ebible.org/bible/details.php?id=eng-kjv2006)의 같은 장절로 보완합니다. 이 본문은 한국어로 표시하지 않고 각 절 아래에 `영문 KJV 대체 표시`를 붙입니다. [`kjv-fallback.json`](public/data/kjv-fallback.json)에는 원본 ZIP의 SHA-256, 라이선스 표기와 보완 목적을 함께 기록했습니다. 두 원자료를 합친 뒤 31,102절에 빈 본문이 없는지 테스트합니다.

## 출처별 역할

| 자료 | 앱에서의 역할 | 주의 |
| --- | --- | --- |
| [eBible.org 한국어 성경 1910](https://ebible.org/find/details.php?id=kor) | 절별 공개 한국어 본문 | 옛 표현과 누락 있음 |
| [eBible.org KJV 1769](https://ebible.org/bible/details.php?id=eng-kjv2006) | 한국어 원자료의 111절 누락 보완 | 영문으로 명확히 표시 · 영국 외 Public Domain 표기 |
| [대한성서공회 성경 읽기](https://www.bskorea.or.kr/bible/korbibReadpage.php?version=GAE) | 개역개정 번역 비교 외부 링크 | 본문을 앱에 복제하지 않음 |
| [미국성서공회 성경 자료](https://www.americanbible.org/engage/bible-resources/) 및 [Bible Odyssey](https://www.bibleodyssey.org/) | 검수된 장의 추가 읽기 링크 | 저작권 있는 외부 설명을 앱에 복제하지 않음 |
| [Theographic](https://github.com/robertrouse/theographic-bible-metadata) 및 [OpenBible.info](https://www.openbible.info/geo/) | 01번 지명 도구의 인물·지명 색인 | 역사 연대나 본문 텍스트의 검수 자료로 자동 승격하지 않음 |

1910 공개 번역의 판본 계보와 번역 내용의 전문 검수는 남은 작업입니다. 현대 한국어 역본을 앱 안에서 직접 제공하려면 별도 이용 허락이 필요합니다.
