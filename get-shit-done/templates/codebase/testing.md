# Testing Patterns Template

> 한국어 우선 안내: 이 템플릿은 `.planning/codebase/TESTING.md`를 한국어로 작성하기 위한 기준입니다.

Template for `.planning/codebase/TESTING.md` - captures test framework and patterns.

**Purpose:** 현재 저장소에서 테스트를 어떻게 추가하고 실행해야 자연스러운지 정리합니다.

---

## File Template

```markdown
# Testing Patterns

**Analysis Date:** [YYYY-MM-DD]

## Test Framework

**Runner:**
- [테스트 러너]
- [설정 파일 위치]

**Assertion Library:**
- [assertion 도구]
- [자주 쓰는 matcher]

**Run Commands:**
```bash
[전체 테스트 명령]
[특정 파일 테스트 명령]
[커버리지 또는 통합 테스트 명령]
```

## Test File Organization

**Location:**
- [테스트 파일 위치 규칙]

**Naming:**
- [파일명 패턴]

**Structure:**
```text
[실제 디렉터리 예시]
```

## Test Structure

**Suite Organization:**
- [describe / test 패턴]

**Patterns:**
- [beforeEach/afterEach 사용 방식]
- [arrange / act / assert 관례]

## Mocking

**Framework:**
- [mock 도구]

**What to Mock:**
- [mock 대상]

**What NOT to Mock:**
- [실제 객체를 유지할 대상]

## Fixtures and Factories

**Test Data:**
- [fixture/factory 사용 패턴]

**Location:**
- [저장 위치]

## Coverage

**Requirements:**
- [커버리지 기준]

**Configuration:**
- [설정 방식]

## Test Types

**Unit Tests:**
- [범위]

**Integration Tests:**
- [범위]

**E2E Tests:**
- [범위]

## Common Patterns

**Async Testing:**
- [비동기 테스트 규칙]

**Error Testing:**
- [오류 테스트 규칙]

**Snapshot Testing:**
- [사용 여부]

---
*Testing analysis: [date]*
*Update when test patterns change*
```

<good_examples>

```markdown
# Testing Patterns

**Analysis Date:** 2026-03-24

## Test Framework

**Runner:**
- Node.js built-in `node:test`
- 별도 중앙 설정 파일 없이 스크립트로 실행

**Assertion Library:**
- `node:assert`
- `ok`, `strictEqual`, `deepStrictEqual`

**Run Commands:**
```bash
node --test tests/template.test.cjs
node --test tests/commands.test.cjs
node scripts/run-tests.cjs
```

## Test File Organization

**Location:**
- `tests/` 디렉터리에 모아 둠

**Naming:**
- `*.test.cjs`

## Test Structure

**Suite Organization:**
- `describe()` 안에 관련 command/feature를 묶고 `test()`로 세부 케이스를 작성

**Patterns:**
- 임시 프로젝트를 만들고 정리하는 helper를 재사용
- CLI 결과는 성공 여부와 출력 JSON/텍스트를 함께 검증

## Mocking

**Framework:**
- 최소 mocking 원칙
- 가능하면 임시 파일 시스템 기반 실제 동작 검증

## Coverage

**Requirements:**
- 새 회귀 이슈가 생기면 대응 테스트를 추가
- parser/token-sensitive 로직은 명시적 assertion 권장
```

</good_examples>

<guidelines>

- 테스트 명령은 복붙해서 바로 실행할 수 있게 적습니다.
- helper 패턴이 있다면 새 테스트도 그 흐름을 따르도록 설명합니다.
- "무엇을 mock하지 않는가"를 함께 적으면 과도한 mocking을 막을 수 있습니다.

</guidelines>
