---
name: gsd:discuss-phase
description: "한국어 우선 안내 — Gather phase context through adaptive questioning before planning. Use --auto to skip interactive questions (Claude picks recommended defaults)."
argument-hint: "<phase> [--auto] [--batch] [--analyze] [--text]"
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - Grep
  - AskUserQuestion
  - Task
  - mcp__context7__resolve-library-id
  - mcp__context7__query-docs
---

<objective>
한국어 우선 안내: 이 명령 문서는 `/gsd:discuss-phase` 흐름을 한국어로 먼저 안내합니다. 아래 영문 원문은 upstream 호환성과 세부 의미 보존을 위해 함께 유지합니다.

Extract implementation decisions that downstream agents need — researcher and planner will use CONTEXT.md to know what to investigate and what choices are locked.

**How it works:**
1. Load prior context (PROJECT.md, REQUIREMENTS.md, STATE.md, prior CONTEXT.md files)
2. Scout codebase for reusable assets and patterns
3. Analyze phase — skip gray areas already decided in prior phases
4. Present remaining gray areas — user selects which to discuss
5. Deep-dive each selected area until satisfied
6. Create CONTEXT.md with decisions that guide research and planning

**Output:** `{phase_num}-CONTEXT.md` — decisions clear enough that downstream agents can act without asking the user again
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/discuss-phase.md
@~/.claude/get-shit-done/workflows/discuss-phase-assumptions.md
@~/.claude/get-shit-done/templates/context.md
</execution_context>

<context>
한국어 우선 안내: 인자, flags, 경로, 식별자, 플레이스홀더는 그대로 유지하고 설명만 한국어 우선으로 읽으면 됩니다.

Phase number: $ARGUMENTS (required)

Context files are resolved in-workflow using `init phase-op` and roadmap/state tool calls.
</context>

<process>
한국어 우선 안내: 실제 실행 시에는 아래 워크플로와 참조 경로를 그대로 따르되, 설명 해석은 한국어를 기본으로 사용합니다.

**Mode routing:**
```bash
DISCUSS_MODE=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" config-get workflow.discuss_mode 2>/dev/null || echo "discuss")
```

If `DISCUSS_MODE` is `"assumptions"`: Read and execute @~/.claude/get-shit-done/workflows/discuss-phase-assumptions.md end-to-end.

If `DISCUSS_MODE` is `"discuss"` (or unset, or any other value): Read and execute @~/.claude/get-shit-done/workflows/discuss-phase.md end-to-end.

**MANDATORY:** The execution_context files listed above ARE the instructions. Read the workflow file BEFORE taking any action. The objective and success_criteria sections in this command file are summaries — the workflow file contains the complete step-by-step process with all required behaviors, config checks, and interaction patterns. Do not improvise from the summary.
</process>

<success_criteria>
한국어 우선 안내: 성공 기준의 판단은 아래 영문 체크리스트를 따르며, 한국어 설명은 빠른 이해를 돕기 위한 층입니다.

- Prior context loaded and applied (no re-asking decided questions)
- Gray areas identified through intelligent analysis
- User chose which areas to discuss
- Each selected area explored until satisfied
- Scope creep redirected to deferred ideas
- CONTEXT.md captures decisions, not vague vision
- User knows next steps
</success_criteria>
