# GSD Upstream Update Skill

## What This Is

이 프로젝트는 upstream `get-shit-done`의 최신 버전을 현재 `get-shit-done-ko` 저장소와 비교하고, 변경된 파일을 안전하게 가져와 반영하는 GSD 스킬을 만드는 작업입니다. 기본 목적은 upstream 업데이트를 반자동이 아니라 재현 가능하고 검증 가능한 워크플로로 바꾸는 것이며, 현재 포크의 한국어화/오버레이 구조를 깨지 않으면서 최신 변경을 흡수할 수 있어야 합니다.

이 스킬은 우선 실제 업데이트 반영까지 수행해야 하고, 이후 단계에서 번역 진행과 번역 누락 검증까지 이어질 수 있는 기반을 제공해야 합니다. 브라운필드 저장소에서 동작하므로 현재 코드베이스의 source-of-truth 자산, preserve 정책, 검증 명령을 모두 이해한 상태에서 실행되어야 합니다.

## Core Value

upstream 변경을 가져온 뒤에도 `get-shit-done-ko`가 동일한 기능을 유지하도록, 안전하게 반영하고 검증 가능한 업데이트 흐름을 제공한다.

## Requirements

### Validated

- ✓ upstream baseline을 `get-shit-done/UPSTREAM_VERSION`으로 추적한다 — existing
- ✓ upstream 비교와 적용을 위한 유지보수 스크립트가 이미 존재한다 (`scripts/check-upstream-release.cjs`, `scripts/apply-upstream-refresh.cjs`) — existing
- ✓ 현재 저장소는 source-of-truth 자산, runtime mirror, 테스트/검증 명령을 이미 갖추고 있다 — existing

### Active

- [ ] upstream 현재 기록 버전과 latest 버전을 비교해 업데이트 가능 여부를 판단하는 스킬 흐름을 만든다
- [ ] 기본은 안전한 2단계 반영(source-of-truth 우선, 필요 시 루트 확장)으로 변경 파일을 현재 프로젝트에 실제 반영할 수 있어야 한다
- [ ] preserve 목록과 로컬 오버레이를 보호하면서 적용 결과를 요약 보고해야 한다
- [ ] 업데이트 후 동일 기능 보장을 위해 파일 존재, 번역/오버레이 누락, 핵심 검증 명령 통과 여부까지 확인해야 한다

### Out of Scope

- upstream 변경을 무조건 전부 자동 번역 완료까지 한 번에 마무리하는 것 — 이번 범위는 우선 안전한 업데이트 반영과 검증 자동화가 핵심이다
- 임의의 제3자 포크나 다른 저장소를 일반화된 입력으로 지원하는 것 — 대상은 `https://github.com/gsd-build/get-shit-done` upstream 기준이다

## Context

- 현재 저장소는 한국어 현지화 포크이며 upstream `v1.28.0` 기준선을 유지한다
- `.planning/codebase/` 코드베이스 맵이 이미 생성되어 있고, 업데이트 흐름은 브라운필드 유지보수 작업이다
- 저장소에는 이미 upstream release 비교 스크립트와 refresh 적용 스크립트가 존재하지만, 이를 자연어 기반 GSD 스킬 워크플로로 정리하려는 요구가 있다
- 사용자는 최신 버전 비교 후 실제 반영까지 자동화하길 원하며, 검증 수준은 단순 diff가 아니라 기능 동등성/번역 및 오버레이 누락까지 포함하길 원한다

## Constraints

- **Compatibility**: commands, flags, filenames, directory names, identifiers, phase/requirement IDs는 유지해야 한다 — 한국어 포크의 비호환 변경을 막기 위해
- **Safety**: 업데이트 반영은 2단계 적용을 기본으로 해야 한다 — source-of-truth 자산 우선, 루트 파일은 필요 시 확장
- **Verification**: 반영 후 동일 기능 검증이 반드시 있어야 한다 — 단순 파일 복사만으로 완료 처리할 수 없다
- **Scope**: 대상 upstream은 `https://github.com/gsd-build/get-shit-done` 하나로 고정한다 — 유지보수 흐름을 단순하게 유지하기 위해

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 스킬은 실제 `apply`까지 수행한다 | 사용자는 dry-run이 아니라 현재 프로젝트 반영까지 원함 | — Pending |
| 반영 전략은 2단계 적용을 기본으로 한다 | source-of-truth 자산을 먼저 안전하게 업데이트하고 루트 확장은 선택적으로 열기 위해 | — Pending |
| 성공 기준에 기능 동등성 검증을 포함한다 | 업데이트 후 동일 기능 보장이 핵심 가치이기 때문 | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `$gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `$gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-24 after initialization*
