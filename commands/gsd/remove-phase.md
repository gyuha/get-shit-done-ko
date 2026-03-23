---
name: gsd:remove-phase
description: "한국어 우선 안내 — Remove a future phase from roadmap and renumber subsequent phases"
argument-hint: <phase-number>
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
---
<objective>
한국어 우선 안내: 이 명령 문서는 `/gsd:remove-phase` 흐름을 한국어로 먼저 안내합니다. 아래 영문 원문은 upstream 호환성과 세부 의미 보존을 위해 함께 유지합니다.

Remove an unstarted future phase from the roadmap and renumber all subsequent phases to maintain a clean, linear sequence.

Purpose: Clean removal of work you've decided not to do, without polluting context with cancelled/deferred markers.
Output: Phase deleted, all subsequent phases renumbered, git commit as historical record.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/remove-phase.md
</execution_context>

<context>
한국어 우선 안내: 인자, flags, 경로, 식별자, 플레이스홀더는 그대로 유지하고 설명만 한국어 우선으로 읽으면 됩니다.

Phase: $ARGUMENTS

Roadmap and state are resolved in-workflow via `init phase-op` and targeted reads.
</context>

<process>
한국어 우선 안내: 실제 실행 시에는 아래 워크플로와 참조 경로를 그대로 따르되, 설명 해석은 한국어를 기본으로 사용합니다.

Execute the remove-phase workflow from @~/.claude/get-shit-done/workflows/remove-phase.md end-to-end.
Preserve all validation gates (future phase check, work check), renumbering logic, and commit.
</process>
