---
phase: 07
slug: automated-upstream-gsd-sync-skill
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-23
---

# Phase 07 — Validation Strategy

> Maintainer-only upstream sync validation contract for this localized fork.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node-based repo tests plus CLI/grep validation and dry-run sync scripts |
| **Config file** | none — existing repo test infrastructure plus new phase-specific scripts/tests |
| **Quick run command** | `node get-shit-done/bin/gsd-tools.cjs validate health` |
| **Full suite command** | `node scripts/run-tests.cjs` |
| **Focused sync suite** | `node --test tests/upstream-sync.test.cjs` |
| **Estimated runtime** | ~150 seconds |

---

## Sampling Rate

- **After every task commit:** Run `node get-shit-done/bin/gsd-tools.cjs validate health`
- **After every plan wave:** Run the focused sync suite or the phase-specific dry-run command
- **Before `$gsd-verify-work`:** `node scripts/run-tests.cjs` must be green
- **Max feedback latency:** 150 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 07-01-01 | 01 | 1 | L10N-04 | baseline + compare logic | `test -f get-shit-done/UPSTREAM_VERSION && test -f scripts/check-upstream-release.cjs && node scripts/check-upstream-release.cjs --current-file get-shit-done/UPSTREAM_VERSION --latest-tag v999.0.0 --json` | ✅ | ⬜ pending |
| 07-01-02 | 01 | 1 | L10N-06 | no-op reporting | `test -f .codex/skills/gsd-sync-upstream/SKILL.md && node scripts/check-upstream-release.cjs --current-tag v1.28.0 --latest-tag v1.28.0 --json | rg -n "\"update_available\":false|\"latest_tag\":\"v1.28.0\""` | ✅ | ⬜ pending |
| 07-02-01 | 02 | 2 | L10N-05 | dry-run sync preview | `test -f scripts/apply-upstream-refresh.cjs && node scripts/apply-upstream-refresh.cjs --from-current --to-tag v999.0.0 --dry-run | rg -n "incoming tag|preserved paths|touched paths"` | ✅ | ⬜ pending |
| 07-02-02 | 02 | 2 | L10N-05 | protected file preservation | `node scripts/apply-upstream-refresh.cjs --from-current --to-tag v999.0.0 --dry-run --json | rg -n "\"preserved\"|\\.planning/|AGENTS.md|CLAUDE.md"` | ✅ | ⬜ pending |
| 07-03-01 | 03 | 3 | L10N-01 | maintainer docs | `rg -n "gsd-sync-upstream|UPSTREAM_VERSION|GitHub releases|dry-run" docs/UPSTREAM-SYNC.md docs/RELEASE-CHECKLIST.md .codex/skills/gsd-sync-upstream/SKILL.md` | ✅ | ⬜ pending |
| 07-03-02 | 03 | 3 | L10N-04 | targeted regression | `node --test tests/upstream-sync.test.cjs && node get-shit-done/bin/gsd-tools.cjs roadmap analyze` | ✅ | ⬜ pending |
| 07-03-03 | 03 | 3 | L10N-05 | full regression | `node scripts/run-tests.cjs` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] Existing repo test infrastructure covers CLI, docs, and scripted dry-run validation.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Dry-run summary reads like a safe maintainer workflow, not an end-user runtime update | L10N-01, L10N-06 | Command output wording and operator confidence still need a human read | Run the skill in dry-run/no-op mode and confirm it shows upstream tag/date, current baseline, and preserved paths before any mutation |
| Korean overlay preservation policy still reads consistently after docs updates | L10N-05 | Grep can prove strings exist but not that the maintainer story is coherent | Read `docs/UPSTREAM-SYNC.md` and `docs/RELEASE-CHECKLIST.md` together and confirm the sync process clearly preserves Korean overlays and protected local files |

---

## Validation Sign-Off

- [x] All tasks have automated verification coverage or explicit manual review
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all phase requirements
- [x] No watch-mode flags
- [x] Feedback latency < 150s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
