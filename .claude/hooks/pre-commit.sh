#!/bin/bash
# Pre-commit hook for Claude Code
# Runs before any commit operation

set -e

echo "🔍 Running pre-commit checks..."

# Change to footprint directory
cd "$(dirname "$0")/../../footprint" 2>/dev/null || cd "$(dirname "$0")/../.."

# Run type check if available
if [ -f "package.json" ] && grep -q "typecheck" package.json; then
    echo "📝 Type checking..."
    npm run typecheck --silent || {
        echo "❌ Type check failed"
        exit 1
    }
fi

# Run lint if available
if [ -f "package.json" ] && grep -q "\"lint\"" package.json; then
    echo "🧹 Linting..."
    npm run lint --silent || {
        echo "❌ Lint failed"
        exit 1
    }
fi

echo "✅ Pre-commit checks passed"
