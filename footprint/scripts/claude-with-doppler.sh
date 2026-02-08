#!/bin/bash
# Launch Claude Code with Doppler secrets injected
# Usage: ./scripts/claude-with-doppler.sh [claude args...]
#
# This reads secrets from the Doppler "footprint/dev" config
# and passes them as environment variables to Claude Code.
# The doppler.yaml in the project root defines the project/config.

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Ensure we're in the project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# Check Doppler CLI
if ! command -v doppler &> /dev/null; then
    echo -e "${RED}Error: Doppler CLI not installed.${NC}"
    echo "Install: brew install dopplerhq/cli/doppler"
    exit 1
fi

# Check Doppler auth
if ! doppler whoami &> /dev/null 2>&1; then
    echo -e "${RED}Error: Not logged in to Doppler.${NC}"
    echo "Run: doppler login"
    exit 1
fi

# Verify project config
DOPPLER_PROJECT=$(grep 'project:' doppler.yaml 2>/dev/null | awk '{print $2}')
DOPPLER_CONFIG=$(grep 'config:' doppler.yaml 2>/dev/null | awk '{print $2}')

echo -e "${GREEN}Launching Claude Code with Doppler secrets${NC}"
echo -e "  Project: ${YELLOW}${DOPPLER_PROJECT:-footprint}${NC}"
echo -e "  Config:  ${YELLOW}${DOPPLER_CONFIG:-dev}${NC}"
echo ""

# Verify key secrets are present
MISSING=0
for SECRET in GITHUB_PERSONAL_ACCESS_TOKEN NOTION_AUTH_HEADER SLACK_BOT_TOKEN SUPABASE_URL SUPABASE_SERVICE_KEY SENTRY_AUTH_TOKEN VERCEL_TOKEN; do
    if ! doppler secrets get "$SECRET" --plain > /dev/null 2>&1; then
        echo -e "${RED}Missing: $SECRET${NC}"
        MISSING=$((MISSING + 1))
    fi
done

if [ "$MISSING" -gt 0 ]; then
    echo -e "${YELLOW}Warning: $MISSING secret(s) missing. Some MCP servers may not connect.${NC}"
    echo ""
fi

# Launch Claude Code with Doppler injecting all secrets
exec doppler run -- claude "$@"
