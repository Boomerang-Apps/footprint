#!/bin/bash
# Merge Watcher v12 - WAVE Orchestration Script
# Monitors worktrees and coordinates merges for multi-agent development

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
SIGNAL_DIR="$PROJECT_ROOT/.claude/signals"
LOCK_DIR="$PROJECT_ROOT/.claude/locks"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Create required directories
mkdir -p "$SIGNAL_DIR" "$LOCK_DIR"

# Check for required worktrees
check_worktrees() {
    local worktrees=("fe-dev" "be-dev" "qa" "dev-fix")
    local missing=()

    for wt in "${worktrees[@]}"; do
        if [ ! -d "$PROJECT_ROOT/worktrees/$wt" ]; then
            missing+=("$wt")
        fi
    done

    if [ ${#missing[@]} -gt 0 ]; then
        log_warn "Missing worktrees: ${missing[*]}"
        return 1
    fi

    log_success "All worktrees present"
    return 0
}

# Check for completion signals
check_signals() {
    local wave=$1
    local gate=$2

    log_info "Checking signals for wave $wave, gate $gate..."

    local fe_signal="$SIGNAL_DIR/signal-wave${wave}-gate${gate}-fe-dev.json"
    local be_signal="$SIGNAL_DIR/signal-wave${wave}-gate${gate}-be-dev.json"

    if [ -f "$fe_signal" ] && [ -f "$be_signal" ]; then
        log_success "Both FE and BE signals found"
        return 0
    fi

    [ ! -f "$fe_signal" ] && log_warn "Missing FE signal: $fe_signal"
    [ ! -f "$be_signal" ] && log_warn "Missing BE signal: $be_signal"

    return 1
}

# Sync worktree with main
sync_worktree() {
    local worktree=$1
    local wt_path="$PROJECT_ROOT/worktrees/$worktree"

    if [ ! -d "$wt_path" ]; then
        log_error "Worktree not found: $wt_path"
        return 1
    fi

    log_info "Syncing $worktree with main..."

    cd "$wt_path"
    git fetch origin main
    git merge origin/main --no-edit || {
        log_error "Merge conflict in $worktree"
        return 1
    }

    log_success "$worktree synced successfully"
    return 0
}

# Main monitoring loop
main() {
    log_info "Starting Merge Watcher v12"
    log_info "Project: $PROJECT_ROOT"

    # Initial checks
    check_worktrees || log_warn "Some worktrees missing - continue monitoring"

    log_info "Merge Watcher is now running. Press Ctrl+C to stop."

    while true; do
        # Check for pending merges every 30 seconds
        sleep 30

        # Look for new completion signals
        for signal in "$SIGNAL_DIR"/signal-wave*-gate*-*.json; do
            [ -f "$signal" ] || continue

            # Extract wave and gate from filename
            basename "$signal"
            log_info "Found signal: $(basename "$signal")"
        done
    done
}

# Handle script arguments
case "${1:-}" in
    --check)
        check_worktrees
        ;;
    --sync)
        sync_worktree "${2:-fe-dev}"
        ;;
    --help|-h)
        echo "Usage: $0 [--check|--sync <worktree>|--help]"
        echo ""
        echo "Options:"
        echo "  --check       Check worktree status"
        echo "  --sync <wt>   Sync specified worktree with main"
        echo "  --help        Show this help message"
        echo ""
        echo "Run without arguments to start the monitoring loop."
        ;;
    *)
        main
        ;;
esac
