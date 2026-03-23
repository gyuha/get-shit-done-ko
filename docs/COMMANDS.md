# GSD 명령어 레퍼런스

> 전체 명령어 문법, flags, 옵션, 예제를 모아 둔 문서입니다. 기능 설명은 [Feature Reference](FEATURES.md), 실제 워크플로 사용 예시는 [User Guide](USER-GUIDE.md)를 참고하세요.

> [!NOTE]
> 명령어 이름, flags, 인자 형식, 코드 예시는 원문 그대로 유지합니다. 설명과 안내 문구만 한국어 우선으로 정리합니다.

---

## 명령어 문법

- **클로드 코드 / 제미니 / 부조종사:** `/gsd:command-name [args]`
- **오픈코드:** `/gsd-command-name [args]`
- **코덱스:** `$gsd-command-name [args]`

사용 중인 런타임에 따라 호출 접두사만 다르고, 실제 명령 의미와 phase 흐름은 동일합니다.

---

## 핵심 워크플로 명령

### `/gsd:new-project`

깊은 컨텍스트 수집과 함께 새 프로젝트를 초기화합니다.

| Flag | 설명 |
|------|------|
| `--auto @file.md` | 문서에서 자동 추출하고 대화형 질문을 건너뜁니다 |

**사전 조건:** 기존 `.planning/PROJECT.md`가 없어야 함
**생성 결과:** `PROJECT.md`, `REQUIREMENTS.md`, `ROADMAP.md`, `STATE.md`, `config.json`, `research/`, `CLAUDE.md`

```bash
/gsd:new-project                    # 대화형 모드
/gsd:new-project --auto @prd.md     # PRD에서 자동 추출
```

---

### `/gsd:new-workspace`

저장소 복사본과 독립된 `.planning/` 디렉터리를 가진 격리 워크스페이스를 만듭니다.

| Flag | 설명 |
|------|------|
| `--name <name>` | 워크스페이스 이름(필수) |
| `--repos repo1,repo2` | 쉼표로 구분한 저장소 경로 또는 이름 |
| `--path /target` | 대상 디렉터리(기본값: `~/gsd-workspaces/<name>`) |
| `--strategy worktree\|clone` | 복사 전략(기본값: `worktree`) |
| `--branch <name>` | 체크아웃할 브랜치(기본값: `workspace/<name>`) |
| `--auto` | 대화형 질문 건너뛰기 |

**사용 사례:**
- 멀티 리포: 저장소 일부만 분리된 GSD 상태로 작업
- 기능 격리: `--repos .`는 현재 저장소의 worktree를 생성

**생성 결과:** `WORKSPACE.md`, `.planning/`, 저장소 복사본(worktree 또는 clone)

```bash
/gsd:new-workspace --name feature-b --repos hr-ui,ZeymoAPI
/gsd:new-workspace --name feature-b --repos . --strategy worktree  # 같은 저장소 격리
/gsd:new-workspace --name spike --repos api,web --strategy clone   # 전체 clone
```

---

### `/gsd:list-workspaces`

활성 GSD 워크스페이스와 상태를 보여 줍니다.

**탐색 대상:** `~/gsd-workspaces/` 아래의 `WORKSPACE.md` 매니페스트
**표시 내용:** 이름, 저장소 수, 전략, GSD 프로젝트 상태

```bash
/gsd:list-workspaces
```

---

### `/gsd:remove-workspace`

워크스페이스를 제거하고 git worktree를 정리합니다.

| Argument | 필수 | 설명 |
|----------|------|------|
| `<name>` | 예 | 제거할 워크스페이스 이름 |

**안전 장치:** 어떤 저장소든 커밋되지 않은 변경이 있으면 제거를 거부합니다. 이름 확인이 필요합니다.

```bash
/gsd:remove-workspace feature-b
```

---

### `/gsd:discuss-phase`

계획 전에 구현 결정을 정리합니다.

| Argument | 필수 | 설명 |
|----------|------|------|
| `N` | 아니오 | Phase 번호(기본값: 현재 phase) |

| Flag | 설명 |
|------|------|
| `--auto` | 모든 질문에 대해 추천 기본값을 자동 선택 |
| `--batch` | 질문을 하나씩이 아니라 묶음으로 받기 |
| `--analyze` | 논의 중 트레이드오프 분석 추가 |

**사전 조건:** `.planning/ROADMAP.md`가 존재해야 함
**생성 결과:** `{phase}-CONTEXT.md`, `{phase}-DISCUSSION-LOG.md`(감사 추적용)

