---
name: "gsd-sync-upstream"
description: "upstream GitHub release를 확인하고 repo vendored GSD를 안전하게 sync"
metadata:
  short-description: "upstream GitHub release를 확인하고 repo vendored GSD를 안전하게 sync"
---

<codex_skill_adapter>
## A. Skill Invocation
- This skill is invoked by mentioning `$gsd-sync-upstream`.
- Treat all user text after `$gsd-sync-upstream` as `{{GSD_ARGS}}`.
- If no arguments are present, treat `{{GSD_ARGS}}` as empty.

## B. AskUserQuestion → request_user_input Mapping
GSD workflows use `AskUserQuestion` (Claude Code syntax). Translate to Codex `request_user_input`:

Parameter mapping:
- `header` → `header`
- `question` → `question`
- Options formatted as `"Label" — description` → `{label: "Label", description: "description"}`
- Generate `id` from header: lowercase, replace spaces with underscores

Batched calls:
- `AskUserQuestion([q1, q2])` → single `request_user_input` with multiple entries in `questions[]`

Multi-select workaround:
- Codex has no `multiSelect`. Use sequential single-selects, or present a numbered freeform list asking the user to enter comma-separated numbers.

Execute mode fallback:
- When `request_user_input` is rejected (Execute mode), present a plain-text numbered list and pick a reasonable default.

## C. Task() → spawn_agent Mapping
GSD workflows use `Task(...)` (Claude Code syntax). Translate to Codex collaboration tools:

Direct mapping:
- `Task(subagent_type="X", prompt="Y")` → `spawn_agent(agent_type="X", message="Y")`
- `Task(model="...")` → omit (Codex uses per-role config, not inline model selection)
- `fork_context: false` by default — GSD agents load their own context via `<files_to_read>` blocks

Parallel fan-out:
- Spawn multiple agents → collect agent IDs → `wait(ids)` for all to complete

Result parsing:
- Look for structured markers in agent output: `CHECKPOINT`, `PLAN COMPLETE`, `SUMMARY`, etc.
- `close_agent(id)` after collecting results from each agent
</codex_skill_adapter>

<objective>
한국어 우선 안내: 이 명령 문서는 `$gsd-sync-upstream` 흐름을 한국어로 먼저 안내합니다. 아래 영문 원문은 upstream 호환성과 세부 의미 보존을 위해 함께 유지합니다.

Check `gsd-build/get-shit-done` GitHub releases against this repo's tracked upstream baseline and sync the vendored GSD tree only when upstream is newer.

This is a maintainer-only repo sync workflow. It is not the same as `$gsd-update`, which updates runtime installations via npm.
</objective>

<execution_context>
@/Users/gyuha/workspace/get-shit-done-ko/get-shit-done/UPSTREAM_VERSION
@/Users/gyuha/workspace/get-shit-done-ko/scripts/check-upstream-release.cjs
@/Users/gyuha/workspace/get-shit-done-ko/docs/UPSTREAM-SYNC.md
@/Users/gyuha/workspace/get-shit-done-ko/docs/RELEASE-CHECKLIST.md
</execution_context>

<process>
한국어 우선 안내: 실제 실행 시에는 아래 경로와 스크립트를 그대로 따르되, 설명 해석은 한국어를 기본으로 사용합니다.

1. Read `get-shit-done/UPSTREAM_VERSION` and run:
   `node scripts/check-upstream-release.cjs --current-file get-shit-done/UPSTREAM_VERSION --json`
2. Report the tracked upstream baseline, the latest upstream GitHub release tag/date, and the fork package version from `package.json`.
3. If `update_available` is `false`:
   - explain whether the repo is current or ahead
   - stop with an explicit no-op result
4. If `update_available` is `true`:
   - run `node scripts/apply-upstream-refresh.cjs --from-current --to-tag <latest_tag> --dry-run`
   - show incoming tag, touched paths, preserved paths, and overlay notes
   - ask for confirmation before any mutation
5. After a successful apply run:
   - update `get-shit-done/UPSTREAM_VERSION`
   - update `docs/UPSTREAM-SYNC.md`
   - run the canonical validation commands from `docs/RELEASE-CHECKLIST.md`

Never describe this skill as an npm install/update flow, and never route users to `$gsd-update` for repo sync.
</process>
