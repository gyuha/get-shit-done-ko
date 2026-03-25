# Phase 4: validation-and-reporting - Research

**Researched:** 2026-03-25
**Domain:** upstream sync validation orchestration and maintainer reporting
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
### Validation Execution Policy
- **D-01:** 기본 검증 경로는 `validate health` → `validate consistency` → `roadmap analyze` → `scripts/run-tests.cjs` 전체 실행으로 고정한다.
- **D-02:** 빠른 검증은 maintainer의 명시적 opt-in일 때만 허용한다. 기본 동작은 항상 전체 실행이다.
- **D-03:** 빠른 검증에서도 `validate health`, `validate consistency`, `roadmap analyze`는 항상 실행한다.
- **D-04:** 빠른 검증의 테스트 범위는 임의 선택이 아니라 compatibility-focused 고정 묶음으로 잠근다.
- **D-05:** 빠른 검증은 dry-run/localization audit 결과가 깨끗할 때만 허용한다.
- **D-06:** 빠른 검증 테스트 묶음에는 기존 install/runtime 집중 테스트에 더해 `tests/upstream-sync.test.cjs`, `tests/localization-gap-audit.test.cjs` 같은 sync 직접 관련 테스트를 포함한다.

### Final Verdict Model
- **D-07:** 최종 verdict는 `pass / pass-with-caveats / partial / fail` 4단계 모델을 사용한다.
- **D-08:** `partial`은 허용된 빠른 검증만 완료된 상태를 뜻한다. 사람 검토 잔여 때문에 `partial`로 내리지 않는다.
- **D-09:** `pass-with-caveats`는 자동 검증은 통과했지만 사람이 이어서 확인하거나 처리할 항목이 남은 상태를 뜻한다.
- **D-10:** `fail`에는 검증 명령 실패뿐 아니라 `zh_cn_reintroduced`, preserved path 침범, token-sensitive drift 확정 같은 명백한 정책 위반도 포함한다.

### Reporting Artifacts
- **D-11:** validation/reporting 결과는 `.planning/phases/04-validation-and-reporting/` 아래 phase artifact로 남긴다.
- **D-12:** 보고 결과는 JSON + Markdown 두 형식 모두 생성한다.
- **D-13:** 실행별 상세 report 파일을 남기고, 최신 상태를 가리키는 index 또는 포인터 파일도 함께 유지한다.
- **D-14:** 각 report에는 tracked baseline, latest release, apply mode, final verdict, 빠른 검증 여부, 실행한 검증 명령 목록, 각 결과, audit 요약, caveats, next actions를 포함한다.

### Failure Routing And Follow-up
- **D-15:** failure 후 동작은 단일 규칙이 아니라 케이스별 routing으로 처리한다.
- **D-16:** 정책 위반과 구조 무결성 실패(`validate consistency` 실패, `roadmap analyze` 자체 실패 등)는 즉시 중단한다.
- **D-17:** 테스트 실패나 `validate health` 실패는 즉시 중단하지 않고 가능한 검사를 계속 수행해 action list를 풍부하게 남긴다.
- **D-18:** fail이 아니지만 후속 조치가 필요한 항목은 `owner + severity`로 분류한다.

### Claude's Discretion
- 빠른 검증 허용 여부를 판단할 때 dry-run/audit 결과 중 어떤 신호를 "깨끗함"으로 볼지 세부 판정 규칙
- 실행별 report 파일명과 latest index 파일명 규칙
- `owner + severity` 분류의 구체 enum과 Markdown/JSON 표현 방식