```bash
/gsd:discuss-phase 1                # phase 1 대화형 논의
/gsd:discuss-phase 3 --auto         # phase 3 기본값 자동 선택
/gsd:discuss-phase --batch          # 현재 phase를 배치 모드로 진행
/gsd:discuss-phase 2 --analyze      # 트레이드오프 분석 포함 논의
```

---

### `/gsd:ui-phase`

프론트엔드 phase를 위한 UI 디자인 계약을 생성합니다.

| Argument | 필수 | 설명 |
|----------|------|------|
| `N` | 아니오 | Phase 번호(기본값: 현재 phase) |

**사전 조건:** `.planning/ROADMAP.md`가 존재하고, phase에 프론트엔드/UI 작업이 있어야 함
**생성 결과:** `{phase}-UI-SPEC.md`

```bash
/gsd:ui-phase 2                     # phase 2용 디자인 계약
```

---

### `/gsd:plan-phase`

phase를 조사하고 계획하고 검증합니다.

| Argument | 필수 | 설명 |
|----------|------|------|
| `N` | 아니오 | Phase 번호(기본값: 다음 미계획 phase) |

| Flag | 설명 |
|------|------|
| `--auto` | 대화형 확인 건너뛰기 |
| `--research` | RESEARCH.md가 있어도 강제로 재조사 |
| `--skip-research` | 도메인 조사 단계 건너뛰기 |
| `--gaps` | gap 해소 모드(VERIFICATION.md를 읽고 research는 건너뜀) |
| `--skip-verify` | plan checker 검증 루프 건너뛰기 |
| `--prd <file>` | 컨텍스트로 discuss-phase 대신 PRD 파일 사용 |
| `--reviews` | REVIEWS.md의 cross-AI 리뷰 피드백을 반영해 재계획 |

**사전 조건:** `.planning/ROADMAP.md`가 존재해야 함
**생성 결과:** `{phase}-RESEARCH.md`, `{phase}-{N}-PLAN.md`, `{phase}-VALIDATION.md`

```bash
/gsd:plan-phase 1                   # phase 1 조사 + 계획 + 검증
/gsd:plan-phase 3 --skip-research   # 조사 없이 계획(익숙한 도메인)
/gsd:plan-phase --auto              # 비대화형 계획
```

---

### `/gsd:execute-phase`

wave 기반 병렬화로 phase의 모든 plan을 실행하거나 특정 wave만 실행합니다.

| Argument | 필수 | 설명 |
|----------|------|------|
| `N` | **예** | 실행할 Phase 번호 |
| `--wave N` | 아니오 | 해당 phase의 Wave `N`만 실행 |

**사전 조건:** Phase에 PLAN.md 파일이 있어야 함
**생성 결과:** plan별 `{phase}-{N}-SUMMARY.md`, git commit, 그리고 phase가 완전히 끝나면 `{phase}-VERIFICATION.md`

```bash
/gsd:execute-phase 1                # phase 1 실행
/gsd:execute-phase 1 --wave 2       # Wave 2만 실행
```

---

### `/gsd:verify-work`

자동 진단이 포함된 사용자 인수 테스트를 수행합니다.

| Argument | 필수 | 설명 |
|----------|------|------|
| `N` | 아니오 | Phase 번호(기본값: 마지막 실행 phase) |

**사전 조건:** 해당 phase가 실행된 상태여야 함
**생성 결과:** `{phase}-UAT.md`, 문제가 있으면 수정 plan

```bash
/gsd:verify-work 1                  # phase 1 UAT
```

---

### `/gsd:next`

다음 논리적 워크플로 단계로 자동 진행합니다. 프로젝트 상태를 읽고 적절한 명령을 실행합니다.

**사전 조건:** `.planning/` 디렉터리가 존재해야 함
**동작:**
- 프로젝트 없음 → `/gsd:new-project` 제안
- phase에 discussion 필요 → `/gsd:discuss-phase` 실행
- phase에 planning 필요 → `/gsd:plan-phase` 실행
- phase에 execution 필요 → `/gsd:execute-phase` 실행
- phase에 verification 필요 → `/gsd:verify-work` 실행
- 모든 phase 완료 → `/gsd:complete-milestone` 제안

```bash
/gsd:next                           # 다음 단계를 자동 감지하고 실행
```

---

### `/gsd:session-report`

작업 요약, 결과, 추정 리소스 사용량이 담긴 세션 리포트를 생성합니다.

