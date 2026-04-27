# /figma-to-code

Implements a component or page **pixel-perfect** from Figma.
Confluence provides only functional specification — NEVER influences appearance.

---

## Golden rule

> **Figma = sole source of truth for appearance.**
> If Confluence says "button should be green" and Figma shows black — you implement black.
> Confluence describes WHAT the component does, Figma says HOW IT LOOKS.

---

## Inputs — ask one at a time

Collect inputs sequentially. Never ask for more than one thing per message.

1. If `Figma` URL not provided → ask: "What's the Figma URL?" — wait for answer.
2. If `Component` name not provided → infer from Figma node name and ask: "I'll call it `<InferredName>` — does that work?" — wait for confirmation or correction.
3. If `Confluence` URL not provided and component has non-trivial behavior → ask: "Do you have a Confluence spec, or should I infer behavior from Figma?" — wait for answer.

Only move to Step 0 once Figma URL and Component name are confirmed.

---

## Step 0 — Check for existing implementation

Before fetching anything from Figma, check whether this node was already implemented:

```bash
grep -rl "node-id=<nodeId>" src/components/ src/pages/ 2>/dev/null
```

Replace `<nodeId>` with the nodeId from the URL — try both formats (`1-234` as in the URL and `1:234` as in the API). Example:

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

Wait for the user's choice. Do not proceed until answered.

**If no match is found:** continue to Step 1.

---

## Step 1 — Fetch the full Figma tree

```
mcp__figma__get_design_context(fileKey, nodeId)
```

- Fetch the full tree — no depth limit.
- The response contains: the Figma node tree (fills, strokes, layout, typography, effects), a reference React+Tailwind snippet, and Code Connect mappings if configured.
- From the reference code snippet: **extract** semantic HTML tag choices (`<button>`, `<nav>`, `<article>`), component hierarchy, and accessible attribute patterns (`aria-label`, `role`). **Ignore** all Tailwind class names and inline styles — rewrite everything as CSS module classes. The snippet is structural guidance, not production code.
- Read **every** node: type, fills, strokes, effects, layout, typography.
- Identify all children recursively.
- Store the result — you will return to this structure multiple times.

### Read the response type first

The `get_design_context` response varies based on how the Figma file is set up. Identify the case before extracting anything:

| Response contains | What it means | How to handle |
|---|---|---|
| Code Connect snippets | Node is mapped to an existing codebase component | Use the mapped component directly — do not re-implement it |
| Design tokens as CSS variables (`--color-*`, `--spacing-*`) | File uses a token system | Map to the project's existing custom properties in `index.css` — do not create duplicates |
| Design annotations / notes from designer | Designer left binding instructions | Read and follow them — they override any inferred behavior |
| Raw hex colors + absolute positions only | Loosely structured design | Rely heavily on `mcp__figma__get_screenshot` as reference; extract all values manually from the tree |

Only proceed to extraction once you know which case applies.

### What to extract from the Figma response

**Colors (fills)**
- Every fill of type `SOLID` → `#RRGGBB` or `rgba(r,g,b,a)`
- Fill of type `IMAGE` → store `imageRef` for Step 2; also read `imageScaleMode` on the node:
  - `FILL` → `<img>` with `object-fit: cover; width: 100%; height: 100%`
  - `FIT`  → `<img>` with `object-fit: contain; width: 100%; height: 100%`
  - `CROP` → `<img>` with `object-fit: cover` + `object-position` from `imageCrop` offset
  - `TILE` → CSS `background-image` with `background-repeat: repeat; background-size: auto`
- Fill of type `GRADIENT` → map as `linear-gradient` / `radial-gradient`
- Opacity on a node → apply to color as alpha

**Typography (textStyle)**
- `fontFamily` → install via Google Fonts if not a system font
- `fontWeight` → map: Thin=100, ExtraLight=200, Light=300, Regular=400, Medium=500, SemiBold=600, Bold=700, ExtraBold=800, Black=900
- `fontSize` → px
- `lineHeight` → if given in px use px, if % convert
- `letterSpacing` → if % → `em` (10% = 0.1em), if px → px
- `textCase` → UPPER→`text-transform: uppercase`, LOWER→`lowercase`, TITLE→`capitalize`
- `textAlignHorizontal` → `text-align`
- `textDecoration` → `STRIKETHROUGH`→`line-through`, `UNDERLINE`→`underline`

