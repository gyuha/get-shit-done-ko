# Testing Patterns

**Analysis Date:** 2026-03-26

## Test Framework

**Runner:**
- Node.js built-in `node:test` is the primary runner, used directly in `tests/core.test.cjs`, `tests/config.test.cjs`, `tests/commands.test.cjs`, and the rest of `tests/*.test.cjs`.
- The repository-level runner is `scripts/run-tests.cjs`, invoked by `package.json` as `npm test`.

**Assertion Library:**
- `node:assert` is the default assertion library in files such as `tests/core.test.cjs`, `tests/config.test.cjs`, and `tests/commands.test.cjs`.
- `node:assert/strict` is used where stricter semantics are preferred, as in `tests/security.test.cjs`.

**Run Commands:**
```bash
npm test
node --test tests/config.test.cjs
npm run test:coverage
```

## Test File Organization

**Location:**
- All checked-in automated tests are centralized under `tests/`.
- Test support helpers live beside the suites in `tests/helpers.cjs`; there is no separate `__tests__/` or fixture directory.

**Naming:**
- Use `*.test.cjs` for executable suites, such as `tests/frontmatter.test.cjs`, `tests/verify.test.cjs`, and `tests/upstream-sync.test.cjs`.
- Keep helper-only utilities outside the suffix pattern, for example `tests/helpers.cjs`.

**Structure:**
```text
tests/
├── helpers.cjs
├── core.test.cjs
├── commands.test.cjs
├── config.test.cjs
├── verify.test.cjs
├── security.test.cjs
└── ...other *.test.cjs
```

## Test Structure

**Suite Organization:**
```javascript
const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');

describe('config-set command', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = createTempProject();
    runGsdTools('config-ensure-section', tmpDir);
  });

  afterEach(() => {
    cleanup(tmpDir);
  });

  test('sets nested values via dot-notation', () => {
    const result = runGsdTools('config-set workflow.research false', tmpDir);
    assert.ok(result.success, `Command failed: ${result.error}`);
  });
});
```
Pattern source: `tests/config.test.cjs`.

**Patterns:**
- Group cases by exported function or CLI command with top-level `describe(...)`, as seen in `tests/core.test.cjs`, `tests/security.test.cjs`, and `tests/workspace.test.cjs`.
- Use `beforeEach` and `afterEach` to create and remove isolated temp directories for nearly every filesystem-affecting suite, using helpers from `tests/helpers.cjs`.
- Keep assertions close to the command result: arrange data on disk, run the helper or CLI entrypoint, parse JSON if needed, then assert exact fields, as in `tests/commands.test.cjs`, `tests/verify.test.cjs`, and `tests/upstream-sync.test.cjs`.
- Large suites are broken into comment-delimited sections inside a single file rather than split across many tiny files, as in `tests/core.test.cjs` and `tests/verify.test.cjs`.

## Mocking

**Framework:** manual stubbing only

**Patterns:**
```javascript
beforeEach(() => {
  origFetch = global.fetch;
  origWriteSync = fs.writeSync;
  captured = '';
  fs.writeSync = (fd, data) => {
    if (fd === 1) captured += data;
    return Buffer.byteLength(String(data));
  };
});

afterEach(() => {
  global.fetch = origFetch;
  fs.writeSync = origWriteSync;
});

global.fetch = async () => ({
  ok: true,
  json: async () => ({ web: { results: [] } }),
});
```
Pattern source: `tests/commands.test.cjs`.

**What to Mock:**
- Mock network boundaries like `global.fetch` when testing command logic that would otherwise call an external API, as in the `websearch command` tests in `tests/commands.test.cjs`.
- Stub direct output sinks like `fs.writeSync` when validating CLI JSON written through `output(...)`, also in `tests/commands.test.cjs`.