### Deferred Ideas (OUT OF SCOPE)
없음 — discussion이 phase 범위 안에서 유지됨
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| VAL-01 | 스킬이 apply 후 `validate health`, `validate consistency`, `roadmap analyze`를 순서대로 실행할 수 있다 | Canonical sequence is already fixed in `docs/UPSTREAM-SYNC.md` and `docs/RELEASE-CHECKLIST.md`; Phase 4 should orchestrate and capture their structured outputs instead of redefining them. |
| VAL-02 | 스킬이 compatibility 관련 집중 검증 또는 전체 테스트(`scripts/run-tests.cjs`)를 실행할 수 있다 | Quick path must be an explicit, fixed bundle built from existing compatibility tests plus sync-specific tests; default remains full `scripts/run-tests.cjs`. |
| VAL-03 | 스킬이 업데이트 후 동일 기능 보장 여부를 검증 결과와 함께 요약할 수 있다 | Verdict should be derived from command outcomes plus localization audit and policy signals, then summarized into one deterministic decision artifact. |
| RPT-01 | 스킬이 tracked baseline, latest release, package version, apply mode를 포함한 요약 리포트를 남길 수 있다 | Existing compare/apply helpers already emit these fields; Phase 4 should normalize them into run-scoped JSON + Markdown artifacts plus a latest pointer. |
| RPT-02 | 스킬이 검증 실패나 번역 누락이 있을 때 후속 조치 가능한 항목으로 보고할 수 있다 | Localization audit already yields `overlay_missing`, `zh_cn_reintroduced`, `token_sensitive_candidates`; Phase 4 should convert them into owner/severity-tagged next actions. |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- Preserve upstream `v1.28.0` layout and runtime compatibility.
- Keep commands, file paths, placeholders, and identifiers unchanged.
- Keep English docs available; Simplified Chinese stays removed.
- Do not break `@` references, markdown links, snippets, CLI examples, or tests during localization-related reporting.
- Keep translation terminology consistent across docs, prompts, templates, and comments.
- Start file-changing work through a GSD workflow; Phase 4 planning should assume execution happens via the existing GSD phase flow, not ad hoc scripts.

## Summary

Phase 4 is not a new validation engine. The repository already has the command surfaces, audit signals, and test infrastructure needed to determine whether an upstream sync preserved behavior. The missing work is orchestration: run the canonical sequence in the locked order, preserve structured outputs, derive one verdict model, and emit maintainer-facing artifacts in JSON and Markdown.

The main planning risk is treating this as a single pass/fail wrapper. The locked decisions require two different failure policies: structural/policy failures must stop immediately, while test and health failures should keep collecting evidence so the maintainer gets a complete action list. That means the implementation should separate command execution, finding classification, verdict derivation, and artifact rendering instead of mixing them into one linear script.

**Primary recommendation:** Build Phase 4 as a thin orchestration/reporting layer over existing helpers, with one normalized run record feeding both the verdict engine and the JSON/Markdown report writers.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Node.js | `>=20.0.0` required, local env `v24.13.0` | Run all repo scripts, CLI tools, and tests | Already required by `package.json`; no new runtime should be introduced |
| `get-shit-done/bin/gsd-tools.cjs` | repo-local | Execute `validate health`, `validate consistency`, `roadmap analyze` | Canonical validation surface already exists and is tested |
| `scripts/run-tests.cjs` | repo-local | Run the full Node test suite deterministically | Existing cross-platform full-suite entrypoint |
| Node built-in test runner (`node --test`) | bundled with Node 20+ | Run compatibility-focused subsets | Already used across repo tests and release docs |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `scripts/check-upstream-release.cjs` | repo-local | Provide tracked baseline, latest release, package version metadata | Always, when report needs release context |
| `scripts/apply-upstream-refresh.cjs` | repo-local | Provide apply-mode, touched/preserved paths, overlay reapply/delete data | Always, when report needs apply context |
| `scripts/audit-localization-gap.cjs` | repo-local | Provide localization findings and policy signals | Always, for quick-validation gating and final action items |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Repo-local orchestration over existing helpers | New standalone reporting framework | Unnecessary abstraction; would duplicate already-tested command and audit logic |
| Fixed compatibility bundle | Free-form test selection flags | Violates D-04 and weakens comparability across runs |
| JSON + Markdown artifacts | Console-only summary | Fails D-12/D-13 and is not planner/verifier friendly |

**Installation:**
```bash
npm install
```

**Version verification:** No new packages are required for Phase 4. Verified local execution environment on 2026-03-25: Node `v24.13.0`, npm `11.6.2`, git `2.53.0`. Repo engine floor remains `>=20.0.0` from `package.json`.

## Architecture Patterns

### Recommended Project Structure
```text
scripts/
├── phase-4 validation orchestrator   # new entrypoint or helper module
├── existing compare/apply/audit      # reuse as data providers
└── report rendering helpers          # JSON + Markdown serialization

.planning/phases/04-validation-and-reporting/
├── 04-RESEARCH.md
├── validation-report-<stamp>.json    # run-scoped machine artifact
├── validation-report-<stamp>.md      # run-scoped human artifact
└── latest.{json,md} or pointer file   # stable read target for newest run
```

