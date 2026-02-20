---
name: claude-quota
description: Check Claude Code subscription quota via Anthropic OAuth API. Shows 5-hour cycle, weekly, and monthly usage with reset times. Use when you need to check remaining quota or plan usage.
---

# Claude Quota Checker

Query Anthropic OAuth API to check your Claude Code subscription usage.

## Quick Start

```bash
cd ~/.openclaw/workspace/skills/claude-quota
python3 quota.py
```

## What It Shows

- **5-Hour Cycle**: Current session usage (resets every 5 hours)
- **Weekly (All Models)**: Usage across all models (resets Monday)
- **Weekly (Sonnet)**: Sonnet-specific usage
- **Monthly Limit**: Monthly quota (if available)
- **Extra Usage**: Additional credits (if enabled)

## Output Example

```
🦞 Claude Code Quota Checker

🟢 5-Hour Cycle          42.0%  Resets in 3h 52m
🟢 Weekly (All Models)    9.0%  Resets in 5d 23h 52m
🟢 Weekly (Sonnet)       11.0%  Resets in 5d 20h 52m
```

## Status Icons

- 🟢 Green: Healthy (<70% used)
- 🟡 Yellow: Warning (70-90% used)
- 🔴 Red: Critical (>90% used)

## Options

```bash
# Standard output
python3 quota.py

# Debug mode (show raw API response)
python3 quota.py --debug
```

## How It Works

1. **Detects OAuth token** from:
   - macOS Keychain: `Claude Code-credentials`
   - Linux keyring: `secret-tool`
   - Credentials file: `~/.claude/.credentials.json`

2. **Queries Anthropic API**:
   - Endpoint: `https://api.anthropic.com/api/oauth/usage`
   - Headers: `Authorization: Bearer <token>`, `anthropic-beta: oauth-2025-04-20`

3. **Parses response**:
   - `utilization`: Usage percentage (0-100)
   - `resets_at`: Next reset time (ISO 8601)
   - `is_enabled`: Whether quota is active

## Requirements

- Python 3.6+
- `requests` library: `pip3 install requests`
- Claude Code installed and authenticated

## vs ccusage

| Tool | Data Source | Shows |
|------|-------------|-------|
| **claude-quota** | Anthropic API | Subscription quota (hours/percentage) |
| **ccusage** | Local JSONL files | Token usage (input/output/cost) |

Use both:
- `python3 quota.py` → "Am I running out of quota?"
- `npx ccusage blocks` → "How many tokens did I use?"

## Troubleshooting

**Error: Could not find token**
- Make sure Claude Code is installed: `which claude`
- Login: `claude auth login`
- Check credentials exist: `ls ~/.claude/.credentials.json`

**Error: Unauthorized (401)**
- Token expired, re-login: `claude auth login`

**Error: requests library not found**
- Install: `pip3 install requests`

## When to Use

- Before starting a long coding session (check remaining quota)
- After heavy usage (verify you're not hitting limits)
- Planning work (see when quota resets)
- Debugging throttling issues

## Integration Ideas

- Add to HEARTBEAT.md (periodic quota checks)
- Cron job: alert when quota >80%
- Pre-commit hook: check quota before long operations
- Dashboard: combine with ccusage for full visibility
