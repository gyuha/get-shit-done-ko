# Upstream Sync 기준선

## Upstream 소스

- 저장소: `https://github.com/gsd-build/get-shit-done`
- Initial import source: 로컬 `origin/` 서브모듈 스냅샷

## 고정 버전

- 기준 태그: `v1.28.0`
- 포크 기준선 의미: 이 포크의 첫 한국어화 기준선이며, 이후 sync diff는 이 버전 대비로 읽습니다.

## 기계 판독용 기준선

- 추적 기준선 파일: `get-shit-done/UPSTREAM_VERSION`
- 현재 추적 중인 upstream 기준선: `v1.28.0`
- 유지보수자 비교 명령:

```bash
node scripts/check-upstream-release.cjs --current-file get-shit-done/UPSTREAM_VERSION --json
```

이 파일은 fork의 `package.json` 버전과 별개로 관리합니다. 현재 이 포크의 npm package version은 upstream baseline보다 앞설 수 있으므로, upstream sync 판단은 `package.json`만으로 하지 않습니다.

비교 결과는 항상 다음 필드를 함께 읽습니다.

- tracked upstream baseline
- latest upstream release
- latest upstream release published date
- fork `package.json` version
- compare status (`current`, `update_available`, `ahead`)

## 가져온 최상위 항목

Phase 1 루트 import에서 다음 upstream 추적 항목을 저장소 루트에 그대로 복사했습니다.

- `.github`
- `.gitignore`
- `.release-monitor.sh`
- `CHANGELOG.md`
- `LICENSE`
- `README.md`
- `SECURITY.md`
- `agents`
- `assets`
- `bin`
- `commands`
- `docs`
- `get-shit-done`
- `hooks`
- `package-lock.json`
- `package.json`
- `scripts`
- `tests`

## 유지한 로컬 파일

루트 import 중에도 다음 로컬 관리 파일은 의도적으로 유지했습니다.

- `.planning/`
- `AGENTS.md`
- `CLAUDE.md`

## 영어로 유지해야 하는 토큰

이 한국어화 포크는 다음 토큰을 번역하지 않습니다.

- 명령
- 파일 이름
- 디렉토리 이름
- 식별자
- 단계/요구사항 ID

## 이 포크의 언어 정책

- 한국어를 기본 읽기 언어로 둡니다.
- Commands, file names, directory names, identifiers, phase/requirement IDs는 영어 그대로 유지합니다.
- upstream에 있었던 Simplified Chinese 문서는 이 포크에서 제거합니다.
- 영어 참고 경로는 유지된 파일 경로 규칙과 upstream baseline 링크로 계속 제공합니다.

## Phase 5 릴리스 결과

Phase 5에서 다음 release guardrail을 최종 확인했습니다.

- `node scripts/run-tests.cjs` 전체 스위트가 통과했습니다.
- `validate health`, `validate consistency`, `roadmap analyze`가 녹색입니다.
- non-Claude runtime install 변환에서 남아 있던 bare `~/.claude` / `$HOME/.claude` 경로 누수를 수리했습니다.
- 유지보수자용 release 절차는 [RELEASE-CHECKLIST.md](RELEASE-CHECKLIST.md)로 분리했습니다.

## 이후 import를 위한 sync 가드레일

새 upstream 버전을 가져올 때는 아래 순서를 기본값으로 사용하세요.

1. upstream tree를 루트 구조 그대로 가져옵니다.
2. Chinese 문서가 다시 들어오면 정책 변경이 없는 한 제거합니다.
3. 한국어화 전에 command/path/identifier/ID 토큰이 바뀌지 않았는지 diff로 먼저 확인합니다.
4. 한국어 문장층을 얹은 뒤 아래 canonical validation 명령을 다시 실행합니다.

```bash
node get-shit-done/bin/gsd-tools.cjs validate health
node get-shit-done/bin/gsd-tools.cjs validate consistency
node get-shit-done/bin/gsd-tools.cjs roadmap analyze
node --test tests/path-replacement.test.cjs tests/runtime-converters.test.cjs tests/codex-config.test.cjs tests/antigravity-install.test.cjs tests/copilot-install.test.cjs
node scripts/run-tests.cjs
```

## 유지보수자 sync 스킬

Maintainer-only repo sync는 `$gsd-update`가 아니라 `$gsd-sync-upstream`로 다룹니다.

기본 흐름:

