---
phase: 06
slug: rename-npm-package-and-installer-entrypoint-to-get-shit-done-ko
status: passed
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-23
---

# Phase 06 — Validation Strategy

> Package-identity rename validation contract for `get-shit-done-ko`.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node-based repo tests plus CLI validation and grep/package metadata checks |
| **Config file** | none — existing repo infrastructure already covers this phase |
| **Quick run command** | `node get-shit-done/bin/gsd-tools.cjs validate health` |
| **Full suite command** | `node scripts/run-tests.cjs` |
| **Focused rename suite** | `node --test tests/codex-config.test.cjs tests/runtime-converters.test.cjs tests/antigravity-install.test.cjs tests/copilot-install.test.cjs` |
| **Estimated runtime** | ~120 seconds |

---

## Sampling Rate

- **After every task commit:** Run `node get-shit-done/bin/gsd-tools.cjs validate health`
- **After every plan wave:** Run the focused rename suite or phase-specific grep/package checks
- **Before `$gsd-verify-work`:** `node scripts/run-tests.cjs` must be green
- **Max feedback latency:** 120 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 1 | PKG-01 | package metadata | `node -e "const pkg=require('./package.json'); if(pkg.name!=='get-shit-done-ko') process.exit(1); if(pkg.bin['get-shit-done-ko']!=='bin/install.js') process.exit(1)" && node -e "const lock=require('./package-lock.json'); if(lock.name!=='get-shit-done-ko') process.exit(1); if(lock.packages[''].name!=='get-shit-done-ko') process.exit(1); if(lock.packages[''].bin['get-shit-done-ko']!=='bin/install.js') process.exit(1)" && npm pack --dry-run >/dev/null` | ✅ | ⬜ pending |
| 06-01-02 | 01 | 1 | PKG-02 | runtime/help surface audit | `rg -n "get-shit-done-ko" bin/install.js get-shit-done/workflows/help.md get-shit-done/workflows/update.md && ! rg -n "get-shit-done-cc" bin/install.js get-shit-done/workflows/help.md get-shit-done/workflows/update.md` | ✅ | ⬜ pending |
| 06-02-01 | 02 | 2 | PKG-02 | public docs audit | `rg -n "get-shit-done-ko" README.md docs/context-monitor.md docs/RELEASE-CHECKLIST.md && ! rg -n "get-shit-done-cc" README.md docs/context-monitor.md docs/RELEASE-CHECKLIST.md` | ✅ | ⬜ pending |
| 06-02-02 | 02 | 2 | PKG-03 | update/help consistency | `node get-shit-done/bin/gsd-tools.cjs validate health && rg -n "get-shit-done-ko" README.md get-shit-done/workflows/help.md get-shit-done/workflows/update.md` | ✅ | ⬜ pending |
| 06-03-01 | 03 | 3 | PKG-03 | targeted regression | `node --test tests/codex-config.test.cjs tests/runtime-converters.test.cjs tests/antigravity-install.test.cjs tests/copilot-install.test.cjs && node get-shit-done/bin/gsd-tools.cjs validate health` | ✅ | ⬜ pending |
| 06-03-02 | 03 | 3 | PKG-01 | full regression and roadmap | `node scripts/run-tests.cjs && node get-shit-done/bin/gsd-tools.cjs roadmap analyze && ! rg -n "get-shit-done-cc" package.json package-lock.json README.md docs get-shit-done/workflows bin tests` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| README install examples and published package name read as one coherent story to a human reviewer | PKG-01, PKG-02 | The command literals are testable, but human coherence still needs a quick spot-check | Open `README.md`, `package.json`, and `bin/install.js` together and confirm the canonical package/bin name is `get-shit-done-ko` everywhere a user would copy a command |
| Installer help and update guidance preserve runtime flags while only renaming the package literal | PKG-03 | Flag preservation is partly structural and partly readability-based | Review `bin/install.js`, `get-shit-done/workflows/help.md`, and `get-shit-done/workflows/update.md` for unchanged flags like `--claude`, `--codex`, `--global`, and `--local` |

---

## Validation Sign-Off

- [x] All tasks have automated verification coverage or explicit manual review
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all phase requirements
- [x] No watch-mode flags
- [x] Feedback latency < 120s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** granted
