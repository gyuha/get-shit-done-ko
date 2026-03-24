<purpose>
한국어 우선 안내: 이 워크플로 자산은 `help` 흐름을 한국어 기준으로 먼저 읽을 수 있게 정리합니다. 아래 영문 원문은 upstream 동기화와 세부 의미 보존을 위해 함께 유지합니다.

한국어 우선 안내: 이 워크플로는 전체 GSD 명령 레퍼런스를 한국어 기준으로 먼저 보여 줍니다. 아래 영문 원문은 upstream 동기화와 세부 의미 보존을 위해 함께 유지합니다.

Display the complete GSD command reference. Output ONLY the reference content. Do NOT add project-specific analysis, git status, next-step suggestions, or any commentary beyond the reference.
</purpose>

<reference>
# GSD 명령어 레퍼런스

**GSD** (Get Shit Done)는 Claude Code에서 solo agentic development를 할 때 쓰기 좋은 계층형 프로젝트 계획을 만듭니다.

## 빠른 시작

1. `$gsd-new-project` - 프로젝트 초기화 (research, requirements, roadmap 포함)
2. `$gsd-plan-phase 1` - 첫 phase의 상세 계획 생성
3. `$gsd-execute-phase 1` - phase 실행

## 업데이트 유지

GSD는 빠르게 발전합니다. 주기적으로 업데이트하세요:

```bash
npx get-shit-done-ko@latest
```

## 핵심 워크플로

```
$gsd-new-project → $gsd-plan-phase → $gsd-execute-phase → 반복
```

### 프로젝트 초기화

**`$gsd-new-project`**
통합 플로우로 새 프로젝트를 초기화합니다.

하나의 명령으로 아이디어 단계에서 planning 준비 완료 상태까지 이동합니다:
- 무엇을 만들려는지 이해하기 위한 깊이 있는 질문
- 선택 가능한 domain research (병렬 researcher agent 4개 실행)
- v1/v2/out-of-scope 범위를 포함한 requirements 정의
- phase breakdown과 success criteria가 포함된 roadmap 생성

다음 `.planning/` 산출물을 만듭니다:
- `PROJECT.md` — vision and requirements
- `config.json` — workflow mode (interactive/yolo)
- `research/` — domain research (if selected)
- `REQUIREMENTS.md` — scoped requirements with REQ-IDs
- `ROADMAP.md` — phases mapped to requirements
- `STATE.md` — project memory

Usage: `$gsd-new-project`

**`$gsd-map-codebase`**
기존 코드베이스를 brownfield 프로젝트용으로 분석합니다.

- 병렬 Explore agent로 코드베이스를 분석합니다
- `.planning/codebase/` 아래에 초점이 다른 문서 7개를 만듭니다
- stack, architecture, structure, conventions, testing, integrations, concerns를 다룹니다
- 기존 코드베이스에서는 `$gsd-new-project` 전에 사용하세요

Usage: `$gsd-map-codebase`

### Phase 계획

**`$gsd-discuss-phase <number>`**
planning 전에 해당 phase에 대한 구상을 더 분명하게 정리합니다.

- 이 phase가 어떻게 동작하길 원하는지 캡처합니다
- 비전, 핵심 요소, 경계를 담은 CONTEXT.md를 만듭니다
- 어떤 기능의 모양새나 느낌에 대한 아이디어가 있을 때 사용하세요
- 선택적인 `--batch`는 질문을 하나씩 대신 2-5개씩 묶어 물어봅니다

Usage: `$gsd-discuss-phase 2`
Usage: `$gsd-discuss-phase 2 --batch`
Usage: `$gsd-discuss-phase 2 --batch=3`

**`$gsd-research-phase <number>`**
특수하거나 복잡한 도메인을 위한 포괄적 ecosystem research를 수행합니다.

- 표준 stack, architecture pattern, pitfalls를 찾아냅니다
- "전문가들은 이걸 어떻게 만드는가"를 담은 RESEARCH.md를 만듭니다
- 3D, 게임, 오디오, 셰이더, ML 같은 특수 도메인에서 유용합니다
- 단순한 "어떤 라이브러리인가"를 넘어 ecosystem 지식까지 다룹니다

Usage: `$gsd-research-phase 3`

**`$gsd-list-phase-assumptions <number>`**
실행 전에 agent가 어떤 접근을 생각하는지 확인합니다.

- 해당 phase에 대해 agent가 의도한 접근을 보여 줍니다
- agent가 당신의 구상을 잘못 이해했을 때 방향을 바로잡을 수 있습니다
- 파일은 만들지 않고 대화형 출력만 제공합니다

