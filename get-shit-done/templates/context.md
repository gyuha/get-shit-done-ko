# Phase 컨텍스트 템플릿 (Phase Context Template)

> 한국어 우선 안내: 이 템플릿은 `context` 자산을 한국어 기준으로 먼저 읽을 수 있게 정리합니다. 아래 영문 원문은 upstream 동기화와 세부 의미 보존을 위해 함께 유지합니다.


Template for `.planning/phases/XX-name/{phase_num}-CONTEXT.md` - phase의 구현 결정을 기록하는 템플릿입니다.

**Purpose:** downstream agent가 꼭 알아야 하는 결정을 기록합니다. researcher는 무엇을 조사할지, planner는 무엇이 고정 결정인지 파악하는 데 사용합니다.

**Key principle:** 카테고리는 미리 정하지 않습니다. 이 phase에서 실제로 논의된 주제에 따라 자연스럽게 드러나야 합니다.

**Downstream consumers:**
- `gsd-phase-researcher` — Reads decisions to focus research (e.g., "card layout" → research card component patterns)
- `gsd-planner` — Reads decisions to create specific tasks (e.g., "infinite scroll" → task includes virtualization)

---

## File Template (파일 템플릿)

```markdown
# Phase [X]: [Name] - 컨텍스트 (Context)

**Gathered:** [date]
**Status:** 계획 준비 완료

<domain>
## Phase Boundary (phase 경계)

[이 phase가 무엇을 전달하는지 명확히 적습니다. ROADMAP.md에서 온 고정 범위이며, discussion은 이 범위 안의 구현 방식을 구체화합니다.]

</domain>

<decisions>
## Implementation Decisions (구현 결정)

### [논의한 영역 1]
- **D-01:** [내린 구체적 결정]
- **D-02:** [필요하면 추가 결정]

### [논의한 영역 2]
- **D-03:** [내린 구체적 결정]

### [논의한 영역 3]
- **D-04:** [내린 구체적 결정]

### Claude's Discretion (Claude 재량)
[사용자가 "너가 정해도 된다"라고 한 영역. planning/implementation 중 Claude가 재량을 가질 수 있습니다.]

</decisions>

<specifics>
## Specific Ideas (구체 아이디어)

[discussion 중 나온 구체 레퍼런스, 예시, "이런 느낌" 요구를 적습니다. 제품 레퍼런스, 행동 방식, 상호작용 패턴 등을 포함합니다.]

[없다면: "구체 요구 없음 — 표준 접근 허용"]

</specifics>

<canonical_refs>
## Canonical References (정본 참조 문서)

**Downstream agents MUST read these before planning or implementing.**

[List every spec, ADR, feature doc, or design doc that defines requirements or constraints for this phase. Use full relative paths so agents can read them directly. Group by topic area when the phase has multiple concerns.]

### [주제 영역 1]
- `path/to/spec-or-adr.md` — [이 phase와 관련해 무엇을 정의/결정하는 문서인지]
- `path/to/doc.md` §N — [어떤 섹션이며 무엇을 다루는지]

### [주제 영역 2]
- `path/to/feature-doc.md` — [어떤 기능/제약을 정의하는지]

[외부 spec이 없다면: "외부 spec 없음 — 위 결정 사항에 요구가 모두 담겨 있음"]

</canonical_refs>

<code_context>
## Existing Code Insights (기존 코드 인사이트)

### Reusable Assets
- [컴포넌트/hook/유틸]: [이 phase에서 어떻게 활용할 수 있는지]

### Established Patterns
- [패턴]: [이 phase에 어떤 제약/기회를 주는지]

### Integration Points
- [새 코드가 기존 시스템과 연결되는 지점]

</code_context>

<deferred>
## Deferred Ideas (보류 아이디어)

[discussion 중 나왔지만 다른 phase에 속하는 아이디어를 적습니다. 잃어버리지 않도록 남기되, 이번 phase 범위 밖임을 명시합니다.]

[없다면: "없음 — discussion이 phase 범위 안에서 유지됨"]

</deferred>

---

*Phase: XX-name*
*Context gathered: [date]*
```

<good_examples>

**Example 1: Visual feature (Post Feed)**

```markdown
# Phase 3: Post Feed - Context

**Gathered:** 2025-01-20
**Status:** Ready for planning

<domain>
## Phase Boundary (phase 경계)

Display posts from followed users in a scrollable feed. Users can view posts and see engagement counts. Creating posts and interactions are separate phases.

</domain>

<decisions>
## Implementation Decisions (구현 결정)

### Layout style
- Card-based layout, not timeline or list
- Each card shows: author avatar, name, timestamp, full post content, reaction counts
- Cards have subtle shadows, rounded corners — modern feel

### Loading behavior
- Infinite scroll, not pagination
- Pull-to-refresh on mobile
- New posts indicator at top ("3 new posts") rather than auto-inserting

### Empty state
- Friendly illustration + "Follow people to see posts here"
- Suggest 3-5 accounts to follow based on interests

### Claude's Discretion (Claude 재량)
- Loading skeleton design
- Exact spacing and typography
- Error state handling

</decisions>

<canonical_refs>
## Canonical References (정본 참조 문서)

### Feed display
- `docs/features/social-feed.md` — Feed requirements, post card fields, engagement display rules
- `docs/decisions/adr-012-infinite-scroll.md` — Scroll strategy decision, virtualization requirements

### Empty states
- `docs/design/empty-states.md` — Empty state patterns, illustration guidelines

</canonical_refs>

<specifics>
## Specific Ideas (구체 아이디어)

- "I like how Twitter shows the new posts indicator without disrupting your scroll position"
- Cards should feel like Linear's issue cards — clean, not cluttered

</specifics>

<deferred>
## Deferred Ideas (보류 아이디어)

- Commenting on posts — Phase 5
- Bookmarking posts — add to backlog

</deferred>

---

*Phase: 03-post-feed*
*Context gathered: 2025-01-20*
```

