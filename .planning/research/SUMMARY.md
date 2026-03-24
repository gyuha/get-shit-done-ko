# Project Research Summary (프로젝트 리서치 요약)

**Project:** GSD Upstream Update Skill
**Domain:** upstream sync automation for a Korean-localized vendored fork
**Researched:** 2026-03-24
**Confidence:** HIGH

## Executive Summary (핵심 요약)

이 프로젝트는 일반적인 dependency updater가 아니라, localized fork 유지보수용 upstream sync workflow를 제품화하는 일에 가깝습니다. 핵심은 `get-shit-done/UPSTREAM_VERSION`를 source of truth로 삼아 upstream latest release와 비교하고, current/local-ahead/no-op 상태를 정확히 판정하는 것입니다. 이 판단은 `package.json` 버전과 분리되어야 하며, 실제로 현재 저장소도 package version `1.28.1`과 별개로 tracked upstream baseline `v1.28.0`을 유지합니다.

권장 접근은 compare -> dry-run -> apply -> validation의 4단계 오케스트레이션입니다. 여기에 localized fork 특유의 preserve paths 보호와 translation/overlay gap audit를 붙여야 이 프로젝트의 핵심 가치인 "업데이트 후에도 동일 기능 유지"를 만족할 수 있습니다. 리서치 기준 현재 upstream latest는 `v1.28.0`(2026-03-22 게시)이며, 이 저장소의 tracked baseline도 `v1.28.0`이므로 현재 시점에서는 no-op이 정답입니다.

가장 큰 리스크는 두 가지입니다. 첫째, sync eligibility를 잘못 판단해 불필요한 apply를 수행하는 것. 둘째, apply 후 번역 및 token-sensitive overlay가 조용히 깨지는 것입니다. 따라서 roadmap은 먼저 판단/미리보기/적용의 안전한 core를 만들고, 다음으로 translation-aware verification을 올리는 순서가 적절합니다.

## Key Findings (핵심 발견)

### Recommended Stack (권장 스택)

이 도메인은 새 기술을 도입할 문제가 아니라, 이미 저장소에 있는 Node.js maintainer tooling을 재사용하는 문제가 핵심입니다. `scripts/check-upstream-release.cjs`, `scripts/apply-upstream-refresh.cjs`, `get-shit-done/bin/gsd-tools.cjs`, `scripts/run-tests.cjs`를 skill/workflow 오케스트레이션에 묶는 구성이 가장 안정적입니다.

**Core technologies:**
- Node.js CLI: compare/apply/validate orchestration — 기존 repo tooling과 직접 결합 가능
- Git CLI: upstream tag snapshot materialization — 실제 파일 반영의 신뢰도 높은 기반
- Markdown/JSON planning artifacts: maintainer report와 baseline 상태 기록 — 사람/에이전트 공용 상태 저장소

### Expected Features (예상 기능)

유지보수자용 upstream sync skill의 table stakes는 비교, no-op, dry-run, apply, validation입니다. 여기에 localized fork라서 translation/overlay gap audit가 사실상 must-have 쪽에 가깝습니다.

**Must have (table stakes):**
- tracked baseline compare — users expect this
- no-op when current/ahead — users expect this
- dry-run preview — users expect this
- actual apply with preserve awareness — users expect this
- canonical validation after apply — users expect this

**Should have (competitive):**
- translation/overlay gap audit — differentiator
- source-of-truth first then root expansion strategy — differentiator

**Defer (v2+):**
- fully automatic translation drafting — not essential for launch

### Architecture Approach (아키텍처 접근)

아키텍처는 "skill/workflow layer가 orchestration을 담당하고, destructive file ops는 helper scripts에 위임"하는 방식이 적절합니다. source-of-truth baseline, import surface, preserved paths, validation sequence를 명시적 상태로 유지하고, changed files를 translation audit 입력으로 재사용하면 localized fork 유지보수에 맞는 구조가 됩니다.

**Major components:**
1. Compare engine — baseline/latest/no-op 판단
2. Sync executor — dry-run/apply, preserve/overlay 처리
3. Equivalence verifier — validation commands + translation gap audit
4. Maintainer summary — 결과/남은 작업 리포트

### Critical Pitfalls (치명적 함정)

