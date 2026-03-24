---
name: gsd-sync-upstream
description: get-shit-done-ko 유지보수자가 upstream GitHub release를 tracked baseline과 비교하고, 더 새로운 버전일 때만 vendored GSD를 안전하게 sync해야 할 때 사용하는 스킬. upstream sync, vendored refresh, baseline compare, no-op dry-run, get-shit-done-ko maintainer workflow 요청이 나오면 적극적으로 사용.
---

# GSD Upstream Sync

`get-shit-done-ko` 유지보수자가 upstream `gsd-build/get-shit-done` release를 현재 저장소의 tracked upstream baseline과 비교하고, upstream이 더 새로울 때만 vendored GSD tree를 안전하게 갱신하는 스킬입니다.

이 스킬은 maintainer 전용 repo sync 흐름입니다. npm runtime 설치를 갱신하는 `$gsd-update`와는 다릅니다.

## What to Read First

1. `references/context.md`
2. 저장소 루트의 `get-shit-done/UPSTREAM_VERSION`
3. 저장소 루트의 `docs/UPSTREAM-SYNC.md`
4. 저장소 루트의 `docs/RELEASE-CHECKLIST.md`

## Bundled Helpers

이 스킬은 아래 helper scripts를 함께 번들합니다.

- `scripts/check-upstream-release.cjs`
- `scripts/apply-upstream-refresh.cjs`

저장소 루트에 같은 이름의 repo-local scripts가 있으면 그것을 우선 사용합니다. 없으면 bundled scripts를 사용하되 `--cwd <repo-root>`를 넘겨 현재 저장소를 대상으로 실행합니다.

## Preconditions

현재 작업 디렉터리가 `get-shit-done-ko` 저장소 루트이거나, 적어도 아래 파일이 있는 repo root를 찾을 수 있어야 합니다.

- `get-shit-done/UPSTREAM_VERSION`
- `docs/UPSTREAM-SYNC.md`
- `docs/RELEASE-CHECKLIST.md`

repo root를 찾지 못하면 먼저 사용자에게 현재 저장소가 맞는지 확인합니다.

## Workflow

1. `references/context.md`를 읽고, tracked baseline file과 protected paths 정책을 파악합니다.
2. repo root를 기준으로 compare helper를 실행합니다.

```bash
node scripts/check-upstream-release.cjs --current-file get-shit-done/UPSTREAM_VERSION --json
```

3. 아래 값을 사용자에게 보고합니다.

- tracked upstream baseline
- latest upstream GitHub release tag
- latest upstream release published date
- fork `package.json` version
- compare status (`current`, `update_available`, `ahead`)

이 compare report는 항상 먼저 보여줘야 합니다. maintainer는 이 값들과 status만 보고 no-op인지, dry-run으로 갈 수 있는지, local-ahead인지 판단할 수 있어야 합니다.

4. `update_available`이 `false`면:

- repo가 `current`인지 `local-ahead`인지 분리해서 설명합니다.
- 이 판단이 `package.json`만이 아니라 `get-shit-done/UPSTREAM_VERSION` 기준임을 분명히 말합니다.
- 비교한 버전과 날짜를 보여 주고 명시적으로 no-op으로 종료합니다.
- 이 경로에서는 worktree를 건드리거나 apply/dry-run을 강행하지 않습니다.

**Compare outcome handling**
- `current` — tracked baseline이 upstream latest와 같다. 날짜와 태그를 보고하고 no-op으로 종료합니다.
- `ahead` — tracked baseline이 upstream latest보다 앞선다. local-ahead 상태를 설명하고 no-op으로 종료합니다.
- `update_available` — upstream latest가 더 새롭다. 이 경우에만 dry-run/apply로 넘어갑니다.

5. `update_available`이 `true`면 먼저 dry-run을 실행합니다.

```bash
node scripts/apply-upstream-refresh.cjs --from-current --to-tag <latest_tag> --dry-run
```

6. dry-run 결과에서 아래를 요약합니다.

- incoming tag
- status
- no-op
- touched paths
- preserved paths
- overlay reapply
- overlay delete

7. 실제 반영 전에는 사용자 확인을 받습니다.

8. 승인되면 실제 apply를 실행합니다.

```bash
node scripts/apply-upstream-refresh.cjs --to-tag <latest_tag> --mode source-of-truth
```

이 mode는 tracked upstream surface를 다시 가져오고, local overlay를 재적용하고, 제거된 overlay는 삭제한 뒤 `get-shit-done/UPSTREAM_VERSION`를 새 기준선으로 갱신합니다.

9. localization audit가 필요하면 다음 명령으로 changed manifest를 생성합니다.

```bash
node scripts/audit-localization-gap.cjs --to-tag <latest_tag> --mode source-of-truth --json
```

audit 결과에서는 아래 필드를 우선 확인합니다.

- changed_files
- translation_candidates
- overlay_missing
- zh_cn_reintroduced
- token_sensitive_candidates
- overlay_reapply
- overlay_delete

`token_sensitive_candidates`는 commands, file paths, placeholders, `@` references, XML/markdown structure, identifiers를 특히 조심해서 수동 검토해야 하는 항목입니다.

10. apply가 끝나면 다음 canonical validation을 실행합니다.

```bash
node get-shit-done/bin/gsd-tools.cjs validate health
node get-shit-done/bin/gsd-tools.cjs validate consistency
node get-shit-done/bin/gsd-tools.cjs roadmap analyze
node scripts/run-tests.cjs
```

## Guardrails

- 이 흐름을 npm install/update 흐름으로 설명하지 않습니다.
- `$gsd-update`로 repo sync를 대신하라고 안내하지 않습니다.
- sync eligibility는 `package.json`만으로 판단하지 않습니다.
- upstream latest가 tracked baseline과 같거나 더 낮으면 worktree를 건드리지 않습니다.
- dry-run/apply 전에 `references/context.md`의 preserved paths 정책과 import surface를 유지합니다.

## Expected Output

- no-op인 경우: compared tags/date, current/ahead 판단, no-op 메시지
- update 가능한 경우: dry-run 요약과 apply 전 확인 질문
- apply 후: canonical validation 결과와 후속 확인 포인트
