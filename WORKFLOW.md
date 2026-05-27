---
jira:
  endpoint: https://zhangyu1818.atlassian.net
  auth:
    type: basic_api_token
    email: $JIRA_EMAIL
    api_token: $JIRA_API_KEY
  project_key: FE
  issue_types:
    - Task
    - Bug
    - Story
  candidate_jql: >
    project = FE
    AND labels = workflow-demo
    AND issuetype in (Task, Bug, Story)
    AND status in ("READY FOR DEV", "IN PROGRESS", "REOPENED")
    ORDER BY priority ASC, created ASC
  search_max_results: 20
  active_states:
    - READY FOR DEV
    - IN PROGRESS
    - REOPENED
  paused_states:
    - TO DO
    - CODE REVIEW
    - READY FOR QA
    - QA IN PROGRESS
    - READY FOR INTEGRATION
    - READY FOR REGRESSION
    - REGRESSION IN PROGRESS
    - READY FOR RELEASE
    - BLOCKED
  terminal_states:
    - DONE
    - CANCELLED
  blocked_states:
    - BLOCKED
  blocker_links:
    - name: Blocks
      direction: inward
  claim_state: IN PROGRESS
  handoff_state: CODE REVIEW
  workflow:
    states:
      todo: TO DO
      ready_for_dev: READY FOR DEV
      in_progress: IN PROGRESS
      code_review: CODE REVIEW
      ready_for_qa: READY FOR QA
      qa_in_progress: QA IN PROGRESS
      ready_for_integration: READY FOR INTEGRATION
      ready_for_regression: READY FOR REGRESSION
      regression_in_progress: REGRESSION IN PROGRESS
      ready_for_release: READY FOR RELEASE
      done: DONE
      reopened: REOPENED
      blocked: BLOCKED
      cancelled: CANCELLED
    transitions:
      create: Create
      ready_for_development: Ready for Development
      work_in_progress: Work in Progress
      code_review: Code review
      ready_for_testing: Ready for testing
      testing: Testing
      ready_for_integration: Ready for Integration
      ready_for_regression: Ready for Regression
      regression_in_progress: Regression in Progress
      ready_for_release: Ready for Release
      story_done: Story Done
      reopened: Reopened
      reopen: Reopen
      regression_reopen: Regression in Progress to Reopen
      in_progress: In Progress
      resume: Resume
      restart: Restart

polling:
  interval_ms: 15000

workspace:
  root: ~/.workflow-testing-project/workspaces
  cleanup_on_done: true
  cleanup_on_states:
    - DONE
  source:
    enabled: true
    provider: git
    repo_url: https://github.com/zhangyu1818-bot/workflow-testing-project.git
    remote: origin
    base_ref: main
    branch_template: 'workflow-demo/{{ issue.identifier }}'
    prepare_branch: true
    sync_on_run: true
    depth: null
    submodules: false
    allow_destructive_reset: false

hooks:
  before_run: |
    git status --short
    if command -v pnpm >/dev/null 2>&1 && [ ! -d node_modules ]; then
      pnpm install --frozen-lockfile
    fi
  after_run: |
    git status --short
  before_remove: |
    git status --short
  timeout_ms: 120000

agent:
  max_concurrent_agents: 1
  max_concurrent_agents_by_state:
    'READY FOR DEV': 1
    REOPENED: 1
  max_prompt_turns: 12
  max_retry_backoff_ms: 120000
  claim_on_start: true
  plan_gate:
    enabled: true

mcp:
  enabled: true
  include_jira_rest: true
  servers: []

tools:
  jira_rest:
    enabled: true
    exposure: mcp_stdio
    allowed_methods:
      - GET
      - POST
      - PUT
    allowed_paths:
      - /rest/api/3/issue/*
      - /rest/api/3/issue/*/comment
      - /rest/api/3/issue/*/comment/*
      - /rest/api/3/issue/*/transitions
    current_issue_only: true
    max_request_bytes: 65536
    max_response_bytes: 262144
    redact_fields:
      - Authorization
      - Cookie
      - Set-Cookie
      - api_token
      - bearer_token

automation:
  review:
    enabled: false
  merge:
    enabled: false
  jira_closure:
    enabled: false
  post_pr_state: CODE REVIEW
  post_review_state: READY FOR QA
  done_state: DONE

electron:
  start_orchestrator_on_launch: false
  minimize_to_tray: true
  confirm_before_quit_with_running_agents: true
  log_retention_days: 14
  open_workspace_enabled: true
---

你正在处理 Jira 演示任务 `{{ issue.identifier }}`：{{ issue.title }}。

当前状态：{{ issue.state }}
Jira 链接：{{ issue.url }}
工作区：{{ workspace.path }}
Plan Gate：{{ plan_gate.enabled }}
当前是否规划轮次：{{ plan_gate.isPlanningTurn }}

{% if attempt %}
这是第 {{ attempt }} 次尝试。请复用当前工作区状态，不要重复已经完成的调查和验证。
{% endif %}

{% if workflow.isReopened %}
这是一个重新打开的任务。请先查看已有评论、分支、PR 和验证结果，再决定需要补充什么。
{% endif %}

