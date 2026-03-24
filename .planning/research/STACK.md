# Stack Research (스택 리서치)

**Domain:** upstream sync and localization maintainer workflow for a vendored GSD fork
**Researched:** 2026-03-24
**Confidence:** HIGH

## Recommended Stack (권장 스택)

### Core Technologies (핵심 기술)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Node.js CLI | 20.x+ | release comparison, file sync, validation orchestration | 현재 저장소의 installer/tooling/runtime 자산이 모두 Node.js 기반이며 `scripts/check-upstream-release.cjs`, `scripts/apply-upstream-refresh.cjs`, `get-shit-done/bin/gsd-tools.cjs`와 자연스럽게 통합된다 |
| Git CLI | 2.x | upstream tag snapshot fetch, diff materialization, apply source acquisition | upstream release tag를 기준으로 정확한 tree snapshot을 가져와야 하므로 Git clone/tag checkout이 가장 신뢰도 높다 |
| Markdown + JSON planning artifacts | current repo format | 유지보수 상태 기록, 버전 추적, 실행 보고 | `.planning/*.md`, `.planning/config.json`, `get-shit-done/UPSTREAM_VERSION`가 이미 기계/사람 공용 source of truth로 쓰이고 있다 |

### Supporting Libraries (보조 라이브러리)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Node built-ins `https`, `fs`, `path`, `child_process` | bundled | GitHub releases 조회, 파일 조작, git 실행 | 외부 dependency 없이 유지보수 스크립트를 만들 때 기본 선택 |
| existing repo helper scripts | current repo | compare/apply logic 재사용 | `scripts/check-upstream-release.cjs`, `scripts/apply-upstream-refresh.cjs`를 skill/workflow의 핵심 helper로 사용할 때 |
| GSD validation CLI | current repo | sync 후 기능 동등성 검증 | `validate health`, `validate consistency`, `roadmap analyze`, `scripts/run-tests.cjs`를 canonical sequence로 실행할 때 |

### Development Tools (개발 도구)

| Tool | Purpose | Notes |
|------|---------|-------|
| `node scripts/check-upstream-release.cjs --current-file get-shit-done/UPSTREAM_VERSION --json` | tracked baseline과 upstream latest 비교 | sync eligibility는 `package.json`이 아니라 baseline file 기준으로 판단해야 한다 |
| `node scripts/apply-upstream-refresh.cjs --from-current --to-tag <tag> --dry-run` | import surface와 overlay impact 미리 확인 | 실제 apply 전에 touched/preserved/overlay reapply를 꼭 확인 |
| `node scripts/run-tests.cjs` | 전체 기능 회귀 검증 | sync 후 동일 기능 보장에 필수 |

## Installation (설치)

```bash
# Core
npm install

# Existing validation path
node scripts/check-upstream-release.cjs --current-file get-shit-done/UPSTREAM_VERSION --json
node scripts/apply-upstream-refresh.cjs --from-current --to-tag <latest_tag> --dry-run
node get-shit-done/bin/gsd-tools.cjs validate health
node scripts/run-tests.cjs
```

## Alternatives Considered (검토한 대안)

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Git tag snapshot import | GitHub compare API only | 메타데이터만 보고 싶고 실제 file tree import가 필요 없을 때 |
| Existing repo-local helper scripts | 새 helper를 처음부터 작성 | 현재 helper가 부족하거나 범위가 완전히 달라질 때만 |
| Baseline file + latest release compare | `package.json` version compare | fork package version만 확인하는 단순 상태 표시가 필요할 때만. sync eligibility 판단에는 부적합 |

## What NOT to Use (사용하지 말 것)

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `package.json`만 보고 update 가능 여부 판단 | fork version은 upstream baseline과 독립적으로 앞설 수 있다 | `get-shit-done/UPSTREAM_VERSION` + GitHub releases latest 비교 |
| 무조건 full apply 후 수동 확인 | preserve 경로와 local overlay를 덮어쓸 위험이 크다 | compare -> dry-run -> apply -> validation 순서 |
| 번역 토큰을 임의 rename하는 자동 치환 | command/path/identifier/phase ID compatibility를 깨뜨린다 | prose layer만 번역하고 machine-sensitive token은 유지 |

## Stack Patterns by Variant (조건별 스택 패턴)

**If upstream latest > tracked baseline:**
- Use compare script + dry-run + apply script
- Because changed files import와 overlay reapply 경로를 안전하게 제어할 수 있다

**If upstream latest <= tracked baseline:**
- Use no-op reporting path
- Because local repo가 current 또는 ahead 상태라면 worktree를 건드리지 않는 것이 정답이다

## Version Compatibility (버전 호환성)

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `scripts/check-upstream-release.cjs` | `get-shit-done/UPSTREAM_VERSION` | baseline file format은 `vX.Y.Z` 한 줄 유지가 안전하다 |
| `scripts/apply-upstream-refresh.cjs` | import surface in `docs/UPSTREAM-SYNC.md` | import 대상 목록과 preserved paths 정책이 맞아야 한다 |
| `package.json@1.28.1` | tracked upstream baseline `v1.28.0` | fork package version은 baseline보다 앞설 수 있으므로 sync source of truth가 아니다 |

## Sources (출처)

- Official GitHub Releases — `https://github.com/gsd-build/get-shit-done/releases/tag/v1.28.0` verified latest tag and published date
- Repo-local script — `scripts/check-upstream-release.cjs` verified current comparison logic
- Repo-local script — `scripts/apply-upstream-refresh.cjs` verified import/preserve/apply model
- Repo docs — `docs/UPSTREAM-SYNC.md`, `docs/RELEASE-CHECKLIST.md`, `skills/gsd-sync-upstream/references/context.md`

---
*Stack research for: upstream sync and localization maintainer workflow*
*Researched: 2026-03-24*
