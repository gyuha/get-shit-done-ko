# Phase 02 Research: Korean-First Documentation

**Phase:** 02  
**Goal:** Make public documentation Korean-first while preserving English access and removing Simplified Chinese content and links.

## Scope Findings

### Current documentation surface

Current root/documentation files relevant to this phase:

- `README.md`
- `README.zh-CN.md`
- `docs/README.md`
- `docs/USER-GUIDE.md`
- `docs/FEATURES.md`
- `docs/CONFIGURATION.md`
- `docs/COMMANDS.md`
- `docs/CLI-TOOLS.md`
- `docs/ARCHITECTURE.md`
- `docs/AGENTS.md`
- `docs/context-monitor.md`
- `docs/workflow-discuss-mode.md`
- `docs/zh-CN/README.md`
- `docs/zh-CN/USER-GUIDE.md`

### Confirmed Chinese entry points

Current Chinese references found in the imported baseline:

- `README.md` links to `README.zh-CN.md`
- `README.md` links to `docs/zh-CN/README.md`
- `docs/zh-CN/README.md`
- `docs/zh-CN/USER-GUIDE.md`
- `README.zh-CN.md`

### English preservation requirement

English must remain available. The safest approach is:

- keep the existing English docs in place
- convert the fork’s default top-level doc surfaces to Korean
- leave file names and internal path tokens unchanged
- remove Chinese docs and replace links with Korean/English navigation

## Recommended Execution Shape

### Plan split

Use three plans:

1. **README and docs index localization**
   - establish Korean-first navigation and language policy
   - touch `README.md` and `docs/README.md`

2. **Primary documentation translation**
   - translate the high-value user/reference docs
   - keep links/file names in English

3. **Chinese cleanup and cross-link repair**
   - remove Chinese files
   - remove Chinese nav links
   - verify English fallback links still work

### Dependency order

- Plan `02-01` should go first because it establishes the top-level navigation pattern.
- Plan `02-02` should depend on `02-01` because the translated docs should follow the navigation and terminology introduced there.
- Plan `02-03` should run last because Chinese-link cleanup is safest after the new Korean navigation is already in place.

## Translation Constraints

- Keep commands such as `/gsd:new-project`, `$gsd-plan-phase`, flags, and code snippets unchanged.
- Keep file names, directory names, identifiers, and markdown link targets unchanged.
- Translate explanatory prose, headings, summaries, notes, and user-facing descriptions.
- Preserve tables, anchors, and section hierarchy so existing references still resolve.

## Validation Architecture

### Quick checks

- `rg -n "간체中文|简体中文|README\\.zh-CN|docs/zh-CN" README.md docs`
- `test ! -e README.zh-CN.md && test ! -d docs/zh-CN`
- `rg -n "한국어|Korean" README.md docs/README.md`

### Functional checks

- `node get-shit-done/bin/gsd-tools.cjs validate health`
- `node scripts/run-tests.cjs`

### Document integrity checks

- Verify that core docs still exist:
  - `README.md`
  - `docs/README.md`
  - `docs/USER-GUIDE.md`
  - `docs/FEATURES.md`
  - `docs/CONFIGURATION.md`
  - `docs/COMMANDS.md`
- Verify cross-links still point to existing English-path files.

## Risks

- Large markdown files can accidentally translate link targets or command literals if edited carelessly.
- Removing Chinese docs too early can leave dangling links in README/docs navigation.
- Inconsistent Korean terminology across README and docs index can make later workflow/template translation harder.

## Planning Notes

- Prefer doc clusters over one huge plan.
- Keep Chinese cleanup isolated in the last plan.
- Include grep-verifiable acceptance criteria for every edited doc group.

## RESEARCH COMPLETE

Phase 02 is ready for planning. The main work is documentation localization and link cleanup; no additional codebase discovery is needed.
