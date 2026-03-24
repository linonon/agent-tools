#!/bin/bash
# Claude Code Stop hook
# 发送 macOS 通知, 点击跳转到对应 Ghostty tab

command -v terminal-notifier >/dev/null 2>&1 || exit 0
command -v jq >/dev/null 2>&1 || exit 0

INPUT=$(cat)
STOP_ACTIVE=$(echo "$INPUT" | jq -r '.stop_hook_active')
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // empty')
CWD=$(echo "$INPUT" | jq -r '.cwd // empty')
MESSAGE=$(echo "$INPUT" | jq -r '.last_assistant_message // empty')

# 防无限循环
[ "$STOP_ACTIVE" = "true" ] && exit 0

# 跳过 subagent
AGENT_TYPE=$(echo "$INPUT" | jq -r '.agent_type // empty')
[ -n "$AGENT_TYPE" ] && exit 0

# 读取 SessionStart 时记录的 terminal UUID
UUID_FILE="/tmp/claude-stop-notify-${SESSION_ID}"
TERMINAL_UUID=""
if [ -f "$UUID_FILE" ]; then
  TERMINAL_UUID=$(cat "$UUID_FILE")
  rm -f "$UUID_FILE"
fi

PROJECT=$(basename "$CWD")
# 去换行, 去双引号/反引号 (防 shell 注入), 截取 80 字
BODY=$(echo "$MESSAGE" | tr '\n' ' ' | tr -d '"\`' | cut -c1-80)

if [ -n "$TERMINAL_UUID" ]; then
  # 写临时 focus 脚本, 避免引号嵌套
  FOCUS_SCRIPT="/tmp/claude-focus-${SESSION_ID}.sh"
  cat > "$FOCUS_SCRIPT" << SCRIPT
#!/bin/bash
osascript -e 'tell application "Ghostty"' \
  -e 'activate' \
  -e 'focus (first terminal whose id is "${TERMINAL_UUID}")' \
  -e 'end tell'
rm -f "\$0"
SCRIPT
  chmod +x "$FOCUS_SCRIPT"

  # 后台运行, 不阻塞 hook
  terminal-notifier \
    -title "Claude Code - ${PROJECT}" \
    -message "${BODY}" \
    -group "${SESSION_ID}" \
    -execute "$FOCUS_SCRIPT" &
else
  # 降级: 只激活 Ghostty, 不指定 tab
  terminal-notifier \
    -title "Claude Code - ${PROJECT}" \
    -message "${BODY}" \
    -group "${SESSION_ID}" \
    -activate "com.mitchellh.ghostty" &
fi

exit 0
