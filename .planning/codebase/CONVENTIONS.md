# Coding Conventions

**Analysis Date:** 2026-03-24

## Naming Patterns

**Files:**
- JavaScript/CLI 모듈은 소문자 kebab-case 또는 단일 의미 이름을 사용 (`get-shit-done/bin/lib/state.cjs`, `scripts/run-tests.cjs`)
- 테스트는 `*.test.cjs`
- 문서와 워크플로는 kebab-case 유지, token-sensitive 파일명은 변경하지 않음 (`AGENTS.md`, `README.md`)

**Functions:**
- camelCase 사용 (`parseNamedArgs`, `cmdInitNewProject`, `getGlobalDir`)
- CLI command handlers는 `cmdXxx` 패턴을 자주 사용 (`get-shit-done/bin/lib/init.cjs`)

**Variables:**
- 일반 변수는 camelCase
- 상수는 UPPER_SNAKE_CASE (`GSD_CODEX_MARKER`, `CODEX_AGENT_SANDBOX`)

**Types:**
- TypeScript 타입 선언은 현재 주요 구현 패턴이 아님

## Code Style

**Formatting:**
- CommonJS 유지 (`require`, `module`-style file organization)
- 함수와 상수 사이에 설명성 주석을 넣되, 지나친 주석은 피함 (`scripts/run-tests.cjs`, `bin/install.js`)
- 가드 절과 early return을 선호함 (`get-shit-done/bin/gsd-tools.cjs`, `hooks/gsd-workflow-guard.js`)
- 사용자/기계가 읽는 토큰은 보존하고 설명층만 현지화함 (`AGENTS.md`, `docs/UPSTREAM-SYNC.md`)

**Linting:**
- 별도 ESLint/Prettier 설정은 저장소 루트에서 감지되지 않음
- 대신 테스트와 동작 검증이 스타일 일관성의 주요 안전장치임

## Import Organization

**Order:**
1. Node.js built-ins
2. 외부 패키지 또는 package-local require
3. 로컬 헬퍼/모듈

**Grouping:**
- import/require 그룹 사이에 빈 줄 1개를 두는 패턴이 자주 보임 (`bin/install.js`, `get-shit-done/bin/gsd-tools.cjs`)

## Error Handling

**Patterns:**
- CLI 유틸리티는 invalid input을 즉시 종료시키는 hard-fail 방식 (`get-shit-done/bin/gsd-tools.cjs`)
- hook scripts는 절대 메인 툴 실행을 막지 않도록 silent fail 또는 advisory-only 패턴 사용 (`hooks/gsd-workflow-guard.js`)
- cross-platform 문제는 코드 안에서 직접 감지하고 명시적 메시지를 출력함 (`bin/install.js`의 WSL detection)

## Logging

**Framework:**
- 전용 로깅 프레임워크 없음

**Patterns:**
- 사용자-facing CLI는 `console.error`, `console.log`, helper `output/error`를 사용
- 테스트는 stdout/stderr 문자열까지 직접 assertion 함 (`tests/dispatcher.test.cjs`)

## Comments

**When to Comment:**
- 플랫폼/런타임 제약, parser caveat, ownership marker 같은 비자명한 이유를 설명할 때
- 코드 블록의 목적이 이름만으로 충분히 드러나지 않을 때

**TODO Comments:**
- production code에서 TODO/FIXME가 두드러지게 남아 있는 패턴은 많지 않음
- 템플릿/참조 문서에는 예시용 TODO가 존재할 수 있으므로 실제 이슈와 구분해야 함

## Function Design

**Size:**
- 설치기(`bin/install.js`)는 대형 단일 파일 패턴
- CLI lib는 도메인별 모듈로 분리하되, 각 파일 내부 함수는 실용적 크기를 허용

**Parameters:**
- CLI 파서 함수는 raw argv 배열을 직접 다루고, named flag helper를 재사용함 (`parseNamedArgs`, `parseMultiwordArg`)

**Return Values:**
- helper는 plain object/primitive 반환
- CLI entry는 직접 output/error side effect를 수행하는 경우가 많음

## Module Design

**Exports:**
- CommonJS `require` 기반 모듈 분리
- `get-shit-done/bin/lib/*.cjs`는 기능별로 책임을 나눔 (`state.cjs`, `roadmap.cjs`, `security.cjs`)

**Barrel Files:**
- barrel/index 패턴은 거의 사용하지 않음
- 진입점이 직접 필요한 모듈을 import함 (`get-shit-done/bin/gsd-tools.cjs`)

---
*Convention analysis: 2026-03-24*
*Update when patterns change*
