# 초기화 시 새 프로젝트 구성을 구체화합니다.

> **에이전트 작업자의 경우:** 필수 하위 기술: 초능력:하위 에이전트 중심 개발(권장) 또는 초능력:실행 계획을 사용하여 작업별로 이 계획을 구현합니다. 단계에서는 추적을 위해 체크박스(`- [ ]`) 구문을 사용합니다.

**목표:** `/gsd:new-project`이 `.planning/config.json`을 생성하면 파일에는 사용자가 선택한 6개의 키뿐만 아니라 모든 유효한 기본값이 포함되므로 개발자는 소스 코드를 읽지 않고도 모든 설정을 볼 수 있습니다.

**아키텍처:** 새 프로젝트의 전체 구성에 대한 단일 정보 소스로 `config.cjs`에 단일 JS 함수 `buildNewProjectConfig(cwd, userChoices)`을 추가합니다. CLI 명령 `config-new-project`로 노출합니다. 부분 JSON 인라인을 작성하는 대신 이 명령을 호출하도록 `new-project.md` 워크플로를 업데이트하세요.

**기술 스택:** Node.js/CommonJS, 기존 gsd-tools CLI, 테스트용 `node:test`.

---

## 배경: 오늘날 존재하는 것

`new-project.md` 5단계에서는 다음 부분 구성을 작성합니다(AI가 템플릿을 채움).
```json
{
  "mode": "...", "granularity": "...", "parallelization": "...",
  "commit_docs": "...", "model_profile": "...",
  "workflow": { "research", "plan_check", "verifier", "nyquist_validation" }
}
```
누락된 키는 런타임 시 `loadConfig()`에 의해 자동으로 해결됩니다.

- `search_gitignored: false`
- `brave_search: false`(또는 환경에서 감지된 `true`)
- `git.branching_strategy: "none"`
- `git.phase_branch_template: "gsd/phase-{phase}-{slug}"`
- `git.milestone_branch_template: "gsd/{milestone}-{slug}"`

처음부터 존재해야 하는 전체 구성:
```json
{
  "mode": "yolo|interactive",
  "granularity": "coarse|standard|fine",
  "model_profile": "balanced",
  "commit_docs": true,
  "parallelization": true,
  "search_gitignored": false,
  "brave_search": false,
  "git": {
    "branching_strategy": "none",
    "phase_branch_template": "gsd/phase-{phase}-{slug}",
    "milestone_branch_template": "gsd/{milestone}-{slug}"
  },
  "workflow": {
    "research": true,
    "plan_check": true,
    "verifier": true,
    "nyquist_validation": true
  }
}
```
---

## 파일 맵

| 파일 | 액션 | 목적 |
|------|---------|---------|
| `get-shit-done/bin/lib/config.cjs` | 수정 | `buildNewProjectConfig()` + `cmdConfigNewProject()` 추가 |
| `get-shit-done/bin/gsd-tools.cjs` | 수정 | `config-new-project` 케이스 등록 + 사용 문자열 업데이트 |
| `get-shit-done/workflows/new-project.md` | 수정 | 2a + 5단계: 인라인 JSON 쓰기를 CLI 호출로 바꾸기 |
| `tests/config.test.cjs` | 수정 | `config-new-project` 테스트 스위트 추가 |

---

## 작업 1: config.cjs에 `buildNewProjectConfig` 및 `cmdConfigNewProject` 추가

**파일:**

- 수정: `get-shit-done/bin/lib/config.cjs`

- [ ] **1.1단계: 실패한 테스트를 먼저 작성**

