#!/usr/bin/env node
/**
 * 설치용으로 GSD hook을 dist에 복사한다.
 * 깨진 hook이 배포되지 않도록 복사 전에 JavaScript 문법을 검증한다.
 * #1107, #1109, #1125, #1161 참고: 중복 const 선언이 dist에 포함되어
 * 전체 사용자에게 PostToolUse hook 오류를 일으킨 적이 있다.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const HOOKS_DIR = path.join(__dirname, '..', 'hooks');
const DIST_DIR = path.join(HOOKS_DIR, 'dist');

// 복사할 hook 목록 (순수 Node.js라 번들링 불필요)
const HOOKS_TO_COPY = [
  'gsd-check-update.js',
  'gsd-context-monitor.js',
  'gsd-prompt-guard.js',
  'gsd-statusline.js',
  'gsd-workflow-guard.js'
];

/**
 * 파일을 실행하지 않고 JavaScript 문법만 검증한다.
 * SyntaxError(중복 const, 괄호 누락 등)를 배포 전에 잡아낸다.
 */
function validateSyntax(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  try {
    // 실행 없이 문법만 확인한다.
    new vm.Script(content, { filename: path.basename(filePath) });
    return null; // 오류 없음
  } catch (e) {
    if (e instanceof SyntaxError) {
      return e.message;
    }
    throw e;
  }
}

function build() {
  // dist 디렉터리가 없으면 만든다.
  if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR, { recursive: true });
  }

  let hasErrors = false;

  // 문법 검증을 통과한 hook만 dist로 복사한다.
  for (const hook of HOOKS_TO_COPY) {
    const src = path.join(HOOKS_DIR, hook);
    const dest = path.join(DIST_DIR, hook);

    if (!fs.existsSync(src)) {
      console.warn(`경고: ${hook} 파일이 없어 건너뜁니다`);
      continue;
    }

    // 복사 전에 문법을 먼저 확인한다.
    const syntaxError = validateSyntax(src);
    if (syntaxError) {
      console.error(`\x1b[31m✗ ${hook}: 문법 오류 — ${syntaxError}\x1b[0m`);
      hasErrors = true;
      continue;
    }

    console.log(`\x1b[32m✓\x1b[0m ${hook} 복사 중...`);
    fs.copyFileSync(src, dest);
  }

  if (hasErrors) {
    console.error('\n\x1b[31m빌드 실패: 배포 전에 위 문법 오류를 수정하세요.\x1b[0m');
    process.exit(1);
  }

  console.log('\n빌드가 완료되었습니다.');
}

build();
