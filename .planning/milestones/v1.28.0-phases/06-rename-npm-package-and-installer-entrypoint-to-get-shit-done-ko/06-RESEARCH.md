# Phase 06 Research: Rename npm package and installer entrypoint to get-shit-done-ko

**Phase:** 06  
**Goal:** Rename the published npm package and installer entrypoint to `get-shit-done-ko`, then align docs, workflows, and regression coverage so the fork's canonical install path matches reality.

## Current State

Phase 5 closed the original localization milestone with green validation, but the published package identity still reflects the upstream-derived name:

- `package.json` name is `get-shit-done-cc`
- the npm bin entry is `get-shit-done-cc`
- `package-lock.json` repeats the same root package identity
- README, installer help text, `help.md`, and `update.md` still direct users to `npx get-shit-done-cc`

That means the repository branding and the real npm install path are currently misaligned. This phase is therefore a distribution and compatibility phase, not a pure documentation cleanup.

## Evidence Gathered

### Canonical package identity surfaces

The package name is currently anchored in three machine-sensitive places:

- `package.json`
- `package-lock.json`
- `bin/install.js` usage/help output

These three files define what npm publishes and what users see when they invoke the installer directly.

### Workflow and maintainer surfaces tied to the package name

The package literal appears in runtime-facing workflow assets and maintainer docs:

- `get-shit-done/workflows/help.md`
- `get-shit-done/workflows/update.md`
- `README.md`
- `docs/context-monitor.md`
- `docs/RELEASE-CHECKLIST.md`

Because `update.md` includes `npm view`, reinstall, and `npx -y ...@latest` flows, renaming only README would leave update behavior internally inconsistent.

### Existing regression surface already available

The repo already has strong test and validation entrypoints that can be reused:

- `node scripts/run-tests.cjs`
- `node get-shit-done/bin/gsd-tools.cjs validate health`
- `node get-shit-done/bin/gsd-tools.cjs roadmap analyze`
- targeted installer/runtime suites:
  - `tests/codex-config.test.cjs`
  - `tests/runtime-converters.test.cjs`
  - `tests/antigravity-install.test.cjs`
  - `tests/copilot-install.test.cjs`

These tests do not all assert the package name directly today, but they cover the installer and generated runtime outputs most likely to regress during a rename.

## Risk Profile

### Highest-risk changes

- Renaming `package.json` and `package-lock.json` without updating all install/update/help guidance
- Leaving `get-shit-done-cc` behind in `update.md`, which would make self-update guidance wrong after release
- Changing installer copy without preserving flags, runtime literals, config-dir handling, or uninstall guidance
- Shipping docs that say `get-shit-done-ko` while npm metadata still publishes `get-shit-done-cc`

### Constraints

- Keep GSD command tokens, runtime flags, file paths, identifiers, and phase/requirement IDs unchanged
- Do not add dual-name compatibility or alias-package strategy in this phase
- Preserve existing dirty worktree changes; execution must read current file state and avoid reverting unrelated edits
- Keep verification grounded in the repo's existing validation commands and narrow grep-based package-name audits

## Recommended Execution Shape

Use a three-plan sequence:

1. **06-01 Package identity and runtime-facing entrypoints**
   - rename npm metadata and installer/help/update literals
   - keep runtime flags and command structure unchanged

2. **06-02 Public and maintainer docs alignment**
   - replace canonical install/update/uninstall examples in README and related docs
   - keep maintainer guidance consistent with the new package identity

3. **06-03 Regression and release-close validation**
   - expand targeted tests where package/bin literals matter
   - run focused and full regression
   - ensure no canonical surfaces still advertise `get-shit-done-cc`

## Validation Architecture

### Fast checks

- `node get-shit-done/bin/gsd-tools.cjs validate health`
- `node get-shit-done/bin/gsd-tools.cjs roadmap analyze`
- `rg -n "get-shit-done-cc|get-shit-done-ko" package.json package-lock.json README.md docs get-shit-done/workflows bin tests`

### Package identity checks

- `node -e "const pkg=require('./package.json'); if(pkg.name!=='get-shit-done-ko') process.exit(1); if(pkg.bin['get-shit-done-ko']!=='bin/install.js') process.exit(1)"`
- `node -e "const lock=require('./package-lock.json'); if(lock.name!=='get-shit-done-ko') process.exit(1); if(lock.packages[''].name!=='get-shit-done-ko') process.exit(1)"`
- `npm pack --dry-run >/dev/null`

### Focused rename regression

- `node --test tests/codex-config.test.cjs tests/runtime-converters.test.cjs tests/antigravity-install.test.cjs tests/copilot-install.test.cjs`
- targeted grep checks to ensure canonical docs/workflows no longer reference `get-shit-done-cc`

### Full closure

- `node scripts/run-tests.cjs`

## Context Decision

`06-CONTEXT.md` is required and already present because the user locked the package name, bin name, no-alias policy, and replacement boundary explicitly. Planning should reference those decisions directly, especially `D-01` through `D-09`.

## RESEARCH COMPLETE

Phase 06 is ready for planning. The phase should be treated as a real package-identity transition with narrow compatibility safeguards, not as a README-only rename.
