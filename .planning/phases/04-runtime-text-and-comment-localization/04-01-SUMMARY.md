---
phase: 04-runtime-text-and-comment-localization
plan: 01
subsystem: runtime-localization
tags: [localization, cli, installer, tests, korean-first, runtime-copy]
requires: []
provides:
  - Korean-first runtime copy across installer, CLI, config, state, workstream, and profiling helpers
  - Test expectations aligned with localized runtime output contracts
  - Preserved command/flag/path/config-token compatibility under Korean messaging
affects: [bin/install.js, get-shit-done/bin/gsd-tools.cjs, get-shit-done/bin/lib, tests, localization]
tech-stack:
  added: []
  patterns: [runtime-copy-korean-overlay, contract-level-output-assertions, preserve-executable-tokens]
key-files:
  created: []
  modified:
    - bin/install.js
    - scripts/build-hooks.js
    - get-shit-done/bin/gsd-tools.cjs
    - get-shit-done/bin/lib/config.cjs
    - get-shit-done/bin/lib/state.cjs
    - get-shit-done/bin/lib/workstream.cjs
    - get-shit-done/bin/lib/profile-output.cjs
    - tests/dispatcher.test.cjs
    - tests/config.test.cjs
    - tests/state.test.cjs
    - tests/workstream.test.cjs
    - tests/claude-md.test.cjs
    - tests/multi-runtime-select.test.cjs
    - tests/pick-flag.test.cjs
key-decisions:
  - "Localized only human-facing runtime copy and kept flags, config keys, paths, JSON keys, and identifiers untouched"
  - "Updated brittle English string assertions to Korean contract assertions where runtime copy became intentionally localized"
patterns-established:
  - "Runtime localization must preserve machine-sensitive tokens even when help, warning, and error prose is translated"
requirements-completed: [TEXT-01, TEXT-02]
duration: 6min
completed: 2026-03-23
---

# Phase 04 Plan 01: Runtime Text Localization Summary

**설치기, CLI, 상태/설정 헬퍼 전반의 사용자 노출 문구를 한국어 우선으로 옮기고, 해당 출력 계약을 검증하는 테스트 기대값까지 함께 정렬했습니다.**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-23T13:08:00Z
- **Completed:** 2026-03-23T13:14:05Z
- **Tasks:** 2
- **Files modified:** 14

## Accomplishments

- `bin/install.js`, `get-shit-done/bin/gsd-tools.cjs`, `get-shit-done/bin/lib/*.cjs`의 help/error/status 성격 문구를 한국어 우선으로 정리했습니다.
- 명령어 리터럴, 플래그, 경로, config 키, JSON 키, 식별자는 유지해 실행 계약이 바뀌지 않도록 했습니다.
- 런타임 출력 문자열에 의존하던 테스트 7개를 한국어 기대값 또는 계약 수준 검증으로 갱신해 회귀를 막았습니다.
- 전체 테스트 스위트와 `validate health`를 통과시켜 런타임 메시지 변경이 기능 회귀로 이어지지 않음을 확인했습니다.

## Task Commits

1. **Task 1: Localize runtime-facing source strings in installer and CLI helpers** - `a3e39a3` (feat)
2. **Task 2: Update automated tests for localized runtime output expectations** - `05df33d` (test)

## Files Created/Modified

- `bin/install.js` - 설치/해제/런타임 선택 안내와 에러 문구 한국어화
- `scripts/build-hooks.js` - hook 빌드/문법 검증 안내 문구 한국어화
- `get-shit-done/bin/gsd-tools.cjs` - CLI usage/unknown command/error 계열 메시지 한국어화
- `get-shit-done/bin/lib/config.cjs` - config 관련 사용자 노출 에러/usage 문구 한국어화
- `get-shit-done/bin/lib/state.cjs` - 상태 전이 메시지와 한국어 상태값 인식 보강
- `get-shit-done/bin/lib/workstream.cjs` - workstream 생성/상태 초기 문구 한국어화
- `get-shit-done/bin/lib/profile-output.cjs` - profiling 질문과 fallback 안내 한국어화
- `tests/*.test.cjs` - localized runtime output 기대값 반영

## Decisions Made

- 실행 의미를 갖는 토큰은 어떤 경우에도 번역하지 않고, 사람이 읽는 문장층만 한국어화했습니다.
- 테스트는 번역된 문자열 자체를 확인하되, 경로/플래그/식별자 같은 호환성 토큰은 그대로 검증하도록 유지했습니다.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- `state advance-plan`, installer prompt, `CLAUDE.md` 생성 테스트 일부가 영문 기대값에 묶여 있어, 한국어 출력 계약으로 기대값을 재정렬했습니다.

## User Setup Required

None

## Next Phase Readiness

- Phase 4 Plan 02에서 남은 source comment/docblock 계층을 한국어 우선으로 정리하면 비문서 localization 범위가 닫힙니다.
- 런타임 출력 계약은 이미 테스트에 반영됐기 때문에 이후 단계는 semantic drift 점검과 release validation에 집중할 수 있습니다.

---
*Phase: 04-runtime-text-and-comment-localization*
*Completed: 2026-03-23*
