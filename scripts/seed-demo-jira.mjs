const DEFAULT_ENDPOINT = 'https://zhangyu1818.atlassian.net'
const DEFAULT_PROJECT_KEY = 'FE'
const DEMO_LABEL = 'workflow-demo'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const parseArgs = (argv) => {
  const args = {
    apply: false,
    deleteScope: 'demo-label',
    issueCount: 4,
    confirmProjectDelete: false,
  }
  for (const arg of argv) {
    if (arg === '--') continue
    if (arg === '--apply') args.apply = true
    else if (arg === '--i-understand-this-deletes-all-project-issues') {
      args.confirmProjectDelete = true
    } else if (arg.startsWith('--delete-scope=')) {
      args.deleteScope = arg.slice('--delete-scope='.length)
    } else if (arg.startsWith('--issue-count=')) {
      args.issueCount = Number(arg.slice('--issue-count='.length))
    } else {
      throw new Error(`Unknown argument: ${arg}`)
    }
  }
  return args
}

const requireEnv = (name) => {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is required`)
  return value
}

const adf = (text) => ({
  type: 'doc',
  version: 1,
  content: text.split('\n\n').map((paragraph) => ({
    type: 'paragraph',
    content: paragraph
      .split('\n')
      .flatMap((line, index) =>
        index === 0
          ? [{ type: 'text', text: line }]
          : [{ type: 'hardBreak' }, { type: 'text', text: line }],
      ),
  })),
})

const buildClient = ({ endpoint, email, apiToken }) => {
  const request = async (pathname, init = {}) => {
    const token = Buffer.from(`${email}:${apiToken}`, 'utf8').toString('base64')
    const response = await fetch(`${endpoint}${pathname}`, {
      ...init,
      headers: {
        Authorization: `Basic ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(init.headers ?? {}),
      },
    })
    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new Error(
        `Jira ${init.method ?? 'GET'} ${pathname} failed ${response.status}: ${text}`,
      )
    }
    if (response.status === 204) return null
    return response.json()
  }

  const search = async (jql) => {
    const out = []
    let nextPageToken = null
    let startAt = null
    let useLegacy = false
    while (true) {
      const body = {
        jql,
        maxResults: 100,
        fields: ['summary', 'status', 'labels'],
      }
      if (useLegacy) body.startAt = startAt ?? 0
      else if (nextPageToken) body.nextPageToken = nextPageToken
      let result
      try {
        result = await request('/rest/api/3/search/jql', {
          method: 'POST',
          body: JSON.stringify(body),
        })
      } catch (error) {
        if (!String(error.message).includes('failed 410')) throw error
        useLegacy = true
        result = await request('/rest/api/3/search', {
          method: 'POST',
          body: JSON.stringify({ ...body, startAt: startAt ?? 0 }),
        })
      }
      out.push(...(result.issues ?? []))
      if (useLegacy) {
        startAt = out.length
        if (out.length >= (result.total ?? out.length)) break
      } else {
        nextPageToken = result.nextPageToken ?? null
        if (!nextPageToken || result.isLast === true) break
      }
      if ((result.issues ?? []).length === 0) break
    }
    return out
  }

  const deleteIssue = async (key) =>
    request(`/rest/api/3/issue/${encodeURIComponent(key)}`, {
      method: 'DELETE',
    })

  const createIssue = async ({ projectKey, summary, description }) =>
    request('/rest/api/3/issue', {
      method: 'POST',
      body: JSON.stringify({
        fields: {
          project: { key: projectKey },
          summary,
          issuetype: { name: 'Task' },
          labels: [DEMO_LABEL],
          description: adf(description),
        },
      }),
    })

  return { createIssue, deleteIssue, search }
}

