/**
 * Init — 워크플로 부트스트래핑용 복합 init 명령
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { loadConfig, resolveModelInternal, findPhaseInternal, getRoadmapPhaseInternal, pathExistsInternal, generateSlugInternal, getMilestoneInfo, getMilestonePhaseFilter, stripShippedMilestones, extractCurrentMilestone, normalizePhaseName, planningPaths, planningDir, planningRoot, toPosixPath, output, error } = require('./core.cjs');

function getLatestCompletedMilestone(cwd) {
  const milestonesPath = path.join(planningRoot(cwd), 'MILESTONES.md');
  if (!fs.existsSync(milestonesPath)) return null;

  try {
    const content = fs.readFileSync(milestonesPath, 'utf-8');
    const match = content.match(/^##\s+(v[\d.]+)\s+(.+?)\s+\(Shipped:/m);
    if (!match) return null;
    return {
      version: match[1],
      name: match[2].trim(),
    };
  } catch {
    return null;
  }
}

/**
 * init 결과 객체에 `project_root`를 주입한다.
 * Claude의 CWD가 프로젝트 루트와 다를 때(예: 서브 리포 내부)
 * 워크플로가 `.planning/` 경로에 올바른 prefix를 붙이도록 돕는다.
 */
function withProjectRoot(cwd, result) {
  result.project_root = cwd;
  return result;
}

function cmdInitExecutePhase(cwd, phase, raw) {
  if (!phase) {
    error('phase required for init execute-phase');
  }

  const config = loadConfig(cwd);
  let phaseInfo = findPhaseInternal(cwd, phase);
  const milestone = getMilestoneInfo(cwd);

  const roadmapPhase = getRoadmapPhaseInternal(cwd, phase);

  // 아직 phase 디렉터리가 없으면 ROADMAP.md 기준으로 폴백
  if (!phaseInfo && roadmapPhase?.found) {
    const phaseName = roadmapPhase.phase_name;
    phaseInfo = {
      found: true,
      directory: null,
      phase_number: roadmapPhase.phase_number,
      phase_name: phaseName,
      phase_slug: phaseName ? phaseName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') : null,
      plans: [],
      summaries: [],
      incomplete_plans: [],
      has_research: false,
      has_context: false,
      has_verification: false,
      has_reviews: false,
    };
  }
  const reqMatch = roadmapPhase?.section?.match(/^\*\*Requirements\*\*:[^\S\n]*([^\n]*)$/m);
  const reqExtracted = reqMatch
    ? reqMatch[1].replace(/[\[\]]/g, '').split(',').map(s => s.trim()).filter(Boolean).join(', ')
    : null;
  const phase_req_ids = (reqExtracted && reqExtracted !== 'TBD') ? reqExtracted : null;

  const result = {
    // 모델
    executor_model: resolveModelInternal(cwd, 'gsd-executor'),
    verifier_model: resolveModelInternal(cwd, 'gsd-verifier'),

    // 설정 플래그
    commit_docs: config.commit_docs,
    sub_repos: config.sub_repos,
    parallelization: config.parallelization,
    context_window: config.context_window,
    branching_strategy: config.branching_strategy,
    phase_branch_template: config.phase_branch_template,
    milestone_branch_template: config.milestone_branch_template,
    verifier_enabled: config.verifier,

    // Phase 정보
    phase_found: !!phaseInfo,
    phase_dir: phaseInfo?.directory || null,
    phase_number: phaseInfo?.phase_number || null,
    phase_name: phaseInfo?.phase_name || null,
    phase_slug: phaseInfo?.phase_slug || null,
    phase_req_ids,

    // Plan 인벤토리
    plans: phaseInfo?.plans || [],
    summaries: phaseInfo?.summaries || [],
    incomplete_plans: phaseInfo?.incomplete_plans || [],
    plan_count: phaseInfo?.plans?.length || 0,
    incomplete_count: phaseInfo?.incomplete_plans?.length || 0,

    // 브랜치 이름(미리 계산)
    branch_name: config.branching_strategy === 'phase' && phaseInfo
      ? config.phase_branch_template
          .replace('{phase}', phaseInfo.phase_number)
          .replace('{slug}', phaseInfo.phase_slug || 'phase')
      : config.branching_strategy === 'milestone'
        ? config.milestone_branch_template
            .replace('{milestone}', milestone.version)
            .replace('{slug}', generateSlugInternal(milestone.name) || 'milestone')
        : null,

    // Milestone 정보
    milestone_version: milestone.version,
    milestone_name: milestone.name,
    milestone_slug: generateSlugInternal(milestone.name),

    // 파일 존재 여부
    state_exists: fs.existsSync(path.join(planningDir(cwd), 'STATE.md')),
    roadmap_exists: fs.existsSync(path.join(planningDir(cwd), 'ROADMAP.md')),
    config_exists: fs.existsSync(path.join(planningDir(cwd), 'config.json')),
    // 파일 경로
    state_path: toPosixPath(path.relative(cwd, path.join(planningDir(cwd), 'STATE.md'))),
    roadmap_path: toPosixPath(path.relative(cwd, path.join(planningDir(cwd), 'ROADMAP.md'))),
    config_path: toPosixPath(path.relative(cwd, path.join(planningDir(cwd), 'config.json'))),
  };

  output(withProjectRoot(cwd, result), raw);
}

