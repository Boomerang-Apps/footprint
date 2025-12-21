#!/bin/bash

# Footprint Multi-Agent Worktree Sync Script
# This script syncs all worktrees with the main branch

set -e

PROJECT_DIR=$(pwd)
WORKTREES_DIR="${PROJECT_DIR}-worktrees"

echo "=================================================="
echo "  Syncing All Worktrees with Main"
echo "=================================================="
echo ""

# Define agents
AGENTS=("agent-cto" "agent-pm" "agent-qa" "backend-1" "backend-2" "frontend-a" "frontend-b")

for agent in "${AGENTS[@]}"; do
    echo "=== Syncing $agent ==="

    if [ -d "$WORKTREES_DIR/$agent" ]; then
        git -C "$WORKTREES_DIR/$agent" fetch origin main 2>/dev/null || echo "  -> No remote 'origin' or 'main' branch yet"
        git -C "$WORKTREES_DIR/$agent" merge origin/main --no-edit 2>/dev/null || echo "  -> Nothing to merge or merge not needed"
        echo "  -> Synced"
    else
        echo "  -> Worktree does not exist, skipping..."
    fi

    echo ""
done

echo "=================================================="
echo "  Sync Complete!"
echo "=================================================="
echo ""
echo "Current worktree status:"
git worktree list
echo ""
