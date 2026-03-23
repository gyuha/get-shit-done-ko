# get-shit-done-ko

## What This Is

`get-shit-done-ko` is a Korean-localized fork of the upstream `get-shit-done` project, pinned to upstream `v1.28.0` as the initial source baseline. It should preserve the upstream repository structure and all command/file/path/identifier compatibility, while making Korean the default language for explanatory text, prompts, templates, comments, and other user-facing copy.

English documentation remains available, Simplified Chinese content is removed from this fork, and Korean becomes the primary reading path for day-to-day use.

## Core Value

Korean-speaking users can use GSD end-to-end in Korean without breaking upstream command compatibility.

## Requirements

### Validated

- ✓ Root-level upstream `get-shit-done` `v1.28.0` baseline imported and documented — Phase 1
- ✓ Korean-first public documentation established, English reference access preserved, and Simplified Chinese docs removed — Phase 2
- ✓ Korean-first command/workflow/template/reference/agent overlay established without breaking command/path/token compatibility — Phase 3

### Active

- [ ] Translate remaining runtime help/checkpoint/error-style source strings into Korean without changing executable behavior.
- [ ] Translate explanatory comments where useful while preserving identifiers and runtime semantics.
- [ ] Run final compatibility validation so tests, installers, references, placeholders, and prompt routing remain intact after localization.

### Out of Scope

- Renaming commands or changing CLI syntax — compatibility with upstream usage must remain intact.
- Renaming files, directories, identifiers, or phase/requirement IDs — automation and references depend on these names.
- Re-architecting upstream features or adding net-new product scope — this project is a localization fork first.
- Keeping Simplified Chinese documentation in this fork — the requested default is Korean with English retained.

## Context

- Upstream source baseline: `https://github.com/gsd-build/get-shit-done` tag `v1.28.0`.
- Destination repository: `https://github.com/gyuha/get-shit-done-ko`.
- Upstream is a Node.js package (`get-shit-done-cc`) with markdown-driven commands, workflows, references, templates, agent prompts, hooks, tests, and installer scripts.
- Repository structure matters because runtime entry points and prompt references rely on stable paths such as `commands/`, `get-shit-done/workflows/`, `get-shit-done/templates/`, and `get-shit-done/references/`.
- The localization scope explicitly includes docs, workflow prompts, templates, error/help text, checkpoint copy, and comments.
- The localization scope explicitly excludes command tokens, filenames, directory names, identifiers, and phase/requirement IDs.

## Constraints

- **Upstream parity**: Start from upstream `v1.28.0` layout and preserve root-level structure — later maintenance depends on easy diffing against upstream.
- **Compatibility**: Commands, file paths, placeholders, and identifiers must remain unchanged — prompt routing and tooling expect exact tokens.
- **Language policy**: Korean is default, English remains available, Simplified Chinese is removed — this defines both content scope and navigation behavior.
- **Runtime safety**: Localization must not break `@` references, markdown links, snippets, CLI examples, or tests — translated prose cannot alter executable content.
- **Maintainability**: Translation choices should stay consistent across docs, prompts, templates, and comments — mixed terminology will confuse both users and downstream agents.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Pin initial import to upstream `v1.28.0` | Gives the fork a stable baseline and makes future sync work auditable | ✓ Good |
| Keep command/file/path/ID tokens in English | These tokens are part of the runtime contract and must not drift | ✓ Good |
| Korean-first with English retained, Chinese removed | Matches the requested reading experience and lowers maintenance burden | ✓ Good |
| Translate prompt/template/reference assets in source, not just end-user docs | Most of the product experience is encoded in markdown workflow assets | ✓ Good |
| Keep frontmatter descriptions stable where installer tooling depends on them | Some generated skills/config files assert original descriptions for compatibility | ✓ Good |
| Flatten upstream into the root instead of keeping a nested submodule | Later localization phases need to edit the actual runtime tree in place | ✓ Good |
| Document upstream sync rules before translating imported content | Future maintenance needs a stable source/version audit trail | ✓ Good |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `$gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `$gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-23 after Phase 3 completion*
