# /review-fixer

Read code-review notes, judge which are valid and worth fixing, apply the fixes.

## Steps

1. Read the code-review notes from the previous `/code-review` output
2. For each note, judge validity:
   - **Apply**: clear bug, missing type, accessibility issue, or failing test
   - **Skip**: subjective style preference, out of scope, debatable optimization
3. For each note marked Apply:
   - Read the relevant file
   - Apply the fix
   - Verify it doesn't break surrounding code
4. Run tests to confirm nothing broke: `npm test`
5. Report: list of applied fixes and list of skipped notes with reason

## Rules
- Don't apply fixes that change component behavior without tests covering the new behavior
- If a fix is complex (>20 lines changed), stop and ask the user before proceeding
- After all fixes, run `npm run lint` and ensure it passes
