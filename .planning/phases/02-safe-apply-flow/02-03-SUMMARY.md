---
phase: 02-safe-apply-flow
plan: "03"
subsystem: import-surface
tags:
  - upstream-sync
  - import-surface
  - preserve-guardrails
requires:
  - "02-02"
provides:
  - opt-in root import-surface extension path
  - preserved-path guardrails enforced in helper and docs
affects: []
tech-stack:
  added: []
  patterns:
    - opt-in expansion without changing defaults
    - preserved local paths rejected at the CLI boundary
key-files:
  created: []
  modified:
    - scripts/apply-upstream-refresh.cjs
    - skills/gsd-sync-upstream/scripts/apply-upstream-refresh.cjs
    - tests/upstream-sync.test.cjs
    - skills/gsd-sync-upstream/references/context.md
    - docs/UPSTREAM-SYNC.md
    - docs/RELEASE-CHECKLIST.md
key-decisions:
  - "Extra import entries are opt-in per command via --include-entry and do not mutate the default import surface."
  - "Preserved local paths are rejected even if a maintainer tries to pass them as include-entry values."
patterns-established:
  - "Escape hatches must be explicit, regression-tested, and documented with the same preserved-path guardrails as the default flow."
requirements-completed:
  - APPLY-03
  - APPLY-04
duration: 16min
completed: 2026-03-25
---

# Phase 2: Safe Apply Flow 요약 (Summary)

**optional import-surface 확장과 preserve guardrail을 helper/tests/docs에 같이 잠갔다**

## Performance (수행 결과)

- **Duration:** 16 min
- **Started:** 2026-03-25T00:46:00+09:00
- **Completed:** 2026-03-25T01:02:00+09:00
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments (주요 성과)
- apply helper가 repeatable `--include-entry <path>`를 지원해 one-off root import 확장을 가능하게 했다
- preserved local paths는 include-entry 수준에서 바로 거부해 `.planning/` 등 보호 경로가 import 대상이 되지 않게 했다
- 테스트가 default import surface 유지, opt-in `prompts` 확장, preserved path rejection을 모두 검증한다
- context/runbook/checklist가 같은 escape hatch와 같은 guardrail을 설명한다

## Task Commits (작업 커밋)

1. **Task 1: Add an opt-in import-surface extension path without changing the default safe path** - `20d99ce` (feat)
2. **Task 2: Document extension guardrails and preserved path protection** - `989c3da` (docs)

**Plan metadata:** `[pending commit]` (docs: complete plan)

## Decisions Made (결정 사항)

optional import 확장은 default path를 바꾸지 않고, command-level `--include-entry` escape hatch로만 연다.

## Deviations from Plan (계획 대비 변경 사항)

없음 - 계획대로 실행

## Issues Encountered (이슈)

없음

## Next Phase Readiness (다음 phase 준비 상태)

Phase 2가 dry-run, apply mode, import-surface extension, preserved path guardrail까지 마쳤으므로, 다음 phase에서는 변경 파일 기준 번역/overlay audit로 넘어갈 수 있다.

---
*Phase: 02-safe-apply-flow*
*Completed: 2026-03-25*
