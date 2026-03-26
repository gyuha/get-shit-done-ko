# Codebase Concerns

**Analysis Date:** 2026-03-26

## Tech Debt

**다중 runtime 미러 트리 유지:**
- Issue: 동일한 자산을 루트 `agents/`, `get-shit-done/`뿐 아니라 `.claude/`, `.codex/`, `.opencode/` 아래에도 중복 보관한다.
- Why: 런타임별 설치 산출물을 저장소 안에 vendoring해 두고 upstream sync 시 그대로 재적용하는 구조다. 현재 `agents/`, `.claude/agents/`, `.codex/agents/`, `.opencode/agents/`에 파일이 합쳐서 90개, `get-shit-done/`, `.claude/get-shit-done/`, `.codex/get-shit-done/`, `.opencode/get-shit-done/` 아래에 534개가 있다.
- Impact: 한쪽만 수정되면 런타임별 동작이 즉시 어긋난다. 특히 localization, hook, workflow 수정이 `.claude/`, `.codex/`, `.opencode/` 중 일부에만 반영되면 설치 후 실제 사용자 경험이 저장소 루트와 달라진다.
- Fix approach: source-of-truth를 `agents/`와 `get-shit-done/`로 더 엄격히 고정하고, `.claude/`, `.codex/`, `.opencode/`는 생성 산출물로 취급해 parity 검증을 자동화한다. 수정 후에는 `scripts/apply-upstream-refresh.cjs`, `tests/upstream-sync.test.cjs`, `tests/runtime-converters.test.cjs`까지 함께 확인한다.

**대형 단일 파일 installer/router:**
- Issue: `bin/install.js`가 4,647줄짜리 단일 파일로 설치, uninstall, runtime 변환, hook/config 수정, skill 복사까지 모두 처리한다. `get-shit-done/bin/gsd-tools.cjs`도 다수의 CLI subcommand를 한 엔트리에서 분기한다.
- Why: 다중 runtime 지원을 빠르게 추가하면서 기능이 한 파일에 누적되었다.
- Impact: 작은 변경도 runtime 전체 회귀로 번지기 쉽고, 코드리뷰와 테스트 범위 판단이 어려워진다. 문자열 치환 규칙이나 path 변환을 잘못 건드리면 Claude/Codex/Cursor/Copilot/Antigravity 설치가 동시에 깨질 수 있다.
- Fix approach: runtime별 config mutation, markdown/path conversion, manifest/backup 로직을 `bin/install.js`에서 별도 모듈로 분리하고, `get-shit-done/bin/gsd-tools.cjs`는 command family 기준으로 lib 모듈에 더 내려보낸다.

**릴리스/로컬라이제이션 안전장치의 수동 의존:**
- Issue: release 차단 규칙과 localization token 검증의 핵심이 `docs/RELEASE-CHECKLIST.md`와 maintainer 수동 점검 절차에 의존한다.
- Why: 한국어 fork의 요구사항이 문서/프롬프트/토큰 보존 규칙까지 걸쳐 있어 완전 자동 검증이 아직 없다.
- Impact: CI가 통과해도 `@` references, placeholder, runtime-specific command literal, zh-CN 재유입 같은 문제를 배포 직전에 놓칠 수 있다.
- Fix approach: `docs/RELEASE-CHECKLIST.md`에 적힌 수동 점검 중 기계 판별 가능한 항목을 `scripts/audit-localization-gap.cjs`, `tests/localization-gap-audit.test.cjs`, `tests/codex-config.test.cjs` 쪽으로 계속 이전한다.

## Known Bugs

**업데이트 훅이 잘못된 패키지 이름을 조회함:**
- Symptoms: update check가 fork 패키지인 `get-shit-done-ko`가 아니라 upstream 패키지 `get-shit-done-cc`의 최신 버전을 본다.
- Trigger: SessionStart hook로 `hooks/gsd-check-update.js` 또는 배포본 `hooks/dist/gsd-check-update.js`가 실행될 때.
- Workaround: `/gsd:update` workflow와 `get-shit-done/workflows/update.md` 기준으로 수동 업데이트 판단을 한다.
- Root cause: hook 구현은 아직 `execSync('npm view get-shit-done-cc version', ...)`를 사용하고, 저장소의 실제 package identity는 `package.json`, `README.md`, `tests/codex-config.test.cjs`에서 `get-shit-done-ko`로 이미 바뀌어 있다.

