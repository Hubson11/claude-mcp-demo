# Orchestrating AI Coding Workflows with Claude and MCP

---

## The Problem

- AI coding tools are **one-shot assistants** — no awareness of the wider workflow
- Design files, functional specs, and code live in **separate silos** with no single source of truth
- Component creation is **repetitive and error-prone** — teams re-solve the same problems (naming, testids, responsiveness, i18n)
- CI failures get noticed late — **no closed feedback loop**
- Every developer orchestrates differently — **no standardisation across the team**

---

## The Goal: Deliver an AI-Orchestrated, Standardised Dev Workflow

- Claude as an **orchestration layer** — not just a code suggester, but a workflow runner
- Figma as sole source of truth for **appearance**, Confluence for **behaviour and spec**
- Repeatable, composable **skills** that encode team conventions once and reuse forever
- Agents that can run **in parallel**, in **pipelines**, and on a **loop** — unattended

---

## Implementation

### MCP Servers — connecting Claude to your tools

| Server | What it provides |
|---|---|
| `mcp__figma__*` | Fetch design trees, download images, extract design tokens |
| `mcp__atlassian__*` | Read/write Confluence specs, search Jira tickets |

Claude reads Figma and Confluence directly during implementation — no copy-pasting, no context switching.

---

### Custom Skills — encoding workflow knowledge

Skills are reusable, composable workflow steps that encode team conventions once.

| Skill | Purpose |
|---|---|
| `/decompose` | Analyse Figma, propose component breakdown — no code yet |
| `/component` | Build a single component: Figma + Confluence spec, diff at every step |
| `/page` | Build a full page — decomposes, then calls `/component` per piece |
| `/e2e` | Write Cypress tests for a completed page |
| `/i18n` | Detect hardcoded strings, add translation keys |
| `/commit` `/push` `/pr` | Standardised publish flow |
| `/code-review` | Review your own diff, generate improvement notes |
| `/review-fixer` | Read review notes, evaluate and apply fixes |
| `/pr-babysitter` | Watch CI on an open PR, fix failures automatically |
| `/flaky-finder` | Scan GitHub Actions logs for flaky tests, file an issue |

Skills are composable: `/page` internally calls `/figma-to-code` per component. Skills can be mixed and run inside other skills (e.g. `/pr-babysitter` running inside `/loop`).

---

### Agents in Parallel

- Claude decomposes a page into components, then spawns **one subagent per component**
- All agents run **concurrently in the same branch** — faster delivery, no waiting
- Git worktrees available for **manual isolation** (risky refactors, experiments) — triggered by the developer, not by Claude automatically

---

### Pipeline Integration — the closed loop

```
PR opened
   │
   ▼
GitHub Actions → /code-review runs in CI pipeline
   │
   ├─ leaves review comments?  ──┐
   │                             │
   └─ pipeline fails?  ──────────┤
                                 │
                                 ▼
                      /pr-babysitter (in /loop)
                         reads comments + CI logs
                         fixes code, pushes to branch
                                 │
                                 ▼
                      CI runs again → green ✓
```

Developer reviews the final result — no manual fix cycles between "PR opened" and "ready to merge".

---

## Demo

1. **`/component`** — build a single component from Figma + Confluence spec, live diff at each step, confirm before writing
2. **`/page`** — full page decomposed and built end-to-end with parallel subagents
3. **`/loop` + `/pr-babysitter`** — CI failure or review comment auto-healed while we watch

---

## Outcomes

| Before | After |
|---|---|
| Manual design → code translation | Pixel-perfect from Figma, automated |
| Spec scattered across Slack/docs | Single Confluence source, Claude reads it directly |
| Each developer invents their own flow | Standardised skills, reproducible results |
| CI failures noticed late, fixed manually | Agent watches PR, fixes and pushes unattended |
| Components inconsistently tested | `data-testid`, unit tests, E2E — all generated from spec |
| Review → fix cycle is fully manual | Code review runs in pipeline, fixes applied automatically |