**Layout (layout_*)**
- `mode: none` → `position: absolute` or static (check context)
- `mode: row` → `display: flex; flex-direction: row`
- `mode: column` → `display: flex; flex-direction: column`
- `gap` → `gap`
- `padding` → `padding` (shorthand: top right bottom left)
- `alignItems` → `align-items`
- `justifyContent` → `justify-content`
- `sizing.horizontal: hug` → `width: fit-content`
- `sizing.horizontal: fill` → `flex: 1` or `width: 100%`
- `sizing.horizontal: fixed` + `dimensions.width` → `width: Xpx`
- `layoutWrap: WRAP` → `flex-wrap: wrap`
- `locationRelativeToParent.x/y` → if parent is `mode: none` → `position: absolute` — then read `constraints` to determine the axis anchor:
  - `constraints.horizontal: LEFT` (default) → `left: Xpx`
  - `constraints.horizontal: RIGHT` → `right: Xpx` (never `left` — element is pinned to right edge)
  - `constraints.horizontal: CENTER` → `left: 50%; transform: translateX(-50%)`
  - `constraints.horizontal: SCALE` → `left: X%; width: Y%`
  - `constraints.vertical: TOP` (default) → `top: Ypx`
  - `constraints.vertical: BOTTOM` → `bottom: Ypx` (never `top`)
  - `constraints.vertical: CENTER` → `top: 50%; transform: translateY(-50%)`
- `dimensions.width/height` → `width/height` (or `max-width` for containers)

**Borders (strokes)**
- `strokeWeight` with direction (e.g. `1px 0px 0px 1px` = top + left) → `border-top`, `border-left`
- Stroke color → `border-color`
- Line style → `solid` / `dashed` / `dotted`

**Effects**
- `DROP_SHADOW` → `box-shadow: offsetX offsetY blur spread color`
- `INNER_SHADOW` → `box-shadow: inset ...`
- `LAYER_BLUR` → `filter: blur(Xpx)`
- `BACKGROUND_BLUR` → `backdrop-filter: blur(Xpx)`

**Border radius**
- Uniform → `border-radius: Xpx`
- Asymmetric → `border-radius: TL TR BR BL`

**Scroll & Overflow**
- `clipsContent: true` + children overflow the bounds → `overflow: hidden`
- `overflowDirection: HORIZONTAL` → `overflow-x: auto; overflow-y: hidden`
- `overflowDirection: VERTICAL` → `overflow-y: auto; overflow-x: hidden`
- `overflowDirection: BOTH` → `overflow: auto`
- `scrollingEnabled: true` (Figma prototype) → `overflow: auto`
- Scroll containers **must** have an explicit `height` or `max-height` — without it the browser won't scroll
- Never omit these properties: missing overflow is one of the most common causes of elements appearing too small or scroll behaving unexpectedly

**Tables**
- A table in Figma is typically a Frame with `mode: column` containing row Frames with `mode: row`
- Read `dimensions.width` from **each cell node** → set as `width: Xpx` on `<td>`/`<th>` — never guess column widths
- Add `table-layout: fixed` when column widths come from Figma; add `min-width` on cells to prevent collapse
- Header row: read `fills` on the header Frame for background color
- Row borders: read `strokes` (usually bottom border per row → `border-bottom`)
- Sticky header: if the header is visually pinned → `position: sticky; top: 0; z-index: 1`
- Table container: if it clips (`clipsContent: true`) → `overflow-x: auto` on the wrapper, set explicit `height`/`max-height`

**Variants (COMPONENT_SET)**
- If the root node type is `COMPONENT_SET`, it contains named variant groups (e.g. `State=Default,Hover,Disabled` · `Size=S,M,L`)
- Map each variant dimension → React prop: `State` → `state?: 'default' | 'hover' | 'disabled'`, `Size` → `size?: 'S' | 'M' | 'L'`
- Default variant = the component's default prop value
- Each visual difference between variants → CSS modifier class: `.card--size-s`, `.card--state-disabled`
- Never hardcode a variant's visual value — every difference between variants must trace to a prop and a modifier class

**Z-index / Layer stacking**
- Figma's layer order (top of layers panel = visually on top) → `z-index` in CSS
- Only assign `z-index` when elements overlap: badges over images, dropdowns, modals, sticky headers, tooltips
- Use incremental values (1, 2, 3) — avoid arbitrary large numbers (100, 9999)
- Parent must be `position: relative` (or any non-static) for child `z-index` to take effect

**Sub-components (INSTANCE nodes)**
- When a child node has type `INSTANCE`, it references an existing Figma component
- Before implementing it inline, check if a matching component already exists in the project:
  ```bash
  ls src/components/
  ```
