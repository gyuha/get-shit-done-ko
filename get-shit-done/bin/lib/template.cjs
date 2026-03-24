/**
 * Template — Template selection and fill operations
 */

const fs = require('fs');
const path = require('path');
const { normalizePhaseName, findPhaseInternal, generateSlugInternal, normalizeMd, toPosixPath, output, error } = require('./core.cjs');
const { reconstructFrontmatter } = require('./frontmatter.cjs');

function cmdTemplateSelect(cwd, planPath, raw) {
  if (!planPath) {
    error('plan-path required');
  }

  try {
    const fullPath = path.join(cwd, planPath);
    const content = fs.readFileSync(fullPath, 'utf-8');

    // Simple heuristics
    const taskMatch = content.match(/###\s*Task\s*\d+/g) || [];
    const taskCount = taskMatch.length;

    const decisionMatch = content.match(/decision/gi) || [];
    const hasDecisions = decisionMatch.length > 0;

    // Count file mentions
    const fileMentions = new Set();
    const filePattern = /`([^`]+\.[a-zA-Z]+)`/g;
    let m;
    while ((m = filePattern.exec(content)) !== null) {
      if (m[1].includes('/') && !m[1].startsWith('http')) {
        fileMentions.add(m[1]);
      }
    }
    const fileCount = fileMentions.size;

    let template = 'templates/summary-standard.md';
    let type = 'standard';

    if (taskCount <= 2 && fileCount <= 3 && !hasDecisions) {
      template = 'templates/summary-minimal.md';
      type = 'minimal';
    } else if (hasDecisions || fileCount > 6 || taskCount > 5) {
      template = 'templates/summary-complex.md';
      type = 'complex';
    }

    const result = { template, type, taskCount, fileCount, hasDecisions };
    output(result, raw, template);
  } catch (e) {
    // Fallback to standard
    output({ template: 'templates/summary-standard.md', type: 'standard', error: e.message }, raw, 'templates/summary-standard.md');
  }
}

function cmdTemplateFill(cwd, templateType, options, raw) {
  if (!templateType) { error('template type required: summary, plan, or verification'); }
  if (!options.phase) { error('--phase required'); }

  const phaseInfo = findPhaseInternal(cwd, options.phase);
  if (!phaseInfo || !phaseInfo.found) { output({ error: 'Phase not found', phase: options.phase }, raw); return; }

  const padded = normalizePhaseName(options.phase);
  const today = new Date().toISOString().split('T')[0];
  const phaseName = options.name || phaseInfo.phase_name || 'Unnamed';
  const phaseSlug = phaseInfo.phase_slug || generateSlugInternal(phaseName);
  const phaseId = `${padded}-${phaseSlug}`;
  const planNum = (options.plan || '01').padStart(2, '0');
  const fields = options.fields || {};

  let frontmatter, body, fileName;

  switch (templateType) {
    case 'summary': {
      frontmatter = {
        phase: phaseId,
        plan: planNum,
        subsystem: '[primary category]',
        tags: [],
        provides: [],
        affects: [],
        'tech-stack': { added: [], patterns: [] },
        'key-files': { created: [], modified: [] },
        'key-decisions': [],
        'patterns-established': [],
        duration: '[X]min',
        completed: today,
        ...fields,
      };
      body = [
        `# Phase ${options.phase}: ${phaseName} 요약 (Summary)`,
        '',
        '**[무엇이 실제로 전달되었는지 한 줄로 요약]**',
        '',
        '## Performance (수행 결과)',
        '- **Duration:** [time]',
        '- **Tasks:** [완료한 작업 수]',
        '- **Files modified:** [수정한 파일 수]',
        '',
        '## Accomplishments (주요 성과)',
        '- [핵심 결과 1]',
        '- [핵심 결과 2]',
        '',
        '## Task Commits (작업 커밋)',
        '1. **Task 1: [작업 이름]** - `hash`',
        '',
        '## Files Created/Modified (생성/수정 파일)',
        '- `path/to/file.ts` - 파일 역할 설명',
        '',
        '## Decisions Made (결정 사항)',
        '[핵심 결정과 간단한 이유, 없으면 "없음 - 계획대로 진행"]',
        '',
        '## Deviations from Plan (계획 대비 변경 사항)',
        '[없으면 "없음 - 계획대로 실행"]',
        '',
        '## Issues Encountered (이슈)',
        '[문제와 해결 내용을 적고, 없으면 "없음"]',
        '',
        '## User Setup Required (사용자 설정 필요 여부)',
        '없음 - 추가 외부 서비스 설정이 필요하지 않습니다.',
        '',
        '## Next Phase Readiness (다음 phase 준비 상태)',
        '[다음 phase를 위해 준비된 내용]',
      ].join('\n');
      fileName = `${padded}-${planNum}-SUMMARY.md`;
      break;
    }
    case 'plan': {
      const planType = options.type || 'execute';
      const wave = parseInt(options.wave) || 1;
      frontmatter = {
        phase: phaseId,
        plan: planNum,
        type: planType,
        wave,
        depends_on: [],
        files_modified: [],
        autonomous: true,
        user_setup: [],
        must_haves: { truths: [], artifacts: [], key_links: [] },
        ...fields,
      };
      body = [
        `# Phase ${options.phase} Plan ${planNum}: [제목]`,
        '',
        '## Objective',
        '- **What:** [이 plan이 구축할 내용]',
        '- **Why:** [이 phase 목표에서 중요한 이유]',
        '- **Output:** [구체 산출물]',
        '',
        '## Context',
        '@.planning/PROJECT.md',
        '@.planning/ROADMAP.md',
        '@.planning/STATE.md',
        '',
        '## Tasks',
        '',
        '<task type="code">',
        '  <name>[작업 이름]</name>',
        '  <files>[파일 경로]</files>',
        '  <action>[수행할 일]</action>',
        '  <verify>[검증 방법]</verify>',
        '  <done>[완료 조건]</done>',
        '</task>',
        '',
        '## Verification',
        '[이 plan이 목표를 달성했는지 검증하는 방법]',
        '',
        '## Success Criteria',
        '- [ ] [성공 기준 1]',
        '- [ ] [성공 기준 2]',
      ].join('\n');
      fileName = `${padded}-${planNum}-PLAN.md`;
      break;
    }
    case 'verification': {
      frontmatter = {
        phase: phaseId,
        verified: new Date().toISOString(),
        status: 'pending',
        score: '0/0 must-haves verified',
        ...fields,
      };
      body = [
        `# Phase ${options.phase}: ${phaseName} — 검증 (Verification)`,
        '',
        '## Observable Truths (관찰 가능한 사실)',
        '| # | Truth | Status | Evidence |',
        '|---|-------|--------|----------|',
        '| 1 | [검증할 사실] | pending | |',
        '',
        '## Required Artifacts (필수 산출물)',
        '| Artifact | Expected | Status | Details |',
        '|----------|----------|--------|---------|',
        '| [path] | [기대 내용] | pending | |',
        '',
        '## Key Link Verification (핵심 연결 검증)',
        '| From | To | Via | Status | Details |',
        '|------|----|----|--------|---------|',
        '| [source] | [target] | [connection] | pending | |',
        '',
        '## Requirements Coverage (요구사항 커버리지)',
        '| Requirement | Status | Blocking Issue |',
        '|-------------|--------|----------------|',
        '| [req] | pending | |',
        '',
        '## Result (결과)',
        '[검증 대기 중]',
      ].join('\n');
      fileName = `${padded}-VERIFICATION.md`;
      break;
    }
    default:
      error(`Unknown template type: ${templateType}. Available: summary, plan, verification`);
      return;
  }

  const fullContent = `---\n${reconstructFrontmatter(frontmatter)}\n---\n\n${body}\n`;
  const outPath = path.join(cwd, phaseInfo.directory, fileName);

  if (fs.existsSync(outPath)) {
    output({ error: 'File already exists', path: toPosixPath(path.relative(cwd, outPath)) }, raw);
    return;
  }

  fs.writeFileSync(outPath, normalizeMd(fullContent), 'utf-8');
  const relPath = toPosixPath(path.relative(cwd, outPath));
  output({ created: true, path: relPath, template: templateType }, raw, relPath);
}

module.exports = { cmdTemplateSelect, cmdTemplateFill };
