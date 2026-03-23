---
name: gsd:remove-workspace
description: "Remove a GSD workspace and clean up worktrees"
argument-hint: "<workspace-name>"
allowed-tools:
  - Bash
  - Read
  - AskUserQuestion
---
<context>
한국어 우선 안내: 인자, flags, 경로, 식별자, 플레이스홀더는 그대로 유지하고 설명만 한국어 우선으로 읽으면 됩니다.

**Arguments:**
- `<workspace-name>` (required) — Name of the workspace to remove
</context>

<objective>
한국어 우선 안내: 이 명령 문서는 `/gsd:remove-workspace` 흐름을 한국어로 먼저 안내합니다. 아래 영문 원문은 upstream 호환성과 세부 의미 보존을 위해 함께 유지합니다.

Remove a workspace directory after confirmation. For worktree strategy, runs `git worktree remove` for each member repo first. Refuses if any repo has uncommitted changes.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/remove-workspace.md
@~/.claude/get-shit-done/references/ui-brand.md
</execution_context>

<process>
한국어 우선 안내: 실제 실행 시에는 아래 워크플로와 참조 경로를 그대로 따르되, 설명 해석은 한국어를 기본으로 사용합니다.

Execute the remove-workspace workflow from @~/.claude/get-shit-done/workflows/remove-workspace.md end-to-end.
</process>
