<purpose>
한국어 우선 안내: 이 워크플로 자산은 `next` 흐름을 한국어 기준으로 먼저 읽을 수 있게 정리합니다. 아래 영문 원문은 upstream 동기화와 세부 의미 확인을 위해 함께 유지합니다.

한국어 우선 안내: 이 워크플로는 현재 상태를 읽고 다음에 실행할 GSD 단계를 한국어 기준으로 제시합니다. 아래 영문 라우팅 규칙과 명령 리터럴은 그대로 유지합니다.

Detect current project state and automatically advance to the next logical GSD workflow step.
Reads project state to determine: discuss → plan → execute → verify → complete progression.
</purpose>

<required_reading>
Read all files referenced by the invoking prompt's execution_context before starting.
</required_reading>

<process>

<step name="detect_state">
Read project state to determine current position:

```bash
# Get state snapshot
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" state json 2>/dev/null || echo "{}"
```

Also read:
- `.planning/STATE.md` — current phase, progress, plan counts
- `.planning/ROADMAP.md` — milestone structure and phase list

Extract:
- `current_phase` — which phase is active
- `plan_of` / `plans_total` — plan execution progress
- `progress` — overall percentage
- `status` — active, paused, etc.

If no `.planning/` directory exists:
```
GSD 프로젝트를 찾지 못했습니다. 시작하려면 `/gsd:new-project` 를 실행하세요.
```
Exit.
</step>

<step name="determine_next_action">
Apply routing rules based on state:

**Route 1: No phases exist yet → discuss**
If ROADMAP has phases but no phase directories exist on disk:
→ 다음 작업: `/gsd:discuss-phase <first-phase>`

**Route 2: Phase exists but has no CONTEXT.md or RESEARCH.md → discuss**
If the current phase directory exists but has neither CONTEXT.md nor RESEARCH.md:
→ 다음 작업: `/gsd:discuss-phase <current-phase>`

**Route 3: Phase has context but no plans → plan**
If the current phase has CONTEXT.md (or RESEARCH.md) but no PLAN.md files:
→ 다음 작업: `/gsd:plan-phase <current-phase>`

**Route 4: Phase has plans but incomplete summaries → execute**
If plans exist but not all have matching summaries:
→ 다음 작업: `/gsd:execute-phase <current-phase>`

**Route 5: All plans have summaries → verify and complete**
If all plans in the current phase have summaries:
→ 다음 작업: `/gsd:verify-work` 후 `/gsd:complete-phase`

**Route 6: Phase complete, next phase exists → advance**
If the current phase is complete and the next phase exists in ROADMAP:
→ 다음 작업: `/gsd:discuss-phase <next-phase>`

**Route 7: All phases complete → complete milestone**
If all phases are complete:
→ 다음 작업: `/gsd:complete-milestone`

**Route 8: Paused → resume**
If STATE.md shows paused_at:
→ 다음 작업: `/gsd:resume-work`
</step>

<step name="show_and_execute">
Display the determination:

```
## GSD 다음 단계

**현재:** Phase [N] — [name] | [progress]%
**상태:** [status description]

▶ **다음 단계:** `/gsd:[command] [args]`
  [이 단계가 다음 순서인 이유를 한 줄로 설명]
```

Then immediately invoke the determined command via SlashCommand.
Do not ask for confirmation — the whole point of `/gsd:next` is zero-friction advancement.
</step>

</process>

<success_criteria>
- [ ] Project state correctly detected
- [ ] Next action correctly determined from routing rules
- [ ] Command invoked immediately without user confirmation
- [ ] Clear status shown before invoking
</success_criteria>
