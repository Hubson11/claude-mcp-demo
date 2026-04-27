---
name: component
description: Build a single React component interactively — Figma (required) + Confluence (optional); shows diff at every step and confirms before writing any file.
---

# /component

Builds a single React component interactively — pixel-perfect from Figma, behavior from Confluence.

**Diff after every artifact. Move forward only on confirmation. Ask questions only when genuinely uncertain.**

---

## Inputs — ask one at a time

Collect inputs sequentially. Never ask for more than one thing per message.

1. If `Figma` URL not provided → ask: "What's the Figma URL for this component?" — wait for answer.
2. If `Component` name not provided → infer from Figma node name and ask: "I'll call it `<InferredName>` — does that work?" — wait for confirmation or correction.
3. If `Confluence` URL not provided and component has non-trivial behavior → ask: "Do you have a Confluence spec for this component, or should I infer behavior from Figma?" — wait for answer.

Only move to Step 0 once Figma URL and Component name are confirmed.

---

## Step 0 — Check for existing implementation

Before fetching anything from Figma, check whether this node was already implemented:

```bash
grep -rl "node-id=<nodeId>" src/components/ src/pages/ 2>/dev/null
```

Try both nodeId formats from the URL (`1-234`) and API (`1:234`):

```bash
grep -rl "node-id=1-234\|node-id=1:234" src/components/ src/pages/ 2>/dev/null
```

**If a match is found:**
```
⚠️  This Figma node is already implemented:
    → src/components/ProductCard/ProductCard.tsx
    Component: ProductCard

Options:
  A) Use the existing component as-is
  B) Update it (re-run implementation for this node)
  C) Create a new component anyway (different context)

→ Which option?
```

Wait for the user's choice before proceeding.

**If no match is found:** continue to Step 1.

---

## Step 1 — Fetch Figma tree

```
mcp__figma__get_design_context(fileKey, nodeId)
```

No depth limit. Read every node: fills, strokes, typography, layout, effects, children.

**Read the response type first — it determines the entire strategy:**

| Response contains | Action |
|---|---|
| Code Connect snippets | Use the mapped component directly — do not re-implement |
| Design tokens as CSS variables | Map to project's existing `index.css` custom properties |
| Design annotations / designer notes | Follow them — they override inferred behavior |
| Raw hex + absolute positions only | Rely on `get_screenshot`; extract all values manually from the tree |

From the reference React+Tailwind snippet: extract semantic HTML tag choices and accessible attributes (`aria-label`, `role`). Ignore all Tailwind class names — rewrite as CSS module classes.

Extract and display a token summary:

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

From the reference code snippet returned by `get_design_context`: extract semantic HTML tag choices and accessible attributes (`aria-label`, `role`). Ignore all Tailwind class names — rewrite as CSS module classes.

If something is ambiguous (e.g. two conflicting font sizes for what appears to be the same element) → ask which one to use.

---

## Step 2 — Download missing images

Check `src/assets/<component-name>/` before downloading:

```
src/assets/ProductCard/
  product-placeholder.jpg  ✅ exists → skip
  badge-bg.png              ❌ missing → download
```

Image URLs are returned by `get_design_context` in fill objects. Download all missing files first (always use `.png` as placeholder extension):

```bash
mkdir -p src/assets/<component-name>
curl -L -o "src/assets/<component-name>/<name>.png" "<url-from-response>"
# repeat for every asset
```

**After ALL downloads, run this fix sequence in order — mandatory, no skipping:**

```bash
# 1. Rename SVGs saved with wrong extension
#    Figma serves SVG content regardless of the URL extension — .png files may actually be SVGs.
for f in src/assets/<component-name>/*.png src/assets/<component-name>/*.jpg; do
  [ -f "$f" ] || continue
  if file "$f" | grep -q "SVG"; then mv "$f" "${f%.*}.svg"; fi
done

# 2. Fix invisible icons
#    Figma exports SVGs with opacity="0" on the root <g> when the layer has 0% opacity.
grep -rl 'opacity="0"' src/assets/<component-name>/ | xargs -r sed -i 's/opacity="0"/opacity="1"/g'

# 3. Detect oversized icons and print each one's viewBox
#    Figma SVGs use width="100%" height="100%" which collapses to 0 without a constrained parent.
for f in src/assets/<component-name>/*.svg; do
  [ -f "$f" ] || continue
  if grep -q 'width="100%"' "$f"; then
    vb=$(grep -o 'viewBox="[^"]*"' "$f" | head -1)
    echo "OVERSIZED: $f  $vb"
  fi
done
```

For every `OVERSIZED` line printed: parse the viewBox `"0 0 W H"` → add to the CSS module for every `<img>` that uses that asset:

```css
.iconClassName img { width: Wpx; height: Hpx; display: block; flex-shrink: 0; }
```

**Use the FINAL filename (with correct extension after renaming) in all import statements.**

---

## Step 3 — Read Confluence spec (if URL provided)

Extract the page ID from the URL (numeric segment) and fetch:
```
mcp__atlassian__getConfluencePage(id: "<id>")
```

Extract ONLY:
- Props interface (names, types, required/optional)
- States and triggers
- Behaviors (click → what happens → after Xms → what)
- Validations and error messages
- `data-testid` values

Display as structured spec — do not extract colors, spacing, layout (Figma owns that).

If Confluence URL not provided and component has non-trivial behavior → ask: "No Confluence URL — should I infer behavior from Figma, or do you have a spec?"

---

## Step 3b — Token pre-validation

Before showing any code diff, verify each extracted token against the Figma tree:

