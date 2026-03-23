---
phase: 05-compatibility-validation-and-release-prep
plan: 02
subsystem: compatibility-repair
tags: [compatibility, installer, runtime-conversion, codex, copilot, antigravity, tests]
requires: [05-01]
provides:
  - Closed bare `.claude` path leaks in non-Claude runtime conversion and install outputs
  - Regression coverage for bare config-root path cases across Copilot, Antigravity, and Codex
  - Green focused compatibility suite and full repository suite after the repair
affects: [bin/install.js, tests, runtime-conversion, release-readiness]
tech-stack:
  added: []
  patterns: [minimal-repair, converter-regression-tests, evidence-driven-fix]
key-files:
  created: []
  modified:
    - bin/install.js
    - tests/copilot-install.test.cjs
    - tests/antigravity-install.test.cjs
    - tests/codex-config.test.cjs
key-decisions:
  - "Fixed the surfaced conversion leak by adding bare config-root replacement instead of widening installer behavior"
  - "Extended regression coverage only where the validation sweep surfaced unsupported bare `.claude` path forms"
patterns-established:
  - "Runtime converter repairs must add the exact regression tests that reproduce the surfaced compatibility warning"
requirements-completed: [QUAL-01, QUAL-02]
duration: 6min
completed: 2026-03-23
---

# Phase 05 Plan 02: Compatibility Repair Summary

**Validation sweep에서 실제로 드러난 `.claude` 경로 누수만 좁게 수리했고, focused suite와 full suite까지 다시 녹색으로 닫았습니다.**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-23T13:30:30Z
- **Completed:** 2026-03-23T13:36:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- `bin/install.js`에 bare `~/.claude` / `$HOME/.claude` config-root 치환 헬퍼를 추가해 Copilot, Antigravity, Codex 및 generic install copy 경로에서 남던 leak warning을 제거했습니다.
- Codex agent `.toml` 생성 경로까지 같은 규칙을 적용해 generated output에서도 bare `.claude`가 남지 않도록 맞췄습니다.
- Copilot/Antigravity 단위 테스트와 Codex integration 테스트에 bare config-root 회귀 케이스를 추가했습니다.
- focused compatibility suite와 `node scripts/run-tests.cjs` 전체 스위트를 모두 통과시켜 repair가 다른 surface를 깨뜨리지 않음을 확인했습니다.

## Task Commits

1. **Task 1: Repair compatibility findings surfaced by 05-01** - `1d24b6e` (fix)
2. **Task 2: Re-run full regression coverage after repairs** - covered by the same repair commit and post-commit verification run

## Files Created/Modified

- `bin/install.js` - bare Claude config-root references를 runtime-specific config roots로 치환하도록 보강
- `tests/copilot-install.test.cjs` - Copilot bare config-root conversion regression 추가
- `tests/antigravity-install.test.cjs` - Antigravity bare config-root conversion regression 추가
- `tests/codex-config.test.cjs` - generated `gsd-debugger.toml`에 bare `.claude` 누수가 없는지 integration 검증 추가

## Verification Run

- `node --test tests/path-replacement.test.cjs tests/runtime-converters.test.cjs tests/codex-config.test.cjs tests/antigravity-install.test.cjs tests/copilot-install.test.cjs`
- `node scripts/run-tests.cjs`
- `node get-shit-done/bin/gsd-tools.cjs validate health`
- `node get-shit-done/bin/gsd-tools.cjs validate consistency`

## Deviations from Plan

None - repair scope stayed limited to the single surfaced compatibility warning class.

## Next Phase Readiness

- Release-prep guidance can now document a clean post-repair baseline rather than work around known installer warnings.
- `QUAL-01`과 `QUAL-02`는 자동 검증 기준으로 충족되었고, 05-03은 maintainership handoff 문서화에 집중하면 됩니다.

---
*Phase: 05-compatibility-validation-and-release-prep*
*Completed: 2026-03-23*
