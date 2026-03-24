# Requirements: GSD Upstream Update Skill

**Defined:** 2026-03-24
**Core Value:** upstream 변경을 가져온 뒤에도 `get-shit-done-ko`가 동일한 기능을 유지하도록, 안전하게 반영하고 검증 가능한 업데이트 흐름을 제공한다.

## v1 Requirements

이번 milestone에서 실제로 구현하고 검증할 요구사항입니다.

### Upstream Sync

- [x] **SYNC-01**: 스킬이 `get-shit-done/UPSTREAM_VERSION`를 읽어 현재 추적 중인 upstream baseline을 확인할 수 있다
- [x] **SYNC-02**: 스킬이 upstream latest release tag와 published date를 확인하고 current/update_available/local_ahead 상태를 판단할 수 있다
- [x] **SYNC-03**: upstream latest가 tracked baseline보다 새롭지 않으면 no-op으로 종료하고 비교 결과를 보고할 수 있다

### Apply Flow

- [ ] **APPLY-01**: 스킬이 dry-run으로 touched paths, preserved paths, overlay reapply/delete 목록을 보여줄 수 있다
- [ ] **APPLY-02**: 스킬이 source-of-truth 우선 반영을 기본값으로 실제 apply를 수행할 수 있다
- [ ] **APPLY-03**: 스킬이 필요 시 루트 import surface 확장 반영을 후속 단계로 지원할 수 있다
- [ ] **APPLY-04**: apply 동안 preserve 목록에 있는 로컬 경로를 보호할 수 있다

### Localization Audit

- [ ] **L10N-01**: 스킬이 변경 파일 기준으로 한국어 번역/로컬 overlay 누락 여부를 점검할 수 있다
- [ ] **L10N-02**: 스킬이 중국어 문서나 `zh-CN` 링크 재유입 여부를 점검할 수 있다
- [ ] **L10N-03**: 스킬이 token-sensitive command/path/identifier drift 위험 파일을 식별해 보고할 수 있다

### Validation

- [ ] **VAL-01**: 스킬이 apply 후 `validate health`, `validate consistency`, `roadmap analyze`를 순서대로 실행할 수 있다
- [ ] **VAL-02**: 스킬이 compatibility 관련 집중 검증 또는 전체 테스트(`scripts/run-tests.cjs`)를 실행할 수 있다
- [ ] **VAL-03**: 스킬이 업데이트 후 동일 기능 보장 여부를 검증 결과와 함께 요약할 수 있다

### Reporting

- [ ] **RPT-01**: 스킬이 tracked baseline, latest release, package version, apply mode를 포함한 요약 리포트를 남길 수 있다
- [ ] **RPT-02**: 스킬이 검증 실패나 번역 누락이 있을 때 후속 조치 가능한 항목으로 보고할 수 있다

## v2 Requirements

이번 roadmap에는 넣지 않지만 추후 후보로 추적할 요구사항입니다.

### Translation

- **TRNS-01**: 스킬이 변경된 upstream 파일에 대한 한국어 초안 번역 패치를 자동 생성할 수 있다
- **TRNS-02**: 스킬이 번역 적용 후 README/nav/doc overlay를 자동 재정렬할 수 있다

### Automation

- **AUTO-01**: 스킬이 sync branch 생성과 PR 초안 작성을 자동으로 수행할 수 있다
- **AUTO-02**: 스킬이 phase/summary artifact를 기반으로 changelog 초안을 생성할 수 있다

## Out of Scope

이번 범위에서 명시적으로 제외한 항목입니다.

| Feature | Reason |
|---------|--------|
| 임의의 외부 저장소를 일반화된 입력으로 처리하는 범용 업데이터 | 현재 목적은 `gsd-build/get-shit-done` upstream maintainer workflow에 집중 |
| 무조건 승인 없이 전체 루트를 자동 덮어쓰는 destructive sync | localized fork의 preserve/overlay 구조에 위험이 큼 |
| v1에서 완전 자동 번역 완료 | token-sensitive 파일에서 품질 보장이 어려워 우선 검증 중심으로 간다 |

## Traceability

요구사항과 roadmap phase의 연결 관계를 기록합니다.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SYNC-01 | Phase 1 | Complete |
| SYNC-02 | Phase 1 | Complete |
| SYNC-03 | Phase 1 | Complete |
| APPLY-01 | Phase 2 | Pending |
| APPLY-02 | Phase 2 | Pending |
| APPLY-03 | Phase 2 | Pending |
| APPLY-04 | Phase 2 | Pending |
| L10N-01 | Phase 3 | Pending |
| L10N-02 | Phase 3 | Pending |
| L10N-03 | Phase 3 | Pending |
| VAL-01 | Phase 4 | Pending |
| VAL-02 | Phase 4 | Pending |
| VAL-03 | Phase 4 | Pending |
| RPT-01 | Phase 4 | Pending |
| RPT-02 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 15 total
- Mapped to phases: 15
- Unmapped: 0

---
*Requirements defined: 2026-03-24*
*Last updated: 2026-03-24 after initialization*
