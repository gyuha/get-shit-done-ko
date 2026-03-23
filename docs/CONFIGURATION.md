# GSD 설정 레퍼런스

> 전체 configuration schema, workflow 토글, 모델 프로필, git branching 옵션을 설명하는 문서입니다. 기능 맥락은 [Feature Reference](FEATURES.md)를 참고하세요.

> [!NOTE]
> 설정 키 이름과 값, 파일 경로, 명령어 예시는 그대로 유지합니다. 설명만 한국어로 제공합니다.

---

## 설정 파일

GSD는 프로젝트 설정을 `.planning/config.json`에 저장합니다. `/gsd:new-project`에서 처음 생성되고, 이후 `/gsd:settings`로 수정할 수 있습니다.

### 전체 스키마

```json
{
  "mode": "interactive",
  "granularity": "standard",
  "model_profile": "balanced",
  "model_overrides": {},
  "planning": {
    "commit_docs": true,
    "search_gitignored": false
  },
  "workflow": {
    "research": true,
    "plan_check": true,
    "verifier": true,
    "auto_advance": false,
    "nyquist_validation": true,
    "ui_phase": true,
    "ui_safety_gate": true,
    "node_repair": true,
    "node_repair_budget": 2,
    "research_before_questions": false
  },
  "hooks": {
    "context_warnings": true,
    "workflow_guard": false
  },
  "parallelization": {
    "enabled": true,
    "plan_level": true,
    "task_level": false,
    "skip_checkpoints": true,
    "max_concurrent_agents": 3,
    "min_plans_for_parallel": 2
  },
  "git": {
    "branching_strategy": "none",
    "phase_branch_template": "gsd/phase-{phase}-{slug}",
    "milestone_branch_template": "gsd/{milestone}-{slug}",
    "quick_branch_template": null
  },
  "gates": {
    "confirm_project": true,
    "confirm_phases": true,
    "confirm_roadmap": true,
    "confirm_breakdown": true,
    "confirm_plan": true,
    "execute_next_plan": true,
    "issues_review": true,
    "confirm_transition": true
  },
  "safety": {
    "always_confirm_destructive": true,
    "always_confirm_external_services": true
  }
}
```

---

## 핵심 설정

