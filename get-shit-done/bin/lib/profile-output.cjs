/**
 * Profile Output — profile 렌더링, 설문, 산출물 생성
 *
 * 프로파일링 분석 결과를 사용자용 산출물로 렌더링한다:
 *   - write-profile: analysis JSON으로 USER-PROFILE.md 생성
 *   - profile-questionnaire: session이 없을 때 사용할 fallback
 *   - generate-dev-preferences: dev-preferences.md 명령 산출물 생성
 *   - generate-claude-profile: CLAUDE.md의 Developer Profile 섹션 생성
 *   - generate-claude-md: 관리 섹션이 포함된 전체 CLAUDE.md 생성
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { output, error, safeReadFile } = require('./core.cjs');

// ─── Constants ────────────────────────────────────────────────────────────────

const DIMENSION_KEYS = [
  'communication_style', 'decision_speed', 'explanation_depth',
  'debugging_approach', 'ux_philosophy', 'vendor_philosophy',
  'frustration_triggers', 'learning_style'
];

const PROFILING_QUESTIONS = [
  {
    dimension: 'communication_style',
    header: '커뮤니케이션 스타일',
    context: '최근 Claude에게 무언가를 만들거나 수정해 달라고 요청했던 순간을 떠올려 보세요. 보통 어떻게 요청을 시작하나요?',
    question: 'Claude에게 무언가를 만들어 달라고 할 때, 보통 얼마나 많은 맥락을 제공하나요?',
    options: [
      { label: '최소한만 제공 -- "버그 고쳐", "다크 모드 추가"처럼 필요한 말만 한다', value: 'a', rating: 'terse-direct' },
      { label: '어느 정도 제공 -- 한두 문단으로 무엇을 왜 원하는지 설명한다', value: 'b', rating: 'conversational' },
      { label: '상세 사양 제공 -- 제목, 번호 목록, 문제 분석, 제약조건까지 적는다', value: 'c', rating: 'detailed-structured' },
      { label: '작업에 따라 다름 -- 간단한 일은 짧게, 복잡한 일은 자세히 적는다', value: 'd', rating: 'mixed' },
    ],
  },
  {
    dimension: 'decision_speed',
    header: '의사결정 방식',
    context: 'Claude가 라이브러리, 아키텍처, 접근 방식을 여러 개 제안했던 상황을 떠올려 보세요.',
    question: 'Claude가 여러 선택지를 제시하면, 보통 어떻게 결정하나요?',
    options: [
      { label: '감이나 경험으로 빠르게 고른다', value: 'a', rating: 'fast-intuitive' },
      { label: '비교표나 장단점을 요청한 뒤 결정한다', value: 'b', rating: 'deliberate-informed' },
      { label: '문서나 GitHub 지표를 직접 조사한 뒤 결정한다', value: 'c', rating: 'research-first' },
      { label: 'Claude 추천을 따른다 -- 대체로 제안을 신뢰한다', value: 'd', rating: 'delegator' },
    ],
  },
  {
    dimension: 'explanation_depth',
    header: '설명 선호도',
    context: 'Claude가 자신이 작성한 코드나 선택한 접근을 설명할 때를 떠올려 보세요. 어느 정도 설명이 적당한가요?',
    question: 'Claude가 무언가를 설명할 때, 어느 정도 디테일을 원하나요?',
    options: [
      { label: '코드만 있으면 된다 -- 읽고 스스로 파악한다', value: 'a', rating: 'code-only' },
      { label: '짧은 설명이면 충분하다 -- 접근을 한두 문장으로 알려주면 된다', value: 'b', rating: 'concise' },
      { label: '상세한 워크스루가 좋다 -- 접근, 트레이드오프, 코드 구조까지 설명해 달라', value: 'c', rating: 'detailed' },
      { label: '깊이 있는 설명이 좋다 -- 개념과 원리를 배워서 기초를 이해하고 싶다', value: 'd', rating: 'educational' },
    ],
  },
  {
    dimension: 'debugging_approach',
    header: 'Debugging Style',
    context: 'Think about the last few times something broke in your code. How did you approach it with Claude?',
    question: 'When something breaks, how do you typically approach debugging with Claude?',
    options: [
      { label: 'Paste the error and say "fix it" -- get it working fast', value: 'a', rating: 'fix-first' },
      { label: 'Share the error plus context, ask Claude to diagnose what went wrong', value: 'b', rating: 'diagnostic' },
      { label: 'Investigate myself first, then ask Claude about my specific theories', value: 'c', rating: 'hypothesis-driven' },
      { label: 'Walk through the code together step by step to understand the issue', value: 'd', rating: 'collaborative' },
    ],
  },
  {
    dimension: 'ux_philosophy',
    header: 'UX Philosophy',
    context: 'Think about user-facing features you have built recently. How did you balance functionality with design?',
    question: 'When building user-facing features, what do you prioritize?',
    options: [
      { label: 'Get it working first, polish the UI later (or never)', value: 'a', rating: 'function-first' },
      { label: 'Basic usability from the start -- nothing ugly, but no pixel-perfection', value: 'b', rating: 'pragmatic' },
      { label: 'Design and UX are as important as functionality -- I care about the experience', value: 'c', rating: 'design-conscious' },
      { label: 'I mostly build backend, CLI, or infrastructure -- UX is minimal', value: 'd', rating: 'backend-focused' },
    ],
  },
  {
    dimension: 'vendor_philosophy',
    header: 'Library & Vendor Choices',
    context: 'Think about the last time you needed a library or service for a project. How did you go about choosing it?',
    question: 'When choosing libraries or services, what is your typical approach?',
    options: [
      { label: 'Use whatever Claude suggests -- speed matters more than the perfect choice', value: 'a', rating: 'pragmatic-fast' },
      { label: 'Prefer well-known, battle-tested options (React, PostgreSQL, Express)', value: 'b', rating: 'conservative' },
      { label: 'Research alternatives, read docs, compare benchmarks before committing', value: 'c', rating: 'thorough-evaluator' },
      { label: 'Strong opinions -- I already know what I like and I stick with it', value: 'd', rating: 'opinionated' },
    ],
  },
  {
    dimension: 'frustration_triggers',
    header: 'Frustration Triggers',
    context: 'Think about moments when working with AI coding assistants that made you frustrated or annoyed.',
    question: 'What frustrates you most when working with AI coding assistants?',
    options: [
      { label: 'Doing things I didn\'t ask for -- adding features, refactoring code, scope creep', value: 'a', rating: 'scope-creep' },
      { label: 'Not following instructions precisely -- ignoring constraints or requirements I stated', value: 'b', rating: 'instruction-adherence' },
      { label: 'Over-explaining or being too verbose -- just give me the code and move on', value: 'c', rating: 'verbosity' },
      { label: 'Breaking working code while fixing something else -- regressions', value: 'd', rating: 'regression' },
    ],
  },
  {
    dimension: 'learning_style',
    header: 'Learning Preferences',
    context: 'Think about encountering something new -- an unfamiliar library, a codebase you inherited, a concept you hadn\'t used before.',
    question: 'When you encounter something new in your codebase, how do you prefer to learn about it?',
    options: [
      { label: 'Read the code directly -- I figure things out by reading and experimenting', value: 'a', rating: 'self-directed' },
      { label: 'Ask Claude to explain the relevant parts to me', value: 'b', rating: 'guided' },
      { label: 'Read official docs and tutorials first, then try things', value: 'c', rating: 'documentation-first' },
      { label: 'See a working example, then modify it to understand how it works', value: 'd', rating: 'example-driven' },
    ],
  },
];

const CLAUDE_INSTRUCTIONS = {
  communication_style: {
    'terse-direct': 'Keep responses concise and action-oriented. Skip lengthy preambles. Match this developer\'s direct style.',
    'conversational': 'Use a natural conversational tone. Explain reasoning briefly alongside code. Engage with the developer\'s questions.',
    'detailed-structured': 'Match this developer\'s structured communication: use headers for sections, numbered lists for steps, and acknowledge provided context before responding.',
    'mixed': 'Adapt response detail to match the complexity of each request. Brief for simple tasks, detailed for complex ones.',
  },
  decision_speed: {
    'fast-intuitive': 'Present a single strong recommendation with brief justification. Skip lengthy comparisons unless asked.',
    'deliberate-informed': 'Present options in a structured comparison table with pros/cons. Let the developer make the final call.',
    'research-first': 'Include links to docs, GitHub repos, or benchmarks when recommending tools. Support the developer\'s research process.',
    'delegator': 'Make clear recommendations with confidence. Explain your reasoning briefly, but own the suggestion.',
  },
  explanation_depth: {
    'code-only': 'Prioritize code output. Add comments inline rather than prose explanations. Skip walkthroughs unless asked.',
    'concise': 'Pair code with a brief explanation (1-2 sentences) of the approach. Keep prose minimal.',
    'detailed': 'Explain the approach, key trade-offs, and code structure alongside the implementation. Use headers to organize.',
    'educational': 'Teach the underlying concepts and principles, not just the implementation. Relate new patterns to fundamentals.',
  },
  debugging_approach: {
    'fix-first': 'Prioritize the fix. Show the corrected code first, then optionally explain what was wrong. Minimize diagnostic preamble.',
    'diagnostic': 'Diagnose the root cause before presenting the fix. Explain what went wrong and why the fix addresses it.',
    'hypothesis-driven': 'Engage with the developer\'s theories. Validate or refine their hypotheses before jumping to solutions.',
    'collaborative': 'Walk through the debugging process step by step. Explain the investigation approach, not just the conclusion.',
  },
  ux_philosophy: {
    'function-first': 'Focus on functionality and correctness. Keep UI minimal and functional. Skip design polish unless requested.',
    'pragmatic': 'Build clean, usable interfaces without over-engineering. Apply basic design principles (spacing, alignment, contrast).',
    'design-conscious': 'Invest in UX quality: thoughtful spacing, smooth transitions, responsive layouts. Treat design as a first-class concern.',
    'backend-focused': 'Optimize for developer experience (clear APIs, good error messages, helpful CLI output) over visual design.',
  },
  vendor_philosophy: {
    'pragmatic-fast': 'Suggest libraries quickly based on popularity and reliability. Don\'t over-analyze choices for non-critical dependencies.',
    'conservative': 'Recommend well-established, widely-adopted tools with strong community support. Avoid bleeding-edge options.',
    'thorough-evaluator': 'Compare alternatives with specific metrics (bundle size, GitHub stars, maintenance activity). Support informed decisions.',
    'opinionated': 'Respect the developer\'s existing tool preferences. Ask before suggesting alternatives to their preferred stack.',
  },
  frustration_triggers: {
    'scope-creep': 'Do exactly what is asked -- nothing more. Never add unrequested features, refactoring, or "improvements". Ask before expanding scope.',
    'instruction-adherence': 'Follow instructions precisely. Re-read constraints before responding. If requirements conflict, flag the conflict rather than silently choosing.',
    'verbosity': 'Be concise. Lead with code, follow with brief explanation only if needed. Avoid restating the problem or unnecessary context.',
    'regression': 'Before modifying working code, verify the change is safe. Run existing tests mentally. Flag potential regression risks explicitly.',
  },
  learning_style: {
    'self-directed': 'Point to relevant code sections and let the developer explore. Add signposts (file paths, function names) rather than full explanations.',
    'guided': 'Explain concepts in context of the developer\'s codebase. Use their actual code as examples when teaching.',
    'documentation-first': 'Link to official documentation and relevant sections. Structure explanations like reference material.',
    'example-driven': 'Lead with working code examples. Show a minimal example first, then explain how to extend or modify it.',
  },
};

const CLAUDE_MD_FALLBACKS = {
  project: '프로젝트가 아직 초기화되지 않았습니다. /gsd:new-project를 실행해 설정하세요.',
  stack: '기술 스택이 아직 문서화되지 않았습니다. codebase mapping 또는 첫 phase 이후 채워집니다.',
  conventions: '컨벤션이 아직 정리되지 않았습니다. 개발 중 패턴이 쌓이면 채워집니다.',
  architecture: '아키텍처가 아직 정리되지 않았습니다. 현재 codebase의 기존 패턴을 따르세요.',
};

const CLAUDE_MD_WORKFLOW_ENFORCEMENT = [
  'Edit, Write 등 파일을 바꾸는 도구를 쓰기 전에 먼저 GSD 명령으로 작업을 시작해 planning 산출물과 실행 컨텍스트를 동기화하세요.',
  '',
  '다음 진입점을 사용하세요:',
  '- `/gsd:quick` 작은 수정, 문서 갱신, ad-hoc 작업',
  '- `/gsd:debug` 조사 및 버그 수정',
  '- `/gsd:execute-phase` 계획된 phase 작업',
  '',
  '사용자가 명시적으로 우회를 요청하지 않는 한, GSD 워크플로 밖에서 repo를 직접 수정하지 마세요.',
].join('\n');

const CLAUDE_MD_PROFILE_PLACEHOLDER = [
  '<!-- GSD:profile-start -->',
  '## Developer Profile',
  '',
  '> 프로필이 아직 설정되지 않았습니다. `/gsd:profile-user`를 실행해 개발자 프로필을 생성하세요.',
  '> 이 섹션은 `generate-claude-profile`이 관리합니다. 수동으로 편집하지 마세요.',
  '<!-- GSD:profile-end -->',
].join('\n');

// ─── Helper Functions ─────────────────────────────────────────────────────────

function isAmbiguousAnswer(dimension, value) {
  if (dimension === 'communication_style' && value === 'd') return true;
  const question = PROFILING_QUESTIONS.find(q => q.dimension === dimension);
  if (!question) return false;
  const option = question.options.find(o => o.value === value);
  if (!option) return false;
  return option.rating === 'mixed';
}

function generateClaudeInstruction(dimension, rating) {
  const dimInstructions = CLAUDE_INSTRUCTIONS[dimension];
  if (dimInstructions && dimInstructions[rating]) {
    return dimInstructions[rating];
  }
  return `Adapt to this developer's ${dimension.replace(/_/g, ' ')} preference: ${rating}.`;
}

function extractSectionContent(fileContent, sectionName) {
  const startMarker = `<!-- GSD:${sectionName}-start`;
  const endMarker = `<!-- GSD:${sectionName}-end -->`;
  const startIdx = fileContent.indexOf(startMarker);
  const endIdx = fileContent.indexOf(endMarker);
  if (startIdx === -1 || endIdx === -1) return null;
  const startTagEnd = fileContent.indexOf('-->', startIdx);
  if (startTagEnd === -1) return null;
  return fileContent.substring(startTagEnd + 3, endIdx);
}

function buildSection(sectionName, sourceFile, content) {
  return [
    `<!-- GSD:${sectionName}-start source:${sourceFile} -->`,
    content,
    `<!-- GSD:${sectionName}-end -->`,
  ].join('\n');
}

function updateSection(fileContent, sectionName, newContent) {
  const startMarker = `<!-- GSD:${sectionName}-start`;
  const endMarker = `<!-- GSD:${sectionName}-end -->`;
  const startIdx = fileContent.indexOf(startMarker);
  const endIdx = fileContent.indexOf(endMarker);
  if (startIdx !== -1 && endIdx !== -1) {
    const before = fileContent.substring(0, startIdx);
    const after = fileContent.substring(endIdx + endMarker.length);
    return { content: before + newContent + after, action: 'replaced' };
  }
  return { content: fileContent.trimEnd() + '\n\n' + newContent + '\n', action: 'appended' };
}

function detectManualEdit(fileContent, sectionName, expectedContent) {
  const currentContent = extractSectionContent(fileContent, sectionName);
  if (currentContent === null) return false;
  const normalize = (s) => s.trim().replace(/\n{3,}/g, '\n\n');
  return normalize(currentContent) !== normalize(expectedContent);
}

function extractMarkdownSection(content, sectionName) {
  if (!content) return null;
  const lines = content.split('\n');
  let capturing = false;
  const result = [];
  const headingPattern = new RegExp(`^## ${sectionName}\\s*$`);
  for (const line of lines) {
    if (headingPattern.test(line)) {
      capturing = true;
      result.push(line);
      continue;
    }
    if (capturing && /^## /.test(line)) break;
    if (capturing) result.push(line);
  }
  return result.length > 0 ? result.join('\n').trim() : null;
}

// ─── CLAUDE.md Section Generators ─────────────────────────────────────────────

function generateProjectSection(cwd) {
  const projectPath = path.join(cwd, '.planning', 'PROJECT.md');
  const content = safeReadFile(projectPath);
  if (!content) {
    return { content: CLAUDE_MD_FALLBACKS.project, source: 'PROJECT.md', hasFallback: true };
  }
  const parts = [];
  const h1Match = content.match(/^# (.+)$/m);
  if (h1Match) parts.push(`**${h1Match[1]}**`);
  const whatThisIs = extractMarkdownSection(content, 'What This Is');
  if (whatThisIs) {
    const body = whatThisIs.replace(/^## What This Is\s*/i, '').trim();
    if (body) parts.push(body);
  }
  const coreValue = extractMarkdownSection(content, 'Core Value');
  if (coreValue) {
    const body = coreValue.replace(/^## Core Value\s*/i, '').trim();
    if (body) parts.push(`**Core Value:** ${body}`);
  }
  const constraints = extractMarkdownSection(content, 'Constraints');
  if (constraints) {
    const body = constraints.replace(/^## Constraints\s*/i, '').trim();
    if (body) parts.push(`### Constraints\n\n${body}`);
  }
  if (parts.length === 0) {
    return { content: CLAUDE_MD_FALLBACKS.project, source: 'PROJECT.md', hasFallback: true };
  }
  return { content: parts.join('\n\n'), source: 'PROJECT.md', hasFallback: false };
}

function generateStackSection(cwd) {
  const codebasePath = path.join(cwd, '.planning', 'codebase', 'STACK.md');
  const researchPath = path.join(cwd, '.planning', 'research', 'STACK.md');
  let content = safeReadFile(codebasePath);
  let source = 'codebase/STACK.md';
  if (!content) {
    content = safeReadFile(researchPath);
    source = 'research/STACK.md';
  }
  if (!content) {
    return { content: CLAUDE_MD_FALLBACKS.stack, source: 'STACK.md', hasFallback: true };
  }
  const lines = content.split('\n');
  const summaryLines = [];
  let inTable = false;
  for (const line of lines) {
    if (line.startsWith('#')) {
      if (!line.startsWith('# ') || summaryLines.length > 0) summaryLines.push(line);
      continue;
    }
    if (line.startsWith('|')) { inTable = true; summaryLines.push(line); continue; }
    if (inTable && line.trim() === '') inTable = false;
    if (line.startsWith('- ') || line.startsWith('* ')) summaryLines.push(line);
  }
  const summary = summaryLines.length > 0 ? summaryLines.join('\n') : content.trim();
  return { content: summary, source, hasFallback: false };
}

function generateConventionsSection(cwd) {
  const conventionsPath = path.join(cwd, '.planning', 'codebase', 'CONVENTIONS.md');
  const content = safeReadFile(conventionsPath);
  if (!content) {
    return { content: CLAUDE_MD_FALLBACKS.conventions, source: 'CONVENTIONS.md', hasFallback: true };
  }
  const lines = content.split('\n');
  const summaryLines = [];
  for (const line of lines) {
    if (line.startsWith('#')) { if (!line.startsWith('# ')) summaryLines.push(line); continue; }
    if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('|')) summaryLines.push(line);
  }
  const summary = summaryLines.length > 0 ? summaryLines.join('\n') : content.trim();
  return { content: summary, source: 'CONVENTIONS.md', hasFallback: false };
}

