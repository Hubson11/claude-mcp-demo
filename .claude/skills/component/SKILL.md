---
name: component
description: Build a single React component interactively — Figma (required) + Confluence (optional); shows diff at every step and confirms before writing any file.
---

# /component

Builds a single React component interactively — pixel-perfect from Figma, behavior from Confluence.

**Diff after every artifact. Move forward only on confirmation. Ask questions only when genuinely uncertain.**

---

## Inputs

Resolve each input in order. Never ask for more than one thing per message.

1. If `Figma` URL not provided → ask: "What's the Figma URL for this component?" — wait for answer.
2. `Component` name resolution — pick the first rule that applies, do not ask otherwise:
   - Provided explicitly in the invocation → use it as-is, no confirmation.
   - Not provided, Figma node name is specific (not "Frame", "Group", "Rectangle", "Component 1" etc.) → use it silently, state: "Using name `<InferredName>` from Figma."
   - Not provided, Figma node name is generic or ambiguous → ask once: "I'd call it `<InferredName>` — confirm or correct?"
3. (Optional) `Confluence` URL — if provided, fetch in Phase 1. If not provided, proceed without blocking; behavior will be inferred from Figma and noted inline.
4. (Optional) `FigmaTree` — pre-fetched Figma tree JSON passed by a parent `/component` run for this child node. If provided, **skip** `mcp__figma__get_design_context` in Phase 1 entirely and use this data directly.

Only move to Phase 1 once the Figma URL is known.

---

## Phase 1 — Gather (run ALL in parallel)

Fire these simultaneously — do not wait for one before starting another:

1. **Check for existing implementation** (local grep, fast):
```bash
grep -rl "node-id=<nodeId-dash>\|node-id=<nodeId-colon>" src/components/ src/pages/ 2>/dev/null
```
Both formats from URL (`1-234`) and API (`1:234`).

2. **Fetch Figma tree** — SKIP this step if `FigmaTree` was passed as input; use that data instead:
   `mcp__figma__get_design_context(fileKey, nodeId)`

3. **Fetch Confluence spec** (if URL provided): `mcp__atlassian__getConfluencePage(id: "<id>")`

**After all three complete:**

**If grep found a match:**
```
⚠️  This Figma node is already implemented:
    → src/components/ProductCard/ProductCard.tsx

Options:
  A) Use as-is  B) Update it  C) Create new anyway
→ Which option?
```
Wait for choice before continuing.

**Process Figma response** — read response type first, it determines the strategy:

| Response contains | Action |
|---|---|
| Code Connect snippets | Use the mapped component directly — do not re-implement |
| Design tokens as CSS variables | Map to project's existing `index.css` custom properties |
| Design annotations / designer notes | Follow them — they override inferred behavior |
| Raw hex + absolute positions only | Rely on screenshot; extract all values manually from the tree |

From the reference React+Tailwind snippet: extract semantic HTML tag choices and accessible attributes (`aria-label`, `role`). Ignore all Tailwind class names — rewrite as CSS module classes.

**Process Confluence response** — extract ONLY:
- Props interface (names, types, required/optional)
- States and triggers
- Behaviors (click → what happens → after Xms → what)
- Validations and error messages
- `data-testid` values

Do not extract colors, spacing, layout from Confluence (Figma owns that).

If Confluence URL was not provided → note inline: "No Confluence spec — behavior inferred from Figma." Then continue without blocking.

Display extracted token summary + structured Confluence spec together:

```
TOKENS EXTRACTED
Colors:     #000000 (bg), #ffffff (text), #c0392b (badge-sale) ...
Typography: Noto Sans 400 18px/22px (body), 700 24px (heading) ...
Fonts:      Noto Sans → needs Google Fonts link in index.html (weights: 400, 700)
Spacing:    padding 24px 16px, gap 12px ...
Dimensions: 408px × 622px (card) ...
Images:     hero-bg (url: ..., scaleMode=FILL → object-fit: cover), product-1 (scaleMode=FIT → object-fit: contain)
Icons:      cart-icon (nodeId: X, use get_screenshot or vectorPaths)
Overflow:   clipsContent=true, overflowDirection=VERTICAL → overflow-y: auto; height: Xpx
LayoutWrap: row with layoutWrap=WRAP → flex-wrap: wrap
Tables:     col-1=240px, col-2=120px, col-3=80px (from dimensions.width per cell)
Variants:   COMPONENT_SET — State=Default|Hover|Disabled · Size=S|M|L → props: state?, size?
Constraints: badge has constraints.horizontal=RIGHT → right: 12px (not left!)
Z-index:    badge over image (z:2), sticky header (z:3)
Instances:  Button (INSTANCE) → src/components/Button exists ✅ reuse | Icon (INSTANCE) → ❌ implement
Fonts:      Noto Sans (400,700) + Nunito Sans (400,600) → one combined Google Fonts link
```

