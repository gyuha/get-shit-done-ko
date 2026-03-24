const { afterEach, describe, test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { buildReleaseState } = require('../scripts/check-upstream-release.cjs');
const {
  IMPORT_ENTRIES,
  PRESERVED_PATHS,
  getImportEntries,
  parseArgs,
  runRefresh,
} = require('../scripts/apply-upstream-refresh.cjs');

const tempDirs = [];

function makeTempDir(name) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `${name}-`));
  tempDirs.push(dir);
  return dir;
}

function writeFile(root, relativePath, content) {
  const targetPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, content, 'utf8');
}

function writeJson(root, relativePath, value) {
  writeFile(root, relativePath, `${JSON.stringify(value, null, 2)}\n`);
}

function readFile(root, relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function makeBaselineDoc(tag) {
  return [
    '# Upstream Sync 기준선',
    '',
    `- Baseline tag: \`${tag}\``,
    `- Current tracked upstream baseline: \`${tag}\``,
    '',
  ].join('\n');
}

function seedRepo(root, { baselineTag, packageVersion, readme, coreDoc, localDoc, removedDoc }) {
  writeJson(root, 'package.json', {
    name: 'get-shit-done-ko',
    version: packageVersion,
  });
  writeFile(root, 'README.md', readme);
  writeFile(root, 'docs/UPSTREAM-SYNC.md', makeBaselineDoc(baselineTag));
  writeFile(root, 'docs/core.md', coreDoc);
  writeFile(root, 'get-shit-done/UPSTREAM_VERSION', `${baselineTag}\n`);

  if (localDoc !== undefined) {
    writeFile(root, 'docs/localized-guide.md', localDoc);
  }

  if (removedDoc !== undefined) {
    writeFile(root, 'docs/removed-locally.md', removedDoc);
  }
}

afterEach(() => {
  while (tempDirs.length > 0) {
    fs.rmSync(tempDirs.pop(), { recursive: true, force: true });
  }
});

describe('buildReleaseState', () => {
  test('reports when upstream is newer than the tracked baseline', () => {
    const result = buildReleaseState({
      currentTag: 'v1.28.0',
      latestTag: 'v1.29.0',
      latestPublishedAt: '2026-03-22T15:45:26Z',
      packageVersion: '1.28.1',
    });

    assert.strictEqual(result.status, 'update_available');
    assert.strictEqual(result.update_available, true);
    assert.strictEqual(result.local_ahead, false);
    assert.strictEqual(result.current_tag, 'v1.28.0');
    assert.strictEqual(result.latest_tag, 'v1.29.0');
    assert.strictEqual(result.package_version, '1.28.1');
  });

  test('reports a no-op when the tracked baseline matches upstream latest', () => {
    const result = buildReleaseState({
      currentTag: 'v1.28.0',
      latestTag: 'v1.28.0',
      packageVersion: '1.28.1',
    });

    assert.strictEqual(result.status, 'current');
    assert.strictEqual(result.update_available, false);
    assert.strictEqual(result.local_ahead, false);
  });

  test('reports when the local tracked baseline is ahead of upstream latest', () => {
    const result = buildReleaseState({
      currentTag: 'v1.28.1',
      latestTag: 'v1.28.0',
      packageVersion: '1.28.1',
    });

    assert.strictEqual(result.status, 'ahead');
    assert.strictEqual(result.update_available, false);
    assert.strictEqual(result.local_ahead, true);
  });
});

describe('runRefresh', () => {
  test('returns a no-op dry-run when upstream is equal to the tracked baseline', () => {
    const repoDir = makeTempDir('upstream-sync-repo');
    seedRepo(repoDir, {
      baselineTag: 'v1.28.0',
      packageVersion: '1.28.1',
      readme: 'localized readme\n',
      coreDoc: 'core doc\n',
    });

    const result = runRefresh({
      cwd: repoDir,
      currentFile: 'get-shit-done/UPSTREAM_VERSION',
      toTag: 'v1.28.0',
      dryRun: true,
    });

    assert.strictEqual(result.applied, false);
    assert.strictEqual(result.no_op, true);
    assert.strictEqual(result.status, 'current');
    assert.strictEqual(result.apply_mode, 'source-of-truth');
    assert.deepStrictEqual(Object.keys(result).sort(), [
      'applied',
      'apply_mode',
      'current_tag',
      'incoming_tag',
      'latest_published_at',
      'no_op',
      'overlay_delete',
      'overlay_reapply',
      'package_version',
      'preserved',
      'status',
      'summary',
      'touched',
      'update_available',
    ]);
    assert.deepStrictEqual(result.preserved, PRESERVED_PATHS);
    assert.deepStrictEqual(result.overlay_reapply, []);
    assert.deepStrictEqual(result.overlay_delete, []);
    assert.strictEqual(readFile(repoDir, 'README.md'), 'localized readme\n');
    assert.strictEqual(readFile(repoDir, 'docs/core.md'), 'core doc\n');
  });

  test('returns a no-op dry-run when the tracked baseline is ahead of upstream latest', () => {
    const repoDir = makeTempDir('upstream-sync-repo');
    seedRepo(repoDir, {
      baselineTag: 'v1.28.1',
      packageVersion: '1.28.1',
      readme: 'localized readme\n',
      coreDoc: 'core doc\n',
      localDoc: 'keep my local overlay\n',
    });
    writeFile(repoDir, '.planning/local-state.md', 'preserve planning state\n');

    const result = runRefresh({
      cwd: repoDir,
      currentFile: 'get-shit-done/UPSTREAM_VERSION',
      toTag: 'v1.28.0',
      dryRun: true,
    });

    assert.strictEqual(result.applied, false);
    assert.strictEqual(result.no_op, true);
    assert.strictEqual(result.status, 'ahead');
    assert.deepStrictEqual(result.preserved, PRESERVED_PATHS);
    assert.deepStrictEqual(result.overlay_reapply, []);
    assert.deepStrictEqual(result.overlay_delete, []);
    assert.strictEqual(readFile(repoDir, 'README.md'), 'localized readme\n');
    assert.strictEqual(readFile(repoDir, 'docs/core.md'), 'core doc\n');
    assert.strictEqual(readFile(repoDir, 'docs/localized-guide.md'), 'keep my local overlay\n');
    assert.strictEqual(readFile(repoDir, '.planning/local-state.md'), 'preserve planning state\n');
  });

  test('describes overlay reapply and delete paths in a dry-run update', () => {
    const repoDir = makeTempDir('upstream-sync-repo');
    const baselineDir = makeTempDir('upstream-sync-baseline');
    const upstreamDir = makeTempDir('upstream-sync-upstream');

    seedRepo(baselineDir, {
      baselineTag: 'v1.28.0',
      packageVersion: '1.28.1',
      readme: 'baseline readme\n',
      coreDoc: 'baseline core\n',
      removedDoc: 'remove me upstream\n',
    });
    seedRepo(repoDir, {
      baselineTag: 'v1.28.0',
      packageVersion: '1.28.1',
      readme: 'localized readme\n',
      coreDoc: 'baseline core\n',
      localDoc: 'keep my local overlay\n',
    });
    seedRepo(upstreamDir, {
      baselineTag: 'v1.29.0',
      packageVersion: '1.29.0',
      readme: 'upstream readme\n',
      coreDoc: 'upstream core\n',
    });

    const result = runRefresh({
      cwd: repoDir,
      currentFile: 'get-shit-done/UPSTREAM_VERSION',
      toTag: 'v1.29.0',
      dryRun: true,
      baselineDir,
      upstreamDir,
      latestPublishedAt: '2026-03-22T15:45:26Z',
    });

    assert.strictEqual(result.applied, false);
    assert.strictEqual(result.no_op, false);
    assert.strictEqual(result.status, 'update_available');
    assert.strictEqual(result.apply_mode, 'source-of-truth');
    assert.strictEqual(result.latest_published_at, '2026-03-22T15:45:26Z');
    assert.strictEqual(result.package_version, '1.28.1');
    assert.ok(result.summary.includes('v1.28.0'));
    assert.ok(result.summary.includes('v1.29.0'));
    assert.ok(result.touched.includes('docs'));
    assert.ok(result.preserved.includes('.planning/'));
    assert.ok(result.overlay_reapply.includes('README.md'));
    assert.ok(result.overlay_reapply.includes('docs/localized-guide.md'));
    assert.ok(result.overlay_delete.includes('docs/removed-locally.md'));
  });

  test('formats the dry-run summary with explicit review fields', () => {
    const { formatDryRun } = require('../scripts/apply-upstream-refresh.cjs');
    const output = formatDryRun({
      status: 'update_available',
      current_tag: 'v1.28.0',
      incoming_tag: 'v1.29.0',
      apply_mode: 'source-of-truth',
      latest_published_at: '2026-03-22T15:45:26Z',
      package_version: '1.29.0',
      summary: 'Ready to refresh vendored GSD from v1.28.0 to v1.29.0.',
      touched: ['docs', 'scripts'],
      preserved: ['.planning/'],
      overlay_reapply: ['README.md'],
      overlay_delete: ['docs/removed-locally.md'],
      update_available: true,
      no_op: false,
    });

    assert.match(output, /- status: update_available/);
    assert.match(output, /- incoming tag: v1.29.0/);
    assert.match(output, /- apply mode: source-of-truth/);
    assert.match(output, /### touched paths/);
    assert.match(output, /### preserved paths/);
    assert.match(output, /### overlay reapply/);
    assert.match(output, /### overlay delete/);
  });

  test('applies an upstream refresh, preserves overlays, and updates tracked baseline files', () => {
    const repoDir = makeTempDir('upstream-sync-repo');
    const baselineDir = makeTempDir('upstream-sync-baseline');
    const upstreamDir = makeTempDir('upstream-sync-upstream');

    seedRepo(baselineDir, {
      baselineTag: 'v1.28.0',
      packageVersion: '1.28.1',
      readme: 'baseline readme\n',
      coreDoc: 'baseline core\n',
      removedDoc: 'remove me upstream\n',
    });
    seedRepo(repoDir, {
      baselineTag: 'v1.28.0',
      packageVersion: '1.28.1',
      readme: 'localized readme\n',
      coreDoc: 'baseline core\n',
      localDoc: 'keep my local overlay\n',
    });
    seedRepo(upstreamDir, {
      baselineTag: 'v1.29.0',
      packageVersion: '1.29.0',
      readme: 'upstream readme\n',
      coreDoc: 'upstream core\n',
    });
    writeFile(repoDir, '.planning/local-state.md', 'preserve planning state\n');
    writeFile(repoDir, 'AGENTS.md', 'local instructions\n');

    const result = runRefresh({
      cwd: repoDir,
      currentFile: 'get-shit-done/UPSTREAM_VERSION',
      toTag: 'v1.29.0',
      baselineDir,
      upstreamDir,
      latestPublishedAt: '2026-03-22T15:45:26Z',
    });

    assert.strictEqual(result.applied, true);
    assert.strictEqual(result.no_op, false);
    assert.strictEqual(result.apply_mode, 'source-of-truth');
    assert.strictEqual(fs.readFileSync(path.join(repoDir, 'README.md'), 'utf8'), 'localized readme\n');
    assert.strictEqual(fs.readFileSync(path.join(repoDir, 'docs/core.md'), 'utf8'), 'upstream core\n');
    assert.strictEqual(fs.readFileSync(path.join(repoDir, 'docs/localized-guide.md'), 'utf8'), 'keep my local overlay\n');
    assert.strictEqual(fs.existsSync(path.join(repoDir, 'docs/removed-locally.md')), false);
    assert.strictEqual(fs.readFileSync(path.join(repoDir, 'get-shit-done/UPSTREAM_VERSION'), 'utf8'), 'v1.29.0\n');
    assert.ok(fs.readFileSync(path.join(repoDir, 'docs/UPSTREAM-SYNC.md'), 'utf8').includes('`v1.29.0`'));
    assert.strictEqual(fs.readFileSync(path.join(repoDir, '.planning/local-state.md'), 'utf8'), 'preserve planning state\n');
    assert.strictEqual(fs.readFileSync(path.join(repoDir, 'AGENTS.md'), 'utf8'), 'local instructions\n');
  });

  test('defaults the CLI mode to source-of-truth and rejects unknown modes', () => {
    const parsed = parseArgs(['--to-tag', 'v1.29.0', '--include-entry', 'prompts']);
    assert.strictEqual(parsed.mode, undefined);
    assert.deepStrictEqual(parsed.includeEntries, ['prompts']);
    assert.deepStrictEqual(getImportEntries(['prompts']).slice(-1), ['prompts']);
    assert.ok(!getImportEntries([]).includes('prompts'));

    assert.throws(
      () => runRefresh({
        cwd: makeTempDir('upstream-sync-repo'),
        currentTag: 'v1.28.0',
        currentFile: 'get-shit-done/UPSTREAM_VERSION',
        toTag: 'v1.29.0',
        mode: 'invalid-mode',
      }),
      /Unknown apply mode: invalid-mode/
    );

    assert.throws(
      () => getImportEntries(['.planning']),
      /Cannot include preserved path: \.planning/
    );
  });

  test('adds opt-in import entries without changing the default import surface', () => {
    const repoDir = makeTempDir('upstream-sync-repo');
    const baselineDir = makeTempDir('upstream-sync-baseline');
    const upstreamDir = makeTempDir('upstream-sync-upstream');

    seedRepo(baselineDir, {
      baselineTag: 'v1.28.0',
      packageVersion: '1.28.1',
      readme: 'baseline readme\n',
      coreDoc: 'baseline core\n',
    });
    seedRepo(repoDir, {
      baselineTag: 'v1.28.0',
      packageVersion: '1.28.1',
      readme: 'localized readme\n',
      coreDoc: 'baseline core\n',
    });
    seedRepo(upstreamDir, {
      baselineTag: 'v1.29.0',
      packageVersion: '1.29.0',
      readme: 'upstream readme\n',
      coreDoc: 'upstream core\n',
    });

    writeFile(baselineDir, 'prompts/system.md', 'baseline prompt\n');
    writeFile(repoDir, 'prompts/system.md', 'baseline prompt\n');
    writeFile(upstreamDir, 'prompts/system.md', 'upstream prompt\n');

    const defaultResult = runRefresh({
      cwd: repoDir,
      currentFile: 'get-shit-done/UPSTREAM_VERSION',
      toTag: 'v1.29.0',
      dryRun: true,
      baselineDir,
      upstreamDir,
    });
    const extendedResult = runRefresh({
      cwd: repoDir,
      currentFile: 'get-shit-done/UPSTREAM_VERSION',
      toTag: 'v1.29.0',
      dryRun: true,
      baselineDir,
      upstreamDir,
      includeEntries: ['prompts'],
    });

    assert.ok(!defaultResult.touched.includes('prompts'));
    assert.ok(extendedResult.touched.includes('prompts'));
    assert.ok(extendedResult.overlay_reapply.includes('README.md'));
    assert.deepStrictEqual(IMPORT_ENTRIES.includes('prompts'), false);
  });
});
