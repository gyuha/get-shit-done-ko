# Phase 08 Research: Make generated planning documents Korean-first for installed skills

**Phase:** 08  
**Goal:** Ensure installed GSD skills generate Korean-first planning documents across scaffolded and templated outputs while preserving machine-sensitive tokens and parser compatibility.

## Current State

As of **2026-03-24**, the repo already ships Korean-first docs and workflow assets in the mirrored root runtime, but installed Codex-skill planning output can still fall back to English because the authoritative installed runtime under `.codex/get-shit-done/` still owns English scaffolds and template-fill bodies. The problem is therefore not limited to README/docs copy or the mirrored `get-shit-done/` tree.

## Evidence Gathered

### The authoritative installed-runtime path is `.codex/get-shit-done/`

- `.codex/get-shit-done/bin/lib/template.cjs` owns `template fill` output for generated `SUMMARY`, `PLAN`, and `VERIFICATION` files used by installed Codex skills.
- `.codex/get-shit-done/bin/lib/commands.cjs` contains standalone planning/scaffold helpers that contribute generated planning documents such as `CONTEXT`, `UAT`, `VALIDATION`, and related workflow artifacts in the installed runtime.
- The mirrored root runtime under `get-shit-done/` is already Korean-first in this repo, but installed Codex skills do not read that tree as the authoritative source.

### Reusable `.codex` templates amplify the same problem

- The reusable planning assets under `.codex/get-shit-done/templates/` still include English-first planning bodies for files such as `context.md`, `research.md`, `phase-prompt.md`, `UAT.md`, `VALIDATION.md`, and `verification-report.md`.
- `scaffold` and `template fill` do not rely only on template files; some generated output is hardcoded directly in the runtime helpers, so updating templates alone would be insufficient.

### Parser-sensitive labels still matter

- Existing planning and verification flows rely on structured markers, headings, XML blocks, and token-sensitive labels.
- In particular, labels such as `Tasks`, `Goal-Backward Verification`, and `Test Results` may be consumed by downstream prompts, checkers, or grep-based validation.
- Korean-first localization must therefore change surrounding prose without renaming machine-sensitive markers that automation still expects.

### Installed-runtime regression needs direct coverage

- Existing repo tests currently focus on the mirrored root runtime under `get-shit-done/`.
- Phase 08 should add or adapt tests so they invoke `.codex/get-shit-done/bin/gsd-tools.cjs` directly and prove the installed-runtime output is Korean-first.
- Those tests should also pin machine-sensitive tokens such as `## Decisions`, `## Objective`, `## Test Results`, `## Goal-Backward Verification`, `status: pending`, `<task ...>`, frontmatter keys, filenames, and phase/requirement IDs.

## Risk Profile

### Highest-risk changes

- Translating section names or tokens that downstream tools treat as exact labels
- Localizing only one generation path and leaving installed users with mixed English/Korean outputs
- Updating repository docs or the mirrored root runtime while missing the authoritative `.codex/get-shit-done/` runtime/template layer
- Regressing planning tests because headings changed shape unexpectedly

### Constraints

- Keep commands, flags, filenames, directory names, identifiers, and phase/requirement IDs unchanged
- Preserve English machine-sensitive labels where tooling depends on them
- Keep installed-skill behavior compatible with the upstream runtime shape
- Prefer deterministic test coverage over manual-only confidence

## Recommended Execution Shape

Use a two-plan sequence:

1. **08-01 Installed-runtime generation sources**
   - Localize `.codex/get-shit-done/bin/lib/template.cjs` and `.codex/get-shit-done/bin/lib/commands.cjs`
   - Update the relevant `.codex/get-shit-done/templates/` planning assets that still feed installed output
   - Narrowly sync mirrored root-runtime assets only if necessary to prevent repo drift

2. **08-02 Direct installed-runtime regression coverage**
   - Add or adapt tests that call `.codex/get-shit-done/bin/gsd-tools.cjs` directly
   - Assert Korean-first generated output plus preserved machine-sensitive tokens
   - Verify roadmap-level traceability and final validation commands

## Validation Architecture

### Quick checks

- `node --test tests/template.test.cjs`
- `node --test tests/commands.test.cjs`

### Focused generation checks

- `node --test tests/template.test.cjs && node --test tests/commands.test.cjs`
- `rg -n "Summary|Verification|Goal-Backward Verification|Test Results|status: pending|<task" .codex/get-shit-done/bin/lib/template.cjs .codex/get-shit-done/bin/lib/commands.cjs .codex/get-shit-done/templates tests`

### Full closure

- `node scripts/run-tests.cjs`
- `node get-shit-done/bin/gsd-tools.cjs roadmap analyze`

## Research Conclusion

Phase 08 should target the **authoritative installed generation layer** under `.codex/get-shit-done/`, not only repository docs or the mirrored root runtime. The correct fix is to localize the installed planning generators and templates there, then prove the behavior with direct installed-runtime regression tests that also preserve parser-sensitive labels.

## RESEARCH COMPLETE

Phase 08 is ready for planning.
