# 기능 리서치 템플릿 (Features Research Template)

> 한국어 우선 안내: 이 템플릿은 `FEATURES` 자산을 한국어 기준으로 먼저 읽을 수 있게 정리합니다. 아래 영문 원문은 upstream 동기화와 세부 의미 보존을 위해 함께 유지합니다.


Template for `.planning/research/FEATURES.md` — 해당 도메인의 기능 지형을 조사하는 템플릿입니다.

<template>

```markdown
# Feature Research (기능 리서치)

**Domain:** [domain type]
**Researched:** [date]
**Confidence:** [HIGH/MEDIUM/LOW]

## Feature Landscape (기능 지형)

### Table Stakes (Users Expect These / 기본 기대 기능)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| [feature] | [user expectation] | LOW/MEDIUM/HIGH | [implementation notes] |
| [feature] | [user expectation] | LOW/MEDIUM/HIGH | [implementation notes] |
| [feature] | [user expectation] | LOW/MEDIUM/HIGH | [implementation notes] |

### Differentiators (Competitive Advantage / 차별화 요소)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| [feature] | [why it matters] | LOW/MEDIUM/HIGH | [implementation notes] |
| [feature] | [why it matters] | LOW/MEDIUM/HIGH | [implementation notes] |
| [feature] | [why it matters] | LOW/MEDIUM/HIGH | [implementation notes] |

### Anti-Features (Commonly Requested, Often Problematic / 문제성 기능)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| [feature] | [surface appeal] | [actual problems] | [better approach] |
| [feature] | [surface appeal] | [actual problems] | [better approach] |

## Feature Dependencies (기능 의존성)

```
[Feature A]
    └──requires──> [Feature B]
                       └──requires──> [Feature C]

[Feature D] ──enhances──> [Feature A]

[Feature E] ──conflicts──> [Feature F]
```

### Dependency Notes (의존성 메모)

- **[Feature A] requires [Feature B]:** [why the dependency exists]
- **[Feature D] enhances [Feature A]:** [how they work together]
- **[Feature E] conflicts with [Feature F]:** [why they're incompatible]

## MVP Definition (MVP 정의)

### Launch With (v1 / 출시 포함)

Minimum viable product — what's needed to validate the concept.

- [ ] [Feature] — [why essential]
- [ ] [Feature] — [why essential]
- [ ] [Feature] — [why essential]

### Add After Validation (v1.x / 검증 후 추가)

Features to add once core is working.

- [ ] [Feature] — [trigger for adding]
- [ ] [Feature] — [trigger for adding]

### Future Consideration (v2+ / 미래 검토)

Features to defer until product-market fit is established.

- [ ] [Feature] — [why defer]
- [ ] [Feature] — [why defer]

## Feature Prioritization Matrix (기능 우선순위 매트릭스)

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| [feature] | HIGH/MEDIUM/LOW | HIGH/MEDIUM/LOW | P1/P2/P3 |
| [feature] | HIGH/MEDIUM/LOW | HIGH/MEDIUM/LOW | P1/P2/P3 |
| [feature] | HIGH/MEDIUM/LOW | HIGH/MEDIUM/LOW | P1/P2/P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis (경쟁사 기능 분석)

| Feature | Competitor A | Competitor B | Our Approach |
|---------|--------------|--------------|--------------|
| [feature] | [how they do it] | [how they do it] | [our plan] |
| [feature] | [how they do it] | [how they do it] | [our plan] |

## Sources (출처)

- [Competitor products analyzed]
- [User research or feedback sources]
- [Industry standards referenced]

---
*Feature research for: [domain]*
*Researched: [date]*
```

</template>

<guidelines>

**Table Stakes:**
- These are non-negotiable for launch
- Users don't give credit for having them, but penalize for missing them
- Example: A community platform without user profiles is broken

**Differentiators:**
- These are where you compete
- Should align with the Core Value from PROJECT.md
- Don't try to differentiate on everything

**Anti-Features:**
- Prevent scope creep by documenting what seems good but isn't
- Include the alternative approach
- Example: "Real-time everything" often creates complexity without value

**Feature Dependencies:**
- Critical for roadmap phase ordering
- If A requires B, B must be in an earlier phase
- Conflicts inform what NOT to combine in same phase

**MVP Definition:**
- Be ruthless about what's truly minimum
- "Nice to have" is not MVP
- Launch with less, validate, then expand

</guidelines>