Usage: `$gsd-list-phase-assumptions 3`

**`$gsd-plan-phase <number>`**
특정 phase에 대한 상세 실행 계획을 만듭니다.

- `.planning/phases/XX-phase-name/XX-YY-PLAN.md`를 생성합니다
- phase를 구체적이고 실행 가능한 task로 나눕니다
- verification criteria와 success measure를 포함합니다
- phase당 여러 plan을 지원합니다 (XX-01, XX-02 등)

Usage: `$gsd-plan-phase 1`
Result: `.planning/phases/01-foundation/01-01-PLAN.md` 생성

**PRD Express Path:** `--prd path/to/requirements.md`를 넘기면 discuss-phase를 완전히 건너뜁니다. PRD 내용은 CONTEXT.md의 locked decision이 됩니다. 이미 명확한 acceptance criteria가 있을 때 유용합니다.

### 실행

**`$gsd-execute-phase <phase-number>`**
phase 안의 모든 plan을 실행하거나, 특정 wave만 실행합니다.

- plan을 wave(frontmatter 기준)별로 묶고, wave는 순차적으로 실행합니다
- 각 wave 내부 plan은 Task tool을 통해 병렬 실행됩니다
- 선택적인 `--wave N`은 Wave `N`만 실행하고, phase가 완전히 끝난 경우가 아니면 그 자리에서 멈춥니다
- 모든 plan이 끝나면 phase goal을 검증합니다
- REQUIREMENTS.md, ROADMAP.md, STATE.md를 갱신합니다

Usage: `$gsd-execute-phase 5`
Usage: `$gsd-execute-phase 5 --wave 2`

### 스마트 라우터

**`$gsd-do <description>`**
자유 형식 텍스트를 적절한 GSD 명령으로 자동 라우팅합니다.

- 자연어 입력을 분석해 가장 잘 맞는 GSD 명령을 찾습니다
- dispatcher 역할만 하며, 실제 작업은 직접 수행하지 않습니다
- 애매하면 상위 후보 중에서 선택하게 해 줍니다
- 원하는 작업은 알지만 어떤 `$gsd-*` 명령을 써야 할지 모를 때 사용하세요

Usage: `$gsd-do fix the login button`
Usage: `$gsd-do refactor the auth system`
Usage: `$gsd-do I want to start a new milestone`

### 빠른 모드

**`$gsd-quick [--full] [--discuss] [--research]`**
GSD의 안전장치는 유지하면서 작은 ad-hoc task를 optional agent 없이 빠르게 실행합니다.

Quick mode는 같은 시스템을 더 짧은 경로로 사용합니다:
- planner + executor를 실행합니다 (기본적으로 researcher, checker, verifier는 생략)
- quick task는 planned phase와 분리된 `.planning/quick/`에 저장됩니다
- ROADMAP.md 대신 STATE.md tracking만 업데이트합니다

flag로 추가 품질 단계를 켤 수 있습니다:
- `--discuss` — planning 전에 회색지대를 드러내는 가벼운 discussion
- `--research` — planning 전에 focused research agent가 접근법을 조사
- `--full` — plan-checking(최대 2회 반복)과 post-execution verification 추가

flag는 조합 가능합니다: `--discuss --research --full`이면 단일 task에도 전체 품질 파이프라인이 적용됩니다.

Usage: `$gsd-quick`
Usage: `$gsd-quick --research --full`
Result: `.planning/quick/NNN-slug/PLAN.md`, `.planning/quick/NNN-slug/SUMMARY.md` 생성

---

**`$gsd-fast [description]`**
아주 작은 task를 inline으로 실행합니다. subagent도 없고, planning file도 없고, 오버헤드도 없습니다.

planning이 과할 정도로 작은 작업에 적합합니다: 오타 수정, config 변경, 빠진 commit, 단순 추가 작업 등. 현재 컨텍스트에서 바로 변경하고, commit하고, STATE.md에 기록합니다.

- PLAN.md나 SUMMARY.md를 만들지 않습니다
- subagent를 실행하지 않습니다 (inline 실행)
- 파일 수정이 3개 이하인 trivial task 기준이며, 더 크면 `$gsd-quick`으로 보냅니다
- conventional message로 atomic commit합니다

Usage: `$gsd-fast "fix the typo in README"`
Usage: `$gsd-fast "add .env to gitignore"`

### 로드맵 관리