**헬스체크가 잘못된 재설치 명령을 안내함:**
- Symptoms: `validate health`의 W010 경고가 `npx get-shit-done-cc@latest` 재설치를 안내한다.
- Trigger: `get-shit-done/bin/lib/verify.cjs`에서 agent 누락을 감지할 때.
- Workaround: 안내 문구 대신 실제 패키지 이름인 `npx get-shit-done-ko@latest`를 사용한다.
- Root cause: fork rename 이후에도 `get-shit-done/bin/lib/verify.cjs`의 경고 문자열이 upstream 명령을 유지하고 있다.

**비영문 문서/자산에 upstream 패키지명이 일부 남아 있음:**
- Symptoms: 한국어/일본어 문서와 일부 자산이 `get-shit-done-cc`를 계속 노출해 설치/업데이트 안내가 혼동된다.
- Trigger: `docs/ko-KR/context-monitor.md`, `docs/ko-KR/FEATURES.md`, `docs/ja-JP/context-monitor.md`, `docs/ja-JP/FEATURES.md`, `assets/terminal.svg`를 볼 때.
- Workaround: 설치 안내는 `README.md`와 `bin/install.js`의 canonical command 예시를 우선한다.
- Root cause: localization overlay는 진행됐지만 비핵심 문서/이미지까지 패키지명 회귀 검증이 완전히 닿지 않았다.

## Security Considerations

**외부 소스 import 체인 신뢰 경계:**
- Risk: upstream refresh가 GitHub releases와 remote git clone 결과를 신뢰하고 루트 import surface를 덮어쓴다.
- Current mitigation: `scripts/check-upstream-release.cjs`가 tracked baseline을 비교하고, `scripts/apply-upstream-refresh.cjs`가 `PRESERVED_PATHS`로 `.planning/`, `AGENTS.md`, `.codex/`, `.claude/`, `.opencode/`를 보존한다. `docs/RELEASE-CHECKLIST.md`도 dry-run과 touched-path 검토를 요구한다.
- Recommendations: remote tag import 전에 허용 경로 diff를 CI artifact로 저장하고, `scripts/apply-upstream-refresh.cjs`에 import 결과 checksum 또는 expected file manifest 검증을 추가한다.

**임시 파일 기반 상태 전달:**
- Risk: `hooks/gsd-statusline.js`, `hooks/gsd-context-monitor.js`, `get-shit-done/bin/lib/core.cjs`가 `os.tmpdir()` 아래 파일로 context metrics나 대형 JSON payload를 교환한다.
- Current mitigation: `get-shit-done/bin/lib/core.cjs`는 오래된 `gsd-` temp file을 정리하고, hooks는 stale/timeout 방어를 둔다.
- Recommendations: temp 파일명을 더 예측 불가능하게 만들고, 가능한 경우 `fs.mkdtempSync` 기반 전용 디렉터리 또는 더 짧은 lifetime cleanup을 적용한다. 민감도 높은 내용은 tmp relay에 실지 않는다.

**Shell/network 의존 명령 실행:**
- Risk: `hooks/gsd-check-update.js`, `scripts/apply-upstream-refresh.cjs`, `get-shit-done/bin/lib/init.cjs`, `get-shit-done/bin/lib/core.cjs`, `tests/helpers.cjs`가 `npm`, `git`, `sleep` 등 외부 명령 성공을 전제로 한다.
- Current mitigation: 일부 경로는 `execFileSync`와 timeout을 사용하고, `get-shit-done/bin/lib/security.cjs`가 path/prompt 입력 검증을 제공한다.
- Recommendations: shell 문자열 기반 호출을 더 줄이고 배열 인자 기반 호출로 통일한다. 외부 명령 실패 시 사용자-facing fallback과 오류 문구를 runtime별로 더 명확히 분리한다.

