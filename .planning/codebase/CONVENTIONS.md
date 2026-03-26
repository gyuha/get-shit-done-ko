# Coding Conventions

**Analysis Date:** 2026-03-26

## Naming Patterns

**Files:**
- Runtime code uses CommonJS filenames with `.js` for the npm entrypoint and build scripts in `bin/install.js` and `scripts/build-hooks.js`.
- Library modules under `get-shit-done/bin/lib/` use lowercase kebab-like names with `.cjs`, for example `get-shit-done/bin/lib/core.cjs`, `get-shit-done/bin/lib/config.cjs`, and `get-shit-done/bin/lib/commands.cjs`.
- Tests live in `tests/` and use `*.test.cjs`, for example `tests/core.test.cjs`, `tests/config.test.cjs`, and `tests/workspace.test.cjs`.

**Functions:**
- Use camelCase for exported helpers and command handlers, such as `loadConfig`, `findProjectRoot`, `cmdConfigNewProject`, and `cmdHistoryDigest` in `get-shit-done/bin/lib/core.cjs`, `get-shit-done/bin/lib/config.cjs`, and `get-shit-done/bin/lib/commands.cjs`.
- Prefix CLI command implementations with `cmd`, as shown by `cmdGenerateSlug`, `cmdCurrentTimestamp`, and `cmdVerifyPathExists` in `get-shit-done/bin/lib/commands.cjs`.
- Use verb-led helper names for test utilities, such as `runGsdTools`, `createTempProject`, and `cleanup` in `tests/helpers.cjs`.

**Variables:**
- Use camelCase for normal locals and parameters, including `selectedRuntimes`, `explicitDir`, `planningBase`, and `configPath` in `bin/install.js` and `get-shit-done/bin/lib/config.cjs`.
- Use UPPER_SNAKE_CASE for process-wide constants, for example `GSD_CODEX_MARKER`, `CODEX_AGENT_SANDBOX`, `VALID_CONFIG_KEYS`, and `HOOKS_TO_COPY` in `bin/install.js`, `get-shit-done/bin/lib/config.cjs`, and `scripts/build-hooks.js`.
- Prefer short descriptive loop variables when scope is local, such as `dir`, `fm`, `hook`, and `tmpDir` in `get-shit-done/bin/lib/commands.cjs`, `scripts/build-hooks.js`, and `tests/*.test.cjs`.

**Types:**
- No TypeScript types, interfaces, or JSDoc typedef blocks are used in the runtime modules inspected under `get-shit-done/bin/lib/` and `scripts/`.
- JSDoc is used selectively for function contracts and parameter meaning, for example `runGsdToolsAt` in `tests/helpers.cjs`, `getConfigDirFromHome` in `bin/install.js`, and `reapStaleTempFiles` in `get-shit-done/bin/lib/core.cjs`.

## Code Style

**Formatting:**
- Preserve `'use strict';` when a file already declares it, as in `scripts/run-tests.cjs` and `tests/security.test.cjs`. Most runtime files omit it and rely on Node CommonJS defaults, such as `bin/install.js` and `get-shit-done/bin/lib/commands.cjs`.
- Use two-space indentation, semicolons, and single-quoted strings consistently across `bin/install.js`, `get-shit-done/bin/lib/*.cjs`, and `tests/*.test.cjs`.
- Keep long destructuring imports on one `const { ... } = require(...)` line when manageable, even if the line becomes long, as in `get-shit-done/bin/lib/commands.cjs` and `tests/verify.test.cjs`.
- Prefer explicit early returns and guard clauses instead of nested branches, as seen in `cmdGenerateSlug` in `get-shit-done/bin/lib/commands.cjs` and `cmdConfigNewProject` in `get-shit-done/bin/lib/config.cjs`.
- Preserve token-sensitive literal strings and path fragments exactly in localized surfaces. This rule is reinforced by project guidance in `AGENTS.md` and by audit coverage in `scripts/audit-localization-gap.cjs` with tests in `tests/localization-gap-audit.test.cjs`.

**Linting:**
- No active ESLint, Prettier, Biome, or EditorConfig configuration was detected at the repository root; only `package.json` and `package-lock.json` were present.
- Style is enforced by existing file patterns plus automated tests, not by a checked-in formatter or linter config.
- When changing generated or packaged assets, keep syntax-valid JavaScript because `scripts/build-hooks.js` validates hooks with `vm.Script` before copying them to `hooks/dist`.

## Import Organization

**Order:**
1. Node built-ins first via `require(...)`, such as `fs`, `path`, `os`, `readline`, and `child_process` in `bin/install.js`, `get-shit-done/bin/lib/core.cjs`, and `tests/core.test.cjs`.
2. Local project modules next, usually via relative `require(...)`, such as `./core.cjs`, `./model-profiles.cjs`, and `../get-shit-done/bin/lib/frontmatter.cjs` in `get-shit-done/bin/lib/config.cjs`, `get-shit-done/bin/lib/commands.cjs`, and `tests/frontmatter.test.cjs`.
3. Inline `require(...)` inside a function is acceptable when the dependency is only needed on a narrow path, for example `require('os').homedir()` in `get-shit-done/bin/lib/core.cjs` and `require('child_process')` inside a single test in `tests/commands.test.cjs`.

