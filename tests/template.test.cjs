/**
 * Template Tests
 *
 * Tests for cmdTemplateSelect (heuristic template selection) and
 * cmdTemplateFill (summary, plan, verification template generation).
 */

const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { runGsdTools, runCodexGsdTools, createTempProject, cleanup } = require('./helpers.cjs');

// ─── template select ──────────────────────────────────────────────────────────

describe('template select command', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = createTempProject();
    // Create a phase directory with a plan
    const phaseDir = path.join(tmpDir, '.planning', 'phases', '01-setup');
    fs.mkdirSync(phaseDir, { recursive: true });
  });

  afterEach(() => {
    cleanup(tmpDir);
  });

  test('selects minimal template for simple plan', () => {
    const planPath = path.join(tmpDir, '.planning', 'phases', '01-setup', '01-01-PLAN.md');
    fs.writeFileSync(planPath, [
      '# Plan',
      '',
      '### Task 1',
      'Do the thing.',
      '',
      'File: `src/index.ts`',
    ].join('\n'));

    const result = runGsdTools(`template select .planning/phases/01-setup/01-01-PLAN.md`, tmpDir);
    assert.ok(result.success, `Failed: ${result.error}`);
    const out = JSON.parse(result.output);
    assert.strictEqual(out.type, 'minimal');
    assert.ok(out.template.includes('summary-minimal'));
  });

  test('selects standard template for moderate plan', () => {
    const planPath = path.join(tmpDir, '.planning', 'phases', '01-setup', '01-01-PLAN.md');
    fs.writeFileSync(planPath, [
      '# Plan',
      '',
      '### Task 1',
      'Create `src/auth/login.ts`',
      '',
      '### Task 2',
      'Create `src/auth/register.ts`',
      '',
      '### Task 3',
      'Update `src/routes/index.ts`',
      '',
      'Files: `src/auth/login.ts`, `src/auth/register.ts`, `src/routes/index.ts`, `src/middleware/auth.ts`',
    ].join('\n'));

    const result = runGsdTools(`template select .planning/phases/01-setup/01-01-PLAN.md`, tmpDir);
    assert.ok(result.success, `Failed: ${result.error}`);
    const out = JSON.parse(result.output);
    assert.strictEqual(out.type, 'standard');
  });

  test('selects complex template for plan with decisions and many files', () => {
    const planPath = path.join(tmpDir, '.planning', 'phases', '01-setup', '01-01-PLAN.md');
    const lines = ['# Plan', ''];
    for (let i = 1; i <= 6; i++) {
      lines.push(`### Task ${i}`, `Do task ${i}.`, '');
    }
    lines.push('Made a decision about architecture.', 'Another decision here.');
    for (let i = 1; i <= 8; i++) {
      lines.push(`File: \`src/module${i}/index.ts\``);
    }
    fs.writeFileSync(planPath, lines.join('\n'));

    const result = runGsdTools(`template select .planning/phases/01-setup/01-01-PLAN.md`, tmpDir);
    assert.ok(result.success, `Failed: ${result.error}`);
    const out = JSON.parse(result.output);
    assert.strictEqual(out.type, 'complex');
  });

  test('returns standard as fallback for nonexistent file', () => {
    const result = runGsdTools(`template select .planning/phases/01-setup/nonexistent.md`, tmpDir);
    assert.ok(result.success, `Failed: ${result.error}`);
    const out = JSON.parse(result.output);
    assert.strictEqual(out.type, 'standard');
    assert.ok(out.error, 'should include error message');
  });
});

// ─── template fill ────────────────────────────────────────────────────────────

