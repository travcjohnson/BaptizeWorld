#!/bin/bash
#
# Wrapper script for running reviews with API key
# This loads the API key from environment or keychain
#

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REVIEW_TYPE="${1:-daily}"

# Load API key from .env file if it exists
if [ -f "$HOME/.claude/.env" ]; then
    export $(grep -v '^#' "$HOME/.claude/.env" | xargs)
fi

# Or try to get from macOS keychain
if [ -z "$ANTHROPIC_API_KEY" ]; then
    ANTHROPIC_API_KEY=$(security find-generic-password -a "$USER" -s "anthropic-api-key" -w 2>/dev/null)
    export ANTHROPIC_API_KEY
fi

# Check if we have the key
if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "ERROR: ANTHROPIC_API_KEY not found"
    echo ""
    echo "Set it up with one of these methods:"
    echo "  1. Create ~/.claude/.env with: ANTHROPIC_API_KEY=sk-ant-..."
    echo "  2. Add to macOS keychain:"
    echo "     security add-generic-password -a \$USER -s anthropic-api-key -w 'sk-ant-...'"
    exit 1
fi

# Run the appropriate review
case "$REVIEW_TYPE" in
    daily)
        node "$SCRIPT_DIR/review-daily.js"
        ;;
    weekly)
        node "$SCRIPT_DIR/review-weekly.js"
        ;;
    *)
        echo "Usage: $0 [daily|weekly]"
        exit 1
        ;;
esac
