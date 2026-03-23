# Release Checklist

## 목적

이 문서는 `get-shit-done-ko`를 release하거나 새 upstream sync 직후 상태를 점검할 때 유지보수자가 그대로 따라갈 수 있는 Korean-first 체크리스트입니다.

## Canonical Validation Commands

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
- `roadmap analyze`: 모든 completed phase가 summary와 맞물리고 현재 phase 상태가 의도와 일치
- focused compatibility suite: runtime/path conversion 관련 테스트 전부 pass
- full suite: 전체 repo tests pass

## Manual Spot Checks

자동화 뒤에 아래 수동 확인을 합니다.

1. `README.md`, `docs/UPSTREAM-SYNC.md`, `docs/RELEASE-CHECKLIST.md`를 열고 유지보수 링크가 끊기지 않았는지 확인합니다.
2. 대표 prompt/runtime 파일에서 command literals, file paths, placeholders, identifiers, phase/requirement IDs가 번역되지 않았는지 확인합니다.
3. installer/runtime 예시에서 non-Claude runtime이 `~/.claude`를 그대로 노출하지 않는지 확인합니다.
4. Chinese 문서나 `zh-CN` 링크가 다시 들어오지 않았는지 확인합니다.

## Token Preservation Rules

아래 항목은 release 직전에도 바뀌면 안 됩니다.

- Commands
- File names
- Directory names
- Identifiers
- phase/requirement IDs
- snippet 안의 machine-sensitive tokens

## Accepted Caveats

- commands/agents frontmatter의 `description`는 generated installer/config compatibility 때문에 영어를 유지할 수 있습니다.
- 한국어화는 설명문과 안내문 레이어에 적용하고, 실행 의미를 가진 토큰은 번역하지 않습니다.

## When a Finding Is Blocking

다음 중 하나면 release blocker로 취급합니다.

- install/test flow가 실패함
- runtime converter가 잘못된 path/token을 남김
- `@` references, placeholders, structured markup가 깨짐
- README/docs 예시가 실제 command surface와 어긋남

다음은 non-blocking이지만 문서화해야 합니다.

- compatibility contract를 깨지 않는 wording caveat
- 유지보수 호환성을 위해 의도적으로 남긴 English frontmatter

## Release Close-Out

release 또는 sync 마감 직전 마지막으로 확인합니다.

1. 워킹트리가 깨끗한지 확인합니다.
2. Phase/summary/verification 문서가 최신 결과를 반영하는지 확인합니다.
3. upstream baseline과 caveat가 `docs/UPSTREAM-SYNC.md`에 남아 있는지 확인합니다.
4. README에서 유지보수자가 이 문서를 찾을 수 있는지 확인합니다.
