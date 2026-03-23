# GSD 에이전트 레퍼런스

> 15개 전문 에이전트의 역할, 도구 권한, spawn 패턴, 상호 관계를 정리한 문서입니다. 전체 구조 맥락은 [Architecture](ARCHITECTURE.md)를 참고하세요.

> [!NOTE]
> 에이전트 이름, 도구 이름, 모델 이름, 파일 경로는 그대로 유지합니다. 설명은 한국어 우선으로 읽을 수 있게 정리합니다.

---

## 개요

GSD는 얇은 orchestrator(워크플로 파일)가 새로운 context window를 가진 전문 에이전트를 실행하는 multi-agent 구조를 사용합니다. 각 에이전트는 역할이 좁고, 도구 권한이 제한되며, 특정 산출물을 만들도록 설계되어 있습니다.

### 에이전트 분류

| 분류 | 수 | 에이전트 |
|------|----|-----------|
| 연구원 | 3 | 프로젝트연구원, 단계연구원, ui연구원 |
| 신디사이저 | 1 | 연구 합성기 |
| 기획자 | 1 | 플래너 |
| 로드맵 작성자 | 1 | 로드매퍼 |
| 집행자 | 1 | 집행자 |
| 체커 | 3 | 계획 검사기, 통합 검사기, UI 검사기 |
| 검증자 | 1 | 검증자 |
| 감사 | 2 | 나이퀴스트 감사자, ui 감사자 |
| 매퍼 | 1 | 코드베이스 매퍼 |
| 디버거 | 1 | 디버거 |

---

## 에이전트 상세

### gsd-프로젝트-연구원

**역할:** roadmap를 만들기 전에 도메인 생태계를 조사합니다.

| 속성 | 값 |
|------|----|
| **생성자** | `/gsd:new-project`, `/gsd:new-milestone` |
| **Parallelism** | 4개 인스턴스(stack, features, architecture, pitfalls) |
| **도구** | 읽기, 쓰기, Bash, Grep, Glob, WebSearch, WebFetch, mcp(context7) |
| **모델(균형)** | 소네트 |
| **프로듀스** | `.planning/research/STACK.md`, `FEATURES.md`, `ARCHITECTURE.md`, `PITFALLS.md` |

**주요 기능:**
- 현재 생태계 정보를 위한 웹 검색
- 라이브러리 문서를 위한 Context7 MCP 연동
- 연구 문서를 디스크에 직접 작성해 orchestrator 컨텍스트 부담 감소

---

### gsd-단계-연구원

**역할:** 특정 phase를 어떻게 구현할지 planning 전에 조사합니다.

| 속성 | 값 |
|------|----|
| **생성자** | `/gsd:plan-phase` |
| **Parallelism** | 4개 인스턴스(프로젝트 researcher와 같은 집중 영역) |
| **도구** | 읽기, 쓰기, Bash, Grep, Glob, WebSearch, WebFetch, mcp(context7) |
| **모델(균형)** | 소네트 |
| **프로듀스** | `{phase}-RESEARCH.md` |

**주요 기능:**
- CONTEXT.md를 읽고 사용자 결정에 맞춰 조사 범위를 집중
- 해당 phase 도메인의 구현 패턴 조사
- Nyquist validation 매핑을 위한 테스트 인프라 탐지

---

### gsd-ui-연구원

**역할:** 프론트엔드 phase를 위한 UI 디자인 계약을 생성합니다.

| 속성 | 값 |
|------|----|
| **생성자** | `/gsd:ui-phase` |
| **Parallelism** | 단일 인스턴스 |
| **도구** | 읽기, 쓰기, Bash, Grep, Glob, WebSearch, WebFetch, mcp(context7) |
| **모델(균형)** | 소네트 |
| **색상** | `#E879F9`(자홍색) |
| **프로듀스** | `{phase}-UI-SPEC.md` |

**주요 기능:**
- 디자인 시스템 상태(shadcn `components.json`, Tailwind config, 기존 token) 감지
- React/Next.js/Vite 프로젝트에 shadcn 초기화 제안
- 아직 답하지 않은 디자인 계약 질문만 제시
- 서드파티 컴포넌트에 registry safety gate 적용

