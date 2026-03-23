# Project Guide

## Project

`get-shit-done-ko` is a Korean-localized fork of upstream `get-shit-done` `v1.28.0`. Preserve upstream structure and runtime compatibility while making Korean the default language for documentation, prompts, templates, comments, and user-facing copy.

## Non-Negotiables

- Keep commands, flags, filenames, directory names, identifiers, and phase/requirement IDs unchanged.
- Keep English documentation available.
- Remove Simplified Chinese docs and related navigation from this fork.
- Treat `@` references, placeholders, XML/markdown structure, snippets, and paths as token-sensitive.

## Working Rules

- Prefer minimal semantic changes when localizing.
- Separate structural/import work from translation-heavy edits when possible.
- Verify token-sensitive files after translation.
- Use `.planning/PROJECT.md`, `.planning/REQUIREMENTS.md`, `.planning/ROADMAP.md`, and `.planning/STATE.md` as the source of truth for scope and sequencing.

## Current Roadmap Focus

- Phase 1: Import upstream `v1.28.0` into the repository root.
- Phase 2: Make docs/readme Korean-first while preserving English and removing Chinese.
- Phase 3: Localize workflow/template/reference surfaces.
- Phase 4: Localize remaining runtime text/comments safely.
- Phase 5: Validate compatibility and prepare release.
