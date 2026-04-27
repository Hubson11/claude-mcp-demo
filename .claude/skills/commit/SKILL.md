---
name: commit
description: Stage and commit all changes with a well-formatted conventional commit message (feat/fix/test/refactor/chore/docs prefix, imperative mood, max 72 chars).
---

# /commit

Create a well-formatted git commit for all staged and unstaged changes.

## Steps

1. Run `git status` to see what changed
2. Run `git diff` to understand the changes
3. Stage relevant changes by file: `git add src/components/Foo.tsx src/locales/en.json` (never `git add .` blindly, never add .env or secrets)
4. Write a commit message following the format:
   - First line: imperative mood, max 72 chars, e.g. `feat: implement ProductCard component`
   - Use prefixes: `feat:`, `fix:`, `test:`, `refactor:`, `chore:`, `docs:`
   - Body (optional): what changed and why, not how
5. Commit: `git commit -m "<message>"`
6. Confirm success with `git log --oneline -1`

## Rules
- Never use `--no-verify`
- Never commit secrets, .env files, or node_modules
- If pre-commit hook fails, fix the issue and retry