function generateArchitectureSection(cwd) {
  const architecturePath = path.join(cwd, '.planning', 'codebase', 'ARCHITECTURE.md');
  const content = safeReadFile(architecturePath);
  if (!content) {
    return { content: CLAUDE_MD_FALLBACKS.architecture, source: 'ARCHITECTURE.md', hasFallback: true };
  }
  const lines = content.split('\n');
  const summaryLines = [];
  for (const line of lines) {
    if (line.startsWith('#')) { if (!line.startsWith('# ')) summaryLines.push(line); continue; }
    if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('|') || line.startsWith('```')) summaryLines.push(line);
  }
  const summary = summaryLines.length > 0 ? summaryLines.join('\n') : content.trim();
  return { content: summary, source: 'ARCHITECTURE.md', hasFallback: false };
}

function generateWorkflowSection() {
  return {
    content: CLAUDE_MD_WORKFLOW_ENFORCEMENT,
    source: 'GSD defaults',
    hasFallback: false,
  };
}

// ─── Commands ─────────────────────────────────────────────────────────────────

function cmdWriteProfile(cwd, options, raw) {
  if (!options.input) {
    error('--input <analysis-json-path> is required');
  }

  let analysisPath = options.input;
  if (!path.isAbsolute(analysisPath)) analysisPath = path.join(cwd, analysisPath);
  if (!fs.existsSync(analysisPath)) error(`Analysis file not found: ${analysisPath}`);

  let analysis;
  try {
    analysis = JSON.parse(fs.readFileSync(analysisPath, 'utf-8'));
  } catch (err) {
    error(`Failed to parse analysis JSON: ${err.message}`);
  }

  if (!analysis.dimensions || typeof analysis.dimensions !== 'object') {
    error('Analysis JSON must contain a "dimensions" object');
  }
  if (!analysis.profile_version) {
    error('Analysis JSON must contain "profile_version"');
  }

  const SENSITIVE_PATTERNS = [
    /sk-[a-zA-Z0-9]{20,}/g,
    /Bearer\s+[a-zA-Z0-9._-]+/gi,
    /password\s*[:=]\s*\S+/gi,
    /secret\s*[:=]\s*\S+/gi,
    /token\s*[:=]\s*\S+/gi,
    /api[_-]?key\s*[:=]\s*\S+/gi,
    /\/Users\/[a-zA-Z0-9._-]+\//g,
    /\/home\/[a-zA-Z0-9._-]+\//g,
    /ghp_[a-zA-Z0-9]{36}/g,
    /gho_[a-zA-Z0-9]{36}/g,
    /xoxb-[a-zA-Z0-9-]+/g,
  ];

  let redactedCount = 0;

  function redactSensitive(text) {
    if (typeof text !== 'string') return text;
    let result = text;
    for (const pattern of SENSITIVE_PATTERNS) {
      pattern.lastIndex = 0;
      const matches = result.match(pattern);
      if (matches) {
        redactedCount += matches.length;
        result = result.replace(pattern, '[REDACTED]');
      }
    }
    return result;
  }

  for (const dimKey of Object.keys(analysis.dimensions)) {
    const dim = analysis.dimensions[dimKey];
    if (dim.evidence && Array.isArray(dim.evidence)) {
      for (let i = 0; i < dim.evidence.length; i++) {
        const ev = dim.evidence[i];
        if (ev.quote) ev.quote = redactSensitive(ev.quote);
        if (ev.example) ev.example = redactSensitive(ev.example);
        if (ev.signal) ev.signal = redactSensitive(ev.signal);
      }
    }
  }

  if (redactedCount > 0) {
    process.stderr.write(`Sensitive content redacted: ${redactedCount} pattern(s) removed from evidence quotes\n`);
  }

  const templatePath = path.join(__dirname, '..', '..', 'templates', 'user-profile.md');
  if (!fs.existsSync(templatePath)) error(`Template not found: ${templatePath}`);
  let template = fs.readFileSync(templatePath, 'utf-8');

  const dimensionLabels = {
    communication_style: 'Communication',
    decision_speed: 'Decisions',
    explanation_depth: 'Explanations',
    debugging_approach: 'Debugging',
    ux_philosophy: 'UX Philosophy',
    vendor_philosophy: 'Vendor Philosophy',
    frustration_triggers: 'Frustration Triggers',
    learning_style: 'Learning Style',
  };

  const summaryLines = [];
  let highCount = 0, mediumCount = 0, lowCount = 0, dimensionsScored = 0;

  for (const dimKey of DIMENSION_KEYS) {
    const dim = analysis.dimensions[dimKey];
    if (!dim) continue;
    const conf = (dim.confidence || '').toUpperCase();
    if (conf === 'HIGH' || conf === 'MEDIUM' || conf === 'LOW') dimensionsScored++;
    if (conf === 'HIGH') {
      highCount++;
      if (dim.claude_instruction) summaryLines.push(`- **${dimensionLabels[dimKey] || dimKey}:** ${dim.claude_instruction} (HIGH)`);
    } else if (conf === 'MEDIUM') {
      mediumCount++;
      if (dim.claude_instruction) summaryLines.push(`- **${dimensionLabels[dimKey] || dimKey}:** ${dim.claude_instruction} (MEDIUM)`);
    } else if (conf === 'LOW') {
      lowCount++;
    }
  }

  const summaryInstructions = summaryLines.length > 0
    ? summaryLines.join('\n')
    : '- No high or medium confidence dimensions scored yet.';

  template = template.replace(/\{\{generated_at\}\}/g, new Date().toISOString());
  template = template.replace(/\{\{data_source\}\}/g, analysis.data_source || 'session_analysis');
  template = template.replace(/\{\{projects_list\}\}/g, (analysis.projects_list || analysis.projects_analyzed || []).join(', '));
  template = template.replace(/\{\{message_count\}\}/g, String(analysis.message_count || analysis.messages_analyzed || 0));
  template = template.replace(/\{\{summary_instructions\}\}/g, summaryInstructions);
  template = template.replace(/\{\{profile_version\}\}/g, analysis.profile_version);
  template = template.replace(/\{\{projects_count\}\}/g, String((analysis.projects_list || analysis.projects_analyzed || []).length));
  template = template.replace(/\{\{dimensions_scored\}\}/g, String(dimensionsScored));
  template = template.replace(/\{\{high_confidence_count\}\}/g, String(highCount));
  template = template.replace(/\{\{medium_confidence_count\}\}/g, String(mediumCount));
  template = template.replace(/\{\{low_confidence_count\}\}/g, String(lowCount));
  template = template.replace(/\{\{sensitive_excluded_summary\}\}/g,
    redactedCount > 0 ? `${redactedCount} pattern(s) redacted` : 'None detected');

  for (const dimKey of DIMENSION_KEYS) {
    const dim = analysis.dimensions[dimKey] || {};
    const rating = dim.rating || 'UNSCORED';
    const confidence = dim.confidence || 'UNSCORED';
    const instruction = dim.claude_instruction || 'No strong preference detected. Ask the developer when this dimension is relevant.';
    const summary = dim.summary || '';

    let evidenceBlock = '';
    const evidenceArr = dim.evidence_quotes || dim.evidence;
    if (evidenceArr && Array.isArray(evidenceArr) && evidenceArr.length > 0) {
      const evidenceLines = evidenceArr.map(ev => {
        const signal = ev.signal || ev.pattern || '';
        const quote = ev.quote || ev.example || '';
        const project = ev.project || 'unknown';
        return `- **Signal:** ${signal} / **Example:** "${quote}" -- project: ${project}`;
      });
      evidenceBlock = evidenceLines.join('\n');
    } else {
      evidenceBlock = '- No evidence collected for this dimension.';
    }

    template = template.replace(new RegExp(`\\{\\{${dimKey}\\.rating\\}\\}`, 'g'), rating);
    template = template.replace(new RegExp(`\\{\\{${dimKey}\\.confidence\\}\\}`, 'g'), confidence);
    template = template.replace(new RegExp(`\\{\\{${dimKey}\\.claude_instruction\\}\\}`, 'g'), instruction);
    template = template.replace(new RegExp(`\\{\\{${dimKey}\\.summary\\}\\}`, 'g'), summary);
    template = template.replace(new RegExp(`\\{\\{${dimKey}\\.evidence\\}\\}`, 'g'), evidenceBlock);
  }

  let outputPath = options.output;
  if (!outputPath) {
    outputPath = path.join(os.homedir(), '.claude', 'get-shit-done', 'USER-PROFILE.md');
  } else if (!path.isAbsolute(outputPath)) {
    outputPath = path.join(cwd, outputPath);
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, template, 'utf-8');

  const result = {
    profile_path: outputPath,
    dimensions_scored: dimensionsScored,
    high_confidence: highCount,
    medium_confidence: mediumCount,
    low_confidence: lowCount,
    sensitive_redacted: redactedCount,
    source: analysis.data_source || 'session_analysis',
  };

  output(result, raw);
}

