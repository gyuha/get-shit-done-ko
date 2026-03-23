---
name: gsd:list-phase-assumptions
description: "한국어 우선 안내 — Surface Claude's assumptions about a phase approach before planning"
argument-hint: "[phase]"
allowed-tools:
  - Read
  - Bash
  - Grep
  - Glob
---

<objective>
한국어 우선 안내: 이 명령 문서는 `/gsd:list-phase-assumptions` 흐름을 한국어로 먼저 안내합니다. 아래 영문 원문은 upstream 호환성과 세부 의미 보존을 위해 함께 유지합니다.

Analyze a phase and present Claude's assumptions about technical approach, implementation order, scope boundaries, risk areas, and dependencies.

Purpose: Help users see what Claude thinks BEFORE planning begins - enabling course correction early when assumptions are wrong.
Output: Conversational output only (no file creation) - ends with "What do you think?" prompt
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/list-phase-assumptions.md
</execution_context>

<context>
한국어 우선 안내: 인자, flags, 경로, 식별자, 플레이스홀더는 그대로 유지하고 설명만 한국어 우선으로 읽으면 됩니다.

Phase number: $ARGUMENTS (required)

Project state and roadmap are loaded in-workflow using targeted reads.
</context>

<process>
한국어 우선 안내: 실제 실행 시에는 아래 워크플로와 참조 경로를 그대로 따르되, 설명 해석은 한국어를 기본으로 사용합니다.

1. Validate phase number argument (error if missing or invalid)
2. Check if phase exists in roadmap
3. Follow list-phase-assumptions.md workflow:
   - Analyze roadmap description
   - Surface assumptions about: technical approach, implementation order, scope, risks, dependencies
   - Present assumptions clearly
   - Prompt "What do you think?"
4. Gather feedback and offer next steps
</process>

<success_criteria>
한국어 우선 안내: 성공 기준의 판단은 아래 영문 체크리스트를 따르며, 한국어 설명은 빠른 이해를 돕기 위한 층입니다.


- Phase validated against roadmap
- Assumptions surfaced across five areas
- User prompted for feedback
- User knows next steps (discuss context, plan phase, or correct assumptions)
  </success_criteria>
