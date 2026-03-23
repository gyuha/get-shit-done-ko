#!/usr/bin/env node

/**
 * GSD Tools — GSD 워크플로 작업용 CLI 유틸리티
 *
 * 약 50개의 GSD command/workflow/agent 파일에 흩어진 반복 bash 패턴을 대체한다.
 * config 파싱, 모델 해석, phase 조회, git commit, summary 검증을 한곳으로 모은다.
 *
 * 사용법: node gsd-tools.cjs <command> [args] [--raw] [--pick <field>]
 *
 * Atomic Commands:
 *   state load                         Load project config + state
 *   state json                         Output STATE.md frontmatter as JSON
 *   state update <field> <value>       Update a STATE.md field
 *   state get [section]                Get STATE.md content or section
 *   state patch --field val ...        Batch update STATE.md fields
 *   state begin-phase --phase N --name S --plans C  Update STATE.md for new phase start
 *   state signal-waiting --type T --question Q --options "A|B" --phase P  Write WAITING.json signal
 *   state signal-resume                Remove WAITING.json signal
 *   resolve-model <agent-type>         Get model for agent based on profile
 *   find-phase <phase>                 Find phase directory by number
 *   commit <message> [--files f1 f2] [--no-verify]   Commit planning docs
 *   commit-to-subrepo <msg> --files f1 f2  Route commits to sub-repos
 *   verify-summary <path>              Verify a SUMMARY.md file
 *   generate-slug <text>               Convert text to URL-safe slug
 *   current-timestamp [format]         Get timestamp (full|date|filename)
 *   list-todos [area]                  Count and enumerate pending todos
 *   verify-path-exists <path>          Check file/directory existence
 *   config-ensure-section              Initialize .planning/config.json
 *   history-digest                     Aggregate all SUMMARY.md data
 *   summary-extract <path> [--fields]  Extract structured data from SUMMARY.md
 *   state-snapshot                     Structured parse of STATE.md
 *   phase-plan-index <phase>           Index plans with waves and status
 *   websearch <query>                  Search web via Brave API (if configured)
 *     [--limit N] [--freshness day|week|month]
 *
 * Phase Operations:
 *   phase next-decimal <phase>         Calculate next decimal phase number
 *   phase add <description> [--id ID]   Append new phase to roadmap + create dir
 *   phase insert <after> <description> Insert decimal phase after existing
 *   phase remove <phase> [--force]     Remove phase, renumber all subsequent
 *   phase complete <phase>             Mark phase done, update state + roadmap
 *
 * Roadmap Operations:
 *   roadmap get-phase <phase>          Extract phase section from ROADMAP.md
 *   roadmap analyze                    Full roadmap parse with disk status
 *   roadmap update-plan-progress <N>   Update progress table row from disk (PLAN vs SUMMARY counts)
 *
 * Requirements Operations:
 *   requirements mark-complete <ids>   Mark requirement IDs as complete in REQUIREMENTS.md
 *                                      Accepts: REQ-01,REQ-02 or REQ-01 REQ-02 or [REQ-01, REQ-02]
 *
 * Milestone Operations:
 *   milestone complete <version>       Archive milestone, create MILESTONES.md
 *     [--name <name>]
 *     [--archive-phases]               Move phase dirs to milestones/vX.Y-phases/
 *
 * Validation:
 *   validate consistency               Check phase numbering, disk/roadmap sync
 *   validate health [--repair]         Check .planning/ integrity, optionally repair
 *
 * Progress:
 *   progress [json|table|bar]          Render progress in various formats
 *
 * Todos:
 *   todo complete <filename>           Move todo from pending to completed
 *
 * UAT Audit:
 *   audit-uat                           Scan all phases for unresolved UAT/verification items
 *
 * Scaffolding:
 *   scaffold context --phase <N>       Create CONTEXT.md template
 *   scaffold uat --phase <N>           Create UAT.md template
 *   scaffold verification --phase <N>  Create VERIFICATION.md template
 *   scaffold phase-dir --phase <N>     Create phase directory
 *     --name <name>
 *
 * Frontmatter CRUD:
 *   frontmatter get <file> [--field k] Extract frontmatter as JSON
 *   frontmatter set <file> --field k   Update single frontmatter field
 *     --value jsonVal
 *   frontmatter merge <file>           Merge JSON into frontmatter
 *     --data '{json}'
 *   frontmatter validate <file>        Validate required fields
 *     --schema plan|summary|verification
 *
 * Verification Suite:
 *   verify plan-structure <file>       Check PLAN.md structure + tasks
 *   verify phase-completeness <phase>  Check all plans have summaries
 *   verify references <file>           Check @-refs + paths resolve
 *   verify commits <h1> [h2] ...      Batch verify commit hashes
 *   verify artifacts <plan-file>       Check must_haves.artifacts
 *   verify key-links <plan-file>       Check must_haves.key_links
 *
 * Template Fill:
 *   template fill summary --phase N    Create pre-filled SUMMARY.md
 *     [--plan M] [--name "..."]
 *     [--fields '{json}']
 *   template fill plan --phase N       Create pre-filled PLAN.md
 *     [--plan M] [--type execute|tdd]
 *     [--wave N] [--fields '{json}']
 *   template fill verification         Create pre-filled VERIFICATION.md
 *     --phase N [--fields '{json}']
 *
 * State Progression:
 *   state advance-plan                 Increment plan counter
 *   state record-metric --phase N      Record execution metrics
 *     --plan M --duration Xmin
 *     [--tasks N] [--files N]
 *   state update-progress              Recalculate progress bar
 *   state add-decision --summary "..."  Add decision to STATE.md
 *     [--phase N] [--rationale "..."]
 *     [--summary-file path] [--rationale-file path]
 *   state add-blocker --text "..."     Add blocker
 *     [--text-file path]
 *   state resolve-blocker --text "..." Remove blocker
 *   state record-session               Update session continuity
 *     --stopped-at "..."
 *     [--resume-file path]
 *
 * Compound Commands (workflow-specific initialization):
 *   init execute-phase <phase>         All context for execute-phase workflow
 *   init plan-phase <phase>            All context for plan-phase workflow
 *   init new-project                   All context for new-project workflow
 *   init new-milestone                 All context for new-milestone workflow
 *   init quick <description>           All context for quick workflow
 *   init resume                        All context for resume-project workflow
 *   init verify-work <phase>           All context for verify-work workflow
 *   init phase-op <phase>              Generic phase operation context
 *   init todos [area]                  All context for todo workflows
 *   init milestone-op                  All context for milestone operations
 *   init map-codebase                  All context for map-codebase workflow
 *   init progress                      All context for progress workflow
 */