`tests/config.test.cjs`에 추가합니다(`config-get` 제품군 뒤, `module.exports` 앞):
```js
// ─── config-new-project ──────────────────────────────────────────────────────

describe('config-new-project command', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = createTempProject();
  });

  afterEach(() => {
    cleanup(tmpDir);
  });

  test('creates full config with all expected top-level and nested keys', () => {
    const choices = JSON.stringify({
      mode: 'interactive',
      granularity: 'standard',
      parallelization: true,
      commit_docs: true,
      model_profile: 'balanced',
      workflow: { research: true, plan_check: true, verifier: true, nyquist_validation: true },
    });
    const result = runGsdTools(['config-new-project', choices], tmpDir);
    assert.ok(result.success, `Command failed: ${result.error}`);

    const config = readConfig(tmpDir);

    // User choices present
    assert.strictEqual(config.mode, 'interactive');
    assert.strictEqual(config.granularity, 'standard');
    assert.strictEqual(config.parallelization, true);
    assert.strictEqual(config.commit_docs, true);
    assert.strictEqual(config.model_profile, 'balanced');

    // Defaults materialized
    assert.strictEqual(typeof config.search_gitignored, 'boolean');
    assert.strictEqual(typeof config.brave_search, 'boolean');

    // git section present with all three keys
    assert.ok(config.git && typeof config.git === 'object', 'git section should exist');
    assert.strictEqual(config.git.branching_strategy, 'none');
    assert.strictEqual(config.git.phase_branch_template, 'gsd/phase-{phase}-{slug}');
    assert.strictEqual(config.git.milestone_branch_template, 'gsd/{milestone}-{slug}');

    // workflow section present with all four keys
    assert.ok(config.workflow && typeof config.workflow === 'object', 'workflow section should exist');
    assert.strictEqual(config.workflow.research, true);
    assert.strictEqual(config.workflow.plan_check, true);
    assert.strictEqual(config.workflow.verifier, true);
    assert.strictEqual(config.workflow.nyquist_validation, true);
  });

  test('user choices override defaults', () => {
    const choices = JSON.stringify({
      mode: 'yolo',
      granularity: 'coarse',
      parallelization: false,
      commit_docs: false,
      model_profile: 'quality',
      workflow: { research: false, plan_check: false, verifier: true, nyquist_validation: false },
    });
    const result = runGsdTools(['config-new-project', choices], tmpDir);
    assert.ok(result.success, `Command failed: ${result.error}`);

    const config = readConfig(tmpDir);
    assert.strictEqual(config.mode, 'yolo');
    assert.strictEqual(config.granularity, 'coarse');
    assert.strictEqual(config.parallelization, false);
    assert.strictEqual(config.commit_docs, false);
    assert.strictEqual(config.model_profile, 'quality');
    assert.strictEqual(config.workflow.research, false);
    assert.strictEqual(config.workflow.plan_check, false);
    assert.strictEqual(config.workflow.verifier, true);
    assert.strictEqual(config.workflow.nyquist_validation, false);
    // Defaults still present for non-chosen keys
    assert.strictEqual(config.git.branching_strategy, 'none');
    assert.strictEqual(typeof config.search_gitignored, 'boolean');
  });

  test('works with empty choices — all defaults materialized', () => {
    const result = runGsdTools(['config-new-project', '{}'], tmpDir);
    assert.ok(result.success, `Command failed: ${result.error}`);

    const config = readConfig(tmpDir);
    assert.strictEqual(config.model_profile, 'balanced');
    assert.strictEqual(config.commit_docs, true);
    assert.strictEqual(config.parallelization, true);
    assert.strictEqual(config.search_gitignored, false);
    assert.ok(config.git && typeof config.git === 'object');
    assert.strictEqual(config.git.branching_strategy, 'none');
    assert.ok(config.workflow && typeof config.workflow === 'object');
    assert.strictEqual(config.workflow.nyquist_validation, true);
  });

  test('is idempotent — returns already_exists if config exists', () => {
    // First call: create
    const choices = JSON.stringify({ mode: 'yolo', granularity: 'fine' });
    const first = runGsdTools(['config-new-project', choices], tmpDir);
    assert.ok(first.success, `First call failed: ${first.error}`);
    const firstOut = JSON.parse(first.output);
    assert.strictEqual(firstOut.created, true);

    // Second call: idempotent
    const second = runGsdTools(['config-new-project', choices], tmpDir);
    assert.ok(second.success, `Second call failed: ${second.error}`);
    const secondOut = JSON.parse(second.output);
    assert.strictEqual(secondOut.created, false);
    assert.strictEqual(secondOut.reason, 'already_exists');

    // Config unchanged
    const config = readConfig(tmpDir);
    assert.strictEqual(config.mode, 'yolo');
    assert.strictEqual(config.granularity, 'fine');
  });

  test('auto_advance in workflow choices is preserved', () => {
    const choices = JSON.stringify({
      mode: 'yolo',
      granularity: 'standard',
      workflow: { research: true, plan_check: true, verifier: true, nyquist_validation: true, auto_advance: true },
    });
    const result = runGsdTools(['config-new-project', choices], tmpDir);
    assert.ok(result.success, `Command failed: ${result.error}`);

    const config = readConfig(tmpDir);
    assert.strictEqual(config.workflow.auto_advance, true);
  });

  test('rejects invalid JSON choices', () => {
    const result = runGsdTools(['config-new-project', '{not-json}'], tmpDir);
    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes('Invalid JSON'), `Expected "Invalid JSON" in: ${result.error}`);
  });

  test('output JSON has created:true on success', () => {
    const choices = JSON.stringify({ mode: 'interactive', granularity: 'standard' });
    const result = runGsdTools(['config-new-project', choices], tmpDir);
    assert.ok(result.success, `Command failed: ${result.error}`);
    const out = JSON.parse(result.output);
    assert.strictEqual(out.created, true);
    assert.strictEqual(out.path, '.planning/config.json');
  });
});
```
- [ ] **1.2단계: 실패한 테스트를 실행하여 실패했는지 확인**
```bash
cd /Users/diego/Dev/get-shit-done
node --test tests/config.test.cjs 2>&1 | grep -E "config-new-project|FAIL|Error"
```
예상: "config-new-project는 유효한 명령이 아닙니다." 또는 이와 유사한 오류로 인해 모든 `config-new-project` 테스트가 실패합니다.

