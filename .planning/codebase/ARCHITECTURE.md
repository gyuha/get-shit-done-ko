# Architecture

**Analysis Date:** 2026-03-26

## Pattern Overview

**Overall:** 자산 중심 installer + file-based workflow orchestration 구조

**Key Characteristics:**
- `bin/install.js`가 source-of-truth 자산을 런타임별 설치 레이아웃으로 변환한다.
- `commands/gsd/*.md`와 `get-shit-done/workflows/*.md`가 분리되어 command layer와 execution layer를 나눈다.
- `.planning/`이 프로젝트 상태 저장소 역할을 하며 `get-shit-done/bin/lib/*.cjs`가 그 상태를 읽고 갱신한다.

## Layers

**Installer Layer:**
- Purpose: 저장소 자산을 Claude, Codex, OpenCode, Gemini, Copilot, Cursor, Antigravity 레이아웃으로 복제하고 경로를 변환한다.
- Location: `bin/install.js`
- Contains: 런타임 선택, 경로 치환, 명령/skill 변환, hook 설치, uninstall, manifest 생성
- Depends on: `package.json`, `commands/gsd/`, `get-shit-done/`, `agents/`, `hooks/dist/`, `skills/`
- Used by: npm bin 엔트리 `get-shit-done-ko`

**Command Definition Layer:**
- Purpose: 사용자가 호출하는 slash command 또는 skill의 진입 문서를 제공한다.
- Location: `commands/gsd/`
- Contains: frontmatter가 있는 command markdown, `@~/.claude/get-shit-done/workflows/*.md` execution context 참조
- Depends on: `get-shit-done/workflows/`
- Used by: Claude/Copilot/Gemini 계열 런타임과 installer의 변환 로직

**Workflow Asset Layer:**
- Purpose: 각 command가 따라야 할 절차, 체크리스트, branching 조건을 선언형 문서로 정의한다.
- Location: `get-shit-done/workflows/`
- Contains: phase planning, execution, mapping, milestone, verification, settings 관련 markdown workflow
- Depends on: `get-shit-done/templates/`, `get-shit-done/references/`, `get-shit-done/bin/gsd-tools.cjs`
- Used by: `commands/gsd/*.md`, installed runtime mirrors under `.claude/`, `.codex/`, `.opencode/`

**CLI Utility Layer:**
- Purpose: workflow 문서 안의 반복 shell 패턴을 안정적인 Node CLI 명령으로 대체한다.
- Location: `get-shit-done/bin/gsd-tools.cjs`, `get-shit-done/bin/lib/*.cjs`
- Contains: init payload 생성, planning state CRUD, roadmap/phase/milestone 계산, verification, template fill, security helpers
- Depends on: `get-shit-done/bin/lib/core.cjs` 공용 경로/출력 헬퍼와 `.planning/` 파일들
- Used by: `get-shit-done/workflows/*.md`, `tests/*.test.cjs`

**Project State Layer:**
- Purpose: 프로젝트별 장기 컨텍스트와 실행 이력을 파일로 유지한다.
- Location: `.planning/`
- Contains: `PROJECT.md`, `REQUIREMENTS.md`, `ROADMAP.md`, `STATE.md`, phase directories, quick tasks, codebase maps
- Depends on: `get-shit-done/templates/*.md`, `get-shit-done/bin/lib/state.cjs`, `get-shit-done/bin/lib/roadmap.cjs`, `get-shit-done/bin/lib/phase.cjs`
- Used by: 거의 모든 workflow와 `get-shit-done/bin/lib/init.cjs`

**Runtime Mirror Layer:**
- Purpose: 실제 에이전트 런타임이 읽는 설치 결과를 저장한다.
- Location: `.claude/`, `.codex/`, `.opencode/`
- Contains: 설치된 agent definitions, converted commands/skills, `get-shit-done/` engine copy, settings/hooks/manifests
- Depends on: `bin/install.js`
- Used by: 각 로컬 runtime integration test와 실제 사용자 런타임

**Quality Gate Layer:**
- Purpose: installer, CLI helpers, 변환 로직, localization safety를 회귀 테스트로 고정한다.
- Location: `tests/`
- Contains: Node test runner 기반 `.test.cjs` 파일, temp project helpers in `tests/helpers.cjs`
- Depends on: `get-shit-done/bin/gsd-tools.cjs`, `bin/install.js`, source assets under `commands/`, `agents/`, `get-shit-done/`
- Used by: `scripts/run-tests.cjs`, `npm test`, `npm run test:coverage`

## Data Flow

**Runtime installation flow:**
1. 사용자가 npm bin 엔트리 `bin/install.js`를 실행한다.
2. installer가 runtime 선택과 설치 위치를 해석하고, source 자산 `commands/gsd/`, `agents/`, `get-shit-done/`, `hooks/dist/`, `skills/`를 읽는다.
3. installer가 runtime별 변환기를 적용해 target config dir 아래 `.claude/`, `.codex/`, `.opencode/`, `.github/`, `.cursor/`, `.agent/` 형태로 복제한다.
4. 생성된 mirror가 각 런타임의 command/skill/agent 진입점이 된다.

**Project workflow flow:**
1. 사용자가 설치된 command 문서 예: `commands/gsd/map-codebase.md` 또는 설치 mirror의 동등 자산을 호출한다.
2. command 문서가 `get-shit-done/workflows/*.md`를 execution context로 로드한다.
3. workflow가 `get-shit-done/bin/gsd-tools.cjs`의 `init`, `state`, `roadmap`, `verify`, `template` 명령을 호출해 현재 `.planning/` 상태를 구조화한다.
4. 결과 산출물은 `.planning/` 아래 markdown/json 파일로 저장되고 다음 workflow의 입력이 된다.

