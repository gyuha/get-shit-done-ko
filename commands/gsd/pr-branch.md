---
name: gsd:pr-branch
description: "한국어 우선 안내 — Create a clean PR branch by filtering out .planning/ commits — ready for code review"
argument-hint: "[target branch, default: main]"
allowed-tools:
  - Bash
  - Read
  - AskUserQuestion
---

<objective>
한국어 우선 안내: 이 명령 문서는 `/gsd:pr-branch` 흐름을 한국어로 먼저 안내합니다. 아래 영문 원문은 upstream 호환성과 세부 의미 보존을 위해 함께 유지합니다.

Create a clean branch suitable for pull requests by filtering out .planning/ commits
from the current branch. Reviewers see only code changes, not GSD planning artifacts.

This solves the problem of PR diffs being cluttered with PLAN.md, SUMMARY.md, STATE.md
changes that are irrelevant to code review.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/pr-branch.md
</execution_context>

<process>
한국어 우선 안내: 실제 실행 시에는 아래 워크플로와 참조 경로를 그대로 따르되, 설명 해석은 한국어를 기본으로 사용합니다.

Execute the pr-branch workflow from @~/.claude/get-shit-done/workflows/pr-branch.md end-to-end.
</process>
