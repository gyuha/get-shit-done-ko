/**
 * Config — planning config CRUD 작업
 */

const fs = require('fs');
const path = require('path');
const { output, error, planningRoot } = require('./core.cjs');
const {
  VALID_PROFILES,
  getAgentToModelMapForProfile,
  formatAgentToModelMapAsTable,
} = require('./model-profiles.cjs');

const VALID_CONFIG_KEYS = new Set([
  'mode', 'granularity', 'parallelization', 'commit_docs', 'model_profile',
  'search_gitignored', 'brave_search', 'firecrawl', 'exa_search',
  'workflow.research', 'workflow.plan_check', 'workflow.verifier',
  'workflow.nyquist_validation', 'workflow.ui_phase', 'workflow.ui_safety_gate',
  'workflow.auto_advance', 'workflow.node_repair', 'workflow.node_repair_budget',
  'workflow.text_mode',
  'workflow.research_before_questions',
  'workflow.discuss_mode',
  'workflow.skip_discuss',
  'workflow._auto_chain_active',
  'git.branching_strategy', 'git.phase_branch_template', 'git.milestone_branch_template', 'git.quick_branch_template',
  'planning.commit_docs', 'planning.search_gitignored',
  'hooks.context_warnings',
]);

const CONFIG_KEY_SUGGESTIONS = {
  'workflow.nyquist_validation_enabled': 'workflow.nyquist_validation',
  'agents.nyquist_validation_enabled': 'workflow.nyquist_validation',
  'nyquist.validation_enabled': 'workflow.nyquist_validation',
  'hooks.research_questions': 'workflow.research_before_questions',
  'workflow.research_questions': 'workflow.research_before_questions',
};

function validateKnownConfigKeyPath(keyPath) {
  const suggested = CONFIG_KEY_SUGGESTIONS[keyPath];
  if (suggested) {
    error(`알 수 없는 config key입니다: ${keyPath}. ${suggested}를 의미했나요?`);
  }
}

/**
 * 새 프로젝트용 완전한 config 객체를 구성한다.
 *
 * Merges (increasing priority):
 *   1. Hardcoded defaults — every key that loadConfig() resolves, plus mode/granularity
 *   2. User-level defaults from ~/.gsd/defaults.json (if present)
 *   3. userChoices — the settings the user explicitly selected during /gsd:new-project
 *
 * Uses the canonical `git` namespace for branching keys (consistent with VALID_CONFIG_KEYS
 * and the settings workflow). loadConfig() handles both flat and nested formats, so this
 * is backward-compatible with existing projects that have flat keys.
 *
 * Returns a plain object — does NOT write any files.
 */
function buildNewProjectConfig(userChoices) {
  const choices = userChoices || {};
  const homedir = require('os').homedir();

  // API 키 사용 가능 여부를 감지한다.
  const braveKeyFile = path.join(homedir, '.gsd', 'brave_api_key');
  const hasBraveSearch = !!(process.env.BRAVE_API_KEY || fs.existsSync(braveKeyFile));
  const firecrawlKeyFile = path.join(homedir, '.gsd', 'firecrawl_api_key');
  const hasFirecrawl = !!(process.env.FIRECRAWL_API_KEY || fs.existsSync(firecrawlKeyFile));
  const exaKeyFile = path.join(homedir, '.gsd', 'exa_api_key');
  const hasExaSearch = !!(process.env.EXA_API_KEY || fs.existsSync(exaKeyFile));

  // ~/.gsd/defaults.json이 있으면 사용자 기본값을 불러온다.
  const globalDefaultsPath = path.join(homedir, '.gsd', 'defaults.json');
  let userDefaults = {};
  try {
    if (fs.existsSync(globalDefaultsPath)) {
      userDefaults = JSON.parse(fs.readFileSync(globalDefaultsPath, 'utf-8'));
      // 더 이상 쓰지 않는 "depth" 키를 "granularity"로 마이그레이션한다.
      if ('depth' in userDefaults && !('granularity' in userDefaults)) {
        const depthToGranularity = { quick: 'coarse', standard: 'standard', comprehensive: 'fine' };
        userDefaults.granularity = depthToGranularity[userDefaults.depth] || userDefaults.depth;
        delete userDefaults.depth;
        try {
          fs.writeFileSync(globalDefaultsPath, JSON.stringify(userDefaults, null, 2), 'utf-8');
        } catch { /* intentionally empty */ }
      }
    }
  } catch {
    // 잘못된 전역 defaults는 무시한다.
  }

  const hardcoded = {
    model_profile: 'balanced',
    commit_docs: true,
    parallelization: true,
    search_gitignored: false,
    brave_search: hasBraveSearch,
    firecrawl: hasFirecrawl,
    exa_search: hasExaSearch,
    git: {
      branching_strategy: 'none',
      phase_branch_template: 'gsd/phase-{phase}-{slug}',
      milestone_branch_template: 'gsd/{milestone}-{slug}',
      quick_branch_template: null,
    },
    workflow: {
      research: true,
      plan_check: true,
      verifier: true,
      nyquist_validation: true,
      auto_advance: false,
      node_repair: true,
      node_repair_budget: 2,
      ui_phase: true,
      ui_safety_gate: true,
      text_mode: false,
      research_before_questions: false,
      discuss_mode: 'discuss',
      skip_discuss: false,
    },
    hooks: {
      context_warnings: true,
    },
  };

  // 3단계 merge: hardcoded <- userDefaults <- choices
  return {
    ...hardcoded,
    ...userDefaults,
    ...choices,
    git: {
      ...hardcoded.git,
      ...(userDefaults.git || {}),
      ...(choices.git || {}),
    },
    workflow: {
      ...hardcoded.workflow,
      ...(userDefaults.workflow || {}),
      ...(choices.workflow || {}),
    },
    hooks: {
      ...hardcoded.hooks,
      ...(userDefaults.hooks || {}),
      ...(choices.hooks || {}),
    },
  };
}

