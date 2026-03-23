/**
 * Core — 공용 유틸리티, 상수, 내부 헬퍼
 */

const fs = require('fs');
const path = require('path');
const { execSync, execFileSync, spawnSync } = require('child_process');
const { MODEL_PROFILES } = require('./model-profiles.cjs');

// ─── 경로 헬퍼 ────────────────────────────────────────────────────────────────

/** 상대 경로를 항상 슬래시(`/`) 기준으로 정규화한다. */
function toPosixPath(p) {
  return p.split(path.sep).join('/');
}

/**
 * 직계 하위 디렉터리에서 별도 git 저장소를 스캔한다.
 * 각 디렉터리가 자체 `.git`을 가지면 이름을 수집해 정렬된 배열로 반환한다.
 * 숨김 디렉터리와 node_modules는 제외한다.
 */
function detectSubRepos(cwd) {
  const results = [];
  try {
    const entries = fs.readdirSync(cwd, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
      const gitPath = path.join(cwd, entry.name, '.git');
      try {
        if (fs.existsSync(gitPath)) {
          results.push(entry.name);
        }
      } catch {}
    }
  } catch {}
  return results.sort();
}

/**
 * `startDir`에서 상위로 올라가며 `.planning/`을 소유한 프로젝트 루트를 찾는다.
 *
 * 멀티 리포 워크스페이스에서는 Claude가 프로젝트 루트 대신
 * 서브 리포(예: `backend/`) 안에서 열릴 수 있다. 이 함수는 이미
 * `.planning/`을 가진 가장 가까운 상위 디렉터리를 찾아서, 서브 리포
 * 내부에 `.planning/`이 잘못 생성되는 일을 막는다.
 *
 * 감지 전략은 각 상위 디렉터리마다 다음 순서로 확인한다.
 * 1. 부모의 `.planning/config.json`에 `sub_repos`로 현재 디렉터리가 등록돼 있음
 * 2. 부모의 `.planning/config.json`에 `multiRepo: true`가 있음(레거시 형식)
 * 3. 부모에 `.planning/`이 있고 현재 디렉터리 계층 어딘가에 `.git`이 있음(휴리스틱)
 *
 * 상위에 `.planning/`이 하나도 없으면(첫 실행 또는 단일 리포 프로젝트)
 * `startDir`를 그대로 반환한다.
 */
function findProjectRoot(startDir) {
  const resolved = path.resolve(startDir);
  const root = path.parse(resolved).root;
  const homedir = require('os').homedir();

  // startDir부터 후보 프로젝트 루트 직전까지의 상위 경로 중 어느 지점이든
  // `.git`이 있는지 확인한다. `backend/` 같은 직접 서브 리포와
  // `backend/src/modules/` 같은 더 깊은 경로를 모두 처리한다.
  function isInsideGitRepo(candidateParent) {
    let d = resolved;
    while (d !== candidateParent && d !== root) {
      if (fs.existsSync(path.join(d, '.git'))) return true;
      d = path.dirname(d);
    }
    return false;
  }

  let dir = resolved;
  while (dir !== root) {
    const parent = path.dirname(dir);
    if (parent === dir) break; // 파일시스템 루트
    if (parent === homedir) break; // 홈 디렉터리 위로는 올라가지 않음

    const parentPlanning = path.join(parent, '.planning');
    if (fs.existsSync(parentPlanning) && fs.statSync(parentPlanning).isDirectory()) {
      const configPath = path.join(parentPlanning, 'config.json');
      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        const subRepos = config.sub_repos || config.planning?.sub_repos || [];

        // 명시된 sub_repos 목록을 우선 확인
        if (Array.isArray(subRepos) && subRepos.length > 0) {
          const relPath = path.relative(parent, resolved);
          const topSegment = relPath.split(path.sep)[0];
          if (subRepos.includes(topSegment)) {
            return parent;
          }
        }

        // 레거시 multiRepo 플래그 확인
        if (config.multiRepo === true && isInsideGitRepo(parent)) {
          return parent;
        }
      } catch {
        // config.json이 없거나 손상되면 `.git` 기반 휴리스틱으로 폴백
      }

      // 휴리스틱: 부모에 `.planning/`이 있고 현재 경로가 git 저장소 내부라면 채택
      if (isInsideGitRepo(parent)) {
        return parent;
      }
    }
    dir = parent;
  }
  return startDir;
}

// ─── 출력 헬퍼 ────────────────────────────────────────────────────────────────

/**
 * 오래된 gsd-* 임시 파일/디렉터리를 제거한다(기본: 5분 초과).
 * 새 임시 파일을 쓰기 전에 기회적으로 실행해 무한 누적을 막는다.
 * @param {string} prefix - 매칭할 파일명 prefix(예: `gsd-`)
 * @param {object} opts
 * @param {number} opts.maxAgeMs - 제거 기준 최대 경과 시간(ms, 기본 5분)
 * @param {boolean} opts.dirsOnly - true면 디렉터리만 제거(기본 false)
 */
function reapStaleTempFiles(prefix = 'gsd-', { maxAgeMs = 5 * 60 * 1000, dirsOnly = false } = {}) {
  try {
    const tmpDir = require('os').tmpdir();
    const now = Date.now();
    const entries = fs.readdirSync(tmpDir);
    for (const entry of entries) {
      if (!entry.startsWith(prefix)) continue;
      const fullPath = path.join(tmpDir, entry);
      try {
        const stat = fs.statSync(fullPath);
        if (now - stat.mtimeMs > maxAgeMs) {
          if (stat.isDirectory()) {
            fs.rmSync(fullPath, { recursive: true, force: true });
          } else if (!dirsOnly) {
            fs.unlinkSync(fullPath);
          }
        }
      } catch {
        // readdir 이후 stat 전에 파일이 사라질 수 있으므로 무시
      }
    }
  } catch {
    // 비치명적 정리 작업이므로 실패해도 출력 흐름은 유지한다
  }
}