## 工作原则

1. 全程使用中文汇报。
2. 只在当前准备好的仓库副本里工作，不要重新 clone 仓库，不要修改工作区外的文件。
3. 如果 Plan Gate 处于规划轮次，只允许阅读代码、理解 Jira 描述、输出简洁计划；不要改文件、不要运行会修改状态的命令、不要提交、不要推送、不要创建 PR、不要写 Jira comment、不要转 Jira 状态。
4. 获得 operator 批准后，按计划完成实现、测试、提交、推送、创建 PR、写 Jira comment，并把 Jira 转到 `CODE REVIEW`。
5. 遇到真正阻塞时，只说明阻塞原因、已尝试动作和需要的人类动作；不要假装完成。

## Workpad

所有执行记录都使用 `## Workpad`，标题固定为这个字符串。

Plan Gate 的规划轮次只在回复里给出 Workpad 草案，不写 Jira。批准后，在 Jira 当前 issue 下查找已有 `## Workpad` comment：如果存在，只编辑并更新这一个 comment；如果不存在，创建一个新的 `## Workpad` comment，并在后续步骤持续编辑同一个 comment。不要为同一个 issue 创建多个 Workpad。

Workpad 必须使用这个结构：

````markdown
## Workpad

```text
<hostname>:<abs-path>@<short-sha>
```

### Plan

- [ ] 1. Parent task
  - [ ] 1.1 Child task
  - [ ] 1.2 Child task
- [ ] 2. Parent task

### Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2

### Validation

- [ ] targeted tests: `<command>`

### Notes

- <short progress note with timestamp>

### Confusions

- <only include when something was confusing during execution>
````

填写要求：

- `text` 代码块必须写真实环境 stamp，格式为 `<hostname>:<abs-path>@<short-sha>`。
- `Plan` 使用层级 checklist，完成后及时勾选。
- `Acceptance Criteria` 必须覆盖 Jira 描述里的验收标准。
- `Validation` 必须列出实际运行的命令和结果。
- `Notes` 只写短进展记录，带时间戳。
- `Confusions` 只有在执行过程中确实有困惑时才保留；没有困惑就省略整个小节。

Jira Workpad comment 操作：

- 用 `GET /rest/api/3/issue/{{ issue.identifier }}/comment` 查找包含 `## Workpad` 的 comment。
- 如果找到了，使用 `PUT /rest/api/3/issue/{{ issue.identifier }}/comment/<commentId>` 更新同一个 comment。
- 如果没找到，使用 `POST /rest/api/3/issue/{{ issue.identifier }}/comment` 创建一个 Workpad comment。
- 后续所有进度更新都编辑同一个 comment id。

## 状态流

- `TO DO`：不处理，等待人类手动转到 `READY FOR DEV`。
- `READY FOR DEV`：App 会在启动执行时认领到 `IN PROGRESS`，之后开始实现。
- `IN PROGRESS`：执行代码变更、验证、PR 和交接。
- `CODE REVIEW`：交接完成，等待人类 review。
- `DONE`、`CANCELLED`：终态，不再处理。

## 执行流程

1. 阅读 Jira 描述，确认验收标准和验证要求。
2. 检查仓库状态：
   - `git status --short`
   - `git branch --show-current`
   - `git rev-parse --short HEAD`
3. 查找或创建唯一的 `## Workpad` comment，先写入环境 stamp、Plan、Acceptance Criteria、Validation 和当前 Notes，并记录 comment id。
4. 如果 `node_modules` 不存在，运行 `pnpm install --frozen-lockfile`。
5. 先运行一次相关测试或 `pnpm test -- --run`，编辑同一个 Workpad 记录结果。
6. 用最小代码变更完成任务，并补充或更新测试。
7. 运行 `pnpm test -- --run`，必要时再运行 `pnpm typecheck`（如果项目提供），编辑同一个 Workpad 记录结果。
8. 提交代码，提交信息使用 conventional commit，例如 `fix(pricing): correct discount threshold`。
9. 推送当前分支：
   - 如果存在 `GITHUB_BOT_TOKEN`，先执行 `export GH_TOKEN="$GITHUB_BOT_TOKEN"`。
   - 如果 `gh auth status` 可用，执行 `gh auth setup-git`。
   - 执行 `git push -u origin HEAD`。
10. 创建 PR：

- base 使用 `main`
- title 使用 `{{ issue.identifier }}: {{ issue.title }}`
- body 写明实现摘要、验证命令、风险
- 如果已有当前分支 PR，则更新而不是重复创建

11. 最终编辑同一个 `## Workpad` comment，确保 Plan、Acceptance Criteria、Validation 已勾选，Notes 包含 PR 链接和风险说明。
12. 不要再创建额外完成 comment；最新的 `## Workpad` 就是交接记录。
13. 使用 `jira_rest` 将当前 issue 转到 `CODE REVIEW`。

## Issue 上下文

标题：{{ issue.title }}
标签：{{ issue.labels }}

描述：
{% if issue.description %}
{{ issue.description }}
{% else %}
无描述。
{% endif %}
