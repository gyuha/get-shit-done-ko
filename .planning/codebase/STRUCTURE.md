# Codebase Structure

**Analysis Date:** 2026-03-24

## Directory Layout

```text
get-shit-done-ko/
├── bin/                  # npm 패키지 엔트리 설치기
├── commands/gsd/         # 사용자 명령 문서
├── agents/               # 전문 서브에이전트 정의
├── get-shit-done/        # source-of-truth workflows/templates/references/CLI libs
├── hooks/                # 런타임 훅 소스와 빌드 산출물
├── scripts/              # 유지보수 및 검증 스크립트
├── tests/                # Node.js 회귀 테스트
├── docs/                 # 사용자/유지보수자 문서
├── skills/               # 추가 Codex skill bundles
├── .claude/              # Claude runtime mirror
├── .codex/               # Codex runtime mirror + local skills
├── .opencode/            # OpenCode runtime mirror
└── .planning/codebase/   # 현재 codebase map 문서
```

## Directory Purposes

**`bin/`:**
- Purpose: 패키지 설치 엔트리 제공
- Contains: 설치기 스크립트
- Key files: `bin/install.js`
- Subdirectories: 없음

**`commands/`:**
- Purpose: 사용자 명령 프롬프트 정의
- Contains: `commands/gsd/*.md`
- Key files: `commands/gsd/new-project.md`, `commands/gsd/map-codebase.md`
- Subdirectories: `commands/gsd/`

**`agents/`:**
- Purpose: GSD 서브에이전트 역할 정의
- Contains: `gsd-*.md`
- Key files: `agents/gsd-codebase-mapper.md`, `agents/gsd-executor.md`, `agents/gsd-roadmapper.md`
- Subdirectories: 없음

**`get-shit-done/`:**
- Purpose: 배포 대상 source asset의 기준 디렉터리
- Contains: `bin/`, `workflows/`, `templates/`, `references/`, `commands/`
- Key files: `get-shit-done/bin/gsd-tools.cjs`, `get-shit-done/workflows/new-project.md`
- Subdirectories: `bin/`, `references/`, `templates/`, `workflows/`, `commands/`

**`hooks/`:**
- Purpose: 런타임 훅 구현과 빌드 출력 관리
- Contains: source JS files + `hooks/dist/`
- Key files: `hooks/gsd-workflow-guard.js`, `hooks/gsd-context-monitor.js`
- Subdirectories: `hooks/dist/`

**`scripts/`:**
- Purpose: 유지보수/빌드/테스트 보조 스크립트
- Contains: `.cjs`, `.js`
- Key files: `scripts/run-tests.cjs`, `scripts/build-hooks.js`, `scripts/check-upstream-release.cjs`
- Subdirectories: 없음

**`tests/`:**
- Purpose: 회귀 테스트 모음
- Contains: `*.test.cjs`, `helpers.cjs`
- Key files: `tests/dispatcher.test.cjs`, `tests/runtime-converters.test.cjs`, `tests/upstream-sync.test.cjs`
- Subdirectories: 없음

**Runtime mirrors (`.claude/`, `.codex/`, `.opencode/`):**
- Purpose: 호스트 런타임별 설치 자산 저장
- Contains: commands, agents, hooks, mirrored `get-shit-done/`
- Key files: `.claude/settings.json`, `.codex/skills/`, `.opencode/opencode.json`
- Subdirectories: runtime마다 상이

## Key File Locations

**Entry Points:**
- `bin/install.js`: npm package 실행 진입점
- `get-shit-done/bin/gsd-tools.cjs`: CLI utility 진입점
- `scripts/run-tests.cjs`: 테스트 실행 진입점

**Configuration:**
- `package.json`: 엔진, scripts, publish metadata
- `.gitignore`: 무시 규칙
- `.claude/settings.json`, `.opencode/settings.json`: runtime-specific local config

**Core Logic:**
- `get-shit-done/bin/lib/core.cjs`: 공통 경로/출력 유틸리티
- `get-shit-done/bin/lib/init.cjs`: workflow별 context bootstrap
- `get-shit-done/bin/lib/state.cjs`: STATE.md 조작
- `get-shit-done/bin/lib/roadmap.cjs`: ROADMAP parsing/update

**Testing:**
- `tests/*.test.cjs`: 기능별 회귀 테스트
- `tests/helpers.cjs`: 임시 프로젝트/실행 helper

**Documentation:**
- `README.md`: 사용자 시작점
- `docs/ARCHITECTURE.md`: 시스템 설명
- `docs/UPSTREAM-SYNC.md`: 포크 유지보수 가드레일

## Naming Conventions

**Files:**
- 문서/명령/워크플로는 kebab-case 또는 기존 token-sensitive 이름 유지
- 테스트는 `*.test.cjs`
- CLI library modules는 의미 중심 소문자 파일명 (`state.cjs`, `verify.cjs`)

**Directories:**
- 도메인별 평면 분리: `commands/`, `agents/`, `docs/`, `scripts/`, `tests/`
- installed runtime directories는 런타임 이름에 맞춘 dot-prefixed 디렉터리 사용 (`.claude/`, `.codex/`, `.opencode/`)

**Special Patterns:**
- source-of-truth asset은 `get-shit-done/` 아래 유지
- phase/planning artifacts는 `.planning/` 아래 생성
- token-sensitive files는 경로/식별자 유지가 중요 (`AGENTS.md`)

## Where to Add New Code

**New workflow/command feature:**
- Primary code: `get-shit-done/workflows/` 또는 `get-shit-done/bin/lib/`
- User entry docs: `commands/gsd/`
- Tests: `tests/`
- Docs: `docs/` 또는 `README.md`

**New template/reference asset:**
- Primary code: `get-shit-done/templates/` 또는 `get-shit-done/references/`
- Runtime mirrors: 설치/동기화 경로 (`.claude/get-shit-done/`, `.codex/get-shit-done/`)까지 함께 검증
- Tests: template/token-sensitive 관련 회귀가 있으면 `tests/template.test.cjs` 계열 확장

**Installer/runtime integration:**
- Primary code: `bin/install.js`
- Hook source: `hooks/`
- Tests: `tests/*install*.test.cjs`, `tests/runtime-converters.test.cjs`

## Special Directories

**`.planning/`:**
- Purpose: 프로젝트 상태와 계획 산출물 저장
- Source: workflow 실행 중 생성
- Committed: 설정에 따라 Yes/No. 이 저장소는 문서화상 commit tracking을 권장함

**`get-shit-done/`:**
- Purpose: upstream 호환성을 유지하는 기준 자산 디렉터리
- Source: upstream import 및 로컬 수정
- Committed: Yes

**Runtime mirrors (`.claude/`, `.codex/`, `.opencode/`):**
- Purpose: 특정 런타임에서 실제로 소비하는 설치 결과
- Source: `bin/install.js` 또는 로컬 개발용 설치
- Committed: 현재 저장소에는 포함되어 있음. 소스 수정 후 mirror drift를 주의해야 함

---
*Structure analysis: 2026-03-24*
*Update when directory structure changes*
