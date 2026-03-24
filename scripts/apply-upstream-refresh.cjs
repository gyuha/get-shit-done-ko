#!/usr/bin/env node

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const {
  buildReleaseState,
  compareVersions,
  normalizeTag,
  readCurrentTag,
  readPackageVersion,
} = require('./check-upstream-release.cjs');

const UPSTREAM_REPO = 'https://github.com/gsd-build/get-shit-done.git';
const IMPORT_ENTRIES = [
  '.github',
  '.gitignore',
  '.release-monitor.sh',
  'CHANGELOG.md',
  'LICENSE',
  'README.md',
  'README.zh-CN.md',
  'SECURITY.md',
  'agents',
  'assets',
  'bin',
  'commands',
  'docs',
  'get-shit-done',
  'hooks',
  'package-lock.json',
  'package.json',
  'scripts',
  'tests',
];

const PRESERVED_PATHS = [
  '.planning/',
  'AGENTS.md',
  'CLAUDE.md',
  '.codex/',
  '.claude/',
  '.opencode/',
];

function parseArgs(argv) {
  const args = {
    cwd: process.cwd(),
    currentFile: 'get-shit-done/UPSTREAM_VERSION',
    json: false,
    dryRun: false,
    fromCurrent: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--dry-run') {
      args.dryRun = true;
      continue;
    }
    if (arg === '--json') {
      args.json = true;
      continue;
    }
    if (arg === '--from-current') {
      args.fromCurrent = true;
      continue;
    }
    if (arg === '--cwd') {
      args.cwd = path.resolve(argv[++i]);
      continue;
    }
    if (arg === '--current-file') {
      args.currentFile = argv[++i];
      continue;
    }
    if (arg === '--current-tag') {
      args.currentTag = argv[++i];
      continue;
    }
    if (arg === '--to-tag') {
      args.toTag = argv[++i];
      continue;
    }
    if (arg === '--baseline-dir') {
      args.baselineDir = path.resolve(argv[++i]);
      continue;
    }
    if (arg === '--upstream-dir') {
      args.upstreamDir = path.resolve(argv[++i]);
      continue;
    }
    if (arg === '--latest-published-at') {
      args.latestPublishedAt = argv[++i];
      continue;
    }
    if (arg === '--help' || arg === '-h') {
      args.help = true;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

function printHelp() {
  process.stdout.write(`Usage: node scripts/apply-upstream-refresh.cjs [options]

Options:
  --to-tag <tag>           Target upstream tag to import
  --current-file <path>    Machine-readable tracked baseline file
  --current-tag <tag>      Override tracked baseline tag
  --dry-run                Show what would change without mutating the repo
  --json                   Print machine-readable JSON
  --from-current           Use the current repo import surface as the source snapshot
  --baseline-dir <path>    Use a local directory as the current baseline snapshot
  --upstream-dir <path>    Use a local directory as the target upstream snapshot
  --latest-published-at    Include the upstream release timestamp in output
  --cwd <path>             Resolve relative paths from a specific repo root
  --help                   Show this message
`);
}

function pathExists(targetPath) {
  try {
    fs.accessSync(targetPath);
    return true;
  } catch {
    return false;
  }
}

function ensureDirectory(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function removePath(targetPath) {
  fs.rmSync(targetPath, { recursive: true, force: true });
}

function copyPath(sourcePath, destPath) {
  const stat = fs.statSync(sourcePath);
  if (stat.isDirectory()) {
    ensureDirectory(destPath);
    fs.cpSync(sourcePath, destPath, { recursive: true });
    return;
  }
  ensureDirectory(path.dirname(destPath));
  fs.copyFileSync(sourcePath, destPath);
}

function makeTempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function cloneUpstreamTag(tag, destDir) {
  execFileSync('git', ['clone', '--depth', '1', '--branch', tag, UPSTREAM_REPO, destDir], {
    stdio: 'ignore',
  });
  return destDir;
}

function materializeSnapshot({ cwd, tag, fromCurrent, explicitDir, tempPrefix }) {
  if (explicitDir) {
    return explicitDir;
  }
  if (fromCurrent) {
    return cwd;
  }
  return cloneUpstreamTag(tag, makeTempDir(tempPrefix));
}

function collectFiles(rootPath) {
  const files = new Set();

  function walk(currentPath, relativePath) {
    if (!pathExists(currentPath)) {
      return;
    }
    const stat = fs.statSync(currentPath);
    if (stat.isDirectory()) {
      for (const entry of fs.readdirSync(currentPath).sort()) {
        walk(path.join(currentPath, entry), path.posix.join(relativePath, entry));
      }
      return;
    }
    files.add(relativePath);
  }

  for (const entry of IMPORT_ENTRIES) {
    walk(path.join(rootPath, entry), entry);
  }

  return files;
}

function filesDiffer(leftPath, rightPath) {
  if (!pathExists(leftPath) || !pathExists(rightPath)) {
    return pathExists(leftPath) !== pathExists(rightPath);
  }

  const leftStat = fs.statSync(leftPath);
  const rightStat = fs.statSync(rightPath);
  if (leftStat.isDirectory() || rightStat.isDirectory()) {
    return leftStat.isDirectory() !== rightStat.isDirectory();
  }

  const leftContent = fs.readFileSync(leftPath);
  const rightContent = fs.readFileSync(rightPath);
  return !leftContent.equals(rightContent);
}

function collectOverlayEntries(baselineDir, repoDir) {
  const baselineFiles = collectFiles(baselineDir);
  const repoFiles = collectFiles(repoDir);
  const union = new Set([...baselineFiles, ...repoFiles]);
  const overlays = [];

  for (const relativePath of [...union].sort()) {
    if (!filesDiffer(path.join(baselineDir, relativePath), path.join(repoDir, relativePath))) {
      continue;
    }

    overlays.push({
      path: relativePath,
      mode: pathExists(path.join(repoDir, relativePath)) ? 'reapply' : 'delete',
    });
  }

  return overlays;
}

function stageOverlayBackup(repoDir, overlays) {
  const backupDir = makeTempDir('gsd-overlay-backup-');
  const deletePaths = [];

  for (const overlay of overlays) {
    const repoPath = path.join(repoDir, overlay.path);
    if (!pathExists(repoPath)) {
      deletePaths.push(overlay.path);
      continue;
    }
    copyPath(repoPath, path.join(backupDir, overlay.path));
  }

  return { backupDir, deletePaths };
}

function reapplyOverlayBackup(repoDir, overlayBackup) {
  for (const deletePath of overlayBackup.deletePaths) {
    removePath(path.join(repoDir, deletePath));
  }

  for (const relativePath of collectFiles(overlayBackup.backupDir)) {
    const sourcePath = path.join(overlayBackup.backupDir, relativePath);
    const destPath = path.join(repoDir, relativePath);
    removePath(destPath);
    copyPath(sourcePath, destPath);
  }
}

function updateTrackedBaselineFiles(cwd, targetTag) {
  const normalizedTag = normalizeTag(targetTag);
  fs.writeFileSync(path.join(cwd, 'get-shit-done', 'UPSTREAM_VERSION'), `${normalizedTag}\n`, 'utf8');

  const docPath = path.join(cwd, 'docs', 'UPSTREAM-SYNC.md');
  if (!pathExists(docPath)) {
    return;
  }

  let content = fs.readFileSync(docPath, 'utf8');
  content = content.replace(/- Baseline tag: `v[^`]+`/, `- Baseline tag: \`${normalizedTag}\``);
  content = content.replace(/- Current tracked upstream baseline: `v[^`]+`/, `- Current tracked upstream baseline: \`${normalizedTag}\``);
  fs.writeFileSync(docPath, content, 'utf8');
}

function importSnapshotIntoRepo(repoDir, snapshotDir) {
  for (const entry of IMPORT_ENTRIES) {
    const repoPath = path.join(repoDir, entry);
    const sourcePath = path.join(snapshotDir, entry);
    removePath(repoPath);
    if (pathExists(sourcePath)) {
      copyPath(sourcePath, repoPath);
    }
  }
}

function buildDryRunResult({ releaseState, overlays }) {
  const summary = releaseState.update_available
    ? `Ready to refresh vendored GSD from ${releaseState.current_tag} to ${releaseState.latest_tag}.`
    : `No refresh needed because tracked baseline ${releaseState.current_tag} is already current or ahead.`;

  return {
    status: releaseState.status,
    current_tag: releaseState.current_tag,
    incoming_tag: releaseState.latest_tag,
    latest_published_at: releaseState.latest_published_at,
    package_version: releaseState.package_version,
    summary,
    touched: [...IMPORT_ENTRIES],
    preserved: [...PRESERVED_PATHS],
    overlay_reapply: overlays.map(entry => entry.path),
    overlay_delete: overlays.filter(entry => entry.mode === 'delete').map(entry => entry.path),
    update_available: releaseState.update_available,
    no_op: !releaseState.update_available,
  };
}

function formatDryRun(result) {
  const lines = [
    '## Upstream Refresh Dry Run',
    '',
    `- status: ${result.status}`,
    `- current tag: ${result.current_tag}`,
    `- incoming tag: ${result.incoming_tag}`,
  ];

  if (result.latest_published_at) {
    lines.push(`- latest release date: ${result.latest_published_at}`);
  }
  if (result.package_version) {
    lines.push(`- fork package version: ${result.package_version}`);
  }
  lines.push(`- no-op: ${result.no_op ? 'yes' : 'no'}`);
  lines.push(`- summary: ${result.summary}`);

  lines.push('', '### touched paths');
  for (const entry of result.touched) {
    lines.push(`- ${entry}`);
  }

  lines.push('', '### preserved paths');
  for (const entry of result.preserved) {
    lines.push(`- ${entry}`);
  }

  lines.push('', '### overlay reapply');
  if (result.overlay_reapply.length === 0) {
    lines.push('- none');
  } else {
    for (const entry of result.overlay_reapply) {
      lines.push(`- ${entry}`);
    }
  }

  if (result.overlay_delete.length > 0) {
    lines.push('', '### overlay delete');
    for (const entry of result.overlay_delete) {
      lines.push(`- ${entry}`);
    }
  }

  if (result.no_op) {
    lines.push('', 'No mutation will run because the tracked baseline is already current or ahead.');
  }

  return `${lines.join('\n')}\n`;
}

function cleanupTempDirs(dirs, cwd) {
  for (const dir of dirs) {
    if (!dir || dir === cwd) continue;
    removePath(dir);
  }
}

function runRefresh(args) {
  if (!args.toTag) {
    throw new Error('--to-tag is required');
  }

  const currentTag = readCurrentTag({
    currentFile: args.currentFile,
    currentTag: args.currentTag,
    cwd: args.cwd,
  });
  const targetTag = normalizeTag(args.toTag);
  const packageVersion = readPackageVersion(args.cwd);

  const releaseState = buildReleaseState({
    currentTag,
    latestTag: targetTag,
    latestPublishedAt: args.latestPublishedAt || null,
    packageVersion,
  });

  if (compareVersions(currentTag, targetTag) >= 0) {
    return {
      ...buildDryRunResult({ releaseState, overlays: [] }),
      applied: false,
    };
  }

  const tempDirs = [];

  try {
    const baselineDir = materializeSnapshot({
      cwd: args.cwd,
      tag: currentTag,
      fromCurrent: args.fromCurrent,
      explicitDir: args.baselineDir,
      tempPrefix: 'gsd-baseline-',
    });
    const upstreamDir = materializeSnapshot({
      cwd: args.cwd,
      tag: targetTag,
      fromCurrent: args.fromCurrent,
      explicitDir: args.upstreamDir,
      tempPrefix: 'gsd-upstream-',
    });

    if (!args.baselineDir) tempDirs.push(baselineDir);
    if (!args.upstreamDir) tempDirs.push(upstreamDir);

    const overlays = collectOverlayEntries(baselineDir, args.cwd);
    const dryRunResult = buildDryRunResult({ releaseState, overlays });

    if (args.dryRun) {
      return {
        ...dryRunResult,
        applied: false,
      };
    }

    const overlayBackup = stageOverlayBackup(args.cwd, overlays);
    tempDirs.push(overlayBackup.backupDir);
    importSnapshotIntoRepo(args.cwd, upstreamDir);
    reapplyOverlayBackup(args.cwd, overlayBackup);
    updateTrackedBaselineFiles(args.cwd, targetTag);

    return {
      ...dryRunResult,
      applied: true,
      no_op: false,
    };
  } finally {
    cleanupTempDirs(tempDirs, args.cwd);
  }
}

function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  if (args.help) {
    printHelp();
    return;
  }

  const result = runRefresh(args);
  if (args.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }
  process.stdout.write(formatDryRun(result));
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    process.stderr.write(`Error: ${error.message}\n`);
    process.exit(1);
  }
}

module.exports = {
  IMPORT_ENTRIES,
  PRESERVED_PATHS,
  buildDryRunResult,
  collectFiles,
  collectOverlayEntries,
  formatDryRun,
  parseArgs,
  runRefresh,
  updateTrackedBaselineFiles,
};
