---
name: gsd:insert-phase
description: "한국어 우선 안내 — Insert urgent work as decimal phase (e.g., 72.1) between existing phases"
argument-hint: <after> <description>
allowed-tools:
  - Read
  - Write
  - Bash
---

<objective>
한국어 우선 안내: 이 명령 문서는 `/gsd:insert-phase` 흐름을 한국어로 먼저 안내합니다. 아래 영문 원문은 upstream 호환성과 세부 의미 보존을 위해 함께 유지합니다.

Insert a decimal phase for urgent work discovered mid-milestone that must be completed between existing integer phases.

Uses decimal numbering (72.1, 72.2, etc.) to preserve the logical sequence of planned phases while accommodating urgent insertions.

Purpose: Handle urgent work discovered during execution without renumbering entire roadmap.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/insert-phase.md
</execution_context>

<context>
한국어 우선 안내: 인자, flags, 경로, 식별자, 플레이스홀더는 그대로 유지하고 설명만 한국어 우선으로 읽으면 됩니다.

Arguments: $ARGUMENTS (format: <after-phase-number> <description>)

Roadmap and state are resolved in-workflow via `init phase-op` and targeted tool calls.
</context>

<process>
한국어 우선 안내: 실제 실행 시에는 아래 워크플로와 참조 경로를 그대로 따르되, 설명 해석은 한국어를 기본으로 사용합니다.

Execute the insert-phase workflow from @~/.claude/get-shit-done/workflows/insert-phase.md end-to-end.
Preserve all validation gates (argument parsing, phase verification, decimal calculation, roadmap updates).
</process>
