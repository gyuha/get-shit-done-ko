# Feature Research (기능 리서치)

**Domain:** upstream sync skill for a localized vendored fork
**Researched:** 2026-03-24
**Confidence:** HIGH

## Feature Landscape (기능 지형)

### Table Stakes (Users Expect These / 기본 기대 기능)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| tracked baseline compare | maintainer는 현재 추적 버전과 upstream latest를 즉시 알아야 한다 | LOW | `get-shit-done/UPSTREAM_VERSION`를 source of truth로 사용 |
| no-op when current/ahead | 최신이 아니면 건드리지 않는 보수적 동작이 기본 기대치다 | LOW | local-ahead/current 상태를 명확한 날짜/태그와 함께 보여줘야 한다 |
| dry-run before apply | 변경 파일과 preserve 영향을 먼저 보여주는 안전장치가 필수다 | MEDIUM | touched paths, preserved paths, overlay reapply/delete 요약 필요 |
| actual apply path | 승인 후 실제로 upstream 변경을 반영할 수 있어야 한다 | MEDIUM | 2단계 반영 전략을 기본으로 지원 |
| post-apply validation | 동일 기능 보장을 위해 canonical validation이 따라와야 한다 | MEDIUM | `validate health`, `validate consistency`, `roadmap analyze`, `scripts/run-tests.cjs` |

### Differentiators (Competitive Advantage / 차별화 요소)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| source-of-truth 우선 + 루트 확장 2단계 반영 | 전체 루트 덮어쓰기보다 안전하게 업데이트를 도입할 수 있다 | HIGH | 사용자가 원한 기본 전략 |
| overlay / translation gap audit | 단순 sync가 아니라 한국어화 포크 특유의 누락 지점을 함께 잡아낸다 | HIGH | changed files 기준으로 local overlay 누락, zh-CN 재유입, 번역 미완료 점검 |
| maintainer report generation | compare/apply/validation 결과를 후속 작업 가능한 보고서로 남긴다 | MEDIUM | 다음 번 sync나 번역 phase 입력으로 재사용 가능 |

### Anti-Features (Commonly Requested, Often Problematic / 문제성 기능)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| 무조건 자동 apply | 버튼 한 번으로 끝내고 싶기 때문 | preserve path 침범, overlay 소실, 번역 깨짐 위험이 크다 | compare -> dry-run -> apply with explicit gates |
| package version만으로 sync 판단 | 구현이 쉬워 보인다 | baseline과 fork version이 분리되어 false positive/negative가 생긴다 | baseline file + GitHub releases latest compare |
| 모든 변경 자동 번역 완료 | 완전 자동화 욕구 | token-sensitive 파일에서 호환성 파손 위험이 크다 | 번역 대상 식별 + draft generation + 별도 verification |

## Feature Dependencies (기능 의존성)

```text
Tracked baseline compare
    └──requires──> current baseline file integrity

Dry-run summary
    └──requires──> import surface + preserved paths policy

Actual apply
    └──requires──> dry-run confidence
                       └──requires──> overlay backup / reapply model

Translation gap audit ──enhances──> actual apply

Package-version-only compare ──conflicts──> reliable sync eligibility
```

### Dependency Notes (의존성 메모)

- **Actual apply requires dry-run:** 변경 범위를 보지 않고 바로 반영하면 로컬 오버레이 손실 위험이 높다
- **Translation gap audit enhances actual apply:** 반영 직후 번역/로컬 overlay 누락을 잡아내야 localized fork 품질이 유지된다
- **Package-version-only compare conflicts with reliable sync eligibility:** 판단 기준을 흐리므로 금지해야 한다

## MVP Definition (MVP 정의)

### Launch With (v1 / 출시 포함)

- [ ] tracked baseline과 latest release 비교
- [ ] current/local-ahead/no-op 판단
- [ ] dry-run 및 actual apply orchestration
- [ ] preserve paths 보호 및 overlay reapply awareness
- [ ] canonical validation 실행 및 결과 보고

### Add After Validation (v1.x / 검증 후 추가)

- [ ] 변경 파일 기반 번역 대상 목록 자동 생성 — 실제 sync 흐름이 안정화된 뒤
- [ ] 단계별 apply mode 선택 UI — 유지보수자가 더 세밀한 범위를 고를 필요가 생길 때

### Future Consideration (v2+ / 미래 검토)

- [ ] 자동 번역 draft 생성과 한국어 오버레이 패치 제안
- [ ] PR/branch 생성과 changelog 초안 자동화

## Feature Prioritization Matrix (기능 우선순위 매트릭스)

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| baseline compare + no-op | HIGH | LOW | P1 |
| dry-run + apply orchestration | HIGH | MEDIUM | P1 |
| validation + equivalence audit | HIGH | MEDIUM | P1 |
| translation/overlay gap detection | HIGH | HIGH | P1 |
| auto translation drafting | MEDIUM | HIGH | P2 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis (경쟁사 기능 분석)

| Feature | Competitor A | Competitor B | Our Approach |
|---------|--------------|--------------|--------------|
| upstream sync decision | generic dependency updaters compare package versions | ad-hoc maintainer scripts compare manually | tracked upstream baseline file와 official releases를 비교 |
| safe apply | many tools patch files without local overlay semantics | repo sync scripts often assume pristine upstream fork | preserve/local overlay aware vendored refresh |
| localization audit | 일반 sync tooling은 현지화 overlay를 이해하지 못함 | 번역 여부는 수동 확인이 흔함 | 변경 파일 기준 translation/overlay gap audit 포함 |

## Sources (출처)

- Existing maintainer workflow docs — `docs/UPSTREAM-SYNC.md`, `docs/RELEASE-CHECKLIST.md`
- Existing maintainer skill — `skills/gsd-sync-upstream/SKILL.md`
- Repo helper scripts — `scripts/check-upstream-release.cjs`, `scripts/apply-upstream-refresh.cjs`

---
*Feature research for: upstream sync skill for a localized vendored fork*
*Researched: 2026-03-24*