function output(result, raw, rawValue) {
  let data;
  if (raw && rawValue !== undefined) {
    data = String(rawValue);
  } else {
    const json = JSON.stringify(result, null, 2);
    // 큰 payload는 Claude Code Bash 도구 버퍼(~50KB)를 넘길 수 있다.
    // 임시 파일로 우회하고 `@file:` 접두사 경로를 반환해 호출자가 감지하게 한다.
    if (json.length > 50000) {
      reapStaleTempFiles();
      const tmpPath = path.join(require('os').tmpdir(), `gsd-${Date.now()}.json`);
      fs.writeFileSync(tmpPath, json, 'utf-8');
      data = '@file:' + tmpPath;
    } else {
      data = json;
    }
  }
  // stdout이 pipe일 때 process.stdout.write()는 비동기라서 process.exit()가
  // 버퍼 소비 전에 프로세스를 종료시킬 수 있다.
  // fs.writeSync(1, ...)는 커널이 바이트를 받을 때까지 블로킹하고,
  // process.exit()를 생략하면 이벤트 루프가 자연스럽게 비워진다.
  fs.writeSync(1, data);
}

function error(message) {
  fs.writeSync(2, 'Error: ' + message + '\n');
  process.exit(1);
}

// ─── 파일 및 설정 유틸리티 ───────────────────────────────────────────────────

function safeReadFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }
}

function loadConfig(cwd) {
  const configPath = path.join(cwd, '.planning', 'config.json');
  const defaults = {
    model_profile: 'balanced',
    commit_docs: true,
    search_gitignored: false,
    branching_strategy: 'none',
    phase_branch_template: 'gsd/phase-{phase}-{slug}',
    milestone_branch_template: 'gsd/{milestone}-{slug}',
    quick_branch_template: null,
    research: true,
    plan_checker: true,
    verifier: true,
    nyquist_validation: true,
    parallelization: true,
    brave_search: false,
    firecrawl: false,
    exa_search: false,
    text_mode: false, // true면 AskUserQuestion 메뉴 대신 일반 텍스트 번호 목록을 사용
    sub_repos: [],
    resolve_model_ids: false, // false: alias 그대로 반환 | true: 전체 Claude model ID로 매핑 | "omit": '' 반환(런타임 기본값 사용)
    context_window: 200000, // 기본 200k, Opus/Sonnet 4.6 1M 모델은 1000000 사용
    phase_naming: 'sequential', // 'sequential'(기본, 자동 증가) 또는 'custom'(임의 문자열 ID)
  };

  try {
    const raw = fs.readFileSync(configPath, 'utf-8');
    const parsed = JSON.parse(raw);

    // deprecated된 "depth" 키를 값 매핑과 함께 "granularity"로 마이그레이션
    if ('depth' in parsed && !('granularity' in parsed)) {
      const depthToGranularity = { quick: 'coarse', standard: 'standard', comprehensive: 'fine' };
      parsed.granularity = depthToGranularity[parsed.depth] || parsed.depth;
      delete parsed.depth;
      try { fs.writeFileSync(configPath, JSON.stringify(parsed, null, 2), 'utf-8'); } catch { /* intentionally empty */ }
    }

    // sub_repos 자동 감지 및 동기화: 하위 디렉터리의 `.git`을 스캔
    let configDirty = false;

    // 레거시 "multiRepo: true" boolean을 sub_repos 배열로 마이그레이션
    if (parsed.multiRepo === true && !parsed.sub_repos && !parsed.planning?.sub_repos) {
      const detected = detectSubRepos(cwd);
      if (detected.length > 0) {
        parsed.sub_repos = detected;
        if (!parsed.planning) parsed.planning = {};
        parsed.planning.commit_docs = false;
        delete parsed.multiRepo;
        configDirty = true;
      }
    }

    // sub_repos를 실제 파일시스템 상태와 동기화
    const currentSubRepos = parsed.sub_repos || parsed.planning?.sub_repos || [];
    if (Array.isArray(currentSubRepos) && currentSubRepos.length > 0) {
      const detected = detectSubRepos(cwd);
      if (detected.length > 0) {
        const sorted = [...currentSubRepos].sort();
        if (JSON.stringify(sorted) !== JSON.stringify(detected)) {
          parsed.sub_repos = detected;
          configDirty = true;
        }
      }
    }

    // sub_repos 변경 사항을 저장(마이그레이션 또는 동기화)
    if (configDirty) {
      try { fs.writeFileSync(configPath, JSON.stringify(parsed, null, 2), 'utf-8'); } catch {}
    }

    const get = (key, nested) => {
      if (parsed[key] !== undefined) return parsed[key];
      if (nested && parsed[nested.section] && parsed[nested.section][nested.field] !== undefined) {
        return parsed[nested.section][nested.field];
      }
      return undefined;
    };

    const parallelization = (() => {
      const val = get('parallelization');
      if (typeof val === 'boolean') return val;
      if (typeof val === 'object' && val !== null && 'enabled' in val) return val.enabled;
      return defaults.parallelization;
    })();

    return {
      model_profile: get('model_profile') ?? defaults.model_profile,
      commit_docs: (() => {
        const explicit = get('commit_docs', { section: 'planning', field: 'commit_docs' });
        // If explicitly set in config, respect the user's choice
        if (explicit !== undefined) return explicit;
        // Auto-detection: when no explicit value and .planning/ is gitignored,
        // default to false instead of true
        if (isGitIgnored(cwd, '.planning/')) return false;
        return defaults.commit_docs;
      })(),
      search_gitignored: get('search_gitignored', { section: 'planning', field: 'search_gitignored' }) ?? defaults.search_gitignored,
      branching_strategy: get('branching_strategy', { section: 'git', field: 'branching_strategy' }) ?? defaults.branching_strategy,
      phase_branch_template: get('phase_branch_template', { section: 'git', field: 'phase_branch_template' }) ?? defaults.phase_branch_template,
      milestone_branch_template: get('milestone_branch_template', { section: 'git', field: 'milestone_branch_template' }) ?? defaults.milestone_branch_template,
      quick_branch_template: get('quick_branch_template', { section: 'git', field: 'quick_branch_template' }) ?? defaults.quick_branch_template,
      research: get('research', { section: 'workflow', field: 'research' }) ?? defaults.research,
      plan_checker: get('plan_checker', { section: 'workflow', field: 'plan_check' }) ?? defaults.plan_checker,
      verifier: get('verifier', { section: 'workflow', field: 'verifier' }) ?? defaults.verifier,
      nyquist_validation: get('nyquist_validation', { section: 'workflow', field: 'nyquist_validation' }) ?? defaults.nyquist_validation,
      parallelization,
      brave_search: get('brave_search') ?? defaults.brave_search,
      firecrawl: get('firecrawl') ?? defaults.firecrawl,
      exa_search: get('exa_search') ?? defaults.exa_search,
      text_mode: get('text_mode', { section: 'workflow', field: 'text_mode' }) ?? defaults.text_mode,
      sub_repos: get('sub_repos', { section: 'planning', field: 'sub_repos' }) ?? defaults.sub_repos,
      resolve_model_ids: get('resolve_model_ids') ?? defaults.resolve_model_ids,
      context_window: get('context_window') ?? defaults.context_window,
      phase_naming: get('phase_naming') ?? defaults.phase_naming,
      model_overrides: parsed.model_overrides || null,
    };
  } catch {
    return defaults;
  }
}

