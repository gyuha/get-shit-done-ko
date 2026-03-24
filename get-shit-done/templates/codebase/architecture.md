# Architecture Template

> 한국어 우선 안내: 이 템플릿은 `.planning/codebase/ARCHITECTURE.md`를 한국어 중심으로 작성하기 위한 기준입니다.

Template for `.planning/codebase/ARCHITECTURE.md` - captures conceptual code organization.

**Purpose:** 코드가 개념적으로 어떻게 나뉘어 있는지, 어떤 흐름으로 동작하는지 설명합니다.

---

## File Template

```markdown
# Architecture

**Analysis Date:** [YYYY-MM-DD]

## Pattern Overview

**Overall:** [전체 구조 패턴]

**Key Characteristics:**
- [특징 1]
- [특징 2]
- [특징 3]

## Layers

**[Layer Name]:**
- Purpose: [이 레이어의 역할]
- Contains: [포함 코드 종류]
- Depends on: [의존 대상]
- Used by: [이 레이어를 사용하는 곳]

## Data Flow

**[Flow Name]:**
1. [시작점]
2. [중간 처리]
3. [결과]

**State Management:**
- [상태 처리 방식]

## Key Abstractions

**[Abstraction Name]:**
- Purpose: [무엇을 추상화하는지]
- Examples: [예시]
- Pattern: [적용 패턴]

## Entry Points

**[Entry Point]:**
- Location: [위치]
- Triggers: [실행 조건]
- Responsibilities: [책임]

## Error Handling

**Strategy:** [오류 처리 전략]

**Patterns:**
- [패턴 1]
- [패턴 2]

## Cross-Cutting Concerns

**Logging:**
- [접근 방식]

**Validation:**
- [접근 방식]

**Authentication:**
- [접근 방식]

---
*Architecture analysis: [date]*
*Update when major patterns change*
```

<good_examples>

```markdown
# Architecture

**Analysis Date:** 2026-03-24

## Pattern Overview

**Overall:** 문서 중심 CLI + 설치 런타임 동기화 구조

**Key Characteristics:**
- 템플릿과 워크플로가 제품 동작의 중심
- `.planning/`을 상태 저장소처럼 사용
- root source와 installed runtime을 함께 관리

## Layers

**Command Layer:**
- Purpose: 사용자 명령을 받아 적절한 workflow로 연결
- Contains: slash command 문서, CLI 엔트리
- Depends on: workflow/resource layer
- Used by: Codex/Claude runtime

**Workflow Layer:**
- Purpose: 단계별 작업 절차 정의
- Contains: `workflows/*.md`
- Depends on: templates, references, scripts
- Used by: 명령 레이어와 유지보수자

**Template Layer:**
- Purpose: planning 문서의 기본 형식 제공
- Contains: `templates/*.md`, `templates/codebase/*.md`
- Depends on: 거의 없음
- Used by: workflow와 CLI helper

## Data Flow

**Project bootstrap:**
1. 사용자가 `gsd-new-project` 또는 유사 명령 실행
2. workflow가 현재 상태와 `.planning/` 존재 여부 확인
3. 템플릿과 참조 문서를 읽어 planning 문서 작성
4. 이후 phase/workflow가 같은 planning 문서를 계속 갱신

**State Management:**
- 파일 기반 상태 관리
- 핵심 상태는 `.planning/STATE.md`, `.planning/ROADMAP.md`, `.planning/PROJECT.md`

## Key Abstractions

**Phase:**
- Purpose: 사용자 가치 단위의 작업 묶음
- Examples: `01-*`, `08-*`
- Pattern: phase directory + PLAN/SUMMARY/VERIFICATION 문서

**Template:**
- Purpose: 반복 생성 문서의 표준 형식 제공
- Examples: `project.md`, `roadmap.md`, `codebase/testing.md`
- Pattern: markdown scaffold
```

</good_examples>

<guidelines>

- 파일 위치 설명은 STRUCTURE.md에 두고, 여기에는 역할과 흐름만 적습니다.
- 구현 세부보다 "왜 이렇게 나뉘는가"를 설명합니다.
- 새 기능을 넣을 때 어디를 건드려야 하는지 감이 오도록 써야 합니다.

</guidelines>
