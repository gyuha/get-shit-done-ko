# Roadmap Template

> 한국어 우선 안내: 이 템플릿은 roadmap 설명과 예시를 한국어로 제공하지만, 파서가 읽는 `**Goal**`, `**Depends on**`, `**Requirements**`, `**Success Criteria**`, `**Plans**` 라벨은 그대로 유지합니다.

Template for `.planning/ROADMAP.md`.

## Initial Roadmap (v1.0 Greenfield)

```markdown
# Roadmap: [Project Name]

## Overview

[프로젝트를 어떤 순서로 구현해 나갈지 한 단락으로 설명]

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): 기본 milestone 작업
- Decimal phases (2.1, 2.2): 긴급 삽입 작업 (INSERTED 표기)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: [Name]** - [한 줄 설명]
- [ ] **Phase 2: [Name]** - [한 줄 설명]
- [ ] **Phase 3: [Name]** - [한 줄 설명]

## Phase Details

### Phase 1: [Name]
**Goal**: [이 phase가 전달할 결과]
**Depends on**: Nothing
**Requirements**: [REQ-01, REQ-02]
**Success Criteria** (what must be TRUE):
  1. [사용자 관점에서 확인 가능한 결과]
  2. [사용자 관점에서 확인 가능한 결과]
**Plans**: [예: 2 plans]

Plans:
- [ ] 01-01: [plan 설명]
- [ ] 01-02: [plan 설명]

### Phase 2: [Name]
**Goal**: [이 phase가 전달할 결과]
**Depends on**: Phase 1
**Requirements**: [REQ-03, REQ-04]
**Success Criteria** (what must be TRUE):
  1. [관찰 가능한 결과]
  2. [관찰 가능한 결과]
**Plans**: [예: 2 plans]

Plans:
- [ ] 02-01: [plan 설명]
- [ ] 02-02: [plan 설명]

### Phase 2.1: Critical Fix (INSERTED)
**Goal**: [긴급 삽입 작업의 목표]
**Depends on**: Phase 2
**Requirements**: TBD
**Success Criteria** (what must be TRUE):
  1. [수정 후 참이어야 하는 사실]
**Plans**: 1 plan

Plans:
- [ ] 02.1-01: [plan 설명]

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. [Name] | 0/2 | Not started | - |
| 2. [Name] | 0/2 | Not started | - |
| 2.1 Critical Fix | 0/1 | Not started | - |
```

<guidelines>

**Initial planning (v1.0)**
- phase 수는 작업 복잡도에 따라 정합니다.
- 한 phase는 사용자가 체감할 수 있는 묶음 단위여야 합니다.
- tasks가 많거나 서로 다른 하위 시스템을 건드리면 plan을 분리합니다.
- `Plans` 수는 처음엔 `TBD`여도 괜찮지만, plan-phase에서 구체화합니다.

**Success criteria**
- 2-5개 정도의 관찰 가능한 사실로 적습니다.
- 내부 구현 세부보다 사용자/시스템 관찰 결과를 우선합니다.
- verify 단계에서 그대로 검증할 수 있어야 합니다.

**After milestones ship**
- 완료된 milestone은 `<details>`로 접어 가독성을 유지합니다.
- 새 milestone을 추가해도 phase 번호는 이어서 사용합니다.

</guidelines>

<status_values>
- `Not started`
- `In progress`
- `Complete`
- `Deferred`
</status_values>

## Milestone-Grouped Roadmap (After v1.0 Ships)

```markdown
# Roadmap: [Project Name]

## Milestones

- ✅ **v1.0 MVP** - Phases 1-4 (shipped YYYY-MM-DD)
- 🚧 **v1.1 [Name]** - Phases 5-6 (in progress)
- 📋 **v2.0 [Name]** - Phases 7-9 (planned)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-4) - SHIPPED YYYY-MM-DD</summary>

### Phase 1: Foundation
**Goal**: 핵심 기반을 준비한다
**Plans**: 2 plans

Plans:
- [x] 01-01: 프로젝트 초기 구조 설정
- [x] 01-02: 배포 가능한 기본 실행 흐름 확보

</details>

### 🚧 v1.1 [Name] (In Progress)

**Milestone Goal:** [이번 milestone이 전달할 가치]

#### Phase 5: [Name]
**Goal**: [이 phase가 전달할 결과]
**Depends on**: Phase 4
**Requirements**: [REQ-11, REQ-12]
**Success Criteria** (what must be TRUE):
  1. [관찰 가능한 결과]
**Plans**: 2 plans

Plans:
- [ ] 05-01: [plan 설명]
- [ ] 05-02: [plan 설명]

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation | v1.0 | 2/2 | Complete | YYYY-MM-DD |
| 5. [Name] | v1.1 | 0/2 | Not started | - |
```

**Notes**
- milestone emoji: ✅ shipped, 🚧 in progress, 📋 planned
- 완료 milestone은 접고, 현재/미래 milestone은 펼쳐 둡니다.
- phase numbering은 계속 이어집니다.
