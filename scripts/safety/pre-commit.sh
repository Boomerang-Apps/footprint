#!/bin/bash
# WAVE Safety Pre-Commit Hook

echo "Running WAVE safety checks..."

# Check for sensitive data
if grep -r "ANTHROPIC_API_KEY=" --include="*.ts" --include="*.tsx" --include="*.js" .; then
  echo "ERROR: API key found in source code!"
  exit 1
fi

# Check for hardcoded secrets
if grep -rE "(password|secret|token)\s*=\s*['"][^'"]+['"]" --include="*.ts" --include="*.tsx" .; then
  echo "WARNING: Potential hardcoded secrets found"
fi

echo "Safety checks passed!"
exit 0
