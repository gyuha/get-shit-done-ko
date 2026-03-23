# Upstream Sync Baseline

## Upstream Source

- Repository: `https://github.com/gsd-build/get-shit-done`
- Initial import source: 로컬 `origin/` 서브모듈 스냅샷

## Pinned Version

- Baseline tag: `v1.28.0`
- Fork baseline meaning: 이 포크의 첫 한국어화 기준선이며, 이후 sync diff는 이 버전 대비로 읽습니다.

## Imported Top-Level Entries

Phase 1 root import로 다음 upstream tracked entry를 저장소 루트에 그대로 복사했습니다.

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

## Local Files Preserved

루트 import 중에도 다음 로컬 관리 파일은 의도적으로 유지했습니다.

- `.planning/`
- `AGENTS.md`
- `CLAUDE.md`

## Tokens That Must Stay English

이 한국어화 포크는 다음 토큰을 번역하지 않습니다.

- Commands
- File names
- Directory names
- Identifiers
- phase/requirement IDs

## Language Policy in This Fork

- 한국어를 기본 읽기 언어로 둡니다.
- Commands, file names, directory names, identifiers, phase/requirement IDs는 영어 그대로 유지합니다.
- upstream에 있었던 Simplified Chinese 문서는 이 포크에서 제거합니다.
- 영어 참고 경로는 유지된 파일 경로 규칙과 upstream baseline 링크로 계속 제공합니다.

## Phase 5 Release Outcome

Phase 5에서 다음 release guardrail을 최종 확인했습니다.

- `node scripts/run-tests.cjs` 전체 스위트가 통과했습니다.
- `validate health`, `validate consistency`, `roadmap analyze`가 녹색입니다.
- non-Claude runtime install 변환에서 남아 있던 bare `~/.claude` / `$HOME/.claude` 경로 누수를 수리했습니다.
- 유지보수자용 release 절차는 [RELEASE-CHECKLIST.md](RELEASE-CHECKLIST.md)로 분리했습니다.

## Sync Guardrails for Future Imports

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

## Accepted Caveats

- commands/agents frontmatter의 `description`는 installer 및 generated config compatibility 때문에 영어 원문을 유지할 수 있습니다.
- prose는 한국어 우선이어도, snippet 안의 명령어/경로/placeholder/식별자는 원문 그대로 유지해야 합니다.

## Maintainer Notes

- `v1.28.0`를 이 포크의 첫 imported baseline으로 취급합니다.
- root-level upstream layout은 이후 diff와 재동기화를 쉽게 하기 위해 유지합니다.
- 번역 작업 중 compatibility-sensitive token을 rename하지 마세요.
- release 전에 [RELEASE-CHECKLIST.md](RELEASE-CHECKLIST.md)를 한 번 그대로 따라가면 Phase 5 기준 검증 경로를 재현할 수 있습니다.