## Performance Bottlenecks

**세션 시작 시 네트워크 업데이트 조회:**
- Problem: `hooks/gsd-check-update.js`가 SessionStart마다 detached child를 띄워 `npm view ... version`을 호출한다.
- Measurement: 네트워크 timeout이 10초로 설정되어 있어 느린 네트워크나 차단된 환경에서는 매 세션 background process가 최대 10초 살아 있을 수 있다.
- Cause: 버전 캐시 갱신 전략이 npm registry 실시간 조회에 의존한다.
- Improvement path: TTL 기반 캐시를 강제하고, `get-shit-done/workflows/update.md`의 수동 update 루틴과 정렬된 더 드문 체크 전략으로 바꾼다.

**설치/제거 경로가 전체 트리를 반복 순회함:**
- Problem: `bin/install.js`는 runtime별 디렉터리 생성, hook/skills 복사, config mutation, stale artifact cleanup을 한 번에 수행한다.
- Measurement: `bin/install.js` 자체가 4,647줄이고 저장소 전체가 약 27MB다. 설치 시 `agents/`, `hooks/`, `get-shit-done/`, `skills/`를 여러 runtime 포맷으로 반복 변환한다.
- Cause: 설치 파이프라인이 증분 갱신보다 전체 동기화에 가깝다.
- Improvement path: manifest 기반 changed-files install로 줄이고, runtime별 변환 단계를 분리해 필요한 파일만 다시 쓴다.

## Fragile Areas

**Token-sensitive localization surface:**
- Why fragile: 이 fork는 설명문은 한국어화하되 command literal, file path, placeholder, XML/markdown 구조, `@` reference는 그대로 보존해야 한다.
- Common failures: 번역 중 `get-shit-done-cc`/`get-shit-done-ko` 혼재, zh-CN 링크 재유입, machine-sensitive token 손상.
- Safe modification: `AGENTS.md`, `docs/RELEASE-CHECKLIST.md`, `scripts/audit-localization-gap.cjs` 기준을 먼저 확인하고, 관련 변경 후 `tests/localization-gap-audit.test.cjs`, `tests/codex-config.test.cjs`, `tests/path-replacement.test.cjs`를 함께 돌린다.
- Test coverage: 일부 감사 테스트는 있지만 문서 전체와 자산 전체를 막지는 못한다.

**Runtime config mutation 로직:**
- Why fragile: `bin/install.js`는 Codex TOML, Claude/Gemini JSON, Copilot instructions, Cursor rules, skill adapters까지 서로 다른 형식을 직접 문자열로 수정한다.
- Common failures: idempotency 깨짐, 사용자 커스텀 hook 삭제, runtime별 path 치환 누락, uninstall 시 잔여 파일 남김.
- Safe modification: `tests/codex-config.test.cjs`, `tests/antigravity-install.test.cjs`, `tests/copilot-install.test.cjs`, `tests/cursor-conversion.test.cjs`, `tests/runtime-converters.test.cjs`가 닿는 경로에서만 변경하고, 배포본 `hooks/dist/`와 root `hooks/`도 같이 비교한다.
- Test coverage: 핵심 회귀는 있지만 pack/install smoke test와 실제 각 runtime 실행 검증은 부족하다.

**프로젝트 루트/워크트리 해석과 자동 config 수정:**
- Why fragile: `get-shit-done/bin/lib/core.cjs`와 `get-shit-done/bin/lib/init.cjs`는 `.planning/`, sub_repo, workstream, active worktree를 자동 해석하고 경우에 따라 `config.json`을 다시 쓴다.
- Common failures: 서브 리포/linked worktree에서 잘못된 루트를 잡거나, 자동 동기화가 사용자가 의도한 `sub_repos` 설정을 덮어쓸 수 있다.
- Safe modification: `tests/core.test.cjs`, `tests/init.test.cjs`, `tests/workspace.test.cjs`, `tests/workstream.test.cjs`와 함께 멀티리포/워크트리 시나리오를 확인한다.
- Test coverage: helper 기반 단위 회귀는 있으나 실제 nested worktree와 사용자 커스텀 config 조합은 제한적이다.

