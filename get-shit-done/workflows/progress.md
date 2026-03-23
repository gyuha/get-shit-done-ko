<purpose>
한국어 우선 안내: 이 워크플로는 현재 프로젝트의 진행 상황과 다음 행동을 한국어 기준으로 설명합니다. 아래 영문 규칙과 명령 리터럴은 그대로 유지합니다.

Check project progress, summarize recent work and what's ahead, then intelligently route to the next action — either executing an existing plan or creating the next one. Provides situational awareness before continuing work.
</purpose>

<required_reading>
Read all files referenced by the invoking prompt's execution_context before starting.
</required_reading>

<process>

<step name="init_context">
**Load progress context (paths only):**

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init progress)
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

Extract from init JSON: `project_exists`, `roadmap_exists`, `state_exists`, `phases`, `current_phase`, `next_phase`, `milestone_version`, `completed_count`, `phase_count`, `paused_at`, `state_path`, `roadmap_path`, `project_path`, `config_path`.

```bash
DISCUSS_MODE=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" config-get workflow.discuss_mode 2>/dev/null || echo "discuss")
```

If `project_exists` is false (no `.planning/` directory):

```
planning 구조를 찾지 못했습니다.

새 프로젝트를 시작하려면 /gsd:new-project 를 실행하세요.
```

Exit.

If missing STATE.md: suggest `/gsd:new-project`.

**If ROADMAP.md missing but PROJECT.md exists:**

This means a milestone was completed and archived. Go to **Route F** (between milestones).

If missing both ROADMAP.md and PROJECT.md: suggest `/gsd:new-project`.
</step>

<step name="load">
**Use structured extraction from gsd-tools:**

Instead of reading full files, use targeted tools to get only the data needed for the report:
- `ROADMAP=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" roadmap analyze)`
- `STATE=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" state-snapshot)`

This minimizes orchestrator context usage.
</step>

<step name="analyze_roadmap">
**Get comprehensive roadmap analysis (replaces manual parsing):**

```bash
ROADMAP=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" roadmap analyze)
```

This returns structured JSON with:
- All phases with disk status (complete/partial/planned/empty/no_directory)
- Goal and dependencies per phase
- Plan and summary counts per phase
- Aggregated stats: total plans, summaries, progress percent
- Current and next phase identification

Use this instead of manually reading/parsing ROADMAP.md.
</step>

<step name="recent">
**Gather recent work context:**

- Find the 2-3 most recent SUMMARY.md files
- Use `summary-extract` for efficient parsing:
  ```bash
  node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" summary-extract <path> --fields one_liner
  ```
- This shows "what we've been working on"
  </step>

<step name="position">
**Parse current position from init context and roadmap analysis:**

- Use `current_phase` and `next_phase` from `$ROADMAP`
- Note `paused_at` if work was paused (from `$STATE`)
- Count pending todos: use `init todos` or `list-todos`
- Check for active debug sessions: `ls .planning/debug/*.md 2>/dev/null | grep -v resolved | wc -l`
  </step>

<step name="report">
**Generate progress bar from gsd-tools, then present rich status report:**

```bash
# Get formatted progress bar
PROGRESS_BAR=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" progress bar --raw)
```

Present:

```
# [프로젝트 이름]

**Progress:** {PROGRESS_BAR}
**Profile:** [quality/balanced/budget/inherit]
**Discuss mode:** {DISCUSS_MODE}

## 최근 작업
- [Phase X, Plan Y]: [what was accomplished - 1 line from summary-extract]
- [Phase X, Plan Z]: [what was accomplished - 1 line from summary-extract]

## 현재 위치
Phase [N] of [total]: [phase-name]
Plan [M] of [phase-total]: [status]
CONTEXT: [✓ if has_context | - if not]

## 주요 결정 사항
- [extract from $STATE.decisions[]]
- [e.g. jq -r '.decisions[].decision' from state-snapshot]

## 막힘 요소 / 우려 사항
- [extract from $STATE.blockers[]]
- [e.g. jq -r '.blockers[].text' from state-snapshot]

## 남아 있는 Todo
- [count] pending — /gsd:check-todos to review

## 진행 중인 디버그 세션
- [count] active — /gsd:debug to continue
(Only show this section if count > 0)

## 다음 단계
[Next phase/plan objective from roadmap analyze]
```