**사전 조건:** 최근 작업이 있는 활성 프로젝트
**생성 결과:** `.planning/reports/SESSION_REPORT.md`

```bash
/gsd:session-report                 # 세션 후 요약 생성
```

**리포트 포함 항목:**
- 수행한 작업(commit, 실행한 plan, 진행한 phase)
- 결과와 산출물
- blocker와 내려진 결정
- 추정 token/cost 사용량
- 다음 단계 추천

---

### `/gsd:ship`

완료된 phase 작업으로 자동 생성된 본문을 포함한 PR을 만듭니다.

| Argument | 필수 | 설명 |
|----------|------|------|
| `N` | 아니오 | Phase 번호 또는 milestone 버전(예: `4`, `v1.0`) |
| `--draft` | 아니오 | draft PR로 생성 |

**사전 조건:** Phase 검증 완료(`/gsd:verify-work` 통과), `gh` CLI 설치 및 인증
**생성 결과:** planning 산출물 기반 본문이 포함된 GitHub PR, 업데이트된 STATE.md

```bash
/gsd:ship 4                         # phase 4 PR 생성
/gsd:ship 4 --draft                 # draft PR로 생성
```

**PR 본문 포함 항목:**
- ROADMAP.md의 phase 목표
- SUMMARY.md 파일의 변경 요약
- 반영한 요구사항(REQ-ID)
- 검증 상태
- 핵심 결정

---

### `/gsd:ui-review`

구현된 프론트엔드를 대상으로 사후 6축 시각 감사를 수행합니다.

| Argument | 필수 | 설명 |
|----------|------|------|
| `N` | 아니오 | Phase 번호(기본값: 마지막 실행 phase) |

**사전 조건:** 프로젝트에 프론트엔드 코드가 있어야 함(GSD 프로젝트가 아니어도 단독 실행 가능)
**생성 결과:** `{phase}-UI-REVIEW.md`, `.planning/ui-reviews/` 안의 스크린샷

```bash
/gsd:ui-review                      # 현재 phase 감사
/gsd:ui-review 3                    # phase 3 감사
```

---

### `/gsd:audit-uat`

모든 미해결 UAT 및 검증 항목을 phase 전반에 걸쳐 감사합니다.

**사전 조건:** UAT 또는 verification이 포함된 실행 phase가 하나 이상 있어야 함
**생성 결과:** 사람이 수행할 테스트 계획이 포함된 분류형 감사 리포트

```bash
/gsd:audit-uat
```

---

### `/gsd:audit-milestone`

milestone이 완료 정의를 충족했는지 검증합니다.

**사전 조건:** 모든 phase가 실행되어야 함
**생성 결과:** gap 분석이 포함된 감사 리포트

```bash
/gsd:audit-milestone
```

---

### `/gsd:complete-milestone`

milestone을 아카이브하고 릴리스 태그를 만듭니다.

**사전 조건:** milestone audit 완료 권장
**생성 결과:** `MILESTONES.md` 항목, git tag

```bash
/gsd:complete-milestone
```

---

### `/gsd:new-milestone`

다음 버전 주기를 시작합니다.

| Argument | 필수 | 설명 |
|----------|------|------|
| `name` | 아니오 | milestone 이름 |
| `--reset-phase-numbers` | 아니오 | 새 milestone을 Phase 1부터 다시 시작하고 roadmap 작성 전에 이전 phase 디렉터리를 아카이브 |

**사전 조건:** 이전 milestone 완료
**생성 결과:** 업데이트된 `PROJECT.md`, 새로운 `REQUIREMENTS.md`, 새로운 `ROADMAP.md`

```bash
/gsd:new-milestone                  # 대화형
/gsd:new-milestone "v2.0 Mobile"    # 이름 지정 milestone
/gsd:new-milestone --reset-phase-numbers "v2.0 Mobile"  # milestone 번호를 1부터 다시 시작
```

---

## Phase 관리 명령

### `/gsd:add-phase`

roadmap 끝에 새 phase를 추가합니다.

```bash
/gsd:add-phase                      # 대화형으로 phase 설명 입력
```

### `/gsd:insert-phase`

소수점 번호를 사용해 phase 사이에 긴급 작업을 삽입합니다.

| Argument | 필수 | 설명 |
|----------|------|------|
| `N` | 아니오 | 이 phase 번호 뒤에 삽입 |

```bash
/gsd:insert-phase 3                 # phase 3과 4 사이에 삽입 → 3.1 생성
```

