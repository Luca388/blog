# Luca's development diary

[Astro](https://astro.build)로 만든 정적 블로그예요. https://luca388.github.io/blog/ 에 배포돼요.

## 글 쓰기

`posts/<카테고리>/` 폴더에 평범한 마크다운 파일을 만들면 끝이에요. front matter도, 파일명 규칙도 필요 없어요.

```
posts/
  drafts/       쓰는 중인 글 (사이트에 안 올라감)
  images/       붙여 넣은 이미지
  CS/            카테고리: CS, DB, Security, Language, Math, Algorithm
    가상메모리.md  →  /blog/가상메모리/
```

```md
# 가상 메모리

본문...
```

| 값 | 어디서 가져오나 |
| --- | --- |
| 카테고리 | 폴더 이름 (`CS`) |
| 제목 | 첫 줄의 `# 제목` (본문에서는 숨겨짐), 없으면 파일명 |
| 날짜 | drafts 밖으로 처음 커밋된 날 (발행일). 커밋 전이면 오늘 |
| 주소 | 파일명 (공백은 `-`로). 폴더와 상관없어서 카테고리를 옮겨도 그대로예요 |

파일명 앞에 `2026-09-25-`처럼 날짜를 붙이면 그 날짜를 써요. 값을 직접 정하고 싶으면 front matter로 적으면 돼요.

```md
---
title: "본문 첫 헤딩과 다른 제목"
date: 2026-09-25
tags: ["memory", "paging"]
---
```

세부 분류는 태그로 달아요 (Obsidian 속성 창에서 `tags`). 파일명을 바꾸면 주소가 바뀌니, 발행한 글의 파일명은 되도록 그대로 두세요. 다른 글과 주소가 겹치면 빌드가 알려줘요.

## Obsidian 설정

레포 폴더를 vault로 열고 다음처럼 설정하세요.

- **설정 → 파일 및 링크**
  - Use [[Wikilinks]]: 끄기
  - 새 링크 형식: 파일에 대한 상대 경로
  - 새 첨부 파일의 기본 위치: 아래 지정된 폴더 → `posts/images`
  - 제외된 파일: `node_modules`, `dist`, `src`
- **Templater**: 템플릿 폴더를 `templates`로 지정
- **Obsidian Git**: 자동 백업이 push하면 GitHub Actions가 배포해요

글은 `posts/drafts/`에서 쓰고, 다 쓰면 카테고리 폴더로 옮기면 발행돼요.

## 명령어

| 명령어 | 설명 |
| --- | --- |
| `npm install` | 의존성 설치 |
| `npm run dev` | 개발 서버 (http://localhost:4321/blog/) |
| `npm run build` | `dist/`로 빌드 + Pagefind 검색 인덱스 생성 |
| `npm run preview` | 빌드 결과 확인 (검색은 빌드 후에만 동작) |
| `npm run sync` | `posts/` 변경 사항을 커밋 하나(메시지는 날짜)로 묶어서 push. VS Code에서는 Run Task → "블로그 올리기" |

`main`에 push하면 GitHub Actions(`.github/workflows/deploy.yml`)가 빌드해서 배포해요.
