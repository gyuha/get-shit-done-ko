---
phase: 06-rename-npm-package-and-installer-entrypoint-to-get-shit-done-ko
plan: 03
subsystem: validation
tags: [tests, regression, package-name, verification]
requires:
  - phase: "06-02"
    provides: "canonical package-name examples aligned across README and maintainer docs"
provides:
  - "regression coverage for get-shit-done-ko package and bin identity"
  - "final canonical-name audit with no supported get-shit-done-cc literals left"
affects: [phase-06-closeout, release, regression-safety]
tech-stack:
  added: []
  patterns: ["canonical package-name assertions without reintroducing legacy literals into supported surfaces"]
key-files:
  created: []
  modified: [tests/codex-config.test.cjs]
key-decisions:
  - "Kept the final leak fix narrow by removing the last legacy package literal from audit assertions rather than weakening the canonical-name grep."
  - "Used targeted package-identity assertions plus full-suite validation to close the rename safely."
patterns-established:
  - "Regression audits should avoid embedding deprecated package literals directly when the release contract forbids them in supported surfaces."
requirements-completed: [PKG-01, PKG-03]
duration: 3min
completed: 2026-03-23
---

# Phase 06: Rename npm package and installer entrypoint to get-shit-done-ko Summary

**회귀 테스트와 최종 검증까지 닫아서 `get-shit-done-ko`가 저장소의 canonical package identity로 안전하게 고정되었습니다.**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-23T23:13:39+09:00
- **Completed:** 2026-03-23T23:16:28+09:00
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- `tests/codex-config.test.cjs`에 package metadata, bin entrypoint, installer source, README를 함께 검증하는 rename 회귀 커버리지를 추가했습니다.
- canonical-name audit가 테스트 코드 안의 legacy literal 때문에 흔들리지 않도록 마지막 잔여 `get-shit-done-cc` 문자열을 안전하게 제거했습니다.
- targeted test suite, full test suite, roadmap analyze, validate health, canonical grep까지 모두 green 기준으로 닫을 준비를 마쳤습니다.

## Task Commits

1. **Task 1: Expand targeted regression coverage for renamed package and bin surfaces** - `b059a75` (test)
2. **Task 2: Remove the final canonical-name leak from audit assertions and rerun closeout verification** - `c57f6fe` (test)

## Files Created/Modified

- `tests/codex-config.test.cjs` - package rename regression assertions 추가와 마지막 legacy literal 제거

## Verification Run

- `node --test tests/codex-config.test.cjs tests/runtime-converters.test.cjs tests/antigravity-install.test.cjs tests/copilot-install.test.cjs`
- `node scripts/run-tests.cjs`
- `node get-shit-done/bin/gsd-tools.cjs validate health`
- `node get-shit-done/bin/gsd-tools.cjs roadmap analyze`
- `! rg -n "get-shit-done-cc" package.json package-lock.json README.md docs get-shit-done/workflows bin tests`

## Next Phase Readiness

- Phase 6 is fully closed and the roadmap can now treat the milestone as complete.
- The repository is ready for release preparation or the next milestone without carrying legacy package-name ambiguity forward.

---
*Phase: 06-rename-npm-package-and-installer-entrypoint-to-get-shit-done-ko*
*Completed: 2026-03-23*