- [ ] **1.3단계: config.cjs에서 `buildNewProjectConfig` 및 `cmdConfigNewProject` 구현**

`get-shit-done/bin/lib/config.cjs`에서 `validateKnownConfigKeyPath` 함수 뒤(약 35번째 줄)와 `ensureConfigFile` 앞에 다음을 추가합니다.
```js
/**
 * Build a fully-materialized config for a new project.
 *
 * Merges (in order of increasing priority):
 *   1. Hardcoded defaults
 *   2. User-level defaults from ~/.gsd/defaults.json (if present)
 *   3. userChoices (the settings the user explicitly selected during new-project)
 *
 * Returns a plain object — does NOT write any files.
 */
function buildNewProjectConfig(cwd, userChoices) {
  const choices = userChoices || {};
  const homedir = require('os').homedir();

  // Detect Brave Search API key availability
  const braveKeyFile = path.join(homedir, '.gsd', 'brave_api_key');
  const hasBraveSearch = !!(process.env.BRAVE_API_KEY || fs.existsSync(braveKeyFile));

  // Load user-level defaults from ~/.gsd/defaults.json if available
  const globalDefaultsPath = path.join(homedir, '.gsd', 'defaults.json');
  let userDefaults = {};
  try {
    if (fs.existsSync(globalDefaultsPath)) {
      userDefaults = JSON.parse(fs.readFileSync(globalDefaultsPath, 'utf-8'));
      // Migrate deprecated "depth" key to "granularity"
      if ('depth' in userDefaults && !('granularity' in userDefaults)) {
        const depthToGranularity = { quick: 'coarse', standard: 'standard', comprehensive: 'fine' };
        userDefaults.granularity = depthToGranularity[userDefaults.depth] || userDefaults.depth;
        delete userDefaults.depth;
        try {
          fs.writeFileSync(globalDefaultsPath, JSON.stringify(userDefaults, null, 2), 'utf-8');
        } catch {}
      }
    }
  } catch {
    // Ignore malformed global defaults
  }

  const hardcoded = {
    model_profile: 'balanced',
    commit_docs: true,
    parallelization: true,
    search_gitignored: false,
    brave_search: hasBraveSearch,
    git: {
      branching_strategy: 'none',
      phase_branch_template: 'gsd/phase-{phase}-{slug}',
      milestone_branch_template: 'gsd/{milestone}-{slug}',
    },
    workflow: {
      research: true,
      plan_check: true,
      verifier: true,
      nyquist_validation: true,
    },
  };

  // Three-level merge: hardcoded <- userDefaults <- choices
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
  };
}

/**
 * Command: create a fully-materialized .planning/config.json for a new project.
 *
 * Accepts user-chosen settings as a JSON string (the keys the user explicitly
 * configured during /gsd:new-project). All remaining keys are filled from
 * hardcoded defaults and optional ~/.gsd/defaults.json.
 *
 * Idempotent: if config.json already exists, returns { created: false }.
 */
function cmdConfigNewProject(cwd, choicesJson, raw) {
  const configPath = path.join(cwd, '.planning', 'config.json');
  const planningDir = path.join(cwd, '.planning');

  // Idempotent: don't overwrite existing config
  if (fs.existsSync(configPath)) {
    output({ created: false, reason: 'already_exists' }, raw, 'exists');
    return;
  }

  // Parse user choices
  let userChoices = {};
  if (choicesJson && choicesJson.trim() !== '') {
    try {
      userChoices = JSON.parse(choicesJson);
    } catch (err) {
      error('Invalid JSON for config-new-project: ' + err.message);
    }
  }

  // Ensure .planning directory exists
  try {
    if (!fs.existsSync(planningDir)) {
      fs.mkdirSync(planningDir, { recursive: true });
    }
  } catch (err) {
    error('Failed to create .planning directory: ' + err.message);
  }

  const config = buildNewProjectConfig(cwd, userChoices);

  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
    output({ created: true, path: '.planning/config.json' }, raw, 'created');
  } catch (err) {
    error('Failed to write config.json: ' + err.message);
  }
}
```
또한 `config.cjs` 하단의 `module.exports`에 `cmdConfigNewProject`을 추가합니다.