function cmdProfileQuestionnaire(options, raw) {
  if (!options.answers) {
    const questionsOutput = {
      mode: 'interactive',
      questions: PROFILING_QUESTIONS.map(q => ({
        dimension: q.dimension,
        header: q.header,
        context: q.context,
        question: q.question,
        options: q.options.map(o => ({ label: o.label, value: o.value })),
      })),
    };
    output(questionsOutput, raw);
    return;
  }

  const answerValues = options.answers.split(',').map(a => a.trim());
  if (answerValues.length !== PROFILING_QUESTIONS.length) {
    error(`Expected ${PROFILING_QUESTIONS.length} answers (comma-separated), got ${answerValues.length}`);
  }

  const analysis = {
    profile_version: '1.0',
    analyzed_at: new Date().toISOString(),
    data_source: 'questionnaire',
    projects_analyzed: [],
    messages_analyzed: 0,
    message_threshold: 'questionnaire',
    sensitive_excluded: [],
    dimensions: {},
  };

  for (let i = 0; i < PROFILING_QUESTIONS.length; i++) {
    const question = PROFILING_QUESTIONS[i];
    const answerValue = answerValues[i];
    const selectedOption = question.options.find(o => o.value === answerValue);

    if (!selectedOption) {
      error(`Invalid answer "${answerValue}" for ${question.dimension}. Valid values: ${question.options.map(o => o.value).join(', ')}`);
    }

    const ambiguous = isAmbiguousAnswer(question.dimension, answerValue);

    analysis.dimensions[question.dimension] = {
      rating: selectedOption.rating,
      confidence: ambiguous ? 'LOW' : 'MEDIUM',
      evidence_count: 1,
      cross_project_consistent: null,
      evidence: [{
        signal: 'Self-reported via questionnaire',
        quote: selectedOption.label,
        project: 'N/A (questionnaire)',
      }],
      summary: `Developer self-reported as ${selectedOption.rating} for ${question.header.toLowerCase()}.`,
      claude_instruction: generateClaudeInstruction(question.dimension, selectedOption.rating),
    };
  }

  output(analysis, raw);
}