If something is ambiguous (e.g. two conflicting font sizes) → ask which one to use.

---

## Phase 1.5 — Decomposition Check

Run this immediately after Phase 1 completes — **before downloading assets or extracting tokens**.

**Goal:** Decide whether to build as a single file or split into smaller child components first. If decomposing, each child is built as a separate `/component` run using Figma data already in memory — no extra API calls.

### Signals that decomposition is warranted (any 2+ → propose split)

| Signal | Example |
|---|---|
| 3+ named top-level frames/sections with distinct concerns | `Filters`, `Table`, `Pagination` as siblings |
| Total node count exceeds ~150 | deeply nested, large tree |
| Repeating pattern identified | `Row` frame repeated N times inside a container |
| Multiple distinct COMPONENT_SET instances | `Dropdown`, `Badge`, `Avatar` each with own variants |
| Layer names clearly map to separate UI responsibilities | `Search`, `Toolbar`, `TableHeader`, `TableBody` |

If none apply → skip this phase, proceed to Phase 2 as usual.

### If decomposition is warranted — present the proposal first

Show the component tree before asking anything:

```
DECOMPOSITION PROPOSAL
─────────────────────────────
<ParentComponent>               ← thin wrapper, primarily composes children
├── <ChildA>                    nodeId: 1:234   [not yet built]
│   ├── reason: distinct search/filter concern
│   └── Figma data: already in memory ✅ — no extra API call
├── <ChildB>                    nodeId: 1:567   [not yet built]
│   ├── reason: repeating table row unit
│   └── Figma data: already in memory ✅ — no extra API call
└── <ChildC>                    nodeId: 1:890   [not yet built]
    ├── reason: self-contained pagination block
    └── Figma data: already in memory ✅ — no extra API call

Build order: ChildA → ChildB → ChildC → ParentComponent (composes them)
─────────────────────────────
→ Approve this split, adjust it, or build as single file?
```

Wait for confirmation. Do NOT proceed until answered.

### On approval — spawn child /component runs with cached Figma data

For each approved child, invoke `/component` and pass the relevant sub-tree extracted from the parent's Phase 1 Figma response. The child must skip `mcp__figma__get_design_context`.

Invocation format:

```
/component
Figma: https://www.figma.com/design/<fileKey>?node-id=<childNodeId>
Component: <ChildName>
Confluence: <same URL if relevant, omit otherwise>
FigmaTree: <sub-tree JSON rooted at childNodeId, extracted from parent's get_design_context response>
```

Rules for `FigmaTree` extraction:
- Include only the sub-tree rooted at the child's nodeId — not the full parent response.
- Include all descendants: children, styles, constraints, component instances within that sub-tree.
- The child run will use this data directly and must not call `mcp__figma__get_design_context`.

Build children **one at a time in the listed order**. Wait for user confirmation that each child is complete before starting the next. After all children are done, build the parent that imports and composes them.

---

## Phase 2 — Assets + Token extraction (run ALL in parallel)

Fire these simultaneously — token analysis is CPU-only, asset downloads are I/O-only, they do not block each other:

**Track A — Asset downloads:**

1. **Download missing images** — skip files that already exist on disk:

```bash
mkdir -p src/assets/<component-name>
# For each asset, check before downloading:
[ -f "src/assets/<component-name>/<name>.png" ] || curl -L -o "src/assets/<component-name>/<name>.png" "<url>"
# Repeat for each asset; all curl calls fire in parallel
```

After all downloads complete, run this fix sequence in order — mandatory, no skipping:

```bash
# 1. Rename SVGs saved with wrong extension
for f in src/assets/<component-name>/*.png src/assets/<component-name>/*.jpg; do
  [ -f "$f" ] || continue
  if file "$f" | grep -q "SVG"; then mv "$f" "${f%.*}.svg"; fi
done

# 2. Fix invisible icons (opacity="0" on root <g>)
grep -rl 'opacity="0"' src/assets/<component-name>/ | xargs -r sed -i 's/opacity="0"/opacity="1"/g'

# 3. Detect oversized icons
for f in src/assets/<component-name>/*.svg; do
  [ -f "$f" ] || continue
  if grep -q 'width="100%"' "$f"; then
    vb=$(grep -o 'viewBox="[^"]*"' "$f" | head -1)
    echo "OVERSIZED: $f  $vb"
  fi
done
```

