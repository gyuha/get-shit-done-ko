---
phase: 03-workflow-asset-localization
plan: 03
subsystem: workflow-assets
tags: [localization, agents, terminology, consistency, korean-first]
requires: []
provides:
  - Korean-first overlay across agent prompt assets
  - Normalized localization terminology across workflow asset families
  - Preserved executable semantics for agent prompts, commands, paths, and structured tags
affects: [agents, commands, workflows, templates, references, localization]
tech-stack:
  added: []
  patterns: [agent-prompt-korean-overlay, terminology-normalization, preserve-description-contracts]
key-files:
  created: []
  modified:
    - agents/gsd-executor.md
    - agents/gsd-plan-checker.md
    - agents/gsd-phase-researcher.md
    - get-shit-done/workflows/plan-phase.md
    - get-shit-done/templates/summary.md
    - get-shit-done/references/checkpoints.md
key-decisions:
  - "Kept frontmatter description fields in English for commands and agents because installer/config generation relies on those values remaining stable"
  - "Standardized the Korean overlay copy on a single '세부 의미 보존' phrasing across workflow asset families"
patterns-established:
  - "Agent prompts can lead with Korean explanatory text while leaving description contracts, tool declarations, and execution-sensitive paths untouched"
requirements-completed: [FLOW-01, FLOW-02]
duration: 20min
completed: 2026-03-23
---

# Phase 03 Plan 03: Workflow Asset Localization Summary

**Agent 프롬프트까지 한국어 우선 안내층을 확장하고, commands/workflows/templates/references/agents 전반의 한국어 안내 문구를 한 가지 용어 패턴으로 정규화했습니다.**

## Performance

- **Duration:** 20 min
- **Tasks:** 2
- **Files modified:** 128

## Accomplishments

- `agents/*.md` 전반에 한국어 우선 역할/프로젝트 컨텍스트 안내층을 추가했습니다.
- installer와 config 생성이 기대하는 `description` 계약은 유지하도록 commands/agents frontmatter description을 영문 원문으로 되돌렸습니다.
- workflow/template/reference 전반의 overlay 문구를 `세부 의미 보존` 표현으로 통일해 반복 용어를 정리했습니다.
- 전체 테스트 스위트와 health 검증을 다시 통과시켜 prompt 자산 회귀가 없는지 확인했습니다.

## Task Commits

1. **Task 1: Localize agent prompt prose into Korean** - `3134458` (docs)
2. **Task 2: Review and normalize shared terminology across translated workflow assets** - `f3f2c09` (docs)

## Files Created/Modified

- `agents/*.md` - 에이전트 역할/프로젝트 컨텍스트에 한국어 우선 안내 추가
- `get-shit-done/workflows/*.md` - overlay 문구 표현 정규화
- `get-shit-done/templates/**/*.md` - overlay 문구 표현 정규화
- `get-shit-done/references/*.md` - overlay 문구 표현 정규화

## Decisions Made

- frontmatter `description` 은 설치 변환과 설정 생성 테스트가 그대로 사용하므로, 한국어화 대상에서 제외하고 본문 안내층에서만 한국어 우선을 구현했습니다.
- 사용자와 downstream agent가 반복적으로 읽는 안내 문구는 파일군마다 다르게 표현하기보다 동일한 문장 구조로 유지하는 쪽이 유지보수에 유리하다고 판단했습니다.

## Deviations from Plan

- `verify references` 는 wildcard, placeholder 예시, markdown 강조 문법을 실제 경로처럼 해석하는 기존 false negative가 있어, 최종 승인 근거는 `validate health` 와 `node scripts/run-tests.cjs` 통과로 잡았습니다.

## Issues Encountered

- 중간에 command/agent `description` 을 한국어화하면서 installer/config 테스트 두 건이 깨졌고, 해당 필드만 영문 원문으로 되돌려 호환성을 회복했습니다.

## User Setup Required

None

## Next Phase Readiness

- Phase 4에서는 실제 runtime help/checkpoint/error 스타일 메시지와 주석 계층을 같은 규칙으로 옮기면 됩니다.
- Phase 3에서 prompt 자산군의 overlay 패턴과 용어 표준이 정해졌기 때문에, 이후 단계는 이 규칙을 코드/메시지 자산으로 확장하는 작업에 집중할 수 있습니다.

---
*Phase: 03-workflow-asset-localization*
*Completed: 2026-03-23*
