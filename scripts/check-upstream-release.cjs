#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

const DEFAULT_REPO = 'gsd-build/get-shit-done';
const DEFAULT_RELEASES_URL = `https://api.github.com/repos/${DEFAULT_REPO}/releases/latest`;

// Sync eligibility is driven by the tracked upstream baseline, not the fork's
// package version. package.json is reported for maintainer context only.

function parseArgs(argv) {
  const args = {
    json: false,
    cwd: process.cwd(),
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--json') {
      args.json = true;
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
    if (arg === '--latest-tag') {
      args.latestTag = argv[++i];
      continue;
    }
    if (arg === '--latest-published-at') {
      args.latestPublishedAt = argv[++i];
      continue;
    }
    if (arg === '--package-version') {
      args.packageVersion = argv[++i];
      continue;
    }
    if (arg === '--cwd') {
      args.cwd = path.resolve(argv[++i]);
      continue;
    }
    if (arg === '--repo') {
      args.repo = argv[++i];
      continue;
    }
    if (arg === '--releases-url') {
      args.releasesUrl = argv[++i];
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
  process.stdout.write(`Usage: node scripts/check-upstream-release.cjs [options]

Options:
  --current-file <path>         Read tracked upstream baseline tag from a file
  --current-tag <tag>           Use a specific tracked upstream baseline tag
  --latest-tag <tag>            Override latest upstream tag (testing/no-network)
  --latest-published-at <iso>   Override latest upstream published date
  --package-version <ver>       Override fork package version
  --repo <owner/name>           Override upstream repo (default: ${DEFAULT_REPO})
  --releases-url <url>          Override releases API URL
  --cwd <path>                  Resolve relative paths from a specific cwd
  --json                        Print machine-readable JSON
  --help                        Show this message
`);
}

function stripTagPrefix(value) {
  return String(value || '').trim().replace(/^v/i, '');
}

function normalizeTag(value) {
  const stripped = stripTagPrefix(value);
  return stripped ? `v${stripped}` : '';
}

function parseVersion(value) {
  const stripped = stripTagPrefix(value);
  if (!stripped) {
    return [];
  }

  return stripped.split('.').map(part => {
    if (!/^\d+$/.test(part)) {
      throw new Error(`Invalid numeric version segment: ${value}`);
    }
    return Number(part);
  });
}

function compareVersions(a, b) {
  const left = parseVersion(a);
  const right = parseVersion(b);
  const max = Math.max(left.length, right.length);

  for (let i = 0; i < max; i++) {
    const leftValue = left[i] ?? 0;
    const rightValue = right[i] ?? 0;
    if (leftValue > rightValue) return 1;
    if (leftValue < rightValue) return -1;
  }

  return 0;
}

function readCurrentTag({ currentFile, currentTag, cwd }) {
  if (currentTag) {
    return normalizeTag(currentTag);
  }

  if (!currentFile) {
    throw new Error('Either --current-tag or --current-file is required');
  }

  const resolvedPath = path.isAbsolute(currentFile) ? currentFile : path.join(cwd, currentFile);
  const content = fs.readFileSync(resolvedPath, 'utf8').trim();
  if (!content) {
    throw new Error(`Current baseline file is empty: ${resolvedPath}`);
  }

  return normalizeTag(content);
}

function readPackageVersion(cwd, explicitPackageVersion) {
  if (explicitPackageVersion) {
    return explicitPackageVersion;
  }

  const pkgPath = path.join(cwd, 'package.json');
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    return pkg.version || null;
  } catch {
    return null;
  }
}

function fetchJson(url, headers = {}, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, {
      headers: {
        'user-agent': 'get-shit-done-ko-upstream-sync',
        accept: 'application/vnd.github+json',
        ...headers,
      },
    }, response => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        if (redirectCount >= 5) {
          reject(new Error(`Too many redirects fetching ${url}`));
          return;
        }
        response.resume();
        resolve(fetchJson(response.headers.location, headers, redirectCount + 1));
        return;
      }

      if (response.statusCode !== 200) {
        let body = '';
        response.setEncoding('utf8');
        response.on('data', chunk => {
          body += chunk;
        });
        response.on('end', () => {
          reject(new Error(`Release check failed with HTTP ${response.statusCode}: ${body}`));
        });
        return;
      }

      let body = '';
      response.setEncoding('utf8');
      response.on('data', chunk => {
        body += chunk;
      });
      response.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(new Error(`Failed to parse release JSON: ${error.message}`));
        }
      });
    });

    request.on('error', reject);
    request.setTimeout(15000, () => {
      request.destroy(new Error(`Timed out fetching ${url}`));
    });
  });
}

