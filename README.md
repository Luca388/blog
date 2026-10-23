# Luca's development diary

[Astro](https://astro.build)로 만든 정적 블로그예요. https://luca388.github.io/blog/ 에 배포돼요.

## 글 쓰기

`posts/<카테고리>/` 폴더에 평범한 마크다운 파일을 만들면 끝이에요. front matter도, 파일명 규칙도 필요 없어요.

```
posts/
  images/        붙여 넣은 이미지
  CS/            카테고리: CS, DB, Security, Language, Math, Algorithm
    가상메모리.md  →  /blog/가상메모리/
```

다 쓰면 `npm run sync`로 올려요 (VS Code: Run Task → "블로그 올리기"). 실행하기 전까지는 아무것도 올라가지 않아요.

```md
# 가상 메모리

본문...
```

| 값 | 어디서 가져오나 |
| --- | --- |
| 카테고리 | 폴더 이름 (`CS`) |
| 제목 | 첫 줄의 `# 제목` (본문에서는 숨겨짐), 없으면 파일명 |
| 날짜 | 처음 커밋된 날 (발행일). 커밋 전이면 오늘 |
| 주소 | 파일명 (공백은 `-`로). 폴더와 상관없어서 카테고리를 옮겨도 그대로예요 |

파일명 앞에 `2026-09-25-`처럼 날짜를 붙이면 그 날짜를 써요. 값을 직접 정하고 싶으면 front matter로 적으면 돼요.

```md
---
title: "본문 첫 헤딩과 다른 제목"
date: 2026-09-25
tags: ["memory", "paging"]
---
```

세부 분류는 태그로 달아요. 파일명을 바꾸면 주소가 바뀌니, 발행한 글의 파일명은 되도록 그대로 두세요. 다른 글과 주소가 겹치면 빌드가 알려줘요.

`npm run sync`는 `posts/`의 변경을 전부 올려요. 아직 공개하지 않을 글이 같이 있으면 맨 위에 `draft: true`를 적어 두세요. 사이트에는 안 나오지만 GitHub 레포에는 올라가요.

```md
---
draft: true
---
```

## 웹에서 쓰기

https://luca388.github.io/blog/admin/ 에서 브라우저로 글을 쓰고 고칠 수 있어요 ([Sveltia CMS](https://sveltiacms.app), 설정은 `public/admin/config.yml`).

- **로그인**: "액세스 토큰으로 로그인"에 GitHub 토큰을 붙여 넣어요. 토큰은 [여기](https://github.com/settings/personal-access-tokens/new)에서 만들어요: Repository access → Only select repositories → `blog`, Permissions → Contents: Read and write. 토큰은 그 브라우저에만 저장되니 공용 PC에서는 다 쓰고 로그아웃하세요.
- **누가 쓸 수 있나**: 저장은 곧 이 레포에 커밋이라, 레포 쓰기 권한이 있는 사람만 돼요.
- **저장하면**: `posts/<카테고리>/<날짜>-<제목>.md`로 `main`에 바로 커밋되고 1분쯤 뒤 사이트에 반영돼요. 이미지는 `posts/images/`에 올라가요.
- 제목 칸을 비워 두면 본문 첫 줄의 `# 제목`을 써요. "임시 저장"을 켜면 `draft: true`가 돼요.
- 로컬과 같이 써도 돼요. `npm run sync`가 웹에서 쓴 글을 받아 와서 합쳐요. 같은 글을 양쪽에서 고치면 충돌할 수 있으니 한쪽에서만 고치세요.
- 카테고리 폴더를 추가하면 `config.yml`의 `collections`에도 추가해야 웹에서 보여요.

## VS Code

`blog` 또는 `posts` 폴더를 열면 `.vscode/` 설정이 적용돼요. 붙여 넣은 이미지는 `posts/images/<글 이름>-image.png`로 저장되고 링크가 자동으로 들어가요. 글을 지우면 그 글의 이미지는 다음 `npm run sync` 때 자동으로 지워져요.

## 명령어

| 명령어 | 설명 |
| --- | --- |
| `npm install` | 의존성 설치 |
| `npm run dev` | 개발 서버 (http://localhost:4321/blog/) |
| `npm run build` | `dist/`로 빌드 + Pagefind 검색 인덱스 생성 |
| `npm run preview` | 빌드 결과 확인 (검색은 빌드 후에만 동작) |
| `npm run sync` | 안 쓰는 이미지 정리 → 빌드 확인 → `posts/` 변경 사항을 커밋 하나(메시지는 날짜)로 묶어서 push. VS Code에서는 Run Task → "블로그 올리기" |
| `npm run clean-images` | 어떤 글에서도 쓰지 않는 `posts/images/` 이미지 삭제 (`-- --dry-run`이면 목록만 보여줌) |

`main`에 push하면 GitHub Actions(`.github/workflows/deploy.yml`)가 빌드해서 배포해요.
