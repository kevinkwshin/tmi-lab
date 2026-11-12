# CV와 연구 실적 관리

CV 페이지, 영어 PDF, LaTeX 원고와 BibTeX를 같은 데이터에서 생성합니다. 기존 연구실 슬라이드와 GitHub Pages 배포를 유지합니다.

## 입력 방법

저장소 폴더에서 Node.js 22 이상으로 실행합니다. 별도 npm 패키지 설치는 필요하지 않습니다.

```sh
npm run cv:edit
```

터미널에 표시되는 로컬 주소를 엽니다. 이 편집기는 내 컴퓨터에서만 실행되며 사이트에 관리 서버를 배포하지 않습니다. 저장된 내용은 GitHub에 반영할 때 공개 CV의 데이터가 됩니다.

- **논문:** DOI를 입력해 Crossref의 제목·전체 저자·학술지·발행정보를 불러오고, 본인 논문인지 확인한 뒤 저장합니다. 공동 제1저자·교신저자는 원문을 확인해 직접 지정합니다. 서지 메타데이터만으로 기여관계를 추정하지 않습니다.
- **학회발표:** 제목, 저자 명단, 학회명, 발표일, 구연/포스터, 발표자와 선택적인 DOI/링크를 입력합니다. 연도만 알려진 과거 발표는 연도만 보존합니다.
- **과제:** 과제명, 지원기관·사업명, 기간, 과제번호, 본인 역할(PI/Co-I/PM 등)을 입력합니다. 연구비는 공개할 수 있는 금액만 입력합니다. 맡은 과제의 전체 금액인지 본인 배정액인지 단위를 포함해 명확히 적습니다.

기존 항목의 수정·삭제도 같은 화면에서 처리합니다. JSON이나 생성된 BibTeX를 직접 편집할 필요가 없습니다. Codex에 “이 DOI 논문 추가”, “이 학회 구연 추가”, “이 과제 기간 변경”이라고 요청해도 같은 데이터 파일에 반영할 수 있습니다.

저장 후 다음 명령으로 확인합니다.

```sh
npm test
npm run build
```

`dist/cv/index.html`은 한국어 CV, `dist/en/cv/index.html`은 영어 CV입니다. `dist/publications.bib`과 `dist/cv/keewon-shin-cv.tex`도 함께 생성됩니다. `dist/`는 생성 결과이므로 Git에 넣지 않습니다. 저장한 변경을 검토하고 GitHub에 반영하면 기존 Actions가 사이트와 PDF를 다시 배포합니다.

## PDF 생성

```sh
npm run setup:tex
npm run build:pdf
```

첫 명령은 공식 Tectonic 0.17.0 배포본의 SHA-256을 검증하고 저장소 안 `.tools/`에 설치합니다. 시스템 설치는 하지 않습니다. 처음 PDF를 만들 때 TeX 패키지 다운로드를 위한 인터넷 연결이 필요합니다. 다른 설치본을 쓰려면 `TECTONIC`에 실행 파일 경로를 지정합니다. 일반 `npm run build`는 네트워크·TeX 설치 없이 작동하며, PDF가 없는 미리보기에서는 PDF 다운로드 링크를 표시하지 않습니다.

## 자동으로 바뀌는 것

기존 GitHub Actions 스케줄을 재사용합니다.

| 정보 | 경로 | 범위 |
|---|---|---|
| Scholar 인용 지표 | 매일 기존 프로필 조회 | 인용 수·h-index 등. 논문 원본이나 저자 기여정보를 가져오는 API가 아닙니다. |
| 신규 저널 논문 발견 | 매주 월요일 Crossref 조회 | 2026년 이후, 출판사 메타데이터에 ORCID `0000-0002-5028-5716`이 포함된 저널 논문 |
| 전체 저자·서지정보 | 매주 월요일 또는 수동 실행 | 홈페이지에 포함된 DOI의 Crossref 메타데이터 |
| CV·BibTeX·PDF | 배포할 때 생성 | 저장된 검증 데이터와 직접 입력한 과제·학회발표 |