**What NOT to Mock:**
- Do not mock filesystem-heavy project state when a temp directory can exercise the real behavior. Suites in `tests/config.test.cjs`, `tests/verify.test.cjs`, `tests/workspace.test.cjs`, and `tests/upstream-sync.test.cjs` create actual files and directories instead.
- Do not mock Git when a disposable repo is sufficient. `tests/helpers.cjs` creates real repositories via `git init`, and suites such as `tests/workspace.test.cjs` and `tests/core.test.cjs` run actual Git commands.

## Fixtures and Factories

**Test Data:**
```javascript
function createTempProject() {
  const tmpDir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'gsd-test-'));
  fs.mkdirSync(path.join(tmpDir, '.planning', 'phases'), { recursive: true });
  return tmpDir;
}

function runGsdTools(args, cwd = process.cwd(), env = {}) {
  return runGsdToolsAt(TOOLS_PATH, args, cwd, env);
}
```
Pattern source: `tests/helpers.cjs`.

**Location:**
- Reusable test factories and process helpers live in `tests/helpers.cjs`.
- Suite-specific inline factories are acceptable when tightly scoped, such as `validPlanContent(...)` in `tests/verify.test.cjs`, `makeTempDir(...)` and `seedRepo(...)` in `tests/upstream-sync.test.cjs`, and `writeFile(...)` helpers in `tests/localization-gap-audit.test.cjs`.

## Coverage

**Requirements:** `npm run test:coverage` enforces at least 70% line coverage through `c8 --check-coverage --lines 70` in `package.json`.

**View Coverage:**
```bash
npm run test:coverage
```

Coverage scope notes:
- Coverage currently includes `get-shit-done/bin/lib/*.cjs` and excludes `tests/**`, as configured in `package.json`.
- The coverage script runs through `scripts/run-tests.cjs`, so new tests should remain discoverable by the `.test.cjs` scan in `tests/`.

## Test Types

**Unit Tests:**
- Pure helper and parser behavior is tested by importing functions directly, for example `tests/frontmatter.test.cjs`, `tests/security.test.cjs`, and parts of `tests/core.test.cjs`.

**Integration Tests:**
- CLI and workflow behaviors are tested by creating temp projects and invoking the real Node entrypoint via `runGsdTools(...)` or `runCodexGsdTools(...)`, as in `tests/config.test.cjs`, `tests/commands.test.cjs`, `tests/verify.test.cjs`, and `tests/codex-config.test.cjs`.
- Script-level integration tests import and execute exported script helpers directly with real filesystem state, as in `tests/upstream-sync.test.cjs` and `tests/localization-gap-audit.test.cjs`.

**E2E Tests:**
- No separate browser or full end-to-end framework was detected. The closest pattern is CLI integration through disposable repos and temp directories.

## Common Patterns

**Async Testing:**
```javascript
test('handles network failure', async () => {
  process.env.BRAVE_API_KEY = 'test-key';

  global.fetch = async () => {
    throw new Error('Network timeout');
  };

  await cmdWebsearch('test query', {}, false);

  const output = JSON.parse(captured);
  assert.strictEqual(output.available, false);
  assert.strictEqual(output.error, 'Network timeout');
});
```
Pattern source: `tests/commands.test.cjs`.

**Error Testing:**
```javascript
test('throws on traversal attempt', () => {
  assert.throws(
    () => requireSafePath('../../etc/passwd', base, 'PRD file'),
    /PRD file validation failed/
  );
});
```
Pattern source: `tests/security.test.cjs`.

Additional recurring practices:
- Prefer exact message fragments for regression-sensitive output, including localized text, as in `tests/config.test.cjs` assertions for Korean error messages.
- Use documented regression IDs in test names or surrounding comments when preserving a known bug or backfill, such as `REG-01` in `tests/core.test.cjs` and `REG-04` in `tests/frontmatter.test.cjs`.
- Validate structured JSON output after every CLI command instead of only checking exit success, as in `tests/config.test.cjs`, `tests/commands.test.cjs`, and `tests/verify.test.cjs`.

**Snapshot Testing:**
- Not used. No snapshot files or snapshot assertion helpers were detected.

---
*Testing analysis: 2026-03-26*
