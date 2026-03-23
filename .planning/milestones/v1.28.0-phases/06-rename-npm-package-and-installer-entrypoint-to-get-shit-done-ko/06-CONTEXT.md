# Phase 6: Rename npm package and installer entrypoint to get-shit-done-ko - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning

<domain>
## Phase Boundary

이 phase는 설치 예시만 바꾸는 문서 수정 phase가 아니다. `npx get-shit-done-ko@latest`가 실제 install entrypoint로 동작하도록 npm package identity와 installer entrypoint를 `get-shit-done-ko`로 전환하고, 그에 맞춰 문서, update 흐름, 테스트를 정렬한다.

범위 안:
- `package.json` / `package-lock.json`의 package identity
- npm bin entry와 installer usage/help/update copy
- README/docs/workflows/tests에 남아 있는 `get-shit-done-cc` install/update/uninstall 예시

범위 밖:
- GSD command names, runtime flags, file paths, identifiers 변경
- dual package naming 유지
- 새로운 product capability 추가

</domain>

<decisions>
## Implementation Decisions

### Package identity
- **D-01:** npm package name은 `get-shit-done-ko`로 전환한다.
- **D-02:** npm bin command도 `get-shit-done-ko`로 전환한다.
- **D-03:** 사용자가 README에서 보는 설치 명령과 실제 배포 entrypoint는 반드시 동일해야 한다.

### Legacy compatibility policy
- **D-04:** `get-shit-done-cc`는 문서와 workflow에서 병기하지 않는다.
- **D-05:** update/help/install/uninstall 안내도 새 이름 `get-shit-done-ko` 기준으로 단일화한다.
- **D-06:** 기존 이름을 임시 호환 alias로 유지하는 방향은 이번 phase 범위에 포함하지 않는다.

### Scope of replacement
- **D-07:** 치환 대상은 README 한 곳이 아니라 `package.json`, lockfile, installer/help/update 문구, docs, workflows, tests 전체다.
- **D-08:** runtime flags(`--claude`, `--codex` 등), GSD command literals, 경로, 식별자는 그대로 유지한다.
- **D-09:** package identity 변경 후에도 install/uninstall/update flow와 테스트 계약은 녹색이어야 한다.

### the agent's Discretion
- npm metadata 중 package name 전환에 따라 같이 정리해야 하는 부가 필드 범위
- 테스트 보강 방식과 fixture 정렬 방식
- changelog/release note 반영 범위

</decisions>

<specifics>
## Specific Ideas

- 사용자는 README에서 `npx get-shit-done-ko@latest`를 보고 그대로 실행할 수 있어야 한다.
- 문서만 새 이름을 쓰고 실제 패키지는 예전 이름인 상태는 허용하지 않는다.
- 새 이름으로 완전 전환하고, 기존 `get-shit-done-cc` 표기는 제거한다.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Package identity and installer
- `package.json` — 현재 package name, bin entry, publish metadata 정의
- `package-lock.json` — 루트 package identity와 lockfile 반영 범위
- `bin/install.js` — installer help text, usage examples, WSL retry guidance, install/uninstall copy

### Public documentation
- `README.md` — 설치/업데이트/제거 예시와 public install entrypoint
- `docs/context-monitor.md` — 설치 과정에서 package invocation을 직접 언급하는 문서
- `docs/RELEASE-CHECKLIST.md` — release 전에 검증해야 할 canonical install/update surface

### Workflow/runtime references
- `get-shit-done/workflows/help.md` — help output에서 package install command를 안내
- `get-shit-done/workflows/update.md` — `npm view`, reinstall, manual update, local/global update flow가 package name에 묶여 있음

### Regression coverage
- `tests/codex-config.test.cjs` — installer-driven Codex flow coverage
- `tests/runtime-converters.test.cjs` — installer exports와 runtime conversion regression surface
- `tests/antigravity-install.test.cjs` — installer/runtime path regression surface
- `tests/copilot-install.test.cjs` — installer/runtime path regression surface

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `bin/install.js`: 모든 runtime install/uninstall/help entrypoint가 한 파일에 모여 있어 package rename 중심축이다.
- `scripts/run-tests.cjs`: full regression을 한 번에 다시 돌릴 수 있는 canonical suite다.
- `get-shit-done/bin/gsd-tools.cjs`: roadmap/state/planning 검증과 연동돼 phase close 후 health 확인에 재사용 가능하다.

### Established Patterns
- 이 저장소는 사람-facing 문장은 한국어 우선이지만 machine-sensitive token은 그대로 유지하는 패턴을 쓴다.
- 이전 phase들에서 runtime compatibility를 깨지 않도록 targeted regression test를 같이 보강하는 패턴이 정착돼 있다.
- release-prep 문서는 canonical command를 한 군데로 모으고 README에는 진입 링크만 두는 식으로 구성한다.

### Integration Points
- package rename은 npm metadata와 installer help text만이 아니라 README/docs/workflows/update flow를 함께 바꿔야 일관성이 생긴다.
- test surface는 package name literal을 직접 검증하지 않더라도 installer output과 update workflow 문자열에 간접적으로 묶여 있다.
- Phase 5에서 정리한 release checklist와 upstream sync 문서도 새 package identity를 기준으로 다시 읽혀야 한다.

</code_context>

<deferred>
## Deferred Ideas

- `get-shit-done-cc`를 별도 alias package로 유지하거나 redirect publish 전략을 도입하는 작업
- npm scope 변경, 조직 이전, registry 운영 정책 같은 배포 운영 확장

</deferred>

---

*Phase: 06-rename-npm-package-and-installer-entrypoint-to-get-shit-done-ko*
*Context gathered: 2026-03-23*