**Path Aliases:**
- Not detected. All imports are relative file paths or Node built-ins in `bin/`, `get-shit-done/bin/lib/`, `scripts/`, and `tests/`.

## Error Handling

**Patterns:**
- CLI-facing failures call centralized `error(...)` helpers that write to stderr and exit, as shown in `get-shit-done/bin/lib/core.cjs`, `get-shit-done/bin/lib/config.cjs`, and `get-shit-done/bin/lib/commands.cjs`.
- Non-critical filesystem cleanup and probing frequently use `try { ... } catch {}` with intentionally empty catches, especially in `get-shit-done/bin/lib/core.cjs`, `get-shit-done/bin/lib/commands.cjs`, and `tests/helpers.cjs`.
- Functions that need to keep executing after a recoverable failure return structured objects rather than throwing, for example `runGsdToolsAt` in `tests/helpers.cjs` and `cmdVerifyPathExists` in `get-shit-done/bin/lib/commands.cjs`.
- JSON output helpers return machine-readable payloads through `output(...)`; command functions prefer `{ success/data }`-style objects over ad hoc strings in `get-shit-done/bin/lib/core.cjs`, `get-shit-done/bin/lib/config.cjs`, and `get-shit-done/bin/lib/commands.cjs`.

## Logging

**Framework:** console plus direct stdio writes

**Patterns:**
- Runtime commands prefer `fs.writeSync(1, ...)` and `fs.writeSync(2, ...)` through `output(...)` and `error(...)` in `get-shit-done/bin/lib/core.cjs` to avoid buffered stdout issues.
- Build and installer scripts log directly with `console.log`, `console.warn`, and `console.error`, as in `scripts/build-hooks.js` and `bin/install.js`.
- Tests capture stdout by replacing `fs.writeSync` when validating command output, as in the `websearch command` suite in `tests/commands.test.cjs`.

## Comments

**When to Comment:**
- Use file header comments to state module purpose, such as `Core — 공용 유틸리티...` in `get-shit-done/bin/lib/core.cjs`, `Config — planning config CRUD 작업` in `get-shit-done/bin/lib/config.cjs`, and `GSD Tools Tests - config.cjs` in `tests/config.test.cjs`.
- Add section dividers with box-drawing comments to break up long files, for example `// ─── loadConfig ───` in `tests/core.test.cjs` and `// ─── Path Traversal Prevention ───` in `tests/security.test.cjs`.
- Add brief why-focused comments around regressions, platform quirks, and workarounds, such as WSL detection notes in `bin/install.js`, coverage notes in `scripts/run-tests.cjs`, and regression annotations like `REG-01` and `REG-04` in `tests/core.test.cjs` and `tests/frontmatter.test.cjs`.

**JSDoc/TSDoc:**
- Use JSDoc selectively for reusable helpers with non-obvious inputs or behavior, as in `tests/helpers.cjs`, `bin/install.js`, and `get-shit-done/bin/lib/core.cjs`.
- Avoid blanket JSDoc on every function; many short command handlers and tests use no docblock, for example `cmdGenerateSlug` in `get-shit-done/bin/lib/commands.cjs`.

## Function Design

**Size:**
- Large multi-purpose modules are accepted when they group a domain, such as `bin/install.js`, `get-shit-done/bin/lib/core.cjs`, and `get-shit-done/bin/lib/commands.cjs`.
- Within those modules, keep individual helpers focused on one command or transformation, as shown by `cmdCurrentTimestamp`, `cmdListTodos`, and `validateKnownConfigKeyPath`.

**Parameters:**
- Pass `cwd` explicitly through command-layer functions instead of relying entirely on process-global state, for example `cmdConfigNewProject(cwd, choicesJson, raw)` in `get-shit-done/bin/lib/config.cjs` and `cmdListTodos(cwd, area, raw)` in `get-shit-done/bin/lib/commands.cjs`.
- Use plain object option bags for optional behavior where a function has multiple toggles, such as `reapStaleTempFiles(prefix, { maxAgeMs, dirsOnly })` in `get-shit-done/bin/lib/core.cjs` and `runAudit({...})` consumers in `tests/localization-gap-audit.test.cjs`.

**Return Values:**
- Reusable library functions return plain objects, arrays, booleans, or strings without class wrappers, as in `loadConfig`, `detectSubRepos`, and `buildNewProjectConfig`.
- Test helpers return `{ success, output, error }` envelopes for shell-driven assertions in `tests/helpers.cjs`.
- CLI command handlers generally terminate by calling `output(...)` or `error(...)` rather than returning user-facing strings directly.

## Module Design

**Exports:**
- Use `module.exports = { ... }` object exports at the end of CommonJS modules, as in `get-shit-done/bin/lib/core.cjs`, `get-shit-done/bin/lib/config.cjs`, `scripts/apply-upstream-refresh.cjs`, and `tests/helpers.cjs`.
- Export internal pure helpers when tests need direct coverage, for example `extractFrontmatter` from `get-shit-done/bin/lib/frontmatter.cjs`, `buildReleaseState` from `scripts/check-upstream-release.cjs`, and `runAudit` from `scripts/audit-localization-gap.cjs`.

**Barrel Files:**
- Not used. Each module is imported directly by relative path, for example `../get-shit-done/bin/lib/core.cjs` and `../scripts/check-upstream-release.cjs`.

---
*Convention analysis: 2026-03-26*
