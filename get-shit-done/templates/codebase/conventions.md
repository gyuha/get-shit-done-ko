# Coding Conventions Template

> 한국어 우선 안내: 이 템플릿은 `.planning/codebase/CONVENTIONS.md`를 한국어 중심으로 작성하기 위한 기준입니다.

Template for `.planning/codebase/CONVENTIONS.md` - captures coding style and patterns.

**Purpose:** 이 코드베이스에서 "어떻게 쓰는 것이 자연스러운가"를 문서화합니다.

---

## File Template

```markdown
# Coding Conventions

**Analysis Date:** [YYYY-MM-DD]

## Naming Patterns

**Files:**
- [패턴]

**Functions:**
- [패턴]

**Variables:**
- [패턴]

**Types:**
- [패턴]

## Code Style

**Formatting:**
- [포매팅 규칙]

**Linting:**
- [린트 규칙]

## Import Organization

**Order:**
1. [그룹 1]
2. [그룹 2]
3. [그룹 3]

**Grouping:**
- [빈 줄/정렬 규칙]

## Error Handling

**Patterns:**
- [오류 처리 전략]

## Logging

**Framework:**
- [사용 도구]

**Patterns:**
- [로그를 남기는 위치와 방식]

## Comments

**When to Comment:**
- [주석 기준]

**TODO Comments:**
- [형식]

## Function Design

**Size:**
- [함수 길이 기준]

**Parameters:**
- [파라미터 규칙]

**Return Values:**
- [반환 규칙]

## Module Design

**Exports:**
- [export 원칙]

**Barrel Files:**
- [index 파일 사용 원칙]

---
*Convention analysis: [date]*
*Update when patterns change*
```

<good_examples>

```markdown
# Coding Conventions

**Analysis Date:** 2026-03-24

## Naming Patterns

**Files:**
- 문서와 스크립트는 kebab-case 우선
- 테스트는 `*.test.cjs`

**Functions:**
- camelCase 사용
- CLI command helper는 `cmdXxx` 패턴 사용

**Variables:**
- 일반 변수는 camelCase
- 상수는 UPPER_SNAKE_CASE

## Code Style

**Formatting:**
- CommonJS 문법 유지
- 불필요한 추상화보다 읽기 쉬운 함수 우선
- 문자열 출력은 token-sensitive 형식을 함부로 바꾸지 않음

**Linting:**
- 테스트와 실제 동작 검증을 더 중시
- 기존 스타일과 일관성 유지

## Import Organization

**Order:**
1. Node.js built-ins
2. 외부 패키지
3. 로컬 모듈

**Grouping:**
- 그룹 사이에 빈 줄 1개

## Comments

**When to Comment:**
- 왜 이렇게 했는지 설명이 필요할 때만 작성
- 명백한 코드 설명 주석은 피함
```

</good_examples>

<guidelines>

- 스타일 규칙은 "이상적인 기준"보다 "현재 저장소가 실제로 하는 방식"을 적습니다.
- 예외가 있다면 어디서 예외가 허용되는지도 같이 씁니다.
- 자동 포매터가 없으면 그 사실도 분명히 적습니다.

</guidelines>
