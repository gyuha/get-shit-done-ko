# 요약 템플릿 (Summary Template)

> 한국어 우선 안내: 이 템플릿은 `summary` 자산을 한국어 기준으로 먼저 읽을 수 있게 정리합니다. 아래 영문 원문은 upstream 동기화와 세부 의미 보존을 위해 함께 유지합니다.


Template for `.planning/phases/XX-name/{phase}-{plan}-SUMMARY.md` - phase 완료를 기록하는 템플릿입니다.

---

## File Template (파일 템플릿)

```markdown
---
phase: XX-name
plan: YY
subsystem: [primary category: auth, payments, ui, api, database, infra, testing, etc.]
tags: [searchable tech: jwt, stripe, react, postgres, prisma]

# Dependency graph
requires:
  - phase: [prior phase this depends on]
    provides: [what that phase built that this uses]
provides:
  - [bullet list of what this phase built/delivered]
affects: [list of phase names or keywords that will need this context]

# Tech tracking
tech-stack:
  added: [libraries/tools added in this phase]
  patterns: [architectural/code patterns established]

key-files:
  created: [important files created]
  modified: [important files modified]

key-decisions:
  - "Decision 1"
  - "Decision 2"

patterns-established:
  - "Pattern 1: description"
  - "Pattern 2: description"

requirements-completed: []  # REQUIRED — Copy ALL requirement IDs from this plan's `requirements` frontmatter field.

# Metrics
duration: Xmin
completed: YYYY-MM-DD
---

# Phase [X]: [Name] 요약 (Summary)

**[실제로 전달된 결과를 한 줄로 요약 - "phase complete" 같은 표현은 피하기]**

## Performance (수행 결과)

- **Duration:** [time] (e.g., 23 min, 1h 15m)
- **Started:** [ISO timestamp]
- **Completed:** [ISO timestamp]
- **Tasks:** [완료 수]
- **Files modified:** [수정 파일 수]

## Accomplishments (주요 성과)
- [가장 중요한 결과]
- [두 번째 핵심 결과]
- [필요하면 세 번째 결과]

## Task Commits (작업 커밋)

각 task는 atomic commit으로 기록합니다:

1. **Task 1: [task name]** - `abc123f` (feat/fix/test/refactor)
2. **Task 2: [task name]** - `def456g` (feat/fix/test/refactor)
3. **Task 3: [task name]** - `hij789k` (feat/fix/test/refactor)

**Plan metadata:** `lmn012o` (docs: complete plan)

_Note: TDD tasks may have multiple commits (test → feat → refactor)_

## Files Created/Modified (생성/수정 파일)
- `path/to/file.ts` - 파일 역할 설명
- `path/to/another.ts` - 파일 역할 설명

## Decisions Made (결정 사항)
[핵심 결정과 짧은 이유, 없으면 "없음 - 계획대로 진행"]

## Deviations from Plan (계획 대비 변경 사항)

[없으면: "없음 - 계획대로 실행"]

[If deviations occurred:]

### Auto-fixed Issues (자동 수정 이슈)

**1. [Rule X - Category] Brief description**
- **Found during:** Task [N] ([task name])
- **Issue:** [What was wrong]
- **Fix:** [What was done]
- **Files modified:** [file paths]
- **Verification:** [How it was verified]
- **Committed in:** [hash] (part of task commit)

[... repeat for each auto-fix ...]

---

**Total deviations:** [N] auto-fixed ([breakdown by rule])
**Impact on plan:** [Brief assessment - e.g., "All auto-fixes necessary for correctness/security. No scope creep."]

## Issues Encountered (이슈)
[문제와 해결 방법, 없으면 "없음"]

[Note: "Deviations from Plan" documents unplanned work that was handled automatically via deviation rules. "Issues Encountered" documents problems during planned work that required problem-solving.]

## User Setup Required (사용자 설정 필요 여부)

[If USER-SETUP.md was generated:]
**External services require manual configuration.** See [{phase}-USER-SETUP.md](./{phase}-USER-SETUP.md) for:
- Environment variables to add
- Dashboard configuration steps
- Verification commands

[If no USER-SETUP.md:]
없음 - 외부 서비스 수동 설정이 필요하지 않음.

## Next Phase Readiness (다음 phase 준비 상태)
[다음 phase를 위해 준비된 내용]
[남은 blocker 또는 concern]

---
*Phase: XX-name*
*Completed: [date]*
```

