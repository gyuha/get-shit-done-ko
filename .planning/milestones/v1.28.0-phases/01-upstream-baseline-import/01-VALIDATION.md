---
phase: 01
slug: upstream-baseline-import
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-23
---

# Phase 01 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node-based test runner via `scripts/run-tests.cjs` |
| **Config file** | `package.json` |
| **Quick run command** | `node get-shit-done/bin/gsd-tools.cjs validate health` |
| **Full suite command** | `node scripts/run-tests.cjs` |
| **Estimated runtime** | ~60 seconds |

---

## Sampling Rate

- **After every task commit:** Run `node get-shit-done/bin/gsd-tools.cjs validate health`
- **After every plan wave:** Run `node scripts/run-tests.cjs`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 90 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | SYNC-01 | filesystem | `test -f package.json && test -d get-shit-done/workflows && test -d commands/gsd` | ✅ | ⬜ pending |
| 01-01-02 | 01 | 1 | SYNC-01 | integrity | `test ! -e origin && test ! -e .gitmodules && node get-shit-done/bin/gsd-tools.cjs validate health` | ✅ | ⬜ pending |
| 01-02-01 | 02 | 2 | SYNC-02 | docs | `test -f docs/UPSTREAM-SYNC.md && rg -n "v1.28.0|gsd-build/get-shit-done" docs/UPSTREAM-SYNC.md` | ✅ | ⬜ pending |
| 01-02-02 | 02 | 2 | SYNC-02 | docs | `rg -n "docs/UPSTREAM-SYNC.md|v1.28.0" README.md` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] Existing validation infrastructure arrives from upstream import (`scripts/run-tests.cjs`, `tests/`, `get-shit-done/bin/gsd-tools.cjs`)

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Root tree looks like upstream instead of a nested submodule setup | SYNC-01 | Structure recognition is easier to confirm visually than through a single command | Run `ls -la` in repo root and verify that top-level upstream folders are present and `origin/` is gone |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 90s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