/**
 * 명령: 새 프로젝트용 완전한 .planning/config.json을 만든다.
 *
 * Accepts user-chosen settings as a JSON string (the keys the user explicitly
 * configured during /gsd:new-project). All remaining keys are filled from
 * hardcoded defaults and optional ~/.gsd/defaults.json.
 *
 * 멱등적이다. config.json이 이미 있으면 { created: false }를 반환한다.
 */
function cmdConfigNewProject(cwd, choicesJson, raw) {
  const planningBase = planningRoot(cwd);
  const configPath = path.join(planningBase, 'config.json');

  // 멱등성 유지: 기존 config는 덮어쓰지 않는다.
  if (fs.existsSync(configPath)) {
    output({ created: false, reason: 'already_exists' }, raw, 'exists');
    return;
  }

  // 사용자 선택값을 파싱한다.
  let userChoices = {};
  if (choicesJson && choicesJson.trim() !== '') {
    try {
      userChoices = JSON.parse(choicesJson);
    } catch (err) {
      error('config-new-project용 JSON이 올바르지 않습니다: ' + err.message);
    }
  }

  // .planning 디렉터리가 없으면 만든다.
  try {
    if (!fs.existsSync(planningBase)) {
      fs.mkdirSync(planningBase, { recursive: true });
    }
  } catch (err) {
    error('.planning 디렉터리 생성에 실패했습니다: ' + err.message);
  }

  const config = buildNewProjectConfig(userChoices);

  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
    output({ created: true, path: '.planning/config.json' }, raw, 'created');
  } catch (err) {
    error('config.json 쓰기에 실패했습니다: ' + err.message);
  }
}

/**
 * config 파일이 존재하도록 보장한다(필요하면 생성).
 *
 * Does not call `output()`, so can be used as one step in a command without triggering `exit(0)` in
 * the happy path. But note that `error()` will still `exit(1)` out of the process.
 */
function ensureConfigFile(cwd) {
  const planningBase = planningRoot(cwd);
  const configPath = path.join(planningBase, 'config.json');

  // .planning 디렉터리가 없으면 만든다.
  try {
    if (!fs.existsSync(planningBase)) {
      fs.mkdirSync(planningBase, { recursive: true });
    }
  } catch (err) {
    error('.planning 디렉터리 생성에 실패했습니다: ' + err.message);
  }

  // config가 이미 있으면 그대로 반환한다.
  if (fs.existsSync(configPath)) {
    return { created: false, reason: 'already_exists' };
  }

  const config = buildNewProjectConfig({});

  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
    return { created: true, path: '.planning/config.json' };
  } catch (err) {
    error('config.json 생성에 실패했습니다: ' + err.message);
  }
}

/**
 * 명령: config 파일이 존재하도록 보장한다(필요하면 생성).
 *
 * Note that this exits the process (via `output()`) even in the happy path; use
 * `ensureConfigFile()` directly if you need to avoid this.
 */
function cmdConfigEnsureSection(cwd, raw) {
  const ensureConfigFileResult = ensureConfigFile(cwd);
  if (ensureConfigFileResult.created) {
    output(ensureConfigFileResult, raw, 'created');
  } else {
    output(ensureConfigFileResult, raw, 'exists');
  }
}

/**
 * config 파일 값 하나를 설정한다. dot 표기("workflow.research")의 중첩 키를 지원한다.
 *
 * Does not call `output()`, so can be used as one step in a command without triggering `exit(0)` in
 * the happy path. But note that `error()` will still `exit(1)` out of the process.
 */
