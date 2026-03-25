# Phase 4: validation-and-reporting - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-25
**Phase:** 04-validation-and-reporting
**Areas discussed:** Validation Execution Policy, Final Verdict Model, Reporting Artifacts, Failure Routing And Follow-up

---

## Validation Execution Policy

| Option | Description | Selected |
|--------|-------------|----------|
| 항상 전체 실행 | `validate health`, `validate consistency`, `roadmap analyze`, `scripts/run-tests.cjs`를 매번 모두 실행 | |
| 기본은 전체 실행, 빠른 검증 모드는 별도 옵션 | 기본은 전체 실행으로 잠그고 명시적 opt-in일 때만 축소 경로 허용 | ✓ |
| 단계별 조건부 실행 | 변경 위험도에 따라 일부 검증만 실행 | |

**User's choice:** 기본은 전체 실행, 빠른 검증 모드는 별도 옵션
**Notes:** 빠른 검증도 임의 축소가 아니라 정책으로 관리해야 함.

| Option | Description | Selected |
|--------|-------------|----------|
| canonical 3종만 유지 | 빠른 모드에서 `scripts/run-tests.cjs`만 생략 가능 | |
| 집중 compatibility 테스트만 실행 | canonical 3종 + compatibility-focused test bundle | ✓ |
| 사용자 지정 선택 | maintainer가 그때그때 테스트 범위를 선택 | |

**User's choice:** 집중 compatibility 테스트만 실행
**Notes:** 빠른 검증은 자유 선택이 아니라 고정 묶음이어야 함.

| Option | Description | Selected |
|--------|-------------|----------|
| maintainer가 명시하면 항상 허용 | 빠른 모드를 요청하면 언제나 허용 | |
| 낮은 위험도일 때만 허용 | 변경 위험도 판단을 별도 규칙으로 운영 | |
| dry-run/audit 결과가 깨끗할 때만 허용 | policy warning이나 audit debt가 없을 때만 빠른 모드 허용 | ✓ |

**User's choice:** dry-run/audit 결과가 깨끗할 때만 허용
**Notes:** 허용 조건은 기존 audit signal에 기대는 방향을 선호함.

| Option | Description | Selected |
|--------|-------------|----------|
| 현재 docs/UPSTREAM-SYNC.md 집중 테스트 그대로 | install/runtime 위주 5개 테스트 유지 | |
| 위 5개 + upstream sync 관련 테스트 추가 | 기존 묶음에 `upstream-sync`, `localization-gap-audit` 관련 테스트 추가 | ✓ |
| 별도 helper로 전용 묶음 정의 | 현재 목록을 고정하지 않고 새 entrypoint에서 관리 | |

**User's choice:** 위 5개 + upstream sync 관련 테스트 추가
**Notes:** 빠른 모드라도 Phase 1~3 산출물 회귀를 직접 커버해야 함.

---

## Final Verdict Model

| Option | Description | Selected |
|--------|-------------|----------|
| 3단계 | `pass / pass-with-caveats / fail` | |
| 4단계 | `pass / pass-with-caveats / partial / fail` | ✓ |
| 5단계 이상 | `manual-review` 등 더 많은 상태 추가 | |

**User's choice:** 4단계
**Notes:** 상태는 유지보수자가 빠르게 읽을 수 있을 정도로만 세분화.

| Option | Description | Selected |
|--------|-------------|----------|
| 검증을 일부만 실행한 경우 | 허용된 축소 검증만 끝난 상태를 `partial`로 정의 | ✓ |
| 사람 검토가 남은 경우 | manual review 잔여를 `partial`로 정의 | |
| 둘 다 포함 | 축소 검증 또는 manual review 잔여를 모두 `partial`로 정의 | |

**User's choice:** 검증을 일부만 실행한 경우
**Notes:** 사람 검토 잔여는 `pass-with-caveats` 쪽으로 분리.

| Option | Description | Selected |
|--------|-------------|----------|
| 자동 검증은 통과했지만 후속 확인 항목이 남은 경우 | manual follow-up이나 번역 후속 등 non-fatal residue를 caveat로 분류 | ✓ |
| 경고가 하나라도 있으면 모두 caveats | 모든 non-fatal warning을 caveat로 통합 | |
| 사람 검토가 남은 경우만 caveats | 문서/cleanup성 후속 조치는 제외 | |

**User's choice:** 자동 검증은 통과했지만 후속 확인 항목이 남은 경우
**Notes:** `pass-with-caveats`는 자동 검증 통과를 전제로 함.

