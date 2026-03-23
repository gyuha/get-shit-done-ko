---
name: gsd:review
description: "한국어 우선 안내 — Request cross-AI peer review of phase plans from external AI CLIs"
argument-hint: "--phase N [--gemini] [--claude] [--codex] [--all]"
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - Grep
---

<objective>
한국어 우선 안내: 이 명령 문서는 `/gsd:review` 흐름을 한국어로 먼저 안내합니다. 아래 영문 원문은 upstream 호환성과 세부 의미 보존을 위해 함께 유지합니다.

Invoke external AI CLIs (Gemini, Claude, Codex) to independently review phase plans.
Produces a structured REVIEWS.md with per-reviewer feedback that can be fed back into
planning via /gsd:plan-phase --reviews.

**Flow:** Detect CLIs → Build review prompt → Invoke each CLI → Collect responses → Write REVIEWS.md
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/review.md
</execution_context>

<context>
한국어 우선 안내: 인자, flags, 경로, 식별자, 플레이스홀더는 그대로 유지하고 설명만 한국어 우선으로 읽으면 됩니다.

Phase number: extracted from $ARGUMENTS (required)

**Flags:**
- `--gemini` — Include Gemini CLI review
- `--claude` — Include Claude CLI review (uses separate session)
- `--codex` — Include Codex CLI review
- `--all` — Include all available CLIs
</context>

<process>
한국어 우선 안내: 실제 실행 시에는 아래 워크플로와 참조 경로를 그대로 따르되, 설명 해석은 한국어를 기본으로 사용합니다.

Execute the review workflow from @~/.claude/get-shit-done/workflows/review.md end-to-end.
</process>
