# Phase 7: Automated Upstream GSD Sync Skill - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning

<domain>
## Phase Boundary

이 phase는 일반 사용자용 runtime self-update를 고치는 작업이 아니다. 현재 저장소의 maintainer가 upstream `gsd-build/get-shit-done` GitHub release를 확인하고, 이 포크가 추적하는 upstream baseline보다 새 release가 있을 때만 현재 repo의 vendored GSD tree를 최신 upstream으로 refresh하는 전용 skill을 추가한다.

범위 안:
- upstream latest release 조회와 local baseline 비교
- maintainer 전용 sync skill과 supporting script 추가
- repo 안의 vendored GSD import/update flow 자동화
- Korean overlay, protected local files, token-sensitive customizations 보존
- no-op / dry-run / update summary 및 maintainer docs

범위 밖:
- 기존 end-user `$gsd-update`를 repo sync 도구로 재정의
- command literals, runtime flags, file/directory names, identifiers 변경
- 중국어 제거/한국어 overlay 정책 자체를 변경
- 자동 conflict resolution 없이 무조건 덮어쓰기하는 위험한 refresh

</domain>

<decisions>
## Implementation Decisions

### Workflow split
- **D-01:** 새 기능은 기존 runtime self-update `$gsd-update`와 별도인 maintainer-only skill로 제공한다.
- **D-02:** skill 이름은 기존 `$gsd-update`와 혼동되지 않도록 `gsd-sync-upstream` 계열로 잡는다.

### Version source of truth
- **D-03:** update eligibility는 fork `package.json` 버전만으로 판단하지 않는다.
- **D-04:** skill은 upstream latest release tag/date와 local tracked baseline을 함께 보여준다.
- **D-05:** local baseline은 phase 안에서 machine-readable source of truth를 도입하거나 보강해 이후 sync 판단에 재사용 가능해야 한다.

### Sync safety
- **D-06:** skill은 실제 파일 변경 전에 dry-run summary를 먼저 보여주고, incoming tag, touched paths, preserved paths를 명시한다.
- **D-07:** refresh 범위는 Phase 1 import surface와 동일한 vendored GSD top-level entries를 기준으로 삼는다.
- **D-08:** `.planning/`, `AGENTS.md`, `CLAUDE.md`, fork package identity, Korean-localized overlays는 보호 대상이다.
- **D-09:** upstream release가 local baseline보다 높지 않으면 explicit no-op으로 종료하고 worktree를 바꾸지 않는다.

### the agent's Discretion
- baseline manifest 위치와 형식
- GitHub release fetch 방식 (`gh`, GitHub API, git clone, archive) 선택
- overlay reapply 구현 방식과 diff review UX

</decisions>

<specifics>
## Specific Ideas

- 2026-03-23 기준 이 저장소의 `package.json` 버전은 `1.28.1`이지만, `docs/UPSTREAM-SYNC.md`의 tracked upstream baseline은 `v1.28.0`이다.
- GitHub Releases의 최신 upstream release도 현재 `v1.28.0`(2026-03-22 게시)라서, 단순히 fork package semver만 보면 sync 판단이 틀어질 수 있다.
- 이 skill은 "현재 프로젝트의 GSD"를 갱신하는 유지보수자 도구여야 하며, 사용자 runtime install을 npm으로 업데이트하는 `$gsd-update`와 목적이 다르다.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Upstream baseline and maintainer policy
- `docs/UPSTREAM-SYNC.md` — 현재 tracked upstream baseline과 future import guardrail
- `.planning/PROJECT.md` — project constraints, active requirements, key decisions
- `.planning/ROADMAP.md` — phase scope and dependency order
- `.planning/REQUIREMENTS.md` — requirement IDs this phase must satisfy
- `.planning/STATE.md` — current project status and planning context

### Existing update/release mechanics
- `.release-monitor.sh` — GitHub release polling example already in repo
- `.codex/skills/gsd-update/SKILL.md` — existing runtime self-update skill
- `commands/gsd/update.md` — runtime update command contract
- `get-shit-done/workflows/update.md` — npm-based runtime update flow that must stay distinct from repo sync
- `hooks/gsd-check-update.js` — existing version-check logic tied to npm/runtime installs

### Prior import patterns
- `.planning/milestones/v1.28.0-phases/01-upstream-baseline-import/01-RESEARCH.md` — original import surface and preserved-local-file rules
- `.planning/milestones/v1.28.0-phases/01-upstream-baseline-import/01-01-PLAN.md` — concrete import execution pattern to mirror safely

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `.release-monitor.sh` already demonstrates `gh release list` / `gh release view` usage against `gsd-build/get-shit-done`.
- `docs/UPSTREAM-SYNC.md` is the current human-readable baseline source.
- Phase 1 artifacts already define which top-level entries belong to the vendored upstream tree and which local files must be preserved.

### Established Patterns
- Maintainer guidance is Korean-first, but commands, paths, identifiers, and structured tokens stay English.
- Risky repo-wide operations are usually preceded by narrow validation and explicit guardrails.
- Runtime self-update logic already distinguishes local/global installs; the new skill should reuse the repo's safety mindset but not its npm-targeted semantics.

### Integration Points
- Any successful sync must leave `get-shit-done/`, `commands/`, `agents/`, `hooks/`, `scripts/`, `tests/`, and docs in a state that still passes the repo's validation commands.
- The skill will need to update both machine-readable baseline tracking and human-readable maintainer docs so future syncs compare against the same source of truth.

</code_context>

<deferred>
## Deferred Ideas

- Scheduled/automatic background syncing from CI or cron
- Automatic semantic conflict resolution for Korean overlay drift
- Converting the maintainer-only sync skill into a public end-user GSD command

</deferred>

---

*Phase: 07-automated-upstream-gsd-sync-skill*
*Context gathered: 2026-03-23*
