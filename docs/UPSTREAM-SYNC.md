# Upstream Sync Baseline

## Upstream Source

- Repository: `https://github.com/gsd-build/get-shit-done`
- Imported from local submodule snapshot previously mounted at `origin/`

## Pinned Version

- Baseline tag: `v1.28.0`

## Imported Top-Level Entries

The Phase 1 root import copied these tracked upstream entries into the repository root:

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

## Local Files Preserved

These local project-management files were intentionally preserved during the root import:

- `.planning/`
- `AGENTS.md`
- `CLAUDE.md`

## Tokens That Must Stay English

The Korean localization fork must preserve these tokens exactly as-is:

- Commands
- File names
- Directory names
- Identifiers
- phase/requirement IDs

## Next Localization Phases

After the upstream baseline import, the planned sequence is:

1. Korean-first docs/readme/navigation
2. Workflow, template, reference, and prompt localization
3. Runtime text and comment localization
4. Compatibility validation and release preparation

## Notes for Future Syncs

- Treat `v1.28.0` as the first imported baseline for this fork.
- Preserve the root-level upstream layout so future diffs stay easy to compare against upstream.
- Do not rename compatibility-sensitive tokens while translating prose.
