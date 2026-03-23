---
name: gsd:fast
description: "Execute a trivial task inline — no subagents, no planning overhead"
argument-hint: "[task description]"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Grep
  - Glob
---

<objective>
한국어 우선 안내: 이 명령 문서는 `/gsd:fast` 흐름을 한국어로 먼저 안내합니다. 아래 영문 원문은 upstream 호환성과 세부 의미 보존을 위해 함께 유지합니다.

Execute a trivial task directly in the current context without spawning subagents
or generating PLAN.md files. For tasks too small to justify planning overhead:
typo fixes, config changes, small refactors, forgotten commits, simple additions.

This is NOT a replacement for /gsd:quick — use /gsd:quick for anything that
needs research, multi-step planning, or verification. /gsd:fast is for tasks
you could describe in one sentence and execute in under 2 minutes.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/fast.md
</execution_context>

<process>
한국어 우선 안내: 실제 실행 시에는 아래 워크플로와 참조 경로를 그대로 따르되, 설명 해석은 한국어를 기본으로 사용합니다.

Execute the fast workflow from @~/.claude/get-shit-done/workflows/fast.md end-to-end.
</process>
