---
type: prompt
name: gsd:milestone-summary
description: "한국어 우선 안내 — Generate a comprehensive project summary from milestone artifacts for team onboarding and review"
argument-hint: "[version]"
allowed-tools:
  - Read
  - Write
  - Bash
  - Grep
  - Glob
---

<objective>
한국어 우선 안내: 이 명령 문서는 `/gsd:milestone-summary` 흐름을 한국어로 먼저 안내합니다. 아래 영문 원문은 upstream 호환성과 세부 의미 보존을 위해 함께 유지합니다.

Generate a structured milestone summary for team onboarding and project review. Reads completed milestone artifacts (ROADMAP, REQUIREMENTS, CONTEXT, SUMMARY, VERIFICATION files) and produces a human-friendly overview of what was built, how, and why.

Purpose: Enable new team members to understand a completed project by reading one document and asking follow-up questions.
Output: MILESTONE_SUMMARY written to `.planning/reports/`, presented inline, optional interactive Q&A.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/milestone-summary.md
</execution_context>

<context>
한국어 우선 안내: 인자, flags, 경로, 식별자, 플레이스홀더는 그대로 유지하고 설명만 한국어 우선으로 읽으면 됩니다.

**Project files:**
- `.planning/ROADMAP.md`
- `.planning/PROJECT.md`
- `.planning/STATE.md`
- `.planning/RETROSPECTIVE.md`
- `.planning/milestones/v{version}-ROADMAP.md` (if archived)
- `.planning/milestones/v{version}-REQUIREMENTS.md` (if archived)
- `.planning/phases/*-*/` (SUMMARY.md, VERIFICATION.md, CONTEXT.md, RESEARCH.md)

**User input:**
- Version: $ARGUMENTS (optional — defaults to current/latest milestone)
</context>

<process>
한국어 우선 안내: 실제 실행 시에는 아래 워크플로와 참조 경로를 그대로 따르되, 설명 해석은 한국어를 기본으로 사용합니다.

Read and execute the milestone-summary workflow from @~/.claude/get-shit-done/workflows/milestone-summary.md end-to-end.
</process>

<success_criteria>
한국어 우선 안내: 성공 기준의 판단은 아래 영문 체크리스트를 따르며, 한국어 설명은 빠른 이해를 돕기 위한 층입니다.

- Milestone version resolved (from args, STATE.md, or archive scan)
- All available artifacts read (ROADMAP, REQUIREMENTS, CONTEXT, SUMMARY, VERIFICATION, RESEARCH, RETROSPECTIVE)
- Summary document written to `.planning/reports/MILESTONE_SUMMARY-v{version}.md`
- All 7 sections generated (Overview, Architecture, Phases, Decisions, Requirements, Tech Debt, Getting Started)
- Summary presented inline to user
- Interactive Q&A offered
- STATE.md updated
</success_criteria>