const demoIssues = [
  {
    summary: '[Workflow Demo] 调整免邮门槛为 99 美元以上',
    description: `背景
演示仓库里的购物车免邮规则现在按 100 美元判断。业务希望 99 美元及以上就免邮，低于 99 美元仍收取 7.99 美元运费。

验收标准
- 修改 src/pricing.ts 的免邮逻辑。
- 补充或更新 pricing 测试，覆盖 98.99、99.00、100.00 美元三个边界。
- 运行 pnpm test -- --run，并在 PR/Jira comment 里记录结果。`,
  },
  {
    summary: '[Workflow Demo] 库存等于补货阈值时也标记为 low_stock',
    description: `背景
当前库存逻辑只有 onHand 小于 reorderPoint 才认为需要补货。运营规则调整为 onHand 等于 reorderPoint 时也应该进入 low_stock。

验收标准
- 修改 src/inventory.ts。
- 补充测试覆盖 onHand === reorderPoint 的场景。
- 确保 out_of_stock 的优先级仍高于 low_stock。
- 运行 pnpm test -- --run。`,
  },
  {
    summary: '[Workflow Demo] 订单摘要增加商品数量行',
    description: `背景
客服希望订单摘要中可以直接看到商品总数，减少打开明细页的次数。

验收标准
- 扩展 src/order-summary.ts 的输入结构，支持 itemCount。
- buildOrderSummary 输出中增加 Item count: N。
- 更新现有测试并补充 itemCount 的断言。
- 运行 pnpm test -- --run。`,
  },
  {
    summary: '[Workflow Demo] 新增 VIP15 优惠码',
    description: `背景
市场活动需要一个 VIP15 优惠码。规则是对商品小计打 15% 折扣，折扣金额四舍五入到分，不能超过小计。

验收标准
- 修改 src/pricing.ts 的优惠码逻辑。
- 新增 VIP15 测试，覆盖大小写不敏感和空白字符 trim。
- 保持 DEMO10 和 WELCOME5 行为不变。
- 运行 pnpm test -- --run。`,
  },
]

const main = async () => {
  const args = parseArgs(process.argv.slice(2))
  if (!['demo-label', 'project'].includes(args.deleteScope)) {
    throw new Error('--delete-scope must be demo-label or project')
  }
  if (!Number.isInteger(args.issueCount) || args.issueCount < 1) {
    throw new Error('--issue-count must be a positive integer')
  }
  if (args.deleteScope === 'project' && !args.confirmProjectDelete) {
    throw new Error(
      'Refusing project-wide delete without --i-understand-this-deletes-all-project-issues',
    )
  }

  const endpoint = process.env.WORKFLOW_DEMO_JIRA_ENDPOINT ?? DEFAULT_ENDPOINT
  const projectKey =
    process.env.WORKFLOW_DEMO_JIRA_PROJECT_KEY ?? DEFAULT_PROJECT_KEY
  const email = process.env.WORKFLOW_DEMO_JIRA_EMAIL ?? requireEnv('JIRA_EMAIL')
  const apiToken = requireEnv('JIRA_API_KEY')
  const client = buildClient({ endpoint, email, apiToken })
  const deleteJql =
    args.deleteScope === 'project'
      ? `project = ${projectKey} ORDER BY created ASC`
      : `project = ${projectKey} AND labels = ${DEMO_LABEL} ORDER BY created ASC`
  const existing = await client.search(deleteJql)
  const selectedIssues = demoIssues.slice(0, args.issueCount)

  console.log(
    JSON.stringify(
      {
        apply: args.apply,
        endpoint,
        projectKey,
        deleteScope: args.deleteScope,
        existingCount: existing.length,
        createCount: selectedIssues.length,
        existingKeys: existing.map((issue) => issue.key),
      },
      null,
      2,
    ),
  )

  if (!args.apply) {
    console.log(
      'Dry run only. Re-run with --apply to delete/create Jira issues.',
    )
    return
  }

  for (const issue of existing) {
    await client.deleteIssue(issue.key)
    console.log(`deleted ${issue.key}`)
    await sleep(300)
  }

  const created = []
  for (const issue of selectedIssues) {
    const result = await client.createIssue({ projectKey, ...issue })
    created.push(result.key)
    console.log(`created ${result.key}`)
    await sleep(300)
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        created,
        nextStep:
          'Move one or more created Jira issues from TO DO to READY FOR DEV during the demo.',
      },
      null,
      2,
    ),
  )
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
