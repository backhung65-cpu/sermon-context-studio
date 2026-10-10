# 말씀숲 저장소 검토와 적용 범위

검토 대상: [yongsuk77-art/malssumsoop](https://github.com/yongsuk77-art/malssumsoop), 커밋 `21b6896e9a139d56a9085f625f60dc5ccfa6a554`.

## 확인한 것

- [README](https://github.com/yongsuk77-art/malssumsoop/blob/main/README.md)는 원문·형태 분석, 다중 역본 비교, 베들레헴 파일 가져오기, 데스크톱 3단 화면과 모바일 탭, 오프라인 PWA를 설명한다.
- [제3자 자료 고지](https://github.com/yongsuk77-art/malssumsoop/blob/main/THIRD_PARTY_NOTICES.md)에 따르면 **베들레헴 `.bdb`·`.sdb`·`.cdb`·`.dct`·`.hdb` 파일은 저장소와 배포물에 없다.** 사용자가 파일을 직접 선택하면 브라우저 IndexedDB에 보관한다. 애플리케이션 코드는 MIT이며, 포함된 공개 성경·원문 자료에는 각각 별도 조건이 있다.
- [베들레헴 가져오기 코드](https://github.com/yongsuk77-art/malssumsoop/blob/main/src/lib/bethlehem.ts)는 파일 확장자·크기·SQLite 테이블을 확인하고 로컬 DB로 저장한다. 파일을 가져온다고 제3자 앱에 그 자료를 재배포할 수 있는 권리가 생기지는 않는다.
- 이 저장소에는 성경 인물별 검수된 이동 경로 데이터가 없다. 원문·번역본 비교 앱의 자료를 지도상의 여행 기록으로 간주할 수 없다.

## 본문의 장소에 반영한 원칙

1. 인물 목록을 7개 여정 카드로 축소하지 않는다. 별도 공개 인명·장절 자료로 **인물 찾기**를 만들고, 검수된 이동 여정은 그 아래에 따로 둔다.
2. 말씀숲의 정보 구조에서 **목록 → 선택한 본문/인물의 상세 → 근거 열기**라는 단계적 탐색을 참고했다. 화면 코드나 시각 디자인을 복사하지 않았다.
3. 베들레헴 번역본·주석·찬송가 파일은 현재 앱에 포함하지 않는다. AI 기능도 추가하지 않는다. 사용자 보유 파일의 기기 내 읽기는 자료 형식·개별 이용권을 검토한 뒤 별도 기능으로 판단할 수 있다.
4. 현재 인명 색인은 [Theographic](https://github.com/robertrouse/theographic-bible-metadata)의 **CC BY-SA 4.0** 인명·구절 메타데이터와 [OpenBible.info](https://github.com/openbibleinfo/Bible-Geocoding-Data)의 **CC BY 4.0** 지명 색인을 결합했다. 원문 전체 텍스트를 복제하지 않았고, 결합 결과를 이동 경로라고 부르지 않는다. [66권별 범위 점검](PERSON_INDEX_AUDIT.md)에 수치를 남긴다.

## 남은 편집 검수

- 같은 이름을 가진 인물의 한국어 구분명과 주요 인물 한국어 표기 확대
- 인물별 이동을 **출발·도착·경유·귀환**으로 나눠 본문 문맥에서 확인
- 지명 후보의 불확실성과 번역본별 지명 표기 차이 기록
- 각 여정에 검토자·검토 날짜·근거 절·연결 방식 표시

현재 3,067개 인명 기록의 장절 연결은 기계적으로 점검했지만, **3,067명의 이동을 사람이 검수했다는 뜻이 아니다.** 공개된 이동 여정은 7개다.
