# Roadmap: get-shit-done-ko

## Overview

This roadmap takes the project from an empty destination repository to a Korean-first, upstream-compatible localization fork of `get-shit-done` `v1.28.0`. The work starts by mirroring the upstream tree, then localizes documentation and prompt assets in widening layers, and ends with compatibility verification and installed-skill output polish so the fork remains safe to use and maintain.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Upstream Baseline Import** - Bring upstream `v1.28.0` into the repo root with traceable parity.
- [x] **Phase 2: Korean-First Documentation** - Make docs/readme/navigation Korean-first while preserving English and removing Chinese. (completed 2026-03-23)
- [x] **Phase 3: Workflow Asset Localization** - Translate command/workflow/template/reference surfaces without breaking structured tokens. (completed 2026-03-23)
- [x] **Phase 4: Runtime Text and Comment Localization** - Localize remaining user-facing source strings and explanatory comments safely. (completed 2026-03-23)
- [x] **Phase 5: Compatibility Validation and Release Prep** - Verify integrity, repair regressions, and prepare the fork for ongoing maintenance. (completed 2026-03-23)
- [x] **Phase 6: Rename npm package and installer entrypoint to get-shit-done-ko** - Make the fork's published install path match its Korean-localized package identity. (completed 2026-03-23)
- [x] **Phase 7: Automated Upstream GSD Sync Skill** - Add a maintainer skill that checks upstream GitHub releases and refreshes the vendored GSD tree only when a newer upstream release exists. (completed 2026-03-23)
- [x] **Phase 8: Make generated planning documents Korean-first for installed skills** - Ensure the authoritative installed Codex runtime emits Korean-first planning documents while preserving parser-sensitive tokens. (completed 2026-03-24)

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
- [x] 01-02: Audit imported structure, note parity decisions, and resolve any immediate path/layout mismatches.

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
- [x] 02-01: Localize README and top-level doc navigation to Korean-first structure.
- [x] 02-02: Translate primary documentation pages and preserve English cross-links.
- [x] 02-03: Remove `zh-CN` content and clean up remaining Chinese references.

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
- [x] 03-01: Translate command docs and help-facing workflow entry points.
- [x] 03-02: Translate workflow/template/reference files while preserving markup and tokens.
- [x] 03-03: Review agent prompts and shared terminology for consistency across assets.

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
- [x] 04-01: Translate user-facing source strings in scripts, helpers, and related maintained assets.
- [x] 04-02: Translate explanatory comments selectively and review for semantic drift.

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
- [x] 05-01: Run automated validation and capture breakages caused by localization.
- [x] 05-02: Repair broken references, snippets, or runtime text issues found during validation.
- [x] 05-03: Finalize release notes and maintainer guidance for future upstream syncs.

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Upstream Baseline Import | 2/2 | Complete | 2026-03-23 |
| 2. Korean-First Documentation | 3/3 | Complete | 2026-03-23 |
| 3. Workflow Asset Localization | 3/3 | Complete | 2026-03-23 |
| 4. Runtime Text and Comment Localization | 2/2 | Complete   | 2026-03-23 |
| 5. Compatibility Validation and Release Prep | 3/3 | Complete | 2026-03-23 |
| 6. Rename npm package and installer entrypoint to get-shit-done-ko | 3/3 | Complete | 2026-03-23 |
| 7. Automated Upstream GSD Sync Skill | 3/3 | Complete | 2026-03-23 |
| 8. Make generated planning documents Korean-first for installed skills | 2/2 | Complete    | 2026-03-24 |

### Phase 6: Rename npm package and installer entrypoint to get-shit-done-ko

**Goal:** Rename the published npm package and installer entrypoint to `get-shit-done-ko`, then align docs, workflows, and regression coverage so the fork's canonical install path matches reality.
**Depends on:** Phase 5
**Requirements**: [PKG-01, PKG-02, PKG-03]
**Success Criteria** (what must be TRUE):
  1. `package.json`, `package-lock.json`, and installer-facing entrypoints expose `get-shit-done-ko` as the actual npm package and bin name.
  2. README, maintainer docs, and workflow/help/update text no longer present `get-shit-done-cc` as a canonical command.
  3. Install, update, uninstall, and regression flows stay green after the rename.
**Plans:** 3/3 plans complete

Plans:
- [x] 06-01: Rename package metadata and runtime-facing installer/update/help entrypoints to `get-shit-done-ko`.
- [x] 06-02: Replace public and maintainer-facing command examples so docs match the renamed package identity.
- [x] 06-03: Expand regression coverage for the renamed package/bin surfaces and run final verification.

### Phase 7: Automated Upstream GSD Sync Skill

**Goal:** Add a maintainer-only skill that checks upstream GitHub releases, compares them against this repo's tracked upstream baseline, and refreshes the vendored GSD tree only when upstream is newer.
**Depends on:** Phase 6
**Requirements**: [L10N-01, L10N-04, L10N-05, L10N-06]
**Success Criteria** (what must be TRUE):
  1. Maintainer can run a dedicated skill that reports the latest upstream release tag/date and this repo's tracked baseline before any mutation.
  2. If upstream is newer, the skill can import the newer vendored GSD snapshot into the repo while preserving Korean overlays and protected local files.
  3. If upstream is not newer, the skill exits cleanly with an explicit no-op summary and leaves the worktree unchanged.
  4. Maintainer docs and tests cover the comparison logic, dry-run/update path, and safe post-sync verification flow.
**Plans**: 3/3 plans complete

Plans:
- [x] 07-01: Introduce a dedicated upstream-sync skill, machine-readable baseline tracking, and release comparison logic.
- [x] 07-02: Implement the safe upstream refresh flow that imports newer GSD sources and reapplies fork-local overlays.
- [x] 07-03: Add regression coverage and maintainer documentation for no-op, dry-run, and successful sync flows.

### Phase 8: Make generated planning documents Korean-first for installed skills

**Goal:** Ensure installed GSD skills generate Korean-first planning documents across scaffolded and templated outputs while preserving machine-sensitive tokens and parser compatibility.
**Requirements**: [L10N-07, L10N-08]
**Depends on:** Phase 7
**Plans:** 2/2 plans complete

**Success Criteria** (what must be TRUE):
  1. Installed skill flows generate Korean-first planning documents for the main scaffold/template entrypoints used by maintainers.
  2. Machine-sensitive tokens, parser-expected labels, paths, and IDs remain compatible after the localization changes.
  3. Regression coverage proves the Korean-first output for the affected generation paths.

Plans:
- [x] 08-01: Localize the authoritative installed-runtime planning generators and templates under `.codex/get-shit-done/`.
- [x] 08-02: Add direct installed-runtime regression coverage for Korean-first planning output and parser-safe guardrails.

## Backlog

### Phase 999.1: Make `gsd:help` command output Korean-first instead of mixed Korean-English (BACKLOG)

**Goal:** [Captured for future planning]
**Requirements:** TBD
**Plans:** 0 plans

Plans:
- [ ] TBD (promote with $gsd-review-backlog when ready)