</step>

<step name="route">
**Determine next action based on verified counts.**

**Step 1: Count plans, summaries, and issues in current phase**

List files in the current phase directory:

```bash
ls -1 .planning/phases/[current-phase-dir]/*-PLAN.md 2>/dev/null | wc -l
ls -1 .planning/phases/[current-phase-dir]/*-SUMMARY.md 2>/dev/null | wc -l
ls -1 .planning/phases/[current-phase-dir]/*-UAT.md 2>/dev/null | wc -l
```

State: "This phase has {X} plans, {Y} summaries."

**Step 1.5: Check for unaddressed UAT gaps**

Check for UAT.md files with status "diagnosed" (has gaps needing fixes).

```bash
# Check for diagnosed UAT with gaps or partial (incomplete) testing
grep -l "status: diagnosed\|status: partial" .planning/phases/[current-phase-dir]/*-UAT.md 2>/dev/null
```

Track:
- `uat_with_gaps`: UAT.md files with status "diagnosed" (gaps need fixing)
- `uat_partial`: UAT.md files with status "partial" (incomplete testing)

**Step 1.6: Cross-phase health check**

Scan ALL phases in the current milestone for outstanding verification debt using the CLI (which respects milestone boundaries via `getMilestonePhaseFilter`):

```bash
DEBT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" audit-uat --raw 2>/dev/null)
```

Parse JSON for `summary.total_items` and `summary.total_files`.

Track: `outstanding_debt` — `summary.total_items` from the audit.

**If outstanding_debt > 0:** Add a warning section to the progress report output (in the `report` step), placed between "## What's Next" and the route suggestion:

```markdown
## 검증 부채 ({N} files across prior phases)

| Phase | File | Issue |
|-------|------|-------|
| {phase} | {filename} | {pending_count} pending, {skipped_count} skipped, {blocked_count} blocked |
| {phase} | {filename} | human_needed — {count} items |

검토: `/gsd:audit-uat ${GSD_WS}` — 전체 phase 범위 감사
테스트 재개: `/gsd:verify-work {phase} ${GSD_WS}` — 특정 phase 재검증
```

This is a WARNING, not a blocker — routing proceeds normally. The debt is visible so the user can make an informed choice.

**Step 2: Route based on counts**

| Condition | Meaning | Action |
|-----------|---------|--------|
| uat_partial > 0 | UAT testing incomplete | Go to **Route E.2** |
| uat_with_gaps > 0 | UAT gaps need fix plans | Go to **Route E** |
| summaries < plans | Unexecuted plans exist | Go to **Route A** |
| summaries = plans AND plans > 0 | Phase complete | Go to Step 3 |
| plans = 0 | Phase not yet planned | Go to **Route B** |

---

**Route A: Unexecuted plan exists**

Find the first PLAN.md without matching SUMMARY.md.
Read its `<objective>` section.

```
---

## ▶ 다음 작업

**{phase}-{plan}: [Plan Name]** — [objective summary from PLAN.md]

`/gsd:execute-phase {phase} ${GSD_WS}`

<sub>`/clear` 를 먼저 실행해 새 컨텍스트 창에서 진행</sub>

---
```

---

**Route B: Phase needs planning**

Check if `{phase_num}-CONTEXT.md` exists in phase directory.

Check if current phase has UI indicators:

```bash
PHASE_SECTION=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" roadmap get-phase "${CURRENT_PHASE}" 2>/dev/null)
PHASE_HAS_UI=$(echo "$PHASE_SECTION" | grep -qi "UI hint.*yes" && echo "true" || echo "false")
```

