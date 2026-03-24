#!/usr/bin/env node

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const { compareVersions, normalizeTag, readCurrentTag } = require('./check-upstream-release.cjs');
const {
  collectFiles,
  getImportEntries,
  resolveApplyMode,
  runRefresh,
} = require('./apply-upstream-refresh.cjs');

const UPSTREAM_REPO = 'https://github.com/gsd-build/get-shit-done.git';

function parseArgs(argv) {
  const args = {
    cwd: process.cwd(),
    currentFile: 'get-shit-done/UPSTREAM_VERSION',
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--json') {
      args.json = true;
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
    if (arg === '--mode') {
      args.mode = argv[++i];
      continue;
    }
    if (arg === '--include-entry') {
      if (!args.includeEntries) {
        args.includeEntries = [];
      }
      args.includeEntries.push(argv[++i]);
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
    if (arg === '--help' || arg === '-h') {
      args.help = true;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

function printHelp() {
  process.stdout.write(`Usage: node scripts/audit-localization-gap.cjs [options]

Options:
  --to-tag <tag>           Target upstream tag to audit against
  --mode <name>            Apply strategy context (default: source-of-truth)
  --include-entry <path>   Append an extra upstream root entry for this run
  --current-file <path>    Machine-readable tracked baseline file
  --current-tag <tag>      Override tracked baseline tag
  --baseline-dir <path>    Use a local directory as the current baseline snapshot
  --upstream-dir <path>    Use a local directory as the target upstream snapshot
  --cwd <path>             Resolve relative paths from a specific repo root
  --json                   Print machine-readable JSON
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

function makeTempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function removePath(targetPath) {
  fs.rmSync(targetPath, { recursive: true, force: true });
}

function cloneUpstreamTag(tag, destDir) {
  execFileSync('git', ['clone', '--depth', '1', '--branch', tag, UPSTREAM_REPO, destDir], {
    stdio: 'ignore',
  });
  return destDir;
}

function materializeSnapshot({ cwd, tag, explicitDir, tempPrefix }) {
  if (explicitDir) {
    return explicitDir;
  }
  return cloneUpstreamTag(tag, makeTempDir(tempPrefix));
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

  return !fs.readFileSync(leftPath).equals(fs.readFileSync(rightPath));
}

function collectChangedFiles(baselineDir, upstreamDir, importEntries) {
  const baselineFiles = collectFiles(baselineDir, importEntries);
  const upstreamFiles = collectFiles(upstreamDir, importEntries);
  const union = new Set([...baselineFiles, ...upstreamFiles]);
  const changedFiles = [];

  for (const relativePath of [...union].sort()) {
    if (filesDiffer(path.join(baselineDir, relativePath), path.join(upstreamDir, relativePath))) {
      changedFiles.push(relativePath);
    }
  }

  return changedFiles;
}

function isTranslationCandidate(relativePath) {
  return (
    relativePath === 'README.md' ||
    relativePath.startsWith('docs/') ||
    relativePath.startsWith('agents/') ||
    relativePath.startsWith('commands/')
  );
}

function buildTranslationCandidates(changedFiles) {
  return changedFiles.filter(isTranslationCandidate);
}

function buildOverlayMissing(translationCandidates, overlayReapply) {
  const preserved = new Set(overlayReapply);
  return translationCandidates.filter(relativePath => !preserved.has(relativePath));
}

function buildZhCnReintroduced(changedFiles, upstreamDir) {
  const findings = [];

  for (const relativePath of changedFiles) {
    if (/zh-CN/i.test(relativePath)) {
      findings.push(relativePath);
      continue;
    }

    const upstreamPath = path.join(upstreamDir, relativePath);
    if (!pathExists(upstreamPath) || fs.statSync(upstreamPath).isDirectory()) {
      continue;
    }

    const content = fs.readFileSync(upstreamPath, 'utf8');
    if (/zh-CN|Chinese|README\.zh-CN\.md/i.test(content)) {
      findings.push(relativePath);
    }
  }

  return findings;
}

function isTokenSensitivePath(relativePath) {
  return (
    relativePath.startsWith('commands/') ||
    relativePath.startsWith('agents/') ||
    relativePath.startsWith('scripts/') ||
    relativePath.startsWith('hooks/') ||
    relativePath.startsWith('bin/') ||
    /README/i.test(relativePath)
  );
}

function buildTokenSensitiveCandidates(changedFiles, upstreamDir) {
  const candidates = [];

  for (const relativePath of changedFiles) {
    if (isTokenSensitivePath(relativePath)) {
      candidates.push(relativePath);
      continue;
    }

    const upstreamPath = path.join(upstreamDir, relativePath);
    if (!pathExists(upstreamPath) || fs.statSync(upstreamPath).isDirectory()) {
      continue;
    }

    const content = fs.readFileSync(upstreamPath, 'utf8');
    if (/@|<task|<latest_tag>|`node |`npm |`pnpm |`yarn |[A-Za-z0-9_/-]+\.[A-Za-z]+/m.test(content)) {
      candidates.push(relativePath);
    }
  }

  return candidates;
}

function cleanupTempDirs(dirs) {
  for (const dir of dirs) {
    if (dir) {
      removePath(dir);
    }
  }
}

function runAudit(args) {
  if (!args.toTag) {
    throw new Error('--to-tag is required');
  }

  const applyMode = resolveApplyMode(args.mode);
  const currentTag = readCurrentTag({
    currentFile: args.currentFile,
    currentTag: args.currentTag,
    cwd: args.cwd,
  });
  const incomingTag = normalizeTag(args.toTag);
  const importEntries = getImportEntries(args.includeEntries);
  const tempDirs = [];

  try {
    const baselineDir = materializeSnapshot({
      cwd: args.cwd,
      tag: currentTag,
      explicitDir: args.baselineDir,
      tempPrefix: 'gsd-audit-baseline-',
    });
    const upstreamDir = materializeSnapshot({
      cwd: args.cwd,
      tag: incomingTag,
      explicitDir: args.upstreamDir,
      tempPrefix: 'gsd-audit-upstream-',
    });

    if (!args.baselineDir) tempDirs.push(baselineDir);
    if (!args.upstreamDir) tempDirs.push(upstreamDir);

    const changedFiles =
      compareVersions(currentTag, incomingTag) >= 0
        ? []
        : collectChangedFiles(baselineDir, upstreamDir, importEntries);
    const dryRun = runRefresh({
      cwd: args.cwd,
      currentFile: args.currentFile,
      currentTag: args.currentTag,
      toTag: incomingTag,
      mode: applyMode,
      dryRun: true,
      baselineDir,
      upstreamDir,
      includeEntries: args.includeEntries,
    });

    return {
      current_tag: currentTag,
      incoming_tag: incomingTag,
      apply_mode: applyMode,
      changed_files: changedFiles,
      overlay_reapply: dryRun.overlay_reapply,
      overlay_delete: dryRun.overlay_delete,
      translation_candidates: buildTranslationCandidates(changedFiles),
      overlay_missing: buildOverlayMissing(buildTranslationCandidates(changedFiles), dryRun.overlay_reapply),
      zh_cn_reintroduced: buildZhCnReintroduced(changedFiles, upstreamDir),
      token_sensitive_candidates: buildTokenSensitiveCandidates(changedFiles, upstreamDir),
    };
  } finally {
    cleanupTempDirs(tempDirs);
  }
}

function formatHuman(result) {
  const lines = [
    '## Localization Gap Audit',
    '',
    `- current tag: ${result.current_tag}`,
    `- incoming tag: ${result.incoming_tag}`,
    `- apply mode: ${result.apply_mode}`,
    '',
    '### changed files',
  ];

  if (result.changed_files.length === 0) {
    lines.push('- none');
  } else {
    for (const entry of result.changed_files) {
      lines.push(`- ${entry}`);
    }
  }

  lines.push('', '### translation candidates');
  if (result.translation_candidates.length === 0) {
    lines.push('- none');
  } else {
    for (const entry of result.translation_candidates) {
      lines.push(`- ${entry}`);
    }
  }

  return `${lines.join('\n')}\n`;
}

function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  if (args.help) {
    printHelp();
    return;
  }

  const result = runAudit(args);
  if (args.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }
  process.stdout.write(formatHuman(result));
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
  buildOverlayMissing,
  buildTokenSensitiveCandidates,
  buildTranslationCandidates,
  buildZhCnReintroduced,
  collectChangedFiles,
  formatHuman,
  parseArgs,
  runAudit,
};
