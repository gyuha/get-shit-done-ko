# State Template

> 한국어 우선 안내: 이 템플릿은 `.planning/STATE.md`를 한국어로 읽기 쉽게 정리합니다. `# Project State`, `## Project Reference`, `## Current Position`, `**Current focus:**` 같은 라벨은 상태 갱신 로직이 읽으므로 유지합니다.

Template for `.planning/STATE.md` — the project's living memory.

---

## File Template

```markdown
# Project State

## Project Reference

See: .planning/PROJECT.md (updated [date])

**Core value:** [PROJECT.md의 Core Value 한 줄]
**Current focus:** [현재 집중 중인 phase 이름]

## Current Position

Phase: [X] of [Y] ([Phase name])
Plan: [A] of [B] in current phase
Status: [Ready to plan / Planning / Ready to execute / In progress / Phase complete]
Last activity: [YYYY-MM-DD] — [가장 최근에 한 일]

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**
- Total plans completed: [N]
- Average duration: [X] min
- Total execution time: [X.X] hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**
- Last 5 plans: [durations]
- Trend: [Improving / Stable / Degrading]

## Accumulated Context

### Decisions

- [Phase X]: [최근 결정 요약]
- [Phase Y]: [최근 결정 요약]

### Pending Todos

아직 없음.

### Blockers/Concerns

아직 없음.

## Session Continuity

Last session: [YYYY-MM-DD HH:MM]
Stopped at: [마지막으로 끝낸 일]
Resume file: [없으면 None]
```

<purpose>

STATE.md는 세션이 바뀌어도 프로젝트가 어디까지 왔는지 즉시 알게 해 주는 짧은 요약 파일입니다.

- 먼저 읽는 파일이어야 합니다.
- 너무 길어지면 안 됩니다.
- 지금 어디에 있고, 다음에 무엇을 해야 하는지 바로 보여줘야 합니다.

</purpose>

<lifecycle>

**Creation**
- ROADMAP.md 생성 직후 만듭니다.
- PROJECT.md를 참조하도록 연결합니다.
- 초기 상태는 `Phase 1 ready to plan` 정도로 시작합니다.

**Reading**
- progress: 현재 상태 보고
- plan: 다음 계획 판단
- execute: 현재 위치 파악
- transition: 완료 후 상태 전환 반영

**Writing**
- plan/execute가 끝날 때마다 최근 활동을 갱신합니다.
- 해결된 blocker는 지우고, 새 blocker는 추가합니다.
- PROJECT.md의 핵심 결정과 현재 focus를 함께 맞춥니다.

</lifecycle>

<sections>

### Project Reference
- PROJECT.md를 다시 읽어야 할지 판단하는 출발점입니다.
- Core value와 Current focus를 한 번에 보여 줍니다.

### Current Position
- 지금 어느 phase/plan에 있는지 적습니다.
- 최근 활동과 진행률을 함께 보여 줍니다.

### Performance Metrics
- plan 완료 속도와 최근 추세를 가볍게 추적합니다.
- 정밀한 PM 통계보다 흐름 파악용입니다.

### Accumulated Context
- 최근 결정, 남은 todo, 다음 작업에 영향을 주는 blocker를 짧게 요약합니다.

### Session Continuity
- 마지막 세션 종료 지점과 재개 파일을 남깁니다.

</sections>

<size_constraint>

STATE.md는 100줄 안팎으로 유지하는 것이 좋습니다.

- 너무 길어지면 최근 결정 3-5개만 남깁니다.
- 해결된 blocker와 오래된 잡음은 제거합니다.
- 목표는 "한 번 읽고 지금 상태를 안다"입니다.

</size_constraint>
