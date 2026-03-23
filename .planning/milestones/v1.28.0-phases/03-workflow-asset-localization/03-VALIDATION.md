---
phase: 03
slug: workflow-asset-localization
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-23
---

# Phase 03 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node-based repo test runner plus grep/reference checks |
| **Config file** | `package.json` |
| **Quick run command** | `node get-shit-done/bin/gsd-tools.cjs validate health` |
| **Full suite command** | `node scripts/run-tests.cjs` |
| **Estimated runtime** | ~90 seconds |

---

## Sampling Rate

- **After every task commit:** Run `node get-shit-done/bin/gsd-tools.cjs validate health`
- **After every plan wave:** Run `node scripts/run-tests.cjs`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 120 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | FLOW-01 | grep | `rg -n "한국어|설명|가이드|검증" commands/gsd get-shit-done/workflows/help.md get-shit-done/workflows/progress.md get-shit-done/workflows/next.md get-shit-done/workflows/health.md` | ✅ | ⬜ pending |
| 03-01-02 | 01 | 1 | FLOW-02 | references | `node get-shit-done/bin/gsd-tools.cjs verify references commands/gsd/plan-phase.md && node get-shit-done/bin/gsd-tools.cjs verify references commands/gsd/new-project.md` | ✅ | ⬜ pending |
| 03-02-01 | 02 | 2 | FLOW-01 | grep | `rg -n "한국어|설명|워크플로|참조|검증" get-shit-done/workflows get-shit-done/templates get-shit-done/references` | ✅ | ⬜ pending |
| 03-02-02 | 02 | 2 | FLOW-02 | references | `node get-shit-done/bin/gsd-tools.cjs verify references get-shit-done/workflows/plan-phase.md && node get-shit-done/bin/gsd-tools.cjs verify references get-shit-done/templates/summary.md && node get-shit-done/bin/gsd-tools.cjs verify references get-shit-done/references/checkpoints.md` | ✅ | ⬜ pending |
| 03-03-01 | 03 | 3 | FLOW-01 | grep | `rg -n "한국어|에이전트|검증|컨텍스트|워크플로" agents` | ✅ | ⬜ pending |
| 03-03-02 | 03 | 3 | FLOW-02 | references + suite | `node get-shit-done/bin/gsd-tools.cjs verify references agents/gsd-executor.md && node get-shit-done/bin/gsd-tools.cjs verify references agents/gsd-plan-checker.md && node scripts/run-tests.cjs` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] Existing validation infrastructure covers this phase (`validate health`, `scripts/run-tests.cjs`, grep/reference checks)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Korean wording remains natural while machine tokens stay untouched | FLOW-01, FLOW-02 | Tone and token-preservation judgment benefits from spot reading | Open representative files from each asset family and confirm prose is Korean while command literals, `@` refs, XML tags, and placeholders remain unchanged |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 120s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
