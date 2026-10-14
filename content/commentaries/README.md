# 주석 자료 넣는 곳

`library` 폴더에 Markdown 또는 PDF 파일을 넣고 `npm run import:commentaries`를 실행하면 장절별 JSON 색인이 생성됩니다. 이 과정은 AI를 사용하지 않습니다.

바로 복사해 쓸 수 있는 예시는 [`templates/commentary-template.md`](templates/commentary-template.md)와 [`templates/pdf-index.template.json`](templates/pdf-index.template.json)에 있습니다.

## 가장 간단한 파일명 방식

- `library/출애굽기 3장__나의 출애굽기 주석.md`
- `library/요한복음 1장 1-5절__말씀 연구.pdf`

파일명의 `__` 앞부분을 성경 주소로 읽습니다. 한 파일 전체가 그 본문 범위에 연결됩니다.

## 한 MD 파일에 여러 본문 넣기

장절을 대괄호 머리말로 표시합니다.

```md
---
title: 출애굽기 연구
author: 홍길동
source: 개인 연구 원고
license: 저자 사용 허락
language: ko
---

## [출애굽기 3:1-6] 불붙는 떨기나무

여기에 주석을 씁니다.

## [출애굽기 3:7-12] 부르심과 약속

다음 주석을 씁니다.
```

## PDF의 페이지별 장절 연결

PDF와 같은 위치에 `파일명.pdf.index.json`을 둡니다.

```json
{
  "title": "출애굽기 강해",
  "author": "홍길동",
  "source": "개인 연구 원고",
  "license": "저자 사용 허락",
  "language": "ko",
  "sections": [
    { "reference": "출애굽기 3:1-6", "pages": "12-14", "title": "떨기나무" },
    { "reference": "출애굽기 3:7-12", "pages": "15-18", "title": "부르심" }
  ]
}
```

`pages`는 `12`, `12-14`, `12-14,18` 형식을 지원합니다. PDF에 선택 가능한 글자가 없으면 색인하지 않고 감사 보고서에 오류를 남깁니다. OCR한 PDF를 다시 넣어야 합니다.

페이지가 0이거나, 끝 페이지가 실제 PDF 쪽수를 넘거나, `18-12`처럼 거꾸로 적힌 범위도 빌드 오류로 처리합니다. 성경에 존재하지 않는 장절도 색인하지 않습니다.

## 공개 전 확인

이 폴더의 글은 빌드 결과에 포함됩니다. 직접 작성했거나 공개·배포 권한이 있는 자료만 넣고, 저자·출처·이용 조건을 적어 주세요. 원본 파일 자체는 배포 폴더에 복사하지 않으며 추출한 본문과 페이지 번호만 색인합니다.

