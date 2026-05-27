# Workflow Testing Project 演示项目

这个目录用于演示真实 Jira -> ACP -> GitHub PR 流程。

## 组成

- `WORKFLOW.md`：添加到 App 的项目配置，使用真实 Jira、真实 ACP、真实 Git workspace source。
- `src/`：演示用业务代码。
- `tests/`：演示用 Vitest 测试。
- App 仓库里的 `scripts/seed-demo-jira.mjs`：清理并创建演示 Jira tickets。

## 常用命令

```bash
pnpm install
pnpm test -- --run
pnpm typecheck
```

## 代码目录

- `src/pricing.ts`：购物车金额、折扣和免邮逻辑。
- `src/inventory.ts`：库存状态和补货建议。
- `src/order-summary.ts`：订单摘要文案。

## 推荐演示路径

1. 确认环境变量：

   ```bash
   export JIRA_EMAIL="你的 Jira 邮箱"
   export JIRA_API_KEY="你的 Jira API token"
   export GITHUB_BOT_TOKEN="zhangyu1818-bot 的 GitHub token"
   ```

2. 创建演示 tickets：

   ```bash
   pnpm demo:jira:seed --apply
   ```

   默认只删除带 `workflow-demo` label 的旧演示票，然后创建新票。不要在演示前手动转状态，保持新票在 `TO DO`。

3. 在 App 中添加项目：
   - Project name: `Workflow Testing Project`
   - Jira project key: `FE`
   - Workflow path: 本目录下的 `WORKFLOW.md`

4. 演示时在 Jira 里手动把其中一个 ticket 从 `TO DO` 转到 `READY FOR DEV`。

5. 回到 App，触发 Poll 或等待轮询：
   - App 会认领 ticket 到 `IN PROGRESS`
   - ACP 先产出 plan，等待你批准
   - 批准后 agent 修改代码、跑测试、提交、推送分支、创建 PR、写 Jira comment
   - 完成后通过 `jira_rest` 把 ticket 转到 `CODE REVIEW`

## 如果真的要清空整个 Jira 项目

默认脚本不会清空整个项目。必须显式执行：

```bash
pnpm demo:jira:seed --apply --delete-scope=project --i-understand-this-deletes-all-project-issues
```

这会删除 `WORKFLOW_DEMO_JIRA_PROJECT_KEY` 指定项目下搜索到的所有 issue。默认项目 key 是 `FE`。
