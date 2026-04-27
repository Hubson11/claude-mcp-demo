# /confluence

Read from or write to Confluence. Two modes: **read** (extract functional spec for use in other skills) and **write** (create or update a page with new content).

MCP server: `atlassian` (Atlassian Rovo MCP — `https://mcp.atlassian.com/v1/mcp`)
Site: `claude-mcp-demo.atlassian.net`

---

## Mode A — READ

Use this when another skill needs the functional specification for a page or component.

### When to use READ
- Before `/figma-to-code` — extract props, behaviors, data-testid, API calls
- Before `/component` — get the full behavioral contract
- Before `/e2e` — get the user flows and validation rules
- When asked "what should X do?" — look it up before guessing

### Step A1 — Fetch the page

If given a full URL, extract `pageId` from the URL — it is the numeric segment, e.g.:
`https://claude-mcp-demo.atlassian.net/wiki/spaces/NEXUS/pages/123456` → `pageId = 123456`

Then fetch by ID:
```
mcp__atlassian__getConfluencePage(id: "123456")
```

If no URL is given but a topic is known, search first:
```
mcp__atlassian__searchConfluenceUsingCql(query: "title = \"Home Page Functional Specification\" AND space = \"NEXUS\"")
```

To list pages in a space:
```
mcp__atlassian__getPagesInConfluenceSpace(spaceKey: "NEXUS")
```

### Step A2 — Extract the spec

From the page content, extract ONLY:

| Extract | Example |
|---|---|
| Props interface | `name: string`, `price: number`, `badge?: 'Sale' \| 'New'` |
| Component states | `idle`, `added`, `soldOut` — with trigger conditions |
| Behaviors | "click Add to Cart → call onAddToCart → show Added for 2s" |
| Validations | "invalid email format → show error message" |
| `data-testid` attributes | `add-to-cart-btn`, `newsletter-input` |
| API calls | endpoint, method, request/response shape |
| Navigation / redirects | which button goes where |

**Never extract from Confluence:**
- Colors, fonts, spacing, border-radius, shadows → that is Figma's job
- Layout or visual structure → Figma only

### Step A3 — Return structured output

Present the extracted spec in this format so the calling skill can use it directly:

```
SPEC: [ComponentName / PageName]
Source: [Confluence URL]

PROPS:
  name: string — required
  price: number — required
  badge?: 'Sale' | 'New' — optional
  onAddToCart: (id: string) => void — required
  soldOut?: boolean — optional, default false

STATES:
  idle      — default
  added     — after clicking Add to Cart, lasts 2000ms then returns to idle
  soldOut   — soldOut=true, button disabled

BEHAVIORS:
  - click "Add to Cart" (not soldOut) → onAddToCart(id) called → state = added → after 2000ms → idle
  - click when soldOut=true → nothing happens, onAddToCart not called

VALIDATIONS:
  - empty or invalid email → show error "Please enter a valid email address"
  - valid email → show success, clear input

DATA-TESTID:
  product-card, product-card-name, product-card-price, product-card-badge, add-to-cart-btn

API CALLS:
  [none — mock data only]

NAVIGATION:
  - "Shop Now" CTA → /shop
  - "Read More" (blog card) → /blog/:slug
```

---

## Mode B — WRITE

Use this to create or update a functional spec page in Confluence.

### Step B1 — Check if page already exists

Search before creating:
```
mcp__atlassian__searchConfluenceUsingCql(query: "title = \"[page title]\" AND space = \"NEXUS\"")
```

- If found → go to Step B3 (update)
- If not found → go to Step B2 (create)

### Step B2 — Create a new page

```
mcp__atlassian__createConfluencePage(
  spaceId: "[space ID for NEXUS]",
  title: "[Page Title]",
  body: "[content in storage format or wiki markup]",
  parentId: "[parent page id if applicable]"
)
```

Standard space for this project: `NEXUS`
Parent page for component specs: "Home Page — Functional Specification"

To get the space ID first:
```
mcp__atlassian__getConfluenceSpaces()
```

### Step B3 — Update an existing page

First fetch current version:
```
mcp__atlassian__getConfluencePage(id: "[pageId]")
```

Then update:
```
mcp__atlassian__updateConfluencePage(
  id: "[pageId]",
  title: "[same or updated title]",
  body: "[new content]",
  version: [current version + 1]
)
```

Always fetch the current version before updating — the version number is required.

### Step B4 — Confirm

After create/update, return:
- The page URL
- Title
- Whether it was created or updated

---

## What belongs in Confluence (and what does not)

### Write this in Confluence ✅
- Props interface with types (required/optional, defaults)
- Component states and what triggers them
- User interaction flows: "user clicks X → Y happens → after Zms → W"
- Form validation rules
- `data-testid` attribute names for all interactive elements
- API endpoint definitions: method, path, request body, response shape
- Navigation map: which element links/redirects where
- Business rules: "sold out products cannot be added to cart"
- Error and success messages (exact copy)

### Never write this in Confluence ❌
- Colors, fonts, font sizes, font weights
- Padding, margin, gap, spacing values
- Border radius, box shadows, opacity
- Layout direction (row/column), alignment, grid columns
- Animations and transitions
- Component file structure or code organization
- Anything that can be read from Figma

---

## Usage

**Read:**
```
/confluence
Action: read
URL: https://claude-mcp-demo.atlassian.net/wiki/spaces/NEXUS/pages/123456
```

**Read by topic:**
```
/confluence
Action: read
Topic: ProductCard functional spec
```

**Write:**
```
/confluence
Action: write
Space: NEXUS
Title: Home Page — Functional Specification
Content: [spec content]
```