const fs = require('fs');
const path = require('path');
const core = require('./lib/core.cjs');
const { error, findProjectRoot, getActiveWorkstream } = core;
const state = require('./lib/state.cjs');
const phase = require('./lib/phase.cjs');
const roadmap = require('./lib/roadmap.cjs');
const verify = require('./lib/verify.cjs');
const config = require('./lib/config.cjs');
const template = require('./lib/template.cjs');
const milestone = require('./lib/milestone.cjs');
const commands = require('./lib/commands.cjs');
const init = require('./lib/init.cjs');
const frontmatter = require('./lib/frontmatter.cjs');
const profilePipeline = require('./lib/profile-pipeline.cjs');
const profileOutput = require('./lib/profile-output.cjs');
const workstream = require('./lib/workstream.cjs');

// ─── 인자 파싱 헬퍼 ────────────────────────────────────────────────────────────

/**
 * args 배열에서 이름 있는 --flag <value> 쌍을 추출한다.
 * 반환값은 flag 이름을 값에 매핑한 객체이며, 없으면 null이다.
 * `booleanFlags`에 지정한 flag는 값 소비 없이 불리언으로 처리한다.
 *
 * parseNamedArgs(args, 'phase', 'plan')        → { phase: '3', plan: '1' }
 * parseNamedArgs(args, [], ['amend', 'force'])  → { amend: true, force: false }
 */
function parseNamedArgs(args, valueFlags = [], booleanFlags = []) {
  const result = {};
  for (const flag of valueFlags) {
    const idx = args.indexOf(`--${flag}`);
    result[flag] = idx !== -1 && args[idx + 1] !== undefined && !args[idx + 1].startsWith('--')
      ? args[idx + 1]
      : null;
  }
  for (const flag of booleanFlags) {
    result[flag] = args.includes(`--${flag}`);
  }
  return result;
}

/**
 * --flag 뒤부터 다음 --flag 전까지의 토큰을 모두 모은다.
 * --name Foo Bar Version 1 같은 다중 단어 값도 처리한다.
 * flag가 없으면 null을 반환한다.
 */
function parseMultiwordArg(args, flag) {
  const idx = args.indexOf(`--${flag}`);
  if (idx === -1) return null;
  const tokens = [];
  for (let i = idx + 1; i < args.length; i++) {
    if (args[i].startsWith('--')) break;
    tokens.push(args[i]);
  }
  return tokens.length > 0 ? tokens.join(' ') : null;
}

