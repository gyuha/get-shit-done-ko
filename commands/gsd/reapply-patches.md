---
description: "Reapply local modifications after a GSD update"
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, AskUserQuestion
---

<purpose>
After a GSD update wipes and reinstalls files, this command merges user's previously saved local modifications back into the new version. Uses intelligent comparison to handle cases where the upstream file also changed.
</purpose>

<process>
한국어 우선 안내: 실제 실행 시에는 아래 워크플로와 참조 경로를 그대로 따르되, 설명 해석은 한국어를 기본으로 사용합니다.


## Step 1: Detect backed-up patches

Check for local patches directory:

```bash
# Global install — detect runtime config directory
if [ -d "$HOME/.config/opencode/gsd-local-patches" ]; then
  PATCHES_DIR="$HOME/.config/opencode/gsd-local-patches"
elif [ -d "$HOME/.opencode/gsd-local-patches" ]; then
  PATCHES_DIR="$HOME/.opencode/gsd-local-patches"
elif [ -d "$HOME/.gemini/gsd-local-patches" ]; then
  PATCHES_DIR="$HOME/.gemini/gsd-local-patches"
else
  PATCHES_DIR="$HOME/.claude/gsd-local-patches"
fi
# Local install fallback — check all runtime directories
if [ ! -d "$PATCHES_DIR" ]; then
  for dir in .config/opencode .opencode .gemini .claude; do
    if [ -d "./$dir/gsd-local-patches" ]; then
      PATCHES_DIR="./$dir/gsd-local-patches"
      break
    fi
  done
fi
```

Read `backup-meta.json` from the patches directory.

**If no patches found:**
```
No local patches found. Nothing to reapply.

Local patches are automatically saved when you run /gsd:update
after modifying any GSD workflow, command, or agent files.
```
Exit.

## Step 2: Show patch summary

```
## Local Patches to Reapply

**Backed up from:** v{from_version}
**Current version:** {read VERSION file}
**Files modified:** {count}

| # | File | Status |
|---|------|--------|
| 1 | {file_path} | Pending |
| 2 | {file_path} | Pending |
```

## Step 3: Merge each file

For each file in `backup-meta.json`:

1. **Read the backed-up version** (user's modified copy from `gsd-local-patches/`)
2. **Read the newly installed version** (current file after update)
3. **Compare and merge:**

   - If the new file is identical to the backed-up file: skip (modification was incorporated upstream)
   - If the new file differs: identify the user's modifications and apply them to the new version

   **Merge strategy:**
   - Read both versions fully
   - Identify sections the user added or modified (look for additions, not just differences from path replacement)
   - Apply user's additions/modifications to the new version
   - If a section the user modified was also changed upstream: flag as conflict, show both versions, ask user which to keep

4. **Write merged result** to the installed location
5. **Report status:**
   - `Merged` — user modifications applied cleanly
   - `Skipped` — modification already in upstream
   - `Conflict` — user chose resolution

## Step 4: Update manifest

After reapplying, regenerate the file manifest so future updates correctly detect these as user modifications:

```bash
# The manifest will be regenerated on next /gsd:update
# For now, just note which files were modified
```

## Step 5: Cleanup option

Ask user:
- "Keep patch backups for reference?" → preserve `gsd-local-patches/`
- "Clean up patch backups?" → remove `gsd-local-patches/` directory

## Step 6: Report

```
## Patches Reapplied

| # | File | Status |
|---|------|--------|
| 1 | {file_path} | ✓ Merged |
| 2 | {file_path} | ○ Skipped (already upstream) |
| 3 | {file_path} | ⚠ Conflict resolved |

{count} file(s) updated. Your local modifications are active again.
```

</process>

<success_criteria>
한국어 우선 안내: 성공 기준의 판단은 아래 영문 체크리스트를 따르며, 한국어 설명은 빠른 이해를 돕기 위한 층입니다.

- [ ] All backed-up patches processed
- [ ] User modifications merged into new version
- [ ] Conflicts resolved with user input
- [ ] Status reported for each file
</success_criteria>
