---
phase: 02
slug: korean-first-documentation
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-23
---

# Phase 02 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node-based repo test runner plus grep/file checks |
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
| 02-01-01 | 01 | 1 | DOCS-01 | docs grep | `rg -n "한국어|Korean" README.md docs/README.md` | ✅ | ⬜ pending |
| 02-01-02 | 01 | 1 | DOCS-02 | link/file | `test -f README.md && test -f docs/README.md` | ✅ | ⬜ pending |
| 02-02-01 | 02 | 2 | DOCS-01 | docs grep | `rg -n "한국어|사용자 가이드|명령어 참조|설정" docs/USER-GUIDE.md docs/FEATURES.md docs/CONFIGURATION.md docs/COMMANDS.md` | ✅ | ⬜ pending |
| 02-02-02 | 02 | 2 | DOCS-02 | file/link | `test -f docs/CLI-TOOLS.md && test -f docs/ARCHITECTURE.md && test -f docs/AGENTS.md` | ✅ | ⬜ pending |
| 02-03-01 | 03 | 3 | DOCS-03 | cleanup | `test ! -e README.zh-CN.md && test ! -d docs/zh-CN` | ✅ | ⬜ pending |
| 02-03-02 | 03 | 3 | DOCS-02 | grep cleanup | `! rg -n "README\\.zh-CN|docs/zh-CN|简体中文" README.md docs` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] Existing validation infrastructure covers this phase (`validate health`, `scripts/run-tests.cjs`, grep/file checks)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Korean-first doc flow feels natural on first read | DOCS-01 | Tone/clarity is easier to judge by reading | Open `README.md` and `docs/README.md`, confirm Korean appears as the default explanation path while commands and links remain intact |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 120s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
