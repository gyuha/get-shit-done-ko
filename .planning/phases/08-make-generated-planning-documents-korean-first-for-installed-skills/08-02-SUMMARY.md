---
phase: 08-make-generated-planning-documents-korean-first-for-installed-skills
plan: 02
subsystem: "testing"
tags:
  - codex
  - regression
  - localization
provides:
  - "Direct installed-runtime regression coverage"
  - "Phase 08 completion proof"
affects:
  - "Phase 08 completion"
tech-stack:
  added: []
  patterns:
    - "test installed runtime via dedicated helper path"
key-files:
  created: []
  modified:
    - "tests/helpers.cjs"
    - "tests/template.test.cjs"
    - "tests/commands.test.cjs"
key-decisions:
  - "Test installed planning output by invoking .codex/get-shit-done/bin/gsd-tools.cjs directly"
patterns-established:
  - "installed-runtime regression tests assert Korean-first prose and preserved machine tokens"
duration: "10min"
completed: 2026-03-24
---

# Phase 8: make-generated-planning-documents-korean-first-for-installed-skills 요약 (Summary)

**Phase 08 now has direct regression proof that installed Codex planning output is Korean-first and parser-safe.**

## Performance (수행 결과)

- **Duration:** 10 min
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments (주요 성과)

- `tests/helpers.cjs`에 installed Codex runtime helper를 추가해 `.codex/get-shit-done/bin/gsd-tools.cjs`를 직접 호출 가능하게 함
- `tests/template.test.cjs`, `tests/commands.test.cjs`에 installed runtime의 한국어 우선 출력과 machine-sensitive 토큰 보존을 검증하는 회귀 테스트를 추가함

## Task Commits (작업 커밋)

1. **Task 1: installed runtime regression coverage** - `6c0b82b`

## Files Created/Modified (생성/수정 파일)

- `tests/helpers.cjs` - root runtime과 installed Codex runtime을 분리 호출하는 테스트 helper
- `tests/template.test.cjs` - installed runtime `template fill` 한국어 우선 출력 검증
- `tests/commands.test.cjs` - installed runtime `scaffold` 한국어 우선 출력 검증

## Decisions Made (결정 사항)

- 설치 경로 검증은 root runtime이 아니라 `.codex/get-shit-done/bin/gsd-tools.cjs`를 직접 호출해 고정함
- 회귀 테스트는 한국어 우선 headings와 exact labels를 동시에 검증하도록 구성함

## Deviations from Plan (계획 대비 변경 사항)

없음 - 계획대로 실행

## Issues Encountered (이슈)

없음

## User Setup Required (사용자 설정 필요 여부)

없음 - 추가 외부 서비스 설정이 필요하지 않습니다.

## Next Phase Readiness (다음 phase 준비 상태)

전체 테스트와 roadmap 검증이 통과했고, phase verification/closure metadata 작성만 남음
