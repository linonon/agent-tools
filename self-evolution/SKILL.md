---
name: self-evolution
description: Self-evolution engine for OpenClaw. Analyzes runtime history, detects recurring errors, generates smart recommendations, and auto-fixes issues via sessions_spawn. Use when you want to review errors, identify patterns, or automatically improve system reliability.
---

# Self-Evolution

Analyze your OpenClaw runtime and improve systematically.

## Quick Start

### Analyze Only
```bash
cd ~/.openclaw/workspace/skills/self-evolution
node index.js analyze
```

Scans session history, detects errors, finds patterns, generates report.

### Full Evolution Cycle (Dry-Run)
```bash
node index.js fix
```

Runs: analyze → generate recommendations → create fix tasks → show execution plan (no actual changes).

### Execute Fixes
```bash
# With manual approval
node index.js fix --execute

# Auto-approve all
node index.js fix --execute --auto-approve
```

### View History
```bash
node index.js history
```

## Status

✅ **v0.3.0 - Auto-Fix Complete**

- ✅ Phase 1: Error detection and pattern analysis
- ✅ Phase 2: Smart recommendations (priority-based)
- ✅ Phase 3: Auto-fix engine with sessions_spawn

## How It Works

### 1. Analysis
Scans session transcripts for:
- tool_error (read, exec, etc.)
- exec_failure
- timeout
- network_error
- permission_error
- not_found

### 2. Pattern Detection
Identifies recurring issues:
- Errors occurring 3+ times
- Tool overuse patterns
- Missing file errors

### 3. Recommendations
Generates priority-based suggestions:
- **High**: Reliability issues (repeated failures, missing files)
- **Medium**: Performance (timeouts)
- **Low**: Optimizations (tool batching)

### 4. Auto-Fix
Executes repairs via sessions_spawn:
- Each fix runs in isolated session
- Full audit trail in session history
- Dry-run mode for safety
- Manual/auto approval modes
- Fix history tracking

## Fix Strategies

| Error Type | Strategy |
|------------|----------|
| Repeated tool_error | Debug tool usage, check parameters |
| Missing files (ENOENT) | Check if file should exist, create or handle gracefully |
| exec_failure | Check syntax, permissions, dependencies |
| Timeouts | Increase timeout or optimize operation |
| Tool overuse | Batch operations, cache results |

## Safety

- **Dry-run default**: No changes unless `--execute` flag
- **Manual approval**: Review each fix before execution (unless `--auto-approve`)
- **Isolated sessions**: All fixes run via sessions_spawn (full isolation)
- **History tracking**: All attempts logged to `fixes-history.json`
- **Rollback-ready**: Each fix is a separate session (can inspect/revert)

## When to Use

- After deploying new features (check for regressions)
- Daily/weekly maintenance (automated via cron)
- When you notice repeated errors in logs
- Before major updates (establish baseline)
- As part of CI/CD pipeline (future integration)

## Output

### Analysis Report
Markdown report saved to `analysis-report.md`:
- Error summary by type
- Tool usage statistics
- Recommendations with priority
- Pattern details

### Fix History
JSON log in `fixes-history.json`:
- Timestamp of each run
- Tasks executed
- Success/failure status
- Error messages
- Execution time

## Future Enhancements

- Integration with OpenClaw cron (scheduled self-checks)
- Machine learning from fix success rates
- Cross-session pattern detection
- Proactive suggestions based on code changes
- Integration with external monitoring tools
