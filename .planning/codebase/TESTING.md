# Testing Patterns

**Analysis Date:** 2026-03-24

## Test Framework

**Runner:**
- Node.js built-in `node:test`
- 별도 중앙 설정 파일 없이 `scripts/run-tests.cjs`가 `tests/*.test.cjs`를 정렬해 실행

**Assertion Library:**
- `node:assert`
- `strictEqual`, `ok`, `deepStrictEqual`를 자주 사용 (`tests/dispatcher.test.cjs`)

**Run Commands:**
```bash
npm test
node scripts/run-tests.cjs
node --test tests/dispatcher.test.cjs
npm run test:coverage
```

## Test File Organization

**Location:**
- 모든 테스트는 `tests/`에 모음

**Naming:**
- `*.test.cjs`

**Structure:**
```text
tests/
├── helpers.cjs
├── dispatcher.test.cjs
├── init.test.cjs
├── runtime-converters.test.cjs
└── ... 총 42개 test files
```

## Test Structure

**Suite Organization:**
- `describe()`로 명령 그룹 또는 기능 영역을 묶고, `test()`로 세부 케이스를 작성

**Patterns:**
- 임시 프로젝트 디렉터리를 만들어 CLI를 실제에 가깝게 실행함 (`tests/helpers.cjs`, `tests/dispatcher.test.cjs`)
- stdout/stderr 텍스트와 종료 코드까지 함께 검증함
- 한국어 현지화 포크 특성상 사용자-facing 문자열도 assertion 대상임 (`tests/dispatcher.test.cjs`)

## Mocking

**Framework:**
- 별도 mocking 프레임워크 없음

**What to Mock:**
- 환경 변수와 임시 파일 시스템 정도만 최소한으로 제어
- 외부 API 호출은 테스트 내에서 조건 분기 또는 stubbed execution result로 다룸 (`tests/commands.test.cjs`)

**What NOT to Mock:**
- 가능하면 `node get-shit-done/bin/gsd-tools.cjs ...` 실제 실행 경로
- 파일 시스템 기반 planning state 생성/수정 흐름

## Fixtures and Factories

**Test Data:**
- 임시 프로젝트 생성 helper를 재사용
- 각 테스트가 필요한 최소 `.planning/` 또는 config 파일을 직접 써서 시나리오를 만듦

**Location:**
- `tests/helpers.cjs`
- 개별 테스트 파일 내부 inline fixture

## Coverage

**Requirements:**
- `npm run test:coverage`는 `get-shit-done/bin/lib/*.cjs` 기준 line coverage 70%를 요구 (`package.json`)
- 회귀가 생긴 기능은 대응 테스트를 추가하는 패턴이 강함

**Configuration:**
- `c8 --check-coverage --lines 70 --reporter text --include 'get-shit-done/bin/lib/*.cjs' --exclude 'tests/**' --all node scripts/run-tests.cjs`

## Test Types

**Unit Tests:**
- CLI lib 함수와 parser, config, state, security 동작 검증 (`tests/core.test.cjs`, `tests/config.test.cjs`, `tests/security.test.cjs`)

**Integration Tests:**
- 설치기/런타임 변환/명령 디스패치와 같은 end-to-end 성격 검증 (`tests/antigravity-install.test.cjs`, `tests/copilot-install.test.cjs`, `tests/runtime-converters.test.cjs`)

**E2E Tests:**
- 브라우저/E2E 프레임워크 기반 테스트는 감지되지 않음

## Common Patterns

**Async Testing:**
- Node test runner의 동기/비동기 지원을 그대로 사용
- 외부 호출이 필요한 경우 promise-returning helper 결과를 기다려 검증

**Error Testing:**
- 실패 케이스는 `success === false`와 stderr 메시지를 함께 확인
- 잘못된 인자, 없는 경로, unknown subcommand를 중점 검증 (`tests/dispatcher.test.cjs`)

**Snapshot Testing:**
- Snapshot testing은 사용하지 않음

---
*Testing analysis: 2026-03-24*
*Update when test patterns change*
