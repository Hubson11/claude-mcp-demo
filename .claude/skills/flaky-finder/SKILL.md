# /flaky-finder

Scan GitHub Actions run history to detect flaky tests, then create a GitHub Issue documenting them.

## Steps

1. Get the last 20 workflow runs on main:
   ```
   gh run list --branch main --limit 20 --json databaseId,conclusion,createdAt,name
   ```

2. For each failed run, fetch the failed step logs:
   ```
   gh run view <run-id> --log-failed
   ```

3. Identify flaky patterns — a test is flaky if:
   - The same test name appears as failed in some runs but passed in others
   - Error message contains: `Timeout`, `AssertionError`, `ETIMEDOUT`, `cy.get() timed out`
   - The failure is not consistent (not every run)

4. Build a flaky test report:
   - Test name / file
   - How many times it failed vs passed (out of 20 runs)
   - Sample error message
   - Affected workflow job

5. Create a GitHub Issue:
   ```
   gh issue create \
     --title "Flaky tests detected in CI" \
     --label "flaky-test,ci" \
     --body "$(cat <<'EOF'
   ## Flaky Tests Report
   Generated: <date>

   | Test | Failures/20 runs | Error pattern |
   |------|-----------------|---------------|
   <table rows>

   ## Recommended fixes
   <per-test suggestions>

   ## Raw evidence
   <links to specific failed runs>
   EOF
   )"
   ```

6. Return the issue URL

## Rules
- Only report tests with at least 2 failures in 20 runs (single flake may be infrastructure noise)
- If no flaky tests found, report "No flaky tests detected in last 20 runs" and do not create an issue
- Link directly to the GitHub Actions run where each failure was observed
