# Feature Research: get-shit-done-ko

**Question:** What feature set is table stakes for a Korean-localized fork of GSD?

## Table Stakes

### Repository parity
- Mirror upstream root structure so installs, hooks, references, and tests can run without path breakage.
- Preserve package metadata and shipped file layout needed by the installer.

### Korean-first reading flow
- Korean README and major docs become the primary navigation path.
- English docs remain available as a fallback/reference language.
- Simplified Chinese docs and links are removed from the fork.

### Workflow asset localization
- Commands help text, workflow prompts, reference guides, templates, and agent-facing prose are translated.
- Checkpoint boxes, banner copy, and user-facing status/error/help text become Korean by default.

### Source-level localization hygiene
- Comments that explain maintained behavior are translated where useful.
- Snippets, command literals, file paths, IDs, placeholders, and machine-readable markers stay unchanged.

### Validation
- Existing tests and spot checks confirm that localization did not break command routing or file references.
- A translation review pass checks terminology consistency across docs and prompts.

## Differentiators

- Consistent Korean terminology across docs, prompts, and templates instead of ad hoc translation.
- Clear upstream version pinning and future sync strategy for maintainers.
- Korean-first but English-preserving distribution, which is more useful than replacing English entirely.

## Anti-Features

- Translating command names, flags, filenames, or identifiers.
- Leaving mixed Korean/English/Chinese navigation paths that confuse users.
- Bulk machine translation that alters snippets, placeholders, or structured markup.
- Feature rewrites unrelated to localization.

## Complexity Notes

- **High:** workflows/templates/references because they contain structured prompt syntax and path references.
- **Medium:** README/docs/comments because they are prose-heavy but safer to translate.
- **Medium:** runtime/help/error strings because they can hide token-sensitive examples.
- **Low:** binary/static assets unless copy is baked into them.

## Dependency Notes

- Upstream import must happen before broad localization so file coverage is complete.
- Command/help/workflow translation depends on a finalized terminology policy.
- Validation depends on both import parity and completed text translation.
