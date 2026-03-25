---
phase: 4
slug: validation-and-reporting
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-25
---

> 한국어 우선 안내: 이 템플릿은 `VALIDATION` 자산을 한국어 기준으로 먼저 읽을 수 있게 정리합니다. 아래 영문 원문은 upstream 동기화와 세부 의미 보존을 위해 함께 유지합니다.


# Phase 4 — 검증 전략 (Validation Strategy)

> 실행 중 피드백 샘플링을 위한 phase별 validation 계약입니다.

---

## Test Infrastructure (테스트 인프라)

| Property | Value |
|----------|-------|
| **Framework** | Node built-in test runner (`node --test`) |
| **Config file** | none |
| **Quick run command** | `node --test tests/validation-reporting.test.cjs -x` |
| **Full suite command** | `node scripts/run-tests.cjs` |
| **Estimated runtime** | ~120 seconds |

---

## Sampling Rate (샘플링 빈도)

- **After every task commit:** Run `node --test tests/validation-reporting.test.cjs -x`
- **After every plan wave:** Run `node --test tests/path-replacement.test.cjs tests/runtime-converters.test.cjs tests/codex-config.test.cjs tests/antigravity-install.test.cjs tests/copilot-install.test.cjs tests/upstream-sync.test.cjs tests/localization-gap-audit.test.cjs -x`
- **Before `$gsd-verify-work`:** Full suite must be green with `node scripts/run-tests.cjs`
- **Max feedback latency:** 120 seconds

---

## Per-Task Verification Map (작업별 검증 맵)

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | VAL-01 | integration | `node --test tests/validation-reporting.test.cjs -x` | ❌ W0 | ⬜ pending |
| 04-02-01 | 02 | 1 | VAL-02 | integration | `node --test tests/validation-reporting.test.cjs -x` | ❌ W0 | ⬜ pending |
| 04-02-02 | 02 | 1 | VAL-03 | unit | `node --test tests/validation-reporting.test.cjs -x` | ❌ W0 | ⬜ pending |
| 04-03-01 | 03 | 2 | RPT-01 | integration | `node --test tests/validation-reporting.test.cjs -x` | ❌ W0 | ⬜ pending |
| 04-03-02 | 03 | 2 | RPT-02 | unit/integration | `node --test tests/validation-reporting.test.cjs -x` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements (Wave 0 요구사항)

- [ ] `tests/validation-reporting.test.cjs` — orchestrator, verdict, and artifact contract coverage for `VAL-01`, `VAL-02`, `VAL-03`, `RPT-01`, `RPT-02`
- [ ] `tests/helpers.cjs` or new helper module — fake compare/apply/audit/validation command output fixtures
- [ ] Artifact assertions under `.planning/phases/04-validation-and-reporting/` for both JSON and Markdown report outputs

---

## Manual-Only Verifications (수동 검증 전용 항목)

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Quick validation clean-gate semantics | VAL-02 | The exact definition of a "clean" dry-run/localization-audit state is a policy choice that may evolve as maintainers tune thresholds | Run a quick-validation scenario and confirm the report explains why quick mode was allowed or denied, including the specific audit fields inspected |
| Owner/severity action taxonomy readability | RPT-02 | Human maintainers must confirm that follow-up items are understandable and actionable, not just structurally present | Review the Markdown report and confirm each follow-up item shows both owner/track and severity with a concrete next action |

---

## Validation Sign-Off (검증 승인)

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