**`$gsd-add-phase <description>`**
현재 milestone 끝에 새 phase를 추가합니다.

- ROADMAP.md 끝에 추가합니다
- 다음 순번을 사용합니다
- phase 디렉터리 구조를 업데이트합니다

Usage: `$gsd-add-phase "Add admin dashboard"`

**`$gsd-insert-phase <after> <description>`**
기존 phase 사이에 긴급 작업을 decimal phase로 삽입합니다.

- 중간 phase를 만듭니다 (예: 7과 8 사이의 7.1)
- milestone 중간에 반드시 들어가야 하는 새 작업에 유용합니다
- phase 순서를 유지합니다

Usage: `$gsd-insert-phase 7 "Fix critical auth bug"`
Result: Phase 7.1 생성

**`$gsd-remove-phase <number>`**
미래 phase를 제거하고 뒤 phase 번호를 다시 맞춥니다.

- phase 디렉터리와 모든 reference를 삭제합니다
- 뒤따르는 phase 번호를 모두 재조정해 빈 번호를 메웁니다
- 아직 시작하지 않은 future phase에서만 동작합니다
- Git commit으로 히스토리 기록은 보존됩니다

Usage: `$gsd-remove-phase 17`
Result: Phase 17 삭제, Phase 18-20은 17-19로 재번호화

### 마일스톤 관리

**`$gsd-new-milestone <name>`**
통합 플로우로 새 milestone을 시작합니다.

- 다음에 무엇을 만들지 이해하기 위한 깊이 있는 질문
- 선택 가능한 domain research (병렬 researcher agent 4개 실행)
- 범위를 고려한 requirements 정의
- phase breakdown이 포함된 roadmap 생성
- 선택적인 `--reset-phase-numbers`는 번호를 Phase 1부터 다시 시작하고, 안전을 위해 기존 phase 디렉터리를 먼저 archive합니다

기존 PROJECT.md가 있는 brownfield 프로젝트에서 `$gsd-new-project`와 같은 흐름을 재사용합니다.

Usage: `$gsd-new-milestone "v2.0 Features"`
Usage: `$gsd-new-milestone --reset-phase-numbers "v2.0 Features"`

**`$gsd-complete-milestone <version>`**
완료된 milestone을 archive하고 다음 버전을 준비합니다.

- 통계가 포함된 MILESTONES.md 항목을 만듭니다
- 전체 상세 내용을 milestones/ 디렉터리에 archive합니다
- 릴리스를 위한 git tag를 만듭니다
- 다음 버전을 위한 workspace를 준비합니다

Usage: `$gsd-complete-milestone 1.0.0`

### 진행 상황 추적

**`$gsd-progress`**
프로젝트 상태를 확인하고 다음 액션으로 자연스럽게 이어지게 합니다.

- 시각적 progress bar와 완료 비율을 보여 줍니다
- SUMMARY 파일 기준으로 최근 작업을 요약합니다
- 현재 위치와 다음 할 일을 보여 줍니다
- 핵심 결정과 열려 있는 이슈를 나열합니다
- 다음 plan 실행이나, plan이 없으면 생성하도록 제안합니다
- milestone 100% 완료 여부를 감지합니다

Usage: `$gsd-progress`

### 세션 관리

**`$gsd-resume-work`**
이전 세션의 컨텍스트를 복원해 작업을 재개합니다.

- 프로젝트 컨텍스트를 위해 STATE.md를 읽습니다
- 현재 위치와 최근 진행 상황을 보여 줍니다
- 프로젝트 상태를 바탕으로 다음 액션을 제안합니다

Usage: `$gsd-resume-work`

**`$gsd-pause-work`**
phase 진행 중 작업을 멈출 때 이어받을 수 있는 handoff를 만듭니다.

- 현재 상태를 담은 .continue-here 파일을 만듭니다
- STATE.md의 session continuity 섹션을 업데이트합니다
- 진행 중인 작업 컨텍스트를 캡처합니다

Usage: `$gsd-pause-work`

### 디버깅

**`$gsd-debug [issue description]`**
컨텍스트 리셋을 넘어 이어지는 persistent state 기반의 체계적 디버깅입니다.

- 적응형 질문으로 증상을 수집합니다
- 조사 추적을 위해 `.planning/debug/[slug].md`를 만듭니다
- scientific method(증거 → 가설 → 실험)로 조사합니다
- `/clear` 이후에도 이어집니다 — 인자 없이 `$gsd-debug`를 실행하면 재개합니다
- 해결된 이슈는 `.planning/debug/resolved/`에 archive합니다

