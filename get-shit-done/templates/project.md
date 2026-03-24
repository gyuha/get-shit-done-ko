# PROJECT.md Template

> 한국어 우선 안내: 이 템플릿은 `project` 자산을 한국어 기준으로 먼저 읽을 수 있게 정리합니다. 아래 영문 원문은 upstream 동기화와 세부 의미 보존을 위해 함께 유지합니다.


Template for `.planning/PROJECT.md` — the living project context document.

<template>

```markdown
# [Project Name]

## What This Is

[현재 프로젝트를 정확히 설명하는 2-3문장. 이 제품이 무엇을 하고 누구를 위한 것인지 적습니다.
사용자가 쓴 표현과 맥락을 최대한 유지하고, 실제 상태가 바뀌면 함께 업데이트합니다.]

## Core Value

[가장 중요한 단 하나의 가치. 다른 것이 흔들려도 이것만큼은 반드시 지켜야 합니다.
우선순위 충돌이 생길 때 판단 기준이 되는 한 문장으로 적습니다.]

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

(아직 없음 — 먼저 ship해서 검증)

### Active

<!-- Current scope. Building toward these. -->

- [ ] [요구사항 1]
- [ ] [요구사항 2]
- [ ] [요구사항 3]

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- [제외 범위 1] — [이유]
- [제외 범위 2] — [이유]

## Context

[구현 판단에 영향을 주는 배경 정보:
- 기술 환경 또는 생태계
- 관련 선행 작업 또는 경험
- 사용자 조사/피드백 패턴
- 해결해야 할 알려진 이슈]

## Constraints

- **[유형]**: [무엇] — [이유]
- **[유형]**: [무엇] — [이유]

Common types: Tech stack, Timeline, Budget, Dependencies, Compatibility, Performance, Security

## Key Decisions

<!-- Decisions that constrain future work. Add throughout project lifecycle. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| [선택] | [이유] | [✓ Good / ⚠️ Revisit / — Pending] |

---
*Last updated: [date] after [갱신 트리거]*
```

</template>

<guidelines>

**What This Is:**
- Current accurate description of the product
- 2-3 sentences capturing what it does and who it's for
- Use the user's words and framing
- Update when the product evolves beyond this description

**Core Value:**
- The single most important thing
- Everything else can fail; this cannot
- Drives prioritization when tradeoffs arise
- Rarely changes; if it does, it's a significant pivot

**Requirements — Validated:**
- Requirements that shipped and proved valuable
- Format: `- ✓ [Requirement] — [version/phase]`
- These are locked — changing them requires explicit discussion

**Requirements — Active:**
- Current scope being built toward
- These are hypotheses until shipped and validated
- Move to Validated when shipped, Out of Scope if invalidated

**Requirements — Out of Scope:**
- Explicit boundaries on what we're not building
- Always include reasoning (prevents re-adding later)
- Includes: considered and rejected, deferred to future, explicitly excluded

**Context:**
- Background that informs implementation decisions
- Technical environment, prior work, user feedback
- Known issues or technical debt to address
- Update as new context emerges

**Constraints:**
- Hard limits on implementation choices
- Tech stack, timeline, budget, compatibility, dependencies
- Include the "why" — constraints without rationale get questioned

**Key Decisions:**
- Significant choices that affect future work
- Add decisions as they're made throughout the project
- Track outcome when known:
  - ✓ Good — decision proved correct
  - ⚠️ Revisit — decision may need reconsideration
  - — Pending — too early to evaluate

**Last Updated:**
- Always note when and why the document was updated
- Format: `after Phase 2` or `after v1.0 milestone`
- Triggers review of whether content is still accurate

</guidelines>

<evolution>

PROJECT.md evolves throughout the project lifecycle.
These rules are embedded in the generated PROJECT.md (## Evolution section)
and implemented by workflows/transition.md and workflows/complete-milestone.md.

**After each phase transition:**
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone:**
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state (users, feedback, metrics)

</evolution>

<brownfield>

For existing codebases:

1. **Map codebase first** via `/gsd:map-codebase`

2. **Infer Validated requirements** from existing code:
   - What does the codebase actually do?
   - What patterns are established?
   - What's clearly working and relied upon?

3. **Gather Active requirements** from user:
   - Present inferred current state
   - Ask what they want to build next

4. **Initialize:**
   - Validated = inferred from existing code
   - Active = user's goals for this work
   - Out of Scope = boundaries user specifies
   - Context = includes current codebase state

</brownfield>

<state_reference>

STATE.md references PROJECT.md:

```markdown
## Project Reference

See: .planning/PROJECT.md (updated [date])

**Core value:** [One-liner from Core Value section]
**Current focus:** [Current phase name]
```

This ensures Claude reads current PROJECT.md context.

</state_reference>