**If CONTEXT.md exists:**

```
---

## ▶ 다음 작업

**Phase {N}: {Name}** — {Goal from ROADMAP.md}
<sub>✓ Context gathered, ready to plan</sub>

`/gsd:plan-phase {phase-number} ${GSD_WS}`

<sub>`/clear` 를 먼저 실행해 새 컨텍스트 창에서 진행</sub>

---
```

**If CONTEXT.md does NOT exist AND phase has UI (`PHASE_HAS_UI` is `true`):**

```
---

## ▶ 다음 작업

**Phase {N}: {Name}** — {Goal from ROADMAP.md}

`/gsd:discuss-phase {phase}` — 컨텍스트를 모으고 접근 방식을 정리

<sub>`/clear` 를 먼저 실행해 새 컨텍스트 창에서 진행</sub>

---

**함께 사용할 수 있음:**
- `/gsd:ui-phase {phase}` — UI 설계 계약 생성 (프런트엔드 phase에 권장)
- `/gsd:plan-phase {phase}` — discussion 없이 바로 계획
- `/gsd:list-phase-assumptions {phase}` — Claude의 가정 확인

---
```

**If CONTEXT.md does NOT exist AND phase has no UI:**

```
---

## ▶ 다음 작업

**Phase {N}: {Name}** — {Goal from ROADMAP.md}

`/gsd:discuss-phase {phase} ${GSD_WS}` — 컨텍스트를 모으고 접근 방식을 정리

<sub>`/clear` 를 먼저 실행해 새 컨텍스트 창에서 진행</sub>

---

**함께 사용할 수 있음:**
- `/gsd:plan-phase {phase} ${GSD_WS}` — discussion 없이 바로 계획
- `/gsd:list-phase-assumptions {phase} ${GSD_WS}` — Claude의 가정 확인

---
```

---

**Route E: UAT gaps need fix plans**

UAT.md exists with gaps (diagnosed issues). User needs to plan fixes.

```
---

## ⚠ UAT 간극 발견

**{phase_num}-UAT.md** 에 수정이 필요한 간극 {N}개가 있습니다.

`/gsd:plan-phase {phase} --gaps ${GSD_WS}`

<sub>`/clear` 를 먼저 실행해 새 컨텍스트 창에서 진행</sub>

---

**함께 사용할 수 있음:**
- `/gsd:execute-phase {phase} ${GSD_WS}` — phase 계획 실행
- `/gsd:verify-work {phase} ${GSD_WS}` — UAT 테스트 계속 진행

---
```

---

**Route E.2: UAT testing incomplete (partial)**

UAT.md exists with `status: partial` — testing session ended before all items resolved.

```
---

## 미완료 UAT 테스트

**{phase_num}-UAT.md** 에 아직 해결되지 않은 테스트 {N}개가 있습니다 (pending, blocked, skipped).

`/gsd:verify-work {phase} ${GSD_WS}` — 중단한 지점부터 테스트 재개

<sub>`/clear` 를 먼저 실행해 새 컨텍스트 창에서 진행</sub>

---

**함께 사용할 수 있음:**
- `/gsd:audit-uat ${GSD_WS}` — 전체 phase UAT 감사
- `/gsd:execute-phase {phase} ${GSD_WS}` — phase 계획 실행

---
```

---

**Step 3: Check milestone status (only when phase complete)**

Read ROADMAP.md and identify:
1. Current phase number
2. All phase numbers in the current milestone section

Count total phases and identify the highest phase number.

State: "Current phase is {X}. Milestone has {N} phases (highest: {Y})."

**Route based on milestone status:**

| Condition | Meaning | Action |
|-----------|---------|--------|
| current phase < highest phase | More phases remain | Go to **Route C** |
| current phase = highest phase | Milestone complete | Go to **Route D** |

