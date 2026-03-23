# GSD Sync Context

이 문서는 `gsd-sync-upstream` 스킬이 `get-shit-done-ko` 저장소에서 upstream sync 결정을 내릴 때 필요한 핵심 context를 짧게 담습니다.

## Source of Truth

- tracked upstream baseline file: `get-shit-done/UPSTREAM_VERSION`
- maintainer runbook: `docs/UPSTREAM-SYNC.md`
- post-sync validation checklist: `docs/RELEASE-CHECKLIST.md`

핵심 규칙:

- fork의 `package.json` version은 참고 정보일 뿐입니다.
- upstream sync eligibility는 `get-shit-done/UPSTREAM_VERSION`와 upstream latest release 비교로 판단합니다.
- upstream latest가 tracked baseline과 같거나 더 낮으면 no-op이어야 합니다.

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

- `validate health`가 degraded일 수 있는데, archived phase directories가 `.planning/milestones/` 아래로 이동한 기존 상태 때문인지 새 sync 변경 때문인지 구분해서 설명해야 합니다.
- maintainer에게는 항상 compare -> dry-run -> apply -> validation 순서로 안내합니다.