---

### gsd-연구-합성기

**역할:** 병렬 researcher의 출력을 하나의 통합 요약으로 합칩니다.

| 속성 | 값 |
|------|----|
| **Spawned by** | `/gsd:new-project`(4개 researcher 완료 후) |
| **Parallelism** | 단일 인스턴스(researcher 이후 순차 실행) |
| **도구** | 읽기, 쓰기, 배쉬 |
| **모델(균형)** | 소네트 |
| **색상** | 보라색 |
| **프로듀스** | `.planning/research/SUMMARY.md` |

---

### gsd 플래너

**역할:** 작업 분해, 의존성 분석, 목표 역산 검증을 포함한 실행 가능한 phase plan을 만듭니다.

| 속성 | 값 |
|------|----|
| **생성자** | `/gsd:plan-phase`, `/gsd:quick` |
| **Parallelism** | 단일 인스턴스 |
| **도구** | 읽기, 쓰기, Bash, Glob, Grep, WebFetch, mcp(context7) |
| **모델(균형)** | 오퍼스 |
| **색상** | 그린 |
| **Produces** | `{phase}-{N}-PLAN.md` 파일 |

**핵심 동작:**
- PROJECT.md, REQUIREMENTS.md, CONTEXT.md, RESEARCH.md를 읽음
- 단일 컨텍스트 창에 맞는 2~3개의 원자적 task plan 생성
- `<task>` 요소를 포함한 XML 구조 사용
- `read_first`, `acceptance_criteria` 섹션 포함
- plan을 의존성 wave로 그룹화

---

### gsd-로드매퍼

**역할:** phase 분해와 requirement 매핑이 포함된 프로젝트 roadmap를 생성합니다.

| 속성 | 값 |
|------|----|
| **생성자** | `/gsd:new-project` |
| **Parallelism** | 단일 인스턴스 |
| **도구** | 읽기, 쓰기, Bash, Glob, Grep |
| **모델(균형)** | 소네트 |
| **색상** | 보라색 |
| **프로듀스** | `ROADMAP.md` |

**핵심 동작:**
- requirement를 phase에 매핑해 traceability 확보
- requirement에서 success criteria 도출
- phase 수에 대해 granularity 설정 반영
- coverage 검증(v1 requirement가 모두 phase에 매핑되었는지 확인)

---

### gsd 실행자

**역할:** 원자적 commit, deviation 처리, checkpoint 프로토콜에 따라 GSD plan을 실행합니다.

| 속성 | 값 |
|------|----|
| **생성자** | `/gsd:execute-phase`, `/gsd:quick` |
| **Parallelism** | 다중 인스턴스(wave 내부 병렬, wave 간 순차) |
| **도구** | 읽기, 쓰기, 편집, Bash, Grep, Glob |
| **모델(균형)** | 소네트 |
| **색상** | 노란색 |
| **Produces** | 코드 변경, git commit, `{phase}-{N}-SUMMARY.md` |

**핵심 동작:**
- plan마다 새 200K 컨텍스트 창 사용
- XML task 지시를 정확히 따름
- 완료된 task마다 원자적 git commit 생성
- checkpoint 유형(auto, human-verify, decision, human-action) 처리
- plan 대비 deviation을 SUMMARY.md에 기록
- verification 실패 시 node repair 호출

---

### gsd-계획-검사기

**역할:** 실행 전에 plan이 phase 목표를 달성할 수 있는지 검증합니다.

| 속성 | 값 |
|------|----|
| **Spawned by** | `/gsd:plan-phase`(검증 루프, 최대 3회 반복) |
| **Parallelism** | 단일 인스턴스(반복형) |
| **도구** | 읽기, Bash, Glob, Grep |
| **모델(균형)** | 소네트 |
| **색상** | 그린 |
| **Produces** | 구체적 피드백이 담긴 PASS/FAIL 판정 |

