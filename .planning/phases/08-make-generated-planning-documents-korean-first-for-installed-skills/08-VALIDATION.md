---
phase: 08
slug: make-generated-planning-documents-korean-first-for-installed-skills
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-24
---

# Phase 08 — Validation Strategy

> Installed-skill planning document generation must become Korean-first without breaking parser-sensitive tokens.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node-based repo tests plus CLI/grep validation |
| **Config file** | none — existing repo test infrastructure |
| **Quick run command** | `node --test tests/template.test.cjs` |
| **Full suite command** | `node scripts/run-tests.cjs` |
| **Focused generation suite** | `node --test tests/template.test.cjs && node --test tests/commands.test.cjs` plus direct `.codex/get-shit-done/bin/gsd-tools.cjs` generation checks |
| **Estimated runtime** | ~150 seconds |

---

## Sampling Rate

- **After every task commit:** Run the relevant focused test file for the touched generation path
- **After every plan wave:** Run `node --test tests/template.test.cjs && node --test tests/commands.test.cjs`
- **Before `$gsd-verify-work`:** `node scripts/run-tests.cjs` must be green
- **Max feedback latency:** 150 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 08-01-01 | 01 | 1 | L10N-07 | installed template-fill generation | `node .codex/get-shit-done/bin/gsd-tools.cjs template fill summary --phase 1 --cwd "$TMPDIR"` | ✅ | ⬜ pending |
| 08-01-02 | 01 | 1 | L10N-07 | installed scaffold/helper generation | `node --test tests/template.test.cjs && node --test tests/commands.test.cjs` | ✅ | ⬜ pending |
| 08-01-03 | 01 | 1 | L10N-07 | installed template asset compatibility | `rg -n "Goal-Backward Verification|Test Results|status: pending|<task" .codex/get-shit-done/templates .codex/get-shit-done/bin/lib` | ✅ | ⬜ pending |
| 08-02-01 | 02 | 2 | L10N-08 | direct installed-runtime regression | `node --test tests/template.test.cjs && node --test tests/commands.test.cjs` | ✅ | ⬜ pending |
| 08-02-02 | 02 | 2 | L10N-07, L10N-08 | roadmap/planning consistency | `node get-shit-done/bin/gsd-tools.cjs roadmap analyze` | ✅ | ⬜ pending |
| 08-02-03 | 02 | 2 | L10N-08 | full regression | `node scripts/run-tests.cjs` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] Existing repo tests already cover the main template-fill and command-helper surfaces used by this phase.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Installed Codex runtime output reads naturally as Korean-first while still exposing parser-sensitive labels where needed | L10N-07 | Tone and readability cannot be fully judged by grep | Generate representative docs via `.codex/get-shit-done/bin/gsd-tools.cjs` and confirm the surrounding prose is Korean-first while required exact labels remain unchanged |
| Mirrored root-runtime assets stay intentionally aligned rather than accidentally drifting from the authoritative `.codex` runtime | L10N-07 | Automation can prove string presence but not maintainer intent | Compare the touched `.codex/get-shit-done/` assets against any mirrored `get-shit-done/` updates and confirm the delta is deliberate |

---

## Validation Sign-Off

- [x] All tasks have automated verification coverage or explicit manual review
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all phase requirements
- [x] No watch-mode flags
- [x] Feedback latency < 150s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
