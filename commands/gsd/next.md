---
name: gsd:next
description: "한국어 우선 안내 — Automatically advance to the next logical step in the GSD workflow"
allowed-tools:
  - Read
  - Bash
  - Grep
  - Glob
  - SlashCommand
---
<objective>
한국어 우선 안내: 이 명령 문서는 `/gsd:next` 흐름을 한국어로 먼저 안내합니다. 아래 영문 원문은 upstream 호환성과 세부 의미 보존을 위해 함께 유지합니다.

Detect the current project state and automatically invoke the next logical GSD workflow step.
No arguments needed — reads STATE.md, ROADMAP.md, and phase directories to determine what comes next.

Designed for rapid multi-project workflows where remembering which phase/step you're on is overhead.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/next.md
</execution_context>

<process>
한국어 우선 안내: 실제 실행 시에는 아래 워크플로와 참조 경로를 그대로 따르되, 설명 해석은 한국어를 기본으로 사용합니다.

Execute the next workflow from @~/.claude/get-shit-done/workflows/next.md end-to-end.
</process>
