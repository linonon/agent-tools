# Claude Quota Checker

Check your Claude Code subscription usage via Anthropic OAuth API.

## Installation

No installation needed - just run the script.

## Usage

```bash
# Check quota
python3 quota.py

# Debug mode (show raw API JSON)
python3 quota.py --debug
```

## What It Shows

- 5-Hour Cycle usage (current session)
- Weekly usage (all models + Sonnet separate)
- Monthly limits (if available)
- Time until each quota resets

## Status Indicators

- 🟢 <70% - Healthy
- 🟡 70-90% - Warning
- 🔴 >90% - Critical

## How It Works

Queries `https://api.anthropic.com/api/oauth/usage` using your Claude Code OAuth token (auto-detected from Keychain or `~/.claude/.credentials.json`).

## Requirements

- Python 3.6+
- `requests`: `pip3 install requests`
- Claude Code logged in: `claude auth login`

## See Also

- `npx ccusage blocks` - Token usage (from local logs)
- `npx ccusage daily` - Daily token statistics