function setConfigValue(cwd, keyPath, parsedValue) {
  const configPath = path.join(planningRoot(cwd), 'config.json');

  // 기존 config를 읽거나, 없으면 빈 객체로 시작한다.
  let config = {};
  try {
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }
  } catch (err) {
    error('config.json 읽기에 실패했습니다: ' + err.message);
  }

  // dot 표기로 중첩 값을 설정한다(예: "workflow.research").
  const keys = keyPath.split('.');
  let current = config;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (current[key] === undefined || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  const previousValue = current[keys[keys.length - 1]]; // 덮어쓰기 전에 이전 값을 보존한다.
  current[keys[keys.length - 1]] = parsedValue;

  // 파일에 다시 쓴다.
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
    return { updated: true, key: keyPath, value: parsedValue, previousValue };
  } catch (err) {
    error('config.json 쓰기에 실패했습니다: ' + err.message);
  }
}

/**
 * 명령: config 파일 값 하나를 설정한다. dot 표기("workflow.research")를 지원한다.
 *
 * Note that this exits the process (via `output()`) even in the happy path; use `setConfigValue()`
 * directly if you need to avoid this.
 */
function cmdConfigSet(cwd, keyPath, value, raw) {
  if (!keyPath) {
    error('사용법: config-set <key.path> <value>');
  }

  validateKnownConfigKeyPath(keyPath);

  if (!VALID_CONFIG_KEYS.has(keyPath)) {
    error(`알 수 없는 config key입니다: "${keyPath}". 사용 가능 키: ${[...VALID_CONFIG_KEYS].sort().join(', ')}`);
  }

  // 값 파싱(불리언/숫자 처리)
  let parsedValue = value;
  if (value === 'true') parsedValue = true;
  else if (value === 'false') parsedValue = false;
  else if (!isNaN(value) && value !== '') parsedValue = Number(value);

  const setConfigValueResult = setConfigValue(cwd, keyPath, parsedValue);
  output(setConfigValueResult, raw, `${keyPath}=${parsedValue}`);
}

function cmdConfigGet(cwd, keyPath, raw) {
  const configPath = path.join(planningRoot(cwd), 'config.json');

  if (!keyPath) {
    error('사용법: config-get <key.path>');
  }

  let config = {};
  try {
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } else {
      error('config.json을 찾을 수 없습니다: ' + configPath);
    }
  } catch (err) {
    if (err.message.startsWith('No config.json')) throw err;
    error('config.json 읽기에 실패했습니다: ' + err.message);
  }

  // dot 표기 경로를 따라간다(예: "workflow.auto_advance").
  const keys = keyPath.split('.');
  let current = config;
  for (const key of keys) {
    if (current === undefined || current === null || typeof current !== 'object') {
      error(`키를 찾을 수 없습니다: ${keyPath}`);
    }
    current = current[key];
  }

  if (current === undefined) {
    error(`키를 찾을 수 없습니다: ${keyPath}`);
  }

  output(current, raw, String(current));
}

/**
 * 명령: config 파일의 model profile을 설정한다.
 *
 * Note that this exits the process (via `output()`) even in the happy path.
 */
function cmdConfigSetModelProfile(cwd, profile, raw) {
  if (!profile) {
    error(`사용법: config-set-model-profile <${VALID_PROFILES.join('|')}>`);
  }

  const normalizedProfile = profile.toLowerCase().trim();
  if (!VALID_PROFILES.includes(normalizedProfile)) {
    error(`올바르지 않은 profile입니다: '${profile}'. 사용 가능 profile: ${VALID_PROFILES.join(', ')}`);
  }

  // config가 없으면 먼저 생성한다.
  ensureConfigFile(cwd);

  // config에 model profile을 기록한다.
  const { previousValue } = setConfigValue(cwd, 'model_profile', normalizedProfile, raw);
  const previousProfile = previousValue || 'balanced';

  // 반환용 결과 객체를 구성한다.
  const agentToModelMap = getAgentToModelMapForProfile(normalizedProfile);
  const result = {
    updated: true,
    profile: normalizedProfile,
    previousProfile,
    agentToModelMap,
  };
  const rawValue = getCmdConfigSetModelProfileResultMessage(
    normalizedProfile,
    previousProfile,
    agentToModelMap
  );
  output(result, raw, rawValue);
}

/**
 * Returns the message to display for the result of the `config-set-model-profile` command when
 * displaying raw output.
 */
function getCmdConfigSetModelProfileResultMessage(
  normalizedProfile,
  previousProfile,
  agentToModelMap
) {
  const agentToModelTable = formatAgentToModelMapAsTable(agentToModelMap);
  const didChange = previousProfile !== normalizedProfile;
  const paragraphs = didChange
    ? [
        `✓ Model profile set to: ${normalizedProfile} (was: ${previousProfile})`,
        'Agents will now use:',
        agentToModelTable,
        'Next spawned agents will use the new profile.',
      ]
    : [
        `✓ Model profile is already set to: ${normalizedProfile}`,
        'Agents are using:',
        agentToModelTable,
      ];
  return paragraphs.join('\n\n');
}

module.exports = {
  cmdConfigEnsureSection,
  cmdConfigSet,
  cmdConfigGet,
  cmdConfigSetModelProfile,
  cmdConfigNewProject,
};
