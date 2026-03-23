---
name: gsd:list-workspaces
description: "한국어 우선 안내 — List active GSD workspaces and their status"
allowed-tools:
  - Bash
  - Read
---
<objective>
한국어 우선 안내: 이 명령 문서는 `/gsd:list-workspaces` 흐름을 한국어로 먼저 안내합니다. 아래 영문 원문은 upstream 호환성과 세부 의미 보존을 위해 함께 유지합니다.

Scan `~/gsd-workspaces/` for workspace directories containing `WORKSPACE.md` manifests. Display a summary table with name, path, repo count, strategy, and GSD project status.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/list-workspaces.md
@~/.claude/get-shit-done/references/ui-brand.md
</execution_context>

<process>
한국어 우선 안내: 실제 실행 시에는 아래 워크플로와 참조 경로를 그대로 따르되, 설명 해석은 한국어를 기본으로 사용합니다.

Execute the list-workspaces workflow from @~/.claude/get-shit-done/workflows/list-workspaces.md end-to-end.
</process>
