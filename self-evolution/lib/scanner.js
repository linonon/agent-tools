/**
 * Session Scanner
 * 掃描 OpenClaw session history，提取錯誤和模式
 */

const ERROR_PATTERNS = [
  { type: 'tool_error', pattern: /"status":\s*"error"/ },
  { type: 'exec_failure', pattern: /Command exited with code \d+/ },
  { type: 'timeout', pattern: /timeout|timed out/i },
  { type: 'network_error', pattern: /network|ECONNREFUSED|ETIMEDOUT/i },
  { type: 'permission_error', pattern: /EACCES|permission denied/i },
  { type: 'not_found', pattern: /ENOENT|not found|No such file/i },
];

/**
 * 掃描 session transcript 找出錯誤
 * @param {string} transcript - Session JSONL 內容
 * @returns {Array} 錯誤清單
 */
function scanForErrors(transcript) {
  const errors = [];
  const lines = transcript.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    try {
      const entry = JSON.parse(line);
      
      // 檢查 tool result 錯誤
      if (entry.type === 'toolResult' && entry.toolResult) {
        const result = entry.toolResult;
        if (result.status === 'error' || result.error) {
          errors.push({
            line: i + 1,
            type: 'tool_error',
            tool: result.tool || 'unknown',
            error: result.error || result.message || 'Unknown error',
            timestamp: entry.timestamp,
          });
        }
      }

      // 檢查 message 中的錯誤模式
      if (entry.type === 'message' && entry.message) {
        const content = JSON.stringify(entry.message);
        
        for (const { type, pattern } of ERROR_PATTERNS) {
          if (pattern.test(content)) {
            errors.push({
              line: i + 1,
              type,
              content: content.substring(0, 200),
              timestamp: entry.timestamp,
            });
            break;
          }
        }
      }
    } catch (e) {
      // 跳過無法解析的行
    }
  }

  return errors;
}

/**
 * 分析錯誤模式
 * @param {Array} errors - 錯誤清單
 * @returns {Object} 統計結果
 */
function analyzePatterns(errors) {
  const stats = {};
  const recentErrors = errors.slice(-50); // 最近 50 個錯誤

  for (const error of recentErrors) {
    const key = error.type;
    if (!stats[key]) {
      stats[key] = {
        count: 0,
        examples: [],
      };
    }
    stats[key].count++;
    if (stats[key].examples.length < 3) {
      stats[key].examples.push({
        tool: error.tool,
        error: error.error || error.content,
      });
    }
  }

  return stats;
}

module.exports = {
  scanForErrors,
  analyzePatterns,
};
