#!/bin/bash
# 自动化测试 stop-notify hooks

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PASS=0
FAIL=0

pass() { PASS=$((PASS + 1)); echo "  PASS: $1"; }
fail() { FAIL=$((FAIL + 1)); echo "  FAIL: $1"; }

echo "=== Testing session-start.sh ==="

# Test 1: 正常写入 UUID 文件
echo '{"session_id":"test-auto-1"}' | "$SCRIPT_DIR/session-start.sh"
if [ -f /tmp/claude-stop-notify-test-auto-1 ]; then
  UUID=$(cat /tmp/claude-stop-notify-test-auto-1)
  if [[ "$UUID" =~ ^[A-F0-9-]+$ ]]; then
    pass "session-start writes valid UUID"
  else
    fail "session-start wrote invalid UUID: $UUID"
  fi
  rm -f /tmp/claude-stop-notify-test-auto-1
else
  fail "session-start did not create UUID file"
fi

# Test 2: 空 session_id 应跳过
echo '{"session_id":""}' | "$SCRIPT_DIR/session-start.sh"
if [ ! -f "/tmp/claude-stop-notify-" ]; then
  pass "session-start skips empty session_id"
else
  fail "session-start created file for empty session_id"
  rm -f "/tmp/claude-stop-notify-"
fi

echo ""
echo "=== Testing stop-notify.sh ==="

# Test 3: stop_hook_active=true 应跳过
echo '{"stop_hook_active":true,"session_id":"test-auto-3","cwd":"/tmp","last_assistant_message":"hi"}' | "$SCRIPT_DIR/stop-notify.sh"
if [ ! -f /tmp/claude-focus-test-auto-3.sh ]; then
  pass "stop-notify skips when stop_hook_active=true"
else
  fail "stop-notify did not skip stop_hook_active=true"
  rm -f /tmp/claude-focus-test-auto-3.sh
fi

# Test 4: agent_type 存在应跳过
echo '{"stop_hook_active":false,"session_id":"test-auto-4","cwd":"/tmp","last_assistant_message":"hi","agent_type":"subagent"}' | "$SCRIPT_DIR/stop-notify.sh"
if [ ! -f /tmp/claude-focus-test-auto-4.sh ]; then
  pass "stop-notify skips subagent"
else
  fail "stop-notify did not skip subagent"
  rm -f /tmp/claude-focus-test-auto-4.sh
fi

# Test 5: 有 UUID 文件时生成 focus 脚本 (使用合法 UUID 格式)
echo "AAAAAAAA-BBBB-CCCC-DDDD-EEEEEEEEEEEE" > /tmp/claude-stop-notify-test-auto-5
echo '{"stop_hook_active":false,"session_id":"test-auto-5","cwd":"/tmp/myproject","last_assistant_message":"done"}' | "$SCRIPT_DIR/stop-notify.sh"
sleep 0.2
if [ -f /tmp/claude-focus-test-auto-5.sh ]; then
  if grep -q "AAAAAAAA-BBBB-CCCC-DDDD-EEEEEEEEEEEE" /tmp/claude-focus-test-auto-5.sh; then
    pass "stop-notify generates focus script with correct UUID"
  else
    fail "focus script does not contain expected UUID"
  fi
  rm -f /tmp/claude-focus-test-auto-5.sh
else
  fail "stop-notify did not generate focus script"
fi
# 杀掉后台 terminal-notifier
pkill -f "terminal-notifier.*test-auto-5" 2>/dev/null
rm -f /tmp/claude-stop-notify-test-auto-5

# Test 6: 无 UUID 文件时不生成 focus 脚本 (降级路径)
rm -f /tmp/claude-stop-notify-test-auto-6
echo '{"stop_hook_active":false,"session_id":"test-auto-6","cwd":"/tmp/myproject","last_assistant_message":"done"}' | "$SCRIPT_DIR/stop-notify.sh"
sleep 0.2
if [ ! -f /tmp/claude-focus-test-auto-6.sh ]; then
  pass "stop-notify degrades without UUID file (no focus script)"
else
  fail "stop-notify generated focus script without UUID file"
  rm -f /tmp/claude-focus-test-auto-6.sh
fi
pkill -f "terminal-notifier.*test-auto-6" 2>/dev/null

echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="
[ "$FAIL" -eq 0 ] && exit 0 || exit 1
