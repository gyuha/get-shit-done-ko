const { afterEach, describe, test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  buildOverlayMissing,
  buildTokenSensitiveCandidates,
  buildTranslationCandidates,
  buildZhCnReintroduced,
  runAudit,
} = require('../scripts/audit-localization-gap.cjs');

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

function seedRepo(root, { baselineTag, packageVersion }) {
  writeJson(root, 'package.json', {
    name: 'get-shit-done-ko',
    version: packageVersion,
  });
  writeFile(root, 'get-shit-done/UPSTREAM_VERSION', `${baselineTag}\n`);
}

afterEach(() => {
  while (tempDirs.length > 0) {
    fs.rmSync(tempDirs.pop(), { recursive: true, force: true });
  }
});

describe('localization audit', () => {
  test('builds translation candidates from changed file paths', () => {
    assert.deepStrictEqual(
      buildTranslationCandidates([
        'README.md',
        'docs/UPSTREAM-SYNC.md',
        'scripts/run-tests.cjs',
        'agents/researcher.md',
        'commands/help.md',
      ]),
      ['README.md', 'docs/UPSTREAM-SYNC.md', 'agents/researcher.md', 'commands/help.md']
    );
  });

  test('derives overlay gaps and zh-CN findings from deterministic inputs', () => {
    const upstreamDir = makeTempDir('l10n-audit-upstream-content');
    writeFile(upstreamDir, 'docs/index.md', 'See README.zh-CN.md for Chinese readers.\n');
    writeFile(upstreamDir, 'README.zh-CN.md', 'Chinese readme\n');

    assert.deepStrictEqual(
      buildOverlayMissing(
        ['README.md', 'docs/guide.md', 'commands/new-command.md'],
        ['README.md']
      ),
      ['docs/guide.md', 'commands/new-command.md']
    );

    assert.deepStrictEqual(
      buildZhCnReintroduced(['README.zh-CN.md', 'docs/index.md'], upstreamDir),
      ['README.zh-CN.md', 'docs/index.md']
    );

    writeFile(upstreamDir, 'docs/task.md', 'Use `node scripts/run-tests.cjs` with <latest_tag> and @refs.\n');
    writeFile(upstreamDir, 'docs/prose.md', '일반 설명 문장만 있습니다.\n');
    assert.deepStrictEqual(
      buildTokenSensitiveCandidates(['commands/new-command.md', 'docs/task.md', 'docs/prose.md'], upstreamDir),
      ['commands/new-command.md', 'docs/task.md']
    );
  });

  test('produces changed_files and translation_candidates from baseline and upstream snapshots', () => {
    const repoDir = makeTempDir('l10n-audit-repo');
    const baselineDir = makeTempDir('l10n-audit-baseline');
    const upstreamDir = makeTempDir('l10n-audit-upstream');

    seedRepo(repoDir, { baselineTag: 'v1.28.0', packageVersion: '1.28.1' });
    seedRepo(baselineDir, { baselineTag: 'v1.28.0', packageVersion: '1.28.1' });
    seedRepo(upstreamDir, { baselineTag: 'v1.29.0', packageVersion: '1.29.0' });

    writeFile(baselineDir, 'README.md', 'baseline readme\n');
    writeFile(baselineDir, 'docs/guide.md', 'baseline guide\n');
    writeFile(baselineDir, 'scripts/tool.cjs', 'console.log("baseline");\n');

    writeFile(repoDir, 'README.md', 'localized readme\n');
    writeFile(repoDir, 'docs/guide.md', 'baseline guide\n');
    writeFile(repoDir, 'scripts/tool.cjs', 'console.log("baseline");\n');
    writeFile(repoDir, 'docs/localized-guide.md', 'keep my local overlay\n');

    writeFile(upstreamDir, 'README.md', 'upstream readme\n');
    writeFile(upstreamDir, 'README.zh-CN.md', 'Chinese readme\n');
    writeFile(upstreamDir, 'docs/guide.md', 'upstream guide\n');
    writeFile(upstreamDir, 'docs/index.md', 'Link to README.zh-CN.md\n');
    writeFile(upstreamDir, 'scripts/tool.cjs', 'console.log("upstream");\n');
    writeFile(upstreamDir, 'commands/new-command.md', 'new command\n');

    const result = runAudit({
      cwd: repoDir,
      currentFile: 'get-shit-done/UPSTREAM_VERSION',
      toTag: 'v1.29.0',
      baselineDir,
      upstreamDir,
    });

    assert.strictEqual(result.current_tag, 'v1.28.0');
    assert.strictEqual(result.incoming_tag, 'v1.29.0');
    assert.strictEqual(result.apply_mode, 'source-of-truth');
    assert.deepStrictEqual(result.changed_files, [
      'README.md',
      'README.zh-CN.md',
      'commands/new-command.md',
      'docs/guide.md',
      'docs/index.md',
      'get-shit-done/UPSTREAM_VERSION',
      'package.json',
      'scripts/tool.cjs',
    ]);
    assert.deepStrictEqual(result.translation_candidates, [
      'README.md',
      'commands/new-command.md',
      'docs/guide.md',
      'docs/index.md',
    ]);
    assert.deepStrictEqual(result.overlay_missing, [
      'commands/new-command.md',
      'docs/guide.md',
      'docs/index.md',
    ]);
    assert.deepStrictEqual(result.zh_cn_reintroduced, [
      'README.zh-CN.md',
      'docs/index.md',
    ]);
    assert.deepStrictEqual(result.token_sensitive_candidates, [
      'README.md',
      'README.zh-CN.md',
      'commands/new-command.md',
      'docs/index.md',
      'scripts/tool.cjs',
    ]);
    assert.ok(result.overlay_reapply.includes('README.md'));
    assert.ok(result.overlay_reapply.includes('docs/localized-guide.md'));
  });
});
