---
name: gsd:plant-seed
description: "한국어 우선 안내 — Capture a forward-looking idea with trigger conditions — surfaces automatically at the right milestone"
argument-hint: "[idea summary]"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - AskUserQuestion
---

<objective>
한국어 우선 안내: 이 명령 문서는 `/gsd:plant-seed` 흐름을 한국어로 먼저 안내합니다. 아래 영문 원문은 upstream 호환성과 세부 의미 보존을 위해 함께 유지합니다.

Capture an idea that's too big for now but should surface automatically when the right
milestone arrives. Seeds solve context rot: instead of a one-liner in Deferred that nobody
reads, a seed preserves the full WHY, WHEN to surface, and breadcrumbs to details.

Creates: .planning/seeds/SEED-NNN-slug.md
Consumed by: /gsd:new-milestone (scans seeds and presents matches)
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/plant-seed.md
</execution_context>

<process>
한국어 우선 안내: 실제 실행 시에는 아래 워크플로와 참조 경로를 그대로 따르되, 설명 해석은 한국어를 기본으로 사용합니다.

Execute the plant-seed workflow from @~/.claude/get-shit-done/workflows/plant-seed.md end-to-end.
</process>
