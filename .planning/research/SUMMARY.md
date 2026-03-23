# Research Summary: get-shit-done-ko

## Key Findings

**Stack:** Upstream `get-shit-done` `v1.28.0` is a Node 20+ package with CommonJS tooling, markdown-driven command/workflow assets, hooks, and tests. A Korean fork should keep that structure intact and localize content at the source-file level rather than add a runtime i18n layer.

**Table Stakes:** Mirror upstream layout, make Korean the default reading path, retain English docs, remove Chinese docs, translate prompts/templates/references/help/error copy/comments, and validate that commands and references still work.

**Watch Out For:** The highest-risk mistakes are translating runtime tokens, breaking `@` references and snippets, drifting terminology, and diverging too far from upstream structure.

## Recommended Delivery Strategy

1. Import upstream `v1.28.0` tree into the repository root.
2. Remove `zh-CN` content and repoint navigation to Korean/English.
3. Translate documentation and command/help surfaces.
4. Translate workflow/template/reference/agent copy with strict token preservation.
5. Translate remaining user-facing strings/comments in code.
6. Run tests and targeted integrity checks, then fix any broken references.