function cmdGenerateDevPreferences(cwd, options, raw) {
  if (!options.analysis) error('--analysis <path> is required');

  let analysisPath = options.analysis;
  if (!path.isAbsolute(analysisPath)) analysisPath = path.join(cwd, analysisPath);
  if (!fs.existsSync(analysisPath)) error(`Analysis file not found: ${analysisPath}`);

  let analysis;
  try {
    analysis = JSON.parse(fs.readFileSync(analysisPath, 'utf-8'));
  } catch (err) {
    error(`Failed to parse analysis JSON: ${err.message}`);
  }

  if (!analysis.dimensions || typeof analysis.dimensions !== 'object') {
    error('Analysis JSON must contain a "dimensions" object');
  }

  const devPrefLabels = {
    communication_style: 'Communication',
    decision_speed: 'Decision Support',
    explanation_depth: 'Explanations',
    debugging_approach: 'Debugging',
    ux_philosophy: 'UX Approach',
    vendor_philosophy: 'Library & Tool Choices',
    frustration_triggers: 'Boundaries',
    learning_style: 'Learning Support',
  };

  const templatePath = path.join(__dirname, '..', '..', 'templates', 'dev-preferences.md');
  if (!fs.existsSync(templatePath)) error(`Template not found: ${templatePath}`);
  let template = fs.readFileSync(templatePath, 'utf-8');

  const directiveLines = [];
  const dimensionsIncluded = [];

  for (const dimKey of DIMENSION_KEYS) {
    const dim = analysis.dimensions[dimKey];
    if (!dim) continue;
    const label = devPrefLabels[dimKey] || dimKey;
    const confidence = dim.confidence || 'UNSCORED';
    let instruction = dim.claude_instruction;
    if (!instruction) {
      const lookup = CLAUDE_INSTRUCTIONS[dimKey];
      if (lookup && dim.rating && lookup[dim.rating]) {
        instruction = lookup[dim.rating];
      } else {
        instruction = `Adapt to this developer's ${dimKey.replace(/_/g, ' ')} preference.`;
      }
    }
    directiveLines.push(`### ${label}\n${instruction} (${confidence} confidence)\n`);
    dimensionsIncluded.push(dimKey);
  }

  const directivesBlock = directiveLines.join('\n').trim();
  template = template.replace(/\{\{behavioral_directives\}\}/g, directivesBlock);
  template = template.replace(/\{\{generated_at\}\}/g, new Date().toISOString());
  template = template.replace(/\{\{data_source\}\}/g, analysis.data_source || 'session_analysis');

  let stackBlock;
  if (analysis.data_source === 'questionnaire') {
    stackBlock = 'Stack preferences not available (questionnaire-only profile). Run `/gsd:profile-user --refresh` with session data to populate.';
  } else if (options.stack) {
    stackBlock = options.stack;
  } else {
    stackBlock = 'Stack preferences will be populated from session analysis.';
  }
  template = template.replace(/\{\{stack_preferences\}\}/g, stackBlock);

  let outputPath = options.output;
  if (!outputPath) {
    outputPath = path.join(os.homedir(), '.claude', 'commands', 'gsd', 'dev-preferences.md');
  } else if (!path.isAbsolute(outputPath)) {
    outputPath = path.join(cwd, outputPath);
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, template, 'utf-8');

  const result = {
    command_path: outputPath,
    command_name: '/gsd:dev-preferences',
    dimensions_included: dimensionsIncluded,
    source: analysis.data_source || 'session_analysis',
  };

  output(result, raw);
}