**Example 2: CLI tool (Database backup)**

```markdown
# Phase 2: Backup Command - Context

**Gathered:** 2025-01-20
**Status:** Ready for planning

<domain>
## Phase Boundary (phase 경계)

CLI command to backup database to local file or S3. Supports full and incremental backups. Restore command is a separate phase.

</domain>

<decisions>
## Implementation Decisions (구현 결정)

### Output format
- JSON for programmatic use, table format for humans
- Default to table, --json flag for JSON
- Verbose mode (-v) shows progress, silent by default

### Flag design
- Short flags for common options: -o (output), -v (verbose), -f (force)
- Long flags for clarity: --incremental, --compress, --encrypt
- Required: database connection string (positional or --db)

### Error recovery
- Retry 3 times on network failure, then fail with clear message
- --no-retry flag to fail fast
- Partial backups are deleted on failure (no corrupt files)

### Claude's Discretion (Claude 재량)
- Exact progress bar implementation
- Compression algorithm choice
- Temp file handling

</decisions>

<canonical_refs>
## Canonical References (정본 참조 문서)

### Backup CLI
- `docs/features/backup-restore.md` — Backup requirements, supported backends, encryption spec
- `docs/decisions/adr-007-cli-conventions.md` — Flag naming, exit codes, output format standards

</canonical_refs>

<specifics>
## Specific Ideas (구체 아이디어)

- "I want it to feel like pg_dump — familiar to database people"
- Should work in CI pipelines (exit codes, no interactive prompts)

</specifics>

<deferred>
## Deferred Ideas (보류 아이디어)

- Scheduled backups — separate phase
- Backup rotation/retention — add to backlog

</deferred>

---

*Phase: 02-backup-command*
*Context gathered: 2025-01-20*
```

**Example 3: Organization task (Photo library)**

```markdown
# Phase 1: Photo Organization - Context

**Gathered:** 2025-01-20
**Status:** Ready for planning

<domain>
## Phase Boundary (phase 경계)

Organize existing photo library into structured folders. Handle duplicates and apply consistent naming. Tagging and search are separate phases.

</domain>

<decisions>
## Implementation Decisions (구현 결정)

### Grouping criteria
- Primary grouping by year, then by month
- Events detected by time clustering (photos within 2 hours = same event)
- Event folders named by date + location if available

### Duplicate handling
- Keep highest resolution version
- Move duplicates to _duplicates folder (don't delete)
- Log all duplicate decisions for review

### Naming convention
- Format: YYYY-MM-DD_HH-MM-SS_originalname.ext
- Preserve original filename as suffix for searchability
- Handle name collisions with incrementing suffix

### Claude's Discretion (Claude 재량)
- Exact clustering algorithm
- How to handle photos with no EXIF data
- Folder emoji usage

</decisions>

<canonical_refs>
## Canonical References (정본 참조 문서)

### Organization rules
- `docs/features/photo-organization.md` — Grouping rules, duplicate policy, naming spec
- `docs/decisions/adr-003-exif-handling.md` — EXIF extraction strategy, fallback for missing metadata

</canonical_refs>

<specifics>
## Specific Ideas (구체 아이디어)

- "I want to be able to find photos by roughly when they were taken"
- Don't delete anything — worst case, move to a review folder

</specifics>

<deferred>
## Deferred Ideas (보류 아이디어)

- Face detection grouping — future phase
- Cloud sync — out of scope for now

</deferred>

---

*Phase: 01-photo-organization*
*Context gathered: 2025-01-20*
```

</good_examples>

<guidelines>
**This template captures DECISIONS for downstream agents.**

The output should answer: "What does the researcher need to investigate? What choices are locked for the planner?"

**Good content (concrete decisions):**
- "Card-based layout, not timeline"
- "Retry 3 times on network failure, then fail"
- "Group by year, then by month"
- "JSON for programmatic use, table for humans"

**Bad content (too vague):**
- "Should feel modern and clean"
- "Good user experience"
- "Fast and responsive"
- "Easy to use"

**After creation:**
- File lives in phase directory: `.planning/phases/XX-name/{phase_num}-CONTEXT.md`
- `gsd-phase-researcher` uses decisions to focus investigation AND reads canonical_refs to know WHAT docs to study
- `gsd-planner` uses decisions + research to create executable tasks AND reads canonical_refs to verify alignment
- Downstream agents should NOT need to ask the user again about captured decisions

**CRITICAL — Canonical references:**
- The `<canonical_refs>` section is MANDATORY. Every CONTEXT.md must have one.
- If your project has external specs, ADRs, or design docs, list them with full relative paths grouped by topic
- If ROADMAP.md lists `Canonical refs:` per phase, extract and expand those
- Inline mentions like "see ADR-019" scattered in decisions are useless to downstream agents — they need full paths and section references in a dedicated section they can find
- If no external specs exist, say so explicitly — don't silently omit the section
</guidelines>
