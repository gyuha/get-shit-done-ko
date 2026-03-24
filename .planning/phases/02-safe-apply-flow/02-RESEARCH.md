# Phase 2 Research

**Phase:** 2 - Safe Apply Flow
**Date:** 2026-03-25
**Status:** Complete

## Objective

Phase 2의 목적은 compare core 위에 실제 dry-run/apply 흐름을 얹어, 유지보수자가 upstream refresh를 안전하게 검토하고 반영할 수 있게 만드는 것이다. 현재 저장소에는 이미 `scripts/apply-upstream-refresh.cjs`, `skills/gsd-sync-upstream/scripts/apply-upstream-refresh.cjs`, `tests/upstream-sync.test.cjs`, `skills/gsd-sync-upstream/SKILL.md`, `docs/UPSTREAM-SYNC.md`, `docs/RELEASE-CHECKLIST.md`가 존재하므로, 새 도구를 만드는 대신 dry-run contract, apply mode, import surface 선택 경로를 명시적으로 정렬하는 것이 맞다.

## Findings

### Existing assets

- `scripts/apply-upstream-refresh.cjs`는 이미 dry-run/apply 공통 로직, baseline/upstream snapshot materialization, overlay reapply/delete 계산, tracked baseline file 업데이트를 수행한다.
- repo-local helper와 `skills/gsd-sync-upstream/scripts/apply-upstream-refresh.cjs`는 현재 동일한 구현을 갖고 있어, Phase 2에서도 parity를 유지하는 것이 중요하다.
- `tests/upstream-sync.test.cjs`는 no-op dry-run, update_available dry-run, 실제 apply, preserved path 보존을 이미 검증한다.
- maintainer-facing 문서에는 dry-run/apply 순서가 설명돼 있지만, structured dry-run report의 정확한 필드와 source-of-truth apply mode의 기본값, import surface 확장 선택 경로는 아직 덜 고정돼 있다.

### Planning implications

1. Phase 2는 dry-run 결과를 maintainer가 바로 읽을 수 있는 structured contract로 잠가야 한다.
2. 실제 apply는 기본적으로 source-of-truth mode여야 하며, skill/docs/helper 모두 같은 이름과 의미를 사용해야 한다.
3. 향후 upstream 루트 import surface를 넓혀야 할 경우를 대비해, 기본 import entries를 깨뜨리지 않는 opt-in 확장 경로가 필요하다.
4. preserve paths와 overlay reapply/delete는 docs wording만이 아니라 deterministic test로 계속 보호해야 한다.

### Scope boundary

Phase 2는 dry-run/apply flow와 preserve-aware import surface 선택까지만 다룬다. 변경 파일 기준 번역 누락 audit, zh-CN 재유입 점검, token-sensitive drift 분류는 Phase 3으로 넘긴다. canonical validation 결과를 maintainer report로 종합하는 작업은 Phase 4로 넘긴다.

## Risks

- dry-run result shape를 바꾸면서 bundled helper와 repo-local helper가 drift할 수 있다.
- apply mode를 명시화하는 과정에서 no-op guard나 tracked baseline update path가 흔들리면 destructive behavior가 생길 수 있다.
- import surface 확장 옵션이 preserve paths 보호보다 먼저 작동하면 `.planning/`이나 maintainer overlay를 손상시킬 수 있다.
- docs가 helper의 실제 flag/field 이름과 다르면 유지보수자가 잘못된 명령을 실행할 수 있다.

## Recommended plan split

- **02-01:** dry-run summary contract와 maintainer-facing 출력 필드를 helper/tests/docs에서 고정
- **02-02:** source-of-truth apply mode를 명시적 CLI contract로 만들고 skill/docs와 실제 동작을 정렬
- **02-03:** optional import surface extension 경로와 preserve path 보호를 helper/tests/docs에서 잠금

## Files to keep in view

- `scripts/apply-upstream-refresh.cjs`
- `skills/gsd-sync-upstream/scripts/apply-upstream-refresh.cjs`
- `tests/upstream-sync.test.cjs`
- `skills/gsd-sync-upstream/SKILL.md`
- `skills/gsd-sync-upstream/references/context.md`
- `docs/UPSTREAM-SYNC.md`
- `docs/RELEASE-CHECKLIST.md`

---
*Phase research complete*
