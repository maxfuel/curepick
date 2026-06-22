#!/usr/bin/env bash

# Check if src/ files were changed but features-checklist.json was not updated.
# This script is called by Claude Code's Stop hook.

cd "$CLAUDE_PROJECT_DIR" 2>/dev/null || exit 0

# Skip if not a git repo
git rev-parse --git-dir >/dev/null 2>&1 || exit 0

# Get list of changed files (staged + unstaged)
changed_files=$(git diff --name-only 2>/dev/null; git diff --cached --name-only 2>/dev/null)

if [ -z "$changed_files" ]; then
  exit 0
fi

src_changed=false
checklist_changed=false

while IFS= read -r file; do
  case "$file" in
    src/*) src_changed=true ;;
    features-checklist.json) checklist_changed=true ;;
  esac
done <<< "$changed_files"

if [ "$src_changed" = true ] && [ "$checklist_changed" = false ]; then
  echo "src/ files were modified. Please update the corresponding status and tasks.done in features-checklist.json." >&2
  exit 1
fi

exit 0