function cmdGenerateClaudeProfile(cwd, options, raw) {
  if (!options.analysis) error('--analysis <path> is required');

  let analysisPath = options.analysis;
  if (!path.isAbsolute(analysisPath)) analysisPath = path.join(cwd, analysisPath);
  if (!fs.existsSync(analysisPath)) error(`Analysis file not found: ${analysisPath}`);

  let analysis;
  try {
    analysis = JSON.parse(fs.readFileSync(analysisPath, 'utf-8'));
  } catch (err) {
    error(`Failed to parse analysis JSON: ${err.message}`);
  }

  if (!analysis.dimensions || typeof analysis.dimensions !== 'object') {
    error('Analysis JSON must contain a "dimensions" object');
  }

  const profileLabels = {
    communication_style: 'Communication',
    decision_speed: 'Decisions',
    explanation_depth: 'Explanations',
    debugging_approach: 'Debugging',
    ux_philosophy: 'UX Philosophy',
    vendor_philosophy: 'Vendor Choices',
    frustration_triggers: 'Frustrations',
    learning_style: 'Learning',
  };

  const dataSource = analysis.data_source || 'session_analysis';
  const tableRows = [];
  const directiveLines = [];
  const dimensionsIncluded = [];

  for (const dimKey of DIMENSION_KEYS) {
    const dim = analysis.dimensions[dimKey];
    if (!dim) continue;
    const label = profileLabels[dimKey] || dimKey;
    const rating = dim.rating || 'UNSCORED';
    const confidence = dim.confidence || 'UNSCORED';
    tableRows.push(`| ${label} | ${rating} | ${confidence} |`);
    let instruction = dim.claude_instruction;
    if (!instruction) {
      const lookup = CLAUDE_INSTRUCTIONS[dimKey];
      if (lookup && dim.rating && lookup[dim.rating]) {
        instruction = lookup[dim.rating];
      } else {
        instruction = `Adapt to this developer's ${dimKey.replace(/_/g, ' ')} preference.`;
      }
    }
    directiveLines.push(`- **${label}:** ${instruction}`);
    dimensionsIncluded.push(dimKey);
  }

  const sectionLines = [
    '<!-- GSD:profile-start -->',
    '## Developer Profile',
    '',
    `> Generated by GSD from ${dataSource}. Run \`/gsd:profile-user --refresh\` to update.`,
    '',
    '| Dimension | Rating | Confidence |',
    '|-----------|--------|------------|',
    ...tableRows,
    '',
    '**Directives:**',
    ...directiveLines,
    '<!-- GSD:profile-end -->',
  ];

  const sectionContent = sectionLines.join('\n');

  let targetPath;
  if (options.global) {
    targetPath = path.join(os.homedir(), '.claude', 'CLAUDE.md');
  } else if (options.output) {
    targetPath = path.isAbsolute(options.output) ? options.output : path.join(cwd, options.output);
  } else {
    targetPath = path.join(cwd, 'CLAUDE.md');
  }

  let action;

  if (fs.existsSync(targetPath)) {
    let existingContent = fs.readFileSync(targetPath, 'utf-8');
    const startMarker = '<!-- GSD:profile-start -->';
    const endMarker = '<!-- GSD:profile-end -->';
    const startIdx = existingContent.indexOf(startMarker);
    const endIdx = existingContent.indexOf(endMarker);

    if (startIdx !== -1 && endIdx !== -1) {
      const before = existingContent.substring(0, startIdx);
      const after = existingContent.substring(endIdx + endMarker.length);
      existingContent = before + sectionContent + after;
      action = 'updated';
    } else {
      existingContent = existingContent.trimEnd() + '\n\n' + sectionContent + '\n';
      action = 'appended';
    }
    fs.writeFileSync(targetPath, existingContent, 'utf-8');
  } else {
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, sectionContent + '\n', 'utf-8');
    action = 'created';
  }

  const result = {
    claude_md_path: targetPath,
    action,
    dimensions_included: dimensionsIncluded,
    is_global: !!options.global,
  };

  output(result, raw);
}

