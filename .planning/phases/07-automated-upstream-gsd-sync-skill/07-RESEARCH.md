# Phase 07 Research: Automated Upstream GSD Sync Skill

**Phase:** 07  
**Goal:** Add a maintainer-only skill that checks upstream GitHub releases, compares them against this repo's tracked upstream baseline, and refreshes the vendored GSD tree only when upstream is newer.

## Current State

As of **2026-03-23**, the latest upstream release on `https://github.com/gsd-build/get-shit-done/releases` is **`v1.28.0`**, published on **2026-03-22**. This fork's `package.json` version is **`1.28.1`**, while `docs/UPSTREAM-SYNC.md` still records the tracked upstream baseline as **`v1.28.0`**.

That means a maintainer-facing sync tool cannot rely on `package.json` semver alone. The fork distribution version and the imported upstream baseline have already diverged.

## Evidence Gathered

### Existing runtime update flow is not the right tool

- `.codex/skills/gsd-update/SKILL.md` and `get-shit-done/workflows/update.md` are designed to update an installed runtime via npm.
- The workflow checks `npm view get-shit-done-ko version` and runs `npx -y get-shit-done-ko@latest ...`.
- That flow updates a runtime install under `.claude/`, `.codex/`, `.gemini/`, or `.opencode/`, not this repository's vendored source tree.

### Existing release-checking patterns can be reused

- `.release-monitor.sh` already polls GitHub releases for `gsd-build/get-shit-done` using `gh release list` and `gh release view`.
- The repo therefore already contains a precedent for GitHub-release-based version checks rather than npm-only checks.

### Current baseline tracking is human-readable, not machine-readable

- `docs/UPSTREAM-SYNC.md` names the current baseline tag `v1.28.0`.
- There is no repo-level `get-shit-done/VERSION` or other explicit machine-readable baseline file today.
- The new skill should not parse freeform prose forever if it can establish a stable baseline manifest once.

### Safe import surface is already defined

- Phase 1 research and plan artifacts list the exact vendored top-level entries to import from upstream.
- Those artifacts also name the protected local files that must survive sync (`.planning/`, `AGENTS.md`, `CLAUDE.md`).
- The current repo has only the fork remote configured; there is no persistent upstream remote or local submodule snapshot anymore.

## Risk Profile

### Highest-risk changes

- Comparing GitHub release tags against `package.json` and falsely concluding "already ahead" because the fork package version is `1.28.1`
- Replacing the vendored tree without a clear preserved-file list, thereby clobbering Korean-localized overlays or maintainer-only assets
- Reusing `$gsd-update` semantics and accidentally pointing users toward repo-sync behavior instead of runtime self-update
- Importing a newer upstream snapshot without updating the tracked baseline source of truth, leaving future sync checks inconsistent

### Constraints

- Keep commands, flags, filenames, directory names, identifiers, and phase/requirement IDs unchanged
- Keep English documentation available and Chinese docs removed
- Preserve token-sensitive markdown/XML structures
- Keep the maintainer sync skill separate from public runtime update flows

## Recommended Execution Shape

Use a three-plan sequence:

1. **07-01 Baseline tracking and comparison skill scaffold**
   - Introduce a dedicated maintainer skill (`gsd-sync-upstream`)
   - Add or formalize a machine-readable upstream baseline source
   - Implement GitHub-release fetch + semver comparison + no-op reporting

2. **07-02 Safe upstream refresh workflow**
   - Fetch a specific upstream tag into a temp workspace
   - Import the Phase 1 top-level vendored entries into the repo
   - Reapply Korean overlays and preserve protected local files
   - Update baseline docs/metadata after a successful refresh

3. **07-03 Regression coverage and maintainer guidance**
   - Add tests for compare/no-op/update selection logic
   - Add dry-run/update usage docs and release checklist steps
   - Re-run validation to ensure the repo still behaves like the localized fork

## Validation Architecture

### Quick checks

- `node get-shit-done/bin/gsd-tools.cjs validate health`
- `node get-shit-done/bin/gsd-tools.cjs roadmap analyze`
- `node scripts/check-upstream-release.cjs --current-file get-shit-done/UPSTREAM_VERSION --json`

### Focused sync checks

- `node --test tests/upstream-sync.test.cjs`
- `rg -n "v1\\.28\\.0|UPSTREAM_VERSION|gsd-sync-upstream" .codex/skills docs scripts get-shit-done tests`
- `node scripts/apply-upstream-refresh.cjs --from-current --to-tag vX.Y.Z --dry-run`

### Full closure

- `node scripts/run-tests.cjs`

## Research Conclusion

The new capability should be a **maintainer sync tool**, not an extension of the existing npm-based runtime updater. The critical design choice is to compare GitHub releases against a tracked upstream baseline that is independent from this fork's own package version, then reuse the original Phase 1 import boundary to perform safe refreshes when upstream moves ahead.

## RESEARCH COMPLETE

Phase 07 is ready for planning.
