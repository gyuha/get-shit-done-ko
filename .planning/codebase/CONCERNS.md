# Codebase Concerns

**Analysis Date:** 2026-03-24

## Tech Debt

**Source/runtime mirror 이중 관리:**
- Issue: `get-shit-done/` source asset과 `.claude/`, `.codex/`, `.opencode/` 같은 runtime mirror가 함께 존재함
- Why: 여러 AI 런타임에 맞춘 설치/개발 편의를 동시에 유지하기 때문
- Impact: source만 수정하고 mirror를 검증하지 않으면 실제 사용자 경험과 저장소 기준 동작이 어긋날 수 있음
- Fix approach: source 변경 후 관련 runtime conversion/install tests와 mirror 결과를 함께 확인

**대형 설치기 파일:**
- Issue: `bin/install.js`가 매우 큰 단일 파일로 많은 runtime 분기를 품고 있음
- Why: 설치 로직과 브랜드 치환, 경로 처리, runtime-specific 설정 주입이 한 파일에 축적됨
- Impact: 한 런타임 수정이 다른 런타임 회귀를 일으키기 쉬움
- Fix approach: 변경 시 대상 runtime test뿐 아니라 cross-runtime regression 범위를 넓게 확인

## Known Bugs

**Direct code bug not confirmed:**
- Symptoms: 이 분석에서 즉시 재현 가능한 런타임 버그는 확인하지 못함
- Trigger: N/A
- Workaround: 변경 전 관련 회귀 테스트 실행
- Root cause: N/A

## Security Considerations

**Planning file prompt-injection surface:**
- Risk: `.planning/`와 프롬프트 문서가 에이전트 입력으로 다시 소비되므로 악성 텍스트가 들어오면 후속 워크플로에 영향을 줄 수 있음
- Current mitigation: `get-shit-done/bin/lib/security.cjs`, `tests/prompt-injection-scan.test.cjs`, `hooks/gsd-prompt-guard.js`
- Recommendations: user-provided planning text를 추가할 때 existing guardrail과 test coverage를 함께 유지

**Credential-dependent integrations:**
- Risk: `BRAVE_API_KEY`, `FIRECRAWL_API_KEY`, `EXA_API_KEY`, git/npm credentials 누출 가능성
- Current mitigation: 코드베이스는 키 존재 여부만 감지하고, `.env` 직접 열람은 지양하는 흐름을 문서화함
- Recommendations: 디버깅 시 secret 값을 로그/문서에 복사하지 말고 existence check 중심으로 다룰 것

## Performance Bottlenecks

**Large-file startup logic in installer:**
- Problem: `bin/install.js`는 많은 런타임 분기와 문자열 치환을 단일 프로세스에서 수행
- Measurement: 정량 수치는 이 분석에서 수집하지 않음
- Cause: all-in-one installer design
- Improvement path: 기능 수정 시 영향 구간을 최소화하고, 필요하면 추후 모듈 분리 고려

## Fragile Areas

**Token-sensitive markdown and prompt assets:**
- Why fragile: command names, file paths, frontmatter keys, XML/Markdown labels는 parser와 runtime 변환이 직접 참조함 (`AGENTS.md`)
- Common failures: 번역 과정에서 command/path/identifier가 바뀌거나, 구조 토큰이 손상되는 경우
- Safe modification: 설명문만 현지화하고 식별자/경로/placeholder/IDs는 유지. 변경 후 관련 parser/template tests 실행
- Test coverage: `tests/template.test.cjs`, `tests/frontmatter*.test.cjs`, `tests/runtime-converters.test.cjs`

**Workflow text and CLI output coupling:**
- Why fragile: 테스트가 사용자-facing 문자열을 직접 assertion 함
- Common failures: 한국어 문구 조정이 `tests/dispatcher.test.cjs`, `tests/commands.test.cjs` 등을 깨뜨림
- Safe modification: 문구 변경 시 테스트 expectation도 같이 검토
- Test coverage: 42개 회귀 테스트 파일

**Worktree / planning path resolution:**
- Why fragile: `get-shit-done/bin/gsd-tools.cjs`는 `--cwd`, workstream, linked worktree를 모두 처리
- Common failures: subrepo/worktree에서 `.planning/` 루트 해석 불일치
- Safe modification: path resolution 코드를 건드릴 때 `tests/workspace.test.cjs`, `tests/workstream.test.cjs`, `tests/init*.test.cjs`를 함께 확인
- Test coverage: 관련 테스트 존재

## Scaling Limits

**문서 자산 중심 저장소 확장:**
- Current capacity: 수십 개 workflow/command/agent/template 문서와 다수 테스트를 수용
- Limit: 구조가 계속 커질수록 수동 동기화 포인트(source vs runtime mirrors, docs vs tests)가 증가
- Symptoms at limit: 번역 누락, runtime drift, 테스트 expectation 불일치
- Scaling path: source-of-truth 경로를 우선 수정하고 자동화된 검증을 더 적극적으로 사용

## Dependencies at Risk

**Upstream baseline dependence:**
- Risk: upstream `v1.28.0` 이후 변경을 부분적으로만 가져오면 구조 호환성 저하 가능
- Impact: 포크의 문서/워크플로/테스트가 upstream assumptions와 어긋날 수 있음
- Migration plan: `docs/UPSTREAM-SYNC.md`와 `scripts/check-upstream-release.cjs` 흐름을 따를 것

## Test Coverage Gaps

**Installed runtime smoke verification:**
- What's not tested: 실제 각 런타임 CLI 내부에서 모든 command/skill이 end-to-end로 동작하는지까지는 완전하게 보장되지 않음
- Risk: source tests는 통과하지만 설치 후 특정 runtime integration이 어긋날 수 있음
- Priority: Medium

**GitHub Actions / release pipeline specifics:**
- What's not tested: `.github/workflows/` 자체의 실제 CI execution semantics
- Risk: 로컬 검증은 통과하지만 hosted CI에서 차이가 날 수 있음
- Priority: Low

---
*Concerns audit: 2026-03-24*
*Update as issues are fixed or new ones discovered*