// ─── CLI 라우터 ───────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  // 프로젝트 루트 밖에서 실행되는 sandboxed subagent용 선택적 cwd override.
  let cwd = process.cwd();
  const cwdEqArg = args.find(arg => arg.startsWith('--cwd='));
  const cwdIdx = args.indexOf('--cwd');
  if (cwdEqArg) {
    const value = cwdEqArg.slice('--cwd='.length).trim();
    if (!value) error('--cwd 값이 필요합니다');
    args.splice(args.indexOf(cwdEqArg), 1);
    cwd = path.resolve(value);
  } else if (cwdIdx !== -1) {
    const value = args[cwdIdx + 1];
    if (!value || value.startsWith('--')) error('--cwd 값이 필요합니다');
    args.splice(cwdIdx, 2);
    cwd = path.resolve(value);
  }

  if (!fs.existsSync(cwd) || !fs.statSync(cwd).isDirectory()) {
    error(`잘못된 --cwd 경로입니다: ${cwd}`);
  }

  // linked worktree에서는 .planning/이 main worktree에 있을 수 있다.
  // 다만 하위 디렉터리 자체가 .planning/을 소유한 monorepo worktree라면
  // 현재 CWD가 이미 올바른 프로젝트 루트이므로 worktree 해석을 건너뛴다.
  const { resolveWorktreeRoot } = require('./lib/core.cjs');
  if (!fs.existsSync(path.join(cwd, '.planning'))) {
    const worktreeRoot = resolveWorktreeRoot(cwd);
    if (worktreeRoot !== cwd) {
      cwd = worktreeRoot;
    }
  }

  // 병렬 milestone 작업용 선택적 workstream override.
  // 우선순위: --ws > GSD_WORKSTREAM > active-workstream 파일 > null(flat mode)
  const wsEqArg = args.find(arg => arg.startsWith('--ws='));
  const wsIdx = args.indexOf('--ws');
  let ws = null;
  if (wsEqArg) {
    ws = wsEqArg.slice('--ws='.length).trim();
    if (!ws) error('--ws 값이 필요합니다');
    args.splice(args.indexOf(wsEqArg), 1);
  } else if (wsIdx !== -1) {
    ws = args[wsIdx + 1];
    if (!ws || ws.startsWith('--')) error('--ws 값이 필요합니다');
    args.splice(wsIdx, 2);
  } else if (process.env.GSD_WORKSTREAM) {
    ws = process.env.GSD_WORKSTREAM.trim();
  } else {
    ws = getActiveWorkstream(cwd);
  }
  // path traversal 공격을 막기 위해 workstream 이름을 검증한다.
  if (ws && !/^[a-zA-Z0-9_-]+$/.test(ws)) {
    error('잘못된 workstream 이름입니다: 영문자, 숫자, 하이픈, 밑줄만 사용할 수 있습니다');
  }
  // 모든 모듈(planningDir, planningPaths)이 workstream 경로를 자동 해석하도록 env를 설정한다.
  if (ws) {
    process.env.GSD_WORKSTREAM = ws;
  }

  const rawIndex = args.indexOf('--raw');
  const raw = rawIndex !== -1;
  if (rawIndex !== -1) args.splice(rawIndex, 1);

  // --pick <name>: JSON 출력에서 단일 필드만 추출한다(jq 대체).
  // dot 표기(--pick workflow.research)와 배열 bracket 표기(--pick directories[-1])를 지원한다.
  const pickIdx = args.indexOf('--pick');
  let pickField = null;
  if (pickIdx !== -1) {
    pickField = args[pickIdx + 1];
    if (!pickField || pickField.startsWith('--')) error('--pick 값이 필요합니다');
    args.splice(pickIdx, 2);
  }

  const command = args[0];

  if (!command) {
    error('사용법: gsd-tools <command> [args] [--raw] [--pick <field>] [--cwd <path>] [--ws <name>]\n명령: state, resolve-model, find-phase, commit, verify-summary, verify, frontmatter, template, generate-slug, current-timestamp, list-todos, verify-path-exists, config-ensure-section, config-new-project, init, workstream');
  }

  // Multi-repo 가드: .planning/을 읽거나 쓰는 명령은 프로젝트 루트를 해석한다.
  // .planning/을 건드리지 않는 순수 유틸리티 명령은 불필요한 탐색을 피하기 위해 건너뛴다.
  const SKIP_ROOT_RESOLUTION = new Set([
    'generate-slug', 'current-timestamp', 'verify-path-exists',
    'verify-summary', 'template', 'frontmatter',
  ]);
  if (!SKIP_ROOT_RESOLUTION.has(command)) {
    cwd = findProjectRoot(cwd);
  }

  // When --pick is active, intercept stdout to extract the requested field.
  if (pickField) {
    const origWriteSync = fs.writeSync;
    const chunks = [];
    fs.writeSync = function (fd, data, ...rest) {
      if (fd === 1) { chunks.push(String(data)); return; }
      return origWriteSync.call(fs, fd, data, ...rest);
    };
    const cleanup = () => {
      fs.writeSync = origWriteSync;
      const captured = chunks.join('');
      let jsonStr = captured;
      if (jsonStr.startsWith('@file:')) {
        jsonStr = fs.readFileSync(jsonStr.slice(6), 'utf-8');
      }
      try {
        const obj = JSON.parse(jsonStr);
        const value = extractField(obj, pickField);
        const result = value === null || value === undefined ? '' : String(value);
        origWriteSync.call(fs, 1, result);
      } catch {
        origWriteSync.call(fs, 1, captured);
      }
    };
    try {
      await runCommand(command, args, cwd, raw);
      cleanup();
    } catch (e) {
      fs.writeSync = origWriteSync;
      throw e;
    }
    return;
  }

  await runCommand(command, args, cwd, raw);
}