Usage: `$gsd-debug "login button doesn't work"`
Usage: `$gsd-debug` (resume active session)

### 빠른 메모

**`$gsd-note <text>`**
질문 없이 한 번에 저장하는 zero-friction 아이디어 캡처입니다.

- timestamp가 붙은 note를 `.planning/notes/`에 저장합니다 (전역에서는 `/Users/gyuha/workspace/get-shit-done-ko/.codex/notes/`)
- append(기본값), list, promote 세 가지 하위 명령이 있습니다
- promote는 note를 structured todo로 승격합니다
- 프로젝트가 없어도 동작합니다 (global scope로 fallback)

Usage: `$gsd-note refactor the hook system`
Usage: `$gsd-note list`
Usage: `$gsd-note promote 3`
Usage: `$gsd-note --global cross-project idea`

### Todo 관리

**`$gsd-add-todo [description]`**
현재 대화에서 아이디어나 task를 todo로 캡처합니다.

- 대화에서 컨텍스트를 추출합니다 (또는 제공한 설명을 그대로 사용합니다)
- `.planning/todos/pending/`에 structured todo 파일을 만듭니다
- grouping을 위해 file path 기준으로 area를 추론합니다
- 만들기 전에 중복 여부를 확인합니다
- STATE.md의 todo count를 업데이트합니다

Usage: `$gsd-add-todo` (infers from conversation)
Usage: `$gsd-add-todo Add auth token refresh`

**`$gsd-check-todos [area]`**
대기 중인 todo를 나열하고 그중 하나를 골라 작업합니다.

- title, area, age와 함께 pending todo를 보여 줍니다
- area filter를 선택적으로 적용할 수 있습니다 (예: `$gsd-check-todos api`)
- 선택한 todo의 전체 컨텍스트를 불러옵니다
- 적절한 액션(work now, add to phase, brainstorm)으로 라우팅합니다
- 작업이 시작되면 todo를 done/으로 이동합니다

Usage: `$gsd-check-todos`
Usage: `$gsd-check-todos api`

### 사용자 승인 테스트

**`$gsd-verify-work [phase]`**
대화형 UAT를 통해 만들어진 기능을 검증합니다.

- SUMMARY.md 파일에서 테스트 가능한 deliverable을 추출합니다
- 테스트를 하나씩 제시합니다 (yes/no 응답)
- 실패를 자동 진단하고 fix plan을 만듭니다
- 문제가 발견되면 다시 실행할 준비 상태가 됩니다

Usage: `$gsd-verify-work 3`

### 배포 준비

**`$gsd-ship [phase]`**
완료된 phase 작업으로 auto-generated body가 포함된 PR을 만듭니다.

- branch를 remote로 push합니다
- SUMMARY.md, VERIFICATION.md, REQUIREMENTS.md를 바탕으로 PR을 만듭니다
- 선택적으로 code review를 요청합니다
- STATE.md에 shipping status를 반영합니다

Prerequisites: Phase verified, `gh` CLI installed and authenticated.

Usage: `$gsd-ship 4` or `$gsd-ship 4 --draft`

---

**`$gsd-review --phase N [--gemini] [--claude] [--codex] [--all]`**
Cross-AI peer review입니다. 외부 AI CLI를 호출해 phase plan을 독립적으로 검토합니다.

- 사용 가능한 CLI(gemini, claude, codex)를 감지합니다
- 각 CLI가 같은 structured prompt로 plan을 독립 검토합니다
- reviewer별 피드백과 consensus summary가 담긴 REVIEWS.md를 만듭니다
- review 결과를 planning에 다시 반영할 수 있습니다: `$gsd-plan-phase N --reviews`

Usage: `$gsd-review --phase 3 --all`

---

**`$gsd-pr-branch [target]`**
.planning/ commit을 걸러서 PR용 깔끔한 branch를 만듭니다.

- commit을 code-only(include), planning-only(exclude), mixed(include sans .planning/)로 분류합니다
- code commit만 깨끗한 branch로 cherry-pick합니다
- reviewer는 GSD artifact 없이 코드 변경만 보게 됩니다

Usage: `$gsd-pr-branch` or `$gsd-pr-branch main`

---

**`$gsd-plant-seed [idea]`**
미래 아이디어를 나중에 자동으로 떠오르게 할 trigger condition과 함께 저장합니다.

