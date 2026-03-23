# GSD 아키텍처

> 기여자와 고급 사용자를 위한 시스템 아키텍처 문서입니다. 사용자 관점 문서는 [Feature Reference](FEATURES.md)와 [User Guide](USER-GUIDE.md)를 참고하세요.

> [!NOTE]
> 파일 경로, 런타임 이름, 에이전트 식별자, 구조 다이어그램 안의 토큰은 그대로 유지합니다. 설명은 한국어 우선으로 제공합니다.

---

## 목차

- [System Overview](#system-overview)
- [Design Principles](#design-principles)
- [Component Architecture](#component-architecture)
- [Agent Model](#agent-model)
- [Data Flow](#data-flow)
- [File System Layout](#file-system-layout)
- [Installer Architecture](#installer-architecture)
- [Hook System](#hook-system)
- [CLI Tools Layer](#cli-tools-layer)
- [Runtime Abstraction](#runtime-abstraction)

---

## 시스템 개요

GSD는 사용자와 AI 코딩 에이전트(Claude Code, Gemini CLI, OpenCode, Codex, Copilot, Antigravity) 사이에 위치하는 **메타 프롬프트 프레임워크**입니다. 다음을 제공합니다:

1. **컨텍스트 엔지니어링** — AI에 작업별로 필요한 모든 것을 제공하는 구조화된 아티팩트
2. **다중 에이전트 오케스트레이션** — 새로운 컨텍스트 창을 통해 특수 에이전트를 생성하는 씬 오케스트레이터
3. **사양 중심 개발** — 요구 사항 → 연구 → 계획 → 실행 → 검증 파이프라인
4. **상태 관리** — 세션 및 컨텍스트 재설정 전반에 걸쳐 지속적인 프로젝트 메모리

```
┌──────────────────────────────────────────────────────┐
│                      USER                            │
│            /gsd:command [args]                        │
└─────────────────────┬────────────────────────────────┘
                      │
┌─────────────────────▼────────────────────────────────┐
│              COMMAND LAYER                            │
│   commands/gsd/*.md — Prompt-based command files      │
│   (Claude Code custom commands / Codex skills)        │
└─────────────────────┬────────────────────────────────┘
                      │
┌─────────────────────▼────────────────────────────────┐
│              WORKFLOW LAYER                           │
│   get-shit-done/workflows/*.md — Orchestration logic  │
│   (Reads references, spawns agents, manages state)    │
└──────┬──────────────┬─────────────────┬──────────────┘
       │              │                 │
┌──────▼──────┐ ┌─────▼─────┐ ┌────────▼───────┐
│  AGENT      │ │  AGENT    │ │  AGENT         │
│  (fresh     │ │  (fresh   │ │  (fresh        │
│   context)  │ │   context)│ │   context)     │
└──────┬──────┘ └─────┬─────┘ └────────┬───────┘
       │              │                 │
┌──────▼──────────────▼─────────────────▼──────────────┐
│              CLI TOOLS LAYER                          │
│   get-shit-done/bin/gsd-tools.cjs                     │
│   (State, config, phase, roadmap, verify, templates)  │
└──────────────────────┬───────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────┐
│              FILE SYSTEM (.planning/)                 │
│   PROJECT.md | REQUIREMENTS.md | ROADMAP.md          │
│   STATE.md | config.json | phases/ | research/       │
└──────────────────────────────────────────────────────┘
```

---

## 디자인 원칙

### 1. 에이전트별 새로운 컨텍스트

오케스트레이터에 의해 생성된 모든 에이전트는 깨끗한 컨텍스트 창(최대 200,000개 토큰)을 얻습니다. 이는 AI가 누적된 대화로 컨텍스트 창을 채울 때 발생하는 품질 저하인 컨텍스트 부패를 제거합니다.

### 2. 씬 오케스트레이터

워크플로 파일(`get-shit-done/workflows/*.md`)은 무거운 작업을 수행하지 않습니다. 그들:
- `gsd-tools.cjs init <workflow>`을 통해 컨텍스트 로드
- 집중된 프롬프트로 전문 에이전트 생성
- 결과를 수집하고 다음 단계로 전달
- 단계 간 상태 업데이트

### 3. 파일 기반 상태

모든 상태는 사람이 읽을 수 있는 Markdown 및 JSON으로 `.planning/`에 있습니다. 데이터베이스도, 서버도, 외부 종속성도 없습니다. 이는 다음을 의미합니다.
- 상태는 컨텍스트 재설정 후에도 유지됩니다(`/clear`).
- 상태는 사람과 에이전트 모두가 검사할 수 있습니다.
- 상태는 팀 가시성을 위해 git에 전념할 수 있습니다.

### 4. 부재 = 활성화됨

워크플로 기능 플래그는 **없음 = 활성화됨** 패턴을 따릅니다. `config.json`에 키가 없으면 기본값은 `true`입니다. 사용자는 기능을 명시적으로 비활성화합니다. 기본값을 활성화할 필요는 없습니다.

### 5. 심층 방어

여러 계층이 일반적인 오류 모드를 방지합니다.
- 실행 전 계획을 검증합니다(계획 확인 에이전트).
- 실행은 작업당 원자성 커밋을 생성합니다.
- 단계 목표에 대한 실행 후 검증 확인
- UAT는 최종 게이트로 인간 검증을 제공합니다.

---

## 구성 요소 아키텍처

### 명령(`commands/gsd/*.md`)

사용자 지향 진입점. 각 파일에는 YAML 머리말(이름, 설명, 허용 도구)과 워크플로를 부트스트랩하는 프롬프트 본문이 포함되어 있습니다. 명령은 다음과 같이 설치됩니다.
- **Claude 코드:** 사용자 정의 슬래시 명령(`/gsd:command-name`)
- **OpenCode:** 슬래시 명령(`/gsd-command-name`)
- **코덱스:** 스킬(`$gsd-command-name`)
- **Copilot:** 슬래시 명령(`/gsd:command-name`)
- **반중력:** 스킬

**총 명령:** 44

### 워크플로(`get-shit-done/workflows/*.md`)

참조를 명령하는 오케스트레이션 논리입니다. 다음을 포함한 단계별 프로세스가 포함되어 있습니다.
- `gsd-tools.cjs init`을 통한 컨텍스트 로딩
- 모델 해상도를 포함한 에이전트 생성 지침
- 게이트/체크포인트 정의
- 상태 업데이트 패턴
- 오류 처리 및 복구

**총 워크플로우:** 46

### 상담원(`agents/*.md`)

다음을 지정하는 전문 에이전트 정의:
- `name` — 에이전트 식별자
- `description` — 역할 및 목적
- `tools` — 허용된 도구 액세스(읽기, 쓰기, 편집, Bash, Grep, Glob, WebSearch 등)
- `color` — 시각적 구별을 위한 터미널 출력 색상

**총 상담사:** 16

### 참고자료(`get-shit-done/references/*.md`)

워크플로 및 에이전트가 `@-reference`하는 공유 지식 문서:
- `checkpoints.md` — 체크포인트 유형 정의 및 상호 작용 패턴
- `model-profiles.md` — 에이전트별 모델 계층 할당
- `verification-patterns.md` — 다양한 아티팩트 유형을 확인하는 방법
Error 500 (Server Error)!!1500.That’s an error.There was an error. Please try again later.That’s all we know.
- `git-integration.md` — Git 커밋, 분기 및 기록 패턴
- `questioning.md` — 프로젝트 초기화를 위한 드림 추출 철학
- `tdd.md` — 테스트 기반 개발 통합 패턴
- `ui-brand.md` — 시각적 출력 형식 지정 패턴

### 템플릿(`get-shit-done/templates/`)

모든 계획 아티팩트에 대한 마크다운 템플릿입니다. `gsd-tools.cjs template fill` 및 `scaffold` 명령에서 사전 구조화된 파일을 생성하는 데 사용됩니다.
- `project.md`, `requirements.md`, `roadmap.md`, `state.md` — 핵심 프로젝트 파일
- `phase-prompt.md` — 단계 실행 프롬프트 템플릿
- `summary.md` (+ `summary-minimal.md`, `summary-standard.md`, `summary-complex.md`) — 세분성 인식 요약 템플릿
- `DEBUG.md` — 디버그 세션 추적 템플릿
- `UI-SPEC.md`, `UAT.md`, `VALIDATION.md` — 전문화된 검증 템플릿
- `discussion-log.md` — 토론 감사 추적 템플릿
- `codebase/` — 브라운필드 매핑 템플릿(스택, 아키텍처, 규칙, 문제, 구조, 테스트, 통합)
- `research-project/` — 연구 결과 템플릿(요약, 스택, 기능, 아키텍처, 문제)

### 후크(`hooks/`)

호스트 AI 에이전트와 통합되는 런타임 후크:

| 후크 | 이벤트 | 목적 |
|------|-------|---------|
| `gsd-statusline.js` | `statusLine` | 모델, 작업, 디렉터리 및 컨텍스트 사용량 표시줄 표시 |
| `gsd-context-monitor.js` | `PostToolUse` / `AfterTool` | 35%/25% 남음에 에이전트 관련 상황 경고 삽입 |
| `gsd-check-update.js` | `SessionStart` | 새로운 GSD 버전에 대한 배경 조사 |
| `gsd-prompt-guard.js` | `PreToolUse` | `.planning/`가 프롬프트 주입 패턴에 대해 쓰기를 검사합니다(권고) |
| `gsd-workflow-guard.js` | `PreToolUse` | GSD 작업 흐름 컨텍스트 외부의 파일 편집을 감지합니다(권고, `hooks.workflow_guard`를 통한 선택) |

### CLI 도구(`get-shit-done/bin/`)

17개의 도메인 모듈이 포함된 Node.js CLI 유틸리티(`gsd-tools.cjs`):

| 모듈 | 책임 |
|--------|---------------|
| `core.cjs` | 오류 처리, 출력 형식화, 공유 유틸리티 |
| `state.cjs` | STATE.md 구문 분석, 업데이트, 진행, 측정항목 |
| `phase.cjs` | 단계 디렉토리 작업, 십진수 매기기, 계획 색인화 |
| `roadmap.cjs` | ROADMAP.md 파싱, 단계 추출, 계획 진행 |
| `config.cjs` | config.json 읽기/쓰기, 섹션 초기화 |
| `verify.cjs` | 계획 구조, 단계 완전성, 참조, 커밋 검증 |
| `template.cjs` | 템플릿 선택 및 변수 대체 채우기 |
| `frontmatter.cjs` | YAML 머리말 CRUD 작업 |
| `init.cjs` | 각 워크플로우 유형에 대한 복합 컨텍스트 로딩 |
| `milestone.cjs` | 이정표 보관, 요구사항 표시 |
| `commands.cjs` | 기타 명령(슬러그, 타임스탬프, 할 일, 스캐폴딩, 통계) |
| `model-profiles.cjs` | 모델 프로필 해상도 표 |
| `security.cjs` | 경로 탐색 방지, 신속한 삽입 감지, 안전한 JSON 구문 분석, 셸 인수 유효성 검사 |
| `uat.cjs` | UAT 파일 구문 분석, 검증 부채 추적, 감사 UAT 지원 |

---

## 에이전트 모델

### Orchestrator → 에이전트 패턴

```
Orchestrator (workflow .md)
    │
    ├── Load context: gsd-tools.cjs init <workflow> <phase>
    │   Returns JSON with: project info, config, state, phase details
    │
    ├── Resolve model: gsd-tools.cjs resolve-model <agent-name>
    │   Returns: opus | sonnet | haiku | inherit
    │
    ├── Spawn Agent (Task/SubAgent call)
    │   ├── Agent prompt (agents/*.md)
    │   ├── Context payload (init JSON)
    │   ├── Model assignment
    │   └── Tool permissions
    │
    ├── Collect result
    │
    └── Update state: gsd-tools.cjs state update/patch/advance-plan
```

### 에이전트 생성 카테고리

| 카테고리 | 에이전트 | 병렬성 |
|----------|--------|-------------|
| **연구원** | gsd-프로젝트-리서처, gsd-단계-리서처, gsd-ui-리서처, gsd-advisor-리서처 | 4개 병렬(스택, 기능, 아키텍처, 함정) 토론 단계에서 고문이 생성됨 |
| **신디사이저** | gsd-연구-합성기 | 순차적(연구원 완료 후) |
| **기획자** | gsd-플래너, gsd-로드매퍼 | 순차 |
| **체커** | gsd-계획-검사기, gsd-통합-검사기, gsd-ui-검사기, gsd-nyquist-auditor | 순차(검증 루프, 최대 3회 반복) |
| **집행자** | gsd 실행자 | 파동 내에서는 평행, 파동에 걸쳐 순차적 |
| **검증자** | gsd 검증기 | 순차(모든 실행자가 완료된 후) |
| **매퍼** | gsd-코드베이스-매퍼 | 4가지 병행(기술, 아치, 품질, 우려) |
| **디버거** | gsd 디버거 | 순차(대화형) |
| **감사인** | gsd-ui-감사자 | 순차 |

### 웨이브 실행 모델

`execute-phase` 동안 계획은 종속성 웨이브로 그룹화됩니다.

```
Wave Analysis:
  Plan 01 (no deps)      ─┐
  Plan 02 (no deps)      ─┤── Wave 1 (parallel)
  Plan 03 (depends: 01)  ─┤── Wave 2 (waits for Wave 1)
  Plan 04 (depends: 02)  ─┘
  Plan 05 (depends: 03,04) ── Wave 3 (waits for Wave 2)
```

각 실행자는 다음을 얻습니다.
- 새로운 200K 컨텍스트 창
- 실행할 특정 PLAN.md
- 프로젝트 컨텍스트(PROJECT.md, STATE.md)
- 단계 컨텍스트(CONTEXT.md, RESEARCH.md(사용 가능한 경우))

#### 병렬 커밋 안전성

여러 실행기가 동일한 웨이브 내에서 실행되는 경우 두 가지 메커니즘이 충돌을 방지합니다.

1. **`--no-verify` 커밋** — 병렬 에이전트는 커밋 전 후크를 건너뜁니다(이로 인해 빌드 잠금 경합이 발생할 수 있습니다(예: Rust 프로젝트의 화물 잠금 싸움). 오케스트레이터는 각 웨이브가 완료된 후 `git hook run pre-commit`을 한 번 실행합니다.

2. **STATE.md file locking** — All `writeStateMd()` calls use lockfile-based mutual exclusion (`STATE.md.lock` with `O_EXCL` atomic creation). 이렇게 하면 두 에이전트가 STATE.md를 읽고, 서로 다른 필드를 수정하고, 마지막 작성자가 다른 작성자의 변경 사항을 덮어쓰는 읽기-수정-쓰기 경쟁 조건이 방지됩니다. Includes stale lock detection (10s timeout) and spin-wait with jitter.

---

## 데이터 흐름

### 새 프로젝트 흐름

```
User input (idea description)
    │
    ▼
Questions (questioning.md philosophy)
    │
    ▼
4x Project Researchers (parallel)
    ├── Stack → STACK.md
    ├── Features → FEATURES.md
    ├── Architecture → ARCHITECTURE.md
    └── Pitfalls → PITFALLS.md
    │
    ▼
Research Synthesizer → SUMMARY.md
    │
    ▼
Requirements extraction → REQUIREMENTS.md
    │
    ▼
Roadmapper → ROADMAP.md
    │
    ▼
User approval → STATE.md initialized
```

### 단계 실행 흐름

```
discuss-phase → CONTEXT.md (user preferences)
    │
    ▼
ui-phase → UI-SPEC.md (design contract, optional)
    │
    ▼
plan-phase
    ├── Phase Researcher → RESEARCH.md
    ├── Planner → PLAN.md files
    └── Plan Checker → Verify loop (max 3x)
    │
    ▼
execute-phase
    ├── Wave analysis (dependency grouping)
    ├── Executor per plan → code + atomic commits
    ├── SUMMARY.md per plan
    └── Verifier → VERIFICATION.md
    │
    ▼
verify-work → UAT.md (user acceptance testing)
    │
    ▼
ui-review → UI-REVIEW.md (visual audit, optional)
```

### 컨텍스트 전파

각 워크플로 단계는 후속 단계에 제공되는 아티팩트를 생성합니다.

```
PROJECT.md ────────────────────────────────────────────► All agents
REQUIREMENTS.md ───────────────────────────────────────► Planner, Verifier, Auditor
ROADMAP.md ────────────────────────────────────────────► Orchestrators
STATE.md ──────────────────────────────────────────────► All agents (decisions, blockers)
CONTEXT.md (per phase) ────────────────────────────────► Researcher, Planner, Executor
RESEARCH.md (per phase) ───────────────────────────────► Planner, Plan Checker
PLAN.md (per plan) ────────────────────────────────────► Executor, Plan Checker
SUMMARY.md (per plan) ─────────────────────────────────► Verifier, State tracking
UI-SPEC.md (per phase) ────────────────────────────────► Executor, UI Auditor
```

---

## 파일 시스템 레이아웃

### 설치 파일

```
~/.claude/                          # Claude Code (global install)
├── commands/gsd/*.md               # 37 slash commands
├── get-shit-done/
│   ├── bin/gsd-tools.cjs           # CLI utility
│   ├── bin/lib/*.cjs               # 15 domain modules
│   ├── workflows/*.md              # 42 workflow definitions
│   ├── references/*.md             # 13 shared reference docs
│   └── templates/                  # Planning artifact templates
├── agents/*.md                     # 15 agent definitions
├── hooks/
│   ├── gsd-statusline.js           # Statusline hook
│   ├── gsd-context-monitor.js      # Context warning hook
│   └── gsd-check-update.js         # Update check hook
├── settings.json                   # Hook registrations
└── VERSION                         # Installed version number
```

다른 런타임에 대한 동등한 경로:
- **오픈코드:** `~/.config/opencode/` 또는 `~/.opencode/`
- **Gemini CLI:** `~/.gemini/`
- **코덱스:** `~/.codex/` (명령 대신 스킬을 사용합니다)
- **부조종사:** `~/.github/`
- **반중력:** `~/.gemini/antigravity/`(글로벌) 또는 `./.agent/`(로컬)

### 프로젝트 파일(`.planning/`)

```
.planning/
├── PROJECT.md              # Project vision, constraints, decisions, evolution rules
├── REQUIREMENTS.md         # Scoped requirements (v1/v2/out-of-scope)
├── ROADMAP.md              # Phase breakdown with status tracking
├── STATE.md                # Living memory: position, decisions, blockers, metrics
├── config.json             # Workflow configuration
├── MILESTONES.md           # Completed milestone archive
├── research/               # Domain research from /gsd:new-project
│   ├── SUMMARY.md
│   ├── STACK.md
│   ├── FEATURES.md
│   ├── ARCHITECTURE.md
│   └── PITFALLS.md
├── codebase/               # Brownfield mapping (from /gsd:map-codebase)
│   ├── STACK.md
│   ├── ARCHITECTURE.md
│   ├── CONVENTIONS.md
│   ├── CONCERNS.md
│   ├── STRUCTURE.md
│   ├── TESTING.md
│   └── INTEGRATIONS.md
├── phases/
│   └── XX-phase-name/
│       ├── XX-CONTEXT.md       # User preferences (from discuss-phase)
│       ├── XX-RESEARCH.md      # Ecosystem research (from plan-phase)
│       ├── XX-YY-PLAN.md       # Execution plans
│       ├── XX-YY-SUMMARY.md    # Execution outcomes
│       ├── XX-VERIFICATION.md  # Post-execution verification
│       ├── XX-VALIDATION.md    # Nyquist test coverage mapping
│       ├── XX-UI-SPEC.md       # UI design contract (from ui-phase)
│       ├── XX-UI-REVIEW.md     # Visual audit scores (from ui-review)
│       └── XX-UAT.md           # User acceptance test results
├── quick/                  # Quick task tracking
│   └── YYMMDD-xxx-slug/
│       ├── PLAN.md
│       └── SUMMARY.md
├── todos/
│   ├── pending/            # Captured ideas
│   └── done/               # Completed todos
├── threads/               # Persistent context threads (from /gsd:thread)
├── seeds/                 # Forward-looking ideas (from /gsd:plant-seed)
├── debug/                  # Active debug sessions
│   ├── *.md                # Active sessions
│   ├── resolved/           # Archived sessions
│   └── knowledge-base.md   # Persistent debug learnings
├── ui-reviews/             # Screenshots from /gsd:ui-review (gitignored)
└── continue-here.md        # Context handoff (from pause-work)
```

---

## 설치 프로그램 아키텍처

설치 프로그램(`bin/install.js`, ~3,000줄)은 다음을 처리합니다.

1. **런타임 감지** — 대화형 프롬프트 또는 CLI 플래그(`--claude`, `--opencode`, `--gemini`, `--codex`, `--copilot`, `--antigravity`, `--all`)
2. **위치 선택** — 글로벌(`--global`) 또는 로컬(`--local`)
3. **파일 배포** — 명령, 워크플로, 참조, 템플릿, 에이전트, 후크를 복사합니다.
4. **런타임 적응** — 런타임별로 파일 콘텐츠를 변환합니다.
   - 클로드 코드: 그대로 사용
   - OpenCode: 에이전트 머리말을 `name:`, `model: inherit`, `mode: subagent`로 변환합니다.
   - Codex: 명령에서 TOML 구성 + 스킬을 생성합니다.
   - Copilot: 지도 도구 이름(읽기→읽기, Bash→실행 등)
   - Gemini: 후크 이벤트 이름 조정(`PostToolUse` 대신 `AfterTool`)
   - 반중력: Google 모델과 동등한 기술 우선
5. **경로 정규화** — `~/.claude/` 경로를 런타임별 경로로 대체합니다.
6. **설정 통합** — 런타임의 `settings.json`에 후크를 등록합니다.
7. **패치 백업** — v1.17부터 로컬에서 수정된 파일을 `/gsd:reapply-patches`에 대해 `gsd-local-patches/`에 백업합니다.
8. **매니페스트 추적** — 완전히 제거하려면 `gsd-file-manifest.json`을 씁니다.
9. **제거 모드** — `--uninstall`은 모든 GSD 파일, 후크 및 설정을 제거합니다.

### 플랫폼 처리

- **Windows:** 하위 프로세스의 `windowsHide`, 보호된 디렉터리의 EPERM/EACCES 보호, 경로 구분 기호 정규화
- **WSL:** WSL에서 실행되는 Windows Node.js를 감지하고 경로 불일치에 대해 경고합니다.
- **Docker/CI:** 사용자 정의 구성 디렉터리 위치에 대해 `CLAUDE_CONFIG_DIR` env var 지원

---

## 후크 시스템

### 건축학

```
Runtime Engine (Claude Code / Gemini CLI)
    │
    ├── statusLine event ──► gsd-statusline.js
    │   Reads: stdin (session JSON)
    │   Writes: stdout (formatted status), /tmp/claude-ctx-{session}.json (bridge)
    │
    ├── PostToolUse/AfterTool event ──► gsd-context-monitor.js
    │   Reads: stdin (tool event JSON), /tmp/claude-ctx-{session}.json (bridge)
    │   Writes: stdout (hookSpecificOutput with additionalContext warning)
    │
    └── SessionStart event ──► gsd-check-update.js
        Reads: VERSION file
        Writes: ~/.claude/cache/gsd-update-check.json (spawns background process)
```

### 컨텍스트 모니터 임계값

| 남은 컨텍스트 | 레벨 | 상담원 행동 |
|-------------------|-------|----------------|
| > 35% | 일반 | 경고가 주입되지 않음 |
| ≤ 35% | 경고 | "복잡한 작업을 새로 시작하지 마세요" |
| ≤ 25% | 심각 | "컨텍스트가 거의 소진되었습니다. 사용자에게 알립니다." |

디바운스(Debounce): 반복되는 경고 사이에 5번의 도구 사용. 심각도 에스컬레이션(WARNING→CRITICAL)은 디바운스를 우회합니다.

### 안전 속성

- 모든 후크는 try/catch로 래핑되고, 오류가 발생하면 자동으로 종료됩니다.
- stdin 시간 초과 가드(3초)로 파이프 문제를 방지합니다.
- 오래된 측정항목(60초 이상)은 무시됩니다.
- 누락된 브리지 파일이 정상적으로 처리됨(하위 에이전트, 새 세션)
- 컨텍스트 모니터는 권고 사항입니다. 사용자 기본 설정을 무시하는 필수 명령을 실행하지 않습니다.

### 보안 후크(v1.27)

**프롬프트 가드** (`gsd-prompt-guard.js`):
- `.planning/` 파일에 대한 쓰기/편집 시 트리거됩니다.
- 프롬프트 주입 패턴(역할 재정의, 명령 우회, 시스템 태그 주입)에 대한 콘텐츠를 검사합니다.
- 자문 전용 — 로그 감지, 차단하지 않음
- 후크 독립성을 위해 패턴이 인라인됩니다(`security.cjs`의 하위 집합).

**워크플로 가드**(`gsd-workflow-guard.js`):
- `.planning/`이 아닌 파일에 대한 쓰기/편집 시 트리거됩니다.
- GSD 작업 흐름 컨텍스트 외부의 편집을 감지합니다(활성 `/gsd:` 명령 또는 작업 하위 에이전트 없음).
- 상태 추적 변경 사항에 `/gsd:quick` 또는 `/gsd:fast` 사용을 권장합니다.
- `hooks.workflow_guard: true`을(를) 통해 선택(기본값: false)

---

## 런타임 추상화

GSD는 통합된 명령/워크플로 아키텍처를 통해 6개의 AI 코딩 런타임을 지원합니다.

| 런타임 | 명령 형식 | 에이전트 시스템 | 구성 위치 |
|---------|---------------|--------------|-----------------|
| 클로드 코드 | `/gsd:command` | 작업 생성 | `~/.claude/` |
| 오픈코드 | `/gsd-command` | 하위 에이전트 모드 | `~/.config/opencode/` |
| 제미니 CLI | `/gsd:command` | 작업 생성 | `~/.gemini/` |
| 코덱스 | `$gsd-command` | 기술 | `~/.codex/` |
| 부조종사 | `/gsd:command` | 대리인 위임 | `~/.github/` |
| 반중력 | 기술 | 기술 | `~/.gemini/antigravity/` |

### 추상화 지점

1. **도구 이름 매핑** — 각 런타임에는 고유한 도구 이름이 있습니다(예: Claude의 `Bash` → Copilot의 `execute`)
2. **후크 이벤트 이름** — Claude는 `PostToolUse`을 사용하고 Gemini는 `AfterTool`을 사용합니다.
3. **에이전트 머리말** — 각 런타임에는 고유한 에이전트 정의 형식이 있습니다.
4. **경로 규칙** — 각 런타임은 구성을 서로 다른 디렉터리에 저장합니다.
5. **모델 참조** — `inherit` 프로필을 사용하면 GSD가 런타임의 모델 선택을 연기할 수 있습니다.

설치 프로그램은 설치 시 모든 번역을 처리합니다. 워크플로와 에이전트는 Claude Code의 기본 형식으로 작성되고 배포 중에 변환됩니다.