/**
 * Extract a field from an object using dot-notation and bracket syntax.
 * Supports: 'field', 'parent.child', 'arr[-1]', 'arr[0]'
 */
function extractField(obj, fieldPath) {
  const parts = fieldPath.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    const bracketMatch = part.match(/^(.+?)\[(-?\d+)]$/);
    if (bracketMatch) {
      const key = bracketMatch[1];
      const index = parseInt(bracketMatch[2], 10);
      current = current[key];
      if (!Array.isArray(current)) return undefined;
      current = index < 0 ? current[current.length + index] : current[index];
    } else {
      current = current[part];
    }
  }
  return current;
}

async function runCommand(command, args, cwd, raw) {
  switch (command) {
    case 'state': {
      const subcommand = args[1];
      if (subcommand === 'json') {
        state.cmdStateJson(cwd, raw);
      } else if (subcommand === 'update') {
        state.cmdStateUpdate(cwd, args[2], args[3]);
      } else if (subcommand === 'get') {
        state.cmdStateGet(cwd, args[2], raw);
      } else if (subcommand === 'patch') {
        const patches = {};
        for (let i = 2; i < args.length; i += 2) {
          const key = args[i].replace(/^--/, '');
          const value = args[i + 1];
          if (key && value !== undefined) {
            patches[key] = value;
          }
        }
        state.cmdStatePatch(cwd, patches, raw);
      } else if (subcommand === 'advance-plan') {
        state.cmdStateAdvancePlan(cwd, raw);
      } else if (subcommand === 'record-metric') {
        const { phase: p, plan, duration, tasks, files } = parseNamedArgs(args, ['phase', 'plan', 'duration', 'tasks', 'files']);
        state.cmdStateRecordMetric(cwd, { phase: p, plan, duration, tasks, files }, raw);
      } else if (subcommand === 'update-progress') {
        state.cmdStateUpdateProgress(cwd, raw);
      } else if (subcommand === 'add-decision') {
        const { phase: p, summary, 'summary-file': summary_file, rationale, 'rationale-file': rationale_file } = parseNamedArgs(args, ['phase', 'summary', 'summary-file', 'rationale', 'rationale-file']);
        state.cmdStateAddDecision(cwd, { phase: p, summary, summary_file, rationale: rationale || '', rationale_file }, raw);
      } else if (subcommand === 'add-blocker') {
        const { text, 'text-file': text_file } = parseNamedArgs(args, ['text', 'text-file']);
        state.cmdStateAddBlocker(cwd, { text, text_file }, raw);
      } else if (subcommand === 'resolve-blocker') {
        state.cmdStateResolveBlocker(cwd, parseNamedArgs(args, ['text']).text, raw);
      } else if (subcommand === 'record-session') {
        const { 'stopped-at': stopped_at, 'resume-file': resume_file } = parseNamedArgs(args, ['stopped-at', 'resume-file']);
        state.cmdStateRecordSession(cwd, { stopped_at, resume_file: resume_file || 'None' }, raw);
      } else if (subcommand === 'begin-phase') {
        const { phase: p, name, plans } = parseNamedArgs(args, ['phase', 'name', 'plans']);
        state.cmdStateBeginPhase(cwd, p, name, plans !== null ? parseInt(plans, 10) : null, raw);
      } else if (subcommand === 'signal-waiting') {
        const { type, question, options, phase: p } = parseNamedArgs(args, ['type', 'question', 'options', 'phase']);
        state.cmdSignalWaiting(cwd, type, question, options, p, raw);
      } else if (subcommand === 'signal-resume') {
        state.cmdSignalResume(cwd, raw);
      } else {
        state.cmdStateLoad(cwd, raw);
      }
      break;
    }

    case 'resolve-model': {
      commands.cmdResolveModel(cwd, args[1], raw);
      break;
    }

    case 'find-phase': {
      phase.cmdFindPhase(cwd, args[1], raw);
      break;
    }

    case 'commit': {
      const amend = args.includes('--amend');
      const noVerify = args.includes('--no-verify');
      const filesIndex = args.indexOf('--files');
      // Collect all positional args between command name and first flag,
      // then join them — handles both quoted ("multi word msg") and
      // unquoted (multi word msg) invocations from different shells
      const endIndex = filesIndex !== -1 ? filesIndex : args.length;
      const messageArgs = args.slice(1, endIndex).filter(a => !a.startsWith('--'));
      const message = messageArgs.join(' ') || undefined;
      const files = filesIndex !== -1 ? args.slice(filesIndex + 1).filter(a => !a.startsWith('--')) : [];
      commands.cmdCommit(cwd, message, files, raw, amend, noVerify);
      break;
    }

    case 'commit-to-subrepo': {
      const message = args[1];
      const filesIndex = args.indexOf('--files');
      const files = filesIndex !== -1 ? args.slice(filesIndex + 1).filter(a => !a.startsWith('--')) : [];
      commands.cmdCommitToSubrepo(cwd, message, files, raw);
      break;
    }

    case 'verify-summary': {
      const summaryPath = args[1];
      const countIndex = args.indexOf('--check-count');
      const checkCount = countIndex !== -1 ? parseInt(args[countIndex + 1], 10) : 2;
      verify.cmdVerifySummary(cwd, summaryPath, checkCount, raw);
      break;
    }

    case 'template': {
      const subcommand = args[1];
      if (subcommand === 'select') {
        template.cmdTemplateSelect(cwd, args[2], raw);
      } else if (subcommand === 'fill') {
        const templateType = args[2];
        const { phase, plan, name, type, wave, fields: fieldsRaw } = parseNamedArgs(args, ['phase', 'plan', 'name', 'type', 'wave', 'fields']);
        let fields = {};
        if (fieldsRaw) {
          const { safeJsonParse } = require('./lib/security.cjs');
          const result = safeJsonParse(fieldsRaw, { label: '--fields' });
          if (!result.ok) error(result.error);
          fields = result.value;
        }
        template.cmdTemplateFill(cwd, templateType, {
          phase, plan, name, fields,
          type: type || 'execute',
          wave: wave || '1',
        }, raw);
      } else {
        error('알 수 없는 template 하위 명령입니다. 사용 가능: select, fill');
      }
      break;
    }

    case 'frontmatter': {
      const subcommand = args[1];
      const file = args[2];
      if (subcommand === 'get') {
        frontmatter.cmdFrontmatterGet(cwd, file, parseNamedArgs(args, ['field']).field, raw);
      } else if (subcommand === 'set') {
        const { field, value } = parseNamedArgs(args, ['field', 'value']);
        frontmatter.cmdFrontmatterSet(cwd, file, field, value !== null ? value : undefined, raw);
      } else if (subcommand === 'merge') {
        frontmatter.cmdFrontmatterMerge(cwd, file, parseNamedArgs(args, ['data']).data, raw);
      } else if (subcommand === 'validate') {
        frontmatter.cmdFrontmatterValidate(cwd, file, parseNamedArgs(args, ['schema']).schema, raw);
      } else {
        error('알 수 없는 frontmatter 하위 명령입니다. 사용 가능: get, set, merge, validate');
      }
      break;
    }

    case 'verify': {
      const subcommand = args[1];
      if (subcommand === 'plan-structure') {
        verify.cmdVerifyPlanStructure(cwd, args[2], raw);
      } else if (subcommand === 'phase-completeness') {
        verify.cmdVerifyPhaseCompleteness(cwd, args[2], raw);
      } else if (subcommand === 'references') {
        verify.cmdVerifyReferences(cwd, args[2], raw);
      } else if (subcommand === 'commits') {
        verify.cmdVerifyCommits(cwd, args.slice(2), raw);
      } else if (subcommand === 'artifacts') {
        verify.cmdVerifyArtifacts(cwd, args[2], raw);
      } else if (subcommand === 'key-links') {
        verify.cmdVerifyKeyLinks(cwd, args[2], raw);
      } else {
        error('알 수 없는 verify 하위 명령입니다. 사용 가능: plan-structure, phase-completeness, references, commits, artifacts, key-links');
      }
      break;
    }

    case 'generate-slug': {
      commands.cmdGenerateSlug(args[1], raw);
      break;
    }

    case 'current-timestamp': {
      commands.cmdCurrentTimestamp(args[1] || 'full', raw);
      break;
    }

    case 'list-todos': {
      commands.cmdListTodos(cwd, args[1], raw);
      break;
    }

    case 'verify-path-exists': {
      commands.cmdVerifyPathExists(cwd, args[1], raw);
      break;
    }

    case 'config-ensure-section': {
      config.cmdConfigEnsureSection(cwd, raw);
      break;
    }

    case 'config-set': {
      config.cmdConfigSet(cwd, args[1], args[2], raw);
      break;
    }

    case "config-set-model-profile": {
      config.cmdConfigSetModelProfile(cwd, args[1], raw);
      break;
    }

    case 'config-get': {
      config.cmdConfigGet(cwd, args[1], raw);
      break;
    }

    case 'config-new-project': {
      config.cmdConfigNewProject(cwd, args[1], raw);
      break;
    }

    case 'history-digest': {
      commands.cmdHistoryDigest(cwd, raw);
      break;
    }

    case 'phases': {
      const subcommand = args[1];
      if (subcommand === 'list') {
        const typeIndex = args.indexOf('--type');
        const phaseIndex = args.indexOf('--phase');
        const options = {
          type: typeIndex !== -1 ? args[typeIndex + 1] : null,
          phase: phaseIndex !== -1 ? args[phaseIndex + 1] : null,
          includeArchived: args.includes('--include-archived'),
        };
        phase.cmdPhasesList(cwd, options, raw);
      } else {
        error('알 수 없는 phases 하위 명령입니다. 사용 가능: list');
      }
      break;
    }

    case 'roadmap': {
      const subcommand = args[1];
      if (subcommand === 'get-phase') {
        roadmap.cmdRoadmapGetPhase(cwd, args[2], raw);
      } else if (subcommand === 'analyze') {
        roadmap.cmdRoadmapAnalyze(cwd, raw);
      } else if (subcommand === 'update-plan-progress') {
        roadmap.cmdRoadmapUpdatePlanProgress(cwd, args[2], raw);
      } else {
        error('알 수 없는 roadmap 하위 명령입니다. 사용 가능: get-phase, analyze, update-plan-progress');
      }
      break;
    }

    case 'requirements': {
      const subcommand = args[1];
      if (subcommand === 'mark-complete') {
        milestone.cmdRequirementsMarkComplete(cwd, args.slice(2), raw);
      } else {
        error('알 수 없는 requirements 하위 명령입니다. 사용 가능: mark-complete');
      }
      break;
    }

    case 'phase': {
      const subcommand = args[1];
      if (subcommand === 'next-decimal') {
        phase.cmdPhaseNextDecimal(cwd, args[2], raw);
      } else if (subcommand === 'add') {
        const idIdx = args.indexOf('--id');
        let customId = null;
        const descArgs = [];
        for (let i = 2; i < args.length; i++) {
          if (args[i] === '--id' && i + 1 < args.length) {
            customId = args[i + 1];
            i++; // skip value
          } else {
            descArgs.push(args[i]);
          }
        }
        phase.cmdPhaseAdd(cwd, descArgs.join(' '), raw, customId);
      } else if (subcommand === 'insert') {
        phase.cmdPhaseInsert(cwd, args[2], args.slice(3).join(' '), raw);
      } else if (subcommand === 'remove') {
        const forceFlag = args.includes('--force');
        phase.cmdPhaseRemove(cwd, args[2], { force: forceFlag }, raw);
      } else if (subcommand === 'complete') {
        phase.cmdPhaseComplete(cwd, args[2], raw);
      } else {
        error('알 수 없는 phase 하위 명령입니다. 사용 가능: next-decimal, add, insert, remove, complete');
      }
      break;
    }

    case 'milestone': {
      const subcommand = args[1];
      if (subcommand === 'complete') {
        const milestoneName = parseMultiwordArg(args, 'name');
        const archivePhases = args.includes('--archive-phases');
        milestone.cmdMilestoneComplete(cwd, args[2], { name: milestoneName, archivePhases }, raw);
      } else {
        error('알 수 없는 milestone 하위 명령입니다. 사용 가능: complete');
      }
      break;
    }

    case 'validate': {
      const subcommand = args[1];
      if (subcommand === 'consistency') {
        verify.cmdValidateConsistency(cwd, raw);
      } else if (subcommand === 'health') {
        const repairFlag = args.includes('--repair');
        verify.cmdValidateHealth(cwd, { repair: repairFlag }, raw);
      } else {
        error('알 수 없는 validate 하위 명령입니다. 사용 가능: consistency, health');
      }
      break;
    }

    case 'progress': {
      const subcommand = args[1] || 'json';
      commands.cmdProgressRender(cwd, subcommand, raw);
      break;
    }

    case 'audit-uat': {
      const uat = require('./lib/uat.cjs');
      uat.cmdAuditUat(cwd, raw);
      break;
    }

    case 'stats': {
      const subcommand = args[1] || 'json';
      commands.cmdStats(cwd, subcommand, raw);
      break;
    }

    case 'todo': {
      const subcommand = args[1];
      if (subcommand === 'complete') {
        commands.cmdTodoComplete(cwd, args[2], raw);
      } else if (subcommand === 'match-phase') {
        commands.cmdTodoMatchPhase(cwd, args[2], raw);
      } else {
        error('알 수 없는 todo 하위 명령입니다. 사용 가능: complete, match-phase');
      }
      break;
    }

    case 'scaffold': {
      const scaffoldType = args[1];
      const scaffoldOptions = {
        phase: parseNamedArgs(args, ['phase']).phase,
        name: parseMultiwordArg(args, 'name'),
      };
      commands.cmdScaffold(cwd, scaffoldType, scaffoldOptions, raw);
      break;
    }

    case 'init': {
      const workflow = args[1];
      switch (workflow) {
        case 'execute-phase':
          init.cmdInitExecutePhase(cwd, args[2], raw);
          break;
        case 'plan-phase':
          init.cmdInitPlanPhase(cwd, args[2], raw);
          break;
        case 'new-project':
          init.cmdInitNewProject(cwd, raw);
          break;
        case 'new-milestone':
          init.cmdInitNewMilestone(cwd, raw);
          break;
        case 'quick':
          init.cmdInitQuick(cwd, args.slice(2).join(' '), raw);
          break;
        case 'resume':
          init.cmdInitResume(cwd, raw);
          break;
        case 'verify-work':
          init.cmdInitVerifyWork(cwd, args[2], raw);
          break;
        case 'phase-op':
          init.cmdInitPhaseOp(cwd, args[2], raw);
          break;
        case 'todos':
          init.cmdInitTodos(cwd, args[2], raw);
          break;
        case 'milestone-op':
          init.cmdInitMilestoneOp(cwd, raw);
          break;
        case 'map-codebase':
          init.cmdInitMapCodebase(cwd, raw);
          break;
        case 'progress':
          init.cmdInitProgress(cwd, raw);
          break;
        case 'manager':
          init.cmdInitManager(cwd, raw);
          break;
        case 'new-workspace':
          init.cmdInitNewWorkspace(cwd, raw);
          break;
        case 'list-workspaces':
          init.cmdInitListWorkspaces(cwd, raw);
          break;
        case 'remove-workspace':
          init.cmdInitRemoveWorkspace(cwd, args[2], raw);
          break;
        default:
          error(`알 수 없는 init 워크플로입니다: ${workflow}\n사용 가능: execute-phase, plan-phase, new-project, new-milestone, quick, resume, verify-work, phase-op, todos, milestone-op, map-codebase, progress, manager, new-workspace, list-workspaces, remove-workspace`);
      }
      break;
    }

    case 'phase-plan-index': {
      phase.cmdPhasePlanIndex(cwd, args[1], raw);
      break;
    }

    case 'state-snapshot': {
      state.cmdStateSnapshot(cwd, raw);
      break;
    }

    case 'summary-extract': {
      const summaryPath = args[1];
      const fieldsIndex = args.indexOf('--fields');
      const fields = fieldsIndex !== -1 ? args[fieldsIndex + 1].split(',') : null;
      commands.cmdSummaryExtract(cwd, summaryPath, fields, raw);
      break;
    }

    case 'websearch': {
      const query = args[1];
      const limitIdx = args.indexOf('--limit');
      const freshnessIdx = args.indexOf('--freshness');
      await commands.cmdWebsearch(query, {
        limit: limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : 10,
        freshness: freshnessIdx !== -1 ? args[freshnessIdx + 1] : null,
      }, raw);
      break;
    }

    // ─── Profiling Pipeline ────────────────────────────────────────────────

    case 'scan-sessions': {
      const pathIdx = args.indexOf('--path');
      const sessionsPath = pathIdx !== -1 ? args[pathIdx + 1] : null;
      const verboseFlag = args.includes('--verbose');
      const jsonFlag = args.includes('--json');
      await profilePipeline.cmdScanSessions(sessionsPath, { verbose: verboseFlag, json: jsonFlag }, raw);
      break;
    }

    case 'extract-messages': {
      const sessionIdx = args.indexOf('--session');
      const sessionId = sessionIdx !== -1 ? args[sessionIdx + 1] : null;
      const limitIdx = args.indexOf('--limit');
      const limit = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : null;
      const pathIdx = args.indexOf('--path');
      const sessionsPath = pathIdx !== -1 ? args[pathIdx + 1] : null;
      const projectArg = args[1];
      if (!projectArg || projectArg.startsWith('--')) {
        error('Usage: gsd-tools extract-messages <project> [--session <id>] [--limit N] [--path <dir>]\nRun scan-sessions first to see available projects.');
      }
      await profilePipeline.cmdExtractMessages(projectArg, { sessionId, limit }, raw, sessionsPath);
      break;
    }

    case 'profile-sample': {
      const pathIdx = args.indexOf('--path');
      const sessionsPath = pathIdx !== -1 ? args[pathIdx + 1] : null;
      const limitIdx = args.indexOf('--limit');
      const limit = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : 150;
      const maxPerIdx = args.indexOf('--max-per-project');
      const maxPerProject = maxPerIdx !== -1 ? parseInt(args[maxPerIdx + 1], 10) : null;
      const maxCharsIdx = args.indexOf('--max-chars');
      const maxChars = maxCharsIdx !== -1 ? parseInt(args[maxCharsIdx + 1], 10) : 500;
      await profilePipeline.cmdProfileSample(sessionsPath, { limit, maxPerProject, maxChars }, raw);
      break;
    }

    // ─── Profile Output ──────────────────────────────────────────────────

    case 'write-profile': {
      const inputIdx = args.indexOf('--input');
      const inputPath = inputIdx !== -1 ? args[inputIdx + 1] : null;
      if (!inputPath) error('--input <analysis-json-path> is required');
      const outputIdx = args.indexOf('--output');
      const outputPath = outputIdx !== -1 ? args[outputIdx + 1] : null;
      profileOutput.cmdWriteProfile(cwd, { input: inputPath, output: outputPath }, raw);
      break;
    }

    case 'profile-questionnaire': {
      const answersIdx = args.indexOf('--answers');
      const answers = answersIdx !== -1 ? args[answersIdx + 1] : null;
      profileOutput.cmdProfileQuestionnaire({ answers }, raw);
      break;
    }

    case 'generate-dev-preferences': {
      const analysisIdx = args.indexOf('--analysis');
      const analysisPath = analysisIdx !== -1 ? args[analysisIdx + 1] : null;
      const outputIdx = args.indexOf('--output');
      const outputPath = outputIdx !== -1 ? args[outputIdx + 1] : null;
      const stackIdx = args.indexOf('--stack');
      const stack = stackIdx !== -1 ? args[stackIdx + 1] : null;
      profileOutput.cmdGenerateDevPreferences(cwd, { analysis: analysisPath, output: outputPath, stack }, raw);
      break;
    }

    case 'generate-claude-profile': {
      const analysisIdx = args.indexOf('--analysis');
      const analysisPath = analysisIdx !== -1 ? args[analysisIdx + 1] : null;
      const outputIdx = args.indexOf('--output');
      const outputPath = outputIdx !== -1 ? args[outputIdx + 1] : null;
      const globalFlag = args.includes('--global');
      profileOutput.cmdGenerateClaudeProfile(cwd, { analysis: analysisPath, output: outputPath, global: globalFlag }, raw);
      break;
    }

    case 'generate-claude-md': {
      const outputIdx = args.indexOf('--output');
      const outputPath = outputIdx !== -1 ? args[outputIdx + 1] : null;
      const autoFlag = args.includes('--auto');
      const forceFlag = args.includes('--force');
      profileOutput.cmdGenerateClaudeMd(cwd, { output: outputPath, auto: autoFlag, force: forceFlag }, raw);
      break;
    }

    case 'workstream': {
      const subcommand = args[1];
      if (subcommand === 'create') {
        const migrateNameIdx = args.indexOf('--migrate-name');
        const noMigrate = args.includes('--no-migrate');
        workstream.cmdWorkstreamCreate(cwd, args[2], {
          migrate: !noMigrate,
          migrateName: migrateNameIdx !== -1 ? args[migrateNameIdx + 1] : null,
        }, raw);
      } else if (subcommand === 'list') {
        workstream.cmdWorkstreamList(cwd, raw);
      } else if (subcommand === 'status') {
        workstream.cmdWorkstreamStatus(cwd, args[2], raw);
      } else if (subcommand === 'complete') {
        workstream.cmdWorkstreamComplete(cwd, args[2], {}, raw);
      } else if (subcommand === 'set') {
        workstream.cmdWorkstreamSet(cwd, args[2], raw);
      } else if (subcommand === 'get') {
        workstream.cmdWorkstreamGet(cwd, raw);
      } else if (subcommand === 'progress') {
        workstream.cmdWorkstreamProgress(cwd, raw);
      } else {
        error('Unknown workstream subcommand. Available: create, list, status, complete, set, get, progress');
      }
      break;
    }

    default:
      error(`알 수 없는 명령입니다: ${command}`);
  }
}

main();
