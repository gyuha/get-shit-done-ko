---
name: gsd:quick
description: "한국어 우선 안내 — Execute a quick task with GSD guarantees (atomic commits, state tracking) but skip optional agents"
argument-hint: "[--full] [--discuss] [--research]"
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
  - Task
  - AskUserQuestion
---
<objective>
한국어 우선 안내: 이 명령 문서는 `/gsd:quick` 흐름을 한국어로 먼저 안내합니다. 아래 영문 원문은 upstream 호환성과 세부 의미 보존을 위해 함께 유지합니다.

Execute small, ad-hoc tasks with GSD guarantees (atomic commits, STATE.md tracking).

Quick mode is the same system with a shorter path:
- Spawns gsd-planner (quick mode) + gsd-executor(s)
- Quick tasks live in `.planning/quick/` separate from planned phases
- Updates STATE.md "Quick Tasks Completed" table (NOT ROADMAP.md)

**Default:** Skips research, discussion, plan-checker, verifier. Use when you know exactly what to do.

**`--discuss` flag:** Lightweight discussion phase before planning. Surfaces assumptions, clarifies gray areas, captures decisions in CONTEXT.md. Use when the task has ambiguity worth resolving upfront.

**`--full` flag:** Enables plan-checking (max 2 iterations) and post-execution verification. Use when you want quality guarantees without full milestone ceremony.

**`--research` flag:** Spawns a focused research agent before planning. Investigates implementation approaches, library options, and pitfalls for the task. Use when you're unsure of the best approach.

Flags are composable: `--discuss --research --full` gives discussion + research + plan-checking + verification.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/quick.md
</execution_context>

<context>
한국어 우선 안내: 인자, flags, 경로, 식별자, 플레이스홀더는 그대로 유지하고 설명만 한국어 우선으로 읽으면 됩니다.

$ARGUMENTS

Context files are resolved inside the workflow (`init quick`) and delegated via `<files_to_read>` blocks.
</context>

<process>
한국어 우선 안내: 실제 실행 시에는 아래 워크플로와 참조 경로를 그대로 따르되, 설명 해석은 한국어를 기본으로 사용합니다.

Execute the quick workflow from @~/.claude/get-shit-done/workflows/quick.md end-to-end.
Preserve all workflow gates (validation, task description, planning, execution, state updates, commits).
</process>
