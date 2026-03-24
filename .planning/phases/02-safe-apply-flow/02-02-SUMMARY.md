---
phase: 02-safe-apply-flow
plan: "02"
subsystem: apply-mode
tags:
  - upstream-sync
  - apply-mode
  - source-of-truth
requires:
  - "02-01"
provides:
  - explicit source-of-truth apply mode in helper output and CLI
  - maintainer docs aligned with the named apply mode
affects:
  - "02-03"
tech-stack:
  added: []
  patterns:
    - explicit CLI mode instead of implicit default behavior
    - mirrored helper/docs apply contract
key-files:
  created: []
  modified:
    - scripts/apply-upstream-refresh.cjs
    - skills/gsd-sync-upstream/scripts/apply-upstream-refresh.cjs
    - tests/upstream-sync.test.cjs
    - skills/gsd-sync-upstream/SKILL.md
    - skills/gsd-sync-upstream/references/context.md
    - docs/UPSTREAM-SYNC.md
key-decisions:
  - "source-of-truth is the canonical default apply mode and appears explicitly in helper output."
  - "Unknown apply modes fail fast instead of silently mutating the repo."
patterns-established:
  - "Apply behavior is named, validated, and documented before introducing optional expansion paths."
requirements-completed:
  - APPLY-02
duration: 14min
completed: 2026-03-25
---

# Phase 2: Safe Apply Flow 요약 (Summary)

**실제 apply 기본 전략을 `source-of-truth`라는 명시적 계약으로 고정했다**

## Performance (수행 결과)

- **Duration:** 14 min
- **Started:** 2026-03-25T00:31:00+09:00
- **Completed:** 2026-03-25T00:45:00+09:00
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments (주요 성과)
- apply helper가 `--mode source-of-truth`를 지원하고, 결과 객체/포맷 출력에 `apply_mode`를 포함한다
- unknown mode는 즉시 실패하도록 막아 silent fallback 위험을 제거했다
- skill/context/runbook이 같은 apply 명령과 같은 mode 의미를 사용하도록 정렬됐다

## Task Commits (작업 커밋)

1. **Task 1: Make source-of-truth the explicit apply mode contract** - `280cefc` (feat)
2. **Task 2: Align maintainer instructions with the explicit source-of-truth mode** - `2e87926` (docs)

**Plan metadata:** `[pending commit]` (docs: complete plan)

## Decisions Made (결정 사항)

실제 apply는 implicit default가 아니라 `source-of-truth`라는 이름 있는 기본 mode로 유지한다.

## Deviations from Plan (계획 대비 변경 사항)

없음 - 계획대로 실행

## Issues Encountered (이슈)

`formatDryRun()`용 테스트 fixture가 새 `apply_mode` 필드를 누락해 한 번 실패했고, fixture input을 helper contract에 맞춰 수정했다.

## Next Phase Readiness (다음 phase 준비 상태)

기본 apply 전략이 명시됐으므로, 마지막 plan에서 optional import-surface extension과 preserved path guardrail을 안전하게 얹을 수 있다.

---
*Phase: 02-safe-apply-flow*
*Completed: 2026-03-25*