### Pattern 1: Orchestrated Validation Pipeline
**What:** Execute the locked validation order first, then run either the quick compatibility bundle or the full test suite, then classify findings.
**When to use:** Every apply completion path that proceeds past compare/dry-run and localization audit.
**Example:**
```bash
node get-shit-done/bin/gsd-tools.cjs validate health --raw
node get-shit-done/bin/gsd-tools.cjs validate consistency --raw
node get-shit-done/bin/gsd-tools.cjs roadmap analyze --raw
node scripts/run-tests.cjs
```
Source: `docs/UPSTREAM-SYNC.md`, `docs/RELEASE-CHECKLIST.md`

### Pattern 2: Normalize Inputs Before Deriving Verdict
**What:** Convert compare/apply/audit/validation outputs into one in-memory run record before any verdict logic.
**When to use:** Always; it keeps JSON and Markdown output in sync and prevents duplicated decision logic.
**Example:**
```javascript
const runRecord = {
  release: compareResult,
  apply: dryRunOrApplyResult,
  audit: localizationAudit,
  checks: [
    { name: 'validate health', result: healthResult },
    { name: 'validate consistency', result: consistencyResult },
    { name: 'roadmap analyze', result: roadmapResult },
    { name: 'tests', result: testResult },
  ],
};
```
Source: repo pattern derived from `scripts/check-upstream-release.cjs`, `scripts/apply-upstream-refresh.cjs`, `scripts/audit-localization-gap.cjs`

### Pattern 3: Typed Finding Classification Before Rendering
**What:** Split findings into `blocking_failures`, `caveats`, and `next_actions`, then map those to `pass`, `pass-with-caveats`, `partial`, or `fail`.
**When to use:** After command execution is complete or intentionally stopped.
**Example:**
```javascript
if (policyViolationFound || consistencyFailed) verdict = 'fail';
else if (quickValidationOnly) verdict = 'partial';
else if (nextActions.length > 0) verdict = 'pass-with-caveats';
else verdict = 'pass';
```
Source: locked decisions in `04-CONTEXT.md`

### Anti-Patterns to Avoid
- **Recomputing compare/apply/audit facts manually:** existing helpers already emit the required metadata and are tested.
- **Fail-fast on every non-zero exit:** violates D-17 and loses maintainer action context.
- **Quick-mode as arbitrary flags:** violates D-04 and produces incomparable reports.
- **Rendering Markdown and JSON separately from different data:** causes drift between machine and human artifacts.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Baseline/latest release metadata | New GitHub release parser | `scripts/check-upstream-release.cjs` | Already handles tracked baseline, latest release, published date, package version, and offline overrides |
| Apply summary | Custom diff summary | `scripts/apply-upstream-refresh.cjs` dry-run/apply result | Already exposes touched paths, preserved paths, overlay reapply/delete, no-op semantics |
| Localization finding extraction | New translation/policy scanner | `scripts/audit-localization-gap.cjs` | Already emits `overlay_missing`, `zh_cn_reintroduced`, `token_sensitive_candidates` |
| Health/consistency checking | Ad hoc filesystem checks | `node get-shit-done/bin/gsd-tools.cjs validate health|consistency|roadmap analyze` | Existing CLI contracts and tests already define these behaviors |
| Test discovery | New shell glob logic | `scripts/run-tests.cjs` and explicit `node --test` bundle | Existing runner is cross-platform and deterministic |

**Key insight:** Phase 4 complexity is in policy composition and evidence packaging, not in raw validation primitives.

## Common Pitfalls

### Pitfall 1: Treating `validate health` failure as an immediate stop
**What goes wrong:** The run aborts before tests and audit-derived action items are collected.
**Why it happens:** Health failures feel structural, but D-17 explicitly allows continued evidence gathering for health/test failures.
**How to avoid:** Distinguish hard-stop failures (`validate consistency`, `roadmap analyze` execution failure, explicit policy violations) from soft-stop failures (health/test failures).
**Warning signs:** Report ends with one failed command and no follow-up action list.

### Pitfall 2: Letting quick validation become user-selectable test soup
**What goes wrong:** Different runs cannot be compared, and `partial` loses meaning.
**Why it happens:** It is tempting to reuse arbitrary `node --test` file lists.
**How to avoid:** Define one fixed compatibility bundle and gate it behind explicit opt-in plus a clean dry-run/audit state.
**Warning signs:** Quick mode takes free-form test arguments or produces different bundles between runs.

### Pitfall 3: Conflating caveats with blockers
**What goes wrong:** Human follow-up items incorrectly downgrade successful full validation to `partial` or `fail`.
**Why it happens:** Audit findings and manual checks are mixed together without a classification layer.
**How to avoid:** Map only incomplete quick validation to `partial`; map post-success human follow-up to `pass-with-caveats`.
**Warning signs:** Reports mark manual README review or non-breaking wording notes as `fail`/`partial`.

