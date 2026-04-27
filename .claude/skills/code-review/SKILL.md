---
name: code-review
description: Review the current diff vs main and produce a prioritized list of improvement notes grouped by severity (HIGH/MEDIUM/LOW).
---

# /code-review

Review your own diff and produce a prioritized list of improvement notes.

## Steps

1. Get the diff vs main: `git diff main...HEAD`
2. Analyze the diff for:
   - **Bugs**: logic errors, off-by-one, null/undefined issues
   - **Types**: missing types, `any` usage, incorrect interfaces
   - **Accessibility**: missing ARIA labels, keyboard navigation, color contrast
   - **Performance**: unnecessary re-renders, missing memoization, large imports
   - **Tests**: missing test cases, weak assertions, no edge cases covered
   - **Style**: inconsistent naming, magic numbers, dead code
3. Output a numbered list of notes in this format:
   ```
   [SEVERITY: HIGH|MEDIUM|LOW] file:line — description
   ```
4. Group by severity: HIGH first, then MEDIUM, then LOW
5. Keep each note actionable — describe the fix, not just the problem

## Rules
- Be honest, not diplomatic — this is self-review for quality
- Minimum 3 notes, maximum 15
- Do not flag style issues that are caught by the linter
