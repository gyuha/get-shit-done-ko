<div align="center">

# GET SHIT DONE

**한국어(기본)** · [영문 참고판 (upstream v1.28.0)](https://github.com/gsd-build/get-shit-done/tree/v1.28.0)

> 유지보수 참고: 이 포크는 upstream `v1.28.0`을 기준으로 시작했습니다. 동기화 기준과 번역 가드레일은 [docs/UPSTREAM-SYNC.md](docs/UPSTREAM-SYNC.md), 릴리스 점검 절차는 [docs/RELEASE-CHECKLIST.md](docs/RELEASE-CHECKLIST.md)에서 확인할 수 있습니다.

**Claude Code, OpenCode, Gemini CLI, Codex, Copilot, Antigravity를 위한 가볍고 강력한 메타 프롬프팅, 컨텍스트 엔지니어링, 스펙 기반 개발 시스템입니다.**

**Claude의 컨텍스트 창이 차오르면서 품질이 떨어지는 문제, 즉 context rot를 완화합니다.**

[**문서 인덱스**](docs/README.md) | [**영문 참고판**](https://github.com/gsd-build/get-shit-done/tree/v1.28.0/docs)

<br>

```bash
npx get-shit-done-ko@latest
```

**Mac, Windows, Linux에서 동작합니다.**

<br>

![GSD Install](assets/terminal.svg)

<br>

*"원하는 바가 분명하다면, 이 도구가 그것을 확실히 만들어 줍니다. 군더더기 없습니다."*

*"SpecKit, OpenSpec, Taskmaster를 다 써 봤지만, 개인적으로는 이 도구가 가장 좋은 결과를 냈습니다."*

*"제 Claude Code에 더한 것 중 가장 강력합니다. 과하게 설계된 느낌이 전혀 없습니다. 말 그대로 할 일을 끝냅니다."*

<br>

**Amazon, Google, Shopify, Webflow의 엔지니어들도 사용하는 워크플로입니다.**

[왜 만들었는가](#why-i-built-this) · [작동 방식](#how-it-works) · [명령어](#commands) · [왜 잘 동작하는가](#why-it-works) · [사용자 가이드](docs/USER-GUIDE.md)

</div>

---

## 왜 만들었는가

저는 1인 개발자입니다. 코드는 제가 직접 쓰기보다 Claude Code가 더 많이 씁니다.

BMAD나 Speckit 같은 스펙 기반 개발 도구도 이미 있습니다. 다만 많은 도구가 스프린트 세리머니, 스토리 포인트, 이해관계자 싱크, 회고, Jira 워크플로 같은 절차를 과하게 요구하거나, 제가 만들고 싶은 것의 큰 그림을 제대로 이해하지 못했습니다. 저는 50명 규모의 소프트웨어 회사를 운영하는 게 아닙니다. 기업 놀이를 하고 싶은 것도 아닙니다. 그냥 잘 작동하는 좋은 것을 만들고 싶은 창작자입니다.

그래서 GSD를 만들었습니다. 복잡함은 사용자의 워크플로가 아니라 시스템 내부에 숨겨 두었습니다. 뒤에서는 context engineering, XML 프롬프트 포맷팅, 서브에이전트 오케스트레이션, 상태 관리가 돌아가고, 사용자는 몇 개의 잘 동작하는 명령어만 보게 됩니다.

이 시스템은 Claude가 작업을 수행하고 검증하는 데 필요한 정보를 함께 제공합니다. 저는 이 워크플로를 신뢰합니다. 실제로 결과가 좋기 때문입니다.

이 프로젝트는 그런 도구입니다. 과한 엔터프라이즈 롤플레잉 없이, Claude Code로 멋진 결과물을 꾸준히 만들 수 있게 해 주는 실전형 시스템입니다.

— **TÂCHES**

---

vibecoding은 평판이 좋지 않습니다. 원하는 것을 설명하면 AI가 코드를 만들지만, 결과는 들쭉날쭉하고 규모가 커질수록 쉽게 무너집니다.

GSD는 그 문제를 해결하려고 만든 컨텍스트 엔지니어링 레이어입니다. 아이디어를 설명하면 시스템이 필요한 정보를 구조화해서 뽑아내고, Claude Code가 그 맥락 위에서 안정적으로 일할 수 있게 만듭니다.

---

## 누가 쓰면 좋은가

50인 규모의 엔지니어링 조직처럼 행동하지 않아도, 원하는 것을 설명하고 그것이 제대로 구현되길 바라는 사람들을 위한 도구입니다.

---

## 시작하기

```bash
npx get-shit-done-ko@latest
```

설치기는 다음 두 가지를 묻습니다.
1. **런타임** — Claude Code, OpenCode, Gemini, Codex, Copilot, Cursor, Antigravity, 혹은 전체
2. **설치 위치** — Global(모든 프로젝트) 또는 local(현재 프로젝트만)

설치 확인:
- Claude Code / Gemini: `/gsd:help`
- OpenCode: `/gsd-help`
- Codex: `$gsd-help`
- Copilot: `/gsd:help`
- Antigravity: `/gsd:help`

> [!NOTE]
> Codex 설치는 커스텀 프롬프트 대신 skills(`skills/gsd-*/SKILL.md`)를 사용합니다.

### 업데이트 유지

GSD는 빠르게 바뀝니다. 주기적으로 업데이트하는 편이 좋습니다.

```bash
npx get-shit-done-ko@latest
```

<details>
<summary><strong>비대화형 설치 (Docker, CI, 스크립트)</strong></summary>

```bash
# Claude Code
npx get-shit-done-ko --claude --global   # ~/.claude/에 설치
npx get-shit-done-ko --claude --local    # ./.claude/에 설치

# OpenCode (오픈소스, 무료 모델)
npx get-shit-done-ko --opencode --global # ~/.config/opencode/에 설치

# Gemini CLI
npx get-shit-done-ko --gemini --global   # ~/.gemini/에 설치

# Codex (skills-first)
npx get-shit-done-ko --codex --global    # ~/.codex/에 설치
npx get-shit-done-ko --codex --local     # ./.codex/에 설치

# Copilot (GitHub Copilot CLI)
npx get-shit-done-ko --copilot --global  # ~/.github/에 설치
npx get-shit-done-ko --copilot --local   # ./.github/에 설치

# Cursor CLI
npx get-shit-done-ko --cursor --global      # ~/.cursor/에 설치
npx get-shit-done-ko --cursor --local       # ./.cursor/에 설치

# Antigravity (Google, skills-first, Gemini 기반)
npx get-shit-done-ko --antigravity --global # ~/.gemini/antigravity/에 설치
npx get-shit-done-ko --antigravity --local   # ./.agent/에 설치

# 모든 런타임
npx get-shit-done-ko --all --global      # 모든 디렉터리에 설치
```

`--global`(`-g`) 또는 `--local`(`-l`)을 사용하면 위치 선택 프롬프트를 건너뜁니다.
`--claude`, `--opencode`, `--gemini`, `--codex`, `--copilot`, `--cursor`, `--antigravity`, `--all`을 사용하면 런타임 선택 프롬프트를 건너뜁니다.

</details>

<details>
<summary><strong>개발용 설치</strong></summary>

저장소를 클론한 뒤 설치기를 로컬에서 실행할 수도 있습니다.

```bash
git clone https://github.com/gyuha/get-shit-done-ko.git
cd get-shit-done-ko
node bin/install.js --claude --local
```

기여 전에 수정 사항을 시험할 수 있도록 `./.claude/`에 설치합니다.

</details>

### 권한 건너뛰기 모드 추천

GSD는 승인 마찰이 적은 자동화를 기준으로 설계되었습니다. Claude Code는 다음처럼 실행하는 편이 가장 자연스럽습니다.

```bash
claude --dangerously-skip-permissions
```

> [!TIP]
> `date`나 `git commit` 같은 명령을 수십 번 승인해야 한다면 GSD를 쓰는 장점이 크게 줄어듭니다.

<details>
<summary><strong>대안: 세분화된 권한</strong></summary>

이 플래그를 쓰고 싶지 않다면 프로젝트의 `.claude/settings.json`에 다음과 같이 허용 목록을 넣을 수 있습니다.

```json
{
  "permissions": {
    "allow": [
      "Bash(date:*)",
      "Bash(echo:*)",
      "Bash(cat:*)",
      "Bash(ls:*)",
      "Bash(mkdir:*)",
      "Bash(wc:*)",
      "Bash(head:*)",
      "Bash(tail:*)",
      "Bash(sort:*)",
      "Bash(grep:*)",
      "Bash(tr:*)",
      "Bash(git add:*)",
      "Bash(git commit:*)",
      "Bash(git status:*)",
      "Bash(git log:*)",
      "Bash(git diff:*)",
      "Bash(git tag:*)"
    ]
  }
}
```

</details>

---

## 작동 방식

> **이미 코드가 있나요?** 먼저 `/gsd:map-codebase`를 실행하세요. 병렬 에이전트가 스택, 아키텍처, 관례, 리스크를 분석하고, 이후 `/gsd:new-project`가 기존 코드베이스를 이해한 상태에서 질문과 계획을 이어 갑니다.

### 1. 프로젝트 초기화

```
/gsd:new-project
```

명령 하나로 전체 초기화 흐름이 시작됩니다. 시스템은 다음을 수행합니다.

1. **질문** — 아이디어를 충분히 이해할 때까지 목표, 제약, 기술 선호, 예외 상황을 질문합니다.
2. **조사** — 도메인을 조사하는 병렬 에이전트를 실행합니다. 선택 사항이지만 권장됩니다.
3. **요구사항** — v1, v2, 범위 외 항목을 정리합니다.
4. **로드맵** — 요구사항과 연결된 phase 계획을 만듭니다.

로드맵을 승인하면 바로 구현 단계로 들어갈 수 있습니다.

**생성됨:** `PROJECT.md`, `REQUIREMENTS.md`, `ROADMAP.md`, `STATE.md`, `.planning/research/`

### 2. Discuss Phase

```
/gsd:discuss-phase 1
```

**여기서 실제 구현 방향을 다듬습니다.**

로드맵의 각 phase에는 보통 한두 문장만 들어 있습니다. 그것만으로는 *당신이 머릿속에서 그린 방식*대로 만들기에 맥락이 부족합니다. 이 단계는 연구나 계획에 들어가기 전에 사용자의 선호와 의도를 고정하는 역할을 합니다.

시스템은 phase를 분석한 뒤, 구현 대상에 따라 불확실한 결정 지점을 찾아냅니다.

- **시각 기능** → 레이아웃, 밀도, 상호작용, 빈 상태
- **API/CLI** → 응답 형식, flags, 오류 처리, verbosity
- **콘텐츠 시스템** → 구조, 톤, 깊이, 흐름
- **조직 업무** → 분류 기준, 네이밍, 중복 처리, 예외

선택한 영역마다 만족할 때까지 질문이 이어지고, 그 결과물인 `CONTEXT.md`가 다음 두 단계의 입력으로 직접 사용됩니다.

1. **조사 담당자가 읽음** — 어떤 패턴을 조사해야 하는지 이해합니다.
2. **계획 담당자가 읽음** — 어떤 의사결정이 이미 고정되었는지 이해합니다.

이 단계에서 구체적으로 답할수록 시스템은 더 정확히 당신이 원하는 구현을 향해 갑니다. 건너뛰면 무난한 기본값을 쓰고, 적극적으로 활용하면 *당신의 비전*에 더 가까워집니다.

**생성됨:** `{phase_num}-CONTEXT.md`

### 3. Plan Phase

```
/gsd:plan-phase 1
```

시스템은 다음을 수행합니다.

1. **조사** — `CONTEXT.md`의 결정을 바탕으로 이 phase를 어떻게 구현할지 조사합니다.
2. **계획** — XML 구조를 갖춘 2~3개의 원자적 task plan을 만듭니다.
3. **검증** — 계획이 요구사항을 만족하는지 확인하고, 통과할 때까지 반복합니다.

각 plan은 새로운 context window에서 무리 없이 실행될 정도로 작게 유지됩니다. 그래서 문맥 열화나 "이제 더 간단히 답할게요" 같은 품질 저하를 줄일 수 있습니다.

**생성됨:** `{phase_num}-RESEARCH.md`, `{phase_num}-{N}-PLAN.md`

### 4. Execute Phase

```
/gsd:execute-phase 1
```

시스템은 다음을 수행합니다.

1. **wave 단위 실행** — 병렬 가능한 것은 함께, 의존성이 있으면 순차적으로 실행합니다.
2. **plan마다 새 컨텍스트** — 각 plan은 구현만을 위한 새 컨텍스트에서 실행됩니다.
3. **task마다 커밋** — 모든 task는 원자적인 개별 commit을 가집니다.
4. **목표 기준 검증** — 결과물이 phase 목표를 실제로 충족하는지 확인합니다.

자리를 비웠다가 돌아와도, 정리된 git 히스토리와 함께 완료된 결과를 확인할 수 있습니다.

**wave 실행 방식**

plan은 의존 관계에 따라 "wave"로 묶입니다. 같은 wave 안에서는 병렬 실행하고, wave끼리는 순차 실행합니다.

```
┌────────────────────────────────────────────────────────────────────┐
│  PHASE EXECUTION                                                   │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  WAVE 1 (parallel)          WAVE 2 (parallel)          WAVE 3      │
│  ┌─────────┐ ┌─────────┐    ┌─────────┐ ┌─────────┐    ┌─────────┐ │
│  │ Plan 01 │ │ Plan 02 │ →  │ Plan 03 │ │ Plan 04 │ →  │ Plan 05 │ │
│  │         │ │         │    │         │ │         │    │         │ │
│  │ User    │ │ Product │    │ Orders  │ │ Cart    │    │ Checkout│ │
│  │ Model   │ │ Model   │    │ API     │ │ API     │    │ UI      │ │
│  └─────────┘ └─────────┘    └─────────┘ └─────────┘    └─────────┘ │
│       │           │              ↑           ↑              ↑      │
│       └───────────┴──────────────┴───────────┘              │      │
│              Dependencies: Plan 03 needs Plan 01            │      │
│                          Plan 04 needs Plan 02              │      │
│                          Plan 05 needs Plans 03 + 04        │      │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**wave가 중요한 이유**
- 독립적인 plan → 같은 wave → 병렬 실행
- 의존성이 있는 plan → 더 뒤의 wave → 선행 작업을 기다림
- 파일 충돌 가능성 → 순차 실행 또는 하나의 plan으로 묶음

`vertical slice`(예: 사용자 기능을 end-to-end로 한 묶음) 방식이 `horizontal layer`(예: 모델 전체, API 전체) 방식보다 병렬화에 유리한 이유도 여기에 있습니다.

**생성됨:** `{phase_num}-{N}-SUMMARY.md`, `{phase_num}-VERIFICATION.md`

### 5. 작업 검증

```
/gsd:verify-work 1
```

**여기서 결과물이 정말 기대대로 동작하는지 확인합니다.**

자동 검증은 코드 존재 여부와 테스트 통과 여부를 확인해 줍니다. 하지만 기능이 *원하는 방식대로* 동작하는지는 직접 확인해야 합니다. 이 단계가 그 자리입니다.

시스템은 다음을 수행합니다.

1. **검증 가능한 산출물 추출** — 지금 시점에서 실제로 해 볼 수 있어야 하는 항목을 뽑아냅니다.
2. **한 번에 하나씩 안내** — 항목별로 예/아니오 또는 문제 설명을 받습니다.
3. **실패 원인 자동 진단** — 실패 원인을 찾기 위해 debug agent를 실행합니다.
4. **검증된 수정 plan 생성** — 바로 다시 실행 가능한 수정 plan을 만듭니다.

모든 것이 통과하면 다음 단계로 넘어가고, 문제가 있으면 직접 수동 디버깅하기보다 생성된 수정 plan으로 `/gsd:execute-phase`를 다시 돌리면 됩니다.

**생성됨:** `{phase_num}-UAT.md`, 문제가 발견되면 fix plan

### 6. 반복 → 배포 → 완료 → 다음 마일스톤

```
/gsd:discuss-phase 2
/gsd:plan-phase 2
/gsd:execute-phase 2
/gsd:verify-work 2
/gsd:ship 2                  # 검증된 phase 작업으로 PR 생성
...
/gsd:complete-milestone
/gsd:new-milestone
```

다음 단계를 자동으로 맡기고 싶다면:

```
/gsd:next                    # 다음 논리적 워크플로 단계를 자동 감지해 실행
```

milestone이 끝날 때까지 **discuss → plan → execute → verify → ship**을 반복합니다.

discussion 단계에서 더 빠르게 진행하고 싶다면 `/gsd:discuss-phase <n> --batch`로 질문을 묶어서 받을 수 있습니다.

각 phase는 사용자 입력(discuss), 충분한 조사(plan), 깔끔한 실행(execute), 사람 검증(verify)을 거칩니다. 컨텍스트는 신선하게 유지되고 품질도 안정적입니다.

모든 phase가 끝나면 `/gsd:complete-milestone`이 milestone을 아카이브하고 릴리스 태그를 남깁니다.

그 다음 `/gsd:new-milestone`으로 다음 버전을 시작합니다. `new-project`와 비슷한 흐름이지만 기존 코드베이스를 전제로 하며, 다음에 만들 것을 설명하면 도메인 조사, 요구사항 범위화, 새 roadmap 생성으로 이어집니다.

### Quick Mode

```
/gsd:quick
```

**전체 planning이 필요 없는 작은 작업용 모드입니다.**

Quick mode는 더 짧은 경로로 GSD의 핵심 보장(원자적 커밋, 상태 추적)을 제공합니다.

- **같은 에이전트** — planner와 executor를 그대로 사용합니다.
- **선택 단계 생략** — 기본값으로 research, plan checker, verifier를 생략합니다.
- **별도 추적** — phase가 아닌 `.planning/quick/` 아래에서 별도로 추적합니다.

**`--discuss` 플래그:** planning 전에 불확실한 지점을 가볍게 정리합니다.

**`--research` 플래그:** planning 전에 집중형 researcher를 실행해 구현 접근법, 라이브러리 선택지, 함정을 조사합니다.

**`--full` 플래그:** 최대 2회 plan-checking과 실행 후 verification을 켭니다.

flag는 조합할 수 있습니다. `--discuss --research --full`이면 discussion, research, plan-checking, verification이 모두 적용됩니다.

```
/gsd:quick
> 무엇을 하고 싶나요? "설정에 다크 모드 토글 추가"
```

**생성됨:** `.planning/quick/001-add-dark-mode-toggle/PLAN.md`, `SUMMARY.md`

---

## 왜 잘 동작하는가

### 컨텍스트 엔지니어링

Claude Code는 필요한 컨텍스트를 충분히 받으면 매우 강력합니다. 문제는 대부분 그 컨텍스트를 제대로 주지 못한다는 점입니다.

GSD는 그 부분을 대신 구조화합니다.

| 파일 | 역할 |
|------|--------------|
| `PROJECT.md` | 프로젝트 비전, 항상 로드됨 |
| `research/` | 스택, 기능, 아키텍처, 함정에 대한 조사 결과 |
| `REQUIREMENTS.md` | v1/v2 요구사항과 phase 추적성 |
| `ROADMAP.md` | 어디까지 왔고 어디로 가는지 |
| `STATE.md` | 의사결정, blockers, 현재 위치를 담는 세션 메모리 |
| `PLAN.md` | XML 구조를 가진 원자적 작업 계획 |
| `SUMMARY.md` | 무엇을 했고 무엇이 바뀌었는지에 대한 결과 기록 |
| `todos/` | 나중을 위한 아이디어와 작업 |
| `threads/` | 세션을 가로지르는 지속형 컨텍스트 |
| `seeds/` | 적절한 milestone에서 떠오르도록 심어 둔 아이디어 |

이 구조는 Claude 품질이 흔들리기 시작하는 지점을 기준으로 설계되어 있습니다. 한계를 넘지 않으면 결과 품질도 훨씬 안정적입니다.

### XML 프롬프트 포맷팅

모든 plan은 Claude가 읽기 좋도록 XML 구조로 정리됩니다.

```xml
<task type="auto">
  <name>Create login endpoint</name>
  <files>src/app/api/auth/login/route.ts</files>
  <action>
    Use jose for JWT (not jsonwebtoken - CommonJS issues).
    Validate credentials against users table.
    Return httpOnly cookie on success.
  </action>
  <verify>curl -X POST localhost:3000/api/auth/login returns 200 + Set-Cookie</verify>
  <done>Valid credentials return cookie, invalid return 401</done>
</task>
```

지시가 명확하고, 추측할 여지를 줄이며, 검증 단계가 기본 포함됩니다.

### 다중 에이전트 오케스트레이션

각 단계는 같은 패턴을 따릅니다. 얇은 orchestrator가 전문 에이전트를 실행하고, 결과를 모으고, 다음 단계로 연결합니다.

| 단계 | Orchestrator 역할 | Agent 역할 |
|-------|------------------|-----------|
| 조사 | 조율하고 결과를 제시함 | 4명의 researcher가 stack, features, architecture, pitfalls를 조사 |
| 계획 | 검증하고 반복을 관리함 | planner가 plan 작성, checker가 검증, 통과할 때까지 반복 |
| 실행 | wave를 묶고 진행 상황을 추적함 | executor가 병렬 구현, 각자 새 200k 컨텍스트 사용 |
| 검증 | 결과를 제시하고 다음 단계로 라우팅함 | verifier가 목표 충족 여부를 확인, debugger가 실패 원인 분석 |

orchestrator는 무거운 작업을 직접 하지 않습니다. 에이전트를 실행하고, 기다리고, 결과를 통합합니다.

**결과적으로** 깊은 연구, 여러 plan 생성과 검증, 병렬 executor의 대량 코드 작성, 목표 기준 자동 검증까지 한 phase 전체를 돌려도 메인 컨텍스트는 비교적 가볍게 유지됩니다. 실제 작업은 신선한 서브에이전트 컨텍스트에서 수행됩니다.

### 원자적 Git 커밋

각 task는 완료 직후 자기만의 commit을 가집니다.

```bash
abc123f docs(08-02): complete user registration plan
def456g feat(08-02): add email confirmation flow
hij789k feat(08-02): implement password hashing
lmn012o feat(08-02): create registration endpoint
```

> [!NOTE]
> **장점:** Git bisect로 문제 task를 정확히 찾기 쉽고, 각 task를 독립적으로 되돌릴 수 있으며, 이후 세션에서도 Claude가 더 명확한 히스토리를 참고할 수 있습니다.

각 commit은 작고 추적 가능하며 의미 단위가 분명합니다.

### 모듈식 설계

- 현재 milestone에 phase 추가
- phase 사이에 긴급 작업 삽입
- milestone 완료 후 새 사이클 시작
- 전체를 갈아엎지 않고 plan 조정

즉, 흐름에 갇히지 않고 상황에 맞게 조정할 수 있습니다.

---

## 명령어

### 핵심 워크플로

| 명령어 | 설명 |
|---------|--------------|
| `/gsd:new-project [--auto]` | 전체 초기화: 질문 → 조사 → 요구사항 → roadmap |
| `/gsd:discuss-phase [N] [--auto] [--analyze]` | planning 전에 구현 결정을 수집 (`--analyze`는 trade-off 분석 추가) |
| `/gsd:plan-phase [N] [--auto]` | 특정 phase에 대해 research + plan + verify 실행 |
| `/gsd:execute-phase <N>` | 모든 plan을 병렬 wave로 실행하고 완료 후 검증 |
| `/gsd:verify-work [N]` | 수동 사용자 승인 테스트 ¹ |
| `/gsd:ship [N] [--draft]` | 자동 생성된 PR 본문과 함께 검증된 phase 작업으로 PR 생성 |
| `/gsd:next` | 다음 논리적 워크플로 단계로 자동 진행 |
| `/gsd:fast <text>` | 아주 단순한 작업을 즉시 실행 — planning 생략 |
| `/gsd:audit-milestone` | milestone이 정의된 완료 조건을 충족하는지 검증 |
| `/gsd:complete-milestone` | milestone을 아카이브하고 릴리스 태그를 남김 |
| `/gsd:new-milestone [name]` | 다음 버전 시작: 질문 → 조사 → 요구사항 → roadmap |

### UI 설계

| 명령어 | 설명 |
|---------|--------------|
| `/gsd:ui-phase [N]` | 프런트엔드 phase용 UI 디자인 계약(UI-SPEC.md) 생성 |
| `/gsd:ui-review [N]` | 구현된 프런트엔드 코드에 대한 6축 시각 리뷰 |

### 탐색

| 명령어 | 설명 |
|---------|--------------|
| `/gsd:progress` | 지금 어디까지 왔는지, 다음은 무엇인지 보여 줌 |
| `/gsd:next` | 현재 상태를 자동 감지해서 다음 단계를 실행 |
| `/gsd:help` | 모든 명령과 사용 가이드를 표시 |
| `/gsd:update` | changelog 미리보기와 함께 GSD 업데이트 |
| `/gsd:join-discord` | GSD Discord 커뮤니티 참여 |

### 기존 코드베이스

| 명령어 | 설명 |
|---------|--------------|
| `/gsd:map-codebase [area]` | 새 프로젝트 전에 기존 코드베이스 분석 |

### Phase 관리

| 명령어 | 설명 |
|---------|--------------|
| `/gsd:add-phase` | roadmap에 phase 추가 |
| `/gsd:insert-phase [N]` | phase 사이에 긴급 작업 삽입 |
| `/gsd:remove-phase [N]` | 미래 phase 제거 및 재번호 부여 |
| `/gsd:list-phase-assumptions [N]` | planning 전에 Claude의 의도된 접근 방식 확인 |
| `/gsd:plan-milestone-gaps` | 감사에서 발견한 gap을 메우는 phase 생성 |

### 세션

| 명령어 | 설명 |
|---------|--------------|
| `/gsd:pause-work` | phase 도중 중단할 때 handoff 생성 (`HANDOFF.json` 작성) |
| `/gsd:resume-work` | 마지막 세션에서 복원 |
| `/gsd:session-report` | 수행한 작업과 결과가 포함된 세션 요약 생성 |

### 코드 품질

| 명령어 | 설명 |
|---------|--------------|
| `/gsd:review` | 현재 phase 또는 branch에 대한 교차 AI peer review |
| `/gsd:pr-branch` | `.planning/` 커밋을 걸러낸 깨끗한 PR branch 생성 |
| `/gsd:audit-uat` | 검증 부채 감사 — UAT가 빠진 phase 찾기 |

### 백로그 & 스레드

| 명령어 | 설명 |
|---------|--------------|
| `/gsd:plant-seed <idea>` | 트리거 조건이 있는 미래 아이디어 저장 — 적절한 milestone에서 표면화 |
| `/gsd:add-backlog <desc>` | 아이디어를 backlog parking lot(999.x 번호, 활성 시퀀스 밖)에 추가 |
| `/gsd:review-backlog` | backlog 항목을 검토해 active milestone로 승격하거나 오래된 항목 제거 |
| `/gsd:thread [name]` | 지속형 컨텍스트 스레드 — 여러 세션에 걸친 작업을 위한 가벼운 지식 저장 |

### 유틸리티

| 명령어 | 설명 |
|---------|--------------|
| `/gsd:settings` | 모델 프로필과 workflow agent 설정 |
| `/gsd:set-profile <profile>` | 모델 프로필 전환 (`quality`/`balanced`/`budget`/`inherit`) |
| `/gsd:add-todo [desc]` | 나중에 처리할 아이디어 저장 |
| `/gsd:check-todos` | 대기 중인 todo 목록 보기 |
| `/gsd:debug [desc]` | 지속 상태를 사용한 체계적 디버깅 |
| `/gsd:do <text>` | 자유 입력을 적절한 GSD 명령으로 자동 라우팅 |
| `/gsd:note <text>` | 마찰 없는 아이디어 캡처 — note 추가, 목록화, todo 승격 |
| `/gsd:quick [--full] [--discuss] [--research]` | 임시 작업을 GSD 보장과 함께 실행 (`--full`은 plan-checking과 verification 추가, `--discuss`는 먼저 context 수집, `--research`는 계획 전 접근법 조사) |
| `/gsd:health [--repair]` | `.planning/` 디렉터리 무결성 검증, `--repair`로 자동 복구 |
| `/gsd:stats` | phase, plan, requirement, git metric 등 프로젝트 통계 표시 |
| `/gsd:profile-user [--questionnaire] [--refresh]` | 세션 분석으로 개발자 행동 프로필 생성 |

<sup>¹ reddit 사용자 OracleGreyBeard의 기여</sup>

---

## 설정

GSD는 프로젝트 설정을 `.planning/config.json`에 저장합니다. `/gsd:new-project` 중에 설정하거나 나중에 `/gsd:settings`로 변경할 수 있습니다. 전체 config schema, workflow 토글, git branching 옵션, per-agent model breakdown은 [User Guide](docs/USER-GUIDE.md#configuration-reference)를 참고하세요.

### 핵심 설정

| 설정 | 옵션 | 기본값 | 제어 대상 |
|---------|---------|---------|------------------|
| `mode` | `yolo`, `interactive` | `interactive` | 각 단계에서 자동 승인 vs 확인 |
| `granularity` | `coarse`, `standard`, `fine` | `standard` | phase granularity - scope를 얼마나 세밀하게 나눌지(phases × plans) |

### 모델 프로필

각 agent가 사용할 Claude model을 제어합니다. 품질과 토큰 사용량 사이의 균형을 맞출 수 있습니다.

| 프로필 | 계획 | 실행 | 검증 |
|---------|----------|-----------|--------------|
| `quality` | Opus | Opus | Sonnet |
| `balanced` (기본) | Opus | Sonnet | Sonnet |
| `budget` | Sonnet | Sonnet | Haiku |
| `inherit` | 상속 | 상속 | 상속 |

프로필 전환:
```
/gsd:set-profile budget
```

`inherit`는 비-Anthropic 제공자(OpenRouter, 로컬 모델)를 사용할 때나 현재 runtime model selection(OpenCode `/model` 등)을 그대로 따르고 싶을 때 사용합니다.

또는 `/gsd:settings`로 설정할 수 있습니다.

### Workflow Agents

이들은 planning/execution 중 추가 agent를 실행합니다. 품질은 좋아지지만 토큰과 시간이 더 듭니다.

| 설정 | 기본값 | 동작 |
|---------|---------|--------------|
| `workflow.research` | `true` | 각 phase를 계획하기 전에 도메인 조사 |
| `workflow.plan_check` | `true` | 실행 전에 plan이 phase 목표를 달성하는지 검증 |
| `workflow.verifier` | `true` | 실행 후 must-have 전달 여부 확인 |
| `workflow.auto_advance` | `false` | discuss → plan → execute를 멈추지 않고 자동 연결 |
| `workflow.research_before_questions` | `false` | discussion 질문보다 먼저 research 수행 |

이 값들은 `/gsd:settings`로 전환하거나 invocation마다 덮어쓸 수 있습니다.
- `/gsd:plan-phase --skip-research`
- `/gsd:plan-phase --skip-verify`

### 실행

| 설정 | 기본값 | 제어 대상 |
|---------|---------|------------------|
| `parallelization.enabled` | `true` | 독립적인 plan을 동시에 실행 |
| `planning.commit_docs` | `true` | `.planning/`을 git에 추적 |
| `hooks.context_warnings` | `true` | 컨텍스트 창 사용 경고 표시 |

### Git 브랜칭

GSD가 실행 중 브랜치를 어떻게 다룰지 제어합니다.

| 설정 | 옵션 | 기본값 | 동작 |
|---------|---------|---------|--------------|
| `git.branching_strategy` | `none`, `phase`, `milestone` | `none` | 브랜치 생성 전략 |
| `git.phase_branch_template` | string | `gsd/phase-{phase}-{slug}` | phase 브랜치 템플릿 |
| `git.milestone_branch_template` | string | `gsd/{milestone}-{slug}` | milestone 브랜치 템플릿 |

**전략:**
- **`none`** — 현재 브랜치에 직접 커밋(GSD 기본 동작)
- **`phase`** — phase마다 브랜치 생성, phase 완료 시 병합
- **`milestone`** — 전체 milestone용 브랜치 하나를 만들고 완료 시 병합

milestone 완료 시 GSD는 squash merge(권장) 또는 history를 유지한 merge를 제안합니다.

---

## 보안

### 내장 보안 강화

GSD는 v1.27부터 defense-in-depth 보안을 포함합니다.

- **Path traversal 방지** — 사용자 입력 파일 경로(`--text-file`, `--prd`)는 모두 프로젝트 디렉터리 안으로 해석되는지 검증합니다.
- **Prompt injection 탐지** — 중앙 `security.cjs` 모듈이 사용자 텍스트가 planning artifact로 들어가기 전에 injection 패턴을 검사합니다.
- **PreToolUse prompt guard hook** — `gsd-prompt-guard`가 `.planning/`에 대한 쓰기 작업에서 임베디드 injection vector를 탐지합니다(권고용, 차단용 아님).
- **안전한 JSON 파싱** — 잘못된 `--fields` 인자는 state를 오염시키기 전에 차단됩니다.
- **Shell 인자 검증** — 셸 치환 전에 사용자 텍스트를 정화합니다.
- **CI용 injection scanner** — `prompt-injection-scan.test.cjs`가 모든 agent/workflow/command 파일을 검사합니다.

> [!NOTE]
> GSD는 Markdown 파일을 생성하고, 그것이 LLM system prompt가 되기 때문에, planning artifact로 들어가는 사용자 제어 텍스트는 간접 prompt injection vector가 될 수 있습니다. 이 보호 장치들은 여러 층에서 그런 벡터를 잡도록 설계되었습니다.

### 민감한 파일 보호

GSD의 codebase mapping 및 analysis command는 프로젝트를 이해하기 위해 파일을 읽습니다. **비밀이 들어 있는 파일은 Claude Code deny list에 추가해 보호**하세요.

1. Claude Code 설정(`.claude/settings.json` 또는 global)을 엽니다.
2. 민감한 파일 패턴을 deny list에 추가합니다.

```json
{
  "permissions": {
    "deny": [
      "Read(.env)",
      "Read(.env.*)",
      "Read(**/secrets/*)",
      "Read(**/*credential*)",
      "Read(**/*.pem)",
      "Read(**/*.key)"
    ]
  }
}
```

이렇게 하면 어떤 명령을 실행하더라도 Claude가 해당 파일을 읽지 못합니다.

> [!IMPORTANT]
> GSD에는 비밀 정보 커밋 방지 기능이 내장되어 있지만, defense-in-depth가 여전히 최선의 실천입니다. 민감한 파일은 읽기 접근 자체를 막는 것이 첫 번째 방어선입니다.

---

## 문제 해결

**설치 후 명령이 보이지 않나요?**
- runtime을 다시 시작해 command/skill을 다시 로드하세요.
- 파일이 `~/.claude/commands/gsd/`(global) 또는 `./.claude/commands/gsd/`(local)에 있는지 확인하세요.
- Codex의 경우 `~/.codex/skills/gsd-*/SKILL.md`(global) 또는 `./.codex/skills/gsd-*/SKILL.md`(local)에 skill이 있는지 확인하세요.

**명령이 기대대로 동작하지 않나요?**
- `/gsd:help`로 설치 상태를 확인하세요.
- `npx get-shit-done-ko`를 다시 실행해 재설치하세요.

**최신 버전으로 업데이트하고 싶나요?**
```bash
npx get-shit-done-ko@latest
```

**Docker 또는 컨테이너 환경을 사용하나요?**

`~/.claude/...` 같은 tilde 경로를 읽지 못하면 설치 전에 `CLAUDE_CONFIG_DIR`을 설정하세요.
```bash
CLAUDE_CONFIG_DIR=/home/youruser/.claude npx get-shit-done-ko --global
```
이렇게 하면 컨테이너에서 `~`가 제대로 확장되지 않을 때도 절대 경로가 사용됩니다.

### 제거하기

GSD를 완전히 제거하려면:

```bash
# Global installs
npx get-shit-done-ko --claude --global --uninstall
npx get-shit-done-ko --opencode --global --uninstall
npx get-shit-done-ko --gemini --global --uninstall
npx get-shit-done-ko --codex --global --uninstall
npx get-shit-done-ko --copilot --global --uninstall
npx get-shit-done-ko --cursor --global --uninstall
npx get-shit-done-ko --antigravity --global --uninstall

# Local installs (current project)
npx get-shit-done-ko --claude --local --uninstall
npx get-shit-done-ko --opencode --local --uninstall
npx get-shit-done-ko --codex --local --uninstall
npx get-shit-done-ko --copilot --local --uninstall
npx get-shit-done-ko --cursor --local --uninstall
npx get-shit-done-ko --antigravity --local --uninstall
```

이렇게 하면 다른 설정은 유지한 채 GSD 명령, agent, hook, 설정만 제거됩니다.

---

## 커뮤니티 포트

OpenCode, Gemini CLI, Codex는 이제 `npx get-shit-done-ko`를 통해 기본적으로 지원됩니다.

이 커뮤니티 포트들은 다중 runtime 지원의 초석이었습니다.

| 프로젝트 | 플랫폼 | 설명 |
|---------|----------|-------------|
| [gsd-opencode](https://github.com/rokicool/gsd-opencode) | OpenCode | 초기 OpenCode 적응판 |
| gsd-gemini (archived) | Gemini CLI | uberfuzzy가 만든 초기 Gemini 적응판 |

---

## 라이선스

MIT 라이선스입니다. 자세한 내용은 [LICENSE](LICENSE)를 참고하세요.

---

<div align="center">

**Claude Code는 강력합니다. GSD는 그것을 신뢰할 수 있게 만듭니다.**

</div>
