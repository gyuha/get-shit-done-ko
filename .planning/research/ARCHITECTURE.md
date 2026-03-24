# Architecture Research (아키텍처 리서치)

**Domain:** maintainable upstream refresh workflow for a localized GSD fork
**Researched:** 2026-03-24
**Confidence:** HIGH

## Standard Architecture (표준 아키텍처)

### System Overview (시스템 개요)

```text
┌─────────────────────────────────────────────────────────────┐
│                    Skill / Workflow Layer                  │
├─────────────────────────────────────────────────────────────┤
│  Compare Step  │  Dry-Run Step  │  Apply Step  │  Report   │
└────────┬───────────────┬──────────────┬──────────────┬──────┘
         │               │              │              │
┌────────▼───────────────▼──────────────▼──────────────▼──────┐
│                    Helper Script Layer                      │
├─────────────────────────────────────────────────────────────┤
│ check-upstream-release.cjs │ apply-upstream-refresh.cjs    │
│ gsd-tools validate/roadmap │ scripts/run-tests.cjs         │
└────────┬───────────────────────────────┬────────────────────┘
         │                               │
┌────────▼───────────────────────────────▼────────────────────┐
│                    Repository State Layer                   │
├─────────────────────────────────────────────────────────────┤
│ get-shit-done/UPSTREAM_VERSION │ docs/UPSTREAM-SYNC.md     │
│ import surface                 │ preserved local paths      │
│ localized overlays             │ .planning reports          │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities (컴포넌트 책임)

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| compare step | tracked baseline와 latest release를 비교하고 no-op 여부 판단 | `scripts/check-upstream-release.cjs` 호출 |
| sync planner | dry-run 결과에서 touched/preserved/overlay impact를 정리 | `scripts/apply-upstream-refresh.cjs --dry-run` 래핑 |
| apply executor | 승인 후 import surface를 갱신하고 overlay를 재적용 | `scripts/apply-upstream-refresh.cjs --to-tag <tag>` |
| equivalence verifier | 기능 동등성과 번역/오버레이 누락을 검증 | `gsd-tools validate ...`, targeted tests, custom audit checks |

## Recommended Project Structure (권장 프로젝트 구조)

```text
skills/
└── gsd-sync-upstream/          # maintainer-facing sync skill

scripts/
├── check-upstream-release.cjs  # latest release compare
├── apply-upstream-refresh.cjs  # vendored refresh apply
└── run-tests.cjs               # post-sync regression suite

docs/
├── UPSTREAM-SYNC.md            # maintainer runbook
└── RELEASE-CHECKLIST.md        # canonical validation checklist

get-shit-done/
└── UPSTREAM_VERSION            # tracked upstream baseline

.planning/
└── [reports or sync summaries] # optional run output / audit artifacts
```

### Structure Rationale (구조 근거)

- **`skills/gsd-sync-upstream/`:** 사용자-facing orchestration과 helper reuse 기준점을 둔다
- **`scripts/`:** compare/apply/validate를 독립 실행 가능하게 유지해 skill 밖에서도 재사용 가능하게 한다
- **`docs/`:** 사람이 따라갈 수 있는 maintainer runbook과 blocker checklist를 유지한다

## Architectural Patterns (아키텍처 패턴)

### Pattern 1: Compare -> Dry-Run -> Apply -> Validate

**What:** destructive action 전에 항상 read-only 단계와 preview 단계를 거치는 보호 패턴
**When to use:** upstream sync처럼 file tree를 크게 바꾸는 유지보수 작업
**Trade-offs:** 단계가 늘어나지만 실수 비용이 크게 줄어든다

**Example:**
```text
check-upstream-release
  -> if update_available false: no-op
  -> dry-run
  -> explicit approval / gated apply
  -> validation