---

**Route C: Phase complete, more phases remain**

Read ROADMAP.md to get the next phase's name and goal.

Check if next phase has UI indicators:

```bash
NEXT_PHASE_SECTION=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" roadmap get-phase "$((Z+1))" 2>/dev/null)
NEXT_HAS_UI=$(echo "$NEXT_PHASE_SECTION" | grep -qi "UI hint.*yes" && echo "true" || echo "false")
```

**If next phase has UI (`NEXT_HAS_UI` is `true`):**

```
---

## ✓ Phase {Z} 완료

## ▶ 다음 작업

**Phase {Z+1}: {Name}** — {Goal from ROADMAP.md}

`/gsd:discuss-phase {Z+1}` — 컨텍스트를 모으고 접근 방식을 정리

<sub>`/clear` 를 먼저 실행해 새 컨텍스트 창에서 진행</sub>

---

**함께 사용할 수 있음:**
- `/gsd:ui-phase {Z+1}` — UI 설계 계약 생성 (프런트엔드 phase에 권장)
- `/gsd:plan-phase {Z+1}` — discussion 없이 바로 계획
- `/gsd:verify-work {Z}` — 계속 진행하기 전 사용자 승인 테스트

---
```

**If next phase has no UI:**

```
---

## ✓ Phase {Z} 완료

## ▶ 다음 작업

**Phase {Z+1}: {Name}** — {Goal from ROADMAP.md}

`/gsd:discuss-phase {Z+1} ${GSD_WS}` — 컨텍스트를 모으고 접근 방식을 정리

<sub>`/clear` 를 먼저 실행해 새 컨텍스트 창에서 진행</sub>

---

**함께 사용할 수 있음:**
- `/gsd:plan-phase {Z+1} ${GSD_WS}` — discussion 없이 바로 계획
- `/gsd:verify-work {Z} ${GSD_WS}` — 계속 진행하기 전 사용자 승인 테스트

---
```

---

**Route D: Milestone complete**

```
---

## 🎉 마일스톤 완료

모든 {N}개 phase가 완료되었습니다.

## ▶ 다음 작업

**마일스톤 마무리** — 보관하고 다음 사이클 준비

`/gsd:complete-milestone ${GSD_WS}`

<sub>`/clear` 를 먼저 실행해 새 컨텍스트 창에서 진행</sub>

---

**함께 사용할 수 있음:**
- `/gsd:verify-work ${GSD_WS}` — 마일스톤 마무리 전 사용자 승인 테스트

---
```

---

**Route F: Between milestones (ROADMAP.md missing, PROJECT.md exists)**

A milestone was completed and archived. Ready to start the next milestone cycle.

Read MILESTONES.md to find the last completed milestone version.

```
---

## ✓ 마일스톤 v{X.Y} 완료

다음 마일스톤을 계획할 준비가 되었습니다.

## ▶ 다음 작업

**다음 마일스톤 시작** — questioning → research → requirements → roadmap

`/gsd:new-milestone ${GSD_WS}`

<sub>`/clear` 를 먼저 실행해 새 컨텍스트 창에서 진행</sub>

---
```

</step>

<step name="edge_cases">
**Handle edge cases:**

- Phase complete but next phase not planned → offer `/gsd:plan-phase [next] ${GSD_WS}`
- All work complete → offer milestone completion
- Blockers present → highlight before offering to continue
- Handoff file exists → mention it, offer `/gsd:resume-work ${GSD_WS}`
  </step>

</process>

<success_criteria>

- [ ] Rich context provided (recent work, decisions, issues)
- [ ] Current position clear with visual progress
- [ ] What's next clearly explained
- [ ] Smart routing: /gsd:execute-phase if plans exist, /gsd:plan-phase if not
- [ ] User confirms before any action
- [ ] Seamless handoff to appropriate gsd command
      </success_criteria>
