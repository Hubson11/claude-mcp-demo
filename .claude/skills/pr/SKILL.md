# /pr

Create a GitHub Pull Request for the current branch.

## Steps

1. Get current branch: `git branch --show-current`
2. Get commits vs main: `git log --oneline main..HEAD`
3. Get full diff: `git diff main...HEAD`
4. Draft PR title (max 70 chars) and body based on the changes
5. Create PR:
   ```
   gh pr create --title "<title>" --body "$(cat <<'EOF'
   ## Summary
   <bullet points of what changed>

   ## Test plan
   - [ ] Unit tests pass (`npm test`)
   - [ ] Build succeeds (`npm run build`)
   - [ ] E2E tests pass (`npm run cy:run`)

   ## Screenshots
   <!-- Add before/after if UI change -->
   EOF
   )"
   ```
6. Return the PR URL

## Rules
- PR must be from a feature branch, never directly from main
- If no changes vs main, stop and report
- Assign to current git user: add `--assignee @me`