등록 지연·ORCID 누락·DOI 없는 학회발표는 자동 발견되지 않을 수 있습니다. 신규 논문은 DOI로 직접 추가할 수 있습니다. 조회 실패 시 마지막 검증 정보를 보존하며, 누락된 전체 저자정보를 `et al.`로 채워 BibTeX를 만들지 않습니다. 기본 사이트 빌드는 저장된 자료만 사용합니다.

Google Scholar는 프로필의 **Export → BibTeX**를 지원하지만 공식 도움말은 자동 접근 시 robots.txt 준수와 대량 접근 제한을 명시합니다. 반복 스크래핑을 새로 추가하지 않습니다. 과거 전체 `journal.bib`를 가져올 경우 기존 논문과 DOI 기준으로 병합하고, 수동으로 확인한 저자 역할을 보존해야 합니다.

## 원본 파일

| 파일 | 관리 내용 |
|---|---|
| `src/cv-records.json` | 입력 화면으로 관리하는 과제·학회발표·직접 추가한 DOI 논문 |
| `src/cv-profile.mjs` | 공개용 소개·경력·학력·교육·수상 등 한/영 프로필 |
| `src/publications.mjs` | 기존 선정 논문과 자동 발견·직접 입력 논문의 병합 |
| `src/publications-auto.json` | 기존 ORCID 기반 신규 논문 발견 결과 |
| `src/bibliography-metadata.json` | 전체 저자 등 공식 DOI 서지정보의 마지막 검증 캐시 |
| `src/cv.mjs` | CV 화면과 LaTeX의 공통 출력 규칙 |

원본 첨부 CV와 개인 휴대전화는 공개 파일에 포함하지 않습니다. 연구실이 생기기 전 실적은 책임연구자의 경력으로 표시하며, 현재 소속의 연구실 실적으로 오해하게 만들지 않습니다.

## 초기 이관에서 확인할 내용

- 첨부에 `journal.bib`가 없어 현재 논문 섹션과 BibTeX는 **홈페이지에 수록된 선정 논문** 범위입니다. 전체 경력 논문 목록이 완성됐다는 의미가 아닙니다.
- 원문 `bold: first author` 범례와 실제 강조가 충돌합니다. 새 CV는 본인 이름 강조와 직접 확인한 기여 역할을 구분합니다. 과거 학회 발표의 공동 제1·교신 역할은 추정해서 이관하지 않습니다.
- 원문의 `Transactions of the Korean Society for Noise and Vibration Engineering 35` 항목은 저널명·권수처럼 보여 학회발표 초기 이관에서 제외했습니다. 원 기록을 확인한 뒤 올바른 종류로 추가합니다.
- MICCAI·KOSAIM 봉사활동의 시작연도가 첨부 CV와 기존 사이트 사이에서 달라, 새 CV에는 해당 시작연도를 생략했습니다. 공식 기록을 확인한 뒤 프로필에 추가합니다.
- 특허 번호·등록/공개 상태와 NeuroCAD 이력은 기존 사이트의 출처가 있는 공개 기록을 재사용합니다. 원문의 `Korea, PCT`를 모두 등록특허로 옮기지 않습니다.
- 일부 논문은 온라인 발행연도와 인쇄본 연도가 다릅니다. DOI 캐시에는 두 날짜를 보존하며, BibTeX는 온라인 발행을 포함한 가장 이른 실제 발행연도를 사용합니다.

공식 문서: [Scholar 프로필 내보내기](https://scholar.google.com/intl/en/scholar/citations.html), [Scholar 검색·자동 접근](https://scholar.google.com/intl/en/scholar/help.html), [Crossref 메타데이터](https://www.crossref.org/documentation/retrieve-metadata/rest-api/).