- If a match exists → import and use it, do not re-implement
- If no match → note it as a dependency; implement the parent with a placeholder, then implement the sub-component in a separate pass
- Never duplicate component logic — one implementation per Figma component

**Opacity**
- Node with `opacity < 1` → CSS `opacity` OR embed into color if it's a background

---

## Step 2 — Fetch images from Figma

For **every** `imageRef` found in the tree (backgrounds, product photos, raster icons):

### 2a. Check what already exists in the project

Before downloading, check the contents of `src/assets/<component-name>/`:

```bash
ls src/assets/<component-name>/
```

- If a file with that name already exists → use it, **do not re-download**
- If the directory is missing or the file is absent → download only what's missing

List the audit result:
```
hero-bg.jpg       ✅ already exists → skip
product-1.jpg     ❌ missing → download
product-2.jpg     ✅ already exists → skip
logo.svg          ❌ missing → download
```

### 2b. Download missing images

Image fill URLs are embedded in the `get_design_context` response (inside fill objects for nodes with `IMAGE` fills). For each missing file, download via curl:

```bash
curl -L -o "src/assets/<component-name>/<descriptive-name>.jpg" "<url-from-figma-response>"
```

- Use descriptive file names (`hero-bg.jpg`, `product-1.jpg`)
- SVG icons: save as `.svg` and use inline or as ReactComponent
- Never use external placeholder services

---

## Step 3 — Read functional spec from Confluence

If a Confluence URL is provided, extract the page ID from the URL (numeric segment) and fetch:

```
mcp__atlassian__getConfluencePage(cloudId: "claude-mcp-demo.atlassian.net", pageId: "<id>", contentFormat: "markdown")
```

If no URL but a topic is known, search first:
```
mcp__atlassian__searchConfluenceUsingCql(cloudId: "claude-mcp-demo.atlassian.net", cql: "title = \"<title>\" AND space = \"<spaceKey>\"")
```

From the page content take ONLY:
- Props interface (names, types, required/optional)
- `data-testid` attributes
- Behavior descriptions: what happens on click, validations, animations
- Component states: hover, active, disabled, loading, error, success
- Text content (headings, labels, placeholders) — only if not directly visible in Figma

**Never from Confluence:**
- Colors, font sizes, spacing, border-radius, shadows
- Layout (grid, flex, positions)
- CSS animations

---

## Step 4 — Build the design token map

Before writing ANY code, list all tokens as a dictionary:

```
COLORS:
  bg-primary: #ffffff
  text-primary: #000000
  border: #e0e0e0
  badge-sale: #c0392b
  ...

TYPOGRAPHY:
  heading-hero: Noto Sans 400 50px / 61px
  heading-section: Noto Sans 400 35px / 42px
  nav-link: Noto Sans 600 11px / 16px, LS=0.1em, UPPER
  body: Nunito Sans 400 18px / 22px
  ...

SPACING:
  container-max: 1640px
  container-px: 140px
  nav-height: 90px
  section-py: 80px
  ...

DIMENSIONS:
  product-card: 408.75 × 622.3px
  hero: 1920 × 1080px
  ...
```

Define these tokens as CSS custom properties in `index.css`. This is the foundation.

---

## Step 4b — Token pre-validation

Before writing any component code, verify each extracted token against the Figma tree values. Present a validation table:

| Token | Figma value | Your token | Match? |
|---|---|---|---|
| bg-primary | #ffffff | #ffffff | ✅ |
| card-width | 408px | 408px | ✅ |
| heading-size | 24px | 22px | ❌ → fix |

Rules:
- Fix every ❌ before continuing — token errors propagate to every CSS property
- Every row must be ✅ before proceeding to Step 5
- At this point also call `mcp__figma__get_screenshot(fileKey, nodeId)` and save the image — it is your pixel-perfect reference for Step 6

---

## Step 5 — Implement the component layer by layer

Implement from outside to inside, layer by layer:

### 5a. HTML structure (semantic)
- Use semantic tags: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`
- Preserve hierarchy from Figma (parent → child)
- Add all `data-testid` from Confluence
- Add `aria-label` for interactive elements without visible text

### 5b. CSS module (`.module.css`) — responsive from line one

Before writing any CSS, check whether Figma has separate frames for mobile/tablet. This determines the strategy:

| Situation | Strategy |
|---|---|
| Figma has desktop + mobile frame | Implement desktop as base, mobile in `@media (max-width: 768px)` |
| Figma has desktop only | Implement desktop as base, add sensible breakpoints preserving proportions |
| Figma has mobile only | Mobile as base, desktop in `@media (min-width: 768px)` |

**CSS writing rules — responsive built in from the start:**

```css
.card {
  /* DESKTOP (base) — values from Figma */
  width: 408px;
  padding: 24px;
  gap: 16px;

  /* TABLET — immediately under each class */
  @media (max-width: 1024px) {
    width: 100%;
    padding: 16px;
  }

  /* MOBILE */
  @media (max-width: 768px) {
    padding: 12px;
    gap: 12px;
  }
}
```

Never write all desktop classes first and then all media queries at the end of the file — this leads to omissions. The media query for a given class goes **directly beneath that class**.

**What scales, what is fixed:**
- `sizing.horizontal: fill` in Figma → `width: 100%` or `flex: 1` — not `px`
- `sizing.horizontal: hug` → `width: fit-content`
- `sizing.horizontal: fixed` → `width: Xpx` on desktop, check if it should be `100%` on mobile
- Section containers → `max-width: var(--container-max); width: 100%` — never `width: 1640px`
- `position: absolute` elements → on mobile often become `position: static` in flex column

**Project breakpoints:**
```css
/* Tablet */  @media (max-width: 1024px) { ... }
/* Mobile */  @media (max-width: 768px)  { ... }
/* Small */   @media (max-width: 480px)  { ... }
```

- One CSS file per component
- Classes correspond to Figma nodes (e.g. `.card`, `.imageWrapper`, `.content`)
- Use `position: absolute` for elements with `locationRelativeToParent` in Figma
- Use `position: relative` on their parents

### 5c. Interactive states
- Figma often has separate frames for states (hover, active, focus)
- If visible in the tree — implement as CSS `:hover`, `:focus`, `:active`
- Transition: `0.2s ease` for colors and opacity, `0.4s ease` for transform

### 5d. Icons and SVG

For each vector icon node in the Figma tree, use one of two methods:

**Option A — Screenshot per icon node (fastest):**
```
mcp__figma__get_screenshot(fileKey, iconNodeId)
```
Use the PNG as a visual reference to manually reconstruct the SVG, or use as `<img>` if pixel resolution is acceptable.

**Option B — Vector paths from the tree (pixel-perfect):**
- Read `vectorPaths` or `fillGeometry` on the node — each entry has a `path` (SVG `d` attribute) and `windingRule`
- Reconstruct as inline SVG:
```svg
<svg width="X" height="X" viewBox="0 0 X X" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="<path-from-figma>" fill="#color" stroke="#color" stroke-width="X"/>
</svg>
```
- `width`/`height`/`viewBox` from `dimensions.width` and `dimensions.height` on the icon node
- `stroke`, `fill`, `stroke-width` from the node's `strokes` and `fills`

Rules:
- Do not use icon libraries if the icon exists in Figma
- For complex multi-path icons where reconstruction is not feasible → use `get_screenshot` + `<img>`

### 5e. Google Fonts loading

For every `fontFamily` from Figma that is not a system font, add to `index.html` inside `<head>`.

**Single family:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">
```

**Multiple families — combine in one `<link>` with `&family=` (single HTTP request):**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,400;0,600;0,700;1,400&family=Nunito+Sans:wght@400;600;700&display=swap" rel="stylesheet">
```

Rules:
- Scan all text nodes in the tree — collect every unique `fontFamily` + `fontWeight` + italic combination
- Combine all families in one URL — never multiple `<link>` tags for Google Fonts
- Always add `display=swap`
- After `npm run dev`, open DevTools → Network → filter "font" — every file must return status 200
- If a font is not on Google Fonts → check if it is a system font or add as a local file in `src/assets/fonts/`
- Never assume a font is loading — always verify in DevTools

---

## Step 6 — Visual verification

### 6a — Get reference screenshot

If not already done in Step 4b, capture the Figma node now:

```
mcp__figma__get_screenshot(fileKey, nodeId)
```

This returns the exact PNG Figma renders. Save it — it is your ground truth. Open `http://localhost:5173` alongside it.

```bash
npm run dev
```

### 6b — Element-by-element comparison

With the screenshot and browser side by side, check every element:

| Element | What to check |
|---|---|
| Fonts | Family, weight, size, line-height, letter-spacing |
| Colors | Background, text, border, icons — hex by hex |
| Spacing | Padding, margin, gap — pixel by pixel |
| Dimensions | Width, height of elements |
| Images | Real assets from Figma (no placeholders) |
| Icons | Shape, size, stroke/fill color |
| States | Hover, focus, active look like Figma |
| Responsive | Layout does not break at 768px and 480px |