| Option | Description | Selected |
|--------|-------------|----------|
| 검증 명령 실패만 fail | command/test failure만 fail 처리 | |
| 검증 실패 + 정책 위반은 fail | command/test failure 외에 `zh_cn_reintroduced`, preserved path 침범, token-sensitive drift 확정도 fail | ✓ |
| 전체 테스트 실패만 fail | 나머지는 caveat/partial 처리 | |

**User's choice:** 검증 실패 + 정책 위반은 fail
**Notes:** non-negotiable 위반은 명시적 fail이어야 함.

---

## Reporting Artifacts

| Option | Description | Selected |
|--------|-------------|----------|
| phase artifact로 남김 | `.planning/phases/04-validation-and-reporting/` 아래에 report 저장 | ✓ |
| `docs/` 아래 maintainer report | 운영 문서 쪽에 report 저장 | |
| 둘 다 | phase artifact + docs 요약 동시 유지 | |

**User's choice:** phase artifact로 남김
**Notes:** planning/runtime result source-of-truth를 phase 디렉터리에 둠.

| Option | Description | Selected |
|--------|-------------|----------|
| Markdown 중심 | 사람이 읽는 report가 기본 | |
| JSON + Markdown 둘 다 | machine-readable + human-readable artifact 동시 생성 | ✓ |
| JSON 중심 | 자동화 우선 | |

**User's choice:** JSON + Markdown 둘 다
**Notes:** maintainer 판독성과 후속 자동화 둘 다 필요함.

| Option | Description | Selected |
|--------|-------------|----------|
| 실행 1회당 report 1쌍 | 매 실행마다 상세 report 1쌍 생성 | |
| 최신 상태 단일 파일 | 같은 파일을 덮어씀 | |
| 누적 인덱스 + 실행별 상세 | 실행별 report를 남기고 latest 포인터/index도 유지 | ✓ |

**User's choice:** 누적 인덱스 + 실행별 상세
**Notes:** latest만 있으면 diff와 역사적 판단 맥락이 사라짐.

| Option | Description | Selected |
|--------|-------------|----------|
| 판정 중심 | verdict/caveats/next actions만 강조 | |
| 판정 + 실행 근거 | verdict에 더해 실행한 명령, 결과, audit 요약, fast-path 여부를 함께 기록 | ✓ |
| 풀 덤프 | raw output 위주로 거의 전부 포함 | |

**User's choice:** 판정 + 실행 근거
**Notes:** 보고서는 운영 로그가 아니라 maintainer decision artifact여야 함.

---

## Failure Routing And Follow-up

| Option | Description | Selected |
|--------|-------------|----------|
| 즉시 중단 | 첫 fail에서 모든 후속 검사를 멈춤 | |
| 진단 목적의 나머지 검사 계속 | fail 이후에도 가능한 검사를 모두 계속 | |
| 케이스별 | 정책 위반/구조 실패와 일반 실패를 분리 처리 | ✓ |

**User's choice:** 케이스별
**Notes:** fail 이후 routing은 severity와 종류에 따라 달라져야 함.

| Option | Description | Selected |
|--------|-------------|----------|
| 정책 위반만 즉시 중단 | non-negotiable 위반만 hard stop | |
| 정책 위반 + 구조 무결성 실패 즉시 중단 | policy violation과 `validate consistency`/`roadmap analyze` 구조 실패를 hard stop | ✓ |
| 모든 fail 즉시 중단 | fail이면 전부 중단 | |

**User's choice:** 정책 위반 + 구조 무결성 실패 즉시 중단
**Notes:** 구조가 깨진 상태에서는 추가 진단 가치가 낮음.

| Option | Description | Selected |
|--------|-------------|----------|
| 남은 검사를 계속 돌리고 action list 생성 | test/health failure 후 가능한 검사를 더 수행 | ✓ |
| 같은 계열만 추가 실행 | 동일 계열 검사만 더 수행 | |
| 바로 요약으로 전환 | 후속 검사 없이 report 작성 | |

**User's choice:** 남은 검사를 계속 돌리고 action list 생성
**Notes:** 한 번의 실행으로 수리 범위를 최대한 드러내길 원함.

| Option | Description | Selected |
|--------|-------------|----------|
| severity만 | `high / medium / low` 분류만 유지 | |
| owner + severity | `maintainer`, `translation follow-up`, `manual review`, `future phase` 같은 owner/track과 severity를 함께 저장 | ✓ |
| phase backlog로만 이관 | 지금 report는 간단히 남기고 후속은 backlog로 넘김 | |

**User's choice:** owner + severity
**Notes:** report에서 바로 actionability가 보여야 함.

---

## the agent's Discretion

- fast-path clean criteria의 세부 threshold
- report/index 파일 naming 규칙
- owner/severity enum의 세부값

## Deferred Ideas

None
