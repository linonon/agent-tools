/**
 * Pattern Detection
 * 偵測重複的問題模式和改進機會
 */

/**
 * 偵測重複的工具錯誤
 * @param {Array} errors - 錯誤清單
 * @returns {Array} 重複模式
 */
function detectRepeatedErrors(errors) {
  const patterns = new Map();
  
  for (const error of errors) {
    const key = `${error.type}:${error.tool || 'unknown'}`;
    if (!patterns.has(key)) {
      patterns.set(key, {
        type: error.type,
        tool: error.tool,
        count: 0,
        examples: [],
      });
    }
    
    const pattern = patterns.get(key);
    pattern.count++;
    if (pattern.examples.length < 3) {
      pattern.examples.push(error);
    }
  }
  
  // 只返回出現 3 次以上的模式
  return Array.from(patterns.values())
    .filter(p => p.count >= 3)
    .sort((a, b) => b.count - a.count);
}

/**
 * 偵測工具使用過於頻繁
 * @param {string} transcript - Session JSONL 內容
 * @returns {Object} 工具使用統計
 */
function detectToolOveruse(transcript) {
  const toolCounts = {};
  const lines = transcript.split('\n');
  
  for (const line of lines) {
    if (!line.trim()) continue;
    
    try {
      const entry = JSON.parse(line);
      
      if (entry.type === 'message' && entry.message?.role === 'assistant') {
        const content = entry.message.content;
        if (Array.isArray(content)) {
          for (const item of content) {
            if (item.type === 'toolCall') {
              const tool = item.name;
              toolCounts[tool] = (toolCounts[tool] || 0) + 1;
            }
          }
        }
      }
    } catch (e) {
      // Skip invalid lines
    }
  }
  
  return toolCounts;
}

/**
 * 建議改進措施
 * @param {Array} repeatedErrors - 重複錯誤
 * @param {Object} toolStats - 工具統計
 * @returns {Array} 建議清單
 */
function generateRecommendations(repeatedErrors, toolStats) {
  const recommendations = [];
  
  // 針對重複錯誤的建議
  for (const pattern of repeatedErrors) {
    if (pattern.type === 'exec_failure') {
      recommendations.push({
        priority: 'high',
        category: 'reliability',
        issue: `命令執行失敗重複 ${pattern.count} 次`,
        suggestion: '考慮增加錯誤處理或 retry 機制',
        examples: pattern.examples.slice(0, 2),
      });
    }
    
    if (pattern.type === 'timeout') {
      recommendations.push({
        priority: 'medium',
        category: 'performance',
        issue: `Timeout 發生 ${pattern.count} 次`,
        suggestion: '增加 timeout 時間或優化執行速度',
        examples: pattern.examples.slice(0, 2),
      });
    }
    
    if (pattern.type === 'not_found') {
      recommendations.push({
        priority: 'high',
        category: 'configuration',
        issue: `檔案/路徑找不到重複 ${pattern.count} 次`,
        suggestion: '檢查檔案路徑設定或建立缺少的檔案',
        examples: pattern.examples.slice(0, 2),
      });
    }
  }
  
  // 針對工具過度使用的建議
  const toolThreshold = 50; // 超過 50 次視為過度使用
  for (const [tool, count] of Object.entries(toolStats)) {
    if (count > toolThreshold) {
      recommendations.push({
        priority: 'low',
        category: 'optimization',
        issue: `${tool} 工具使用了 ${count} 次`,
        suggestion: '考慮批次處理或快取結果以減少重複呼叫',
      });
    }
  }
  
  return recommendations;
}

module.exports = {
  detectRepeatedErrors,
  detectToolOveruse,
  generateRecommendations,
};