function cmdInitPlanPhase(cwd, phase, raw) {
  if (!phase) {
    error('phase required for init plan-phase');
  }

  const config = loadConfig(cwd);
  let phaseInfo = findPhaseInternal(cwd, phase);

  const roadmapPhase = getRoadmapPhaseInternal(cwd, phase);

  // 아직 phase 디렉터리가 없으면 ROADMAP.md 기준으로 폴백
  if (!phaseInfo && roadmapPhase?.found) {
    const phaseName = roadmapPhase.phase_name;
    phaseInfo = {
      found: true,
      directory: null,
      phase_number: roadmapPhase.phase_number,
      phase_name: phaseName,
      phase_slug: phaseName ? phaseName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') : null,
      plans: [],
      summaries: [],
      incomplete_plans: [],
      has_research: false,
      has_context: false,
      has_verification: false,
      has_reviews: false,
    };
  }
  const reqMatch = roadmapPhase?.section?.match(/^\*\*Requirements\*\*:[^\S\n]*([^\n]*)$/m);
  const reqExtracted = reqMatch
    ? reqMatch[1].replace(/[\[\]]/g, '').split(',').map(s => s.trim()).filter(Boolean).join(', ')
    : null;
  const phase_req_ids = (reqExtracted && reqExtracted !== 'TBD') ? reqExtracted : null;

  const result = {
    // 모델
    researcher_model: resolveModelInternal(cwd, 'gsd-phase-researcher'),
    planner_model: resolveModelInternal(cwd, 'gsd-planner'),
    checker_model: resolveModelInternal(cwd, 'gsd-plan-checker'),

    // 워크플로 플래그
    research_enabled: config.research,
    plan_checker_enabled: config.plan_checker,
    nyquist_validation_enabled: config.nyquist_validation,
    commit_docs: config.commit_docs,
    text_mode: config.text_mode,

    // Phase 정보
    phase_found: !!phaseInfo,
    phase_dir: phaseInfo?.directory || null,
    phase_number: phaseInfo?.phase_number || null,
    phase_name: phaseInfo?.phase_name || null,
    phase_slug: phaseInfo?.phase_slug || null,
    padded_phase: phaseInfo?.phase_number ? normalizePhaseName(phaseInfo.phase_number) : null,
    phase_req_ids,

    // 기존 산출물
    has_research: phaseInfo?.has_research || false,
    has_context: phaseInfo?.has_context || false,
    has_reviews: phaseInfo?.has_reviews || false,
    has_plans: (phaseInfo?.plans?.length || 0) > 0,
    plan_count: phaseInfo?.plans?.length || 0,

    // 환경
    planning_exists: fs.existsSync(planningDir(cwd)),
    roadmap_exists: fs.existsSync(path.join(planningDir(cwd), 'ROADMAP.md')),

    // 파일 경로
    state_path: toPosixPath(path.relative(cwd, path.join(planningDir(cwd), 'STATE.md'))),
    roadmap_path: toPosixPath(path.relative(cwd, path.join(planningDir(cwd), 'ROADMAP.md'))),
    requirements_path: toPosixPath(path.relative(cwd, path.join(planningDir(cwd), 'REQUIREMENTS.md'))),
  };

  if (phaseInfo?.directory) {
    // phase 디렉터리에서 *-CONTEXT.md를 찾는다
    const phaseDirFull = path.join(cwd, phaseInfo.directory);
    try {
      const files = fs.readdirSync(phaseDirFull);
      const contextFile = files.find(f => f.endsWith('-CONTEXT.md') || f === 'CONTEXT.md');
      if (contextFile) {
        result.context_path = toPosixPath(path.join(phaseInfo.directory, contextFile));
      }
      const researchFile = files.find(f => f.endsWith('-RESEARCH.md') || f === 'RESEARCH.md');
      if (researchFile) {
        result.research_path = toPosixPath(path.join(phaseInfo.directory, researchFile));
      }
      const verificationFile = files.find(f => f.endsWith('-VERIFICATION.md') || f === 'VERIFICATION.md');
      if (verificationFile) {
        result.verification_path = toPosixPath(path.join(phaseInfo.directory, verificationFile));
      }
      const uatFile = files.find(f => f.endsWith('-UAT.md') || f === 'UAT.md');
      if (uatFile) {
        result.uat_path = toPosixPath(path.join(phaseInfo.directory, uatFile));
      }
      const reviewsFile = files.find(f => f.endsWith('-REVIEWS.md') || f === 'REVIEWS.md');
      if (reviewsFile) {
        result.reviews_path = toPosixPath(path.join(phaseInfo.directory, reviewsFile));
      }
    } catch { /* intentionally empty */ }
  }

  output(withProjectRoot(cwd, result), raw);
}

function cmdInitNewProject(cwd, raw) {
  const config = loadConfig(cwd);

  // Brave Search API 키 사용 가능 여부 감지
  const homedir = require('os').homedir();
  const braveKeyFile = path.join(homedir, '.gsd', 'brave_api_key');
  const hasBraveSearch = !!(process.env.BRAVE_API_KEY || fs.existsSync(braveKeyFile));

  // Firecrawl API 키 사용 가능 여부 감지
  const firecrawlKeyFile = path.join(homedir, '.gsd', 'firecrawl_api_key');
  const hasFirecrawl = !!(process.env.FIRECRAWL_API_KEY || fs.existsSync(firecrawlKeyFile));

  // Exa API 키 사용 가능 여부 감지
  const exaKeyFile = path.join(homedir, '.gsd', 'exa_api_key');
  const hasExaSearch = !!(process.env.EXA_API_KEY || fs.existsSync(exaKeyFile));

  // 기존 코드 존재 여부 감지(cross-platform, Unix `find` 의존 없음)
  let hasCode = false;
  let hasPackageFile = false;
  try {
    const codeExtensions = new Set(['.ts', '.js', '.py', '.go', '.rs', '.swift', '.java']);
    const skipDirs = new Set(['node_modules', '.git', '.planning', '.claude', '__pycache__', 'target', 'dist', 'build']);
    function findCodeFiles(dir, depth) {
      if (depth > 3) return false;
      let entries;
      try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return false; }
      for (const entry of entries) {
        if (entry.isFile() && codeExtensions.has(path.extname(entry.name))) return true;
        if (entry.isDirectory() && !skipDirs.has(entry.name)) {
          if (findCodeFiles(path.join(dir, entry.name), depth + 1)) return true;
        }
      }
      return false;
    }
    hasCode = findCodeFiles(cwd, 0);
  } catch { /* 의도적으로 비움 - best-effort 감지 */ }

  hasPackageFile = pathExistsInternal(cwd, 'package.json') ||
                   pathExistsInternal(cwd, 'requirements.txt') ||
                   pathExistsInternal(cwd, 'Cargo.toml') ||
                   pathExistsInternal(cwd, 'go.mod') ||
                   pathExistsInternal(cwd, 'Package.swift');

  const result = {
    // 모델
    researcher_model: resolveModelInternal(cwd, 'gsd-project-researcher'),
    synthesizer_model: resolveModelInternal(cwd, 'gsd-research-synthesizer'),
    roadmapper_model: resolveModelInternal(cwd, 'gsd-roadmapper'),

    // 설정
    commit_docs: config.commit_docs,

    // 기존 상태
    project_exists: pathExistsInternal(cwd, '.planning/PROJECT.md'),
    has_codebase_map: pathExistsInternal(cwd, '.planning/codebase'),
    planning_exists: pathExistsInternal(cwd, '.planning'),

    // Brownfield 감지
    has_existing_code: hasCode,
    has_package_file: hasPackageFile,
    is_brownfield: hasCode || hasPackageFile,
    needs_codebase_map: (hasCode || hasPackageFile) && !pathExistsInternal(cwd, '.planning/codebase'),

    // Git 상태
    has_git: pathExistsInternal(cwd, '.git'),

    // 확장 검색
    brave_search_available: hasBraveSearch,
    firecrawl_available: hasFirecrawl,
    exa_search_available: hasExaSearch,

    // 파일 경로
    project_path: '.planning/PROJECT.md',
  };

  output(withProjectRoot(cwd, result), raw);
}