describe('template fill command', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = createTempProject();
    const phaseDir = path.join(tmpDir, '.planning', 'phases', '01-setup');
    fs.mkdirSync(phaseDir, { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, '.planning', 'ROADMAP.md'),
      '## Roadmap\n\n### Phase 1: Setup\n**Goal:** Initial setup\n'
    );
  });

  afterEach(() => {
    cleanup(tmpDir);
  });

  test('fills summary template', () => {
    const result = runGsdTools('template fill summary --phase 1', tmpDir);
    assert.ok(result.success, `Failed: ${result.error}`);
    const out = JSON.parse(result.output);
    assert.strictEqual(out.created, true);
    assert.ok(out.path.includes('01-01-SUMMARY.md'));

    const content = fs.readFileSync(path.join(tmpDir, out.path), 'utf-8');
    assert.ok(content.includes('---'), 'should have frontmatter');
    assert.ok(content.includes('Phase 1'), 'should reference phase');
    assert.ok(content.includes('요약 (Summary)'), 'should use Korean-first summary heading');
    assert.ok(content.includes('## Accomplishments (주요 성과)'), 'should have Korean-first accomplishments section');
    assert.ok(content.includes('**Tasks:**'), 'should preserve machine-readable Tasks label');
  });

  test('fills plan template', () => {
    const result = runGsdTools('template fill plan --phase 1', tmpDir);
    assert.ok(result.success, `Failed: ${result.error}`);
    const out = JSON.parse(result.output);
    assert.strictEqual(out.created, true);
    assert.ok(out.path.includes('01-01-PLAN.md'));

    const content = fs.readFileSync(path.join(tmpDir, out.path), 'utf-8');
    assert.ok(content.includes('---'), 'should have frontmatter');
    assert.ok(content.includes('## Objective'), 'should have objective section');
    assert.ok(content.includes('이 plan이 구축할 내용'), 'should use Korean-first objective guidance');
    assert.ok(content.includes('<task type="code">'), 'should have task XML');
  });

  test('fills verification template', () => {
    const result = runGsdTools('template fill verification --phase 1', tmpDir);
    assert.ok(result.success, `Failed: ${result.error}`);
    const out = JSON.parse(result.output);
    assert.strictEqual(out.created, true);
    assert.ok(out.path.includes('01-VERIFICATION.md'));

    const content = fs.readFileSync(path.join(tmpDir, out.path), 'utf-8');
    assert.ok(content.includes('검증 (Verification)'), 'should use Korean-first verification title');
    assert.ok(content.includes('Observable Truths (관찰 가능한 사실)'), 'should have Korean-first truths section');
    assert.ok(content.includes('Required Artifacts (필수 산출물)'), 'should have Korean-first artifacts section');
    assert.ok(content.includes('[검증 대기 중]'), 'should include Korean pending state');
  });

  test('rejects existing file', () => {
    // Create the file first
    const phaseDir = path.join(tmpDir, '.planning', 'phases', '01-setup');
    fs.writeFileSync(path.join(phaseDir, '01-01-SUMMARY.md'), '# Existing');

    const result = runGsdTools('template fill summary --phase 1', tmpDir);
    assert.ok(result.success); // outputs JSON, doesn't crash
    const out = JSON.parse(result.output);
    assert.ok(out.error, 'should report error for existing file');
    assert.ok(out.error.includes('already exists'));
  });

  test('errors on unknown template type', () => {
    const result = runGsdTools('template fill bogus --phase 1', tmpDir);
    assert.ok(!result.success, 'should fail for unknown type');
    assert.ok(result.error.includes('Unknown template type'));
  });

  test('errors when phase not found', () => {
    const result = runGsdTools('template fill summary --phase 99', tmpDir);
    assert.ok(result.success);
    const out = JSON.parse(result.output);
    assert.ok(out.error, 'should report phase not found');
  });

  test('respects --plan option for plan number', () => {
    const result = runGsdTools('template fill plan --phase 1 --plan 03', tmpDir);
    assert.ok(result.success, `Failed: ${result.error}`);
    const out = JSON.parse(result.output);
    assert.ok(out.path.includes('01-03-PLAN.md'), `Expected plan 03 in path, got ${out.path}`);
  });

  test('installed codex runtime fills Korean-first summary template', () => {
    const result = runCodexGsdTools(['template', 'fill', 'summary', '--phase', '1'], tmpDir);
    assert.ok(result.success, `Failed: ${result.error}`);
    const out = JSON.parse(result.output);
    const content = fs.readFileSync(path.join(tmpDir, out.path), 'utf-8');

    assert.ok(content.includes('요약 (Summary)'), 'should use Korean-first summary heading in installed runtime');
    assert.ok(content.includes('## Accomplishments (주요 성과)'), 'should use Korean-first accomplishments section in installed runtime');
    assert.ok(content.includes('**Tasks:**'), 'should preserve machine-readable Tasks label in installed runtime');
  });

  test('installed codex runtime fills Korean-first plan and verification templates', () => {
    const planResult = runCodexGsdTools(['template', 'fill', 'plan', '--phase', '1'], tmpDir);
    assert.ok(planResult.success, `Plan failed: ${planResult.error}`);
    const planOut = JSON.parse(planResult.output);
    const planContent = fs.readFileSync(path.join(tmpDir, planOut.path), 'utf-8');

    assert.ok(planContent.includes('[이 plan이 구축할 내용]'), 'should use Korean-first objective guidance in installed runtime plan');
    assert.ok(planContent.includes('<task type="code">'), 'should preserve task XML in installed runtime plan');

    const verificationResult = runCodexGsdTools(['template', 'fill', 'verification', '--phase', '1'], tmpDir);
    assert.ok(verificationResult.success, `Verification failed: ${verificationResult.error}`);
    const verificationOut = JSON.parse(verificationResult.output);
    const verificationContent = fs.readFileSync(path.join(tmpDir, verificationOut.path), 'utf-8');

    assert.ok(verificationContent.includes('검증 (Verification)'), 'should use Korean-first verification title in installed runtime');
    assert.ok(verificationContent.includes('status: pending'), 'should preserve pending status field in installed runtime verification');
  });
});

