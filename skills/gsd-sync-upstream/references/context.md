# GSD Sync Context

이 문서는 프로젝트 로컬 `gsd-sync-upstream` 스킬이 `get-shit-done-ko` 저장소에서 upstream sync 결정을 내릴 때 필요한 핵심 context를 짧게 담습니다.

## Source of Truth

- tracked upstream baseline file: `get-shit-done/UPSTREAM_VERSION`
- maintainer runbook: `docs/UPSTREAM-SYNC.md`
- post-sync validation checklist: `docs/RELEASE-CHECKLIST.md`

핵심 규칙:

- sync eligibility의 source of truth는 항상 `get-shit-done/UPSTREAM_VERSION`입니다.
- fork의 `package.json` version은 비교 결과를 설명하는 보조 정보일 뿐, update/no-op/ahead 판단 근거가 아닙니다.
- compare 결과는 반드시 `current`, `update_available`, `ahead` 중 하나로 귀결되어야 합니다.
- upstream latest가 tracked baseline과 같거나 더 낮으면 no-op이어야 하며 worktree를 건드리면 안 됩니다.

## Compare Outcomes

- `current`: tracked baseline과 upstream latest가 같다. 비교 결과와 날짜를 보고하고 no-op으로 종료한다.
- `update_available`: upstream latest가 더 새롭다. dry-run으로 넘어갈 수 있다.
- `ahead`: tracked baseline이 upstream latest보다 앞선다. local-ahead 상태를 설명하고 no-op으로 종료한다.

## Import Surface

vendored refresh는 아래 upstream import entries를 경계로 삼습니다.

- `.github`
- `.gitignore`
- `.release-monitor.sh`
- `CHANGELOG.md`
- `LICENSE`
- `README.md`
- `README.zh-CN.md`
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

## Preserved Local Paths

refresh 전후에 아래 경로는 protected local paths로 유지합니다.

- `.planning/`
- `AGENTS.md`
- `CLAUDE.md`
- `.codex/`
- `.claude/`
- `.opencode/`

## Canonical Validation

apply 이후에는 아래 검증을 canonical sequence로 실행합니다.

```bash
node get-shit-done/bin/gsd-tools.cjs validate health
node get-shit-done/bin/gsd-tools.cjs validate consistency
node get-shit-done/bin/gsd-tools.cjs roadmap analyze
node scripts/run-tests.cjs
```

## Notes

- canonical apply mode는 `source-of-truth`이며, 명령은 `node scripts/apply-upstream-refresh.cjs --to-tag <latest_tag> --mode source-of-truth`입니다.
- 이 mode는 tracked upstream import surface를 다시 가져오고, local overlay를 재적용하고, 제거된 overlay를 삭제한 뒤 `get-shit-done/UPSTREAM_VERSION`를 갱신합니다.
- `validate health`가 degraded일 수 있는데, archived phase directories가 `.planning/milestones/` 아래로 이동한 기존 상태 때문인지 새 sync 변경 때문인지 구분해서 설명해야 합니다.
- maintainer에게는 항상 compare -> dry-run -> apply -> validation 순서로 안내합니다.