For every discrepancy: go back to Step 2/3 and fix the CSS. **Do not commit until you reach acceptable fidelity.**

---

## Step 6b — Storybook story

After visual verification, create a co-located story file:

```
src/components/<ComponentName>/<ComponentName>.stories.tsx
```

Format — CSF3 with autodocs:

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { ComponentName } from './ComponentName'

const meta: Meta<typeof ComponentName> = {
  title: 'Components/ComponentName',
  component: ComponentName,
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof ComponentName>

export const Default: Story = {
  args: {
    // required props with realistic values
  },
}

// Add one story per meaningful visual state from Figma / Confluence:
// e.g. WithBadge, SoldOut, Error, Loading, Active
export const WithBadge: Story = {
  args: { ...Default.args, badge: 'New' },
}
```

Rules:
- If the component is a COMPONENT_SET → one story per variant value, named after the variant:
  - `State=Default` → `export const Default`
  - `State=Hover` → `export const Hover: Story = { args: { ...Default.args, state: 'hover' } }`
  - `State=Disabled` → `export const Disabled`
  - `Size=S` → `export const Small`
  Each variant story must prove the modifier class renders a visually distinct state.
- One additional story per meaningful state from Confluence (e.g. `WithBadge`, `SoldOut`, `Loading`)
- Use realistic prop values (not "foo", "test", 0)
- `Default` story must have all required props
- Spread `Default.args` in variant stories — never duplicate

After writing the story file, verify it renders:

```bash
npm run storybook
```

Check: `Default` story loads without errors, all variant stories show distinct visual states, no "Missing required prop" warnings in the canvas. Fix any issue before proceeding.

---

## Step 7 — Tests

Tests verify BEHAVIOR, not appearance:

```tsx
// Good test
it('calls onAddToCart when button clicked')
it('shows "Added" text for 2s after click')
it('filters products by category')

// Bad test (do not test CSS)
it('has black background') // ← NO
it('font-size is 18px')    // ← NO
```

Source for tests: **Confluence** (behaviors, states, validations).
Source for selectors: `data-testid` from Confluence.

---

## Step 7b — Write Figma annotation

After writing the component `.tsx` file, add the Figma annotation as the **first line** of the file:

```tsx
// figma: https://www.figma.com/design/<fileKey>?node-id=<nodeId>
import ...
```

This allows any skill to detect that this Figma node is already implemented via a simple `grep`.

---

## Step 8 — Pre-commit checklist

- [ ] All images downloaded from Figma (no external URLs)
- [ ] Fonts loaded (Google Fonts or local)
- [ ] Colors match Figma (visually)
- [ ] Spacing/padding matches Figma
- [ ] No hardcoded values without a basis in Figma
- [ ] `data-testid` on all elements from Confluence
- [ ] Storybook story co-located (`<ComponentName>.stories.tsx`), one story per Figma state
- [ ] Tests pass: `npm test`
- [ ] Build passes: `npm run build`
- [ ] Dev server looks like Figma

---

## Common mistakes and how to avoid them

| Mistake | Correct approach |
|---|---|
| Using placeholder images | Get image URL from `get_design_context` response, download via `curl` |
| Re-downloading images already in the project | Check `src/assets/` before every download (Step 2a) |
| Writing desktop-only CSS, responsive added at the end | Media query for each class directly beneath that class (Step 5b) |
| Hardcoding `width: 1640px` for containers | `max-width: 1640px; width: 100%` — always |
| Guessing spacing | Read `padding`/`gap` from `layout_*` in Figma |
| Changing fonts because they "look nicer" | Use exactly the fontFamily from Figma |
| Adding custom animations | Only what is visible in Figma (separate state frames) |
| Interpreting layout from memory | Read `mode`, `locationRelativeToParent`, `dimensions` |
| Using rem/em instead of px | Use px for Figma values, rem only for fluid typography |
| Missing effects | `DROP_SHADOW`, `BLUR` from Figma → CSS `box-shadow`, `filter` |
| Scroll not working / container too small | Read `overflowDirection` and `clipsContent`; set explicit `height`/`max-height` on scroll container |
| Guessing table column widths | Read `dimensions.width` from each cell node in Figma; use `table-layout: fixed` |
| Table appears too narrow | Add `min-width` on `<td>`/`<th>` and `overflow-x: auto` on the wrapper |

---

## Usage

```
/figma-to-code
Figma: https://www.figma.com/design/<fileKey>?node-id=<nodeId>
Confluence: https://<site>.atlassian.net/wiki/spaces/<space>/pages/<pageId>
Component: ProductCard
```