### `/gsd:remove-phase`

미래 phase를 제거하고 뒤따르는 phase 번호를 다시 매깁니다.

| Argument | 필수 | 설명 |
|----------|------|------|
| `N` | 아니오 | 제거할 Phase 번호 |

```bash
/gsd:remove-phase 7                 # phase 7 제거, 8→7, 9→8로 재번호 부여
```

### `/gsd:list-phase-assumptions`

계획 전에 Claude가 의도한 접근을 미리 확인합니다.

| Argument | 필수 | 설명 |
|----------|------|------|
| `N` | 아니오 | Phase 번호 |

```bash
/gsd:list-phase-assumptions 2       # phase 2 가정 확인
```

### `/gsd:plan-milestone-gaps`

milestone audit에서 발견된 gap을 메울 phase를 생성합니다.

```bash
/gsd:plan-milestone-gaps             # audit gap별 phase 생성
```

### `/gsd:research-phase`

깊은 생태계 조사만 단독으로 수행합니다(보통은 `/gsd:plan-phase` 사용 권장).

| Argument | 필수 | 설명 |
|----------|------|------|
| `N` | 아니오 | Phase 번호 |

```bash
/gsd:research-phase 4               # phase 4 도메인 조사
```

### `/gsd:validate-phase`

사후적으로 Nyquist validation gap을 감사하고 보완합니다.

| Argument | 필수 | 설명 |
|----------|------|------|
| `N` | 아니오 | Phase 번호 |

```bash
/gsd:validate-phase 2               # phase 2 테스트 커버리지 감사
```

---

## 탐색 명령

### `/gsd:progress`

상태와 다음 단계를 보여 줍니다.

```bash
/gsd:progress                       # "지금 어디까지 왔지? 다음은 뭐지?"
```

### `/gsd:resume-work`

이전 세션의 전체 컨텍스트를 복원합니다.

```bash
/gsd:resume-work                    # 컨텍스트 초기화 후 또는 새 세션에서
```

### `/gsd:pause-work`

phase 도중 멈출 때 컨텍스트 handoff를 저장합니다.

```bash
/gsd:pause-work                     # continue-here.md 생성
```

### `/gsd:help`

전체 명령과 사용 가이드를 보여 줍니다.

```bash
/gsd:help                           # 빠른 참고
```

---

## 유틸리티 명령

### `/gsd:quick`

GSD 보장을 유지한 채 ad-hoc 작업을 실행합니다.

| Flag | 설명 |
|------|------|
| `--full` | plan checking(2회 반복) + 실행 후 verification 활성화 |
| `--discuss` | 가벼운 사전 planning discussion |
| `--research` | planning 전에 집중형 researcher 실행 |

flag는 조합해서 사용할 수 있습니다.

```bash
/gsd:quick                          # 기본 quick 작업
/gsd:quick --discuss --research     # discussion + research + planning
/gsd:quick --full                   # plan checking과 verification 포함
/gsd:quick --discuss --research --full  # 모든 선택 단계를 사용
```

### `/gsd:autonomous`

남아 있는 모든 phase를 자율적으로 실행합니다.

| Flag | 설명 |
|------|------|
| `--from N` | 특정 Phase 번호부터 시작 |

```bash
/gsd:autonomous                     # 남은 모든 phase 실행
/gsd:autonomous --from 3            # phase 3부터 시작
```

### `/gsd:do`

자유 형식 텍스트를 적절한 GSD 명령으로 라우팅합니다.

```bash
/gsd:do                             # 이후 원하는 작업 설명
```

### `/gsd:note`

마찰 없는 아이디어 캡처입니다. 메모를 추가하거나, 목록을 보거나, todo로 승격할 수 있습니다.

| Argument | 필수 | 설명 |
|----------|------|------|
| `text` | 아니오 | 저장할 메모 텍스트(기본값: append 모드) |
| `list` | 아니오 | 프로젝트/전역 범위의 모든 메모 목록 |
| `promote N` | 아니오 | 메모 N을 구조화된 todo로 변환 |

| Flag | 설명 |
|------|------|
| `--global` | 메모 작업에 전역 범위 사용 |

```bash
/gsd:note "Consider caching strategy for API responses"
/gsd:note list
/gsd:note promote 3
```

### `/gsd:debug`

지속 상태를 유지하는 체계적 디버깅입니다.

| Argument | 필수 | 설명 |
|----------|------|------|
| `description` | 아니오 | 버그 설명 |

