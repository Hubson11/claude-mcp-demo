---
name: push
description: Push the current branch to the remote repository, setting upstream if needed.
---

# /push

Push the current branch to the remote repository.

## Steps

1. Detect current branch: `git branch --show-current`
2. Check if remote tracking branch exists: `git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null`
3. If no upstream: `git push -u origin <branch-name>`
4. If upstream exists: `git push`
5. Confirm with: `git log --oneline origin/<branch>..HEAD` (should be empty = all pushed)

## Rules
- Never force push to `main`
- If push is rejected (non-fast-forward), pull with rebase first: `git pull --rebase`
- Report the push result and the remote URL
