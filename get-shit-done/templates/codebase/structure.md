# Structure Template

> 한국어 우선 안내: 이 템플릿은 `.planning/codebase/STRUCTURE.md`를 한국어로 정리하기 위한 구조 가이드입니다.

Template for `.planning/codebase/STRUCTURE.md` - captures physical file organization.

**Purpose:** 코드와 문서가 실제로 어디에 있는지, 새 파일을 어디에 둬야 하는지 설명합니다.

---

## File Template

```markdown
# Codebase Structure

**Analysis Date:** [YYYY-MM-DD]

## Directory Layout

```text
[project-root]/
├── [dir]/          # [용도]
├── [dir]/          # [용도]
└── [file]          # [용도]
```

## Directory Purposes

**[Directory Name]:**
- Purpose: [무엇이 들어가는지]
- Contains: [파일 종류]
- Key files: [대표 파일]
- Subdirectories: [하위 구조]

## Key File Locations

**Entry Points:**
- [Path]: [역할]

**Configuration:**
- [Path]: [역할]

**Core Logic:**
- [Path]: [역할]

**Testing:**
- [Path]: [역할]

**Documentation:**
- [Path]: [역할]

## Naming Conventions

**Files:**
- [패턴]: [예시]

**Directories:**
- [패턴]: [예시]

**Special Patterns:**
- [패턴]: [예시]

## Where to Add New Code

**New Feature:**
- Primary code: [경로]
- Tests: [경로]
- Docs: [경로]

**Utilities:**
- Shared helpers: [경로]
- Types: [경로]

## Special Directories

**[Directory]:**
- Purpose: [의미]
- Source: [어떻게 생성되는지]
- Committed: [Yes/No]

---
*Structure analysis: [date]*
*Update when directory structure changes*
```

<good_examples>

```markdown
# Codebase Structure

**Analysis Date:** 2026-03-24

## Directory Layout

```text
get-shit-done-ko/
├── bin/                 # 설치 및 실행 진입점
├── commands/            # slash command 정의
├── get-shit-done/       # 배포용 source assets
├── .codex/get-shit-done/# 설치된 Codex runtime assets
├── tests/               # 회귀 테스트
├── skills/              # 설치 가능한 스킬 번들
└── .planning/           # 프로젝트 planning 상태
```

## Directory Purposes

**bin/**
- Purpose: 설치/실행용 엔트리
- Contains: 설치 스크립트, 보조 실행기
- Key files: `install.js`
- Subdirectories: 없음

**commands/**
- Purpose: slash command 문서
- Contains: `gsd/*.md`
- Key files: `commands/gsd/help.md`
- Subdirectories: `gsd/`

**get-shit-done/**
- Purpose: source of truth assets
- Contains: templates, workflows, references
- Key files: `templates/project.md`, `workflows/new-project.md`
- Subdirectories: `templates/`, `workflows/`, `references/`

## Where to Add New Code

**새 planning 템플릿**
- Primary code: `get-shit-done/templates/`
- Installed runtime mirror: `.codex/get-shit-done/templates/`
- Tests: `tests/`

**새 slash command**
- Primary code: `commands/gsd/`
- Workflow: `get-shit-done/workflows/`
- Tests: `tests/`
```

</good_examples>

<guidelines>

- 최상위 구조는 ASCII tree로 빠르게 읽히게 작성합니다.
- "어디에 넣어야 하나?" 질문에 바로 답이 되도록 씁니다.
- generated/runtime/symlink 같은 특수 디렉터리는 꼭 표시합니다.

</guidelines>