function cmdInitNewMilestone(cwd, raw) {
  const config = loadConfig(cwd);
  const milestone = getMilestoneInfo(cwd);
  const latestCompleted = getLatestCompletedMilestone(cwd);
  const phasesDir = path.join(planningDir(cwd), 'phases');
  let phaseDirCount = 0;

  try {
    if (fs.existsSync(phasesDir)) {
      phaseDirCount = fs.readdirSync(phasesDir, { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .length;
    }
  } catch {}

  const result = {
    // 모델
    researcher_model: resolveModelInternal(cwd, 'gsd-project-researcher'),
    synthesizer_model: resolveModelInternal(cwd, 'gsd-research-synthesizer'),
    roadmapper_model: resolveModelInternal(cwd, 'gsd-roadmapper'),

    // 설정
    commit_docs: config.commit_docs,
    research_enabled: config.research,

    // 현재 milestone
    current_milestone: milestone.version,
    current_milestone_name: milestone.name,
    latest_completed_milestone: latestCompleted?.version || null,
    latest_completed_milestone_name: latestCompleted?.name || null,
    phase_dir_count: phaseDirCount,
    phase_archive_path: latestCompleted ? toPosixPath(path.relative(cwd, path.join(planningRoot(cwd), 'milestones', `${latestCompleted.version}-phases`))) : null,

    // 파일 존재 여부
    project_exists: pathExistsInternal(cwd, '.planning/PROJECT.md'),
    roadmap_exists: fs.existsSync(path.join(planningDir(cwd), 'ROADMAP.md')),
    state_exists: fs.existsSync(path.join(planningDir(cwd), 'STATE.md')),

    // 파일 경로
    project_path: '.planning/PROJECT.md',
    roadmap_path: toPosixPath(path.relative(cwd, path.join(planningDir(cwd), 'ROADMAP.md'))),
    state_path: toPosixPath(path.relative(cwd, path.join(planningDir(cwd), 'STATE.md'))),
  };

  output(withProjectRoot(cwd, result), raw);
}

function cmdInitQuick(cwd, description, raw) {
  const config = loadConfig(cwd);
  const now = new Date();
  const slug = description ? generateSlugInternal(description)?.substring(0, 40) : null;

  // 충돌에 강한 quick task ID를 생성한다: YYMMDD-xxx
  // xxx는 자정 이후 시간을 2초 단위 블록으로 나눈 뒤 3자리 Base36 소문자로 인코딩한다.
  // 범위는 000(00:00:00)부터 xbz(23:59:58)까지이며, 하루 내내 항상 3자리다.
  // 사용자별로 약 2초의 유니크 윈도를 제공해 팀 단위에서도 사실상 충돌이 없다.
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const dateStr = yy + mm + dd;
  const secondsSinceMidnight = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const timeBlocks = Math.floor(secondsSinceMidnight / 2);
  const timeEncoded = timeBlocks.toString(36).padStart(3, '0');
  const quickId = dateStr + '-' + timeEncoded;
  const branchSlug = slug || 'quick';
  const quickBranchName = config.quick_branch_template
    ? config.quick_branch_template
        .replace('{num}', quickId)
        .replace('{quick}', quickId)
        .replace('{slug}', branchSlug)
    : null;

  const result = {
    // 모델
    planner_model: resolveModelInternal(cwd, 'gsd-planner'),
    executor_model: resolveModelInternal(cwd, 'gsd-executor'),
    checker_model: resolveModelInternal(cwd, 'gsd-plan-checker'),
    verifier_model: resolveModelInternal(cwd, 'gsd-verifier'),

    // 설정
    commit_docs: config.commit_docs,
    branch_name: quickBranchName,

    // Quick task 정보
    quick_id: quickId,
    slug: slug,
    description: description || null,

    // 타임스탬프
    date: now.toISOString().split('T')[0],
    timestamp: now.toISOString(),

    // 경로
    quick_dir: '.planning/quick',
    task_dir: slug ? `.planning/quick/${quickId}-${slug}` : null,

    // 파일 존재 여부
    roadmap_exists: fs.existsSync(path.join(planningDir(cwd), 'ROADMAP.md')),
    planning_exists: fs.existsSync(planningRoot(cwd)),

  };

  output(withProjectRoot(cwd, result), raw);
}

function cmdInitResume(cwd, raw) {
  const config = loadConfig(cwd);

  // 중단된 agent가 있는지 확인
  let interruptedAgentId = null;
  try {
    interruptedAgentId = fs.readFileSync(path.join(planningRoot(cwd), 'current-agent-id.txt'), 'utf-8').trim();
  } catch { /* intentionally empty */ }

  const result = {
    // 파일 존재 여부
    state_exists: fs.existsSync(path.join(planningDir(cwd), 'STATE.md')),
    roadmap_exists: fs.existsSync(path.join(planningDir(cwd), 'ROADMAP.md')),
    project_exists: pathExistsInternal(cwd, '.planning/PROJECT.md'),
    planning_exists: fs.existsSync(planningRoot(cwd)),

    // 파일 경로
    state_path: toPosixPath(path.relative(cwd, path.join(planningDir(cwd), 'STATE.md'))),
    roadmap_path: toPosixPath(path.relative(cwd, path.join(planningDir(cwd), 'ROADMAP.md'))),
    project_path: '.planning/PROJECT.md',

    // Agent 상태
    has_interrupted_agent: !!interruptedAgentId,
    interrupted_agent_id: interruptedAgentId,

    // 설정
    commit_docs: config.commit_docs,
  };

  output(withProjectRoot(cwd, result), raw);
}

function cmdInitVerifyWork(cwd, phase, raw) {
  if (!phase) {
    error('phase required for init verify-work');
  }

  const config = loadConfig(cwd);
  let phaseInfo = findPhaseInternal(cwd, phase);

  // Fallback to ROADMAP.md if no phase directory exists yet
  if (!phaseInfo) {
    const roadmapPhase = getRoadmapPhaseInternal(cwd, phase);
    if (roadmapPhase?.found) {
      const phaseName = roadmapPhase.phase_name;
      phaseInfo = {
        found: true,
        directory: null,
        phase_number: roadmapPhase.phase_number,
        phase_name: phaseName,
        phase_slug: phaseName ? phaseName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') : null,
        plans: [],
        summaries: [],
        incomplete_plans: [],
        has_research: false,
        has_context: false,
        has_verification: false,
      };
    }
  }

  const result = {
    // Models
    planner_model: resolveModelInternal(cwd, 'gsd-planner'),
    checker_model: resolveModelInternal(cwd, 'gsd-plan-checker'),

    // Config
    commit_docs: config.commit_docs,

    // Phase info
    phase_found: !!phaseInfo,
    phase_dir: phaseInfo?.directory || null,
    phase_number: phaseInfo?.phase_number || null,
    phase_name: phaseInfo?.phase_name || null,

    // Existing artifacts
    has_verification: phaseInfo?.has_verification || false,
  };

  output(withProjectRoot(cwd, result), raw);
}

function cmdInitPhaseOp(cwd, phase, raw) {
  const config = loadConfig(cwd);
  let phaseInfo = findPhaseInternal(cwd, phase);

  // If the only disk match comes from an archived milestone, prefer the
  // current milestone's ROADMAP entry so discuss-phase and similar flows
  // don't attach to shipped work that reused the same phase number.
  if (phaseInfo?.archived) {
    const roadmapPhase = getRoadmapPhaseInternal(cwd, phase);
    if (roadmapPhase?.found) {
      const phaseName = roadmapPhase.phase_name;
      phaseInfo = {
        found: true,
        directory: null,
        phase_number: roadmapPhase.phase_number,
        phase_name: phaseName,
        phase_slug: phaseName ? phaseName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') : null,
        plans: [],
        summaries: [],
        incomplete_plans: [],
        has_research: false,
        has_context: false,
        has_verification: false,
      };
    }
  }

  // Fallback to ROADMAP.md if no directory exists (e.g., Plans: TBD)
  if (!phaseInfo) {
    const roadmapPhase = getRoadmapPhaseInternal(cwd, phase);
    if (roadmapPhase?.found) {
      const phaseName = roadmapPhase.phase_name;
      phaseInfo = {
        found: true,
        directory: null,
        phase_number: roadmapPhase.phase_number,
        phase_name: phaseName,
        phase_slug: phaseName ? phaseName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') : null,
        plans: [],
        summaries: [],
        incomplete_plans: [],
        has_research: false,
        has_context: false,
        has_verification: false,
      };
    }
  }

  const result = {
    // Config
    commit_docs: config.commit_docs,
    brave_search: config.brave_search,
    firecrawl: config.firecrawl,
    exa_search: config.exa_search,

    // Phase info
    phase_found: !!phaseInfo,
    phase_dir: phaseInfo?.directory || null,
    phase_number: phaseInfo?.phase_number || null,
    phase_name: phaseInfo?.phase_name || null,
    phase_slug: phaseInfo?.phase_slug || null,
    padded_phase: phaseInfo?.phase_number ? normalizePhaseName(phaseInfo.phase_number) : null,

    // Existing artifacts
    has_research: phaseInfo?.has_research || false,
    has_context: phaseInfo?.has_context || false,
    has_plans: (phaseInfo?.plans?.length || 0) > 0,
    has_verification: phaseInfo?.has_verification || false,
    has_reviews: phaseInfo?.has_reviews || false,
    plan_count: phaseInfo?.plans?.length || 0,

    // File existence
    roadmap_exists: fs.existsSync(path.join(planningDir(cwd), 'ROADMAP.md')),
    planning_exists: fs.existsSync(planningDir(cwd)),

    // File paths
    state_path: toPosixPath(path.relative(cwd, path.join(planningDir(cwd), 'STATE.md'))),
    roadmap_path: toPosixPath(path.relative(cwd, path.join(planningDir(cwd), 'ROADMAP.md'))),
    requirements_path: toPosixPath(path.relative(cwd, path.join(planningDir(cwd), 'REQUIREMENTS.md'))),
  };

  if (phaseInfo?.directory) {
    const phaseDirFull = path.join(cwd, phaseInfo.directory);
    try {
      const files = fs.readdirSync(phaseDirFull);
      const contextFile = files.find(f => f.endsWith('-CONTEXT.md') || f === 'CONTEXT.md');
      if (contextFile) {
        result.context_path = toPosixPath(path.join(phaseInfo.directory, contextFile));
      }
      const researchFile = files.find(f => f.endsWith('-RESEARCH.md') || f === 'RESEARCH.md');
      if (researchFile) {
        result.research_path = toPosixPath(path.join(phaseInfo.directory, researchFile));
      }
      const verificationFile = files.find(f => f.endsWith('-VERIFICATION.md') || f === 'VERIFICATION.md');
      if (verificationFile) {
        result.verification_path = toPosixPath(path.join(phaseInfo.directory, verificationFile));
      }
      const uatFile = files.find(f => f.endsWith('-UAT.md') || f === 'UAT.md');
      if (uatFile) {
        result.uat_path = toPosixPath(path.join(phaseInfo.directory, uatFile));
      }
      const reviewsFile = files.find(f => f.endsWith('-REVIEWS.md') || f === 'REVIEWS.md');
      if (reviewsFile) {
        result.reviews_path = toPosixPath(path.join(phaseInfo.directory, reviewsFile));
      }
    } catch { /* intentionally empty */ }
  }

  output(withProjectRoot(cwd, result), raw);
}

function cmdInitTodos(cwd, area, raw) {
  const config = loadConfig(cwd);
  const now = new Date();

  // List todos (reuse existing logic)
  const pendingDir = path.join(planningDir(cwd), 'todos', 'pending');
  let count = 0;
  const todos = [];

  try {
    const files = fs.readdirSync(pendingDir).filter(f => f.endsWith('.md'));
    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(pendingDir, file), 'utf-8');
        const createdMatch = content.match(/^created:\s*(.+)$/m);
        const titleMatch = content.match(/^title:\s*(.+)$/m);
        const areaMatch = content.match(/^area:\s*(.+)$/m);
        const todoArea = areaMatch ? areaMatch[1].trim() : 'general';

        if (area && todoArea !== area) continue;

        count++;
        todos.push({
          file,
          created: createdMatch ? createdMatch[1].trim() : 'unknown',
          title: titleMatch ? titleMatch[1].trim() : 'Untitled',
          area: todoArea,
          path: toPosixPath(path.relative(cwd, path.join(planningDir(cwd), 'todos', 'pending', file))),
        });
      } catch { /* intentionally empty */ }
    }
  } catch { /* intentionally empty */ }

  const result = {
    // Config
    commit_docs: config.commit_docs,

    // Timestamps
    date: now.toISOString().split('T')[0],
    timestamp: now.toISOString(),

    // Todo inventory
    todo_count: count,
    todos,
    area_filter: area || null,

    // Paths
    pending_dir: toPosixPath(path.relative(cwd, path.join(planningDir(cwd), 'todos', 'pending'))),
    completed_dir: toPosixPath(path.relative(cwd, path.join(planningDir(cwd), 'todos', 'completed'))),

    // File existence
    planning_exists: fs.existsSync(planningDir(cwd)),
    todos_dir_exists: fs.existsSync(path.join(planningDir(cwd), 'todos')),
    pending_dir_exists: fs.existsSync(path.join(planningDir(cwd), 'todos', 'pending')),
  };

  output(withProjectRoot(cwd, result), raw);
}

