#!/bin/bash
#
# Setup script for Claude Reflections System
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LAUNCHD_DIR="$HOME/Library/LaunchAgents"

echo "=== Claude Reflections Setup ==="
echo ""

# 1. Create directories
echo "Creating directories..."
mkdir -p "$SCRIPT_DIR/outputs"
mkdir -p "$SCRIPT_DIR/logs"
mkdir -p "$LAUNCHD_DIR"

# 2. Make scripts executable
echo "Making scripts executable..."
chmod +x "$SCRIPT_DIR/run-review.sh"
chmod +x "$SCRIPT_DIR/collector.js"
chmod +x "$SCRIPT_DIR/review-daily.js"
chmod +x "$SCRIPT_DIR/review-weekly.js"

# 3. Check for Node.js
echo "Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js not found. Install with: brew install node"
    exit 1
fi
echo "  Found: $(node --version)"

# 4. Check for API key
echo "Checking API key..."
if [ -n "$ANTHROPIC_API_KEY" ]; then
    echo "  Found in environment"
elif [ -f "$HOME/.claude/.env" ]; then
    echo "  Found in ~/.claude/.env"
elif security find-generic-password -a "$USER" -s "anthropic-api-key" -w &> /dev/null; then
    echo "  Found in keychain"
else
    echo ""
    echo "  WARNING: ANTHROPIC_API_KEY not configured"
    echo "  Set it up with one of these methods:"
    echo "    1. Create ~/.claude/.env with: ANTHROPIC_API_KEY=sk-ant-..."
    echo "    2. Add to macOS keychain:"
    echo "       security add-generic-password -a \$USER -s anthropic-api-key -w 'sk-ant-...'"
    echo ""
fi

# 5. Install launchd jobs (optional)
read -p "Install scheduled jobs (4 AM daily, 8 PM Sunday weekly)? [y/N] " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Installing launchd jobs..."

    # Update plist files with correct node path
    NODE_PATH=$(which node)

    # Copy and update daily plist
    sed "s|/usr/local/bin/node|$NODE_PATH|g" \
        "$SCRIPT_DIR/launchd/com.claude.daily-review.plist" > \
        "$LAUNCHD_DIR/com.claude.daily-review.plist"

    # Copy and update weekly plist
    sed "s|/usr/local/bin/node|$NODE_PATH|g" \
        "$SCRIPT_DIR/launchd/com.claude.weekly-review.plist" > \
        "$LAUNCHD_DIR/com.claude.weekly-review.plist"

    # Load the jobs
    launchctl unload "$LAUNCHD_DIR/com.claude.daily-review.plist" 2>/dev/null || true
    launchctl unload "$LAUNCHD_DIR/com.claude.weekly-review.plist" 2>/dev/null || true
    launchctl load "$LAUNCHD_DIR/com.claude.daily-review.plist"
    launchctl load "$LAUNCHD_DIR/com.claude.weekly-review.plist"

    echo "  Installed and loaded!"
fi

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Usage:"
echo "  Manual daily review:   ./run-review.sh daily"
echo "  Manual weekly review:  ./run-review.sh weekly"
echo "  Test collector:        node collector.js yesterday --stats"
echo ""
echo "Outputs will be saved to: $SCRIPT_DIR/outputs/"
echo "Logs will be saved to:    $SCRIPT_DIR/logs/"
echo ""
echo "Customize prompts in: $SCRIPT_DIR/prompts/"
