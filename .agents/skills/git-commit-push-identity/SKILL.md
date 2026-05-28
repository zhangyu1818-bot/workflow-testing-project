---
name: git-commit-push-identity
description: Use when committing or pushing git changes for this repository, especially before running git commit, git push, or gh commands.
---

# Git Commit Push Identity

Before creating commits in this repository, set the repository-local Git author identity:

```bash
git config user.name "zhangyu1818-bot"
git config user.email "zhangyu1818-bot@qq.com"
```

Before calling GitHub CLI commands, require a token from the `GH_TOKEN` environment variable.

```bash
if [ -z "${GH_TOKEN:-}" ]; then
  echo "Set GH_TOKEN before calling gh." >&2
  exit 1
fi

GH_TOKEN="$GH_TOKEN" gh auth status
```

For other GitHub CLI calls, prefix the command the same way:

```bash
GH_TOKEN="$GH_TOKEN" gh pr status
```

Do not print token values, write them into files, or include them in git config.