| Token | Figma value | Your token | Match? |
|---|---|---|---|
| bg-primary | #ffffff | #ffffff | ✅ |
| card-width | 408px | 408px | ✅ |
| heading-size | 24px | 22px | ❌ → fix |

Fix every ❌ before continuing. Also call `mcp__figma__get_screenshot(fileKey, nodeId)` and save the image — it is the pixel-perfect reference for Step 7.

**→ Confirm token map is correct before proceeding.**

---

## Step 3c — Google Fonts

Scan all text nodes and collect every unique `fontFamily` + `fontWeight` + italic variant. For every non-system font, add to `index.html` `<head>`.

**Single family:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">
```

**Multiple families — one `<link>` with `&family=` (single HTTP request):**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,400;0,600;0,700;1,400&family=Nunito+Sans:wght@400;600;700&display=swap" rel="stylesheet">
```

- Always `display=swap`
- Never separate `<link>` tags per font — always combine in one URL
- Show diff for `index.html` and wait for confirmation before proceeding

---

## Step 4 — CSS tokens diff

Show what will be added to `src/index.css` as a diff. Wait for confirmation.

```diff
  /* existing content */
+ --color-badge-sale: #c0392b;
+ --font-heading: 'Noto Sans', sans-serif;
+ --product-card-width: 408px;
```

**→ Confirm to proceed, or describe what to change.**

---

## Step 5 — Component file diff

Show full unified diff for each new file:

```diff
diff --git a/src/components/ProductCard/ProductCard.tsx b/src/components/ProductCard/ProductCard.tsx
new file mode 100644
--- /dev/null
+++ b/src/components/ProductCard/ProductCard.tsx
@@ -0,0 +1,52 @@
+import { useState, useEffect } from 'react'
+import styles from './ProductCard.module.css'
+
+interface ProductCardProps {
+  id: string
+  name: string
+  ...
+}
+
+export function ProductCard({ id, name, price, badge, image, soldOut, onAddToCart }: ProductCardProps) {
+  ...
+}
```

Then CSS module:

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

Then barrel:

```diff
diff --git a/src/components/ProductCard/index.ts ...
+++ b/src/components/ProductCard/index.ts
@@ -0,0 +1 @@
+export { ProductCard } from './ProductCard'
```

**→ Confirm to write files, or describe what to change.**

Write files only after confirmation.

---

## Step 6 — Tests diff

Show unified diff for the test file before writing:

```diff
diff --git a/src/components/ProductCard/ProductCard.test.tsx ...
new file mode 100644
--- /dev/null
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

**→ Confirm to write, or describe what to change.**

---

## Step 6b — Storybook story diff

Show unified diff for the story file before writing:

```diff
diff --git a/src/components/ProductCard/ProductCard.stories.tsx ...
new file mode 100644
--- /dev/null
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
+export const Default: Story = {
+  args: {
+    id: '1',
+    name: 'Wireless Headphones',
+    price: 129.99,
+    image: '/src/assets/ProductCard/product-1.jpg',
+    category: 'brand',
+  },
+}
+
+export const WithBadge: Story = {
+  args: { ...Default.args, badge: 'New' },
+}
+
+export const SoldOut: Story = {
+  args: { ...Default.args, soldOut: true },
+}
```

Rules for stories:
- If the component is a COMPONENT_SET → one story per variant value, named after the variant:
  - `State=Default` → `export const Default`
  - `State=Hover` → `export const Hover: Story = { args: { ...Default.args, state: 'hover' } }`
  - `State=Disabled` → `export const Disabled`
  - `Size=S` → `export const Small`
- One additional story per state from Confluence (e.g. `WithBadge`, `SoldOut`, `Loading`)
- `Default` must have all required props with realistic values
- Spread `Default.args` in all variant stories — never duplicate

**→ Confirm to write, or describe what to change.**

After writing, verify in Storybook:

```bash
npm run storybook
```

`Default` must load without errors. All variant stories must show visually distinct states. No "Missing required prop" warnings. Fix before proceeding.

---

## Step 6c — Write Figma annotation

After writing the component `.tsx` file, ensure the **first line** is the Figma annotation:

```tsx
// figma: https://www.figma.com/design/<fileKey>?node-id=<nodeId>
import ...
```

Include this in the component file diff shown in Step 5 — not as a separate step.

---

## Step 7 — Verify

### 7a — Visual comparison

Open `http://localhost:5173` and place it side by side with the Figma screenshot captured in Step 3b. Scan each element systematically in this order:

1. **Fonts** — family, weight, size, line-height, letter-spacing (check DevTools → Network → filter "font": all must be 200)
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

### 7b — Font verification

In DevTools → Network tab → filter "font". Every font file referenced in CSS must return status 200. If any return 404 or are missing → fix the `index.html` link tag before proceeding.

### 7c — Types and tests

Run in order:

```bash
npx tsc --noEmit
npm test -- --run
```

Show output. If errors → fix and show diff of the fix before applying.

---

## Rules

- Ask questions only when: required input is missing, Figma has conflicting signals, behavior is ambiguous with real consequences
- Never ask as a ritual — if it's obvious from Figma or Confluence, just do it
- Never write files before showing the diff and getting confirmation
- If user gives feedback instead of confirming → apply it, show updated diff, wait again

---

## Usage

```
/component
Figma: https://www.figma.com/design/<fileKey>?node-id=<nodeId>
Confluence: https://<site>.atlassian.net/wiki/spaces/<space>/pages/<pageId>
Component: ProductCard
```
