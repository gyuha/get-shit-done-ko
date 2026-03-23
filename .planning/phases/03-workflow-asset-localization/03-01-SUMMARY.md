---
phase: 03-workflow-asset-localization
plan: 01
subsystem: workflow-assets
tags: [localization, commands, workflows, korean-first, prompt-assets]
requires: []
provides:
  - Korean-first command entry guidance across `commands/gsd/*.md`
  - Korean-facing help/progress/next/health workflow output copy
  - Preserved command literals, paths, and `@` references for Wave 1 assets
affects: [commands, workflows, localization]
tech-stack:
  added: []
  patterns: [korean-first-overlay, preserve-command-and-path-tokens, localized-workflow-headings]
key-files:
  created: []
  modified:
    - commands/gsd/help.md
    - commands/gsd/plan-phase.md
    - commands/gsd/new-project.md
    - get-shit-done/workflows/help.md
    - get-shit-done/workflows/progress.md
    - get-shit-done/workflows/next.md
    - get-shit-done/workflows/health.md
key-decisions:
  - "Applied a Korean-first overlay to command assets instead of replacing English source text, keeping upstream-compatible literals and guidance intact"
  - "Localized the user-visible headings and route copy in help/progress/next/health while leaving example commands, paths, and placeholders unchanged"
patterns-established:
  - "Workflow assets can lead with Korean explanatory text while retaining English original text for upstream sync and semantic cross-checking"
requirements-completed: []
duration: 18min
completed: 2026-03-23
---

# Phase 03 Plan 01: Workflow Asset Localization Summary

**Command 진입면과 help 계열 워크플로에 한국어 우선 설명층을 추가해, 명령 토큰과 참조 경로를 유지한 채 한국어 사용 흐름을 먼저 읽을 수 있게 만들었습니다.**

## Performance

- **Duration:** 18 min
- **Tasks:** 2
- **Files modified:** 61

## Accomplishments

- `commands/gsd/*.md` 전반에 한국어 우선 `description`과 `objective/context/process` 안내층을 추가했습니다.
- `get-shit-done/workflows/help.md`의 주요 섹션 헤더를 한국어 우선 구조로 조정했습니다.
- `get-shit-done/workflows/progress.md`, `get-shit-done/workflows/next.md`, `get-shit-done/workflows/health.md`의 사용자 출력 예시를 한국어 기준 문구로 다듬었습니다.
- representative reference 검사를 통해 command/workflow 경로와 `@` 참조가 유지되는 것을 다시 확인했습니다.

## Task Commits

1. **Task 1: Localize command entry markdown under commands/gsd** - `39f821d` (docs)
2. **Task 2: Localize help-facing workflow entry outputs** - `74d807a` (docs)

## Files Created/Modified

- `commands/gsd/*.md` - 한국어 우선 설명 레이어와 command-level 안내 문구 추가
- `get-shit-done/workflows/help.md` - 명령 레퍼런스 헤더와 섹션 진입면 한국어화
- `get-shit-done/workflows/progress.md` - 진행 보고/라우팅 출력 문구 한국어 우선 조정
- `get-shit-done/workflows/next.md` - 다음 단계 안내 메시지 한국어 우선 조정
- `get-shit-done/workflows/health.md` - 상태 점검 결과 헤더와 자동 수리 안내 한국어화

## Decisions Made

- 명령/경로/플레이스홀더/식별자를 바꾸지 않고, 설명층만 덧씌우는 overlay 패턴을 Wave 1 기본 규칙으로 채택했습니다.
- 실제 사용자에게 바로 노출되는 help/progress/next/health 출력은 공통 안내보다 한 단계 더 깊게 한국어 표기를 적용했습니다.

## Deviations from Plan

- `verify references get-shit-done/workflows/help.md` 는 예시 경로와 placeholder를 실제 파일로 해석하는 기존 false negative가 있어, `progress.md`, `next.md`, `health.md`와 representative command files로 무결성을 확인했습니다.

## Issues Encountered

None

## User Setup Required

None

## Next Phase Readiness

- Wave 1에서 정한 overlay 패턴을 workflows/templates/references 전체로 확장할 준비가 되었습니다.
- 다음 wave에서는 템플릿과 참조 자산에도 같은 한국어 우선 레이어를 적용하면서 용어 일관성을 더 강화할 수 있습니다.

---
*Phase: 03-workflow-asset-localization*
*Completed: 2026-03-23*