## Scaling Limits

**런타임/언어 추가 시 저장소 증식:**
- Current capacity: 현재 저장소는 약 27MB이고 `.opencode/` 8.6MB, `.codex/` 2.8MB, `.claude/` 2.3MB, `get-shit-done/` 1.6MB를 차지한다.
- Limit: 새 runtime 또는 locale을 추가할수록 mirror tree와 테스트 행렬이 선형 이상으로 늘어나 유지보수 비용이 급증한다.
- Symptoms at limit: upstream sync review가 길어지고, 한 수정이 여러 mirror/doc/runtime test를 동시에 만지게 된다.
- Scaling path: mirror tree를 생성 산출물로 축소하고, runtime-specific diff verification을 자동화해 저장소 안의 중복 원본 수를 줄인다.

## Dependencies at Risk

**외부 runtime config 포맷 변화:**
- Risk: Claude/Codex/Cursor/Copilot/Gemini/Antigravity의 config schema나 hook event 이름이 바뀌면 `bin/install.js` 기반 변환이 곧바로 깨진다.
- Impact: 설치는 성공해도 hooks/agents가 등록되지 않거나 일부 runtime에서만 동작이 누락될 수 있다.
- Migration plan: runtime별 schema probing을 더 보수적으로 하고, `tests/codex-config.test.cjs`, `tests/copilot-install.test.cjs`, `tests/antigravity-install.test.cjs`, `tests/cursor-conversion.test.cjs`에 새 포맷 fixture를 추가한다.

**GitHub API / npm registry / git CLI 가용성:**
- Risk: `scripts/check-upstream-release.cjs`, `scripts/apply-upstream-refresh.cjs`, `hooks/gsd-check-update.js`는 네트워크와 로컬 `git` 설치에 의존한다.
- Impact: offline, enterprise proxy, locked-down CI 환경에서 sync/update 흐름이 부분적으로 멈추거나 느려질 수 있다.
- Migration plan: 네트워크 실패를 no-op으로 더 일관되게 처리하고, `--latest-tag`, `--baseline-dir`, `--upstream-dir` 같은 offline override 경로를 운영 문서에 더 노출한다.

## Test Coverage Gaps

**커버리지 게이트가 installer/hook/script 본체를 강제하지 않음:**
- What's not tested: `package.json`의 coverage 명령은 `get-shit-done/bin/lib/*.cjs`만 포함하고 `bin/install.js`, `hooks/*.js`, `scripts/*.cjs`는 coverage gate에서 제외한다.
- Risk: 가장 취약한 설치/배포/업데이트 경로가 테스트는 있어도 계측 coverage와 미달 경고에서 빠진다.
- Priority: High

**패키징/실설치 smoke test 부재:**
- What's not tested: CI는 `.github/workflows/test.yml`에서 `npm run test:coverage`만 실행하고 `npm pack --dry-run`, 실제 install/uninstall, packed artifact 검증은 하지 않는다. `package.json`에는 `pack:dry-run` 스크립트가 있지만 workflow에서 사용하지 않는다.
- Risk: 테스트 통과 후에도 publish 결과물 누락, `hooks/dist/` 불일치, installer entrypoint packaging 오류가 릴리스 단계에서만 드러날 수 있다.
- Priority: High

**미러 트리 parity 검증 부족:**
- What's not tested: 루트 `agents/`, `get-shit-done/`, `hooks/`와 `.claude/`, `.codex/`, `.opencode/` mirror 사이의 내용 일치가 자동으로 검증되지 않는다.
- Risk: fork-local 수정이 특정 runtime mirror에만 누락돼 설치 후 환경별 동작 차이가 발생해도 테스트가 바로 잡지 못한다.
- Priority: Medium

---
*Concerns audit: 2026-03-26*
*Update as issues are fixed or new ones discovered*
