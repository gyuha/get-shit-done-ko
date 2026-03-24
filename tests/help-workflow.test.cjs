const { test, describe } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const ROOT_HELP_PATH = path.join(__dirname, '..', 'get-shit-done', 'workflows', 'help.md');
const CODEX_HELP_PATH = path.join(__dirname, '..', '.codex', 'get-shit-done', 'workflows', 'help.md');

function read(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

describe('help workflow: Korean-first reference output', () => {
  test('root help workflow exists', () => {
    assert.ok(fs.existsSync(ROOT_HELP_PATH), 'root help workflow should exist');
  });

  test('installed codex help workflow exists', () => {
    assert.ok(fs.existsSync(CODEX_HELP_PATH), 'installed codex help workflow should exist');
  });

  test('root help workflow uses Korean-first body content', () => {
    const content = read(ROOT_HELP_PATH);
    assert.ok(
      content.includes('통합 플로우로 새 프로젝트를 초기화합니다.'),
      'root help workflow should localize new-project description'
    );
    assert.ok(
      content.includes('자유 형식 텍스트를 적절한 GSD 명령으로 자동 라우팅합니다.'),
      'root help workflow should localize do-command description'
    );
    assert.ok(
      content.includes('질문 없이 한 번에 저장하는 zero-friction 아이디어 캡처입니다.'),
      'root help workflow should localize note description'
    );
    assert.ok(
      !content.includes('Initialize new project through unified flow.'),
      'root help workflow should remove the old English new-project sentence'
    );
    assert.ok(
      !content.includes('Route freeform text to the right GSD command automatically.'),
      'root help workflow should remove the old English router sentence'
    );
  });

  test('installed codex help workflow uses Korean-first body content', () => {
    const content = read(CODEX_HELP_PATH);
    assert.ok(
      content.includes('통합 플로우로 새 프로젝트를 초기화합니다.'),
      'codex help workflow should localize new-project description'
    );
    assert.ok(
      content.includes('자유 형식 텍스트를 적절한 GSD 명령으로 자동 라우팅합니다.'),
      'codex help workflow should localize do-command description'
    );
    assert.ok(
      content.includes('질문 없이 한 번에 저장하는 zero-friction 아이디어 캡처입니다.'),
      'codex help workflow should localize note description'
    );
    assert.ok(
      !content.includes('Initialize new project through unified flow.'),
      'codex help workflow should remove the old English new-project sentence'
    );
    assert.ok(
      !content.includes('Route freeform text to the right GSD command automatically.'),
      'codex help workflow should remove the old English router sentence'
    );
  });

  test('root and codex help workflows preserve runtime-specific command forms', () => {
    const rootContent = read(ROOT_HELP_PATH);
    const codexContent = read(CODEX_HELP_PATH);

    assert.ok(rootContent.includes('Usage: `/gsd:new-project`'), 'root help should keep slash commands');
    assert.ok(codexContent.includes('Usage: `$gsd-new-project`'), 'codex help should keep dollar commands');
    assert.ok(
      codexContent.includes('/Users/gyuha/workspace/get-shit-done-ko/.codex/notes/'),
      'codex help should keep codex-specific global notes path'
    );
    assert.ok(
      !codexContent.includes('~/.claude/notes/'),
      'codex help should not regress to Claude global notes path'
    );
  });
});