describe('localized planning templates', () => {
  const templateChecks = [
    {
      file: ['get-shit-done', 'templates', 'project.md'],
      snippets: ['한국어로 빠르게 작성', '기존 코드베이스에서 시작할 때는 다음 순서를 권장합니다.'],
      machineTokens: ['## What This Is', '## Core Value', '## Requirements'],
    },
    {
      file: ['get-shit-done', 'templates', 'requirements.md'],
      snippets: ['이번 milestone에서 실제로 구현하고 검증할 요구사항입니다.', '이번 범위에서 명시적으로 제외한 항목입니다.'],
      machineTokens: ['## Out of Scope', '## Traceability'],
    },
    {
      file: ['get-shit-done', 'templates', 'roadmap.md'],
      snippets: ['roadmap 설명과 예시를 한국어로 제공', '사용자 관점에서 확인 가능한 결과'],
      machineTokens: ['**Goal**:', '**Depends on**:', '**Requirements**:', '**Success Criteria**', '**Plans**:'],
    },
    {
      file: ['get-shit-done', 'templates', 'state.md'],
      snippets: ['세션이 바뀌어도 프로젝트가 어디까지 왔는지 즉시 알게 해 주는', '한 번 읽고 지금 상태를 안다'],
      machineTokens: ['# Project State', '## Project Reference', '## Current Position', '**Current focus:**'],
    },
    {
      file: ['get-shit-done', 'templates', 'codebase', 'stack.md'],
      snippets: ['한국어로 채우기 위한 기준 문서입니다.', 'CLI 런타임과 테스트 코드'],
      machineTokens: ['# Technology Stack'],
    },
    {
      file: ['get-shit-done', 'templates', 'codebase', 'architecture.md'],
      snippets: ['코드가 개념적으로 어떻게 나뉘어 있는지', '문서 중심 CLI + 설치 런타임 동기화 구조'],
      machineTokens: ['# Architecture'],
    },
    {
      file: ['get-shit-done', 'templates', 'codebase', 'structure.md'],
      snippets: ['어디에 둬야 하는지 설명합니다.', '새 planning 템플릿'],
      machineTokens: ['# Codebase Structure'],
    },
    {
      file: ['get-shit-done', 'templates', 'codebase', 'conventions.md'],
      snippets: ['어떻게 쓰는 것이 자연스러운가', 'token-sensitive 형식을 함부로 바꾸지 않음'],
      machineTokens: ['# Coding Conventions'],
    },
    {
      file: ['get-shit-done', 'templates', 'codebase', 'integrations.md'],
      snippets: ['외부 서비스, 저장소, 인증, 배포 환경', '사람 손이 필요한 절차'],
      machineTokens: ['# External Integrations'],
    },
    {
      file: ['get-shit-done', 'templates', 'codebase', 'testing.md'],
      snippets: ['현재 저장소에서 테스트를 어떻게 추가하고 실행해야', 'Node.js built-in `node:test`'],
      machineTokens: ['# Testing Patterns'],
    },
    {
      file: ['get-shit-done', 'templates', 'codebase', 'concerns.md'],
      snippets: ['무엇을 특히 조심해야 하는지', '기계가 읽는 라벨은 유지하고 설명문만 번역'],
      machineTokens: ['# Codebase Concerns'],
    },
  ];

  for (const check of templateChecks) {
    test(`${check.file.join('/')} is Korean-first while preserving machine tokens`, () => {
      const content = fs.readFileSync(path.join(__dirname, '..', ...check.file), 'utf-8');

      for (const snippet of check.snippets) {
        assert.ok(content.includes(snippet), `Expected snippet "${snippet}" in ${check.file.join('/')}`);
      }

      for (const token of check.machineTokens) {
        assert.ok(content.includes(token), `Expected machine token "${token}" in ${check.file.join('/')}`);
      }
    });

    test(`installed runtime mirrors ${check.file.join('/')}`, () => {
      const relative = check.file.slice(1);
      const content = fs.readFileSync(path.join(__dirname, '..', '.codex', 'get-shit-done', ...relative), 'utf-8');

      for (const snippet of check.snippets) {
        assert.ok(content.includes(snippet), `Expected snippet "${snippet}" in installed runtime ${relative.join('/')}`);
      }

      for (const token of check.machineTokens) {
        assert.ok(content.includes(token), `Expected machine token "${token}" in installed runtime ${relative.join('/')}`);
      }
    });
  }
});
