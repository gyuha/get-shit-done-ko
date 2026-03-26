# Codebase Structure

**Analysis Date:** 2026-03-26

## Directory Layout

```text
get-shit-done-ko/
├── bin/                  # npm binary installer entrypoint
├── commands/             # source slash command documents
├── get-shit-done/        # source-of-truth engine assets
├── agents/               # source agent prompts
├── hooks/                # hook source and built dist copies
├── scripts/              # build, scan, upstream-sync, test runners
├── tests/                # Node regression tests
├── docs/                 # user and maintainer documentation with locale folders
├── skills/               # repository-owned installable skills
├── .claude/              # checked-in Claude runtime mirror
├── .codex/               # checked-in Codex runtime mirror
├── .opencode/            # checked-in OpenCode runtime mirror
├── .planning/            # project planning state and generated codebase docs
└── assets/               # README/media assets
```

## Directory Purposes

**bin/**
- Purpose: npm 실행 진입점을 보관한다.
- Contains: installer script
- Key files: `bin/install.js`
- Subdirectories: 없음

**commands/**
- Purpose: source command 문서를 보관한다.
- Contains: `commands/gsd/*.md`
- Key files: `commands/gsd/help.md`, `commands/gsd/new-project.md`, `commands/gsd/map-codebase.md`
- Subdirectories: `commands/gsd/`

**get-shit-done/**
- Purpose: 런타임에 복제되는 엔진 자산의 source-of-truth 디렉터리다.
- Contains: CLI utilities, workflows, templates, references, upstream version marker
- Key files: `get-shit-done/bin/gsd-tools.cjs`, `get-shit-done/workflows/plan-phase.md`, `get-shit-done/templates/project.md`, `get-shit-done/references/planning-config.md`, `get-shit-done/UPSTREAM_VERSION`
- Subdirectories: `bin/`, `workflows/`, `templates/`, `references/`

**agents/**
- Purpose: source agent 프롬프트를 보관한다.
- Contains: `gsd-*.md` agent definitions
- Key files: `agents/gsd-executor.md`, `agents/gsd-planner.md`, `agents/gsd-codebase-mapper.md`
- Subdirectories: 없음

**hooks/**
- Purpose: hook source와 배포용 dist copy를 함께 보관한다.
- Contains: raw hook JS, built `dist/` output
- Key files: `hooks/gsd-context-monitor.js`, `hooks/gsd-prompt-guard.js`, `hooks/dist/gsd-context-monitor.js`
- Subdirectories: `hooks/dist/`

**scripts/**
- Purpose: 저장소 유지보수와 품질 게이트용 실행 스크립트를 둔다.
- Contains: hook build, test runner, security scan, upstream sync helpers
- Key files: `scripts/build-hooks.js`, `scripts/run-tests.cjs`, `scripts/apply-upstream-refresh.cjs`, `scripts/check-upstream-release.cjs`
- Subdirectories: 없음

**tests/**
- Purpose: installer, CLI helper, runtime conversion, security, localization regression을 검증한다.
- Contains: `.test.cjs` files and helpers
- Key files: `tests/helpers.cjs`, `tests/init.test.cjs`, `tests/runtime-converters.test.cjs`, `tests/localization-gap-audit.test.cjs`
- Subdirectories: 없음

**docs/**
- Purpose: 사용자/유지보수자 문서를 보관한다.
- Contains: root English/Korean-first docs and locale mirrors
- Key files: `docs/README.md`, `docs/ARCHITECTURE.md`, `docs/UPSTREAM-SYNC.md`, `docs/RELEASE-CHECKLIST.md`
- Subdirectories: `docs/ko-KR/`, `docs/ja-JP/`, `docs/pt-BR/`, `docs/superpowers/`

**skills/**
- Purpose: source repository가 직접 제공하는 추가 skill을 둔다.
- Contains: skill bundles with scripts/references
- Key files: `skills/gsd-sync-upstream/SKILL.md`
- Subdirectories: `skills/gsd-sync-upstream/`

**.claude/**
- Purpose: Claude runtime용 checked-in install mirror다.
- Contains: installed agents, hooks, settings, `get-shit-done/` copy, manifest
- Key files: `.claude/agents/gsd-executor.md`, `.claude/hooks/gsd-statusline.js`, `.claude/gsd-file-manifest.json`
- Subdirectories: `.claude/agents/`, `.claude/get-shit-done/`, `.claude/hooks/`, `.claude/commands/`

**.codex/**
- Purpose: Codex runtime용 checked-in install mirror다.
- Contains: installed agents with `.toml`, `get-shit-done/` copy, manifest, skills
- Key files: `.codex/agents/gsd-codebase-mapper.md`, `.codex/agents/gsd-codebase-mapper.toml`, `.codex/config.toml`, `.codex/gsd-file-manifest.json`
- Subdirectories: `.codex/agents/`, `.codex/get-shit-done/`, `.codex/skills/`

**.opencode/**
- Purpose: OpenCode runtime용 checked-in install mirror다.
- Contains: flat `command/` files, installed agents, hooks, settings, `get-shit-done/` copy
- Key files: `.opencode/command/gsd-help.md`, `.opencode/opencode.json`, `.opencode/gsd-file-manifest.json`
- Subdirectories: `.opencode/command/`, `.opencode/agents/`, `.opencode/get-shit-done/`, `.opencode/hooks/`

**.planning/**
- Purpose: 현재 저장소의 project state와 generated analysis 문서를 저장한다.
- Contains: codebase maps and future planning artifacts
- Key files: `.planning/codebase/ARCHITECTURE.md`, `.planning/codebase/STRUCTURE.md`
- Subdirectories: `codebase/`

## Key File Locations

**Entry Points:**
- `package.json`: npm package metadata, binary registration, build/test scripts
- `bin/install.js`: 설치/제거와 runtime 변환의 메인 엔트리
- `get-shit-done/bin/gsd-tools.cjs`: workflow가 호출하는 CLI utility 엔트리
- `commands/gsd/help.md`: 사용자-visible command documentation의 기본 예시

**Configuration:**
- `package.json`: package scripts와 Node engine
- `get-shit-done/templates/config.json`: `.planning/config.json` 기본 템플릿
- `.codex/config.toml`: Codex runtime mirror config
- `.claude/settings.json`: Claude runtime mirror settings
- `.opencode/opencode.json`: OpenCode runtime mirror config

**Core Logic:**
- `get-shit-done/bin/lib/core.cjs`: 공용 경로/출력/설정 헬퍼
- `get-shit-done/bin/lib/init.cjs`: workflow init payload assembler
- `get-shit-done/bin/lib/commands.cjs`: standalone utility command implementation
- `get-shit-done/bin/lib/state.cjs`: `.planning/STATE.md` manipulation
- `get-shit-done/bin/lib/phase.cjs`: phase lookup and numbering helpers
- `get-shit-done/bin/lib/roadmap.cjs`: roadmap parsing and updates
- `get-shit-done/bin/lib/template.cjs`: template fill helpers
- `get-shit-done/bin/lib/verify.cjs`: verification and consistency checks
- `get-shit-done/bin/lib/security.cjs`: prompt injection and sanitization helpers

**Testing:**
- `tests/*.test.cjs`: regression tests
- `tests/helpers.cjs`: temp project and CLI invocation helpers
- `scripts/run-tests.cjs`: test runner entry

**Documentation:**
- `README.md`: package landing page
- `docs/README.md`: documentation index
- `docs/ARCHITECTURE.md`: user-facing architecture overview
- `AGENTS.md`: repository-level agent guidance

## Naming Conventions

**Files:**
- command markdown는 kebab-case를 유지한다: `commands/gsd/plan-phase.md`, `commands/gsd/map-codebase.md`
- workflow markdown는 command name과 대응하는 kebab-case를 유지한다: `get-shit-done/workflows/plan-phase.md`
- agent prompts는 `gsd-<role>.md` 패턴을 사용한다: `agents/gsd-executor.md`
- CLI helper modules는 기능별 `.cjs` 파일로 분리한다: `get-shit-done/bin/lib/core.cjs`, `get-shit-done/bin/lib/init.cjs`
- planning templates는 대체로 lower-kebab 또는 UPPERCASE markdown 이름을 사용한다: `get-shit-done/templates/project.md`, `get-shit-done/templates/UAT.md`

**Directories:**
- 사용자-facing source asset은 의미 단위 디렉터리로 분리한다: `commands/`, `agents/`, `get-shit-done/`, `tests/`
- runtime mirrors는 숨김 디렉터리 이름을 그대로 사용한다: `.claude/`, `.codex/`, `.opencode/`
- locale docs는 BCP-47 스타일 디렉터리를 사용한다: `docs/ko-KR/`, `docs/ja-JP/`, `docs/pt-BR/`

**Special Patterns:**
- source command를 추가할 때는 `commands/gsd/<name>.md`와 `get-shit-done/workflows/<name>.md`를 쌍으로 유지한다.
- runtime-converted command는 runtime별 규칙을 따른다: OpenCode는 `.opencode/command/gsd-<name>.md`, Codex는 `.codex/skills/gsd-<name>/SKILL.md`, Claude는 `.claude/commands/gsd/<name>.md`
- generated planning docs는 `.planning/` 아래 목적별 하위 디렉터리로 넣는다.

## Where to Add New Code

**New Feature:**
- Primary code: workflow/engine 변경이면 `get-shit-done/bin/lib/`와 `get-shit-done/workflows/`
- Tests: `tests/`
- Docs: 사용자 문서는 `docs/`, command discoverability는 `commands/gsd/`, planning scaffold는 `get-shit-done/templates/`

**New Command/Workflow Pair:**
- Command surface: `commands/gsd/<name>.md`
- Workflow body: `get-shit-done/workflows/<name>.md`
- Supporting CLI logic: `get-shit-done/bin/lib/<domain>.cjs` 또는 기존 module
- Regression tests: `tests/<name>.test.cjs`

**New Agent/Checker:**
- Source prompt: `agents/gsd-<role>.md`
- Installer/runtime mapping: `bin/install.js`
- Model resolution or init support: `get-shit-done/bin/lib/model-profiles.cjs` 또는 `get-shit-done/bin/lib/init.cjs`
- Tests: `tests/agent-*.test.cjs` 또는 관련 feature test

**Utilities:**
- Shared helpers: `get-shit-done/bin/lib/`
- Repo maintenance scripts: `scripts/`
- Hooks: `hooks/` source 후 `scripts/build-hooks.js`로 `hooks/dist/` 갱신

## Special Directories

**get-shit-done/**
- Purpose: installer가 복제하는 canonical engine asset tree
- Source: repository source of truth
- Committed: Yes

**.claude/**
- Purpose: Claude runtime mirror for local validation and shipped layout parity
- Source: `bin/install.js` output pattern reflected into repo
- Committed: Yes

**.codex/**
- Purpose: Codex runtime mirror with agent `.toml` configs and skills-first layout
- Source: `bin/install.js` output pattern reflected into repo
- Committed: Yes

**.opencode/**
- Purpose: OpenCode runtime mirror with flattened `command/` layout
- Source: `bin/install.js` output pattern reflected into repo
- Committed: Yes

**hooks/dist/**
- Purpose: 배포 가능한 validated hook copies
- Source: `scripts/build-hooks.js`가 `hooks/*.js`를 검증 후 복사
- Committed: Yes

**.planning/**
- Purpose: generated project state and codebase analysis
- Source: workflows and CLI helpers create/update it during usage
- Committed: Yes

---

*Structure analysis: 2026-03-26*