### Pitfall 4: Writing reports directly from stdout text
**What goes wrong:** Markdown becomes hard to diff and JSON is missing fields or status fidelity.
**Why it happens:** Command output is easy to append directly.
**How to avoid:** Parse `--raw` JSON where available, normalize plain-text results where necessary, and render from a typed record.
**Warning signs:** Latest report cannot be consumed reliably by later automation.

## Code Examples

Verified patterns from project sources:

### Canonical Validation Sequence
```bash
node get-shit-done/bin/gsd-tools.cjs validate health
node get-shit-done/bin/gsd-tools.cjs validate consistency
node get-shit-done/bin/gsd-tools.cjs roadmap analyze
node scripts/run-tests.cjs
```
Source: `docs/UPSTREAM-SYNC.md`, `docs/RELEASE-CHECKLIST.md`

### Compatibility-Focused Quick Bundle Baseline
```bash
node --test \
  tests/path-replacement.test.cjs \
  tests/runtime-converters.test.cjs \
  tests/codex-config.test.cjs \
  tests/antigravity-install.test.cjs \
  tests/copilot-install.test.cjs \
  tests/upstream-sync.test.cjs \
  tests/localization-gap-audit.test.cjs
```
Source: compatibility bundle from `docs/UPSTREAM-SYNC.md` plus locked D-06 in `04-CONTEXT.md`

### Dry-Run / Audit Fields to Reuse
```javascript
{
  tracked: compare.current_tag,
  latest: compare.latest_tag,
  applyMode: apply.apply_mode,
  touched: apply.touched,
  preserved: apply.preserved,
  overlayReapply: audit.overlay_reapply,
  overlayDelete: audit.overlay_delete,
  overlayMissing: audit.overlay_missing,
  zhCnReintroduced: audit.zh_cn_reintroduced,
  tokenSensitive: audit.token_sensitive_candidates
}
```
Source: `scripts/check-upstream-release.cjs`, `scripts/apply-upstream-refresh.cjs`, `scripts/audit-localization-gap.cjs`

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual maintainer checklist only | Scripted compare/apply/audit plus documented canonical validation | Phases 1-3, 2026-03-24 to 2026-03-25 | Phase 4 can focus on orchestration and reporting rather than inventing new checks |
| Release readiness inferred from console output | Structured helper outputs and `--raw` validation responses | Existing repo state as of 2026-03-25 | Planner should require machine-readable report generation |
| Localization issues treated as generic TODOs | `overlay_missing`, `zh_cn_reintroduced`, `token_sensitive_candidates` are distinct classes | Phase 3, 2026-03-25 | Phase 4 can map these directly to severity/owner routing |

**Deprecated/outdated:**
- Console-only “looks green” validation: insufficient for D-12/D-13 because it cannot support stable artifacts or downstream reads.
- Ad hoc release interpretation: superseded by `docs/UPSTREAM-SYNC.md` and `docs/RELEASE-CHECKLIST.md`.

## Open Questions

1. **Latest pointer file format**
   - What we know: D-13 requires a stable latest pointer or index file alongside per-run artifacts.
   - What's unclear: whether the stable target should be duplicated content (`latest.json`, `latest.md`) or a manifest file pointing to timestamped reports.
   - Recommendation: prefer duplicated `latest.json` and `latest.md` generated from the same run record; it is simpler for downstream agents than resolving indirection.

2. **`owner + severity` enum design**
   - What we know: D-18 requires explicit classification for non-fail follow-ups.
   - What's unclear: final enum names and whether Markdown should render them as badges, tables, or flat bullets.
   - Recommendation: keep enums small and operational, e.g. `owner: maintainer|translator|runtime`, `severity: blocker|major|minor|info`.

3. **Quick-validation cleanliness gate**
   - What we know: quick mode is allowed only when dry-run/localization audit is “clean”.
   - What's unclear: whether `overlay_missing` alone should disqualify quick mode or only hard policy signals (`zh_cn_reintroduced`, preserved path issues, token-sensitive drift confirmations).
   - Recommendation: minimum hard gate should reject quick mode on any policy violation or unresolved token-sensitive finding; planner should make the exact rule explicit in Wave 0.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | All validation scripts and tests | ✓ | `v24.13.0` | — |
