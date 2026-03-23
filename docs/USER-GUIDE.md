# GSD 사용자 가이드

워크플로 사용법, 문제 해결, 설정까지 한 번에 볼 수 있는 상세 가이드입니다. 빠른 시작은 [README](../README.md)를 참고하세요.

> [!NOTE]
> 이 문서는 한국어 우선 설명을 제공합니다. 명령어, 파일 경로, 코드 블록, 식별자 토큰은 upstream 호환성을 위해 그대로 유지합니다.

## 빠른 안내

- 워크플로 전체 흐름을 먼저 보고 싶다면 `Workflow Diagrams`부터 읽으면 됩니다.
- 실사용 중 막혔을 때는 `Troubleshooting`과 `Recovery Quick Reference`가 가장 빠릅니다.
- 설정 키와 프로필 차이가 궁금하면 `Configuration Reference` 섹션으로 바로 가면 됩니다.

---

## 목차

- [Workflow Diagrams](#workflow-diagrams)
- [UI Design Contract](#ui-design-contract)
- [Backlog & Threads](#backlog--threads)
- [Security](#security)
- [Command Reference](#command-reference)
- [Configuration Reference](#configuration-reference)
- [Usage Examples](#usage-examples)
- [Troubleshooting](#troubleshooting)
- [Recovery Quick Reference](#recovery-quick-reference)

---

## 워크플로 다이어그램

### 전체 프로젝트 생명주기

```
  ┌──────────────────────────────────────────────────┐
  │                   NEW PROJECT                    │
  │  /gsd:new-project                                │
  │  Questions -> Research -> Requirements -> Roadmap│
  └─────────────────────────┬────────────────────────┘
                            │
             ┌──────────────▼─────────────┐
             │      FOR EACH PHASE:       │
             │                            │
             │  ┌────────────────────┐    │
             │  │ /gsd:discuss-phase │    │  <- Lock in preferences
             │  └──────────┬─────────┘    │
             │             │              │
             │  ┌──────────▼─────────┐    │
             │  │ /gsd:ui-phase      │    │  <- Design contract (frontend)
             │  └──────────┬─────────┘    │
             │             │              │
             │  ┌──────────▼─────────┐    │
             │  │ /gsd:plan-phase    │    │  <- Research + Plan + Verify
             │  └──────────┬─────────┘    │
             │             │              │
             │  ┌──────────▼─────────┐    │
             │  │ /gsd:execute-phase │    │  <- Parallel execution
             │  └──────────┬─────────┘    │
             │             │              │
             │  ┌──────────▼─────────┐    │
             │  │ /gsd:verify-work   │    │  <- Manual UAT
             │  └──────────┬─────────┘    │
             │             │              │
             │  ┌──────────▼─────────┐    │
             │  │ /gsd:ship          │    │  <- Create PR (optional)
             │  └──────────┬─────────┘    │
             │             │              │
             │     Next Phase?────────────┘
             │             │ No
             └─────────────┼──────────────┘
                            │
            ┌───────────────▼──────────────┐
            │  /gsd:audit-milestone        │
            │  /gsd:complete-milestone     │
            └───────────────┬──────────────┘
                            │
                   Another milestone?
                       │          │
                      Yes         No -> Done!
                       │
               ┌───────▼──────────────┐
               │  /gsd:new-milestone  │
               └──────────────────────┘
```

### Planning 에이전트 협업

```
  /gsd:plan-phase N
         │
         ├── Phase Researcher (x4 parallel)
         │     ├── Stack researcher
         │     ├── Features researcher
         │     ├── Architecture researcher
         │     └── Pitfalls researcher
         │           │
         │     ┌──────▼──────┐
         │     │ RESEARCH.md │
         │     └──────┬──────┘
         │            │
         │     ┌──────▼──────┐
         │     │   Planner   │  <- Reads PROJECT.md, REQUIREMENTS.md,
         │     │             │     CONTEXT.md, RESEARCH.md
         │     └──────┬──────┘
         │            │
         │     ┌──────▼───────────┐     ┌────────┐
         │     │   Plan Checker   │────>│ PASS?  │
         │     └──────────────────┘     └───┬────┘
         │                                  │
         │                             Yes  │  No
         │                              │   │   │
         │                              │   └───┘  (loop, up to 3x)
         │                              │
         │                        ┌─────▼──────┐
         │                        │ PLAN files │
         │                        └────────────┘
         └── Done
```

### 검증 아키텍처(Nyquist 레이어)

plan-phase research 단계에서 GSD는 이제 코드가 작성되기 전에 각 phase
requirement에 자동화 테스트 커버리지를 매핑합니다. 덕분에 Claude의 executor가
task를 commit할 때, 몇 초 안에 검증할 수 있는 피드백 메커니즘이 이미 준비됩니다.

researcher는 기존 테스트 인프라를 감지하고, 각 requirement를
구체적인 테스트 명령에 매핑하며, 구현 시작 전에 만들어야 하는 테스트 scaffolding을
식별합니다(Wave 0 task).

plan-checker는 이것을 8번째 검증 차원으로 강제합니다. task에 자동 검증 명령이
없으면 plan은 승인되지 않습니다.

**출력:** `{phase}-VALIDATION.md` -- 해당 phase의 피드백 계약

**비활성화:** 테스트 인프라가 핵심이 아닌 빠른 프로토타이핑 phase에서는
`/gsd:settings`에서 `workflow.nyquist_validation: false`로 설정하세요.

### 사후 검증(`/gsd:validate-phase`)

Nyquist validation이 도입되기 전에 실행된 phase나, 전통적인 테스트 스위트만 있는
기존 코드베이스에서는 사후적으로 감사를 수행해 커버리지 gap을 메울 수 있습니다.

```
  /gsd:validate-phase N
         |
         +-- Detect state (VALIDATION.md exists? SUMMARY.md exists?)
         |
         +-- Discover: scan implementation, map requirements to tests
         |
         +-- Analyze gaps: which requirements lack automated verification?
         |
         +-- Present gap plan for approval
         |
         +-- Spawn auditor: generate tests, run, debug (max 3 attempts)
         |
         +-- Update VALIDATION.md
               |
               +-- COMPLIANT -> all requirements have automated checks
               +-- PARTIAL -> some gaps escalated to manual-only
```

auditor는 구현 코드를 수정하지 않고 테스트 파일과 `VALIDATION.md`만 다룹니다.
테스트가 구현 버그를 드러내면, 사용자가 처리할 escalation으로 표시됩니다.

**언제 쓰나:** Nyquist가 켜지기 전에 계획된 phase를 실행한 뒤, 또는
`/gsd:audit-milestone`이 Nyquist 준수 gap을 드러낸 뒤에 사용합니다.

---

## UI 디자인 계약

### 왜 필요한가

AI가 생성한 프론트엔드가 시각적으로 들쭉날쭉한 이유는 Claude Code가 UI를 못해서가 아니라, 실행 전에 디자인 계약이 없기 때문입니다. 공통 spacing scale, color contract, copywriting 기준 없이 만든 다섯 개 컴포넌트는 미묘하게 다른 다섯 개 시각적 결정을 만들어 냅니다.

`/gsd:ui-phase`은 계획하기 전에 설계 계약을 잠급니다. `/gsd:ui-review`은 실행 후 결과를 감사합니다.

### 명령

| Command | 설명 |
|---------|------|
| `/gsd:ui-phase [N]` | 프론트엔드 phase용 UI-SPEC.md 디자인 계약 생성 |
| `/gsd:ui-review [N]` | 구현된 UI에 대한 사후 6축 시각 감사 |

### 워크플로: `/gsd:ui-phase`

**언제 실행하나:** `/gsd:discuss-phase` 이후, `/gsd:plan-phase` 이전. 프론트엔드/UI 작업이 있는 phase에서 실행합니다.

**흐름:**
1. CONTEXT.md, RESEARCH.md, REQUIREMENTS.md를 읽어 기존 결정을 파악합니다.
2. 디자인 시스템 상태(shadcn `components.json`, Tailwind config, 기존 token)를 감지합니다.
3. shadcn initialization gate를 적용해 React/Next.js/Vite 프로젝트에 초기화가 없으면 제안합니다.
4. 답이 없는 디자인 계약 질문(spacing, typography, color, copywriting, registry safety)만 묻습니다.
5. phase 디렉터리에 `{phase}-UI-SPEC.md`를 작성합니다.
6. 6개 차원(Copywriting, Visuals, Color, Typography, Spacing, Registry Safety)으로 검증합니다.
7. BLOCKED이면 수정 루프를 돕습니다(최대 2회).

**출력:** `.planning/phases/{phase-dir}/` 안의 `{padded_phase}-UI-SPEC.md`

### 워크플로: `/gsd:ui-review`

**언제 실행하나:** `/gsd:execute-phase` 또는 `/gsd:verify-work` 이후. 프론트엔드 코드가 있는 어떤 프로젝트에도 사용할 수 있습니다.

**단독 실행:** GSD 관리 프로젝트가 아니어도 동작합니다. `UI-SPEC.md`가 없으면 추상적인 6축 기준으로 감사합니다.

**6개 축(각 1~4점):**
1. 카피라이팅 — CTA 라벨, 빈 상태, 오류 상태
2. 시각적 요소 — 초점, 시각적 계층 구조, 아이콘 접근성
3. 색상 - 악센트 사용 규율, 60/30/10 준수
4. 타이포그래피 — 글꼴 크기/두께 제한 준수
5. 간격 - 그리드 정렬, 토큰 일관성
6. 경험 디자인 — 로딩/오류/빈 상태 적용

**출력:** phase 디렉터리 안의 `{padded_phase}-UI-REVIEW.md`, 점수와 상위 3개 우선 수정 사항 포함

### 설정

| Setting | Default | 설명 |
|---------|---------|------|
| `workflow.ui_phase` | `true` | 프론트엔드 phase용 UI 디자인 계약 생성 |
| `workflow.ui_safety_gate` | `true` | 프론트엔드 phase의 plan-phase에서 `/gsd:ui-phase` 실행을 안내 |

둘 다 absent=enabled 패턴을 따릅니다. `/gsd:settings`에서 비활성화할 수 있습니다.

### shadcn 초기화

React/Next.js/Vite 프로젝트에서 `components.json`이 없으면 UI researcher가 shadcn 초기화를 제안합니다. 흐름은 다음과 같습니다.

1. `ui.shadcn.com/create`을(를) 방문하여 사전 설정을 구성하세요.
2. 미리 설정된 문자열을 복사합니다.
3. `npx shadcn init --preset {paste}`을(를) 실행합니다.
4. 사전 설정은 색상, 테두리 반경, 글꼴 등 전체 디자인 시스템을 인코딩합니다.

preset 문자열은 phase와 milestone 전반에서 재현 가능한 1급 GSD planning 산출물이 됩니다.

### Registry 안전성 게이트

서드파티 shadcn registry는 임의 코드를 주입할 수 있습니다. safety gate는 다음을 요구합니다.
- `npx shadcn view {component}` — 설치 전 검사
- `npx shadcn diff {component}` — 공식과 비교

이 동작은 `workflow.ui_safety_gate` config toggle로 제어됩니다.

### 스크린샷 저장

`/gsd:ui-review`는 Playwright CLI로 스크린샷을 `.planning/ui-reviews/`에 저장합니다. 바이너리 파일이 git에 들어가지 않도록 `.gitignore`가 자동 생성됩니다. 스크린샷은 `/gsd:complete-milestone` 중 정리됩니다.

---

## 백로그와 thread

### 백로그 주차장

아직 활성 planning에 넣을 준비가 안 된 아이디어는 999.x 번호를 사용해 backlog에 넣고, 활성 phase 순서 밖에 둡니다.

```
/gsd:add-backlog "GraphQL API layer"     # Creates 999.1-graphql-api-layer/
/gsd:add-backlog "Mobile responsive"     # Creates 999.2-mobile-responsive/
```

backlog 항목도 완전한 phase 디렉터리를 가지므로 `/gsd:discuss-phase 999.1`로 더 탐색하거나, 준비되면 `/gsd:plan-phase 999.1`로 진행할 수 있습니다.

`/gsd:review-backlog`로 **검토하고 승격**할 수 있습니다. backlog 항목을 모두 보여 주고 promote(활성 순서로 이동), keep(백로그 유지), remove(삭제)를 선택할 수 있습니다.

### 씨앗

seed는 트리거 조건이 있는 미래 지향 아이디어입니다. backlog 항목과 달리 적절한 milestone이 오면 자동으로 떠오릅니다.

```
/gsd:plant-seed "Add real-time collab when WebSocket infra is in place"
```

seed는 WHY와 언제 떠올릴지에 대한 정보를 함께 보존합니다. `/gsd:new-milestone`은 모든 seed를 스캔해 일치하는 항목을 보여 줍니다.

**저장 위치:** `.planning/seeds/SEED-NNN-slug.md`

### 지속형 context thread

thread는 여러 세션에 걸치지만 특정 phase에 속하지 않는 작업을 위한 가벼운 cross-session 지식 저장소입니다.

```
/gsd:thread                              # List all threads
/gsd:thread fix-deploy-key-auth          # Resume existing thread
/gsd:thread "Investigate TCP timeout"    # Create new thread
```

thread는 `/gsd:pause-work`보다 더 가볍습니다. phase state도, plan context도 없습니다. 각 thread 파일에는 Goal, Context, References, Next Steps 섹션이 들어 있습니다.

thread가 무르익으면 phase(`/gsd:add-phase`)나 backlog 항목(`/gsd:add-backlog`)으로 승격할 수 있습니다.

**저장 위치:** `.planning/threads/{slug}.md`

---

## 보안

### 다층 방어(v1.27)

GSD는 LLM system prompt가 되는 markdown 파일을 생성합니다. 즉 planning 산출물로 흘러드는 사용자 제어 텍스트는 모두 잠재적인 간접 prompt injection 경로입니다. v1.27에서는 이를 막기 위한 중앙화 보안 강화를 도입했습니다.

**경로 순회 방지:**
사용자가 제공한 모든 파일 경로(`--text-file`, `--prd`)는 프로젝트 디렉터리 안으로 resolve되는지 검증합니다. macOS의 `/var` → `/private/var` 심볼릭 링크 해석도 처리합니다.

**Prompt injection 탐지:**
`security.cjs` 모듈은 사용자 제공 텍스트가 planning 산출물로 들어가기 전에 알려진 injection 패턴(role override, instruction bypass, system tag injection)을 스캔합니다.

**런타임 hook:**
- `gsd-prompt-guard.js` — 주입 패턴에 대해 `.planning/`에 대한 쓰기/편집 호출을 검색합니다(항상 활성, 자문 전용).
- `gsd-workflow-guard.js` — GSD 작업 흐름 컨텍스트 외부의 파일 편집에 대해 경고합니다(`hooks.workflow_guard`을 통해 선택).

**CI 스캐너:**
`prompt-injection-scan.test.cjs`는 모든 agent, workflow, command 파일에서 내장 injection 벡터를 검사합니다. 테스트 스위트의 일부로 실행됩니다.

---

### 실행 wave 협업

```
  /gsd:execute-phase N
         │
         ├── Analyze plan dependencies
         │
         ├── Wave 1 (independent plans):
         │     ├── Executor A (fresh 200K context) -> commit
         │     └── Executor B (fresh 200K context) -> commit
         │
         ├── Wave 2 (depends on Wave 1):
         │     └── Executor C (fresh 200K context) -> commit
         │
         └── Verifier
               └── Check codebase against phase goals
                     │
                     ├── PASS -> VERIFICATION.md (success)
                     └── FAIL -> Issues logged for /gsd:verify-work
```

### 브라운필드 워크플로(기존 코드베이스)

```
  /gsd:map-codebase
         │
         ├── Stack Mapper     -> codebase/STACK.md
         ├── Arch Mapper      -> codebase/ARCHITECTURE.md
         ├── Convention Mapper -> codebase/CONVENTIONS.md
         └── Concern Mapper   -> codebase/CONCERNS.md
                │
        ┌───────▼──────────┐
        │ /gsd:new-project │  <- Questions focus on what you're ADDING
        └──────────────────┘
```

---

## 명령어 레퍼런스

### 핵심 워크플로

| Command | 목적 | 언제 쓰나 |
|---------|------|-----------|
| `/gsd:new-project` | 프로젝트 전체 초기화: 질문, research, requirements, roadmap | 새 프로젝트 시작 시 |
| `/gsd:new-project --auto @idea.md` | 문서 기반 자동 초기화 | PRD나 아이디어 문서가 준비된 경우 |
| `/gsd:discuss-phase [N]` | 구현 결정을 정리 | planning 전에 구현 방향을 잡고 싶을 때 |
| `/gsd:ui-phase [N]` | UI 디자인 계약 생성 | discuss-phase 이후, plan-phase 이전(프론트엔드 phase) |
| `/gsd:plan-phase [N]` | 조사 + 계획 + 검증 | phase 실행 전에 |
| `/gsd:execute-phase <N>` | 모든 plan을 병렬 wave로 실행 | planning이 끝난 뒤 |
| `/gsd:verify-work [N]` | 자동 진단이 포함된 수동 UAT | 실행이 끝난 뒤 |
| `/gsd:ship [N]` | 검증된 작업으로 PR 생성 | verification 통과 후 |
| `/gsd:fast <text>` | planning을 완전히 건너뛰는 사소한 인라인 작업 | 오타 수정, 설정 변경, 작은 리팩터 |
| `/gsd:next` | 상태를 자동 감지해 다음 단계 실행 | 언제든지, "다음엔 뭘 하지?" 싶을 때 |
| `/gsd:ui-review [N]` | 사후 6축 시각 감사 | 실행 또는 verify-work 이후(프론트엔드 프로젝트) |
| `/gsd:audit-milestone` | milestone이 완료 정의를 만족하는지 검증 | milestone 완료 전 |
| `/gsd:complete-milestone` | milestone 아카이브, 릴리스 태그 생성 | 모든 phase 검증 완료 후 |
| `/gsd:new-milestone [name]` | 다음 버전 주기 시작 | milestone 완료 후 |

### 탐색

| 명령 | 목적 | 사용 시기 |
|---------|---------|-------------|
| `/gsd:progress` | 상태 및 다음 단계 표시 | 언제든지 -- "나는 어디에 있지?" |
| `/gsd:resume-work` | 마지막 세션에서 전체 컨텍스트 복원 | 새 세션 시작 |
| `/gsd:pause-work` | 구조화된 핸드오프 저장(HANDOFF.json + continue-here.md) | 중간단계 중단 |
| `/gsd:session-report` | 작업 및 결과가 포함된 세션 요약 생성 | 세션 종료, 이해관계자 공유 |
| `/gsd:help` | 모든 명령 표시 | 빠른 참조 |
| `/gsd:update` | 변경 로그 미리보기로 GSD 업데이트 | 새 버전 확인 |
| `/gsd:join-discord` | Discord 커뮤니티 초대 열기 | 질문이나 커뮤니티 |

### Phase 관리

| 명령 | 목적 | 사용 시기 |
|---------|---------|-------------|
| `/gsd:add-phase` | 로드맵에 새로운 단계 추가 | 초기 계획 이후 범위 확대 |
| `/gsd:insert-phase [N]` | 긴급작업 삽입(소수점 매기기) | 마일스톤 중간에 긴급 수정 |
| `/gsd:remove-phase [N]` | 미래 단계를 제거하고 번호를 다시 매깁니다 | 기능 설명 |
| `/gsd:list-phase-assumptions [N]` | Claude의 의도된 접근 방식 미리보기 | 계획하기 전에 방향을 검증하기 |
| `/gsd:plan-milestone-gaps` | 감사 격차에 대한 단계 생성 | 감사 후 누락된 항목 발견 |
| `/gsd:research-phase [N]` | 심층 생태계 연구 전용 | 복잡하거나 익숙하지 않은 도메인 |

### 브라운필드 및 유틸리티

| 명령 | 목적 | 사용 시기 |
|---------|---------|-------------|
| `/gsd:map-codebase` | 기존 코드베이스 분석 | 기존 코드에서 `/gsd:new-project` 이전 |
| `/gsd:quick` | GSD 보장을 통한 임시 작업 | 버그 수정, 작은 기능, 구성 변경 |
| `/gsd:debug [desc]` | 지속 상태를 사용한 체계적인 디버깅 | 문제가 발생했을 때 |
| `/gsd:add-todo [desc]` | 나중을 위한 아이디어 포착 | 세션 중에 무언가를 생각해보세요 |
| `/gsd:check-todos` | 보류 중인 할 일 목록 | 포착된 아이디어 검토 |
| `/gsd:settings` | 워크플로 토글 및 모델 프로필 구성 | 모델 변경, 상담원 전환 |
| `/gsd:set-profile <profile>` | 빠른 프로필 전환 | 비용/품질 균형 변경 |
| `/gsd:reapply-patches` | 업데이트 후 로컬 수정 사항 복원 | 로컬 편집이 있는 경우 `/gsd:update` 이후 |

### 코드 품질 및 리뷰

| 명령 | 목적 | 사용 시기 |
|---------|---------|-------------|
| `/gsd:review --phase N` | 외부 CLI를 통한 교차 AI 동료 검토 | 실행하기 전에 계획을 검증하려면 |
| `/gsd:pr-branch` | 깨끗한 PR 분기 필터링 `.planning/` 커밋 | 계획 없는 diff로 PR을 만들기 전에 |
| `/gsd:audit-uat` | 모든 단계에 걸쳐 검증 부채 감사 | 마일스톤 완료 전 |

### 백로그 및 thread

| 명령 | 목적 | 사용 시기 |
|---------|---------|-------------|
| `/gsd:add-backlog <desc>` | 백로그 주차장에 아이디어 추가(999.x) | 적극적인 계획을 위한 아이디어가 아직 준비되지 않았습니다 |
| `/gsd:review-backlog` | 백로그 항목 승격/유지/제거 | 새로운 이정표 이전에 우선순위를 정하려면 |
| `/gsd:plant-seed <idea>` | 트리거 조건을 갖춘 미래 지향적인 아이디어 | 미래의 이정표에서 표면화되어야 하는 아이디어 |
| `/gsd:thread [name]` | 지속적인 컨텍스트 스레드 | 단계 구조 외부의 세션 간 작업 |

---

## 설정 레퍼런스

GSD는 프로젝트 설정을 `.planning/config.json`에 저장합니다. `/gsd:new-project` 중에 구성하거나 나중에 `/gsd:settings`로 업데이트하세요.

### 전체 config.json 스키마

```json
{
  "mode": "interactive",
  "granularity": "standard",
  "model_profile": "balanced",
  "planning": {
    "commit_docs": true,
    "search_gitignored": false
  },
  "workflow": {
    "research": true,
    "plan_check": true,
    "verifier": true,
    "nyquist_validation": true,
    "ui_phase": true,
    "ui_safety_gate": true,
    "research_before_questions": false
  },
  "hooks": {
    "context_warnings": true,
    "workflow_guard": false
  },
  "git": {
    "branching_strategy": "none",
    "phase_branch_template": "gsd/phase-{phase}-{slug}",
    "milestone_branch_template": "gsd/{milestone}-{slug}",
    "quick_branch_template": null
  }
}
```

### 핵심 설정

| Setting | Options | Default | 제어 내용 |
|---------|---------|---------|-----------|
| `mode` | `interactive`, `yolo` | `interactive` | `yolo`는 결정을 자동 승인하고, `interactive`는 각 단계에서 확인 |
| `granularity` | `coarse`, `standard`, `fine` | `standard` | 범위를 얼마나 잘게 나눌지(3-5, 5-8, 8-12 phase) |
| `model_profile` | `quality`, `balanced`, `budget`, `inherit` | `balanced` | 각 에이전트 모델 티어(아래 표 참고) |

### Planning 설정

| Setting | Options | Default | 제어 내용 |
|---------|---------|---------|-----------|
| `planning.commit_docs` | `true`, `false` | `true` | `.planning/` 파일을 git에 커밋할지 여부 |
| `planning.search_gitignored` | `true`, `false` | `false` | 광범위 검색에 `--no-ignore`를 더해 `.planning/` 포함 |

> **참고:** `.planning/`이 `.gitignore`에 있으면 config 값과 관계없이 `commit_docs`는 자동으로 `false`가 됩니다.

### 워크플로 토글

| Setting | Options | Default | 제어 내용 |
|---------|---------|---------|-----------|
| `workflow.research` | `true`, `false` | `true` | planning 전 도메인 조사 |
| `workflow.plan_check` | `true`, `false` | `true` | plan 검증 루프(최대 3회 반복) |
| `workflow.verifier` | `true`, `false` | `true` | 실행 후 phase 목표 기준 검증 |
| `workflow.nyquist_validation` | `true`, `false` | `true` | plan-phase 중 validation architecture 조사; 8번째 plan-check 차원 |
| `workflow.ui_phase` | `true`, `false` | `true` | 프론트엔드 phase용 UI 디자인 계약 생성 |
| `workflow.ui_safety_gate` | `true`, `false` | `true` | 프론트엔드 phase에서 `/gsd:ui-phase` 실행을 안내 |
| `workflow.research_before_questions` | `true`, `false` | `false` | discussion 질문 전에 research 수행 |

### Hook 설정

| Setting | Options | Default | 제어 내용 |
|---------|---------|---------|-----------|
| `hooks.context_warnings` | `true`, `false` | `true` | 컨텍스트 창 사용량 경고 |
| `hooks.workflow_guard` | `true`, `false` | `false` | GSD 워크플로 밖의 파일 편집 경고 |

익숙한 도메인에서 단계 속도를 높이거나 토큰을 절약하려면 워크플로 토글을 비활성화하세요.
익숙한 도메인에서 phase를 빠르게 돌리거나 token을 아끼고 싶다면 workflow toggle을 꺼도 됩니다.

### Git 브랜치 전략

| Setting | Options | Default | 제어 내용 |
|---------|---------|---------|-----------|
| `git.branching_strategy` | `none`, `phase`, `milestone` | `none` | 브랜치를 언제 어떻게 만들지 |
| `git.phase_branch_template` | Template string | `gsd/phase-{phase}-{slug}` | phase 전략용 브랜치 이름 |
| `git.milestone_branch_template` | Template string | `gsd/{milestone}-{slug}` | milestone 전략용 브랜치 이름 |
| `git.quick_branch_template` | Template string or `null` | `null` | `/gsd:quick` 작업용 선택적 브랜치 이름 |

**브랜치 전략 설명:**

| 전략 | 지점 생성 | 범위 | 최고의 대상 |
|----------|---------------|-------|----------|
| `none` | 절대 | 해당 없음 | 솔로 개발, 간단한 프로젝트 |
| `phase` | 각 `execute-phase` | 분기당 한 단계 | 단계별 코드 검토, 세분화된 롤백 |
| `milestone` | 처음에는 `execute-phase` | 모든 단계는 하나의 분기를 공유합니다 | 릴리스 브랜치, 버전별 PR |

**템플릿 변수:** `{phase}` = 0으로 패딩된 숫자(예: "03"), `{slug}` = 소문자 하이픈 이름, `{milestone}` = 버전(예: "v1.0"), `{num}` / `{quick}` = quick task ID(예: "260317-abc")

quick-task branching 예시:

```json
"git": {
  "quick_branch_template": "gsd/quick-{num}-{slug}"
}
```

### 모델 프로필(에이전트별 상세)

| 에이전트 | `quality` | `balanced` | `budget` | `inherit` |
|-------|-----------|------------|----------|-----------|
| gsd 플래너 | 오퍼스 | 오퍼스 | 소네트 | 상속 |
| gsd-로드매퍼 | 오퍼스 | 소네트 | 소네트 | 상속 |
| gsd 실행자 | 오퍼스 | 소네트 | 소네트 | 상속 |
| gsd-단계-연구원 | 오퍼스 | 소네트 | 하이쿠 | 상속 |
| gsd-프로젝트-연구원 | 오퍼스 | 소네트 | 하이쿠 | 상속 |
| gsd-연구-합성기 | 소네트 | 소네트 | 하이쿠 | 상속 |
| gsd 디버거 | 오퍼스 | 소네트 | 소네트 | 상속 |
| gsd-코드베이스-매퍼 | 소네트 | 하이쿠 | 하이쿠 | 상속 |
| gsd 검증기 | 소네트 | 소네트 | 하이쿠 | 상속 |
| gsd 계획 검사기 | 소네트 | 소네트 | 하이쿠 | 상속 |
| gsd-통합-검사기 | 소네트 | 소네트 | 하이쿠 | 상속 |

**프로필 철학:**
- **quality** -- 모든 의사결정 에이전트에는 Opus, 읽기 전용 verification에는 Sonnet. quota가 충분하고 작업이 중요할 때 사용합니다.
- **balanced** -- planning에만 Opus를 쓰고 나머지는 Sonnet. 기본값인 데는 이유가 있습니다.
- **budget** -- 코드를 쓰는 작업에는 Sonnet, research와 verification에는 Haiku. 작업량이 많거나 덜 중요한 phase에 적합합니다.
- **inherit** -- 모든 에이전트가 현재 세션 모델을 사용합니다. 모델을 동적으로 바꾸는 경우(예: OpenCode `/model`)나, Claude Code에서 Anthropic 외 provider(OpenRouter, 로컬 모델)를 써서 예상치 못한 API 비용을 피하고 싶을 때 가장 적합합니다. Claude 이외 런타임(Codex, OpenCode, Gemini CLI)에서는 installer가 `resolve_model_ids: "omit"`를 자동 설정합니다. 자세한 내용은 [Non-Claude Runtimes](#using-non-claude-runtimes-codex-opencode-gemini-cli)를 참고하세요.

---

## 사용 예시

### 새 프로젝트(전체 사이클)

```bash
claude --dangerously-skip-permissions
/gsd:new-project            # Answer questions, configure, approve roadmap
/clear
/gsd:discuss-phase 1        # Lock in your preferences
/gsd:ui-phase 1             # Design contract (frontend phases)
/gsd:plan-phase 1           # Research + plan + verify
/gsd:execute-phase 1        # Parallel execution
/gsd:verify-work 1          # Manual UAT
/gsd:ship 1                 # Create PR from verified work
/gsd:ui-review 1            # Visual audit (frontend phases)
/clear
/gsd:next                   # Auto-detect and run next step
...
/gsd:audit-milestone        # Check everything shipped
/gsd:complete-milestone     # Archive, tag, done
/gsd:session-report         # Generate session summary
```

### 기존 문서에서 새 프로젝트 시작

```bash
/gsd:new-project --auto @prd.md   # Auto-runs research/requirements/roadmap from your doc
/clear
/gsd:discuss-phase 1               # Normal flow from here
```

### 기존 코드베이스

```bash
/gsd:map-codebase           # Analyze what exists (parallel agents)
/gsd:new-project            # Questions focus on what you're ADDING
# (normal phase workflow from here)
```

### 빠른 버그 수정

```bash
/gsd:quick
> "Fix the login button not responding on mobile Safari"
```

### 쉬었다가 다시 시작할 때

```bash
/gsd:progress               # See where you left off and what's next
# or
/gsd:resume-work            # Full context restoration from last session
```

### 릴리스 준비

```bash
/gsd:audit-milestone        # Check requirements coverage, detect stubs
/gsd:plan-milestone-gaps    # If audit found gaps, create phases to close them
/gsd:complete-milestone     # Archive, tag, done
```

### 속도 vs 품질 프리셋

| 시나리오 | 모드 | 세분성 | 프로필 | 연구 | 계획 확인 | 검증자 |
|----------|------|-------------|---------|----------|------------|----------|
| 프로토타이핑 | `yolo` | `coarse` | `budget` | off | off | off |
| 일반 개발 | `interactive` | `standard` | `balanced` | on | on | on |
| 프로덕션 | `interactive` | `fine` | `quality` | on | on | on |

### Milestone 도중 범위 변경

```bash
/gsd:add-phase              # Append a new phase to the roadmap
# or
/gsd:insert-phase 3         # Insert urgent work between phases 3 and 4
# or
/gsd:remove-phase 7         # Descope phase 7 and renumber
```

### 멀티 프로젝트 워크스페이스

분리된 GSD 상태를 유지한 채 여러 저장소나 기능을 병렬로 작업할 수 있습니다.

```bash
# 모노레포의 저장소들로 워크스페이스 생성
/gsd:new-workspace --name feature-b --repos hr-ui,ZeymoAPI

# 기능 브랜치 격리 — 현재 저장소의 worktree와 독립된 .planning/
/gsd:new-workspace --name feature-b --repos .

# 그런 다음 워크스페이스로 이동해 GSD 초기화
cd ~/gsd-workspaces/feature-b
/gsd:new-project

# 워크스페이스 목록과 관리
/gsd:list-workspaces
/gsd:remove-workspace feature-b
```

각 워크스페이스에는 다음이 생깁니다.
- 자체 `.planning/` 디렉터리(원본 저장소와 완전히 독립)
- 지정된 저장소의 git worktree(기본) 또는 clone
- 포함된 저장소를 추적하는 `WORKSPACE.md` 매니페스트

---

## 문제 해결

### "프로젝트가 이미 초기화되었습니다."

`/gsd:new-project`를 실행했지만 `.planning/PROJECT.md`가 이미 존재합니다. 이것은 안전 장치입니다. 처음부터 다시 시작하려면 먼저 `.planning/` 디렉터리를 삭제하세요.

### 긴 세션에서 컨텍스트 품질이 떨어질 때

중요한 명령 사이에서는 컨텍스트 창을 비우세요. Claude Code에서는 `/clear`를 사용합니다. GSD는 fresh context를 전제로 설계되어 있고, 모든 subagent는 깨끗한 200K 창을 받습니다. 메인 세션 품질이 떨어지면 `/clear` 후 `/gsd:resume-work` 또는 `/gsd:progress`로 상태를 복원하세요.

### Plan이 어긋나 보일 때

planning 전에 `/gsd:discuss-phase [N]`를 실행하세요. 대부분의 plan 품질 문제는 `CONTEXT.md`가 있었다면 막을 수 있었던 가정을 Claude가 해 버려서 생깁니다. plan에 commit하기 전에 `/gsd:list-phase-assumptions [N]`로 Claude가 하려는 접근을 미리 볼 수도 있습니다.

### 실행이 실패하거나 stub만 생길 때

plan이 너무 야심차지 않았는지 확인하세요. plan은 보통 2~3개 task를 넘기지 않는 것이 좋습니다. task가 너무 크면 단일 컨텍스트 창이 안정적으로 처리할 수 있는 범위를 벗어납니다. 더 작은 범위로 다시 계획하세요.

### 지금 어디까지 왔는지 모르겠을 때

`/gsd:progress`를 실행하세요. 모든 state 파일을 읽고 현재 위치와 다음에 할 일을 정확히 알려 줍니다.

### 실행 후 뭔가 바꿔야 할 때

`/gsd:execute-phase`를 다시 실행하지 마세요. 목표가 뚜렷한 수정에는 `/gsd:quick`을, UAT를 통해 체계적으로 문제를 찾고 고치려면 `/gsd:verify-work`를 사용하세요.

### 모델 비용이 너무 높을 때

budget profile로 전환하세요: `/gsd:set-profile budget`. 도메인이 당신이나 Claude에게 익숙하다면 `/gsd:settings`에서 research와 plan-check 에이전트를 꺼도 됩니다.

### Claude 이외 런타임 사용(Codex, OpenCode, Gemini CLI)

GSD를 Claude 이외 런타임에 설치했다면 installer가 이미 모델 해석을 설정해 두었기 때문에, 모든 에이전트가 그 런타임의 기본 모델을 사용합니다. 수동 설정은 필요 없습니다.

Claude 이외 런타임에서 에이전트별로 다른 모델을 쓰고 싶다면, `.planning/config.json`에 런타임이 인식하는 모델 ID로 `model_overrides`를 추가하세요.

```json
{
  "model_overrides": {
    "gsd-planner": "o3",
    "gsd-executor": "o4-mini",
    "gsd-debugger": "o3"
  }
}
```

자세한 설명은 [Configuration Reference](CONFIGURATION.md#non-claude-runtimes-codex-opencode-gemini-cli)를 참고하세요.

### Claude Code에서 Anthropic 외 provider 사용(OpenRouter, 로컬)

GSD subagent가 Anthropic 모델을 호출하고 있는데 OpenRouter나 로컬 provider를 통해 비용을 내고 있다면, `inherit` profile로 전환하세요: `/gsd:set-profile inherit`. 그러면 모든 에이전트가 특정 Anthropic 모델 대신 현재 세션 모델을 사용합니다. `/gsd:settings` → Model Profile → Inherit도 참고하세요.

### 민감한/비공개 프로젝트 작업 중일 때

`/gsd:new-project` 중 또는 `/gsd:settings`에서 `commit_docs: false`로 설정하세요. `.planning/`을 `.gitignore`에 추가하면 planning 산출물은 로컬에만 남고 git에는 올라가지 않습니다.

### GSD 업데이트가 로컬 변경을 덮어썼을 때

v1.17부터 installer는 로컬에서 수정된 파일을 `gsd-local-patches/`에 백업합니다. `/gsd:reapply-patches`를 실행해 변경을 다시 병합하세요.

### subagent가 실패한 것처럼 보이지만 작업은 된 경우

Claude Code 분류 버그에 대한 알려진 우회책이 있습니다. GSD orchestrator(execute-phase, quick)는 실패를 보고하기 전에 실제 출력을 점검합니다. 실패 메시지가 보여도 commit이 생겼다면 `git log`를 확인하세요. 작업이 이미 성공했을 수 있습니다.

### 병렬 실행에서 build lock 오류가 날 때

병렬 wave 실행 중 pre-commit hook 실패, cargo lock 경쟁, 30분 이상 걸리는 실행이 보인다면 여러 에이전트가 build 도구를 동시에 건드려서 생긴 문제입니다. GSD는 v1.26부터 이를 자동 처리합니다. 병렬 에이전트는 commit에 `--no-verify`를 쓰고 orchestrator가 각 wave 뒤에 hook을 한 번만 실행합니다. 더 오래된 버전이라면 프로젝트 `CLAUDE.md`에 아래 내용을 추가하세요.

```markdown
## Git Commit Rules for Agents
All subagent/executor commits MUST use `--no-verify`.
```

병렬 실행을 완전히 끄려면 `/gsd:settings`에서 `parallelization.enabled`를 `false`로 설정하세요.

### Windows: 보호 디렉터리에서 설치가 실패할 때

Windows에서 installer가 `EPERM: operation not permitted, scandir`로 실패한다면 OS 보호 디렉터리(예: Chromium 브라우저 프로필) 때문입니다. v1.24부터 수정되었으니 최신 버전으로 업데이트하세요. 임시 우회책으로는 설치 전에 문제 디렉터리 이름을 잠시 바꾸면 됩니다.

---

## 빠른 복구 참고표

| 문제 | 해결책 |
|------|--------|
| 컨텍스트를 잃었거나 새 세션 시작 | `/gsd:resume-work` 또는 `/gsd:progress` |
| phase가 잘못 진행됨 | 해당 phase commit을 `git revert`한 뒤 다시 계획 |
| 범위를 바꿔야 함 | `/gsd:add-phase`, `/gsd:insert-phase`, `/gsd:remove-phase` |
| milestone audit에서 gap 발견 | `/gsd:plan-milestone-gaps` |
| 뭔가 깨짐 | `/gsd:debug "description"` |
| 빠르게 표적 수정 필요 | `/gsd:quick` |
| plan이 원하는 방향과 다름 | `/gsd:discuss-phase [N]` 후 재계획 |
| 비용이 너무 큼 | `/gsd:set-profile budget`와 `/gsd:settings`로 에이전트 비활성화 |
| 업데이트가 로컬 변경을 깨뜨림 | `/gsd:reapply-patches` |
| 이해관계자용 세션 요약 필요 | `/gsd:session-report` |
| 다음 단계가 무엇인지 모르겠음 | `/gsd:next` |
| 병렬 실행 build 오류 | GSD 업데이트 또는 `parallelization.enabled: false` 설정 |

---

## 프로젝트 파일 구조

참고로, GSD는 프로젝트 안에 다음과 같은 구조를 만듭니다.

```
.planning/
  PROJECT.md              # Project vision and context (always loaded)
  REQUIREMENTS.md         # Scoped v1/v2 requirements with IDs
  ROADMAP.md              # Phase breakdown with status tracking
  STATE.md                # Decisions, blockers, session memory
  config.json             # Workflow configuration
  MILESTONES.md           # Completed milestone archive
  HANDOFF.json            # Structured session handoff (from /gsd:pause-work)
  research/               # Domain research from /gsd:new-project
  reports/                # Session reports (from /gsd:session-report)
  todos/
    pending/              # Captured ideas awaiting work
    done/                 # Completed todos
  debug/                  # Active debug sessions
    resolved/             # Archived debug sessions
  codebase/               # Brownfield codebase mapping (from /gsd:map-codebase)
  phases/
    XX-phase-name/
      XX-YY-PLAN.md       # Atomic execution plans
      XX-YY-SUMMARY.md    # Execution outcomes and decisions
      CONTEXT.md          # Your implementation preferences
      RESEARCH.md         # Ecosystem research findings
      VERIFICATION.md     # Post-execution verification results
      XX-UI-SPEC.md       # UI design contract (from /gsd:ui-phase)
      XX-UI-REVIEW.md     # Visual audit scores (from /gsd:ui-review)
  ui-reviews/             # Screenshots from /gsd:ui-review (gitignored)
```