- [ ] **1.4단계: 테스트를 실행하여 통과하는지 확인**
```bash
cd /Users/diego/Dev/get-shit-done
node --test tests/config.test.cjs 2>&1 | tail -20
```
예상: 모든 `config-new-project` 테스트가 통과되었습니다. 기존 테스트는 여전히 통과합니다.

- [ ] **1.5단계: 커밋**
```bash
cd /Users/diego/Dev/get-shit-done
git add get-shit-done/bin/lib/config.cjs tests/config.test.cjs
git commit -m "feat: add config-new-project command for full config materialization"
```
---

## 작업 2: gsd-tools.cjs에 `config-new-project` 등록

**파일:**

- 수정: `get-shit-done/bin/gsd-tools.cjs`

- [ ] **2.1단계: gsd-tools.cjs의 스위치에 사례 추가**

`config-get` 케이스 뒤에(라인 401) 다음을 추가합니다.
```js
    case 'config-new-project': {
      config.cmdConfigNewProject(cwd, args[1], raw);
      break;
    }
```
또한 `config-new-project`을 포함하도록 178행의 사용법 문자열을 업데이트합니다.

현재: `...config-ensure-section, init`
신규: `...config-ensure-section, config-new-project, init`

- [ ] **2.2단계: CLI 등록 스모크 테스트**
```bash
cd /Users/diego/Dev/get-shit-done
node get-shit-done/bin/gsd-tools.cjs config-new-project '{"mode":"interactive","granularity":"standard"}' --cwd /tmp/gsd-smoke-$(date +%s)
```
예상: `{"created":true,"path":".planning/config.json"}`(또는 유사)을 출력합니다.

정리: `rm -rf /tmp/gsd-smoke-*`

- [ ] **2.3단계: 전체 테스트 스위트 실행**
```bash
cd /Users/diego/Dev/get-shit-done
node --test tests/config.test.cjs 2>&1 | tail -10
```
예상: 모두 통과.

- [ ] **2.4단계: 커밋**
```bash
cd /Users/diego/Dev/get-shit-done
git add get-shit-done/bin/gsd-tools.cjs
git commit -m "feat: register config-new-project in gsd-tools CLI router"
```
---

## 작업 3: config-new-project를 사용하도록 new-project.md 워크플로 업데이트

**파일:**

- 수정: `get-shit-done/workflows/new-project.md`

이것이 핵심 변화입니다. 두 곳을 업데이트해야 합니다.

- **2a단계**(자동 모드 구성 생성, 168~195행 주변)
- **5단계**(대화형 모드 구성 생성, 470~498행 주변)

- [ ] **3.1단계: 2a단계 업데이트(자동 모드)**

