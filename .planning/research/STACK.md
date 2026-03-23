# Stack Research: get-shit-done-ko

**Context:** Korean localization fork of upstream `get-shit-done` `v1.28.0`
**Source inspected:** `package.json`, `README.md`, `docs/FEATURES.md`, `docs/CONFIGURATION.md`, repository tree

## Recommended Stack

### Baseline runtime
- **Node.js 20+** — upstream requires `>=20.0.0`; keep the same floor for install and test compatibility.
- **npm package distribution** — upstream ships as `get-shit-done-cc`; preserving packaging/layout avoids accidental runtime drift.
- **CommonJS Node scripts** — core tools and helpers live in `.cjs` files; avoid introducing a new module system during localization.

### Content surface
- **Markdown-first localization** — commands, workflows, templates, references, and docs are primarily `.md`; translation work should happen at source-file level rather than via runtime i18n wrappers.
- **Static asset parity** — keep images, hooks, scripts, and generated assets aligned with upstream unless language-specific copy requires a source edit.
- **Git-based upstream sync workflow** — treat upstream `v1.28.0` as the initial mirror baseline so future diffs remain understandable.

### Quality layer
- **Existing test suite** — upstream already includes Node-based tests; use them as regression protection after translation changes.
- **Reference integrity checks** — translation review must verify command tokens, `@` references, paths, placeholder syntax, and code snippets remain untouched.

## What Not To Change

- Do not rename command tokens such as `/gsd:*`, `$gsd-*`, flags, or file names.
- Do not add a runtime translation framework unless the source audit proves markdown-only localization is insufficient.
- Do not restructure directories while importing upstream; path stability is part of the product contract.

## Rationale

- The project is content-heavy rather than UI-heavy. Most behavior is encoded in text assets that downstream agents read directly.
- Markdown/source localization is lower risk than adding a second language-selection layer.
- Upstream parity makes future Korean maintenance and cherry-picking realistic.

## Confidence

- **Node/npm/CommonJS baseline** — High
- **Markdown-first localization approach** — High
- **Need for runtime i18n framework** — Low; current evidence suggests unnecessary complexity
