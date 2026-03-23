# Architecture Research: get-shit-done-ko

## Major Components

### 1. Distribution and install layer
- `package.json`
- `bin/install.js`
- shipped directories declared in `files`

This layer defines what gets installed and where. Localization should avoid changing executable packaging behavior.

### 2. User entry surfaces
- `README.md`
- `docs/`
- `commands/gsd/*.md`

These are the first-touch surfaces for users learning commands and workflows.

### 3. GSD prompt engine assets
- `get-shit-done/workflows/`
- `get-shit-done/templates/`
- `get-shit-done/references/`
- `agents/*.md`

These files define how downstream agents behave. Translating them safely is central to the product goal.

### 4. Runtime helper layer
- `get-shit-done/bin/gsd-tools.cjs`
- `get-shit-done/bin/lib/*.cjs`
- `hooks/`
- `scripts/`

These implement logic, validation, and generated runtime helpers. Translate only comments or user-facing strings here, not identifiers or behavior.

### 5. Verification layer
- `tests/`

Tests are the main safety net after localization changes.

## Data / Control Flow

1. User installs the package through `bin/install.js`.
2. Runtime-specific command/help files route into workflow markdown.
3. Workflows reference templates and references through stable file paths.
4. `gsd-tools.cjs` and helper libraries read/write `.planning` artifacts and enforce workflow logic.
5. Hooks and tests validate behavior and guardrails.

## Build Order Implications

1. Import upstream tree into repository root.
2. Remove Chinese docs and repoint navigation to Korean/English.
3. Localize docs and command/help surfaces.
4. Localize workflow/template/reference/agent text while preserving syntax markers.
5. Localize remaining user-facing strings/comments in code.
6. Run validation and repair any broken references or snippets.

## Recommended Boundaries

- Keep executable logic changes separate from translation-heavy commits where possible.
- Treat path-bearing markdown and code-bearing markdown as high-risk surfaces.
- Maintain a glossary so the same workflow terms stay consistent across files.