```bash
/gsd:debug "Login button not responding on mobile Safari"
```

### `/gsd:add-todo`

나중을 위해 아이디어나 작업을 저장합니다.

| Argument | 필수 | 설명 |
|----------|------|------|
| `description` | 아니오 | todo 설명 |

```bash
/gsd:add-todo "Consider adding dark mode support"
```

### `/gsd:check-todos`

대기 중인 todo를 나열하고 작업할 항목을 고릅니다.

```bash
/gsd:check-todos
```

### `/gsd:add-tests`

완료된 phase를 위한 테스트를 생성합니다.

| Argument | 필수 | 설명 |
|----------|------|------|
| `N` | 아니오 | Phase 번호 |

```bash
/gsd:add-tests 2                    # phase 2 테스트 생성
```

### `/gsd:stats`

프로젝트 통계를 표시합니다.

```bash
/gsd:stats                          # 프로젝트 메트릭 대시보드
```

### `/gsd:profile-user`

Claude Code 세션을 8개 차원(커뮤니케이션 스타일, 결정 패턴, 디버깅 접근, UX 선호, 벤더 선택, 좌절 트리거, 학습 스타일, 설명 깊이)으로 분석해 개발자 행동 프로필을 생성합니다. Claude 응답을 개인화하는 산출물을 만듭니다.

| Flag | 설명 |
|------|------|
| `--questionnaire` | 세션 분석 대신 대화형 설문 사용 |
| `--refresh` | 세션을 다시 분석하고 프로필 재생성 |

**생성 산출물:**
- `USER-PROFILE.md` — 전체 행동 프로필
- `/gsd:dev-preferences` 명령 — 어떤 세션에서든 선호 불러오기
- `CLAUDE.md` 프로필 섹션 — Claude Code가 자동 발견

```bash
/gsd:profile-user                   # 세션 분석 후 프로필 생성
/gsd:profile-user --questionnaire   # 대화형 설문 대체 경로
/gsd:profile-user --refresh         # 새 분석으로 다시 생성
```

### `/gsd:health`

`.planning/` 디렉터리 무결성을 검증합니다.

| Flag | 설명 |
|------|------|
| `--repair` | 복구 가능한 문제를 자동 수정 |

```bash
/gsd:health                         # 무결성 검사
/gsd:health --repair                # 검사 후 수정
```

### `/gsd:cleanup`

완료된 milestone에 쌓인 phase 디렉터리를 아카이브합니다.

```bash
/gsd:cleanup
```

---

## 설정 명령

### `/gsd:settings`

workflow 토글과 model profile을 대화형으로 설정합니다.

```bash
/gsd:settings                       # 대화형 설정
```

### `/gsd:set-profile`

프로필을 빠르게 전환합니다.

| Argument | 필수 | 설명 |
|----------|------|------|
| `profile` | **예** | `quality`, `balanced`, `budget`, 또는 `inherit` |

```bash
/gsd:set-profile budget             # budget profile로 전환
/gsd:set-profile quality            # quality profile로 전환
```

---

## 브라운필드 명령

### `/gsd:map-codebase`

병렬 mapper 에이전트로 기존 코드베이스를 분석합니다.

| Argument | 필수 | 설명 |
|----------|------|------|
| `area` | 아니오 | 특정 영역으로 매핑 범위 제한 |

```bash
/gsd:map-codebase                   # 전체 코드베이스 분석
/gsd:map-codebase auth              # auth 영역에 집중
```

---

## 업데이트 명령

### `/gsd:update`

changelog 미리보기와 함께 GSD를 업데이트합니다.

```bash
/gsd:update                         # 업데이트 확인 후 설치
```

### `/gsd:reapply-patches`

GSD 업데이트 후 로컬 수정사항을 복원합니다.

```bash
/gsd:reapply-patches                # 로컬 변경 다시 병합
```

---

## 빠른 인라인 명령

### `/gsd:fast`

사소한 작업을 인라인으로 실행합니다. 서브에이전트도, planning 오버헤드도 없습니다. 오타 수정, 설정 변경, 작은 리팩터, 빠뜨린 commit에 적합합니다.

| Argument | 필수 | 설명 |
|----------|------|------|
| `task description` | 아니오 | 수행할 작업(없으면 프롬프트로 물어봄) |

**`/gsd:quick`의 대체재는 아닙니다**. research, 다단계 planning, verification이 필요한 작업에는 `/gsd:quick`을 사용하세요.

