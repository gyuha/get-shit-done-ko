# Architecture

**Analysis Date:** 2026-03-24

## Pattern Overview

**Overall:** 문서 중심 워크플로 저장소 + Node.js CLI 유틸리티 + 다중 런타임 설치 자산을 함께 유지하는 메타 프롬프트 시스템

**Key Characteristics:**
- 사용자 진입점은 `commands/gsd/*.md`와 각 런타임별 installed mirror로 제공됨
- 실제 상태 관리는 `.planning/` 파일 집합에 축적됨
- orchestration logic은 `get-shit-done/workflows/*.md`, 기계적 보조 작업은 `get-shit-done/bin/lib/*.cjs`에 분리됨
- 이 포크는 upstream 구조를 유지한 채 한국어 레이어를 덧씌우는 방식으로 운영됨 (`AGENTS.md`, `docs/UPSTREAM-SYNC.md`)

## Layers

**Command Layer:**
- Purpose: 사용자가 실행하는 slash command / skill entry를 제공
- Contains: `commands/gsd/*.md`, `skills/gsd-sync-upstream/SKILL.md`
- Depends on: workflow layer, installed runtime mirrors
- Used by: Claude Code, Codex, OpenCode, Copilot, Cursor, Antigravity 사용자

**Workflow Layer:**
- Purpose: 명령별 절차, 게이트, 서브에이전트 오케스트레이션 정의
- Contains: `get-shit-done/workflows/*.md`
- Depends on: templates, references, CLI tools, agent definitions
- Used by: command layer와 runtime-installed copies

**Template & Reference Layer:**
- Purpose: planning 산출물 형식과 공통 지식을 제공
- Contains: `get-shit-done/templates/`, `get-shit-done/references/`
- Depends on: 거의 없음
- Used by: workflows, agents, tests

**CLI Tools Layer:**
- Purpose: 복잡한 파일/상태 조작을 안정적으로 수행
- Contains: `get-shit-done/bin/gsd-tools.cjs`, `get-shit-done/bin/lib/*.cjs`
- Depends on: Node.js built-ins, filesystem
- Used by: workflows, scripts, tests

**Installation Layer:**
- Purpose: 여러 AI 런타임에 맞는 자산을 배치하고 변환
- Contains: `bin/install.js`, `hooks/`, runtime-specific folders like `.claude/`, `.opencode/`
- Depends on: package metadata, templates, agent/command assets
- Used by: end users installing GSD

## Data Flow

**Project bootstrap flow:**
1. 사용자가 `README.md`에 문서화된 명령으로 설치 또는 명령 실행
2. workflow가 `node get-shit-done/bin/gsd-tools.cjs init ...`를 호출해 상태와 설정을 로드 (`get-shit-done/workflows/*.md`, `get-shit-done/bin/lib/init.cjs`)
3. workflow가 템플릿/참조를 읽고 `.planning/` 문서를 생성 또는 갱신
4. 후속 phase/workflow가 같은 `.planning/` 아티팩트를 기준으로 이어서 실행

**Runtime install flow:**
1. `bin/install.js`가 runtime/설치 위치를 해석
2. 소스 자산(`commands/`, `agents/`, `get-shit-done/`, `hooks/`)을 런타임별 형식으로 복사/치환
3. 런타임별 설정 블록과 훅을 주입

**State Management:**
- 영속 상태는 `.planning/STATE.md`, `.planning/ROADMAP.md`, `.planning/REQUIREMENTS.md`, `.planning/config.json` 중심
- `get-shit-done/bin/lib/state.cjs`, `roadmap.cjs`, `phase.cjs`, `config.cjs`가 파일 기반 상태 전이를 담당

## Key Abstractions

**Workflow:**
- Purpose: 사용자의 높은 수준 명령을 단계별 절차로 변환
- Examples: `get-shit-done/workflows/new-project.md`, `get-shit-done/workflows/map-codebase.md`
- Pattern: Markdown instruction asset + CLI init JSON + optional agent spawn

**Agent:**
- Purpose: 특정 역할에 맞춘 분리된 작업 수행
- Examples: `agents/gsd-codebase-mapper.md`, `agents/gsd-planner.md`, `agents/gsd-verifier.md`
- Pattern: frontmatter + tool allowlist + role/process description

**Planning Files:**
- Purpose: 사람이 읽고 에이전트도 읽을 수 있는 프로젝트 메모리 저장
- Examples: `.planning/PROJECT.md`, `.planning/STATE.md`
- Pattern: token-sensitive Markdown structure

**Runtime Mirror:**
- Purpose: 동일한 GSD 자산을 호스트 에이전트별 소비 형식으로 제공
- Examples: `.claude/get-shit-done/`, `.codex/get-shit-done/`, `.opencode/get-shit-done/`
- Pattern: source asset 복사 + host-specific settings injection

## Entry Points

**Package entrypoint:**
- Location: `bin/install.js`
- Triggers: `npx get-shit-done-ko@latest`, `node bin/install.js ...`
- Responsibilities: 설치 대상 해석, 자산 복사, 런타임 설정 주입

**CLI tools entrypoint:**
- Location: `get-shit-done/bin/gsd-tools.cjs`
- Triggers: workflows와 테스트가 `node .../gsd-tools.cjs <command>` 호출
- Responsibilities: state/config/verify/template/init/roadmap 명령 디스패치

**Test entrypoint:**
- Location: `scripts/run-tests.cjs`
- Triggers: `npm test`
- Responsibilities: `tests/*.test.cjs`를 정렬해 cross-platform 방식으로 실행

## Error Handling

**Strategy:** hard-fail CLI + validation-first workflow

**Patterns:**
- CLI는 잘못된 인자나 경로를 즉시 `error(...)`로 중단함 (`get-shit-done/bin/gsd-tools.cjs`)
- init 명령은 workflow에 필요한 컨텍스트를 JSON으로 묶어 반환해 프롬프트 로직의 분기 오류를 줄임 (`get-shit-done/bin/lib/init.cjs`)
- 보안/무결성 관련 검사는 별도 모듈로 분리됨 (`get-shit-done/bin/lib/security.cjs`, `verify.cjs`)

## Cross-Cutting Concerns

**Logging:**
- 외부 로깅 프레임워크보다 CLI 출력과 hook advisory 메시지 사용 (`hooks/gsd-workflow-guard.js`)

**Validation:**
- `validate health`, `validate consistency`, `verify ...` 계열 명령으로 planning 자산과 산출물을 검증함 (`get-shit-done/bin/gsd-tools.cjs`)

**Authentication:**
- 앱 수준 auth는 없음
- 외부 서비스 사용 여부는 API key/environment presence detection에 한정됨 (`get-shit-done/bin/lib/init.cjs`)

---
*Architecture analysis: 2026-03-24*
*Update when major patterns change*
