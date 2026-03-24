# 스택 리서치 템플릿 (Stack Research Template)

> 한국어 우선 안내: 이 템플릿은 `STACK` 자산을 한국어 기준으로 먼저 읽을 수 있게 정리합니다. 아래 영문 원문은 upstream 동기화와 세부 의미 보존을 위해 함께 유지합니다.


Template for `.planning/research/STACK.md` — 해당 도메인에 권장되는 기술을 조사하는 템플릿입니다.

<template>

```markdown
# Stack Research (스택 리서치)

**Domain:** [domain type]
**Researched:** [date]
**Confidence:** [HIGH/MEDIUM/LOW]

## Recommended Stack (권장 스택)

### Core Technologies (핵심 기술)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| [name] | [version] | [what it does] | [why experts use it for this domain] |
| [name] | [version] | [what it does] | [why experts use it for this domain] |
| [name] | [version] | [what it does] | [why experts use it for this domain] |

### Supporting Libraries (보조 라이브러리)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| [name] | [version] | [what it does] | [specific use case] |
| [name] | [version] | [what it does] | [specific use case] |
| [name] | [version] | [what it does] | [specific use case] |

### Development Tools (개발 도구)

| Tool | Purpose | Notes |
|------|---------|-------|
| [name] | [what it does] | [configuration tips] |
| [name] | [what it does] | [configuration tips] |

## Installation (설치)

```bash
# Core
npm install [packages]

# Supporting
npm install [packages]

# Dev dependencies
npm install -D [packages]
```

## Alternatives Considered (검토한 대안)

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| [our choice] | [other option] | [conditions where alternative is better] |
| [our choice] | [other option] | [conditions where alternative is better] |

## What NOT to Use (사용하지 말 것)

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| [technology] | [specific problem] | [recommended alternative] |
| [technology] | [specific problem] | [recommended alternative] |

## Stack Patterns by Variant (조건별 스택 패턴)

**If [condition]:**
- Use [variation]
- Because [reason]

**If [condition]:**
- Use [variation]
- Because [reason]

## Version Compatibility (버전 호환성)

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| [package@version] | [package@version] | [compatibility notes] |

## Sources (출처)

- [Context7 library ID] — [topics fetched]
- [Official docs URL] — [what was verified]
- [Other source] — [confidence level]

---
*Stack research for: [domain]*
*Researched: [date]*
```

</template>

<guidelines>

**Core Technologies:**
- Include specific version numbers
- Explain why this is the standard choice, not just what it does
- Focus on technologies that affect architecture decisions

**Supporting Libraries:**
- Include libraries commonly needed for this domain
- Note when each is needed (not all projects need all libraries)

**Alternatives:**
- Don't just dismiss alternatives
- Explain when alternatives make sense
- Helps user make informed decisions if they disagree

**What NOT to Use:**
- Actively warn against outdated or problematic choices
- Explain the specific problem, not just "it's old"
- Provide the recommended alternative

**Version Compatibility:**
- Note any known compatibility issues
- Critical for avoiding debugging time later

</guidelines>