| Setting | Type | Options | Default | 설명 |
|---------|------|---------|---------|------|
| `mode` | enum | `interactive`, `yolo` | `interactive` | `yolo`는 결정을 자동 승인하고, `interactive`는 각 단계에서 확인합니다 |
| `granularity` | enum | `coarse`, `standard`, `fine` | `standard` | phase 개수를 제어합니다: `coarse`(3-5), `standard`(5-8), `fine`(8-12) |
| `model_profile` | enum | `quality`, `balanced`, `budget`, `inherit` | `balanced` | 각 에이전트에 사용할 모델 티어(아래 [Model Profiles](#model-profiles) 참고) |

> **참고:** `granularity`는 v1.22.3에서 `depth`에서 이름이 바뀌었습니다. 기존 설정은 자동 마이그레이션됩니다.

---

## 워크플로 토글

모든 workflow toggle은 **absent = enabled** 패턴을 따릅니다. 설정 키가 없으면 기본값은 `true`입니다.

| Setting | Type | Default | 설명 |
|---------|------|---------|------|
| `workflow.research` | boolean | `true` | 각 phase planning 전에 도메인 조사 수행 |
| `workflow.plan_check` | boolean | `true` | plan 검증 루프 실행(최대 3회 반복) |
| `workflow.verifier` | boolean | `true` | 실행 후 phase 목표 기준으로 검증 |
| `workflow.auto_advance` | boolean | `false` | 멈추지 않고 discuss → plan → execute를 자동 연결 |
| `workflow.nyquist_validation` | boolean | `true` | plan-phase 조사 중 테스트 커버리지 매핑 수행 |
| `workflow.ui_phase` | boolean | `true` | 프론트엔드 phase용 UI 디자인 계약 생성 |
| `workflow.ui_safety_gate` | boolean | `true` | plan-phase 중 프론트엔드 phase에 `/gsd:ui-phase` 실행을 안내 |
| `workflow.node_repair` | boolean | `true` | verification 실패 시 작업을 자율 복구 |
| `workflow.node_repair_budget` | number | `2` | 실패한 작업당 최대 복구 시도 횟수 |
| `workflow.research_before_questions` | boolean | `false` | discussion 질문 전에 research를 먼저 수행 |

### 권장 프리셋

| 시나리오 | 모드 | 세분성 | 프로필 | 연구 | 계획_확인 | 검증자 |
|----------|------|-------------|---------|----------|------------|----------|
| 프로토타이핑 | `yolo` | `coarse` | `budget` | `false` | `false` | `false` |
| 일반 개발 | `interactive` | `standard` | `balanced` | `true` | `true` | `true` |
| 프로덕션 릴리스 | `interactive` | `fine` | `quality` | `true` | `true` | `true` |

---

## Planning 설정

| Setting | Type | Default | 설명 |
|---------|------|---------|------|
| `planning.commit_docs` | boolean | `true` | `.planning/` 파일을 git에 커밋할지 여부 |
| `planning.search_gitignored` | boolean | `false` | 광범위 검색에 `--no-ignore`를 추가해 `.planning/`까지 포함 |

### 자동 감지

`.planning/`이 `.gitignore`에 있으면 `config.json` 값과 상관없이 `commit_docs`는 자동으로 `false`가 됩니다. git 오류를 막기 위한 동작입니다.

---

## Hook 설정

| Setting | Type | Default | 설명 |
|---------|------|---------|------|
| `hooks.context_warnings` | boolean | `true` | context monitor hook으로 컨텍스트 창 사용량 경고 표시 |
| `hooks.workflow_guard` | boolean | `false` | 파일 편집이 GSD 워크플로 맥락 밖에서 일어나면 경고(`/gsd:quick`, `/gsd:fast` 사용 권장) |

prompt injection guard hook(`gsd-prompt-guard.js`)은 항상 활성화되며 비활성화할 수 없습니다. workflow toggle이 아니라 보안 기능이기 때문입니다.

### 비공개 planning 설정

planning 산출물을 git 바깥에 두려면 다음을 따르세요.

1. `planning.commit_docs: false` 및 `planning.search_gitignored: true`을 설정합니다.
2. `.gitignore`에 `.planning/`을 추가합니다.
3. 이전에 추적한 경우: `git rm -r --cached .planning/ && git commit -m "chore: stop tracking planning docs"`

---

## 병렬화 설정

| Setting | Type | Default | 설명 |
|---------|------|---------|------|
| `parallelization.enabled` | boolean | `true` | 독립 plan을 동시에 실행 |
| `parallelization.plan_level` | boolean | `true` | plan 단위로 병렬화 |
| `parallelization.task_level` | boolean | `false` | plan 내부 task 병렬화 |
| `parallelization.skip_checkpoints` | boolean | `true` | 병렬 실행 중 checkpoint 생략 |
| `parallelization.max_concurrent_agents` | number | `3` | 동시 실행 에이전트 최대 수 |
| `parallelization.min_plans_for_parallel` | number | `2` | 병렬 실행을 시작하는 최소 plan 수 |

> **Pre-commit hook과 병렬 실행:** 병렬화가 켜져 있으면 executor 에이전트는 build lock 충돌(예: Rust 프로젝트의 cargo lock 경쟁)을 피하기 위해 `--no-verify`로 commit합니다. orchestrator는 각 wave가 끝난 뒤 hook을 한 번만 검증합니다. `STATE.md` 쓰기는 파일 단위 잠금으로 보호되어 동시 쓰기 손상을 막습니다. commit마다 hook을 꼭 실행해야 한다면 `parallelization.enabled: false`로 설정하세요.

---

## Git 브랜치 전략

| Setting | Type | Default | 설명 |
|---------|------|---------|------|
| `git.branching_strategy` | enum | `none` | `none`, `phase`, `milestone` 중 하나 |
| `git.phase_branch_template` | string | `gsd/phase-{phase}-{slug}` | phase 전략용 브랜치 이름 템플릿 |
| `git.milestone_branch_template` | string | `gsd/{milestone}-{slug}` | milestone 전략용 브랜치 이름 템플릿 |
| `git.quick_branch_template` | string or null | `null` | `/gsd:quick` 작업용 선택적 브랜치 이름 템플릿 |

### 전략 비교

| Strategy | 브랜치 생성 시점 | 범위 | 머지 시점 | 적합한 상황 |
|----------|------------------|------|-----------|-------------|
| `none` | 생성 안 함 | N/A | N/A | 1인 개발, 단순 프로젝트 |
| `phase` | `execute-phase` 시작 시 | 한 phase | 사용자가 phase 후 머지 | phase 단위 코드 리뷰, 세밀한 롤백 |
| `milestone` | 첫 `execute-phase` 시 | milestone의 모든 phase | `complete-milestone` 시 | 릴리스 브랜치, 버전별 PR |

### 템플릿 변수

| Variable | 사용 위치 | 예시 |
|----------|----------|------|
| `{phase}` | `phase_branch_template` | `03`(0으로 패딩) |
| `{slug}` | 두 템플릿 모두 | `user-authentication`(소문자, 하이픈 구분) |
| `{milestone}` | `milestone_branch_template` | `v1.0` |
| `{num}` / `{quick}` | `quick_branch_template` | `260317-abc`(빠른 작업 ID) |

quick-task branching 예시:

```json
"git": {
  "quick_branch_template": "gsd/quick-{num}-{slug}"
}
```

### Milestone 완료 시 머지 옵션

| 옵션 | Git 명령 | 결과 |
|------|----------|------|
| Squash merge(권장) | `git merge --squash` | 브랜치당 깔끔한 단일 commit |
| 이력 포함 merge | `git merge --no-ff` | 개별 commit 이력 보존 |
| 머지 없이 삭제 | `git branch -D` | 브랜치 작업 폐기 |
| 브랜치 유지 | (없음) | 이후 수동 처리 |

---

## Gate 설정

워크플로 중 확인 프롬프트를 제어합니다.

| Setting | Type | Default | 설명 |
|---------|------|---------|------|
| `gates.confirm_project` | boolean | `true` | 최종 확정 전 프로젝트 상세 확인 |
| `gates.confirm_phases` | boolean | `true` | phase 분해 결과 확인 |
| `gates.confirm_roadmap` | boolean | `true` | 진행 전 roadmap 확인 |
| `gates.confirm_breakdown` | boolean | `true` | task 분해 결과 확인 |
| `gates.confirm_plan` | boolean | `true` | 각 plan 실행 전 확인 |
| `gates.execute_next_plan` | boolean | `true` | 다음 plan 실행 전 확인 |
| `gates.issues_review` | boolean | `true` | 수정 plan 생성 전 이슈 검토 |
| `gates.confirm_transition` | boolean | `true` | phase 전환 확인 |

---

## 안전 설정

| Setting | Type | Default | 설명 |
|---------|------|---------|------|
| `safety.always_confirm_destructive` | boolean | `true` | 파괴적 작업(삭제, 덮어쓰기) 전 확인 |
| `safety.always_confirm_external_services` | boolean | `true` | 외부 서비스 상호작용 전 확인 |

---

## Hook 설정 요약

| Setting | Type | Default | 설명 |
|---------|------|---------|------|
| `hooks.context_warnings` | boolean | `true` | 세션 중 컨텍스트 창 사용량 경고 표시 |

---

## 모델 프로필

### 프로필 정의

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
| gsd-검증기 | 소네트 | 소네트 | 하이쿠 | 상속 |
| gsd 계획 검사기 | 소네트 | 소네트 | 하이쿠 | 상속 |
| gsd-통합-검사기 | 소네트 | 소네트 | 하이쿠 | 상속 |
| gsd-nyquist-감사자 | 소네트 | 소네트 | 하이쿠 | 상속 |

### 에이전트별 override

전체 프로필을 바꾸지 않고 특정 에이전트만 override할 수 있습니다.

```json
{
  "model_profile": "balanced",
  "model_overrides": {
    "gsd-executor": "opus",
    "gsd-planner": "haiku"
  }
}
```

유효한 override 값은 `opus`, `sonnet`, `haiku`, `inherit`, 또는 완전한 모델 ID(예: `"openai/o3"`, `"google/gemini-2.5-pro"`)입니다.

### Claude 이외 런타임(Codex, OpenCode, Gemini CLI)

GSD를 Claude 이외 런타임에 설치하면, 설치기가 `~/.gsd/defaults.json`에 `resolve_model_ids: "omit"`를 자동 설정합니다. 그러면 GSD는 모든 에이전트에 빈 model parameter를 반환하고, 각 에이전트는 해당 런타임에 설정된 기본 모델을 사용합니다. 기본 사용에는 추가 설정이 필요 없습니다.

에이전트별로 다른 모델을 쓰고 싶다면, 런타임이 인식하는 완전한 모델 ID를 `model_overrides`에 지정하세요.

```json
{
  "resolve_model_ids": "omit",
  "model_overrides": {
    "gsd-planner": "o3",
    "gsd-executor": "o4-mini",
    "gsd-debugger": "o3",
    "gsd-codebase-mapper": "o4-mini"
  }
}
```

의도는 Claude profile tier와 같습니다. reasoning 품질이 중요한 planning과 debugging에는 더 강한 모델을, 이미 reasoning이 plan에 담겨 있는 execution과 mapping에는 더 저렴한 모델을 쓰는 방식입니다.

**어떤 접근을 언제 쓸까:**

| 상황 | 설정 | 효과 |
|------|------|------|
| Claude 이외 런타임, 단일 모델 | `resolve_model_ids: "omit"`(설치기 기본값) | 모든 에이전트가 런타임 기본 모델 사용 |
| Claude 이외 런타임, 티어형 모델 | `resolve_model_ids: "omit"` + `model_overrides` | 지정한 에이전트는 특정 모델, 나머지는 런타임 기본값 사용 |
| OpenRouter/로컬 provider를 쓰는 Claude Code | `model_profile: "inherit"` | 모든 에이전트가 현재 세션 모델을 따름 |
| OpenRouter + 티어형 모델의 Claude Code | `model_profile: "inherit"` + `model_overrides` | 지정 에이전트는 특정 모델, 나머지는 세션 모델 상속 |

**`resolve_model_ids` 값:**

| 값 | 동작 | 사용 시점 |
|-----|------|-----------|
| `false`(기본값) | Claude alias(`opus`, `sonnet`, `haiku`) 반환 | 기본 Anthropic API를 쓰는 Claude Code |
| `true` | alias를 전체 Claude 모델 ID(`claude-opus-4-0`)로 매핑 | 전체 ID가 필요한 API를 쓰는 Claude Code |
| `"omit"` | 빈 문자열 반환(런타임이 기본값 선택) | Claude 이외 런타임(Codex, OpenCode, Gemini CLI) |

### 프로필 철학

| Profile | 철학 | 사용 시점 |
|---------|------|-----------|
| `quality` | 모든 의사결정은 Opus, verification은 Sonnet | quota에 여유가 있고 아키텍처 작업이 중요할 때 |
| `balanced` | planning만 Opus, 나머지는 Sonnet | 일반 개발(기본값) |
| `budget` | 코드 작성은 Sonnet, research/verification은 Haiku | 작업량이 많거나 덜 중요한 phase |
| `inherit` | 모든 에이전트가 현재 세션 모델 사용 | 동적 모델 전환, **Anthropic 외 provider**(OpenRouter, 로컬 모델) 사용 시 |

---

## 환경 변수

| Variable | 용도 |
|----------|------|
| `CLAUDE_CONFIG_DIR` | 기본 설정 디렉터리(`~/.claude/`)를 override |
| `GEMINI_API_KEY` | context monitor가 감지해 hook 이벤트 이름 전환 |
| `WSL_DISTRO_NAME` | 설치기가 WSL 경로 처리를 위해 감지 |

---

## 전역 기본값

설정을 이후 프로젝트에 사용할 전역 기본값으로 저장할 수 있습니다.

**위치:** `~/.gsd/defaults.json`

`/gsd:new-project`가 새 `config.json`을 만들 때 전역 기본값을 읽어 시작 설정으로 병합합니다. 프로젝트별 설정은 항상 전역 기본값보다 우선합니다.