2a단계에서 config.json을 생성하는 블록을 찾습니다.
```markdown
Create `.planning/config.json` with mode set to "yolo":

```JSON
{
  "모드": "욜로",
  "세분성": "[선택됨]",
  ...
}
```

```
인라인 JSON 쓰기 명령을 다음으로 바꿉니다.
```markdown
Create `.planning/config.json` using the CLI (fills in all defaults automatically):

```
강타
mkdir -p .planning
노드 "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" config-new-project "$(cat <<'CHOICES'
{
  "모드": "욜로",
  "granularity": "[선택됨: 거친|표준|세밀함]",
  "병렬화": [true|false],
  "commit_docs": [참|거짓],
  "model_profile": "[선택됨: 품질|균형|예산|상속]",
  "워크플로": {
    "연구": [참|거짓],
    "plan_check": [참|거짓],
    "검증기": [true|false],
    "nyquist_validation": [true|false],
    "auto_advance": 사실
  }
}
선택
)"
```

The command merges your selections with all runtime defaults (`search_gitignored`, `brave_search`, `git` section), producing a fully-materialized config.

```
- [ ] **3.2단계: 업데이트 5단계(대화형 모드)**

5단계에서 config.json을 생성하는 블록을 찾습니다.
```markdown
Create `.planning/config.json` with all settings:

```JSON
{
  "mode": "욜로|대화형",
  ...
}
```

```
다음으로 교체:
```markdown
Create `.planning/config.json` using the CLI (fills in all defaults automatically):

```
강타
mkdir -p .planning
노드 "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" config-new-project "$(cat <<'CHOICES'
{
  "mode": "[선택됨: 욜로|대화형]",
  "granularity": "[선택됨: 거친|표준|세밀함]",
  "병렬화": [true|false],
  "commit_docs": [참|거짓],
  "model_profile": "[선택됨: 품질|균형|예산|상속]",
  "워크플로": {
    "연구": [참|거짓],
    "plan_check": [참|거짓],
    "검증기": [true|false],
    "nyquist_validation": [true|false]
  }
}
선택
)"
```

The command merges your selections with all runtime defaults (`search_gitignored`, `brave_search`, `git` section), producing a fully-materialized config.

```
- [ ] **3.3단계: 워크플로 파일이 올바르게 읽히는지 확인**
```bash
cd /Users/diego/Dev/get-shit-done
grep -n "config-new-project\|config\.json\|CHOICES" get-shit-done/workflows/new-project.md
```
예상: `config-new-project` 2회 발생(단계당 1회), 구성 생성을 위한 인라인 JSON 템플릿이 더 이상 없습니다.

- [ ] **3.4단계: 커밋**
```bash
cd /Users/diego/Dev/get-shit-done
git add get-shit-done/workflows/new-project.md
git commit -m "feat: use config-new-project in new-project workflow for full config materialization"
```
---

## 작업 4: 검증

- [ ] **4.1단계: 전체 테스트 스위트 실행**
```bash
cd /Users/diego/Dev/get-shit-done
node --test tests/ 2>&1 | tail -30
```
예상: 모든 테스트가 통과되었습니다(회귀 없음).

- [ ] **4.2단계: 수동 엔드투엔드 검증**

새 프로젝트에 대해 `new-project.md`이 수행하는 작업을 시뮬레이션합니다.
```bash
# Create a fresh project dir
TMP=$(mktemp -d)
cd "$TMP"

# Step 1 simulation: what init new-project returns
node /Users/diego/Dev/get-shit-done/get-shit-done/bin/gsd-tools.cjs init new-project --cwd "$TMP"

# Step 5 simulation: create full config
node /Users/diego/Dev/get-shit-done/get-shit-done/bin/gsd-tools.cjs config-new-project '{
  "mode": "interactive",
  "granularity": "standard",
  "parallelization": true,
  "commit_docs": true,
  "model_profile": "balanced",
  "workflow": {
    "research": true,
    "plan_check": true,
    "verifier": true,
    "nyquist_validation": true
  }
}' --cwd "$TMP"

# Verify the file has all 12 expected keys
echo "=== Generated config.json ==="
cat "$TMP/.planning/config.json"

# Clean up
rm -rf "$TMP"
```
예상 출력: `mode`, `granularity`, `model_profile`, `commit_docs`, `parallelization`, `search_gitignored`, `brave_search`, `git`(하위 키 3개), `workflow`(하위 키 4개)이 포함된 config.json — 총 12개의 최상위 수준 키(또는 `git` 및 `workflow`을 단일 키로 계산하는 경우 10개).