```

### Pattern 2: Source-of-Truth First, Root Expansion Second

**What:** 먼저 `get-shit-done/` 같은 기준 자산을 업데이트하고, 필요 시 루트 import surface까지 확장하는 2단계 적용
**When to use:** localized fork가 runtime mirrors와 docs overlay를 함께 유지할 때
**Trade-offs:** full import보다 느리지만 blast radius가 작다

**Example:**
```text
Phase 1: update source-of-truth assets + baseline metadata
Phase 2: widen import to root surfaces and runtime-adjacent files
```

### Pattern 3: Translation-Aware Validation

**What:** sync 후 파일 존재만 보지 않고 번역 누락, zh-CN 재유입, token drift를 함께 검사
**When to use:** localized fork 유지보수
**Trade-offs:** 검증 비용이 늘지만 포크 정체성을 유지한다

## Data Flow (데이터 흐름)

### Request Flow (요청 흐름)

```text
[Maintainer Request]
    ↓
[Skill Command]
    ↓
[Compare Baseline vs Latest]
    ↓
[Dry-Run Summary]
    ↓
[Apply Refresh]
    ↓
[Validation + Translation Audit]
    ↓
[Summary Report]
```

### State Management (상태 관리)

```text
[UPSTREAM_VERSION]
    ↓
[Compare Result]
    ↓
[Dry-Run / Apply Artifacts]
    ↓
[Validation Report]
```

### Key Data Flows (핵심 데이터 흐름)

1. **Version flow:** `get-shit-done/UPSTREAM_VERSION` -> latest release metadata -> update/no-op decision
2. **Apply flow:** import surface snapshot -> preserved paths protection -> overlay reapply -> updated repo tree
3. **Verification flow:** updated repo tree -> canonical validation -> translation/overlay audit -> maintainer summary

## Scaling Considerations (확장 고려사항)

| Scale | Architecture Adjustments |
|-------|--------------------------|
| occasional maintainer sync | current scripts + skill orchestration면 충분 |
| frequent upstream releases | sync summary artifact와 targeted validation subset을 더 체계화 |
| multiple localized forks | compare/apply core를 재사용 가능한 shared helper로 분리 고려 |

### Scaling Priorities (확장 우선순위)

1. **First bottleneck:** overlay/translation drift detection 수동성 — changed file manifest 기반 audit 자동화로 해결
2. **Second bottleneck:** root-wide apply risk — selective import phase 설계로 해결

## Anti-Patterns (안티패턴)

### Anti-Pattern 1: Full repo overwrite as first move

**What people do:** 최신 upstream tree를 바로 루트에 덮어쓴다
**Why it's wrong:** localized overlays와 preserved local paths가 사라질 수 있다
**Do this instead:** source-of-truth 우선 + preserve-aware apply

### Anti-Pattern 2: Sync success = files copied

**What people do:** apply 완료만 보고 성공으로 처리한다
**Why it's wrong:** 기능 동등성과 translation gap이 검증되지 않는다
**Do this instead:** canonical validation + translation/overlay audit까지 성공 기준에 포함

## Integration Points (통합 지점)

### External Services (외부 서비스)

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| GitHub Releases | latest release metadata fetch | `scripts/check-upstream-release.cjs`가 사용 |
| upstream Git repo | tag clone / snapshot import | `scripts/apply-upstream-refresh.cjs`가 사용 |

### Internal Boundaries (내부 경계)

| Boundary | Communication | Notes |
|----------|---------------|-------|
| skill ↔ scripts | shell/CLI invocation | orchestration은 skill이, destructive file ops는 scripts가 맡는 편이 안전 |
| apply ↔ validation | sequential command boundary | apply 성공 후에만 canonical validation 실행 |
| sync ↔ translation audit | report/file manifest handoff | changed file list를 audit 입력으로 재사용 |

## Sources (출처)

- `skills/gsd-sync-upstream/SKILL.md`
- `skills/gsd-sync-upstream/references/context.md`
- `scripts/check-upstream-release.cjs`
- `scripts/apply-upstream-refresh.cjs`
- `docs/UPSTREAM-SYNC.md`

---
*Architecture research for: maintainable upstream refresh workflow for a localized GSD fork*
*Researched: 2026-03-24*
