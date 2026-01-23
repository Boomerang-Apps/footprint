#!/bin/bash
# Post-task hook for Claude Code
# Runs after task completion

echo "📊 Task completed at $(date)"

# Log task completion (optional)
TASK_LOG="${HOME}/.claude/task-history.log"
echo "[$(date -Iseconds)] Task completed in $(pwd)" >> "$TASK_LOG" 2>/dev/null || true