function cmdGenerateClaudeMd(cwd, options, raw) {
  const MANAGED_SECTIONS = ['project', 'stack', 'conventions', 'architecture', 'workflow'];
  const generators = {
    project: generateProjectSection,
    stack: generateStackSection,
    conventions: generateConventionsSection,
    architecture: generateArchitectureSection,
    workflow: generateWorkflowSection,
  };
  const sectionHeadings = {
    project: '## Project',
    stack: '## Technology Stack',
    conventions: '## Conventions',
    architecture: '## Architecture',
    workflow: '## GSD Workflow Enforcement',
  };

  const generated = {};
  const sectionsGenerated = [];
  const sectionsFallback = [];
  const sectionsSkipped = [];

  for (const name of MANAGED_SECTIONS) {
    const gen = generators[name](cwd);
    generated[name] = gen;
    if (gen.hasFallback) {
      sectionsFallback.push(name);
    } else {
      sectionsGenerated.push(name);
    }
  }

  let outputPath = options.output;
  if (!outputPath) {
    outputPath = path.join(cwd, 'CLAUDE.md');
  } else if (!path.isAbsolute(outputPath)) {
    outputPath = path.join(cwd, outputPath);
  }

  let existingContent = safeReadFile(outputPath);
  let action;

  if (existingContent === null) {
    const sections = [];
    for (const name of MANAGED_SECTIONS) {
      const gen = generated[name];
      const heading = sectionHeadings[name];
      const body = `${heading}\n\n${gen.content}`;
      sections.push(buildSection(name, gen.source, body));
    }
    sections.push('');
    sections.push(CLAUDE_MD_PROFILE_PLACEHOLDER);
    existingContent = sections.join('\n\n') + '\n';
    action = 'created';
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, existingContent, 'utf-8');
  } else {
    action = 'updated';
    let fileContent = existingContent;

    for (const name of MANAGED_SECTIONS) {
      const gen = generated[name];
      const heading = sectionHeadings[name];
      const body = `${heading}\n\n${gen.content}`;
      const fullSection = buildSection(name, gen.source, body);
      const hasMarkers = fileContent.indexOf(`<!-- GSD:${name}-start`) !== -1;

      if (hasMarkers) {
        if (options.auto) {
          const expectedBody = `${heading}\n\n${gen.content}`;
          if (detectManualEdit(fileContent, name, expectedBody)) {
            sectionsSkipped.push(name);
            const genIdx = sectionsGenerated.indexOf(name);
            if (genIdx !== -1) sectionsGenerated.splice(genIdx, 1);
            const fbIdx = sectionsFallback.indexOf(name);
            if (fbIdx !== -1) sectionsFallback.splice(fbIdx, 1);
            continue;
          }
        }
        const result = updateSection(fileContent, name, fullSection);
        fileContent = result.content;
      } else {
        const result = updateSection(fileContent, name, fullSection);
        fileContent = result.content;
      }
    }

    if (!options.auto && fileContent.indexOf('<!-- GSD:profile-start') === -1) {
      fileContent = fileContent.trimEnd() + '\n\n' + CLAUDE_MD_PROFILE_PLACEHOLDER + '\n';
    }

    fs.writeFileSync(outputPath, fileContent, 'utf-8');
  }

  const finalContent = safeReadFile(outputPath);
  let profileStatus;
  if (finalContent && finalContent.indexOf('<!-- GSD:profile-start') !== -1) {
    if (action === 'created' || existingContent.indexOf('<!-- GSD:profile-start') === -1) {
      profileStatus = 'placeholder_added';
    } else {
      profileStatus = 'exists';
    }
  } else {
    profileStatus = 'already_present';
  }

  const genCount = sectionsGenerated.length;
  const totalManaged = MANAGED_SECTIONS.length;
  let message = `Generated ${genCount}/${totalManaged} sections.`;
  if (sectionsFallback.length > 0) message += ` Fallback: ${sectionsFallback.join(', ')}.`;
  if (sectionsSkipped.length > 0) message += ` Skipped (manually edited): ${sectionsSkipped.join(', ')}.`;
  if (profileStatus === 'placeholder_added') message += ' Run /gsd:profile-user to unlock Developer Profile.';

  const result = {
    claude_md_path: outputPath,
    action,
    sections_generated: sectionsGenerated,
    sections_fallback: sectionsFallback,
    sections_skipped: sectionsSkipped,
    sections_total: totalManaged,
    profile_status: profileStatus,
    message,
  };

  output(result, raw);
}

module.exports = {
  cmdWriteProfile,
  cmdProfileQuestionnaire,
  cmdGenerateDevPreferences,
  cmdGenerateClaudeProfile,
  cmdGenerateClaudeMd,
  PROFILING_QUESTIONS,
  CLAUDE_INSTRUCTIONS,
};
