# Pitfalls Research (함정 리서치)

**Domain:** upstream sync and localization maintenance for a vendored fork
**Researched:** 2026-03-24
**Confidence:** HIGH

## Critical Pitfalls (치명적 함정)

### Pitfall 1: Baseline source of truth를 잘못 잡는 것

**What goes wrong:**
`package.json`이나 임의의 로컬 태그를 기준으로 update 여부를 판단해 no-op이어야 할 sync를 실행하거나, 반대로 필요한 sync를 놓친다.

**Why it happens:**
fork package version과 upstream baseline version을 같은 것으로 오해하기 쉽다.

**How to avoid:**
반드시 `get-shit-done/UPSTREAM_VERSION`와 upstream latest release만 비교한다.

**Warning signs:**
보고서에 `package_version`이 판단 근거처럼 보이거나, baseline file을 읽지 않는다.

**Phase to address:**
Phase 1

---

### Pitfall 2: preserve/local overlay를 이해하지 못한 apply

**What goes wrong:**
`.planning/`, `.codex/`, `.claude/`, localized docs 같은 로컬 자산이 덮어써지거나 사라진다.

**Why it happens:**
upstream sync를 generic repo refresh처럼 다루기 때문이다.

**How to avoid:**
dry-run에서 preserved paths와 overlay reapply/delete를 먼저 보여주고, apply는 preserve-aware helper만 사용한다.

**Warning signs:**
dry-run 없이 apply 하려 하거나, changed files 목록에 local-only path가 섞여 있다.

**Phase to address:**
Phase 2

---

### Pitfall 3: 번역/토큰 호환성 검증을 생략하는 것

**What goes wrong:**
command/path/identifier가 번역되거나 zh-CN 문서가 재유입되어 포크 정책을 깨뜨린다.

**Why it happens:**
sync 성공을 file copy 성공으로만 본다.

**How to avoid:**
변경 파일 기준으로 translation/overlay gap audit를 수행하고 token-sensitive 규칙을 체크리스트로 강제한다.

**Warning signs:**
README/nav/commands에서 경로 literal이 바뀌거나 Chinese 문서 링크가 다시 보인다.

**Phase to address:**
Phase 3

---

### Pitfall 4: validation을 일부만 돌리고 완료 처리하는 것

**What goes wrong:**
실제 런타임/installer/path conversion 회귀가 남은 상태로 merge된다.

**Why it happens:**
전체 테스트 비용을 줄이고 싶어서 일부 smoke check만 실행한다.

**How to avoid:**
`validate health`, `validate consistency`, `roadmap analyze`, focused compatibility tests, `scripts/run-tests.cjs`를 canonical sequence로 고정한다.

**Warning signs:**
보고서에 validation command가 빠져 있거나 실패를 caveat 없이 무시한다.

**Phase to address:**
Phase 4

## Technical Debt Patterns (기술 부채 패턴)

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| package version만 비교 | 구현이 단순함 | 잘못된 sync eligibility 판단 | never |
| full import straight to root | 구현이 빠름 | localized overlay 손실 위험 | 거의 never, 아주 통제된 수동 복구 상황만 |
| 번역/overlay audit 생략 | 실행 시간이 짧아짐 | 한국어 포크 품질 저하가 누적됨 | never for release-grade sync |

## Integration Gotchas (통합 함정)

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| GitHub Releases | web UI만 보고 수동 비교 | `scripts/check-upstream-release.cjs --json`으로 구조화된 결과 사용 |
| Git snapshot import | baseline/current tree 차이를 백업 없이 덮어씀 | dry-run + overlay backup/reapply path 사용 |
| validation CLI | `validate health`의 warning/degraded를 무조건 새 sync 문제로 해석 | archived milestones 등 기존 상태와 새 sync 영향 구분 |

## Performance Traps (성능 함정)

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| 전체 테스트를 무조건 매번 두 번씩 실행 | sync 루프가 느려짐 | canonical full validation + 필요시 focused precheck 구분 | 빈번한 maintainer sync에서 체감 |
| 변경 파일과 무관한 번역 전수 검토 | 검토 범위가 과도하게 커짐 | changed file manifest 기반 audit | 업데이트 파일 수가 커질 때 |

## Security Mistakes (보안 실수)

| Mistake | Risk | Prevention |
|---------|------|------------|
| 외부 fetched metadata를 검증 없이 shell arg로 전달 | 잘못된 tag/path 처리 | normalize/validate tag와 path를 helper에서 수행 |
| local secret/config를 sync 보고서에 포함 | 민감 정보 노출 | version/date/path 요약만 보고하고 secret value는 다루지 않기 |

## UX Pitfalls (UX 함정)

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| no-op 이유를 날짜/태그 없이 설명 | 유지보수자가 current/ahead 상태를 신뢰하기 어렵다 | compared baseline, latest tag, published date를 함께 표시 |
| apply 범위가 불명확 | 무엇이 바뀌는지 몰라 불안하다 | touched/preserved/overlay 목록을 명시 |
| 실패 보고가 너무 추상적 | 다음 액션을 알 수 없다 | 어떤 검증이 실패했고 어디를 봐야 하는지 구체 경로 제공 |

## "Looks Done But Isn't" Checklist

- [ ] **Version compare:** `package.json`이 아니라 `get-shit-done/UPSTREAM_VERSION`를 읽었는지 확인
- [ ] **Dry-run:** touched/preserved/overlay reapply 결과가 보고서에 있는지 확인
- [ ] **Apply:** source-of-truth 우선/루트 확장 전략이 반영됐는지 확인
- [ ] **Validation:** canonical validation과 translation/overlay gap audit가 모두 실행됐는지 확인

## Recovery Strategies (복구 전략)

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| 잘못된 apply | HIGH | worktree diff 확인, preserved/local overlay 복구, 필요 시 fresh snapshot에서 재적용 |
| translation drift | MEDIUM | changed file 목록 기준으로 token-sensitive diff 검토 후 한국어 layer 재적용 |
| false sync eligibility | LOW | baseline file/ latest release 재비교 후 no-op 또는 dry-run으로 되돌아감 |

## Pitfall-to-Phase Mapping (함정-Phase 매핑)

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| baseline source of truth 혼동 | Phase 1 | current/latest/no-op logic test와 explicit report |
| preserve/local overlay 소실 | Phase 2 | dry-run/apply summary가 preserved/overlay 항목을 보여줌 |
| translation/token drift | Phase 3 | changed file translation audit와 Chinese re-entry checks |
| validation 생략 | Phase 4 | canonical validation 결과가 모두 녹색 또는 caveat와 함께 기록됨 |

## Sources (출처)

- `docs/UPSTREAM-SYNC.md`
- `docs/RELEASE-CHECKLIST.md`
- `skills/gsd-sync-upstream/SKILL.md`
- `scripts/check-upstream-release.cjs`
- `scripts/apply-upstream-refresh.cjs`

---
*Pitfalls research for: upstream sync and localization maintenance for a vendored fork*
*Researched: 2026-03-24*
