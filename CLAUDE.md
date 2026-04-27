# Nexus Store — Claude Orchestration Guide

## Project overview
Demo project: **"Orchestrating Claude with MCP"**
A React + Vite + TypeScript e-commerce app for "Nexus Store". Claude orchestrates the full development workflow using MCP servers and custom skills.

## Stack
- React 19 + TypeScript + Vite
- Vitest (unit tests) + React Testing Library
- Cypress (E2E tests)
- React Router v7
- GitHub Actions CI

## MCP Servers available
- **Figma** (`mcp__figma__*`) — sole source of truth for APPEARANCE
- **Atlassian** (`mcp__atlassian__*`) — Confluence (functional spec) + Jira; use `mcp__atlassian__getConfluencePage(pageId)` to read, `mcp__atlassian__searchConfluenceUsingCql(cql)` to search, `mcp__atlassian__createConfluencePage` / `mcp__atlassian__updateConfluencePage` to write

## Sources of truth — critical split

| What | Source | Example |
|---|---|---|
| Colors, fonts, spacing, dimensions, shadows, icons | **Figma ONLY** | `#000000`, `Noto Sans 50px`, `padding: 12px 50px` |
| Images, backgrounds, product photos | **Figma ONLY** (`mcp__figma__download_figma_images`) | hero bg, product photos |
| Props interface, types | **Confluence** | `price: number`, `badge?: 'Sale' \| 'New'` |
| Behaviors, interactions | **Confluence** | "Show 'Added' for 2s after click" |
| `data-testid` attributes | **Confluence** | `data-testid="add-to-cart-btn"` |
| Validations, error states | **Confluence** | "validate email format" |

> **Rule**: if Confluence says something about appearance and Figma shows otherwise — Figma always wins.

## Custom skills available

| Skill | When to use |
|---|---|
| `/confluence` | Read functional spec from Confluence (props, behaviors, data-testid, API calls) or write/update a spec page |
| `/component` | Build a single component interactively — Figma (required) + Confluence (optional); diff at every step, confirm before writing |
| `/page` | Build a full page interactively — decomposes Figma into components, builds each one step by step with diffs |
| `/decompose` | Analyze Figma and propose component breakdown only — implements nothing; use when you want to plan before `/component` calls |
| `/figma-to-code` | Low-level: pixel-perfect single component from Figma — used internally by `/component` and `/page` |
| `/i18n` | Add or update translations for a component — detects hardcoded strings, proposes keys, updates locale files |
| `/e2e` | Write Cypress E2E tests for a completed page — assesses whether E2E is needed first, then covers user flows |
| `/commit` | After implementation — create a well-formatted commit |
| `/push` | Push branch to remote |
| `/pr` | Open a GitHub Pull Request with description |
| `/code-review` | Review your own diff and generate a list of improvement notes |
| `/review-fixer` | Read code-review notes, evaluate and apply fixes |
| `/pr-babysitter` | Watch CI on an open PR, automatically fix failures (run in /loop) |
| `/flaky-finder` | Scan GitHub Actions logs for flaky tests, create GitHub Issue |

## Standard implementation workflow

When asked to implement a component or page:

1. **Run `/decompose`** — analyze Figma, propose component breakdown, get approval
2. **Read spec** — `/confluence read` for each component to extract props, behaviors, data-testid, API calls
3. **Run `/figma-to-code`** per component — full process:
   - Fetch full Figma tree (no depth limit)
   - Check existing assets, download missing images (`mcp__figma__download_figma_images`)
   - Use spec extracted in step 2 (behaviors, props, data-testid)
   - Extract design tokens (colors, typography, spacing)
   - Implement layer by layer: HTML → CSS (responsive from line 1) → states
   - Verify visually via `npm run dev`
   - Iterate until pixel-perfect
4. **Test** — unit tests verify behavior (from Confluence spec), not appearance
5. **E2E** — run `/e2e` for the completed page; skill assesses whether E2E tests are warranted before writing any
6. **i18n** — run `/i18n` for each component to localize hardcoded strings
7. **Publish** — `/commit` → `/push` → `/pr`
8. **Review loop** — `/code-review` → `/review-fixer` → `/commit` → `/push`
9. **Babysit** — `/pr-babysitter` in `/loop` to watch CI

## How to pass URLs in a prompt

```
/figma-to-code
Figma: https://www.figma.com/design/<fileKey>?node-id=<nodeId>
Confluence: https://<site>.atlassian.net/wiki/spaces/<space>/pages/<pageId>
Component: <ComponentName>
```

## Global rules

- **All code is written in English** — variable names, function names, comments, commit messages, CSS class names, translation keys, test descriptions, file names.

### 1. Think Before Coding
Don't assume. Don't hide confusion. Surface tradeoffs.

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First
Minimum code that solves the problem. Nothing speculative.

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.
- Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes
Touch only what you must. Clean up only your own mess.

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.
- The test: every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution
Define success criteria. Loop until verified.

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

> **Tradeoff**: these guidelines bias toward caution over speed. For trivial tasks, use judgment.

## Project conventions
- Components: PascalCase, one folder per component with `index.ts` barrel
- Tests: co-located `*.test.tsx` next to the component
- `data-testid` on all interactive elements and containers
- CSS: component-scoped `.module.css`
- No default exports from components (named exports only)
- Images from Figma: `src/assets/<component-name>/`
- CSS tokens: defined as custom properties in `src/index.css`
