# OpenClaw Custom Skills

自己开发的 OpenClaw skills，独立于 workspace 版本控制。

## Skills

### self-evolution (v0.3.0)
自我进化引擎，分析 OpenClaw 运行历史并自动修复问题。

**功能：**
- Session 分析：扫描对话历史，检测 6 种错误类型
- 模式识别：识别重复问题（3+ 次）
- 智能建议：基于优先级的改进建议
- 自动修复：通过 sessions_spawn 执行修复任务

**使用：**
```bash
cd self-evolution
node index.js analyze          # 分析 session
node index.js fix              # 完整演化周期（dry-run）
node index.js fix --execute    # 执行修复
node index.js history          # 查看修复历史
```

### claude-quota (v1.0.0)
查询 Anthropic OAuth API，显示 Claude Code 订阅配额使用情况。

**功能：**
- 自动检测 OAuth token（Keychain / credentials file）
- 查询真实 API 数据（非本地估算）
- 显示 5 小时周期、每周、每月配额
- 彩色状态指示（🟢/🟡/🔴）
- 倒计时显示重置时间

**使用：**
```bash
cd claude-quota
python3 quota.py         # 查看配额
python3 quota.py --debug # 显示原始 API 响应
```

## 安装到 OpenClaw

Skills 通过软链接安装到 OpenClaw workspace：

```bash
ln -s /Users/ononlin/Workspace/myself/skills/self-evolution ~/.openclaw/workspace/skills/
ln -s /Users/ononlin/Workspace/myself/skills/claude-quota ~/.openclaw/workspace/skills/
```

## 开发

每个 skill 目录包含：
- `SKILL.md` - OpenClaw skill 描述（元数据 + 完整文档）
- `README.md` - 快速参考
- `package.json` - Metadata
- 主脚本/代码

## Git Workflow

```bash
# 在 skills repo 中开发
cd /Users/ononlin/Workspace/myself/skills
git add .
git commit -m "..."

# OpenClaw workspace 自动反映变更（symlink）
cd ~/.openclaw/workspace
# 无需额外操作，链接自动生效
```

## License

MIT
