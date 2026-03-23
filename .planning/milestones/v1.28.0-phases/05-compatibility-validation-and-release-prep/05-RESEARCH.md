# Phase 05 Research: Compatibility Validation and Release Prep

**Phase:** 05  
**Goal:** Validate that localization preserved command compatibility, references, and runtime behavior, then prepare the fork for ongoing maintenance.

## Current State

Phases 1 through 4 are complete:

- upstream `v1.28.0` baseline imported into the repository root
- docs, workflow assets, runtime strings, and representative source comments localized to Korean-first
- `TEXT-01` and `TEXT-02` are complete
- `node scripts/run-tests.cjs`, `validate health`, and `validate consistency` are currently green

Phase 5 is therefore not a new feature phase. It is a release-quality confidence phase that must:

1. re-run compatibility-sensitive validation against the localized tree
2. fix any breakage or drift surfaced by that validation
3. leave behind maintainer-facing guidance for future upstream sync and release checks

## Evidence Gathered

### Existing validation surface already available in the repo

The current codebase already provides useful validation commands for this phase:

- `node get-shit-done/bin/gsd-tools.cjs validate health`
- `node get-shit-done/bin/gsd-tools.cjs validate consistency`
- `node get-shit-done/bin/gsd-tools.cjs roadmap analyze`
- `node get-shit-done/bin/gsd-tools.cjs progress json`
- `node get-shit-done/bin/gsd-tools.cjs verify references <file>`
- `node get-shit-done/bin/gsd-tools.cjs verify-summary <file>`
- `node scripts/run-tests.cjs`

This means Phase 5 should focus on orchestrating and interpreting existing safety nets rather than inventing a new validation harness.

### Compatibility hotspots worth re-checking

Search and prior phase outputs point to the highest-risk areas:

- `bin/install.js` — runtime path conversion, installer output, runtime-specific transforms
- `tests/path-replacement.test.cjs`
- `tests/runtime-converters.test.cjs`
- `tests/codex-config.test.cjs`
- `tests/antigravity-install.test.cjs`
- `tests/copilot-install.test.cjs`
- `README.md` and `docs/ARCHITECTURE.md` — many literal `~/.claude/` examples and runtime path guidance
- `agents/*.md` and generated `.toml` outputs — some installer e2e output still reports non-blocking `.claude` leak warnings in non-Claude runtimes
- `docs/UPSTREAM-SYNC.md` — currently the main maintainer-facing sync policy doc

### Release-prep documentation gap

There is already a strong baseline doc in `docs/UPSTREAM-SYNC.md`, but there is no dedicated Phase-5-style release checklist or explicit Korean maintainer handoff doc for:

- what to re-run before release
- what warnings are acceptable vs blockers
- how to re-apply token-preservation rules on future upstream syncs

That makes a documentation-focused closing plan appropriate for the third wave.

## Phase-5 Risk Profile

### Likely findings

- reference/path examples that are valid for Claude but need conversion or warnings for other runtimes
- localized prose that passes tests but still needs release-note documentation or clearer maintainer guardrails
- non-blocking warnings discovered by installer/runtime conversion tests that deserve explicit remediation or documentation

### Constraints

- Do not rename commands, file names, directory names, identifiers, or phase/requirement IDs
- Avoid widening scope into new product behavior; Phase 5 should close localization quality, not add features
- Keep fixes tightly tied to issues surfaced by validation evidence
- Document known acceptable warnings explicitly if they are intentionally preserved

## Recommended Execution Shape

Use the roadmap's three-plan split as the execution shape:

1. **05-01 Validation Sweep**
   - run compatibility-sensitive checks
   - collect and prioritize surfaced issues
   - distinguish blockers from informational warnings

2. **05-02 Targeted Compatibility Repairs**
   - repair only issues surfaced by `05-01`
   - focus on broken references, runtime conversion leaks, snippet/token drift, and test expectation mismatches
   - re-run focused plus full regression checks

3. **05-03 Release Notes and Maintainer Guidance**
   - document final release-readiness checks
   - record future upstream sync guardrails and known caveats
   - leave a clear Korean maintainer path for follow-up releases

## Validation Architecture Recommendation

### Fast checks

- `node get-shit-done/bin/gsd-tools.cjs validate health`
- `node get-shit-done/bin/gsd-tools.cjs validate consistency`
- `node get-shit-done/bin/gsd-tools.cjs roadmap analyze`

### Compatibility-focused tests

- `node --test tests/path-replacement.test.cjs tests/runtime-converters.test.cjs tests/codex-config.test.cjs tests/antigravity-install.test.cjs tests/copilot-install.test.cjs`
- `node scripts/run-tests.cjs`

### Documentation/integrity checks

- `rg -n "README\\.zh-CN|docs/zh-CN" README.md docs`
- `rg -n "(?:~|\\$HOME)/\\.claude" README.md docs agents get-shit-done tests bin scripts`
- representative `verify references` runs only on files whose `@` references are expected to resolve in this local environment

## Context Decision

No separate `05-CONTEXT.md` is required.

The roadmap, requirements, Phase 4 verification outputs, and existing sync policy doc already define the phase boundary precisely:

- validate compatibility after localization
- repair any surfaced drift
- document the final maintenance/release process

## RESEARCH COMPLETE

Phase 05 is ready for planning. The phase should be executed as a tight validation-and-closure pass, not as new feature development.
