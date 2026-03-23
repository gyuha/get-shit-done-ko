---
phase: 04
slug: runtime-text-and-comment-localization
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-23
---

# Phase 04 Validation Architecture

## Validation Goals

Demonstrate that runtime-facing source copy and explanatory comments become Korean-first without breaking executable contracts, command syntax, or automated regression coverage.

## Automated Checks

### Quick Safety Check

```bash
node get-shit-done/bin/gsd-tools.cjs validate health
```

### Full Regression Suite

```bash
node scripts/run-tests.cjs
```

## Per-Plan Verification

### `04-01` Runtime Text Localization

- `rg -n "한국어|설치|오류|경고|실행|생성|설정|상태" bin/install.js scripts/build-hooks.js get-shit-done/bin/gsd-tools.cjs get-shit-done/bin/lib`
- `node scripts/run-tests.cjs`
- `node get-shit-done/bin/gsd-tools.cjs validate health`

### `04-02` Comment Localization + Semantic Drift Review

- `rg -n "한국어|설명|주의|호환성|검증|유지" bin/install.js scripts get-shit-done/bin/gsd-tools.cjs get-shit-done/bin/lib`
- `node scripts/run-tests.cjs`
- `node get-shit-done/bin/gsd-tools.cjs validate health`

## Manual Review Requirements

- Spot-read representative runtime files to ensure command names, flags, config keys, file paths, placeholders, and identifiers remain unchanged.
- Spot-read representative docblocks/comments to confirm prose was translated without altering code examples or logic descriptions.

## Pass Conditions

- Runtime source files contain Korean-facing messages where intended.
- Comment/docblock hotspots contain Korean explanatory prose where intended.
- Full test suite passes after localization updates.
- Health validation remains clean.
