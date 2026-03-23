# Requirements: get-shit-done-ko

**Defined:** 2026-03-23
**Core Value:** Korean-speaking users can use GSD end-to-end in Korean without breaking upstream command compatibility.

## v1 Requirements

### Sync Baseline

- [x] **SYNC-01**: Maintainer can import upstream `get-shit-done` `v1.28.0` into the repository root without missing required runtime directories or files.
- [x] **SYNC-02**: Maintainer can identify the upstream version and counterpart structure for the localized fork from project documentation.

### Documentation

- [x] **DOCS-01**: Korean-speaking user can read a Korean-first README and major documentation without relying on English first.
- [x] **DOCS-02**: User can still access English documentation from the fork for reference.
- [x] **DOCS-03**: User is not sent to Simplified Chinese documentation or navigation links anywhere in the fork.

### Workflow Localization

- [x] **FLOW-01**: User sees Korean explanatory text in command docs, workflow prompts, references, and templates while command literals remain unchanged.
- [x] **FLOW-02**: Downstream agents can read localized workflow/template/reference content without broken `@` references, placeholders, or structured markup.

### Runtime Messaging

- [ ] **TEXT-01**: User sees Korean help, checkpoint, and error-style messaging wherever those strings are defined in maintained source assets.
- [ ] **TEXT-02**: Maintainer can keep explanatory comments in Korean without changing executable identifiers or logic contracts.

### Quality Assurance

- [ ] **QUAL-01**: Maintainer can run the existing install/test flow after localization and confirm no critical regressions were introduced.
- [ ] **QUAL-02**: Maintainer can verify that commands, file paths, identifiers, snippets, and phase/requirement IDs remain unchanged after translation.

## v2 Requirements

### Localization Operations

- **L10N-01**: Maintainer can sync newer upstream releases with a documented Korean update workflow.
- **L10N-02**: Maintainer can run a terminology/integrity lint pass for translated assets.
- **L10N-03**: Contributor can read a Korean maintainer guide for localization conventions.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Renaming commands or flags | Breaks upstream-compatible usage and examples |
| Renaming files/directories/identifiers | Breaks references, tooling, and future sync work |
| Re-architecting GSD feature behavior | Not required for the localization goal |
| Keeping Simplified Chinese docs in the fork | Conflicts with the requested language policy |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SYNC-01 | Phase 1 | Complete |
| SYNC-02 | Phase 1 | Complete |
| DOCS-01 | Phase 2 | Complete |
| DOCS-02 | Phase 2 | Complete |
| DOCS-03 | Phase 2 | Complete |
| FLOW-01 | Phase 3 | Complete |
| FLOW-02 | Phase 3 | Complete |
| TEXT-01 | Phase 4 | Pending |
| TEXT-02 | Phase 4 | Pending |
| QUAL-01 | Phase 5 | Pending |
| QUAL-02 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 11 total
- Mapped to phases: 11
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-23*
*Last updated: 2026-03-23 after Phase 3 completion*
