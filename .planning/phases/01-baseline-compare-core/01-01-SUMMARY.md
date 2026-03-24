---
phase: 01-baseline-compare-core
plan: "01"
subsystem: infra
tags:
  - upstream-sync
  - baseline
  - releases
  - codex-skills
requires: []
provides:
  - baseline-first compare contract is explicit in repo-local and bundled helpers
  - local skill bundle path for gsd-sync-upstream compare assets exists
affects:
  - "01-02"
  - "01-03"
tech-stack:
  added: []
  patterns:
    - baseline-file-first sync eligibility
    - mirrored repo-local and bundled compare helpers
key-files:
  created:
    - skills/gsd-sync-upstream/references/context.md
    - skills/gsd-sync-upstream/scripts/check-upstream-release.cjs
  modified:
    - scripts/check-upstream-release.cjs
    - skills/gsd-sync-upstream/references/context.md
    - skills/gsd-sync-upstream/scripts/check-upstream-release.cjs
key-decisions:
  - "Sync eligibility remains driven by get-shit-done/UPSTREAM_VERSION rather than package.json."
  - "The project-local skill bundle must ship its own compare helper with the same contract as the repo-local helper."
patterns-established:
  - "Bundled skill helpers mirror repo-local helper behavior for deterministic maintainer workflows."
requirements-completed:
  - SYNC-01
  - SYNC-02
duration: 12min
completed: 2026-03-24
---

# Phase 1: Baseline Compare Core 요약 (Summary)

**baseline file를 source of truth로 고정한 upstream compare helper와 로컬 skill bundle compare 자산을 정렬했다**

## Performance (수행 결과)

- **Duration:** 12 min
- **Started:** 2026-03-24T23:22:00+09:00
- **Completed:** 2026-03-24T23:34:00+09:00
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments (주요 성과)
- repo-local `scripts/check-upstream-release.cjs`에 baseline-first contract를 코드 주석으로 고정했다
- `skills/gsd-sync-upstream/` 아래에 로컬 compare helper와 maintainer context를 실제 번들 자산으로 세웠다
- compare helper와 bundled helper가 동일한 JSON contract를 내고 기존 upstream sync 테스트를 통과함을 확인했다

## Task Commits (작업 커밋)

각 task는 atomic commit으로 기록합니다:

1. **Task 1: Normalize compare source-of-truth rules** - `6ae2129` (refactor)
2. **Task 2: Tighten maintainer compare reference** - `8b2a35b` (docs)

**Plan metadata:** `[pending commit]` (docs: complete plan)

## Files Created/Modified (생성/수정 파일)
- `scripts/check-upstream-release.cjs` - baseline-first compare contract를 명시하는 repo-local helper
- `skills/gsd-sync-upstream/scripts/check-upstream-release.cjs` - 로컬 skill bundle용 compare helper
- `skills/gsd-sync-upstream/references/context.md` - current/update_available/ahead/no-op 규칙을 담는 maintainer context

## Decisions Made (결정 사항)

`get-shit-done/UPSTREAM_VERSION`만 sync eligibility의 source of truth로 사용하고, `package.json` version은 보고용 메타데이터로만 취급한다.

## Deviations from Plan (계획 대비 변경 사항)

없음 - 계획대로 실행

## Issues Encountered (이슈)

초기 점검에서 `skills/gsd-sync-upstream/` 자산이 worktree에 비어 있었지만, tracked skill bundle 경로를 정상 상태로 복원한 뒤 compare core 변경만 반영했다.

## User Setup Required (사용자 설정 필요 여부)

없음 - 외부 서비스 수동 설정이 필요하지 않음.

## Next Phase Readiness (다음 phase 준비 상태)

로컬 skill bundle compare helper가 생겼고 current/no-op/ahead 개념이 명확해져, 다음 plan에서 maintainer-facing skill wording과 runbook 정렬로 넘어갈 수 있다.

---
*Phase: 01-baseline-compare-core*
*Completed: 2026-03-24*
