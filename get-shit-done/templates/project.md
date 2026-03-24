# PROJECT.md Template

> 한국어 우선 안내: 이 템플릿은 `.planning/PROJECT.md`를 한국어로 빠르게 작성할 수 있게 돕습니다. `## What This Is`, `## Core Value`, `## Requirements` 같은 섹션 이름은 검증기와 프로필 출력이 읽으므로 그대로 유지합니다.

Template for `.planning/PROJECT.md` — the living project context document.

<template>

```markdown
# [Project Name]

## What This Is

[이 프로젝트가 무엇인지 2-3문장으로 적습니다.
누구를 위한 제품인지, 어떤 문제를 해결하는지, 현재 어느 정도까지 구현됐는지 한국어로 분명하게 설명합니다.]

## Core Value

[다른 것이 흔들려도 반드시 지켜야 하는 핵심 가치 한 문장]

## Requirements

### Validated

<!-- 이미 배포되었고 가치가 검증된 요구사항 -->

- ✓ [검증된 요구사항] — [버전/phase]

### Active

<!-- 현재 구현 중이거나 이번 milestone에서 달성할 범위 -->

- [ ] [활성 요구사항 1]
- [ ] [활성 요구사항 2]
- [ ] [활성 요구사항 3]

### Out of Scope

<!-- 지금 만들지 않기로 한 범위와 이유 -->

- [제외 항목 1] — [제외 이유]
- [제외 항목 2] — [제외 이유]

## Context

- [현재 코드베이스 상태]
- [사용자 피드백 또는 운영 맥락]
- [기술 부채나 제약]
- [이미 결정된 전제]

## Constraints

- **[유형]**: [제약 내용] — [이유]
- **[유형]**: [제약 내용] — [이유]

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| [선택] | [이유] | [✓ Good / ⚠️ Revisit / — Pending] |

---
*Last updated: [date] after [갱신 트리거]*
```

</template>

<guidelines>

**What This Is**
- 제품 소개 문장입니다.
- 사용자의 표현을 최대한 보존합니다.
- 제품 방향이 바뀌면 반드시 함께 갱신합니다.

**Core Value**
- 우선순위 충돌 시 최종 판단 기준입니다.
- 짧고 단단한 한 문장으로 적습니다.
- 자주 바꾸지 않습니다.

**Requirements**
- `Validated`: 이미 가치가 증명된 항목
- `Active`: 지금 만들고 있는 범위
- `Out of Scope`: 이번 범위에서 명시적으로 제외한 항목
- 제외 항목에는 반드시 이유를 남겨 scope creep를 막습니다.

**Context**
- 구현 판단에 영향을 주는 현재 맥락을 적습니다.
- 코드 구조, 운영 현실, 사용자 피드백, 기술 부채를 포함합니다.

**Constraints**
- 구현 선택을 제한하는 하드 조건입니다.
- 기술 스택, 일정, 비용, 성능, 보안, 호환성 제약을 씁니다.
- 이유 없는 제약은 나중에 흔들리기 쉬우므로 이유를 함께 적습니다.

**Key Decisions**
- 미래 phase에 영향을 주는 선택만 남깁니다.
- 이유와 현재 평가 상태를 같이 적습니다.

</guidelines>

<evolution>

PROJECT.md는 phase가 진행될수록 같이 자라야 합니다.

**After each phase transition**
1. 더 이상 맞지 않는 Active 요구사항은 `Out of Scope`로 이동합니다.
2. 실제로 검증된 요구사항은 `Validated`로 올립니다.
3. 새 요구사항이 생기면 `Active`에 추가합니다.
4. 중요한 선택이 생기면 `Key Decisions`에 기록합니다.
5. `What This Is` 설명이 현실과 어긋났는지 확인합니다.

**After each milestone**
1. 모든 섹션을 다시 읽고 현재 상태와 맞는지 확인합니다.
2. `Core Value`가 여전히 최우선인지 점검합니다.
3. `Out of Scope`의 이유가 아직도 유효한지 확인합니다.
4. `Context`를 최신 운영/사용자 상황으로 갱신합니다.

</evolution>

<brownfield>

기존 코드베이스에서 시작할 때는 다음 순서를 권장합니다.

1. `/gsd:map-codebase`로 현재 구조를 먼저 파악합니다.
2. 이미 동작 중인 기능을 기준으로 `Validated` 요구사항을 추론합니다.
3. 이번 작업에서 새로 만들 범위를 사용자 목표 기준으로 `Active`에 적습니다.
4. 이번에 하지 않을 범위를 `Out of Scope`에 명확히 적습니다.
5. `Context`에 현재 코드베이스 특성과 운영 제약을 같이 남깁니다.

</brownfield>

<state_reference>

STATE.md는 PROJECT.md를 이렇게 참조합니다.

```markdown
## Project Reference

See: .planning/PROJECT.md (updated [date])

**Core value:** [Core Value 한 줄]
**Current focus:** [현재 집중 중인 phase]
```

</state_reference>
