# Roadmap: GSD Upstream Update Skill

## Overview

이 roadmap은 localized fork 유지보수용 upstream sync skill을 단계적으로 만드는 순서를 정의합니다. 먼저 tracked baseline과 latest release 비교로 안전한 판단 코어를 만들고, 그 위에 preserve-aware apply 흐름을 얹습니다. 이후 translation/overlay gap audit를 추가하고, 마지막으로 canonical validation과 maintainer 보고 체계를 붙여 “업데이트 후에도 동일 기능 유지”라는 핵심 가치를 검증 가능한 형태로 완성합니다.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): 기본 milestone 작업
- Decimal phases (2.1, 2.2): 긴급 삽입 작업 (INSERTED 표기)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Baseline Compare Core** - tracked baseline과 upstream latest를 비교해 no-op/current/update 가능 여부를 정확히 판단한다 (completed 2026-03-24)
- [ ] **Phase 2: Safe Apply Flow** - dry-run과 실제 apply를 source-of-truth 우선 전략으로 안전하게 실행한다
- [ ] **Phase 3: Localization Gap Audit** - 변경 파일 기준 번역, zh-CN 재유입, token-sensitive drift를 점검한다
- [ ] **Phase 4: Validation and Reporting** - canonical validation과 동일 기능 보장 보고 체계를 완성한다

## Phase Details

### Phase 1: Baseline Compare Core
**Goal**: tracked baseline file와 upstream latest release를 비교해 sync eligibility를 안전하게 판단하는 maintainer skill 코어를 만든다
**Depends on**: Nothing
**Requirements**: [SYNC-01, SYNC-02, SYNC-03]
**Success Criteria** (what must be TRUE):
  1. skill이 `get-shit-done/UPSTREAM_VERSION`와 upstream latest release를 비교해 current/update_available/local_ahead/no-op을 구분해 보고한다
  2. 판단 근거에 latest tag, published date, tracked baseline, package version이 분리되어 나타난다
  3. no-op이어야 할 경우 worktree를 건드리지 않는다
**Plans**: 3 plans

Plans:
- [x] 01-01: compare 입력과 baseline source of truth를 정의하고 skill entry 흐름을 고정한다
- [x] 01-02: latest release 비교 결과를 maintainer-friendly 출력으로 정리한다
- [x] 01-03: current/local-ahead/no-op 경로를 검증 가능한 테스트와 함께 마무리한다

### Phase 2: Safe Apply Flow
**Goal**: dry-run과 실제 apply를 preserve-aware하게 실행하고 source-of-truth 우선 반영 전략을 구현한다
**Depends on**: Phase 1
**Requirements**: [APPLY-01, APPLY-02, APPLY-03, APPLY-04]
**Success Criteria** (what must be TRUE):
  1. skill이 apply 전에 touched paths, preserved paths, overlay reapply/delete 목록을 보여준다
  2. 기본 apply가 source-of-truth 우선 전략으로 동작하고 preserve 목록을 보호한다
  3. 필요 시 루트 import surface 확장 반영 경로를 유지보수자가 선택할 수 있다
**Plans**: 3 plans

Plans:
- [ ] 02-01: dry-run 결과를 structured summary로 정리한다
- [ ] 02-02: source-of-truth 우선 apply mode를 구현한다
- [ ] 02-03: 루트 확장 반영 옵션과 preserve 경로 보호를 검증한다

### Phase 3: Localization Gap Audit
**Goal**: sync 후 localized fork 품질을 지키기 위해 번역/overlay/token drift를 자동 점검한다
**Depends on**: Phase 2
**Requirements**: [L10N-01, L10N-02, L10N-03]
**Success Criteria** (what must be TRUE):
  1. apply 결과 기준으로 번역/overlay 누락 파일을 식별해 보고할 수 있다
  2. Chinese 문서 또는 `zh-CN` 링크 재유입 여부를 잡아낼 수 있다
  3. token-sensitive 파일에서 command/path/identifier drift 위험을 분류할 수 있다
**Plans**: 3 plans

Plans:
- [ ] 03-01: changed file manifest를 translation audit 입력으로 정리한다
- [ ] 03-02: zh-CN 및 한국어 overlay 누락 점검을 구현한다
- [ ] 03-03: token-sensitive drift 검사와 결과 보고를 연결한다

### Phase 4: Validation and Reporting
**Goal**: sync 후 동일 기능 보장을 검증하고 maintainer가 바로 후속 조치를 할 수 있는 보고 체계를 완성한다
**Depends on**: Phase 3
**Requirements**: [VAL-01, VAL-02, VAL-03, RPT-01, RPT-02]
**Success Criteria** (what must be TRUE):
  1. skill이 canonical validation sequence와 전체 테스트를 실행하고 결과를 수집한다
  2. 동일 기능 보장 여부가 검증 결과와 caveat와 함께 요약된다
  3. 실패 시 후속 조치 가능한 보고서가 생성된다
**Plans**: 3 plans

Plans:
- [ ] 04-01: canonical validation sequence를 skill 흐름에 통합한다
- [ ] 04-02: 동일 기능 보장 판정과 caveat 모델을 정의한다
- [ ] 04-03: maintainer summary/report artifact를 마무리한다

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Baseline Compare Core | 3/3 | Complete    | 2026-03-24 |
| 2. Safe Apply Flow | 0/3 | Not started | - |
| 3. Localization Gap Audit | 0/3 | Not started | - |
| 4. Validation and Reporting | 0/3 | Not started | - |
