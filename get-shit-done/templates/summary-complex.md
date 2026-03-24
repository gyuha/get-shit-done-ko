---
phase: XX-name
plan: YY
subsystem: [primary category]
tags: [searchable tech]
requires:
  - phase: [prior phase]
    provides: [what that phase built]
provides:
  - [bullet list of what was built/delivered]
affects: [list of phase names or keywords]
tech-stack:
  added: [libraries/tools]
  patterns: [architectural/code patterns]
key-files:
  created: [important files created]
  modified: [important files modified]
key-decisions:
  - "Decision 1"
patterns-established:
  - "Pattern 1: description"
duration: Xmin
completed: YYYY-MM-DD
---

> 한국어 우선 안내: 이 템플릿은 `summary-complex` 자산을 한국어 기준으로 먼저 읽을 수 있게 정리합니다. 아래 영문 원문은 upstream 동기화와 세부 의미 보존을 위해 함께 유지합니다.


# Phase [X]: [Name] 요약 (Summary, Complex)

**[무엇이 실제로 전달되었는지 한 줄로 요약]**

## Performance (수행 결과)
- **Duration:** [time]
- **Tasks:** [완료 수]
- **Files modified:** [수정 파일 수]

## Accomplishments (주요 성과)
- [핵심 결과 1]
- [핵심 결과 2]

## Task Commits
1. **Task 1: [task name]** - `hash`
2. **Task 2: [task name]** - `hash`
3. **Task 3: [task name]** - `hash`

## Files Created/Modified (생성/수정 파일)
- `path/to/file.ts` - 파일 역할 설명
- `path/to/another.ts` - 파일 역할 설명

## Decisions Made (결정 사항)
[핵심 결정과 짧은 이유]

## Deviations from Plan (Auto-fixed / 자동 수정)
[GSD deviation 규칙에 따라 자동 보정한 내역]

## Issues Encountered (이슈)
[진행 중 겪은 문제와 해결 내용]

## Next Phase Readiness (다음 phase 준비 상태)
[다음 phase를 위해 준비된 내용]
[남은 blocker 또는 concern]