**8개 검증 차원:**
1. 요구사항 적용 범위
2. 태스크 원자성
3. 의존성 순서
4. 파일 범위
5. 확인 명령
6. 상황에 맞는
7. 갭 감지
8. Nyquist 규정 준수(활성화된 경우)

---

### gsd-통합-검사기

**역할:** phase 간 통합과 end-to-end 흐름을 검증합니다.

| 속성 | 값 |
|------|----|
| **생성자** | `/gsd:audit-milestone` |
| **Parallelism** | 단일 인스턴스 |
| **도구** | 읽기, Bash, Grep, Glob |
| **모델(균형)** | 소네트 |
| **색상** | 블루 |
| **Produces** | 통합 검증 리포트 |

---

### gsd-ui-검사기

**역할:** UI-SPEC.md 디자인 계약을 품질 차원에 맞춰 검증합니다.

| 속성 | 값 |
|------|----|
| **Spawned by** | `/gsd:ui-phase`(검증 루프, 최대 2회 반복) |
| **Parallelism** | 단일 인스턴스 |
| **도구** | 읽기, Bash, Glob, Grep |
| **모델(균형)** | 소네트 |
| **색상** | `#22D3EE`(청록색) |
| **Produces** | BLOCK/FLAG/PASS 판정 |

---

### gsd-검증기

**역할:** goal-backward 분석으로 phase 목표 달성 여부를 검증합니다.

| 속성 | 값 |
|------|----|
| **Spawned by** | `/gsd:execute-phase`(모든 executor 완료 후) |
| **Parallelism** | 단일 인스턴스 |
| **도구** | 읽기, 쓰기, Bash, Grep, Glob |
| **모델(균형)** | 소네트 |
| **색상** | 그린 |
| **프로듀스** | `{phase}-VERIFICATION.md` |

**핵심 동작:**
- task 완료 여부뿐 아니라 phase 목표 기준으로 코드베이스 점검
- 구체적 근거와 함께 PASS/FAIL 판정
- `/gsd:verify-work`에서 다룰 이슈 기록

---

### gsd-nyquist-감사자

**역할:** 테스트를 생성해 Nyquist validation gap을 메웁니다.

| 속성 | 값 |
|------|----|
| **생성자** | `/gsd:validate-phase` |
| **Parallelism** | 단일 인스턴스 |
| **도구** | 읽기, 쓰기, 편집, Bash, Grep, Glob |
| **모델(균형)** | 소네트 |
| **Produces** | 테스트 파일, 갱신된 `VALIDATION.md` |

**핵심 동작:**
- 구현 코드는 절대 수정하지 않고 테스트 파일만 수정
- gap당 최대 3회 시도
- 구현 버그는 사용자에게 escalation으로 표시

---

### gsd-ui-감사자

**역할:** 구현된 프론트엔드 코드를 대상으로 사후 6축 시각 감사를 수행합니다.

| 속성 | 값 |
|------|----|
| **생성자** | `/gsd:ui-review` |
| **Parallelism** | 단일 인스턴스 |
| **도구** | 읽기, 쓰기, Bash, Grep, Glob |
| **모델(균형)** | 소네트 |
| **색상** | `#F472B6`(핑크) |
| **Produces** | 점수가 포함된 `{phase}-UI-REVIEW.md` |

**6개 감사 축(각 1~4점):**
1. 카피라이팅
2. 비주얼
3. 색상
4. 타이포그래피
5. 간격
6. 경험 디자인

---

### gsd-코드베이스-매퍼

**역할:** 코드베이스를 탐색하고 구조화된 분석 문서를 작성합니다.

| 속성 | 값 |
|------|----|
| **생성자** | `/gsd:map-codebase` |
| **Parallelism** | 4개 인스턴스(tech, architecture, quality, concerns) |
| **도구** | 읽기, Bash, Grep, Glob, 쓰기 |
| **모델(균형)** | 하이쿠 |
| **색상** | 청록색 |
| **Produces** | `.planning/codebase/*.md`(문서 7개) |

**핵심 동작:**
- 읽기 전용 탐색 + 구조화된 출력
- 문서를 디스크에 직접 작성
- 깊은 reasoning보다 파일 내용에서 패턴 추출에 집중

