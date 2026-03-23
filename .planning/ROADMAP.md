# Roadmap: get-shit-done-ko

## Overview

This roadmap takes the project from an empty destination repository to a Korean-first, upstream-compatible localization fork of `get-shit-done` `v1.28.0`. The work starts by mirroring the upstream tree, then localizes documentation and prompt assets in widening layers, and ends with compatibility verification so the fork remains safe to use and maintain.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Upstream Baseline Import** - Bring upstream `v1.28.0` into the repo root with traceable parity.
- [ ] **Phase 2: Korean-First Documentation** - Make docs/readme/navigation Korean-first while preserving English and removing Chinese.
- [ ] **Phase 3: Workflow Asset Localization** - Translate command/workflow/template/reference surfaces without breaking structured tokens.
- [ ] **Phase 4: Runtime Text and Comment Localization** - Localize remaining user-facing source strings and explanatory comments safely.
- [ ] **Phase 5: Compatibility Validation and Release Prep** - Verify integrity, repair regressions, and prepare the fork for ongoing maintenance.

## Phase Details

### Phase 1: Upstream Baseline Import
**Goal**: Mirror upstream `get-shit-done` `v1.28.0` into the repository root and document the baseline so later localization happens on a stable source tree.
**Depends on**: Nothing (first phase)
**Requirements**: [SYNC-01, SYNC-02]
**Success Criteria** (what must be TRUE):
  1. Repository root matches the upstream `v1.28.0` structure for required runtime files and directories.
  2. Project docs identify the upstream source and version clearly enough for future sync work.
  3. No required install/test assets are omitted during baseline import.
**Plans**: 2 plans

Plans:
- [x] 01-01: Import upstream repository contents into the project root while preserving destination git history.
- [ ] 01-02: Audit imported structure, note parity decisions, and resolve any immediate path/layout mismatches.

### Phase 2: Korean-First Documentation
**Goal**: Make public documentation Korean-first while preserving English access and removing Simplified Chinese content and links.
**Depends on**: Phase 1
**Requirements**: [DOCS-01, DOCS-02, DOCS-03]
**Success Criteria** (what must be TRUE):
  1. README and major docs present Korean as the primary reading path.
  2. English docs remain accessible from the fork.
  3. Chinese docs and navigation links are removed or replaced.
**Plans**: 3 plans

Plans:
- [ ] 02-01: Localize README and top-level doc navigation to Korean-first structure.
- [ ] 02-02: Translate primary documentation pages and preserve English cross-links.
- [ ] 02-03: Remove `zh-CN` content and clean up remaining Chinese references.

### Phase 3: Workflow Asset Localization
**Goal**: Translate GSD’s command/help/workflow/template/reference assets so Korean becomes the default working language without damaging structured prompt syntax.
**Depends on**: Phase 2
**Requirements**: [FLOW-01, FLOW-02]
**Success Criteria** (what must be TRUE):
  1. Command/help/workflow/template/reference prose is Korean by default.
  2. Command literals, placeholders, IDs, filenames, and `@` references remain valid.
  3. Downstream prompt consumers can still resolve files and structured sections correctly.
**Plans**: 3 plans

Plans:
- [ ] 03-01: Translate command docs and help-facing workflow entry points.
- [ ] 03-02: Translate workflow/template/reference files while preserving markup and tokens.
- [ ] 03-03: Review agent prompts and shared terminology for consistency across assets.

### Phase 4: Runtime Text and Comment Localization
**Goal**: Localize remaining user-facing source strings and explanatory comments in code without changing behavior contracts.
**Depends on**: Phase 3
**Requirements**: [TEXT-01, TEXT-02]
**Success Criteria** (what must be TRUE):
  1. User-facing help/checkpoint/error-style strings in maintained source assets are Korean where intended.
  2. Explanatory comments are translated where useful without changing identifiers or executable semantics.
  3. Code still behaves the same as the upstream baseline aside from language output.
**Plans**: 2 plans

Plans:
- [ ] 04-01: Translate user-facing source strings in scripts, helpers, and related maintained assets.
- [ ] 04-02: Translate explanatory comments selectively and review for semantic drift.

### Phase 5: Compatibility Validation and Release Prep
**Goal**: Validate that localization preserved command compatibility, references, and runtime behavior, then prepare the fork for ongoing maintenance.
**Depends on**: Phase 4
**Requirements**: [QUAL-01, QUAL-02]
**Success Criteria** (what must be TRUE):
  1. Existing install/test flows run without critical regression.
  2. Commands, file paths, identifiers, snippets, and IDs are unchanged where required.
  3. Remaining translation integrity issues are documented and fixed before release.
**Plans**: 3 plans

Plans:
- [ ] 05-01: Run automated validation and capture breakages caused by localization.
- [ ] 05-02: Repair broken references, snippets, or runtime text issues found during validation.
- [ ] 05-03: Finalize release notes and maintainer guidance for future upstream syncs.

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Upstream Baseline Import | 0/2 | Not started | - |
| 2. Korean-First Documentation | 0/3 | Not started | - |
| 3. Workflow Asset Localization | 0/3 | Not started | - |
| 4. Runtime Text and Comment Localization | 0/2 | Not started | - |
| 5. Compatibility Validation and Release Prep | 0/3 | Not started | - |