function cmdInitMilestoneOp(cwd, raw) {
  const config = loadConfig(cwd);
  const milestone = getMilestoneInfo(cwd);

  // Count phases
  let phaseCount = 0;
  let completedPhases = 0;
  const phasesDir = path.join(planningDir(cwd), 'phases');
  try {
    const entries = fs.readdirSync(phasesDir, { withFileTypes: true });
    const dirs = entries.filter(e => e.isDirectory()).map(e => e.name);
    phaseCount = dirs.length;

    // Count phases with summaries (completed)
    for (const dir of dirs) {
      try {
        const phaseFiles = fs.readdirSync(path.join(phasesDir, dir));
        const hasSummary = phaseFiles.some(f => f.endsWith('-SUMMARY.md') || f === 'SUMMARY.md');
        if (hasSummary) completedPhases++;
      } catch { /* intentionally empty */ }
    }
  } catch { /* intentionally empty */ }

  // Check archive
  const archiveDir = path.join(planningRoot(cwd), 'archive');
  let archivedMilestones = [];
  try {
    archivedMilestones = fs.readdirSync(archiveDir, { withFileTypes: true })
      .filter(e => e.isDirectory())
      .map(e => e.name);
  } catch { /* intentionally empty */ }

  const result = {
    // Config
    commit_docs: config.commit_docs,

    // Current milestone
    milestone_version: milestone.version,
    milestone_name: milestone.name,
    milestone_slug: generateSlugInternal(milestone.name),

    // Phase counts
    phase_count: phaseCount,
    completed_phases: completedPhases,
    all_phases_complete: phaseCount > 0 && phaseCount === completedPhases,

    // Archive
    archived_milestones: archivedMilestones,
    archive_count: archivedMilestones.length,

    // File existence
    project_exists: pathExistsInternal(cwd, '.planning/PROJECT.md'),
    roadmap_exists: fs.existsSync(path.join(planningDir(cwd), 'ROADMAP.md')),
    state_exists: fs.existsSync(path.join(planningDir(cwd), 'STATE.md')),
    archive_exists: fs.existsSync(path.join(planningRoot(cwd), 'archive')),
    phases_dir_exists: fs.existsSync(path.join(planningDir(cwd), 'phases')),
  };

  output(withProjectRoot(cwd, result), raw);
}