1. `get-shit-done/UPSTREAM_VERSION`를 읽어 tracked upstream baseline을 확인합니다.
2. `scripts/check-upstream-release.cjs`로 `gsd-build/get-shit-done` GitHub releases를 확인합니다.
3. upstream latest가 더 높을 때만 dry-run/apply sync 흐름으로 진행합니다.
4. upstream latest가 같거나 더 낮으면 비교한 버전과 날짜를 보여 주고 no-op으로 종료합니다.
5. dry-run은 `node scripts/apply-upstream-refresh.cjs --from-current --to-tag <tag> --dry-run`로 먼저 실행하고, touched paths / preserved paths / overlay reapply 목록을 확인합니다.

dry-run review fields:

- incoming tag
- status
- no-op
- touched paths
- preserved paths
- overlay reapply
- overlay delete

compare status 해석:

- `current`: tracked baseline과 upstream latest가 같다. no-op으로 종료합니다.
- `ahead`: tracked baseline이 upstream latest보다 앞선다. local-ahead를 설명하고 no-op으로 종료합니다.
- `update_available`: upstream latest가 더 새롭다. 이 경우에만 dry-run/apply로 넘어갑니다.

권장 실행 순서:

```bash
node scripts/check-upstream-release.cjs --current-file get-shit-done/UPSTREAM_VERSION --json
node scripts/apply-upstream-refresh.cjs --from-current --to-tag <latest_tag> --dry-run
node scripts/apply-upstream-refresh.cjs --to-tag <latest_tag> --mode source-of-truth
node get-shit-done/bin/gsd-tools.cjs validate health
node get-shit-done/bin/gsd-tools.cjs validate consistency
node get-shit-done/bin/gsd-tools.cjs roadmap analyze
node scripts/run-tests.cjs
```

`--mode source-of-truth`는 tracked upstream import surface를 다시 가져오고, local overlay를 재적용하고, 제거된 overlay를 삭제한 뒤 `get-shit-done/UPSTREAM_VERSION`를 새 baseline으로 갱신하는 기본 apply mode입니다.

루트 import surface를 일시적으로 넓혀야 하면 `--include-entry <path>`를 추가할 수 있습니다.

```bash
node scripts/apply-upstream-refresh.cjs --to-tag <latest_tag> --mode source-of-truth --include-entry prompts
```

이 escape hatch는 opt-in이며, `.planning/`, `AGENTS.md`, `CLAUDE.md`, `.codex/`, `.claude/`, `.opencode/` 같은 preserved local paths는 여전히 import 대상에 넣을 수 없습니다.

`check-upstream-release.cjs` 결과에서 `update_available`이 `false`면 여기서 멈추고 no-op으로 끝냅니다. 이때는 tracked upstream baseline이 upstream latest와 같거나 더 앞선 상태입니다.

즉:
- `status: current` → no-op, worktree untouched
- `status: ahead` → no-op, worktree untouched
- `status: update_available` → dry-run 가능

현재 비교 기준은 반드시 다음 두 값입니다.

- 추적된 업스트림 기준선: `get-shit-done/UPSTREAM_VERSION`
- 업스트림 최신 릴리스: `https://github.com/gsd-build/get-shit-done/releases`

fork `package.json` version은 참고 정보일 뿐, sync eligibility의 단독 source of truth가 아닙니다.

즉, 이 유지보수 흐름은 `package.json` 버전만 보고 결정하지 않고, `get-shit-done/UPSTREAM_VERSION`에 기록된 tracked upstream baseline과 GitHub releases latest를 비교해 판단합니다.

## 허용되는 예외

- commands/agents frontmatter의 `description`는 installer 및 generated config compatibility 때문에 영어 원문을 유지할 수 있습니다.
- prose는 한국어 우선이어도, snippet 안의 명령어/경로/placeholder/식별자는 원문 그대로 유지해야 합니다.

## 유지보수자 메모

- `v1.28.0`를 이 포크의 첫 imported baseline으로 취급합니다.
- root-level upstream layout은 이후 diff와 재동기화를 쉽게 하기 위해 유지합니다.
- 번역 작업 중 compatibility-sensitive token을 rename하지 마세요.
- 릴리스 전에 [RELEASE-CHECKLIST.md](RELEASE-CHECKLIST.md)를 한 번 그대로 따라가면 Phase 5 기준 검증 경로를 재현할 수 있습니다.
