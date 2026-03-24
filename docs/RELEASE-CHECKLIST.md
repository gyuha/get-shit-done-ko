# 릴리스 체크리스트

## 목적

이 문서는 `get-shit-done-ko`를 릴리스하거나 새 upstream sync 직후 상태를 점검할 때 유지보수자가 그대로 따라갈 수 있는 한국어 우선 체크리스트입니다.

## Upstream Sync 선행 확인

`$gsd-sync-upstream` 또는 수동 maintainer sync를 시작할 때는 먼저 tracked upstream baseline과 GitHub releases latest를 비교합니다.

```bash
node scripts/check-upstream-release.cjs --current-file get-shit-done/UPSTREAM_VERSION --json
node scripts/apply-upstream-refresh.cjs --from-current --to-tag <latest_tag> --dry-run
```

- 기준선 파일은 `get-shit-done/UPSTREAM_VERSION`입니다.
- `update_available`이 `false`면 upstream latest가 같거나 더 낮으므로 no-op으로 종료합니다.
- 실제 반영은 dry-run 결과를 확인한 뒤 `node scripts/apply-upstream-refresh.cjs --to-tag <latest_tag>`로 진행합니다.
- sync 직후에는 아래 기준 검증 명령을 다시 실행합니다.
- 루트 import surface를 넓혀야 하는 예외 상황에서는 `--include-entry <path>`를 명시적으로 사용하고, expanded touched paths를 다시 검토한 뒤에만 apply합니다.
- localization audit 결과의 `overlay_missing`은 release 전에 한국어 overlay 작업 대상으로 남겨야 하고, `zh_cn_reintroduced`는 즉시 제거해야 합니다.
- localization audit 결과의 `token_sensitive_candidates`는 commands, file paths, placeholders, `@` references, identifiers, structured markup를 수동 검증하기 전까지 번역 완료로 간주하지 않습니다.

compare status 해석:

- `current` → tracked baseline과 upstream latest가 같다. 날짜/태그를 기록하고 종료합니다.
- `ahead` → tracked baseline이 upstream latest보다 앞서 있다. local-ahead 상태를 설명하고 종료합니다.
- `update_available` → dry-run과 실제 apply 검토로 넘어갑니다.

`current`와 `ahead`는 둘 다 no-op이며, 이 경우 worktree를 건드리면 안 됩니다.

## 기준 검증 명령

아래 명령을 순서대로 실행합니다.

```bash
node get-shit-done/bin/gsd-tools.cjs validate health
node get-shit-done/bin/gsd-tools.cjs validate consistency
node get-shit-done/bin/gsd-tools.cjs roadmap analyze
node --test tests/path-replacement.test.cjs tests/runtime-converters.test.cjs tests/codex-config.test.cjs tests/antigravity-install.test.cjs tests/copilot-install.test.cjs
node scripts/run-tests.cjs
```

기대 결과:

- `validate health`: `healthy`
- `validate consistency`: `passed: true`
- `roadmap analyze`: 모든 완료된 phase가 summary와 맞물리고 현재 phase 상태가 의도와 일치
- 집중 호환성 스위트: runtime/path conversion 관련 테스트가 모두 통과
- 전체 스위트: 저장소 전체 테스트가 통과

## 수동 점검 항목

자동화 뒤에 아래 수동 확인을 합니다.

1. `README.md`, `docs/UPSTREAM-SYNC.md`, `docs/RELEASE-CHECKLIST.md`를 열고 유지보수 링크가 끊기지 않았는지 확인합니다.
2. `--include-entry <path>`를 사용했다면 expanded touched paths에 preserved local paths (`.planning/`, `AGENTS.md`, `CLAUDE.md`, `.codex/`, `.claude/`, `.opencode/`)가 들어가지 않았는지 확인합니다.
3. 대표 prompt/runtime 파일에서 command literals, file paths, placeholders, identifiers, phase/requirement IDs가 번역되지 않았는지 확인합니다.
4. installer/runtime 예시에서 Claude 이외 런타임이 `~/.claude`를 그대로 노출하지 않는지 확인합니다.
5. 중국어 문서나 `zh-CN` 링크가 다시 들어오지 않았는지 확인합니다.

## 토큰 보존 규칙

아래 항목은 릴리스 직전에도 바뀌면 안 됩니다.

- 명령
- 파일 이름
- 디렉토리 이름
- 식별자
- 단계/요구사항 ID
- snippet 안의 machine-sensitive tokens

## 허용되는 예외

- commands/agents frontmatter의 `description`는 generated installer/config compatibility 때문에 영어를 유지할 수 있습니다.
- 한국어화는 설명문과 안내문 레이어에 적용하고, 실행 의미를 가진 토큰은 번역하지 않습니다.

## 차단 이슈로 보는 경우

다음 중 하나면 release blocker로 취급합니다.

- install/test flow가 실패함
- runtime converter가 잘못된 path/token을 남김
- `@` references, placeholders, structured markup가 깨짐
- README/docs 예시가 실제 command surface와 어긋남

다음은 non-blocking이지만 문서화해야 합니다.

- compatibility contract를 깨지 않는 wording caveat
- 유지보수 호환성을 위해 의도적으로 남긴 English frontmatter

## 릴리스 마감 점검

릴리스 또는 sync 마감 직전 마지막으로 확인합니다.

1. 워킹트리가 깨끗한지 확인합니다.
2. Phase/summary/verification 문서가 최신 결과를 반영하는지 확인합니다.
3. upstream baseline과 caveat가 `docs/UPSTREAM-SYNC.md`에 남아 있는지 확인합니다.
4. README에서 유지보수자가 이 문서를 찾을 수 있는지 확인합니다.
