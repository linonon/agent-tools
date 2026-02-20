/**
 * Fixer - Auto-fix strategy engine
 * Generates repair tasks based on error patterns
 */

/**
 * Generate fix tasks from recommendations
 * @param {Array} recommendations - From analyzer
 * @returns {Array} Fix tasks with priority and action plan
 */
function generateFixTasks(recommendations) {
  const tasks = [];

  for (const rec of recommendations) {
    const task = buildFixTask(rec);
    if (task) tasks.push(task);
  }

  return tasks;
}

/**
 * Build a fix task from a recommendation
 */
function buildFixTask(rec) {
  const { type, priority, description, pattern } = rec;

  switch (type) {
    case 'repeated_failure':
      return buildRepeatedFailureTask(rec);
    case 'missing_file':
      return buildMissingFileTask(rec);
    case 'timeout_issue':
      return buildTimeoutTask(rec);
    case 'tool_overuse':
      return buildToolOptimizationTask(rec);
    default:
      return null;
  }
}

/**
 * Fix strategy: Repeated failures (tool_error, exec_failure, etc.)
 */
function buildRepeatedFailureTask(rec) {
  const { pattern } = rec;
  
  // Extract error details
  const errorType = pattern.errors[0]?.type || 'unknown';
  const toolName = extractToolName(pattern.errors[0]);
  const errorMsg = extractErrorMessage(pattern.errors[0]);

  return {
    id: `fix-${Date.now()}-repeated-${errorType}`,
    priority: rec.priority,
    type: 'repeated_failure',
    description: rec.description,
    strategy: {
      errorType,
      toolName,
      errorMsg,
      occurrences: pattern.count,
      action: determineAction(errorType, toolName, errorMsg)
    }
  };
}

/**
 * Fix strategy: Missing file errors
 */
function buildMissingFileTask(rec) {
  const { pattern } = rec;
  const errorMsg = extractErrorMessage(pattern.errors[0]);
  const filePath = extractFilePath(errorMsg);

  return {
    id: `fix-${Date.now()}-missing-file`,
    priority: 'high',
    type: 'missing_file',
    description: rec.description,
    strategy: {
      filePath,
      action: {
        type: 'check_and_create',
        steps: [
          `Check if ${filePath} should exist`,
          `If yes, create with appropriate content`,
          `If no, update code to handle missing file gracefully`
        ]
      }
    }
  };
}

/**
 * Fix strategy: Timeout issues
 */
function buildTimeoutTask(rec) {
  return {
    id: `fix-${Date.now()}-timeout`,
    priority: rec.priority,
    type: 'timeout_issue',
    description: rec.description,
    strategy: {
      action: {
        type: 'optimize_timeout',
        steps: [
          'Identify the slow operation',
          'Consider increasing timeout value',
          'Or optimize the operation itself',
          'Add progress indicators for long operations'
        ]
      }
    }
  };
}

/**
 * Fix strategy: Tool overuse optimization
 */
function buildToolOptimizationTask(rec) {
  return {
    id: `fix-${Date.now()}-tool-optimize`,
    priority: rec.priority,
    type: 'tool_optimization',
    description: rec.description,
    strategy: {
      action: {
        type: 'batch_operations',
        steps: [
          'Identify repeated tool calls',
          'Batch similar operations together',
          'Cache results when appropriate',
          'Use more efficient tool alternatives'
        ]
      }
    }
  };
}

/**
 * Determine specific action based on error details
 */
function determineAction(errorType, toolName, errorMsg) {
  // tool_error + read + ENOENT
  if (errorType === 'tool_error' && toolName === 'read' && errorMsg?.includes('ENOENT')) {
    return {
      type: 'missing_file',
      steps: [
        'Extract file path from error',
        'Check if file should exist',
        'Create file or fix code to handle missing file'
      ]
    };
  }

  // exec_failure
  if (errorType === 'exec_failure') {
    return {
      type: 'exec_debug',
      steps: [
        'Check command syntax',
        'Verify file permissions',
        'Check if required dependencies are installed',
        'Add error handling'
      ]
    };
  }

  // timeout
  if (errorType === 'timeout') {
    return {
      type: 'timeout_fix',
      steps: [
        'Increase timeout value',
        'Optimize the operation',
        'Split into smaller chunks'
      ]
    };
  }

  // Generic fallback
  return {
    type: 'investigate',
    steps: [
      'Analyze error context',
      'Search for similar issues',
      'Test potential solutions',
      'Update code with fix'
    ]
  };
}

/**
 * Extract tool name from error object
 */
function extractToolName(error) {
  if (!error) return 'unknown';
  
  // From toolResult.toolName
  if (error.data?.toolName) return error.data.toolName;
  
  // From error message
  const match = error.message?.match(/"tool":\s*"(\w+)"/);
  return match ? match[1] : 'unknown';
}

/**
 * Extract error message from error object
 */
function extractErrorMessage(error) {
  if (!error) return '';
  
  // Try different paths
  return error.data?.error 
    || error.data?.content?.[0]?.text 
    || error.message 
    || '';
}

/**
 * Extract file path from ENOENT error message
 */
function extractFilePath(errorMsg) {
  // Match: ENOENT: no such file or directory, open '/path/to/file'
  const match = errorMsg.match(/ENOENT:.*?['"](.*?)['"]/);
  return match ? match[1] : 'unknown';
}

module.exports = {
  generateFixTasks,
};
