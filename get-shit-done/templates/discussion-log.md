# Discussion Log 템플릿 (Discussion Log Template)

> 한국어 우선 안내: 이 템플릿은 `discussion-log` 자산을 한국어 기준으로 먼저 읽을 수 있게 정리합니다. 아래 영문 원문은 upstream 동기화와 세부 의미 보존을 위해 함께 유지합니다.


Template for `.planning/phases/XX-name/{phase_num}-DISCUSSION-LOG.md` — discuss-phase 질의응답의 감사 추적 템플릿입니다.

**Purpose:** 의사결정 과정을 남기는 소프트웨어 감사 기록입니다. 선택된 안뿐 아니라 검토한 대안까지 남기며, downstream agent가 직접 소비하는 CONTEXT.md와는 역할이 다릅니다.

**NOT for LLM consumption.** This file should never be referenced in `<files_to_read>` blocks or agent prompts.

## Format (형식)

```markdown
# Phase [X]: [Name] - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** [ISO date]
**Phase:** [phase number]-[phase name]
**Areas discussed:** [comma-separated list]

---

## [Area 1 Name]

| Option | Description | Selected |
|--------|-------------|----------|
| [Option 1] | [Brief description] | |
| [Option 2] | [Brief description] | ✓ |
| [Option 3] | [Brief description] | |

**User's choice:** [Selected option or verbatim free-text response]
**Notes:** [Any clarifications or rationale provided during discussion]

---

## [Area 2 Name]

...

---

## Claude's Discretion (Claude 재량)

[Areas delegated to Claude's judgment — list what was deferred and why]

## Deferred Ideas (보류 아이디어)

[Ideas mentioned but not in scope for this phase]

---

*Phase: XX-name*
*Discussion log generated: [date]*
```

## Rules (규칙)

- Generated automatically at end of every discuss-phase session
- Includes ALL options considered, not just the selected one
- Includes user's freeform notes and clarifications
- Clearly marked as audit-only, not an implementation artifact
- Does NOT interfere with CONTEXT.md generation or downstream agent behavior
- Committed alongside CONTEXT.md in the same git commit
