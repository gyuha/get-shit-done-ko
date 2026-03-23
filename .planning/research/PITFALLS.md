# Pitfalls Research: get-shit-done-ko

## Pitfall 1: Translating runtime tokens

- **Warning signs:** Commands, flags, placeholders, file paths, XML tags, or markdown references get partially translated.
- **Prevention:** Freeze command/path/identifier tokens before translation; review diffs for backticks, `/gsd:*`, `$gsd-*`, `@` paths, and placeholder blocks.
- **Phase to address:** Phase 2 through Phase 5

## Pitfall 2: Breaking cross-file references

- **Warning signs:** `@...` includes, markdown links, or generated file references no longer resolve after text edits.
- **Prevention:** Validate every translated file class with reference scans and targeted tests before moving on.
- **Phase to address:** Phase 3 and Phase 5

## Pitfall 3: Inconsistent terminology

- **Warning signs:** The same concept is translated multiple ways across docs, workflows, and templates.
- **Prevention:** Establish Korean terminology early and reuse it everywhere; prefer one glossary over per-file improvisation.
- **Phase to address:** Phase 2 through Phase 4

## Pitfall 4: Partial language cleanup

- **Warning signs:** Chinese docs remain in navigation, README badges, or cross-links even after removal.
- **Prevention:** Audit README/doc navigation and delete or relink all `zh-CN` entry points.
- **Phase to address:** Phase 2

## Pitfall 5: Translating comments that explain code incorrectly

- **Warning signs:** Comment edits accidentally change nearby code, or translated comments no longer match actual behavior.
- **Prevention:** Limit source edits to explanatory comments and user-facing strings; avoid bundling logic changes with prose-only changes unless necessary.
- **Phase to address:** Phase 4

## Pitfall 6: Losing upstream syncability

- **Warning signs:** Files are reorganized, renamed, or rewritten in ways that make future upstream diffs unreadable.
- **Prevention:** Preserve structure, note upstream version explicitly, and prefer minimal semantic edits over sweeping rewrites.
- **Phase to address:** Phase 1 and Phase 5
