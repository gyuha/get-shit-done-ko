---
name: gsd:audit-milestone
description: "한국어 우선 안내 — Audit milestone completion against original intent before archiving"
argument-hint: "[version]"
allowed-tools:
  - Read
  - Glob
  - Grep
  - Bash
  - Task
  - Write
---
<objective>
한국어 우선 안내: 이 명령 문서는 `/gsd:audit-milestone` 흐름을 한국어로 먼저 안내합니다. 아래 영문 원문은 upstream 호환성과 세부 의미 보존을 위해 함께 유지합니다.

Verify milestone achieved its definition of done. Check requirements coverage, cross-phase integration, and end-to-end flows.

**This command IS the orchestrator.** Reads existing VERIFICATION.md files (phases already verified during execute-phase), aggregates tech debt and deferred gaps, then spawns integration checker for cross-phase wiring.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/audit-milestone.md
</execution_context>

<context>
한국어 우선 안내: 인자, flags, 경로, 식별자, 플레이스홀더는 그대로 유지하고 설명만 한국어 우선으로 읽으면 됩니다.

Version: $ARGUMENTS (optional — defaults to current milestone)

Core planning files are resolved in-workflow (`init milestone-op`) and loaded only as needed.

**Completed Work:**
Glob: .planning/phases/*/*-SUMMARY.md
Glob: .planning/phases/*/*-VERIFICATION.md
</context>

<process>
한국어 우선 안내: 실제 실행 시에는 아래 워크플로와 참조 경로를 그대로 따르되, 설명 해석은 한국어를 기본으로 사용합니다.

Execute the audit-milestone workflow from @~/.claude/get-shit-done/workflows/audit-milestone.md end-to-end.
Preserve all workflow gates (scope determination, verification reading, integration check, requirements coverage, routing).
</process>
