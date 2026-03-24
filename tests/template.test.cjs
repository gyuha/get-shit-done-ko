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
const { runGsdTools, createTempProject, cleanup } = require('./helpers.cjs');

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
});