---

### gsd-디버거

**역할:** 지속 상태를 유지하면서 과학적 방법으로 버그를 조사합니다.

| 속성 | 값 |
|------|----|
| **Spawned by** | `/gsd:debug`, `/gsd:verify-work`(실패 시) |
| **Parallelism** | 단일 인스턴스(대화형) |
| **도구** | 읽기, 쓰기, 편집, Bash, Grep, Glob, WebSearch |
| **모델(균형)** | 소네트 |
| **색상** | 오렌지 |
| **Produces** | `.planning/debug/*.md`, knowledge-base 업데이트 |

**디버그 세션 생명주기:**
`gathering` → `investigating` → `fixing` → `verifying` → `awaiting_human_verify` → `resolved`

**핵심 동작:**
- 가설, 증거, 배제된 이론을 추적
- 상태가 context reset을 넘어 지속됨
- resolved 처리 전 사람의 검증 필요
- 해결 시 지속 knowledge base에 기록 추가
- 새 세션에서 knowledge base 참고

---

### gsd-사용자-프로파일러

**역할:** 세션 메시지를 8개 행동 차원으로 분석해 점수화된 개발자 프로필을 생성합니다.

| 속성 | 값 |
|------|----|
| **생성자** | `/gsd:profile-user` |
| **Parallelism** | 단일 인스턴스 |
| **도구** | 읽기 |
| **모델(균형)** | 소네트 |
| **색상** | 마젠타 |
| **Produces** | `USER-PROFILE.md`, `/gsd:dev-preferences`, `CLAUDE.md` 프로필 섹션 |

**행동 차원:**
커뮤니케이션 스타일, 결정 패턴, 디버깅 접근 방식, UX 선호도, 공급업체 선택, 좌절 유발 요인, 학습 스타일, 설명 깊이.

**핵심 동작:**
- 읽기 전용 에이전트로, 추출된 세션 데이터를 분석하며 파일은 수정하지 않음
- 신뢰도와 근거 인용이 포함된 점수화 차원 생성
- 세션 이력이 없을 때 설문 fallback 제공

---

## 에이전트 도구 권한 요약

| 에이전트 | 읽기 | 쓰기 | 편집 | 배쉬 | 그렙 | 글로브 | 웹검색 | 웹페치 | MCP |
|-------|------|-------|------|------|------|------|-----------|----------|-----|
| 프로젝트연구원 | ✓ | ✓ | | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| 위상연구원 | ✓ | ✓ | | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| ui연구원 | ✓ | ✓ | | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| 연구 합성기 | ✓ | ✓ | | ✓ | | | | | |
| 플래너 | ✓ | ✓ | | ✓ | ✓ | ✓ | | ✓ | ✓ |
| 로드매퍼 | ✓ | ✓ | | ✓ | ✓ | ✓ | | | |
| 집행자 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | | | |
| 계획 검사기 | ✓ | | | ✓ | ✓ | ✓ | | | |
| 통합 검사기 | ✓ | | | ✓ | ✓ | ✓ | | | |
| UI 검사기 | ✓ | | | ✓ | ✓ | ✓ | | | |
| 검증자 | ✓ | ✓ | | ✓ | ✓ | ✓ | | | |
| 나이퀴스트 감사관 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | | | |
| UI 감사자 | ✓ | ✓ | | ✓ | ✓ | ✓ | | | |
| 코드베이스 매퍼 | ✓ | ✓ | | ✓ | ✓ | ✓ | | | |
| 디버거 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | | |
| 사용자 프로파일러 | ✓ | | | | | | | | |

**최소 권한 원칙:**
- Checker는 읽기 전용(Write/Edit 없음)으로, 평가만 하고 수정하지 않음
- Researcher는 최신 생태계 정보를 위해 웹 접근 권한 보유
- Executor는 Edit 권한이 있어 코드를 수정하지만 웹 접근은 없음
- Mapper는 분석 문서를 작성하는 Write 권한은 있지만 Edit는 없어 코드 변경은 하지 않음
