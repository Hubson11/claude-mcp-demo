---
name: decompose
description: Analyze a Figma design and propose a React component breakdown — implements nothing, outputs an approved plan with component tree, status (built/not built), and ready-to-use /figma-to-code invocations.
---

# /decompose

Analyzes a Figma design and proposes a React component breakdown. Implements nothing — only produces an approved plan that becomes the input for `/figma-to-code`.

**Core principle**: Figma = sole source of visual structure. Text documents (Confluence) provide only information about behaviors and props — never about layout.

---

## Inputs — ask one at a time

Collect inputs sequentially. Never ask for more than one thing per message.

1. If `Figma` URL not provided → ask: "What's the Figma URL?" — wait for answer.
2. If `Confluence` URL not provided and you suspect there's a spec → ask: "Do you have a Confluence spec for this page?" — wait for answer. If no, continue without it.

Only move to Step 1 once Figma URL is confirmed.

---

## Step 1 — Fetch the full Figma tree

```
mcp__figma__get_design_context(fileKey, nodeId)
```

- No `depth` parameter — full tree.
- Identify top-level frames (page sections or component variants).
- Record: `nodeId`, `name`, `type`, `children`, `layout_*`, `dimensions`.

---

## Step 2 — Read functional spec (optional)

If a Confluence URL is provided, extract the page ID (numeric segment) and fetch:
```
mcp__atlassian__getConfluencePage(id: "<id>")
```

Extract only: prop names, types, behaviors, states.
Ignore any mentions of appearance, colors, spacing — that belongs to Figma.

If no document is provided — continue based on Figma only.

---

## Step 3 — Identify component boundaries

Scan the Figma tree and look for patterns:

### Indicators to extract as a component (worth separating when):
- **Repetition** — the same node structure appears ≥2 times (e.g. product card ×8)
- **Visual isolation** — a distinct section with its own background, padding, separator
- **Interactivity** — element with visible states in Figma (hover, active, disabled frame)
- **Complexity** — node has >3 levels of nesting and its own layout
- **Navigation** — fixed/sticky element
- **Form** — inputs, buttons, validation

### Indicators to leave inline (do not extract when):
- Simple label or icon with no state
- Element with no children or a single child
- Structure unique in the entire project and too simple for its own component

---

## Step 4 — Classify components

For each identified component assign a class:

| Class | Definition | Example |
|---|---|---|
| `page-section` | Full page section, one-off, not reusable | `HeroSection`, `Footer` |
| `reusable` | Appears multiple times or is clearly designed to be reused | `ProductCard`, `BlogCard` |
| `layout` | Pure container with no own logic | `Grid`, `Container` |
| `interactive` | Has its own UI state (toggle, form, slider) | `Navbar`, `Newsletter` |

---

## Step 5 — Build the component tree

Present the hierarchy as a tree:

```
App
├── [ComponentName]   [class]   — [what it contains / does]   — props: [list]
│   └── [Child]       [class]   — [description]               — props: [list]
└── [ComponentName]   [class]   — [description]               — props: [list]
```

Example:
```
App
├── Navbar            interactive  — logo, nav links, cart/wishlist icons    — props: cartCount?: number
├── HeroSection       page-section — full-screen slider with image and CTA   — props: none
├── ProductSection    page-section — category filters + product card grid    — props: onAddToCart
│   └── ProductCard   reusable ×8  — photo, name, price, badge, button       — props: name, price, badge?, image, onAddToCart, disabled?
├── FeaturesBar       page-section — 4 icons with descriptions               — props: none
├── Newsletter        interactive  — email input + submit + validation        — props: none
└── Footer            page-section — logo, link columns, copyright           — props: none
```

---

## Step 6 — Component table

After the tree, **grep the codebase for each identified nodeId** before rendering the table:

```bash
grep -rl "node-id=X-Y\|node-id=X:Y" src/components/ src/pages/ 2>/dev/null
```

Run one grep per component (try both `-` and `:` separator variants of the nodeId). Then present the detail table with an **Status** column:

| Component | Class | Figma node | Reusable | Initial props | Complexity | Status |
|---|---|---|---|---|---|---|
| Navbar | interactive | `node-id=X:Y` | no | `cartCount?: number` | medium | ✅ `src/components/Navbar` |
| ProductCard | reusable | `node-id=X:Y` | yes ×8 | `name, price, badge?, image, onAddToCart` | high | ❌ not implemented |
| Newsletter | interactive | `node-id=X:Y` | no | none | medium | ❌ not implemented |
| Footer | page-section | `node-id=X:Y` | no | none | low | ✅ `src/components/Footer` |

- `✅ <path>` — already implemented, skip or update
- `❌ not implemented` — needs to be built

**Complexity**:
- `low` — no state, no interactions, presentation only
- `medium` — simple state or a form
- `high` — multiple states, animations, complex logic

---

## Step 7 — Open questions

List everything that cannot be determined from Figma or the document:

```
OPEN QUESTIONS:
1. ProductCard — should the "disabled" state (sold out) block the entire card or only the button?
2. Navbar — should cart count be global state (Context) or a prop passed from App?
3. HeroSection — is the slider auto-play or manual only?
```

If the list is empty — write "No open questions, the design is complete."

---

## Step 8 — Ask for approval

Before closing the skill display:

```
PLAN READY FOR APPROVAL

Proposed X components:
- Y reusable
- Z page-sections
- W interactive

Do you approve this breakdown?
- If YES → you can now run /figma-to-code for each component on the list
- If NO → tell me what to change (add/remove component, change boundaries, change props)
```

**Do not create any files or folders.** The plan is the output of this skill — implementation belongs to `/figma-to-code` or `/component`.

---

## Step 9 — After approval (optional)

If the user approves the plan, generate ready-to-use `/figma-to-code` invocations for each component:

```
# Implementation order (least to most dependent):

/figma-to-code
Figma: https://www.figma.com/design/<fileKey>?node-id=<nodeId-ProductCard>
Component: ProductCard

/figma-to-code
Figma: https://www.figma.com/design/<fileKey>?node-id=<nodeId-Navbar>
Component: Navbar

...
```

Order: first `reusable` (no dependencies), then `interactive`, finally `page-section`.

---

## Usage

```
/decompose
Figma: https://www.figma.com/design/<fileKey>?node-id=<nodeId>
Confluence: https://<site>.atlassian.net/wiki/spaces/<space>/pages/<pageId>  ← optional
```