- seed는 WHY, 언제 surfaced되어야 하는지, 관련 코드 breadcrumb를 함께 보존합니다
- trigger condition이 맞으면 `$gsd-new-milestone` 중 자동으로 surfaced됩니다
- 단순 deferred item보다 낫습니다 — 잊히는 대신 실제로 trigger를 검사합니다

Usage: `$gsd-plant-seed "add real-time notifications when we build the events system"`

---

**`$gsd-audit-uat`**
남아 있는 UAT와 verification 항목을 phase 전체에 걸쳐 감사합니다.
- 모든 phase를 스캔해 pending, skipped, blocked, human_needed 항목을 찾습니다
- 코드베이스와 교차 확인해 stale documentation을 감지합니다
- testability 기준으로 묶은 우선순위 human test plan을 만듭니다
- 새 milestone을 시작하기 전에 verification debt를 정리할 때 유용합니다

Usage: `$gsd-audit-uat`

### 마일스톤 감사

**`$gsd-audit-milestone [version]`**
원래 의도와 비교해 milestone 완료 상태를 감사합니다.

- 모든 phase의 VERIFICATION.md를 읽습니다
- requirements coverage를 확인합니다
- cross-phase wiring을 위해 integration checker를 실행합니다
- gap과 tech debt가 담긴 MILESTONE-AUDIT.md를 만듭니다

Usage: `$gsd-audit-milestone`

**`$gsd-plan-milestone-gaps`**
audit에서 식별된 gap을 메우는 phase를 만듭니다.

- MILESTONE-AUDIT.md를 읽고 gap을 phase 단위로 묶습니다
- requirement priority(must/should/nice) 기준으로 우선순위를 매깁니다
- gap closure phase를 ROADMAP.md에 추가합니다
- 새 phase에 대해 `$gsd-plan-phase`를 바로 실행할 수 있습니다

Usage: `$gsd-plan-milestone-gaps`

### 설정

**`$gsd-settings`**
workflow toggle과 model profile을 대화형으로 설정합니다.

- researcher, plan checker, verifier agent를 켜고 끕니다
- model profile(quality/balanced/budget/inherit)을 선택합니다
- `.planning/config.json`을 업데이트합니다

Usage: `$gsd-settings`

**`$gsd-set-profile <profile>`**
GSD agent용 model profile을 빠르게 바꿉니다.

- `quality` — verification을 제외하고 Opus 사용
- `balanced` — planning은 Opus, execution은 Sonnet 사용 (기본값)
- `budget` — 작성은 Sonnet, research/verification은 Haiku 사용
- `inherit` — 현재 세션 모델을 모든 agent에 사용 (OpenCode `/model`)

Usage: `$gsd-set-profile budget`

### 유틸리티 명령

**`$gsd-cleanup`**
완료된 milestone의 누적 phase 디렉터리를 archive합니다.

- 완료된 milestone 중 아직 `.planning/phases/`에 남아 있는 phase를 찾습니다
- 실제 이동 전에 dry-run 요약을 보여 줍니다
- phase 디렉터리를 `.planning/milestones/v{X.Y}-phases/`로 옮깁니다
- milestone이 여러 번 쌓인 뒤 `.planning/phases/` clutter를 줄일 때 유용합니다

Usage: `$gsd-cleanup`

**`$gsd-help`**
이 명령 레퍼런스를 표시합니다.

**`$gsd-update`**
changelog preview와 함께 GSD를 최신 버전으로 업데이트합니다.

- 설치된 버전과 최신 버전을 비교해 보여 줍니다
- 건너뛴 버전의 changelog 항목을 보여 줍니다
- breaking change를 강조합니다
- install 실행 전에 확인을 받습니다
- raw `npx get-shit-done-ko`보다 안전합니다

Usage: `$gsd-update`

**`$gsd-join-discord`**
GSD Discord 커뮤니티에 참여합니다.

- 도움을 받고, 만들고 있는 것을 공유하고, 업데이트를 따라갈 수 있습니다
- 다른 GSD 사용자와 연결됩니다

Usage: `$gsd-join-discord`

## 파일과 구조

