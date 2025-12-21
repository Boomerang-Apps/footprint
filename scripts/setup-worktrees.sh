#!/bin/bash

# Footprint Multi-Agent Worktree Setup Script
# This script creates git worktrees for each agent

set -e

PROJECT_DIR=$(pwd)
WORKTREES_DIR="${PROJECT_DIR}-worktrees"

echo "=================================================="
echo "  Footprint Multi-Agent Worktree Setup"
echo "=================================================="
echo ""
echo "Project directory: $PROJECT_DIR"
echo "Worktrees directory: $WORKTREES_DIR"
echo ""

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "ERROR: Not a git repository. Please run 'git init' first."
    exit 1
fi

# Create worktrees directory
echo "Creating worktrees directory..."
mkdir -p "$WORKTREES_DIR"

# Define agents
AGENTS=("agent-cto" "agent-pm" "agent-qa" "backend-1" "backend-2" "frontend-a" "frontend-b")

# Create worktree for each agent
for agent in "${AGENTS[@]}"; do
    echo ""
    echo "Setting up worktree for: $agent"

    if [ -d "$WORKTREES_DIR/$agent" ]; then
        echo "  -> Worktree already exists, skipping..."
    else
        git worktree add "$WORKTREES_DIR/$agent" -b "agent/$agent"
        echo "  -> Created worktree and branch: agent/$agent"
    fi
done

echo ""
echo "=================================================="
echo "  Worktree Setup Complete!"
echo "=================================================="
echo ""
echo "Worktrees created:"
git worktree list
echo ""
echo "To start an agent session:"
echo ""
echo "  CTO Agent:"
echo "    cd $WORKTREES_DIR/agent-cto && claude"
echo ""
echo "  PM Agent:"
echo "    cd $WORKTREES_DIR/agent-pm && claude"
echo ""
echo "  QA Agent:"
echo "    cd $WORKTREES_DIR/agent-qa && claude"
echo ""
echo "  Backend-1 Agent:"
echo "    cd $WORKTREES_DIR/backend-1 && claude"
echo ""
echo "  Backend-2 Agent:"
echo "    cd $WORKTREES_DIR/backend-2 && claude"
echo ""
echo "  Frontend-A Agent:"
echo "    cd $WORKTREES_DIR/frontend-a && claude"
echo ""
echo "  Frontend-B Agent:"
echo "    cd $WORKTREES_DIR/frontend-b && claude"
echo ""
echo "Remember to read the agent definition files before starting!"
echo "  .claudecode/agents/[agent-name]-agent.md"
echo ""
