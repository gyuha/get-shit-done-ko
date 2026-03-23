---
name: gsd:audit-uat
description: "Cross-phase audit of all outstanding UAT and verification items"
allowed-tools:
  - Read
  - Glob
  - Grep
  - Bash
---
<objective>
한국어 우선 안내: 이 명령 문서는 `/gsd:audit-uat` 흐름을 한국어로 먼저 안내합니다. 아래 영문 원문은 upstream 호환성과 세부 의미 보존을 위해 함께 유지합니다.

Scan all phases for pending, skipped, blocked, and human_needed UAT items. Cross-reference against codebase to detect stale documentation. Produce prioritized human test plan.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/audit-uat.md
</execution_context>

<context>
한국어 우선 안내: 인자, flags, 경로, 식별자, 플레이스홀더는 그대로 유지하고 설명만 한국어 우선으로 읽으면 됩니다.

Core planning files are loaded in-workflow via CLI.

**Scope:**
Glob: .planning/phases/*/*-UAT.md
Glob: .planning/phases/*/*-VERIFICATION.md
</context>