**Test verification flow:**
1. `scripts/run-tests.cjs`가 `tests/*.test.cjs`를 실행한다.
2. tests가 `tests/helpers.cjs`를 통해 temp project 또는 temp git project를 만든다.
3. 테스트가 `get-shit-done/bin/gsd-tools.cjs`와 `bin/install.js`를 직접 호출해 source asset, installer, runtime mirror 동작을 검증한다.

**State Management:**
- 상태는 메모리 DB가 아니라 `.planning/` 파일 집합에 저장한다.
- `get-shit-done/bin/lib/core.cjs`의 `planningDir`, `planningPaths`, `findProjectRoot`, `resolveWorktreeRoot`가 상태 저장 위치를 정규화한다.
- `get-shit-done/bin/lib/init.cjs`가 workflow용 초기 컨텍스트 JSON을 만든다.

## Key Abstractions

**Command Document:**
- Purpose: 사용자가 직접 호출하는 인터페이스를 정의한다.
- Examples: `commands/gsd/map-codebase.md`, `commands/gsd/plan-phase.md`, `commands/gsd/execute-phase.md`
- Pattern: YAML frontmatter + objective/context/process sections + workflow reference

**Workflow Document:**
- Purpose: command를 실행 가능한 단계로 풀어낸다.
- Examples: `get-shit-done/workflows/map-codebase.md`, `get-shit-done/workflows/new-project.md`, `get-shit-done/workflows/help.md`
- Pattern: XML-like section blocks + shell snippets + decision branches

**Planning Artifact:**
- Purpose: 프로젝트 맥락과 phase 실행 결과를 누적한다.
- Examples: `.planning/PROJECT.md`, `.planning/ROADMAP.md`, `.planning/STATE.md`, `.planning/codebase/*.md`
- Pattern: markdown templates filled by workflows and CLI helpers

**Runtime Converter:**
- Purpose: 하나의 source asset 집합을 각 runtime의 command/skill schema로 맞춘다.
- Examples: `bin/install.js`의 `copyFlattenedCommands`, `copyCommandsAsCodexSkills`, `copyCommandsAsCopilotSkills`, `copyWithPathReplacement`
- Pattern: recursive copy + content transformation + manifest verification

**CLI Helper Module:**
- Purpose: workflow 문서에서 재사용하는 계산과 파일 조작을 캡슐화한다.
- Examples: `get-shit-done/bin/lib/core.cjs`, `get-shit-done/bin/lib/init.cjs`, `get-shit-done/bin/lib/commands.cjs`, `get-shit-done/bin/lib/verify.cjs`
- Pattern: 명령형 Node module + `output()` JSON serialization + `.planning/` path helpers

## Entry Points

**Package binary:**
- Location: `package.json`, `bin/install.js`
- Triggers: `npx get-shit-done-ko@latest`, 로컬 개발 시 `node bin/install.js`
- Responsibilities: 설치/제거, runtime asset 변환, hook 배포, runtime settings patch

**Workflow utility CLI:**
- Location: `get-shit-done/bin/gsd-tools.cjs`
- Triggers: workflow markdown inside `get-shit-done/workflows/*.md`, tests in `tests/*.test.cjs`
- Responsibilities: init payload 생성, state/roadmap/phase 조작, verification, template fill, structured JSON output

**Runtime command assets:**
- Location: `commands/gsd/*.md`
- Triggers: runtime-specific slash command or converted skill invocation
- Responsibilities: objective 선언, workflow 연결, allowed tools 스코프 지정

**Build helper:**
- Location: `scripts/build-hooks.js`
- Triggers: `npm run build:hooks`, `prepublishOnly`
- Responsibilities: `hooks/*.js` syntax 검증 후 `hooks/dist/`에 배포용 파일 복사

## Error Handling

**Strategy:** fail-fast CLI exit + permissive file probing

**Patterns:**
- 필수 인자가 없거나 경로가 잘못되면 `get-shit-done/bin/lib/core.cjs`의 `error()`가 stderr 출력 후 즉시 종료한다.
- 선택적 파일 조회는 `safeReadFile()` 또는 `try/catch`로 감싸고, 읽기 실패 시 null/빈 결과로 폴백한다.
- installer는 복제/검증 결과를 개별 항목 단위로 누적하고 일부 runtime asset 실패를 보고한다.
- hook build는 `scripts/build-hooks.js`에서 syntax error를 발견하면 배포 전에 종료한다.

## Cross-Cutting Concerns

**Logging:** `bin/install.js`, `scripts/build-hooks.js`, `get-shit-done/bin/lib/*.cjs`는 `console.log`, `console.warn`, `console.error`, `fs.writeSync` 기반 CLI 출력을 사용한다.

**Validation:** 입력 검증과 planning 검증은 `get-shit-done/bin/lib/verify.cjs`, `get-shit-done/bin/lib/frontmatter.cjs`, `get-shit-done/bin/lib/security.cjs`, `scripts/secret-scan.sh`, `scripts/prompt-injection-scan.sh`로 분리한다.

**Authentication:** 애플리케이션 사용자 인증 계층은 없다. 외부 런타임 설정과 optional API key 파일 존재 여부 감지는 `bin/install.js`와 `get-shit-done/bin/lib/init.cjs`가 담당한다.

---

*Architecture analysis: 2026-03-26*
