# Phase 01 Research: Upstream Baseline Import

**Phase:** 01  
**Goal:** Mirror upstream `get-shit-done` `v1.28.0` into the repository root and document the baseline so later localization happens on a stable source tree.

## Implementation Findings

### Current local starting point

- The destination repository already contains an `origin` git submodule pointing to `https://github.com/gsd-build/get-shit-done.git`.
- The checked-out submodule is at tag `v1.28.0`.
- The current root tree is intentionally minimal: `.planning/`, `AGENTS.md`, `CLAUDE.md`, `README.md`, `.gitmodules`, and `origin/`.

### Best import strategy

**Recommended:** flatten the tracked contents of `origin/` into the repository root, then remove the submodule wiring.

Why this is the best fit:
- It satisfies the user's request to place the upstream structure directly in the project root.
- It keeps a local, already-fetched source of truth for the import.
- It avoids depending on network access during execution.
- It produces a normal repository tree that later phases can translate in place.

### Alternatives considered

#### Keep the submodule

Rejected because the user explicitly wants the upstream structure in the project root, not nested under `origin/`.

#### Use git subtree merge

Rejected for Phase 1 because it introduces extra git-history mechanics that are not needed for the immediate localization goal. A plain flatten-and-remove import is easier to audit.

#### Re-clone upstream from the network during execution

Rejected because the submodule already contains the correct source snapshot locally.

## Exact upstream inventory to import

The import should copy these tracked top-level entries from `origin/` into the root:

- `.github`
- `.gitignore`
- `.release-monitor.sh`
- `CHANGELOG.md`
- `LICENSE`
- `README.md`
- `README.zh-CN.md`
- `SECURITY.md`
- `agents`
- `assets`
- `bin`
- `commands`
- `docs`
- `get-shit-done`
- `hooks`
- `package-lock.json`
- `package.json`
- `scripts`
- `tests`

The import must **not** overwrite or remove:

- `.git/`
- `.planning/`
- `AGENTS.md`
- `CLAUDE.md`

After the copy completes, Phase 1 should remove:

- `origin/`
- `.gitmodules`

## Phase-specific risks

### Token-sensitive files

`commands/`, `get-shit-done/workflows/`, `get-shit-done/templates/`, and `get-shit-done/references/` are prompt/runtime assets. Phase 1 should import them unchanged.

### Planning artifact preservation

The repo now contains `.planning`, `AGENTS.md`, and `CLAUDE.md`. Import work must preserve these local project-management files while bringing in upstream runtime files.

### Future Chinese removal

Phase 1 should import upstream faithfully, even though later phases will remove Chinese docs. That keeps the baseline auditable.

## Validation Architecture

### Quick checks after import

- `test -f package.json`
- `test -d get-shit-done/workflows`
- `test -d commands/gsd`
- `test -d tests`
- `test ! -e origin`
- `test ! -e .gitmodules`

### Functional checks after import

- `node scripts/run-tests.cjs`
- `node get-shit-done/bin/gsd-tools.cjs validate health`

### Documentation checks

- `test -f docs/UPSTREAM-SYNC.md`
- `rg -n "v1.28.0|gsd-build/get-shit-done" docs/UPSTREAM-SYNC.md README.md`

## Planning Notes

- Use two plans.
- Plan 01 should perform the flattening import and submodule removal.
- Plan 02 should document the upstream baseline and leave maintainers with a clear sync trail.

## RESEARCH COMPLETE

Phase 01 can be planned directly from the local `origin/` submodule without additional discovery.
