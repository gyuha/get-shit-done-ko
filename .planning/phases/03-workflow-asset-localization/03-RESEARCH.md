# Phase 03 Research: Workflow Asset Localization

**Phase:** 03  
**Goal:** Translate command/help/workflow/template/reference assets so Korean becomes the default working language without breaking structured prompt syntax.

## Scope Findings

### Target surfaces

This phase covers the markdown assets that define GSD's runtime behavior and user-facing prompt experience:

- `commands/gsd/*.md` — 57 command entry files
- `get-shit-done/workflows/*.md` — 56 workflow orchestration files
- `get-shit-done/templates/**/*` — 42 templates
- `get-shit-done/references/*.md` — 15 shared references
- `agents/*.md` — 18 specialized agent prompt files

### Token-sensitive structures that must remain unchanged

Representative samples (`commands/gsd/plan-phase.md`, `get-shit-done/workflows/plan-phase.md`, `get-shit-done/templates/summary.md`, `get-shit-done/references/checkpoints.md`, `agents/gsd-executor.md`) confirm the highest-risk elements are:

- YAML frontmatter keys and runtime-sensitive values:
  - `name: gsd:*`
  - `argument-hint`
  - `allowed-tools`
  - `tools`
  - `color`
- Runtime and workflow references:
  - `@~/.claude/get-shit-done/...`
  - `/gsd:*` command literals
  - `$ARGUMENTS`
- Structured markup:
  - XML blocks such as `<objective>`, `<process>`, `<task>`, `<verification>`
  - placeholder tokens like `{phase}`, `{N}`, `${PHASE}`, `${GSD_WS}`
  - code fences, shell snippets, JSON examples, and path examples

### Localization rule for this phase

The safest translation approach is:

- translate explanatory prose, headings, notes, inline guidance, and user-facing wording
- preserve:
  - command literals
  - file paths
  - frontmatter keys and machine-sensitive values
  - XML tag names and structure
  - placeholders, variable names, and requirement IDs
  - fenced code examples unless the content is clearly human-facing copy only

## Recommended Execution Shape

### Plan split

Use three plans:

1. **Command and help-entry localization**
   - translate `commands/gsd/*.md`
   - translate help-facing workflow outputs such as `help.md`, `progress.md`, `next.md`, `health.md`

2. **Workflow/template/reference localization**
   - translate the core workflow, template, and reference prose
   - preserve all structured sections, tags, placeholders, and `@` references

3. **Agent prompt localization and terminology review**
   - translate agent prompt prose in `agents/*.md`
   - perform consistency review across commands/workflows/templates/references/agents

### Dependency order

- `03-01` should establish Korean-first wording patterns for command/help entry surfaces.
- `03-02` should follow after `03-01` so workflow/template/reference wording aligns with the command surface.
- `03-03` should run last because agent prompt terminology should reflect the final phrasing established by the other translated assets.

## Validation Architecture

### Quick checks

- `rg -n "한국어|설명|워크플로|검증" commands/gsd get-shit-done/workflows get-shit-done/templates get-shit-done/references agents`
- `node get-shit-done/bin/gsd-tools.cjs verify references commands/gsd/plan-phase.md`
- `node get-shit-done/bin/gsd-tools.cjs verify references get-shit-done/workflows/plan-phase.md`
- `node get-shit-done/bin/gsd-tools.cjs verify references agents/gsd-executor.md`

### Functional checks

- `node get-shit-done/bin/gsd-tools.cjs validate health`
- `node scripts/run-tests.cjs`

### High-risk breakage checks

- verify representative files still contain:
  - `@~/.claude/get-shit-done/`
  - `/gsd:`
  - `<task`
  - `tools: Read`
  - `argument-hint:`
- ensure no translated file renames command literals, tag names, or placeholder variables

## Risks

- Translating XML tag contents too aggressively can accidentally change tag names or placeholder syntax.
- Frontmatter descriptions are safe to translate, but frontmatter keys and tool names are not.
- Workflow and reference files contain many literal `/gsd:*` commands embedded in prose; these must remain exact.
- Agent prompts mix human explanation with machine-relevant instructions, so wording changes must not alter execution semantics.

## Planning Notes

- No separate Phase 3 `CONTEXT.md` is required; user intent is already precise: translate prose, preserve compatibility-sensitive tokens.
- Prefer plan scopes by asset family instead of one giant repository-wide translation pass.
- Use representative `verify references` commands plus full test suite as the main automated safety net.

## RESEARCH COMPLETE

Phase 03 is ready for planning. The main challenge is syntax-safe localization of structured prompt assets, not additional domain discovery.
