#!/bin/bash
# WAVE Validation Script

echo "Running WAVE validation..."

# Check TypeScript
if [ -f "tsconfig.json" ]; then
  echo "Checking TypeScript..."
  npx tsc --noEmit
fi

# Check ESLint
if [ -f ".eslintrc.js" ] || [ -f ".eslintrc.json" ]; then
  echo "Running ESLint..."
  npx eslint . --ext .ts,.tsx
fi

echo "Validation complete!"
