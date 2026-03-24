# CLAUDE.md 템플릿 (CLAUDE.md Template)

> 한국어 우선 안내: 이 템플릿은 `claude-md` 자산을 한국어 기준으로 먼저 읽을 수 있게 정리합니다. 아래 영문 원문은 upstream 동기화와 세부 의미 보존을 위해 함께 유지합니다.


Template for project-root `CLAUDE.md` — `gsd-tools generate-claude-md`가 자동 생성하는 템플릿입니다.

6개의 marker 기반 섹션으로 구성되며, 각 섹션은 독립적으로 갱신할 수 있습니다.
The `generate-claude-md` subcommand manages 5 sections (project, stack, conventions, architecture, workflow enforcement).
The profile section is managed exclusively by `generate-claude-profile`.

---

## Section Templates (섹션 템플릿)

### Project Section (프로젝트 섹션)
```
<!-- GSD:project-start source:PROJECT.md -->
## Project

{{project_content}}
<!-- GSD:project-end -->
```

**Fallback text:**
```
Project not yet initialized. Run /gsd:new-project to set up.
```

### Stack Section (스택 섹션)
```
<!-- GSD:stack-start source:STACK.md -->
## Technology Stack

{{stack_content}}
<!-- GSD:stack-end -->
```

**Fallback text:**
```
Technology stack not yet documented. Will populate after codebase mapping or first phase.
```

### Conventions Section (규칙 섹션)
```
<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

{{conventions_content}}
<!-- GSD:conventions-end -->
```

**Fallback text:**
```
Conventions not yet established. Will populate as patterns emerge during development.
```

### Architecture Section (아키텍처 섹션)
```
<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

{{architecture_content}}
<!-- GSD:architecture-end -->
```

**Fallback text:**
```
Architecture not yet mapped. Follow existing patterns found in the codebase.
```

### Workflow Enforcement Section (워크플로 강제 섹션)
```
<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->
```

### Profile Section (Placeholder Only / 플레이스홀더 전용)
```
<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` — do not edit manually.
<!-- GSD:profile-end -->
```

**Note:** This section is NOT managed by `generate-claude-md`. It is managed exclusively
by `generate-claude-profile`. The placeholder above is only used when creating a new
CLAUDE.md file and no profile section exists yet.

---

## Section Ordering (섹션 순서)

1. **Project** — Identity and purpose (what this project is)
2. **Stack** — Technology choices (what tools are used)
3. **Conventions** — Code patterns and rules (how code is written)
4. **Architecture** — System structure (how components fit together)
5. **Workflow Enforcement** — Default GSD entry points for file-changing work
6. **Profile** — Developer behavioral preferences (how to interact)

## Marker Format (마커 형식)

- Start: `<!-- GSD:{name}-start source:{file} -->`
- End: `<!-- GSD:{name}-end -->`
- Source attribute enables targeted updates when source files change
- Partial match on start marker (without closing `-->`) for detection

## Fallback Behavior (대체 동작)

When a source file is missing, fallback text provides Claude-actionable guidance:
- Guides Claude's behavior in the absence of data
- Not placeholder ads or "missing" notices
- Each fallback tells Claude what to do, not just what's absent
