---
phase: 06-rename-npm-package-and-installer-entrypoint-to-get-shit-done-ko
plan: 01
subsystem: infra
tags: [npm, installer, workflows, package-name]
requires:
  - phase: "05-compatibility-validation-and-release-prep"
    provides: "localized runtime copy and release-safe compatibility baseline"
provides:
  - "published npm package identity renamed to get-shit-done-ko"
  - "installer, help workflow, and update workflow aligned to the renamed package literal"
affects: [phase-06-docs, phase-06-regression, release]
tech-stack:
  added: []
  patterns: ["single canonical npm package name across metadata and runtime-facing guidance"]
key-files:
  created: []
  modified: [package.json, package-lock.json, bin/install.js, get-shit-done/workflows/help.md, get-shit-done/workflows/update.md]
key-decisions:
  - "Renamed only machine-sensitive package identity fields and canonical runtime guidance in Wave 1."
  - "Preserved runtime flags and install semantics while changing the package literal to get-shit-done-ko."
patterns-established:
  - "Package metadata, installer help, and update workflow must advertise the same npm package name."
requirements-completed: [PKG-01, PKG-02]
duration: 2min
completed: 2026-03-23
---

# Phase 06: Rename npm package and installer entrypoint to get-shit-done-ko Summary

**Published npm identity now resolves as `get-shit-done-ko`, and installer/help/update guidance uses the same canonical package name.**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-23T14:09:53Z
- **Completed:** 2026-03-23T14:11:11Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Renamed the npm package name and root bin entry from `get-shit-done-cc` to `get-shit-done-ko`.
- Updated installer usage/help output so runtime-facing examples use the new package literal.
- Aligned the `help` and `update` workflows with the renamed package identity.

## Task Commits

Each task was committed atomically:

1. **Task 1: Rename package metadata and bin entrypoint to get-shit-done-ko** - `5cb460a` (feat)
2. **Task 2: Align installer, help, and update workflows to the renamed package literal** - `35fbefb` (docs)

## Files Created/Modified
- `package.json` - renamed the published npm package and bin entry.
- `package-lock.json` - kept lockfile root metadata consistent with the renamed package identity.
- `bin/install.js` - switched installer usage/help examples to `get-shit-done-ko`.
- `get-shit-done/workflows/help.md` - updated canonical update guidance to the renamed package.
- `get-shit-done/workflows/update.md` - changed `npm view` and reinstall commands to the new package name.

## Decisions Made
- Kept repository/homepage metadata unchanged in this wave because the plan only required package identity and runtime-facing command surfaces.
- Preserved all runtime flags and workflow behavior while renaming only the package literal.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- README and secondary maintainer docs can now be updated against the true package identity.
- Regression coverage still needs package-name assertions before final phase closure.

---
*Phase: 06-rename-npm-package-and-installer-entrypoint-to-get-shit-done-ko*
*Completed: 2026-03-23*
