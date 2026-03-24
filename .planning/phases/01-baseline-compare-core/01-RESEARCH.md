# Phase 1 Research

**Phase:** 1 - Baseline Compare Core
**Date:** 2026-03-24
**Status:** Complete

## Objective

Phase 1의 목적은 upstream sync eligibility 판단을 재현 가능하게 만드는 것이다. 현재 저장소에는 이미 `scripts/check-upstream-release.cjs`, `skills/gsd-sync-upstream/SKILL.md`, `skills/gsd-sync-upstream/scripts/check-upstream-release.cjs`, `tests/upstream-sync.test.cjs`, `docs/UPSTREAM-SYNC.md`가 존재하므로, 새 시스템을 처음부터 만드는 것이 아니라 이 경로들을 compare core 중심으로 정렬하는 것이 맞다.

## Findings

### Existing assets

- `scripts/check-upstream-release.cjs`는 이미 `current/latest/current_tag/latest_tag/latest_published_at/package_version/update_available/local_ahead/status`를 계산한다.
- `tests/upstream-sync.test.cjs`는 `current`, `update_available`, `ahead`, `dry-run no-op`, `apply`를 검증한다.
- `skills/gsd-sync-upstream/` 아래에는 `SKILL.md`, `references/context.md`, `scripts/check-upstream-release.cjs`, `scripts/apply-upstream-refresh.cjs`가 이미 번들되어 있다.
- 현재 실제 upstream latest와 tracked baseline이 모두 `v1.28.0`이므로, 네트워크 실시간 상태만으로는 `update_available` 시나리오를 충분히 검증할 수 없다.

### Planning implications

1. Phase 1은 helper compare contract를 source of truth 기준으로 고정해야 한다.
2. skill 문서도 `package.json`이 아니라 `get-shit-done/UPSTREAM_VERSION`를 기준으로 current/no-op/current-ahead를 설명해야 한다.
3. 테스트는 실제 네트워크 상태와 분리된 fixture/override 경로를 유지해야 한다.

### Scope boundary

Phase 1은 compare와 no-op/current/update_available/local_ahead reporting까지만 다룬다. dry-run/apply detail, translation audit, canonical validation integration은 후속 phase로 넘긴다.

## Risks

- compare contract를 바꾸면서 기존 `tests/upstream-sync.test.cjs`와 docs wording이 어긋날 수 있다.
- skill 번들 helper와 repo-local helper가 서로 drift할 수 있다.
- current no-op 시나리오만 맞고 update_available/local_ahead의 deterministic test path가 약하면 유지보수자 신뢰도가 떨어진다.

## Recommended plan split

- **01-01:** compare contract와 baseline source of truth를 helper/script/skill bundle에서 정렬
- **01-02:** maintainer-facing current/no-op/update reporting과 skill flow 문구를 정리
- **01-03:** compare edge cases를 테스트와 docs로 잠그기

## Files to keep in view

- `scripts/check-upstream-release.cjs`
- `skills/gsd-sync-upstream/scripts/check-upstream-release.cjs`
- `skills/gsd-sync-upstream/SKILL.md`
- `skills/gsd-sync-upstream/references/context.md`
- `tests/upstream-sync.test.cjs`
- `docs/UPSTREAM-SYNC.md`
- `docs/RELEASE-CHECKLIST.md`

---
*Phase research complete*
