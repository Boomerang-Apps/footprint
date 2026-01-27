#!/bin/bash
# setup-worktrees.sh - Create isolated worktrees for each agent
# WAVE Architecture - 7 Agent Setup

set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
WORKTREE_DIR="$PROJECT_DIR/worktrees"

echo "=================================================="
echo "  Footprint WAVE Multi-Agent Worktree Setup"
echo "=================================================="
echo ""
echo "Project directory: $PROJECT_DIR"
echo "Worktrees directory: $WORKTREE_DIR"
echo ""

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "ERROR: Not a git repository."
    exit 1
fi

# Create worktree directory
mkdir -p "$WORKTREE_DIR"

# Function to create worktree safely
create_worktree() {
    local name=$1
    local branch=$2

    echo "Setting up worktree for: $name"

    if [ -d "$WORKTREE_DIR/$name" ]; then
        echo "  -> Worktree already exists, skipping..."
    else
        if git worktree add "$WORKTREE_DIR/$name" -b "$branch" 2>/dev/null; then
            echo "  -> Created worktree and branch: $branch"
        elif git worktree add "$WORKTREE_DIR/$name" "$branch" 2>/dev/null; then
            echo "  -> Attached to existing branch: $branch"
        else
            echo "  -> Warning: Could not create worktree for $name"
        fi
    fi
}

# Create worktree for each agent (matching WAVE architecture)
echo "Creating agent worktrees..."
echo ""
create_worktree "cto" "cto/workspace"
create_worktree "pm" "pm/workspace"
create_worktree "qa" "qa/workspace"
create_worktree "fe-dev-1" "fe-dev-1/workspace"
create_worktree "fe-dev-2" "fe-dev-2/workspace"
create_worktree "be-dev-1" "be-dev-1/workspace"
create_worktree "be-dev-2" "be-dev-2/workspace"

echo ""
echo "=================================================="
echo "  Worktree Setup Complete!"
echo "=================================================="
echo ""
echo "Worktrees created:"
git worktree list
echo ""
echo "To open each agent in Cursor:"
echo ""
echo "  cursor $WORKTREE_DIR/cto       # CTO Agent"
echo "  cursor $WORKTREE_DIR/pm        # PM Agent"
echo "  cursor $WORKTREE_DIR/qa        # QA Agent"
echo "  cursor $WORKTREE_DIR/fe-dev-1  # Frontend Dev 1"
echo "  cursor $WORKTREE_DIR/fe-dev-2  # Frontend Dev 2"
echo "  cursor $WORKTREE_DIR/be-dev-1  # Backend Dev 1"
echo "  cursor $WORKTREE_DIR/be-dev-2  # Backend Dev 2"
echo ""
echo "Or start Claude Code in each worktree:"
echo ""
echo "  cd $WORKTREE_DIR/cto && claude"
echo ""
