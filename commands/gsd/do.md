---
name: gsd:do
description: "한국어 우선 안내 — Route freeform text to the right GSD command automatically"
argument-hint: "<description of what you want to do>"
allowed-tools:
  - Read
  - Bash
  - AskUserQuestion
---
<objective>
한국어 우선 안내: 이 명령 문서는 `/gsd:do` 흐름을 한국어로 먼저 안내합니다. 아래 영문 원문은 upstream 호환성과 세부 의미 보존을 위해 함께 유지합니다.

Analyze freeform natural language input and dispatch to the most appropriate GSD command.

Acts as a smart dispatcher — never does the work itself. Matches intent to the best GSD command using routing rules, confirms the match, then hands off.

Use when you know what you want but don't know which `/gsd:*` command to run.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/do.md
@~/.claude/get-shit-done/references/ui-brand.md
</execution_context>

<context>
한국어 우선 안내: 인자, flags, 경로, 식별자, 플레이스홀더는 그대로 유지하고 설명만 한국어 우선으로 읽으면 됩니다.

$ARGUMENTS
</context>

<process>
한국어 우선 안내: 실제 실행 시에는 아래 워크플로와 참조 경로를 그대로 따르되, 설명 해석은 한국어를 기본으로 사용합니다.

Execute the do workflow from @~/.claude/get-shit-done/workflows/do.md end-to-end.
Route user intent to the best GSD command and invoke it.
</process>
