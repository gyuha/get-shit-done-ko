# Codebase Concerns Template

> 한국어 우선 안내: 이 템플릿은 `.planning/codebase/CONCERNS.md`를 한국어 중심으로 작성하기 위한 기준입니다.

Template for `.planning/codebase/CONCERNS.md` - captures known issues and areas requiring care.

**Purpose:** 이 저장소를 건드릴 때 무엇을 특히 조심해야 하는지 경고 목록으로 정리합니다.

---

## File Template

```markdown
# Codebase Concerns

**Analysis Date:** [YYYY-MM-DD]

## Tech Debt

**[영역/컴포넌트]:**
- Issue: [문제]
- Why: [이렇게 된 이유]
- Impact: [영향]
- Fix approach: [정리 방향]

## Known Bugs

**[버그 설명]:**
- Symptoms: [증상]
- Trigger: [재현 조건]
- Workaround: [임시 대응]
- Root cause: [원인]

## Security Considerations

**[보안 주의 영역]:**
- Risk: [위험]
- Current mitigation: [현재 완화책]
- Recommendations: [권장 대응]

## Performance Bottlenecks

**[느린 지점]:**
- Problem: [문제]
- Measurement: [수치]
- Cause: [원인]
- Improvement path: [개선 방향]

## Fragile Areas

**[깨지기 쉬운 모듈]:**
- Why fragile: [취약 이유]
- Common failures: [자주 깨지는 방식]
- Safe modification: [안전한 수정법]
- Test coverage: [테스트 상태]

## Scaling Limits

**[리소스/시스템]:**
- Current capacity: [현재 한계]
- Limit: [깨지는 지점]
- Symptoms at limit: [징후]
- Scaling path: [확장 방향]

## Dependencies at Risk

**[패키지/서비스]:**
- Risk: [위험]
- Impact: [영향]
- Migration plan: [대안]

## Test Coverage Gaps

**[미검증 영역]:**
- What's not tested: [누락된 검증]
- Risk: [위험]
- Priority: [High/Medium/Low]

---
*Concerns audit: [date]*
*Update as issues are fixed or new ones discovered*
```

<good_examples>

```markdown
# Codebase Concerns

**Analysis Date:** 2026-03-24

## Tech Debt

**Source/runtime 이중 관리:**
- Issue: `get-shit-done/`와 `.codex/get-shit-done/`를 함께 맞춰야 함
- Why: 설치된 runtime과 source of truth를 동시에 유지하기 때문
- Impact: 한쪽만 수정하면 실제 사용자 경험이 어긋날 수 있음
- Fix approach: source 수정 후 runtime mirror와 테스트를 함께 갱신

## Fragile Areas

**Token-sensitive markdown:**
- Why fragile: 특정 헤더/라벨을 parser가 직접 읽음
- Common failures: 번역하면서 `**Depends on**`, `## Current Position` 같은 토큰이 깨짐
- Safe modification: 기계가 읽는 라벨은 유지하고 설명문만 번역
- Test coverage: roadmap/state 관련 회귀 테스트 존재

## Test Coverage Gaps

**설치 후 실사용 smoke test:**
- What's not tested: 실제 사용자 환경에서 모든 slash command 출력 확인
- Risk: source와 installed runtime이 어긋난 채 배포될 수 있음
- Priority: Medium
```

</good_examples>

<guidelines>

- 막연한 불안 요소보다 행동 가능한 경고를 적습니다.
- "왜 위험한가"와 "어떻게 안전하게 수정하는가"를 함께 적습니다.
- 이미 해결된 문제는 오래 남기지 말고 정리합니다.

</guidelines>