function cmdInitMapCodebase(cwd, raw) {
  const config = loadConfig(cwd);

  // Check for existing codebase maps
  const codebaseDir = path.join(planningRoot(cwd), 'codebase');
  let existingMaps = [];
  try {
    existingMaps = fs.readdirSync(codebaseDir).filter(f => f.endsWith('.md'));
  } catch { /* intentionally empty */ }

  const result = {
    // Models
    mapper_model: resolveModelInternal(cwd, 'gsd-codebase-mapper'),

    // Config
    commit_docs: config.commit_docs,
    search_gitignored: config.search_gitignored,
    parallelization: config.parallelization,

    // Paths
    codebase_dir: '.planning/codebase',

    // Existing maps
    existing_maps: existingMaps,
    has_maps: existingMaps.length > 0,

    // File existence
    planning_exists: pathExistsInternal(cwd, '.planning'),
    codebase_dir_exists: pathExistsInternal(cwd, '.planning/codebase'),
  };

  output(withProjectRoot(cwd, result), raw);
}

function cmdInitManager(cwd, raw) {
  const config = loadConfig(cwd);
  const milestone = getMilestoneInfo(cwd);

  // workstream scoping과의 forward-compatibility를 위해 planningPaths 사용 (#1268)
  const paths = planningPaths(cwd);

  // 선행 조건 검증
  if (!fs.existsSync(paths.roadmap)) {
    error('No ROADMAP.md found. Run /gsd:new-milestone first.');
  }
  if (!fs.existsSync(paths.state)) {
    error('No STATE.md found. Run /gsd:new-milestone first.');
  }
  const rawContent = fs.readFileSync(paths.roadmap, 'utf-8');
  const content = extractCurrentMilestone(rawContent, cwd);
  const phasesDir = paths.phases;
  const isDirInMilestone = getMilestonePhaseFilter(cwd);

  const phasePattern = /#{2,4}\s*Phase\s+(\d+[A-Z]?(?:\.\d+)*)\s*:\s*([^\n]+)/gi;
  const phases = [];
  let match;

  while ((match = phasePattern.exec(content)) !== null) {
    const phaseNum = match[1];
    const phaseName = match[2].replace(/\(INSERTED\)/i, '').trim();

    const sectionStart = match.index;
    const restOfContent = content.slice(sectionStart);
    const nextHeader = restOfContent.match(/\n#{2,4}\s+Phase\s+\d/i);
    const sectionEnd = nextHeader ? sectionStart + nextHeader.index : content.length;
    const section = content.slice(sectionStart, sectionEnd);

    const goalMatch = section.match(/\*\*Goal(?::\*\*|\*\*:)\s*([^\n]+)/i);
    const goal = goalMatch ? goalMatch[1].trim() : null;

    const dependsMatch = section.match(/\*\*Depends on(?::\*\*|\*\*:)\s*([^\n]+)/i);
    const depends_on = dependsMatch ? dependsMatch[1].trim() : null;

    const normalized = normalizePhaseName(phaseNum);
    let diskStatus = 'no_directory';
    let planCount = 0;
    let summaryCount = 0;
    let hasContext = false;
    let hasResearch = false;
    let lastActivity = null;
    let isActive = false;

    try {
      const entries = fs.readdirSync(phasesDir, { withFileTypes: true });
      const dirs = entries.filter(e => e.isDirectory()).map(e => e.name).filter(isDirInMilestone);
      const dirMatch = dirs.find(d => d.startsWith(normalized + '-') || d === normalized);

      if (dirMatch) {
        const fullDir = path.join(phasesDir, dirMatch);
        const phaseFiles = fs.readdirSync(fullDir);
        planCount = phaseFiles.filter(f => f.endsWith('-PLAN.md') || f === 'PLAN.md').length;
        summaryCount = phaseFiles.filter(f => f.endsWith('-SUMMARY.md') || f === 'SUMMARY.md').length;
        hasContext = phaseFiles.some(f => f.endsWith('-CONTEXT.md') || f === 'CONTEXT.md');
        hasResearch = phaseFiles.some(f => f.endsWith('-RESEARCH.md') || f === 'RESEARCH.md');

        if (summaryCount >= planCount && planCount > 0) diskStatus = 'complete';
        else if (summaryCount > 0) diskStatus = 'partial';
        else if (planCount > 0) diskStatus = 'planned';
        else if (hasResearch) diskStatus = 'researched';
        else if (hasContext) diskStatus = 'discussed';
        else diskStatus = 'empty';

        // 활동 감지: 가장 최근 파일 mtime 확인
        const now = Date.now();
        let newestMtime = 0;
        for (const f of phaseFiles) {
          try {
            const stat = fs.statSync(path.join(fullDir, f));
            if (stat.mtimeMs > newestMtime) newestMtime = stat.mtimeMs;
          } catch { /* intentionally empty */ }
        }
        if (newestMtime > 0) {
          lastActivity = new Date(newestMtime).toISOString();
          isActive = (now - newestMtime) < 300000; // 5 minutes
        }
      }
    } catch { /* intentionally empty */ }

    // ROADMAP 체크박스 상태 확인
    const checkboxPattern = new RegExp(`-\\s*\\[(x| )\\]\\s*.*Phase\\s+${phaseNum.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[:\\s]`, 'i');
    const checkboxMatch = content.match(checkboxPattern);
    const roadmapComplete = checkboxMatch ? checkboxMatch[1] === 'x' : false;
    if (roadmapComplete && diskStatus !== 'complete') {
      diskStatus = 'complete';
    }

    phases.push({
      number: phaseNum,
      name: phaseName,
      goal,
      depends_on,
      disk_status: diskStatus,
      has_context: hasContext,
      has_research: hasResearch,
      plan_count: planCount,
      summary_count: summaryCount,
      roadmap_complete: roadmapComplete,
      last_activity: lastActivity,
      is_active: isActive,
    });
  }

  // 표시 이름 계산: 표 정렬을 위해 필요한 경우 자른다
  const MAX_NAME_WIDTH = 20;
  for (const phase of phases) {
    if (phase.name.length > MAX_NAME_WIDTH) {
      phase.display_name = phase.name.slice(0, MAX_NAME_WIDTH - 1) + '…';
    } else {
      phase.display_name = phase.name;
    }
  }

  // 의존성 충족 여부: depends_on에 있는 phase가 모두 완료됐는지 확인
  const completedNums = new Set(phases.filter(p => p.disk_status === 'complete').map(p => p.number));
  for (const phase of phases) {
    if (!phase.depends_on || /^none$/i.test(phase.depends_on.trim())) {
      phase.deps_satisfied = true;
    } else {
      // "Phase 1, Phase 3" 또는 "1, 3" 형식을 파싱
      const depNums = phase.depends_on.match(/\d+(?:\.\d+)*/g) || [];
      phase.deps_satisfied = depNums.every(n => completedNums.has(n));
      phase.dep_phases = depNums;
    }
  }

  // 대시보드용 의존성 표시를 간결하게 정리
  for (const phase of phases) {
    phase.deps_display = (phase.dep_phases && phase.dep_phases.length > 0)
      ? phase.dep_phases.join(',')
      : '—';
  }

  // 슬라이딩 윈도우: discuss는 순차적이므로 첫 번째 미논의 phase만 노출
  let foundNextToDiscuss = false;
  for (const phase of phases) {
    if (!foundNextToDiscuss && (phase.disk_status === 'empty' || phase.disk_status === 'no_directory')) {
      phase.is_next_to_discuss = true;
      foundNextToDiscuss = true;
    } else {
      phase.is_next_to_discuss = false;
    }
  }

  // WAITING.json 시그널 확인
  let waitingSignal = null;
  try {
    const waitingPath = path.join(cwd, '.planning', 'WAITING.json');
    if (fs.existsSync(waitingPath)) {
      waitingSignal = JSON.parse(fs.readFileSync(waitingPath, 'utf-8'));
    }
  } catch { /* intentionally empty */ }

  // 추천 액션 계산(execute > plan > discuss)
  const recommendedActions = [];
  for (const phase of phases) {
    if (phase.disk_status === 'complete') continue;

    if (phase.disk_status === 'planned' && phase.deps_satisfied) {
      recommendedActions.push({
        phase: phase.number,
        phase_name: phase.name,
        action: 'execute',
        reason: `${phase.plan_count} plans ready, dependencies met`,
        command: `/gsd:execute-phase ${phase.number}`,
      });
    } else if (phase.disk_status === 'discussed' || phase.disk_status === 'researched') {
      recommendedActions.push({
        phase: phase.number,
        phase_name: phase.name,
        action: 'plan',
        reason: 'Context gathered, ready for planning',
        command: `/gsd:plan-phase ${phase.number}`,
      });
    } else if ((phase.disk_status === 'empty' || phase.disk_status === 'no_directory') && phase.is_next_to_discuss) {
      recommendedActions.push({
        phase: phase.number,
        phase_name: phase.name,
        action: 'discuss',
        reason: 'Unblocked, ready to gather context',
        command: `/gsd:discuss-phase ${phase.number}`,
      });
    }
  }

  // 추천 액션 필터링: phase가 독립적이지 않으면 execute/plan 병렬 추천을 막는다.
  // 두 phase는 어느 쪽도 서로를 직접/간접 의존하지 않을 때만 "독립"으로 본다.
  const phaseMap = new Map(phases.map(p => [p.number, p]));

  function reaches(from, to, visited = new Set()) {
    if (visited.has(from)) return false;
    visited.add(from);
    const p = phaseMap.get(from);
    if (!p || !p.dep_phases || p.dep_phases.length === 0) return false;
    if (p.dep_phases.includes(to)) return true;
    return p.dep_phases.some(dep => reaches(dep, to, visited));
  }

  function hasDepRelationship(numA, numB) {
    return reaches(numA, numB) || reaches(numB, numA);
  }

  // 활성 작업이 있는 phase 감지(최근 5분 내 파일 수정)
  const activeExecuting = phases.filter(p =>
    p.disk_status === 'partial' ||
    (p.disk_status === 'planned' && p.is_active)
  );
  const activePlanning = phases.filter(p =>
    p.is_active && (p.disk_status === 'discussed' || p.disk_status === 'researched')
  );

  const filteredActions = recommendedActions.filter(action => {
    if (action.action === 'execute' && activeExecuting.length > 0) {
      // 현재 실행 중인 모든 phase와 독립적일 때만 허용
      return activeExecuting.every(active => !hasDepRelationship(action.phase, active.number));
    }
    if (action.action === 'plan' && activePlanning.length > 0) {
      // 현재 계획 중인 모든 phase와 독립적일 때만 허용
      return activePlanning.every(active => !hasDepRelationship(action.phase, active.number));
    }
    return true;
  });

  const completedCount = phases.filter(p => p.disk_status === 'complete').length;
  const result = {
    milestone_version: milestone.version,
    milestone_name: milestone.name,
    phases,
    phase_count: phases.length,
    completed_count: completedCount,
    in_progress_count: phases.filter(p => ['partial', 'planned', 'discussed', 'researched'].includes(p.disk_status)).length,
    recommended_actions: filteredActions,
    waiting_signal: waitingSignal,
    all_complete: completedCount === phases.length && phases.length > 0,
    project_exists: pathExistsInternal(cwd, '.planning/PROJECT.md'),
    roadmap_exists: true,
    state_exists: true,
  };

  output(withProjectRoot(cwd, result), raw);
}

function cmdInitProgress(cwd, raw) {
  const config = loadConfig(cwd);
  const milestone = getMilestoneInfo(cwd);

  // Analyze phases — filter to current milestone and include ROADMAP-only phases
  const phasesDir = path.join(planningDir(cwd), 'phases');
  const phases = [];
  let currentPhase = null;
  let nextPhase = null;

  // Build set of phases defined in ROADMAP for the current milestone
  const roadmapPhaseNums = new Set();
  const roadmapPhaseNames = new Map();
  try {
    const roadmapContent = extractCurrentMilestone(
      fs.readFileSync(path.join(planningDir(cwd), 'ROADMAP.md'), 'utf-8'), cwd
    );
    const headingPattern = /#{2,4}\s*Phase\s+(\d+[A-Z]?(?:\.\d+)*)\s*:\s*([^\n]+)/gi;
    let hm;
    while ((hm = headingPattern.exec(roadmapContent)) !== null) {
      roadmapPhaseNums.add(hm[1]);
      roadmapPhaseNames.set(hm[1], hm[2].replace(/\(INSERTED\)/i, '').trim());
    }
  } catch { /* intentionally empty */ }

  const isDirInMilestone = getMilestonePhaseFilter(cwd);
  const seenPhaseNums = new Set();

  try {
    const entries = fs.readdirSync(phasesDir, { withFileTypes: true });
    const dirs = entries.filter(e => e.isDirectory()).map(e => e.name)
      .filter(isDirInMilestone)
      .sort((a, b) => {
        const pa = a.match(/^(\d+[A-Z]?(?:\.\d+)*)/i);
        const pb = b.match(/^(\d+[A-Z]?(?:\.\d+)*)/i);
        if (!pa || !pb) return a.localeCompare(b);
        return parseInt(pa[1], 10) - parseInt(pb[1], 10);
      });

    for (const dir of dirs) {
      const match = dir.match(/^(\d+[A-Z]?(?:\.\d+)*)-?(.*)/i);
      const phaseNumber = match ? match[1] : dir;
      const phaseName = match && match[2] ? match[2] : null;
      seenPhaseNums.add(phaseNumber.replace(/^0+/, '') || '0');

      const phasePath = path.join(phasesDir, dir);
      const phaseFiles = fs.readdirSync(phasePath);

      const plans = phaseFiles.filter(f => f.endsWith('-PLAN.md') || f === 'PLAN.md');
      const summaries = phaseFiles.filter(f => f.endsWith('-SUMMARY.md') || f === 'SUMMARY.md');
      const hasResearch = phaseFiles.some(f => f.endsWith('-RESEARCH.md') || f === 'RESEARCH.md');

      const status = summaries.length >= plans.length && plans.length > 0 ? 'complete' :
                     plans.length > 0 ? 'in_progress' :
                     hasResearch ? 'researched' : 'pending';

      const phaseInfo = {
        number: phaseNumber,
        name: phaseName,
        directory: toPosixPath(path.relative(cwd, path.join(planningDir(cwd), 'phases', dir))),
        status,
        plan_count: plans.length,
        summary_count: summaries.length,
        has_research: hasResearch,
      };

      phases.push(phaseInfo);

      // Find current (first incomplete with plans) and next (first pending)
      if (!currentPhase && (status === 'in_progress' || status === 'researched')) {
        currentPhase = phaseInfo;
      }
      if (!nextPhase && status === 'pending') {
        nextPhase = phaseInfo;
      }
    }
  } catch { /* intentionally empty */ }

  // Add phases defined in ROADMAP but not yet scaffolded to disk
  for (const [num, name] of roadmapPhaseNames) {
    const stripped = num.replace(/^0+/, '') || '0';
    if (!seenPhaseNums.has(stripped)) {
      const phaseInfo = {
        number: num,
        name: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
        directory: null,
        status: 'not_started',
        plan_count: 0,
        summary_count: 0,
        has_research: false,
      };
      phases.push(phaseInfo);
      if (!nextPhase && !currentPhase) {
        nextPhase = phaseInfo;
      }
    }
  }

  // Re-sort phases by number after adding ROADMAP-only phases
  phases.sort((a, b) => parseInt(a.number, 10) - parseInt(b.number, 10));

  // Check for paused work
  let pausedAt = null;
  try {
    const state = fs.readFileSync(path.join(planningDir(cwd), 'STATE.md'), 'utf-8');
    const pauseMatch = state.match(/\*\*Paused At:\*\*\s*(.+)/);
    if (pauseMatch) pausedAt = pauseMatch[1].trim();
  } catch { /* intentionally empty */ }

  const result = {
    // Models
    executor_model: resolveModelInternal(cwd, 'gsd-executor'),
    planner_model: resolveModelInternal(cwd, 'gsd-planner'),

    // Config
    commit_docs: config.commit_docs,

    // Milestone
    milestone_version: milestone.version,
    milestone_name: milestone.name,

    // Phase overview
    phases,
    phase_count: phases.length,
    completed_count: phases.filter(p => p.status === 'complete').length,
    in_progress_count: phases.filter(p => p.status === 'in_progress').length,

    // Current state
    current_phase: currentPhase,
    next_phase: nextPhase,
    paused_at: pausedAt,
    has_work_in_progress: !!currentPhase,

    // File existence
    project_exists: pathExistsInternal(cwd, '.planning/PROJECT.md'),
    roadmap_exists: fs.existsSync(path.join(planningDir(cwd), 'ROADMAP.md')),
    state_exists: fs.existsSync(path.join(planningDir(cwd), 'STATE.md')),
    // File paths
    state_path: toPosixPath(path.relative(cwd, path.join(planningDir(cwd), 'STATE.md'))),
    roadmap_path: toPosixPath(path.relative(cwd, path.join(planningDir(cwd), 'ROADMAP.md'))),
    project_path: '.planning/PROJECT.md',
    config_path: toPosixPath(path.relative(cwd, path.join(planningDir(cwd), 'config.json'))),
  };

  output(withProjectRoot(cwd, result), raw);
}

/**
 * Detect child git repos in a directory (one level deep).
 * Returns array of { name, path, has_uncommitted } objects.
 */
function detectChildRepos(dir) {
  const repos = [];
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return repos; }
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith('.')) continue;
    const fullPath = path.join(dir, entry.name);
    const gitDir = path.join(fullPath, '.git');
    if (fs.existsSync(gitDir)) {
      let hasUncommitted = false;
      try {
        const status = execSync('git status --porcelain', { cwd: fullPath, encoding: 'utf8', timeout: 5000 });
        hasUncommitted = status.trim().length > 0;
      } catch { /* best-effort */ }
      repos.push({ name: entry.name, path: fullPath, has_uncommitted: hasUncommitted });
    }
  }
  return repos;
}