- [ ] **4.3단계: 멱등성 확인**
```bash
TMP=$(mktemp -d)
CHOICES='{"mode":"yolo","granularity":"coarse"}'

node /Users/diego/Dev/get-shit-done/get-shit-done/bin/gsd-tools.cjs config-new-project "$CHOICES" --cwd "$TMP"
FIRST=$(cat "$TMP/.planning/config.json")

# Second call should be no-op
node /Users/diego/Dev/get-shit-done/get-shit-done/bin/gsd-tools.cjs config-new-project "$CHOICES" --cwd "$TMP"
SECOND=$(cat "$TMP/.planning/config.json")

[ "$FIRST" = "$SECOND" ] && echo "IDEMPOTENT: OK" || echo "IDEMPOTENT: FAIL"
rm -rf "$TMP"
```
예상: `IDEMPOTENT: OK`

- [ ] **4.4단계: loadConfig가 여전히 새 형식을 올바르게 읽는지 확인**
```bash
TMP=$(mktemp -d)
node /Users/diego/Dev/get-shit-done/get-shit-done/bin/gsd-tools.cjs config-new-project '{
  "mode":"yolo","granularity":"standard","parallelization":true,"commit_docs":true,
  "model_profile":"balanced",
  "workflow":{"research":true,"plan_check":false,"verifier":true,"nyquist_validation":true}
}' --cwd "$TMP"

# loadConfig should correctly read plan_check (nested as workflow.plan_check)
node /Users/diego/Dev/get-shit-done/get-shit-done/bin/gsd-tools.cjs config-get workflow.plan_check --cwd "$TMP"
# Expected: false

node /Users/diego/Dev/get-shit-done/get-shit-done/bin/gsd-tools.cjs config-get git.branching_strategy --cwd "$TMP"
# Expected: "none"

rm -rf "$TMP"
```
- [ ] **4.5단계: 최종 전체 테스트 스위트 + 커밋**
```bash
cd /Users/diego/Dev/get-shit-done
node --test tests/ 2>&1 | grep -E "pass|fail|error" | tail -5
```
예상: 모두 통과, 실패 0개.

---

## 부록: 업스트림 홍보 설명
```
feat: materialize all config defaults at new-project initialization

**Problem:**
`/gsd:new-project` creates `.planning/config.json` with only the 6 keys
the user explicitly chose during onboarding. Five additional keys
(`search_gitignored`, `brave_search`, `git.branching_strategy`,
`git.phase_branch_template`, `git.milestone_branch_template`) are resolved
silently by `loadConfig()` at runtime but never written to disk.

This creates two problems:
1. **Discoverability**: users can't see or understand `git.branching_strategy`
   without reading source code — it doesn't appear in their config.
2. **Implicit expansion**: the first time `/gsd:settings` or `config-set`
   writes to the config, those keys still aren't added. The config only
   reflects a fraction of the effective configuration.

**Solution:**
Add `config-new-project` CLI command to `gsd-tools.cjs`. The command:
- Accepts user-chosen values as JSON
- Merges them with all runtime defaults (including env-detected `brave_search`)
- Writes the fully-materialized config in one shot

Update `new-project.md` workflow (Steps 2a and 5) to call this command
instead of writing a hardcoded partial JSON template. Defaults now live in
exactly one place: `buildNewProjectConfig()` in `config.cjs`.

**Why this is conservative:**
- No changes to `loadConfig()`, `ensureConfigFile()`, or any read path
- No new config keys introduced
- No semantic changes — same values the system was already resolving silently
- Fully backward-compatible: `loadConfig()` continues to handle both the old
  partial format (existing projects) and the new full format
- Idempotent: calling `config-new-project` twice is safe
- No new user-facing flags

**Why this improves discoverability:**
A developer opening `.planning/config.json` for the first time can now see
`git.branching_strategy: "none"` and immediately understand that branching
is available and configurable, without reading the GSD source.
```
