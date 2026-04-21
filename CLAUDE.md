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
- **Figma** (`mcp__figma__*`) — read design frames, styles, and component specs from Figma
- **Confluence** — read page content and specs from Confluence

## Custom skills available
| Skill | When to use |
|---|---|
| `/commit` | After implementing a feature — create a well-formatted git commit |
| `/push` | Push current branch to remote |
| `/pr` | Open a GitHub Pull Request with description |
| `/code-review` | Review your own diff and produce a list of improvement notes |
| `/review-fixer` | Read code-review notes, judge which are valid, apply fixes |
| `/pr-babysitter` | Watch CI on open PR, fix failures automatically (run in /loop) |
| `/flaky-finder` | Scan GitHub Actions logs for flaky tests, create GitHub Issue |

## Standard implementation workflow

When asked to implement a component:

1. **Fetch design** — use Figma MCP to get the relevant frame/component node
2. **Fetch spec** — use Confluence MCP to read the component specification page
3. **Implement** — build pixel-perfect component based on both sources
4. **Test** — write Vitest unit tests and update Cypress E2E tests
5. **Publish** — run `/commit` → `/push` → `/pr`
6. **Review loop** — run `/code-review` → `/review-fixer` → `/commit` → `/push`
7. **Babysit** — run `/pr-babysitter` in `/loop` to watch CI and fix failures

## Component to implement
**ProductCard** — located at `src/components/ProductCard/ProductCard.tsx`

Props interface is defined, placeholder returns a stub. Replace with full pixel-perfect implementation.

The user will provide Figma and Confluence URLs directly in the prompt, for example:
> "Zaimplementuj ProductCard. Figma: https://... Confluence: https://..."

Use those URLs with the MCP tools to fetch design and spec.

## Project conventions
- Components: PascalCase, one folder per component with `index.ts` barrel
- Tests: co-located `*.test.tsx` next to component
- `data-testid` attributes on all interactive elements and containers
- CSS: component-scoped `.module.css` files
- No default exports from components (use named exports)