| npm | Repo install/bootstrap | ✓ | `11.6.2` | — |
| git | Upstream snapshot helpers and local repo operations | ✓ | `2.53.0` | — |
| GitHub API (`api.github.com`) | Live latest-release metadata in compare/report flows | ✓ | HTTP 200 on 2026-03-25 | Use `--latest-tag` and `--latest-published-at` overrides for offline/test runs |

**Missing dependencies with no fallback:**
- None.

**Missing dependencies with fallback:**
- None.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Node built-in test runner (`node --test`) |
| Config file | none |
| Quick run command | `node --test tests/path-replacement.test.cjs tests/runtime-converters.test.cjs tests/codex-config.test.cjs tests/antigravity-install.test.cjs tests/copilot-install.test.cjs tests/upstream-sync.test.cjs tests/localization-gap-audit.test.cjs -x` |
| Full suite command | `node scripts/run-tests.cjs` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| VAL-01 | Canonical sequence runs in order and records each result | integration | `node --test tests/validation-reporting.test.cjs -x` | ❌ Wave 0 |
| VAL-02 | Full suite vs fixed quick bundle selection is enforced correctly | integration | `node --test tests/validation-reporting.test.cjs -x` | ❌ Wave 0 |
| VAL-03 | Verdict derivation matches `pass/pass-with-caveats/partial/fail` rules | unit | `node --test tests/validation-reporting.test.cjs -x` | ❌ Wave 0 |
| RPT-01 | JSON and Markdown artifacts contain required metadata fields | integration | `node --test tests/validation-reporting.test.cjs -x` | ❌ Wave 0 |
| RPT-02 | Failures and audit findings become owner/severity-tagged next actions | unit/integration | `node --test tests/validation-reporting.test.cjs -x` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `node --test tests/validation-reporting.test.cjs -x`
- **Per wave merge:** `node --test tests/path-replacement.test.cjs tests/runtime-converters.test.cjs tests/codex-config.test.cjs tests/antigravity-install.test.cjs tests/copilot-install.test.cjs tests/upstream-sync.test.cjs tests/localization-gap-audit.test.cjs`
- **Phase gate:** `node scripts/run-tests.cjs`

### Wave 0 Gaps
- [ ] `tests/validation-reporting.test.cjs` — orchestrator, verdict, and artifact contract coverage for VAL-01/02/03 and RPT-01/02
- [ ] Shared fixture helper for fake compare/apply/audit/validation command outputs inside `tests/helpers.cjs` or a new helper module
- [ ] Artifact snapshot assertions for both JSON and Markdown output under `.planning/phases/04-validation-and-reporting/`

## Sources

### Primary (HIGH confidence)
- `.planning/phases/04-validation-and-reporting/04-CONTEXT.md` - locked decisions, discretion area, canonical references
- `.planning/REQUIREMENTS.md` - acceptance targets for VAL-01/02/03 and RPT-01/02
- `.planning/ROADMAP.md` - Phase 4 goal, success criteria, and plan structure
- `.planning/PROJECT.md` - project constraints and core value
- `CLAUDE.md` - enforceable project constraints and workflow rules
- `docs/UPSTREAM-SYNC.md` - canonical validation and sync sequencing contract
- `docs/RELEASE-CHECKLIST.md` - release-quality validation expectations and blocker rules
- `docs/CLI-TOOLS.md` - command contracts for `validate health`, `validate consistency`, `roadmap analyze`
- `scripts/check-upstream-release.cjs` - release metadata fields and offline overrides
- `scripts/apply-upstream-refresh.cjs` - apply-mode, touched/preserved path, overlay summary contract
- `scripts/audit-localization-gap.cjs` - localization finding schema
- `scripts/run-tests.cjs` - deterministic full-suite entrypoint
- `get-shit-done/bin/lib/verify.cjs` - health/consistency command semantics
- `tests/upstream-sync.test.cjs`, `tests/localization-gap-audit.test.cjs`, `tests/verify-health.test.cjs`, `tests/verify.test.cjs` - existing behavioral coverage

### Secondary (MEDIUM confidence)
- Local environment probes on 2026-03-25: `node --version`, `npm --version`, `git --version`, `curl -I https://api.github.com`

### Tertiary (LOW confidence)
- None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Phase 4 can reuse existing repo-local runtime, commands, and tests without introducing new dependencies.
- Architecture: HIGH - Locked decisions plus existing helper contracts strongly constrain the design.
- Pitfalls: HIGH - Failure modes are directly visible in docs, tests, and current command behavior.

**Research date:** 2026-03-25
**Valid until:** 2026-04-24
