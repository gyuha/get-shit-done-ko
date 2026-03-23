---
name: gsd:manager
description: "한국어 우선 안내 — Interactive command center for managing multiple phases from one terminal"
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - Grep
  - AskUserQuestion
  - Task
---
<objective>
한국어 우선 안내: 이 명령 문서는 `/gsd:manager` 흐름을 한국어로 먼저 안내합니다. 아래 영문 원문은 upstream 호환성과 세부 의미 보존을 위해 함께 유지합니다.

Single-terminal command center for managing a milestone. Shows a dashboard of all phases with visual status indicators, recommends optimal next actions, and dispatches work — discuss runs inline, plan/execute run as background agents.

Designed for power users who want to parallelize work across phases from one terminal: discuss a phase while another plans or executes in the background.

**Creates/Updates:**
- No files created directly — dispatches to existing GSD commands via Skill() and background Task agents.
- Reads `.planning/STATE.md`, `.planning/ROADMAP.md`, phase directories for status.

**After:** User exits when done managing, or all phases complete and milestone lifecycle is suggested.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/manager.md
@~/.claude/get-shit-done/references/ui-brand.md
</execution_context>

<context>
한국어 우선 안내: 인자, flags, 경로, 식별자, 플레이스홀더는 그대로 유지하고 설명만 한국어 우선으로 읽으면 됩니다.

No arguments required. Requires an active milestone with ROADMAP.md and STATE.md.

Project context, phase list, dependencies, and recommendations are resolved inside the workflow using `gsd-tools.cjs init manager`. No upfront context loading needed.
</context>

<process>
한국어 우선 안내: 실제 실행 시에는 아래 워크플로와 참조 경로를 그대로 따르되, 설명 해석은 한국어를 기본으로 사용합니다.

Execute the manager workflow from @~/.claude/get-shit-done/workflows/manager.md end-to-end.
Maintain the dashboard refresh loop until the user exits or all phases complete.
</process>