```
.planning/
├── PROJECT.md            # 프로젝트 비전
├── ROADMAP.md            # 현재 phase 분해
├── STATE.md              # 프로젝트 메모리와 컨텍스트
├── RETROSPECTIVE.md      # 살아 있는 retrospective (milestone마다 갱신)
├── config.json           # workflow mode와 gate
├── todos/                # 캡처된 아이디어와 task
│   ├── pending/          # 아직 작업하지 않은 todo
│   └── done/             # 완료된 todo
├── debug/                # 활성 debug session
│   └── resolved/         # archive된 해결 이슈
├── milestones/
│   ├── v1.0-ROADMAP.md       # archive된 roadmap snapshot
│   ├── v1.0-REQUIREMENTS.md  # archive된 requirements
│   └── v1.0-phases/          # archive된 phase 디렉터리 ($gsd-cleanup 또는 --archive-phases)
│       ├── 01-foundation/
│       └── 02-core-features/
├── codebase/             # 코드베이스 맵 (brownfield 프로젝트)
│   ├── STACK.md          # 언어, 프레임워크, 의존성
│   ├── ARCHITECTURE.md   # 패턴, 레이어, 데이터 흐름
│   ├── STRUCTURE.md      # 디렉터리 구조, 핵심 파일
│   ├── CONVENTIONS.md    # 코딩 표준, 네이밍
│   ├── TESTING.md        # 테스트 구성, 패턴
│   ├── INTEGRATIONS.md   # 외부 서비스, API
│   └── CONCERNS.md       # 기술 부채, 알려진 이슈
└── phases/
    ├── 01-foundation/
    │   ├── 01-01-PLAN.md
    │   └── 01-01-SUMMARY.md
    └── 02-core-features/
        ├── 02-01-PLAN.md
        └── 02-01-SUMMARY.md
```

## 워크플로 모드

`$gsd-new-project` 중에 설정합니다:

**Interactive Mode**

- 주요 결정을 하나씩 확인합니다
- 승인 지점에서 멈춥니다
- 전반적으로 더 많은 안내를 제공합니다

**YOLO Mode**

- 대부분의 결정을 자동 승인합니다
- 확인 없이 plan을 실행합니다
- 중요한 checkpoint에서만 멈춥니다

`.planning/config.json`을 수정하면 언제든 바꿀 수 있습니다

## 계획 설정

`.planning/config.json`에서 planning artifact 관리 방식을 설정합니다:

**`planning.commit_docs`** (default: `true`)
- `true`: planning artifact를 git에 commit합니다 (표준 workflow)
- `false`: planning artifact를 로컬에만 두고 commit하지 않습니다

`commit_docs: false`일 때:
- `.planning/`을 `.gitignore`에 추가하세요
- OSS 기여, client 프로젝트, planning 비공개 유지에 유용합니다
- planning 파일은 모두 그대로 동작하지만 git에는 추적되지 않습니다

**`planning.search_gitignored`** (default: `false`)
- `true`: 광범위한 ripgrep 검색에 `--no-ignore`를 추가합니다
- `.planning/`이 gitignored이고, 프로젝트 전체 검색에 그 내용까지 포함하고 싶을 때만 필요합니다

예시 config:
```json
{
  "planning": {
    "commit_docs": false,
    "search_gitignored": true
  }
}
```

## 자주 쓰는 워크플로

**새 프로젝트 시작:**

```
$gsd-new-project        # 통합 플로우: questioning → research → requirements → roadmap
/clear
$gsd-plan-phase 1       # 첫 phase 계획 생성
/clear
$gsd-execute-phase 1    # phase의 모든 plan 실행
```

**쉬었다가 작업 재개:**

```
$gsd-progress  # 어디까지 했는지 보고 이어서 진행
```

**milestone 중간에 긴급 작업 추가:**

```
$gsd-insert-phase 5 "Critical security fix"
$gsd-plan-phase 5.1
$gsd-execute-phase 5.1
```

**milestone 완료:**

```
$gsd-complete-milestone 1.0.0
/clear
$gsd-new-milestone  # 다음 milestone 시작 (questioning → research → requirements → roadmap)
```

**작업 중 아이디어 캡처:**

```
$gsd-add-todo                    # 대화 컨텍스트에서 캡처
$gsd-add-todo Fix modal z-index  # 명시적 설명으로 캡처
$gsd-check-todos                 # todo 검토 후 작업 시작
$gsd-check-todos api             # area별 필터
```

**이슈 디버깅:**

```
$gsd-debug "form submission fails silently"  # debug session 시작
# ... 조사 진행, 컨텍스트 누적 ...
/clear
$gsd-debug                                    # 멈춘 지점부터 재개
```

## 도움말 받기

- 프로젝트 비전은 `.planning/PROJECT.md`를 읽으세요
- 현재 컨텍스트는 `.planning/STATE.md`를 읽으세요
- phase 상태는 `.planning/ROADMAP.md`를 확인하세요
- 현재 어디까지 왔는지는 `$gsd-progress`를 실행해 확인하세요
</reference>
