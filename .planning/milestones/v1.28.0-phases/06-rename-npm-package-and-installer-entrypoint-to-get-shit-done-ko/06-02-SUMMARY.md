---
phase: 06-rename-npm-package-and-installer-entrypoint-to-get-shit-done-ko
plan: 02
subsystem: docs
tags: [readme, docs, installer, package-name]
requires:
  - phase: "06-01"
    provides: "canonical package metadata and runtime-facing package guidance"
provides:
  - "README install, update, and uninstall examples renamed to get-shit-done-ko"
  - "secondary maintainer docs aligned to the same canonical package literal"
affects: [phase-06-regression, onboarding, release]
tech-stack:
  added: []
  patterns: ["public docs must mirror the real package/bin identity exactly"]
key-files:
  created: []
  modified: [README.md, docs/context-monitor.md]
key-decisions:
  - "Preserved the README badge removal already present in the worktree and only changed canonical package command examples."
  - "Kept `docs/RELEASE-CHECKLIST.md` unchanged because it already used the renamed package identity."
patterns-established:
  - "Canonical copy-paste docs should advertise only the currently published package name."
requirements-completed: [PKG-02, PKG-03]
duration: 2min
completed: 2026-03-23
---

# Phase 06: Rename npm package and installer entrypoint to get-shit-done-ko Summary

**README and secondary maintainer docs now tell users to install, update, and uninstall via `get-shit-done-ko`, matching the renamed package identity.**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-23T14:11:11Z
- **Completed:** 2026-03-23T14:14:10Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Replaced canonical install, update, reinstall, and uninstall examples in `README.md` with `get-shit-done-ko`.
- Updated `docs/context-monitor.md` so installer registration guidance uses the renamed package literal.
- Confirmed `docs/RELEASE-CHECKLIST.md` already matched the new package identity and did not need edits.

## Task Commits

Each task was committed atomically:

1. **Task 1: Replace public install, update, and uninstall examples with get-shit-done-ko** - `2f7026f` (docs)
2. **Task 2: Align secondary docs and maintainer guidance with the canonical package name** - `90100ea` (docs)

## Files Created/Modified
- `README.md` - renamed all canonical package command examples without restoring removed badge blocks.
- `docs/context-monitor.md` - aligned the installer invocation shown in setup guidance.

## Decisions Made
- Treated the pre-existing README badge removal as intentional work already in progress and preserved it while applying the package rename.
- Left `docs/RELEASE-CHECKLIST.md` untouched because it already referenced `get-shit-done-ko`.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Targeted regression tests can now be updated against the renamed package/bin surfaces.
- Final full-suite and canonical-name leak checks remain for phase closure.

---
*Phase: 06-rename-npm-package-and-installer-entrypoint-to-get-shit-done-ko*
*Completed: 2026-03-23*