function cmdInitNewWorkspace(cwd, raw) {
  const homedir = process.env.HOME || require('os').homedir();
  const defaultBase = path.join(homedir, 'gsd-workspaces');

  // Detect child git repos for interactive selection
  const childRepos = detectChildRepos(cwd);

  // Check if git worktree is available
  let worktreeAvailable = false;
  try {
    execSync('git --version', { encoding: 'utf8', timeout: 5000, stdio: 'pipe' });
    worktreeAvailable = true;
  } catch { /* no git at all */ }

  const result = {
    default_workspace_base: defaultBase,
    child_repos: childRepos,
    child_repo_count: childRepos.length,
    worktree_available: worktreeAvailable,
    is_git_repo: pathExistsInternal(cwd, '.git'),
    cwd_repo_name: path.basename(cwd),
  };

  output(withProjectRoot(cwd, result), raw);
}

function cmdInitListWorkspaces(cwd, raw) {
  const homedir = process.env.HOME || require('os').homedir();
  const defaultBase = path.join(homedir, 'gsd-workspaces');

  const workspaces = [];
  if (fs.existsSync(defaultBase)) {
    let entries;
    try { entries = fs.readdirSync(defaultBase, { withFileTypes: true }); } catch { entries = []; }
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const wsPath = path.join(defaultBase, entry.name);
      const manifestPath = path.join(wsPath, 'WORKSPACE.md');
      if (!fs.existsSync(manifestPath)) continue;

      let repoCount = 0;
      let hasProject = false;
      let strategy = 'unknown';
      try {
        const manifest = fs.readFileSync(manifestPath, 'utf8');
        const strategyMatch = manifest.match(/^Strategy:\s*(.+)$/m);
        if (strategyMatch) strategy = strategyMatch[1].trim();
        // Count table rows (lines starting with |, excluding header and separator)
        const tableRows = manifest.split('\n').filter(l => l.match(/^\|\s*\w/) && !l.includes('Repo') && !l.includes('---'));
        repoCount = tableRows.length;
      } catch { /* best-effort */ }
      hasProject = fs.existsSync(path.join(wsPath, '.planning', 'PROJECT.md'));

      workspaces.push({
        name: entry.name,
        path: wsPath,
        repo_count: repoCount,
        strategy,
        has_project: hasProject,
      });
    }
  }

  const result = {
    workspace_base: defaultBase,
    workspaces,
    workspace_count: workspaces.length,
  };

  output(result, raw);
}