// ─── Git utilities ────────────────────────────────────────────────────────────

function isGitIgnored(cwd, targetPath) {
  try {
    // --no-index checks .gitignore rules regardless of whether the file is tracked.
    // Without it, git check-ignore returns "not ignored" for tracked files even when
    // .gitignore explicitly lists them — a common source of confusion when .planning/
    // was committed before being added to .gitignore.
    // Use execFileSync (array args) to prevent shell interpretation of special characters
    // in file paths — avoids command injection via crafted path names.
    execFileSync('git', ['check-ignore', '-q', '--no-index', '--', targetPath], {
      cwd,
      stdio: 'pipe',
    });
    return true;
  } catch {
    return false;
  }
}

// ─── Markdown normalization ─────────────────────────────────────────────────

/**
 * Normalize markdown to fix common markdownlint violations.
 * Applied at write points so GSD-generated .planning/ files are IDE-friendly.
 *
 * Rules enforced:
 *   MD022 — Blank lines around headings
 *   MD031 — Blank lines around fenced code blocks
 *   MD032 — Blank lines around lists
 *   MD012 — No multiple consecutive blank lines (collapsed to 2 max)
 *   MD047 — Files end with a single newline
 */
function normalizeMd(content) {
  if (!content || typeof content !== 'string') return content;

  // Normalize line endings to LF for consistent processing
  let text = content.replace(/\r\n/g, '\n');

  const lines = text.split('\n');
  const result = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const prev = i > 0 ? lines[i - 1] : '';
    const prevTrimmed = prev.trimEnd();
    const trimmed = line.trimEnd();

    // MD022: Blank line before headings (skip first line and frontmatter delimiters)
    if (/^#{1,6}\s/.test(trimmed) && i > 0 && prevTrimmed !== '' && prevTrimmed !== '---') {
      result.push('');
    }

    // MD031: Blank line before fenced code blocks
    if (/^```/.test(trimmed) && i > 0 && prevTrimmed !== '' && !isInsideFencedBlock(lines, i)) {
      result.push('');
    }

    // MD032: Blank line before lists (- item, * item, N. item, - [ ] item)
    if (/^(\s*[-*+]\s|\s*\d+\.\s)/.test(line) && i > 0 &&
        prevTrimmed !== '' && !/^(\s*[-*+]\s|\s*\d+\.\s)/.test(prev) &&
        prevTrimmed !== '---') {
      result.push('');
    }

    result.push(line);

    // MD022: Blank line after headings
    if (/^#{1,6}\s/.test(trimmed) && i < lines.length - 1) {
      const next = lines[i + 1];
      if (next !== undefined && next.trimEnd() !== '') {
        result.push('');
      }
    }

    // MD031: Blank line after closing fenced code blocks
    if (/^```\s*$/.test(trimmed) && isClosingFence(lines, i) && i < lines.length - 1) {
      const next = lines[i + 1];
      if (next !== undefined && next.trimEnd() !== '') {
        result.push('');
      }
    }

    // MD032: Blank line after last list item in a block
    if (/^(\s*[-*+]\s|\s*\d+\.\s)/.test(line) && i < lines.length - 1) {
      const next = lines[i + 1];
      if (next !== undefined && next.trimEnd() !== '' &&
          !/^(\s*[-*+]\s|\s*\d+\.\s)/.test(next) &&
          !/^\s/.test(next)) {
        // Only add blank line if next line is not a continuation/indented line
        result.push('');
      }
    }
  }

  text = result.join('\n');

  // MD012: Collapse 3+ consecutive blank lines to 2
  text = text.replace(/\n{3,}/g, '\n\n');

  // MD047: Ensure file ends with exactly one newline
  text = text.replace(/\n*$/, '\n');

  return text;
}

