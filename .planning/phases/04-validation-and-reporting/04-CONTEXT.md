# Phase 4: validation-and-reporting - Context

**Gathered:** 2026-03-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Upstream sync 이후 canonical validation, compatibility-focused validation, localization audit 결과를 묶어 maintainer가 동일 기능 보장 여부를 판정하고 후속 조치를 바로 취할 수 있는 validation/reporting flow를 완성한다. Compare/apply/localization audit 자체를 새로 정의하는 단계는 아니며, 기존 helper와 runbook 위에 실행 정책, verdict model, report artifact, failure routing을 고정하는 phase다.

</domain>

<decisions>
## Implementation Decisions

### Validation Execution Policy
- **D-01:** 기본 검증 경로는 `validate health` → `validate consistency` → `roadmap analyze` → `scripts/run-tests.cjs` 전체 실행으로 고정한다.
- **D-02:** 빠른 검증은 maintainer의 명시적 opt-in일 때만 허용한다. 기본 동작은 항상 전체 실행이다.
- **D-03:** 빠른 검증에서도 `validate health`, `validate consistency`, `roadmap analyze`는 항상 실행한다.
- **D-04:** 빠른 검증의 테스트 범위는 임의 선택이 아니라 compatibility-focused 고정 묶음으로 잠근다.
- **D-05:** 빠른 검증은 dry-run/localization audit 결과가 깨끗할 때만 허용한다.
- **D-06:** 빠른 검증 테스트 묶음에는 기존 install/runtime 집중 테스트에 더해 `tests/upstream-sync.test.cjs`, `tests/localization-gap-audit.test.cjs` 같은 sync 직접 관련 테스트를 포함한다.

### Final Verdict Model
- **D-07:** 최종 verdict는 `pass / pass-with-caveats / partial / fail` 4단계 모델을 사용한다.
- **D-08:** `partial`은 허용된 빠른 검증만 완료된 상태를 뜻한다. 사람 검토 잔여 때문에 `partial`로 내리지 않는다.
- **D-09:** `pass-with-caveats`는 자동 검증은 통과했지만 사람이 이어서 확인하거나 처리할 항목이 남은 상태를 뜻한다.
- **D-10:** `fail`에는 검증 명령 실패뿐 아니라 `zh_cn_reintroduced`, preserved path 침범, token-sensitive drift 확정 같은 명백한 정책 위반도 포함한다.

### Reporting Artifacts
- **D-11:** validation/reporting 결과는 `.planning/phases/04-validation-and-reporting/` 아래 phase artifact로 남긴다.
- **D-12:** 보고 결과는 JSON + Markdown 두 형식 모두 생성한다.
- **D-13:** 실행별 상세 report 파일을 남기고, 최신 상태를 가리키는 index 또는 포인터 파일도 함께 유지한다.
- **D-14:** 각 report에는 tracked baseline, latest release, apply mode, final verdict, 빠른 검증 여부, 실행한 검증 명령 목록, 각 결과, audit 요약, caveats, next actions를 포함한다.

### Failure Routing And Follow-up
- **D-15:** failure 후 동작은 단일 규칙이 아니라 케이스별 routing으로 처리한다.
- **D-16:** 정책 위반과 구조 무결성 실패(`validate consistency` 실패, `roadmap analyze` 자체 실패 등)는 즉시 중단한다.
- **D-17:** 테스트 실패나 `validate health` 실패는 즉시 중단하지 않고 가능한 검사를 계속 수행해 action list를 풍부하게 남긴다.
- **D-18:** fail이 아니지만 후속 조치가 필요한 항목은 `owner + severity`로 분류한다.

### the agent's Discretion
- 빠른 검증 허용 여부를 판단할 때 dry-run/audit 결과 중 어떤 신호를 "깨끗함"으로 볼지 세부 판정 규칙
- 실행별 report 파일명과 latest index 파일명 규칙
- `owner + severity` 분류의 구체 enum과 Markdown/JSON 표현 방식

</decisions>

<specifics>
## Specific Ideas

- Verdict model은 사람이 빠르게 읽을 수 있어야 하므로 5단계 이상으로 세분화하지 않는다.
- 빠른 검증은 "임의 선택"이 아니라 문서화된 compatibility test bundle이어야 한다.
- reporting artifact는 운영 로그가 아니라 maintainer decision artifact로 읽혀야 한다.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Scope And Requirements
- `.planning/ROADMAP.md` — Phase 4 goal, success criteria, plan count를 정의한다.
- `.planning/REQUIREMENTS.md` — `VAL-01`, `VAL-02`, `VAL-03`, `RPT-01`, `RPT-02` acceptance target을 정의한다.
- `.planning/PROJECT.md` — upstream sync skill의 core value, compatibility/safety/verification constraints를 정의한다.

### Upstream Sync Validation Policy
- `docs/UPSTREAM-SYNC.md` — canonical validation sequence, quick validation에 연결되는 compatibility-focused test set, localization audit interpretation을 정의한다.
- `skills/gsd-sync-upstream/SKILL.md` — maintainer sync flow의 compare/dry-run/apply/audit/validation ordering contract를 정의한다.

### CLI And Implementation Surfaces
- `docs/CLI-TOOLS.md` — `validate health`, `validate consistency`, `roadmap analyze` 등 CLI command contract를 설명한다.
- `scripts/apply-upstream-refresh.cjs` — apply mode, preserved paths, import surface guardrail의 source implementation이다.
- `scripts/audit-localization-gap.cjs` — `overlay_missing`, `zh_cn_reintroduced`, `token_sensitive_candidates` audit field semantics의 source implementation이다.
- `get-shit-done/bin/lib/verify.cjs` — validation/verification command behavior와 failure surface를 정의하는 핵심 implementation이다.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `scripts/apply-upstream-refresh.cjs`: apply mode, preserved path, import surface 정보를 이미 계산한다.
- `scripts/audit-localization-gap.cjs`: changed files, translation candidates, policy violation signals를 이미 산출한다.
- `get-shit-done/bin/lib/verify.cjs`: `validate health`, `validate consistency`, summary/phase verification 로직이 이미 있다.
- `scripts/run-tests.cjs`: 전체 회귀 테스트 entrypoint가 이미 있다.

### Established Patterns
- CLI/verification 로직은 CommonJS 기반 helper와 `gsd-tools.cjs` command dispatch로 연결된다.
- 검증 성공/실패는 stdout/stderr와 JSON output contract로 동시에 다뤄지는 패턴이 강하다.
- 운영 가드레일은 `docs/UPSTREAM-SYNC.md` 같은 maintainer runbook과 실제 helper script contract를 함께 맞추는 방식으로 고정되어 왔다.

### Integration Points
- Phase 4 구현은 `$gsd-sync-upstream` flow와 `docs/UPSTREAM-SYNC.md`의 canonical sequence를 직접 소비해야 한다.
- report artifact는 `.planning/phases/04-validation-and-reporting/`에 생성돼 downstream planner/executor/verifier가 읽을 수 있어야 한다.
- 테스트 묶음 정의는 `scripts/run-tests.cjs`, 개별 `node --test ...`, 또는 새 helper entrypoint 중 하나와 연결될 가능성이 높다.

</code_context>

<deferred>
## Deferred Ideas

없음 — discussion이 phase 범위 안에서 유지됨

</deferred>

---

*Phase: 04-validation-and-reporting*
*Context gathered: 2026-03-25*
