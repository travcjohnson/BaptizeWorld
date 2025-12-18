# Claude Reflections System

Automated daily and weekly reviews of your Claude Code conversations to extract learnings, insights, and content ideas.

## Quick Start

```bash
# 1. Run setup
./setup.sh

# 2. Configure API key (choose one method)
# Option A: .env file
echo "ANTHROPIC_API_KEY=sk-ant-..." > ~/.claude/.env

# Option B: macOS keychain
security add-generic-password -a $USER -s anthropic-api-key -w 'sk-ant-...'

# 3. Test it
./run-review.sh daily
```

## Components

| File | Purpose |
|------|---------|
| `collector.js` | Parses Claude Code JSONL conversation files |
| `review-daily.js` | Daily analysis (runs 4 AM) |
| `review-weekly.js` | Weekly retrospective (runs Sunday 8 PM) |
| `run-review.sh` | Wrapper that loads API key |
| `prompts/` | Customizable prompt templates |
| `outputs/` | Generated review markdown files |
| `logs/` | Execution logs |
| `launchd/` | macOS scheduled job configs |

## Manual Usage

```bash
# View yesterday's stats
node collector.js yesterday --stats

# View last week's conversations
node collector.js week

# Custom date range
node collector.js range 2025-12-01 2025-12-07

# Run reviews manually
./run-review.sh daily
./run-review.sh weekly
```

## Customizing Prompts

Edit the files in `prompts/` to change what the AI focuses on:

- `prompts/daily.md` - Daily review focus
- `prompts/weekly.md` - Weekly retrospective focus

## Schedule Management

```bash
# View scheduled jobs
launchctl list | grep claude

# Manually trigger daily review now
launchctl start com.claude.daily-review

# Unload jobs
launchctl unload ~/Library/LaunchAgents/com.claude.daily-review.plist
launchctl unload ~/Library/LaunchAgents/com.claude.weekly-review.plist
```

## Data Sources

The system reads from:
- `~/.claude/projects/` - Full conversation threads
- `~/.claude/history.jsonl` - Query history

Each conversation includes:
- User messages
- Claude responses
- Tools used
- Timestamps
- Project context
