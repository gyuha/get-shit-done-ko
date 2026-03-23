---
name: gsd:set-profile
description: "한국어 우선 안내 — Switch model profile for GSD agents (quality/balanced/budget/inherit)"
argument-hint: <profile (quality|balanced|budget|inherit)>
model: haiku
allowed-tools:
  - Bash
---

Show the following output to the user verbatim, with no extra commentary:

!`node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" config-set-model-profile $ARGUMENTS --raw`
