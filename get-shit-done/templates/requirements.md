# Requirements Template

> 한국어 우선 안내: 이 템플릿은 `.planning/REQUIREMENTS.md`를 한국어로 작성하되, `Out of Scope`, `Traceability`, 상태값 같은 기계 친화 라벨은 그대로 유지합니다.

Template for `.planning/REQUIREMENTS.md` — checkable requirements that define "done."

<template>

```markdown
# Requirements: [Project Name]

**Defined:** [date]
**Core Value:** [from PROJECT.md]

## v1 Requirements

이번 milestone에서 실제로 구현하고 검증할 요구사항입니다.

### Authentication

- [ ] **AUTH-01**: 사용자가 이메일과 비밀번호로 가입할 수 있다
- [ ] **AUTH-02**: 가입 후 이메일 인증을 받을 수 있다
- [ ] **AUTH-03**: 비밀번호 재설정 링크를 이메일로 받을 수 있다
- [ ] **AUTH-04**: 브라우저를 새로고침해도 세션이 유지된다

### [카테고리 2]

- [ ] **[CAT]-01**: [요구사항 설명]
- [ ] **[CAT]-02**: [요구사항 설명]
- [ ] **[CAT]-03**: [요구사항 설명]

## v2 Requirements

이번 roadmap에는 넣지 않지만 추후 후보로 추적할 요구사항입니다.

### [카테고리]

- **[CAT]-01**: [요구사항 설명]
- **[CAT]-02**: [요구사항 설명]

## Out of Scope

이번 범위에서 명시적으로 제외한 항목입니다.

| Feature | Reason |
|---------|--------|
| [Feature] | [Why excluded] |
| [Feature] | [Why excluded] |

## Traceability

요구사항과 roadmap phase의 연결 관계를 기록합니다.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| [REQ-ID] | Phase [N] | Pending |

**Coverage:**
- v1 requirements: [X] total
- Mapped to phases: [Y]
- Unmapped: [Z] ⚠️

---
*Requirements defined: [date]*
*Last updated: [date] after [갱신 트리거]*
```

</template>

<guidelines>

**Requirement Format**
- ID 형식은 `[CATEGORY]-[NUMBER]`를 유지합니다.
- 한 문장으로, 사용자 관점에서, 테스트 가능하게 적습니다.
- 한 요구사항에는 한 가지 결과만 담습니다.

**Categories**
- 도메인 기준으로 묶습니다.
- 예: Authentication, Profiles, Content, Payments, Admin
- 새 카테고리를 만들 때는 의미가 분명해야 합니다.

**v1 vs v2**
- `v1`: 현재 roadmap에 포함되는 확정 범위
- `v2`: 인정은 하지만 뒤로 미룬 항목
- `v2`를 `v1`로 옮기면 roadmap과 traceability도 같이 갱신합니다.

**Out of Scope**
- 왜 제외했는지 반드시 적습니다.
- 나중에 다시 추가할지 판단할 근거가 됩니다.

**Traceability**
- 각 v1 요구사항은 정확히 하나의 phase에 연결되는 것이 이상적입니다.
- 비어 있거나 중복 연결된 항목은 roadmap 품질 문제 신호입니다.

**Status Values**
- `Pending`
- `In Progress`
- `Complete`
- `Blocked`

</guidelines>

<evolution>

**After each phase completes**
1. 해당 phase가 다룬 요구사항을 `Complete`로 갱신합니다.
2. scope가 바뀐 요구사항은 설명과 traceability를 함께 수정합니다.

**After roadmap updates**
1. 모든 v1 요구사항이 여전히 phase에 매핑되는지 확인합니다.
2. 새로 생긴 요구사항을 추가합니다.
3. 내려간 요구사항은 `v2` 또는 `Out of Scope`로 이동합니다.

**Requirement completion criteria**
- 기능이 구현되었고
- 검증이 끝났고
- 프로젝트 기록에 완료로 반영되었을 때 `Complete`로 봅니다.

</evolution>

<example>

```markdown
# Requirements: CommunityApp

**Defined:** 2025-01-14
**Core Value:** 관심사가 비슷한 사용자들이 글과 반응을 쉽게 주고받을 수 있다

## v1 Requirements

### Authentication

- [ ] **AUTH-01**: 사용자가 이메일과 비밀번호로 가입할 수 있다
- [ ] **AUTH-02**: 가입 후 이메일 인증을 받을 수 있다
- [ ] **AUTH-03**: 이메일 링크로 비밀번호를 재설정할 수 있다
- [ ] **AUTH-04**: 브라우저를 새로고침해도 세션이 유지된다

### Profiles

- [ ] **PROF-01**: 사용자가 표시 이름을 설정할 수 있다
- [ ] **PROF-02**: 사용자가 아바타 이미지를 업로드할 수 있다
- [ ] **PROF-03**: 사용자가 자기소개를 작성할 수 있다
- [ ] **PROF-04**: 다른 사용자의 프로필을 볼 수 있다

## v2 Requirements

### Notifications

- **NOTF-01**: 사용자가 앱 내 알림을 받을 수 있다
- **NOTF-02**: 새 팔로워 발생 시 이메일을 받을 수 있다

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real-time chat | 초기 핵심 가치 대비 복잡도가 높음 |
| Native mobile app | 우선은 웹 제품에 집중 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| PROF-01 | Phase 2 | Pending |
| PROF-02 | Phase 2 | Pending |
```

</example>
