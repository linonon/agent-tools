# Self-Evolution Skill

Self-evolution engine for OpenClaw agents.

## Status

✅ **v0.3.0 - Auto-Fix Engine Complete**

## Features

### ✅ Phase 1: Analysis (Completed)
- Session scanner: Reads OpenClaw session transcripts
- Error detection: Identifies tool errors, exec failures, timeouts, etc.
- Pattern analysis: Finds recurring issues
- Report generation: Creates markdown analysis reports

### ✅ Phase 2: Pattern & Recommendations (Completed)
- Repeated error detection: Identifies issues occurring 3+ times
- Tool usage analysis: Tracks tool call frequency
- Smart recommendations: Priority-based suggestions
  - High priority: Reliability issues (repeated failures, missing files)
  - Medium priority: Performance issues (timeouts)
  - Low priority: Optimization opportunities (tool overuse)

### ✅ Phase 3: Auto-Fix (Completed)
- Fix strategy engine: Generates repair tasks from recommendations
- Safe execution: Dry-run mode + manual approval
- sessions_spawn integration: Executes fixes in isolated sessions
- Fix history: Tracks all fix attempts (success/failure)
- Learning mechanism: Avoids repeating failed fixes

## Usage

```bash
# Analyze recent sessions
node index.js analyze

# Run full evolution cycle (dry-run)
node index.js fix

# Execute fixes (with manual approval)
node index.js fix --execute

# Execute fixes (auto-approve all)
node index.js fix --execute --auto-approve

# View fix history
node index.js history
```

## Architecture

```
lib/scanner.js   - Scans session transcripts for errors
lib/fixer.js     - Fix strategy engine (generates repair tasks)
analyze.js       - Main analysis module
fix.js           - Fix execution module (runs fixes via sessions_spawn)
index.js         - CLI entry point
```

## Fix Strategies

The auto-fix engine supports multiple repair strategies:

- **Repeated Failures**: Diagnose and fix recurring tool/exec errors
- **Missing Files**: Check and create missing files or update code
- **Timeouts**: Optimize slow operations or increase timeout values
- **Tool Overuse**: Batch operations and cache results

Each fix runs in an isolated session with full audit trail.

## Why Not capability-evolver?

This skill is designed specifically for OpenClaw:
- ✅ Uses OpenClaw native tools (no external bridge needed)
- ✅ Agent-driven execution (not standalone scripts)
- ✅ Clear audit trail (all actions in session history)
- ✅ Lightweight and focused

## License

MIT