/** Check if line index i is inside an already-open fenced code block */
function isInsideFencedBlock(lines, i) {
  let fenceCount = 0;
  for (let j = 0; j < i; j++) {
    if (/^```/.test(lines[j].trimEnd())) fenceCount++;
  }
  return fenceCount % 2 === 1;
}

/** Check if a ``` line is a closing fence (odd number of fences up to and including this one) */
function isClosingFence(lines, i) {
  let fenceCount = 0;
  for (let j = 0; j <= i; j++) {
    if (/^```/.test(lines[j].trimEnd())) fenceCount++;
  }
  return fenceCount % 2 === 0;
}

function execGit(cwd, args) {
  const result = spawnSync('git', args, {
    cwd,
    stdio: 'pipe',
    encoding: 'utf-8',
  });
  return {
    exitCode: result.status ?? 1,
    stdout: (result.stdout ?? '').toString().trim(),
    stderr: (result.stderr ?? '').toString().trim(),
  };
}

// ─── Common path helpers ──────────────────────────────────────────────────────

/**
 * Resolve the main worktree root when running inside a git worktree.
 * In a linked worktree, .planning/ lives in the main worktree, not in the linked one.
 * Returns the main worktree path, or cwd if not in a worktree.
 */
function resolveWorktreeRoot(cwd) {
  // If the current directory already has its own .planning/, respect it.
  // This handles linked worktrees with independent planning state (e.g., Conductor workspaces).
  if (fs.existsSync(path.join(cwd, '.planning'))) {
    return cwd;
  }

  // Check if we're in a linked worktree
  const gitDir = execGit(cwd, ['rev-parse', '--git-dir']);
  const commonDir = execGit(cwd, ['rev-parse', '--git-common-dir']);

  if (gitDir.exitCode !== 0 || commonDir.exitCode !== 0) return cwd;

  // In a linked worktree, .git is a file pointing to .git/worktrees/<name>
  // and git-common-dir points to the main repo's .git directory
  const gitDirResolved = path.resolve(cwd, gitDir.stdout);
  const commonDirResolved = path.resolve(cwd, commonDir.stdout);

  if (gitDirResolved !== commonDirResolved) {
    // We're in a linked worktree — resolve main worktree root
    // The common dir is the main repo's .git, so its parent is the main worktree root
    return path.dirname(commonDirResolved);
  }

  return cwd;
}

/**
 * Acquire a file-based lock for .planning/ writes.
 * Prevents concurrent worktrees from corrupting shared planning files.
 * Lock is auto-released after the callback completes.
 */
function withPlanningLock(cwd, fn) {
  const lockPath = path.join(planningDir(cwd), '.lock');
  const lockTimeout = 10000; // 10 seconds
  const retryDelay = 100;
  const start = Date.now();

  // Ensure .planning/ exists
  try { fs.mkdirSync(planningDir(cwd), { recursive: true }); } catch { /* ok */ }

  while (Date.now() - start < lockTimeout) {
    try {
      // Atomic create — fails if file exists
      fs.writeFileSync(lockPath, JSON.stringify({
        pid: process.pid,
        cwd,
        acquired: new Date().toISOString(),
      }), { flag: 'wx' });

      // Lock acquired — run the function
      try {
        return fn();
      } finally {
        try { fs.unlinkSync(lockPath); } catch { /* already released */ }
      }
    } catch (err) {
      if (err.code === 'EEXIST') {
        // Lock exists — check if stale (>30s old)
        try {
          const stat = fs.statSync(lockPath);
          if (Date.now() - stat.mtimeMs > 30000) {
            fs.unlinkSync(lockPath);
            continue; // retry
          }
        } catch { continue; }

        // Wait and retry
        spawnSync('sleep', ['0.1'], { stdio: 'ignore' });
        continue;
      }
      throw err;
    }
  }
  // Timeout — force acquire (stale lock recovery)
  try { fs.unlinkSync(lockPath); } catch { /* ok */ }
  return fn();
}

/**
 * Get the .planning directory path, workstream-aware.
 * When a workstream is active (via explicit ws arg or GSD_WORKSTREAM env var),
 * returns `.planning/workstreams/{ws}/`. Otherwise returns `.planning/`.
 *
 * @param {string} cwd - project root
 * @param {string} [ws] - explicit workstream name; if omitted, checks GSD_WORKSTREAM env var
 */
function planningDir(cwd, ws) {
  if (ws === undefined) ws = process.env.GSD_WORKSTREAM || null;
  if (!ws) return path.join(cwd, '.planning');
  return path.join(cwd, '.planning', 'workstreams', ws);
}

/** Always returns the root .planning/ path, ignoring workstreams. For shared resources. */
function planningRoot(cwd) {
  return path.join(cwd, '.planning');
}

/**
 * Get common .planning file paths, workstream-aware.
 * Scoped paths (state, roadmap, phases, requirements) resolve to the active workstream.
 * Shared paths (project, config) always resolve to the root .planning/.
 */
function planningPaths(cwd, ws) {
  const base = planningDir(cwd, ws);
  const root = path.join(cwd, '.planning');
  return {
    planning: base,
    state: path.join(base, 'STATE.md'),
    roadmap: path.join(base, 'ROADMAP.md'),
    project: path.join(root, 'PROJECT.md'),
    config: path.join(root, 'config.json'),
    phases: path.join(base, 'phases'),
    requirements: path.join(base, 'REQUIREMENTS.md'),
  };
}

// ─── Active Workstream Detection ─────────────────────────────────────────────

/**
 * Get the active workstream name from .planning/active-workstream file.
 * Returns null if no active workstream or file doesn't exist.
 */
function getActiveWorkstream(cwd) {
  const filePath = path.join(planningRoot(cwd), 'active-workstream');
  try {
    const name = fs.readFileSync(filePath, 'utf-8').trim();
    if (!name || !/^[a-zA-Z0-9_-]+$/.test(name)) return null;
    const wsDir = path.join(planningRoot(cwd), 'workstreams', name);
    if (!fs.existsSync(wsDir)) return null;
    return name;
  } catch {
    return null;
  }
}

/**
 * Set the active workstream. Pass null to clear.
 */
function setActiveWorkstream(cwd, name) {
  const filePath = path.join(planningRoot(cwd), 'active-workstream');
  if (!name) {
    try { fs.unlinkSync(filePath); } catch {}
    return;
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
    throw new Error('Invalid workstream name: must be alphanumeric, hyphens, and underscores only');
  }
  fs.writeFileSync(filePath, name + '\n', 'utf-8');
}

// ─── Phase utilities ──────────────────────────────────────────────────────────

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizePhaseName(phase) {
  const str = String(phase);
  // Standard numeric phases: 1, 01, 12A, 12.1
  const match = str.match(/^(\d+)([A-Z])?((?:\.\d+)*)/i);
  if (match) {
    const padded = match[1].padStart(2, '0');
    const letter = match[2] ? match[2].toUpperCase() : '';
    const decimal = match[3] || '';
    return padded + letter + decimal;
  }
  // Custom phase IDs (e.g. PROJ-42, AUTH-101): return as-is
  return str;
}

function comparePhaseNum(a, b) {
  const pa = String(a).match(/^(\d+)([A-Z])?((?:\.\d+)*)/i);
  const pb = String(b).match(/^(\d+)([A-Z])?((?:\.\d+)*)/i);
  // If either is non-numeric (custom ID), fall back to string comparison
  if (!pa || !pb) return String(a).localeCompare(String(b));
  const intDiff = parseInt(pa[1], 10) - parseInt(pb[1], 10);
  if (intDiff !== 0) return intDiff;
  // No letter sorts before letter: 12 < 12A < 12B
  const la = (pa[2] || '').toUpperCase();
  const lb = (pb[2] || '').toUpperCase();
  if (la !== lb) {
    if (!la) return -1;
    if (!lb) return 1;
    return la < lb ? -1 : 1;
  }
  // Segment-by-segment decimal comparison: 12A < 12A.1 < 12A.1.2 < 12A.2
  const aDecParts = pa[3] ? pa[3].slice(1).split('.').map(p => parseInt(p, 10)) : [];
  const bDecParts = pb[3] ? pb[3].slice(1).split('.').map(p => parseInt(p, 10)) : [];
  const maxLen = Math.max(aDecParts.length, bDecParts.length);
  if (aDecParts.length === 0 && bDecParts.length > 0) return -1;
  if (bDecParts.length === 0 && aDecParts.length > 0) return 1;
  for (let i = 0; i < maxLen; i++) {
    const av = Number.isFinite(aDecParts[i]) ? aDecParts[i] : 0;
    const bv = Number.isFinite(bDecParts[i]) ? bDecParts[i] : 0;
    if (av !== bv) return av - bv;
  }
  return 0;
}

function searchPhaseInDir(baseDir, relBase, normalized) {
  try {
    const dirs = readSubdirectories(baseDir, true);
    // Match: starts with normalized (numeric) OR contains normalized as prefix segment (custom ID)
    const match = dirs.find(d => {
      if (d.startsWith(normalized)) return true;
      // For custom IDs like PROJ-42, match case-insensitively
      if (d.toUpperCase().startsWith(normalized.toUpperCase())) return true;
      return false;
    });
    if (!match) return null;

    // Extract phase number and name — supports both numeric (01-name) and custom (PROJ-42-name)
    const dirMatch = match.match(/^(\d+[A-Z]?(?:\.\d+)*)-?(.*)/i)
      || match.match(/^([A-Z][A-Z0-9]*(?:-[A-Z0-9]+)*)-(.+)/i)
      || [null, match, null];
    const phaseNumber = dirMatch ? dirMatch[1] : normalized;
    const phaseName = dirMatch && dirMatch[2] ? dirMatch[2] : null;
    const phaseDir = path.join(baseDir, match);
    const { plans: unsortedPlans, summaries: unsortedSummaries, hasResearch, hasContext, hasVerification, hasReviews } = getPhaseFileStats(phaseDir);
    const plans = unsortedPlans.sort();
    const summaries = unsortedSummaries.sort();

    const completedPlanIds = new Set(
      summaries.map(s => s.replace('-SUMMARY.md', '').replace('SUMMARY.md', ''))
    );
    const incompletePlans = plans.filter(p => {
      const planId = p.replace('-PLAN.md', '').replace('PLAN.md', '');
      return !completedPlanIds.has(planId);
    });

    return {
      found: true,
      directory: toPosixPath(path.join(relBase, match)),
      phase_number: phaseNumber,
      phase_name: phaseName,
      phase_slug: phaseName ? phaseName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') : null,
      plans,
      summaries,
      incomplete_plans: incompletePlans,
      has_research: hasResearch,
      has_context: hasContext,
      has_verification: hasVerification,
      has_reviews: hasReviews,
    };
  } catch {
    return null;
  }
}

function findPhaseInternal(cwd, phase) {
  if (!phase) return null;

  const phasesDir = path.join(planningDir(cwd), 'phases');
  const normalized = normalizePhaseName(phase);

  // Search current phases first
  const relPhasesDir = toPosixPath(path.relative(cwd, phasesDir));
  const current = searchPhaseInDir(phasesDir, relPhasesDir, normalized);
  if (current) return current;

  // Search archived milestone phases (newest first)
  const milestonesDir = path.join(cwd, '.planning', 'milestones');
  if (!fs.existsSync(milestonesDir)) return null;

  try {
    const milestoneEntries = fs.readdirSync(milestonesDir, { withFileTypes: true });
    const archiveDirs = milestoneEntries
      .filter(e => e.isDirectory() && /^v[\d.]+-phases$/.test(e.name))
      .map(e => e.name)
      .sort()
      .reverse();

    for (const archiveName of archiveDirs) {
      const version = archiveName.match(/^(v[\d.]+)-phases$/)[1];
      const archivePath = path.join(milestonesDir, archiveName);
      const relBase = '.planning/milestones/' + archiveName;
      const result = searchPhaseInDir(archivePath, relBase, normalized);
      if (result) {
        result.archived = version;
        return result;
      }
    }
  } catch { /* intentionally empty */ }

  return null;
}

function getArchivedPhaseDirs(cwd) {
  const milestonesDir = path.join(cwd, '.planning', 'milestones');
  const results = [];

  if (!fs.existsSync(milestonesDir)) return results;

  try {
    const milestoneEntries = fs.readdirSync(milestonesDir, { withFileTypes: true });
    // Find v*-phases directories, sort newest first
    const phaseDirs = milestoneEntries
      .filter(e => e.isDirectory() && /^v[\d.]+-phases$/.test(e.name))
      .map(e => e.name)
      .sort()
      .reverse();

    for (const archiveName of phaseDirs) {
      const version = archiveName.match(/^(v[\d.]+)-phases$/)[1];
      const archivePath = path.join(milestonesDir, archiveName);
      const dirs = readSubdirectories(archivePath, true);

      for (const dir of dirs) {
        results.push({
          name: dir,
          milestone: version,
          basePath: path.join('.planning', 'milestones', archiveName),
          fullPath: path.join(archivePath, dir),
        });
      }
    }
  } catch { /* intentionally empty */ }

  return results;
}

// ─── Roadmap milestone scoping ───────────────────────────────────────────────

/**
 * Strip shipped milestone content wrapped in <details> blocks.
 * Used to isolate current milestone phases when searching ROADMAP.md
 * for phase headings or checkboxes — prevents matching archived milestone
 * phases that share the same numbers as current milestone phases.
 */
function stripShippedMilestones(content) {
  return content.replace(/<details>[\s\S]*?<\/details>/gi, '');
}

/**
 * Extract the current milestone section from ROADMAP.md by positive lookup.
 *
 * Instead of stripping <details> blocks (negative heuristic that breaks if
 * agents wrap the current milestone in <details>), this finds the section
 * matching the current milestone version and returns only that content.
 *
 * Falls back to stripShippedMilestones() if:
 * - cwd is not provided
 * - STATE.md doesn't exist or has no milestone field
 * - Version can't be found in ROADMAP.md
 *
 * @param {string} content - Full ROADMAP.md content
 * @param {string} [cwd] - Working directory for reading STATE.md
 * @returns {string} Content scoped to current milestone
 */
function extractCurrentMilestone(content, cwd) {
  if (!cwd) return stripShippedMilestones(content);

  // 1. Get current milestone version from STATE.md frontmatter
  let version = null;
  try {
    const statePath = path.join(planningDir(cwd), 'STATE.md');
    if (fs.existsSync(statePath)) {
      const stateRaw = fs.readFileSync(statePath, 'utf-8');
      const milestoneMatch = stateRaw.match(/^milestone:\s*(.+)/m);
      if (milestoneMatch) {
        version = milestoneMatch[1].trim();
      }
    }
  } catch {}

  // 2. Fallback: derive version from getMilestoneInfo pattern in ROADMAP.md itself
  if (!version) {
    // Check for 🚧 in-progress marker
    const inProgressMatch = content.match(/🚧\s*\*\*v(\d+\.\d+)\s/);
    if (inProgressMatch) {
      version = 'v' + inProgressMatch[1];
    }
  }

  if (!version) return stripShippedMilestones(content);

  // 3. Find the section matching this version
  // Match headings like: ## Roadmap v3.0: Name, ## v3.0 Name, etc.
  const escapedVersion = escapeRegex(version);
  const sectionPattern = new RegExp(
    `(^#{1,3}\\s+.*${escapedVersion}[^\\n]*)`,
    'mi'
  );
  const sectionMatch = content.match(sectionPattern);

  if (!sectionMatch) return stripShippedMilestones(content);

  const sectionStart = sectionMatch.index;

  // Find the end: next milestone heading at same or higher level, or EOF
  // Milestone headings look like: ## v2.0, ## Roadmap v2.0, ## ✅ v1.0, etc.
  const headingLevel = sectionMatch[1].match(/^(#{1,3})\s/)[1].length;
  const restContent = content.slice(sectionStart + sectionMatch[0].length);
  const nextMilestonePattern = new RegExp(
    `^#{1,${headingLevel}}\\s+(?:.*v\\d+\\.\\d+|✅|📋|🚧)`,
    'mi'
  );
  const nextMatch = restContent.match(nextMilestonePattern);

  let sectionEnd;
  if (nextMatch) {
    sectionEnd = sectionStart + sectionMatch[0].length + nextMatch.index;
  } else {
    sectionEnd = content.length;
  }

  // Return everything before the current milestone section (non-milestone content
  // like title, overview) plus the current milestone section
  const beforeMilestones = content.slice(0, sectionStart);
  const currentSection = content.slice(sectionStart, sectionEnd);

  // Also include any content before the first milestone heading (title, overview, etc.)
  // but strip any <details> blocks in it (these are definitely shipped)
  const preamble = beforeMilestones.replace(/<details>[\s\S]*?<\/details>/gi, '');

  return preamble + currentSection;
}

/**
 * Replace a pattern only in the current milestone section of ROADMAP.md
 * (everything after the last </details> close tag). Used for write operations
 * that must not accidentally modify archived milestone checkboxes/tables.
 */
function replaceInCurrentMilestone(content, pattern, replacement) {
  const lastDetailsClose = content.lastIndexOf('</details>');
  if (lastDetailsClose === -1) {
    return content.replace(pattern, replacement);
  }
  const offset = lastDetailsClose + '</details>'.length;
  const before = content.slice(0, offset);
  const after = content.slice(offset);
  return before + after.replace(pattern, replacement);
}

// ─── Roadmap & model utilities ────────────────────────────────────────────────

function getRoadmapPhaseInternal(cwd, phaseNum) {
  if (!phaseNum) return null;
  const roadmapPath = path.join(planningDir(cwd), 'ROADMAP.md');
  if (!fs.existsSync(roadmapPath)) return null;

  try {
    const content = extractCurrentMilestone(fs.readFileSync(roadmapPath, 'utf-8'), cwd);
    const escapedPhase = escapeRegex(phaseNum.toString());
    // Match both numeric (Phase 1:) and custom (Phase PROJ-42:) headers
    const phasePattern = new RegExp(`#{2,4}\\s*Phase\\s+${escapedPhase}:\\s*([^\\n]+)`, 'i');
    const headerMatch = content.match(phasePattern);
    if (!headerMatch) return null;

    const phaseName = headerMatch[1].trim();
    const headerIndex = headerMatch.index;
    const restOfContent = content.slice(headerIndex);
    const nextHeaderMatch = restOfContent.match(/\n#{2,4}\s+Phase\s+[\w]/i);
    const sectionEnd = nextHeaderMatch ? headerIndex + nextHeaderMatch.index : content.length;
    const section = content.slice(headerIndex, sectionEnd).trim();

    const goalMatch = section.match(/\*\*Goal(?:\*\*:|\*?\*?:\*\*)\s*([^\n]+)/i);
    const goal = goalMatch ? goalMatch[1].trim() : null;

    return {
      found: true,
      phase_number: phaseNum.toString(),
      phase_name: phaseName,
      goal,
      section,
    };
  } catch {
    return null;
  }
}

// ─── 모델 alias 해석 ──────────────────────────────────────────────────────────

/**
 * 짧은 모델 alias를 전체 model ID로 매핑한다.
 * 현재 모델 버전에 맞추어 릴리스마다 갱신한다.
 * 사용자는 config.json의 model_overrides로 커스텀/최신 모델을 덮어쓸 수 있다.
 */
const MODEL_ALIAS_MAP = {
  'opus': 'claude-opus-4-0',
  'sonnet': 'claude-sonnet-4-5',
  'haiku': 'claude-haiku-3-5',
};

function resolveModelInternal(cwd, agentType) {
  const config = loadConfig(cwd);

  // agent별 override를 먼저 확인한다. resolve_model_ids 값과 무관하게 항상 우선한다.
  // 완전한 model ID(예: "openai/gpt-5.4")를 넣은 사용자는 그 값을 그대로 받는다.
  const override = config.model_overrides?.[agentType];
  if (override) {
    return override;
  }

  // resolve_model_ids: "omit"이면 빈 문자열을 반환해 런타임이 자체 기본 모델을 쓰게 한다.
  // Claude alias(opus/sonnet/haiku/inherit)를 이해하지 못하는 OpenCode, Codex 등의
  // 비-Claude 런타임을 위한 동작이며, 설치 과정에서 자동 설정된다. See #1156.
  if (config.resolve_model_ids === 'omit') {
    return '';
  }

  // override가 없으면 profile 기반 조회로 폴백
  const profile = String(config.model_profile || 'balanced').toLowerCase();
  const agentModels = MODEL_PROFILES[agentType];
  if (!agentModels) return 'sonnet';
  if (profile === 'inherit') return 'inherit';
  const alias = agentModels[profile] || agentModels['balanced'] || 'sonnet';

  // resolve_model_ids: true면 alias를 전체 Claude model ID로 확장한다.
  // Task 도구가 alias를 그대로 API에 전달해 404가 나는 일을 막는다.
  if (config.resolve_model_ids) {
    return MODEL_ALIAS_MAP[alias] || alias;
  }

  return alias;
}

// ─── Summary 본문 헬퍼 ───────────────────────────────────────────────────────

/**
 * frontmatter에 one-liner가 없을 때 summary 본문에서 추출한다.
 * summary 템플릿은 heading 다음 굵은 markdown 줄을 one-liner로 사용한다.
 *   # Phase X: Name Summary
 *   **[substantive one-liner text]**
 */
function extractOneLinerFromBody(content) {
  if (!content) return null;
  // 먼저 frontmatter를 제거
  const body = content.replace(/^---\n[\s\S]*?\n---\n*/, '');
  // # heading 다음에 오는 첫 번째 **...** 줄을 찾는다
  const match = body.match(/^#[^\n]*\n+\*\*([^*]+)\*\*/m);
  return match ? match[1].trim() : null;
}

// ─── 기타 유틸리티 ────────────────────────────────────────────────────────────

function pathExistsInternal(cwd, targetPath) {
  const fullPath = path.isAbsolute(targetPath) ? targetPath : path.join(cwd, targetPath);
  try {
    fs.statSync(fullPath);
    return true;
  } catch {
    return false;
  }
}

function generateSlugInternal(text) {
  if (!text) return null;
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function getMilestoneInfo(cwd) {
  try {
    const roadmap = fs.readFileSync(path.join(planningDir(cwd), 'ROADMAP.md'), 'utf-8');

    // 1차: 🚧(in-progress) 마커를 쓰는 목록형 roadmap 형식을 확인
    // e.g. "- 🚧 **v2.1 Belgium** — Phases 24-28 (in progress)"
    // e.g. "- 🚧 **v1.2.1 Tech Debt** — Phases 1-8 (in progress)"
    const inProgressMatch = roadmap.match(/🚧\s*\*\*v(\d+(?:\.\d+)+)\s+([^*]+)\*\*/);
    if (inProgressMatch) {
      return {
        version: 'v' + inProgressMatch[1],
        name: inProgressMatch[2].trim(),
      };
    }

    // 2차: heading형 roadmap을 확인하되 <details> 안 shipped milestone은 제거
    const cleaned = stripShippedMilestones(roadmap);
    // 일관성을 위해 같은 ## heading에서 version과 name을 함께 추출
    // v1.2, v1.2.1, v2.0.1 같은 2개 이상 세그먼트 버전을 지원
    const headingMatch = cleaned.match(/## .*v(\d+(?:\.\d+)+)[:\s]+([^\n(]+)/);
    if (headingMatch) {
      return {
        version: 'v' + headingMatch[1],
        name: headingMatch[2].trim(),
      };
    }
    // 마지막 폴백: bare version 매칭 시도(가장 긴 version 문자열을 우선 캡처)
    const versionMatch = cleaned.match(/v(\d+(?:\.\d+)+)/);
    return {
      version: versionMatch ? versionMatch[0] : 'v1.0',
      name: 'milestone',
    };
  } catch {
    return { version: 'v1.0', name: 'milestone' };
  }
}

/**
 * ROADMAP.md phase heading을 기준으로 특정 phase 디렉터리가
 * 현재 milestone에 속하는지 판별하는 필터 함수를 반환한다.
 * ROADMAP이 없거나 phase가 하나도 없으면 모두 통과시키는 필터를 반환한다.
 */
function getMilestonePhaseFilter(cwd) {
  const milestonePhaseNums = new Set();
  try {
    const roadmap = extractCurrentMilestone(fs.readFileSync(path.join(planningDir(cwd), 'ROADMAP.md'), 'utf-8'), cwd);
    // 숫자형 phase(Phase 1:)와 사용자 정의 ID(Phase PROJ-42:) 모두 매칭
    const phasePattern = /#{2,4}\s*Phase\s+([\w][\w.-]*)\s*:/gi;
    let m;
    while ((m = phasePattern.exec(roadmap)) !== null) {
      milestonePhaseNums.add(m[1]);
    }
  } catch { /* intentionally empty */ }

  if (milestonePhaseNums.size === 0) {
    const passAll = () => true;
    passAll.phaseCount = 0;
    return passAll;
  }

  const normalized = new Set(
    [...milestonePhaseNums].map(n => (n.replace(/^0+/, '') || '0').toLowerCase())
  );

  function isDirInMilestone(dirName) {
    // 먼저 숫자형 prefix 매칭 시도
    const m = dirName.match(/^0*(\d+[A-Za-z]?(?:\.\d+)*)/);
    if (m && normalized.has(m[1].toLowerCase())) return true;
    // 그다음 사용자 정의 ID 매칭 시도(e.g. PROJ-42-description → PROJ-42)
    const customMatch = dirName.match(/^([A-Za-z][A-Za-z0-9]*(?:-[A-Za-z0-9]+)*)/);
    if (customMatch && normalized.has(customMatch[1].toLowerCase())) return true;
    return false;
  }
  isDirInMilestone.phaseCount = milestonePhaseNums.size;
  return isDirInMilestone;
}

// ─── Phase 파일 헬퍼 ─────────────────────────────────────────────────────────

/** 파일 목록에서 PLAN.md / *-PLAN.md 항목만 남긴다. */
function filterPlanFiles(files) {
  return files.filter(f => f.endsWith('-PLAN.md') || f === 'PLAN.md');
}

/** 파일 목록에서 SUMMARY.md / *-SUMMARY.md 항목만 남긴다. */
function filterSummaryFiles(files) {
  return files.filter(f => f.endsWith('-SUMMARY.md') || f === 'SUMMARY.md');
}

/**
 * phase 디렉터리를 읽고 공통 산출물 파일 타입의 개수/플래그를 반환한다.
 * plans[], summaries[]와 research/context/verification 여부를 포함한다.
 */
function getPhaseFileStats(phaseDir) {
  const files = fs.readdirSync(phaseDir);
  return {
    plans: filterPlanFiles(files),
    summaries: filterSummaryFiles(files),
    hasResearch: files.some(f => f.endsWith('-RESEARCH.md') || f === 'RESEARCH.md'),
    hasContext: files.some(f => f.endsWith('-CONTEXT.md') || f === 'CONTEXT.md'),
    hasVerification: files.some(f => f.endsWith('-VERIFICATION.md') || f === 'VERIFICATION.md'),
    hasReviews: files.some(f => f.endsWith('-REVIEWS.md') || f === 'REVIEWS.md'),
  };
}

/**
 * 지정한 경로의 직계 하위 디렉터리를 읽는다.
 * 경로가 없거나 읽을 수 없으면 []를 반환한다.
 * sort=true면 comparePhaseNum 순서를 적용한다.
 */
function readSubdirectories(dirPath, sort = false) {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const dirs = entries.filter(e => e.isDirectory()).map(e => e.name);
    return sort ? dirs.sort((a, b) => comparePhaseNum(a, b)) : dirs;
  } catch {
    return [];
  }
}

module.exports = {
  output,
  error,
  safeReadFile,
  loadConfig,
  isGitIgnored,
  execGit,
  normalizeMd,
  escapeRegex,
  normalizePhaseName,
  comparePhaseNum,
  searchPhaseInDir,
  findPhaseInternal,
  getArchivedPhaseDirs,
  getRoadmapPhaseInternal,
  resolveModelInternal,
  pathExistsInternal,
  generateSlugInternal,
  getMilestoneInfo,
  getMilestonePhaseFilter,
  stripShippedMilestones,
  extractCurrentMilestone,
  replaceInCurrentMilestone,
  toPosixPath,
  extractOneLinerFromBody,
  resolveWorktreeRoot,
  withPlanningLock,
  findProjectRoot,
  detectSubRepos,
  reapStaleTempFiles,
  MODEL_ALIAS_MAP,
  planningDir,
  planningRoot,
  planningPaths,
  getActiveWorkstream,
  setActiveWorkstream,
  filterPlanFiles,
  filterSummaryFiles,
  getPhaseFileStats,
  readSubdirectories,
};