1. **Baseline confusion** — `package.json`이 아니라 `UPSTREAM_VERSION`를 기준으로 삼아야 함
2. **Unsafe apply** — preserve/local overlay를 이해하지 못한 full overwrite를 피해야 함
3. **Translation/token drift** — sync 성공을 file copy 성공으로만 보면 안 됨
4. **Partial validation** — canonical validation과 compatibility checks를 생략하면 동일 기능 보장이 깨짐

## Implications for Roadmap (roadmap 시사점)

Based on research, suggested phase structure:

### Phase 1: Baseline Compare Core
**Rationale:** sync eligibility 판단이 모든 후속 단계의 전제다
**Delivers:** tracked baseline file, latest release compare, current/ahead/no-op reporting
**Addresses:** compare correctness, current state visibility
**Avoids:** baseline source of truth 혼동

### Phase 2: Safe Apply Orchestration
**Rationale:** 판단이 맞아도 apply가 unsafe하면 localized fork가 손상된다
**Delivers:** dry-run, source-of-truth-first apply, optional root expansion, preserve-aware execution
**Uses:** existing helper scripts and import surface policy
**Implements:** sync executor

### Phase 3: Translation and Overlay Audit
**Rationale:** 이 포크의 차별점은 localized overlay 유지이므로 sync 직후 여기서 깨지면 의미가 없다
**Delivers:** changed file 기반 번역/overlay gap detection, zh-CN re-entry checks, token-sensitive audit
**Uses:** apply output and preserved path knowledge
**Implements:** translation-aware verifier

### Phase 4: Validation and Maintainer Reporting
**Rationale:** 최종적으로 동일 기능 유지 여부를 보여줘야 maintainer workflow가 닫힌다
**Delivers:** canonical validation sequence, focused compatibility checks, actionable summary/report
**Uses:** validation CLI and test runner
**Implements:** equivalence verifier + report layer

### Phase Ordering Rationale (phase 순서 근거)

- compare correctness가 먼저 있어야 no-op/current/ahead 상태를 정확히 판단할 수 있다
- safe apply는 compare 뒤에 와야 하며, translation audit은 apply 결과를 입력으로 받아야 한다
- 최종 validation/report는 모든 파일 반영과 audit이 끝난 뒤에만 의미가 있다

### Research Flags (추가 조사 플래그)

Phases likely needing deeper research during planning:
- **Phase 2:** apply 범위를 source-of-truth only / root expansion으로 어떻게 매개변수화할지 추가 설계 필요
- **Phase 3:** translation gap detection을 어떤 heuristic/manifest 기반으로 구현할지 추가 설계 필요

Phases with standard patterns (skip research-phase):
- **Phase 1:** current/latest compare 로직은 기존 helper와 패턴이 잘 정의되어 있다

## Confidence Assessment (신뢰도 평가)

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | repo-local scripts와 official release metadata로 검증됨 |
| Features | HIGH | 현재 maintainer workflow와 사용자 요구가 명확함 |
| Architecture | HIGH | 기존 helper/script boundary가 분명함 |
| Pitfalls | HIGH | localized fork 운영 규칙과 helper docs가 이미 존재함 |

**Overall confidence:** HIGH

### Gaps to Address (해결할 공백)

- changed file 기반 translation audit 결과를 어떤 artifact로 남길지 결정 필요
- source-of-truth first apply가 실제로 어떤 import subset을 기본값으로 삼을지 planning 단계에서 확정 필요

## Sources (출처)

### Primary (HIGH confidence)
- `https://github.com/gsd-build/get-shit-done/releases/tag/v1.28.0` — latest release tag and published date
- `scripts/check-upstream-release.cjs` — compare logic
- `scripts/apply-upstream-refresh.cjs` — apply and preserve logic
- `docs/UPSTREAM-SYNC.md` — maintainer runbook
- `docs/RELEASE-CHECKLIST.md` — canonical validation sequence

### Secondary (MEDIUM confidence)
- `skills/gsd-sync-upstream/SKILL.md` — current maintainer skill workflow
- `skills/gsd-sync-upstream/references/context.md` — preserved/import surface summary

### Tertiary (LOW confidence)
- None

---
*Research completed: 2026-03-24*
*Ready for roadmap: yes*
