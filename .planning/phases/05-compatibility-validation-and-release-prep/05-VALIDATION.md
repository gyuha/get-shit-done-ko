---
phase: 05
slug: compatibility-validation-and-release-prep
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-23
---

# Phase 05 — Validation Strategy

> Final compatibility and release-prep validation contract for the localized fork.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node-based repo test runner plus CLI validation and grep-based integrity checks |
| **Quick run command** | `node get-shit-done/bin/gsd-tools.cjs validate health` |
| **Full suite command** | `node scripts/run-tests.cjs` |
| **Focused compatibility suite** | `node --test tests/path-replacement.test.cjs tests/runtime-converters.test.cjs tests/codex-config.test.cjs tests/antigravity-install.test.cjs tests/copilot-install.test.cjs` |
| **Estimated runtime** | ~2 minutes for the full Phase 5 loop |

---

## Sampling Rate

- **After every task commit:** Run `node get-shit-done/bin/gsd-tools.cjs validate health`
- **After validation or repair wave completion:** Run the focused compatibility suite
- **Before phase completion:** Run `node scripts/run-tests.cjs`
- **Max feedback latency:** 120 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | QUAL-01 | cli validation | `node get-shit-done/bin/gsd-tools.cjs validate health && node get-shit-done/bin/gsd-tools.cjs validate consistency && node get-shit-done/bin/gsd-tools.cjs roadmap analyze` | ✅ | ⬜ pending |
| 05-01-02 | 01 | 1 | QUAL-02 | focused compatibility suite | `node --test tests/path-replacement.test.cjs tests/runtime-converters.test.cjs tests/codex-config.test.cjs tests/antigravity-install.test.cjs tests/copilot-install.test.cjs` | ✅ | ⬜ pending |
| 05-02-01 | 02 | 2 | QUAL-02 | targeted regression | `node --test tests/path-replacement.test.cjs tests/runtime-converters.test.cjs tests/codex-config.test.cjs tests/antigravity-install.test.cjs tests/copilot-install.test.cjs` | ✅ | ⬜ pending |
| 05-02-02 | 02 | 2 | QUAL-01 | full suite | `node scripts/run-tests.cjs` | ✅ | ⬜ pending |
| 05-03-01 | 03 | 3 | QUAL-02 | docs integrity | `rg -n "v1.28.0|upstream sync|Korean|English|Chinese|release|maintainer" README.md docs/UPSTREAM-SYNC.md docs/RELEASE-CHECKLIST.md` | ⬜ pending | ⬜ pending |
| 05-03-02 | 03 | 3 | QUAL-01 | final health | `node get-shit-done/bin/gsd-tools.cjs validate health && node get-shit-done/bin/gsd-tools.cjs roadmap analyze` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] Existing validation infrastructure covers this phase (`validate health`, `validate consistency`, focused compatibility tests, `scripts/run-tests.cjs`)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Commands, paths, identifiers, and snippets still read correctly to humans after localization | QUAL-02 | Literal token preservation with translated prose benefits from spot reading | Open representative installer/runtime/docs files and confirm prose may be Korean but commands, IDs, file paths, and placeholders remain exact |
| Release-prep guide is usable by a Korean maintainer | QUAL-01, QUAL-02 | Documentation usefulness is partly subjective | Follow the checklist in the new release-maintainer doc and confirm the steps are coherent end-to-end |

---

## Validation Sign-Off

- [x] All tasks have automated verification coverage or explicit manual review
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers compatibility-sensitive hotspots
- [x] No watch-mode flags
- [x] Feedback latency < 120s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
