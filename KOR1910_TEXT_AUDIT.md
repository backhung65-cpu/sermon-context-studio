# 공개 한국어 성경 본문 점검

## 출처와 사용 범위

- 원자료: [eBible.org Korean Bible 1910](https://ebible.org/find/details.php?id=kor)의 [`kor_vpl.zip`](https://ebible.org/Scriptures/kor_vpl.zip). 제공자는 Public Domain으로 표기합니다. 이 표기와 판본명은 제공처의 정보이며, 앱이 개역개정이나 개역한글판과 동일한 번역이라고 주장하지 않습니다.
- 가져온 자료: VPL의 한국어 절별 텍스트. [`scripts/import_kor1910.py`](scripts/import_kor1910.py)로 66권을 책별 JSON으로 변환했습니다. 텍스트 자체를 의역·수정하지 않았습니다. 원본 ZIP 및 VPL 파일의 SHA-256은 [`source.json`](public/data/kor1910/source.json)에 있습니다.
- 앱의 시대 설명·장면 요약은 별도의 편집 자료입니다. `1910 공개 번역 본문`, `개역개정 외부 읽기`, `배경 참고 링크`를 화면에서 분리합니다.

## 완전성

VPL을 그대로 읽으면 **66권, 1,188장, 30,991절**입니다. 앱의 입력 검증에 사용하는 KJV 장절표는 66권, 1,189장, 31,102절입니다. `node scripts/audit_kor1910.mjs`로 두 장절표를 비교하면 **43개 장의 범위·절 수가 다르며, 그 가운데 베드로전서 5장은 VPL에 없습니다**. 일부 장은 말미가 크게 잘려 있습니다. 예를 들어 창세기 30장은 32–43절, 시편 118편은 10–29절, 골로새서 4장은 10–18절이 이 파일에 없습니다. 이는 번역 차이로 단정할 수 없는 원자료의 누락입니다.

반면 현재 시대 장면을 편집 검수한 **창세기 12장, 출애굽기 3장, 열왕기하 4장, 누가복음 2장, 사도행전 16장**의 모든 절은 VPL에 들어 있습니다. 앱은 요청한 절이 없으면 본문을 꾸며 넣지 않고 누락을 표시하며, 각 절에서 대한성서공회 개역개정 읽기로 이동할 수 있습니다. 다른 구간은 독립적인 원문 대조 전까지 이 데이터만으로 완전성을 보장하지 않습니다.

## 출처별 역할

| 자료 | 앱에서의 역할 | 주의 |
| --- | --- | --- |
| [eBible.org 한국어 성경 1910](https://ebible.org/find/details.php?id=kor) | 절별 공개 한국어 본문 | 옛 표현과 누락 있음 |
| [대한성서공회 성경 읽기](https://www.bskorea.or.kr/bible/korbibReadpage.php?version=GAE) | 개역개정 번역 비교 외부 링크 | 본문을 앱에 복제하지 않음 |
| [미국성서공회 성경 자료](https://www.americanbible.org/engage/bible-resources/) 및 [Bible Odyssey](https://www.bibleodyssey.org/) | 검수된 장의 추가 읽기 링크 | 저작권 있는 외부 설명을 앱에 복제하지 않음 |
| [Theographic](https://github.com/robertrouse/theographic-bible-metadata) 및 [OpenBible.info](https://www.openbible.info/geo/) | 01번 지명 도구의 인물·지명 색인 | 역사 연대나 본문 텍스트의 검수 자료로 자동 승격하지 않음 |

1910 공개 번역의 판본 계보 및 전체 장절의 교차 검증은 남은 작업입니다. 현대 한국어 역본을 앱 안에서 직접 제공하려면 별도 이용 허락이 필요합니다.
