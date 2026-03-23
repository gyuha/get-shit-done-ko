# Phase 04 Research: Runtime Text and Comment Localization

## Phase Goal

Localize remaining user-facing source strings and explanatory comments in maintained JavaScript/CJS assets without changing executable identifiers, command syntax, or behavior contracts.

## Current State

Phase 3 localized markdown-driven command/workflow/template/reference/agent assets. Remaining English-heavy surfaces now cluster in executable source files:

- `bin/install.js`
- `scripts/build-hooks.js`
- `get-shit-done/bin/gsd-tools.cjs`
- `get-shit-done/bin/lib/*.cjs`

These files contain:

- CLI help/error/status text emitted at runtime
- installer output and diagnostics
- workstream/config/profile/verification user-facing messages
- explanatory comments and docblocks for maintainers
- tests that currently assert English output strings

## Evidence Gathered

### User-Facing Runtime Copy Hotspots

High-density string files discovered during planning scan:

- `bin/install.js`
- `get-shit-done/bin/gsd-tools.cjs`
- `get-shit-done/bin/lib/config.cjs`
- `get-shit-done/bin/lib/profile-output.cjs`
- `get-shit-done/bin/lib/verify.cjs`
- `get-shit-done/bin/lib/workstream.cjs`
- `get-shit-done/bin/lib/phase.cjs`
- `get-shit-done/bin/lib/commands.cjs`
- `get-shit-done/bin/lib/profile-pipeline.cjs`
- `scripts/build-hooks.js`

### Comment / Docblock Hotspots

High-density comment files discovered during planning scan:

- `bin/install.js`
- `get-shit-done/bin/lib/core.cjs`
- `get-shit-done/bin/lib/init.cjs`
- `get-shit-done/bin/lib/state.cjs`
- `get-shit-done/bin/lib/phase.cjs`
- `get-shit-done/bin/lib/commands.cjs`
- `get-shit-done/bin/lib/verify.cjs`
- `get-shit-done/bin/lib/security.cjs`
- `get-shit-done/bin/lib/config.cjs`
- `get-shit-done/bin/gsd-tools.cjs`

## Constraints

- Keep command names, flags, config keys, file paths, identifiers, phase/requirement IDs, placeholders, and machine-readable markers unchanged.
- Translate only human-facing runtime copy and explanatory comments/docblocks.
- Update tests and fixtures alongside string changes where assertions depend on English text.
- Avoid changing comments that act as sentinels for tests or code generation unless the corresponding tests are updated safely.

## Recommended Execution Split

### Wave 1 — `04-01`

Translate runtime user-facing strings in installer/CLI/helper modules and update affected tests.

Primary files:

- `bin/install.js`
- `scripts/build-hooks.js`
- `get-shit-done/bin/gsd-tools.cjs`
- `get-shit-done/bin/lib/config.cjs`
- `get-shit-done/bin/lib/commands.cjs`
- `get-shit-done/bin/lib/phase.cjs`
- `get-shit-done/bin/lib/profile-output.cjs`
- `get-shit-done/bin/lib/profile-pipeline.cjs`
- `get-shit-done/bin/lib/verify.cjs`
- `get-shit-done/bin/lib/workstream.cjs`
- affected `tests/*.test.cjs`

### Wave 2 — `04-02`

Translate explanatory comments/docblocks in maintained source modules and perform semantic drift review with final regression checks.

Primary files:

- `bin/install.js`
- `scripts/*.js`
- `get-shit-done/bin/gsd-tools.cjs`
- `get-shit-done/bin/lib/core.cjs`
- `get-shit-done/bin/lib/init.cjs`
- `get-shit-done/bin/lib/state.cjs`
- `get-shit-done/bin/lib/phase.cjs`
- `get-shit-done/bin/lib/commands.cjs`
- `get-shit-done/bin/lib/verify.cjs`
- `get-shit-done/bin/lib/security.cjs`
- other touched helper modules as needed

## Risk Notes

- Test regressions are likely because current assertions check English strings directly.
- Installer/runtime output often mixes human text with tokens, ANSI codes, paths, or command literals; token preservation must be explicit in plan tasks.
- Comment translation can accidentally alter examples or code snippets embedded inside docblocks; review should distinguish prose from executable examples.

## Validation Strategy

- Use targeted grep checks for Korean runtime copy in source hotspots.
- Re-run `node scripts/run-tests.cjs` after runtime string changes.
- Re-run `node get-shit-done/bin/gsd-tools.cjs validate health`.
- Spot-check representative files to confirm flags, keys, identifiers, and command literals remain English.

## Context Decision

No separate `04-CONTEXT.md` is required. The roadmap, requirements, and Phase 3 localization rules already define the scope clearly: translate human-facing source copy and comments while preserving compatibility-sensitive tokens.