For every `OVERSIZED` line: parse viewBox `"0 0 W H"` → add to CSS module:
```css
.iconClassName img { width: Wpx; height: Hpx; display: block; flex-shrink: 0; }
```

Use the FINAL filename (correct extension after renaming) in all import statements.

**Track B — Token extraction and validation (runs in parallel with Track A):**

Build the token validation table from the Figma tree:

| Token | Figma value | Your token | Match? |
|---|---|---|---|
| bg-primary | #ffffff | #ffffff | ✅ |
| card-width | 408px | 408px | ✅ |
| heading-size | 24px | 22px | ❌ → fix |

Fix every ❌ immediately — do not carry errors forward.

Simultaneously scan existing global files to avoid duplicates:
```bash
# Check which Google Font families are already in index.html
grep -i "fonts.googleapis.com" index.html

# Check which CSS custom properties already exist in src/index.css
grep -o '\-\-[a-zA-Z0-9_-]*' src/index.css | sort -u
```

---

## Step 3 — Tokens + Fonts + CSS: single confirmation gate

Wait for both Phase 2 tracks to complete. Then show everything that needs user approval in **one message**:

**A. Token validation result:**
- If all ✅ → state "All tokens verified ✅" and skip asking for confirmation on this section.
- If any ❌ were found → list the fixes applied and ask: "Token fixes applied — does this look right?"

**B. Google Fonts diff** (only if fonts are NOT already in `index.html`; skip entirely if grep found them):

```diff
--- a/index.html
+++ b/index.html
+  <link rel="preconnect" href="https://fonts.googleapis.com">
+  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
+  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">
```

Rules:
- Always `display=swap`
- Never separate `<link>` tags per font — combine multiple families in one URL: `&family=FamilyName:wght@...`
- Skip this diff entirely if all required font families are already present in `index.html`

**C. CSS tokens diff** — include only vars that are NOT already in `src/index.css` (based on Track B grep results). If all required vars already exist, skip this section entirely and state so:

```diff
--- a/src/index.css
+++ b/src/index.css
+ --color-badge-sale: #c0392b;
+ --font-heading: 'Noto Sans', sans-serif;
+ --product-card-width: 408px;
```

**→ Confirm all sections that have changes, or describe what to change.**

If A had no errors, B is skipped (fonts present), and C is skipped (vars already defined) → proceed automatically and state: "All tokens, fonts, and CSS vars already up to date — proceeding to Step 4."

---

## Step 4 — All code diffs at once

Show ALL diffs in one message — TSX, CSS module, barrel, test, story. User confirms or revises once. Then write all files in parallel.

Show in this order:

**1. Component TSX:**
```diff
diff --git a/src/components/ProductCard/ProductCard.tsx b/src/components/ProductCard/ProductCard.tsx
new file mode 100644
--- /dev/null
+++ b/src/components/ProductCard/ProductCard.tsx
@@ -0,0 +1,52 @@
+// figma: https://www.figma.com/design/<fileKey>?node-id=<nodeId>
+import { useState, useEffect } from 'react'
+import styles from './ProductCard.module.css'
+
+interface ProductCardProps {
+  id: string
+  name: string
+  ...
+}
+
+export function ProductCard({ ... }: ProductCardProps) {
+  ...
+}
```

The first line of every component `.tsx` file must be the Figma annotation:
```tsx
// figma: https://www.figma.com/design/<fileKey>?node-id=<nodeId>
```

**2. CSS module:**
```diff
diff --git a/src/components/ProductCard/ProductCard.module.css ...
new file mode 100644
--- /dev/null
+++ b/src/components/ProductCard/ProductCard.module.css
@@ -0,0 +1,38 @@
+.card {
+  width: var(--product-card-width);
+  ...
+}
```

**3. Barrel:**
```diff
diff --git a/src/components/ProductCard/index.ts ...
+++ b/src/components/ProductCard/index.ts
@@ -0,0 +1 @@
+export { ProductCard } from './ProductCard'
```

