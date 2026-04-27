---
name: pr
description: Stage all changes, commit, push, and open a GitHub Pull Request with a structured description (Changelog, To Do, Config, How To QA, Notes).
---

# /pr

Stage all changes, commit, push, and open a GitHub Pull Request for the current branch.

## Steps

1. Stage all changes: `git add -A`
2. Get current branch: `git branch --show-current`
3. Get full diff vs main: `git diff main...HEAD`
4. **Commit** with this message format:
   ```
   <branch-name>: <ComponentName or PageName> — <short description of what was done>
   ```
   Example: `feat/product-card: ProductCard — add sale badge and hover state`
   - `<branch-name>` — current git branch
   - `<ComponentName or PageName>` — derived from the changed files
   - `<short description>` — one sentence, what changed and why
5. Push branch to origin: `git push -u origin <branch>`
6. Create PR with `gh pr create --assignee @me`, using the body template below. Infer every section from the diff — write "N/A" only if truly not applicable.
7. Return the PR URL

## PR body template

```markdown
## Changelog
<!-- What was added, changed, or removed. Bullet list. -->

## To Do
<!-- Known follow-ups, missing edge cases, or deferred work. Bullet list. -->

## Config
<!-- Steps required to use this: env vars, feature flags, migrations, package installs. If none: "No config changes required." -->

## How To QA
<!-- Step-by-step for a QA engineer. Include happy path + at least one edge case. -->

## Notes
<!-- Anything not in this PR: known limitations, design decisions, context for reviewers. -->
```

## Rules
- PR must be from a feature branch — never directly from main
- If no changes vs main, stop and report
- Never skip `git add -A` — always stage before committing
