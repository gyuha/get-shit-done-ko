# Phase 3 Research

**Phase:** 3 - Localization Gap Audit
**Date:** 2026-03-25
**Status:** Complete

## Objective

Phase 3의 목적은 upstream sync 뒤에 어떤 번역/overlay/token-sensitive 후속 작업이 필요한지 자동으로 식별하는 것이다. 현재 저장소에는 compare/apply helper와 maintainer docs가 이미 있으므로, Phase 3에서는 sync 자체를 바꾸기보다 audit helper와 보고 규칙을 추가하는 것이 맞다.

## Findings

### Existing assets

- `scripts/apply-upstream-refresh.cjs`는 baseline/upstream snapshot materialization, touched top-level entries, overlay reapply/delete 계산을 이미 수행한다.
- 현재 helper output은 top-level `touched`와 overlay 차이만 제공하므로, localization audit에 필요한 file-level changed manifest는 아직 없다.
- 프로젝트 규칙은 `AGENTS.md`에 이미 정리돼 있다: Simplified Chinese 제거, English docs 유지, token-sensitive `@` references/placeholders/XML/markdown/snippets/paths 보호.
- `docs/UPSTREAM-SYNC.md`와 `docs/RELEASE-CHECKLIST.md`는 Chinese 재유입 제거와 token-sensitive drift 확인을 maintainer rule로 설명하지만 자동화는 없다.

### Planning implications

1. Phase 3은 snapshot inputs를 재사용하는 별도 audit helper를 추가하는 것이 가장 안전하다.
2. 첫 단계에서 file-level changed manifest를 안정적으로 만들고, 이후 zh-CN/overlay/token-sensitive 분류를 쌓는 구조가 적절하다.
3. repo-local helper와 bundled helper는 Phase 1/2와 마찬가지로 같은 contract를 유지해야 한다.
4. skill/runbook은 compare -> dry-run/apply -> localization audit -> validation 순서로 확장되어야 한다.

### Scope boundary

Phase 3은 localization gap detection까지만 다룬다. validation 실행/집계와 동일 기능 보장 판정은 Phase 4로 넘긴다.

## Risks

- changed manifest가 top-level touched paths와 혼동되면 maintainer가 실제 번역 범위를 잘못 해석할 수 있다.
- zh-CN 재유입 검사가 filename만 보고 끝나면 markdown 링크/문장 내 `zh-CN` 재도입을 놓칠 수 있다.
- token-sensitive 분류가 너무 느슨하면 false positive가 많아지고, 너무 좁으면 중요한 drift 위험을 놓칠 수 있다.

## Recommended plan split

- **03-01:** file-level changed manifest와 audit helper contract를 만든다
- **03-02:** zh-CN 재유입과 localized overlay 누락 분류를 helper/tests/docs에 연결한다
- **03-03:** token-sensitive drift 후보 분류와 maintainer report wording을 마무리한다

## Files to keep in view

- `scripts/apply-upstream-refresh.cjs`
- `skills/gsd-sync-upstream/scripts/apply-upstream-refresh.cjs`
- `skills/gsd-sync-upstream/SKILL.md`
- `skills/gsd-sync-upstream/references/context.md`
- `docs/UPSTREAM-SYNC.md`
- `docs/RELEASE-CHECKLIST.md`
- `AGENTS.md`
- `tests/upstream-sync.test.cjs`

---
*Phase research complete*