```bash
/gsd:fast "fix typo in README"
/gsd:fast "add .env to gitignore"
```

---

## 코드 품질 명령

### `/gsd:review`

외부 AI CLI를 사용해 phase plan에 대해 cross-AI peer review를 수행합니다.

| Argument | 필수 | 설명 |
|----------|------|------|
| `--phase N` | **예** | 리뷰할 Phase 번호 |

| Flag | 설명 |
|------|------|
| `--gemini` | Gemini CLI 리뷰 포함 |
| `--claude` | Claude CLI 리뷰 포함(별도 세션) |
| `--codex` | Codex CLI 리뷰 포함 |
| `--all` | 사용 가능한 모든 CLI 포함 |

**생성 결과:** `{phase}-REVIEWS.md` — `/gsd:plan-phase --reviews`에서 사용 가능

```bash
/gsd:review --phase 3 --all
/gsd:review --phase 2 --gemini
```

---

### `/gsd:pr-branch`

`.planning/` commit을 걸러 깨끗한 PR 브랜치를 만듭니다.

| Argument | 필수 | 설명 |
|----------|------|------|
| `target branch` | 아니오 | 기준 브랜치(기본값: `main`) |

**목적:** 리뷰어가 GSD planning 산출물 없이 코드 변경만 보도록 합니다.

```bash
/gsd:pr-branch                     # main 기준으로 필터링
/gsd:pr-branch develop             # develop 기준으로 필터링
```

---

### `/gsd:audit-uat`

모든 미해결 UAT 및 검증 항목에 대한 교차 단계 감사.

**전제 조건:** UAT 또는 검증을 통해 하나 이상의 단계가 실행되었습니다.
**생성:** 인간 테스트 계획이 포함된 분류된 감사 보고서

```bash
/gsd:audit-uat
```

---

## 백로그 및 thread 명령

### `/gsd:add-backlog`

999.x 번호를 사용해 아이디어를 backlog parking lot에 추가합니다.

| Argument | 필수 | 설명 |
|----------|------|------|
| `description` | **예** | backlog 항목 설명 |

**999.x 번호 체계**는 backlog 항목을 활성 phase 순서 밖에 둡니다. phase 디렉터리를 즉시 만들기 때문에 `/gsd:discuss-phase`와 `/gsd:plan-phase`를 바로 사용할 수 있습니다.

```bash
/gsd:add-backlog "GraphQL API layer"
/gsd:add-backlog "Mobile responsive redesign"
```

---

### `/gsd:review-backlog`

backlog 항목을 검토하고 활성 milestone으로 승격합니다.

**항목별 작업:** Promote(활성 순서로 이동), Keep(백로그에 유지), Remove(삭제)

```bash
/gsd:review-backlog
```

---

### `/gsd:plant-seed`

조건이 맞을 때 자동으로 떠오르는 미래 지향 아이디어를 저장합니다.

| Argument | 필수 | 설명 |
|----------|------|------|
| `idea summary` | 아니오 | seed 설명(없으면 프롬프트로 물어봄) |

seed는 context rot를 줄입니다. 아무도 읽지 않는 Deferred 한 줄 대신, WHY, 언제 떠올릴지, 자세한 맥락으로 가는 단서를 함께 보존합니다.

**생성 결과:** `.planning/seeds/SEED-NNN-slug.md`
**사용처:** `/gsd:new-milestone`(seed를 스캔해 일치 항목 표시)

```bash
/gsd:plant-seed "Add real-time collaboration when WebSocket infra is in place"
```

---

### `/gsd:thread`

세션을 넘나드는 작업을 위한 지속형 context thread를 관리합니다.

| Argument | 필수 | 설명 |
|----------|------|------|
| (none) | — | 모든 thread 목록 |
| `name` | — | 이름으로 기존 thread 재개 |
| `description` | — | 새 thread 생성 |

thread는 여러 세션에 걸치지만 특정 phase에 속하지 않는 작업을 위한 가벼운 cross-session 지식 저장소입니다. `/gsd:pause-work`보다 더 가볍습니다.

```bash
/gsd:thread                         # 모든 thread 목록
/gsd:thread fix-deploy-key-auth     # thread 재개
/gsd:thread "Investigate TCP timeout in pasta service"  # 새 thread 생성
```

---

## 커뮤니티 명령

### `/gsd:join-discord`

Discord 커뮤니티 초대 링크를 엽니다.

```bash
/gsd:join-discord
```