**4. Test:**
```diff
diff --git a/src/components/ProductCard/ProductCard.test.tsx ...
+++ b/src/components/ProductCard/ProductCard.test.tsx
@@ -0,0 +1,65 @@
+import { render, screen, fireEvent, act } from '@testing-library/react'
+import { vi } from 'vitest'
+import { ProductCard } from './ProductCard'
+
+describe('ProductCard', () => {
+  ...
+})
```

Tests cover only behavior (from Confluence spec / inferred from Figma states). No CSS assertions.

**5. Story:**
```diff
diff --git a/src/components/ProductCard/ProductCard.stories.tsx ...
+++ b/src/components/ProductCard/ProductCard.stories.tsx
@@ -0,0 +1,35 @@
+import type { Meta, StoryObj } from '@storybook/react'
+import { ProductCard } from './ProductCard'
+
+const meta: Meta<typeof ProductCard> = {
+  title: 'Components/ProductCard',
+  component: ProductCard,
+  tags: ['autodocs'],
+}
+export default meta
+
+type Story = StoryObj<typeof ProductCard>
+
+export const Default: Story = { args: { ... } }
+export const WithBadge: Story = { args: { ...Default.args, badge: 'New' } }
+export const SoldOut: Story = { args: { ...Default.args, soldOut: true } }
```

Story rules:
- COMPONENT_SET → one story per variant (State=Default → `Default`, State=Hover → `Hover`, etc.)
- One additional story per Confluence state (e.g. `WithBadge`, `SoldOut`, `Loading`)
- `Default` must have all required props with realistic values
- Spread `Default.args` in all variant stories — never duplicate

**→ Confirm to write ALL files, or describe what to change.**

On confirmation: write TSX, CSS module, barrel, test, and story files simultaneously in parallel.

---

## Step 5 — Automated verification (run before asking user anything)

Immediately after writing files, run both in parallel:

```bash
npx tsc --noEmit
# simultaneously:
npm test -- --run
```

Show output of both. If errors → show diff of the fix, wait for confirmation, then apply. Do NOT move to Step 6 until types are clean and tests are green. Do NOT ask the user to check Storybook while there are type or test errors.

---

## Step 6 — Visual verification (Storybook)

Only proceed here once Step 5 passes cleanly.

Fetch screenshot now (deferred from Phase 2 to avoid a wasted API call on cancelled flows):
`mcp__figma__get_screenshot(fileKey, nodeId)`

Ask the user to open Storybook:

```
Run this and let me know what you see:
  npm run storybook
```

Navigate to `http://localhost:6006`. Open the `Default` story and compare it side by side with the Figma screenshot. Report any discrepancies. `Default` must load without errors. All variant stories must show visually distinct states. No "Missing required prop" warnings.

Scan each element systematically in this order:

1. **Fonts** — family, weight, size, line-height, letter-spacing (DevTools → Network → filter "font": all must be 200)
2. **Colors** — background, text, border, icon fill — hex by hex
3. **Spacing** — padding, gap, margin — pixel by pixel
4. **Dimensions** — width, height of containers and elements
5. **Scroll / overflow** — container clips correctly, scrollbar appears only where expected
6. **Z-index / stacking** — overlapping elements in correct order
7. **Variants** — each prop value renders the correct modifier class
8. **States** — hover, focus, disabled look as in Figma
9. **Icons** — shape, size, stroke/fill color match Figma screenshot
10. **Responsive** — layout holds at 1024px and 768px

For every discrepancy → fix CSS, show diff, wait for confirmation before applying.

**Font 404 check:** In DevTools → Network tab → filter "font". Every font file must return 200. If any 404 → fix the `index.html` link tag before proceeding.

---

## Step 7 — Publish

After verification passes (types clean, tests green, Storybook matches Figma):

1. Run `/commit` — stage all new/changed files and create a conventional commit message.
2. Run `/push` — push the branch to remote.
3. Run `/pr` — open a GitHub Pull Request with a structured description.

Do not skip any of these three steps. Run them in order (commit → push → PR).

---

## Rules

- Ask questions only when: required input is missing, Figma has conflicting signals, behavior is ambiguous with real consequences
- Never ask as a ritual — if it's obvious from Figma or Confluence, just do it
- Never write files before showing the diff and getting confirmation
- If user gives feedback instead of confirming → apply it, show updated diff, wait again
- **Never add the component to a page or route** — use Storybook stories as the only integration point

---

## Usage

```
/component
Figma: https://www.figma.com/design/<fileKey>?node-id=<nodeId>
Confluence: https://<site>.atlassian.net/wiki/spaces/<space>/pages/<pageId>
Component: ProductCard
```
