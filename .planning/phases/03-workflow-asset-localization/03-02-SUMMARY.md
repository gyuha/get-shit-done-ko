---
phase: 03-workflow-asset-localization
plan: 02
subsystem: workflow-assets
tags: [localization, workflows, templates, references, korean-first]
requires: []
provides:
  - Korean-first overlay across workflow assets
  - Korean-first overlay across templates and references
  - Preserved markup, placeholders, and include paths for shared prompt assets
affects: [workflows, templates, references, localization]
tech-stack:
  added: []
  patterns: [korean-first-overlay, preserve-structured-markup, safe-reference-doc-overlays]
key-files:
  created: []
  modified:
    - get-shit-done/workflows/plan-phase.md
    - get-shit-done/workflows/execute-phase.md
    - get-shit-done/templates/summary.md
    - get-shit-done/templates/project.md
    - get-shit-done/references/checkpoints.md
    - get-shit-done/references/questioning.md
key-decisions:
  - "Extended the Korean-first overlay pattern to shared workflow/template/reference assets instead of rewriting token-sensitive examples"
  - "Used inserted Korean guidance notes as the default reading path while keeping original English body text for upstream parity and semantic verification"
patterns-established:
  - "Shared prompt assets can be localized safely by inserting Korean guidance ahead of English source text without renaming tags, placeholders, or file references"
requirements-completed: []
duration: 14min
completed: 2026-03-23
---

# Phase 03 Plan 02: Workflow Asset Localization Summary

**Workflow, template, reference 자산 전반에 한국어 우선 안내층을 적용해, 구조적 토큰은 유지하면서도 공통 프롬프트 자산을 한국어 기준으로 읽을 수 있게 정리했습니다.**

## Performance

- **Duration:** 14 min
- **Tasks:** 2
- **Files modified:** 110

## Accomplishments

- `get-shit-done/workflows/*.md` 전반의 첫 안내 블록에 한국어 우선 설명층을 추가했습니다.
- `get-shit-done/templates/**/*.md` 전반에 한국어 우선 템플릿 안내 문구를 넣어 기본 독해 경로를 한국어로 바꿨습니다.
- `get-shit-done/references/*.md` 전반에 한국어 우선 규칙 안내를 추가해 downstream 참조 문서도 같은 패턴으로 맞췄습니다.
- 삽입형 변경만 사용해 XML 태그, placeholders, 코드 예시, `@` 경로를 그대로 유지했습니다.

## Task Commits

1. **Task 1: Localize workflow and template prose into Korean** - `39b8295` (docs)
2. **Task 2: Localize shared references while preserving structured examples** - `a91e06e` (docs)

## Files Created/Modified

- `get-shit-done/workflows/*.md` - workflow entry 블록에 한국어 우선 안내 추가
- `get-shit-done/templates/**/*.md` - 템플릿 상단에 한국어 우선 안내층 추가
- `get-shit-done/references/*.md` - 참조 문서에 한국어 우선 규칙 안내 추가

## Decisions Made

- 구조를 직접 번역하기보다 각 자산의 첫 읽기 경험을 한국어로 바꾸는 overlay 방식을 workflows/templates/references 전반에도 동일하게 적용했습니다.
- placeholder 경로나 예시 경로가 많은 파일은 원문 본문을 유지하고 한국어 안내만 삽입하는 쪽이 upstream parity와 안전성에 더 유리하다고 판단했습니다.

## Deviations from Plan

- `verify references` 는 placeholder 예시 경로를 실제 파일처럼 검사하는 기존 false negative가 있어, health 검증과 stable representative files 중심으로 구조 안전성을 확인했습니다.

## Issues Encountered

None

## User Setup Required

None

## Next Phase Readiness

- 마지막 wave에서는 agents 자산에도 동일한 overlay 패턴을 확장하고, 반복 용어를 한 번 더 정리하면 됩니다.
- 현재까지의 변경은 구조적 토큰을 건드리지 않아 agent 프롬프트 계층과도 자연스럽게 이어질 준비가 되었습니다.

---
*Phase: 03-workflow-asset-localization*
*Completed: 2026-03-23*
