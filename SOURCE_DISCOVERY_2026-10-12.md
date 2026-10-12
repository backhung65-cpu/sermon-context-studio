# 「본문의 장소」 추가 원자료 조사 — 2026-10-12

## 결론

기존 Theographic·OpenBible·UBS 선만으로는 목회자의 본문 읽기와 주석 연구를 채우기 어렵다. 특히 동명이소 판별, 절별 해설, 본문 속 현장과 단순 언급의 구분에 필요한 공개 원자료를 새로 확인했다. 자료의 존재와 이용 조건을 확인한 것이며, **아직 앱에 수입하거나 한국어 전문 검수를 끝낸 것은 아니다.**

| 우선순위 | 원자료 | 실제 확인한 파일·범위 | 앱에서 맡을 일 | 이용 조건·주의 |
| --- | --- | --- | --- | --- |
| 1 | [Aquifer Open Study Notes](https://github.com/BibleAquifer/AquiferOpenStudyNotes) | `eng/json/01`–`66.content.json` 66권. 출애굽기 파일 466개, 열왕기하 파일 347개 주석 레코드. 절 또는 절 범위의 `index_reference`, 원문 HTML, 본문 연결 포함 | 성경을 읽는 화면의 절별 **출처가 보이는 참고 주석** | [원본 고지](https://github.com/BibleAquifer/AquiferOpenStudyNotes/blob/main/README.md): Mission Mutual이 Tyndale Open Study Notes를 각색, CC BY-SA 4.0. 한국어는 저장소에 없음. 일부 샘플의 `review_level: Professional`은 원자료 메타데이터이지 이 앱의 검수 완료 표시가 아님 |
| 2 | [STEPBible TIPNR·TVTMS](https://github.com/STEPBible/STEPBible-Data) | `Proper Nouns`의 약 8.2 MB TSV, 고유명사 ID·원어·해당 절·위치. `Versification`에는 장절 체계 변환 자료 | 동명이인·동명 지명을 **동일한 문자열이 아니라 고유 ID와 절로** 판별, 장절 체계 차이 보정 | CC BY 4.0. TIPNR의 장·단문 인물 설명은 제작자의 안내상 Claude 3으로 작성되어 있으므로 자동으로 주석에 수입하지 않음. 지리 좌표도 OpenBible 기반이 많아 독립된 위치 검증으로 세지 않음 |
| 3 | [Aquifer ACAI](https://github.com/BibleAquifer/ACAI) | `people/json`, `places/json`의 개체 ID, 명시 언급, 일부 대명사 지시 대상, 지역 관계, 자료별 좌표 | 절 안의 **누가·어디가 언급되는지** 더 세밀하게 인덱싱; 인물과 장소를 구별한 연구 탐색 | [원본 고지](https://github.com/BibleAquifer/ACAI/blob/main/README.md): CC BY-SA 4.0. STEPBible·OpenBible·Theographic 등을 합친 2차 데이터라 세 출처와 독립적인 4번째 증거가 아님. 구약 장절은 히브리어 `ORG` 체계여서 화면 장절로 변환 필요. 함께 등장해도 방문·여정의 증거는 아님 |
| 4 | [Biblica Study Notes](https://github.com/BibleAquifer/BiblicaStudyNotes) | 영어 66권 JSON. 출애굽기 파일 10개, 열왕기하 파일 7개 큰 단락 노트 | 한 장·단락을 읽기 전의 **줄거리와 맥락 개요** | [원본 고지](https://github.com/BibleAquifer/BiblicaStudyNotes/blob/main/README.md): CC BY-SA 4.0. 세부 절 주석보다 넓은 범위이고 `review_level: None` 샘플을 검수 완료로 표현하지 않음 |
| 5 | [Aquifer Open Bible Dictionary](https://github.com/BibleAquifer/AquiferOpenBibleDictionary) | 영어와 다국어의 항목별 JSON·Markdown | 지명·인물·시대 용어의 사전 카드. Easton의 19세기 설명을 보완 | [원본 고지](https://github.com/BibleAquifer/AquiferOpenBibleDictionary/blob/main/README.md): Tyndale Open Bible Dictionary 각색, CC BY-SA 4.0. 지명-사전 항목 매칭은 별도 확인 |
| 6 | [OpenBible.info 전체 원자료](https://github.com/openbibleinfo/Bible-Geocoding-Data) | 기존 앱이 쓰는 자료의 `ancient`, `modern`, `source`, `geometry`, `image` 원본 필드 재조사 | 각 지명의 대안 위치·확신도·원출처·지역 범위·사진 권리를 UI에 더 충실히 노출 | 핵심 지리 자료 CC BY 4.0. OpenStreetMap 도형 ODbL, **사진은 개별 라이선스** 확인. 새 독립 원자료가 아니라 기존 자료 활용도 개선 |
| 7 | [Pleiades](https://pleiades.stoa.org/downloads) | 고대 지명·좌표·참조 자료의 JSON/CSV 배포 | 지명 좌표의 외부 비교와 고대 도시 검색 | CC BY 3.0. 성경 절이나 인물 여정 자료는 아니므로 보조 검증만 가능 |

## 실제 본문 샘플 대조

- **출애굽기 3:1**: [Aquifer Open Study Notes 출애굽기 JSON](https://github.com/BibleAquifer/AquiferOpenStudyNotes/blob/main/eng/json/02.content.json)에 호렙과 시내산의 명칭 관계를 설명하는 해당 절 노트가 있다. [TIPNR](https://github.com/STEPBible/STEPBible-Data/tree/master/Proper%20Nouns)는 호렙을 `Exo.3.1`의 지명으로 기록한다. 이 조합으로 “현재 현장: 호렙/시내산의 후보 위치”와 “대화에서 언급한 애굽”을 다른 종류의 장소로 표현할 근거를 마련할 수 있다. 산의 현대 좌표는 여전히 학설상 후보로 표기한다.
- **열왕기하 4장**: 같은 [Aquifer 열왕기하 JSON](https://github.com/BibleAquifer/AquiferOpenStudyNotes/blob/main/eng/json/12.content.json)에 4:8–37의 수넴, 4:38의 길갈, 4:42–44의 음식 사건 노트가 각각 있다. TIPNR에는 수넴 `2Ki.4.8`, 길갈의 특정 고유 ID `2Ki.4.38`, 바알 살리사 `2Ki.4.42`가 별도 지명으로 있다. **바알 살리사는 4:42에 등장하는 사람의 출발지**이며 엘리사가 그곳으로 이동했다고 뜻하지 않는다.
- **자료끼리 충돌하는 사례**: ACAI `place:Gilgal.3`은 [JSON](https://github.com/BibleAquifer/ACAI/blob/main/places/json/Gilgal.3.json)에서 열왕기하 4:38을 연결하면서, 표시 이름을 “near Jericho”로 주지만 원자료 좌표 `32.029737, 35.222604`와 출처 TIPNR ID `Gilgal@2Ki.2.1-`를 함께 준다. TIPNR은 이 좌표를 별도의 길갈로 다룬다. **표시 이름·위치·절 연결을 출처마다 대조해 충돌 카드로 남겨야 한다.** ACAI 항목을 정답으로 일괄 덮어쓰면 이전 길갈 오류를 반복한다.

## 주석과 여정을 결합하는 규칙

1. 화면의 기본 순서는 `본문 읽기 → 그 절의 지명·인물 언급 → 관련 주석 → 지도 후보 → 내 메모`이다. 주석은 `자료명 / 원문 링크 / 연결 절 / 번역·편집 여부`를 보여 준다.
2. 지명은 `현장`, `출발지`, `목적지`, `비교·회상`, `영역`, `단순 언급`을 분리한다. 지명 언급·인물 언급·UBS 경로 선만으로 **이동했다**고 판정하지 않는다.
3. 여정에는 `주체 인물 ID + 출발·도착 지명 ID + 정확한 본문 절 + 이동 표현 + 편집자 판정`이 모두 있어야 한다. 미확인 구간은 선을 표시하지 않거나 원본 도형으로만 구분한다. 현재 공개 자료 중 모든 성경 인물의 구간별 실제 이동을 검증 완료 상태로 제공하는 단일 데이터셋은 확인하지 못했다.
4. 한국어 주석은 자동 번역 원문을 무검수로 공개하지 않는다. 원자료의 영어 노트와 출처를 먼저 표시하거나, 한국어 각색본마다 번역자·본문 대조·변경 내역을 기록하고 같은 공유 조건을 따른다. 개역개정 전문을 수입하지 않는다.
5. 원본의 버전·커밋·항목 ID·변환 규칙을 데이터 빌드 시 고정한다. 원자료의 `review_level`을 앱의 검수 배지로 복사하지 않는다.

## 바로 개발할 수 있는 첫 묶음

1. `AquiferOpenStudyNotes`의 출애굽기 3장과 열왕기하 4장 레코드를 로컬 수입하여 정확한 절 범위로 연결한다. 성경 텍스트는 현재 합법적으로 제공 중인 판본/대한성서공회 외부 링크를 유지한다.
2. TIPNR의 이 두 장의 **지명·인물 ID와 절 목록만** 수입하고 현재 OpenBible/Theographic ID와 대응표를 만든다. 한 지명이 둘 이상의 ID와 맞으면 자동 병합하지 않는다.
3. 두 본문에서 `현장/언급/출발지` 판정을 기록한 수동 검수 파일을 만든다. 사용자 화면은 검수 전까지 후보로 명시한다.
4. 그다음 66권 전체에 대해 자료 정합성 검사(절 번호, 고유 ID, 주석 범위, 출처 누락, 충돌)를 자동 실행하고, 실제 목회자 검토는 본문 묶음별로 순차 진행한다.

## 추가로 조사했지만 바로 수입하지 않을 자료

- [eBible 한국어 성경 1910](https://ebible.org/details.php?id=kor): 원 배포자가 Public Domain으로 명시한다. 현재 앱의 공개 한국어 본문 출처와 같다. 2026-10-12에 제공처의 **USFM ZIP을 직접 열어** 66권·1,188장·절 표시 30,991개를 확인했다. 이는 현재 VPL의 수와 같다. USFM에서도 베드로전서 5장이 없고 창세기 30장은 31절까지만 있어, 누락 111절은 VPL 변환기의 오류만은 아니다. 같은 제공처의 다른 형식으로 자동 보완된다고 가정하지 않는다. 한 판본의 빈 절을 다른 저작권 판본으로 조용히 메우지 않고 [본문 출처·권리](https://ebible.org/kor/copyright.htm)를 표시한다.
- [unfoldingWord Translation Notes/Questions](https://git.door43.org/unfoldingWord/en_tn): 영어 66권 TSV와 CC BY-SA 4.0 라이선스가 확인된다. 출애굽기 3:1 및 열왕기하 4장의 기록도 있다. 주목적이 **번역 결정의 도움**이므로 설교 주석 대신 “번역·문장 이해 참고”로 분리한다. [Study Notes](https://git.door43.org/unfoldingWord/en_sn)는 현 저장소에 신약 27권만 있고 구약이 없다.
- [OpenBible Cross References](https://www.openbible.info/labs/cross-references/): 약 34만 건 다운로드가 가능하다. 관련 구절 탐색에는 유용하지만 같은 주제·단어·사건을 묶는 자료라 **지명 현장이나 여정 증거가 아니다**.
- [Biblica Open Bible Maps](https://github.com/BibleAquifer/BiblicaOpenBibleMaps): CC BY-SA 4.0의 공개 지도 도판이다. 인쇄 지도 비교·읽기에는 유용하나 지도 그림을 절별 인물 이동 데이터로 오해해서는 안 된다.
- [말씀숲 제3자 고지](https://github.com/yongsuk77-art/malssumsoop/blob/main/THIRD_PARTY_NOTICES.md): 베들레헴의 `.bdb/.sdb/.cdb/.dct/.hdb` 파일은 저장소와 배포물에 없다. 소유자가 로컬에서 가져오는 구조만 참고할 수 있으며 그 파일 내용을 앱에 재배포할 근거가 아니다.
- 검색한 “아스트라 성경 지도” 명칭으로는 출판자·자료 파일·이용 허락을 특정하지 못했다. 같은 자료의 다른 이름인지 URL·정식 명칭이 확인되기 전에는 수입 대상으로 확정하지 않는다.
