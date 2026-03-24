---
phase: 08-make-generated-planning-documents-korean-first-for-installed-skills
plan: 01
subsystem: "installed-runtime"
tags:
  - codex
  - templates
  - localization
provides:
  - "Korean-first installed planning generators"
  - "Korean-first installed planning templates"
affects:
  - "Phase 08 verification"
  - "installed Codex skill planning output"
tech-stack:
  added: []
  patterns:
    - "installed-runtime mirrors root Korean-first planning copy"
key-files:
  created:
    - ".codex/get-shit-done/bin/lib/template.cjs"
    - ".codex/get-shit-done/bin/lib/commands.cjs"
    - ".codex/get-shit-done/templates/context.md"
    - ".codex/get-shit-done/templates/research.md"
    - ".codex/get-shit-done/templates/project.md"
    - ".codex/get-shit-done/templates/roadmap.md"
    - ".codex/get-shit-done/templates/requirements.md"
    - ".codex/get-shit-done/templates/state.md"
    - ".codex/get-shit-done/templates/summary.md"
    - ".codex/get-shit-done/templates/summary-standard.md"
    - ".codex/get-shit-done/templates/summary-minimal.md"
    - ".codex/get-shit-done/templates/summary-complex.md"
    - ".codex/get-shit-done/templates/UAT.md"
    - ".codex/get-shit-done/templates/VALIDATION.md"
    - ".codex/get-shit-done/templates/verification-report.md"
  modified:
    - ".codex/get-shit-done/templates/phase-prompt.md"
key-decisions:
  - "Treat .codex/get-shit-done as the authoritative installed runtime"
  - "Preserve machine-sensitive labels while localizing surrounding prose"
patterns-established:
  - "sync installed planning assets from validated root Korean-first sources"
duration: "12min"
completed: 2026-03-24
---

# Phase 8: make-generated-planning-documents-korean-first-for-installed-skills 요약 (Summary)

**Installed Codex runtime now ships Korean-first planning generators and templates instead of English-first defaults.**

## Performance (수행 결과)

- **Duration:** 12 min
- **Tasks:** 2
- **Files modified:** 16

## Accomplishments (주요 성과)

- `.codex/get-shit-done/bin/lib/template.cjs`와 `.codex/get-shit-done/bin/lib/commands.cjs`를 한국어 우선 planning 출력으로 맞춤
- 설치 경로에서 실제로 참조되는 `.codex/get-shit-done/templates/*` planning 자산을 한국어 우선으로 동기화

## Task Commits (작업 커밋)

1. **Task 1: installed planning generator localization** - `8ba66b2`
2. **Task 2: installed planning template localization** - `8fdee19`

## Files Created/Modified (생성/수정 파일)

- `.codex/get-shit-done/bin/lib/template.cjs` - installed `template fill` 출력의 한국어 우선 기본값
- `.codex/get-shit-done/bin/lib/commands.cjs` - installed `scaffold` planning 문서의 한국어 우선 기본값
- `.codex/get-shit-done/templates/summary.md` - installed executor summary 템플릿
- `.codex/get-shit-done/templates/context.md` - installed context/research 계열 planning 템플릿
- `.codex/get-shit-done/templates/UAT.md` - installed UAT 템플릿
- `.codex/get-shit-done/templates/VALIDATION.md` - installed validation 계약 템플릿
- `.codex/get-shit-done/templates/verification-report.md` - installed verification 보고서 템플릿

## Decisions Made (결정 사항)

- `.codex/get-shit-done/`를 설치된 Codex skill의 authoritative runtime으로 취급해 root mirror보다 우선 수정함
- `Tasks`, `Test Results`, `Goal-Backward Verification`, `status: pending`, `<task ...>` 같은 machine-sensitive 토큰은 유지함

## Deviations from Plan (계획 대비 변경 사항)

없음 - 계획대로 실행

## Issues Encountered (이슈)

없음

## User Setup Required (사용자 설정 필요 여부)

없음 - 추가 외부 서비스 설정이 필요하지 않습니다.

## Next Phase Readiness (다음 phase 준비 상태)

직접 `.codex/get-shit-done/bin/gsd-tools.cjs`를 호출하는 회귀 테스트와 phase closure 검증을 진행할 준비가 끝남