<frontmatter_guidance>
**Purpose:** dependency graph를 이용한 자동 컨텍스트 조합을 가능하게 합니다. frontmatter는 summary 메타데이터를 기계가 읽을 수 있게 만들어 plan-phase가 관련 summary를 빠르게 선택할 수 있게 합니다.

**Fast scanning:** Frontmatter is first ~25 lines, cheap to scan across all summaries without reading full content.

**Dependency graph:** `requires`/`provides`/`affects` create explicit links between phases, enabling transitive closure for context selection.

**Subsystem:** Primary categorization (auth, payments, ui, api, database, infra, testing) for detecting related phases.

**Tags:** Searchable technical keywords (libraries, frameworks, tools) for tech stack awareness.

**Key-files:** Important files for @context references in PLAN.md.

**Patterns:** Established conventions future phases should maintain.

**Population:** Frontmatter is populated during summary creation in execute-plan.md. See `<step name="create_summary">` for field-by-field guidance.
</frontmatter_guidance>

<one_liner_rules>
The one-liner MUST be substantive:

**Good:**
- "JWT auth with refresh rotation using jose library"
- "Prisma schema with User, Session, and Product models"
- "Dashboard with real-time metrics via Server-Sent Events"

**Bad:**
- "Phase complete"
- "Authentication implemented"
- "Foundation finished"
- "All tasks done"

The one-liner should tell someone what actually shipped.
</one_liner_rules>

<example>
```markdown
# Phase 1: Foundation Summary

**JWT auth with refresh rotation using jose library, Prisma User model, and protected API middleware**

## Performance

- **Duration:** 28 min
- **Started:** 2025-01-15T14:22:10Z
- **Completed:** 2025-01-15T14:50:33Z
- **Tasks:** 5
- **Files modified:** 8

## Accomplishments
- User model with email/password auth
- Login/logout endpoints with httpOnly JWT cookies
- Protected route middleware checking token validity
- Refresh token rotation on each request

## Files Created/Modified
- `prisma/schema.prisma` - User and Session models
- `src/app/api/auth/login/route.ts` - Login endpoint
- `src/app/api/auth/logout/route.ts` - Logout endpoint
- `src/middleware.ts` - Protected route checks
- `src/lib/auth.ts` - JWT helpers using jose

## Decisions Made
- Used jose instead of jsonwebtoken (ESM-native, Edge-compatible)
- 15-min access tokens with 7-day refresh tokens
- Storing refresh tokens in database for revocation capability

## Deviations from Plan (계획 대비 변경 사항)

### Auto-fixed Issues (자동 수정 이슈)

**1. [Rule 2 - Missing Critical] Added password hashing with bcrypt**
- **Found during:** Task 2 (Login endpoint implementation)
- **Issue:** Plan didn't specify password hashing - storing plaintext would be critical security flaw
- **Fix:** Added bcrypt hashing on registration, comparison on login with salt rounds 10
- **Files modified:** src/app/api/auth/login/route.ts, src/lib/auth.ts
- **Verification:** Password hash test passes, plaintext never stored
- **Committed in:** abc123f (Task 2 commit)

**2. [Rule 3 - Blocking] Installed missing jose dependency**
- **Found during:** Task 4 (JWT token generation)
- **Issue:** jose package not in package.json, import failing
- **Fix:** Ran `npm install jose`
- **Files modified:** package.json, package-lock.json
- **Verification:** Import succeeds, build passes
- **Committed in:** def456g (Task 4 commit)

---

**Total deviations:** 2 auto-fixed (1 missing critical, 1 blocking)
**Impact on plan:** Both auto-fixes essential for security and functionality. No scope creep.

## Issues Encountered
- jsonwebtoken CommonJS import failed in Edge runtime - switched to jose (planned library change, worked as expected)

## Next Phase Readiness
- Auth foundation complete, ready for feature development
- User registration endpoint needed before public launch

---
*Phase: 01-foundation*
*Completed: 2025-01-15*
```
</example>

<guidelines>
**Frontmatter:** MANDATORY - complete all fields. Enables automatic context assembly for future planning.

**One-liner:** Must be substantive. "JWT auth with refresh rotation using jose library" not "Authentication implemented".

**Decisions section:**
- Key decisions made during execution with rationale
- Extracted to STATE.md accumulated context
- Use "None - followed plan as specified" if no deviations

**After creation:** STATE.md updated with position, decisions, issues.
</guidelines>
