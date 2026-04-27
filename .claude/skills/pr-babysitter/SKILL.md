---
name: pr-babysitter
description: Monitor CI for the current open PR; if checks fail, read logs, fix the issue, and push — designed to run inside /loop, self-terminates when CI is green.
---

# /pr-babysitter

Watch the CI status of the current open PR. If CI fails, read the logs, fix the issue, commit and push.

## Steps

1. Find the open PR for current branch:
   ```
   gh pr view --json number,url,statusCheckRollup,headRefName
   ```
2. Check CI status:
   - If all checks pass → report "CI green ✓" and stop the loop
   - If checks are pending → report status and schedule next check
   - If checks failed → proceed to step 3

3. For each failed check, get the logs:
   ```
   gh run list --branch <branch> --limit 1 --json databaseId
   gh run view <run-id> --log-failed
   ```

4. Analyze the failure:
   - **TypeScript error** → fix the type issue in the relevant file
   - **Test failure** → read the test output, fix the component or the test
   - **Lint error** → fix the lint issue
   - **Build error** → fix the import/syntax error
   - **Cypress timeout** → check if baseUrl is correct, check if element selectors changed

5. Apply the fix, then:
   - `npm test` — verify unit tests pass locally
   - `/commit` → `/push`

6. Report what was fixed and wait for next CI run

## Rules
- Never disable tests or skip lint to make CI pass
- If the same failure appears 3 times in a row, stop the loop and ask the user
- Max 5 fix attempts per session before escalating
- This skill is designed to run inside `/loop` — it self-terminates when CI is green
