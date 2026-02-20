/**
 * Fix Executor - Execute auto-fix tasks via sessions_spawn
 */

const fs = require('fs').promises;
const path = require('path');

const FIXES_HISTORY_PATH = path.join(__dirname, 'fixes-history.json');

/**
 * Execute fix tasks
 * @param {Array} tasks - Fix tasks from fixer
 * @param {Object} options - { dryRun: bool, autoApprove: bool }
 * @returns {Object} Execution results
 */
async function executeFixes(tasks, options = {}) {
  const { dryRun = true, autoApprove = false } = options;
  
  console.log(`\n🔧 Fix Executor${dryRun ? ' (DRY RUN)' : ''}\n`);
  
  const results = {
    total: tasks.length,
    executed: 0,
    succeeded: 0,
    failed: 0,
    skipped: 0,
    fixes: []
  };

  for (const task of tasks) {
    console.log(`\n📋 Task: ${task.id}`);
    console.log(`   Priority: ${task.priority}`);
    console.log(`   Type: ${task.type}`);
    console.log(`   Description: ${task.description}`);
    console.log(`\n   Strategy:`);
    console.log(`   ${JSON.stringify(task.strategy.action, null, 2)}`);

    if (dryRun) {
      console.log(`\n   ⚠️  DRY RUN - Task not executed`);
      results.skipped++;
      continue;
    }

    // Check if we should execute (manual approval or auto-approve)
    if (!autoApprove) {
      console.log(`\n   ⏸️  Manual approval required (use --auto-approve to skip)`);
      results.skipped++;
      continue;
    }

    // Execute via sessions_spawn
    const fixResult = await executeFixTask(task);
    results.fixes.push(fixResult);
    
    if (fixResult.status === 'success') {
      results.succeeded++;
      console.log(`   ✅ Fix succeeded`);
    } else {
      results.failed++;
      console.log(`   ❌ Fix failed: ${fixResult.error}`);
    }
    
    results.executed++;
  }

  // Save to history
  await saveFixesHistory(results.fixes);

  return results;
}

/**
 * Execute a single fix task via sessions_spawn
 */
async function executeFixTask(task) {
  const startTime = Date.now();
  
  try {
    // Generate fix prompt for the sub-agent
    const fixPrompt = buildFixPrompt(task);
    
    // Note: In actual use, this would call sessions_spawn via OpenClaw
    // For now, we return a mock result structure
    const result = {
      taskId: task.id,
      type: task.type,
      priority: task.priority,
      status: 'pending',
      prompt: fixPrompt,
      startTime,
      endTime: null,
      error: null,
      sessionKey: null // Will be set by sessions_spawn
    };

    // TODO: Replace with actual sessions_spawn call
    // const spawnResult = await sessions_spawn({
    //   task: fixPrompt,
    //   label: `fix-${task.id}`,
    //   cleanup: 'keep',
    //   runTimeoutSeconds: 300
    // });
    // result.sessionKey = spawnResult.sessionKey;

    result.endTime = Date.now();
    result.status = 'success'; // Mock success for now
    
    return result;
    
  } catch (error) {
    return {
      taskId: task.id,
      type: task.type,
      priority: task.priority,
      status: 'failed',
      startTime,
      endTime: Date.now(),
      error: error.message
    };
  }
}

/**
 * Build fix prompt for sessions_spawn
 */
function buildFixPrompt(task) {
  const { type, description, strategy } = task;
  
  let prompt = `# Auto-Fix Task: ${type}\n\n`;
  prompt += `**Problem:** ${description}\n\n`;
  prompt += `**Action Plan:**\n`;
  
  for (const [i, step] of strategy.action.steps.entries()) {
    prompt += `${i + 1}. ${step}\n`;
  }
  
  prompt += `\n**Instructions:**\n`;
  prompt += `- Follow the action plan step by step\n`;
  prompt += `- Document what you did\n`;
  prompt += `- If you encounter issues, explain what went wrong\n`;
  prompt += `- Commit any file changes to git\n`;
  
  return prompt;
}

/**
 * Save fix history to JSON file
 */
async function saveFixesHistory(fixes) {
  if (fixes.length === 0) return;
  
  let history = [];
  
  // Load existing history
  try {
    const data = await fs.readFile(FIXES_HISTORY_PATH, 'utf8');
    history = JSON.parse(data);
  } catch (error) {
    // File doesn't exist yet, start fresh
  }
  
  // Append new fixes
  history.push({
    timestamp: new Date().toISOString(),
    fixes
  });
  
  // Keep only last 100 fix runs
  if (history.length > 100) {
    history = history.slice(-100);
  }
  
  await fs.writeFile(FIXES_HISTORY_PATH, JSON.stringify(history, null, 2));
}

/**
 * Load fix history
 */
async function loadFixesHistory() {
  try {
    const data = await fs.readFile(FIXES_HISTORY_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

module.exports = {
  executeFixes,
  loadFixesHistory,
};
