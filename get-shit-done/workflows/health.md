<purpose>
한국어 우선 안내: 이 워크플로 자산은 `health` 흐름을 한국어 기준으로 먼저 읽을 수 있게 정리합니다. 아래 영문 원문은 upstream 동기화와 세부 의미 보존을 위해 함께 유지합니다.

한국어 우선 안내: 이 워크플로는 `.planning/` 무결성을 점검하고 수리 가능한 문제를 한국어 기준으로 안내합니다. 아래 영문 규칙과 코드 식별자는 그대로 유지합니다.

Validate `.planning/` directory integrity and report actionable issues. Checks for missing files, invalid configurations, inconsistent state, and orphaned plans. Optionally repairs auto-fixable issues.
</purpose>

<required_reading>
Read all files referenced by the invoking prompt's execution_context before starting.
</required_reading>

<process>

<step name="parse_args">
**Parse arguments:**

Check if `--repair` flag is present in the command arguments.

```
REPAIR_FLAG=""
if arguments contain "--repair"; then
  REPAIR_FLAG="--repair"
fi
```
</step>

<step name="run_health_check">
**Run health validation:**

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" validate health $REPAIR_FLAG
```

Parse JSON output:
- `status`: "healthy" | "degraded" | "broken"
- `errors[]`: Critical issues (code, message, fix, repairable)
- `warnings[]`: Non-critical issues
- `info[]`: Informational notes
- `repairable_count`: Number of auto-fixable issues
- `repairs_performed[]`: Actions taken if --repair was used
</step>

<step name="format_output">
**Format and display results:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD 상태 점검
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

상태: HEALTHY | DEGRADED | BROKEN
오류: N | 경고: N | 정보: N
```

**If repairs were performed:**
```
## 수행된 자동 수리

- ✓ config.json: Created with defaults
- ✓ STATE.md: Regenerated from roadmap
```

**If errors exist:**
```
## 오류

- [E001] config.json: JSON parse error at line 5
  Fix: 기본값으로 되돌리려면 /gsd:health --repair 실행

- [E002] PROJECT.md not found
  Fix: 생성하려면 /gsd:new-project 실행
```

**If warnings exist:**
```
## 경고

- [W002] STATE.md references phase 5, but only phases 1-3 exist
  Fix: STATE.md를 바꾸기 전에 수동으로 검토하세요. repair는 기존 STATE.md를 덮어쓰지 않습니다.

- [W005] Phase directory "1-setup" doesn't follow NN-name format
  Fix: 패턴에 맞게 이름을 바꾸세요 (예: 01-setup)
```

**If info exists:**
```
## 정보

- [I001] 02-implementation/02-01-PLAN.md has no SUMMARY.md
  Note: 진행 중일 수 있습니다
```

**Footer (if repairable issues exist and --repair was NOT used):**
```
---
N개의 문제는 자동 수리할 수 있습니다. 실행: /gsd:health --repair
```
</step>

<step name="offer_repair">
**If repairable issues exist and --repair was NOT used:**

Ask user if they want to run repairs:

```
N개의 문제를 자동으로 고치기 위해 /gsd:health --repair 를 실행할까요?
```

If yes, re-run with --repair flag and display results.
</step>

<step name="verify_repairs">
**If repairs were performed:**

Re-run health check without --repair to confirm issues are resolved:

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" validate health
```

Report final status.
</step>

</process>

<error_codes>

| Code | Severity | Description | Repairable |
|------|----------|-------------|------------|
| E001 | error | .planning/ directory not found | No |
| E002 | error | PROJECT.md not found | No |
| E003 | error | ROADMAP.md not found | No |
| E004 | error | STATE.md not found | Yes |
| E005 | error | config.json parse error | Yes |
| W001 | warning | PROJECT.md missing required section | No |
| W002 | warning | STATE.md references invalid phase | No |
| W003 | warning | config.json not found | Yes |
| W004 | warning | config.json invalid field value | No |
| W005 | warning | Phase directory naming mismatch | No |
| W006 | warning | Phase in ROADMAP but no directory | No |
| W007 | warning | Phase on disk but not in ROADMAP | No |
| W008 | warning | config.json: workflow.nyquist_validation absent (defaults to enabled but agents may skip) | Yes |
| W009 | warning | Phase has Validation Architecture in RESEARCH.md but no VALIDATION.md | No |
| I001 | info | Plan without SUMMARY (may be in progress) | No |

</error_codes>

<repair_actions>

| Action | Effect | Risk |
|--------|--------|------|
| createConfig | Create config.json with defaults | None |
| resetConfig | Delete + recreate config.json | Loses custom settings |
| regenerateState | Create STATE.md from ROADMAP structure when it is missing | Loses session history |
| addNyquistKey | Add workflow.nyquist_validation: true to config.json | None — matches existing default |

**Not repairable (too risky):**
- PROJECT.md, ROADMAP.md content
- Phase directory renaming
- Orphaned plan cleanup

</repair_actions>

<stale_task_cleanup>
**Windows-specific:** Check for stale Claude Code task directories that accumulate on crash/freeze.
These are left behind when subagents are force-killed and consume disk space.

When `--repair` is active, detect and clean up:

```bash
# Check for stale task directories (older than 24 hours)
TASKS_DIR="$HOME/.claude/tasks"
if [ -d "$TASKS_DIR" ]; then
  STALE_COUNT=$(find "$TASKS_DIR" -maxdepth 1 -type d -mtime +1 2>/dev/null | wc -l)
  if [ "$STALE_COUNT" -gt 0 ]; then
    echo "⚠️  Found $STALE_COUNT stale task directories in ~/.claude/tasks/"
    echo "   These are leftover from crashed subagent sessions."
    echo "   Run: rm -rf ~/.claude/tasks/*  (safe — only affects dead sessions)"
  fi
fi
```

Report as info diagnostic: `I002 | info | Stale subagent task directories found | Yes (--repair removes them)`
</stale_task_cleanup>
