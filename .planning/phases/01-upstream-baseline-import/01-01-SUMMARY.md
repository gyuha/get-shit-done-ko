---
phase: 01-upstream-baseline-import
plan: 01
subsystem: infra
tags: [git, submodule, upstream-sync, repo-layout]
requires: []
provides:
  - upstream v1.28.0 runtime tree copied into the repository root
  - repository detached from the nested origin submodule layout
affects: [documentation, localization, planning]
tech-stack:
  added: [Node.js package layout from upstream, markdown workflow assets, test suite]
  patterns: [root-level upstream mirror, no nested submodule for runtime sources]
key-files:
  created: [package.json, get-shit-done/workflows/new-project.md, commands/gsd/new-project.md, scripts/run-tests.cjs]
  modified: [.gitignore, README.md, README.zh-CN.md, CHANGELOG.md]
key-decisions:
  - "Imported upstream from the local origin submodule snapshot at v1.28.0 instead of recloning"
  - "Removed the origin submodule after flattening so future localization work edits the root tree directly"
patterns-established:
  - "Upstream sync work happens by mirroring tracked upstream files into the root, then documenting the baseline"
requirements-completed: [SYNC-01]
duration: 1min
completed: 2026-03-23
---

# Phase 01: Upstream Baseline Import Summary

**Root repository now hosts upstream GSD v1.28.0 files directly, with nested submodule wiring removed**

## Performance

- **Duration:** 1 min
- **Started:** 2026-03-23T12:26:36Z
- **Completed:** 2026-03-23T12:27:25Z
- **Tasks:** 2
- **Files modified:** 21

## Accomplishments
- Copied the tracked upstream `v1.28.0` repository contents from `origin/` into the project root
- Restored the expected root runtime layout including `commands/`, `docs/`, `get-shit-done/`, `scripts/`, and `tests/`
- Removed the nested `origin` submodule so later localization phases can edit the root tree in place

## Task Commits

Each task was committed atomically:

1. **Task 1: Copy tracked upstream tree from origin into the root** - `21c4b7a` (feat)
2. **Task 2: Remove submodule wiring after the root import succeeds** - `94810ce` (chore)

**Plan metadata:** `pending`

## Files Created/Modified
- `package.json` - Restored upstream package metadata to the root
- `commands/gsd/new-project.md` - Restored root command documentation surface
- `get-shit-done/workflows/new-project.md` - Restored core workflow assets to the root tree
- `scripts/run-tests.cjs` - Restored upstream test runner entrypoint
- `.gitmodules` - Removed after submodule detachment

## Decisions Made
- Used the already-pinned local `origin` submodule as the import source instead of re-fetching upstream
- Preserved `.planning/`, `AGENTS.md`, and `CLAUDE.md` while flattening upstream files into the root

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Staged lingering `.gitmodules` deletion in a follow-up fix commit**
- **Found during:** Task 2 (Remove submodule wiring after the root import succeeds)
- **Issue:** `git rm origin` removed the gitlink cleanly, but the working-tree deletion of `.gitmodules` remained unstaged after the submodule cleanup sequence
- **Fix:** Added and committed the `.gitmodules` deletion explicitly so the repository is fully detached from the former submodule setup
- **Files modified:** `.gitmodules`
- **Verification:** `test ! -e .gitmodules` and `node get-shit-done/bin/gsd-tools.cjs validate health`
- **Committed in:** `e482925` (part of task completion)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** No scope creep. The follow-up fix only completed the intended submodule removal state.

## Issues Encountered
None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Root tree now matches the upstream runtime layout closely enough for Korean-first documentation work
- Phase 2 can begin translating and restructuring documentation without needing to reason about a nested submodule

---
*Phase: 01-upstream-baseline-import*
*Completed: 2026-03-23*