async function fetchLatestRelease({ repo = DEFAULT_REPO, releasesUrl = DEFAULT_RELEASES_URL }) {
  const data = await fetchJson(releasesUrl);
  const tagName = normalizeTag(data.tag_name || data.name);
  if (!tagName) {
    throw new Error(`Latest release payload for ${repo} did not include a tag`);
  }

  return {
    repo,
    latestTag: tagName,
    latestPublishedAt: data.published_at || null,
    latestUrl: data.html_url || `https://github.com/${repo}/releases`,
  };
}

function buildReleaseState({
  repo = DEFAULT_REPO,
  currentTag,
  latestTag,
  latestPublishedAt = null,
  latestUrl = `https://github.com/${repo}/releases`,
  packageVersion = null,
}) {
  // currentTag always comes from the tracked baseline file (or an explicit
  // override for tests). latestTag always comes from upstream release data (or
  // an explicit override for tests). packageVersion is informational only.
  const comparison = compareVersions(currentTag, latestTag);
  const current = stripTagPrefix(currentTag);
  const latest = stripTagPrefix(latestTag);

  let status = 'current';
  let updateAvailable = false;
  let localAhead = false;

  if (comparison < 0) {
    status = 'update_available';
    updateAvailable = true;
  } else if (comparison > 0) {
    status = 'ahead';
    localAhead = true;
  }

  return {
    repo,
    current,
    current_tag: normalizeTag(currentTag),
    current_version: current,
    latest,
    latest_tag: normalizeTag(latestTag),
    latest_version: latest,
    latest_published_at: latestPublishedAt,
    latest_url: latestUrl,
    update_available: updateAvailable,
    local_ahead: localAhead,
    status,
    package_version: packageVersion,
  };
}

function formatHuman(result) {
  const lines = [
    '## Upstream Sync Check',
    '',
    `- Repo: ${result.repo}`,
    `- Tracked upstream baseline: ${result.current_tag}`,
    `- Latest upstream release: ${result.latest_tag}`,
  ];

  if (result.latest_published_at) {
    lines.push(`- Latest release date: ${result.latest_published_at}`);
  }

  if (result.package_version) {
    lines.push(`- Fork package version: ${result.package_version}`);
  }

  lines.push('');

  if (result.status === 'update_available') {
    lines.push(`Update available: upstream ${result.latest_tag} is newer than tracked baseline ${result.current_tag}.`);
  } else if (result.status === 'ahead') {
    lines.push(`No sync needed: tracked baseline ${result.current_tag} is ahead of upstream latest ${result.latest_tag}.`);
  } else {
    lines.push(`No sync needed: tracked baseline ${result.current_tag} matches upstream latest ${result.latest_tag}.`);
  }

  lines.push(`Releases: ${result.latest_url}`);
  return `${lines.join('\n')}\n`;
}

async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  if (args.help) {
    printHelp();
    return;
  }

  const currentTag = readCurrentTag(args);
  const packageVersion = readPackageVersion(args.cwd, args.packageVersion);

  let latest;
  if (args.latestTag) {
    latest = {
      repo: args.repo || DEFAULT_REPO,
      latestTag: normalizeTag(args.latestTag),
      latestPublishedAt: args.latestPublishedAt || null,
      latestUrl: `https://github.com/${args.repo || DEFAULT_REPO}/releases`,
    };
  } else {
    latest = await fetchLatestRelease({
      repo: args.repo || DEFAULT_REPO,
      releasesUrl: args.releasesUrl || DEFAULT_RELEASES_URL,
    });
  }

  const result = buildReleaseState({
    repo: latest.repo,
    currentTag,
    latestTag: latest.latestTag,
    latestPublishedAt: latest.latestPublishedAt,
    latestUrl: latest.latestUrl,
    packageVersion,
  });

  if (args.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  process.stdout.write(formatHuman(result));
}

if (require.main === module) {
  main().catch(error => {
    process.stderr.write(`Error: ${error.message}\n`);
    process.exit(1);
  });
}

module.exports = {
  DEFAULT_REPO,
  DEFAULT_RELEASES_URL,
  buildReleaseState,
  compareVersions,
  fetchLatestRelease,
  formatHuman,
  normalizeTag,
  parseArgs,
  parseVersion,
  readCurrentTag,
  readPackageVersion,
  stripTagPrefix,
};