function cmdInitRemoveWorkspace(cwd, name, raw) {
  const homedir = process.env.HOME || require('os').homedir();
  const defaultBase = path.join(homedir, 'gsd-workspaces');

  if (!name) {
    error('workspace name required for init remove-workspace');
  }

  const wsPath = path.join(defaultBase, name);
  const manifestPath = path.join(wsPath, 'WORKSPACE.md');

  if (!fs.existsSync(wsPath)) {
    error(`Workspace not found: ${wsPath}`);
  }

  // Parse manifest for repo info
  const repos = [];
  let strategy = 'unknown';
  if (fs.existsSync(manifestPath)) {
    try {
      const manifest = fs.readFileSync(manifestPath, 'utf8');
      const strategyMatch = manifest.match(/^Strategy:\s*(.+)$/m);
      if (strategyMatch) strategy = strategyMatch[1].trim();

      // Parse table rows for repo names and source paths
      const lines = manifest.split('\n');
      for (const line of lines) {
        const match = line.match(/^\|\s*(\S+)\s*\|\s*(\S+)\s*\|\s*(\S+)\s*\|\s*(\S+)\s*\|$/);
        if (match && match[1] !== 'Repo' && !match[1].includes('---')) {
          repos.push({ name: match[1], source: match[2], branch: match[3], strategy: match[4] });
        }
      }
    } catch { /* best-effort */ }
  }

  // Check for uncommitted changes in workspace repos
  const dirtyRepos = [];
  for (const repo of repos) {
    const repoPath = path.join(wsPath, repo.name);
    if (!fs.existsSync(repoPath)) continue;
    try {
      const status = execSync('git status --porcelain', { cwd: repoPath, encoding: 'utf8', timeout: 5000, stdio: 'pipe' });
      if (status.trim().length > 0) {
        dirtyRepos.push(repo.name);
      }
    } catch { /* best-effort */ }
  }

  const result = {
    workspace_name: name,
    workspace_path: wsPath,
    has_manifest: fs.existsSync(manifestPath),
    strategy,
    repos,
    repo_count: repos.length,
    dirty_repos: dirtyRepos,
    has_dirty_repos: dirtyRepos.length > 0,
  };

  output(result, raw);
}

module.exports = {
  cmdInitExecutePhase,
  cmdInitPlanPhase,
  cmdInitNewProject,
  cmdInitNewMilestone,
  cmdInitQuick,
  cmdInitResume,
  cmdInitVerifyWork,
  cmdInitPhaseOp,
  cmdInitTodos,
  cmdInitMilestoneOp,
  cmdInitMapCodebase,
  cmdInitProgress,
  cmdInitManager,
  cmdInitNewWorkspace,
  cmdInitListWorkspaces,
  cmdInitRemoveWorkspace,
  detectChildRepos,
};
